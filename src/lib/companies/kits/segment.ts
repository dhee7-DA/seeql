// Segment — Wave-11 (Task 102), saas domain, standard spec. NEW kit.
// Customer-data platform SQL on a PIPELINE grain (distinct from Databricks/Snowflake compute-platform
// reads, MongoDB's fleet read and Linear's seat read): one source event fans out to many destination
// legs, and the fan-out is a multi-line story. Storefront db mapping (stated, honest): customers =
// workspace accounts (region = market bucket), orders = billing periods (delivered = fanned and billed
// 52, shipped = legs mid-flush with shipped_at as the flush stamp 30, pending = sources awaiting schema
// approval 14, cancelled = dropped pipelines 7), order_items = destination legs (251; quantity = billed
// event-volume units, unit_price = per-unit leg rate), products = plan SKUs (db category codes =
// destination families), suppliers = destination integrations (the fan-out legs' operators),
// invoices/payments = statements + rails, expenses = infra opex, ledger_entries = the pipeline's GL.
// Finance tables store INTEGER cents — dollar read = amount_cents / 100.0; orders.total and
// order_items.unit_price are REAL dollars. The db meters volume, not raw MTUs: quantity is the billed
// volume unit on a leg, and the 268@31.01 vs 230@115.85 band fold is the MTU-tier proxy — stated, not hidden.
// Pool provenance: company-pools.md carries NO Segment section — 0 tagged rows — all 10 topic slug sets
// and all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f* rows) and say so in
// brief P4. Facts source: scripts/company-facts.md verbatim, plus probe-derived cells probed read-only
// against db/custom.db on 2026-10-16 and DECLARED here: legs-per-period ladder 26x1 / 29x2 / 25x3 / 23x4;
// 36 of 103 periods fan to 3+ distinct destinations (delivered 16, shipped 14, pending 5, cancelled 1);
// per-destination legs / periods-fanned / volume — Midwest 56/45/109, Shenzhen 47/41/99, Nordic 43/38/82,
// Pacific 40/35/80, Alpine 40/34/77, Andes 25/25/51; volume-band legs split 133 starter / 118 growth;
// top manifest rows — #6 4-legs->3-destinations volume 10 (752.96), #68 4->4, #33/#64 volume 8, #14 volume 7.
// Case briefs quote probed figures; every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: segment is NOT yet in registry COMPANY_META — wire id
// "segment", domainId "saas", name "Segment", tagline "One source, many destinations: MTU billing and
// schema discipline", accent "text-green-300" to match this header exactly.

import type { CompanyKit } from "../types";

