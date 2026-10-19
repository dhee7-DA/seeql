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
    "Preparation strategy: the pools file carries no Rakuten section — 0 tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: campaign funnels, two-grain member censuses, tie-heavy ranking ladders, point-band CASE logic and the cents-safe settlement spine. Do the topics in order, then run the **six case studies** on the live storefront db: the {orange:merchant commission census} merchant ops opens every quarterly review with, the {violet:units ladder} the merchandising board reads every cycle, the 103-by-construction status census, the settlement rail stack with its TOTAL row, the two-grain regional census, and the 14-month GMV spine walk. Pair them with the 32-problem pool for spaced practice rather than one sitting — run each case on the live db, then re-run it a week later from a blank editor. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Two-grain member censuses",
      why: "Orders and members are different grains of the same join, and every census here reports both: EU runs 45 orders from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "find-loyal-customers", "immediate-food-delivery-ii", "confirmation-rate"],
    },
    {
      name: "Joining members, merchants and listings",
      why: "Members carry region and created_at; orders inherit them through joins, and listings carry their RMS merchant through a second hop. The join type decides who survives — a line with no listing is corruption, a listing with no sales is a merchandising question — though on this db every listing sells, and proving that confident zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Ranking pages & leaderboards",
      why: "Ichiba's ranking culture is ladder reporting where ties are guaranteed — two listings sit at 36 units and three at 30 on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer listings, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Point-band CASE logic",
      why: "Point multiplicities and member tiers are CASE-classified — fixed edges the campaign page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the points liability, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store", "count-salary-categories"],
    },
    {
      name: "The 14-month order spine",
      why: "The 2024-01 to 2025-02 order spine is the merchandising call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate", "report-contiguous-dates", "fix-names-in-a-table"],
    },
    {
      name: "Coverage set algebra",
      why: "Month-close packets stack populations — completed under abandoned, this quarter beside last — and EXCEPT answers 'which invoices have no settlement rows'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order", "sellers-with-no-sales", "customers-who-bought-all-products"],
    },
    {
      name: "Nested folds & platform means",
      why: "Screens escalate into staging: fold per-member order counts, then judge them against a computed platform mean. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, dispatched, pending and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "sales-by-day-of-the-week"],
    },
    {
      name: "Billing & cents discipline",
      why: "Completed is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the member world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "gl-reconciliation", "monthly-transactions-i", "repeat-purchase-rate", "rfm-segmentation", "basket-depth-aov"],
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
    {
      id: "rakuten-t9",
      q: "The GMV walk needs a cumulative curve AND a rolling four-month average beside it. Build both windows — and tell me where ROWS versus RANGE decides the answer.",
      a: "Cumulative: SUM(gmv) OVER (ORDER BY month) — the default frame with ORDER BY is RANGE UNBOUNDED PRECEDING to CURRENT ROW, which accumulates in month order. Rolling: AVG(gmv) OVER (ORDER BY month ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) — this month plus the prior three, updating per row. ROWS is the row-true frame; RANGE is the value-true one, and on a TEXT month key RANGE with a numeric offset errors outright, so pre-bucketed spines take ROWS. The edge rows are the honesty test: the first three months carry partial frames (1, 2, 3 rows), and the average of one month is not a four-month average — flag the warm-up rows or start the report at month four. This number steers campaign budget, so the frame definition belongs in the deck footnote: which months, inclusive, over which bucket key.",
      tag: "windows",
    },
    {
      id: "rakuten-t10",
      q: "The ops board gets completed, dispatched, pending and abandoned in ONE scan. Show me the FILTER shape — and the identity that proves the census is complete.",
      a: "COUNT(*) FILTER (WHERE status = 'delivered') — one arm per column, four columns, one row, one scan of the 103 orders: 52, 30, 14, 7. The arms share a population by construction, so they cannot drift the way four separate queries drift when someone edits one WHERE and not the others. The identity is the proof of work: 52 + 30 + 14 + 7 = 103 = COUNT(*) — a census that doesn't reconcile to the base is hiding a status value the arms forgot. The portable twin is SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), which composes further — inside an AVG for conditional means, inside a ratio for kept-rate shares. The delivered arm is also where the points loop closes: 52 completed orders is 52 point-credit events, and that column is what the loyalty team reconciles against points issued.",
      tag: "aggregation",
    },
    {
      id: "rakuten-t11",
      q: "The merchant whitespace report LEFT JOINs shops to sold lines and prints NULL revenue for a shop with no sales. Where does COALESCE go — and why does the per-row version fail?",
      a: "Outside the aggregate: COALESCE(SUM(oi.quantity * oi.unit_price), 0). The NULL isn't a row value — it's the aggregate's answer for an empty group, and no amount of per-row guarding conjures rows that don't exist. SUM(COALESCE(..., 0)) fixes sparse inputs inside groups the join found; a shop with zero matching lines never reaches it. The policy I state per column: revenue columns zero-fill for display — the stakeholder reads 0, not a blank; count columns keep NULL when zero would be a lie. On this book the zero-fill is latent — all 6 RMS shops sell and every listing moves — but the shape matters the day a merchant pauses their storefront, and the whitespace report is exactly the screen that must print a confident 0 instead of a hole.",
      tag: "nulls",
    },
    {
      id: "rakuten-t12",
      q: "A weekly revenue SUM doubles after you join orders to order lines — 103,244.55 against a true 34,833.28. Walk me through the diagnosis and the two honest fixes.",
      a: "Diagnose by counts: COUNT(*) on orders alone is 103; after the join it's 251 — the jump IS the fan-out, each order repeated once per line. SUM(o.total) then pays every order 251/103 ≈ 2.44 times on average, revenue-weighted 2.97x on this db. Fix one — pre-aggregate: fold revenue per order in a CTE (SUM by order_id), then join that one-row-per-order fold to whatever dimension the report needs. Fix two — line-grain truth: compute revenue at the line grain, SUM(quantity × unit_price), and never reference o.total after the join. The habit the number teaches: after any join, SUM a column only if you can say which grain it lives at — 'total is order-grain' and 'line revenue is line-grain' are different claims, and mixing them is how a board deck prints 103,244.55 with a straight face.",
      tag: "joins",
    },
    {
      id: "rakuten-t13",
      q: "IN, EXISTS, or a derived table for the never-settled dunning list — and which one survives a NULL on a staging copy?",
      a: "NOT IN materializes the subquery's list and compares every outer row against it — the moment one NULL enters the list, every comparison lands UNKNOWN and the dunning list empties silently while looking valid. NOT EXISTS probes row by row, short-circuits on the first match, and can't be poisoned by NULLs because there's no list — that's the correctness-first default for existence tests. LEFT JOIN + IS NULL returns the same answer with the unmatched population visible, which makes it the audit-friendliest: you can count the six never-settled statements (15,217 in cents) and eyeball the paid-status anomaly among them. The derived shape stages the fold — per-invoice paid sums — and joins it back, the only form that carries the numbers as named columns a reviewer can audit. The rule I ship: NOT EXISTS for correctness under any data, LEFT JOIN IS NULL when the analyst needs to see the population, NOT IN only over columns provably NOT NULL.",
      tag: "subqueries",
    },
    {
      id: "rakuten-t14",
      q: "The month-close packet stacks card-rail settlements on wire-rail settlements. UNION or UNION ALL — and what actually decides it?",
      a: "UNION ALL, and the reason is a business argument, not a preference: the two rails are disjoint populations — card ran 16 movements worth 37,364.00 against wire's 11 movements at 32,248.00, and a payment moves by one method, never both — so a dedupe pass would be work spent proving nothing. UNION earns its keep when the branches can genuinely overlap: this month's open statements re-scanned beside last month's, where one statement could appear twice and the packet should show it once. The failure mode to narrate: two branches emitting byte-identical rows — same invoice, same cents — collapse silently under UNION, and the close loses a settlement with no error anywhere. The discipline is to state the disjointness in a comment where the reviewer can audit it: 'card and wire are mutually exclusive by method' — that sentence is the correctness argument UNION ALL rests on.",
      tag: "set-ops",
    },
    {
      id: "rakuten-t15",
      q: "Which Rakuten reads are EXCEPT and INTERSECT reads — and when does a set operator beat the join it replaces?",
      a: "Set algebra answers set-membership questions: 'members who ordered in H1 but never in H2' is the H1 member set EXCEPT the H2 set — one operator, the winback file, no join gymnastics and no fan-out. INTERSECT answers the mirror: members active in both halves — the loyalty constants the retention deck leads with. Two honesty points: both operands dedupe first, so EXCEPT reports SETS — if the question is 'which orders' or counts matter, the multiset tool is a LEFT JOIN with IS NULL; and both sides need matching column lists, which is why each side is staged as its own SELECT with named columns. The habit that transfers: state each side's population out loud before the operator — 'H1 buyers, this many members' minus 'H2 buyers, that many' — and the operator becomes a sentence the stakeholder can audit instead of a symbol they trust on faith.",
      tag: "set-ops",
    },
    {
      id: "rakuten-t16",
      q: "An RMS merchant export arrives case-broken and space-padded — 'akiba audio ' beside 'Akiba Audio'. What is your normalization discipline before any join or GROUP BY?",
      a: "Normalize once, at the key: GROUP BY UPPER(TRIM(name)) — or better, land the clean form in its own column so every downstream query inherits it. UPPER folds the case; TRIM strips the padding that NOCASE never touches; and the pair matters because exports ship both defects at once — one merchant wearing two keys splits its revenue across two census rows, and the merchant-ops review under-counts it. The discipline I hold: normalization is a keying decision, not a display decision — the display name keeps its original form (COALESCE the first-seen spelling), while the join key is the canonical fold. And the trap to name: SQLite's = is case-sensitive for TEXT while LIKE is not — so the same merchant name can join-fail and LIKE-succeed on adjacent rows, which is exactly how a split shop survives two audits.",
      tag: "strings",
    },
    {
      id: "rakuten-t17",
      q: "The dispatch-latency read runs on TEXT timestamps. How do you compute the merchant cycle, and where do the calendar's edges cut?",
      a: "julianday(shipped_at) - julianday(created_at) — both TEXT stamps convert to a real day number, the difference is the cycle in days with a fraction, and ROUND(..., 0) prints whole days: the 82 stamped orders average 2.98 with a 2-to-4 range. The edges: '%d' extracts day-of-month and breaks at any month boundary (a Jan-31 → Feb-02 dispatch reads -29), so extraction functions label parts, they don't do arithmetic; TEXT minus TEXT coerces both sides to the year number and reads zero. julianday on a NULL shipped_at returns NULL, which is the population honesty — 14 pending orders have no dispatch yet and AVG silently skips them, so the title carries its own denominator: 2.98 days over 82 stamped orders, not 'over all orders'. Window predicates stay half-open — created_at >= '2024-01-01' AND created_at < '2024-02-01' — because BETWEEN on the last day drops every intraday order, and month-end is exactly when point campaigns expire.",
      tag: "dates",
    },
    {
      id: "rakuten-t18",
      q: "Give me three ways to answer 'each member's most-ordered listing' — and how each behaves when two listings tie.",
      a: "Window argmax: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY units DESC, product_id) = 1 inside a CTE — one deterministic row per member even on ties, because the second key breaks the tie and the query comment says which key won. Join-back on the maximum: join to a per-member MAX(units) derived table — honest, but it returns BOTH tied listings, which is either a feature (report all co-leaders on the campaign page) or noise (double-counted members in the segment) depending on the ask. Correlated filter: WHERE units = (SELECT MAX(...) for that member) — same tie behavior as the join-back, with per-row re-evaluation cost. The tie is the whole question: the ranking-page policy decides whether tied listings share the rung or the tiebreak picks, and naming the divergence — ROW_NUMBER decides, join-back reports, correlated simplifies — is the complete answer.",
      tag: "windows",
    },
    {
      id: "rakuten-t19",
      q: "Why is an average of regional AOVs wrong, and what do you compute instead?",
      a: "Because it weights every region equally regardless of size. On this db the regional AOVs are EU 335.32 (45 orders), APAC 313.66 (37), US 383.48 (19) and LATAM 426.22 (2) — averaging those four numbers gives 364.67, which describes a marketplace that does not exist. The true all-orders AOV is SUM(total)/COUNT(*) over the base rows: 338.19, where LATAM's two orders barely register. The honest blends are re-aggregation from the base (sum the numerators, divide by the summed denominators) or a weighted average — SUM(aov * orders)/SUM(orders) — the same arithmetic one level up. The interview move is saying WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and that is a claim you should have to defend, not assume — especially in a marketplace where one region's two orders are a rounding error and another's forty-five are the business.",
      tag: "aggregation",
    },
    {
      id: "rakuten-t20",
      q: "Invoices and payments store INTEGER cents on the settlement spine. Where do numeric bugs bite, and what is your rounding policy?",
      a: "Three bite points. Scale: amount_cents = 6148 is 61.48, and amount_cents / 100 is integer division — 61 flat; divide by 100.0 or convert once at the presentation edge. Mid-pipeline rounding: ROUND inside the calculation discards precision that a later SUM still needed — round only what a human reads. Float drift: SQLite REALs are IEEE doubles, so compare money with a tolerance or keep it in integer cents until the last step. The policy I state in reviews: aggregate in cents, convert once, round at the edge, and let the trial balance prove it — this ledger closes with 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route. A settlement number that survives that chain is a number the finance controller will sign.",
      tag: "numbers",
    },
    {
      id: "rakuten-t21",
      q: "The one-pass status census slowed from milliseconds to seconds as the order feed grew. How do you think about an index here — and when is the right answer 'don't'?",
      a: "Read the plan first: EXPLAIN QUERY PLAN shows a full table SCAN on orders for the status arms and the month predicate — the census reads every row to keep 52. A composite index on (status, created_at) turns the delivered arm into a seek — but the win is workload-dependent: on a 103-order dev db the scan IS the fast plan, and the index is pure write overhead. Indexes pay when the table outgrows memory and the query's selectivity is high — status filters and date ranges qualify; they cost on every ingest (the merchant feed writes constantly) and they multiply with every new filter combination the ops board grows. The honest answers are 'don't — the table is small', 'one composite index covering the hot filter pair, measured', or 'the real fix is a pre-aggregated daily rollup the census reads instead of the raw feed' — the third is the marketplace answer, and it's usually the one the interviewer wants described.",
      tag: "performance",
    },
    {
      id: "rakuten-t22",
      q: "The month-close packet needs: monthly GMV, per-member spend bands, and the never-settled invoice list. One query or several — and how do CTEs carry it?",
      a: "One statement, staged: WITH monthly AS (the SUBSTR month fold over orders), member_spend AS (the per-member SUM), coverage AS (the LEFT JOIN to payments with the exact/partial/none CASE) — then the final SELECT assembles what the close reads. Each CTE is one grain with one name, which is the whole value: the controller auditing the packet can SELECT from any stage mid-pipeline, and a definition fight ('what counts as exact again?') resolves by reading the CTE, not by re-deriving the query. Reuse matters — member_spend feeds both the band census and the points-liability accrual, written once. The discipline that keeps it honest: filter early inside each stage (status, date bounds), keep every CTE single-purpose, and resist the urge to make the final SELECT clever — by the time the packet assembles, the thinking should already be done in the stages. One statement also means one review and one execution plan, which is how the close ships on time.",
      tag: "ctes",
    },
    {
      id: "rakuten-t23",
      q: "A stakeholder says the loyalty dashboard moved overnight. Which SQL checks do you run in the first ten minutes?",
      a: "Five, in order. Freshness: MAX(created_at) per source table — a merchant feed that stopped at 02:00 explains most surprises by itself. Volume: today's row count versus the 7-day average, because a half-loaded feed halves every downstream number. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for feed-retry duplicates. Orphans: an anti-join of fact keys against the dimension to catch reference-integrity breaks. NULL spikes: COUNT(shipped_at) versus COUNT(*) — a stamp column that went sparse will empty every dispatch-latency read built on it. On this storefront, that ritual is exactly how the paid-no-settlement invoice (#28, 1,756.00) surfaces: status says paid, payment rows say zero. The deliverable is not 'it looks fine' — it is which check passed and when it last ran.",
      tag: "data-quality",
    },
    {
      id: "rakuten-t24",
      q: "The loyalty lead asks for 'our repeat rate'. What do you pin down before writing a single line of SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the event (orders placed, or orders kept after cancellations?), the numerator (members with 2+ orders — 14 of 16 on this db), the denominator (all members ever, or members active in the window — the two definitions can disagree by double digits), and the time window (calendar month, trailing 90 days, lifetime?). Then the discipline move: encode the definition as a named CTE — repeat_members AS (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 2) — so the SQL IS the definition and the reviewer can audit it instead of arguing with you. The points economy makes this sharper than most shops: 'repeat' is the claim that the loop works, so a vibes-based definition doesn't just muddy a deck — it mis-prices the campaign budget. The analyst who says 'repeat means two or more placed orders, cancelled included, trailing quarter' owns the room.",
      tag: "metrics",
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
    {
      id: "rakuten-mcq-11",
      prompt: "The dispatch clock averages 2.98 days over the 82 stamped orders. Which expression computes each order's latency from the TEXT timestamps?",
      choices: [
        "shipped_at - created_at",
        "julianday(shipped_at) - julianday(created_at)",
        "STRFTIME('%d', shipped_at) - STRFTIME('%d', created_at)",
        "julianday(shipped_at) - created_at",
      ],
      answer: 1,
      why: "Timestamps are TEXT; julianday converts both to a real day number before subtracting — 2-to-4 day diffs averaging 2.98. TEXT minus TEXT coerces both to the year number and reads 0 for every order.",
      notes: [
        { choice: 0, why: "'2024-01-05' - '2024-01-02' coerces both sides to 2024 and subtracts — a flat 0-day clock. The feed's latency would read as instant dispatch." },
        { choice: 2, why: "'%d' is day-of-month: a Jan-31 → Feb-02 dispatch reads -29 days. Calendar arithmetic needs full dates, not extracted parts." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-12",
      prompt: "The trend tile buckets orders with STRFTIME('%m', created_at) and shows 12 buckets for 14 months of data. What happened?",
      choices: [
        "Two months genuinely had zero orders",
        "'%m' drops the year — January 2024 merges with January 2025 into one bucket",
        "STRFTIME cannot return more than 12 buckets",
        "The tile needs DISTINCT before it will count months",
      ],
      answer: 1,
      why: "'%m' alone is month-of-year: '2024-01' and '2025-01' both read '01' and fold into one bucket — 14 months collapse to 12 and the trend lies by collision. The spine key is '%Y-%m' (or SUBSTR(created_at, 1, 7)).",
      notes: [
        { choice: 0, why: "On this db every month from 2024-01 to 2025-02 carries orders — the two 'missing' buckets are the two Januarys wearing one label." },
        { choice: 2, why: "STRFTIME returns whatever the format asks — '%Y-%m' yields 14 distinct buckets. The cap is in the format string, not the function." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-13",
      prompt: "Merchant ops wants one row per RMS shop with the shop's listing names comma-joined into a single cell. Which fold produces the manifest?",
      choices: [
        "GROUP_CONCAT(p.name, ', ') over the shop's listings, grouped by merchant",
        "CONCAT(p.name, ', ') GROUP BY merchant",
        "STRING_AGG(p.name, ', ') GROUP BY merchant",
        "COUNT(p.name, ', ') GROUP BY merchant",
      ],
      answer: 0,
      why: "GROUP_CONCAT is SQLite's row-to-string fold: 16 listings collapse to 6 merchant rows, names joined with the separator. CONCAT is scalar (one row in, one string out) and STRING_AGG doesn't exist in SQLite — neither folds rows.",
      notes: [
        { choice: 1, why: "CONCAT never folds rows — it concatenates one row's values. The manifest needs an aggregate that eats the listing rows and prints one cell per shop." },
        { choice: 3, why: "COUNT counts non-NULL inputs and takes no separator — it prints a tally wearing a manifest's name." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-14",
      prompt: "Kept rate is completed orders over ALL orders booked — 52 of 103. Which one-pass arm computes it without shrinking the base?",
      choices: [
        "SELECT 100.0 * COUNT(*) / COUNT(*) FROM orders WHERE status = 'delivered'",
        "SELECT 100.0 * COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*) FROM orders",
        "SELECT 100.0 * COUNT(status = 'delivered') / COUNT(*) FROM orders",
        "SELECT 100.0 * SUM(total) / COUNT(*) FROM orders",
      ],
      answer: 1,
      why: "FILTER scopes the count to the 52 completed orders while COUNT(*) keeps all 103 in the denominator: 100.0 × 52 / 103 = 50.5. The filter lives inside the aggregate, so the base never shrinks.",
      notes: [
        { choice: 0, why: "Filtering first makes numerator and denominator the same 52 — the query prints 100.0 with total confidence and no information." },
        { choice: 2, why: "COUNT(boolean) counts every row — the 0/1 result is never NULL, so the numerator reads 103 wearing 52's name." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-15",
      prompt: "The merchant board runs a top-3 query with LIMIT 3 but no ORDER BY, and the three rows reshuffle between runs. Why?",
      choices: [
        "SQLite shuffles results for performance",
        "LIMIT without ORDER BY returns an arbitrary three — SQLite guarantees no row order without one",
        "The census has tied values, and LIMIT always picks ties at random",
        "LIMIT 3 caps columns, not rows",
      ],
      answer: 1,
      why: "Row order is undefined unless ORDER BY says otherwise — LIMIT just cuts whatever order the engine happened to produce, and that can change between runs. A top-N is always ORDER BY + LIMIT, with a tiebreak column for reproducibility.",
      notes: [
        { choice: 2, why: "Ties make it worse, but the disease is the missing ORDER BY — even tie-free tables carry no order guarantee. Fix the clause, not the data." },
        { choice: 3, why: "LIMIT caps rows. A query returning three rows is not the same query returning the RIGHT three rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-16",
      prompt: "After joining members to orders to order lines, a teammate reports '16 members' with COUNT(*) — but the printout shows 251. What does COUNT(*) count here?",
      choices: [
        "Members — 16, the join preserves the member grain",
        "Orders — 103, one row per purchase",
        "Order lines — 251, one row per sold line: the fan-out grain",
        "Listings — 16, one row per product",
      ],
      answer: 2,
      why: "COUNT(*) counts joined rows, and the join fans each order across its lines: 103 orders × their lines = 251. The member count needs COUNT(DISTINCT customer_id); the 251 is the line grain wearing the member read's name.",
      notes: [
        { choice: 0, why: "Joins never preserve grain by intention — they preserve rows. The fan-out multiplied each member to one row per line they bought." },
        { choice: 3, why: "Listings are 16 distinct products, but the join's row grain is lines-sold, not products — COUNT(DISTINCT product_id) would fold to 16 listings." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-17",
      prompt: "The merchant whitespace report LEFT JOINs all 6 shops to sold lines; a paused shop would print NULL revenue. The stakeholder wants 0. Which read does it?",
      choices: [
        "COALESCE(SUM(oi.quantity * oi.unit_price), 0) around the fold",
        "SUM(COALESCE(oi.quantity * oi.unit_price, 0)) inside the fold",
        "IFNULL on every row before grouping",
        "NVL(SUM(...), 0) — NVL is SQLite's COALESCE",
      ],
      answer: 0,
      why: "An empty group has no rows to sum, so SUM returns NULL regardless of per-row guards — the COALESCE must wrap the AGGREGATE, turning the empty shop's NULL into 0. On this db all 6 shops moved, but the shape matters the day a merchant pauses.",
      notes: [
        { choice: 1, why: "Per-row COALESCE fixes NULL inputs, not empty groups — with no matching lines there is nothing to coalesce and SUM still returns NULL." },
        { choice: 3, why: "NVL isn't SQLite. COALESCE is the standard — and the placement (outside the aggregate) is the actual lesson." },
      ],
      difficulty: "easy",
    },
    {
      id: "rakuten-mcq-18",
      prompt: "The campaign page arms points on lifetime spend: WHEN lifetime_spend >= 1000 THEN '1x' sits BEFORE WHEN lifetime_spend >= 5000 THEN '5x'. What do the 5,000-plus whales print?",
      choices: [
        "'5x' — the most specific arm wins",
        "'1x' — CASE stops at the first true arm, and >= 1000 is already true",
        "An error — overlapping arms are illegal",
        "NULL — overlapping arms cancel out",
      ],
      answer: 1,
      why: "CASE arms evaluate in order and stop at the first true one — a 7,262-dollar member matches >= 1000 first and never reaches the 5x arm. Specific arms go first (or arms run high-to-low), or the points liability silently re-bands the whole book.",
      notes: [
        { choice: 0, why: "CASE has no best-match semantics — first true arm wins, full stop. The whale earns 1x points and files the complaint." },
        { choice: 2, why: "Overlaps are legal and silent — that is exactly why arm ORDER is the test. Nothing errors; the loyalty ledger just under-credits." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-19",
      prompt: "The loyalty pod tiles the 16 members into four spend quartiles, heaviest four in tile 1. Which window assigns the tiles — and who lands in tile 1?",
      choices: [
        "NTILE(4) OVER (ORDER BY lifetime_spend ASC) — the four lightest",
        "NTILE(4) OVER (ORDER BY lifetime_spend DESC) — the whales led by Alice at 7,262.35",
        "NTILE(4) OVER (PARTITION BY lifetime_spend ORDER BY lifetime_spend DESC)",
        "ROUND(lifetime_spend / 4) per member",
      ],
      answer: 1,
      why: "NTILE(4) cuts the ordered partition into four as-equal buckets; DESC ordering puts the top spenders — the 3,000-plus executive band — into tile 1. Sixteen members divide into four tiles of four with no remainder.",
      notes: [
        { choice: 0, why: "ASC hands tile 1 to the four lightest members — the 'top quartile' mail-merge targets the smallest spenders in the book." },
        { choice: 2, why: "Partitioning by spend makes every member its own partition — each gets tile 1 of a 1-member bucket, and the segmentation collapses." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-20",
      prompt: "Q4 GMV must include December 31's last orders. Which predicate safely isolates the quarter?",
      choices: [
        "created_at BETWEEN '2024-10-01' AND '2024-12-31'",
        "created_at >= '2024-10-01' AND created_at < '2025-01-01'",
        "STRFTIME('%m', created_at) >= '10'",
        "SUBSTR(created_at, 6, 2) IN ('10', '11', '12')",
      ],
      answer: 1,
      why: "Half-open ranges include every December-31 timestamp ('2024-12-31 08:00' sorts after '2024-12-31', so BETWEEN drops it) and stop cleanly at January 1 — month-end is exactly when point campaigns expire and orders land.",
      notes: [
        { choice: 0, why: "BETWEEN on the last day silently loses every intraday December-31 order — the quarter's final night vanishes from the GMV read." },
        { choice: 3, why: "Month extraction without the year: October 2025 folds into the same quarter. Bucket keys need year + month, always." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-21",
      prompt: "The dunning refresh wants the settlement invoices that never moved a rail. Which shape returns the 6 (15,217 in cents) without deleting them?",
      choices: [
        "invoices INNER JOIN payments WHERE p.id IS NOT NULL",
        "invoices LEFT JOIN payments … WHERE p.id IS NULL",
        "invoices CROSS JOIN payments GROUP BY invoice_id",
        "WHERE invoices.status = 'open'",
      ],
      answer: 1,
      why: "LEFT JOIN keeps all 28 invoices and NULL-pads the 6 without rails; p.id IS NULL keeps exactly those — the anti-join signature. It also catches invoice #28, marked 'paid' with zero settlement rows: the status column lies, the rails don't.",
      notes: [
        { choice: 0, why: "INNER + IS NOT NULL is the opposite screen — the 22 invoices that DID move; the dunning list ships empty and reads like a clean close." },
        { choice: 3, why: "Status is the ledger's opinion: the never-settled stack includes a 'paid' invoice (1,756.00) that a status filter would exclude — and miss the anomaly entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-22",
      prompt: "Pair the six RMS merchants that share a market cluster — each pair once, no shop with itself. Which join does it?",
      choices: [
        "s1 JOIN s2 ON s1.region = s2.region",
        "s1 JOIN s2 ON s1.region = s2.region AND s1.id < s2.id",
        "s1 LEFT JOIN s2 ON s1.id = s2.id",
        "s1 JOIN s2 ON s1.rating = s2.rating",
      ],
      answer: 1,
      why: "The region equality pairs every merchant with every same-cluster merchant including itself; the id inequality keeps each unordered pair exactly once — Nordic/Alpine in EU, Shenzhen/Pacific in APAC, two rows, with the US and LATAM singletons contributing nothing (the correct answer).",
      notes: [
        { choice: 0, why: "Without the id filter, EU produces four rows — both merchants twice, self-pairs included — and the partnership audit double-counts every pair." },
        { choice: 3, why: "Rating equality pairs shops across clusters on a metric nobody asked about — a join key must come from the question, not the nearest numeric column." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-23",
      prompt: "Which members' lifetime spend beats the platform mean? One teammate writes a correlated scalar per member; the review prefers the staged fold. Why?",
      choices: [
        "Correlated subqueries are illegal in WHERE clauses",
        "The correlated shape re-runs per outer row and hides its population — the CTE computes the mean once and names it",
        "CTEs are always faster — the engine materializes them automatically",
        "A scalar subquery returns 16 rows, one per member",
      ],
      answer: 1,
      why: "The correlated form re-executes its inner fold once per outer row — free on 16 members, a rescans storm on a multi-million-row marketplace feed — and its empty-inner behavior (mean over a filtered staging table returns NULL, and spend > NULL silently empties the report) is exactly the bug the staged shape surfaces. The CTE computes the mean once, names it, and the reviewer can audit the population it covers.",
      notes: [
        { choice: 2, why: "CTEs are logical staging, not guaranteed materialization — the win is auditability and single evaluation, not an automatic speedup." },
        { choice: 3, why: "A scalar subquery is contractually 0-or-1 rows. Sixteen rows would be an error — that contract is WHY the empty case returns NULL instead." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-24",
      prompt: "The units ladder page re-sorts itself between runs whenever two listings tie on units. The query ends `ORDER BY units_sold DESC`. What's the fix?",
      choices: [
        "Add LIMIT to freeze the row count",
        "Add a deterministic tiebreak — ORDER BY units_sold DESC, p.id — and name the policy in a comment",
        "Switch the direction to ASC",
        "Wrap the SELECT in DISTINCT",
      ],
      answer: 1,
      why: "Tied sort keys have no defined order, so the engine may return either listing first — and a ranking page that reshuffles between runs loses member trust. The tiebreak pins the order; on Rakuten-style ladders the tie policy (price, then listing id) is a published decision, not an engine accident.",
      notes: [
        { choice: 0, why: "LIMIT truncates the ladder — it says nothing about which tied row comes first. The shuffle survives inside the page." },
        { choice: 3, why: "DISTINCT dedups rows; it does not sort them. The tied rows aren't duplicates — they're distinct listings with equal units." },
      ],
      difficulty: "medium",
    },
    {
      id: "rakuten-mcq-25",
      prompt: "The merchandising call wants a 4-month rolling GMV average over the month spine. Which frame computes it?",
      choices: [
        "AVG(gmv) OVER (ORDER BY month ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)",
        "AVG(gmv) OVER (ORDER BY month RANGE BETWEEN 3 PRECEDING AND CURRENT ROW)",
        "AVG(gmv) OVER ()",
        "AVG(gmv) OVER (ORDER BY month ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)",
      ],
      answer: 0,
      why: "ROWS BETWEEN 3 PRECEDING AND CURRENT ROW averages this month and the prior three — the rolling 4-month run-rate. RANGE with a numeric offset needs a numeric ORDER BY (a TEXT month errors), the bare OVER averages the whole spine, and ending at 1 PRECEDING reports the prior four months as if they were current.",
      notes: [
        { choice: 1, why: "RANGE 3 PRECEDING requires ORDER BY of numeric type — '2024-01' is TEXT and the frame errors. RANGE also peers by VALUE, not by row." },
        { choice: 3, why: "That's the lagged window — a legitimate prior-4-months read wearing this month's name. The budget decision needs the current month included." },
      ],
      difficulty: "hard",
    },
    {
      id: "rakuten-mcq-26",
      prompt: "Campaign targeting wants members who ordered in BOTH halves of 2024 — the loyalty constants. Which shape returns them?",
      choices: [
        "UNION of the H1 member set and the H2 member set",
        "INTERSECT of the H1 member set and the H2 member set",
        "WHERE created_at >= '2024-01-01' AND created_at <= '2024-12-31'",
        "orders JOIN orders ON customer_id = customer_id",
      ],
      answer: 1,
      why: "INTERSECT is set membership in both operands — members present in H1's set AND H2's set. UNION stacks the audiences (everyone who ordered at all), a year-wide WHERE can't require two separate windows of activity, and a self-join on customer_id alone pairs every H1 order with every H2 order — fan-out wearing a set operation's name.",
      notes: [
        { choice: 0, why: "UNION answers 'who ordered in EITHER half' — the union audience, the opposite campaign. Same two sets, different operator, different mail-merge." },
        { choice: 3, why: "Without a same-row rule (o2.customer_id = o1.customer_id AND o2.created_at in H2), the join multiplies rows and reports neither set honestly." },
      ],
      difficulty: "hard",
    },
    {
      id: "rakuten-mcq-27",
      prompt: "The monthly census filter reads SUBSTR(created_at, 1, 7) = '2024-03' and the plan shows a full table SCAN. Which rewrite keeps the same rows and the index?",
      choices: [
        "SUBSTR(created_at, 1, 7) = '2024-03' COLLATE NOCASE",
        "created_at >= '2024-03-01' AND created_at < '2024-04-01'",
        "STRFTIME('%Y-%m', created_at) = '2024-03'",
        "CAST(created_at AS TEXT) LIKE '2024-03%'",
      ],
      answer: 1,
      why: "Sargable means comparing the BARE column to a value: the half-open range keeps the same March rows while the index stays usable. Every other option wraps the column in a function first, which forces the engine to evaluate the expression per row — a scan regardless of indexes.",
      notes: [
        { choice: 2, why: "STRFTIME is the readable twin and the same trap — wrapping the column in any function disables the seek. Filter on the column, not on a transformation of it." },
        { choice: 3, why: "CAST is one more function on the column — the scan survives intact, now with a cast on every row." },
      ],
      difficulty: "hard",
    },
    {
      id: "rakuten-mcq-28",
      prompt: "Regional AOVs on this db: EU 335.32 (45 orders), APAC 313.66 (37), US 383.48 (19), LATAM 426.22 (2). The deck averages the four — 364.67. What is the true platform AOV?",
      choices: [
        "364.67 — averaging the regional reads is the correct blend",
        "338.19 — pooled SUM(total) / COUNT(*) re-weights every region by its order count",
        "364.68 — the regional figures rounded once more",
        "383.48 — the biggest per-order region leads the platform read",
      ],
      answer: 1,
      why: "An average of averages weights every region equally regardless of size — LATAM's two orders count as much as EU's forty-five. Pooled re-aggregation from the base rows gives 338.19, the number the 103-order book actually books.",
      notes: [
        { choice: 0, why: "Equal weighting is only correct when every group has equal counts — a claim the deck would have to defend, and can't: 45 versus 2 orders." },
        { choice: 3, why: "The US reads fattest per order, but 19 of 103 orders don't set the platform mean — cherry-picking the biggest per-order region is not a blend." },
      ],
      difficulty: "hard",
    },
    {
      id: "rakuten-mcq-29",
      prompt: "A teammate's merchant read returns sane-looking rows only because SELECT DISTINCT is pasted on top — while the revenue SUM beside it still reads 103,244.55. What is the DISTINCT doing?",
      choices: [
        "Fixing the join — DISTINCT dedups the fan-out and corrects the SUM too",
        "Hiding the fan-out at the display layer while the SUM stays wrong — a bug report, not a fix",
        "Rounding the revenue to sane figures",
        "Nothing — DISTINCT is a no-op next to aggregates",
      ],
      answer: 1,
      why: "DISTINCT collapses duplicate display rows after the join has already multiplied them — the revenue aggregate still counts every repeated row at 2.97x. The honest sequence: notice the DISTINCT, count rows with and without it, find the multiplicity, and fix the join or pre-aggregate.",
      notes: [
        { choice: 0, why: "DISTINCT never repairs an aggregate — the SUM is computed over all 251 joined rows before any dedup happens downstream." },
        { choice: 3, why: "It visibly changes the row set — that's the tell. A DISTINCT you can't justify in one sentence is a bug report filed against your own query." },
      ],
      difficulty: "hard",
    },
    {
      id: "rakuten-mcq-30",
      prompt: "The GMV spine walks 14 months with LAG deltas. The 2024-01 row's delta prints NULL, and a teammate COALESCEs it to 0 'to clean the report'. What did that cost?",
      choices: [
        "Nothing — NULL and 0 render the same in a chart",
        "It invents a baseline: the report now implies January's GMV moved from a prior month that isn't in the data",
        "It errors — window output cannot be coalesced",
        "It shifts every later delta forward by one row",
      ],
      answer: 1,
      why: "LAG's first-row NULL is the honest 'no baseline month'; coalescing it to 0 fabricates a flat month and feeds the percentage column a zero denominator. The label belongs in the report ('baseline'), not a fabricated number in the cell.",
      notes: [
        { choice: 0, why: "They render differently — and they MEAN differently. Zero says 'no movement'; NULL says 'no prior'. The spine's first row is the latter." },
        { choice: 3, why: "LAG reads, it doesn't mutate — every other row's delta is untouched. The damage is confined to the one fabricated cell." },
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
    {
      id: "cs-rakuten-3",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The 103-by-construction census",
      brief:
        "Funnel brief, in-world: the points-and-ops standup opens with the one-pass status census — completed, dispatched, pending, abandoned in a single fold, because four separate status queries drift apart on a live merchant feed and a branch that fails the 103 identity is the day's first incident. Probed on the storefront db (orders = Ichiba orders): 103 booked, split 52 delivered / 30 shipped / 14 pending / 7 cancelled; kept GMV (status <> 'cancelled') folds to 33680.79 of the 34833.28 book, leaving 1152.49 on abandoned baskets. 'One row, four arms, one scan — the delivered arm is where the points loop closes, so it reconciles against points issued too.'",
      ask: "Return one row: orders booked, FILTER counts for completed, dispatched and pending, abandoned, and kept GMV (non-cancelled) to 2 decimals.",
      template:
        "SELECT COUNT(*) AS orders_booked,\n       COUNT(*) FILTER ({1}) AS completed,\n       COUNT(*) FILTER ({2}) AS dispatched,\n       COUNT(*) FILTER ({3}) AS pending,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS abandoned,\n       ROUND(SUM(total) FILTER ({4}), 2) AS kept_gmv\nFROM orders;",
      slots: [
        {
          answer: "WHERE status = 'delivered'",
          kind: "keyword",
          label: "the completed arm",
          why: "FILTER (WHERE status = 'delivered') scopes this count to the 52 completed orders — the only status where points credited — while every other arm still sees all 103 rows. Calling the 30 dispatched 'completed' here inflates the points reconciliation before a single parcel lands.",
        },
        {
          answer: "WHERE status = 'shipped'",
          kind: "keyword",
          label: "the dispatched arm",
          why: "The dispatched arm counts its own 30 without disturbing its neighbors — one scan, four independent lenses. Reusing the delivered predicate prints 52 twice, and the ops board catches it only after the dispatch SLA read goes out wrong.",
        },
        {
          answer: "WHERE status = 'pending'",
          kind: "keyword",
          label: "the pending arm",
          why: "Pending is 14 — awaiting merchant dispatch, with no shipped_at yet. The arm keeps that population visible beside the clock metrics: 'not yet' is a population definition, not a cleanup job, and it stays in the booked denominator.",
        },
        {
          answer: "WHERE status <> 'cancelled'",
          kind: "keyword",
          label: "the kept-GMV arm",
          why: "Kept GMV excludes the 7 abandoned orders: 33680.79 of the 34833.28 book, with 1152.49 riding outside. The <> arm IS the denominator rule — abandoned stays in the booked census but leaves the revenue fold, and mixing the two is how a deck overstates demand.",
        },
      ],
      distractors: ["WHERE status = 'cancelled'", "WHERE status <> 'delivered'", "WHERE status IS NULL", "WHERE status <> 'shipped'"],
      walkthrough:
        "One scan of the order feed, four lenses, one shared population. FILTER (WHERE …) scopes each count to its arm while every arm still sees all 103 rows — the census cannot drift because the arms cannot carry different WHEREs: completed 52, dispatched 30, pending 14, abandoned folded out of the GMV arm at 1152.49, and COUNT(*) stays the whole booked base of 103. The identity is the proof of work: 52 + 30 + 14 + 7 = 103 — a census that doesn't reconcile to the base is hiding a status value the arms forgot, and on a marketplace feed that is an incident, not a rounding note. Swap any arm's predicate and the census lies in exactly one column: 'cancelled' collapses three arms to 7, IS NULL zeros them out, <> 'delivered' re-labels 51 rows as completed and the points reconciliation inherits phantom credits. The four-pass alternative is how four WHERE clauses drift on a live feed; the one-pass shape is the drill.",
    },
    {
      id: "cs-rakuten-4",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The settlement rail stack",
      brief:
        "Month-close brief, in-world: settlement analytics stacks the two payment rails — card and wire — into one read with a grand TOTAL row underneath, one query, no spreadsheet math, because the rails are disjoint by method and the stack must cross-foot to the ledger. Probed on the storefront db (payments in INTEGER cents): card ran 16 movements worth 3,736,400 cents (37,364.00), wire ran 11 movements worth 3,224,800 cents (32,248.00) — 27 movements, 69,612.00 all in. The packet reads rails biggest-first with the TOTAL row landing last, and the disjointness ('card and wire are mutually exclusive by method') ships as a comment beside the UNION ALL.",
      ask: "Return each rail with its movement count and dollar total to 2 decimals, plus a labelled TOTAL row for all 27 movements, rails biggest-first with the TOTAL last.",
      template:
        "SELECT p.method AS rail,\n       COUNT(*) AS movements,\n       ROUND({1}(p.amount_cents) / 100.0, 2) AS dollars\nFROM payments p\nGROUP BY {2}\nUNION ALL\nSELECT 'TOTAL',\n       COUNT(*),\n       ROUND(SUM(p.amount_cents) / 100.0, 2)\nFROM payments p\nORDER BY dollars {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the cents adder",
          why: "SUM folds each rail's settlement rows into cents — 3,736,400 for card — and the /100.0 at the display edge prints 37,364.00. COUNT would return the movement count wearing a dollars name (16.00), and the stack would cross-foot to nothing.",
        },
        {
          answer: "p.method",
          kind: "keyword",
          label: "the rail key",
          why: "GROUP BY p.method folds payments into the two disjoint rails. GROUP BY p.invoice_id would print one row per settlement — 27 rows plus a TOTAL that no longer totals — a stack that reads like a wire dump instead of a close.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the TOTAL-last order",
          why: "Ascending dollar order stacks card 37,364.00, wire 32,248.00, then the 69,612.00 TOTAL lands last because the grand total is the biggest number in the stack. DESC would crown the TOTAL on top and the packet opens on a summary nobody has earned yet.",
        },
      ],
      distractors: ["COUNT", "AVG", "p.invoice_id", "DESC"],
      walkthrough:
        "A stack is two populations and a join of the outputs — and the disjointness is the correctness argument. The upper branch folds payments by rail: GROUP BY p.method, SUM over INTEGER cents, /100.0 once at the display edge — card 16 movements 37,364.00, wire 11 movements 32,248.00. The lower branch is the TOTAL row: same arithmetic over the unfiltered table — 27 movements, 69,612.00 — and UNION ALL concatenates the two without a dedupe pass, because card and wire are mutually exclusive by method; a UNION dedupe here would be work spent proving nothing, and worse, it would silently swallow any byte-identical row the close needed to see. ORDER BY dollars ASC stacks the rails biggest-first and the TOTAL lands last on sheer size — 69,612.00 is the sum the ledger's trial balance must agree with. The distractors fail honestly: COUNT prints movement counts as dollars, AVG prints per-movement means, invoice_id re-grains the stack to one row per settlement, and DESC crowns the summary before the evidence. Stack, key, order — three decisions, one close that cross-foots.",
    },
    {
      id: "cs-rakuten-5",
      tier: "medium",
      topic: "q6",
      universe: "growth",
      title: "The two-grain regional census",
      brief:
        "Growth-board brief, in-world: the deck's opening slide is the two-grain census — orders AND members per region — because load without coverage reads as growth that isn't there. Probed on the storefront db (customers = members): EU runs 45 orders from 8 members (intensity 5.6), APAC 37 from 5 (7.4), US 19 from 2 (9.5), LATAM 2 from 1 (2.0). The census stages in a CTE — one grain, one name — then computes orders-per-member as the intensity read, regions ordered by booked load. 'Every row quotes both grains and the ratio between them; a census that prints one grain is half a fact.'",
      ask: "Return all four regions: region, orders, distinct members, and orders-per-member intensity to 1 decimal, biggest booked load first.",
      template:
        "WITH regional AS (\n  SELECT c.region,\n         COUNT(*) AS orders,\n         COUNT({1}) AS members\n  FROM orders o\n  JOIN customers c ON c.id = {2}\n  GROUP BY c.region\n)\nSELECT region,\n       orders,\n       members,\n       ROUND(1.0 * orders / members, 1) AS intensity\nFROM regional\nORDER BY {3}\nLIMIT {4};",
      slots: [
        {
          answer: "DISTINCT customer_id",
          kind: "keyword",
          label: "the member-grain counter",
          why: "COUNT(DISTINCT customer_id) folds each region's orders back to people — EU's 45 orders belong to 8 members. COUNT(customer_id) counts order rows (the column is never NULL) and the census prints the same number twice, wearing two names.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the member key on the join",
          why: "Orders carry the member's id, so the join is c.id = o.customer_id. c.id = c.id matches every order to every member — a 103 × 16 cross join where every region reads the whole book — and c.id = o.id pairs each region to whichever member shares its id: phantom censuses, visibly plausible.",
        },
        {
          answer: "orders DESC",
          kind: "keyword",
          label: "the load-first order",
          why: "The deck leads with booked load: EU 45, APAC 37, US 19, LATAM 2. Ordering by intensity instead would open on the US (9.5) — a two-member region wearing the growth story — and the coverage half of the fact never reaches the slide.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the whole-book cut",
          noVerify: true,
          why: "Four regions exist on the book, so LIMIT 4 prints the complete census — no region silently dropped. LIMIT 3 amputates LATAM (2 orders, 1 member), and the deck's intensity table loses its weakest row exactly when someone asks about it.",
        },
      ],
      distractors: ["o.id", "c.id", "intensity DESC", "region"],
      walkthrough:
        "A two-grain census is a fold, a second counter, and a ratio — staged, not improvised. The CTE joins orders to members on the foreign key (c.id = o.customer_id, all 103 survive), groups by region, and carries BOTH counters: COUNT(*) for booked load, COUNT(DISTINCT customer_id) for coverage — EU 45/8, APAC 37/5, US 19/2, LATAM 2/1. The outer SELECT computes the ratio: ROUND(1.0 * orders / members, 1) — the 1.0 forces real division before the intensity prints 5.6, 7.4, 9.5, 2.0. The CTE exists because the census is one grain with one name: the board can SELECT from regional mid-pipeline to audit either counter, and the intensity can never drift from the numbers it divides. The distractors fail honestly: COUNT(o.id) or COUNT(c.id) both count joined rows and print the load twice; c.id = c.id cross-joins 103 orders to 16 members and every region reads the whole book; intensity DESC opens the deck on the US's 9.5 — a 19-order region wearing the growth crown; region alphabetizes a census that should read by load. Both grains, one ratio, one stage — the census the board can act on.",
    },
    {
      id: "cs-rakuten-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The GMV spine walk",
      brief:
        "Growth-board brief, in-world: the merchandising call reads the 14-month GMV spine with each month's delta beside it — the trough named, the recovery jump named, the first row left honestly NULL. Probed on the storefront db: monthly GMV from 2024-01 (3,731.97) to 2025-02 (2,390.53); the trough is 1,193.86 in July, the biggest jump is +1,158.21 into August, the deepest drop is −1,326.87 into November, and 2025 opens −431.97 then +721.03. 'Month, GMV, prior GMV, delta — the full spine, oldest first, and the first row's NULL is the baseline, never a zero.'",
      ask: "Return the 14-month spine: month, GMV to 2 decimals, prior-month GMV, and the delta versus the prior month, oldest first.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS gmv\n  FROM orders\n  GROUP BY month\n),\nwalked AS (\n  SELECT month,\n         gmv,\n         {1}(gmv) OVER (ORDER BY month) AS prev_gmv\n  FROM monthly\n)\nSELECT month,\n       gmv,\n       prev_gmv,\n       ROUND(gmv - prev_gmv, 2) AS delta\nFROM walked\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(gmv) hands each month the row above it: July's prev is June's 2,047.43, and the delta prints −853.57. LEAD would read forward and stamp February with March's decline; SUM would pile a running total into a prior-month column.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A spine walk is chronological: ASC keeps 2024-01 on top so each row compares against the row above. DESC presents the newest month first with its baseline below — the numbers survive, the story doesn't, and the board reads the recovery before the trough that caused it.",
        },
        {
          answer: "14",
          kind: "number",
          label: "the full-spine cut",
          noVerify: true,
          why: "Fourteen months run 2024-01 through 2025-02, so LIMIT 14 prints the whole walk — the July trough, the August jump, the November drop, and the 2025 opening the deck ends on. LIMIT 12 amputates the recovery; the closing slide loses its argument.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "12"],
      walkthrough:
        "A spine walk is a fold, a window, and arithmetic — staged in two CTEs because window output isn't visible to sibling expressions. monthly folds 103 orders into 14 month buckets (SUBSTR month key, SUM rounded once); walked applies LAG(gmv) OVER (ORDER BY month) so each row carries its predecessor; the outer SELECT computes the delta — −122.33 into February, −992.56 into March, the trough at 1,193.86 in July after −853.57, then the +1,158.21 August jump, −1,326.87 into November, and 2025 opening −431.97 before +721.03. The first row's prev is NULL and its delta is NULL by design: no prior month, no baseline, no invented zero — coalescing it to 0 fabricates a flat month and hands the percentage math a zero denominator. The two-stage matters: windows evaluate in the SELECT stage, so the CTE stages the grain and the outer layer does the arithmetic. LEAD would read the future; SUM would turn prev_gmv into a running total; DESC tells the story backwards; LIMIT 12 amputates the recovery. Fold, lag, delta — three stages, one spine the merchandising call can quote month by month.",
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
    { slug: "trial-to-paid-funnel", why: "Campaign conversion step by step: entry to completion, with the denominator stated at every rung — the funnel Ichiba growth reads weekly, in this db's status map." },
    { slug: "immediate-food-delivery-i", why: "Same-cycle dispatch: orders whose merchant dispatch landed on the order day — the promise-kept read in miniature, a conditional rate at order grain." },
    { slug: "customer-who-visited-but-did-not-transact", why: "The funnel's silent drop: sessions that browsed but never converted — the visit-versus-order anti-join behind every retargeting ask on the campaign page." },
    { slug: "daily-leads-and-partners", why: "Two grains per day: distinct leads AND distinct partners beside each other — the census shape behind per-day member/merchant reads, with the date key done right." },
    { slug: "find-loyal-customers", why: "The loyal cut: members clearing a repeat threshold — 14 of 16 here — the fee-base census the points loop is built to move." },
    { slug: "second-highest-salary", why: "The tie trap on rung two: LIMIT 1 OFFSET 1 breaks on duplicates — the ladder question that separates DENSE_RANK thinkers from offset merchants." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each member's most-ordered listing — argmax with a tie policy, the personalization seed for point-campaign mail-merges." },
    { slug: "count-salary-categories", why: "Point bands in CASE with zero bands printed — a band with no members must read 0, not vanish; the honest histogram arm." },
    { slug: "the-category-of-each-member-in-the-store", why: "Member tiering in CASE: ordered, exhaustive arms that partition the base without holes — the literal member-category query, loyalty-program clothing." },
    { slug: "report-contiguous-dates", why: "Gaps-and-islands over dates: contiguous runs become reportable windows — the campaign-streak and hot-fortnight shapes the growth pod escalates." },
    { slug: "year-on-year-growth-rate", why: "YoY on the month spine: same-month comparisons with NULL-safe edges — the trend read behind every quarterly board slide." },
    { slug: "sellers-with-no-sales", why: "Merchants with zero movement — on this book the confident zero (all 6 RMS shops sell), and proving that zero IS the answer." },
    { slug: "customers-who-bought-all-products", why: "Relational division: members who bought from every merchant — the completionist read behind cross-shop badge campaigns and catalog-coverage audits." },
    { slug: "gl-reconciliation", why: "Ledger-versus-rails: status is an opinion, the settlement row is a fact — the paid-no-rails 1,756.00 anomaly lives exactly here." },
    { slug: "monthly-transactions-i", why: "Month buckets with the cancelled arm beside the count — 14 months, '%Y-%m' keys, abandoned demand never laundered out of the fold." },
    { slug: "sales-by-day-of-the-week", why: "Weekday pivot of order volume — CASE columns in, campaign-calendar staffing out; paydays and point-expiry Fridays show up here." },
  ],
};
