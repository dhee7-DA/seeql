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
    "Preparation strategy: the pools file carries no Segment section — **0 tagged rows** — so all sixteen problems and every topic slug here are theme-curated to this kit's known screen shapes: fan-out folds, MTU bands, flush clocks, manifest `GROUP_CONCAT`s, schema-validation hygiene and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:destination fan-out census} the integrations review opens with, the other rebuilds the {violet:destination manifest fold} billing reconciles at every close. The bar to clear: *state the leg grain and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
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
      slugs: ["percentage-of-users-attended-a-contest", "active-businesses", "number-of-employees-who-met-the-target"],
    },
    {
      name: "Destination fan-out folds",
      why: "The leg grain is Segment's home grain: order_items joined to plan SKUs and destination integrations, folded per integration into legs, distinct periods fanned, volume and revenue. The habit being graded is the two-grain pairing — Midwest runs 56 legs into 45 periods while Andes runs 25 into 25 — because a census that reports one grain while the stakeholder asked for the other is a wrong number wearing the right column names.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Volume bands with CASE",
      why: "MTU tiers are CASE-classified: the band fold splits 498 volume units into 268 on sub-55 starter rates and 230 on high-throughput rates, and plan SKUs band into families the same way. The arms must be exhaustive and ordered — 133 legs plus 118 legs must reconcile to 251, or a hole in the CASE is a hole in the pricing story — and a reordered WHEN quietly re-bands the base.",
      slugs: ["the-category-of-each-member-in-the-store", "loan-types", "count-salary-categories"],
    },
    {
      name: "Schema hygiene & validation",
      why: "Segment's product promise is a schema contract: event names normalized, properties validated, malformed sources rejected before they fan out. The screens probe the SQL of that discipline — SUBSTR/UPPER/LENGTH normalization passes, validation rules that flag malformed rows — because a destination receiving dirty events is billed for them anyway. Text-function drills are not decoration here; they are the protocol team's intake gate.",
      slugs: ["invalid-tweets", "fix-product-name-format", "find-users-with-valid-e-mails"],
    },
    {
      name: "Flush clocks & date math",
      why: "The flush clock is created_at → shipped_at over the 82 stamped periods, 2.98-day average with a 2–4 spread — and the first question in any review is what the 21 unstamped rows (14 pending + 7 cancelled) are doing in your base. julianday arithmetic with a stated population, half-open date windows that don't lose the last night's volume, and LAG edges read as NULL-baseline are the shapes being graded.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "second-day-verification"],
    },
    {
      name: "Fan-out share windows",
      why: "Every leg carries a share of its period's volume — SUM(quantity) OVER (PARTITION BY order_id) — and every destination sits on a ladder where ties are guaranteed: Pacific Textiles and Alpine Audio GmbH both carry 40 legs, so RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung. Window counting (find-the-team-size shape) beside each leg row is exactly how the fan-out burden reads without collapsing the grain.",
      slugs: ["find-the-team-size", "rank-scores", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Volume spines & month walks",
      why: "The 14-month period spine (2024-01 to 2025-02) is the volume trend's home turf: peak 3,731.97 in January, trough 1,193.86 in July with 2 of the 7 drops, recovery to 2,352.07 in August. Prior month beside current with LAG, first row NULL as baseline, and a two-grain walk (periods AND distinct workspaces per month) are the standard asks — each one a fold whose denominator must be stated out loud.",
      slugs: ["unique-orders-and-customers-per-month", "list-the-products-ordered-in-a-period", "year-on-year-growth-rate"],
    },
    {
      name: "Unwired legs & anti-joins",
      why: "Pipeline health is read from absences: workspaces with no billing periods, destinations with no legs, periods whose statements never settled (6 worth 15,217 here). LEFT JOIN ... IS NULL and NOT EXISTS are the tools, and the discipline is proving the zero rather than trusting it — this db's never-billed workspace count is a confident 0, and a candidate who verifies that beats one who assumes it.",
      slugs: ["sellers-with-no-sales", "find-churn-risk-customers", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Statement rails & cents",
      why: "Billed is not settled: 28 statements against 27 payment legs in INTEGER cents, split across card (16 legs, 37,364.00) and wire (11 legs, 32,248.00) rails. Every dollar read is amount_cents / 100.0, the coverage census (21 exact / 1 partial / 6 none) is one CASE away, and the settlement clock — 28.4 days average against uniform 30-day terms — hides a slow tail that the average alone never shows.",
      slugs: ["bank-account-summary-ii", "number-of-rich-customers", "products-worth-over-invoices"],
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
  ],
};
