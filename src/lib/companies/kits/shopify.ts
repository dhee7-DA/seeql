// Shopify — kit 4 of the E-commerce & Marketplace domain (Batch B).
// Merchant analytics: AOV discipline, retention shares, funnel honesty and
// data-pipe hygiene (SCD2, keep-latest dedupe, point-in-time reads). Five
// registry-tagged problems + eleven theme-curated (merchant-dashboard,
// cohort and LTV/CAC shapes). Case studies run on the storefront db with
// probed figures (scripts/tmp-ecom-facts*.ts receipts in the worklog).
// Expanded to 3x (append-only batch): 6 brief paras, 4 day-in-the-life, 12
// metrics, 15 topics, 24 theory (shop-t9..t24), 30 MCQs (shop-mcq-11..30),
// 6 cases (cs-shop-3..6 on topic families t5/t4/x2/j4 — new families, all
// distinct from each other and from the original j7/q2 pair), 32 problems
// (5 registry-tagged + 27 theme-curated). Facts source unchanged:
// scripts/company-facts.md.

import type { CompanyKit } from "../types";

export const shopifyKit: CompanyKit = {
  id: "shopify",
  domainId: "ecom",
  name: "Shopify",
  tagline: "Merchant analytics for millions of stores",
  accent: "text-emerald-400",

  brief: [
    "**Shopify** is the internet's merchant backbone — millions of stores run on it, from first-time sellers to public companies, which makes the company's data problem unusual: it is *analytics ABOUT analytics*. Every store is a tenant with its own orders, its own conversion funnel, its own subscription revenue; the data teams build the surfaces merchants read (dashboards, cohort views, LTV reports) and the internal instrumentation that keeps the platform honest. The SQL culture reflects that: **definitions are the product**. When a merchant sees '{emerald:average order value}', the number behind it must survive a support ticket, an audit and a currency edge case — so the analysts and engineers here are disproportionately rigorous about denominators, window semantics and what exactly counts as an order.",
    "The org runs platform-shaped: product analytics teams own funnels and feature adoption, merchant-success teams own retention and {rose:churn} reads, data engineering owns the pipes — late-arriving events, slowly-changing dimensions, **keep-latest dedupes** on streams that retry. Subscription commerce (Shopify's own plans and merchant recurring revenue) adds the recurring-revenue muscle: {emerald:MRR movements}, churn cohorts, **trial-to-paid conversion**. The interview loop mirrors the org: expect questions that sound like the dashboards themselves — compute a rate, define a cohort, repair a slowly-changing dimension, and explain what your query does when *the same event arrives twice*.",
    "Interview style is **definition-first** and pipeline-aware. Screens open with a clean aggregation or ratio, then pivot into the definition conversation: what's the denominator, what happens on cancelled orders, does this survive a re-run? Data-modeling flavors appear in SQL form — `SCD2` builds, point-in-time joins, keep-latest dedupe — because the platform's streams genuinely retry and restate. The strongest candidates narrate definitions before syntax: *'this rate's denominator is trials started in the window, not all visitors'* is worth more than a clever `CTE`.",
    "Preparation strategy: Shopify's registry tag carries **five problems**, and the kit adds **twenty-seven theme-curated picks** around its real question families — merchant ratios, retention shares, funnel honesty and pipe hygiene. Work the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: one rebuilds the region {emerald:AOV} dashboard a merchant opens every morning, another rebuilds the {rose:one-time-buyer share} that anchors its retention story.",
    "Scale changes the SQL you write here. Millions of tenants means every query is a template that must be right for every store at once — so the data org invests in a shared semantic layer where metric definitions ({emerald:AOV}, conversion, repeat rate) are written once, reviewed like code, and consumed everywhere; a definition change is **a versioned event**, not a `WHERE`-clause edit. Analysts sit embedded with product and merchant-success teams but answer to the metric layer: when a merchant files a ticket that *'repeat rate dropped 40% overnight'*, the first query is not about merchants, it is about the definition's history — what changed, when, and for which stores. Interviewers probe this instinct directly: they want to hear you ask *'is this number wrong, or is this definition different?'* before touching SQL.",
    "Preparation strategy for the full kit: the registry tag still carries five problems, and the expanded pool curates the rest — **32 problems** across merchant ratios, retention, funnels, pipe hygiene, billing tables, calendar slices, leaderboards, inventory reads and one-pass censuses. **Fifteen topics** take you from the {emerald:AOV} wall to stacked reports; the **six case studies** rebuild real merchant surfaces on the live storefront db — the region AOV wall, the one-time-buyer share, the VIP spend leaderboard, the quarter-close trend, the one-pass status census and the unpaid-invoices anti-join. Drill the theory bank for the definition vocabulary — denominators, half-open intervals, keep-latest semantics, cents-versus-dollars — because at Shopify *the vocabulary IS the interview*.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the merchant's morning, because your product IS the merchant's morning. An analyst on the merchant-experience team opens the dashboard first thing — not to admire it but to interrogate it: did yesterday's orders, revenue and {emerald:AOV} land where the merchant expects, does the cohort view reconcile with the raw `orders` table, are the conversion rates plausible against the week's baseline? The first queries of the day are reconciliation queries — dashboard numbers versus source-of-truth folds — because *a merchant who catches a wrong number before support does is a churned merchant in waiting*.",
    "**11:00 —** Midday is definition work disguised as query work. A product manager asks 'did checkout v2 improve conversion?' and the analyst's first hour goes into pinning the definition: conversion of WHAT population, over WHAT window, {rose:cancelled} orders in or out, and what happens to carts that convert after the window closes. The query itself is often the easy part — a funnel fold or a two-group lift comparison — but **the definition memo around it is the deliverable**. Data engineering colleagues spend the same hours differently: keeping-latest on retried webhook streams, building `SCD2` versions of the store dimension, and making point-in-time joins possible so last month's report can be reproduced exactly.",
    "**15:00 —** The afternoon tilts toward retention and revenue mechanics. Cohort matrices get rebuilt for the weekly growth review: stores created in a week, tracked by returning-seller rate across the following weeks. LTV curves get compared against CAC by acquisition channel, with the payback period called out in months. Subscription metrics run on their own calendar — {emerald:MRR movements} decomposed into new, expansion, contraction and churn. The rhythm ends in reviews where **every number carries its definition like a nametag**. The best-prepared candidate knows this rhythm: Shopify SQL is product SQL — it ships to merchants, so the definition behind every number is part of the deliverable.",
    "**17:30 —** Late afternoon is where the definition culture shows its teeth. A metric-definition RFC gets reviewed: one paragraph of prose, one query, and a proof that the new definition reproduces the old one on last month's data before it ships. The data-quality rotation runs its checks — duplicate webhook keys caught by the keep-latest scan, `NULL`-rate drift on merchant-supplied fields, row-count reconciliations between the `orders` table and the billing surface. Once a week the team holds definition-debt hours: *retiring a metric nobody reads, renaming one that lies*. On-call for the pipelines carries the same discipline — a retried stream is not an incident, but **a silently doubled revenue total is**. Candidates who have lived this rhythm recognize the interview questions immediately, because they are lifted from these afternoons.",
  ],

  metrics: [
    { name: "GMV", what: "Gross merchandise volume across all stores — the platform headline. Every revenue query here is a fold over millions of tenant order streams with cancellations handled on purpose." },
    { name: "AOV", what: "Average order value — the merchant's most-scrutinized ratio. The case study rebuilds it per region on the live db, cancelled demand excluded by definition, not by accident." },
    { name: "Repeat-purchase rate", what: "Share of customers with 2+ orders in a window. The retention headline merchants act on — and a two-grain ratio where the denominator is all buyers, not all orders." },
    { name: "One-time buyer share", what: "Customers with exactly one order ÷ all customers. The churn-risk frontier the case study computes — the complement of the repeat engine." },
    { name: "Conversion rate", what: "Sessions ending in an order ÷ sessions. The funnel health number whose definition (bot filtering, cart-refresh counting) is half the interview question." },
    { name: "MRR movements", what: "Monthly recurring revenue decomposed into new, expansion, contraction and churn. The subscription muscle behind Shopify's own plan economics." },
    { name: "LTV : CAC", what: "Lifetime value per acquisition-channel cost. The growth-efficiency read that decides where merchant acquisition spend lands next quarter." },
    { name: "Cohort retention", what: "Share of a signup week's stores still active in later weeks. The matrix view every growth review opens with — windows and cohort keys in one query." },
    { name: "Days-to-ship", what: "julianday(shipped_at) minus julianday(created_at) over shipped orders — probed at 2.98 days average across 82 shipped orders, range 2..4. The fulfillment SLA merchants benchmark couriers against; the 21 unshipped orders stay out of the denominator by definition, not by accident." },
    { name: "AR exposure", what: "Invoices with zero payment rows — 6 invoices carrying 15217 in the billing tables. The receivables anti-join that decides when a merchant account gets dunning emails; LEFT JOIN + IS NULL is its entire implementation." },
    { name: "Top-customer concentration", what: "Share of revenue from customers whose lifetime spend crosses 3000 — 63.5% here. The whale-curve read: a HAVING-gated fold whose denominator is all revenue, not whale revenue." },
    { name: "Pending-order share", what: "Orders awaiting fulfillment — 14 of 103 placed, 13.6%. The pipeline-pressure gauge separating 'orders placed' from 'orders moving'; a one-pass FILTER census computes it beside every other status in a single scan." },
  ],

  topics: [
    {
      name: "Merchant ratios: AOV & basket depth",
      why: "The merchant dashboard's headline row is AOV and basket depth — revenue and units per order. Shopify drills ratios because they punish integer division, wrong denominators and premature rounding; the follow-up is always 'what exactly is in the denominator?'",
      slugs: ["basket-depth-aov", "average-selling-price", "queries-quality-and-percentage"],
    },
    {
      name: "Repeat behavior & retention shares",
      why: "'What share of buyers come back?' is the retention question and a grain trap in one: the numerator counts customers with 2+ orders, the denominator counts ALL customers — folded from orders, not order lines. Shopify's screens live on this distinction.",
      slugs: ["repeat-purchase-rate", "cohort-repeat-revenue", "customer-order-frequency"],
    },
    {
      name: "Funnels with honest denominators",
      why: "Email open → click → order, ad view → session → checkout: funnel stages must share a population or the drop-offs are fiction. Shopify probes whether you keep the denominator fixed at stage one and compute every stage against it.",
      slugs: ["email-engagement-funnel", "ads-funnel", "funnel-step-conversion"],
    },
    {
      name: "Catalog hygiene & text normalization",
      why: "Merchant data arrives messy: product titles with padding, emails in mixed case, SKUs with stray characters. Fix-the-format questions test whether you can clean text in SQL — TRIM, UPPER, SUBSTR — without breaking the join key you'll group on.",
      slugs: ["fix-product-name-format", "invalid-tweets", "find-all-unique-email-domains"],
    },
    {
      name: "SCD2 & point-in-time reads",
      why: "Store attributes change over time (plan upgrades, region moves) and the platform must answer 'what did this store look like THEN'. SCD2 builds and as-of joins are the data-modeling questions Shopify asks in SQL form.",
      slugs: ["scd2-build", "point-in-time-asof", "product-price-at-a-given-date"],
    },
    {
      name: "NULL & blank audits",
      why: "A merchant field can be NULL, empty string, or whitespace — three different problems. Shopify's data-quality questions check whether you audit all three deliberately instead of filtering one and shipping the other two.",
      slugs: ["null-blank-audit", "employees-with-missing-information", "books-with-null-ratings"],
    },
    {
      name: "Keep-latest dedupe",
      why: "Webhook streams retry; the same order event arrives twice. The keep-latest shape — ROW_NUMBER over a natural key ordered by ingest time, keep rn = 1 — is Shopify's most practical window question, asked with a pipeline story attached.",
      slugs: ["keep-latest-dedupe", "duplicate-emails", "delete-duplicate-emails"],
    },
    {
      name: "Cohort matrices & stickiness",
      why: "The growth review's opening view is a cohort matrix: signup week down, weeks-since across, retention in the cells. Building it drills date arithmetic, window partitioning and the discipline to keep the cohort's denominator frozen.",
      slugs: ["cohort-retention-matrix", "dau-wau-stickiness", "growth-accounting", "find-golden-hour-customers"],
    },
    {
      name: "LTV vs CAC & payback",
      why: "Growth efficiency is channel LTV against CAC with payback in months — ratios over ratios. Shopify checks whether you can compute both sides at comparable grains and resist mixing revenue and margin halfway through.",
      slugs: ["channel-ltv-vs-cac", "ltv-cac-payback", "roas-by-campaign"],
    },
    {
      name: "GROUP BY as the merchant question",
      why: "Under every dashboard widget is a fold: sales per product, orders per buyer, revenue per period. Shopify opens screens with these to verify the basics — then escalates each one with a status filter or a threshold to see if the basics hold under pressure.",
      slugs: ["product-sales-analysis-ii", "group-sold-products-by-the-date", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Billing tables & ledger discipline",
      why: "Merchant billing is where Shopify's money lives: invoices issued in integer cents, payments arriving in partials and splits, and a ledger that must balance to the cent. Queries against these tables teach the cents-versus-dollars discipline and the one-pass coverage classification the finance screens are built on.",
      slugs: ["trial-balance-check", "monthly-transactions-i", "find-customers-with-positive-revenue-this-year"],
    },
    {
      name: "Merchant calendar & month buckets",
      why: "Every merchant report is carved along the store's calendar: months for the dashboard, weekday curves for staffing, fixed periods for campaign reads. Bucketing with STRFTIME and filtering with boundary-safe month predicates are the two moves Shopify checks before any window question.",
      slugs: ["sales-by-day-of-the-week", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020"],
    },
    {
      name: "Leaderboards, ties & argmax",
      why: "Top-products-per-store, newest-order-per-customer, best-seller-per-category: merchant surfaces are full of per-group winners, and ties are everywhere once thousands of tenants share price points. RANK versus ROW_NUMBER, deterministic tie-breakers and argmax windows are the working toolkit.",
      slugs: ["rank-scores", "most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Inventory reads: stock vs sold",
      why: "Merchants run their business on the gap between stocked and sold: units remaining, imbalance across locations, slow movers worth discounting. These queries drill joining demand to stock at matching grains — the case-study db's 16 products and their remaining units are exactly this shape.",
      slugs: ["find-stores-with-inventory-imbalance", "unpopular-books", "rearrange-products-table"],
    },
    {
      name: "One-pass censuses & stacked reports",
      why: "Dashboards hate N+1 queries: the status census, the histogram and the month grid with a TOTAL row are all single-scan shapes. FILTER (WHERE …), CASE pivots and UNION ALL stacks are the expert-clinic moves that keep merchant dashboards to one table scan each.",
      slugs: ["count-salary-categories", "monthly-transactions-ii", "create-a-session-bar-chart", "percentage-of-users-attended-a-contest", "classes-more-than-5-students", "confirmation-rate"],
    },
  ],

  theory: [
    {
      id: "shop-t1",
      q: "A merchant disputes their AOV. Walk through every definition decision that could make two 'correct' AOV queries disagree.",
      a: "At least five decisions, each legitimate. Population: cancelled orders in or out (the placed-only AOV is higher because cancelled carts skew small); refunds netted or gross; test orders included? Grain: AOV over orders (revenue ÷ order count) versus over line items (unit economics) — different numbers, both called 'average'. Timezone: the merchant's local midnight versus UTC shifts which orders land in 'yesterday'. Rounding: computed then rounded versus rounded inputs. The strong answer is not picking one — it's stating that AOV is a definition with parameters, producing the query with each parameter visible (a WHERE for the population, a comment for the grain), and offering the reconciliation query that shows exactly which decision explains the merchant's number. At Shopify the definition IS the product; a candidate who treats it as a parameter wins the round.",
      tag: "aggregation",
    },
    {
      id: "shop-t2",
      q: "Compute one-time buyer share: customers with exactly one order ÷ all customers. Why do the numerator and denominator need different folds, and where does the 100.0 go?",
      a: "The numerator is a grouped count: fold orders by customer_id, HAVING COUNT(*) = 1, count the survivors — a count of customers, built at the customer grain. The denominator is a count of customers straight from the customers table — no folding, or you'd count only customers who ever ordered and silently drop the never-ordered. Both are customer-grain numbers, but they're built by different folds, and the ratio lives in the SELECT as 100.0 * numerator / denominator — the 100.0 multiplies BEFORE the division so integer arithmetic never truncates the share to 0. The interviewer's follow-up: 'why is the denominator not COUNT(DISTINCT customer_id) from orders?' — because that population excludes never-orderers, and the business definition of 'share of customers' includes them. Saying the population aloud for both sides is the whole answer.",
      tag: "subqueries",
    },
    {
      id: "shop-t3",
      q: "The same webhook event arrived twice with different ingested_at timestamps. How do you keep exactly one row — and what does 'latest' have to mean for the answer to be reproducible?",
      a: "The keep-latest dedupe: ROW_NUMBER() OVER (PARTITION BY event_natural_key ORDER BY ingested_at DESC) = 1 keeps the freshest ingest per business event. The two reproducibility requirements, said aloud: a deterministic tie-breaker (id DESC as the second ORDER BY key) so identical timestamps can't hand the choice to the engine, and a stated definition of 'latest' — latest INGEST is pipeline truth (what the warehouse knows newest), latest EVENT TIME is business truth (what actually happened) — and retries make them differ. Shopify drills this because webhook retries are a WHEN, not an IF; the naive DISTINCT or GROUP BY-everything shape silently keeps both copies when any payload column differs, and the naive DELETE without a tie-breaker can remove both. Natural key named, two-level ORDER BY named, 'latest' defined: that's the complete answer.",
      tag: "windows",
    },
    {
      id: "shop-t4",
      q: "Build the store dimension as SCD Type 2 in SQL: what makes a row 'current', and what does the version grain buy you?",
      a: "SCD2 keeps a version history: for each store, one row per attribute-era with valid_from, valid_to (or is_current), so 'what did we know then' is answerable. The SQL build derives eras from change events: LAG(plan) OVER (PARTITION BY store_id ORDER BY changed_at) detects transitions; the current row's flag is is_current = 1 or valid_to IS NULL — pick one sentinel and use it consistently, because 'both' is how double-counting starts. The version grain buys two things: point-in-time queries join ON store_id AND event_time >= valid_from AND event_time < valid_to (the half-open range — BETWEEN double-counts boundary moments), and restatements become visible instead of overwritten. The strong answer names the half-open convention unprompted; the failure mode it prevents — a store counted in two plans on the upgrade second — is exactly the bug Shopify's subscription billing cannot tolerate.",
      tag: "subqueries",
    },
    {
      id: "shop-t5",
      q: "A conversion funnel reads: 1000 sessions, 800 product views, 120 checkouts, 90 orders. What makes a funnel query honest, and what are the two classic ways fakes appear?",
      a: "Honesty is a shared-population contract: every stage's denominator is stage one — 90/1000 orders-per-session, not 90/120 orders-per-checkout when the deck said 'end-to-end conversion'. Fake one: the denominator drift — computing later stages against a different session population (a WHERE that filters by date on one CTE but not another), so drop-offs invent or hide churn. Fake two: the join fan-out — joining sessions to events multiplies rows, and a careless COUNT(*) counts event rows as sessions, inflating stage one and deflating every rate. The mechanics that keep it honest: build each stage as a COUNT(DISTINCT session_id) over its own filtered fold, or chain EXISTS checks per session so the population stays the same 1000. Shopify asks this because the funnel charts merchants act on are this exact query — a quietly fake funnel is a product decision waiting to happen.",
      tag: "aggregation",
    },
    {
      id: "shop-t6",
      q: "NULL, empty string and whitespace-only: three different 'missing' in one merchant field. How does your audit query treat each, and why does collapsing them matter?",
      a: "They behave differently and must be audited separately: IS NULL catches true absence (the field was never set); = '' catches explicit emptiness (set, but to nothing); TRIM(field) = '' AND field IS NOT NULL catches whitespace padding (set to something invisible). An audit that only checks IS NULL ships two-thirds blind, and a cleanup that treats them identically can destroy meaning — an empty-string country and a NULL country have different pipeline stories. The query shape: one pass with conditional counts — SUM(CASE WHEN field IS NULL THEN 1 ELSE 0 END), SUM(CASE WHEN TRIM(field) = '' THEN 1 ELSE 0 END) — per field, so the report shows the three buckets side by side. Shopify asks this because merchant-uploaded data hits all three constantly, and the follow-up 'which one would you COALESCE and why' tests whether the policy is deliberate.",
      tag: "nulls",
    },
    {
      id: "shop-t7",
      q: "Your cohort matrix shows week-4 retention above week-2 for one cohort. Before celebrating, what are the two data reasons this can be a lie?",
      a: "Reason one: a shrinking denominator — the cohort's population was recomputed per week (only still-active stores counted), so 'retention' climbs as the base shrinks; the fix is freezing the cohort denominator at signup-week size and computing every week's share against it. Reason two: late-arriving events — week-4 activity landed early in the warehouse while week-2 events are still trickling in, so the matrix mixes complete and incomplete columns; the fix is an as-of stamp on the query (only data ingested before cutoff X) or excluding the newest cohort weeks until they're closed. The interview point is the reflex: a retention number that IMPROVES with time is suspicious in a way a declining one isn't, and the two lies have different queries that expose them. Shopify's growth reviews have a standing rule — no cohort column is read until its denominator and ingest completeness are stated.",
      tag: "windows",
    },
    {
      id: "shop-t8",
      q: "Explain ROWS versus RANGE in a window frame using a rolling 7-day revenue average — when does the 'wrong' one silently produce a number merchants would dispute?",
      a: "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW peers six ROWS back — if a day has no orders and is missing from the fold, '7-day' quietly becomes 7-row-spanning-more-than-7-days. RANGE BETWEEN 6 DAYS PRECEDING... (or INTERVAL variants where supported) peers six CALENDAR days back — calendar-true, the number a merchant would defend. The dispute scenario: a low-traffic store with gap days; ROWS averages over a window that secretly spans nine calendar days, mixing periods the merchant thinks are separate. The robust answer goes further: build a date spine (every day as a row, LEFT JOIN the revenue onto it) so no day is ever missing and ROWS and RANGE agree. Shopify asks this because merchant dashboards promise calendar-truth, and the frame keyword is the difference between delivering it and approximating it.",
      tag: "windows",
    },
    {
      id: "shop-t9",
      q: "Six open invoices, none of them paid — the AR anti-join. LEFT JOIN + IS NULL or NOT EXISTS: which do you ship, and what does each shape risk?",
      a: "Both produce the 6 unpaid invoices here, but they fail differently. LEFT JOIN payments WHERE p.id IS NULL is the classic: readable, but one careless predicate on a payments column in WHERE (say p.method = 'card') converts it to an INNER join and the unpaid set becomes empty — the silent-death failure. It also fans out first: an invoice with three partial payments appears three times before the IS NULL filter, harmless for the anti-join itself and fatal if someone aggregates pre-filter. NOT EXISTS states the question directly — 'no payment row exists' — survives NULL keys in the subquery, and cannot be silently converted by a WHERE on the right table. The ship answer: NOT EXISTS for correctness-critical pipelines, LEFT JOIN + IS NULL for reviews where readability wins, and either way a row-count guard (6 here, not 0) visible in the output. At Shopify an AR number that silently goes empty is a dunning engine that stops emailing — the failure mode is a business process, not just a wrong cell.",
      tag: "joins",
    },
    {
      id: "shop-t10",
      q: "A PM wants 'stores with at least 10 orders last month'. WHERE COUNT(*) >= 10 errors. Walk the pipeline order and place every filter correctly.",
      a: "The logical pipeline is FROM, WHERE, GROUP BY, HAVING, SELECT (windows), ORDER BY, LIMIT — and the error message is the lesson: WHERE evaluates before GROUP BY, so COUNT(*) does not exist yet; aggregate predicates are judged in HAVING, after the fold. But the discipline is deciding which filters are ROW facts and which are GROUP facts before writing anything: 'last month' is a row fact (WHERE STRFTIME('%Y-%m', created_at) = …), 'at least 10 orders' is a group fact (HAVING COUNT(*) >= 10). Mixing them — putting the date filter in HAVING — happens to run in SQLite and produces a group per month with most discarded; it is still wrong, because it folds data you meant to exclude. The strong answer places each predicate by asking 'is this true of one order, or of the store's bucket?', then notes that HAVING on a folded count is where threshold families live — the 2-plus-orders repeat definition is the same move. At Shopify this habit is the difference between a query and a definition.",
      tag: "aggregation",
    },
    {
      id: "shop-t11",
      q: "One pass over orders must produce placed, delivered, shipped, pending and cancelled counts side by side. Compare FILTER (WHERE …) with the conditional-SUM idiom — which do you ship?",
      a: "Both compute the same five numbers in one scan: COUNT(*) FILTER (WHERE status = 'delivered') and SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) agree row for row. I ship FILTER where the engine supports it because the predicate lives where the reader expects it and there is no ELSE to forget; the conditional SUM's failure mode is real — drop the ELSE and SUM silently skips NULLs, which happens to give the same count here but produces a wrong share the moment someone divides by COUNT(*) expecting matched populations. The one-pass census matters at Shopify for a pipeline reason: merchant dashboards render at read time, and five separate queries per widget is five scans where one suffices. The follow-up is usually 'add the pending share' — 100.0 * pending / COUNT(*), 13.6 on the live db — which both shapes support; the point is producing it without a second pass, and saying the denominator (all 103 placed orders) out loud.",
      tag: "aggregation",
    },
    {
      id: "shop-t12",
      q: "The month grid ends with a TOTAL row. UNION ALL or UNION — and what does each choice risk?",
      a: "UNION ALL, always, for the stack: it appends 13 monthly rows and the TOTAL row as-is — 14 rows out. UNION runs a dedupe pass and, worse for a report, does not guarantee order: the engine is free to return the TOTAL row anywhere, and sorting afterwards means ORDER BY on a column where 'TOTAL' sorts by string rules against '2024-…' months — the label has to be engineered to sort last, or ordered by a dedicated sort key. The dedupe risk is subtler: a month whose revenue exactly equals the grand total (a single-month dataset) would collapse into one row under UNION. The costs are the point: UNION ALL is an O(n) append, UNION is a sort-and-dedupe. At Shopify the TOTAL row ships in merchant exports, so the house pattern is a literal 'TOTAL' label, UNION ALL, and an explicit ORDER BY that pins the summary last. Knowing why — not just that — is what the screen checks.",
      tag: "set-ops",
    },
    {
      id: "shop-t13",
      q: "January had 9 buying customers, February 7, some in both. Compare INTERSECT, feb EXCEPT jan and jan EXCEPT feb — what does the business learn from each?",
      a: "Three different reads of the same two folds of customers. INTERSECT returns the both-months buyers — the retained core. feb EXCEPT jan returns buyers NEW in February — ordered in feb but not jan. jan EXCEPT feb returns buyers LOST since January — the churned set. Two discipline points make the answer strong. First, sets not sums: these operators work on the customer grain (SELECT DISTINCT customer_id from orders), so a buyer with five February orders counts once — folding first or deduplicating is mandatory, or the fan-out lies. Second, semantics: EXCEPT and INTERSECT remove duplicates implicitly and treat NULLs as equal for matching, which is usually what a population read wants. The growth-accounting frame — new, retained, resurrected, churned — is literally built from these three shapes, and Shopify screens growth candidates on exactly this vocabulary because the cohort review consumes it weekly.",
      tag: "set-ops",
    },
    {
      id: "shop-t14",
      q: "Scalar, IN, EXISTS, correlated — four subquery shapes. Pick the right one for: (a) one-time-buyer share, (b) orders touching a discontinued product, (c) each customer's share of platform revenue.",
      a: "(a) is scalar subqueries in the SELECT: numerator and denominator are each a (SELECT COUNT(*) …) over different folds — the 12.5% one-time share is built exactly this way, and scalars are right because each side is a single value. (b) is NOT EXISTS (or NOT IN only when the subquery provably holds no NULLs): existence testing over orders touching the product; IN with a nullable key risks the empty-result trap, so EXISTS is the default wherever NULLs can sneak in. (c) is correlated: each customer's revenue against the platform total needs the outer row's SUM compared to a global — a correlated scalar does it readably at small scale, and the window version (SUM over the whole partition) is the one that scales. The meta-answer interviewers want: shape follows cardinality — one value, a set to test membership against, or a per-row recompute — and saying that sentence beats reciting syntax.",
      tag: "subqueries",
    },
    {
      id: "shop-t15",
      q: "A correlated subquery computing each customer's cancelled-order share runs fine on the seed db and times out at tenant scale. What is the instinct, and the rewrite?",
      a: "The instinct: a correlated subquery re-executes per outer row — 16 customers here is nothing, millions of tenants is a rescan per row, O(n×m). The rewrite computes the per-group fold once and joins it back: a derived table (SELECT customer_id, SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) FROM orders GROUP BY customer_id) joined to customers on the key, or a window — the FILTER count OVER (PARTITION BY customer_id) — which keeps every row and lets the outer query filter. Same algebra, one scan instead of n. The senior signal is knowing when NOT to rewrite: correlated probes against tiny dimensions are fine, and planners sometimes flatten them anyway — measure before refactoring. At Shopify the habit matters because per-tenant queries are the product: the difference between a dashboard that renders and one that melts is usually one correlated subquery someone shipped because it 'worked on the sample data'.",
      tag: "subqueries",
    },
    {
      id: "shop-t16",
      q: "Where do CTEs earn their keep in merchant analytics, and where do they become readability theater?",
      a: "CTEs earn keep in three places. Staging folds: the keep-latest dedupe (ROW_NUMBER … keep rn = 1) reads as WITH clean AS (…ranked…) SELECT … WHERE rn = 1 — the ranking and the filtering are different thoughts. Reuse: one cohort fold consumed by three ratio branches — write the fold once, reference it three times, and the definitions cannot drift apart. Recursion and staged windows: date spines and SCD2 era-builds are inexpressible readably in one flat SELECT. They become theater when a single WITH wraps a query that would be clearer flat, or when ten chained CTEs each pass one column forward — a pipeline debugged in secret that nobody can review. The Shopify-flavored rule: every CTE gets a name that states its grain (buyers_by_month, not tmp1), because the WITH list is where the definition conversation happens during review. If a reviewer can read the CTE names top to bottom and restate the metric, the staging is doing its job.",
      tag: "subqueries",
    },
    {
      id: "shop-t17",
      q: "Orders run 2024-01 through 2025-02. Which month-bucketing predicate is safe, and which two lose rows or invite wrong rows?",
      a: "Safe: WHERE STRFTIME('%Y-%m', created_at) = '2024-03' (the SUBSTR twin is equivalent) — it buckets first and compares the bucket, so every timestamp in March matches regardless of time-of-day. Risky one: BETWEEN '2024-03-01' AND '2024-03-31' — with full timestamps it loses everything after midnight on the 31st, the lost-last-day bug that makes every month-end report read low. Risky two: LIKE '%2024-03%' — the substring matches anywhere in the string, including inside time components on some layouts, silently building wrong populations. The pro answer adds the boundary convention: half-open ranges (>= '2024-03-01' AND < '2024-04-01') are the interval shape that generalizes to weeks and hours, and bucket-then-compare is the shape that survives the fold. The month grid the merchant opens — 13 rows from 2024-01 to 2025-02 — is this predicate wearing a GROUP BY; a one-day leak at the boundary is a revenue number someone plans inventory against.",
      tag: "dates",
    },
    {
      id: "shop-t18",
      q: "Days-to-ship is julianday(shipped_at) − julianday(created_at): 82 orders average 2.98 days, range 2..4. What does running AVG over all 103 orders do — and what is the honest definition?",
      a: "The arithmetic silently narrows the population: shipped_at is NULL for the 21 pending-plus-cancelled orders, julianday(NULL) is NULL, and AVG skips NULLs — so the result is still 2.98, but computed over 82 rows, not 103. Nothing errors; the denominator changed without a word. The honest definition states the population in the query and the caption: days-to-ship is defined over SHIPPED orders, pending orders have no latency yet, cancelled orders leave the metric entirely (they are demand, not fulfillment). The guard that makes the honesty visible: select COUNT(*) and COUNT(shipped_at) side by side — 103 and 82 — so the reader sees the gap the definition created. The range 2..4 is the second insight: with a spread that tight, a day at 3.5 is a real shift, not noise, which is why the metric earns a dashboard slot. Shopify asks this because 'NULL arithmetic changed my denominator' is the most common silent bug in fulfillment reporting.",
      tag: "dates",
    },
    {
      id: "shop-t19",
      q: "Build the month-over-month revenue walk with LAG. What does January's row compute to, and how do you keep it from poisoning the average of the deltas?",
      a: "LAG(SUM(total)) OVER (ORDER BY month) has no row before 2024-01, so January's delta computes to NULL — revenue minus NULL is NULL, and that is the correct answer: no month-over-month growth exists for the first month. The poison risk comes next: AVG(delta) over all rows skips the NULL, which is usually right, but a careless COALESCE(delta, 0) converts January into a fake flat month and drags the average down — the fix is to exclude the first row (filter post-window) rather than zero-fill it. The walk itself is two stages — SUM(total) per month folded first, LAG over the fold — which in practice means a CTE or a window-over-aggregate shape. Shopify's growth reviews live on this walk: the monthly trend (3731.97 in January sagging to 1193.86 by July, recovering through the fall) is read as MoM movements, and a fake-flat January is exactly the artifact that gets a review sent back.",
      tag: "windows",
    },
    {
      id: "shop-t20",
      q: "A running revenue total: SUM(SUM(total)) OVER (ORDER BY month). A teammate adds ROWS BETWEEN 1 PRECEDING AND CURRENT ROW 'to be explicit'. What breaks?",
      a: "The frame replaces the default, and the default was doing the work: with ORDER BY present, an unframed window runs RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — the cumulative sum. Specifying 1 PRECEDING..CURRENT ROW turns it into a two-month trailing sum, and the cumulative chart quietly becomes a rolling one: January equals January, February equals Jan+Feb, but March equals Feb+Mar — the merchant sees a 'running total' that flattens exactly when volume rises. The sting: on a no-ties monthly fold, RANGE and ROWS agree for the UNBOUNDED..CURRENT ROW frame, so the explicit frame is only wrong when someone 'optimizes' it downward. The rule worth saying: frames are a precision tool — trailing windows (7-day averages) and cumulative runs (UNBOUNDED PRECEDING) are different products, and the frame clause is where you commit to which one you owe the merchant. Shopify's dashboards render both shapes weekly; confusing them is a support ticket with a chart attached.",
      tag: "windows",
    },
    {
      id: "shop-t21",
      q: "Split the 16 customers into spend quartiles with NTILE(4). Which tile holds the concentration, and what does NTILE do when the count does not divide evenly?",
      a: "NTILE(4) OVER (ORDER BY lifetime_spend DESC) deals customers into four buckets as evenly as the count allows: 16 divides cleanly into tiles of 4, and tile 1 — the highest ORDER BY values under DESC — is exactly the top-spend quartile whose 3000-plus members carry 63.5% of revenue. When the count does not divide evenly, NTILE gives the earlier tiles the extra row: 10 rows into 4 tiles lands 3-3-2-2, front-loaded — worth saying because 'evenly' is an assumption people make. The distinction that closes the answer: NTILE is for fixed-size bands (quartiles for the board deck), PERCENT_RANK or CUME_DIST answer 'what share of the distribution sits below this customer' — the concentration curve — and a HAVING gate on per-customer SUM >= 3000 answers the actual threshold question directly. Shopify asks this because merchant-facing 'top customer tiers' are quartile products, and an off-by-one-tile bug puts whales in the wrong marketing segment.",
      tag: "windows",
    },
    {
      id: "shop-t22",
      q: "Beyond exact duplicates: the same order arrives twice with a re-priced total. What does your duplicate audit look like when rows are ALMOST the same?",
      a: "Exact-duplicate checks (GROUP BY every column HAVING COUNT(*) > 1) miss re-priced retries by design — the payload differs, so nothing groups. The audit has to be key-first: GROUP BY the natural key (order id, or event id) and count rows per key — any key with 2-plus rows is a candidate duplicate regardless of payload drift. Then a second query profiles the drift: MIN(total) versus MAX(total) per key tells you whether the retry re-priced (different totals) or merely re-delivered (identical). The policy question the audit feeds — which copy wins, keep-latest by ingest with a deterministic tie-breaker for pipeline truth, or keep-highest-status for business truth — is a definition, and the audit exists so the definition is applied knowingly. Shopify's screens probe the instinct because webhook retries are guaranteed at platform scale: an audit that only catches byte-identical rows reports a clean bill on exactly the data that is dirtiest.",
      tag: "data-quality",
    },
    {
      id: "shop-t23",
      q: "orders.total is REAL dollars; invoices.amount_cents is INTEGER cents. A report divides by 100 in one place and 100.0 in another. What goes wrong and what is the house rule?",
      a: "Integer division is the trap: amount_cents / 100 truncates — 6148 cents becomes 61 dollars, and anything under 100 cents becomes 0; across 28 invoices the report silently loses the cents side of every row. amount_cents / 100.0 promotes to real arithmetic first: 61.48. The house rule is one sentence: money leaves its integer grain exactly once, through division by 100.0, at the outermost SELECT — never inside a fold, never twice. Fold in cents (SUM(amount_cents) is exact — integers do not accumulate float error), convert once at the presentation boundary, ROUND only there: the partial payment of 4000 against 6148 cents displays as 40.00 of 61.48. The Shopify-flavored sting: mixing REAL dollars (orders.total, 34833.28 across 103 orders) with converted cents in one SUM is how unit confusion and float noise combine — the reconciliation query that catches it compares totals per table in each table's own grain, never in a shared fold.",
      tag: "data-quality",
    },
    {
      id: "shop-t24",
      q: "The merchant dashboard renders per store: WHERE customer_id = ? AND status != 'cancelled' ORDER BY created_at DESC. What is your index instinct, and why is a status index useless here?",
      a: "Composite on (customer_id, created_at): the equality key first — it collapses the scan to one store's rows — and the sort key second, so ORDER BY created_at DESC walks the index instead of sorting, and LIMIT 10 stops after ten entries. One structure answers filter, sort and cap. A status index is useless twice over: status != 'cancelled' is a negation (B-trees serve equality and ranges, not 'everything except'), and the column has four values — about 7 cancelled orders in 103 — so it selects almost nothing alone. The broader instincts to narrate: selectivity decides usefulness (customer_id at per-store cardinality is the whole win; a 4-value status is noise), functions on columns defeat indexes (STRFTIME(created_at) cannot use a created_at index — bucket by range instead), and COUNT(DISTINCT …) over a fan-out is the expensive fold to keep out of render paths. Shopify uses index questions to test whether you think of a query as something that runs per tenant, millions of times — because here, it does.",
      tag: "performance",
    },
  ],

  mcqs: [
    {
      id: "shop-mcq-1",
      prompt: "A store has 96 placed orders totalling 33680.79 and 7 cancelled ones. Which AOV does the merchant dashboard (placed-only definition) show?",
      choices: [
        "33680.79 / 103 ≈ 326.99",
        "33680.79 / 96 ≈ 350.84",
        "(33680.79 + cancelled totals) / 103",
        "33680.79 / 7 ≈ 4811.54",
      ],
      answer: 1,
      why: "Placed-only AOV pairs the kept revenue with the kept order count — 96 orders, 350.84 each. The definition excludes cancelled demand from BOTH sides; mixing populations is the classic AOV dispute.",
      notes: [
        { choice: 0, why: "That's the placed revenue over ALL orders — cancelled demand removed from the numerator but left in the denominator. The mixed-population AOV reads low." },
        { choice: 3, why: "That's revenue per CANCELLATION — the denominator picked up the wrong filter entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "shop-mcq-2",
      prompt: "Which expression computes one-time buyer share (customers with exactly one order ÷ all customers) without integer-division truncation?",
      choices: [
        "COUNT(*) / (SELECT COUNT(*) FROM customers) * 100",
        "100.0 * (SELECT COUNT(*) FROM (…one-order fold…)) / (SELECT COUNT(*) FROM customers)",
        "AVG(order_count = 1) * 100 on the orders table",
        "100 * one_timers / 16 with integer literals",
      ],
      answer: 1,
      why: "The one-order fold builds the numerator at customer grain; the denominator counts ALL customers; 100.0 promotes before division. Three guards, one expression.",
      notes: [
        { choice: 0, why: "COUNT(*) at the top level isn't the one-timer count — and even if it were, integer ÷ integer truncates before the *100 lands." },
        { choice: 3, why: "It happens to work here, but hardcoding the 16 breaks on every data change — the denominator must be queried, not memorized." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-3",
      prompt: "A retried webhook delivered the same order event twice with identical payloads. Which query shape guarantees one row per order?",
      choices: [
        "SELECT DISTINCT * FROM events",
        "ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY ingested_at DESC, id DESC) = 1",
        "GROUP BY ingested_at",
        "WHERE ingested_at = (SELECT MAX(ingested_at) FROM events)",
      ],
      answer: 1,
      why: "ROW_NUMBER over the natural key with a two-level ORDER BY keeps exactly one row per order, deterministically. DISTINCT * collapses only BYTE-identical rows; the global MAX keeps one order total, not one per order.",
      notes: [
        { choice: 0, why: "If any payload column differs (a re-priced field, a status bump), DISTINCT * keeps both rows. The natural key, not the payload, defines 'same event'." },
        { choice: 3, why: "The global MAX(ingested_at) matches only the single newest event across ALL orders — it doesn't dedupe per order." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-4",
      prompt: "Sessions: 1000. Stage counts via LEFT JOINs to events: views 800, checkouts 120, orders 90. Which end-to-end conversion is honest?",
      choices: [
        "90 / 120 = 75%",
        "90 / 1000 = 9%",
        "120 / 800 = 15% summed with 90 / 120 = 75% → 90%",
        "800 / 1000 + 120 / 800 + 90 / 120 ≈ 99%",
      ],
      answer: 1,
      why: "End-to-end conversion measures the funnel mouth to the exit: orders over the ORIGINAL session population. Per-stage rates answer different questions and only multiply back to the end-to-end number if every stage shares stage-one's denominator.",
      notes: [
        { choice: 0, why: "That's checkout-to-order conversion — the last hop, not the funnel. Calling it 'end-to-end' inflates performance 8×." },
        { choice: 3, why: "Adding stage rates is a category error — rates don't sum; chained they MULTIPLY (0.8 × 0.15 × 0.75 = 9%, agreeing with the honest number by accident of the example)." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-5",
      prompt: "product_price changes over time; the SCD2 dimension keeps valid_from / valid_to. Which join finds the price IN FORCE on 2024-05-05?",
      choices: [
        "ON p.product_id = s.product_id AND s.valid_from <= '2024-05-05' AND s.valid_to > '2024-05-05'",
        "ON p.product_id = s.product_id WHERE s.valid_from = MAX(valid_from)",
        "ON p.product_id = s.product_id AND s.is_current = 1",
        "ON p.product_id = s.product_id AND '2024-05-05' BETWEEN valid_from AND valid_to",
      ],
      answer: 0,
      why: "The half-open range [valid_from, valid_to) is the SCD2 contract — exactly one version matches any instant, with no boundary double-count. is_current finds TODAY's price, not the historical one.",
      notes: [
        { choice: 3, why: "BETWEEN is inclusive on both ends — an event exactly at valid_to matches TWO versions. The half-open > (or >=) breaks the tie deliberately." },
        { choice: 2, why: "That answers 'current price' — a different question. Point-in-time asks what was true THEN; that's what versioning exists for." },
      ],
      difficulty: "hard",
    },
    {
      id: "shop-mcq-6",
      prompt: "Which single-pass query audits a merchant field's three kinds of missing — NULL, empty, whitespace-only?",
      choices: [
        "WHERE field IS NULL OR field = '' OR TRIM(field) = ''",
        "SUM(CASE WHEN field IS NULL THEN 1 ELSE 0 END), SUM(CASE WHEN TRIM(field) = '' THEN 1 ELSE 0 END) — with NULL excluded from the second",
        "COUNT(field) — it skips all missing kinds",
        "WHERE TRIM(COALESCE(field, '')) = ''",
      ],
      answer: 1,
      why: "Conditional sums in one pass report each kind separately — NULLs and blanks have different pipeline stories, and the audit exists to separate them. COUNT(field) skips NULLs silently and can't see empties as distinct.",
      notes: [
        { choice: 0, why: "It filters rather than audits — the three kinds collapse into one discarded pile, and the report can't say WHICH problem dominates or how many rows survive." },
        { choice: 3, why: "It collapses all three kinds into one predicate — right for cleanup, wrong for audit. TRIM(COALESCE(field,'')) = '' can't distinguish NULL from empty." },
      ],
      difficulty: "hard",
    },
    {
      id: "shop-mcq-7",
      prompt: "A cohort matrix shows week-4 retention (62%) ABOVE week-2 (48%). What's the first thing to check?",
      choices: [
        "Celebrate — improving retention is the goal",
        "The denominator: is each week's share computed against the cohort's ORIGINAL size, or a shrinking still-active base?",
        "The color scale of the visualization",
        "Whether week-4 has more users than week-2 in absolute terms",
      ],
      answer: 1,
      why: "Retention that rises with cohort age is the signature of a shrinking denominator — recomputing the base per week makes churn invisible. The honest matrix freezes the denominator at signup-week size.",
      notes: [
        { choice: 3, why: "Absolute counts rising while shares rise is CONSISTENT with the shrinking-base bug — the bug is in the ratio's construction, not the row counts." },
        { choice: 0, why: "Real retention curves are monotonically non-increasing in healthy products; a rise is a data smell until proven otherwise." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-8",
      prompt: "Daily revenue has gap days (no orders = no rows). Which rolling-7-day average would a merchant dispute?",
      choices: [
        "AVG(rev) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)",
        "A date-spine LEFT JOIN first, then the ROWS frame over the completed calendar",
        "AVG(rev) OVER (ORDER BY day RANGE BETWEEN 6 PRECEDING AND CURRENT ROW) with INTERVAL support",
        "None — all three always agree",
      ],
      answer: 0,
      why: "ROWS peers six ROWS back; with gap days the window silently spans more than seven calendar days — mixing periods the merchant thinks are separate. The spine (or a calendar-true RANGE) keeps the promise.",
      notes: [
        { choice: 2, why: "RANGE with a true interval IS the calendar-true fix — the merchant wouldn't dispute it. The dispute targets ROWS over incomplete calendars." },
        { choice: 3, why: "They disagree exactly when days are missing from the fold — which is every low-traffic store's reality." },
      ],
      difficulty: "hard",
    },
    {
      id: "shop-mcq-9",
      prompt: "orders.customer_id is NOT NULL, but the orders⋈order_items fan-out (103 → 187) is in play. Which counts UNIQUE BUYERS on the joined table?",
      choices: [
        "COUNT(*)",
        "COUNT(customer_id)",
        "COUNT(DISTINCT customer_id)",
        "COUNT(DISTINCT order_id)",
      ],
      answer: 2,
      why: "After the fan-out, only DISTINCT folds rows back to people: COUNT(DISTINCT customer_id) counts buyers. COUNT(*) and COUNT(customer_id) both count line items (187); DISTINCT order_id counts orders (103).",
      notes: [
        { choice: 1, why: "customer_id is NOT NULL, so COUNT(customer_id) = COUNT(*) = 187. NULL-skipping isn't folding — DISTINCT is." },
        { choice: 3, why: "That's the order count — one grain finer than buyers. Each fold needs its own DISTINCT key: order_id for orders, customer_id for people." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-10",
      prompt: "Channel LTV is revenue per acquired customer; CAC is spend per acquired customer. Which query grain mistake makes LTV:CAC read absurdly high?",
      choices: [
        "Computing LTV over ALL customers while CAC counts only ACQUIRED customers (attribution-window conversions)",
        "Rounding both to two decimals before dividing",
        "Using SUM for revenue and COUNT for customers",
        "Joining customers to orders",
      ],
      answer: 0,
      why: "The populations must match: LTV over every customer against CAC over acquired-only customers inflates the ratio — the denominator populations differ, so the 'ratio' compares different universes. Rounding and ordinary aggregates don't move a ratio by orders of magnitude.",
      notes: [
        { choice: 1, why: "Rounding moves the third decimal at most — absurd LTV:CAC readings are population mismatches, not precision artifacts." },
        { choice: 2, why: "That's just revenue ÷ customers — the correct skeleton of BOTH metrics. The absurdity comes from whose customers each side counts." },
      ],
      difficulty: "hard",
    },
    {
      id: "shop-mcq-11",
      prompt: "A merchant segment needs stores with at least 10 orders in the month. Where does the COUNT(*) >= 10 predicate belong?",
      choices: [
        "WHERE — filters rows early",
        "HAVING — judges the folded group",
        "ORDER BY — ranks, then the app filters",
        "GROUP BY — as a grouping key",
      ],
      answer: 1,
      why: "COUNT(*) only exists after GROUP BY folds the rows, and aggregate predicates are judged in HAVING — the last gate before SELECT. WHERE cannot see aggregates; it runs before the fold exists.",
      notes: [
        { choice: 0, why: "WHERE runs pre-fold — COUNT(*) isn't computable there. Row filters belong there for dates and statuses; thresholds on aggregates do not." },
        { choice: 2, why: "Sorting by the count then filtering in the app is the N+1 anti-pattern — the database should enforce the definition it ships." },
      ],
      difficulty: "easy",
    },
    {
      id: "shop-mcq-12",
      prompt: "A merchant export appends a 'TOTAL' row under 13 monthly revenue rows. Why does the house style mandate UNION ALL over UNION here?",
      choices: [
        "UNION ALL appends as-is; UNION dedupes, costs a sort, and doesn't guarantee the TOTAL lands last",
        "UNION ALL is faster because it skips parsing",
        "UNION would drop the monthly rows",
        "UNION ALL casts numbers to text",
      ],
      answer: 0,
      why: "The stack wants raw concatenation: UNION ALL is an O(n) append. UNION adds a dedupe pass, may reorder, and a month whose revenue equals the grand total (single-month data) would collapse with the summary row.",
      notes: [
        { choice: 2, why: "UNION keeps one copy of each distinct row — it doesn't discard the months. The real risks are the dedupe pass and reordering, not data loss." },
        { choice: 1, why: "Both parse fine — the saving is the dedupe/sort pass, and the guarantee is append semantics you then pin with an explicit ORDER BY." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-13",
      prompt: "Which predicate captures EVERY order in March 2024, including 23:59 on March 31?",
      choices: [
        "created_at BETWEEN '2024-03-01' AND '2024-03-31'",
        "STRFTIME('%Y-%m', created_at) = '2024-03'",
        "created_at LIKE '%2024-03%'",
        "SUBSTR(created_at, 6, 2) = '03'",
      ],
      answer: 1,
      why: "Bucket-then-compare: STRFTIME reduces each timestamp to its month string, so every moment of March matches, boundary to boundary. No day-edge arithmetic to get wrong.",
      notes: [
        { choice: 0, why: "BETWEEN loses everything after midnight on the 31st — the lost-last-day bug that makes month-end revenue read low." },
        { choice: 3, why: "That matches March of EVERY year in the table — 2025-03 rows sneak in. The year arm of the bucket is missing." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-14",
      prompt: "82 of 103 orders have shipped_at set. Which expression counts orders awaiting shipment?",
      choices: [
        "COUNT(*) - COUNT(shipped_at)",
        "COUNT(shipped_at)",
        "COUNT(*)",
        "COUNT(shipped_at IS NULL)",
      ],
      answer: 0,
      why: "COUNT(*) counts all 103; COUNT(shipped_at) skips NULLs and counts 82; the difference — 21 — is exactly the awaiting-shipment set, measured by NULL arithmetic instead of a second query.",
      notes: [
        { choice: 1, why: "That's the shipped count — the complement of the ask. Right shape, wrong sign." },
        { choice: 3, why: "The expression returns 0/1, never NULL, so COUNT counts every row — 103. COUNT counts non-NULL values, not TRUEs." },
      ],
      difficulty: "easy",
    },
    {
      id: "shop-mcq-15",
      prompt: "invoices.amount_cents holds INTEGER cents (invoice 25: 6148). Which expression returns dollars — 61.48?",
      choices: [
        "amount_cents / 100",
        "amount_cents / 100.0",
        "ROUND(amount_cents, 2)",
        "amount_cents % 100",
      ],
      answer: 1,
      why: "Dividing integers by an integer truncates: 6148 / 100 = 61. The .0 promotes to real arithmetic before the division, preserving the cents — the house rule is money converts once, by 100.0, at the outer edge.",
      notes: [
        { choice: 0, why: "Integer division — 48 cents vanish on this invoice alone, and any value under 100 cents rounds to zero dollars." },
        { choice: 3, why: "The modulo returns the cents REMAINDER (48), not the dollar value. A different question entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "shop-mcq-16",
      prompt: "A correlated subquery computes each customer's cancelled share and times out at tenant scale. The standard fix is:",
      choices: [
        "Fold once per customer in a derived table (or window PARTITION BY customer_id) and join back",
        "Add DISTINCT to the subquery",
        "Move the subquery into ORDER BY",
        "Wrap the query in UNION",
      ],
      answer: 0,
      why: "Correlated subqueries re-execute per outer row — O(n×m). Computing the fold once at customer grain and joining it back is one scan; the algebra is identical, the execution plan is not.",
      notes: [
        { choice: 1, why: "DISTINCT changes the result set, not the per-row execution model — still a rescan per customer." },
        { choice: 3, why: "UNION changes semantics entirely and does nothing about per-row evaluation. The fix is structural: fold, then join." },
      ],
      difficulty: "hard",
    },
    {
      id: "shop-mcq-17",
      prompt: "WHERE invoice_id NOT IN (SELECT invoice_id FROM dirty_payments) — the subquery returns one NULL among its rows. What does the anti-join return?",
      choices: [
        "Zero rows — every comparison lands UNKNOWN",
        "All rows except the NULL one",
        "A SQL error",
        "Only rows whose invoice_id is NULL",
      ],
      answer: 0,
      why: "x NOT IN (…, NULL) can never be TRUE: if x matches a listed value the IN is TRUE; otherwise the NULL makes the comparison UNKNOWN — and WHERE keeps only TRUE. The classic silent-empty anti-join.",
      notes: [
        { choice: 1, why: "Tempting, but tri-valued logic doesn't 'skip' the NULL — it converts every non-matching row to UNKNOWN, which WHERE discards." },
        { choice: 2, why: "No error is raised — that's what makes the bug dangerous. NOT EXISTS is the NULL-safe shape." },
      ],
      difficulty: "hard",
    },
    {
      id: "shop-mcq-18",
      prompt: "LAG(monthly_revenue) OVER (ORDER BY month) builds the MoM walk. January's delta computes to:",
      choices: [
        "NULL — no prior row exists",
        "0 — the engine defaults missing rows to zero",
        "January's own revenue",
        "A SQL error",
      ],
      answer: 0,
      why: "LAG with no previous row returns NULL, and revenue minus NULL is NULL — the honest 'no comparison exists' for the first month. COALESCE-ing it to 0 fakes a flat January and drags delta averages down.",
      notes: [
        { choice: 1, why: "The zero-fill is the trap: it silently invents a growth number for a month that has no prior. Exclude the first row instead." },
        { choice: 2, why: "LAG never wraps cyclically — there is no December-to-January echo unless you write one deliberately." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-19",
      prompt: "SUM(rev) OVER (ORDER BY month) is the cumulative total. A teammate adds ROWS BETWEEN 1 PRECEDING AND CURRENT ROW 'for clarity'. The chart now shows:",
      choices: [
        "A 2-month trailing sum wearing a cumulative title",
        "The same cumulative total",
        "A SQL error — frames need PARTITION BY",
        "Only the current month's value",
      ],
      answer: 0,
      why: "The explicit frame REPLACES the default (RANGE UNBOUNDED PRECEDING..CURRENT ROW — cumulative). 1 PRECEDING..CURRENT ROW is a trailing-2 window: January alone, Feb+Jan, Mar+Feb — flattening exactly when volume rises.",
      notes: [
        { choice: 1, why: "It matches on the first row only — from row two the numbers diverge. Frame clauses always replace the default, never decorate it." },
        { choice: 2, why: "Frames are legal without PARTITION BY — the whole partition is one frame. The failure is semantic, not syntactic." },
      ],
      difficulty: "hard",
    },
    {
      id: "shop-mcq-20",
      prompt: "NTILE(4) OVER (ORDER BY lifetime_spend DESC) over 16 customers. Where do the top spenders — the 63.5%-of-revenue crowd — land?",
      choices: [
        "Tile 1",
        "Tile 2",
        "Tile 4",
        "Spread evenly across all tiles",
      ],
      answer: 0,
      why: "Tiles deal from the ORDER BY head: under DESC, the highest spenders are dealt into tile 1. Sixteen divides evenly into four tiles of four — and tile 1 is the top-spend quartile the concentration read consumes.",
      notes: [
        { choice: 2, why: "Tile 4 is the BOTTOM quartile under DESC ordering — the lightest baskets. The ORDER BY direction decides which end is 'top'." },
        { choice: 3, why: "NTILE bands by rank, not by mixing — each customer lands in exactly one tile, in ORDER BY sequence." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-21",
      prompt: "GROUP_CONCAT(sku) per order builds 'SKU-1,SKU-2,…' for an export. Which caveat must the query address?",
      choices: [
        "Element order is unspecified by default, and the separator defaults to a comma",
        "It errors when a value is NULL",
        "It returns at most 2 elements",
        "It only works on numeric columns",
      ],
      answer: 0,
      why: "Without an explicit ORDER BY inside the aggregate (engine-permitting), concatenation order follows scan order — an unstable export. The comma default also needs the SEPARATOR override when the spec says ', '.",
      notes: [
        { choice: 1, why: "NULLs are SKIPPED, not fatal — its own subtlety: the list can come out shorter than the order's line count." },
        { choice: 2, why: "No such cap — the limit people actually hit is the group_concat_max_len engine setting, not the function's arity." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-22",
      prompt: "COUNT(*) FILTER (WHERE status = 'shipped') versus SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END):",
      choices: [
        "Equivalent counts — FILTER states the predicate and can't forget the ELSE",
        "FILTER is faster by definition",
        "The CASE version counts NULL rows",
        "FILTER ignores the WHERE clause",
      ],
      answer: 0,
      why: "Both count shipped rows in one pass. The CASE idiom's failure mode is dropping the ELSE: SUM then skips the NULLs — the same count here by luck, wrong the moment the expression feeds a share whose denominator assumes matched populations.",
      notes: [
        { choice: 1, why: "Performance differences are planner details, not contracts. The reason to prefer FILTER is expressive: the predicate reads where it applies." },
        { choice: 2, why: "CASE returns 0 for non-matching rows here, never NULL — nothing extra gets counted. The NULL risk appears only when ELSE is omitted." },
      ],
      difficulty: "easy",
    },
    {
      id: "shop-mcq-23",
      prompt: "Top-5 products by units sold: the counts run 47, 46, 38, 36, 36 with two products tied at 36. What does ORDER BY units_sold DESC LIMIT 5 return?",
      choices: [
        "5 rows — which tied product is included is engine-arbitrary",
        "6 rows — ties always expand the LIMIT",
        "An error on the tie",
        "The alphabetically first tied product, by rule",
      ],
      answer: 0,
      why: "LIMIT is a row cap, not a rank boundary: the engine keeps any 5 rows satisfying the ORDER BY, so one of the two 36s is kept by whatever the sort happens to do — nondeterministic output.",
      notes: [
        { choice: 1, why: "That's RANK() semantics, not LIMIT semantics. If the business wants both tied products, rank with a window and keep ties deliberately." },
        { choice: 3, why: "No such rule exists in SQL — alphabetization by accident isn't a contract. The fix is a deterministic second ORDER BY key." },
      ],
      difficulty: "easy",
    },
    {
      id: "shop-mcq-24",
      prompt: "Buyers_feb EXCEPT Buyers_jan returns:",
      choices: [
        "Customers who bought in February but not January — the NEW set",
        "Customers in both months",
        "Customers lost since January",
        "All February orders",
      ],
      answer: 0,
      why: "EXCEPT keeps rows of the left set with no match on the right: feb-minus-jan is the new-buyer set. Direction is the whole meaning — jan EXCEPT feb is the churned set, INTERSECT the retained core.",
      notes: [
        { choice: 1, why: "Both-months is INTERSECT. The three operators are one vocabulary: new, retained, churned." },
        { choice: 2, why: "Lost buyers are jan EXCEPT feb — the reverse direction. Reading set ops backwards is the most common growth-accounting bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "shop-mcq-25",
      prompt: "Count invoices with zero payments (the AR read). Which shape does NOT work?",
      choices: [
        "INNER JOIN payments … WHERE p.amount_cents IS NULL",
        "LEFT JOIN payments … WHERE p.id IS NULL",
        "WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "LEFT JOIN … GROUP BY i.id HAVING COUNT(p.id) = 0",
      ],
      answer: 0,
      why: "The INNER JOIN discards invoice rows with no payment before WHERE runs — there is no NULL payload left to test. The unmatched rows the question asks about were deleted by the join type itself.",
      notes: [
        { choice: 1, why: "The classic anti-join: LEFT JOIN preserves the 6 unpaid invoices with NULL payment payloads, and IS NULL finds them." },
        { choice: 3, why: "After a LEFT JOIN, COUNT(p.id) counts matched rows only — 0 for unpaid invoices. HAVING on that count is a valid filter." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-26",
      prompt: "Revenue per customer: orders⋈order_items fans 103 orders into 251 lines. SUM(o.total) on the join overstates revenue. Why, and the fix?",
      choices: [
        "o.total repeats once per line item of its order — fold revenue at order grain first, or sum quantity*unit_price on lines",
        "DISTINCT o.total inside SUM fixes it",
        "Divide by COUNT(*) at the end",
        "Join on customer_id instead of order_id",
      ],
      answer: 0,
      why: "The join multiplies rows: an order with 4 lines carries its total 4 times into the SUM. Keep grains apart — SUM(o.total) over orders, or SUM(quantity * unit_price) over lines — never mix them in one fold.",
      notes: [
        { choice: 1, why: "DISTINCT collapses equal totals — including two DIFFERENT orders that happen to cost the same. Under-counts, silently." },
        { choice: 2, why: "Dividing by the line count assumes every order has the same number of lines. Fan-out is per-order, not uniform." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-27",
      prompt: "julianday(shipped_at) − julianday(created_at) averages 2.98 over the shipped 82. Run AVG of that expression over all 103 orders (21 have NULL shipped_at). The result:",
      choices: [
        "Still 2.98 — AVG skips NULLs, silently narrowing the population to 82",
        "Roughly 2.37 — NULL orders contribute zero days",
        "0 — one NULL poisons the average",
        "A type error on NULL dates",
      ],
      answer: 0,
      why: "julianday(NULL) is NULL, AVG ignores NULLs — the average is unchanged, but the denominator quietly shrank from 103 to 82. The number is right and the definition changed without a word.",
      notes: [
        { choice: 1, why: "NULLs don't coerce to zero in AVG — that's SUM-with-replacement thinking. The danger is the silent population change, not the math." },
        { choice: 2, why: "Aggregates skip NULLs rather than propagate them. The guard is COUNT(*) versus COUNT(shipped_at) side by side — 103 versus 82." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-28",
      prompt: "A per-store render runs WHERE customer_id = ? AND status != 'cancelled' ORDER BY created_at DESC LIMIT 10. Best index:",
      choices: [
        "(customer_id, created_at)",
        "(status)",
        "(total)",
        "No index — 103-row scans are fine at scale",
      ],
      answer: 0,
      why: "Equality column first collapses to the store's rows; created_at second lets the index serve the ORDER BY directly and LIMIT stops after 10 entries. One structure answers filter, sort and cap.",
      notes: [
        { choice: 1, why: "status != is a negation B-trees can't seek, and 4 values select almost nothing. Low-selectivity columns make poor leading keys." },
        { choice: 3, why: "The seed db is tiny, but the query runs per tenant per render at platform scale — the instinct being tested is the composite shape, not the sample size." },
      ],
      difficulty: "hard",
    },
    {
      id: "shop-mcq-29",
      prompt: "GROUP BY c.name with RANK() OVER (ORDER BY SUM(o.total) DESC) in the SELECT. What does the window rank?",
      choices: [
        "The folded groups — windows evaluate after GROUP BY, so SUM is legal inside them",
        "The raw order rows, before folding",
        "Nothing — windows and GROUP BY can't combine",
        "Only the first group",
      ],
      answer: 0,
      why: "Window functions are evaluated over the grouped result set: the fold happens first, then the window sees one row per group with its aggregate — which is exactly why RANK() OVER (ORDER BY SUM(...)) is the leaderboard shape.",
      notes: [
        { choice: 1, why: "By the time windows run, raw rows are gone — the window's input is the folded groups. That's why it can use SUM but not bare columns outside the GROUP BY." },
        { choice: 2, why: "They combine routinely — the leaderboard pattern depends on it. What they can't do is see pre-fold rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "shop-mcq-30",
      prompt: "28 invoices: 21 paid exactly, 6 unpaid, 1 partial (4000 of 6148 cents). The one-pass coverage classifier is:",
      choices: [
        "LEFT JOIN payments, COALESCE the summed cents, then CASE WHEN paid = 0 THEN 'no payment' WHEN paid = i.amount_cents THEN 'exact' ELSE 'partial' END",
        "Three separate queries UNIONed together",
        "WHERE EXISTS per class, three times",
        "GROUP BY status on the payments table",
      ],
      answer: 0,
      why: "One LEFT JOIN preserves all 28 invoices, SUM(p.amount_cents) with COALESCE(…, 0) gives each a paid figure, and the CASE compares at invoice grain — three classes, one scan, no double-counting.",
      notes: [
        { choice: 1, why: "Separate passes can double-count the partial (it matches 'has payments' and 'not exact') and drift when a definition changes between passes." },
        { choice: 3, why: "Grouping payments by their invoice's status never sees the unpaid 6, and the partial gets classified by a status label, not by its coverage." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-shop-1",
      tier: "medium",
      topic: "j7",
      universe: "pricing",
      title: "The merchant's morning AOV wall",
      brief:
        "Shopify-flavored brief on the storefront db: the merchant dashboard's first widget is average order value per region — with the platform's standing definition: placed orders only, cancelled demand excluded from BOTH sides. The merchant reads it every morning and disputes it monthly, so the query must show the definition, not just the number. Probed facts, placed-only: LATAM 2 orders at 426.22 AOV, US 18 at 396.79, EU 42 at 347.49, APAC 34 at 326.22 — a clean four-row wall, cheapest basket in APAC, priciest in LATAM's small but heavy sample.",
      ask: "Return every region with placed orders: region, order count, and aov (revenue per placed order, two decimals), highest AOV first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS orders,\n       ROUND({1}(o.total) / COUNT(*), 2) AS aov\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status {2} 'cancelled'\nGROUP BY c.region\nORDER BY aov {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the revenue adder",
          why: "SUM(o.total) per region feeds the ratio — 426.22 in LATAM is SUM/2. AVG(o.total) would be the per-LINE average, divided AGAIN by COUNT(*) in the template — a number that means nothing to a merchant.",
        },
        {
          answer: "!=",
          kind: "keyword",
          label: "the placed-only filter",
          why: "The definition excludes cancelled demand from BOTH sides: status != 'cancelled' drops them before folding, so COUNT(*) stays the placed count the AOV divides by. '=' would answer the opposite dashboard — cancelled carts only.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the priciest-first direction",
          why: "The widget reads highest AOV on top: LATAM 426.22, US 396.79, EU 347.49, APAC 326.22. ASC would open the merchant's morning with their weakest basket region — honest data, wrong headline.",
        },
      ],
      distractors: ["COUNT", "AVG", "MAX", "=", "IS", "ASC"],
      walkthrough:
        "A ratio with its definition visible. The WHERE clause IS the product: status != 'cancelled' applies before any folding, so cancelled demand leaves the numerator (SUM(o.total)) and the denominator (COUNT(*)) together — the placed-only contract both sides of the division share. GROUP BY region folds 96 kept orders into four buckets; SUM over COUNT with the ROUND at the very end yields LATAM 426.22, US 396.79, EU 347.49, APAC 326.22. ORDER BY aov DESC is the merchant's reading order. The distractors are the AOV disputes in miniature: AVG divided again by COUNT is a number with no business meaning; COUNT makes every region's AOV exactly 1.0; '=' and 'IS' flip the wall to cancelled carts only — where LATAM vanishes (zero cancelled) and the merchant's best region disappears from their own dashboard. One character of filter placement is the difference between a dashboard and a dispute.",
    },
    {
      id: "cs-shop-2",
      tier: "hard",
      topic: "q2",
      universe: "growth",
      title: "The one-time buyer share",
      brief:
        "Shopify-flavored brief on the storefront db: the retention review needs its anchor number — what share of customers never came back. The definition is fixed: customers with EXACTLY one order ÷ ALL registered customers, as a percentage to one decimal. Probed facts: 16 customers, 14 ordered 2+ times (the repeat engine), exactly 2 ordered once — a 12.5% one-time share. The denominator includes never-orderers by definition, which is the part candidates forget and reviewers check first.",
      ask: "Return one row: one_time_pct — the share of all registered customers who placed exactly one order, one decimal.",
      template:
        "SELECT ROUND(100.0 * (SELECT {1} FROM\n    (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) {3} {2})\n  ) / (SELECT COUNT(*) FROM customers), 1) AS one_time_pct;",
      slots: [
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the one-timer count",
          why: "COUNT(*) over the derived fold counts customers whose order count is exactly one — 2. The fold's rows ARE customers (GROUP BY customer_id), so counting rows is counting people.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the one-time cutoff",
          noVerify: true,
          why: "Exactly one order defines one-time: HAVING COUNT(*) = 1 keeps the 2 one-timers. The complement (>= 2) would answer the repeat question — 87.5 — the same customers wearing the other definition.",
        },
        {
          answer: "=",
          kind: "keyword",
          label: "the exact-match operator",
          why: "The definition says EXACTLY one — '=' implements it. '>' would count repeaters (14 → 87.5%), '>=' would count everyone who ever ordered (16 → 100.0%) — plausible-looking numbers answering different questions.",
        },
      ],
      distractors: ["16", "SUM(*)", "HAVING", ">="],
      walkthrough:
        "Two folds, one ratio, and a denominator that includes the absent. The inner fold works at customer grain: GROUP BY customer_id folds 103 orders into 16 buying customers, HAVING COUNT(*) = 1 keeps the 2 exactly-oncers. The outer layer counts them (COUNT(*)) and divides by ALL registered customers — 16 from the customers table, NOT from orders, because never-orderers belong in the 'share of customers' by definition; counting DISTINCT customers from orders would shrink the denominator to 16 buyers and — here, coincidentally identical — in general understate the share. 100.0 promotes before the division; ROUND lands 12.5. Flip the operator to '>=' and the answer becomes 100.0 — everyone who ever ordered has at least one order: a correct query that forgot its own definition. This is the Shopify retention anchor, and the interview question it rehearses is always the same: say the population of the numerator AND the denominator, out loud, before the SQL.",
    },
    {
      id: "cs-shop-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The VIP spend leaderboard",
      brief:
        "Shopify-flavored brief on the storefront db: the growth review opens with spend concentration — who the whales are and how much of the book they carry. The definition: lifetime spend is SUM of order totals per customer, ranked biggest-first. Probed facts: Alice Chen 7262.35, Emma Wilson 6640.56, Grace Kim 4574.23 and Maya Patel 3644.56 lead the book — and customers whose lifetime spend crosses 3000 carry 63.5% of all revenue. The top-4 leaderboard IS the concentration story.",
      ask: "Return the top four customers by lifetime spend: name, spend (two decimals) and rank — biggest basket first.",
      template:
        "SELECT c.name,\n       ROUND({1}(o.total), 2) AS spend,\n       RANK() OVER (ORDER BY SUM(o.total) {2}) AS rn\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.name\nORDER BY rn\nLIMIT {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the lifetime-spend adder",
          why: "SUM(o.total) per customer is lifetime spend — 7262.35 for Alice. AVG would be her per-order average and MAX her biggest single basket; neither is the ledger the concentration read folds.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The leaderboard reads whales first: the window orders by spend descending so Alice takes rank 1. ASC would hand rank 1 to the lightest basket and invert the whole concentration story.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the top-N tier size",
          noVerify: true,
          why: "The review's whale tier is top-4 — exactly the customers whose lifetime spend crosses 3000 and carries 63.5% of revenue. LIMIT enforces the tier; the tier size is a definition, not a discovery.",
        },
      ],
      distractors: ["COUNT", "AVG", "MAX", "ASC", "3", "5"],
      walkthrough:
        "A leaderboard is a fold, a window and a cap, in that order. The fold: GROUP BY c.name collapses 103 orders into 16 customers with SUM(o.total) as lifetime spend — Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56 at the top. The window: RANK() OVER (ORDER BY SUM(o.total) DESC) is evaluated AFTER the fold, which is why it can order by the aggregate — ranks 1..4 land on the whales. The cap: LIMIT 4 enforces the tier the review defined. The distractors are the three ways leaderboards lie: AVG makes the column a per-order average — a different, smaller number merchants would dispute; COUNT makes spend read as order volume; MAX shows the biggest single basket, not the book. ASC flips rank 1 to the store's lightest buyer — honest data, upside-down story. And LIMIT 3 or 5 silently changes who 'the whales' are: tier size is a definition, so it goes in the query, not in someone's memory.",
    },
    {
      id: "cs-shop-4",
      tier: "easy",
      topic: "t4",
      universe: "month-close",
      title: "The quarter-close trend",
      brief:
        "Shopify-flavored brief on the storefront db: quarter-close needs the demand curve the merchant plans staffing against — orders and revenue per month, biggest month first for the review. Probed facts for the first quarter: 2024-01 ran 8 orders worth 3731.97, 2024-02 ran 9 worth 3609.64, 2024-03 ran 8 worth 2617.08 — a flattening Q1 the merchant will ask about by name.",
      ask: "Return each month through March 2024 with order count and revenue (two decimals), biggest-revenue month first.",
      template:
        "SELECT {1}('%Y-%m', o.created_at) AS month,\n       COUNT(*) AS orders,\n       ROUND(SUM(o.total), 2) AS revenue\nFROM orders o\nWHERE STRFTIME('%Y-%m', o.created_at) {2} {3}\nGROUP BY month\nORDER BY revenue {4};",
      slots: [
        {
          answer: "STRFTIME",
          kind: "keyword",
          label: "the month bucket",
          why: "STRFTIME('%Y-%m', created_at) folds every timestamp into its month string, boundary to boundary. UPPER would 'bucket' per raw timestamp — one row per order, no months at all.",
        },
        {
          answer: "<=",
          kind: "keyword",
          label: "the through-March boundary",
          why: "The window runs THROUGH March: <= '2024-03' keeps 2024-01..2024-03 inclusive. < would silently drop March — the lost-last-month bug — and >= answers the wrong ten months entirely.",
        },
        {
          answer: "'2024-03'",
          kind: "keyword",
          label: "the quarter-end month",
          why: "The bucket is a quoted text string: '2024-03'. Unquoted 2024-03 is an integer, and text-versus-integer comparison matches nothing — a quarter that reads as zero demand.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-month-first order",
          why: "The review opens on the strongest month: 3731.97 in January on top. ASC would lead with the weakest — honest rows, backwards story.",
        },
      ],
      distractors: ["SUBSTR", "UPPER", ">=", "'2024-02'", "2024-03", "ASC"],
      walkthrough:
        "The month grid is a bucket, a boundary and a reading order. STRFTIME('%Y-%m', created_at) turns 103 timestamps into month strings; GROUP BY month folds them into 8 orders at 3731.97, 9 at 3609.64 and 8 at 2617.08 for Q1. The WHERE is bucket-then-compare — <= '2024-03' — the shape that cannot lose a boundary day, unlike BETWEEN on raw timestamps. The quotes matter as much as the operator: '2024-03' is text compared to text; unquoted, SQLite compares text to integer and every comparison fails, returning an empty quarter. ORDER BY revenue DESC is the review's reading order — January's 3731.97 first. The distractors are the month-grid failure modes: SUBSTR with these arguments folds every row into one empty bucket, and UPPER groups per raw timestamp — one row per order, no months at all; >= answers the wrong ten months; '2024-02' quietly shrinks the quarter by a month; ASC leads the review with the weakest month.",
    },
    {
      id: "cs-shop-5",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass status census",
      brief:
        "Shopify-flavored brief on the storefront db: the funnel review opens with the status census — one scan, every order state side by side, no second pass. Probed facts across 103 placed orders: 52 delivered, 30 shipped, 14 pending, 7 cancelled — and the pending share reads 13.6% of everything placed. The point of the exercise is the one-pass shape: five numbers, one table scan, definitions visible.",
      ask: "Return one row: placed, delivered, cancelled and shipped counts plus pending_pct (share of all placed orders, one decimal).",
      template:
        "SELECT COUNT(*) AS placed,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS delivered,\n       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS cancelled,\n       {2}(*) FILTER (WHERE o.status = 'shipped') AS shipped,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'pending') / {3}, 1) AS pending_pct\nFROM orders o;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the delivered arm",
          why: "Each FILTER arm names the status it counts: 'delivered' lands 52. Pointing the arm at 'cancelled' or 'pending' relabels the column with a different population — a census that lies by one word.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the row counter",
          why: "COUNT(*) with FILTER counts matching rows in the same scan. SUM(*) or AVG(*) is not SQL — the counter must be the one aggregate that accepts the star.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the all-placed denominator",
          why: "The pending share's denominator is ALL 103 placed orders — COUNT(*). Substituting the numerator 14 reads 100.0%; COUNT(shipped_at) narrows to 82 and reads 17.1. Denominators are definitions.",
        },
      ],
      distractors: ["'cancelled'", "'pending'", "SUM", "AVG", "14", "COUNT(shipped_at)"],
      walkthrough:
        "One pass, five numbers, every denominator visible. COUNT(*) is the placed universe — 103. Each FILTER (WHERE …) arm counts one status inside the same scan: delivered 52, cancelled 7, shipped 30. The pending share divides its FILTER count by COUNT(*) — 100.0 * 14 / 103 = 13.6 — numerator and denominator in the same fold, the same population, the same scan. The distractors are the census's classic corruptions: pointing the delivered arm at 'cancelled' or 'pending' ships a column that counts the wrong thing; SUM and AVG before the star are syntax failures that at least fail loudly; and the denominator traps are the quiet ones — 14 as the denominator reads 100.0% (the numerator over itself), COUNT(shipped_at) reads 17.1% by narrowing the population to shipped orders. The funnel review's standing rule: a share is only honest when the query shows WHAT divided by WHAT.",
    },
    {
      id: "cs-shop-6",
      tier: "hard",
      topic: "j4",
      universe: "month-close",
      title: "The unpaid-invoices anti-join",
      brief:
        "Shopify-flavored brief on the storefront db: month-close needs the receivables exposure — invoices with no payment rows at all. The billing tables are integer cents: 28 invoices issued, and the anti-join against payments finds 6 unpaid carrying 15217 — the number the dunning cadence and the cash forecast both hang on. No payment rows exist for these six; the query has to prove the absence, not assume it.",
      ask: "Return one row: unpaid_invoices and unpaid_amount (dollars, two decimals) for invoices with zero payments.",
      template:
        "SELECT COUNT(*) AS unpaid_invoices,\n       ROUND(SUM(i.amount_cents) {1} 100.0, 2) AS unpaid_amount\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {3};",
      slots: [
        {
          answer: "/",
          kind: "keyword",
          label: "the cents-to-dollars divider",
          why: "amount_cents is integer cents: SUM(...) / 100.0 converts once, at the edge — 15217.00. * or + would manufacture money: 1521700.00 is cents wearing a dollar sign.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-unmatched join",
          why: "LEFT JOIN preserves the six invoices with no payment row; WHERE p.id IS NULL finds them. INNER or RIGHT keep only matched rows — the unpaid set collapses to zero and the exposure reads as paid.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched-arm test",
          why: "p.id IS NULL is the anti-join predicate: true exactly when no payment matched. NOT flips it to the 22 PAID invoices — the complement answering a different memo.",
        },
      ],
      distractors: ["*", "+", "-", "INNER", "RIGHT", "NOT"],
      walkthrough:
        "Receivables is an anti-join wearing a finance hat. LEFT JOIN payments keeps all 28 invoices — the six with no payment arrive with NULL payment columns — and WHERE p.id IS NULL keeps exactly the unmatched: 6 invoices. Their SUM(amount_cents) is 1521700 cents, divided once by 100.0 at the presentation edge: 15217.00, the number the cash forecast consumes. The distractors are the ways exposure reports go wrong: * and + and - pass arithmetic where division belongs, manufacturing a total 100× too large (cents still wearing their integer grain) or off by exactly one unit — numbers no reconciliation would survive. INNER JOIN and RIGHT JOIN both drop the unmatched rows before WHERE can see them, reading zero exposure on a book that owes 15217 — the silent-empty failure that stops dunning emails. NOT in the NULL test flips the answer to the 22 paid invoices: the anti-join's complement, correct for a different memo.",
    },
  ],

  problems: [
    { slug: "fix-product-name-format", why: "The catalog hygiene minute: TRIM + capitalization on messy product names — merchant data arrives exactly this messy, and Shopify tags it directly." },
    { slug: "customer-order-frequency", why: "Report per buyer with conditional buckets (≥2, ≥3 orders) — the repeat-behavior tier read, tagged by Shopify itself." },
    { slug: "email-engagement-funnel", why: "Open → click funnel with shared populations — the honest-denominator funnel drill, tagged by Shopify." },
    { slug: "channel-ltv-vs-cac", why: "Channel LTV against CAC at matched grains — the growth-efficiency read, tagged by Shopify and escalated in every growth screen." },
    { slug: "scd2-build", why: "Build SCD Type 2 versions from change events — the data-modeling question Shopify asks in SQL form, tagged directly." },
    { slug: "basket-depth-aov", why: "Units-per-order and revenue-per-order from raw lines — the merchant dashboard's headline row, computed honestly." },
    { slug: "repeat-purchase-rate", why: "Share of buyers with 2+ orders — the retention headline and its two-grain denominator trap, in graded form." },
    { slug: "cohort-repeat-revenue", why: "Revenue attributed to repeat behavior within cohorts — the retention story in money rather than counts." },
    { slug: "ads-funnel", why: "Ad view → session → order with a fixed stage-one denominator — the fake-funnel detector in problem form." },
    { slug: "funnel-step-conversion", why: "Per-stage conversion where every stage shares the funnel-mouth population — the exact honesty contract the theory question codifies." },
    { slug: "null-blank-audit", why: "NULL vs empty vs whitespace in one conditional-count pass — the three-kinds-of-missing audit, tagged family." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-newest over a natural key — the webhook-retry dedupe Shopify's pipes run daily, tagged family." },
    { slug: "point-in-time-asof", why: "As-of joins over versioned history — 'what did we know then' as a join condition, the SCD2 consumer side." },
    { slug: "cohort-retention-matrix", why: "The signup-week × weeks-since matrix with a frozen denominator — the growth review's opening view, rebuilt in SQL." },
    { slug: "ltv-cac-payback", why: "LTV, CAC and payback months at comparable grains — the ratio-over-ratio discipline in one deliverable." },
    { slug: "invalid-tweets", why: "LENGTH-based validation of text fields — content constraints as SQL, the catalog-hygiene family's sharpest edge." },
    { slug: "queries-quality-and-percentage", why: "Query quality and fill rate per search term — the marketplace-search read where the ratio's denominator (queries, not results) is the whole test." },
    { slug: "product-sales-analysis-ii", why: "Per-product units and revenue from raw sale rows — the catalog fold under every merchant's best-sellers widget." },
    { slug: "percentage-of-users-attended-a-contest", why: "Participation share per event — the campaign-reach ratio with the all-users denominator made explicit." },
    { slug: "classes-more-than-5-students", why: "HAVING-gated groups — 'segments with at least N orders' is the threshold question Shopify escalates every fold with." },
    { slug: "sales-by-day-of-the-week", why: "The weekday demand curve via strftime pivoting — the staffing and inventory read merchants actually schedule against." },
    { slug: "list-the-products-ordered-in-a-period", why: "Period-filtered product folds — the sale-window replay where the date predicate must capture boundary days." },
    { slug: "the-latest-login-in-2020", why: "Latest-touch per user inside a year window — the recency read that feeds merchant re-engagement queues." },
    { slug: "rank-scores", why: "Ranking with ties handled honestly — the leaderboard shape whose tie behavior Shopify asks you to defend." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Argmax per buyer — each store's favorite SKU, the per-group winner question in its purest form." },
    { slug: "find-stores-with-inventory-imbalance", why: "Imbalance across locations — the stock-versus-demand join at matching grains that ops reviews consume." },
    { slug: "trial-balance-check", why: "Debits versus credits by account — the ledger-balances read that keeps billing surfaces honest, in integer cents." },
    { slug: "monthly-transactions-i", why: "Month-bucketed transaction totals with a status arm — the billing calendar fold, cents handled on purpose." },
    { slug: "count-salary-categories", why: "UNION ALL with zero-filled buckets — stacked reports that must show empty tiers, not drop them." },
    { slug: "create-a-session-bar-chart", why: "Histogram buckets for session behavior — the fixed-axis distribution merchants read at a glance." },
    { slug: "confirmation-rate", why: "Share of confirmations with a COALESCE guard for the never-contacted — the webhook-success read with a NULL-safe denominator." },
    { slug: "find-golden-hour-customers", why: "Peak-window behavior via date math — the hour-of-day read that times merchant campaign sends." },
  ],
};
