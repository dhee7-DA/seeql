// Best Buy — Wave-11 (Task 102), ecom domain. Pool provenance: company-pools.md carries
// NO Best Buy section (0 tagged rows) — all 10 topic slug sets and all 16 problems are
// theme-curated from the theme menu's sql rows (no w*/d*/f* rows); the single Best
// Buy-tagged row in the menu (weeks-of-supply) rides as a problem and is called out in
// the header of its entry. Facts from scripts/company-facts.md (incl. the wave-8+9
// canonicalized probe cells) plus live readonly probes by this agent against
// db/custom.db (55-bar attach fold: attach 133 lines / 268 units @ 31.01 / 8,227.77 vs
// core 118 lines / 230 units @ 115.85 / 26,605.51; 88 of 103 tickets ride an add-on,
// 67 touch both bands; 50-bar re-band 263 @ 30.71 vs 235 @ 114.76; line-average price
// 70.89 with 97 lines above it; verdict sweep cells phantom 1 / 1,756.00, unfunded 5 /
// 13,461.00, reversed 1 / 925.00, carrying 21 / 70,835.00 / 68,687.00). Every case slot
// is mechanically verified against db/custom.db by scripts/case-audit.ts.
//
// db mapping (distinct from the other ecom kits — attach economics + price-match, not
// marketplace/D2C/grocery/club/auction/home): customers = My Best Buy member accounts
// (region = market footprint), orders = register transactions (delivered = completed and
// kept 52, shipped = fulfilled in flight with shipped_at as the leave-dock stamp 30,
// pending = carts awaiting payment capture 14, cancelled = voided at the register 7),
// order_items = scanned line SKUs (quantity = units on the line, unit_price = shelf
// price; the 55-dollar attach bar splits counter add-ons from big-ticket cores),
// products = shelf SKUs (price ladder tops out at 199.99 — the premium 200+ band is
// honestly empty), suppliers = brand/vendor partners (Nordic 4.6 / Alpine 4.8
// scorecards), invoices = financing statements (My Best Buy financing; INTEGER cents),
// payments = tender legs (card = store-card legs 16 / 37,364.00, wire = financing legs
// 11 / 32,248.00; 5 baskets settle on both rails), expenses = platform opex (Rent
// 14 / 16,800.00 leases, Ads 14 / 4,570.00 circulars), ledger_entries = GL.
// NOTE for the wave-11 registry wiring agent: bestbuy is NOT yet in registry
// COMPANY_META — wire id "bestbuy", domainId "ecom", name "Best Buy", tagline
// "Big-ticket electronics retail: attach economics, price-match windows, member tiers",
// accent "text-lime-300" to match this header exactly.
//
// wave-3x expansion (Task 103) — APPEND-ONLY per scripts/kit-authoring-spec.md EXPANSION:
// brief 4→6, dayInLife 3→4, metrics 8→12, topics 10→15, theory 8→24 (t9..t24),
// mcqs 10→30 (mcq-11..30), cases 2→6 (cs-bestbuy-3..6 — x2 / j7 / t7 / t5, topic
// families disjoint from the l8 + q5 originals and from each other), problems
// 16→32. Every pre-existing entry is byte-identical; the expansion's new figures
// were probed live readonly against db/custom.db by the expansion agent:
// per-supplier units Nordic 82 / Midwest 109 / Alpine 77 / Andes 51 / Shenzhen 99 /
// Pacific 80 (= the canonical 498), shelf folds 2,845 shelf units = 750 mid-band
// + 2,095 budget-band (budget avg 32.06 canonical), promo-spine deltas Aug
// +1,158.21 best / Nov -1,326.87 worst, member ladder 24/17/14/13/5 with a
// FOUR-way tie at 4 (Pedro/Keiko/Isabella/Noah — the facts file's "three-way"
// note is stale), NTILE(4) tiles the 16 members 4×4, trailing-3 spine read
// 2024-03 = 3,319.56, ledger fold 181,080 / 181,080 confirmed.

import type { CompanyKit } from "../types";

