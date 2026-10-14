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
    "Preparation strategy: the pools file carries no Kroger section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: trip-fate funnels, two-grain censuses, own-brand versus national-brand shelf folds, loyalty ladders with honest ties, and cents-safe settlement math. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:national-brand bench census} merchandising brings into every Our Brands negotiation, the other rebuilds the {sky:Plus Card value ladder} the loyalty board ranks households by every quarter. The bar to clear: *state the definition and the denominator before you compute anything* — then make every trip-fate census reconcile to 103 by construction.",
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
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "funnel-step-conversion"],
    },
    {
      name: "Two-grain market censuses",
      why: "Trips and households are different grains of the same join, and every census here reports both: the EU bucket runs 45 trips from 8 households while the US bucket runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Baskets joined to households",
      why: "Households carry region and sign-up date; trips inherit them through joins, and the join type decides who survives. A trip without a household is corruption; a household without trips is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Plus Card value ladders",
      why: "Loyalty tiers are rank-window reporting where ties are guaranteed — four households sit at 4 trips each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about who shares the fuel-point multiplier, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Shelf price bands with CASE",
      why: "Shelf tiers are CASE-classified — budget, mid, premium — with fixed edges the tag prints. The arms must be exhaustive and ordered, and the premium band is EMPTY on this db (max shelf price 199.99): proving a band is empty honestly is exactly the discipline the CASE exercise grades.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "The dispatch clock",
      why: "Pickup promises are latency math: `julianday(shipped_at) - julianday(created_at)` over the 82 stamped trips, averaging 2.98 days with a 2–4 spread. The population definition ships with the number — the 14 still-being-picked trips have no clock yet and must not dilute the average.",
      slugs: ["average-time-of-process-per-machine", "users-that-actively-request-confirmation-messages", "find-golden-hour-customers"],
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
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Cents-safe settlement math",
      why: "Claimed is not settled — the vendor book (28 statements, 27 tender legs, INTEGER cents) is where the shelf world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/never coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