export const segmentKit: CompanyKit = {
  id: "segment",
  domainId: "saas",
  name: "Segment",
  tagline: "One source, many destinations: MTU billing and schema discipline",
  accent: "text-green-300",

  brief: [
    "**Segment** is the customer-data platform that sits between a company's product and every tool that needs its data: one source event arrives from a web app, mobile SDK or server, and the pipeline fans it out to the destinations — warehouses, marketing tools, analytics products — under a schema contract the protocol team enforces. Monetization rides the same pipe: workspaces are billed on **monthly tracked users (MTUs)** and event volume, so the pipeline's own telemetry is the invoice. This kit maps the storefront db onto that world honestly: the 16 customers rows are workspace accounts, the 103 orders are **billing periods worth 34,833.28**, and the 251 order_items rows are destination legs — quantity = billed event-volume units, unit_price = per-unit leg rate, products = plan SKUs, suppliers = the destination integrations that operate the legs. The status map is fixed: delivered = {emerald:fanned and billed} (52, 50.5%), shipped = legs mid-flush (30, 29.1%), pending = sources awaiting schema approval (14, 13.6%), cancelled = {rose:dropped pipelines} (7, 6.8%).",
    "The data org reads the pipeline at three grains, and the legs are the connective tissue. Pipeline analytics owns the fan-out: **251 legs across 103 periods** — 2.44 per period, ladder 26 single-leg, 29 two-leg, 25 three-leg, 23 four-leg — and **36 periods fan to 3-plus distinct destinations**, the multi-line story this kit is built on. Volume analytics owns the meter: 498 billed volume units ride those legs, and the MTU-tier band fold splits them — **268 units on sub-55 starter rates (31.01 average)** against 230 on high-throughput rates (115.85). The flush clock times approved volume: created_at opens the period, shipped_at stamps the flush — **82 of 103 stamped, 2.98-day average**, 2–4 spread — while the 14 pending sources queue for schema approval and the 7 cancelled periods never flush. Money sits one layer down: statements and payment legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator with the fan-out as the accent. A typical loop opens with a **two-grain census** — EU runs 45 periods from 8 workspaces (15,089.23) while the US runs 19 from 2 (7,286.16) — then escalates into the leg grain, where `COUNT(*)` after the join counts **251 legs, not 103 periods**, and the interviewer asks which one you meant. Then the destination ladder: Midwest Hardware Co leads at 56 legs, but Nordic Gadgets AB bills **11,130.25 — 32% of the book** — and Pacific Textiles and Alpine Audio GmbH sit tied at 40 legs, so rank semantics become a policy call. Late rounds walk the flush clock with its stated population (*'do the 14 pending sources count in your base?'*) or band volume into starter/growth arms with CASE and probe the arm that silently swallows rows. Candidates who state the leg grain and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Segment section — **0 tagged rows** — so all thirty-two problems and every topic slug here are theme-curated to this kit's known screen shapes: fan-out folds, MTU bands, flush clocks, manifest `GROUP_CONCAT`s, schema-validation hygiene and the cents-safe billing spine. Do the topics in order, then run the **six case studies** on the live storefront db — built for spaced practice rather than one sitting: the {emerald:destination fan-out census} the integrations review opens with, the {violet:destination manifest fold} billing reconciles at every close, the rank ladder and leg-status census the boards argue over, the settlement clock treasury chases, and the volume spine walk growth quotes. Run each, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. The bar to clear: *state the leg grain and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the flush check. A pipeline analyst opens the overnight dashboard before standup: did last night's flush stamps land, does any period fan to a destination with no owner, does the one-pass fate census reconcile — 52 fanned-and-billed + 30 mid-flush + 14 awaiting schema approval + 7 dropped = **103 by construction**? A branch that fails that identity is the day's first incident, not a rounding note. Then the leg ladder against the 251-leg expectation — 26 single-leg, 29 two-leg, 25 three-leg, 23 four-leg — and a spot-check of period #6's manifest: 4 legs, but only **3 distinct destinations**, because Nordic Gadgets AB took two legs and a `GROUP_CONCAT` without DISTINCT would print it twice. If the **2.98-day** flush average drifts, the schema-approval queue gets pulled before the volume report ships.",
    "**11:30 —** Midday is the destination read. The integrations review wants the fan-out ladder — {orange:Midwest Hardware Co's 56 legs and 109 volume units} against Nordic Gadgets AB's 43 legs and 11,130.25 — because volume and value invert at destination grain, and the blended-rate fold makes the point: **121.07 per unit** on Audio-family legs against 27.23 on Accessories. Growth wants the MTU bands re-cut — 268 starter units at 31.01 against 230 at 115.85; a regional VP wants periods beside workspaces (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about grain. The analyst writes the query twice — *once to answer, once with the leg grain spelled out so the number survives the pricing-review argument*.",
    "**15:30 —** The afternoon tilts toward the queue and the money. The schema-approval triage runs first — the **14 pending periods** walked source by source with the protocol team, every rejection a future cancelled row — before billing's close cycle: the AR anti-join refreshes (6 never-collected statements worth 15,217), the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled), and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero payment legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "MTU billing base", what: "Monthly tracked users are the billing denominator; on this db the meter is the leg — 498 billed volume units across 251 destination legs, folding to 34,833.28 over 103 periods. The total every fold must reconcile to, and the number MTU-tier pricing reads against." },
    { name: "Destination fan-out", what: "Legs per billing period: 251 over 103 = 2.44 average, ladder 26 single-leg / 29 two-leg / 25 three-leg / 23 four-leg, and 36 periods fan to 3-plus distinct destinations. One source, many destinations — the multi-line story every destination-grain report starts from." },
    { name: "Destination ladder", what: "Legs per integration: Midwest Hardware Co 56, Shenzhen Electro 47, Nordic Gadgets AB 43, Pacific Textiles 40, Alpine Audio GmbH 40, Andes Naturals SA 25 — with a 40-leg tie that forces rank semantics. Volume and value invert here: Nordic bills 11,130.25 (32% of the book) off 43 legs." },
    { name: "Flush clock", what: "Period open to flush stamp (created_at → shipped_at) over stamped periods only: 82 of 103, 2.98-day average, range 2–4. The population ships with the number — 14 pending sources and 7 dropped pipelines carry no stamp, and they must not dilute the average." },
    { name: "Schema-approval queue", what: "Pending share of booked periods: 14 of 103 (13.6%), plus 7 cancelled (6.8%) — sliced by market, APAC 8.1% cancelled versus US 5.3%. 'Not yet approved' is a population definition, never a silent zero, and the queue is the protocol team's daily board." },
    { name: "MTU-tier band mix", what: "Volume units by leg-rate band: 268 units on sub-55 starter rates (31.01 average, 133 legs) against 230 units on high-throughput rates (115.85, 118 legs). The expansion engine in one CASE fold — and the first chart the pricing pod re-cuts each week." },
    { name: "Two-grain market census", what: "Periods beside workspaces per market: EU 45 from 8 (15,089.23), APAC 37 from 5 (11,605.45), US 19 from 2 (7,286.16), LATAM 2 from 1 (852.44). Load versus installed base — the intensity read that decides whether growth is broadening or concentrating." },
    { name: "Statement coverage", what: "Billed versus settled: 21 exact (65,612.00 both sides), 1 partial (4,000 of 6,148, #25), 6 never-collected worth 15,217.00 — against uniform 30-day terms and a 28.4-day average settlement (fastest 13, slowest 84). The AR anti-join finance refreshes every close." },
  ],

  topics: [
    {
      name: "Pipeline fate censuses",
      why: "Every Segment screen opens with the fate census: fanned-and-billed, mid-flush, awaiting schema approval, dropped — each a conditional count over a status or timestamp, reconciling to 103 by construction. The trap is calling a mid-flush period 'billed' — 30 versus 52 on this db — and the second trap is the denominator: pending sources stay in a conversion base and drop out of a flush-time base, and the panel wants you to say which before writing SQL.",
      slugs: ["percentage-of-users-attended-a-contest", "active-businesses", "number-of-employees-who-met-the-target", "activity-participants", "viewers-turned-streamers"],
    },
    {
      name: "Destination fan-out folds",
      why: "The leg grain is Segment's home grain: order_items joined to plan SKUs and destination integrations, folded per integration into legs, distinct periods fanned, volume and revenue. The habit being graded is the two-grain pairing — Midwest runs 56 legs into 45 periods while Andes runs 25 into 25 — because a census that reports one grain while the stakeholder asked for the other is a wrong number wearing the right column names.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Volume bands with CASE",
      why: "MTU tiers are CASE-classified: the band fold splits 498 volume units into 268 on sub-55 starter rates and 230 on high-throughput rates, and plan SKUs band into families the same way. The arms must be exhaustive and ordered — 133 legs plus 118 legs must reconcile to 251, or a hole in the CASE is a hole in the pricing story — and a reordered WHEN quietly re-bands the base.",
      slugs: ["the-category-of-each-member-in-the-store", "loan-types", "count-salary-categories", "usage-tier-percentiles", "the-number-of-users-that-are-eligible-for-discount", "dynamic-pivoting-of-a-table"],
    },
    {
      name: "Schema hygiene & validation",
      why: "Segment's product promise is a schema contract: event names normalized, properties validated, malformed sources rejected before they fan out. The screens probe the SQL of that discipline — SUBSTR/UPPER/LENGTH normalization passes, validation rules that flag malformed rows — because a destination receiving dirty events is billed for them anyway. Text-function drills are not decoration here; they are the protocol team's intake gate.",
      slugs: ["invalid-tweets", "fix-product-name-format", "find-users-with-valid-e-mails", "sessionize-events"],
    },
    {
      name: "Flush clocks & date math",
      why: "The flush clock is created_at → shipped_at over the 82 stamped periods, 2.98-day average with a 2–4 spread — and the first question in any review is what the 21 unstamped rows (14 pending + 7 cancelled) are doing in your base. julianday arithmetic with a stated population, half-open date windows that don't lose the last night's volume, and LAG edges read as NULL-baseline are the shapes being graded.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "second-day-verification", "calculate-orders-within-each-interval", "biggest-window-between-events"],
    },
    {
      name: "Fan-out share windows",
      why: "Every leg carries a share of its period's volume — SUM(quantity) OVER (PARTITION BY order_id) — and every destination sits on a ladder where ties are guaranteed: Pacific Textiles and Alpine Audio GmbH both carry 40 legs, so RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung. Window counting (find-the-team-size shape) beside each leg row is exactly how the fan-out burden reads without collapsing the grain.",
      slugs: ["find-the-team-size", "rank-scores", "compute-the-rank-as-a-percentage", "portfolio-concentration-hhi"],
    },
    {
      name: "Volume spines & month walks",
      why: "The 14-month period spine (2024-01 to 2025-02) is the volume trend's home turf: peak 3,731.97 in January, trough 1,193.86 in July with 2 of the 7 drops, recovery to 2,352.07 in August. Prior month beside current with LAG, first row NULL as baseline, and a two-grain walk (periods AND distinct workspaces per month) are the standard asks — each one a fold whose denominator must be stated out loud.",
      slugs: ["unique-orders-and-customers-per-month", "list-the-products-ordered-in-a-period", "year-on-year-growth-rate", "rolling-7d-actives", "consecutive-transactions-with-increasing-amounts", "find-bursty-behavior"],
    },
    {
      name: "Unwired legs & anti-joins",
      why: "Pipeline health is read from absences: workspaces with no billing periods, destinations with no legs, periods whose statements never settled (6 worth 15,217 here). LEFT JOIN ... IS NULL and NOT EXISTS are the tools, and the discipline is proving the zero rather than trusting it — this db's never-billed workspace count is a confident 0, and a candidate who verifies that beats one who assumes it.",
      slugs: ["sellers-with-no-sales", "find-churn-risk-customers", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Statement rails & cents",
      why: "Billed is not settled: 28 statements against 27 payment legs in INTEGER cents, split across card (16 legs, 37,364.00) and wire (11 legs, 32,248.00) rails. Every dollar read is amount_cents / 100.0, the coverage census (21 exact / 1 partial / 6 none) is one CASE away, and the settlement clock — 28.4 days average against uniform 30-day terms — hides a slow tail that the average alone never shows.",
      slugs: ["bank-account-summary-ii", "number-of-rich-customers", "products-worth-over-invoices", "ar-aging-schedule", "duplicate-charge-pairs"],
    },
    {
      name: "Manifest folds (GROUP_CONCAT)",
      why: "The close's signature artifact is the manifest: each period's destination legs folded into one cell naming the integrations that received its volume. GROUP_CONCAT(DISTINCT …) is the fold, and DISTINCT is the whole point — period #6 carries 4 legs to 3 destinations, so a bare fold double-lists Nordic Gadgets AB and the manifest lies. Staging CTEs and string building around this one function are the hard-round workout.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "concatenate-the-name-and-the-profession"],
    },
  ],

  theory: [
    {
      id: "segment-t1",
      q: "Your fan-out report joins workspaces to billing periods to destination legs. When do you INNER and when do you LEFT — and what does COUNT(*) actually count after that join?",
      a: "Decide from the survival rule the question implies. A revenue report joins periods to workspaces: a period with no workspace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from workspaces: workspaces with no periods ARE the answer, arriving with NULL period columns — and on this db that anti-join returns a confident zero never-billed workspaces, all 16 appearing somewhere, which you prove rather than assume. The classic break: filtering status = 'shipped' in WHERE after the LEFT quietly turns it into an INNER and the whitespace vanishes. Then the leg grain: adding order_items makes the row one-per-LEG — COUNT(*) reads 251 where 103 periods exist, and the 2.44 fan-out IS that ratio. If the stakeholder asked for periods, fold with COUNT(DISTINCT o.id). Saying 'one row per what?' out loud is the habit the panel grades.",
      tag: "joins",
    },
    {
      id: "segment-t2",
      q: "Each leg carries a share of its period's volume via SUM(quantity) OVER (PARTITION BY order_id). What does the partition actually do — and on the destination ladder 56, 47, 43, 40, 40, 25, what rank does the 25-leg integration get under RANK versus DENSE_RANK?",
      a: "PARTITION BY order_id resets the window at every billing period: the sum is that period's total volume, so each leg's share is leg volume over period volume — period #6's 10 units over its 4 legs make the two-leg Nordic leg exactly one share boundary the manifest argument turns on. Without the partition the window is the whole table and every share collapses to a sliver of the platform's 498. On the ladder, the trio is a business decision about shared rungs. RANK gives the 40-leg tie the same rank and then skips: 1, 2, 3, 4, 4 — the tie consumes rungs 4 and 5 — so the 25-leg integration lands on 6, implying a phantom fifth position that does not exist. DENSE_RANK shares rungs without gaps and reads 5. ROW_NUMBER splits the tie arbitrarily, a silent judgment call about which integration gets the success pod's attention first. The right answer is a named policy — shared rungs for peer integrations, or an explicit tie-breaker like rating then id — written in the query comment.",
      tag: "windows",
    },
    {
      id: "segment-t3",
      q: "The census shows 103 billing periods and 251 legs; EU shows 45 periods from 8 workspaces. Why do these columns disagree, and where does the 100.0 go in a percentage fold like the drop share?",
      a: "They disagree because they count at different grains. COUNT(*) after the legs join counts legs — 251, one row per destination leg; COUNT(DISTINCT oi.order_id) folds back to periods — 103; COUNT(DISTINCT o.customer_id) folds further to workspaces — 16. The ratio between two of them is the story: 2.44 legs per period is fan-out, 6.44 periods per workspace is cadence, EU's 45-from-8 (5.6) against the US's 19-from-2 (9.5) is intensity. None is wrong; mismatching the grain to the ask is. On the percentage: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — the 100.0 sits BEFORE the division because SUM of 0/1 flags over COUNT is integer arithmetic, and the drop share truncates toward zero; on this db it is the difference between APAC's 8.1% and a displayed 0. The strong candidate names the grain of every COUNT and the arithmetic type of every ratio before touching the keyboard.",
      tag: "aggregation",
    },
    {
      id: "segment-t4",
      q: "shipped_at is NULL until a period's volume actually flushes. What is your population for the flush clock, and how do NULLs behave in the aggregates that clock uses?",
      a: "Policy first: only flushed periods have a clock, so the report measures open-to-flush for the 82 of 103 periods that carry the stamp — 2.98 days average, range 2 to 4 — and says so in the title. The 21 unstamped rows are not missing data: 14 are pending sources awaiting schema approval and 7 are dropped pipelines, populations by definition. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken base — a real number wearing the wrong name, which is why the filter ships with the chart. COUNT(shipped_at) counts the stamped subset; its gap from COUNT(*) is exactly 21, and that gap is a feature — it reconciles the queue. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average: that invents same-day flushes for sources that never flushed and poisons the 2.98 baseline every drift alert keys off. State the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "segment-t5",
      q: "The integrations review wants destination integrations carrying at least 40 legs, delivered periods only. Where does each filter live — and what does a non-exhaustive CASE do to the MTU band fold?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards mid-flush, pending and dropped rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The 40-leg floor is a group-level fact — HAVING COUNT(*) >= 40 after GROUP BY; on this db five of the six integrations clear it and Andes Naturals SA (25 legs) drops, which is the point of the bench. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is the difference between a bench and an error. On the CASE: the MTU band fold must carry exhaustive, ordered arms — sub-55 starter and 55-plus high-throughput reconcile 268 + 230 to the 498-unit book, 133 + 118 legs to 251. A missing arm silently swallows rows into NULL and the bands stop footing; a catch-all ELSE as a tripwire, or the fold is one bad edit away from a pricing deck that no longer sums.",
      tag: "pipeline",
    },
    {
      id: "segment-t6",
      q: "WHERE volume > (SELECT AVG(quantity) FROM order_items) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and volume > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 251 legs always produce a mean (about 1.98 volume units per leg on this book), so the gate has a value. On filtered staging — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly where it hides. The correlated cousin (compare each leg to ITS period's average volume) re-runs per outer row, answers the fan-out-share question rather than the platform question, and inherits the same empty-case behavior when a staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. State the inner fold's population and its empty-case behavior unprompted — that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "segment-t7",
      q: "The volume trend buckets billing periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG walk?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the volume trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN with a month-end silently drops the last night's periods, and end-of-month is exactly when flushes land. The LAG: on a month-ordered spine the first row's prior value is NULL — baseline by definition, reported as NULL or labeled 'baseline', never coalesced to zero, which reads as a flat month. And the story this spine tells: the book opens at 3,731.97, troughs at 1,193.86 in July — carrying 2 of the 7 dropped periods — then recovers to 2,352.07 in August. For the flush clock the same discipline runs on julianday: julianday(shipped_at) - julianday(created_at), 82 stamped rows, 2.98 average — the population stated, the edge row understood.",
      tag: "dates",
    },
    {
      id: "segment-t8",
      q: "Billing says a statement is 'paid' but the payments table has no rows for it. Which query do you write first — and what money rule never breaks while you write it?",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the mirror mode: a void statement WITH a payment leg (#11 at 925.00 here) never appears in that anti-join — the two error directions reconcile against each other, and both land on the row-level anomaly list, not on vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (#25: 4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and eats cents on every odd-cent row. Close culture: the ledger trial balance must land at 181,080 debits against 181,080 credits, delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "segment-t9",
      q: "The volume walk uses ORDER BY created_at — why can the default window frame still lie at leg grain, and when do you write ROWS out loud?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE admits PEERS: every leg tied on the ORDER BY key joins the running fold in one step. On the '%Y-%m' spine that is harmless — month keys are unique, so RANGE and ROWS agree. At leg grain it is not: 251 legs across 103 periods guarantee created_at ties within a period, and the cumulative 'jumps two legs at once'. The professional habit is writing the frame whenever the walk matters: SUM(quantity) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) for a strict leg-by-leg walk, ROWS BETWEEN 6 PRECEDING AND CURRENT ROW for a 7-period trend. ROWS is rows-true, RANGE is value-true — say which one the stakeholder asked for before you compute.",
      tag: "windows",
    },
    {
      id: "segment-t10",
      q: "The platform report stacks web-SDK legs on mobile-SDK legs in one layout. When is UNION ALL the correct stack, and when does plain UNION quietly delete rows?",
      a: "UNION ALL is a raw concatenation — cheap, order-preserving, and honest when the branches are logically disjoint. The stack carries a literal source label in every branch, so nothing can collapse. UNION adds a distinct pass over the combined set, and that pass is a business decision, not decoration: two branches that emit byte-identical rows — same period, same volume, no label — silently become one, and the report loses a leg with no error anywhere. On this db the overlap is real: periods fan to multiple destinations and settle on both rails (5 cycles carry card AND wire legs), so a stack whose labels ever fail to distinguish branches eats rows exactly where the story is thickest. The discipline: default to UNION ALL, carry a distinguishing column in every branch, and state in a comment why duplicates are impossible — the comment is the correctness argument a reviewer audits.",
      tag: "set-ops",
    },
    {
      id: "segment-t11",
      q: "Which billing periods fan to Nordic Gadgets AB but never to Midwest Hardware Co — and why is EXCEPT the honest tool for that question?",
      a: "Two population shapes, one operator. SELECT order_id FROM the Nordic-legs join EXCEPT SELECT order_id FROM the Midwest-legs join returns the periods whose volume reached Nordic but never Midwest — 24 of the 103 on this db, a coverage gap with a workstream attached. EXCEPT compares WHOLE rows, deduplicates both inputs first, and its direction IS the question: A EXCEPT B is 'in A, never in B', so swapping the operands answers the mirror (Midwest-but-never-Nordic) and reads as a different memo. Know its limits: the dedupe pass means EXCEPT answers set questions, not multiset forensics — if a period double-fanned to the same destination, the duplicate would silently vanish from both sides. Set-level diffs across coverage, LEFT JOIN … IS NULL anti-joins for row-level chases.",
      tag: "set-ops",
    },
    {
      id: "segment-t12",
      q: "The capacity team wants legs whose volume beats the platform mean. Give me three query shapes, and say where each breaks.",
      a: "Shape one, the scalar subquery: WHERE quantity > (SELECT AVG(quantity) FROM order_items) — the mean (about 1.98 units per leg on this book) computes once and the comparison keeps the heavy legs. It breaks on staging slices: an empty inner fold returns NULL, quantity > NULL is UNKNOWN, and the report silently empties while looking valid. Shape two, the derived table: stage per-period volume means as a CTE and join back — readable, auditable, and the mean is its own column. Shape three, the window: AVG(quantity) OVER () prints the platform mean beside every leg — but you cannot filter on it in WHERE, because windows evaluate in the SELECT stage; wrap it in an outer query. The correlated cousin (compare each leg to ITS period's mean via AVG OVER (PARTITION BY order_id)) answers the fan-out-share question, not the platform question — all three agree on clean data; the interview question is which one survives the messy slice.",
      tag: "subqueries",
    },
    {
      id: "segment-t13",
      q: "The integrations board wants every destination's legs bucketed by parent-period status in ONE scan. How do FILTER branches keep that census honest, and what is the reconciliation identity?",
      a: "One scan, many lenses: COUNT(*) FILTER (WHERE o.status = 'delivered') per branch, or the portable twin SUM(CASE WHEN o.status = '…' THEN 1 ELSE 0 END) when the engine lacks FILTER. The branches PARTITION the legs — every leg lands in exactly one parent-status bucket — so the branches must foot to COUNT(*): 119 billed + 84 flushing + 36 awaiting + 12 dropped = 251 legs, and the same identity holds per destination (Midwest 22+18+12+4 = 56). That footing is the correctness argument: a branch that drifts (a typo'd literal, a reordered WHEN in the CASE twin) breaks the sum and the census stops reconciling — the failure four sequential queries hide, because nothing forces their separate WHERE clauses to partition anything. The second prize is the shared denominator: every share computed from sibling branches carries the same base, so two dashboards cannot disagree by accident.",
      tag: "case-when",
    },
    {
      id: "segment-t14",
      q: "NOT EXISTS, LEFT JOIN … IS NULL, or NOT IN — three anti-join shapes. Which do you reach for on the never-collected statements list, and why?",
      a: "NOT EXISTS first: SELECT … FROM invoices i WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — it short-circuits on the first match, never trips on NULLs, and states the business rule in the WHERE clause. LEFT JOIN … IS NULL is the twin with a visible payload, which is why it anchors the close: on this db it returns 6 never-collected statements worth 15,217.00, one of them (#28, 1,756.00) marked 'paid' with zero settlement legs. NOT IN is the one to refuse: x NOT IN (a list containing NULL) is UNKNOWN for every row — one NULL in the subquery silently empties the dunning list while looking valid. The supporting habit is proving the confident zero: every one of the 16 workspaces appears in the period table, so the never-billed-workspace anti-join returns 0 — and a zero you did not verify is how coverage maps die in review.",
      tag: "joins",
    },
    {
      id: "segment-t15",
      q: "How do you turn the flush clock and the settlement clock into reportable numbers — and which population decisions does each carry?",
      a: "Two clocks, two populations, both stated in the title. The flush clock: julianday(shipped_at) - julianday(created_at) over the 82 of 103 periods that carry the stamp — 2.98 days average, 2-to-4 spread, buckets via CAST AS INTEGER reading 27 periods at 2 days, 30 at 3, 25 at 4. The 21 unstamped rows (14 pending sources, 7 dropped pipelines) are populations by definition, not dirty data. The settlement clock: julianday(MIN(p.paid_on)) - julianday(i.issued_on) per statement — the FIRST payment against uniform 30-day terms, 20 paid statements averaging 28.4 days with a 13-to-84 spread whose slow tail the average alone never shows. What never ships on either clock: IFNULL-ing the latency to zero to 'fix' the average — that invents same-day flushes for sources that never flushed and same-day settlements for statements nobody paid, poisoning both baselines at once.",
      tag: "dates",
    },
    {
      id: "segment-t16",
      q: "A destination appears twice in the fan-out fold — 'Nordic Gadgets AB' and 'Nordic Gadgets AB '. What is the hygiene pass, and why is it the schema contract rather than cosmetics?",
      a: "Because the string IS the integration's identity: GROUP BY name, GROUP_CONCAT manifests, and every coverage map treat those as two destinations — splitting one integration's legs across two rows and quietly breaking every census that foots to 6. The pass is normalize-then-key: TRIM and UPPER (or a disciplined INITCAP) in a staging CTE, dedupe on the normalized key with ROW_NUMBER, and only then join — never clean inside the report's GROUP BY, where the normalization hides from review. The same discipline guards the manifest folds: GROUP_CONCAT(DISTINCT s.name) prints each destination once per period instead of once per leg, and LENGTH or INSTR checks flag padding and malformed names before they fan out — Segment's product promise is a schema contract, and dirty strings fanned to a destination are billed for anyway. On a pipeline the intake gate is cheap now and forensic later.",
      tag: "casing",
    },
    {
      id: "segment-t17",
      q: "The deck says 'quartile the destination ladder'. Does NTILE give the integrations review what it wants, or do you band with CASE?",
      a: "They answer different questions, and a six-row ladder shows it fast. NTILE(4) counts ROWS: over the six destinations it deals tiles of 2, 2, 1, 1 — and the 40-leg tie splits, Pacific Textiles landing in tile 2 while Alpine Audio GmbH falls to tile 3, because tile size, not value, is the only thing NTILE respects. CASE bands VALUES: the MTU-tier fold classifies every leg at the 55-dollar cut and lands 268 volume units on starter rates against 230 on high-throughput rates — stable no matter how the ladder reshuffles, defensible because the threshold is written in the query. If the review wants 'four equal-headcount tiers', NTILE with a stated tie policy; if it wants 'units riding sub-55 rates', CASE. What fails silently is reading NTILE tiles as value bands — peer integrations split across a boundary that does not exist in the data, and the coverage map argues with itself.",
      tag: "windows",
    },
    {
      id: "segment-t18",
      q: "Which destination does each workspace lean on most — and how do the three argmax shapes behave when two integrations tie?",
      a: "Three shapes, three tie behaviors. ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY legs DESC, supplier_id) = 1 inside a CTE DECIDES: one deterministic destination per workspace even on ties, because the second key breaks them — right when the account map needs exactly one name per logo. The join-back on MAX reports: join per-workspace leg counts to their maximum and BOTH tied destinations survive — right when co-leaders are the honest answer, wrong when the row count feeds a coverage rate. The correlated filter (WHERE legs = the per-workspace MAX) simplifies to the same tie behavior as the join-back, at per-row evaluation cost. The interview move is naming the divergence out loud — ROW_NUMBER decides, join-back reports, correlated simplifies — and then stating which policy the integrations review publishes, because 'their main destination' is a definition the account team will argue about the moment a tie appears.",
      tag: "windows",
    },
    {
      id: "segment-t19",
      q: "What makes a predicate sargable on this schema, and which habits keep the pipeline reports cheap?",
      a: "Sargable means the predicate compares the bare column to a value and can use an index: created_at >= '2024-03-01' AND created_at < '2024-04-01' is sargable; SUBSTR(created_at, 1, 7) = '2024-03' wraps the column in a function and forces a scan of every period to build the same 25-row slice. The habits that compound: filter early inside each CTE so later stages carry fewer rows (the status gate belongs in the staging step, not after the window); probe with LIMIT before committing to the full run; name columns instead of SELECT * so payloads you never read stop crossing the wire; and aggregate on the smallest table that answers the question — the fate census needs orders alone, while the leg census pays for the two extra joins only when destination columns are actually asked for. EXPLAIN QUERY PLAN is the receipt: SCAN means the predicate wrapped the column, SEARCH means it didn't. On a pipeline db these decide whether the integrations dashboard renders before or after the meeting.",
      tag: "performance",
    },
    {
      id: "segment-t20",
      q: "The destination ladder prints the two 40-leg integrations in a different order every run. What is the fix, and what does it buy beyond stability?",
      a: "A tie-break key in the ORDER BY: ORDER BY COUNT(*) DESC, s.name (or s.id) — every window function and every top-N cut inherits it, so Alpine Audio GmbH before Pacific Textiles prints the same way every run and LIMIT stops amputating an arbitrary member of the tie. The deeper buy is reproducibility: a board whose order is a policy — legs first, then alphabetical by destination — can be screenshotted, compared across weeks, and defended in review, while an unspecified sort is an artifact of the query planner's mood. The discipline generalizes: every deterministic report carries a total order, every tie has a stated rule, and the rule lives IN the query where the next analyst can see it. Pagination is the silent beneficiary — without a total order, OFFSET pages can repeat or drop tied rows, and the integrations bench loses a destination between runs.",
      tag: "pipeline",
    },
    {
      id: "segment-t21",
      q: "When is COALESCE an honest display choice on this schema, and when does it manufacture data?",
      a: "Honest: giving a display default to a value that is legitimately absent for presentation — COALESCE(SUM(p.amount_cents), 0) so a never-paid statement reads 0 instead of NULL on the coverage board, or a destination label defaulting when the anti-join's unmatched side is the point. Manufactured: COALESCE on the clock — IFNULL(julianday(shipped_at) - julianday(created_at), 0) turns the 14 pending sources and 7 dropped pipelines into same-day flushes, drags the 2.98-day average toward fiction, and poisons every drift alert keyed to it. The test is what the NULL MEANS: 'zero' (no money settled — display it as zero) versus 'not yet' (no stamp — the absence IS the datum, report it as NULL or label it 'baseline'). Segment's queue lives on that distinction: the 14 awaiting schema approval are the protocol team's daily board, and a report that coalesced them away reports an empty queue — a lie the standup catches by 08:15.",
      tag: "nulls",
    },
    {
      id: "segment-t22",
      q: "A slide averages the per-family blended rates — Audio 121.07, Accessories 27.23, and five more — and calls the result the platform rate. Defend or kill the number.",
      a: "Kill it. The average of family rates weights every family equally regardless of size: Fitness' 13 legs count like Accessories' 62, so the blend drifts toward whichever small family prices high. The honest platform rate re-aggregates from the base — 34,833.28 of billed value over 498 volume units = 69.95 per unit — or weights the family rates by their volumes: SUM(rate × volume)/SUM(volume), the same arithmetic one level up. The slide's number describes a platform where every family carries equal volume; this one runs 62/51/44/32/25/24/13. The same defense guards the fan-out read: per-period means (26 single-leg periods, 23 four-leg periods) must never be averaged into 'the platform fan-out' — the platform number is 251 legs over 103 periods = 2.44, computed from the base. The interview move is asking WHERE the weighting lives before arguing about the decimals.",
      tag: "aggregation",
    },
    {
      id: "segment-t23",
      q: "Walk me through the four checks you run before the close ships — and what each one proves.",
      a: "Four, in order, each a different proof. The fate foot: 52 fanned-and-billed + 30 mid-flush + 14 awaiting schema approval + 7 dropped = 103 by construction — proves the census partitions every period, catching any CASE arm that drifted. The leg foot: 251 legs splitting 119 billed / 84 flushing / 36 awaiting / 12 dropped, with the per-destination rows (Midwest 22+18+12+4 = 56) reconciling to the ladder — proves the leg grain survived every join. The money anti-join: 6 never-collected statements worth 15,217.00, walked number by number with the paid-status liar #28 (1,756.00) and the void-but-settled #11 (925.00) on the anomaly list — proves the dunning queue is row-honest before billing sends a single email. The trial balance: ledger debits 181,080 against credits 181,080, delta zero — proves nothing was rounded away or double-booked en route. The deliverable is each check, its figure, and when it last run — the close ships on receipts, not vibes.",
      tag: "quality",
    },
    {
      id: "segment-t24",
      q: "A PM quotes the flush-through rate at 82 of everything; the deck says 50.5% billed. Both come from your numbers. What do you do?",
      a: "Name the bases and put them in the titles. The 82 is the stamp count — periods whose volume actually flushed — while 52 of 103 = 50.5% is the billed share over everything booked, where the 14 pending sources and 7 dropped pipelines stay in because 'not yet approved' is what the funnel watches. Neither number is wrong; a rate WITHOUT its base is wrong, so the fix is definitional: every chart carries 'flush coverage — stamped base (82)' or 'billed share — booked base (103)', and the gaps between them become stated features of the pipeline, not discrepancies to chase. The same defense guards the MTU conversion read (do the 14 pending sources count in your base? — say which before writing SQL), the destination coverage maps, and every ratio the protocol team ships. The analyst who states the base before computing is the one whose numbers survive the review — the one who doesn't spends the meeting defending two right numbers that read as a contradiction.",
      tag: "metrics",
    },
  ],

  mcqs: [
    {
      id: "segment-mcq-1",
      prompt: "A billing period's status reads 'pending'. In this kit's Segment stage map, what happened?",
      choices: ["The source is awaiting schema approval — no volume has flushed yet", "The period fanned and billed — its legs all flushed", "The pipeline was dropped — the workspace cancelled", "The legs are mid-flush — the flush stamp has landed"],
      answer: 0,
      why: "The stage map is fixed: pending = sources awaiting schema approval (14 of 103 periods), with no shipped_at stamp and no flushed volume. It is 'not yet' — a population definition, not a failure.",
      notes: [
        { choice: 1, why: "Fanned-and-billed is 'delivered' — 52 periods. Calling pending sources billed inflates the MTU base before a single leg flushes." },
        { choice: 3, why: "Mid-flush is 'shipped' — 30 periods with the stamp landed. Pending has no stamp at all; mixing the two shifts the flush-clock base by 14 rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "segment-mcq-2",
      prompt: "A report joins billing periods to their destination legs and runs COUNT(*). What does it return on this db?",
      choices: ["251 — one row per destination leg", "103 — one row per billing period", "16 — one row per workspace", "498 — one row per volume unit"],
      answer: 0,
      why: "After the join the grain is the leg: 251 rows, not 103 periods. The 2.44 fan-out IS the ratio between the two — and knowing which one COUNT(*) returns is the first habit this kit drills.",
      notes: [
        { choice: 1, why: "103 is COUNT(DISTINCT oi.order_id) after the join — the fold back to period grain. Useful, but it is a different expression than COUNT(*), not the same number." },
        { choice: 3, why: "498 is SUM(quantity) — the volume meter. COUNT never sums quantity; confusing census with meter is the classic grain slip." },
      ],
      difficulty: "easy",
    },
    {
      id: "segment-mcq-3",
      prompt: "EU carries 45 billing periods from 8 workspaces. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between them — 5.6 periods per workspace — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period carries a workspace. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not workspaces — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "segment-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to dropped pipelines only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the drop share truncates toward 0 and every market reads flat. The 100.0 forces real division first; on this db it is the difference between 6.8% and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the drop map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-5",
      prompt: "Keep only destination integrations carrying at least 40 legs in the fan-out census. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 40, before GROUP BY", "GROUP BY destination HAVING COUNT(*) >= 40", "WHERE legs >= 40 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A leg-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db five of six integrations clear the 40-leg bench; Andes Naturals SA at 25 drops.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'legs' column on the raw order_items table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-6",
      prompt: "The destination ladder runs 56, 47, 43, 40, 40 legs, then Andes at 25. Under RANK, what rank does the 25-leg integration carry?",
      choices: ["5", "6", "7", "4"],
      answer: 1,
      why: "RANK shares rungs and then skips: 1, 2, 3, then the 40-leg tie consumes ranks 4 and 5, so the next distinct count lands on 6. The 25-leg integration shares rank 6 with no one.",
      notes: [
        { choice: 0, why: "5 is the DENSE_RANK answer — shared rungs without gaps. The integrations board's published policy is RANK semantics, gaps included." },
        { choice: 3, why: "4 is the FIRST rank the tie occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the stamp filter still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending sources double-counted their open day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-filter version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-8",
      prompt: "A close report folds each period's legs with GROUP_CONCAT(s.name) and a reviewer spots 'Nordic Gadgets AB' twice inside period #6's manifest — 4 legs, 3 destinations. The fix?",
      choices: ["Add DISTINCT inside the fold: GROUP_CONCAT(DISTINCT s.name)", "Wrap the outer SELECT in SELECT DISTINCT — duplicate rows disappear", "Filter in WHERE with s.name <> s.name to drop repeats", "GROUP_CONCAT collapses duplicates by default"],
      answer: 0,
      why: "The duplicate lives inside the fold, so DISTINCT belongs inside the aggregate: GROUP_CONCAT(DISTINCT s.name) folds period #6's 4 legs to its 3 destinations — Alpine, Nordic once, Shenzhen. Bare GROUP_CONCAT concatenates every leg, double-listing the destination that took two legs.",
      notes: [
        { choice: 1, why: "SELECT DISTINCT dedups whole ROWS, not values inside one cell. Each period row is unique by period_id, so nothing is removed and the manifest still lies." },
        { choice: 3, why: "It does not — GROUP_CONCAT concatenates every input row, duplicates included. Period #6's bare fold prints Nordic twice, and billing disputes follow." },
      ],
      difficulty: "hard",
    },
    {
      id: "segment-mcq-9",
      prompt: "A staging-table triage list uses workspace_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every period carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty triage lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "segment-mcq-10",
      prompt: "A dashboard walks platform volume leg by leg: SUM(quantity) OVER (ORDER BY created_at). Two legs share a created_at second, and the cumulative 'jumps two legs at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at leg grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "segment-mcq-11",
      prompt: "The fan-out ladder folds legs per period: GROUP BY order_id. How many billing periods fan to exactly FOUR destination legs?",
      choices: ["23", "26", "29", "103"],
      answer: 0,
      why: "The legs-per-period ladder reads 26 single-leg / 29 two-leg / 25 three-leg / 23 four-leg periods (foots to 103). The four-leg bucket is the deep fan-out tail — the periods where GROUP_CONCAT manifests and COUNT(DISTINCT s.name) checks earn their keep.",
      notes: [
        { choice: 1, why: "26 is the single-leg bucket — the flat pipeline, not the deep one. Confusing the two ends of the ladder misroutes the coverage review." },
        { choice: 2, why: "29 is two-leg. The ladder's four buckets must reconcile to 103 before any bucket is quoted — 26+29+25+23 = 103 is the check." },
      ],
      difficulty: "easy",
    },
    {
      id: "segment-mcq-12",
      prompt: "CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) buckets the 82 stamped periods. Which day bucket is the mode?",
      choices: ["3 days — 30 periods, against 27 at 2 and 25 at 4", "2 days — fastest bucket wins the mode", "2.98 days — the average IS the mode", "4 days — the slowest bucket is largest"],
      answer: 0,
      why: "The flush-latency distribution reads 27 at 2 days, 30 at 3, 25 at 4 — footing to 82. The mode is 3 days; the 2.98 average and the mode are different statistics, and quoting one as the other is how a flush-SLA story drifts.",
      notes: [
        { choice: 1, why: "2 days has 27 periods — second place. The fastest bucket and the biggest bucket are different claims about the pipeline." },
        { choice: 2, why: "2.98 is the mean over fractional days; the mode is the most common INTEGER bucket. Neither implies the other on a distribution this flat." },
      ],
      difficulty: "easy",
    },
    {
      id: "segment-mcq-13",
      prompt: "`SELECT s.name, COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.name LIMIT 3` — the integrations review calls the result 'the top three destinations'. What is wrong?",
      choices: [
        "No ORDER BY — the three rows are arbitrary; top-N needs ORDER BY COUNT(*) DESC (with a tie-break) before LIMIT",
        "The join is wrong — legs need a fourth table",
        "LIMIT 3 is too small — raise it to 6",
        "GROUP BY s.name collapses too much — group by s.id instead",
      ],
      answer: 0,
      why: "Without ORDER BY the result order is undefined and the LIMIT cut is arbitrary — a different three destinations can appear on every run. The ladder (56/47/43 legs, then the 40 tie) only exists after ORDER BY COUNT(*) DESC, and the 40-leg tie makes the tie-break mandatory, not optional.",
      notes: [
        { choice: 2, why: "Raising the LIMIT papers over the real bug — even LIMIT 6 returns six arbitrary rows, and the tie still needs a stated break." },
        { choice: 3, why: "Grouping by s.id instead of s.name changes the fold's key but not the missing sort — the arbitrary-LIMIT failure survives any GROUP BY choice." },
      ],
      difficulty: "easy",
    },
    {
      id: "segment-mcq-14",
      prompt: "A one-pass leg census runs COUNT(*) FILTER (WHERE o.status = 'delivered') over periods joined to legs. What does that branch count on this db?",
      choices: [
        "119 — the legs whose PARENT period fanned and billed",
        "52 — the billed periods",
        "251 — FILTER is ignored and every leg passes",
        "498 — the legs' volume units",
      ],
      answer: 0,
      why: "The join puts every leg on its parent period's row, so FILTER counts LEGS by period status: 119 billed + 84 flushing + 36 awaiting + 12 dropped = 251. The branch's grain is legs, not periods — 52 is the period-grain billed count and quoting it in a leg census breaks the footing.",
      notes: [
        { choice: 1, why: "52 is COUNT(*) at period grain. After the legs join, COUNT(*) reads 251 — every census must say which grain its branches count." },
        { choice: 2, why: "FILTER (WHERE …) is the per-aggregate clause — it does not silently pass everything. An all-251 branch would mean the predicate matched every row, not that FILTER failed." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-15",
      prompt: "`SELECT order_id FROM … WHERE s.name = 'Nordic Gadgets AB' EXCEPT SELECT order_id FROM … WHERE s.name = 'Midwest Hardware Co'` — what does this return on this db?",
      choices: [
        "24 billing periods — volume that reached Nordic but never Midwest",
        "43 periods — every Nordic period",
        "Zero rows — Midwest reaches everywhere Nordic does",
        "56 periods — every Midwest period, mirrored",
      ],
      answer: 0,
      why: "EXCEPT keeps left-side values with no right-side match: periods that fanned to Nordic Gadgets AB but never to Midwest Hardware Co — 24 of 103, a coverage gap with a workstream attached. Swap the operands and the mirror question answers differently.",
      notes: [
        { choice: 1, why: "43 is Nordic's full leg count. EXCEPT subtracts the Midwest overlap — the gap is the answer, not the coverage." },
        { choice: 3, why: "56 is Midwest's leg count — that is the RIGHT side of the operator, and EXCEPT never returns right-side-only rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-16",
      prompt: "Per-family blended rates read Audio 121.07, Accessories 27.23, Wearables 130.74. A slide averages the seven family rates and calls it the platform rate. What is the honest per-unit figure?",
      choices: [
        "69.95 — 34,833.28 billed over 498 volume units, re-aggregated from the base",
        "The average of the seven family rates — equal weighting is the fair blend",
        "130.74 — Wearables is the priciest family and anchors the rate",
        "27.23 — Accessories carries the most legs (62), so its rate is the platform's",
      ],
      answer: 0,
      why: "Family rates are ratios; averaging them weights every family equally regardless of volume. The platform rate is SUM(revenue)/SUM(volume) from the base rows: 34,833.28 / 498 = 69.95 — the only number the MTU-tier pricing read can quote.",
      notes: [
        { choice: 1, why: "Equal weighting is exactly the bug: Fitness' 13 legs would count like Accessories' 62. The family-average describes a platform this one is not." },
        { choice: 3, why: "'Biggest family wins' is weighting by one group — as arbitrary as equal weighting. The base re-aggregation is the only defensible blend." },
      ],
      difficulty: "hard",
    },
    {
      id: "segment-mcq-17",
      prompt: "A colleague writes `WHERE RANK() OVER (ORDER BY COUNT(*) DESC) <= 5` to keep the top five destinations. What happens?",
      choices: [
        "Error — window functions evaluate in the SELECT stage and cannot appear in WHERE; stage the rank in a CTE and filter outside",
        "It works — RANK is computed before WHERE like any aggregate",
        "It silently returns every row — the comparison is always true",
        "It works only if GROUP BY precedes the WHERE clause",
      ],
      answer: 0,
      why: "The pipeline runs FROM → WHERE → GROUP BY → SELECT (windows) → ORDER BY: WHERE cannot see window output that does not exist yet. The fix is staging — a CTE or subquery computing the rank, then the outer query filters rank <= 5.",
      notes: [
        { choice: 1, why: "Aggregates need GROUP BY and HAVING; windows always run in SELECT. Confusing the two stages is the single most common pipeline-order failure in screens." },
        { choice: 2, why: "If it returned everything silently you might catch it in review — the engine's rejection is actually the friendlier failure mode." },
      ],
      difficulty: "hard",
    },
    {
      id: "segment-mcq-18",
      prompt: "A colleague filters March with `SUBSTR(created_at, 1, 7) = '2024-03'` and the pipeline dashboard times out. The sargable rewrite is:",
      choices: [
        "WHERE created_at >= '2024-03-01' AND created_at < '2024-04-01'",
        "WHERE MONTH(created_at) = 3 AND YEAR(created_at) = 2024",
        "WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'",
        "WHERE STRFTIME('%m', created_at) = '03' AND created_at LIKE '2024%'",
      ],
      answer: 0,
      why: "Wrapping the column in a function defeats any index; the half-open range compares the bare column and scans only March. It also catches the last second of March 31 — which BETWEEN's 31-date endpoint silently drops, exactly when end-of-month flushes land.",
      notes: [
        { choice: 2, why: "BETWEEN is still sargable-ish on a bare column, but the endpoint '2024-03-31' excludes everything after midnight — the boundary bug dressed as an optimization." },
        { choice: 3, why: "Still function-wrapped (STRFTIME + LIKE), so still a full scan — two wrapped predicates instead of one." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-19",
      prompt: "The destination ladder ties Pacific Textiles and Alpine Audio GmbH at 40 legs. Which ORDER BY makes the board print the SAME order every run — and which name lands first under it?",
      choices: [
        "ORDER BY COUNT(*) DESC, s.name — Alpine Audio GmbH prints before Pacific Textiles",
        "ORDER BY COUNT(*) DESC — databases keep insertion order for ties",
        "GROUP BY s.name — grouping imposes alphabetical order",
        "ORDER BY s.region — the tie needs a regional cut",
      ],
      answer: 0,
      why: "Ties need a tie-break key to form a TOTAL order: legs DESC, then name, is a policy the next run reproduces — and alphabetically 'Alpine Audio GmbH' sorts before 'Pacific Textiles'. Unspecified order is the planner's mood; the review's screenshots must match across weeks.",
      notes: [
        { choice: 1, why: "SQL result order is undefined without a total order — tied rows may print either way on any run, and OFFSET pagination then repeats or drops one of the pair." },
        { choice: 3, why: "A regional cut is a different report — both 40-leg integrations sit in different regions, so the cut sidesteps the tie instead of breaking it." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-20",
      prompt: "The forecast tab needs NEXT month's billed value beside each month's row on the volume spine. Which function, and what does the LAST row print?",
      choices: [
        "LEAD(billed) OVER (ORDER BY month) — the last row is NULL: no future exists yet",
        "LAG(billed) OVER (ORDER BY month) — the last row is NULL",
        "LEAD(billed, 0) — the last row repeats its own value",
        "NEXT(billed) OVER (ORDER BY month) — the last row errors",
      ],
      answer: 0,
      why: "LEAD reads forward one row; LAG reads backward. On the 14-month spine the walk's first row is LAG's NULL baseline and the last row is LEAD's — and that terminal NULL is honest: February 2025 has no March to forecast from. Direction is meaning: LEAD beside a month is the future, LAG beside it is history.",
      notes: [
        { choice: 1, why: "LAG hands each month the PRIOR month's value — that is the month-over-month walk, not the forecast tab. Swapping the two silently re-labels history as future." },
        { choice: 2, why: "LEAD(billed, 0) reads the current row — every 'next month' cell becomes the month itself and the forecast tab shows the present, twice." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-21",
      prompt: "NTILE(4) runs over the six-destination leg ladder (56, 47, 43, 40, 40, 25). How do the tiles land — and where does the 40-leg tie fall?",
      choices: [
        "Tiles of 2, 2, 1, 1 — Pacific Textiles lands in tile 2, Alpine Audio GmbH in tile 3: the tie splits",
        "Tiles of 2, 2, 2 — NTILE keeps the tie together in tile 3",
        "Tiles of 1, 2, 2, 1 — the tie straddles tiles 2 and 3 evenly",
        "All six land in tile 1 — too few rows for four tiles",
      ],
      answer: 0,
      why: "NTILE deals fixed-size tiles over the ordered rows: six rows make tiles of 2, 2, 1, 1 — Midwest/Shenzhen in tile 1, Nordic/Pacific in tile 2, Alpine alone in tile 3, Andes alone in tile 4. Tile size is the only thing NTILE respects, so the 40-leg peer group splits across a boundary that does not exist in the values.",
      notes: [
        { choice: 1, why: "Six rows cannot make three equal tiles of two under NTILE(4) — the tile COUNT is the argument, and the remainder rows go to the earliest tiles." },
        { choice: 3, why: "There is no straddling instinct inside NTILE — it fills tile 2 to its quota (rows 3–4) before opening tile 3 (row 5)." },
      ],
      difficulty: "hard",
    },
    {
      id: "segment-mcq-22",
      prompt: "`SELECT COUNT(*) FROM suppliers a JOIN suppliers b ON a.region = b.region AND a.id < b.id` counts same-region destination pairs. What does dropping the `a.id < b.id` guard change?",
      choices: [
        "4 instead of 2 — every pair counted twice (and 6 with no guard at all, adding self-pairs)",
        "2 either way — the guard is cosmetic",
        "6 — the guard was hiding all matches",
        "2 but unordered — the guard only affects sort order",
      ],
      answer: 0,
      why: "Without the guard every unordered pair matches in both directions — Shenzhen/Pacific and Nordic/Alpine each count twice — and with no pair-guard at all each destination also matches itself. The half-open guard (a.id < b.id) is the pair-once discipline that keeps self-joins honest.",
      notes: [
        { choice: 1, why: "The guard halves the count — direction is exactly what it removes. 2 is the a.id < b.id answer only." },
        { choice: 2, why: "The cross-products between different destinations survive any guard change — dropping it ADDS rows, never removes them." },
      ],
      difficulty: "hard",
    },
    {
      id: "segment-mcq-23",
      prompt: "The fan-out burden column is `COUNT(*) OVER (PARTITION BY oi.order_id)` beside each leg row. What does it print on a FOUR-leg period's rows?",
      choices: ["4 — the period's leg count repeated on every one of its legs", "2.44 — the platform fan-out average", "251 — the platform leg count", "1 — each leg counts itself"],
      answer: 0,
      why: "PARTITION BY order_id resets the window at every period, so the count is THAT period's legs — 4 on every row of a four-leg period, 1 on a single-leg period. It is the find-the-team-size shape: per-group census beside every row, without collapsing the leg grain.",
      notes: [
        { choice: 1, why: "2.44 is the platform mean over the base (251/103). A partitioned window never prints a cross-partition average unless the partition is empty." },
        { choice: 3, why: "251 is what prints when the partition is left off — SUM/COUNT OVER () is the platform fold, and summing that column would double-count catastrophically." },
      ],
      difficulty: "hard",
    },
    {
      id: "segment-mcq-24",
      prompt: "The Q1-2024 volume read uses `BETWEEN '2024-01-01' AND '2024-03-31'`. Which Q1 does the deck actually show?",
      choices: [
        "A short Q1 — everything after midnight on March 31 is dropped; the half-open range (>= 01-01 AND < 04-01) captures all 25 periods worth 9,958.69",
        "The full Q1 — BETWEEN includes both endpoints as full days",
        "Q1 plus one day — BETWEEN overshoots by midnight April 1",
        "Empty — BETWEEN cannot compare TEXT timestamps",
      ],
      answer: 0,
      why: "BETWEEN with a bare date endpoint excludes '2024-03-31 23:59:59' — the last night's periods, which is exactly when end-of-month flushes land. Half-open ranges compose at month ends with no boundary judgment: Q1-2024 is 25 periods and 9,958.69 billed, and the boundary policy is stated before the WHERE is written.",
      notes: [
        { choice: 1, why: "BETWEEN includes the endpoints as INSTANTS, not days — '2024-03-31' means midnight of that day, so the day itself is 99.99% missing." },
        { choice: 3, why: "TEXT timestamps compare fine — ISO format sorts lexicographically. The failure is the boundary, never the comparison." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-25",
      prompt: "The spine walk's first row shows prev_billed = NULL, and an analyst COALESCEs it to 0 so the first delta prints +37,320%. What is the honest treatment?",
      choices: [
        "Leave it NULL or label it 'baseline' — no prior month exists, so no delta exists",
        "COALESCE to 0 is fine — the first month genuinely starts from nothing",
        "COALESCE to the first month's own value — the delta then reads 0, the honest no-change",
        "Drop the first row from the query",
      ],
      answer: 0,
      why: "The LAG boundary NULL means 'no baseline', not 'zero baseline': January 2024's 3,731.97 did not grow from an empty platform. Delta versus nothing is undefined — report NULL, or a labeled baseline row, and never let a percentage divide by a coalesced zero.",
      notes: [
        { choice: 1, why: "Zero is a measurement ('nothing billed'); NULL is an absence of measurement. Coalescing manufactures a +37,320% story from an artifact of the window edge." },
        { choice: 2, why: "Self-baselining hides the boundary too — a 0% delta reads as stability when the honest answer is 'unknown, first period'." },
      ],
      difficulty: "easy",
    },
    {
      id: "segment-mcq-26",
      prompt: "`SUM(quantity) OVER (ORDER BY created_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` runs over leg-ordered rows. What do the FIRST TWO rows print?",
      choices: [
        "Row 1: its own volume alone; row 2: rows 1–2 summed — the frame clips at the partition edge",
        "Row 1: three rows summed anyway — frames pad with zeros",
        "Row 1: NULL — the frame is incomplete",
        "Both rows: the grand total — the frame expands to what exists",
      ],
      answer: 0,
      why: "A bounded frame is honest at the edge: there is no row before the first, so the window sums what exists — one leg, then two. Only at the third leg does the full 3-row window apply. This is why trailing-window metrics on short series need the edge behavior stated, not assumed.",
      notes: [
        { choice: 1, why: "Frames never pad — there is no zero row to absorb. The clip is the definition of ROWS at a boundary." },
        { choice: 3, why: "That describes UNBOUNDED PRECEDING, not a 2-row trailing frame — a different metric wearing the same syntax." },
      ],
      difficulty: "medium",
    },
    {
      id: "segment-mcq-27",
      prompt: "`SELECT COUNT(*) FROM customers` returns 16; `SELECT SUM(active)` returns 14. What does the 2-row gap mean?",
      choices: [
        "Two workspaces carry active = 0 — SUM counts the flag, COUNT(*) counts rows",
        "Two workspaces have NULL active — SUM skipped them",
        "The active column is corrupted — the two queries must agree",
        "14 workspaces, 16 periods — the queries hit different tables",
      ],
      answer: 0,
      why: "active is a 0/1 flag and never NULL, so SUM(active) counts the flagged-ON rows: 14 of 16 workspaces are active. The gap is a conditional count in disguise — SUM(flag) over COUNT(*) — the same shape as every stage branch in the fate census.",
      notes: [
        { choice: 1, why: "The column is NOT NULL by definition — no NULLs exist to skip. Reading the gap as missingness sends the analyst hunting a data bug that isn't there." },
        { choice: 2, why: "No corruption: the two queries measure different things — rows versus flagged rows. Forcing them to 'agree' usually means deleting the inactive workspaces from the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "segment-mcq-28",
      prompt: "A payment leg carries 6,148 cents. What does `SELECT amount_cents / 100` print — and what is the dollar-correct form?",
      choices: ["61 — integer division; the dollar read is amount_cents / 100.0, which prints 61.48", "61.48 — SQLite promotes the division automatically", "0.61 — the divisor should be 10000", "6148 — division on INTEGER columns is a no-op"],
      answer: 0,
      why: "Both operands are INTEGERs, so 6148 / 100 is integer division: 61 flat, and 48 cents vanish. The 100.0 promotes the fold to real arithmetic first — 61.48 — which is the only form the statement coverage ledger and the dunning email may print.",
      notes: [
        { choice: 1, why: "SQLite never auto-promotes INTEGER / INTEGER. The missing .0 is the exact bug that eats cents on every odd-cent row — and it survives review because 61 looks plausible." },
        { choice: 2, why: "Cents-to-dollars divides by 100, not 10000. The 0.61 answer is the classic overcorrection after being burned by an integer-division bug once." },
      ],
      difficulty: "easy",
    },
    {
      id: "segment-mcq-29",
      prompt: "Nordic Gadgets AB bills 11,130.25 — the review calls it '32% of the book'. Which fold computes that share, and what does it print to 2 decimals?",
      choices: [
        "100.0 * SUM(leg revenue) OVER (PARTITION BY destination) / SUM(leg revenue) OVER () — 31.95",
        "SUM(revenue) / COUNT(*) — the average leg is the share",
        "43 / 251 — the leg-count share stands in for the value share",
        "ROUND(revenue) / ROUND(book) — rounding first makes the division safe",
      ],
      answer: 0,
      why: "The share is a partition window over the book: Nordic's 11,130.25 over the 34,833.28 total, printed 31.95 with the 100.0 BEFORE the division so the ratio never truncates. The leg-count share (43/251 = 17.1%) is a different story — Nordic's value share runs nearly double its leg share, which is the inversion the pricing review argues about.",
      notes: [
        { choice: 1, why: "Revenue / leg count is the average leg (258.84 for Nordic), not a share of the book — different denominator entirely." },
        { choice: 3, why: "Rounding before division DISCARDS the precision the ratio needed — round at the presentation edge, after the arithmetic." },
      ],
      difficulty: "hard",
    },
    {
      id: "segment-mcq-30",
      prompt: "The flush-clock report adds `WHERE shipped_at IS NOT NULL` to the 103-period table. How many rows drop — and what base does the clock run on?",
      choices: [
        "21 drop — 14 awaiting schema approval plus 7 dropped pipelines; the clock runs on 82 stamped periods",
        "14 drop — only the pending sources carry no stamp",
        "0 drop — NULL stamps pass the filter silently",
        "82 drop — the filter keeps only unstamped rows",
      ],
      answer: 0,
      why: "COUNT(shipped_at) reads 82, so exactly 21 rows carry NULL stamps — and they split by definition: 14 pending sources awaiting schema approval and 7 dropped pipelines. The filter is a population statement: the clock runs on the 82, and the report says so in the title.",
      notes: [
        { choice: 1, why: "Cancelled pipelines carry NULL stamps too — they dropped before any flush. The 21-row gap splits 14 and 7, and both halves matter to the queue board." },
        { choice: 2, why: "NULL fails IS NOT NULL by definition — that is the point of the filter. Without it, AVG silently shrinks its base and prints the same 2.98 with the wrong population name." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-segment-1",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The destination fan-out census",
      brief:
        "Segment-flavored memo on the storefront db: the quarterly integrations review ranks destination integrations by fan-out load — legs, distinct periods fanned, billed volume and revenue, at LEG grain, not period grain. Probed facts: 251 destination legs across 103 billing periods (2.44 legs per period); the destination ladder reads Midwest Hardware Co 56 legs, Shenzhen Electro 47, Nordic Gadgets AB 43, Pacific Textiles 40, Alpine Audio GmbH 40 (the tie the review argues about), Andes Naturals SA 25. Revenue inverts the ladder — Nordic bills 11,130.25 (32% of the book) against Midwest's 9,294.93 — and volume runs 109 / 99 / 82 / 80 / 77 / 51 units down the same ladder. The review reads heaviest fan-out first and keeps only the 40-plus-leg bench.",
      ask: "Return each destination integration on the 40-plus-leg bench with leg count, distinct periods fanned, volume units and revenue to 2 decimals, heaviest fan-out first.",
      template:
        "SELECT s.name AS destination,\n       COUNT(*) AS legs,\n       COUNT(DISTINCT {2}) AS periods_fanned,\n       SUM(oi.quantity) AS volume,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nGROUP BY {1}\nHAVING COUNT(*) >= {3}\nORDER BY legs {4};",
      slots: [
        {
          answer: "s.name",
          kind: "keyword",
          label: "the destination key",
          why: "GROUP BY s.name folds the 3-table chain to one row per destination integration. Grouping by p.category would fold to destination FAMILIES (7 rows) and by s.region to markets (4) — both real grains, neither the one the integrations review reads.",
        },
        {
          answer: "oi.order_id",
          kind: "keyword",
          label: "the period fold",
          why: "COUNT(DISTINCT oi.order_id) folds repeat legs back to billing periods: Midwest's 56 legs fan into 45 periods, Andes's 25 legs into 25. COUNT(DISTINCT oi.id) returns the leg count again, and COUNT(DISTINCT p.category) counts SKU families — a third grain that answers nobody's question.",
        },
        {
          answer: "40",
          kind: "number",
          label: "the bench floor",
          why: "The 40-plus-leg bench keeps five of six integrations — Andes Naturals SA at 25 legs drops off. A floor of 43 shrinks the bench to three; 25 would read the whole ladder. Group-level floors live in HAVING, and the number must be one the review actually drew.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The review reads heaviest fan-out on top: Midwest 56, Shenzhen 47, Nordic 43, then the 40-leg tie. ASC would open the meeting on Alpine Audio GmbH — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["p.category", "s.region", "s.id", "25", "43", "ASC"],
      walkthrough:
        "One 3-table chain, one fold, four columns at two grains. The chain runs legs to plan SKUs to destination integrations, GROUP BY s.name folds 251 legs into six destination rows, HAVING COUNT(*) >= 40 keeps the bench, and the census reads: Midwest Hardware Co 56 legs / 45 periods / 109 units / 9,294.93, Shenzhen Electro 47 / 41 / 99 / 3,049.07, Nordic Gadgets AB 43 / 38 / 82 / 11,130.25, Pacific Textiles 40 / 35 / 80 / 2,980.15, Alpine Audio GmbH 40 / 34 / 77 / 4,765.63 — Andes Naturals SA (25 / 25 / 51 / 3,613.25) drops below the bench, and its 25-legs-into-25-periods row is exactly the single-leg-destination shape the census exists to catch. The distractors each break differently: p.category folds to 7 family rows and s.region to 4 market rows — right-shaped reports answering the wrong question; s.id in the fold column collapses periods_fanned to 1 and in the floor keeps all six rows; 25 and 43 move the bench the review didn't draw; ASC opens on Alpine. The two-grain read is the takeaway: Midwest carries the most legs but the least revenue per leg — 9,294.93 over 109 units against Nordic's 11,130.25 over 82 — volume and value invert at destination grain.",
    },
    {
      id: "cs-segment-2",
      tier: "hard",
      topic: "x1",
      universe: "month-close",
      title: "The destination manifest fold",
      brief:
        "Segment-flavored memo on the storefront db: at every close, billing folds each billing period's destination legs into a manifest — the list of integrations that actually received the period's event volume — and the multi-destination rows are the ones the revenue team argues about. Probed facts: 36 of 103 periods fan to 3-plus distinct destinations (16 delivered, 14 shipped, 5 pending, 1 cancelled); the leg ladder runs 26 single-leg / 29 two-leg / 25 three-leg / 23 four-leg periods, so a 4-leg period can still carry 3 distinct destinations when one integration takes two legs — period #6 runs 4 legs to Alpine, Nordic twice and Shenzhen: volume 10, revenue 752.96. A bare GROUP_CONCAT double-lists Nordic and the manifest lies; DISTINCT inside the fold is the whole fix.",
      ask: "Return the top 5 delivered periods by volume among those fanning to 3-plus distinct destinations: period id, leg count, distinct destination count, volume and the destination manifest, heaviest volume first.",
      template:
        "SELECT o.id AS period_id,\n       COUNT(*) AS legs,\n       COUNT(DISTINCT s.name) AS destinations,\n       SUM(oi.quantity) AS volume,\n       GROUP_CONCAT({1} s.name) AS manifest\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE o.status = {2}\nGROUP BY o.id\nHAVING COUNT(DISTINCT s.name) >= {3}\nORDER BY volume {4}, o.id\nLIMIT {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the manifest dedupe",
          why: "GROUP_CONCAT(DISTINCT s.name) folds legs to destinations — period #6 prints Alpine, Nordic once, Shenzhen. ALL (the default) concatenates every leg and double-lists Nordic, the exact lie the close exists to prevent.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the status gate",
          why: "The revenue team argues over billed periods, so the gate is status = 'delivered' — 16 of the 36 multi-destination periods survive. 'shipped' would read the 14 mid-flush rows instead, a different population wearing the same column names.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the multi-destination floor",
          why: "The floor keeps periods fanning to 3-plus distinct destinations — 36 of 103 book-wide, 16 of them delivered. A floor of 2 reads the single-leg majority back in; 4 narrows to the four-destination rows like #68.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-volume direction",
          why: "The close reads heaviest volume on top: #6 at 10 units, then the 8-unit band, then #14 at 7. ASC would bury period #6 — the manifest the argument is actually about — under the lightest rows.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the shortlist cut",
          why: "LIMIT 5 is the one-pager cut: the review reads five manifests, not sixteen. Any other constant is a meeting-preference, not a figure — this slot is explicitly exempt from the number check.",
        },
      ],
      distractors: ["ALL", "s.id", "'shipped'", "ASC", "2", "COUNT"],
      walkthrough:
        "Four joins, one fold, and the dedupe is the story. The chain runs periods to legs to plan SKUs to destination integrations; WHERE status = 'delivered' holds the population to billed periods; GROUP BY o.id stages one row per period; HAVING COUNT(DISTINCT s.name) >= 3 keeps the multi-destination rows — 16 delivered of the 36 book-wide; and GROUP_CONCAT(DISTINCT s.name) folds each period's legs into a manifest that names each destination ONCE. Ordered by volume descending with o.id breaking ties, the top five read: #6 — 4 legs, 3 destinations, 10 units, Alpine/Nordic/Shenzhen; #33 — 4/3/8; #64 — 4/3/8; #68 — 4/4/8, the one row where legs equal destinations and every leg lands somewhere different; #14 — 3/3/7. The distractors each break differently: ALL is the default fold — #6's manifest prints Nordic twice and the manifest lies; s.id folds supplier ids instead of names, 'shipped' reads the 14 mid-flush periods, 2 floods the census back toward single-destination rows, ASC buries #6, and COUNT as the fold or in any comparison is a hard error. The reconciliation instinct is the takeaway: manifests are claims until COUNT(*) legs and COUNT(DISTINCT s.name) destinations are printed beside them — #6's 4-into-3 gap is the proof the fold deduped.",
    },
    {
      id: "cs-segment-3",
      tier: "medium",
      topic: "t5",
      universe: "supplier",
      title: "The destination rank ladder",
      brief:
        "Segment-flavored memo on the storefront db: the integrations review ranks destination integrations by fan-out load with rank semantics treated as a POLICY — Pacific Textiles and Alpine Audio GmbH sit tied at 40 legs, and the board publishes shared rungs. Probed facts: the destination ladder reads Midwest Hardware Co 56 legs, Shenzhen Electro 47, Nordic Gadgets AB 43, Pacific Textiles 40, Alpine Audio GmbH 40, Andes Naturals SA 25. RANK prints 1, 2, 3, 4, 4, 6 — the tie shares rung 4 and the next distinct value lands on 6, gaps honest. A HAVING floor of 25 keeps all six integrations on one board so the after-tie behavior stays visible.",
      ask: "Return each destination integration with its leg count, volume units and rank, heaviest fan-out first.",
      template:
        "SELECT s.name,\n       COUNT(*) AS legs,\n       SUM(oi.quantity) AS volume,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS leg_rank\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nGROUP BY s.name\nHAVING COUNT(*) >= {3}\nORDER BY leg_rank, legs DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung ranker",
          why: "RANK gives the two 40-leg integrations the same rung (4, 4) and stamps Andes Naturals SA at 6 — shared rungs with honest gaps, the board's published policy. DENSE_RANK would compress Andes to rank 5 and hide that two positions were consumed; ROW_NUMBER would split the 40-leg tie arbitrarily, inventing an order the business never drew.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The ladder crowns fan-out load, so the window ORDER BY runs descending — Midwest Hardware Co's 56 legs take rank 1. ASC would rank Andes Naturals SA's 25 legs first and hand Midwest rank 6: a correct query crowning the wrong end of the board.",
        },
        {
          answer: "25",
          kind: "number",
          label: "the full-board floor",
          why: "HAVING COUNT(*) >= 25 keeps all six integrations — through the 40-leg tie AND Andes behind it, so the after-tie gap (rank 6) stays visible in the output. A floor of 40 amputates Andes and the tie becomes the last block, where RANK and DENSE_RANK print identical output and the review would have nothing to argue about.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "40"],
      walkthrough:
        "A census, a floor, and a rank policy. The three-table chain folds 251 legs into six destination rows; HAVING COUNT(*) >= 25 keeps the full board; and the window ranks the folded counts: 1 Midwest Hardware Co 56 legs / 109 units, 2 Shenzhen Electro 47 / 99, 3 Nordic Gadgets AB 43 / 82, then the 40-leg tie all carrying rank 4 — Pacific Textiles 40 / 80 and Alpine Audio GmbH 40 / 77 — and Andes Naturals SA at rank 6 with 25 / 51. The three rankers disagree exactly where the tie is: RANK shares rungs and skips (4, 4, then 6), DENSE_RANK shares without gaps (4, 4, then 5), ROW_NUMBER splits the tie arbitrarily (4 and 5). The floor is load-bearing too: at >= 25 the tie sits mid-ladder with the gap visible behind it; raise it to 40 and the tie becomes the last block, where RANK and DENSE_RANK print identical output and the review would have nothing to debate. Ordering by rank then legs gives the deterministic print the board republishes every cycle.",
    },
    {
      id: "cs-segment-4",
      tier: "medium",
      topic: "x2",
      universe: "supplier",
      title: "The leg-status census",
      brief:
        "Segment-flavored memo on the storefront db: the integrations review wants every destination's legs bucketed by PARENT-period status in ONE scan — pipeline health read at leg grain, every bucket a FILTER branch, every branch footing to the destination's leg total. Probed facts: 251 legs split 119 billed / 84 flushing / 36 awaiting schema approval / 12 dropped, and the per-destination rows foot too — Midwest Hardware Co 22+18+12+4 = 56, Shenzhen Electro 25+19+3+0 = 47, Nordic Gadgets AB 18+17+7+1 = 43, Pacific Textiles 21+11+4+4 = 40, Alpine Audio GmbH 21+10+6+3 = 40, Andes Naturals SA 12+9+4+0 = 25. Shenzhen and Andes carry zero dropped legs; Midwest and Pacific carry four each — where the 12 dropped legs hide.",
      ask: "Return one row per destination: legs, billed legs, flushing legs, awaiting legs and dropped legs, heaviest fan-out first.",
      template:
        "SELECT s.name,\n       COUNT(*) AS legs,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS billed_legs,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS flushing_legs,\n       COUNT(*) FILTER (WHERE o.status = {3}) AS awaiting_legs,\n       COUNT(*) FILTER (WHERE o.status = {4}) AS dropped_legs\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nJOIN orders o ON o.id = oi.order_id\nGROUP BY s.name\nORDER BY legs {5};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the billed branch",
          why: "delivered = fanned and billed — the legs whose parent period completed: Midwest 22, Shenzhen 25, Nordic 18. 'shipped' here would read the flushing arms and the billed column would describe in-flight work; one status literal moves a whole bucket between arms and the census stops footing to 251.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the flushing branch",
          why: "shipped = legs mid-flush with the stamp landed — 84 platform-wide, and the per-destination split shows where the flush backlog actually lives (Shenzhen 19, Midwest 18 against Nordic 17 on fewer legs). Any other literal empties the arm and a flush backlog reads as billed.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the awaiting branch",
          why: "pending = the parent source awaiting schema approval — 36 legs held at the protocol gate, 12 of them on Midwest Hardware Co alone: the destination the schema-approval queue unblocks first. 'delivered' in this arm folds awaiting volume into billed and the protocol board reads green while 36 legs wait.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the dropped branch",
          why: "cancelled = legs on dropped pipelines — 12 legs, and the census names them: 4 on Midwest, 4 on Pacific, 3 on Alpine, 1 on Nordic, ZERO on Shenzhen and Andes. The zeros are honest — those integrations genuinely never received dropped volume — and the 4s are the re-engagement list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The board reads the heaviest fan-out on top — Midwest 56 legs, Shenzhen 47, Nordic 43 — matching the destination ladder's weight order. ASC would open on Andes Naturals SA's 25 legs and the dropped-leg story (where the 12 hide) starts from the quietest line.",
        },
      ],
      distractors: ["'billed'", "'approved'", "ASC", "SUM"],
      walkthrough:
        "One scan, five lenses, and the footings are the correctness argument. The chain runs legs to plan SKUs to destination integrations to parent periods; COUNT(*) counts legs per destination; the four FILTER branches each count one parent status — and because the statuses partition the periods, the branches must sum to legs: Midwest 22+18+12+4 = 56, Shenzhen 25+19+3+0 = 47, Nordic 18+17+7+1 = 43, Pacific 21+11+4+4 = 40, Alpine 21+10+6+3 = 40, Andes 12+9+4+0 = 25 — platform 119+84+36+12 = 251. The census's story writes itself off the cells: Shenzhen runs clean across the board (3 awaiting, 0 dropped), Midwest concentrates the friction (12 awaiting + 4 dropped = 16 of its 56 legs stuck), and the two 40-leg integrations diverge in composition — Pacific carries the dropped legs Alpine doesn't. The distractors fail honestly: 'billed' and 'approved' are NOT statuses on this table — the branch matches zero rows and prints a column of lying zeros; ASC flips the read to start from Andes; SUM in a status comparison or the ORDER BY is either all-zeros or a syntax error before the board renders. Filter branches, one scan, footing identity — the same census four sequential queries can never prove.",
    },
    {
      id: "cs-segment-5",
      tier: "medium",
      topic: "t3",
      universe: "month-close",
      title: "The settlement clock",
      brief:
        "Segment-flavored memo on the storefront db: billing tracks the settlement clock — days from statement issue to FIRST payment against uniform 30-day terms — because the average alone hides a slow tail that treasury chases. Probed facts: 20 paid statements carry settlement legs; the first-payment clock averages 28.4 days with a 13-to-84 spread, and exactly THREE statements settle beyond the 30-day terms — INV-2024-017 at 84 days, INV-2024-023 at 55, INV-2024-022 at 40. The clock uses MIN(paid_on) (first money in, not last) and the population is paid statements only — the void-but-settled #11 and the six never-collected statements live on the anomaly list, not on this clock.",
      ask: "Return the paid statements settling beyond the 30-day terms: number, status, issue date and settle days, slowest first.",
      template:
        "SELECT i.number,\n       i.status,\n       i.issued_on,\n       CAST(julianday({1}(p.paid_on)) - julianday(i.issued_on) AS INTEGER) AS settle_days\nFROM invoices i\nJOIN payments p ON p.invoice_id = i.id\nWHERE i.status = {2}\nGROUP BY i.id, i.number, i.status, i.issued_on\nHAVING julianday(MIN(p.paid_on)) - julianday(i.issued_on) > {3}\nORDER BY settle_days {4};",
      slots: [
        {
          answer: "MIN",
          kind: "keyword",
          label: "the first-payment reader",
          why: "MIN(paid_on) reads the FIRST settlement leg — the day treasury saw money, which is the clock the 30-day terms measure. MAX would read the last leg and quietly forgive split settlements that started late; COUNT would feed a row count to julianday and produce a nonsense date.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the clock's population",
          why: "The settlement clock runs on paid statements — 20 of them, averaging 28.4 days. 'void' would read the void-but-settled #11 (a status that lies about settlement), and dropping the filter entirely would mix the six never-collected statements in — except they have no legs to clock, so the population must be named, not assumed.",
        },
        {
          answer: "30",
          kind: "number",
          noVerify: true,
          label: "the terms constant",
          why: "30 is the contract: uniform 30-day terms, so the HAVING cut isolates the slow tail — exactly 3 statements (84, 55, 40 days). The constant is policy, not a measured cell, so this slot is explicitly exempt from the number check.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the slowest-first direction",
          why: "Treasury works the slow tail worst-first: 84 days, then 55, then 40. ASC would open on the 40-day statement and the 84-day outlier — the one worth a phone call — sits unworked at the bottom.",
        },
      ],
      distractors: ["SUM", "'void'", "14", "ASC"],
      walkthrough:
        "Two clocks, one population, and the tail is the story. The join attaches each statement's settlement legs; WHERE status = 'paid' holds the population to the 20 statements that actually settled; GROUP BY i.id folds each statement's legs; and julianday(MIN(paid_on)) - julianday(issued_on) reads first money against the issue date, CAST to integer days. HAVING > 30 cuts to the slow tail: INV-2024-017 at 84 days, INV-2024-023 at 55, INV-2024-022 at 40 — three of twenty statements settling beyond uniform 30-day terms, while the full clock averages 28.4 with a fastest of 13. The average alone would read 'terms roughly met'; the tail read is what treasury acts on. The population boundaries are the discipline: the void-but-settled #11 (925.00) has legs but a lying status, the six never-collected statements have status but no legs — both live on the anomaly list (21 exact / 1 partial / 6 none, footing to 28), and this clock quotes none of them. MIN guards split settlements from being forgiven; SUM in the clock feeds summed TEXT dates to julianday and produces garbage; 'void' clocks the wrong statement; 14 floods the report with 17 on-terms statements; ASC buries the outlier. Every chip changes who treasury calls.",
    },
    {
      id: "cs-segment-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The volume spine walk",
      brief:
        "Segment-flavored memo on the storefront db: the growth review walks the monthly volume spine — each month's periods and billed value with the PRIOR month beside it and the percentage change computed — so the trough and rebound write themselves from the table. Probed facts: 14 months from 2024-01 to 2025-02 totaling 34,833.28; the book opens at 3,731.97 (8 periods), fades through the spring, troughs at 1,193.86 in July — the first seven months run -3.3, -27.5, -5.7, +17.9, -29.6, then -41.7 into the trough. LAG carries the prior month; the first row's NULL is the honest baseline — no month precedes it.",
      ask: "Return the first seven months of the spine: month, periods, billed value, prior month's value and month-over-month percentage, chronological order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS periods,\n         ROUND(SUM(total), 2) AS billed\n  FROM orders\n  GROUP BY month\n), walked AS (\n  SELECT month,\n         periods,\n         billed,\n         {1}(billed) OVER (ORDER BY month) AS prev_billed\n  FROM monthly\n)\nSELECT month,\n       periods,\n       billed,\n       prev_billed,\n       ROUND(100.0 * (billed - prev_billed) / prev_billed, 1) AS mom_pct\nFROM walked\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(billed) walks the window backwards one row — February's prev_billed is January's 3,731.97. LEAD would read forward and hand each month the FUTURE's value, silently re-labeling the forecast as history; the first row's NULL is the honest 'no baseline'.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month-over-month walk is chronological: ASC keeps 2024-01 on top so each row compares against the row above it and the fade reads downward into the trough. DESC would present the newest month first with its baseline below — the numbers survive, the story doesn't.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the trough cut",
          why: "LIMIT 7 ends the walk on July 2024 — the 1,193.86 trough at -41.7%, the row the narrative quotes. The 7 is also April's period count sitting in the output, and any larger cut dilutes the first-half story the deck opens with.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "8"],
      walkthrough:
        "Staged windows over the spine. The monthly CTE folds 103 periods into 14 '%Y-%m' buckets with billed value rounded at the edge; the walked CTE layers LAG(billed) OVER (ORDER BY month) so each row carries its predecessor; the outer SELECT computes the delta as a percentage — 100.0 BEFORE the division, because the folds are decimal but the habit is not. The walk reads: 3,731.97 (NULL baseline — no prior month, no invented zero), then -3.3 into February, -27.5 into March, -5.7 into April, +17.9 into May, -29.6 into June, and -41.7 into July's 1,193.86 trough. The two-step matters: window output isn't visible to WHERE or to sibling expressions in the same SELECT, so the LAG stages in its own CTE and the arithmetic runs outside. LEAD would hand January February's 3,609.64 and call the future history; SUM would pile a running total into prev_billed; DESC tells the fade backwards; LIMIT 8 keeps the trough but buries it under August's rebound. Every chip changes what the review would conclude.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-iii", why: "First-fan-out windows per SKU — which leg a period's volume landed on first — is a ROW_NUMBER-over-window drill, the exact shape of the onboarding cohort's first-flush read." },
    { slug: "sales-analysis-ii", why: "Workspaces who bought but never fanned to a given destination family — the anti-join behind coverage maps. On this db the never-billed count is a confident 0, and proving the zero is the exercise." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each workspace's dominant plan SKU is the account team's first slide — argmax per workspace with a tie-safe shape, exactly how the 24-period workspace's mix gets defended." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere: destinations carrying at least 40 legs, workspaces carrying at least N periods. This problem drills the group-level gate the fan-out bench uses." },
    { slug: "immediate-food-delivery-ii", why: "Share of volume flushed inside the promised window versus late — the flush-SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "game-play-analysis-i", why: "First event per workspace — the trial's first logged touch — anchors every cohort Segment builds on the source side. MIN-per-group is the shape." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-period workspace is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "find-users-with-high-token-usage", why: "Volume outliers flag workspaces outgrowing their MTU tier — the overage-signal query is a threshold fold over per-account usage, this problem's exact shape." },
    { slug: "combine-two-tables", why: "Workspaces LEFT JOINed to billing periods: the whitespace read. A workspace with no period is whitespace, a period with no workspace is corruption — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Flush outcomes arrive with gaps — COALESCE turns missing confirmation data into an explicit rate instead of a silent NULL. This drills the denominator the schema-approval funnel needs." },
    { slug: "trial-to-paid-funnel", why: "The 14 pending sources are Segment's trial population — conversion from schema approval to fanned volume is this funnel at db scale, denominators stated." },
    { slug: "find-total-time-spent-by-each-employee", why: "Time-in-pipeline per period — open to flush, 2.98-day average over 82 stamped rows — is this problem's per-entity duration fold with the population spelled out." },
    { slug: "net-revenue-retention", why: "NRR is the metric the revenue team actually manages — cohort revenue walks with expansion and churn netted. This problem is that walk at practice scale." },
    { slug: "mrr-waterfall", why: "Leg adds, leg drops and drops-to-pipeline roll into a movement waterfall — LAG over period status transitions, the expansion story in one query." },
    { slug: "growth-accounting", why: "New, retained, resurrected, dropped — the workspace-accounting identity that reconciles 16 workspaces period over period. LAG status classification, exactly this problem." },
    { slug: "group-sold-products-by-the-date", why: "The manifest drill itself: fold each period's destinations into one cell. GROUP_CONCAT with DISTINCT discipline is cs-segment-2's core move, rehearsed at practice scale." },
    { slug: "sessionize-events", why: "Raw source events become sessions by a gap rule — sessionization is the intake step behind every period census the pipeline reads, rehearsed at practice scale." },
    { slug: "find-bursty-behavior", why: "Event bursts are the pipeline's stress test — sources that spike volume in short windows are the ones MTU tiers and flush SLAs argue about." },
    { slug: "rolling-7d-actives", why: "Weekly active workspaces is the pipeline's pulse — a distinct-fold over a rolling window with the population stated, the two-grain habit at practice scale." },
    { slug: "calculate-orders-within-each-interval", why: "Periods flushing inside promised intervals is the flush-SLA fold — half-open buckets, no boundary drift, exactly this kit's clock canon." },
    { slug: "dynamic-pivoting-of-a-table", why: "Destination-by-market pivot grids are the integrations review's wall chart — CASE pivots plus conditional aggregation in one pass." },
    { slug: "activity-participants", why: "Which workspaces actually fanned volume per period is participation at pipeline grain — a distinct-fold census beside the fate map." },
    { slug: "viewers-turned-streamers", why: "Sources that go from receiving to fanning are activation — the schema-approval-to-billed transition read this db's 14 pending queue makes concrete." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest flush per plan SKU is the recency cut behind destination-health reads — top-N-per-group with ROW_NUMBER, exactly this drill." },
    { slug: "portfolio-concentration-hhi", why: "Nordic Gadgets AB at 31.95% of the book is a concentration claim — HHI-style folds quantify how much one destination carries." },
    { slug: "ar-aging-schedule", why: "Aging the never-collected statements by due date is the dunning calendar — the 6-statement, 15,217.00 anti-join bucketed by age." },
    { slug: "duplicate-charge-pairs", why: "Split settlements arrive as paired legs — pair-once self-joins reconcile them, the same discipline the two-rail cycles demand." },
    { slug: "biggest-window-between-events", why: "Gaps between flush stamps expose pipeline stalls — window date diffs with the unstamped population named, never coalesced." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Volume streaks per workspace flag accelerating accounts — the expansion signal behind the MTU-tier upgrades." },
    { slug: "usage-tier-percentiles", why: "Percentile cuts over leg volume are how the pricing pod sketches new MTU tiers — window arithmetic that must name its tie policy." },
    { slug: "the-number-of-users-that-are-eligible-for-discount", why: "MTU-tier eligibility is a conditional count over a stated threshold — the same band-fold discipline the 55-dollar cut teaches." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Workspaces fanning to destinations A and B but never C — the attach-rate audit behind every coverage map and integration bundle." },
  ],
};
