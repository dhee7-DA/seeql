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
// rows — so all 10 topic slug sets and all 16 problems are theme-curated from the
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
    "Preparation strategy: the pools file carries no Mercado Libre section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: dispatch funnels, two-grain censuses, tie-heavy ladders, CASE price bands and the cents-safe Pago spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:official-store revenue census} the commerce team opens every quarter review with, the other rebuilds the {sky:best-seller ladder} the growth board ships every month. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "funnel-step-conversion"],
    },
    {
      name: "Two-grain buyer censuses",
      why: "Purchases and buyers are different grains of the same join, and every census here reports both: EU runs 45 purchases from 8 buyers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining listings to carts",
      why: "The catalog spine runs official stores → listings → cart lines → purchases, and the join type decides who survives. A cart line without a listing is corruption; a listing without a cart line would be dead stock — though on this db the anti-join returns a confident zero, and proving it is part of the job. Line-grain revenue (unit_price × quantity) versus header-grain totals is the second trap: fold the wrong grain and GMV drifts.",
      slugs: ["product-sales-analysis-ii", "students-and-examinations", "average-selling-price"],
    },
    {
      name: "Best-seller leaderboards",
      why: "The catalog team ranks listings by units moved and the ladder is tie-heavy — two listings at 36 units, three at 30, three more at 21 — while the buyer board has four buyers tied at 4 purchases each. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer listings, not syntax.",
      slugs: ["rank-scores", "top-earners", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Price-band CASE tiers",
      why: "Listings band into classic and premium brackets with fixed edges the category page publishes — 8 classic listings averaging 32.06, 8 mid-band at 111.5, and the 200-plus premium band is EMPTY on this snapshot with the top listing at 199.99. Proving a band is empty is as important as filling one: the CASE arms must be exhaustive and ordered, because a hole in the arms is a hole in the forecast.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month purchase spine (2024-01 to 2025-02) is the growth call's home turf: the book opens at 3,731.97 and troughs at 1,193.86 in July 2024. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — dispatched under cancelled, this quarter beside last — and EXCEPT answers 'which listings never sold' (a confident zero here, since all 16 moved). UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-buyer purchase counts, then judge them against a computed platform mean. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board needs delivered, shipped, pending and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Pago billing & cents discipline",
      why: "Purchased is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the marketplace meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
