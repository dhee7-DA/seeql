// ASOS — Wave-9 (Task 98), ecom domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Fashion-retail SQL: the storefront db read as an ASOS trading sandbox — customers are
// ASOS shoppers (region = market), orders are fashion orders (delivered = kept-and-settled,
// shipped = dispatched with shipped_at as the warehouse dispatch stamp, pending = in the
// pick-pack queue, cancelled = abandoned pre-dispatch), order_items are order lines
// (quantity = units, unit_price = line price — think size-curve rows), products are SKUs
// (own-brand + boutique), suppliers are brand/boutique partners, invoices are brand
// settlement statements, payments are settlement rails (card / Klarna-style split legs),
// expenses are warehouse opex, ledger_entries are the GL. The returns economy, size curves
// and drop cadence are the angles. Pool provenance: company-pools.md carries NO ASOS
// section — 0 tagged rows — so all 10 topic slug sets and all 16 problems are theme-curated
// from the pools file's theme menu (sql rows only, no w*/d*/f* rows) and say so. Case
// briefs quote probed figures from scripts/company-facts.md; every case slot is
// mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const asosKit: CompanyKit = {
  id: "asos",
  domainId: "ecom",
  name: "ASOS",
  tagline: "Fashion's returns economy, size curves and drop cadence",
  accent: "text-zinc-300",

  brief: [
    "**ASOS** is the UK-born global fashion retailer for twenty-somethings — own brands (ASOS DESIGN, Topshop) sitting beside thousands of boutique partners on **ASOS Marketplace**, an app-first funnel, a Premier delivery subscription, and a drop cadence that pushes new styles live every week. Fashion e-commerce has a signature data problem: orders placed and orders kept are different numbers, because sizing and fit drive returns at rates no other vertical sees. This kit maps the storefront db onto that world: 16 customers are shoppers (region = market), 103 orders are fashion orders worth **34,833.28**, and 251 order_items rows are order lines — quantity = units, unit_price = line price, the raw material of a size curve. The status map is fixed: delivered = {emerald:kept-and-settled} (52, 50.5%), shipped = dispatched (30, 29.1%, shipped_at as the warehouse dispatch stamp), pending = in the pick-pack queue (14), cancelled = {rose:abandoned pre-dispatch} (7, 6.8%).",
    "The data org splits into trading, customer/growth, a returns-and-fit pod, and finance ops — all reading the same spine at different grains. Trading lives on the order book: **34,833.28** across 103 orders, average 338.19 against a 25.47 to 1,088.44 spread, with concentration the board actually manages — **63.5%** of revenue from shoppers whose lifetime spend crosses 3,000 (71.2% above 2,000). The dispatch funnel is the ops heartbeat: 82 of 103 orders carry a `shipped_at` stamp, averaging **2.98 days** from order to warehouse dispatch with a 2–4 day spread; the 14 pending rows have no stamp yet — a population definition, not a cleanup job. Money sits one layer down: 28 invoices are brand settlement statements and 27 payments are settlement legs, all in INTEGER cents where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator. A loop opens with a **two-grain market census** — EU runs 45 orders from 8 shoppers (335.32 AOV) while the US runs 19 from 2 (383.48) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does an abandoned order count in your base?'*), then into the units ladder where the size curve guarantees ties — three SKUs tied at 30 units — and rank semantics become a merchandising policy. Late rounds walk the {sky:14-month order spine} (2024-01 to 2025-02) with `LAG` deltas, or descend into the settlement layer where a paid-status statement with zero settlement legs (#28, 1,756.00) is waiting as the reconciliation trap. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no ASOS section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: basket depth, return-share conditional counts, size-curve ranking with ties, drop-cadence month walks and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:assortment weight census} trading reads every Monday, the other rebuilds the {rose:settlement coverage census} finance ops runs at every close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the trading dashboard, app-first. An analyst checks the overnight order drop before standup: did new styles land in the catalog feed, does the one-pass status census reconcile — 52 kept + 30 dispatched + 14 queued + 7 abandoned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. Then the queue health read: dispatch latency versus the **2.98-day** norm — if pick-pack is drifting, the Premier promise is the next slide, and the 14 pending orders with no shipped_at stamp are *watched, not patched*.",
    "**11:30 —** Midday is the merchandising deep-dive. Trading wants the assortment weight census — which product lines carry units versus revenue, because the units leader (121 units on add-on lines) and the revenue leader (11,744.01) are *different lines by design*; the returns pod wants basket depth (251 lines over 103 orders, **2.4 lines per order**) re-cut by market; growth wants the repeat-frequency read where EU's 45-from-8 versus the US's 19-from-2 frames concentration. Each ask is a join, a conditional aggregate and one denominator decision. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the trading-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The settlement anti-join refreshes first — **6 never-settled statements worth 15,217** — before finance ops sends a single brand reminder; the coverage split reads **21 settled in full, 1 partial** (4,000 of 6,148) and feeds the dunning draft; and the anomaly list gets walked line by line: a void statement that was settled anyway (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). Split-payment rails get their own eye — 5 statements pay in 2 legs, Klarna-style. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Order book (GMV)", what: "Total fashion order value: 34,833.28 across 103 orders, average 338.19 against a 25.47 to 1,088.44 spread — a 42x range between the smallest basket and the largest. The spread IS the merchandising story." },
    { name: "Kept rate", what: "Delivered ÷ ALL orders placed: 52 of 103 (50.5%). Fashion's placed-versus-kept gap is the vertical's defining number, and the denominator — queued and abandoned included — is the whole interview." },
    { name: "Abandon share", what: "Cancelled-before-dispatch ÷ placed: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The pre-dispatch half of the returns economy that ops watches weekly." },
    { name: "Dispatch latency", what: "Order to warehouse dispatch (created_at → shipped_at) over stamped orders only: 82 of 103, 2.98-day average, range 2–4. The population definition ships with the number — queued orders have no cycle yet." },
    { name: "Basket depth", what: "Order lines ÷ orders: 251 lines over 103 orders (~2.4). The size-curve read — a fashion basket is units in two sizes of one dress, not two products, and this ratio is where that shows up first." },
    { name: "Shopper concentration", what: "Share of revenue from shoppers spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs the CRM pod and sizes the Premier funnel." },
    { name: "Assortment weight", what: "Units versus revenue per product line: the add-on line leads units (121) while the premium line leads revenue (11,744.01 over 97 units). Units leaders ≠ revenue leaders — the census trading reviews every Monday." },
    { name: "Settlement coverage", what: "Brand settlement statements versus legs: 21 settled in full (65,612), 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The AR anti-join finance ops refreshes every close." },
  ],

  topics: [
    {
      name: "Basket depth & line economics",
      why: "A fashion order is not a product — it is a basket of size-curve lines, and every basket-depth question here is a two-grain count over order_items. ASOS screens open with lines-versus-orders: 251 lines over 103 orders, and the trap is COUNT(*) reading lines when the ask was orders.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "number-of-rich-customers"],
    },
    {
      name: "Returns, refusals & cancellation shares",
      why: "Fashion's returns economy starts pre-dispatch: 7 of 103 orders abandoned before the warehouse touches them, concentrated by market (APAC 8.1%, EU 6.7%). Every kept-rate and abandon-share screen here is a conditional count where the interviewer's first question is what the denominator holds.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "immediate-food-delivery-iii"],
    },
    {
      name: "Repeat purchase & frequency",
      why: "App-first fashion lives on repeat rates: the top shopper books 24 of 103 orders while two shoppers booked exactly one. Frequency screens drill HAVING gates and per-shopper folds — the same shape as 'which shoppers ordered in consecutive months'.",
      slugs: ["repeat-purchase-rate", "customer-order-frequency", "confirmation-rate"],
    },
    {
      name: "Spend tiers & shopper segmentation",
      why: "Concentration is the board metric — 63.5% of revenue from 3,000-plus spenders — and tier bands are CASE-classified with fixed edges the CRM publishes. The arms must be exhaustive and ordered; a hole in the CASE is a hole in the segmentation, and a reordered WHEN quietly re-bands the base.",
      slugs: ["rfm-segmentation", "spend-histogram", "count-salary-categories"],
    },
    {
      name: "Best-seller ladders & ranking",
      why: "Size curves guarantee ties: the units ladder runs 47, 46, 38, then a pair at 36 and three SKUs tied at 30. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — which is a merchandising policy about peer SKUs, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Drop cadence & month walks",
      why: "Drops make the calendar the spine: 14 monthly buckets from 2024-01 to 2025-02, each carrying 6–9 orders, with the July trough at 1,193.86. Month walks (LAG deltas), period filters and half-open windows are how trading reads whether a drop landed.",
      slugs: ["unique-orders-and-customers-per-month", "list-the-products-ordered-in-a-period", "monthly-transactions-i"],
    },
    {
      name: "Catalog-to-demand joins",
      why: "SKUs carry brand, category and price; demand inherits them through joins, and the join type decides who survives. A line without a SKU is corruption; a SKU without demand is dead stock — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "employees-with-missing-information"],
    },
    {
      name: "NULL policy on dispatch",
      why: "shipped_at is NULL until the warehouse stamps it — 14 pending orders sit in pick-pack with no latency to average. ASOS screens check whether you treat that NULL as data to report, coalesce to zero for display, or exclude with a stated reason — deliberately, not by accident.",
      slugs: ["employee-bonus", "calculate-special-bonus", "books-with-null-ratings"],
    },
    {
      name: "Ratios with honest denominators",
      why: "AOV per market (383.48 US versus 335.32 EU), kept rates, abandon shares — fashion ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's filter decided BEFORE the ratio, and rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "average-selling-price", "immediate-food-delivery-ii"],
    },
    {
      name: "Settlement money in cents",
      why: "Kept is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the fashion world meets money. Every dollar read is amount_cents / 100.0, split-payment legs (5 statements pay in two) break naive SUM joins, and the exact/partial/never coverage split is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "trial-balance-check"],
    },
  ],

  theory: [
    {
      id: "asos-t1",
      q: "Your basket report joins order_items to orders and then to shoppers. When does the row grain change under you, and how do you keep the census honest?",
      a: "Say the grain out loud before you write anything. orders is one row per order — 103 here; order_items is one row per line — 251, because a fashion basket is two sizes of one dress plus the add-on. The moment order_items joins in, COUNT(*) silently reads LINES, not orders: a basket-depth report wants 251, an order-count census wants 103, and the difference is the entire question. The fixes are explicit: COUNT(DISTINCT order_id) folds lines back to orders, or pre-fold lines per order in a CTE and join the fold. Join type is the same discipline: a kept-rate joins orders to shoppers INNER — an order with no shopper is corruption; a whitespace report is LEFT from shoppers, and NULL-payload rows are the answer arriving. On this db the never-ordered anti-join returns a confident zero — every shopper appears in orders — and proving that zero beats assuming it. The reviewer's habit, and the one to copy: announce 'one row per what?' for every COUNT before the query runs, because the fan-out is where fashion reporting lies.",
      tag: "joins",
    },
    {
      id: "asos-t2",
      q: "The size curve ties: three SKUs sit at 30 units and two at 36 on the best-seller ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a merchandising policy about shared rungs, and the interviewer wants you to say that out loud. On this db the units ladder runs 47, 46, 38, 36, 36, 33, 31, then a three-way tie at 30. RANK gives tied units the same rank and skips — the 30s all read 8 and the next distinct count would land on 11, implying three phantom positions that do not exist on a shelf. DENSE_RANK shares rungs without gaps — 8, 8, 8 and the next is 9. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which SKU the merch screen features. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer SKUs (RANK or DENSE_RANK), or an explicitly named tie-breaker like units DESC, then revenue DESC, then SKU id — written in the query comment, because 'featured SKU' is a business decision the ladder should not make by accident. ASOS's size-curve reality makes this unavoidable: ties are not an edge case here, they are the shape of the data.",
      tag: "windows",
    },
    {
      id: "asos-t3",
      q: "The census says EU ran 45 orders from 8 shoppers; the US ran 19 from 2. Why two columns, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts order rows after the join — one row per order, so a shopper with 24 orders contributes 24. COUNT(DISTINCT customer_id) folds those rows back to shoppers — EU's 45 orders collapse to 8 buyers. Neither is wrong: orders measure load and drop response, shoppers measure installed base and reach. The ratio is the intensity signal — 5.6 orders per EU shopper versus 9.5 in the US on this db — and that is the read that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for the size curve and COUNT(*) silently counts lines — 251 of them — while the slide still says orders. Saying 'one row per what?' for every COUNT is the habit being graded, and pairing both grains in one row (45 beside 8, 19 beside 2) is exactly the census ASOS trading opens with, because a market that looks small on orders can look smaller on shoppers — or the reverse.",
      tag: "aggregation",
    },
    {
      id: "asos-t4",
      q: "shipped_at is NULL until the warehouse dispatches. What is your policy for the dispatch-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched orders have a latency, so the report measures order-to-dispatch for the 82 of 103 orders that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL orders returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 queued plus 7 abandoned orders, which is a feature, not a bug — that gap IS the pick-pack queue. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for orders still in the queue. And the same policy carries into money: SUM over a statement with no settlement legs returns NULL, not zero, and printing NULL beside a labelled 'never settled' row is more honest than coalescing it to 0.00 pretending a settlement happened. A report whose WHERE clause does definitional work without saying so is exactly what an ASOS reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "asos-t5",
      q: "Trading wants kept revenue per market for markets carrying at least ten orders. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards dispatched, queued and abandoned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-order floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. Pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a trading line and an error, and between a threshold applied to orders versus to pounds. One more trap lives in the SELECT: the abandon share is 100.0 * SUM(cancel-flag) / COUNT(*), and the 100.0 must sit BEFORE the division — over integers, 7/103 truncates to 0 and every market reads a flat 0% while the real shares are 8.1, 6.7, 5.3. The strong answer places every filter by asking: is this a fact about one order, or about a market?",
      tag: "pipeline",
    },
    {
      id: "asos-t6",
      q: "Which shoppers beat the platform's average basket value — and what does your subquery return when the inner fold comes back empty?",
      a: "Start with the shape: WHERE o.total > (SELECT AVG(total) FROM orders) is a scalar subquery, contractually 0-or-1 rows and 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 orders always produce a mean of 338.19, and the shoppers clearing it are the concentration story — 63.5% of revenue from the 3,000-plus cohort. On filtered staging tables — one market, one status, one drop month — the empty-inner-query bug ships regularly, and the above-average filter is where it hides. The correlated cousin (compare each order to ITS shopper's average) re-runs per outer row and answers a different question at a different cost. And when the filter list comes from a subquery via NOT IN, one NULL in the inner set poisons every comparison and empties the report — EXISTS or a NULL-guarded IN is the defensible form. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "asos-t7",
      q: "The drop-cadence report buckets orders by month on TEXT timestamps. How do you build the spine, cut a drop window without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The drop window: half-open intervals — created_at >= '2024-07-01' AND created_at < '2024-08-01' — because BETWEEN '2024-07-01' AND '2024-07-31' silently drops the last night's orders, and drop night is exactly when fashion orders land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The read itself: the book opens at 3,731.97, troughs at 1,193.86 in July — the month carrying 2 of the 7 abandonments — and the walk back up is what trading actually presents. Dispatch math is the same discipline in different clothes: julianday(shipped_at) - julianday(created_at) over the 82 stamped orders, 2.98 average, 2–4 band, and the 14 queued rows excluded by a stated rule, not by luck.",
      tag: "dates",
    },
    {
      id: "asos-t8",
      q: "Finance says a brand settlement statement is 'paid' but the payments table has no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN a per-statement fold of settlement legs, keep the NULL side — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The partial (#25: 4,000 of 6,148) needs the fold, not a naive join — five statements pay in two split legs Klarna-style, and joining legs before folding double-counts the billed side. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: coverage must read 21 settled in full / 1 partial / 6 never (15,217), and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "asos-mcq-1",
      prompt: "An order row's status reads 'delivered'. In this kit's ASOS stage map, what happened?",
      choices: ["Kept-and-settled — the order arrived and counted as kept", "Dispatched — with the warehouse, not yet delivered", "Abandoned pre-dispatch", "In the pick-pack queue"],
      answer: 0,
      why: "The stage map is fixed: delivered = kept-and-settled (52 of 103 orders, 50.5%). It is the only status where the order was actually kept.",
      notes: [
        { choice: 1, why: "Dispatched is 'shipped' — 30 orders in transit with shipped_at as the dispatch stamp. Calling them kept inflates the kept rate before a single parcel lands." },
        { choice: 2, why: "Abandoned pre-dispatch is 'cancelled' — 7 orders. Abandoned is a demand loss, not a kept order; mixing the two wrecks both rates." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-2",
      prompt: "Kept rate is delivered ÷ which population? The db holds 52 delivered, 30 shipped, 14 pending and 7 cancelled of 103 orders.",
      choices: ["Delivered + shipped only (52/82 = 63.4%)", "All orders placed (52/103 = 50.5%)", "Delivered + cancelled (52/59 = 88.1%)", "Distinct shoppers (52/16)"],
      answer: 1,
      why: "The house definition: kept ÷ ALL orders placed — queued and abandoned stay in the denominator because 'placed then not kept' is exactly what the metric measures. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 21 un-dispatched orders inflates the rate to 63.4% by deleting the population still in the funnel — the rows the placed-versus-kept gap exists to watch." },
        { choice: 2, why: "52/59 cherry-picks a tidy denominator that no stakeholder recognizes. Denominators come from the funnel's definition, not from whichever subset looks flattering." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-3",
      prompt: "EU carries 45 orders from 8 shoppers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts order rows (45); COUNT(DISTINCT customer_id) folds repeats back to shoppers (8). The gap between them — 5.6 orders per shopper — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every order has a shopper. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not shoppers — a third grain nobody asked for. The census is orders AND buyers." },
      ],
      difficulty: "easy",
    },
    {
      id: "asos-mcq-4",
      prompt: "A basket report joins orders to order_items and COUNT(*) reads 251, but the slide says 'orders'. What actually happened?",
      choices: ["The join duplicated 148 orders and must be deduplicated with DISTINCT on the SELECT list", "COUNT(*) now counts order LINES — 251 of them; count orders with COUNT(DISTINCT order_id) or pre-fold lines per order", "The db has 251 orders; the 103 figure was last quarter's", "SUM(total) was used instead of COUNT(*) somewhere upstream"],
      answer: 1,
      why: "The fan-out is the bug: 103 orders carry 251 lines (~2.4 per basket), and after the join COUNT(*) counts lines. Folding lines back — COUNT(DISTINCT order_id) — or staging a per-order fold in a CTE restores the order grain.",
      notes: [
        { choice: 0, why: "SELECT DISTINCT on whole rows hides the structure instead of naming it — the lines are real data, not duplicates, and DISTINCT is a bug mask, not a fix." },
        { choice: 2, why: "The facts are stable: 103 orders, 251 lines. The 251 is correct data counted at the wrong grain — a definition bug, not a freshness bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-5",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled orders only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandon share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the abandon map reads zero everywhere while the real shares are 8.1 / 6.7 / 5.3." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-6",
      prompt: "Keep only SKUs carrying at least 25 units sold. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 25, before GROUP BY", "GROUP BY sku HAVING SUM(quantity) >= 25", "WHERE quantity >= 25 on the raw lines", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A units-sold floor is a group-level fact over folded demand: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the ladder above 25 units runs 47, 46, 38, 36, 36, 33, 31, 30, 30, 30, 28, 27 — the fold decides, not the raw line.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "WHERE quantity >= 25 filters individual LINES (a basket rarely has 25 units of one SKU), silently zeroing the whole result instead of ranking SKUs by folded demand." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-7",
      prompt: "The drop-cadence walk runs LAG(month_revenue) OVER (ORDER BY month) over 14 buckets, 2024-01 to 2025-02. What does the first row's delta read?",
      choices: ["0 — there is no prior month, so the delta is zero", "NULL — there is no prior month to fetch; the baseline, never a zero", "The January value mirrored — LAG wraps around", "An error — LAG refuses the first row of a partition"],
      answer: 1,
      why: "LAG fetches the previous row's value; on the spine's first row there is none, so the delta is NULL by definition. NULL is the honest baseline — coalescing it to 0 reads as 'January was flat versus December', which is a claim nobody made.",
      notes: [
        { choice: 0, why: "A zero delta means 'no movement versus a real prior month'. January's 3,731.97 opener has no comparison — printing 0 invents one and flattens the story." },
        { choice: 2, why: "LAG does not wrap. The default looks one row back and stops at the partition edge — and that edge is the whole point of the question." },
      ],
      difficulty: "medium",
    },
    {
      id: "asos-mcq-8",
      prompt: "A dunning list uses statement_id NOT IN (SELECT invoice_id FROM payments) and returns ZERO rows — but 6 statements have no legs. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the dunning list empties while looking valid. Policy: LEFT JOIN ... IS NULL or NOT EXISTS for anti-joins, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "The correct answer here is 6 statements worth 15,217 — a confident zero is a bug mask. Anti-joins that return zero on a db with known gaps get re-checked, not shipped." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "asos-mcq-9",
      prompt: "A board stack puts settled statements above never-settled statements in one layout, built with UNION. A reviewer says one statement's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same statement, same amounts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same statement id, same amounts, no branch label — collapse into one, and the board loses a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated amount exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "asos-mcq-10",
      prompt: "A dashboard walks booked GMV order by order: SUM(total) OVER (ORDER BY created_at). Two orders share a created_at second, and the cumulative 'jumps two orders at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at order grain — drop night — they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-asos-1",
      tier: "easy",
      topic: "j7",
      universe: "catalog",
      title: "The assortment weight census",
      brief:
        "ASOS-flavored brief on the storefront db: Monday's trading review opens with the assortment weight census — which product lines carry the SKU book. Trading is explicit that the read is two-grain: distinct SKUs listed per line, units sold per line, and line revenue to 2 decimals, because the units leader and the revenue leader are different lines by design. Probed facts: 16 SKUs across 7 product types; 251 order lines over 103 orders worth 34,833.28; the probed crowns read the premium audio line (Audio) at 3 SKUs / 97 units / 11,744.01 revenue and the add-on line (Accessories) at 3 SKUs / 121 units / 3,294.29 — more units, a quarter of the value. The review reads biggest revenue first.",
      ask: "Return each product type with its distinct SKU count, total units sold and revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT p.category AS product_type,\n       COUNT({1} p.id) AS skus_listed,\n       SUM(oi.quantity) AS units_sold,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = {3}\nGROUP BY p.category\nORDER BY revenue {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the SKU deduplicator",
          why: "COUNT(DISTINCT p.id) folds repeat lines back to SKUs: the add-on line reads 3, not its dozens of order lines. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a catalog census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          why: "Revenue prints to 2 decimals — the premium line's 11,744.01. ROUND(…, 1) prints 11,744.0 and the crowns stop reconciling with the 34,833.28 book total trading quotes on the same slide.",
        },
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the catalog join key",
          why: "The join keys demand to catalog: p.id = oi.product_id attaches each line's SKU. Joining on oi.id instead matches order-line ids against SKU ids — a coincidental partial overlap that mislabels demand and corrupts every crown.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-revenue-first direction",
          why: "The review reads biggest revenue on top: 11,744.01 down to 863.91. ASC would open the meeting on the smallest line — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "oi.id", "ASC"],
      walkthrough:
        "One join, one fold, three columns at two grains. The join attaches every order line to its SKU — 251 lines over 103 orders — and GROUP BY product type folds them into seven rows where COUNT(DISTINCT p.id) reads SKUs listed (3 / 2 / 2 / 3 / 3 / 2 / 1 — the 16-SKU book), SUM(oi.quantity) reads units (97 / 53 / 61 / 85 / 121 / 54 / 27), and ROUND(SUM(quantity * unit_price), 2) reads revenue (11,744.01 / 6,929.12 / 5,198.41 / 4,818.61 / 3,294.29 / 1,984.93 / 863.91) — the probed crowns verbatim, reconciling up to the 34,833.28 book. The two-grain read is the story: the add-on line leads units (121) but prints 3,294.29 — basket filler priced to attach — while the premium line turns 97 units into 11,744.01. The distractors fail honestly: SUM in the SKU slot adds id codes together and MAX reports the largest id — a census of nothing; 1 in the precision slot truncates to one decimal and drifts off the book total; oi.id in the join key matches line ids to SKU ids and mislabels demand; ASC opens the review on the smallest line. Assortment weight is a policy read: where the units live is not where the money lives.",
    },
    {
      id: "cs-asos-2",
      tier: "medium",
      topic: "s6",
      universe: "refund-audit",
      title: "The settlement coverage census",
      brief:
        "ASOS-flavored brief on the storefront db: finance ops runs the brand settlement census at every close — 28 settlement statements (invoices) checked against 27 settlement legs (payments), where 5 statements pay in 2 split legs Klarna-style. The probed coverage rollup reads: 21 statements settled in full (65,612 billed, 65,612 settled), 1 partial (6,148 billed, 4,000 settled — statement #25), and 6 never-settled worth 15,217. Two anomalies sit in the row-level list: #11 is void at 925.00 yet carries a settlement leg, and #28 is paid-status at 1,756.00 with zero legs — a status that lies. Money is INTEGER cents; the dollar read is amount_cents / 100.0. Never-settled statements must be labelled and counted, not silently dropped.",
      ask: "Classify each statement's coverage (never settled / partial / settled), then return per bucket the statement count, billed and settled totals to 2 decimals, biggest bucket first.",
      template:
        "WITH paid AS (\n  SELECT invoice_id, SUM(amount_cents) AS paid_cents\n  FROM payments\n  GROUP BY invoice_id\n)\nSELECT CASE\n         WHEN pay.paid_cents IS NULL THEN {1}\n         WHEN pay.paid_cents < {3} THEN 'partial'\n         ELSE 'settled'\n       END AS coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed,\n       ROUND(SUM(COALESCE(pay.paid_cents, {2})) / 100.0, 2) AS settled\nFROM invoices i\nLEFT JOIN paid pay ON pay.invoice_id = i.id\nGROUP BY coverage\nORDER BY statements {4};",
      slots: [
        {
          answer: "'never settled'",
          kind: "keyword",
          label: "the empty-ledger label",
          why: "Statements with no settlement legs arrive from the LEFT JOIN with a NULL fold — CASE labels them 'never settled' and they stay counted. 'Settled' there would merge the 6 never-collected statements (15,217) into the healthy bucket and the dunning list dies silently.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the empty-fold fallback",
          why: "COALESCE(paid_cents, 0) makes the never-settled bucket's settled total print 0 instead of NULL — SUM over no legs is NULL, and the coverage rollup the close reconciles against prints 0 for that bucket.",
        },
        {
          answer: "i.amount_cents",
          kind: "keyword",
          label: "the billed-side comparison",
          why: "Partial means legs cover less than billed: pay.paid_cents < i.amount_cents. Comparing the fold to itself is always false and the partial bucket vanishes; comparing against the id mixes grains and mis-bands nearly every statement.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "The close reads the healthiest bucket first: settled 21, never settled 6, partial 1. ASC would lead the deck with the single partial statement — a correct census aimed at the wrong end of the review.",
        },
      ],
      distractors: ["100", "1", "NULL", "ASC"],
      walkthrough:
        "Two stages: fold the legs, then classify the statements. The CTE folds 27 legs into per-statement paid_cents — this pre-fold is what makes the 5 split-payment statements (2 legs each) sum once instead of double-counting the billed side — and the LEFT JOIN keeps all 28 statements, NULL fold included. The CASE reads the probed rollup exactly: 21 settled in full (billed 65,612, settled 65,612), 6 never-settled (15,217 billed, 0 settled — COALESCE prints the 0), and 1 partial (6,148 billed, 4,000 settled — statement #25), reconciling to the anomalies list where #11 is void-but-settled at 925.00 and #28 is paid-status with zero legs at 1,756.00, hidden inside the never-settled bucket. The /100.0 cents rule is why the cells match the probed dollars. The distractors each break differently: 100 in the fallback inflates the never-settled bucket's settled total to 600.00; 1 prints 0.06; NULL leaves the settled cell NULL where the rollup promises 0; 100, 1 or NULL dropped into the comparison slot mis-bands the partial — every fold clears 925, so the bucket vanishes and the partial hides inside settled; ASC leads the close with the 1-statement partial bucket. The census rule holds: every bucket counts, every label is a claim the legs must support.",
    },
  ],

  problems: [
    { slug: "basket-depth-aov", why: "Basket depth and AOV in one pass is the ASOS trading opener — 251 lines over 103 orders is the size-curve read, and this problem drills the two-metric fold the Monday review ships." },
    { slug: "weeks-of-supply", why: "Size curves sell unevenly, so stock cover per SKU is a replenishment input: weeks of demand the on-hand units can serve is exactly this problem's fold." },
    { slug: "cohort-repeat-revenue", why: "Did the drop-month shoppers come back? Cohort revenue walks with LAG mirror how the CRM pod reads drop-cohort repeat value." },
    { slug: "returns-rate-by-category", why: "The returns economy, category by category — a LEFT JOIN rate with the denominator stated, the closest pool analogue to ASOS's fit-driven return shares." },
    { slug: "customers-who-never-order", why: "Registered-but-never-bought is the top-of-funnel leak fashion retail watches; on this db the anti-join returns a confident zero and proving it is the exercise." },
    { slug: "most-frequently-ordered-product-per-customer", why: "The size-curve argmax: which SKU a shopper reorders most. Argmax per customer with a tie policy is exactly how merch picks the featured size." },
    { slug: "fix-product-name-format", why: "Catalog hygiene before any join: 16 SKUs arriving title-case-broken means 'asos design' versus 'ASOS DESIGN' silently splits one label into two." },
    { slug: "group-sold-products-by-the-date", why: "Drop-day reporting folds a day's demand into one row per date — GROUP_CONCAT of the SKUs a drop moved is the trading recap's raw shape." },
    { slug: "weather-type-in-each-country", why: "Market-level CASE classification over a join — the same shape as banding markets by abandon share (8.1 / 6.7 / 5.3) with exhaustive, ordered arms." },
    { slug: "user-activity-for-the-past-30-days-i", why: "App-first funnels read demand in trailing windows: orders and buyers in the last 30 days, filter placement in WHERE versus HAVING decided before writing." },
    { slug: "products-worth-over-invoices", why: "Demand versus settlement: SKUs whose sold value outstrips the statements that cover them — the pool analogue of the brand settlement audit." },
    { slug: "find-churn-risk-customers", why: "Lapsed shoppers drive the winback budget: no order in N days is an anti-join plus date math over the 2024-01 to 2025-02 spine." },
    { slug: "average-salary-of-departments", why: "Category AOV versus platform AOV (383.48 US versus 335.32 EU against 338.19) — the compare-group-to-global fold this problem drills." },
    { slug: "find-stores-with-inventory-imbalance", why: "Size curves guarantee imbalance: SKUs heavy on some units and light on others are the case this problem teaches finding with conditional aggregates." },
    { slug: "active-businesses", why: "One-pass status censuses: kept, dispatched, queued, abandoned in a single scan whose branches must reconcile to 103. Four sequential queries drift; one pass cannot." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The frequency king — 24 of 103 orders from one shopper — is a HAVING/argmax read that decides where the CRM pod's attention goes." },
  ],
};