export const bestbuyKit: CompanyKit = {
  id: "bestbuy",
  domainId: "ecom",
  name: "Best Buy",
  tagline: "Big-ticket electronics retail: attach economics, price-match windows, member tiers",
  accent: "text-lime-300",

  brief: [
    "**Best Buy** is North America's big-ticket electronics retailer — the blue-box floor where laptops, TVs, audio and wearables sell beside a counter of cables, cases and protection plans that can out-earn the box they ride in on. The economics are attach economics: the margin lives less in the headline SKU and more in what lands beside it — the HDMI cable with the TV, the mouse with the laptop, the two-year plan with everything. This kit maps the storefront db onto that floor: the 16 customers rows are {sky:My Best Buy member accounts}, the 103 orders are **register transactions worth 34,833.28**, and the 251 order_items rows are scanned line SKUs — quantity = units on the line, unit_price = shelf price. The status map is fixed: delivered = {emerald:completed and kept} (52, 50.5%), shipped = fulfilled in flight (30, 29.1%), pending = awaiting payment capture (14, 13.6%), cancelled = {rose:voided at the register} (7, 6.8%).",
    "The merchandising org runs on two folds. The attach fold is first: every scanned line splits at the **55-dollar attach bar** — sub-55 counter add-ons move **268 units at a 31.01 average** line price against 230 big-ticket units at 115.85, and while 88 of 103 transactions ride at least one add-on, 67 touch both bands (bands are line-grain, and a basket can ride both). The shelf ladder is second: 8 SKUs average 111.50 in the mid band (50 to 200) and 8 average 32.06 under 50 — the premium arm above 200 is honestly empty, the ladder tops out at 199.99, and price-match reads live inside those edges. Money sits one layer down: financing statements and tender legs store INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are attach-then-price-match with a policy accent. A typical loop opens with a two-grain census — the {amber:Audio crown} moves 97 units for 11,744.01 across 46 transactions while Accessories touches 54 of the 103 tickets — then escalates into a price-match read: which SKUs sit inside the match window, which lines transacted above or below the 70.89 line-average, and *'what does the match do to the margin?'* is asked out loud before you write SQL. Late rounds walk the {violet:14-month promo spine} (2024-01 to 2025-02) with LAG deltas around the July trough (1,193.86) and the November promo bump, or audit the financing book — 28 statements against 27 tender legs, where paid-status #28 (1,756.00) carries zero legs: the phantom adjustment every refund sweep hunts.",
    "Preparation strategy: the pools file carries no Best Buy section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: attach folds, price-band CASE work, member RFM tiers, as-of price-match reads, promo-calendar walks and the cents-safe statement spine. Do the topics in order, then run all six case studies on the live storefront db: one rebuilds the {emerald:attach-bar census} merchandising opens every Monday with, the other rebuilds the {rose:phantom-adjustment sweep} the refund desk runs before statements close, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: *state the bar and the denominator before you compute anything* — then make every fold reconcile to 34,833.28 by construction.",
    "The data org mirrors the floor plan. Merchandising analytics owns the {amber:attach fold} and the shelf ladder — a Monday-census culture where every band, bar and denominator is quoted before it is computed. Finance ops owns the statement spine: `amount_cents / 100.0` is the house dollar read, and the ledger must land at **181,080 against 181,080** before the close ships. The fulfillment pod owns the ship clock — *2.98 days open-to-dock over the 82 stamped tickets* — and marketing owns the promo calendar, where LAG deltas around the July trough defend every circular dollar. Analysts sit close to the stakeholders who argue with the numbers, which is why the screens grade definitions as hard as syntax.",
    "Senior rounds add depth, not novelty: window frames on the promo spine (why *the default frame is not your trailing average*), set-op audits that must foot to 28 statements, self-joins that canonicalize pairs before they count, and a CTE-staged reconciliation the panel reads like prose. The prep bar for this kit's second half: run every new case on the live db, then answer the theory bank out loud — if you can defend the {emerald:55-dollar bar}, the {violet:14-month spine} and the phantom #28 in one breath each, the loop is yours.",
  ],

  dayInLife: [
    "**07:45 —** Doors open in an hour and the attach dashboard refreshes first: did overnight tickets land, does the fate census reconcile — 52 completed + 30 in flight + 14 awaiting capture + 7 voided = **103 by construction** — and is the attach rate holding at **88 of 103 tickets**? A basket that fails that identity is *the day's first incident*, not a rounding note. Then the stock countdowns: **Smart Watch S shows 17 remaining** (40 in stock against 23 sold) while HDMI cable sits at 462 of 500 — the endcap decision writes itself, and the 2.98-day ship clock gets a glance before the morning huddle.",
    "**11:30 —** Midday is the price-match queue and the vendor line review. Each match request is an as-of read: the shelf price on the member's purchase day versus the competitor's print today — *the window is anchored at the purchase date, never at 'now'* — and the fold that answers it is exactly the latest-row-before-date shape. The vendor scorecards sit beside it: **Nordic Gadgets 4.6, Alpine Audio 4.8** against Pacific Textiles' 3.9 floor. A regional ship drift pings mid-review — US averages **3.07 days** against APAC's 2.93 — and the fulfillment pod gets the query with the stamp filter spelled out before the number ships anywhere.",
    "**15:30 —** The afternoon tilts to money. The statement run opens with the AR anti-join — **6 never-collected statements worth 15,217.00** (873.00, 1,295.00, 4,937.00, 3,562.00, 2,794.00 among them) — before a single dunning letter leaves. Then the phantom sweep: paid-status #28 at **1,756.00 with zero tender legs** — a status that lies — mirrored by void-but-debited #11 at 925.00, with the open partial (#25: 4,000.00 of 6,148.00) reconciling the carrying bucket's 2,148.00 gap. The rails split card legs (16 / 37,364.00) against financing legs (11 / 32,248.00), and the day ends the way every close does: the ledger must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
    "**17:45 —** EOD writeup. The day closes the way it opened: reconciliations. The fate census re-foots — 52 + 30 + 14 + 7 = **103 by construction** — the attach read re-foots to 34,833.28, and the ledger's **181,080 against 181,080** tie-out gets a screenshot in the close channel before anyone leaves. Then the writeup itself: what the vendor scorecards moved (Nordic 4.6 and Alpine 4.8 against Pacific's 3.9 floor), which match requests ruled inside the window, and the one open question for tomorrow — *usually a denominator somebody challenged* — written down while the numbers are still warm. {emerald:The close ships}; the pod goes home.",
  ],

  metrics: [
    { name: "Attach rate", what: "Share of register transactions carrying at least one sub-55 add-on line: 88 of 103 (85.4%), with 67 tickets touching both bands — bands are line-grain and a basket can ride both. The fold merchandising opens every Monday with, and the denominator argument happens before the query runs." },
    { name: "Attach-bar mix", what: "268 units at a 31.01 average line price below the 55 bar against 230 big-ticket units at 115.85 — line value 8,227.77 versus 26,605.51. The counter moves units; the shelf moves dollars; both folds reconcile to the 34,833.28 book." },
    { name: "Average ticket", what: "338.19 across 103 register transactions against a 25.47 to 1,088.44 spread, and 63.5% of revenue rides members whose lifetime spend crosses 3,000 (71.2% above 2,000). Big-ticket concentration is the membership pitch in one number." },
    { name: "Category crowns", what: "Audio moves 97 units for 11,744.01 on 3 SKUs; Accessories moves 121 units for 3,294.29 and touches 54 of the 103 tickets; Wearables adds 53 units / 6,929.12. The shelf-mix read the vendor line reviews argue over." },
    { name: "Ship-from-store clock", what: "created_at to shipped_at over the 82 stamped transactions: 2.98-day average, 2–4 spread; US runs 3.07 against APAC's 2.93 and LATAM's 3.5. The omnichannel promise lives here — the 14 pending carts have no stamp yet, a population definition rather than a cleanup job." },
    { name: "Promo calendar", what: "The 14-month ticket spine from 2024-01 (3,731.97) to 2025-02 (2,390.53): July troughs at 1,193.86 with 2 voids, November's 1,648.80 carries the other 2, and the circular bill (Ads) runs 4,570.00 across 14 entries. LAG deltas are how promo lift gets defended." },
    { name: "Tender rails", what: "Card legs (16 for 37,364.00) versus financing legs (11 for 32,248.00), with 5 baskets settling on both rails. The store-card versus third-party-financing split finance watches weekly, at INTEGER cents with the /100.0 dollar read." },
    { name: "Statement book", what: "28 financing statements — 21 paid (66,443.00), 6 open (19,609.00), 1 void (925.00) — against 27 legs totaling 69,612.00: 6 never-collected worth 15,217.00, 1 partial (4,000.00 of 6,148.00), settlement averaging 28.4 days (13 fastest, 84 slowest). The AR line the close refuses to ship without." },
    { name: "Supplier mix", what: "Nordic Gadgets moves 82 units into 11,130.25 — a 32% share of the book — while Midwest Hardware moves MORE units (109) for 9,294.93 (26.7%); the top two partners carry 58.7% of scanned revenue. The trusted bench (rating 4.5-plus) is Nordic 4.6 and Alpine 4.8 against Pacific Textiles' 3.9 floor, and the line review re-litigates it quarterly." },
    { name: "Cancellation & void watch", what: "7 of 103 register transactions voided (6.8%): APAC runs the worst share at 8.1% against US 5.3%, EU 6.7% and LATAM's clean 0.0 — and July and November carry two voids each, the promo-traffic fingerprints. The read is denominator-first: APAC's 37-ticket base makes its 3 voids a sharper alarm than US's 1 in 19." },
    { name: "Settlement clock", what: "The 20 leg-settled paid statements average 28.4 days — 13 fastest, 84 slowest — against financing terms flat at 30, so the book ages right up to the due line. The clock throttles the dunning queue: anything past 30 is a call, and the 6 never-collected statements (15,217.00) are already past it." },
    { name: "Shelf coverage", what: "2,845 units sit on the shelf across 16 SKUs — 750 in the mid band, 2,095 in the budget band (the premium arm is empty at the 199.99 ceiling). The countdowns that steer endcaps: Smart Watch S has 17 remaining (40 in stock against 23 sold) while HDMI cable sits at 462 of 500." },
  ],

  topics: [
    {
      name: "Attach-basket folds",
      why: "Every Best Buy margin story is an attach story: the box earns the traffic, the cable earns the quarter. At line grain the sub-55 fold puts 268 units at 31.01 against 230 big-ticket units at 115.85, and at ticket grain 88 of 103 carry an add-on while 67 touch both bands. Conditional counts with stated denominators are the exact skill being graded.",
      slugs: ["basket-depth-aov", "transactions-per-visit-histogram", "customers-who-bought-a-and-b-not-c", "find-product-recommendation-pairs"],
    },
    {
      name: "Price-band CASE shelves",
      why: "The shelf is a CASE fold: budget under 50 (8 SKUs at 32.06), mid 50-to-200 (8 at 111.50), premium above 200 honestly empty at the 199.99 ceiling. Merchandising re-bands the shelf every promo cycle — drop the attach bar from 55 to 50 and 5 units migrate bands (263/235) before anyone touches the shelf. Exhaustive, ordered arms are the habit being drilled.",
      slugs: ["weather-type-in-each-country", "count-salary-categories", "calculate-orders-within-each-interval", "most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "average-selling-price"],
    },
    {
      name: "Price-match windows",
      why: "Best Buy matches competitor prices, and the analytics under it is as-of pricing: what did the shelf read on the member's purchase day, and what does it read now. The latest-row-before-date shape answers the first; the best-rule discount fold answers the match itself — shelf, match, floor, take the lowest legal price. The premium band's absence is the ceiling check every match audit runs first.",
      slugs: ["product-price-at-a-given-date", "calculate-product-final-price", "find-expensive-cities", "ratings-histogram", "vintage-default-curves"],
    },
    {
      name: "Member tiers & RFM",
      why: "My Best Buy is free at sign-up and paid above it, and every growth deck cuts the 16 member accounts into tiers by recency, frequency and money. On this db the tiers are band folds over lifetime spend — 63.5% of revenue rides members past 3,000 — and RFM tiles are the segmentation drill behind the email calendar. Tier drift is where expansion targeting starts.",
      slugs: ["rfm-segmentation", "customer-purchasing-behavior-analysis", "usage-tier-percentiles", "customer-order-frequency"],
    },
    {
      name: "Big-ticket leaderboards",
      why: "The member ladder runs 24, 17, 14, 13, 5 transactions with a four-way tie at 4 below — Alice Chen's 24 tickets for 7,262.35 is the crown, and the ladder's shape decides who gets the white-glove treatment. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer members, not syntax. Leaderboards publish a tie rule or they publish arguments.",
      slugs: ["customer-placing-the-largest-number-of-orders", "top-earners", "number-of-rich-customers", "product-sales-analysis-ii", "second-highest-salary", "rank-scores"],
    },
    {
      name: "Promo-calendar walks",
      why: "The 14-month spine (2024-01 to 2025-02) is the promo calendar's home turf: the book opens at 3,731.97, troughs at 1,193.86 in July, and November's 1,648.80 carries two of the seven voids — Black-Friday traffic that did not convert. LAG drives the walk; the first row is NULL by definition, the baseline, never a zero. Day-of-week folds are the Friday-circular read that decides where the ad money lands.",
      slugs: ["sales-by-day-of-the-week", "year-on-year-growth-rate", "seasonal-sales-analysis", "weeks-of-supply", "combine-two-tables", "employees-with-missing-information", "null-blank-audit"],
    },
    {
      name: "Ship-from-store clocks",
      why: "Store fulfillment is the omnichannel promise: created_at opens the ticket, shipped_at stamps the leave-dock moment, and the clock averages 2.98 days over the 82 stamped tickets with a 2–4 spread. The 14 pending carts have no stamp — a population definition, not a cleanup job. Regional drift (US 3.07 against APAC 2.93) is the alert the fulfillment pod actually keys off.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "same-day-sale"],
    },
    {
      name: "Returns & exchange desks",
      why: "The service desk is margin's back door: returns-rate-by-category is the exact read — which families come back and at what share — and showrooming is the visited-but-never-transacted anti-join. On-time-promise shares map onto the pickup window the same way the delivery fold does. Every desk metric is a rate with a denominator somebody on the panel will challenge.",
      slugs: ["returns-rate-by-category", "customer-who-visited-but-did-not-transact", "immediate-food-delivery-ii", "confirmation-rate", "customers-who-never-order", "suspicious-bank-account-transactions"],
    },
    {
      name: "Financing statements & tender rails",
      why: "Big tickets ride financing, and the finance tables are where tickets meet money: 28 statements, 27 tender legs, INTEGER cents with the /100.0 dollar read. The rails split card legs (16 / 37,364.00) from financing legs (11 / 32,248.00), and 5 baskets settle on both — the split-tender read is a COUNT DISTINCT away. Delinquency buckets and duplicate-charge guards are the desk's weekly hygiene.",
      slugs: ["bank-account-summary-ii", "delinquency-buckets", "duplicate-charge-pairs", "find-the-team-size", "ar-aging-schedule", "settlement-fails-aging", "unique-orders-and-customers-per-month"],
    },
    {
      name: "One-pass shelf censuses",
      why: "The Monday board wants completed, in-flight, awaiting-capture and voided in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity — branches sum to COUNT(*) — is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "snaps-analysis", "create-a-session-bar-chart", "queries-quality-and-percentage", "recyclable-and-low-fat-products", "not-boring-movies"],
    },
    {
      name: "Vendor scorecards & supplier mix",
      why: "Six brand partners carry the shelf and the fold is unforgiving: Nordic Gadgets moves 82 units into 11,130.25 (32% of the book) while Midwest Hardware moves MORE units — 109 — for 9,294.93, and the trusted bench (rating 4.5-plus) is just Nordic 4.6 and Alpine 4.8 against Pacific's 3.9 floor. Supplier revenue share, listings counts and per-partner line grain are the exact folds the quarterly line review argues over, and the HAVING floor (past the 3,000-dollar line) is how the deck decides who presents.",
      slugs: ["find-stores-with-inventory-imbalance", "percentage-of-users-attended-a-contest", "warehouse-manager", "classes-more-than-5-students"],
    },
    {
      name: "Set-op audits & mirror sweeps",
      why: "The refund desk's best audits are directional: paid-status EXCEPT has-a-leg surfaces the phantom #28 at 1,756.00, the swapped arms return the 2 claims whose legs exist without a paid status, and INTERSECT finds the 5 split-rail cycles that settled on both card and wire. UNION ALL stacks are the tender report's backbone — 16 card legs / 37,364.00 against 11 financing legs / 32,248.00 — where a bare UNION's silent dedupe stops the book footing to 27 legs / 69,612.00.",
      slugs: ["movie-rating", "monthly-transactions-ii", "league-statistics", "keep-latest-dedupe"],
    },
    {
      name: "CTE staging & multi-step reads",
      why: "Real reads here are staged: fold legs per statement, classify verdicts, roll the buckets up — 28 statements footing to the book or the close does not ship. WITH turns each stage into a named, commentable, testable sentence; the promo spine's month-bucket fold and the member-concentration ladder are the same habit at different grains. Multi-step reads are how this team ships queries other people can audit.",
      slugs: ["hopper-company-queries-i", "game-play-analysis-v", "restaurant-growth", "list-the-products-ordered-in-a-period", "product-sales-analysis-iii"],
    },
    {
      name: "Ledger folds & trial balance",
      why: "The GL is 80 entries in INTEGER cents and the close culture is one line: 181,080 debits against 181,080 credits, delta zero, or nothing ships. Conditional SUMs over debit_cents and credit_cents, account-level nets (cash 44,196, receivables 16,440) and the rollforward from period-open are the exact drills the month-end lane runs before the close deck assembles.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward"],
    },
    {
      name: "Catalog hygiene & text folds",
      why: "The shelf joins on names before it joins on ids: TRIM and UPPER discipline keeps the same box from splitting into two SKUs, SUBSTR slices the month buckets the promo spine rides on, and GROUP_CONCAT prints the one-cell SKU list merchandising eyeballs at attach. Text folds are unglamorous and everywhere — this is the warm-up lane for every other topic in the kit.",
      slugs: ["find-cities-in-each-state", "find-all-unique-email-domains", "concatenate-the-name-and-the-profession", "sales-analysis-i", "fix-product-name-format", "product-sales-analysis-i", "group-sold-products-by-the-date"],
    },
  ],

  theory: [
    {
      id: "bestbuy-t1",
      q: "The shelf report joins member accounts to register transactions. When do you INNER and when do you LEFT — and what silently breaks if you filter a transaction column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A shelf report joins transactions to members: a ticket with no member row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A member-whitespace report must be LEFT from members: the members with no tickets ARE the answer, arriving with NULL payload columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the whitespace vanished; the fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-transacted members — all 16 member accounts appear in the ticket table somewhere — and proving that zero is itself the analyst's job, because a confident zero you did not verify is how whitespace reports die in review.",
      tag: "joins",
    },
    {
      id: "bestbuy-t2",
      q: "The member leaderboard runs 24, 17, 14, 13, 5 tickets, then FOUR members tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — the four-way tie consumes ranks 6 through 9 and the next distinct count lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account gets the white-glove queue first. The defensible move is naming the tie-breaker — lifetime spend is the natural one here, and Alice Chen's 7,262.35 against the 34,833.28 book is exactly the kind of column that settles a tie honestly — and writing it in the query comment. The wrong answer is picking a function; the right answer is picking a policy and publishing it where the leaderboard lives.",
      tag: "windows",
    },
    {
      id: "bestbuy-t3",
      q: "The attach read prints 251 lines, 103 tickets, 88 add-on riders and 67 both-band tickets. Why do these four numbers disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. 251 is COUNT(*) over order_items — scanned lines, the shelf's unit motion. 103 is COUNT(DISTINCT order_id) — register tickets, the member-facing count; 2.44 lines per ticket is the basket-depth read. 88 is the tickets carrying at least one sub-55 add-on line, and 82 the tickets carrying a big-ticket core — but because bands are line-grain, one basket can ride both: 88 + 82 = 170 over 103 tickets means 67 touched both bands, and the overlap arithmetic (170 − 103) is the sanity check that proves the bands were never exclusive. The trap is a third grain sneaking in: join products for the family fold and COUNT(*) silently counts against the join fan-out. Saying 'one row per what?' for every COUNT is the habit the panel grades, and it is the same habit the Monday shelf board encodes.",
      tag: "aggregation",
    },
    {
      id: "bestbuy-t4",
      q: "shipped_at is NULL until the box leaves the dock. What is your policy for the ship-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped tickets have a clock, so the report measures open-to-dock for the 82 of 103 transactions that carry the stamp — averaging 2.98 days with a 2–4 spread — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL tickets returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting-capture carts plus 7 voided rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dock exits for carts that have not captured, and it poisons the 2.98 baseline every regional drift alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what a Best Buy reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "bestbuy-t5",
      q: "The growth review wants attach rate per market for markets carrying at least ten tickets. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, awaiting and voided rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-ticket floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor bites: EU (45), APAC (37) and US (19) survive, LATAM's 2 tickets die at the gate. One more placement rule these screens love: the attach rate — 100.0 * COUNT(DISTINCT CASE WHEN unit_price < 55 THEN order_id END) / COUNT(DISTINCT order_id) — puts the 100.0 BEFORE the division, because COUNT over COUNT is integer division and 88/103 truncates to 0; the attach board would print a flat zero everywhere instead of 85.4. The strong answer places every filter by asking: is this a fact about one ticket, or about a market?",
      tag: "pipeline",
    },
    {
      id: "bestbuy-t6",
      q: "Merchandising wants the attach crown per family: rank SKUs by line value inside each category, keeping every row visible. Why a window and not GROUP BY?",
      a: "GROUP BY answers 'which family wins' by collapsing to one row per category and throwing away the bench; the shelf review needs the winner AND the runners-up in context, and that is exactly what a window buys: RANK() OVER (PARTITION BY category ORDER BY SUM(...) or by line value per SKU) keeps every SKU row while stamping its rung inside the family. Audio folds to a 11,744.01 crown on 3 SKUs; Accessories shows the 121-unit volume story without disappearing from its own ranking. Two follow-ups the panel expects unprompted: ties inside a partition need a named policy (RANK shares and gaps, DENSE_RANK shares without gaps, ROW_NUMBER must be given a deterministic tie-breaker), and the window's PARTITION BY category ORDER BY value does no filtering — a top-per-family filter is a second stage over the ranked set, not the window itself. Keeping the bench visible is the whole point; the crown is only defensible next to what it beat.",
      tag: "windows",
    },
    {
      id: "bestbuy-t7",
      q: "Which scanned lines transacted above the platform line-average of 70.89 — and what is the scalar subquery in that query allowed to return, and what happens when the inner fold comes back empty?",
      a: "The shape is WHERE unit_price > (SELECT AVG(unit_price) FROM order_items), and on this db it returns 97 of the 251 lines. The scalar subquery is contractually 0-or-1 rows, 1 column: one row drives the comparison; zero rows return NULL — not an error — and unit_price > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical — 251 lines always produce a mean — but on staging slices (one family, one month, one market) the empty-inner-query bug ships regularly, and the above-average filter is exactly where it hides. The correlated cousin (compare each line to ITS family's average) re-runs per outer row and answers a different question at a different cost, inheriting the same empty-case behavior on an empty family slice. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "bestbuy-t8",
      q: "Finance says a financing statement is settled but the tender-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 never-collected statements worth 15,217.00, and one of the paid-status claims (#28, 1,756.00) has zero settlement legs: a status that lies, which is why tender rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The verdict sweep reads phantom 1 / 1,756.00, unfunded 5 / 13,461.00, reversed-but-debited 1 / 925.00, carrying 21 / 70,835.00 claimed against 68,687.00 settled — the 2,148.00 gap being the open partial (#25: 4,000.00 of 6,148.00). The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 truncates cents on every odd-cent fold. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "bestbuy-t9",
      q: "The promo deck wants a trailing three-month average of the monthly spine. Someone writes AVG(revenue) OVER (ORDER BY month) and calls it trailing. What did they actually compute, and what is the fix?",
      a: "With an ORDER BY, a bare aggregate window defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — a running average from 2024-01, not a trailing three. The fix names the frame: AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), which on this db reads March's 3,319.56 (3,731.97 + 3,609.64 + 2,617.08 folded over three buckets). The RANGE versus ROWS distinction is not pedantry: RANGE bundles peer rows — two rows sharing a month value enter the frame together — while ROWS counts physical rows and can split a peer group. State the frame out loud in the interview: 'ORDER BY alone gives me the running read; I owe the deck ROWS BETWEEN 2 PRECEDING AND CURRENT ROW for the trailing read.' That one sentence separates people who have shipped a promo deck from people who have read about windows.",
      tag: "frames",
    },
    {
      id: "bestbuy-t10",
      q: "You aliased SUM(total) AS revenue in the SELECT. Why does WHERE revenue > 3000 explode while ORDER BY revenue works — and what does that say about SQL's evaluation order?",
      a: "The SELECT list is evaluated late, logically: FROM, JOIN, WHERE, GROUP BY, aggregates, HAVING, window functions, SELECT, DISTINCT, ORDER BY, LIMIT. WHERE runs before the SELECT list exists, so the alias is not in scope — on this db that errors ('no such column: revenue') the moment you try to filter suppliers past the 3,000-dollar line in WHERE. ORDER BY runs after the list, so the alias resolves fine. GROUP BY and HAVING alias-visibility is a SQLite courtesy, not standard SQL — port that query to another engine and it may fail. The disciplined habit: filter aggregates in HAVING with the full expression — HAVING SUM(oi.unit_price * oi.quantity) >= 3000 — and reserve aliases for presentation. Evaluation order is the single most transferable mental model in these screens; every 'why did my filter vanish' bug in the Best Buy codebase traces back to it.",
      tag: "pipeline",
    },
    {
      id: "bestbuy-t11",
      q: "Finance wants one tender report stacking card legs and financing legs. When is UNION ALL mandatory, and when does bare UNION actively lie?",
      a: "UNION ALL concatenates; UNION concatenates and then dedupes the whole stack. On this db the tender book is 27 legs — 16 card legs for 37,364.00 and 11 financing legs for 32,248.00 — and the 5 split-settlement cycles (#1, #5, #12, #19, #22) each carry two legs of identical cents. Two legs on one statement that match on every printed column are legitimate distinct rows; bare UNION collapses each pair and the report quietly stops footing to 27 legs / 69,612.00. The lie is silent because dedupe never errors. The rule I state out loud: stack with UNION ALL by default, and pay the dedupe tax of bare UNION only when duplicates are definitionally impossible AND unwanted. If the stack needs a rail label, add a literal column — 'card' versus 'financing' — so the two arms stay distinguishable after the fold. A tender report that does not foot to 69,612.00 is wrong before anyone reads a row of it.",
      tag: "setops",
    },
    {
      id: "bestbuy-t12",
      q: "Beyond the phantom sweep — what do INTERSECT and EXCEPT actually compare, and how does their dedupe change an audit's meaning?",
      a: "Set ops compare row TUPLES — column count and column order must match — and every result is deduplicated: EXCEPT returns distinct rows in the left that have no tuple-match in the right. That dedupe is the semantic trap: 'EXCEPT' is not 'rows missing a match', it is 'distinct tuples absent from the right side'. The mirror audits on this book read cleanly because statement ids make tuples unique: paid-status EXCEPT has-a-leg surfaces the phantom #28 (1,756.00); INTERSECT of card-leg statement ids and wire-leg statement ids returns the 5 split-rail cycles that settled both ways; has-a-leg EXCEPT paid-status returns the 2 claims whose legs exist without a paid status. The habit that survives review: quote the tuple grain in a comment, and remember the swapped arms are not negatives of each other — they answer different business questions, and on this book they return 1, 5 and 2 rows respectively.",
      tag: "setops",
    },
    {
      id: "bestbuy-t13",
      q: "The coverage census classifies each statement exact, partial or none. Where do COALESCE and NULLIF earn their keep in that query — and where are they the wrong tool?",
      a: "COALESCE earns it at the fold: LEFT JOIN legs per statement, then COALESCE(SUM(p.amount_cents), 0) so legless statements read zero instead of NULL — the 6 never-collected statements worth 15,217.00 only classify honestly if their missing legs become an explicit 0. NULLIF earns it in ratios: NULLIF(settled, 0) before dividing turns the phantom's zero-leg denominator into a NULL share instead of a division blow-up. Where they are the wrong tool: presentation-only IFNULL-ing that launders unknowns into zeros — a statement whose settlement is genuinely unknown is not 'zero settled', it is 'not yet known', and collapsing that distinction in the dunning queue misroutes letters. The policy line I draw: COALESCE for definitional defaults at the fold (missing legs ARE zero legs), never for hiding unknowns downstream of it. The 2,148.00 carrying gap survives because #25's 4,000.00-of-6,148.00 partial was measured, not defaulted.",
      tag: "nulls",
    },
    {
      id: "bestbuy-t14",
      q: "This db slices 2024-01 to 2025-02 two ways — SUBSTR(created_at,1,7) buckets and julianday subtraction. When is each the right tool, and why does the text bucket sort correctly without a cast?",
      a: "Bucketing uses SUBSTR(created_at,1,7) — or strftime('%Y-%m'), same result — because the promo spine, the expense trend and the close deck all read at month grain, and zero-padded ISO text sorts lexicographically in exactly calendar order: '2024-10' sorts after '2024-09' with no cast, which is why ORDER BY month just works on the 14-bucket spine. Arithmetic uses julianday — the ship clock is julianday(shipped_at) - julianday(created_at), averaging 2.98 days over the 82 stamped tickets, because you need real day-doubles, not string subtraction (raw ISO strings coerce to their year prefix and every 'delta' reads zero). The discipline: never mix the two — month buckets are text keys, latencies are real numbers, and a report that casts one into the other's world has usually lost its population definition. The 14 pending carts have no stamp at all; no bucket or clock should claim them.",
      tag: "dates",
    },
    {
      id: "bestbuy-t15",
      q: "A teammate filters WHERE month = 2024-01 expecting January's 3,731.97 and the report comes back empty. Walk me through what the engine did.",
      a: "Unquoted, 2024-01 is not a date or a string — it is the arithmetic expression 2024 minus 1, which evaluates to 2023. The month bucket is the TEXT '2024-01' from SUBSTR(created_at,1,7), and text = 2023 is a type-mismatched comparison that matches nothing, so the report returns zero rows silently — no error, just a confident-looking empty result. The same trap wears other coats on this book: STRFTIME returns text, so every bucket comparison is a string comparison and the quotes are load-bearing; and the INTEGER-cents columns compare to bare integers, so amount_cents = 0 is right while amount_cents = '0' quietly relies on coercion. The habit: echo the literal's type in the query comment, and when a date filter returns empty, suspect the quotes before suspecting the data — January's revenue is there; the literal just evaluated to 2023.",
      tag: "quality",
    },
    {
      id: "bestbuy-t16",
      q: "The shelf dashboard slowed down. Name the three query habits you check before you blame the hardware.",
      a: "First, sargability: predicates that wrap the column in a function — SUBSTR(created_at,1,7) = '2024-11', julianday(shipped_at) - julianday(created_at) < 3 — cannot use an index on the raw column; the range-shaped rewrite (created_at >= '2024-11-01' AND created_at < '2024-12-01') can. Second, premature DISTINCT: COUNT(DISTINCT order_id) over a fan-out join costs a sort the query may not need — 251 lines to 103 tickets is a dedupe you can sometimes structure away with an EXISTS instead of a join. Third, SELECT * across the join spine: the ticket-to-line-to-SKU chain drags wide rows through memory for columns the census never prints. On a db this size none of these change the world — 103 orders, 251 lines — but the habits are graded because they scale: the same census against a 40-million-line book is a different job, and the interviewer wants to hear that you already write for that book.",
      tag: "performance",
    },
    {
      id: "bestbuy-t17",
      q: "Merchandising quotes an 85.4% attach rate; the same meeting hears that Audio is 33.7% of the book. Defend both numbers and their denominators in one breath.",
      a: "Attach rate is a ticket-grain share: 88 of the 103 register transactions carried at least one sub-55 add-on line — denominator is tickets, not lines, not units, and the 67 both-band tickets ride inside it because bands are line-grain and a basket can ride both. Audio's 33.7% is a value share: 11,744.01 of the 34,833.28 book — denominator is revenue, not the 97 of 498 units, which would print Audio at 19.5% and understate a big-ticket family by fourteen points. Both numbers are true, both are quoted weekly, and neither survives a silent denominator swap: units-based attach, ticket-based category share — each misreads the floor in a different direction. The interview answer is the discipline, not the arithmetic: before any share ships, say the population out loud — tickets, lines, units or dollars — because the stakeholder argument is never about the division, it is about what the denominator was.",
      tag: "kpis",
    },
    {
      id: "bestbuy-t18",
      q: "Price-match needs the members whose lifetime spend crosses 3,000, then their February tickets. IN subquery or EXISTS — and what decides it?",
      a: "Shape follows cardinality and nullability, not fashion. The spend gate is an uncorrelated fold — one pass over orders grouped by member, 63.5% of the book riding the accounts past 3,000 — and an IN over that fixed list reads cleanly. The February tickets are the same shape: a date-bucketed fold, IN over the '2025-02' ticket ids or a plain WHERE on the bucket. EXISTS earns its place when the inner query is correlated — 'tickets whose member crossed 3,000' checked per row — because it short-circuits on first match and expresses intent: this is a membership test, not a list build. The NULL wrinkle stays in the toolkit: a NOT IN whose subquery returns a single NULL poisons every comparison and empties the report, which is why NOT EXISTS is the defensible anti-join on any column that can be NULL. Say which one you picked and why in one sentence — the panel is grading the decision, not the keyword.",
      tag: "subqueries",
    },
    {
      id: "bestbuy-t19",
      q: "The promo spine walk prints LAG deltas; 2024-01's delta cell is NULL. Marketing wants it filled with zero. What do you tell them?",
      a: "That NULL is information: 2024-01 has no prior bucket in the db, so there is no delta — a zero would fabricate a 3,731.97 month-over-month collapse that never happened, and it would poison every downstream average that treats zero as a real value. The policy: leave the first row NULL in the analysis layer and label the baseline in the presentation layer — 'spine opens 2024-01 at 3,731.97' — or COALESCE only in a column explicitly named open_baseline. The same honesty runs forward: LEAD leaves 2025-02 without a next month, and neither gap is a defect. What is a defect is averaging the delta column blindly — thirteen real deltas plus one NULL averages correctly only because aggregates skip NULLs, but a zero-filled version averages thirteen real deltas plus a fabricated 0. Windows frame time; the first and last row are edges, and edges are described, not filled.",
      tag: "trends",
    },
    {
      id: "bestbuy-t20",
      q: "The catalog print needs every ticket's SKU list in one cell. What are the three things GROUP_CONCAT will not do for you by default?",
      a: "One: it will not order — SQLite folds in scan order, and scan order is unspecified the moment a join or a plan change touches the query, so the cell can reshuffle between runs; the stable shape stages the fold through an ordered subquery (or orders inside the aggregate on engines new enough to allow it). Two: it will not dedupe — a ticket that scanned the HDMI cable twice prints it twice unless DISTINCT is stated, and on this book the 2.44 lines-per-ticket basket depth makes doubles routine. Three: it will not label — the default separator is a bare comma, and the cell dies in the CSV the moment a SKU name contains one, so name the separator and quote the cell. The catalog-print use case is real: Accessories touches 54 of 103 tickets and a one-cell SKU list is the fastest way to eyeball an attach story — but a cell whose order and duplicates are unspecified is a screenshot, not a report.",
      tag: "strings",
    },
    {
      id: "bestbuy-t21",
      q: "The re-band CASE arms read >= 200 premium, >= 50 mid, < 50 budget — and the premium arm returns nothing. Why is arm order still load-bearing, and where does ELSE fit?",
      a: "CASE is first-match-wins and arms are evaluated top to bottom, so order IS the definition: >= 200 first means the honestly-empty premium arm (the ladder tops at 199.99) still claims every row it would ever see; put < 50 first and the budget band swallows nothing today but silently re-bands the day a 249.99 tower lands. The attach fold is the sharper version — the 55 bar sits between bands, so the arms must be < 55, then everything else, and a reordered arm set is not a bug you can see, it is a mix read that drifts 268-versus-230. ELSE is the exhaust valve: an exhaustive ELSE (even 'unbanded') turns silent NULL verdicts into a countable bucket, which is how the fate census proves 52 + 30 + 14 + 7 = 103 by construction. The habit: write arms from the top of the ladder down, quote the edges in a comment, and make the ELSE prove exhaustiveness rather than assume it.",
      tag: "case",
    },
    {
      id: "bestbuy-t22",
      q: "The reconciliation query stages legs-per-statement, then classifies, then rolls up. Why a CTE and not one query — and when do you reach for a view instead?",
      a: "Because each stage has a name the reviewer can audit: WITH legs_per_statement AS (the LEFT JOIN fold, COALESCE to zero), classified AS (the CASE that stamps phantom, unfunded, reversed or carrying), then the outer rollup that must foot to 28 statements. A CTE turns a 40-line query into three auditable sentences, lets the panel read the verdict logic in isolation, and gives every stage a place to carry its population comment — the sweep's whole credibility is that the buckets foot to 28. Reach for a derived table when the stage is used once and the query stays short; reach for a VIEW when the stage is institutional — the legs-per-statement fold is used by the refund desk, the dunning queue and the close, and a view makes the definition live in exactly one place instead of three drift-prone copies. What I never do is inline the whole chain into one SELECT: untestable, unreusable, and the day the phantom sweep misses #28, nobody can say which stage lied.",
      tag: "ctes",
    },
    {
      id: "bestbuy-t23",
      q: "Fraud wants duplicate tender legs — same statement, same cents, same day. Self-join shape, and why does the a.id < b.id predicate carry the whole query?",
      a: "Payments self-joined on invoice_id and amount_cents is the shape, but without a canonical ordering the pair set is three kinds of wrong: every pair appears twice — (a, b) and (b, a) — every leg matches itself, and the pair count inflates before anyone reads it. a.id < b.id fixes all three at once: it keeps one orientation of each unordered pair, excludes self-matches by construction, and makes the pair grain explicit — 'one row per duplicated leg pair'. On this book the split-settlement statements (five cycles settle on both rails) are exactly where a same-amount leg pair could hide, so the fraud read runs it before flagging anything. The generalizable habit: any 'find the pair' question — basket affinity, duplicate charges, co-purchased SKUs — canonicalizes its pairs first, because an unordered self-join does not count pairs, it counts permutations of them. State the canonicalization in the query comment; the reviewer looks for it there first.",
      tag: "joins",
    },
    {
      id: "bestbuy-t24",
      q: "The average ticket is 338.19. Why is that number simultaneously true and dangerous, and what do you quote next to it?",
      a: "Because the spread runs 25.47 to 1,088.44 and the distribution is big-ticket skewed: a cable-and-cable basket and a watch-plus-headset basket average into a number neither shopper ever spent. What earns its place next to the mean: the concentration read — 63.5% of revenue rides members whose lifetime spend crosses 3,000 — which says who the floor is actually for; the tile read — NTILE(4) over lifetime spend splits the 16 member accounts into four bands of four, and the top tile is where the white-glove queue lives; and a median when the deck needs a 'typical' ticket, emulated in SQLite with a staged ROW_NUMBER over an ordered fold since there is no MEDIAN() builtin. None of this retires the 338.19 — the book reconciles to 34,833.28 through it — but every quote that survives this panel pairs a mean with the skew that explains it. Averages describe the book; distribution describes the floor.",
      tag: "stats",
    },
  ],

  mcqs: [
    {
      id: "bestbuy-mcq-1",
      prompt: "A register transaction's status reads 'pending'. In this kit's Best Buy map, what happened?",
      choices: ["A cart awaiting payment capture — 14 tickets with no dock stamp yet", "Completed and kept — the box left and was signed for", "Fulfilled in flight — the shipped_at stamp has landed", "Voided at the register — the tender reversed"],
      answer: 0,
      why: "The stage map is fixed: pending = awaiting payment capture (14 of 103, 13.6%), with no shipped_at yet. It is demand in the funnel — not a fulfillment fate.",
      notes: [
        { choice: 1, why: "Completed-and-kept is 'delivered' — 52 tickets. Counting uncaptured carts as completed inflates the kept base before a single box moves." },
        { choice: 2, why: "In-flight is 'shipped' — 30 tickets with the stamp landed. Pending is the one fate with NO stamp; it stays in the funnel denominator, out of the clock." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-2",
      prompt: "The attach-bar fold splits scanned lines at 55. Which cell belongs to the attach band?",
      choices: ["268 units at a 31.01 average line price", "230 units at a 115.85 average", "133 tickets", "34,833.28 of line value"],
      answer: 0,
      why: "Sub-55 counter add-ons move 268 units at a 31.01 average line price (133 lines worth 8,227.77); 230 units at 115.85 is the big-ticket core band.",
      notes: [
        { choice: 1, why: "That is the CORE band's cells — swapping the bands is the classic re-band read, and it flips the attach story into a big-ticket story on the same query." },
        { choice: 2, why: "133 is the attach band's LINE count, not tickets — and band-grain tickets double-count (88 add-on riders versus 82 core riders with 67 overlapping)." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-3",
      prompt: "The shelf report prints 251 and 103 side by side. What are they?",
      choices: ["251 scanned lines across 103 register tickets", "103 SKUs across 251 member accounts", "251 tickets across 103 scanned lines", "251 member accounts across 103 SKUs"],
      answer: 0,
      why: "The db holds 251 order_items lines over 103 orders — 2.44 lines per ticket. Tickets are the parent grain; scanned lines are the child.",
      notes: [
        { choice: 1, why: "The db has 16 members and 16 SKUs — the fan-out is lines per ticket, not SKUs per member. Reversed grains are the first thing a reviewer checks." },
        { choice: 2, why: "Reversed the other way: 103 is the ticket count. Printing the child beside the parent swapped is how basket-depth reads end up defending the wrong number." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-4",
      prompt: "100.0 * COUNT(DISTINCT CASE WHEN unit_price < 55 THEN order_id END) / COUNT(DISTINCT order_id) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters the count to attach lines only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, COUNT over COUNT is integer division — 88/103 truncates toward 0 and the attach rate prints a flat zero on every market. The 100.0 multiplier forces real division first; the honest read is 85.4%.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (88/103)*100 truncates 0.854 to 0 first, then scales — the Monday board reads a zero attach rate, including the 54-ticket Accessories story." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-5",
      prompt: "The price-match desk needs each SKU's shelf price as it read on the member's purchase day. Which shape answers that?",
      choices: ["The latest price row with date <= the purchase date, per SKU (an as-of read)", "AVG(price) grouped by SKU", "The price row closest to today", "SUM(price) over the SKU's price history"],
      answer: 0,
      why: "A match window is anchored at the purchase date: the shelf as it stood then, which is the last record at-or-before that date — the as-of read. Anything else compares against a shelf the member never saw.",
      notes: [
        { choice: 1, why: "An average shelf never existed on any day — it is a statistic, not a price, and a match ruling against it is indefensible." },
        { choice: 2, why: "Closest-to-today drifts as new rows land; the anchor must be the purchase date, or the window silently re-writes itself every run." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-6",
      prompt: "Keep only SKUs that moved at least 30 units. Where does the threshold live?",
      choices: ["WHERE SUM(quantity) >= 30, before GROUP BY", "GROUP BY product_id HAVING SUM(quantity) >= 30", "WHERE quantity >= 30 on the raw scanned lines", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "Units-moved is a fold at SKU grain: groups must exist before they can be judged, so the floor is HAVING COUNT after GROUP BY product_id. On this db that gate keeps HDMI (38), the desk mat (47) and the headset (46), and drops the watch's 23.",
      notes: [
        { choice: 0, why: "SUM does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "quantity is per-LINE and maxes at 3 on this db — the raw filter keeps single big lines, not SKUs that moved 30 units across many." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the stamp filter still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, unnamed 82-row population", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending carts double-counted their open day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-filter version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 tickets.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.38, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-8",
      prompt: "The phantom sweep runs SELECT id FROM invoices WHERE status = 'paid' EXCEPT SELECT invoice_id FROM payments. A teammate swaps the two branches. What does the swapped query return?",
      choices: ["The same single statement", "The mirror set — 2 statements: the open partial with legs (#25) and the void-but-debited leg (#11)", "Zero rows", "A syntax error — EXCEPT branches cannot share a column name"],
      answer: 1,
      why: "EXCEPT is directional: paid-status minus has-a-leg = the phantom (#28). Swapped, it becomes has-a-leg minus paid-status = the 2 statements whose legs exist while their status is NOT paid — the open partial and the void-but-debited leg. Same tables, opposite audit.",
      notes: [
        { choice: 0, why: "Direction is the whole metric — the swapped set answers 'which legs exist without a paid claim', a different question with a different row count (2, not 1)." },
        { choice: 2, why: "22 statements carry legs and 21 are paid-status, so the second branch is populated — the diff is 2 rows, not empty. Confident zeros need proving either way." },
      ],
      difficulty: "hard",
    },
    {
      id: "bestbuy-mcq-9",
      prompt: "The close deck prints the average tender leg as 2,578.22. The legs table stores INTEGER cents (average 257,822.22 cents). Which fold produced the printed figure?",
      choices: ["ROUND(AVG(amount_cents) / 100.0, 2)", "AVG(amount_cents) / 100", "ROUND(AVG(amount_cents), 2)", "SUM(amount_cents) / 27"],
      answer: 0,
      why: "AVG over INTEGER cents gives 257,822.22 cents; / 100.0 forces real division to 2,578.2222 dollars and ROUND(…, 2) prints 2,578.22. The .0 in the divider is the dollar read — the discipline every cents table in this db demands.",
      notes: [
        { choice: 1, why: "INTEGER / INTEGER truncates — 2,578 reads like a clean number but silently ate the 22 cents, and the drift compounds across every leg the deck folds." },
        { choice: 2, why: "ROUND without the /100.0 read prints 257,822.22 — a hundredfold-off book that survives every eyeball check because the digits look right." },
      ],
      difficulty: "hard",
    },
    {
      id: "bestbuy-mcq-10",
      prompt: "A promo re-band moves the attach bar from 55 to 50. What happens to the fold?",
      choices: ["Nothing — the bar is cosmetic", "5 units re-band from attach to core (263 @ 30.71 versus 235 @ 114.76) and the Monday mix read shifts before anyone touches the shelf", "The attach band empties", "Units double-count across both bands"],
      answer: 1,
      why: "The bar IS the definition: dropping it to 50 migrates the lines priced 50-to-54.99 (probed: attach 268 → 263 units, 31.01 → 30.71 average). Band-edge moves re-band the book silently — which is why the census quotes its bar in the title.",
      notes: [
        { choice: 0, why: "The bar is load-bearing: 8 SKUs live under 50 and 8 between 50 and 200 — the edge decides which shelf those SKUs report into." },
        { choice: 2, why: "Only a bar below the cheapest line (14.99) could starve the attach band. Real re-bands move units at the edge, not whole bands into extinction." },
      ],
      difficulty: "hard",
    },
    {
      id: "bestbuy-mcq-11",
      prompt: "COUNT(*) versus COUNT(shipped_at) across the 103 register tickets — what does the second one return?",
      choices: ["103 — COUNT always counts every row", "82 — the stamped tickets: 52 delivered plus 30 shipped", "92 — delivered plus shipped plus pending", "14 — the pending carts"],
      answer: 1,
      why: "COUNT(column) skips NULLs: shipped_at is non-NULL only on the 82 stamped tickets (52 completed-and-kept, 30 in flight) — the 14 awaiting-capture carts and 7 voided rows carry no stamp and drop out. The gap between COUNT(*) and COUNT(shipped_at) IS the unstamped population, stated in one query.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rows regardless of NULLs — that's the 103. The two counts side by side are the fastest unstamped census on the book." },
        { choice: 2, why: "92 invents a stamp on the pending carts — they are the one fate with NO shipped_at; 82 is the stamped total." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-12",
      prompt: "The Monday board wants all four fates in ONE scan — 52, 30, 14, 7 footing to 103. Which shape is the portable twin of COUNT(*) FILTER (WHERE status = 'pending')?",
      choices: ["SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)", "AVG(status = 'pending')", "COUNT(status)", "Four separate queries, pasted into the deck"],
      answer: 0,
      why: "FILTER branches per aggregate in one pass; SUM(CASE … THEN 1 ELSE 0 END) is the identical fold on engines without FILTER — same single scan, same reconciliation to COUNT(*). Both shapes are accepted here; the point is one pass with a stated denominator.",
      notes: [
        { choice: 1, why: "AVG of the boolean prints the share — 14/103 = 13.6% — a percentage wearing a count's name." },
        { choice: 2, why: "COUNT(status) counts non-NULL statuses — that's 103, the denominator, not the pending arm." },
        { choice: 3, why: "Four queries are four scans and four ways to drift — the one-pass identity (52+30+14+7 = 103) is the correctness argument." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-13",
      prompt: "The tender report stacks card legs over financing legs with UNION. The 5 split-settlement cycles (#1, #5, #12, #19, #22) each carry two legs of identical cents. What does bare UNION do to the 27-leg book?",
      choices: ["Nothing — UNION keeps every row of both rails", "Silently dedupes the identical leg pairs and the stack stops footing to 27 legs / 69,612.00", "Errors — UNION branches cannot share column names", "Duplicates every leg in the stack"],
      answer: 1,
      why: "UNION concatenates and then DEDUPES whole rows. Two legs on one split statement that match on every printed column are legitimate distinct rows of the 27-leg / 69,612.00 book — bare UNION collapses each pair and the tender report quietly loses rows without losing digits.",
      notes: [
        { choice: 0, why: "That's UNION ALL's contract. Bare UNION's dedupe is the whole trap — it never warns." },
        { choice: 2, why: "Shared column names are required — UNION compares tuples positionally. The failure here is data loss, not syntax." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-14",
      prompt: "The promo spine walk prints month-over-month deltas; 2024-01's delta cell is NULL and marketing asks you to fill it with 0 so the chart has no gap. What is the right move?",
      choices: ["Fill it with 0 — a gap looks broken", "Leave it NULL and label the row the baseline: there is no prior bucket in the db, so there is no delta", "Drop 2024-01 from the spine", "Fill it with the spine's average delta"],
      answer: 1,
      why: "2024-01 is the spine's first bucket — LAG has no row before it, and that NULL is information: 3,731.97 is the opening baseline, not a 3,731.97 month-over-month collapse. Zero-filling poisons every downstream average that treats 0 as a real delta.",
      notes: [
        { choice: 0, why: "The zero fabricates a -3,731.97 move that never happened — the most quotable LAG bug on this book." },
        { choice: 2, why: "Dropping the opening bucket breaks the spine's 14-bucket identity — the baseline row belongs on the chart, labeled." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-15",
      prompt: "ORDER BY month over SUBSTR(created_at,1,7) buckets sorts the 14-bucket promo spine correctly. Why, with no CAST in sight?",
      choices: ["SQLite detects date columns and sorts them specially", "Zero-padded ISO text sorts lexicographically in exactly calendar order — '2024-10' after '2024-09'", "SUBSTR returns a number", "It only works because the spine is short"],
      answer: 1,
      why: "The bucket is TEXT in YYYY-MM form; with the month zero-padded, string order and calendar order coincide, so text comparison IS the chronological sort. The discipline is keeping the padding — a non-padded month format would sort '2024-10' before '2024-2'.",
      notes: [
        { choice: 0, why: "No magic — TEXT comparison is doing the work. The same query on a 'YYYY-M' format silently mis-sorts." },
        { choice: 2, why: "SUBSTR returns text; the sort works BECAUSE it is text in a padded format." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-16",
      prompt: "A teammate writes WHERE month = 2024-01 (no quotes) hunting January's 3,731.97 and the report comes back EMPTY. What did the engine evaluate?",
      choices: ["The date literal 2024-01-01 at midnight", "The arithmetic expression 2024 minus 1 = 2023, which matches no text bucket — a silent empty read", "January of every year in the table", "A syntax error the teammate ignored"],
      answer: 1,
      why: "Unquoted, 2024-01 is 2024 minus 1 — the integer 2023. The month bucket is the TEXT '2024-01' from SUBSTR(created_at,1,7); text = 2023 is a type-mismatched comparison that matches nothing, so the report returns zero rows without an error. The quotes are load-bearing.",
      notes: [
        { choice: 0, why: "SQLite has no bare date literal of that shape — it parsed arithmetic. Empty-without-error is the tell." },
        { choice: 3, why: "Nothing errored — the query ran and returned zero rows, which is why this bug survives code review." },
      ],
      difficulty: "hard",
    },
    {
      id: "bestbuy-mcq-17",
      prompt: "The census joins orders to order_items to count member accounts. Which count survives the fan-out, and what do the others print?",
      choices: ["COUNT(*) — rows are rows", "COUNT(DISTINCT o.customer_id) = 16; COUNT(o.customer_id) prints 251 and so does COUNT(*)", "COUNT(o.customer_id) = 16; DISTINCT is unnecessary", "COUNT(DISTINCT o.customer_id) = 103"],
      answer: 1,
      why: "One ticket fans out to its scanned lines — 103 tickets become 251 joined rows. COUNT(*) and COUNT(o.customer_id) both count join rows (251); only COUNT(DISTINCT o.customer_id) folds back to the 16 member accounts. Saying 'one row per what?' for every COUNT is the habit being graded.",
      notes: [
        { choice: 0, why: "Rows-after-join is the fan-out grain — 251 — not the member count. The census's subject vanished into the join." },
        { choice: 3, why: "103 is the ticket count pre-join; DISTINCT over the joined rows returns 16 — every member bought at least once." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-18",
      prompt: "The February pull reads BETWEEN '2024-02-01' AND '2024-03-01' and prints 3,609.64 — matching the spine's 9-order February. Why is the bound still wrong?",
      choices: ["It isn't — BETWEEN is the canonical month bound", "The inclusive upper bound pulls March 1's tickets into February; the day is invisible today (no tickets on 2024-03-01) but double-counts the moment one lands — end at '2024-02-29' or use < '2024-03-01'", "BETWEEN excludes both endpoints, losing Feb 1", "Strings cannot be range-compared"],
      answer: 1,
      why: "BETWEEN is inclusive on BOTH ends. A row stamped '2024-03-01' belongs to March's pull, and a shared boundary makes two monthly pulls both claim it. This db's date-only stamps hide the leak today — zero tickets on 2024-03-01 — which is exactly why it survives review until it fires.",
      notes: [
        { choice: 0, why: "It prints the right number today — so did every silent-shrink bug on this book. The bound is wrong by definition, not by today's output." },
        { choice: 2, why: "BETWEEN includes both endpoints — that inclusivity IS the bug on the upper bound." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-19",
      prompt: "AVG(revenue) OVER (ORDER BY month) is pitched as the promo spine's trailing three-month average. What does SQLite actually compute?",
      choices: ["The trailing three months — ORDER BY implies a 3-row frame", "A running average over ALL prior buckets — the default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "The overall 14-bucket average repeated on every row", "An error — aggregates need GROUP BY"],
      answer: 1,
      why: "An ORDER BY on a window changes the default frame to RANGE UNBOUNDED PRECEDING..CURRENT ROW — a running average from the spine's first bucket, not a trailing read. The trailing three is explicit: AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), which reads March at 3,319.56.",
      notes: [
        { choice: 0, why: "The 3-row frame must be named. Default-with-ORDER-BY is the running read — a number that looks plausible on a rising spine." },
        { choice: 2, why: "Without ORDER BY an aggregate window covers the whole partition; with it, the frame grows row by row. Neither is the trailing read." },
      ],
      difficulty: "hard",
    },
    {
      id: "bestbuy-mcq-20",
      prompt: "RFM tiling: NTILE(4) OVER (ORDER BY lifetime_spend DESC) across the 16 My Best Buy member accounts. How do the tiles fall?",
      choices: ["Four tiles of four — 16 divides evenly, top spenders in tile 1", "All 16 in tile 1 — NTILE is a rank", "Tiles of 16 — NTILE(4) means four passes", "Undefined — 16 members is too few to tile"],
      answer: 0,
      why: "NTILE(4) deals the partition into 4 near-equal buckets — 16/4 = exactly 4 per tile, tile 1 holding Alice Chen, Emma Wilson, Grace Kim and Maya Patel, the concentration quartet behind 63.5% of the book. Non-divisible populations load the remainder into the earlier tiles.",
      notes: [
        { choice: 1, why: "NTILE is positional bucketing, not a rank — every member lands in exactly one of the four tiles." },
        { choice: 2, why: "The argument is the tile COUNT: four tiles, sized to the population." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-21",
      prompt: "Line value: SUM(oi.unit_price * oi.quantity) prints 34,833.28. What does SUM(oi.unit_price) * SUM(oi.quantity) print, conceptually?",
      choices: ["The same 34,833.28 — multiplication distributes over sums", "A much larger number: the sum of all line prices times the sum of all units — two folds multiplied, not a fold of products", "0 — the columns are incompatible", "NULL — nested aggregates are illegal"],
      answer: 1,
      why: "Multiplying two aggregates folds twice and multiplies the totals — every line's price is charged against every unit in the book, an astronomically wrong number that still looks like money. The per-line product must happen BEFORE the fold: SUM(price × units).",
      notes: [
        { choice: 0, why: "It doesn't distribute — summed products are not products of sums. The gap is the whole point of the per-line fold." },
        { choice: 3, why: "Nothing is nested — both sums are flat aggregates. The bug runs and prints confidently." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-22",
      prompt: "EU prints 45 orders from 8 member accounts. Which expression returns the 8, and what do its neighbors return?",
      choices: ["COUNT(customer_id) = 8", "COUNT(DISTINCT customer_id) = 8; COUNT(customer_id) = 45 and COUNT(*) = 45 on the joined base", "DISTINCT customer_id alone = 8 as an aggregate", "COUNT(region) = 8"],
      answer: 1,
      why: "The member count is a distinct fold over a fan-out base: 45 ticket rows carry 8 distinct member ids. COUNT without DISTINCT counts rows (45); DISTINCT outside an aggregate returns a row list, not a count.",
      notes: [
        { choice: 0, why: "That's the row count wearing the member count's name — the exact conflation the census exists to kill." },
        { choice: 2, why: "SELECT DISTINCT is a row dedupe, not an aggregate — it returns 8 ROWS, not the number 8." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-23",
      prompt: "Duplicate-charge detection self-joins payments on invoice_id and amount_cents. Why does the a.id < b.id predicate carry the whole query?",
      choices: ["It speeds up the join", "It canonicalizes unordered pairs: one orientation per pair, no self-matches — without it every pair counts twice and every leg matches itself", "It filters to card legs only", "It deduplicates the amounts first"],
      answer: 1,
      why: "An unordered self-join counts permutations, not pairs: (a,b) and (b,a) both appear, and a=b matches the leg against itself. The strict inequality keeps exactly one orientation of each unordered pair and excludes self-matches by construction — the pair grain stated in one predicate.",
      notes: [
        { choice: 0, why: "Performance is beside the point — the predicate defines WHICH pairs exist. Without it the count is wrong before it is slow." },
        { choice: 3, why: "Nothing deduped — the inequality is a structural fix, not a fold. The 5 split-settlement cycles are exactly where same-amount leg pairs would hide." },
      ],
      difficulty: "hard",
    },
    {
      id: "bestbuy-mcq-24",
      prompt: "Why JULIANDAY(shipped_at) - JULIANDAY(created_at) for the ship clock, and not shipped_at - created_at on the raw ISO stamps?",
      choices: ["They're identical — the strings subtract cleanly", "Raw ISO strings coerce to their leading year on subtraction — '2024-01-04' - '2024-01-01' evaluates 2024 minus 2024 and prints 0 for every ticket; JULIANDAY converts to real day numbers (2.98 average over the 82 stamped)", "JULIANDAY strips time zones", "Raw subtraction errors on the dash"],
      answer: 1,
      why: "SQLite's minus on TEXT coerces each string to its leading numeric prefix — the year — so every 'delta' is 0. julianday() maps the stamp to a real day-double, and the clock's 2.98-day average (2 to 4 spread) only exists through that conversion.",
      notes: [
        { choice: 0, why: "Probed on this db: the raw form prints 0. The zeros then average to zero — a ship clock that says the dock is instant." },
        { choice: 2, why: "Time zones are unrelated — the db stores plain stamps and the failure is type coercion, not zones." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-25",
      prompt: "The match queue's 'next five requests' query runs SELECT … LIMIT 5 with no ORDER BY. What is wrong with it?",
      choices: ["Nothing — LIMIT returns the first five rows", "Row order is unspecified without ORDER BY, so the 'next five' is an arbitrary five that can change between runs — sort first, then cap", "LIMIT requires OFFSET", "It returns five RANDOM rows by design"],
      answer: 1,
      why: "Without ORDER BY, SQL returns rows in whatever order the plan produces — LIMIT 5 caps an unspecified set. Every top-N read here sorts on a stated key (oldest request first, biggest claim first) before the cap; otherwise the queue re-shuffles silently.",
      notes: [
        { choice: 0, why: "'First five' of an unordered set is not a thing — the plan's scan order is an implementation detail, not a queue." },
        { choice: 3, why: "Not random — deterministic per plan, but not STABLE across plans. Same failure, subtler face." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-26",
      prompt: "The dunning classifier reads CASE WHEN status = 'paid' … WHEN status = 'void' … ELSE 'open' END. Why does arm order matter if each test is exact?",
      choices: ["It doesn't — exact tests are order-independent", "CASE is first-match-wins top to bottom: a broader arm placed earlier shadows later arms, and the exhaustive ELSE is the only thing turning unmatched rows into a countable bucket instead of silent NULLs", "ELSE must come first", "Arms evaluate in parallel"],
      answer: 1,
      why: "Exact today does not mean exclusive forever — the day an arm widens (say, status LIKE 'paid%'), a preceding broad arm swallows its rows silently. Top-down order IS the definition, and the ELSE proves exhaustiveness: every statement lands in a named bucket.",
      notes: [
        { choice: 0, why: "Order is semantics, not style — swapping the void and open arms changes nothing today and everything the day a row matches both." },
        { choice: 2, why: "ELSE is the exhaust valve and belongs last — first-match-wins makes an early ELSE a black hole." },
      ],
      difficulty: "easy",
    },
    {
      id: "bestbuy-mcq-27",
      prompt: "GROUP_CONCAT(name) per ticket builds the one-cell SKU list, but the cell reshuffles between runs. What fixes it?",
      choices: ["CAST the cell to text — order stabilizes", "Fold through an ordered stage: sort the (order_id, name) pairs in a subquery/CTE before the GROUP_CONCAT (or ORDER BY inside the aggregate where the engine allows) — scan order is otherwise unspecified, and name the separator while you're there", "Add DISTINCT — order is the duplication problem", "GROUP_CONCAT is deprecated"],
      answer: 1,
      why: "SQLite folds GROUP_CONCAT in scan order, and scan order is unspecified the moment a plan changes — the cell is a screenshot, not a report, until the fold's input is ordered. The probed stable shape reads Desk Mat, HDMI, Headset, Yoga Mat alphabetically, every run.",
      notes: [
        { choice: 2, why: "DISTINCT dedupes values, not order — a ticket that scanned the HDMI cable twice prints it twice AND still reshuffles." },
        { choice: 0, why: "A cast changes the type of the same unordered string. Order must be fixed upstream of the fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "bestbuy-mcq-28",
      prompt: "The close's trial-balance line is SELECT ROUND(SUM(debit_cents)/100.0,2), ROUND(SUM(credit_cents)/100.0,2) FROM ledger_entries. What must print for the close to ship?",
      choices: ["69,612.00 / 69,612.00 — the cash fold", "181,080.00 / 181,080.00 — debits equal credits, delta zero", "86,052.00 / 69,612.00 — receivables against cash", "0.00 / 0.00 — the ledger nets to zero"],
      answer: 1,
      why: "The global trial balance folds ALL 80 entries: 181,080.00 debits against 181,080.00 credits, delta zero — the close's one-line proof. 69,612.00 is the cash account's settled read, 86,052.00 receivables — account-level nets, not the balance check.",
      notes: [
        { choice: 0, why: "Cash is one account among four — folding only cash is an account statement, not a trial balance." },
        { choice: 3, why: "The ledger nets to zero per entry (every debit has its credit); the totals are 181,080.00 each, not zero — the check is equality, not emptiness." },
      ],
      difficulty: "medium",
    },
    {
      id: "bestbuy-mcq-29",
      prompt: "A teammate's filter reads WHERE status = \"delivered\" — double quotes — and it RUNS, returning 52. What is the landmine?",
      choices: ["None — double and single quotes are interchangeable", "Double quotes are identifiers first: the hit today is SQLite's legacy string-literal fallback, but \"status\" double-quoted re-binds to the column (status = status) and silently returns all 103 — single-quote literals, always", "It only works because the column is indexed", "It returns 52 by casting"],
      answer: 1,
      why: "SQLite resolves \"delivered\" as an identifier first; when no column exists, a compatibility fallback treats it as a string literal — so the query works by accident, and the same habit with \"status\" compares the column to itself and returns the whole book. The fallback is a landmine, not a feature to use.",
      notes: [
        { choice: 0, why: "Probed: they are NOT interchangeable — \"status\" = status prints 103. The interchangeability myth is what keeps the bug alive." },
        { choice: 3, why: "No cast — identifier resolution, then fallback. The 52 is real, which is exactly why the habit survives review." },
      ],
      difficulty: "hard",
    },
    {
      id: "bestbuy-mcq-30",
      prompt: "Audio prints 11,744.01 on 97 of the book's 498 units. The merch deck quotes Audio at 33.7%. Which denominator produced that, and what does the other one say?",
      choices: ["Units — 97/498 = 19.5%", "Revenue — 11,744.01 / 34,833.28 = 33.7% of the book; the units share (19.5%) underweights a big-ticket family by fourteen points", "Tickets — 46 of 103 = 44.7%", "SKUs — 3 of 16 = 18.8%"],
      answer: 1,
      why: "The deck's share is value-weighted: Audio's 11,744.01 over the 34,833.28 book. The units share — 97 of 498 — is also true and tells the opposite story: the shelf moves cheaper boxes in Audio than the dollars suggest. Both are quotable; only one is 33.7%.",
      notes: [
        { choice: 0, why: "19.5% is the units share — true, and the exact number a speaker-heavy attach argument would cherry-pick. The 33.7% is revenue." },
        { choice: 2, why: "44.7% is the ticket-touch share (46 of 103) — a THIRD true number wearing a third denominator. Saying which one you quoted is the whole discipline." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-bestbuy-1",
      tier: "easy",
      topic: "l8",
      universe: "catalog",
      title: "The attach-bar census",
      brief:
        "Best Buy-flavored brief on the storefront db (orders = register transactions, order_items = scanned line SKUs): Monday's merchandising review opens with the attach-bar census — every scanned line splits at the 55-dollar attach bar into counter add-ons versus big-ticket cores, with the bar quoted so the re-banding argument happens before the query runs. Probed facts: sub-55 lines move 268 units at a 31.01 average line price (133 lines, 8,227.77 of line value) against 230 big-ticket units at 115.85 (118 lines, 26,605.51); 88 of 103 transactions ride at least one add-on and 67 touch both bands. The review reads the bigger unit count first.",
      ask: "Return each band (attach under 55, core at 55-plus) with line count, units and average line price to 2 decimals, biggest unit count first.",
      template:
        "SELECT CASE WHEN oi.unit_price < {1} THEN {2} ELSE 'core' END AS band,\n       COUNT(*) AS lines,\n       {3}(oi.quantity) AS units,\n       ROUND(AVG(oi.unit_price), 2) AS avg_line_price,\n       ROUND(SUM(oi.unit_price * oi.quantity), 2) AS line_value\nFROM order_items oi\nGROUP BY band\nORDER BY units {4};",
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the attach bar",
          why: "The merchandising deck publishes the bar: sub-55 lines are counter add-ons, 55-plus is big-ticket core. Moving it to 50 re-bands 5 units (263 @ 30.71 versus 235 @ 114.76) and the Monday mix read shifts before anyone touches the shelf.",
        },
        {
          answer: "'attach'",
          kind: "keyword",
          label: "the add-on label",
          why: "The attach band's row label must match the deck — 268 units @ 31.01 ride under 'attach'. A different literal renames the row and the fold no longer reconciles with the published census; swapping in 'core' collapses both arms into one band and the two-row census dies.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the units fold",
          why: "SUM(oi.quantity) folds units on the line — 268 attach, 230 core. COUNT counts scanned lines (133 / 118) and AVG averages quantity per line (about 2.0 versus 1.9) — three different reads wearing one column name, and only one is units.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the bigger-units-first direction",
          why: "The review opens on the punchline: the counter moves MORE units (268 versus 230) while the shelf moves more dollars (26,605.51 versus 8,227.77). ASC buries the attach row under the core row and the meeting starts with the wrong headline.",
        },
      ],
      distractors: ["50", "'add-on'", "COUNT", "AVG", "ASC"],
      walkthrough:
        "One table, one CASE, one fold — the whole census at line grain. The CASE bands all 251 scanned lines by shelf price at the published 55 bar, GROUP BY band folds each band into lines, units and average line price, and the result is two rows: attach 133 lines / 268 units / 31.01 / 8,227.77 of line value, core 118 / 230 / 115.85 / 26,605.51 — and the two line_values sum to the 34,833.28 book exactly, which is the reconciliation the Monday board checks first. The bands are line-grain, not ticket-grain: 88 tickets ride an add-on and 82 ride a core, but 67 ride both — 88 + 82 = 170 over 103 tickets is the overlap arithmetic that proves the bands were never exclusive. The distractors each break differently: a 50 bar re-bands 5 units to 263/235 and the mix read drifts; 'add-on' in the label slot renames the row the deck quotes; COUNT folds lines instead of units (133/118) and AVG(quantity) prints 2.0/1.9 — basket depth wearing the units column; ASC opens the review on the core row and the attach headline never lands. Bar, fold, direction: the three things merchandising actually argues about.",
    },
    {
      id: "cs-bestbuy-2",
      tier: "medium",
      topic: "q5",
      universe: "refund-audit",
      title: "The phantom adjustment sweep",
      brief:
        "Best Buy-flavored brief on the storefront db (invoices = financing statements, payments = tender legs): before the month-end statement run, the refund desk sweeps for phantom price-match adjustments — statements whose status claims settled but whose tender legs never landed. Probed facts: 28 statements — 21 paid (66,443.00), 6 open (19,609.00), 1 void (925.00) — against 27 legs totaling 69,612.00. The sweep reads phantom 1 statement at 1,756.00 (paid-status #28 with zero legs), unfunded 5 at 13,461.00, reversed-but-debited 1 at 925.00 (void #11 carrying a leg), carrying 21 at 70,835.00 claimed against 68,687.00 settled — the 2,148.00 gap is the open partial (#25: 4,000.00 of 6,148.00). Statements and legs store INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each verdict bucket with statement count, claimed total and settled total in dollars to 2 decimals, biggest claimed total first.",
      template:
        "SELECT v.verdict,\n       COUNT(*) AS statements,\n       ROUND(SUM(v.claimed) / {1}, 2) AS claimed_total,\n       ROUND(SUM(v.paid) / 100.0, 2) AS settled_total\nFROM (\n  SELECT i.id,\n         i.status,\n         i.amount_cents AS claimed,\n         CASE WHEN i.status = 'paid' AND COALESCE(SUM(p.amount_cents), 0) = {2} THEN {3}\n              WHEN i.status = 'open' AND COALESCE(SUM(p.amount_cents), 0) = 0 THEN {4}\n              WHEN i.status = 'void' THEN 'reversed'\n              ELSE 'carrying' END AS verdict,\n         COALESCE(SUM(p.amount_cents), 0) AS paid\n  FROM invoices i\n  {5} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n) v\nGROUP BY v.verdict\nORDER BY claimed_total {6};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements and legs store INTEGER cents; /100.0 is the dollar read that prints 70,835.00 instead of 7,083,500. The .0 matters — bare 100 keeps integer arithmetic and the sweep reports a book whose cents column has been silently amputated.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the zero-leg boundary",
          why: "The phantom arm fires when legs sum to exactly 0 — 1,756.00 claimed, 0.00 settled, and the 0 is a result cell in settled_total. Any other boundary moves statements between buckets and the sweep stops footing to the 28-statement book.",
        },
        {
          answer: "'phantom'",
          kind: "keyword",
          label: "the claimed-but-legless label",
          why: "Paid status with zero legs is the phantom adjustment — #28 at 1,756.00, the status that lies. Labeling it anything else buries the refund desk's headline row inside a bucket name nobody sweeps for.",
        },
        {
          answer: "'unfunded'",
          kind: "keyword",
          label: "the open-and-legless label",
          why: "Open statements with zero legs are the dunning queue — 5 statements worth 13,461.00. The label separates never-collected demand from the phantom lie; one bucket drives collections, the other drives an adjustment audit.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-the-claims join type",
          why: "LEFT JOIN keeps all 28 statements — the 6 with no legs are the sweep's whole point, arriving with NULL legs that COALESCE folds to 0. INNER JOIN silently deletes them: the sweep would report one 'carrying' bucket (22 / 71,760.00) and the phantom would never surface.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-claimed-first direction",
          why: "The sweep reads biggest exposure on top: carrying 70,835.00, unfunded 13,461.00, phantom 1,756.00, reversed 925.00. ASC opens the audit on the smallest bucket and the desk reads the punchline last.",
        },
      ],
      distractors: ["INNER", "COUNT", "MAX", "'no payment'", "ASC"],
      walkthrough:
        "Two stages: fold legs per statement, then classify and roll up. The derived table LEFT JOINs 28 statements to 27 tender legs and folds SUM(p.amount_cents) per statement with a COALESCE-to-0 fallback, then CASE-classifies each claim: paid with zero legs → 'phantom' (1 — #28 at 1,756.00, the status that lies), open with zero legs → 'unfunded' (5 — 13,461.00, the dunning queue), void → 'reversed' (1 — #11 at 925.00 whose leg still debited), else 'carrying' (21 — 70,835.00 claimed against 68,687.00 settled, the 2,148.00 gap being the open partial #25 at 4,000.00 of 6,148.00). The outer SELECT rolls each bucket to counts and dollar totals via the /100.0 read, biggest claimed first. The distractors each break differently: INNER JOIN deletes the 6 legless statements and the sweep collapses to one carrying row — the phantom's absence is now invisible; COUNT or MAX in the boundary/divider slots either error or fold the wrong aggregate into the money columns; 'no payment' in a label slot renames the buckets mid-audit and nothing foots to the deck; ASC inverts the read. The sweep rule holds: classification happens at statement grain before any rollup, and the buckets must foot to 28 or the close does not ship.",
    },
    {
      id: "cs-bestbuy-3",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Best Buy-flavored brief on the storefront db (orders = register transactions): the Monday funnel review opens with the fate census and it must run in ONE scan — four sequential queries are four ways to drift. Probed facts: 103 register transactions worth 34,833.28 split delivered 52 (50.5% kept), shipped 30, pending 14, cancelled 7 (6.8% voided). The census reads the kept share to one decimal on top and foots the four branches to 103 by construction before anyone argues the funnel.",
      ask: "Return the four fates, the 34,833.28 book and the 50.5% kept share in a single scan, fates in the deck's order.",
      template:
        "SELECT\n  COUNT(*) AS tickets,\n  COUNT(*) FILTER (WHERE status = {1}) AS kept,\n  COUNT(*) FILTER (WHERE status = 'shipped') AS in_flight,\n  COUNT(*) FILTER (WHERE status = 'pending') AS awaiting_capture,\n  COUNT(*) FILTER (WHERE status = 'cancelled') AS voided,\n  {2}(total) AS book_value,\n  ROUND({3} * COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*), {4}) AS kept_pct\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed-and-kept fate",
          why: "The deck's first branch counts completed-and-kept — 52 of 103, 50.5%. 'shipped' here swaps the kept arm to the 30 in-flight tickets and the funnel headline becomes a fulfillment count; the status strings are the census's vocabulary and they are quoted.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the book fold",
          why: "SUM(total) folds the 34,833.28 register book in the same scan as the counts. AVG prints 338.19 — the average ticket wearing the book's name — and COUNT prints 103, the denominator; both plausible, both wrong columns.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the percent multiplier",
          why: "100.0 sits BEFORE the division so the share is real arithmetic: 100.0 * 52 / 103 = 50.4854 before rounding. A bare 100 keeps COUNT-over-COUNT integer division and truncates toward zero — the share prints a flat zero.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the round-to-one decimal",
          why: "The deck publishes the kept share to one decimal — 50.5. Two digits print 50.49 and the census no longer ties to the published board; zero digits print 50. The rounding digit is part of the definition, not cosmetics.",
        },
      ],
      distractors: ["'shipped'", "AVG", "10.0", "2"],
      walkthrough:
        "One table, one scan, four FILTER branches — the whole fate census in a single pass. COUNT(*) folds all 103 tickets; each FILTER branch counts one status — delivered 52, shipped 30, pending 14, cancelled 7 — and the reconciliation is the branches summing to 103 by construction, which is the first thing the Monday board checks. The book fold is SUM(total) = 34,833.28 and the kept share is 100.0 * 52 / 103 rounded to one decimal — 50.5 — with the multiplier before the division so integer truncation never flattens it. The distractors each break differently: 'shipped' in the fate slot swaps the kept arm to 30 and the funnel headline becomes the in-flight count; AVG in the book slot folds 338.19 — average ticket wearing the book's name — and 10.0 in the multiplier slot scales the share to 5.0; a 2-digit round prints 50.49 and the deck's 50.5 no longer ties; 'shipped' in the digit slot coerces to zero and the share reads 50.0. One scan, four fates, one denominator — stated before it is computed.",
    },
    {
      id: "cs-bestbuy-4",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The vendor scorecard fold",
      brief:
        "Best Buy-flavored brief on the storefront db (suppliers = brand/vendor partners, products = shelf SKUs, order_items = scanned lines): the quarterly line review needs each partner's scorecard — listings, units and scanned revenue — past the 3,000-dollar revenue line, biggest book first. Probed facts: Nordic Gadgets 11,130.25 (32% of the book) on 3 listings, Midwest Hardware 9,294.93 (26.7%), Alpine Audio 4,765.63 (13.7%) with the 4.8 rating crown, Andes 3,613.25, Shenzhen 3,049.07 — Pacific Textiles' 2,980.15 misses the line by 19.85. Ratings ride along: Nordic 4.6 and Alpine 4.8 are the trusted bench; Pacific's 3.9 is the floor.",
      ask: "Return each partner past the 3,000-dollar line with rating, listings, units and scanned revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name,\n       s.rating,\n       COUNT(DISTINCT p.id) AS listings,\n       {1}(oi.quantity) AS units,\n       COUNT(*) AS lines,\n       ROUND(SUM(oi.unit_price * oi.quantity), 2) AS revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY {2}\nHAVING SUM(oi.unit_price * oi.quantity) >= {3}\nORDER BY revenue {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the units fold",
          why: "SUM(oi.quantity) folds units on the scanned lines — Midwest 109, Shenzhen 99, Nordic 82, Pacific 80, Alpine 77, Andes 51. COUNT folds scanned lines instead (43, 56, 40...) and AVG prints per-line quantity near 1.9 — basket depth wearing the units column.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the scorecard grain",
          why: "One row per partner: GROUP BY s.id makes the supplier the grain, so listings, units and revenue all fold to the scorecard row. Grouping by oi.product_id shatters the card to 16 SKU rows and the partner's book disappears mid-review.",
        },
        {
          answer: "3000",
          kind: "number",
          noVerify: true,
          label: "the revenue floor",
          why: "The review's line is 3,000 scanned dollars: Pacific Textiles' 2,980.15 misses by 19.85 and drops. The floor lives in HAVING — revenue does not exist until groups form, and a WHERE would error trying to filter an aggregate.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The line review opens on the biggest book: Nordic 11,130.25 on top, Shenzhen 3,049.07 at the floor. ASC buries the partner who carries 32% of the shelf under the smallest survivor and the meeting starts with the wrong vendor.",
        },
      ],
      distractors: ["COUNT", "AVG", "ASC", "50000"],
      walkthrough:
        "Three tables, one grain: suppliers to products to scanned lines, grouped per partner. COUNT(DISTINCT p.id) folds listings (Nordic 3, Alpine 2), SUM(oi.quantity) folds units — Midwest 109 leads on volume while Nordic 82 leads on dollars — and the revenue fold is SUM(price × units) to two decimals: Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, Andes 3,613.25, Shenzhen 3,049.07. The HAVING floor at 3,000 is the review's line: Pacific Textiles' 2,980.15 misses by 19.85 and drops — a WHERE could not do that, because revenue does not exist until groups form. DESC opens the read on the biggest book. The distractors each break differently: COUNT in the units slot prints line counts (43, 56, 40...) and basket depth wears the units name; AVG prints 1.9-ish per-line quantities; 50000 in the floor starves the scorecard to zero rows; ASC buries Nordic under Shenzhen. Rating rides along unwashed — Alpine 4.8 and Nordic 4.6 are the bench — and every figure here must tie to the 34,833.28 book by construction.",
    },
    {
      id: "cs-bestbuy-5",
      tier: "medium",
      topic: "t7",
      universe: "month-close",
      title: "The promo-spine walk",
      brief:
        "Best Buy-flavored brief on the storefront db (orders = register transactions, SUBSTR(created_at,1,7) = month buckets): the close deck walks the 14-month promo spine from 2024-01 (3,731.97) to 2025-02 (2,390.53) with month-over-month deltas, biggest lift on top, capped at the full 14-bucket spine. Probed facts: July troughs at 1,193.86 and November's 1,648.80 carries two of the seven voids; the biggest single-month lift is August's +1,158.21 (1,193.86 to 2,352.07) and the worst drop is November's -1,326.87 (2,975.67 to 1,648.80). The first row's delta stays NULL — the baseline, never a zero.",
      ask: "Return the 14-bucket spine with prior-month revenue and the delta to 2 decimals, biggest lift first.",
      template:
        "SELECT month,\n       revenue,\n       LAG(revenue) OVER (ORDER BY month) AS prev_revenue,\n       ROUND(revenue - {1}(revenue) OVER (ORDER BY month), 2) AS delta\nFROM (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         {2}(total) AS revenue\n  FROM orders\n  GROUP BY {3}\n)\nORDER BY delta {4}\nLIMIT {5};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month function",
          why: "LAG(revenue) OVER (ORDER BY month) reads the bucket before each row — the walk's whole engine. LEAD reads forward and flips every delta's sign while losing the last row; the walk is defined backward from the bucket being printed.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the bucket fold",
          why: "SUM(total) folds each month's register tickets to the spine cell — 3,731.97 opening, 1,193.86 trough. COUNT folds ticket counts (8, 9, 8...) and the walk defends promo lift against counts that never carried a dollar.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the bucket grain",
          why: "GROUP BY month folds 103 tickets into the 14 zero-padded YYYY-MM buckets the deck walks. GROUP BY created_at shatters 14 buckets into per-timestamp rows and the spine dissolves — the bucket alias IS the calendar grain.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-lift-first direction",
          why: "The close deck reads the biggest lift on top — August's +1,158.21 out of the July trough. ASC leads with November's -1,326.87 and the meeting opens on the worst month instead of the recovery.",
        },
        {
          answer: "14",
          kind: "number",
          noVerify: true,
          label: "the spine cap",
          why: "The spine is 14 buckets, 2024-01 through 2025-02; the cap asserts the population. A silent 15th row means the db grew past the deck — the walk would print a month the close never reconciled instead of flagging it.",
        },
      ],
      distractors: ["LEAD", "COUNT", "created_at", "revenue", "5"],
      walkthrough:
        "Stage first, walk second: the derived table buckets 103 tickets with SUBSTR(created_at,1,7) and folds SUM(total) per month — the 14-bucket spine from 3,731.97 to 2,390.53 — then the outer query stamps LAG(revenue) OVER (ORDER BY month) and the delta to two decimals. The walk reads biggest lift on top: August +1,158.21 out of the July trough (1,193.86), September +763.97, then the drops — November -1,326.87 (2,975.67 to 1,648.80, carrying two of the seven voids), March -992.56, June -862.88, July -853.57. The first row's delta is NULL and stays NULL: 2024-01 is the baseline, and COALESCE-ing it to zero would fabricate a 3,731.97 collapse. LIMIT 14 is the population guard — a silent 15th bucket means the db grew past the deck. The distractors each break differently: LEAD flips every delta's sign and loses the last row; COUNT folds the spine into ticket counts; GROUP BY created_at dissolves 14 buckets into per-timestamp rows; 5 in the cap truncates the walk mid-story. Deltas are claims; the spine is the evidence.",
    },
    {
      id: "cs-bestbuy-6",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The member ladder and the four-way tie",
      brief:
        "Best Buy-flavored brief on the storefront db (orders = register transactions, customers = My Best Buy member accounts): the growth board's concentration page ranks members by tickets with lifetime spend beside it — and publishes a tie rule, because the ladder runs 24, 17, 14, 13, 5 and then FOUR members tie at 4. Probed facts: Alice Chen 24 tickets / 7,262.35 crowns both reads; Emma Wilson 17 / 6,640.56; Grace Kim 14 / 4,574.23; Maya Patel 13 / 3,644.56; the tie at 4 is Pedro 1,686.17, Keiko 1,098.60, Isabella 985.65, Noah 737.68 — RANK shares rung 6 and lands Farid Nasser's 3 tickets on rank 10. The page prints the top 10 and says which rank function it used.",
      ask: "Return the top-10 member ladder — tickets, spend to 2 decimals, ticket rank and dense spend rank — best rank first.",
      template:
        "SELECT c.name,\n       c.region,\n       COUNT(o.id) AS tickets,\n       ROUND(SUM(o.total), 2) AS spend,\n       {1}() OVER (ORDER BY COUNT(o.id) {2}) AS ticket_rank,\n       DENSE_RANK() OVER (ORDER BY SUM(o.total) DESC) AS spend_rank\nFROM orders o\nJOIN customers c ON c.id = {3}\nGROUP BY c.id\nORDER BY {4} {5}\nLIMIT {6};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-publishing rank",
          why: "RANK gives the four 4-ticket members the shared rung 6 and lands the next distinct count on rank 10 — the gap IS the published tie. DENSE_RANK hides the gap (next rung 7) and ROW_NUMBER splits the tie arbitrarily, a silent judgment about whose account goes white-glove first.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-tickets-first direction",
          why: "The ladder ranks by tickets descending — 24, 17, 14, 13, 5, then the tie. ASC crowns the one-ticket members and the concentration page argues the floor is for nobody, which the 63.5% concentration read refutes in one line.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the ladder's join key",
          why: "Orders join members on o.customer_id — the ticket's owner. c.id = c.id matches every order to every member and folds 103-per-row ladders; the join key is the population definition for whose ladder this is.",
        },
        {
          answer: "ticket_rank",
          kind: "keyword",
          label: "the page's sort key",
          why: "The concentration page sorts on the published rank, not the raw fold — ORDER BY ticket_rank ASC prints 1 through 10 with the tie where the tie rule put it. Sorting on spend re-orders the page and the tie rule silently stops being the tie rule.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the best-first order",
          why: "Rank 1 is the crown: the page reads Alice Chen's 24 / 7,262.35 first. DESC inverts the ladder and the board reviews the 16th member before the member carrying 24 of 103 tickets.",
        },
        {
          answer: "10",
          kind: "number",
          noVerify: true,
          label: "the page cap",
          why: "The board approved a top-10 page — 5 solo rungs, the 4-way tie, and Farid Nasser's rank-10 proof that the gap exists. The cap is part of the tie story: cutting to 5 hides the tie the page exists to explain.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "SUM", "spend", "spend_rank"],
      walkthrough:
        "Join, fold, rank, publish. Orders join customers on o.customer_id, GROUP BY c.id folds each member to tickets and spend, and RANK() OVER (ORDER BY COUNT(o.id) DESC) stamps the ladder: Alice Chen 24 / 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56, Chloe Dubois 5 / 2,667.93 — then the four-way tie at 4: Pedro 1,686.17, Keiko 1,098.60, Isabella 985.65, Noah 737.68 share rank 6, and Farid Nasser's 3 tickets land on rank 10, the gap proving RANK published the tie honestly. DENSE_RANK beside spend shows the alternative: spend is tie-free, so dense spend rank reads 1 through 10 without sharing — the tie-breaker column named in the same breath as the tie. LIMIT 10 prints the page the board approved. The distractors each break differently: DENSE_RANK in the rank slot collapses the gap (Farid at 7) and hides the tie's cost; ROW_NUMBER splits the tie arbitrarily — a silent judgment about whose account goes white-glove; c.id in the join slot matches every order to every member and the ladder counts 103 per row; spend_rank in the sort slot re-orders the page by spend and the published tie rule silently stops being the tie rule. Rank, tie rule, cap: the three things a leaderboard must publish.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-SKU line revenue is the Monday shelf report — fold scanned lines to SKU grain and rank. This problem drills the exact fold the attach-bar census re-cuts weekly." },
    { slug: "sales-analysis-i", why: "Units beside revenue per SKU is how big-ticket versus counter mix gets defended — 268 add-on units at 31.01 against 230 cores at 115.85 is this problem's shape at db scale." },
    { slug: "queries-quality-and-percentage", why: "Attach rate is a ratio with a stated denominator — 88 of 103 tickets to one decimal. Same division-discipline drill, Best Buy flavor." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in shelf reviews — which SKUs moved at least N units, which families touched at least N tickets. This problem drills the group-level gate." },
    { slug: "list-the-products-ordered-in-a-period", why: "The February promo window (2,390.53 in 2025-02) is a date-bucketed shelf pull — which SKUs moved inside the window. Exactly this problem." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-member favorite SKU powers the recommendation shelf — the next cable for the member who bought the headset. Argmax per member is the shape." },
    { slug: "find-product-recommendation-pairs", why: "Basket affinity is the attach engine: which SKUs ride the same ticket — the 14.99 HDMI cable beside the 149.99 headset. Pair-folding over tickets, exactly this problem." },
    { slug: "second-highest-salary", why: "Price-match reads are runner-up reads: the second shelf price in a family is the match candidate. DENSE_RANK and nth-value discipline, Best Buy flavor." },
    { slug: "ratings-histogram", why: "Star histograms anchor the review shelf — the ratings read that decides which SKU earns endcap space. Bucket-and-count, exactly this shape." },
    { slug: "fix-product-name-format", why: "Catalog hygiene before any shelf join: TRIM and casing over SKU names so the same box does not split into two rows. This problem is the pre-merge scrub." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest transaction per SKU drives the restock queue — Smart Watch S sits at 17 remaining against 23 sold. ROW_NUMBER-per-group is the shape." },
    { slug: "weeks-of-supply", why: "Weeks of supply is the inventory health read merchandising runs weekly — 40 in stock against 23 sold on the 199.99 watch is a countdown clock. This problem is that read, and it is the one Best Buy-tagged row in the pool." },
    { slug: "combine-two-tables", why: "Members LEFT JOINed to tickets: the whitespace read. On this db it returns a confident zero — all 16 members have bought — and proving a zero is the same skill as finding one." },
    { slug: "confirmation-rate", why: "Pickup confirmations arrive with gaps — COALESCE turns missing confirmation data into an explicit rate instead of a silent NULL. The drill the BOPIS funnel needs." },
    { slug: "customers-who-never-order", why: "The anti-join every retail analyst runs first. Here it must return a confident zero, and stating why it does — every member appears in tickets — is the interview answer." },
    { slug: "customer-order-frequency", why: "Repeat cadence is the membership pitch: which members transact at least twice inside a window. HAVING over a date-bucketed fold, exactly this shape." },
    { slug: "product-sales-analysis-i", why: "The per-SKU units-and-revenue census is the shelf report's first cut — fold scanned lines to SKU grain. Drills the exact SELECT-and-fold the attach census re-cuts weekly." },
    { slug: "product-sales-analysis-iii", why: "Per-SKU sale intervals are the price-match window audit — which SKUs sold across which date spans. The same shape the match desk runs against the promo calendar before ruling." },
    { slug: "average-selling-price", why: "ASP per family is the margin read behind every vendor negotiation — Nordic's 139.66 listing average against Pacific's floor. Join-fold discipline, Best Buy flavor." },
    { slug: "recyclable-and-low-fat-products", why: "The shelf pull is a two-flag filter — in-stock AND mid-band AND sellable. A cheap drill with an honest habit: two WHERE predicates before any fold." },
    { slug: "not-boring-movies", why: "The match queue is a filtered, ordered pull — edge cases and all. This problem drills the WHERE-plus-ORDER BY discipline the desk runs hourly." },
    { slug: "find-the-team-size", why: "Lines per ticket is basket depth — 2.44 on this book. COUNT OVER keeps every ticket row visible; the same window the shelf review uses for attach context." },
    { slug: "rank-scores", why: "The member ladder ties four ways at 4 tickets. RANK with gaps versus DENSE_RANK without is a publishing policy, and this problem makes you pick one and defend it." },
    { slug: "keep-latest-dedupe", why: "The shelf price history is append-only — the as-of match read needs the latest row per SKU. ROW_NUMBER dedupe is exactly the shape the match ruling stands on." },
    { slug: "group-sold-products-by-the-date", why: "One-cell SKU lists per promo day are the catalog print merchandising screenshots. GROUP_CONCAT with its ordering and separator traps, at db scale." },
    { slug: "ar-aging-schedule", why: "The financing book ages — 6 never-collected statements worth 15,217.00 need buckets, not vibes. The AR aging pivot is the dunning queue's backbone." },
    { slug: "settlement-fails-aging", why: "Legs that never landed are the phantom hunt in miniature — T-plus aging over the tender rails. The drill behind the refund desk's weekly sweep." },
    { slug: "vintage-default-curves", why: "My Best Buy financing is judged by vintage — statements by issue month, settled versus carried. Cohort curves over the 28-statement book, exactly this shape." },
    { slug: "suspicious-bank-account-transactions", why: "Tender-rail fraud is a sliding-window read — bursts of legs inside a short span. The drill behind the fraud spot-check before a statement gets flagged." },
    { slug: "unique-orders-and-customers-per-month", why: "The spine is tickets AND members per month — 103 orders over 16 accounts across 14 buckets. Two DISTINCT folds, one table pair, exactly this drill." },
    { slug: "employees-with-missing-information", why: "The whitespace read with fallbacks — members LEFT JOINed to tickets with COALESCE'd payload columns. On this db the anti-join is a confident zero; the drill is proving it without breaking the report." },
    { slug: "null-blank-audit", why: "The pre-close hygiene sweep — a NULL-and-blank census across the columns the close reads. A cheap query, and the habit that keeps 181,080 against 181,080 honest." },
  ],
};
