// Mercado Libre — Wave-8 (Task 96), ecom domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Marketplace SQL: the storefront db read as LatAm commerce core — customers are
// registered buyers, orders are purchases (delivered = at the door, shipped = in
// transit with shipped_at as the Mercado Envios dispatch stamp, pending = awaiting
// dispatch, cancelled = dropped before the truck), order_items are cart lines
// (quantity = units, unit_price = line price), products are listings, suppliers are
// official stores, and invoices/payments are the Mercado Pago billing book in
// INTEGER cents. Dispatch funnels with stated populations, two-grain buyer
// censuses, tie-heavy best-seller ladders, the 14-month purchase spine, classic vs
// premium price bands, and the Pago coverage split that sits under "collected".
// Pool provenance: company-pools.md carries NO Mercado Libre section — 0 tagged
// rows — so all 10 topic slug sets and all 32 problems are theme-curated from the
// pools file's theme menu and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12); every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const mercadolibreKit: CompanyKit = {
  id: "mercadolibre",
  domainId: "ecom",
  name: "Mercado Libre",
  tagline: "Latin America's commerce ecosystem, listing to logistics",
  accent: "text-yellow-300",

  brief: [
    "**Mercado Libre** is Latin America's largest commerce ecosystem — a marketplace where listings and catalogs meet Mercado Envios fulfillment and Mercado Pago checkout in one stack, from São Paulo to Mexico City. Every analyst here learns that *'carted' and 'kept' are different numbers*: demand drops between checkout and doorstep, and the whole org reads the same small set of objects at different grains. This kit maps the storefront db onto that world: the 16 customers rows are registered buyers, the 103 orders are purchases worth **34,833.28**, and the 251 order_items rows are cart lines — quantity = units, unit_price = line price. The status map is fixed: delivered = {emerald:at the door} (52, 50.5%), shipped = in transit (30, 29.1%), pending = awaiting dispatch (14), cancelled = {rose:dropped} (7, 6.8%).",
    "The data org splits into marketplace growth, logistics (Envios) and a payments-analytics pod, and they read one spine at different grains. The dispatch funnel is the heartbeat: a purchase books at created_at, and `shipped_at` is stamped the day the truck actually leaves — **82 of 103 purchases** carry the stamp, averaging **2.98 days** to dispatch with a 2–4 day spread, while the 14 pending rows have none yet (a population definition, not a cleanup job). Money sits one layer down in the Pago book: invoices and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of GMV comes from buyers whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost buyer moves a quarter.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain buyer census** — EU runs 45 purchases from just 8 buyers while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'does a cancelled purchase count in your base?'* — LATAM's cancellation share is 0.0% against APAC's 8.1%), then into the best-seller ladder where three listings sit tied at 30 units and rank semantics become a catalog-policy decision. Regional flavor matters here: LATAM is the micro-market — 2 purchases, 1 buyer, a platform-high **426.22** average order — and interviewers love asking why small-sample rates deserve suspicion. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Mercado Libre section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: dispatch funnels, two-grain censuses, tie-heavy ladders, CASE price bands and the cents-safe Pago spine. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: the {emerald:official-store revenue census} the commerce team opens every quarter review with, the {sky:best-seller ladder} the growth board ships every month, the band-edge census, the restock floor huddle, the GMV month walk and the corridor dispatch census. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:40 —** The day starts with the dispatch funnel refresh. A marketplace analyst opens the Envios dashboard before standup: did overnight purchases land, did any order get a `shipped_at` stamp without a carrier assignment, does the one-pass status census reconcile — 52 delivered + 30 shipped + 14 pending + 7 dropped = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If dispatch latency drifts off the **2.98-day** norm — or a hot listing like Smart Watch S burns down to 17 units of remaining stock — the fulfillment queue gets pulled before marketing's weekly read ships.",
    "**11:30 —** Midday is the two-sided read. The commerce team wants the official-store census — Nordic Gadgets AB's **11,130.25** against Pacific Textiles' 2,980.15 — beside store ratings, because a 3.9-rated store carrying a third of a category is a conversation; the growth pod wants the category crowns reconciled ({amber:Audio} owns revenue at 11,744.01 while {sky:Accessories} owns units at 121) and the concentration re-cut, 63.5% of GMV from 3,000-plus buyers; the LATAM lead wants São Paulo's 426.22 average order defended as signal, not noise. Each ask is a join, a conditional aggregate and one judgment call about grain. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The Pago AR anti-join refreshes first — **6 never-collected invoices worth 15,217** — before dunning sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the collections draft; and the anomaly list gets walked line by line: a void-but-paid invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "GMV", what: "Booked purchase value across the marketplace: 34,833.28 across 103 purchases, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 cart outweighs the smallest 42 combined." },
    { name: "Dispatch rate", what: "Purchases with shipped_at stamped ÷ all purchases booked: 82 of 103 (79.6%). The top-of-funnel number Envios reads every Monday — the 14 pending rows are 'not yet', never a silent zero." },
    { name: "Time-to-dispatch", what: "Booking to truck-out (created_at → shipped_at) over dispatched purchases only: 2.98-day average, range 2–4, sliced by region — APAC 2.93, EU 2.94, US 3.07, LATAM 3.5. The population definition ships with the number." },
    { name: "Orders kept rate", what: "Delivered ÷ ALL purchases booked: 52 of 103 (50.5%). 'Kept' is a status-filtered conditional count, and the denominator — in-transit and pending included — is the whole interview." },
    { name: "Cancellation share", what: "Cancelled share of booked purchases by region: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0.0%. The regional map that drives the checkout-fraud and address-quality workstreams — and a 100.0-before-the-division trap in SQL form." },
    { name: "Buyer concentration", what: "Share of GMV from buyers spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs the key-account pod and sizes the loyalty bet — one lost buyer moves a quarter." },
    { name: "Official-store mix", what: "Revenue share by official store: Nordic Gadgets AB 32%, Midwest Hardware Co 26.7%, down to Pacific Textiles 8.6%. Store counts run 2–3 listings each, so mix is a catalog-depth story, not a breadth one." },
    { name: "Collections coverage", what: "Purchased versus collected in the Pago book: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the payments pod refreshes every close." },
  ],

  topics: [
    {
      name: "Dispatch funnel counts",
      why: "Mercado Envios is the operation's spine: a purchase books at created_at and earns its dispatch stamp at shipped_at — 82 of 103 stamped, 14 pending without one. Every funnel read is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-transit purchase delivered — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "funnel-step-conversion", "immediate-food-delivery-ii", "same-day-sale", "find-the-team-size", "repeat-purchase-rate", "fix-names-in-a-table"],
    },
    {
      name: "Two-grain buyer censuses",
      why: "Purchases and buyers are different grains of the same join, and every census here reports both: EU runs 45 purchases from 8 buyers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "customer-order-frequency"],
    },
    {
      name: "Joining listings to carts",
      why: "The catalog spine runs official stores → listings → cart lines → purchases, and the join type decides who survives. A cart line without a listing is corruption; a listing without a cart line would be dead stock — though on this db the anti-join returns a confident zero, and proving it is part of the job. Line-grain revenue (unit_price × quantity) versus header-grain totals is the second trap: fold the wrong grain and GMV drifts.",
      slugs: ["product-sales-analysis-ii", "students-and-examinations", "average-selling-price", "recyclable-and-low-fat-products", "warehouse-manager", "weeks-of-supply", "product-sales-analysis-i"],
    },
    {
      name: "Best-seller leaderboards",
      why: "The catalog team ranks listings by units moved and the ladder is tie-heavy — two listings at 36 units, three at 30, three more at 21 — while the buyer board has four buyers tied at 4 purchases each. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer listings, not syntax.",
      slugs: ["rank-scores", "top-earners", "most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "the-most-recent-three-orders", "basket-depth-aov"],
    },
    {
      name: "Price-band CASE tiers",
      why: "Listings band into classic and premium brackets with fixed edges the category page publishes — 8 classic listings averaging 32.06, 8 mid-band at 111.5, and the 200-plus premium band is EMPTY on this snapshot with the top listing at 199.99. Proving a band is empty is as important as filling one: the CASE arms must be exhaustive and ordered, because a hole in the arms is a hole in the forecast.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "calculate-product-final-price", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month purchase spine (2024-01 to 2025-02) is the growth call's home turf: the book opens at 3,731.97 and troughs at 1,193.86 in July 2024. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate", "restaurant-growth", "combine-two-tables", "employee-bonus", "fix-product-name-format", "null-blank-audit"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — dispatched under cancelled, this quarter beside last — and EXCEPT answers 'which listings never sold' (a confident zero here, since all 16 moved). UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-buyer purchase counts, then judge them against a computed platform mean. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "users-with-two-purchases-within-seven-days", "customers-with-strictly-increasing-purchases", "group-sold-products-by-the-date"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board needs delivered, shipped, pending and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "friday-purchases-i", "sales-analysis-iii"],
    },
    {
      name: "Pago billing & cents discipline",
      why: "Purchased is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the marketplace meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "duplicate-charge-pairs"],
    },
  ],

  theory: [
    {
      id: "mercadolibre-t1",
      q: "Your purchase report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a purchase column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A GMV report joins purchases to buyers: a purchase with no buyer row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A coverage report must be LEFT from buyers: the buyers with no purchases ARE the answer, arriving with NULL purchase columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload buyer row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-purchasing buyers, and proving that zero is itself the analyst's job: all 16 buyers appear in the purchase table somewhere. And once you chain one table deeper — official stores to listings to cart lines — COUNT(*) counts cart lines, not purchases; the grain fan-out from 103 to 251 is the follow-up the panel is listening for.",
      tag: "joins",
    },
    {
      id: "mercadolibre-t2",
      q: "The best-seller ladder has three listings tied at 30 units and two at 36. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied units the same rank and skips — on this db the ladder runs 47, 46, 38, then the two-way 36 tie consuming ranks 4 and 5, 33 on rank 6, 31 on rank 7, then the three-way 30 tie on ranks 8 through 10. DENSE_RANK shares rungs without gaps — the 30-tie reads 8, 8, 8 and the next distinct count lands on 9. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which listing's owner gets the merchandising slot. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer listings (RANK or DENSE_RANK), or an explicitly named tie-breaker like category then name — and writing it in the query comment. The catalog page publishes one of these policies; the SQL must match it.",
      tag: "windows",
    },
    {
      id: "mercadolibre-t3",
      q: "The census shows 103 purchases and 16 buyers; EU shows 45 purchases and 8 buyers. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts purchase rows after the join — one row per purchase, so a buyer with 24 purchases contributes 24. COUNT(DISTINCT customer_id) folds those rows back to buyers — EU's 45 purchases collapse to 8 buyers. Neither is wrong: purchases measure load and demand momentum, buyers measure installed base and reach. The regional pairing is the read the business actually makes: EU's 45-from-8 is a broad market, the US's 19-from-2 is a concentrated one, and LATAM's 2 purchases from a single São Paulo buyer — at a platform-high 426.22 average order — is a micro-market whose rates deserve a sample-size disclaimer before they drive anything. The trap that catches candidates is a third grain: join order_items for cart lines and COUNT(*) silently counts lines, not purchases — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "mercadolibre-t4",
      q: "shipped_at is NULL until the truck leaves. What is your policy for the time-to-dispatch report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched purchases have a latency, so the report measures booking-to-truck-out for the 82 of 103 purchases that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL purchases returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the dispatched subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for orders that have not left the warehouse, and it poisons the regional cut where LATAM's honest 3.5-day read already rests on just 2 purchases. A report whose WHERE clause is doing definitional work without saying so is exactly what an Envios reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "mercadolibre-t5",
      q: "The commerce review wants booked GMV per official store for stores carrying at least some revenue floor. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. A row-level fact — say 'exclude test purchases' or a status rule — discards rows before any fold and belongs in WHERE; putting it in HAVING is impossible because the row no longer exists once groups form. A group-level fact — the store revenue floor — is HAVING after GROUP BY, because the fold does not exist until groups do: on this db a 5,000 floor keeps Nordic Gadgets AB (11,130.25) and Midwest Hardware Co (9,294.93) and drops Alpine Audio GmbH's 4,765.63 on the next breath. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a store census and an error, and between a threshold applied to purchases versus to pesos. And the ratio version carries its own trap: a cancellation share built as integer SUM over COUNT truncates toward zero — the 100.0 goes BEFORE the division, or APAC's 8.1% prints as a flat 8 and the regional map stops being worth the slide.",
      tag: "pipeline",
    },
    {
      id: "mercadolibre-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 purchases always produce a mean (338.19 here), and the above-average cut is exactly how the platform separates the big carts from the 25.47 floor. On filtered staging tables — one region, one month, one status — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each purchase to ITS buyer's average) re-runs per outer row and answers a different question: Alice Chen's 24-purchase book makes her own baseline high, while a 2-purchase buyer gets judged against almost nothing — per-entity averages are a different business claim, at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "mercadolibre-t7",
      q: "The purchase trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when LatAm demand lands (orders on this db run through 2025-02-27, with dispatch stamps into March). The LAG: on a month-ordered spine the first row's prior value is NULL, so January's delta is NULL by definition — the book opens at 3,731.97 and that is the baseline, not a zero to be coalesced away. Then the walk reads like the business: the 1,193.86 July trough, the recovery after, each step rounded to cents. Date discipline is growth discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "mercadolibre-t8",
      q: "Pago says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The middle ground matters too: invoice #25 is open with 4,000 settled against 6,148 — partial coverage the exact/partial/none split (21 / 1 / 6) must catch in one CASE. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "mercadolibre-t9",
      q: "Before any marketplace census, the panel asks: 'one row per what?' Walk me through how you decide the GROUP BY grain.",
      a: "The grain is the business deliverable, and the GROUP BY clause is just its SQL spelling. A buyer census folds purchases to people: GROUP BY customer_id turns 103 purchases into 16 buyers, and every selected column must be either the grouping key or an aggregate — anything else is a coin flip. The classic three-grain ladder on this schema: 103 purchases → 251 cart lines → 7 categories, and the panel watches which rung you name before you write. The two habits that pass: say the grain out loud first ('this report is one row per buyer'), and refuse the SQLite laxness where a bare non-grouped column silently prints an arbitrary row's value — on another engine it is an error, and on this one it is a quietly wrong number that renders fine on the slide.",
      tag: "groupby",
    },
    {
      id: "mercadolibre-t10",
      q: "When do you reach for a window function instead of GROUP BY — give me the marketplace case where the distinction matters.",
      a: "When the deliverable needs the fold BESIDE the rows instead of instead of them. The fulfillment pack is the canonical case here: every cart line must carry its purchase's cart depth, so COUNT(*) OVER (PARTITION BY order_id) computes the per-purchase fold and attaches it — 251 lines out, each stamped with its cart's line count. GROUP BY would collapse to 103 rows and destroy the line detail the pack sorts by. Same muscle in the commerce review: every listing row can carry its official store's booked GMV as SUM(value) OVER (PARTITION BY store), so the analyst sees each listing against its store's whole book without a join-back. The rule I say out loud: GROUP BY when the stakeholder wants the summary, windows when they want the rows with context.",
      tag: "windows",
    },
    {
      id: "mercadolibre-t11",
      q: "Build me the status census in one pass — and tell me why the branches can never disagree with each other.",
      a: "One scan, four branches, one denominator. Either COUNT(*) FILTER (WHERE status = 'delivered') per branch — SQLite's standard-syntax form — or the portable twin SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END). Both print 52 kept, 30 in-transit, 14 awaiting, 7 dropped from the same 103 rows, and the identity 52 + 30 + 14 + 7 = 103 holds by construction because the branches partition the same rows: every row lands in exactly one arm. The zero bucket matters too — ELSE 0 keeps a branch honest when a status is empty, instead of letting it vanish and shrinking the row. Four sequential queries are four separate scans with four separate WHERE clauses, and the drift between them is a bug the board screenshot exposes in front of the room.",
      tag: "case-when",
    },
    {
      id: "mercadolibre-t12",
      q: "UNION ALL or UNION for the close packet's stacked report — and when does EXCEPT answer a marketplace question better than any join?",
      a: "UNION ALL when the branches are logically disjoint — this quarter's bookings beside last quarter's, official-store rows above the TOTAL row — because it concatenates without a distinct pass. UNION is a business decision, not hygiene: its dedupe silently deletes rows, and if a 'duplicate' ever appears it is a data incident you want on the incident list, not buried in the operator. EXCEPT is the coverage diff: 'which listings never moved a unit' is SELECT id FROM products EXCEPT SELECT product_id FROM order_items, and on this snapshot it returns a confident zero — all 16 listings sold — which is itself a certified fact. One discipline note: set operators dedupe both inputs first, so if the anomaly you are hunting IS a duplicate row, the row-honest tool is the LEFT JOIN + IS NULL anti-join, not EXCEPT.",
      tag: "set-ops",
    },
    {
      id: "mercadolibre-t13",
      q: "The monthly walk stages a CTE before it reads LAG. Why stage at all — what does the CTE buy that a flat query doesn't?",
      a: "Three concrete buys on this exact shape. Correctness: window functions evaluate in the SELECT stage, so the month fold must exist before LAG can walk it — WITH monthly AS (SELECT STRFTIME('%Y-%m', created_at) AS month, SUM(total) AS gmv … GROUP BY month) is the staging layer that makes the window legal. Reuse: the same monthly CTE feeds the walk, the quarter cuts and the trough narrative without re-writing the fold. Auditability: a named CTE is a definition the reviewer can point at — 'monthly means bookings folded by STRFTIME month key, 14 buckets' — which is how numbers survive the growth-review argument. The habit that comes with it: filter early inside each CTE (status, region, date ranges) so later stages carry fewer rows, and SELECT from the CTE while debugging instead of guessing at the fold.",
      tag: "ctes",
    },
    {
      id: "mercadolibre-t14",
      q: "Define the dispatch rate for me — and defend every row you left in the denominator.",
      a: "Dispatch rate = purchases with a shipped_at stamp ÷ ALL purchases booked: 82 of 103, 79.6%. The defense is the population list: the 14 pending rows stay because 'not yet dispatched' is exactly what the metric watches — deleting them turns the funnel into a status census; the 7 cancelled stay because a dropped purchase is a dispatch failure the rate should feel; the 30 in-transit stay because the stamp is truck-out, not door-step. The interview move is saying the denominator BEFORE the SQL: 'all 103 booked, no status filter, because the metric is top-of-funnel'. The cousin metrics prove the discipline scales: orders-kept rate uses the same denominator with a delivered numerator (52, 50.5%), while time-to-dispatch (2.98 days) uses the OPPOSITE rule — only dispatched purchases, because an undispatched purchase has no latency yet, and a NULL is 'not yet', never a zero.",
      tag: "metrics",
    },
    {
      id: "mercadolibre-t15",
      q: "Mercado Pago's tables store money as INTEGER cents. Where do the bugs bite, and what is your rounding policy?",
      a: "Three bite points and one policy. Scale: a 19,609-cent invoice is 196.09, and amount_cents / 100 is integer division — 196 flat; the .0 (or a CAST) goes in BEFORE the division, every time. Aggregation: SUM in cents stays exact — 2,541,600 cents of expenses — and the division to dollars happens once at the presentation edge, not per row mid-pipeline where rounding discards precision a later SUM still needed. Comparison: floats are IEEE doubles, so money comparisons either stay in integer cents or use a tolerance. The policy I state in reviews: aggregate in cents, convert once, round at the edge — and prove it on the trial balance, which closes at 181,080 against 181,080, delta zero. A ledger that reconciles to the cent is only possible because nothing was rounded away en route.",
      tag: "numbers",
    },
    {
      id: "mercadolibre-t16",
      q: "The dispatch-latency report went from instant to slow after a 'small' filter change. What do you check first?",
      a: "Sargability first: did the filter wrap the timestamp column in a function? SUBSTR(created_at, 1, 7) = '2024-03' forces a scan of every row; the sargable twin is the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01' — same rows, index-usable. Then the pipeline: filters pushed early into each CTE mean later stages fold fewer rows, and SELECT * payloads you never read stop crossing the wire. The honesty check for this schema: it is small — 103 orders, 251 lines — so these are habits, not firefights; the point interviewers probe is whether the instincts scale when the marketplace does, which is why the answer names the mechanism (function on column kills index use) rather than 'we optimized it'. Probe with LIMIT before the full run; aggregate on the smallest table that answers the question instead of joining first and filtering after.",
      tag: "performance",
    },
    {
      id: "mercadolibre-t17",
      q: "A GMV SUM roughly doubles after orders joins order_items. Walk me through the diagnosis and the fix.",
      a: "Diagnose by counts before touching the SUM: orders alone is 103; the join is 251 — the jump IS the fan-out, one row per cart line. Confirm the multiplier with GROUP BY o.id HAVING COUNT(*) > 1 to see which purchases carry multiple lines, because the inflation is uneven: a single-line purchase survives, a six-line cart repeats its total six times. The fix depends on the grain the stakeholder bought: order-grain GMV pre-aggregates the lines (SUM(unit_price × quantity) GROUP BY order_id in a CTE, then join) so the header total is added exactly once; line-grain analysis keeps the join but counts entities with COUNT(DISTINCT o.id) and never sums the header column. The trap to name out loud: it is not 'a rounding thing' or 'duplicate data' — it is the grain, and the before/after count is the receipt you bring to the review.",
      tag: "joins",
    },
    {
      id: "mercadolibre-t18",
      q: "IN, EXISTS, or a derived table — how do you pick when filtering purchases against a computed buyer set?",
      a: "Start with what the set IS. A small static-ish list — the 4.5-plus official stores — reads as IN (subquery over suppliers). An existence probe — 'has at least one delivered purchase' — is EXISTS, which short-circuits on the first match and never trips on NULLs; its anti-form NOT EXISTS is the NULL-safe dunning shape, because NOT IN over a list containing one NULL returns nothing at all. A computed aggregate set — buyers with 2+ purchases, the repeat-buyer definition — must be a derived table or CTE, because the fold (GROUP BY + HAVING) cannot live inside an IN list, and the outer query needs to join to it at customer grain. The reasoning the panel wants: EXISTS for presence, IN for membership against stable sets, derived tables when the filter itself is an aggregation — and the NULL behavior of each, stated before the db proves it the hard way.",
      tag: "subqueries",
    },
    {
      id: "mercadolibre-t19",
      q: "Build the 14-month purchase spine, cut a quarter without losing its last night, and read the first row of the LAG walk.",
      a: "The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month — gives 14 buckets from 2024-01 to 2025-02; '%m' alone would merge January 2024 into January 2025 and the trend becomes fiction. The quarter cut: half-open intervals, created_at >= '2024-01-01' AND created_at < '2024-04-01', because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings — and quarter-end is exactly when LatAm demand lands. The walk: LAG(gmv) OVER (ORDER BY month) puts the prior bucket beside the current one, and the first row's prior value is NULL by definition — the book OPENS at 3,731.97, that is the baseline, and coalescing it to zero would print a fake +100% jump. Then the narrative reads itself: the 1,193.86 July trough, the +1,158.21 recovery into August, each delta rounded to cents.",
      tag: "dates",
    },
    {
      id: "mercadolibre-t20",
      q: "How do NULLs behave in GROUP BY buckets, join keys and conditional counts — and what is your display policy for the dispatch funnel?",
      a: "Three behaviors, three policies. In GROUP BY, SQL groups NULLs together — a NULL category becomes its own bucket, which is why the category census must either filter NULLs out with a stated reason or label the bucket instead of letting it print as an unnamed row. In join keys, NULL never matches anything: a purchase with NULL customer_id would vanish from an INNER JOIN and survive a LEFT JOIN only on the left — worth an integrity check, not a silent join choice. In conditional counts, the trap is shape-dependent: COUNT(status) skips NULLs, COUNT(*) keeps the row, and SUM over NULL latency silently shrinks the population while the average still prints — 2.98 days over 82, not 103. Display policy for the funnel: pending stays 'pending' (a state, not a NULL to fix), shipped_at stays NULL until the truck leaves, and COALESCE is for PRESENTATION — a zero in a display cell, never fed back into the averages.",
      tag: "nulls",
    },
    {
      id: "mercadolibre-t21",
      q: "Which indexes would you actually add on this schema, and what makes a predicate able to use one?",
      a: "Sargable first: an index helps when the predicate compares the bare column to a value — status = 'pending', created_at >= '2024-03-01', customer_id = 7. Wrap the column in a function (SUBSTR, julianday arithmetic) and the index is dead: every row gets scanned. On this schema the honest shortlist is the FK join keys (order_items.order_id, order_items.product_id — the joins run on every census), the status column for the morning funnel scan, and created_at for the month-spine cuts; a composite (status, created_at) covers the funnel's filtered walks. The maturity signal is the honesty about scale: 16 products and 103 orders do not NEED indexes, and saying so — 'I would add these when the marketplace outgrows the sandbox, and here is the measurement I would run first (EXPLAIN QUERY PLAN before/after)' — is the answer that lands, because premature indexing is a write-cost someone else pays.",
      tag: "indexes",
    },
    {
      id: "mercadolibre-t22",
      q: "Buyer names arrive from an app export title-case-broken — 'bruno silva' and 'Bruno Silva' are one person. What is the hygiene pass, and where does it live?",
      a: "Detect the split first, because that is the business damage: GROUP BY the name and HAVING COUNT(*) > 1 on a buyer-dimension fold, or match on the email where the case is stable. Then normalize in a staged layer, not inline everywhere: TRIM the whitespace, UPPER/LOWER with an INITCAP-style expression (UPPER(SUBSTR(name,1,1)) || LOWER(SUBSTR(name,2))) for display, and fold the joins onto a canonical key — the id or the lowercased email — so 'bruno silva' and 'Bruno Silva' can never split a buyer's purchase history across two rows. Where it lives matters as much as the functions: one hygiene CTE at the top of the pipeline, so every downstream fold sees the canonical form, versus fifteen scattered UPPER() calls that drift apart by next quarter. The follow-up the panel loves: names are for humans, keys are for joins — normalize the display, dedupe on the key.",
      tag: "casing",
    },
    {
      id: "mercadolibre-t23",
      q: "Why is an average of averages wrong, and what do you compute instead on this marketplace?",
      a: "Because it weights every group equally regardless of size. The corridor AOVs are EU 335.32 (45 purchases), APAC 313.66 (37), US 383.48 (19), LATAM 426.22 (2) — averaging the four prints 364.67, which describes a marketplace where LATAM's two orders matter as much as EU's forty-five. The true all-purchases AOV is SUM(total)/COUNT(*) over the base rows: 338.19, where the micro-market barely registers. The honest alternatives: re-aggregate from the base (sum the numerators, divide by the summed denominators), or the explicit weighted blend SUM(aov * orders)/SUM(orders) — the same arithmetic one level up. The interview move is naming WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and that is a claim you should have to defend, not assume — especially when the slide exists to argue LATAM's 426.22 is signal.",
      tag: "metrics",
    },
    {
      id: "mercadolibre-t24",
      q: "ROWS or RANGE for the moving average on the daily GMV spine — where does the choice decide the number?",
      a: "When the ORDER BY key has ties or gaps. RANGE (the default when you write ORDER BY with no frame) includes PEERS: two purchases sharing a created_at second enter the running total together — the cumulative 'jumps two purchases at once'; ROWS walks strictly row by row. The subtler bite is gaps: on the daily spine, ROWS BETWEEN 6 PRECEDING AND CURRENT ROW reaches back 6 ROWS — if three days had no bookings, that is 9+ calendar days — so the '7-day' average is quietly wrong. The professional build stages a calendar spine (every date, zero-filled via a LEFT JOIN from a dates CTE), and then the ROWS frame and the calendar agree; RANGE with date-interval arithmetic is the alternative where supported. The complete answer names the data shape first — ties at purchase grain, gaps on the daily spine, neither on the month spine — because the right frame is a property of the axis, not a style preference.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "mercadolibre-mcq-1",
      prompt: "A purchase row's status reads 'shipped'. In this kit's Envios stage map, what happened?",
      choices: ["Dispatched — the truck left, delivery not yet confirmed", "Delivered — the buyer signed", "Dropped — cancelled before dispatch", "Awaiting dispatch — queued in the fulfillment center"],
      answer: 0,
      why: "The stage map is fixed: shipped = dispatched with the shipped_at stamp, in transit (30 of 103 purchases). It is one step before delivered (52) and one after pending (14).",
      notes: [
        { choice: 1, why: "Delivered is a separate status — 52 purchases where the door step confirmed. Folding shipped into delivered inflates the kept rate before the parcel arrives." },
        { choice: 3, why: "Awaiting-dispatch is 'pending' — 14 purchases with no shipped_at yet. Pending is not in transit and not kept; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-2",
      prompt: "Dispatch rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 dispatched, 14 pending and 7 cancelled of 103 booked.",
      choices: ["Dispatched + cancelled only (82/89)", "All purchases booked (82/103 = 79.6%)", "Delivered purchases only (52/82)", "Distinct buyers (82/16)"],
      answer: 1,
      why: "The house definition: dispatched ÷ ALL purchases booked — pending rows stay in the denominator because 'not yet dispatched' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate by deleting the population still in the fulfillment queue — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is door confirmation, shipped_at is truck-out. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-3",
      prompt: "EU carries 45 purchases from 8 buyers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts purchase rows (45); COUNT(DISTINCT customer_id) folds repeats back to buyers (8). The gap between them is the intensity read the census exists to expose.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every purchase has a buyer. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not buyers — a third grain nobody asked for. The census is purchases AND people." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled purchases only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancellation share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1% and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the cancellation map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-5",
      prompt: "Keep only official stores whose booked GMV crosses 5,000. Where does the threshold live?",
      choices: ["WHERE SUM(...) >= 5000, before GROUP BY", "GROUP BY store HAVING SUM(...) >= 5000", "WHERE gmv >= 5000 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A revenue floor is a group-level fact: the fold must exist before it can be judged, so HAVING follows GROUP BY. On this db it keeps Nordic (11,130.25) and Midwest (9,294.93) and drops Alpine's 4,765.63.",
      notes: [
        { choice: 0, why: "SUM does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'gmv' column on the raw tables — booked GMV only materializes as SUM(unit_price * quantity) at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-6",
      prompt: "The units ladder runs 47, 46, 38, 36, 36, 33, 31, then THREE listings tied at 30. Under RANK, what rank does the next listing below the tie (28 units) carry?",
      choices: ["9", "11", "10", "8"],
      answer: 1,
      why: "RANK shares rungs and then skips: the three-way 30 tie consumes ranks 8, 9 and 10, so the next distinct count (28) lands on 11. All three tied listings share rank 8.",
      notes: [
        { choice: 0, why: "9 is the DENSE_RANK answer's neighbor — with DENSE_RANK the tie reads 8, 8, 8 and the next distinct count is 9. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "10 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic ladder bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-7",
      prompt: "An open invoice in the Pago book holds 19,609 INTEGER cents. Which expression prints the dollar figure 196.09?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100)", "amount_cents / 100.0", "CAST(amount_cents AS TEXT) || '.09'"],
      answer: 2,
      why: "INTEGER / 100 is integer division in SQLite — 19609/100 truncates to 196. The .0 promotes the division to real arithmetic and 196.09 prints exactly. The missing .0 is how cents leak on every odd-cent row.",
      notes: [
        { choice: 0, why: "19609 / 100 evaluates to 196 — the .09 is gone before any rounding could matter. Half the Pago book's odd-cent rows would print low." },
        { choice: 1, why: "ROUND arrives after the division: the inner 19609/100 already truncated to 196, so ROUND(196) is still 196. Order of operations, not decoration." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-8",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending purchases double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 purchases.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercadolibre-mcq-9",
      prompt: "A dunning extract lists buyers whose ids do NOT appear in a payments-staging pull, built with NOT IN (SELECT buyer_id FROM staging). It returns ZERO rows, and the staging pull is known to contain one row with a NULL buyer_id. Diagnosis?",
      choices: ["The zero is correct — every buyer appears in staging", "One NULL in the subquery poisons every NOT IN comparison — x NOT IN (… NULL …) is UNKNOWN, so every row silently drops", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and any comparison against NULL is UNKNOWN — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right on the clean core db — but staging extracts are exactly where NULLs sneak in, and an empty dunning list means nobody gets reminded to pay." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercadolibre-mcq-10",
      prompt: "A dashboard walks booked GMV purchase by purchase: SUM(total) OVER (ORDER BY created_at). Two purchases share a created_at second, and the cumulative 'jumps two purchases at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at purchase grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercadolibre-mcq-11",
      prompt: "The Envios morning manifest folds each dispatch day's basket into one cell — every product name that rode together, comma-separated. Which fold produces it?",
      choices: ["GROUP_CONCAT(p.name) over rows grouped by the dispatch day", "CONCAT(p.name) over the day's rows", "MAX(p.name) with GROUP BY the day", "STRING_AGG(p.name, ',') — the only aggregate that folds text"],
      answer: 0,
      why: "GROUP_CONCAT is SQLite's text fold: it concatenates a group's values into one cell, which is exactly the manifest shape. CONCAT is a row-level function (no fold), MAX returns a single arbitrary-ish extreme value, and STRING_AGG is Postgres vocabulary that does not exist here.",
      notes: [
        { choice: 1, why: "CONCAT joins two values within ONE row — it never folds a group. The manifest would need one row per product, which is the opposite of the ask." },
        { choice: 2, why: "MAX collapses the day to one product name — the manifest would claim every truck carried a single SKU." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-12",
      prompt: "order_items fans 103 purchases into 251 cart lines. After `FROM orders o JOIN order_items ii ON ii.order_id = o.id`, which expression returns the PURCHASE count?",
      choices: ["COUNT(*)", "COUNT(DISTINCT o.id)", "COUNT(ii.id)", "COUNT(DISTINCT ii.product_id)"],
      answer: 1,
      why: "The join fanned the grain out to cart lines, so COUNT(*) counts 251. COUNT(DISTINCT o.id) folds the fan-out back to purchases: 103. Choosing between them IS choosing your grain — the census either measures load (lines) or demand (purchases), and the column name must match the choice.",
      notes: [
        { choice: 2, why: "COUNT(ii.id) counts the same 251 lines — the fan-out is the whole problem, and ii.id never repeats so DISTINCT would change nothing." },
        { choice: 3, why: "COUNT(DISTINCT ii.product_id) counts distinct listings that sold — 16, a third grain nobody asked for. SKU reach is not purchase count." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-13",
      prompt: "A colleague writes `CASE WHEN price < 200 THEN 'signature' WHEN price < 50 THEN 'classic' ELSE 'premium' END` over the catalog. What does it print for the 34.50 Wireless Mouse M3?",
      choices: ["'classic'", "'signature' — CASE arms evaluate top-down, and 34.50 passes the first arm", "'premium'", "NULL — no arm matches"],
      answer: 1,
      why: "CASE stops at the first TRUE arm, and 34.50 < 200 fires before the 50-line is ever tested — every classic listing re-bands as signature and the classic census silently empties. Band CASEs run their edges ascending: 50 first, then 200, ELSE premium.",
      notes: [
        { choice: 0, why: "That is the intent, but arm order beats intent. The engine never 'knows' the 50-line was meant to win." },
        { choice: 3, why: "ELSE is the catch-all — nothing falls through a CASE with an ELSE. Without one, unmatched rows would print NULL, which is a different (and honest) bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-14",
      prompt: "Catalog ops asks 'which listings never moved a unit?' You write `SELECT id FROM products EXCEPT SELECT product_id FROM order_items`. What comes back on this snapshot, and what does it certify?",
      choices: ["16 rows — EXCEPT cannot compare id with product_id", "Zero rows — a certified fact: every one of the 16 listings moved at least one unit", "The 6 official stores with no sales", "Only listings whose stock is zero"],
      answer: 1,
      why: "EXCEPT keeps left-side values that never appear on the right — the never-sold set. On this db the result is empty because all 16 listings appear in order_items somewhere; proving that zero with one query IS the catalog-hygiene read. Column names need not match — EXCEPT compares positions and compatible types.",
      notes: [
        { choice: 0, why: "The ids compare fine (both INTEGER). A 16-row answer would mean the join between listings and cart lines is broken — worth checking, not assumed." },
        { choice: 2, why: "Suppliers are not in this query at all — 'stores with no sales' is a different anti-join over a different grain. One question, one set." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-15",
      prompt: "The month spine uses STRFTIME('%Y-%m', created_at) — 14 buckets, 2024-01 through 2025-02. A colleague 'simplifies' it to STRFTIME('%m', created_at) and the trend still renders. What actually broke?",
      choices: ["Nothing — '%m' is the documented short form of the same key", "January 2024 and January 2025 fold into one '01' bucket — 14 months collapse to 12 and the trend merges two years", "The bucket labels lose their day component", "STRFTIME stops returning TEXT, so ORDER BY breaks"],
      answer: 2,
      why: "'%m' emits the month number alone: 2024-01 and 2025-01 both print '01'. The spine folds into 12 undated buckets where February 2025's reading inherits January 2024's baseline — a trend chart that renders and lies. The year must ride inside the key: '%Y-%m'.",
      notes: [
        { choice: 0, why: "It renders because the query is valid — that is the trap. Bucket correctness is a data question, not a syntax one." },
        { choice: 2, why: "There is no day component in '%Y-%m' either; the loss is the YEAR. Bucket labels must be unique at the grain the trend claims." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-16",
      prompt: "The ops board wants kept, in-transit, awaiting and dropped in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. Which shape keeps the branches from drifting?",
      choices: ["Four sequential queries pasted into the deck", "A correlated subquery re-counting per row", "LIMIT 4 with ORDER BY status", "COUNT(*) FILTER (WHERE status = …) per branch — one pass, one denominator"],
      answer: 3,
      why: "FILTER branches each aggregate over the same scan, so all four branches partition the same 103 rows and reconcile by construction — SUM(CASE …) is the portable twin. Four sequential queries are four chances for four WHERE clauses to disagree; the board screenshot is exactly where that drift surfaces.",
      notes: [
        { choice: 0, why: "The classic drift bug: someone edits one branch's filter, the other three go stale, and 52 + 30 + 14 + 7 no longer sums to 103." },
        { choice: 2, why: "LIMIT cuts ROWS, not columns — a census is not a top-N. This shape returns one row per status, not one row with four counts." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-17",
      prompt: "A pipeline retry double-ingested purchase rows. You dedupe with ROW_NUMBER() OVER (PARTITION BY external_ref ORDER BY ingested_at DESC) and keep rn = 1. What is the second ORDER BY key for?",
      choices: ["Nothing — timestamps cannot tie on retry batches", "A deterministic tie-breaker like id — otherwise which copy survives is engine luck", "The buyer's name, alphabetically", "ROW_NUMBER never ties, so ASC"],
      answer: 1,
      why: "ROW_NUMBER must hand out strict 1..n; when two copies share an ingested_at second, the engine picks arbitrarily — 'keep newest' silently becomes 'keep any', and the dedupe is not reproducible. A physical second key (id) makes the surviving row deterministic, which is what a reviewer rerunning the query needs.",
      notes: [
        { choice: 0, why: "Retries stamp identical timestamps constantly — that is what a retry is. The tie is the normal case, not the edge case." },
        { choice: 2, why: "Name is deterministic but semantically random — dedupe keys should be physical (id), not cosmetic (name), so the same row survives every run." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-18",
      prompt: "The Pago dunning list keeps invoices with no settlement rows. Two candidate shapes: `invoice_id NOT IN (SELECT invoice_id FROM payments)` and `invoices LEFT JOIN payments … WHERE p.id IS NULL`. Which is NULL-safe, and why?",
      choices: ["Both — NULLs are ignored in set comparisons either way", "NOT IN — it short-circuits on the first miss", "The LEFT JOIN + IS NULL anti-join: a NULL in the NOT IN list poisons every comparison, while the join simply never matches on NULL", "Neither — only UNION can compare sets"],
      answer: 2,
      why: "x NOT IN (…, NULL) is UNKNOWN for every outer row — one NULL invoice_id in the subquery empties the dunning list while the query looks valid. The LEFT JOIN anti-join never compares against the list at all: unmatched left rows survive with a NULL payload and p.id IS NULL selects them. NOT EXISTS is the other NULL-safe shape.",
      notes: [
        { choice: 0, why: "Three-valued logic says otherwise: comparison against NULL is UNKNOWN, and UNKNOWN rows fail WHERE. The empty dunning list is the symptom." },
        { choice: 1, why: "IN probes membership one value at a time; NOT IN materializes the list and compares every row against ALL of it — including the NULL that ruins everything." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-19",
      prompt: "Booked GMV reads 34,833.28 on orders alone, but the deck's version — orders joined to order_items — prints roughly 2.4x that. Diagnosis?",
      choices: ["The join fanned 103 purchases into 251 cart lines and SUM(o.total) repeated each purchase total once per line — pre-aggregate lines to order grain, then join", "Rounding accumulated across the join", "The status filter dropped delivered rows", "totals are stored as cents and got doubled on conversion"],
      answer: 0,
      why: "The 103 × items-per-order fan-out repeats each header total once per cart line; SUM over the joined rows counts them 251 times. The fix is grain discipline: fold order_items to order grain in a CTE first, or accept the line grain and stop summing the header column.",
      notes: [
        { choice: 1, why: "Rounding cannot produce 2.4x — it moves cents. A multiplier-shaped error is a fan-out; a cent-shaped error is arithmetic." },
        { choice: 3, why: "Cents conversion mistakes move numbers by 100x, not 2.4x — and the header total never went through a conversion here." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-20",
      prompt: "The fulfillment pack wants every cart line to carry its purchase's cart depth — without collapsing the line grain. Which expression does it?",
      choices: ["GROUP BY order_id with COUNT(*)", "COUNT(*) OVER (PARTITION BY order_id) beside each line", "COUNT(DISTINCT order_id) over the joined table", "A self-join of order_items to itself on order_id"],
      answer: 1,
      why: "A window aggregate computes the fold and ATTACHES it: 251 lines out, each stamped with its cart's line count. GROUP BY would collapse to 103 rows and destroy the line detail the pack sorts by; the window keeps the grain and adds the context column.",
      notes: [
        { choice: 0, why: "Collapses to one row per purchase — the pack can no longer sort by line. Different deliverable, same table." },
        { choice: 2, why: "COUNT(DISTINCT order_id) without PARTITION counts purchases globally (103) — a constant on every row, not a per-cart depth." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-21",
      prompt: "Escalation question: 'which buyers cleared 400 on EVERY purchase?' Which shape answers it directly?",
      choices: ["GROUP BY buyer HAVING MIN(total) > 400", "WHERE total > 400", "GROUP BY buyer HAVING AVG(total) > 400", "WHERE COUNT(total > 400) = COUNT(*)"],
      answer: 0,
      why: "MIN over a buyer's carts IS their weakest cart — every cart cleared 400 exactly when MIN(total) > 400. AVG passes the buyer with one 95-cart subsidized by a 900-cart; WHERE deletes the offending rows first and then judges the survivors, which is a different claim wearing the same words.",
      notes: [
        { choice: 1, why: "WHERE total > 400 answers 'which purchases cleared 400', not 'which buyers always did' — the buyer with nine big carts and one small one still prints." },
        { choice: 2, why: "The subsidy trap: (900 + 95) / 2 = 497.5 clears the bar while the 95-cart breaks the rule. MIN is the honest weakest-link aggregate." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercadolibre-mcq-22",
      prompt: "The daily GMV spine has gaps — 103 purchases scattered across 425 calendar days. Which build makes the 7-day moving average calendar-true?",
      choices: ["AVG(gmv) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) straight on the order rows", "AVG(gmv) OVER () — the frame ignores order anyway", "A calendar-spine CTE (every date, zero-filled) LEFT JOINed to the orders fold, THEN the ROWS frame over the filled spine", "ORDER BY day LIMIT 7"],
      answer: 2,
      why: "On a gapped spine, ROWS BETWEEN 6 PRECEDING reaches back 6 ROWS — possibly 60 calendar days — so the '7-day' average is fiction. The zero-filled spine makes every date a row, and then the ROWS frame and the calendar agree. Zero-filling is not cosmetics: a day with no bookings is 0 GMV, not a missing row.",
      notes: [
        { choice: 0, why: "This is the default mistake: the frame is syntactically fine and temporally wrong. Six rows back from a Tuesday might be three weeks of quiet." },
        { choice: 3, why: "LIMIT truncates the output to 7 rows — it computes no average at all. Frames define which rows an aggregate sees; LIMIT defines what prints." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercadolibre-mcq-23",
      prompt: "A slide averages the four corridor AOVs — 335.32 (EU), 313.66 (APAC), 383.48 (US), 426.22 (LATAM) — and prints 364.67. The platform AOV is 338.19. Why the gap?",
      choices: ["The corridor AOVs are stale", "An average of averages weights every corridor equally — LATAM's 2 purchases weigh as much as EU's 45; re-aggregate from the base rows", "338.19 is a median, not a mean", "The corridors use different currencies"],
      answer: 1,
      why: "364.67 describes a marketplace that does not exist: it gives LATAM's two orders the same weight as EU's forty-five. The honest number re-aggregates from the base — SUM(total)/COUNT(*) over all 103 purchases — or blends weights explicitly: SUM(aov * orders)/SUM(orders).",
      notes: [
        { choice: 2, why: "A median is a different statistic entirely — and 338.19 is the plain mean over the base rows. The gap is weighting, not statistic choice." },
        { choice: 3, why: "The book is single-currency. Tempting explanation, wrong diagnosis — the arithmetic error is in the average of averages." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercadolibre-mcq-24",
      prompt: "On the 14-month spine, a colleague swaps the running GMV's implicit RANGE frame for ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. What changes?",
      choices: ["Nothing — every month key is unique, so RANGE and ROWS accumulate identically here", "The running total doubles", "RANGE drops NULL months", "ROWS restarts the frame each year"],
      answer: 0,
      why: "The RANGE-vs-ROWS distinction only bites when the ORDER BY key has ties (peers enter the frame together). Month keys are unique — one row per bucket — so the two frames agree exactly, and the swap is cosmetic HERE. Knowing when the choice is benign is as testable as knowing when it isn't: purchase-grain walks with tied created_at seconds are where it bites.",
      notes: [
        { choice: 1, why: "Doubling is a fan-out symptom, not a frame symptom — no join was touched." },
        { choice: 3, why: "Frames never reset without PARTITION BY. Swapping RANGE for ROWS changes nothing structural." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercadolibre-mcq-25",
      prompt: "Every settled purchase row must carry its corridor's settled total AND its own share of it. Which pair does it without collapsing rows?",
      choices: ["GROUP BY region, then join the totals back", "SUM(total) OVER (PARTITION BY region) and 100.0 * total / SUM(total) OVER (PARTITION BY region)", "COUNT(*) OVER () and total / COUNT(*)", "MAX(total) OVER (PARTITION BY region) and total / MAX(total) OVER (PARTITION BY region)"],
      answer: 1,
      why: "The partition window computes the corridor fold once and exposes it on every row — the denominator the share needs is sitting right there, and 100.0 goes BEFORE the division so the share is real arithmetic. One pass, row grain preserved, no join-back.",
      notes: [
        { choice: 0, why: "Correct but heavier: two passes and a join whose key you must state. The window is the same fold for free — and the interviewer is grading whether you know that." },
        { choice: 2, why: "COUNT(*) OVER () counts ROWS, not value — the 'share' would divide one order's total by 103 rows instead of the corridor's settled value." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercadolibre-mcq-26",
      prompt: "The Q1 2024 booked-GMV cut must capture every booking through March 31 23:59:59. Which WHERE clause is correct?",
      choices: ["WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'", "WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'", "WHERE created_at LIKE '2024-0[1-3]%'", "WHERE SUBSTR(created_at, 1, 7) <= '2024-03'"],
      answer: 1,
      why: "The half-open interval [Jan 1, Apr 1) catches the last second of March with no boundary judgment: '2024-03-31 23:59:59' < '2024-04-01' is TRUE. BETWEEN '2024-03-31' compares string-wise and drops everything after midnight on the 31st — and quarter-end is exactly when LatAm demand lands.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends: '2024-03-31 23:59:59' > '2024-03-31', so March 31's bookings vanish from the quarter." },
        { choice: 3, why: "The SUBSTR version is non-sargable (function on the column) and its <= comparison includes '2024-03-01' through '2024-03-31' but also any malformed keys that sort low." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-27",
      prompt: "The trusted-bench read keeps official stores rated 4.5 or better — rating is a column on suppliers. Why does the threshold live in WHERE, not HAVING?",
      choices: ["rating is a row-level attribute: it filters stores before any fold, and HAVING only sees group results after GROUP BY", "HAVING is slower than WHERE", "HAVING cannot compare REAL numbers", "WHERE cannot reference supplier columns after a join"],
      answer: 0,
      why: "The 4.5 bench is a fact about each store row, so it discards rows pre-fold in WHERE — exactly the kit's trusted-bench shape (Nordic 4.6 and Alpine 4.8 in; Midwest 4.4 out). HAVING's turn comes when the threshold judges a group result: a revenue floor, a listing count, a rating AVERAGE.",
      notes: [
        { choice: 1, why: "Performance is not the issue — placement is semantics. A row filter in HAVING (when it compiles at all) is the wrong clause for the job." },
        { choice: 2, why: "HAVING compares REALs fine — 'HAVING AVG(rating) >= 4.5' is the legitimate cousin when the unit of judgment is the GROUP, not the row." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-28",
      prompt: "The close packet stacks this year's settled bookings beside last year's in one layout — the two branches can never overlap. Which operator, and what does the alternative cost?",
      choices: ["UNION — the safe default", "INTERSECT — it keeps the overlap", "JOIN ON 1=1 — set ops cannot stack shaped reports", "UNION ALL — UNION would pay a distinct pass to dedupe rows that cannot duplicate, and a REAL duplicate would vanish silently instead of being investigated"],
      answer: 3,
      why: "Disjoint branches stack with UNION ALL — no dedupe pass, no silent collapse. UNION's distinct step is a business decision, not hygiene: if a duplicate ever DID appear it is a data incident you want to see, and UNION would bury it. The discipline is stating WHY duplicates are impossible in a comment next to the operator.",
      notes: [
        { choice: 0, why: "'Safe by default' is the trap: UNION's dedupe deletes rows without announcing it. On stacks where a repeated count is legitimate, UNION is the bug." },
        { choice: 2, why: "CROSS JOIN pairs every row with every row — multiplication, not stacking. Set operators concatenate shaped branches; joins relate them." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercadolibre-mcq-29",
      prompt: "The one-pass status census has two portable shapes in SQLite. Which pair is equivalent per branch?",
      choices: [
        "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) and COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(status = 'delivered') and COUNT(*) FILTER (WHERE status = 'delivered')",
        "SUM(status) and COUNT(status)",
        "MAX(status = 'delivered') and COUNT(*) FILTER (WHERE status = 'delivered')",
      ],
      answer: 0,
      why: "SUM over 0/1 flags is the conditional count — 52 for delivered — and FILTER (WHERE …) computes the same branch with standard syntax. Both share the same COUNT(*) denominator, which is why sibling branches cannot drift. The census identity 52 + 30 + 14 + 7 = 103 holds in either dialect.",
      notes: [
        { choice: 1, why: "COUNT(expr) counts rows where the expression is non-NULL — the 0/1 comparison result is never NULL, so this counts ALL 103 rows. COUNT never evaluates the expression's value." },
        { choice: 2, why: "SUM over a TEXT status is 0 (SQLite coerces text to 0 in numeric context) and COUNT(status) counts non-NULL text — neither is a conditional count." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercadolibre-mcq-30",
      prompt: "Repeat-buyer GMV: revenue from buyers with 2+ purchases, read at cart-line grain. The panel asks you to defend the shape. Which one composes the two grains correctly?",
      choices: [
        "WHERE customer_id IN (SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING COUNT(*) >= 2) — one IN list, done",
        "A derived buyer-grain table (GROUP BY + HAVING COUNT(*) >= 2) that the outer line-item query joins or semi-joins — the aggregate lives in its own layer",
        "WHERE COUNT(*) >= 2 on the joined orders×items table",
        "GROUP BY order_id HAVING COUNT(*) >= 2 over order_items",
      ],
      answer: 1,
      why: "Two grains, two layers: the inner fold defines repeat buyers at customer grain (16 buyers → 14 with 2+), the outer layer sums unit_price × quantity over their cart lines. Hiding an aggregate inside an IN list mixes grains in one clause, and COUNT in WHERE references a fold that does not exist yet.",
      notes: [
        { choice: 0, why: "An IN list takes ONE column; the two-column subquery is a syntax error — and even one-column form hides the fold where no reviewer can audit the definition." },
        { choice: 3, why: "That folds cart lines per ORDER (orders with 2+ lines) — a basket-depth read, not a repeat-buyer read. The grain is off by one layer." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-mercadolibre-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The official-store revenue census",
      brief:
        "Mercado Libre-flavored memo on the storefront db: the quarterly official-store review opens with the revenue census — every official store with its listing count and booked GMV — and the commerce team is explicit that GMV is read from cart lines as unit_price × quantity, unfiltered by status, so the census is booked demand, not settled revenue. Probed facts: Nordic Gadgets AB leads with 3 listings and 11,130.25 (32% of the book), Midwest Hardware Co follows at 9,294.93 (26.7%), then Alpine Audio GmbH 4,765.63, Andes Naturals SA 3,613.25, Shenzhen Electro 3,049.07 and Pacific Textiles 2,980.15 — every store carries 2 or 3 listings. The deck reads biggest GMV first.",
      ask: "Return each official store with its region, listing count and booked GMV to 2 decimals, biggest GMV first.",
      template:
        "SELECT s.name AS official_store,\n       s.region AS region,\n       COUNT({1} p.id) AS listings,\n       ROUND(SUM(ii.{2} * ii.quantity), {3}) AS gmv\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items ii ON ii.{4} = p.id\nGROUP BY s.name, s.region\nORDER BY gmv {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the listing deduplicator",
          why: "COUNT(DISTINCT p.id) folds repeat cart lines back to listings: Nordic reads 3, not a line count. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "unit_price",
          kind: "keyword",
          label: "the line-price column",
          why: "Cart-line GMV is unit_price × quantity — the order_items columns. 'cost' exists nowhere in the schema, and folding the wrong grain is how a census drifts off the probed 11,130.25.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the cents precision",
          why: "Money prints to 2 decimals — Nordic's 11,130.25. ROUND(…, 1) slices the cents off every cell and the deck stops reconciling with the 32% share the commerce team quotes on the same slide.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the cart-line join key",
          why: "order_items.product_id = products.id is the spine that attaches lines to listings. Joining on ii.id pairs line ids (1–251) against product ids (1–16) and re-keys the census into fiction.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest GMV on top: Nordic 11,130.25 down to Pacific 2,980.15. ASC would open the deck on the smallest store — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "cost", "id", "order_id", "ASC"],
      walkthrough:
        "One chain, one fold, two grains. The joins run official stores → listings → cart lines; GROUP BY store folds the lines into six rows where COUNT(DISTINCT p.id) reads listings (3 / 3 / 2 / 2 / 3 / 3 — every store's catalog moved at least once) and ROUND(SUM(ii.unit_price * ii.quantity), 2) reads booked GMV: Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15 — the probed census cell for cell, unfiltered by status because booked demand is the definition on the slide. The distractors fail honestly: SUM and MAX inside COUNT are nested aggregates that error; 'cost' exists in no table; 1 in the precision slot truncates cents off every row (11,130.3); id in the join slot pairs line ids against product ids and re-keys the whole census; order_id pairs order ids against product ids and invents a different marketplace; ASC opens the review on Pacific Textiles. The read under the numbers: six official stores carry all 16 listings, and the top two stores own 32% and 26.7% of the book — concentration at catalog depth, not breadth.",
    },
    {
      id: "cs-mercadolibre-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The best-seller ladder",
      brief:
        "Mercado Libre-flavored memo on the storefront db: the growth board's best-seller ladder ranks every listing by units moved through carts, and the catalog team wants ties handled honestly — shared rungs, gaps following — because two listings sit tied at 36 units and three more at 30. Probed facts: Desk Mat Extended tops the ladder at 47 units, Noise-Canceling Headset 46, HDMI 2.1 Cable 2m 38, Wireless Mouse M3 and Laptop Stand Aluminum tied at 36, Running Socks 3-pack 33, 4K Webcam Pro 31, and the three-way 30 tie — Studio Desktop Mic, Ring Light, Fitness Band X2 — closes the shown board. The deck shows only listings clearing the 30-unit line, biggest units first.",
      ask: "Return each listing at or above the 30-unit line with its category, units and ladder rank, biggest units first, sharing rungs on ties.",
      template:
        "WITH folded AS (\n  SELECT p.name AS listing,\n         p.category AS category,\n         {1}(ii.quantity) AS units\n  FROM products p\n  JOIN order_items ii ON ii.product_id = p.id\n  GROUP BY p.id\n  HAVING SUM(ii.quantity) >= {2}\n)\nSELECT listing,\n       category,\n       units,\n       {3}() OVER (ORDER BY units {4}) AS ladder\nFROM folded\nORDER BY ladder;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the units fold",
          why: "Units moved is SUM(ii.quantity) per listing — the fold the ladder ranks. COUNT counts cart lines touching the listing, AVG reports the per-line mean and MAX the largest single line — three different ladders wearing the same column name.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the board's unit floor",
          why: "The 30-unit line keeps the ten listings from Desk Mat Extended's 47 down to the three-way 30 tie. Raising it to 35 cuts the board to five rows and erases the tie the catalog team explicitly asked to see handled.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung function",
          why: "RANK shares rungs and skips after ties — the 30-tie reads 8, 8, 8 and the next rung would be 11. DENSE_RANK drops the gap; ROW_NUMBER splits peer listings arbitrarily, deciding the merchandising slot by accident.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-units-first direction",
          why: "The ladder ranks biggest units first — 47 at rung 1. ASC would crown the three 21-unit listings nobody put on the board and bury the Desk Mat at the bottom of the frame.",
        },
      ],
      distractors: ["COUNT", "AVG", "MAX", "DENSE_RANK", "ROW_NUMBER", "35"],
      walkthrough:
        "Two stages: fold the units, then rank them. The CTE joins listings to cart lines, folds SUM(ii.quantity) per product, and the HAVING floor keeps the ten listings at 30 units and above — Desk Mat Extended 47, Noise-Canceling Headset 46, HDMI 2.1 Cable 38, the two-way 36 tie, Running Socks 33, 4K Webcam Pro 31, and the three-way 30 tie. The outer SELECT adds RANK() OVER (ORDER BY units DESC): the 36 tie shares rungs 4 and 5, and the 30 tie reads 8, 8, 8 — with the next rung outside the frame landing on 11, because RANK skips after ties. DENSE_RANK would read the tie 8, 8, 8 and hand 9 to the next listing — a different board than the catalog page publishes; ROW_NUMBER would split three peer listings across 8, 9, 10 by whatever order the engine feels like. The distractors each break differently: COUNT folds line counts, not units; AVG and MAX rank a per-line statistic; DENSE_RANK and ROW_NUMBER change the tie policy in place; 35 in the floor cuts the board to five rows and hides the tie the memo names. Below the line sit the listings the floor hides: Mechanical Keyboard K1 at 28, Yoga Mat Eco 6mm at 27, Smart Watch S at 23, and the three-way 21 tie — the long tail the ladder exists to watch.",
    },
    {
      id: "cs-mercadolibre-3",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The band-edge census",
      brief:
        "Mercado Libre-flavored memo on the storefront db: the category page publishes two fixed band edges — classic under 50, signature under 200, premium at 200-plus — and the merchandising review opens with the band census: listings and average ticket per band. Probed facts: 16 listings split exactly 8 / 8 — classic averages 32.06 (Wireless Mouse 34.50, USB-C Hub 49.00, Ring Light 39.99 down to HDMI Cable 14.99), signature averages 111.50 (Noise-Canceling Headset 149.99, Studio Desktop Mic 119.00 up to Smart Watch S 199.99) — and the premium band prints NO row: nothing prices at 200-plus on this snapshot, and the absence is the finding. The deck reads cheapest band first.",
      ask: "Return one row per price band with the listing count and the average ticket to 2 decimals, lowest average first.",
      template:
        "SELECT CASE\n         WHEN price < {1} THEN 'classic'\n         WHEN price < {2} THEN 'signature'\n         ELSE 'premium'\n       END AS band,\n       COUNT(*) AS listings,\n       ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY band\nORDER BY avg_price {3};",
      slots: [
        {
          answer: "50",
          kind: "number",
          noVerify: true,
          label: "the classic-line edge",
          why: "50 is the category page's published edge: 8 listings sit under it, capped by the USB-C Hub at 49.00. The figure never prints in the census cells — it is policy, not data — but moving it to 60 pulls the 59.99 Bluetooth Speaker into classic and re-weights both averages.",
        },
        {
          answer: "200",
          kind: "number",
          noVerify: true,
          label: "the premium floor",
          why: "200 is the second published edge, and it matters BECAUSE nothing clears it: the ELSE branch fires for zero listings and the premium band prints no row — the empty-band proof the review cites. Loosening it to 100 re-bands the 89.99 keyboard and the census stops matching the page.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the cheapest-band-first direction",
          why: "The deck opens on classic (32.06 average) and walks up to signature (111.50). DESC would lead with the premium-leaning band — a correct query presenting the census bottom-up, the exact reversal the merchandising lead flags.",
        },
      ],
      distractors: ["60", "100", "DESC"],
      walkthrough:
        "One fold, one CASE, one absence. The CASE arms evaluate top-down — price < 50 first, then price < 200, ELSE premium — which is why the edges MUST ascend: swapped arms re-band every classic listing as signature because 34.50 passes the first test it meets. GROUP BY band folds the 16 listings into two rows: classic 8 at 32.06, signature 8 at 111.50, and the premium band contributes nothing — GROUP BY only produces rows for groups that exist, so an empty band is an ABSENT row, and proving that absence (top listing 199.99, one cent shy) is the census's real finding. The distractors fail honestly: 60 and 100 are plausible-but-unpublished edges that re-weight both averages (60 drags the 59.99 speaker into classic; 100 pushes the keyboard out of signature), and DESC flips the deck to read signature-first. The arms, the edges and the direction are all policy the category page publishes — the query's job is to match it, not to invent it.",
    },
    {
      id: "cs-mercadolibre-4",
      tier: "easy",
      topic: "l8",
      universe: "inventory",
      title: "The restock floor huddle",
      brief:
        "Mercado Libre-flavored memo on the storefront db: the weekly restock huddle scans categories whose thinnest listing sits at or under the 70-unit restock line — the trigger the fulfillment team uses before a listing sells through. Probed facts: 16 listings across 7 categories; the sub-70 floors are Wearables (Smart Watch S at 40 — the hot listing the kit tracks down to 17 remaining after 23 units move), Audio (Studio Desktop Mic at 45) and Video (4K Webcam Pro at exactly 70); every other category's thinnest listing sits at 85 (USB-C Hub) or fatter. The huddle reads thinnest floor first.",
      ask: "Return each category at or under the restock line with its listing count and its floor stock (the thinnest listing), thinnest first.",
      template:
        "SELECT category,\n       COUNT(*) AS listings,\n       MIN({1}) AS floor_stock\nFROM products\nGROUP BY category\nHAVING MIN(stock) <= {2}\nORDER BY floor_stock {3};",
      slots: [
        {
          answer: "stock",
          kind: "keyword",
          label: "the floor column",
          why: "The floor is MIN(stock) — the thinnest listing a category carries. MIN(price) computes the cheapest TICKET instead, a pricing stat wearing an inventory column's name; MIN(id) folds id codes, which is numerically valid and commercially meaningless.",
        },
        {
          answer: "70",
          kind: "number",
          label: "the restock line",
          why: "The huddle's published trigger keeps three categories: Wearables 40, Audio 45, Video 70 — and the 70 itself prints in the cells as Video's floor, the boundary case the trigger exists to catch. Raising the line to 85 drags Electronics (USB-C Hub) into the huddle; the trigger is a policy number, not a guess.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the thinnest-first direction",
          why: "Thinnest floor first puts Wearables (40) on top — the category the huddle acts on today. DESC would open on Video's 70 and end on the urgent row; the meeting reads top-down, so the order IS the agenda.",
        },
      ],
      distractors: ["85", "id", "45", "DESC"],
      walkthrough:
        "A census with a trigger. GROUP BY category folds 16 listings into 7 rows; COUNT(*) reads each category's depth (Wearables 2, Audio 3, Video 2) and MIN(stock) reads the floor — the thinnest listing each category carries. HAVING MIN(stock) <= 70 keeps the three categories the restock line exists to flag: Wearables at 40 (the Smart Watch S book the kit tracks — 40 on the shelf, 23 sold, 17 true remaining), Audio at 45, and Video at exactly 70, the boundary case that proves the line is <= and not <. ORDER BY floor_stock ASC sets the agenda: 40, 45, 70. The distractors each break differently: 85 in the line drags Electronics (USB-C Hub at exactly 85) into the huddle and the agenda stops matching the published trigger; id folds id codes into the floor; 45 tightens the line and silently drops Video — the one category sitting exactly ON the trigger; DESC buries the urgent row under the boundary case. One pass, one policy line, and the floor is a MIN because 'thinnest listing' is the definition, not a guess.",
    },
    {
      id: "cs-mercadolibre-5",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The GMV month walk",
      brief:
        "Mercado Libre-flavored memo on the storefront db: the growth board's monthly walk puts each month's booked GMV beside the prior month's, with the delta rounded to cents, so the trough and the recovery quote themselves. Probed facts: the 14-month spine opens at 3,731.97 (Jan 2024), slides to the 1,193.86 trough in July 2024, and recovers +1,158.21 into August (2,352.07); 2024's twelve buckets end at 2,101.47 in December after a 1,648.80 November dip. The first LAG row is NULL by definition — no baseline exists for January — and the board wants the 2024 buckets only, chronological, no invented zeros.",
      ask: "Return month, booked GMV, the prior month's GMV and the delta, for the 2024 buckets, chronological order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS gmv\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       gmv,\n       {1}(gmv) OVER (ORDER BY month) AS prev_gmv,\n       ROUND(gmv - LAG(gmv) OVER (ORDER BY month), 2) AS delta\nFROM monthly\nWHERE month LIKE {2}\nORDER BY month {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(gmv) walks the window backwards one bucket — February's prev_gmv is January's 3,731.97. LEAD reads forward and hands February March's number, silently re-labeling the future as history; SUM piles a running total into a column named prev, a different metric wearing the same name.",
        },
        {
          answer: "'2024-%'",
          kind: "keyword",
          label: "the year filter",
          why: "LIKE '2024-%' keeps exactly the twelve 2024 buckets and cuts 2025's February from the walk the board asked for. '%25-%' would leave a single orphan row whose LAG is NULL — a walk with one step and no story.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month walk is chronological: ASC keeps January on top so each row's delta reads against the row above. DESC presents December first with its baseline underneath — the numbers survive, the trough-to-recovery narrative does not.",
        },
      ],
      distractors: ["LEAD", "'2025-%'", "DESC", "SUM"],
      walkthrough:
        "Stage the grain, then walk it. The CTE folds 103 purchases into 14 monthly buckets with the STRFTIME month key — '%Y-%m', because '%m' alone would merge January 2024 into January 2025 — and rounds each fold to cents. The outer query reads the walk: LAG(gmv) OVER (ORDER BY month) brings January's 3,731.97 into February's row, and the delta divides nothing — it subtracts, rounded: −122.33 into February, −992.56 into March, then the slide bottoming at −853.57 into July's 1,193.86 trough and the +1,158.21 recovery into August. January's prev_gmv and delta are NULL by definition — no prior bucket exists, and that NULL is the honest baseline, not a zero to coalesce into a fake +100% jump. The two-stage build matters: window output is invisible to sibling expressions and WHERE in the same SELECT, so the CTE stages the grain before any window runs. The distractors each break the story differently — LEAD quotes the future, SUM turns prev into a cumulative, the year filter amputates the spine, and DESC tells the trough before the slide that caused it.",
    },
    {
      id: "cs-mercadolibre-6",
      tier: "hard",
      topic: "x2",
      universe: "funnel",
      title: "The corridor dispatch census",
      brief:
        "Mercado Libre-flavored memo on the storefront db: the ops board opens on the corridor dispatch census — booked, settled, dispatched, awaiting and the drop share per corridor in ONE scan. Probed facts: EU books 45 with 24 settled, 36 dispatched (shipped_at stamped), 6 awaiting and a 6.7% drop share; APAC 37 / 21 / 29 / 5 / 8.1%; US 19 / 5 / 15 / 3 / 5.3%; LATAM 2 / 2 / 2 / 0 / flat 0. Two denominators live in one row: settled counts door-confirmed deliveries, dispatched counts the shipped_at stamp — delivered plus in-transit — and each corridor's dispatched + awaiting + dropped must reconcile to booked by construction. The board reads biggest corridor first.",
      ask: "Return each corridor with booked, settled, dispatched, awaiting and the drop percentage to 1 decimal, biggest corridor first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS settled,\n       COUNT(*) FILTER (WHERE o.{2} IS NOT NULL) AS dispatched,\n       COUNT(*) FILTER (WHERE o.status = 'pending') AS awaiting,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), 1) AS drop_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY booked {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled literal",
          why: "Settled means door-confirmed: status 'delivered', 52 platform-wide, led by EU's 24. 'shipped' would count the 30 in-transit rows as final and every corridor's completion story inflates before the parcel arrives — the exact conflation the stage map forbids.",
        },
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the dispatch stamp column",
          why: "Dispatched is the shipped_at stamp — truck-out, not door-step: 82 of 103 platform-wide, 36 of EU's 45. created_at IS NOT NULL is always true and would print booked wearing dispatched's name; total IS NOT NULL dies the same way.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-corridor-first direction",
          why: "The board reads biggest corridor on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open the morning meeting on LATAM's two purchases — a correct query aimed at the wrong end of the board, and the small-sample row is the LAST thing the funnel discussion needs first.",
        },
      ],
      distractors: ["'shipped'", "created_at", "ASC"],
      walkthrough:
        "One scan, five branches, two denominators. The join attaches each purchase to its buyer's corridor and GROUP BY folds 103 rows into four; FILTER (WHERE …) branches each count over the same scan, so the branches cannot drift: EU reads booked 45, settled 24, dispatched 36, awaiting 6 — and the reconciliation holds by construction, dispatched 36 + awaiting 6 + dropped 3 = 45, with APAC 29 + 5 + 3 = 37, US 15 + 3 + 1 = 19, LATAM 2 = 2. The drop share divides the cancelled branch by COUNT(*) with 100.0 BEFORE the division — EU 6.7, APAC 8.1, US 5.3, LATAM 0 — the exact numbers the ops board quotes, and the reason APAC leads the address-quality workstream despite booking less than EU. The two stage-columns are the case's hard part: settled counts a STATUS (delivered, door-confirmed) while dispatched counts a TIMESTAMP (shipped_at, truck-out) — same query, two different definitions of 'made it', and conflating them is the funnel bug the stage map exists to prevent. The distractors fail honestly: 'shipped' re-labels in-transit as settled, created_at turns dispatched into booked, and ASC opens the board on the micro-market.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-i", why: "The first query every catalog analyst writes here: cart lines joined to listings, revenue folded as unit_price × quantity at line grain. Mercado Libre screens warm up on exactly this shape before asking what the join silently excludes." },
    { slug: "sales-analysis-iii", why: "Period filters over the purchase book — a category manager's 'show me last month's line' is a date-windowed fold over the same cart-line table, and the half-open interval habit is what gets tested." },
    { slug: "list-the-products-ordered-in-a-period", why: "The month-scoped listing pull for catalog ops: which SKUs moved in a given month, aggregated and sorted. February 2025 on this db is the live exercise." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT folds a dispatch day's baskets into one comma-separated cell — the exact trick behind the Envios team's daily manifest report." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The top-buyer census: a 24-purchase book against 2-purchase buyers is the concentration story (63.5% of GMV from 3,000-plus buyers), and this problem drills the argmax-with-ties habit it needs." },
    { slug: "combine-two-tables", why: "Buyers LEFT JOINed to purchases: the coverage read. A buyer with no purchase is whitespace, a purchase with no buyer is corruption — choosing the join type IS the business statement." },
    { slug: "employee-bonus", why: "Conditional columns the way Mercado Pago cuts them: a CASE gate that pays a bonus only when a key is present mirrors free-shipping thresholds and credit-line eligibility flags." },
    { slug: "find-the-team-size", why: "COUNT(*) OVER (PARTITION BY …) is how cart depth gets computed — lines per purchase beside each line — without collapsing the row grain the fulfillment pack needs." },
    { slug: "basket-depth-aov", why: "Basket depth and average order value in one pass: the two-grain cart read that prices free-shipping threshold decisions, computed against the 338.19 platform average." },
    { slug: "repeat-purchase-rate", why: "The repeat-buyer share — 2 one-time buyers against four 4-purchase buyers on this db — is the funnel number growth ops opens with; this problem drills the distinct-buyer denominator." },
    { slug: "find-stores-with-inventory-imbalance", why: "Stock versus sold per listing — Smart Watch S down to 17 remaining while HDMI cable sits on 462 — is the fulfillment imbalance scan, folded per SKU." },
    { slug: "product-price-at-a-given-date", why: "As-of listing price logic: which price was live when the cart was filled. The classic-versus-premium band read depends on getting the as-of join right." },
    { slug: "fix-names-in-a-table", why: "Buyer name hygiene before any join: exports arrive title-case-broken, and 'bruno silva' versus 'Bruno Silva' silently splits one buyer into two." },
    { slug: "fix-product-name-format", why: "Catalog title normalization — the listing names on this db are already clean; the job is learning to keep them that way before any GROUP BY merges variants." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Cross-listing behavior: which buyers put Audio and Wearables in the same cart but never Accessories — the conditional-aggregation shape behind attach-rate reads." },
    { slug: "null-blank-audit", why: "The listing catalog audit: NULL and blank cells counted per column before any fold, because a blank category on one listing quietly re-buckets the whole category census." },
    { slug: "immediate-food-delivery-ii", why: "The dispatch-promise share escalated: what fraction of purchases got their Envios stamp on booking day, computed as one conditional ratio — the level-two version of the funnel read the ops board opens with." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest purchase per listing — the recency argmax the Envios queue and the re-listing decision both run on, and a ROW_NUMBER-versus-join-back tie drill in marketplace clothing." },
    { slug: "the-most-recent-three-orders", why: "The top-3 recency cut per buyer: window ranking with a LIMIT that only exists after the window — the compose-then-cut order the fulfillment pack drills." },
    { slug: "customer-order-frequency", why: "Purchase cadence per buyer: Alice Chen's 24-purchase book against the two one-time buyers is the intensity spread the loyalty team prices, folded per customer." },
    { slug: "users-with-two-purchases-within-seven-days", why: "The repeat burst: two purchases inside a week is the behavioral signal growth ops treats as activation — self-join or window logic over the purchase spine." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Escalating basket values per buyer — the up-and-to-the-right read that flags a buyer worth a retention touch, and a strict-inequality window drill." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Carted but never kept: the kit's whole 'carted and kept are different numbers' thesis as an anti-join — visits (or carts) with no purchase row on the other side." },
    { slug: "same-day-sale", why: "Booked and dispatched on the same calendar day — the same-day shape behind the Envios speed metric, where the timestamp comparison must respect the half-open day boundary." },
    { slug: "friday-purchases-i", why: "Weekday demand cycles: purchases folded by day-of-week — the staffing curve the fulfillment centers plan against, pivoted with CASE or STRFTIME." },
    { slug: "restaurant-growth", why: "The 7-day moving average of booked GMV — the smoothing the growth board reads instead of raw daily noise, and the calendar-spine frame drill in full." },
    { slug: "calculate-product-final-price", why: "Promo-adjusted listing price: base price plus a conditional adjustment is exactly how campaign pricing lands on the category page — CASE arithmetic on the catalog." },
    { slug: "recyclable-and-low-fat-products", why: "The two-attribute listing scan: which SKUs carry both flags — the filter-shape behind every 'eligible for program X' catalog pull." },
    { slug: "warehouse-manager", why: "Inventory cubed by warehouse and SKU: the per-cell stock fold the fulfillment network reports against — SUM over a two-key GROUP BY with zero cells kept honest." },
    { slug: "weeks-of-supply", why: "Stock cover per listing: units on hand over recent run-rate — the number that decides whether Smart Watch S at 17 remaining is a restock ticket or a stockout incident." },
    { slug: "duplicate-charge-pairs", why: "Pago double-settlement detection: two payment rows for one invoice inside a window — the self-join pair-matching shape the finance anomaly walk runs every close." },
    { slug: "sellers-with-no-sales", why: "Official-store whitespace: which of the 6 stores carried no financed demand in the window — the anti-join the commerce team runs before a shelf-space conversation." },
  ],
};
