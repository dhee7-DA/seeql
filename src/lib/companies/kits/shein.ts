// SHEIN — Wave-10 (Task 100), ecom domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Ultra-fast-fashion cross-border ecom: micro-batch drops, cart-size economics,
// the returns/abandon lens, and promo banding. The storefront db reads as a
// SHEIN trading sandbox — customers are shoppers (region = market buckets: EU
// Europe core, APAC SEA/Gulf lanes, US flagship, LATAM growth lane), orders are
// checkouts (delivered = delivered-and-kept 52, shipped = in-transit with
// shipped_at as the dispatch stamp 30, pending = awaiting payment/warehouse 14,
// cancelled = abandoned/cancelled 7), order_items are cart line items (quantity
// = units, unit_price = the repriced line ticket — coupons touch every line),
// products are fashion SKUs (list price = p.price; the promo banding key),
// suppliers are vendor/factory partners, invoices are wholesale/settlement
// statements, payments are the payment rails (card vs bank-transfer wire),
// expenses are platform opex, and ledger_entries are the GL. Finance tables
// store INTEGER cents — the dollar read is amount_cents / 100.0; orders.total
// and order_items.unit_price are REAL dollars.
// Pool provenance: company-pools.md carries NO SHEIN section (0 tagged rows),
// so all 10 topic slug sets and all 16 problems are theme-curated from the
// pools file's theme menu (sql rows only, no w*/d*/f* rows) and say so. Case
// briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12,
// wave-8+9 canonical dumps 2026-10-16) plus this kit's own probe (Task 100);
// every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts. Accent text-stone-300 is unused by all 20 ecom
// sibling kits (amazon..asos) and repo-wide.

import type { CompanyKit } from "../types";

