// Rakuten — Wave-8 (Task 96), ecom domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Ichiba-marketplace SQL: the storefront db read as a loyalty-commerce sandbox — customers are
// Rakuten members, orders are Ichiba purchase orders (delivered = completed and point-credited,
// shipped = dispatched with shipped_at as the dispatch stamp, pending = awaiting merchant
// dispatch, cancelled = abandoned before dispatch), order_items are order lines (quantity =
// units, unit_price = listing price), products are listings, suppliers are the six RMS shop
// merchants, and invoices/payments/expenses/ledger are the settlement books in INTEGER cents
// (dollar read: amount_cents / 100.0). Pool provenance: company-pools.md carries NO Rakuten
// section — 0 tagged rows — so all 10 topic slug sets and all 16 problems are theme-curated
// from the pools file's theme menu and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12); every case slot is mechanically verified
// against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const rakutenKit: CompanyKit = {
  id: "rakuten",
  domainId: "ecom",
  name: "Rakuten",
  tagline: "Japan's marketplace: loyalty points to logistics",
  accent: "text-red-400",

  brief: [
    "**Rakuten** is Japan's loyalty-commerce ecosystem: the Ichiba marketplace, where merchants build and run their own storefronts on RMS, wrapped in a points economy that loops every purchase into the next one. The db map: 16 members, 103 Ichiba orders worth **34,833.28**, and 251 order lines — quantity = units, unit_price = listing price — supplied by 6 RMS shop merchants. The status map is fixed: delivered = {emerald:completed} (52 of 103, 50.5%), shipped = {sky:dispatched} (30, 29.1%), pending = awaiting merchant dispatch (14), cancelled = {rose:abandoned} (7, 6.8%).",
    "The data org splits into Ichiba marketplace analytics, the points-and-loyalty team, and settlement analytics, and all three read the same spine at different grains. The points loop is the heartbeat: *point campaigns fund member balances, members roll points into the next order, merchants fund the campaigns*, so a completed order is both a revenue event and a points event. Repeat behavior is extreme — **14 of 16 members** reorder — and concentration is real: **63.5%** of revenue comes from members whose lifetime spend crosses 3,000 (71.2% above 2,000). One lost heavy member moves a quarter.",
    "Interview screens are census-then-denominator with a ranking-page accent. A typical loop opens with a **two-grain census** — EU runs 45 orders from 8 members (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a cancelled order sit in your base?'*), then into the {violet:ranking ladder}, where two listings tied at 36 units make rank semantics a policy decision rather than syntax. Late rounds walk the 14-month order spine (2024-01 to 2025-02) with LAG deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Rakuten section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: campaign funnels, two-grain member censuses, tie-heavy ranking ladders, point-band CASE logic and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {orange:merchant commission census} merchant ops opens every quarterly review with, the other rebuilds the {violet:units ladder} the merchandising board reads every cycle. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**09:00 —** The day starts with the points-and-ops dashboard refresh. Before standup an Ichiba analyst runs the one-pass status census — 52 completed + 30 dispatched + 14 pending + 7 abandoned = **103 by construction** — because a branch that fails that identity is *the day's first incident*, not a rounding note. Then dispatch: did the overnight merchant feeds stamp `shipped_at`, and does latency still sit near the **2.98-day** norm (82 of 103 stamped)? The 14 pending rows have no stamp yet — that is a population definition, not a cleanup job.",
    "**12:30 —** Midday is the merchant-and-ladder deep-dive. Merchant ops wants the commission census refreshed — Nordic Gadgets AB's {orange:32% share} of commissionable revenue — before the quarterly review; the merchandising board wants the units ladder with the 36-unit tie handled honestly — two listings sharing rung 4 under DENSE_RANK policy; a regional VP wants the cancellation map beside it (APAC 8.1% versus US 5.3%). Each ask is a join, a fold and one judgment call about ties or statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the review argument*.",
    "**16:30 —** The afternoon tilts toward settlement money. The AR anti-join refreshes first — **6 never-settled invoices worth 15,217** — before dunning sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the collections draft; and the anomaly list gets walked line by line: a void-but-settled invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Ichiba GMV", what: "Total order value booked: 34,833.28 across 103 orders, average 338.19 against a 25.47 to 1,088.44 spread. The headline every merchandising review tracks — and the spread IS the basket-tiering story." },
    { name: "Kept rate", what: "Completed orders ÷ ALL orders booked: 52 of 103 (50.5%). 'Orders placed versus orders kept' is the house read, and the denominator keeps pending and abandoned rows in by definition." },
    { name: "Dispatch latency", what: "created_at → shipped_at over the 82 stamped orders only: 2.98-day average, range 2 to 4. The population ships with the number — the 14 pending have no cycle yet and must not dilute it." },
    { name: "Cancellation share", what: "Abandoned ÷ placed, by region: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0.0. The member-trust map that sizes point-campaign fine print and payment-mode nudges." },
    { name: "Repeat-purchase rate", what: "Members with 2+ orders ÷ all members: 14 of 16. The points-economy proof — the loop only works if members come back, and two one-time buyers are the cohort to watch." },
    { name: "Member concentration", what: "Share of revenue from members whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000). The number that staffs the loyalty pod and sizes the VIP program." },
    { name: "Merchant concentration", what: "Top merchant share of commissionable revenue: Nordic Gadgets AB at 32%, Midwest Hardware Co at 26.7%. Merchant-ops' bargaining map for RMS terms and campaign funding." },
    { name: "Settlement coverage", what: "Completed versus settled: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The AR anti-join the settlement pod refreshes every close." },
  ],

  topics: [
    {
      name: "Campaign funnel counts",
      why: "Every Rakuten growth screen opens with the funnel: orders placed, dispatched (shipped_at stamped), completed with points credited. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a dispatched order 'completed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain member censuses",
      why: "Orders and members are different grains of the same join, and every census here reports both: EU runs 45 orders from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining members, merchants and listings",
      why: "Members carry region and created_at; orders inherit them through joins, and listings carry their RMS merchant through a second hop. The join type decides who survives — a line with no listing is corruption, a listing with no sales is a merchandising question — though on this db every listing sells, and proving that confident zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Ranking pages & leaderboards",
      why: "Ichiba's ranking culture is ladder reporting where ties are guaranteed — two listings sit at 36 units and three at 30 on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer listings, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Point-band CASE logic",
      why: "Point multiplicities and member tiers are CASE-classified — fixed edges the campaign page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the points liability, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "The 14-month order spine",
      why: "The 2024-01 to 2025-02 order spine is the merchandising call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate"],
    },
    {
      name: "Coverage set algebra",
      why: "Month-close packets stack populations — completed under abandoned, this quarter beside last — and EXCEPT answers 'which invoices have no settlement rows'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & platform means",
      why: "Screens escalate into staging: fold per-member order counts, then judge them against a computed platform mean. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, dispatched, pending and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Completed is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the member world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "rakuten-t1",
      q: "Your merchant census joins RMS shops to listings and then to order lines. When do you INNER and when do you LEFT — and what does the line-level join do to your row counts before the fold?",
      a: "Decide from the survival rule the question implies. A revenue census joins merchants to listings to lines: a line whose listing has no merchant is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from merchants: shops whose listings never sell ARE the answer, arriving with NULL line columns — though on this db the anti-join returns a confident zero, and proving that zero is the analyst's job: all 6 merchants have listings and every listing sells somewhere. The fan-out is the second half of the answer: joining order_lines multiplies each merchant to one row per sold line, so COUNT(*) after the join counts lines, not listings — the 251 lines versus 16 listings problem. COUNT(DISTINCT p.id) folds back to listings, COUNT(DISTINCT s.id) to merchants. Saying 'one row per what?' before every COUNT is the habit the panel grades.",
      tag: "joins",
    },
    {
      id: "rakuten-t2",
      q: "The merchandising ladder shows two listings tied at 36 units. RANK, DENSE_RANK or ROW_NUMBER — which do you ship, and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. On this db the ladder runs 47, 46, 38, then the 36-tie, then 33: DENSE_RANK reads 1, 2, 3, 4, 4, 5 — the next distinct count is 'fifth on the ladder', no phantom rungs. RANK reads 4, 4, then 6 — implying a fifth-place listing that does not exist, which a ranking page must then explain. ROW_NUMBER splits the tie arbitrarily and silently decides whose listing leads, which is a merchandising judgment nobody made. The wrong answer is picking a function; the right answer is picking a policy — Rakuten-style ranking pages share rungs (DENSE_RANK), and if a strict one-per-row display is forced, the tie-breaker (price, then listing id) is named in the query comment, not left to the engine's sort order.",
      tag: "windows",
    },
    {
      id: "rakuten-t3",
      q: "Members, orders, order lines: 16, 103, 251. Why do three COUNTs over the same join disagree, and which one does the board actually quote?",
      a: "They disagree because each counts at a different grain. COUNT(*) after joining order lines counts lines — 251 rows, one per unit-bundle sold. COUNT(DISTINCT o.id) folds repeats back to orders — 103. COUNT(DISTINCT customer_id) folds back to members — 16. None is wrong: lines measure catalog pressure, orders measure demand, members measure installed base — and the ratios between them are the basket reads, lines per order and orders per member, that merchandising actually manages. The trap that catches candidates is quoting 251 as 'orders' in a board deck: one number off by 2.5x and every downstream rate inherits the wrong denominator. The strong answer assigns a grain to each COUNT out loud, then picks the one the question names — 'orders booked' means 103, always has.",
      tag: "aggregation",
    },
    {
      id: "rakuten-t4",
      q: "shipped_at is NULL until a merchant dispatches. What is your policy for the dispatch-latency report, and how do the NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched orders have a latency, so the report measures created_at to shipped_at for the 82 of 103 orders that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL orders returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 abandoned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for orders still sitting in a merchant's queue. A report whose WHERE clause does definitional work without saying so is exactly what a Rakuten reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "rakuten-t5",
      q: "Regional kept revenue for regions carrying at least ten orders, abandoned demand excluded — where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status != 'cancelled' discards the 7 abandoned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-order floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it decides whether the floor applies to orders or to yen-denominated revenue. On this db EU (45), APAC (37) and the US (19) clear the floor while LATAM (2) drops out entirely — and the honest report says LATAM was excluded by definition, not forgotten.",
      tag: "pipeline",
    },
    {
      id: "rakuten-t6",
      q: "Which members' lifetime spend beats the platform's per-member average — and what does each subquery shape assume when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and spend > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full member table that is theoretical: 16 members always produce a mean. On filtered staging tables — one region, one campaign window — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each member to ITS region's average) re-runs per outer row and answers a different question at a different cost. The derived shape stages the fold and joins it back — the only form that carries the mean as a named column the reviewer can audit. Saying which population the inner fold covers, and its empty-case behavior, unprompted is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "rakuten-t7",
      q: "The board's monthly trend buckets TEXT timestamps across 14 months. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's orders, and month-end is exactly when point campaigns expire and orders land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The walk itself names the trough (1,193.86 in July) and the largest jump (+1,158.21 into August) — a trend report that cannot name its own extremes is decoration.",
      tag: "dates",
    },
    {
      id: "rakuten-t8",
      q: "A settlement invoice reads 'paid' but the payments table has no rows for it. Walk me through the first query you write — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 61.48 print into 61 and eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "rakuten-mcq-1",
      prompt: "An Ichiba order row's status reads 'delivered'. In this kit's Rakuten stage map, what happened?",
      choices: ["Completed — points credited and counts as kept", "Dispatched — on the way, not yet completed", "Abandoned — cancelled before dispatch", "Awaiting merchant dispatch"],
      answer: 0,
      why: "The stage map is fixed: delivered = completed (52 of 103 orders, 50.5%). It is the only status where the purchase finished and the points loop closed.",
      notes: [
        { choice: 1, why: "Dispatched is 'shipped' — 30 orders moving but not complete. Calling them completed inflates the kept rate before a single parcel lands." },
        { choice: 3, why: "Awaiting dispatch is 'pending' — 14 orders with no shipped_at yet. Pending is not churn and not kept; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-2",
      prompt: "Dispatch rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 stamped orders, 14 pending and 7 cancelled of 103 booked.",
      choices: ["Stamped + cancelled only (82/89 = 92.1%)", "All orders booked (82/103 = 79.6%)", "Delivered orders only (52/82)", "Distinct members (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL orders booked — pending merchant dispatches stay in the denominator because 'not yet dispatched' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the population still in merchant queues — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is completion, shipped_at is dispatch. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-3",
      prompt: "EU carries 45 orders from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts order rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 orders per member — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every order has a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not members — a third grain nobody asked for. The census is orders AND members." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled orders only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancellation share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the cancellation map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-5",
      prompt: "The merchant census keeps only RMS shops carrying at least 3 listings. How many of the 6 merchants survive, and which clause does the keeping?",
      choices: ["4 — GROUP BY merchant HAVING COUNT(DISTINCT product_id) >= 3", "4 — WHERE COUNT(*) >= 3", "2 — HAVING listing_count >= 3 on the raw suppliers table", "All 6 — WHERE listings >= 3"],
      answer: 0,
      why: "Nordic Gadgets AB, Midwest Hardware Co, Shenzhen Electro and Pacific Textiles carry 3 listings each; Alpine Audio GmbH and Andes Naturals SA carry 2 and drop. A listing-count floor is a group-level fact: HAVING after GROUP BY.",
      notes: [
        { choice: 1, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 3, why: "There is no 'listings' column on the suppliers table — the count only materializes at the fold over products. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-6",
      prompt: "The units ladder runs 47, 46, 38, then TWO listings tied at 36, then 33. Under DENSE_RANK, what rank does the 33-unit listing carry?",
      choices: ["5", "6", "4", "7"],
      answer: 0,
      why: "DENSE_RANK shares rungs without gaps: 1, 2, 3, then the tie at 4, 4, and the next distinct count lands on 5. The 33-unit listing is fifth on the ladder — no phantom rungs.",
      notes: [
        { choice: 1, why: "6 is the RANK answer — shared rungs plus a gap. The ranking page's published policy is DENSE_RANK; shipping RANK silently implies a fifth place that does not exist." },
        { choice: 2, why: "4 would mean folding the tie into one rung and promoting the 33-unit listing into it — that is neither RANK nor DENSE_RANK, it is a bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-7",
      prompt: "A partial settlement invoice is billed 6,148 cents with 4,000 cents settled. The report prints the balance as 21.48. Which expression produced it?",
      choices: ["(6148 - 4000) / 100.0", "(6148 - 4000) / 100", "ROUND(6148 - 4000) / 100", "(6148 - 4000) * 100.0"],
      answer: 0,
      why: "Invoice and payment money sits in INTEGER cents, so the dollar read is cents / 100.0: 2,148 cents prints 21.48. The .0 forces real division before the cents can be lost.",
      notes: [
        { choice: 1, why: "2148 / 100 is integer division — it truncates to 21 and the report quietly loses 48 cents on every odd-cent invoice. The classic settlement-pod leak." },
        { choice: 3, why: "Multiplying by 100 prints 214800 — cents read as dollars is the opposite direction of the conversion, and it inflates AR by four orders of magnitude." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-8",
      prompt: "A dunning list uses invoice_id NOT IN (SELECT invoice_id FROM payments) and returns ZERO rows on a staging copy. First suspicion?",
      choices: ["The zero is correct — every invoice has a settlement row", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the dunning list empties while looking valid. Policy: NOT EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db the anti-join legitimately returns the 6 never-settled invoices. Staging copies are exactly where NULLs sneak in, and empty dunning lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "rakuten-mcq-9",
      prompt: "A board stack puts completed orders under abandoned orders in one layout built with UNION. A reviewer says one member's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same member, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same member, same counts, no region or branch label — collapse into one, and the board loses a member with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "rakuten-mcq-10",
      prompt: "A dashboard walks GMV order by order: SUM(total) OVER (ORDER BY created_at). Two orders share a created_at second, and the cumulative 'jumps two orders at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict order-by-order walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at order grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-rakuten-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The merchant commission census",
      brief:
        "Rakuten-flavored brief on the storefront db: the quarterly Ichiba merchant review opens with the commission census — per-merchant commissionable line revenue, active listings and merchant rating, biggest revenue first — and merchant ops is explicit that commissionable revenue means LINE revenue, SUM(quantity × unit_price) over order lines, not order totals. Probed facts: six RMS merchants on the book; Nordic Gadgets AB leads at 11130.25 across 3 listings (rating 4.6), Midwest Hardware Co follows at 9294.93 (3, 4.4), then Alpine Audio GmbH 4765.63 (2, 4.8), Andes Naturals SA 3613.25 (2, 4), Shenzhen Electro 3049.07 (3, 4.1) and Pacific Textiles 2980.15 (3, 3.9). The review reads biggest revenue first.",
      ask: "Return each merchant with its rating, distinct listing count and commissionable line revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name AS merchant,\n       s.rating AS merchant_rating,\n       COUNT(DISTINCT p.id) AS listings,\n       ROUND(SUM(oi.quantity * oi.unit_price), {1}) AS commission_revenue\nFROM suppliers s\nJOIN products p ON p.{2} = s.id\nJOIN order_items oi ON oi.product_id = {3}\nGROUP BY s.id, s.name, s.rating\nORDER BY commission_revenue {4};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          why: "Line revenue reports to 2 decimals — Nordic's 11130.25. ROUND(…, 1) prints 11130.3 and the census stops reconciling with the shares table merchant ops quotes on the same slide (Nordic 32%).",
        },
        {
          answer: "supplier_id",
          kind: "keyword",
          label: "the merchant linkage",
          why: "Listings attach to merchants through products.supplier_id. Joining on p.id pairs product ids with supplier ids and silently re-mixes every merchant's revenue while the query still runs — the worst kind of wrong.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the listing linkage",
          why: "Order lines reference listings by product_id — oi.product_id = p.id is the only join that attaches sold units to the right listing. Substituting s.id re-pairs lines to merchants and scrambles the fold.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest revenue on top: Nordic 11130.25 down to Pacific 2980.15. ASC opens the meeting on the smallest merchant — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["1", "0", "ASC", "COUNT", "s.id", "MAX"],
      walkthrough:
        "Three tables, one fold, two grains. The join chain runs suppliers → products on supplier_id, then products → order_items on product_id, so each merchant's row fans out to its sold lines — which is why COUNT(DISTINCT p.id), not COUNT(*), reads listings: Nordic's 3 versus Alpine's 2. The fold is ROUND(SUM(oi.quantity * oi.unit_price), 2) — line revenue, not order totals — and reproduces the probed census exactly: Nordic 11130.25, Midwest 9294.93, Alpine 4765.63, Andes 3613.25, Shenzhen 3049.07, Pacific 2980.15. The distractors fail honestly: precision 1 truncates the revenue column off the probed figures (11130.3) and precision 0 flattens it to integers; joining products on p.id = s.id pairs product ids with merchant ids and re-mixes every merchant's book; oi.product_id = s.id does the mirror-image damage on the other hop; ASC flips the read so the review opens on Pacific's 2980.15; COUNT and MAX inside ROUND or ON are aggregate-in-aggregate errors. The business read: Nordic's 32% and Midwest's 26.7% shares mean the top two merchants carry the majority of commissionable revenue — the concentration merchant ops watches every quarter.",
    },
    {
      id: "cs-rakuten-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The ranking ladder",
      brief:
        "Rakuten-flavored brief on the storefront db: the merchandising board reads the cross-merchant units ladder every cycle — units moved per listing, ranked with shared rungs (DENSE_RANK) so tied listings sit together, and only listings that cleared the 30-unit floor make the page. Probed facts: Desk Mat Extended leads at 47 units, Noise-Canceling Headset follows at 46 (down to 14 remaining from 60 stocked), HDMI 2.1 Cable 2m at 38, then the tie — Wireless Mouse M3 and Laptop Stand Aluminum both at 36, sharing rung 4 — Running Socks 3-pack at 33, 4K Webcam Pro at 31, and three listings tied at 30 (Studio Desktop Mic, Ring Light 14\", Fitness Band X2) sharing rung 7. Ten listings clear the floor.",
      ask: "Return each qualifying listing with its category, units sold and shared-rung ladder rank, biggest units first.",
      template:
        "SELECT p.name AS listing,\n       p.category AS category,\n       SUM(oi.quantity) AS units_sold,\n       {1}() OVER (ORDER BY SUM(oi.quantity) DESC) AS ladder_rank\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id, p.name, p.category\nHAVING SUM(oi.quantity) >= {2}\nORDER BY units_sold {3};",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the shared-rung ranker",
          why: "DENSE_RANK shares rungs without gaps — the 36-tie reads 4, 4 and the next distinct count lands on 5. RANK implies a phantom fifth rung; ROW_NUMBER splits tied listings arbitrarily.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the ranking-page floor",
          why: "The 30-unit floor is the cutoff — ten listings clear it, and 30 itself appears as the units of the three tied rows. A floor of 31 silently deletes the Studio Mic / Ring Light / Fitness Band tier.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-units-first direction",
          why: "The ladder reads biggest units on top: Desk Mat's 47. ASC would open the page on the three 30-unit listings — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "LEAD", "MIN", "31", "ASC"],
      walkthrough:
        "One fold, one window, one floor. The join attaches every order line to its listing, GROUP BY p.id folds them to units — SUM(oi.quantity) reading 47, 46, 38, 36, 36, 33, 31, 30, 30, 30 after the HAVING floor — and DENSE_RANK() OVER (ORDER BY SUM(oi.quantity) DESC) paints the rungs: 1 through 7, with the 36-tie sharing 4 and the 30-tie sharing 7. The floor is the whole ranking-page story: HAVING SUM(oi.quantity) >= 30 drops the six sub-floor listings, and because the window computes after the fold, the ranks run over exactly the ten qualifying rows. The distractors break honestly: RANK stamps 4, 4, 6 — implying a phantom fifth rung the tie block occupies; ROW_NUMBER splits the ties arbitrarily and picks a winner nobody chose; LEAD and MIN are misused as rankers — one errors on arity, the other paints running values instead of rungs; a floor of 31 silently deletes the three 30-unit listings; ASC flips the ladder so Desk Mat sits at the bottom. The policy read: shared rungs without gaps is the ranking-page convention — two listings tied at 36 are 'both fourth', never 'fourth and fifth'.",
    },
  ],

  problems: [
    { slug: "percentage-of-users-attended-a-contest", why: "Point-campaign participation: the share of members who placed a campaign order out of all members. A distinct-count share with the denominator stated — the weekly pulse of every campaign read." },
    { slug: "immediate-food-delivery-ii", why: "Same-cycle dispatch: orders whose merchant dispatch landed inside the promised window. A conditional rate over a timestamp comparison — the shape of the dispatch-SLA read Rakuten ops ships weekly." },
    { slug: "repeat-purchase-rate", why: "The points loop only works if members come back: 14 of 16 members on this db reorder. This problem drills exactly the repeat census the loyalty team reads every Monday." },
    { slug: "unique-orders-and-customers-per-month", why: "The monthly two-grain census — orders booked AND members active per month — is the chart Ichiba ops opens every review with; this problem is that chart at practice scale." },
    { slug: "rank-scores", why: "The ranking ladder ranks listings by units with guaranteed ties — 36 twice and 30 three times on this db. Shared rungs versus gaps is a policy decision this problem forces you to make." },
    { slug: "top-earners", why: "Top merchant by commissionable revenue — the ranking the merchant-ops pod refreshes before every quarterly review. Aggregation plus a top-N cut over the RMS book." },
    { slug: "weather-type-in-each-country", why: "Point-multiplicity bands are CASE-classified per region — exhaustive, ordered arms that partition the member base without holes. Same shape, loyalty-program labels." },
    { slug: "calculate-special-bonus", why: "Campaign bonus eligibility: a flag rule — NULL-safe, status-aware — applied per row before the fold. The point-campaign credit job's core move, exactly this shape." },
    { slug: "rfm-segmentation", why: "Member point tiers are RFM tiles — recency, frequency, monetary — cut with NTILE. The loyalty team's segmentation spine, in one query you can rebuild from memory." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Basket reads: which orders carry line quantities above the platform mean. A two-stage fold — compute the mean, then filter against it — exactly the tier-gate screen." },
    { slug: "active-businesses", why: "One-pass status censuses: completed, dispatched, pending, abandoned in a single scan whose branches must reconcile to COUNT(*). Four sequential queries drift; one pass cannot." },
    { slug: "bank-account-summary-ii", why: "The settlement pod's monthly rollup: per-account folds with cents-safe arithmetic. INTEGER cents and the /100.0 rule make this exact practice for the settlement true-ups." },
    { slug: "fix-names-in-a-table", why: "RMS shop-name hygiene before any join: merchant exports arrive case-broken, and 'akiba audio' versus 'Akiba Audio' silently splits one merchant into two in the census." },
    { slug: "confirmation-rate", why: "Member contact quality: the share of orders confirmed against the requested window. A per-group rate with an honest denominator — the trust read behind the cancellation map." },
    { slug: "monthly-transactions-ii", why: "Settlement coverage stacks: exact, partial, none in one UNION ALL + CASE layout. The month-close packet's shape, exactly — with the no-dedupe rule attached." },
    { slug: "basket-depth-aov", why: "Basket depth and AOV together: lines per order beside value per order. The merchandising pair that turns 251 order lines into a catalog story the board can act on." },
  ],
};