export const sheinKit: CompanyKit = {
  id: "shein",
  domainId: "ecom",
  name: "SHEIN",
  tagline: "Micro-batch drops, cart-size economics, cross-border speed",
  accent: "text-stone-300",

  brief: [
    "**SHEIN** is the ultra-fast-fashion machine: micro-batch drops test demand in days, coupon stacks reprice every cart line at checkout, and cross-border lanes move parcels on a **2.98-day** average dispatch clock. The analysis culture is cart-first — where SHEIN's margins live is not the hero product but the **basket**: 251 cart lines riding in 103 checkouts worth **34,833.28** (2.44 lines per cart, 498 units). This kit maps the storefront db onto that world: 16 fashion SKUs across 7 product families, 6 vendor/factory partners, and a fixed status map — delivered = {emerald:delivered-and-kept} (52, 50.5%), shipped = {sky:in-transit} with `shipped_at` as the dispatch stamp (30, 29.1%), pending = awaiting payment or the warehouse queue (14), cancelled = {rose:abandoned} (7, 6.8%).",
    "The data org splits into growth (drop cadence, market funnels), trading (attach, bands, price ladders) and a settlement pod that reconciles wholesale statements against payment rails. One house fact shapes everything: **every one of the 251 cart lines reprices off the SKU's list price** — coupons, bundle credits and size-curve markdowns all land on `unit_price`, so the line ticket is never the catalog key; banding uses the list price on `products` (8 budget SKUs averaging **32.06**, 8 core SKUs averaging **111.5**, and the premium ladder *empty* — the catalog tops out at 199.99, though 5 repriced line tickets clear the 200 ceiling at checkout, topping at 209.68). Money in the settlement tables is INTEGER cents: the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator, cart-flavored. A loop opens with a **two-grain market census** — EU runs 45 checkouts worth 15,089.23 from 8 shoppers while the US runs 19 from 2 — then escalates into the attach read (the add-on family rides in **54 of 103 carts**, 52.4%, yet books just 3,294.29 while the hero family touches 46 carts and books 11,744.01), then into a rate where the interviewer asks the denominator out loud (*'do abandoned carts sit in your base?'*), then a window walk over the {sky:14-month drop spine} (2024-01 to 2025-02) where the first LAG row is NULL by design. Candidates who state the grain, the banding key and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no SHEIN section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: cart-line folding, attach censuses, promo-band CASE folds, dispatch-latency NULL policy and cents-safe settlement reads. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:cart attach census} merch ops opens Monday with, the other rebuilds the {sky:promo-band folio} pricing quotes at every trading review. The bar to clear: *state the banding key and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the cart refresh. A trading analyst opens the drop dashboard before standup: did overnight checkouts land, does the one-pass status census reconcile — 52 delivered + 30 in-transit + 14 pending + 7 abandoned = **103 by construction**? Then basket health: 251 cart lines over 103 carts holds the **2.44** depth norm, and the dispatch clock reads **2.98 days** average over the 82 stamped checkouts. A branch that breaks the 103 identity is *the day's first incident*, not a rounding note — and if latency drifts off the 2-4 day band, the cross-border lane queue gets pulled before growth's weekly read ships.",
    "**11:30 —** Midday is the attach and band read. Merch ops wants the attach census — the add-on family in **54 of 103 carts** (52.4%) but worth only 3,294.29 while the hero family turns 46 carts into 11,744.01 (*where carts sit is not where money sits*); pricing wants the promo-band folio re-cut — {amber:79.7% of EU cart value} in the core band against 20.3 in budget, LATAM the most budget-skewed lane at 26.5; the vendor pod wants concentration beside the bench — the top factory partner books **32%** of revenue and only 2 of 6 partners clear the 4.5 trust floor. Each ask is a join, a conditional aggregate and one judgment call about which key the banding used.",
    "**15:30 —** The afternoon tilts toward money. The settlement pod's anti-join refreshes first — **6 never-settled statements worth 15,217** — before any dunning email goes out; the rails split reads **card 16 legs / 37,364** against wire 11 / 32,248 and feeds the lane-mix deck; and the anomaly list gets walked line by line: statement #11 is void at 925.00 yet carries a settlement leg, and #28 is paid-status at 1,756.00 with zero legs — *a status that lies*. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Cart depth", what: "Cart lines ÷ checkouts: 251 order_items over 103 orders = 2.44 lines per cart (498 units total; max 3 units per line). The basket-size read SHEIN's economics hang on — attach and bundling live here first." },
    { name: "Attach rate", what: "Share of carts carrying at least one line of a family: the add-on family rides in 54 of 103 carts (52.4% probed) yet books 3,294.29 — attach is a coverage metric, not a revenue one, and the two crowns disagree by design." },
    { name: "Kept rate", what: "Delivered ÷ ALL checkouts: 52 of 103 (50.5%). 'Kept' is a status-filtered conditional count; the denominator question — do in-transit and pending carts belong in the base? — is the whole interview." },
    { name: "Abandon share", what: "Cancelled ÷ placed, sliced by market: 7 of 103 (6.8%) overall — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The refused-lane map that decides where checkout friction gets fixed next." },
    { name: "Dispatch latency", what: "Booking to dispatch (created_at → shipped_at) over the 82 stamped checkouts only: 2.98-day average, 2-4 day spread. The population definition ships with the number — 14 pending carts have no cycle yet and must not dilute it." },
    { name: "Cart value (AOV)", what: "Average checkout value: 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 cart outweighs the smallest by 40x, so per-cart cuts beat per-shopper averages here." },
    { name: "Promo-band folio", what: "Share of cart value in the budget list band (< 50): 23.6% platform-wide — EU 20.3%, APAC 25.8%, US 26.8%, LATAM 26.5%. Budget fills carts, core (73.2-79.7% per market) pays for them." },
    { name: "Vendor concentration", what: "Booked revenue share by factory partner: top vendor 32%, second 26.7% — and only 2 of 6 partners (ratings 4.6, 4.8) clear the 4.5 trust floor. The dual-axis read that staffs sourcing and de-risks the drop calendar." },
  ],

  topics: [
    {
      name: "Cart-line folding & attach counts",
      why: "Every SHEIN merch screen opens by folding 251 cart lines into per-family reads — units, revenue, and the attach count that matters most: distinct carts touched. The trap is grain drift: COUNT(*) counts line rows (the add-on family has 62 lines but only 54 carts), and the interviewer grades whether you can hold units, lines and carts apart in one query.",
      slugs: ["sales-analysis-i", "percentage-of-users-attended-a-contest", "number-of-rich-customers"],
    },
    {
      name: "Two-grain market censuses",
      why: "Markets report at two grains simultaneously: EU runs 45 checkouts from 8 shoppers, the US 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is demand and which is coverage — is the habit being graded. The intensity ratio (9.5 versus 5.6) is the market-maturity signal hiding between the columns.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "students-and-examinations"],
    },
    {
      name: "Joining carts to the drop catalog",
      why: "Cart lines carry no family, no list price, no vendor — everything joins through `products`, and the join type decides who survives. A line with no SKU is corruption; a SKU with no lines is a drop that missed — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Best-seller ladders & tie policy",
      why: "Drop reporting is leaderboard reporting: top families by revenue, top SKUs by units, top shoppers by carts — and the cart ladder here runs 24, 17, 14, 13, 5 with a three-way tie at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a merchandising policy, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Promo banding with CASE",
      why: "SHEIN's pricing page is a CASE statement: budget under the 50 list edge, core at or above, premium theoretically 200-plus (empty here — the ladder tops out at 199.99). Arms must be exhaustive and ordered; a hole in the CASE is a hole in the folio, and the banding key — list price, never the repriced line ticket — is the follow-up that separates candidates.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "type-of-triangle"],
    },
    {
      name: "Subquery rate gates",
      why: "Screens escalate into staging: which carts beat the 338.19 platform average, which vendors clear a computed bar, which SKUs out-sell the family mean. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted — the above-average filter is where silent zeros ship.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "market-analysis-i"],
    },
    {
      name: "Drop cadence & month buckets",
      why: "The 14-month drop spine (2024-01 to 2025-02, every month 6-9 checkouts) is the cadence read: STRFTIME or SUBSTR month keys, half-open windows that never drop the last night of a drop, and '%m' traps that merge January 2024 into January 2025. Cadence analytics is date discipline.",
      slugs: ["the-latest-login-in-2020", "list-the-products-ordered-in-a-period", "count-the-number-of-experiments"],
    },
    {
      name: "LAG walks on the drop spine",
      why: "Month-over-month GMV walks are LAG over the month spine — the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August. The first row's delta is NULL by definition: the baseline, never a zero to coalesce. LEAD flips every sign; SUM builds a running total instead of a step.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "average-time-of-process-per-machine"],
    },
    {
      name: "Anti-joins & the confident zero",
      why: "Catalog and checkout hygiene runs on anti-joins: shoppers who never checked out, SKUs that never sold, statements no rail ever touched. On this db the product and shopper anti-joins return a confident zero — all 16 SKUs and shoppers appear somewhere — while the settlement anti-join returns 6 statements worth 15,217. Proving which zero you have is the deliverable.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "One-pass censuses & FILTER branches",
      why: "The trading board gets delivered, in-transit, pending and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. Query budget is a real constraint on drop nights.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
  ],

  theory: [
    {
      id: "shein-t1",
      q: "Your cart report joins order_items to products. When do you INNER and when do you LEFT — and what silently breaks if you filter a product column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins cart lines to SKUs: a line with no SKU row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A drop-performance report must be LEFT from products: the SKUs with no cart lines ARE the answer, arriving with NULL line columns. The classic break: filtering category = 'Accessories' in WHERE after the LEFT JOIN kills every NULL-payload SKU row — the LEFT quietly became an INNER and the missed drop vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-sold SKUs — all 16 SKUs ride in some cart — and proving that zero is itself the analyst's job, because the same query shape against the settlement tables returns 6 never-settled statements, not zero. The join type is a business claim; make it deliberately.",
      tag: "joins",
    },
    {
      id: "shein-t2",
      q: "The repeat-cart ladder runs 24, 17, 14, 13, 5 — then a three-way tie at 4 carts. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — the ladder reads 1 through 5, then the three-way tie consumes ranks 6 through 8, and the next distinct count lands on 9, implying two phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6 and the next shopper is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose shopper gets the win-back budget first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer shoppers (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. On a drop leaderboard where hundreds of SKUs share price points, ties are the norm, not the edge case: the LIMIT-with-OFFSET habit breaks exactly there.",
      tag: "windows",
    },
    {
      id: "shein-t3",
      q: "The census shows 103 checkouts and 16 shoppers; EU shows 45 checkouts and 8 shoppers. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts checkout rows after the join — one row per checkout, so a shopper with 24 carts contributes 24. COUNT(DISTINCT customer_id) folds those rows back to shoppers — EU's 45 checkouts collapse to 8. Neither is wrong: checkouts measure demand, shoppers measure installed base. The ratio — 9.5 checkouts per shopper in the US versus 5.6 in EU on this db — is the intensity signal that decides whether a lane is deepening or broadening. The trap that catches candidates is a third grain: join order_items for basket reads and COUNT(*) silently counts cart lines, not checkouts — 251 of them; the add-on family's 62 line rows fold to 54 distinct carts, and a census that prints 62 where the deck prints 54 has silently switched from coverage to rows. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "shein-t4",
      q: "shipped_at is NULL until a checkout dispatches. What is your policy for the dispatch-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched checkouts have a latency, so the report measures booking-to-dispatch for the 82 of 103 checkouts that carry the stamp — averaging 2.98 days with a 2-4 day spread — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL checkouts returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name, and the 14 pending plus 7 abandoned carts never had a cycle to measure. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly those 21 rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for carts still sitting in the warehouse queue. A report whose WHERE clause is doing definitional work without saying so is exactly what a SHEIN reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "shein-t5",
      q: "The trading review wants core-band revenue per market for markets carrying at least ten checkouts. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The band rule is a row-level fact — a line's list price under or over the 50 edge decides its arm before any fold, in WHERE (or in the CASE arm itself); putting it in HAVING is impossible because list prices no longer exist once rows are grouped. The ten-checkout floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a folio line and an error, and between a threshold applied to checkouts versus to dollars. On this db the floor matters: EU (45), APAC (37) and US (19) clear ten checkouts while LATAM's 2 do not — a folio built with the filter in the wrong clause either fails or quietly keeps the two-checkout lane it was told to exclude.",
      tag: "pipeline",
    },
    {
      id: "shein-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 checkouts always produce a mean (338.19 here). On filtered staging tables — one market, one status, one drop month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each cart to ITS family's average line value) re-runs per outer row and answers a different question at a different cost. And the NOT IN variant has a sharper edge: one NULL in the subquery's list makes every comparison UNKNOWN and the whole eligibility list empties — which is why existence tests use EXISTS and NOT IN only over NULL-guarded columns. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "shein-t7",
      q: "The drop trend buckets checkouts by month on TEXT timestamps. How do you build the spine, cut a drop window without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the cadence trend becomes fiction. The drop window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's checkouts, and drop nights are exactly when they land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the deltas tell the trading story: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August — and every one of those claims depends on the spine key being right before any window runs.",
      tag: "dates",
    },
    {
      id: "shein-t8",
      q: "Finance says a wholesale statement is 'paid' but the rails table has no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN settlement legs, keep the NULL side — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why leg rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; between them sits one partial (4,000.00 of 6,148.00). The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage census must read 21 exact / 1 partial / 6 never-settled, the rails split 16 card legs (37,364) against 11 wire legs (32,248), and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "shein-mcq-1",
      prompt: "A checkout row's status reads 'shipped'. In this kit's SHEIN stage map, what happened?",
      choices: ["Delivered — the cart was kept at the door", "In transit — dispatched, with shipped_at as the dispatch stamp", "Abandoned — cancelled before dispatch", "Awaiting payment in the warehouse queue"],
      answer: 1,
      why: "The stage map is fixed: shipped = in transit (30 of 103, 29.1%), stamped with shipped_at the day the cart left the warehouse. Only 'delivered' (52, 50.5%) means kept.",
      notes: [
        { choice: 0, why: "Delivered is the kept status — 52 carts. Calling in-transit carts kept inflates the kept rate before the parcel ever lands." },
        { choice: 2, why: "Abandoned is 'cancelled' — 7 carts that never dispatched. A shipped cart has a dispatch stamp and a parcel in a lane; abandoned ones have neither." },
      ],
      difficulty: "easy",
    },
    {
      id: "shein-mcq-2",
      prompt: "Cart depth is lines ÷ checkouts. The db holds 251 order_items over 103 orders from 16 shoppers. Which read is the basket-size metric?",
      choices: ["251 / 16 = 15.7 lines per shopper", "103 / 251 = 0.41 checkouts per line", "251 / 103 = 2.44 lines per checkout", "251 × 103 line-checkout pairs"],
      answer: 2,
      why: "Cart depth folds lines back to the carts that carry them: 251/103 = 2.44. It is the attach-economics base — bundle reads start here.",
      notes: [
        { choice: 0, why: "15.7 is a shopper-intensity read, not a basket read — it counts a 24-cart power shopper's lines against every shopper including one-time buyers." },
        { choice: 1, why: "Inverted ratio — 0.41 is meaningless as a basket metric. Getting the denominator right IS the metric." },
      ],
      difficulty: "easy",
    },
    {
      id: "shein-mcq-3",
      prompt: "The add-on family shows 62 cart-line rows but 54 distinct carts touched. Which expression reports attach?",
      choices: ["COUNT(*) — 62", "COUNT(DISTINCT oi.order_id) — 54", "SUM(oi.quantity) — 121", "COUNT(DISTINCT p.id) — 3"],
      answer: 1,
      why: "Attach is cart coverage: distinct checkouts carrying at least one line of the family. 54 of 103 carts = the 52.4% attach share merch ops quotes.",
      notes: [
        { choice: 0, why: "62 counts line rows — a cart with three add-on lines counts three times. The attach story and the row count drift apart exactly on multi-line carts." },
        { choice: 2, why: "121 is units sold — a third grain. Units power the sell-through read, not the coverage read." },
      ],
      difficulty: "easy",
    },
    {
      id: "shein-mcq-4",
      prompt: "The abandon map divides cancelled carts by placed carts per market. Why does the house query write 100.0 * SUM(flag) / COUNT(*) rather than (SUM(flag) / COUNT(*)) * 100?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to abandoned carts only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandon share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the abandon map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "shein-mcq-5",
      prompt: "Keep only product families riding in at least 40 of the 103 carts. Where does the threshold live, and what comes back?",
      choices: ["WHERE COUNT(DISTINCT oi.order_id) >= 40, before GROUP BY", "GROUP BY family HAVING COUNT(DISTINCT oi.order_id) >= 40 — the add-on family (54) and the hero family (46)", "HAVING before GROUP BY, wherever it fits", "WHERE orders_touched >= 40 on the raw cart lines"],
      answer: 1,
      why: "A cart-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db exactly two families clear 40 carts touched — 54 and 46; the next is 30.",
      notes: [
        { choice: 0, why: "COUNT(DISTINCT …) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 3, why: "There is no 'orders_touched' column on the raw order_items table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "shein-mcq-6",
      prompt: "The promo band folds SKUs by LIST price: budget strictly under the 50 edge, core at or above. A SKU lists at exactly 49 and another at exactly 50. Which arms catch them?",
      choices: ["49 → core, 50 → budget", "49 → budget, 50 → core", "Both → budget", "Both → core"],
      answer: 1,
      why: "CASE WHEN p.price < 50 THEN 'budget' ELSE 'core' — 49 is strictly under the edge, 50 falls through to ELSE. The edge is inclusive on the core side, which is what the pricing page publishes.",
      notes: [
        { choice: 0, why: "Inverted arms — that CASE would need p.price >= 50 THEN 'core' with the boundary flipped, and the folio shares would not reconcile with the published bands." },
        { choice: 2, why: "Putting 50 in the budget arm re-bands every SKU priced exactly at the edge — the budget share jumps while the query still runs. Boundary drift is silent." },
      ],
      difficulty: "medium",
    },
    {
      id: "shein-mcq-7",
      prompt: "The dispatch-latency tile averages julianday(shipped_at) − julianday(created_at) over ALL 103 checkouts and still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The 14 pending checkouts double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 checkouts.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "shein-mcq-8",
      prompt: "A promo-eligibility query uses shopper_id NOT IN (SELECT customer_id FROM checkouts WHERE status = 'cancelled') and returns ZERO shoppers. First suspicion?",
      choices: ["The zero is correct — every shopper abandoned at least once", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the eligibility list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every checkout carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty eligibility lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "shein-mcq-9",
      prompt: "A close packet stacks the exact-covered statement list over the never-settled list with UNION — 21 rows plus 6 rows should ship 27, but the packet prints 26 with no error. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches emitted one byte-identical row (same statement id, same totals), and UNION dedups whole rows silently — label the branches or use UNION ALL with a stated uniqueness argument", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit identical rows collapse into one, and the close loses a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible — the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate shared row exists, UNION is the bug, and the packet's row count is the only witness." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "shein-mcq-10",
      prompt: "A trading deck walks booked GMV cart by cart: SUM(total) OVER (ORDER BY created_at). Two checkouts share a created_at second, and the cumulative 'jumps two carts at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at cart grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-shein-1",
      tier: "easy",
      topic: "j7",
      universe: "funnel",
      title: "The cart attach census",
      brief:
        "SHEIN-flavored brief on the storefront db: Monday's merch review opens with the cart attach census — which product families actually ride in carts. Merch ops is explicit that attach is measured at cart grain, distinct checkouts carrying at least one line of the family, never line rows, and the denominator is all 103 checkouts on the book. Probed facts: 251 cart lines over 103 checkouts worth 34,833.28 (2.44 lines per cart); the attach crowns read the add-on family (Accessories) at 54 carts touched / 121 units / 3,294.29 revenue and the hero family (Audio) at 46 carts / 97 units / 11,744.01 — attach and money are different crowns. The review reads biggest attach count first.",
      ask: "Return each product family with its SKU count, distinct carts touched, units sold and revenue to 2 decimals, biggest attach count first.",
      template:
        "SELECT p.category AS family,\n       COUNT(DISTINCT p.id) AS skus_listed,\n       COUNT({1} oi.order_id) AS orders_touched,\n       SUM({2}) AS units_sold,\n       ROUND(SUM(oi.quantity * oi.unit_price), {3}) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY orders_touched {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the cart deduplicator",
          why: "COUNT(DISTINCT oi.order_id) folds repeat lines back to carts: the add-on family reads 54 carts, not its 62 line rows. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is an attach census.",
        },
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the units fold",
          why: "SUM(oi.quantity) folds unit counts per family — 121 for the add-on family, 97 for the hero. COUNT there counts line rows instead of units, and the revenue column already carries the money read; two columns must not measure the same thing.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          why: "Revenue prints to 2 decimals — the hero family's 11,744.01. ROUND(…, 1) prints 11,744.0 and the crowns stop reconciling with the 34,833.28 book total merch quotes on the same slide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-attach-first direction",
          why: "The review reads biggest attach on top: 54, 46, 40, 30, 23, 22, 13. ASC would open the meeting on the single-SKU family's 13 carts — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "COUNT", "1", "ASC"],
      walkthrough:
        "One join, one fold, three columns at three grains. The join attaches every cart line to its SKU's family — 251 lines over 103 checkouts — and GROUP BY family folds them into seven rows where COUNT(DISTINCT p.id) reads SKUs listed (3/3/3/2/2/2/1 — the 16-SKU book), COUNT(DISTINCT oi.order_id) reads distinct carts touched (54/46/40/30/23/22/13), SUM(oi.quantity) reads units (121/97/85/61/53/54/27), and ROUND(SUM(quantity * unit_price), 2) reads revenue (3,294.29 / 11,744.01 / 4,818.61 / 5,198.41 / 6,929.12 / 1,984.93 / 863.91) — the probed grid verbatim, reconciling up to the 34,833.28 book. The attach read is the story: the add-on family rides in 54 of 103 carts (52.4 percent) yet books 3,294.29, while the hero family touches 46 carts and books 11,744.01 — where carts sit is not where money sits. The distractors fail honestly: SUM and MAX in the cart slot add id codes together or report the largest id — a census of nothing; COUNT in the units slot counts line rows instead of folding units; 1 in the precision slot truncates to one decimal so the crowns drift off the book total; ASC opens the review on the 13-cart single-SKU family. Attach is coverage, revenue is value — one query, two business claims.",
    },
    {
      id: "cs-shein-2",
      tier: "medium",
      topic: "t6",
      universe: "pricing",
      title: "The promo-band folio",
      brief:
        "SHEIN-flavored brief on the storefront db: pricing wants the promo-band folio — per market, how cart value splits between the budget band (list price under the 50 coupon edge) and the core band (list 50 and up), with each band's share of its own market. The banding basis is the SKU's list price on the catalog, not the repriced line ticket: coupons touch every one of the 251 cart lines, so the ticket is the wrong banding key. Probed facts: platform budget share 23.6 percent; the folio reads EU core 12,032.44 at 79.7 percent of market against budget 3,056.79 at 20.3; APAC 8,611.42 at 74.2 versus 2,994.03 at 25.8; US 5,335.40 at 73.2 versus 1,950.76 at 26.8; LATAM 626.25 at 73.5 versus 226.19 at 26.5. The premium list ladder is empty — the catalog tops out at 199.99. The deck reads biggest share first.",
      ask: "Return each market and band with cart lines, units, band revenue to 2 decimals and the band's share of its market to 1 decimal, biggest share first.",
      template:
        "WITH line_book AS (\n  SELECT c.region AS market,\n         CASE WHEN p.price {1} {2} THEN {3} ELSE 'core' END AS band,\n         oi.quantity AS units,\n         oi.quantity * oi.unit_price AS line_value\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  JOIN orders o ON o.id = oi.order_id\n  JOIN customers c ON c.id = o.customer_id\n), folio AS (\n  SELECT market, band, COUNT(*) AS lines, SUM(units) AS units, SUM(line_value) AS band_value\n  FROM line_book\n  GROUP BY market, band\n)\nSELECT market,\n       band,\n       lines,\n       units,\n       ROUND(band_value, {5}) AS band_revenue,\n       ROUND(100.0 * band_value / SUM(band_value) OVER (PARTITION BY {4}), 1) AS market_share\nFROM folio\nORDER BY market_share {6};",
      slots: [
        {
          answer: "<",
          kind: "keyword",
          label: "the budget edge operator",
          why: "Band membership is list price strictly under the edge — p.price < 50. >= flips every arm: the 79.7 percent core share becomes the budget label's share and the folio inverts while still summing to 100, which is the hardest kind of wrong to spot.",
        },
        {
          answer: "50",
          kind: "number",
          label: "the coupon edge",
          noVerify: true,
          why: "The pricing page's budget/core boundary is 50 — the catalog's 8 budget SKUs average 32.06 against 111.5 in core. Move the edge to 40 and the 42.50 and 49.00 SKUs' carts migrate bands; the shares drift while the query still runs.",
        },
        {
          answer: "'budget'",
          kind: "keyword",
          label: "the band label",
          why: "The CASE arms must label disjoint bands — 'budget' under the edge, 'core' at or above. 'core' in both arms merges every market to one row and the folio halves to four rows; the shares the deck quotes stop existing.",
        },
        {
          answer: "market",
          kind: "keyword",
          label: "the share denominator key",
          why: "SUM(band_value) OVER (PARTITION BY market) makes each band's share sum to 100 within its market. PARTITION BY band computes each band's share across markets instead — a different question wearing the same column name.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          why: "Band revenue prints to 2 decimals — EU core 12,032.44. One decimal drifts every cell off the canonical folio pricing quotes (12,032.4) and the deck stops reconciling with the settlement pod's copy.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-share-first direction",
          why: "The deck reads biggest share on top: 79.7, 74.2, 73.5, 73.2, then the budget arms. ASC would lead with the 20.3 budget arm — a correct folio aimed at the wrong end of the trading review.",
        },
      ],
      distractors: [">=", "'core'", "band", "1", "ASC", "COUNT"],
      walkthrough:
        "Two stages: fold the lines, then window the share. The line_book CTE keys every cart line to its market and to the SKU's list band — budget strictly under the 50 edge, core at or above — because all 251 line tickets reprice off list at checkout, the ticket itself is the wrong banding key. The folio CTE folds 251 lines into 8 market-band rows (EU 53 core + 52 budget, APAC 40 + 48, US 23 + 30, LATAM 2 + 3), and the outer SELECT windows the share: SUM(band_value) OVER (PARTITION BY market) divides each band by its own market so each pair sums to 100. The deck reads exactly the probed folio — EU core 12,032.44 at 79.7 against budget 3,056.79 at 20.3; APAC 74.2 / 25.8; US 73.2 / 26.8; LATAM 73.5 / 26.5 — and the pattern is the story: the budget band fills carts (APAC runs 48 budget lines against 40 core; EU splits 52/53) while the core band pays for them, holding roughly three quarters of value in every market. The premium list ladder is empty — the catalog tops out at 199.99 — though 5 repriced line tickets (8 units, 1,640.37) clear the 200 list ceiling at checkout. The distractors each break differently: >= flips every band so the folio inverts while still summing to 100; 'core' in both CASE arms merges each market to one row and halves the grid; PARTITION BY band answers each band's share across markets instead of each market's internal mix; 1 in the threshold slot pushes every line into budget and 1 in the precision slot truncates revenue to one decimal; ASC leads the deck with the smallest share; COUNT in any slot references a column that does not exist. The discipline: band on the list, share within the market, and say which key the banding used.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-SKU unit folds across carts are the drop read: which listings actually sold. This problem drills the two-table fold SHEIN's daily drop report runs before anything else." },
    { slug: "product-sales-analysis-iii", why: "Units per SKU inside a date window — the drop-window read. A micro-batch either sells through in its window or it did not work, and the query shape is exactly this one." },
    { slug: "queries-quality-and-percentage", why: "Quality ratios with a percentage column and rounding discipline — the same shape as the rails' card-versus-wire share read the settlement pod ships every close." },
    { slug: "confirmation-rate", why: "Rates with honest denominators: confirmed ÷ total, not confirmed ÷ responded. SHEIN's kept rate (52 of 103) lives or dies on the same denominator decision." },
    { slug: "average-selling-price", why: "Weighted ASP per family — price times units over units, across a join. The promo-stack world makes the naive average lie; this problem drills the weighted fold that does not." },
    { slug: "product-price-at-a-given-date", why: "As-of pricing: which price was live on which date. Coupon repricing changes line tickets daily, so 'what did this SKU cost then' is a temporal join, not a lookup." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The repeat-cart ladder argmax — this db's ladder runs 24, 17, 14, 13, 5 with a tie at 4. Finding the top shopper is easy; handling the tie is the interview." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-shopper favorite family — the personalization read. Argmax inside a group, with ties that need a stated policy, exactly like SHEIN's feed-ranking inputs." },
    { slug: "customer-order-frequency", why: "Reorder cadence: shoppers with 2-plus carts in a window. The HAVING-gate shape behind every repeat-purchase cohort SHEIN's growth team tracks." },
    { slug: "classes-more-than-5-students", why: "Crowd gates with HAVING: which families touch enough carts to earn shelf priority. The threshold is a group-level fact — the pipeline-order lesson in business clothing." },
    { slug: "find-stores-with-inventory-imbalance", why: "Inventory imbalance across locations — here, stock versus sold across the SKU bench (the headset has 14 units left, the HDMI cable 462). The rebalance-read shape sourcing runs weekly." },
    { slug: "find-churn-risk-customers", why: "Dormant-shopper detection: shoppers whose carts went quiet. The anti-join plus recency shape that feeds SHEIN's win-back calendar — and the settlement pod's dunning list uses the identical skeleton." },
    { slug: "transactions-per-visit-histogram", why: "Zero-fill histograms: checkouts per visit including the zeros. SHEIN's funnel is full of carts that never complete — 14 pending, 7 abandoned — and histograms that drop zeros hide exactly that." },
    { slug: "bank-account-summary-ii", why: "Cents-safe monthly folds with credits and debits beside each other. INTEGER cents and the /100.0 rule make this exact practice for the settlement statements' true-up reads." },
    { slug: "monthly-transactions-ii", why: "The transferred-versus-not census with EXCEPT — the never-settled statement list (6 statements, 15,217) is this exact set algebra, run against the rails before every dunning batch." },
    { slug: "fix-product-name-format", why: "SKU title hygiene before any join: drop listings arrive case-broken, and 'skims dupe dress' versus 'Skims Dupe Dress' silently splits one SKU into two in every family census." },
  ],
};
