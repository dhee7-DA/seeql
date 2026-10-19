// Coupang — Wave-9 (Task 98), ecom domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Korea's e-commerce giant: Rocket Delivery speed economics, the dawn-dispatch
// machine, and WOW-membership retention. The storefront db reads as a
// fulfillment sandbox — customers are WOW members (region = market cluster),
// orders are Rocket orders (delivered = Rocket-arrived 52, shipped =
// out-for-dawn-dispatch 30 with shipped_at as the dispatch stamp, pending =
// in the fulfillment queue 14, cancelled = aborted 7), order_items are order
// lines (quantity = units, unit_price = shelf price), products are listings,
// suppliers are marketplace sellers, invoices are settlement statements to
// sellers, payments are the payment rails (card vs bank-transfer wire), and
// expenses/ledger_entries are network opex and the GL. Money tables are
// INTEGER cents — the dollar read is amount_cents / 100.0.
// Pool provenance: company-pools.md carries NO Coupang section (0 tagged rows),
// so all 10 topic slug sets and all 16 problems are theme-curated from the
// pools file's SQL rows and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12); every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts. Accent text-violet-400
// is unused by all 17 ecom sibling kits.

import type { CompanyKit } from "../types";

export const coupangKit: CompanyKit = {
  id: "coupang",
  domainId: "ecom",
  name: "Coupang",
  tagline: "Rocket-fast fulfillment economics, WOW-membership retention",
  accent: "text-violet-400",

  brief: [
    "**Coupang** is Korea's largest e-commerce company — the operator that made same-day and dawn delivery a default expectation through Rocket Delivery, stretched the machine into groceries with Rocket Fresh, and binds it all to a paid {violet:WOW membership} that turns speed into retention. The whole data story here is the promise versus the pipeline: an order placed is not an order dispatched, and an order dispatched is not an order arrived. This kit maps the storefront db onto that world: the 16 customers rows are WOW members, the 103 orders are Rocket orders worth 34,833.28, and the 251 order_items rows are order lines — quantity = units, unit_price = shelf price. The status map is fixed: delivered = {emerald:Rocket-arrived} (52, 50.5%), shipped = {sky:out-for-dawn-dispatch} (30, 29.1%), pending = in the fulfillment queue (14), cancelled = {rose:aborted} (7, 6.8%).",
    "Three pods read the same spine. Fulfillment analytics owns the promise: created_at stamps the order placed, `shipped_at` stamps out-for-dispatch, and **82 of 103 orders** carry one — averaging **2.98 days** order-to-dispatch on the sandbox's day clock with a 2–4 spread. Marketplace analytics owns the sellers: the 6 suppliers rows are sellers on the marketplace (Nordic Gadgets AB alone carries 32% of revenue, Midwest 26.7%), and the invoice book holds their {amber:settlement statements} — 28 of them in INTEGER cents, where the dollar read is `amount_cents / 100.0`. One honesty note baked into every query here: the sandbox's region column reads EU/APAC/US/LATAM as market clusters — APAC is home turf (Seoul, Osaka, Nagoya sit in the city list) and the rest read like overseas Rocket launches.",
    "Interview screens open on the funnel census — placed, dispatched, arrived, aborted — then immediately ask the denominator question out loud (*'does an aborted Rocket order count in your base?'*). The escalation path is a Coupang signature: a two-grain market census (EU runs **45 orders from just 8 members**; the US runs 19 from 2), then a dispatch-latency read where the 14 queue orders have no stamp and therefore no cycle, then a seller revenue fold where a rating floor decides who keeps the fast badge. Every number in the building reconciles to 103 by construction — 52 + 30 + 14 + 7 — and *a census that doesn't is the day's first incident*.",
    "Preparation strategy: company-pools.md carries no Coupang section — zero tagged rows — so all ten topic slug sets and all thirty-two problems here are **theme-curated** from the pools file's SQL rows to this kit's known screen shapes: funnel censuses, dispatch-latency math, tie-heavy best-seller ladders, honest-denominator rates and the cents-safe settlement book. Do the topics in order, then run the six case studies on the live storefront db, spaced across the week rather than in one sitting: the {violet:Rocket-badge seller bench} the marketplace pod audits monthly, the {sky:dawn-dispatch clock} fulfillment ops reads every morning, the one-pass dawn census the standup opens with, the best-seller ladder merchandising publishes, the 14-month demand spine the growth call walks, and the settlement coverage split finance closes on. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:10 —** The day starts with the dawn-cycle check. A fulfillment analyst opens the dispatch dashboard before the morning standup: did last night's Rocket orders land, did the fulfillment queue drain, and does the one-pass status census reconcile — 52 arrived + 30 dispatched + 14 queued + 7 aborted = **103 by construction**? The queue is the mood-ring: the **14 pending** rows are orders promised for the next dawn window with no `shipped_at` stamp yet, and *a queue that grows two days running is a page, not a chart note*. If any branch of the census drifts off 103, the analyst writes the diff query before coffee — which side is missing rows, and by how much.",
    "**11:30 —** Midday splits between sellers and speed. The marketplace pod wants the seller revenue fold re-cut — Nordic Gadgets AB at **32%** of marketplace revenue, Midwest 26.7% — before the monthly badge review; finance wants the settlement coverage split (**21 exact, 1 partial, 6 never-settled worth 15,217**) before a single reminder letter goes out; fulfillment wants the latency cut by market (EU 2.94 days versus US 3.07) beside dispatched counts. Each ask is a join, a conditional aggregate and one judgment call about population — *the analyst writes the query twice: once to answer, once with the definition spelled out so the number survives the badge-review argument*.",
    "**15:30 —** The afternoon tilts to members and the close. The retention pod reads the repeat cadence — one member has run **24 Rocket orders**, another 17, while two members sit at a single order each — and flags lapse-risk members for the winback calendar. Then the money ritual: settlement anomalies walked line by line — a void-but-settled statement (#11, 925.00), a paid-status statement with zero settlement rows (#28, 1,756.00) — and the ledger trial balance must read **181,080 against 181,080**, delta zero. {emerald:The close ships} or tomorrow starts with an incident; the last hour is handoff notes so the dawn shift inherits queries, not mysteries.",
  ],

  metrics: [
    { name: "Rocket arrival rate", what: "Delivered ÷ ALL Rocket orders placed: 52 of 103 (50.5%). The promise number — and the conditional-count ratio where the denominator question is the entire test." },
    { name: "Dawn-dispatch share", what: "Orders stamped out-for-dispatch ÷ placed: 30 of 103 (29.1%), with shipped_at as the dispatch stamp. The dawn machine's throughput read." },
    { name: "Fulfillment queue", what: "Pending orders: 14 of 103 (13.6%) — promised, not yet stamped. 'Not yet', never a silent zero; the queue's growth rate is the page-the-ops-lead trigger." },
    { name: "Dispatch latency", what: "Order-to-dispatch (created_at → shipped_at) over the 82 stamped orders: 2.98-day average, 2–4 spread. The population ships with the number — queue rows have no cycle and must not dilute it." },
    { name: "Abort share", what: "Cancelled ÷ placed: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The demand-quality map that decides checkout friction fixes." },
    { name: "GMV book", what: "Total Rocket order value: 34,833.28 across 103 orders, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 basket outweighs the smallest 42 combined." },
    { name: "Seller concentration", what: "Nordic Gadgets AB carries 32% of marketplace revenue, Midwest Hardware Co 26.7%. The badge-bench concentration number that staffs seller ops and sizes the fast-badge program." },
    { name: "Settlement coverage", what: "Settled versus claimed: 21 exact statements, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217 — read on rails that split card (16 payments, 37,364) versus bank-transfer wire (11, 32,248)." },
  ],

  topics: [
    {
      name: "Rocket funnel counts",
      why: "Every Coupang screen opens with the funnel: orders placed, dispatched (shipped_at stamped), arrived. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a dispatched order 'arrived' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "'Orders AND members per market' is the opening read of every Coupang business review — and the trap is counting both at the same grain. COUNT(*) counts order rows; COUNT(DISTINCT customer_id) counts members. EU's 45 orders collapse to 8 members, and the gap between the two numbers is the intensity story.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining listings to demand",
      why: "Seller and category reporting means attaching listing and seller attributes to every order line — a three-table chain where the join type decides who survives. The follow-up is always about survival: does a line whose listing is missing from the catalog appear in the revenue fold, and does a seller with zero lines still make the bench?",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "sales-analysis-i"],
    },
    {
      name: "Dispatch latency & date math",
      why: "The dawn promise is a timestamp subtraction: julianday(shipped_at) - julianday(created_at) over the 82 stamped orders, 2.98 days on average. Coupang drills the population guard — 21 orders have no stamp and no cycle — plus the window discipline of half-open intervals around dispatch cutoffs.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Best-seller ladders & ties",
      why: "The units ladder runs 47, 46, 38, then a two-way tie at 36 and a three-way tie at 30 — ties are guaranteed at listing grain, so RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow. That is a policy about peer listings, not syntax, and the LIMIT-1-OFFSET-1 habit breaks on it.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Settlement anti-joins",
      why: "A seller settlement statement with no payment rows is the money story of the marketplace — 6 statements worth 15,217 on this db. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) is how the dunning list gets built; the never-ordered reads here return a confident zero, and proving that zero is part of the job.",
      slugs: ["sellers-with-no-sales", "employees-with-missing-information", "customers-who-never-order"],
    },
    {
      name: "CASE bands & the empty premium tier",
      why: "Listing price bands are CASE-classified — budget (8 listings, 32.06 average) and mid (8 listings, 111.5 average) both exist, but the premium band (200-plus) is provably EMPTY at a 199.99 max. A zero bucket that must still print is the hardest CASE discipline there is, and UNION ALL zero-bucket drills are exactly this shape.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Honest denominators & shares",
      why: "Abort shares, arrival rates, badge coverage — Coupang's ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's filter decided BEFORE the ratio, and rounding only at the end — the regional abort map reads 8.1 / 6.7 / 5.3, not a flat 6.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "friend-requests-i-overall-acceptance-rate"],
    },
    {
      name: "The demand spine: month walks",
      why: "The 14-month demand spine (2024-01 to 2025-02) is the growth call's home turf: per-month order counts and GMV with LAG deltas, troughs named (July's 1,193.86), aborts clustered (2 each in July and November of the 7 total). LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["consecutive-numbers", "transaction-velocity", "friday-purchase-iii"],
    },
    {
      name: "Settlement cents discipline",
      why: "Arrived is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the marketplace world meets money. Every dollar read is amount_cents / 100.0, the exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and the trial balance must land at 181,080 against 181,080.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "coupang-t1",
      q: "Your seller report joins sellers to listings to order lines. When do you INNER and when do you LEFT — and what does the 251-line fan-out do to your counts?",
      a: "Decide from the survival rule the question implies. A settled-revenue report joins sellers → listings → order lines: a line with no listing is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A catalog-coverage report must be LEFT from sellers: a seller whose listings never sold is exactly the row the badge review needs, arriving with NULL line columns. The fan-out is the second trap: 251 order lines against 103 orders means joining order_items multiplies rows, and COUNT(*) silently starts counting lines instead of orders or listings — three grains, one join path. On this db the never-ordered anti-join returns a confident zero (all 16 listings sold somewhere), and proving that zero is itself the analyst's job. The habit the panel grades: before any aggregate over a joined tree, say out loud 'one row per what?' — seller, listing, or line.",
      tag: "joins",
    },
    {
      id: "coupang-t2",
      q: "The best-seller ladder runs 47, 46, 38, then 36 twice, then 33, then 30 three times. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied units the same rung and skips: 47 ranks 1, 46 ranks 2, 38 ranks 3, the two 36-unit listings share rank 4, 33 takes rank 6, and the three 30-unit listings share rank 8 — so the next listing down (28 units) lands on rank 11, implying three phantom rungs that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 8, 8, 8 and the next distinct count is 9. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which listing gets the merchandising slot. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer listings (RANK or DENSE_RANK), or an explicitly named tie-breaker like units then listing id, written in the query comment. On a ladder where a three-way tie sits two rungs from the top ten's edge, that policy is a real merchandising decision.",
      tag: "windows",
    },
    {
      id: "coupang-t3",
      q: "The census shows 103 Rocket orders and 16 WOW members; EU shows 45 orders and 8 members. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts order rows after the join — one row per Rocket order, so a member with 24 orders contributes 24. COUNT(DISTINCT customer_id) folds those rows back to members — EU's 45 orders collapse to 8 members. Neither is wrong: orders measure load and dawn-window pressure, members measure installed base and coverage. The ratio — 5.6 orders per member in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for units and COUNT(*) silently counts order lines, not orders — 251 of them. And a fourth hides in statuses: 103 placed is not 52 arrived, and a kept-rate that divides by placed while the stakeholder meant dispatched is a wrong number wearing the right name. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "coupang-t4",
      q: "shipped_at is NULL until an order is stamped out-for-dispatch. What is your policy for the dispatch-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped orders have a cycle, so the report measures created_at to shipped_at for the 82 of 103 orders that carry the stamp — averaging 2.98 days with a 2–4 spread — and says so in the title. The 14 queue orders and 7 aborted orders have no dispatch and therefore no latency; they are a population definition, not a cleanup job. Then mechanics: AVG ignores NULLs, so AVG over ALL orders returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset, and the gap between it and COUNT(*) is exactly the 21 unstamped rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for orders still sitting in the fulfillment queue, and on a dawn-promise network that lie compounds straight into capacity planning.",
      tag: "nulls",
    },
    {
      id: "coupang-t5",
      q: "The ops review wants abort share per market, but only for markets carrying at least ten orders. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — the cancelled flag is read per order, and conditional aggregation (SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)) must keep every row so the denominator survives; a WHERE status = 'cancelled' would delete the denominator before groups form. The ten-order floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY region; putting it in WHERE errors because COUNT does not exist before groups form, and on this db the floor matters: LATAM's 2 orders drop out, leaving APAC 8.1%, EU 6.7% and US 5.3% on honest bases. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a share and an error, and between a threshold applied to orders versus to dollars. The strong answer places every filter by asking: is this a fact about one Rocket order, or about a market?",
      tag: "pipeline",
    },
    {
      id: "coupang-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison — on this db the platform average basket is 338.19, so 'big-basket orders' is total > 338.19. Zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 orders always produce a mean. On filtered staging tables — one market, one status, one dawn window — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each order to ITS market's average) re-runs per outer row and answers a different question — 'above average for where I sell' versus 'above average for the platform' — at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because on a dawn-cycle network a silently empty exception report is how stockouts ship unnoticed.",
      tag: "subqueries",
    },
    {
      id: "coupang-t7",
      q: "The demand trend buckets orders by month on TEXT timestamps, and the latency clock subtracts julianday stamps. How do you build the spine, cut a window without losing the last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The window: half-open intervals — created_at >= '2024-07-01' AND created_at < '2024-08-01' — because BETWEEN '2024-07-01' AND '2024-07-31' silently drops the last night's orders, and month-end is exactly when the dawn queue surges. The clock: julianday(shipped_at) - julianday(created_at) over stamped rows only, 2.98 days on average, range 2 to 4. And the LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as the baseline, never coalesce it to zero, which reads as a flat month. On this spine the story is concrete: the book troughs at 1,193.86 in July, and both July and November carry 2 of the 7 aborted orders — a trend query that cannot reproduce those cells is measuring the wrong population.",
      tag: "dates",
    },
    {
      id: "coupang-t8",
      q: "Finance says a settlement statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. Between the extremes sits the partial: statement #25 is open at 6,148 with 4,000 settled — the coverage split must read 21 exact / 1 partial / 6 never-settled or the close is wrong. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent row. And the final ritual: the ledger trial balance must land at 181,080 debits against 181,080 credits, delta zero, or the settlement close does not ship.",
      tag: "quality",
    },
    {
      id: "coupang-t9",
      q: "The dispatch board folds each day's Rocket lines into one cell: GROUP_CONCAT(p.name). When is a string fold the right grain, and what are its three silent traps?",
      a: "The fold is right when the cell is a manifest — a reviewer reads it, they don't compute on it. Three traps: first, GROUP_CONCAT skips NULLs, so a listing with a NULL name vanishes from the manifest with no gap and no error — coalesce to a sentinel like '(unnamed listing)' before the fold if the gap must be visible. Second, order within the cell follows the scan unless you sort deliberately — a manifest that shuffles between runs reads as corruption, so pin the order or treat the cell as a set. Third, the fan-out: joining orders to order_items to products multiplies rows, so the manifest lists a product twice when an order carries two lines of it — correct for a dispatch manifest, wrong for a catalog census. Say 'one row per what?' before the fold: day, order, or line.",
      tag: "aggregation",
    },
    {
      id: "coupang-t10",
      q: "Build the one-pass Rocket census. Why must the four conditional arms reconcile to COUNT(*), and what does the FILTER form buy over four separate queries?",
      a: "Every Rocket order sits in exactly one of four states — delivered (52), dispatched (30), queued (14), aborted (7) — so the arms partition the population and must sum to COUNT(*): 103 by construction. COUNT(*) FILTER (WHERE status = 'delivered') keeps the census in one scan with one GROUP BY, which makes drift structural: an arm that miscounts breaks the identity visibly. Four separate queries can each be correct and still disagree — a filter creeps into one of them, or a schema change lands between runs, and the board reads numbers that no longer reconcile. The one-pass census is also the denominator's honesty check: whatever COUNT(*) reads IS the placed base, and every share on the slide divides by it — 52/103, never 52/82.",
      tag: "aggregation",
    },
    {
      id: "coupang-t11",
      q: "Never-settled statements must print 0 settled — not NULL. Where does COALESCE sit, and why is the inner placement a no-op?",
      a: "The fold is COALESCE(SUM(p.amount_cents), 0) — the guard sits OUTSIDE the aggregate. SUM skips NULL inputs and returns NULL when it receives none, so a statement with zero payment legs folds to NULL; the outer COALESCE converts the empty fold to the honest 0 the coverage CASE needs to classify 'none'. SUM(COALESCE(p.amount_cents, 0)) guards each input — but SUM already ignores NULL inputs, so the inner version does nothing new and still returns NULL on the empty fold. The rule generalizes: guards repair NULLs inside present rows, COALESCE repairs the ABSENCE of rows — know which failure you are fixing. On this db the six never-settled statements (15,217 claimed) print 0 settled and land in the dunning bucket precisely because the outer guard exists.",
      tag: "nulls",
    },
    {
      id: "coupang-t12",
      q: "The dashboard's order tile prints 251; the census says 103. Walk the diagnosis and the grain rule that prevents it.",
      a: "251 is the order-lines count: joining orders to order_items fans each order out to its lines — 103 orders averaging 2.44 lines, max 4 — and COUNT(*) counts whatever the joined row is. The diagnosis is one scan: SELECT COUNT(*), COUNT(DISTINCT o.id) FROM orders o JOIN order_items oi ON oi.order_id = o.id — 251 versus 103, and the gap is the fan-out. The prevention rule is saying the grain out loud before any aggregate over a joined tree: one row per order, per line, or per listing? COUNT(DISTINCT o.id) folds to orders, COUNT(*) reads lines, COUNT(DISTINCT p.id) reads listings. The tile was a line counter wearing an order title — the fix is the title or the DISTINCT, and the census's 103 is the tiebreaker.",
      tag: "joins",
    },
    {
      id: "coupang-t13",
      q: "The dunning list uses seller_id NOT IN (SELECT seller_id FROM settlements WHERE status = 'open') and returns zero rows. What do you check first, and what is the standing policy?",
      a: "NULL in the subquery list. NOT IN materializes the list and evaluates x NOT IN (…) — the moment one NULL sits in that list, every comparison is UNKNOWN and the whole report silently empties while looking valid. The clean core db rarely carries the NULL (its six-statement answer is honest); staging tables are where NULLs sneak in, and empty dunning lists ship from exactly there. The policy: NOT EXISTS for existence tests — it evaluates per row and is NULL-immune — or NULL-guard the subquery (WHERE seller_id IS NOT NULL) if NOT IN must stay. And when a confidence-inspiring zero prints, prove it is the data and not the logic: run the EXISTS twin and compare counts before the list goes out.",
      tag: "subqueries",
    },
    {
      id: "coupang-t14",
      q: "The payment-rails packet stacks card legs over wire legs, then a TOTAL row. Why UNION ALL, and what makes the three arms a legitimate stack?",
      a: "UNION ALL because the arms are disjoint by construction — a payment leg carries exactly one method, and the TOTAL arm is a different grain on purpose. UNION would dedupe any two byte-identical rows silently, and on a stack whose whole point is reconciliation, deleting a row undetected is the nightmare. Legitimacy rules: same column count and types per arm, a label column ('card' / 'wire' / 'TOTAL') so the reader never infers provenance, and the disjointness argument written as a comment — the comment IS the correctness proof. On this db the stack reads card 16 legs / 37,364, wire 11 / 32,248, TOTAL 27 / 69,612 — and the arms must cross-foot to the TOTAL or the packet does not ship.",
      tag: "sets",
    },
    {
      id: "coupang-t15",
      q: "Which markets delivered but never refused a Rocket order? Compare the set answer (EXCEPT) with the conditional-count answer — when does each win?",
      a: "The set answer: SELECT region FROM <delivered markets> EXCEPT SELECT region FROM <cancelled markets> — all four buckets deliver, three also refuse (EU 3, APAC 3, US 1), so LATAM survives alone. The conditional answer: GROUP BY region with a cancelled arm equal to 0 — same conclusion, plus the bases printed (LATAM's zero rides on 2 orders). EXCEPT wins when the question is membership — who is in, who is out — and you want the engine to prove disjointness without a share debate. Conditional counts win when the question is magnitude: a zero on a 2-order base is a different business object than a zero on 45. The strong answer gives the set and immediately volunteers the base caveat — the set proves the fact, the census prices it.",
      tag: "sets",
    },
    {
      id: "coupang-t16",
      q: "The catalog feed arrives with 'keyboard', 'Keyboard ' and 'KEYBOARD' as one product's titles. What breaks, and what is the join-key discipline?",
      a: "The census splits one listing into three: GROUP BY on raw names triples the SKU, revenue folds per variant, and every name-keyed join — search to catalog, feed to ads — misses two of the three spellings. The discipline: normalize at the boundary, once — TRIM plus UPPER (or LOWER) into a canonical key, ideally at ingest, so every downstream join reads the same key. Inside queries, wrap BOTH sides of the comparison or neither: UPPER(p.name) = UPPER(feed.name) matches, one-sided normalization silently keeps the miss. And never let normalization replace validation — 'KEYBOARD ' matching 'keyboard' is the fix working; 'KEYBOARDX' matching is a different product with a typo, and a length check is what catches it. On a catalog that ingests seller feeds daily, boundary normalization is a daily chore, not a cleanup project.",
      tag: "casing",
    },
    {
      id: "coupang-t17",
      q: "Dispatch latency is julianday(shipped_at) - julianday(created_at) over TEXT timestamps. What conventions must the report state, and where does the BETWEEN seam bite?",
      a: "Three statements the report makes before its numbers: the population — only the 82 of 103 orders carrying shipped_at have a cycle, averaging 2.98 days over a 2–4 spread; the unit — julianday returns fractional days, so ROUND happens once at the end, never per row; and the boundary rule — windows are half-open, created_at >= '2024-07-01' AND created_at < '2024-08-01', because BETWEEN '2024-07-01' AND '2024-07-31' drops the last evening ('2024-07-31 18:40:11' > '2024-07-31') and month-end is exactly when the dawn queue surges. The unstated convention that bites hardest: timezone — the stamps are stored as-written, so a feed writing UTC beside a feed writing local invents hours inside the clock. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "coupang-t18",
      q: "Pick each market's heaviest Rocket order, then the network's. Where does the naive argmax break, and what is the policy?",
      a: "The naive shape — ORDER BY total DESC LIMIT 1 — breaks on ties and on scope. Ties: the units ladder carries a two-way tie at 36 and a three-way tie at 30; LIMIT 1 returns an arbitrary member, and 'arbitrary' changes between runs and engines. Scope: one LIMIT at the network is one query, but per market you need a partition — RANK() OVER (PARTITION BY region ORDER BY total DESC) with rnk = 1 kept by an outer filter, staged in a CTE because windows cannot live in WHERE. The policy a strong candidate states: RANK lets ties share the crown (a real possibility on this ladder), ROW_NUMBER needs a named tie-breaker — created_at, then id — written in the query comment. 'The heaviest order' is only defined once the tie rule is.",
      tag: "windows",
    },
    {
      id: "coupang-t19",
      q: "Per-market AOVs are 335.32 / 313.66 / 383.48 / 426.22; their average is 364.67 but the network AOV is 338.19. Which is real, and what is each one for?",
      a: "Both are real; they answer different questions. The network AOV is the pooled mean — SUM(total) over all 103 orders ÷ 103 — 338.19, and it is the number the P&L names, because the average Rocket ORDER is what basket-size experiments move. The 364.67 average-of-averages weights each market equally, giving the 2-order cross-border lane the same voice as the 45-order EU market; it answers 'how does a typical MARKET price its basket', a demographic read, not an order read. The trap is silent substitution: a deck that computed the pooled number last quarter and the averaged number this quarter shows a phantom jump no experiment can explain. State the grain — per order or per market — before the division, and the two numbers stop fighting.",
      tag: "aggregation",
    },
    {
      id: "coupang-t20",
      q: "What two rituals must the settlement close pass before any number ships, and what does each catch?",
      a: "First, the money read: every cents column folds through amount_cents / 100.0 — the .0 promotes real arithmetic before the division, because integer division truncates silently and the first odd-cent staging leg would book 1,756.37 as 1,756.00 with 37 cents unfindable. Second, the identity: the ledger trial balance must read 181,080 debits against 181,080 credits, delta zero — 80 entries, every cent on both sides. The trial balance catches posted-once errors (a debit with no twin); the cents read catches silent truncation. Between them sits the pairing read: settled legs cross-foot to 69,612, cash's debit leg reads 69,612, and the AR roll (86,052 debited, 69,612 settled) shows the open book. A delta anywhere means the close does not ship — the day's last query is the one that proves the books.",
      tag: "quality",
    },
    {
      id: "coupang-t21",
      q: "Two 2024 cuts: WHERE STRFTIME('%Y', created_at) = '2024' versus WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'. Why does the db team standardize on the range form?",
      a: "Because the range form is sargable — the planner serves it from an index on created_at as one contiguous range — while the wrapped form must evaluate STRFTIME per row over the whole table, turning the index into decoration. Same rows, opposite cost curves: the wrapped scan's price grows with the table, and an order stream grows every day. The discipline generalizes: keep predicates on the raw column and push the transformation into the constants — the range form literally encodes the year — which is the same rule that bans LOWER(email) lookups and CAST-wrapped comparisons on hot paths. When a transformation is unavoidable, pay for it once: a computed column or a nightly pre-bucketed spine, so the scan tax is not re-charged on every dashboard refresh.",
      tag: "indexes",
    },
    {
      id: "coupang-t22",
      q: "Why can't WHERE RANK() OVER (…) <= 3 ship, and what does the CTE staging buy beyond making it compile?",
      a: "The grammar forbids window functions in WHERE because windows evaluate over the post-WHERE row set — letting them in would make the set they measure depend on the filter itself, a circular definition. The idiom stages it: WITH ladder AS (SELECT p.name, SUM(oi.quantity) AS units, RANK() OVER (ORDER BY SUM(oi.quantity) DESC) AS rnk FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id) SELECT * FROM ladder WHERE rnk <= 3. The staging buys more than compilation: the CTE is inspectable — run it and see all 16 rungs, the two-way tie at 36 and the three-way tie at 30 — the rank policy lives in one visible place, and the outer filter is a plain row filter the engine optimizes normally. The anti-pattern it replaces, LIMIT with a fudge factor, is how tie-blind dashboards ship.",
      tag: "subqueries",
    },
    {
      id: "coupang-t23",
      q: "Walk me through your ten-minute morning ritual on this storefront db — what runs, in what order, and what incident does each step catch?",
      a: "One scan, four reads, in dependency order. First the census: the one-pass FILTER fold must reconcile 52 + 30 + 14 + 7 = 103 — any branch off 103 is a data incident, not a rounding note, and everything downstream inherits its population. Second the queue trend: pending depth by day via LAG — the 14 queued orders are the dawn promise's backlog, and two days of growth pages ops before the standup. Third the clock: dispatch latency over the 82 stamped orders against the 2.98-day norm, cut by market (2.93 to 3.5) — a drift here is a courier-mix call, not a chart note. Fourth the money: the dunning anti-join (6 statements, 15,217) and the trial balance identity (181,080 against 181,080) — the close's prerequisites. The order matters because each read assumes the previous one reconciled; the ritual's output is either four green numbers or the exact query that finds the diff.",
      tag: "quality",
    },
    {
      id: "coupang-t24",
      q: "The demand spine walks 14 months of GMV with LAG deltas. What does the walk show, and what are the two LAG disciplines the interview grades?",
      a: "The walk: 2024-01 opens at 3,731.97 over 8 orders, drifts down a stair to the 1,193.86 July trough (delta −853.57), jumps +1,158.21 into August's 2,352.07, and lands at 2,390.53 by 2025-02 — 14 buckets, trough named, jump named. Discipline one: the first row's delta is NULL by definition — the baseline, reported as baseline, never coalesced to zero, which would read as a flat month and invite a false 'no growth' call. Discipline two: the walk's grain is the month, so the window orders by the month key — STRFTIME '%Y-%m', not '%m', which merges the two Januarys — and LAG defaults to the immediately preceding row, so an inserted gap silently compares across it. The caveat a strong candidate volunteers: deltas over 6–9 order months are noisy, which is why the walk names the trough and the jump instead of fitting a trend line through 14 points.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "coupang-mcq-1",
      prompt: "A Rocket order's status reads 'shipped'. In this kit's Coupang stage map, what happened?",
      choices: ["Out-for-dawn-dispatch — stamped, not yet at the door", "Rocket-arrived — the promise completed", "Aborted — cancelled before dispatch", "Sitting in the fulfillment queue"],
      answer: 0,
      why: "The stage map is fixed: shipped = out-for-dawn-dispatch (30 of 103, 29.1%) with shipped_at as the dispatch stamp. The order has left the fulfillment center but has not arrived.",
      notes: [
        { choice: 1, why: "Arrived is 'delivered' — 52 orders, 50.5%. Calling the 30 dispatched orders arrived inflates the arrival rate by nearly ten points before a single doorbell rings." },
        { choice: 3, why: "Queued is 'pending' — 14 orders with no shipped_at at all. Pending is pre-dispatch; shipped means the stamp exists." },
      ],
      difficulty: "easy",
    },
    {
      id: "coupang-mcq-2",
      prompt: "Rocket arrival rate is delivered orders ÷ which population? The db holds 52 delivered, 30 shipped, 14 pending and 7 cancelled of 103 placed.",
      choices: ["Delivered + shipped only (52/82 = 63.4%)", "All Rocket orders placed (52/103 = 50.5%)", "Dispatched orders only (52/30)", "Distinct WOW members (52/16)"],
      answer: 1,
      why: "The house definition: arrived ÷ ALL orders placed — queue rows and aborts stay in the denominator because 'did the promise hold' is asked about every order taken. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 21 unstamped orders inflates the rate to 63.4% by deleting exactly the rows whose fate the metric exists to watch — queue and aborts are outcomes, not noise." },
        { choice: 2, why: "52/30 is not a rate — it compares one funnel stage to a different stage's count. Ratios need numerator nested inside denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "coupang-mcq-3",
      prompt: "EU carries 45 Rocket orders from 8 WOW members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(customer_id)", "COUNT(*) and COUNT(DISTINCT customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 1,
      why: "COUNT(*) counts order rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 orders per member — is the intensity read.",
      notes: [
        { choice: 0, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every order has a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not members — a third grain nobody asked for. The census is orders AND members." },
      ],
      difficulty: "easy",
    },
    {
      id: "coupang-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled orders only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abort share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 8.1 and a displayed 8 — or 0, once the map goes regional and small bases truncate hardest.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the abort map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-5",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending orders double-counted their order day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 orders.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-6",
      prompt: "The units ladder reads 47, 46, 38, 36, 36, 33, 31, then THREE listings tied at 30. Under RANK, what rank does the next listing (28 units) carry?",
      choices: ["9", "11", "8", "10"],
      answer: 1,
      why: "RANK shares rungs and then skips: the three 30-unit listings occupy ranks 8, 8, 8, so the next distinct count lands on 11 — three phantom rungs are consumed by the tie. That is RANK semantics on this db's real ladder.",
      notes: [
        { choice: 0, why: "9 is the DENSE_RANK answer — shared rungs without gaps. The published board policy is RANK, gaps included." },
        { choice: 2, why: "8 is the tie's rank, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-7",
      prompt: "The settlement coverage split reads 21 exact, 1 partial, 6 never-settled. What query shape produces the 'partial' class?",
      choices: ["invoices INNER JOIN payments WHERE status = 'partial'", "invoices LEFT JOIN grouped payments, then CASE: paid = amount, paid > 0 and < amount → partial, NULL → none", "COUNT of payments rows per seller", "invoices WHERE amount_cents % 100 = 0"],
      answer: 1,
      why: "Coverage is a LEFT JOIN folded to payments per statement, then CASE-classified: exact when settled equals claimed, partial when some but not all settled (statement #25: 4,000 of 6,148), none when no payment rows exist. The claim column never drives the class — the payment rows do.",
      notes: [
        { choice: 0, why: "There is no 'partial' status to filter on — partiality is derived from money, not claimed. INNER also drops the 6 never-settled statements, the class the dunning list exists for." },
        { choice: 2, why: "Payments-per-seller counts rails activity, not statement coverage — the wrong grain entirely. Coverage is per invoice, folded over ITS payment rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-8",
      prompt: "A staging-table dunning list uses seller_id NOT IN (SELECT seller_id FROM settlements WHERE status = 'open') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL seller_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the dunning list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every settlement carries a seller_id. But staging tables are exactly where NULLs sneak in, and empty dunning lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "coupang-mcq-9",
      prompt: "A board packet stacks arrived orders under dispatched orders in one layout, built with UNION. A reviewer says one market's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same market, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same market, same counts, no stage label — collapse into one, and the board loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "coupang-mcq-10",
      prompt: "A dashboard walks GMV order by order: SUM(total) OVER (ORDER BY created_at). Two orders share a created_at second, and the cumulative 'jumps two orders at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at order grain on a dawn network they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "coupang-mcq-11",
      prompt: "The ops board folds each dispatch day's order lines into one manifest cell: GROUP_CONCAT(p.name) over the day's joined lines. A listing arrives with a NULL name in the staging feed. What does the manifest print?",
      choices: ["The cell skips the NULL listing silently — GROUP_CONCAT drops NULLs instead of printing them", "The whole query errors — GROUP_CONCAT rejects NULL inputs", "The NULL prints as the literal string 'NULL' between the other names", "The cell becomes NULL because one input was NULL"],
      answer: 0,
      why: "GROUP_CONCAT skips NULL inputs — the manifest prints the day's remaining names with no gap, no error and no marker where the missing listing should be. That is the trap: a half-empty manifest looks complete. If the gap must be visible, coalesce the name to a sentinel like '(unnamed listing)' BEFORE the fold.",
      notes: [
        { choice: 2, why: "Substituting the literal is what a CONCAT wrapper might do in another engine — here the aggregate skips, and the silent gap is exactly the failure mode being tested." },
        { choice: 3, why: "NULL contagion is SUM's cousin behavior — GROUP_CONCAT aggregates by skipping NULLs, so one NULL input does not poison the cell." },
      ],
      difficulty: "easy",
    },
    {
      id: "coupang-mcq-12",
      prompt: "COUNT(*) over orders reads 103; COUNT(shipped_at) reads 82. What is the 21, in this kit's stage map?",
      choices: ["The 14 pending queue orders plus the 7 aborted orders — every order with no dispatch stamp", "The 30 shipped orders double-counted", "The 7 aborted orders only", "The 16 WOW members who never placed an order"],
      answer: 0,
      why: "COUNT(shipped_at) counts non-NULL stamps — the 82 dispatched orders. The gap to COUNT(*) is exactly the 21 unstamped rows: 14 pending in the fulfillment queue plus 7 aborted. Reading the gap as a population definition — not a data error — is the habit the census grades.",
      notes: [
        { choice: 2, why: "The 7 aborted are only part of the gap — the 14 queued orders carry no stamp either. Calling half the gap the whole gap is the classic misread." },
        { choice: 3, why: "Every one of the 16 members has ordered somewhere — the never-ordered anti-join returns a confident zero. Members are not in this gap at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "coupang-mcq-13",
      prompt: "A market's queue arm reads SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END). The cross-border lane has zero pending Rocket orders. What prints?",
      choices: ["0 — the ELSE 0 arm prints the empty bucket honestly", "NULL — no rows matched the CASE's THEN branch", "The market's row disappears from the census", "The query errors on the empty bucket"],
      answer: 0,
      why: "The CASE evaluates per row and the ELSE 0 keeps every row contributing — a market with no pending orders folds to a clean 0 beside its other stages. That zero bucket is the point: a census where 'none' prints as a dash or NULL stops reconciling to 103 by construction.",
      notes: [
        { choice: 1, why: "SUM over zero matching rows still sums the ELSE 0s — the arm never sees NULL, because ELSE 0 guarantees a value on every row." },
        { choice: 2, why: "GROUP BY keeps every market group regardless of arm values — dropping rows on an empty bucket is a WHERE mistake, not aggregation behavior." },
      ],
      difficulty: "easy",
    },
    {
      id: "coupang-mcq-14",
      prompt: "The July dawn-window cut reads WHERE created_at BETWEEN '2024-07-01' AND '2024-07-31'. Which orders silently drop?",
      choices: ["Orders placed on July 31 after midnight — '2024-07-31 18:40:11' compares greater than the bare date '2024-07-31'", "Orders placed on July 1 at 00:10", "None — BETWEEN keeps the whole boundary day", "All of July — BETWEEN cannot filter TEXT timestamps"],
      answer: 0,
      why: "created_at carries a time component, so '2024-07-31 18:40:11' > '2024-07-31' lexicographically and fails the upper bound — the month's last evening vanishes while the fold still balances. The half-open form (>= '2024-07-01' AND < '2024-08-01') keeps the boundary day by construction.",
      notes: [
        { choice: 1, why: "The lower edge is inclusive and safe — '2024-07-01 00:10' >= '2024-07-01' passes. The seam is always at the UPPER bound." },
        { choice: 3, why: "ISO text compares perfectly well with BETWEEN — that is exactly why the bug is silent rather than loud." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-15",
      prompt: "A fulfillment analyst runs SELECT p.name, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id LIMIT 1 and reads out 'our top seller'. What is wrong?",
      choices: ["LIMIT without ORDER BY returns an arbitrary group — the 'top seller' is whichever group the scan emitted first, and it can change between runs", "LIMIT 1 always returns the lowest product id", "The GROUP BY must be p.name for LIMIT to work", "Nothing — the engine sorts by units automatically before LIMIT"],
      answer: 0,
      why: "LIMIT caps rows; it never ranks them. Without ORDER BY units DESC the single row is whatever the grouping handed back first — on this db that could be any of the 16 listings, from the real leader (Desk Mat Extended, 47 units) down to a 21-unit tail. The dashboard ships a random listing wearing a crown.",
      notes: [
        { choice: 1, why: "Row order is not id order without a sort — and even 'first id' is an accident of the query plan, not a guarantee." },
        { choice: 3, why: "Nothing sorts implicitly before LIMIT in SQL — that mental model is precisely how the bug ships to production." },
      ],
      difficulty: "easy",
    },
    {
      id: "coupang-mcq-16",
      prompt: "The morning census uses COUNT(*) FILTER (WHERE o.status = 'delivered') beside three sibling FILTER arms over the same scan. What identity must the four arms satisfy, and why does the one-pass form earn its keep?",
      choices: ["The arms must reconcile to COUNT(*): 52 + 30 + 14 + 7 = 103 by construction — one scan, four labelled arms that cannot drift", "Each arm must equal 25 — the four stages split the network evenly", "FILTER arms must be rewritten as UNION branches to be valid SQL", "The identity only holds when the arms run in four separate queries"],
      answer: 0,
      why: "Every Rocket order is in exactly one status, so the four conditional arms partition COUNT(*) — on this db 52 arrived + 30 dispatched + 14 queued + 7 aborted = 103. One scan makes the identity structural: an arm that drifts is a visible bug. Four separate queries can each be right and still disagree — the drift itself is the incident.",
      notes: [
        { choice: 1, why: "Equal quarters is fiction — the network runs 50.5% arrived and 29.1% dispatched. The identity is about the SUM, not symmetry." },
        { choice: 2, why: "FILTER (WHERE …) is standard SQL that SQLite supports natively — portability is not the reason for the one-pass form; reconciliation is." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-17",
      prompt: "After joining orders to order_items, an analyst's 'orders per market' census reads 251 for the network. The true number is 103. What happened?",
      choices: ["The join fanned orders out to their lines — COUNT(*) counts 251 order lines, and COUNT(DISTINCT o.id) is the census that folds back to 103 orders", "251 is correct — the network has 251 orders", "The join dropped rows; COUNT(DISTINCT o.id) would lose data", "COUNT(DISTINCT o.id) also returns 251"],
      answer: 0,
      why: "103 orders fan out to 251 order lines — 2.44 lines per order on average. After the join, COUNT(*) counts lines: the census silently changed grain. COUNT(DISTINCT o.id) folds the fan-out back to one row per order, and the pair side by side — 251 lines, 103 orders — is the diagnosis.",
      notes: [
        { choice: 2, why: "The fan-out is duplication, not loss — the INNER join keeps every line; the fix is folding the count, not changing the join type." },
        { choice: 3, why: "DISTINCT o.id collapses the 251 line rows onto their 103 parent orders — that is precisely its job in a joined census." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-18",
      prompt: "The settlement fold reads COALESCE(SUM(p.amount_cents), 0). A reviewer suggests SUM(COALESCE(p.amount_cents, 0)) instead. What changes?",
      choices: ["Nothing good: SUM already skips NULLs, and the guard belongs OUTSIDE the fold — statements with zero legs fold to NULL, and only the outer COALESCE turns that into the honest 0 the coverage split needs", "The inner COALESCE is strictly safer — always guard inputs", "Both forms return NULL for never-settled statements", "The inner form errors when no payment rows exist"],
      answer: 0,
      why: "SUM ignores NULL inputs and returns NULL when it receives none — a statement with no legs folds to NULL, not zero. COALESCE outside the fold converts that empty-fold NULL to 0; wrapping each input inside is a no-op for SUM's arithmetic and leaves the empty-fold NULL standing. On this db the six never-settled statements (15,217 claimed) must print 0 settled — not a NULL the coverage CASE cannot classify.",
      notes: [
        { choice: 2, why: "The inner guard does nothing here — SUM's NULL-skipping already covers it, and the empty-fold NULL survives untouched." },
        { choice: 3, why: "No error anywhere — the empty fold returns NULL quietly, which is precisely why the outer COALESCE is load-bearing." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-19",
      prompt: "SELECT region FROM <markets with a delivered order> EXCEPT SELECT region FROM <markets with a cancelled order>. On this db, what survives?",
      choices: ["LATAM only — 2 delivered orders, 0 cancellations, and no other market qualifies", "EU, APAC and US — the markets with cancellations", "All four markets — EXCEPT keeps both sides", "No rows — every market has both stages"],
      answer: 0,
      why: "EXCEPT keeps the left side minus the right. Delivered covers all four buckets; cancelled covers EU (3), APAC (3) and US (1) — so only LATAM, with 2 clean deliveries and zero refusals, survives. The same answer a conditional count gives, but as a SET: no shares, no denominators, just membership — and LATAM's 2-order base means the spotless record is a tail, not a trend.",
      notes: [
        { choice: 1, why: "That is the RIGHT side of the EXCEPT — the set being subtracted, not the result." },
        { choice: 3, why: "EXCEPT is asymmetric, not an INTERSECT — what matters is who ALSO has a cancellation, not who has delivered rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "coupang-mcq-20",
      prompt: "The correlated cut keeps only orders above THEIR market's average basket; the platform cut keeps total > 338.19. Which orders change status between the two, on this db's market AOVs (EU 335.32, APAC 313.66, US 383.48, LATAM 426.22)?",
      choices: ["Mid-basket US-bucket orders between 338.19 and 383.48: the US market's average sits ABOVE the platform mean, so they clear the platform bar but fail their own market's — while APAC's 313.66 bar rescues orders the platform cut refused", "Nothing changes — the two queries are identical", "Every market's biggest basket drops out", "Only LATAM changes — its 426.22 average is the highest"],
      answer: 0,
      why: "The comparison population moved from platform (338.19) to market. The US bucket's 383.48 is the only big-market average above the platform mean, so its 338.19-to-383.48 orders flip from above-average to not — while APAC's 313.66 bar is easier to clear, flipping some APAC orders the other way. Same predicate shape, different question: 'above average overall' versus 'above average where I sell'.",
      notes: [
        { choice: 1, why: "The correlated cut re-runs per outer row and answers a different question — that is the point, not a null difference." },
        { choice: 3, why: "LATAM's 426.22 is the fattest average, so its bar is HIGHEST — but with 2 orders the change is a rounding footnote, not the story." },
      ],
      difficulty: "hard",
    },
    {
      id: "coupang-mcq-21",
      prompt: "Per-market AOVs read EU 335.32, APAC 313.66, US 383.48, LATAM 426.22 — their simple average is 364.67, but the network AOV is 338.19. Which number belongs on the market P&L, and why?",
      choices: ["338.19 — the pooled order-weighted mean: SUM(total)/COUNT(*), where a 45-order market weighs twenty-two times a 2-order lane; 364.67 weights every market equally", "364.67 — the average of market averages is always the honest network read", "338.19 — because the P&L computes over delivered orders only", "364.67 — it equals SUM(total)/COUNT(DISTINCT region)"],
      answer: 0,
      why: "The network AOV must answer 'what does the average Rocket order look like' over all 103 orders — the pooled 338.19. The 364.67 average-of-averages gives the 2-order cross-border lane the same weight as the 45-order EU market, which is a statement about markets, not orders. Both are computable; only one is the metric the P&L names — and stating WHICH one you computed is the interview answer.",
      notes: [
        { choice: 1, why: "Average-of-averages answers 'what does the average MARKET look like' — a different question that happens to look similar." },
        { choice: 2, why: "The P&L AOV runs over placed orders, all 103 — a delivered-only cut (52 orders) moves the number and changes its name." },
      ],
      difficulty: "hard",
    },
    {
      id: "coupang-mcq-22",
      prompt: "A dashboard tile titled 'Rocket orders' prints 251. The fulfillment census says 103. Which query diagnoses it in one scan?",
      choices: ["SELECT COUNT(*), COUNT(DISTINCT o.id) FROM orders o JOIN order_items oi ON oi.order_id = o.id — 251 versus 103 proves the line-item fan-out", "SELECT MAX(total) FROM orders — a fat basket is inflating the count", "SELECT COUNT(*) FROM order_items alone — comparing it to 251", "VACUUM the db and re-run the tile"],
      answer: 0,
      why: "The tile's fold almost certainly joined order_items for revenue and counted rows — 251 lines wearing an orders title. The two-count query is the diagnosis: COUNT(*) reads the joined grain (251), COUNT(DISTINCT o.id) reads the order grain (103), and the gap is the fan-out. The fix is the title or the count — one of them is lying.",
      notes: [
        { choice: 1, why: "A basket skews SUM(total), not COUNT — the wrong instrument entirely." },
        { choice: 2, why: "order_items alone has exactly 251 rows — the match CONFIRMS the fan-out but never locates the tile's bug; the joined two-count does." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-23",
      prompt: "Two listings sit tied at 36 units (Laptop Stand Aluminum, Wireless Mouse M3). ORDER BY units DESC LIMIT 1 — which one does the best-seller tile print?",
      choices: ["Whichever one the engine's scan order emits first — the tie is broken by accident, not policy", "Laptop Stand Aluminum — ties resolve alphabetically by default", "Both — LIMIT 1 returns both tied rows", "Neither — LIMIT 1 errors on ties"],
      answer: 0,
      why: "LIMIT 1 on a tie returns an arbitrary member — no alphabetical rescue, no both-rows courtesy. The 47-unit leader is unambiguous; the 36-unit tie is where policy lives: name the tie-breaker (units DESC, then listing name ASC) or use a window rank with an explicit rule, and write the rule where the next analyst finds it.",
      notes: [
        { choice: 1, why: "Alphabetical order only applies if you ORDER BY name as the tie-breaker — without it, nothing promises alphabetical anything." },
        { choice: 2, why: "LIMIT 1 returns exactly one row, always — ties make it arbitrary, not plural." },
      ],
      difficulty: "easy",
    },
    {
      id: "coupang-mcq-24",
      prompt: "Two cuts of 2024 Rocket orders: WHERE STRFTIME('%Y', created_at) = '2024' versus WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'. Same rows — what is different, and why does the db team care?",
      choices: ["The range form is sargable — it can use an index on created_at; wrapping the column in STRFTIME forces a full scan computing the function per row, and on an order stream that grows daily the scan tax compounds", "They differ in results at month boundaries", "STRFTIME is faster because it precomputes the year", "Both prevent index use — TEXT timestamps are unindexable"],
      answer: 0,
      why: "An index on created_at serves range predicates on the raw column; wrap the column in a function and the planner must evaluate STRFTIME per row across the whole table — the index is dead. Same rows, wildly different cost profile as the stream grows. The habit: keep the predicate on the column, push the transformation into the constants (the range form literally encodes the year).",
      notes: [
        { choice: 2, why: "STRFTIME runs per input row — it is the opposite of precomputation." },
        { choice: 3, why: "TEXT ISO timestamps index beautifully — lexicographic order IS chronological order; the wrapper, not the type, kills the index." },
      ],
      difficulty: "hard",
    },
    {
      id: "coupang-mcq-25",
      prompt: "Every cents value on today's settlement book is a whole-dollar multiple (1,756.00, 6,148.00...), so amount_cents / 100 happens to print the right dollars. Why does the house still write amount_cents / 100.0?",
      choices: ["Because the discipline must survive what staging tables import: the first odd-cent leg (say 1,756.37) turns /100 into silent truncation — 37 cents that nobody can find", "100.0 is faster than 100 in SQLite", "/100 errors on INTEGER columns", "The .0 is a style preference for REAL output"],
      answer: 0,
      why: "Integer division truncates toward zero — invisible while cents divide evenly, wrong the moment one leg doesn't. The .0 promotes real arithmetic BEFORE the division, a property of the expression, not of today's data. Settlement math that only works on clean inputs is not settlement math; it is a bet.",
      notes: [
        { choice: 2, why: "The cost difference is nil — the point is arithmetic type, not speed." },
        { choice: 3, why: "Output style can be fixed with ROUND at the end; truncation DURING the division loses cents before any rounding can save them." },
      ],
      difficulty: "easy",
    },
    {
      id: "coupang-mcq-26",
      prompt: "The GL close checks SELECT ROUND(SUM(debit_cents)/100.0,2), ROUND(SUM(credit_cents)/100.0,2) FROM ledger_entries. What must it print for the settlement close to ship, and what does a delta mean?",
      choices: ["181,080 against 181,080 — delta zero; a non-zero delta means an entry posted to one side only, and no number derived from the GL ships until it is found", "181,080 against 86,052 — cash reconciles to AR", "Any two numbers — the trial balance only checks that entries exist", "The delta must equal 69,612 — the settled legs"],
      answer: 0,
      why: "Double-entry demands every cent appear on both sides: 80 ledger entries, 181,080 debits, 181,080 credits, delta zero. The delta is not a rounding note — it is a posted-once error hunting for its twin, and the close does not ship while it exists. The per-account roll (AR 86,052/69,612, cash 69,612/25,416) is the second read — where the money moved, after the identity proves the books balance.",
      notes: [
        { choice: 1, why: "86,052 is AR's debit leg and 69,612 the settled legs — real numbers, wrong identity. The trial balance compares total debits to total credits, not account to account." },
        { choice: 3, why: "69,612 is the card+wire settlement total — it appears inside the ledger but says nothing about the balance identity." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-27",
      prompt: "The 14-month GMV walk computes ROUND(gmv - LAG(gmv) OVER (ORDER BY month), 2). January 2024's delta prints NULL. A stakeholder asks you to 'fix' it to 0. What do you say?",
      choices: ["NULL IS the baseline — there is no prior month to diff against; coalescing to 0 reads as a flat month and invites a false 'no growth' conclusion, so label it baseline instead", "Coalesce to 0 — NULLs break dashboards", "Coalesce to the January GMV — that is the true growth", "Drop January from the walk entirely"],
      answer: 0,
      why: "LAG on the first row of a partition has no prior value — NULL is the mathematically honest answer, and it means 'baseline', not 'missing'. Coalescing to 0 makes January look like a month with zero growth; coalescing to GMV invents a 100% jump. The fix is presentation — label the cell baseline — never arithmetic that fabricates a delta.",
      notes: [
        { choice: 2, why: "gmv - gmv = 0 — the same flat-month lie with extra steps." },
        { choice: 3, why: "The baseline month is the anchor every later delta diffs against — dropping it orphans the walk's meaning." },
      ],
      difficulty: "hard",
    },
    {
      id: "coupang-mcq-28",
      prompt: "SELECT region, SUM(total) AS gmv FROM orders o JOIN customers c ON c.id = o.customer_id WHERE gmv > 500 GROUP BY region — what happens, and where does the filter belong?",
      choices: ["It errors: aliases are born in SELECT and evaluated after WHERE — the pipeline hasn't produced gmv yet; a group-level revenue floor belongs in HAVING (or a derived table), while a per-row floor (total > 500) belongs in WHERE", "It returns markets with gmv > 500 — SQLite resolves aliases everywhere", "It silently returns zero rows", "GROUP BY must come before WHERE for the alias to exist"],
      answer: 0,
      why: "The pipeline runs FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY; the alias gmv materializes at SELECT, so WHERE cannot see it — engines reject it, and 'it works' in a lenient one is still a portability trap. The floor over a SUM is a group fact: HAVING SUM(o.total) > 500. A floor on one order's total is a row fact: WHERE o.total > 500. Two different filters that look like siblings.",
      notes: [
        { choice: 2, why: "A silent empty result would require a three-valued comparison — here the reference itself does not exist at WHERE time." },
        { choice: 3, why: "Reordering clauses isn't styling — WHERE before GROUP BY is the grammar, and the alias clock is exactly why." },
      ],
      difficulty: "medium",
    },
    {
      id: "coupang-mcq-29",
      prompt: "WHERE RANK() OVER (ORDER BY SUM(oi.quantity) DESC) <= 3 — the top-3 ladder filter. What happens and what is the fix?",
      choices: ["It errors — window functions evaluate after WHERE and are banned there; stage the ranked rows in a CTE or derived table, then filter on the rank column in the outer query", "It works and returns the top 3 rungs", "It works but only marks the top 3 rows", "It returns the bottom 3 — window ranks invert inside WHERE"],
      answer: 0,
      why: "Windows run over the post-WHERE, post-GROUP-BY row set — letting them into WHERE would change the set they measure, so the grammar forbids it. The idiom is staging: WITH ladder AS (SELECT … RANK() OVER … AS rnk …), then SELECT … WHERE rnk <= 3. The staging is not ceremony — it is what makes 'rank the folds, then keep a rung window' a well-defined pipeline.",
      notes: [
        { choice: 2, why: "If an engine tolerated it, the semantics would still be undefined — the mark of a bug, not a feature." },
        { choice: 3, why: "Direction lives in the OVER's ORDER BY, not the WHERE — filters do not invert window results." },
      ],
      difficulty: "hard",
    },
    {
      id: "coupang-mcq-30",
      prompt: "Abort shares by market read APAC 3/37, EU 3/45, US 1/19, LATAM 0/2. Which market tops the abort map, and what caveat does a strong candidate attach?",
      choices: ["APAC at 8.1% — the home-turf bucket refuses most; but shares ride on bases, so the map must print the refused count AND the base beside the rate", "EU at 6.7% — the biggest market is automatically the worst", "LATAM at 0% — a spotless record is the headline", "US at 5.3% — the smallest big-market base is the safest"],
      answer: 0,
      why: "3/37 = 8.1% beats EU's 3/45 (6.7%) and US's 1/19 (5.3%) — the same refusal count as EU on a smaller base. The caveat is the discipline: percentages inherit their bases, and the decision needs both columns printed. A map that shows 8.1 without the 37 invites a nudge experiment sized off a number nobody can audit.",
      notes: [
        { choice: 2, why: "LATAM's zero rides on 2 orders — the spotless record is statistically a coin flip, which is exactly why the base prints beside the share." },
        { choice: 1, why: "EU is the biggest market but not the worst rate — comparing raw counts (3 vs 3) across different bases is the error the share exists to prevent." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-coupang-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The Rocket-badge seller bench",
      brief:
        "Coupang-flavored brief on the storefront db: the marketplace pod's monthly seller audit opens with the Rocket-badge bench — sellers rated 4.5-plus keep the fast badge, and the audit reads their listings and settled revenue side by side. Probed facts: the six-seller fold reads Nordic Gadgets AB 4.6 / 3 listings / 11,130.25, Midwest Hardware Co 4.4 / 3 / 9,294.93, Alpine Audio GmbH 4.8 / 2 / 4,765.63, Andes Naturals SA 4 / 2 / 3,613.25, Shenzhen Electro 4.1 / 3 / 3,049.07, Pacific Textiles 3.9 / 3 / 2,980.15 — and the 4.5 floor keeps exactly 2 of 6 sellers, Nordic (32% of revenue) and Alpine (13.7%). Revenue folds from order lines: units × shelf price, rounded to cents.",
      ask: "Return each 4.5-plus seller with its rating, distinct listing count and total line revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name AS seller,\n       s.rating AS rating,\n       COUNT(DISTINCT {3}) AS listings,\n       ROUND(SUM({1}), 2) AS revenue\nFROM suppliers s\nJOIN products p ON p.{2} = s.id\nJOIN order_items oi ON oi.product_id = p.id\nWHERE s.rating >= {4}\nGROUP BY s.id\nORDER BY revenue {5};",
      slots: [
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the line-revenue fold",
          why: "Revenue is units × shelf price folded per line: SUM(oi.quantity * oi.unit_price) — Nordic lands at 11,130.25. SUM(oi.unit_price) alone prices one unit per line and SUM(oi.quantity) books units as won — both drift off the probed fold, rounded to cents.",
        },
        {
          answer: "supplier_id",
          kind: "keyword",
          label: "the seller join column",
          why: "p.supplier_id = s.id attaches each listing to its seller. p.id = s.id silently mismatches product ids to seller ids and still runs — a bench of nothing; p.seller_id and p.category error out outright.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the listing grain",
          why: "COUNT(DISTINCT p.id) counts listings, not demand lines: Nordic sells via 3 listings that fan out across many order lines. COUNT(DISTINCT oi.id) would report line counts and the bench would misread catalog breadth as demand.",
        },
        {
          answer: "4.5",
          kind: "number",
          noVerify: true,
          label: "the Rocket-badge rating floor",
          why: "The badge rule is fixed at 4.5: Nordic (4.6) and Alpine (4.8) clear it, Midwest (4.4) misses by a tenth — the floor keeps exactly 2 of 6 sellers. At 3.9 the bench admits Pacific Textiles, the weakest seller on the book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bench-first direction",
          why: "The audit reads the biggest settled seller on top: Nordic 11,130.25, then Alpine 4,765.63. ASC would open the review on the smallest bench member and the room reads the bench backwards.",
        },
      ],
      distractors: ["oi.unit_price", "oi.quantity", "ASC", "oi.id", "id", "3.9"],
      walkthrough:
        "Three tables, one fold, one gate. The join path is sellers → listings → order lines: p.supplier_id = s.id attaches each listing to its seller, oi.product_id = p.id attaches demand to each listing, and the 4.5 rating floor keeps exactly 2 of the 6 sellers — Nordic Gadgets AB (4.6) and Alpine Audio GmbH (4.8), the same two the badge slide names. COUNT(DISTINCT p.id) reads catalog breadth (3 and 2 listings), while ROUND(SUM(oi.quantity * oi.unit_price), 2) folds line revenue to cents: Nordic 11,130.25 — 32% of marketplace revenue — and Alpine 4,765.63, with Midwest Hardware Co (4.4) missing the badge by a tenth despite 9,294.93 in settled revenue. The distractors each break a different axis: SUM(oi.unit_price) prices one unit per line so revenue collapses; SUM(oi.quantity) books units as won; COUNT(DISTINCT oi.id) misreads demand lines as listings; id in the join silently mismatches product ids to seller ids and prints a bench of nothing; 3.9 admits Pacific Textiles, the weakest seller at 2,980.15; and ASC flips the read to smallest-first. The business read is concentration: Nordic alone is 32% and Alpine 13.7% of the book — the badge bench is the fast program's dependency map, and one seller's slip moves a third of it.",
    },
    {
      id: "cs-coupang-2",
      tier: "medium",
      topic: "t3",
      universe: "funnel",
      title: "The dawn-dispatch clock",
      brief:
        "Coupang-flavored brief on the storefront db: fulfillment ops opens every morning with the dawn-dispatch clock — per market, how many orders are stamped out-for-dispatch and how long order-to-dispatch runs. The population rule is stated on the slide: only the 82 orders carrying shipped_at have a cycle; the 14 queue orders (pending) and 7 aborted (cancelled) have none and must not dilute the average. Probed facts: platform latency reads 2.98 days average over a 2–4 spread, and the regional cut is APAC 29 dispatched at 2.93, EU 36 at 2.94, US 15 at 3.07, LATAM 2 at 3.5. Ops reads fastest market first.",
      ask: "Return each market with its dispatched order count and average order-to-dispatch days to 2 decimals, fastest market first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS dispatched,\n       ROUND(AVG(julianday(o.{1}) - julianday(o.created_at)), {2}) AS avg_dispatch_days\nFROM orders o\nJOIN customers c ON c.{3} = o.customer_id\nWHERE o.shipped_at IS {4} NULL\nGROUP BY c.region\nORDER BY avg_dispatch_days {5};",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the dispatch stamp",
          why: "julianday(o.shipped_at) - julianday(o.created_at) measures order-placed to out-for-dispatch. julianday(o.created_at) measures zero against itself and julianday(o.status) returns NULL — the clock would read 0 or nothing instead of 2.93 to 3.5.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the latency precision",
          why: "Latency prints to 2 decimals so the regional map reconciles with the 2.98 platform average: APAC 2.93 and EU 2.94 sit a hundredth apart — ROUND(…, 1) flattens both to 2.9 and the ranking loses its sharpest signal.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the member join column",
          why: "c.id = o.customer_id is the only grain match that attaches a Rocket order to its member's market. c.region or c.name matches text against member ids and the census empties before any fold happens.",
        },
        {
          answer: "NOT",
          kind: "keyword",
          label: "the stamped-orders guard",
          why: "shipped_at IS NOT NULL keeps the 82 stamped orders; dropping NOT flips the filter to IS NULL and the clock suddenly averages the 21 orders with no cycle — 14 pending plus 7 aborted — as if a queue row had a dispatch time.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the fastest-market-first direction",
          why: "Ops reads fastest first: APAC 2.93, EU 2.94, US 3.07, LATAM 3.5. DESC would open the morning review on the slowest market — a correct query pointed at the wrong end of the standup.",
        },
      ],
      distractors: ["created_at", "status", "region", "DESC", "IS"],
      walkthrough:
        "One join, one guard, one clock. The join attaches orders to members for the market fold; the WHERE keeps only the 82 stamped orders — the 21 unstamped (14 in the fulfillment queue, 7 aborted) never enter, which is why the slide states the population before the average. julianday(o.shipped_at) - julianday(o.created_at) is the order-to-dispatch cycle, and GROUP BY region folds it to four rows: APAC 29 dispatched at 2.93, EU 36 at 2.94, US 15 at 3.07, LATAM 2 at 3.5 — reconciling upward to the 2.98-day platform average over a 2–4 spread. The read is a Coupang signature: APAC and EU sit a hundredth apart at the front of the clock while the US trails at 3.07 — and with only 2 dispatched orders, LATAM's 3.5 is a tail, not a trend. The distractors fail honestly: created_at measures zero days against itself and every market reads 0; status feeds a non-date into julianday and the column goes NULL; region in the join matches text against member ids and the census empties; dropping NOT counts the queue as dispatched; IS flips it the same way; and DESC opens the review on the slowest market. Two grains carry the story — dispatched counts (29/36/15/2) beside cycle time (2.93/2.94/3.07/3.5) — speed AND volume, never one alone.",
    },
    {
      id: "cs-coupang-3",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass dawn census",
      brief:
        "Fulfillment brief on the storefront db, Coupang-flavored: the morning standup opens with the one-pass status census — one scan, four FILTER arms, and an identity that must hold before any other number is read: arrived + dispatched + queued + aborted = placed. Probed facts: the network census reads 52 delivered + 30 shipped + 14 pending + 7 cancelled = 103 by construction; by market the fold reads EU 24/12/6/3 on 45 placed, APAC 21/8/5/3 on 37, US 5/10/3/1 on 19, LATAM 2/0/0/0 on 2. The abort share rides on the PLACED base — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0 — and ops reads the worst share first, one decimal, because *a share without its base is a rumor*.",
      ask: "Return each market with its placed count, the four stage arms and abort share to 1 decimal — worst share first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS placed,\n       COUNT(*) FILTER (WHERE o.status = 'delivered') AS arrived,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS dispatched,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS queued,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS aborted,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), {3}) AS abort_pct\nFROM orders o\nJOIN customers c ON c.{4} = o.customer_id\nGROUP BY c.region\nORDER BY abort_pct {5};",
      slots: [
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the queue arm's literal",
          why: "Queued is status 'pending' — 14 network-wide (EU 6, APAC 5, US 3, LATAM 0). 'shipped' prints the dispatch stage into the queue column (12/8/10/0) and 'delivered' prints the arrival stage; either way the census stops describing the stage it claims and the 52+30+14+7 = 103 identity breaks visibly.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the abort arm's literal",
          why: "Aborted is status 'cancelled' — 7 network-wide, 1 in the US bucket, 0 cross-border — and the share's numerator folds the same 'cancelled' arm. 'pending' here would fold the fulfillment queue into the abort column and print refusal shares over 14 phantom refusals.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "The map quotes one decimal — 8.1 / 6.7 / 5.3 / 0 — reconciling with the 6.8% network share quoted two slides later. ROUND(…, 2) prints 8.11 and the map stops matching the deck; ROUND(…, 0) floors the map to integers and APAC's 8.1 separates from EU's 6.7 by nothing.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the member stitch",
          why: "c.id = o.customer_id attaches each Rocket order to its member's market bucket. c.region = o.customer_id compares region text against member ids — the join matches nothing and the census empties before any fold; o.customer_id = o.id pairs orders with whatever member shares their row id, and every market number is wrong with no error anywhere.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-share-first direction",
          why: "Ops reads the worst refusal market first: APAC 8.1, EU 6.7, US 5.3, LATAM 0. ASC opens the standup on the cross-border lane's spotless zero — a correct query pointed at the wrong end of the meeting.",
        },
      ],
      distractors: ["'shipped'", "'delivered'", "2", "region", "ASC"],
      walkthrough:
        "One scan, four arms, one identity. The stitch attaches every order to its member's market bucket and GROUP BY c.region folds 103 orders into four rows; the FILTER arms read EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0 — and each bucket's four stages sum to its placed count by construction (EU 24+12+6+3 = 45, APAC 21+8+5+3 = 37, US 5+10+3+1 = 19, LATAM 2 = 2), with the network cross-foot at 52+30+14+7 = 103. The share divides the cancelled arm by COUNT(*) — the PLACED base, never the delivered base — with 100.0 promoting real arithmetic before the division: 8.1 / 6.7 / 5.3 / 0, reconciling upward to the 6.8% network share. The read: APAC, the home-turf bucket, refuses most (8.1) on the second-biggest base — where the checkout-friction fix goes — while LATAM's spotless 0 rides on 2 orders, too small to trust. The distractors each break differently: 'shipped' and 'delivered' swap pipeline stages into the queue and abort columns; 2 re-keys the share to 8.11, a cell that reconciles with nothing; region in the stitch empties the fold; and ASC opens the standup on the cleanest market instead of the worst.",
    },
    {
      id: "cs-coupang-4",
      tier: "medium",
      topic: "t5",
      universe: "catalog",
      title: "The best-seller ladder and its tie",
      brief:
        "Merchandising brief on the storefront db, Coupang-flavored: the monthly best-seller board ranks Rocket listings by units moved, and the tie policy is a published decision, not a syntax choice — peer listings share rungs. Probed facts: the units ladder reads Desk Mat Extended 47, Noise-Canceling Headset 46, HDMI 2.1 Cable 2m 38, then a TWO-WAY tie at 36 (Laptop Stand Aluminum, Wireless Mouse M3), then 33 and 31, then a THREE-WAY tie at 30 (Fitness Band X2, Ring Light 14\", Studio Desktop Mic) — ties are guaranteed at listing grain on a 251-line, 16-listing book. The board's cut is 'top 4 rungs', which on a tie block returns FIVE listings — and the board says so on the slide.",
      ask: "Return the listings occupying the top 4 rungs under RANK with biggest-units-first, each with its units and rank.",
      template:
        "WITH ladder AS (\n  SELECT p.name AS listing,\n         SUM(oi.quantity) AS units,\n         RANK() OVER (ORDER BY SUM(oi.quantity) DESC) AS rnk\n  FROM order_items oi\n  JOIN products p ON p.{1} = oi.product_id\n  GROUP BY p.id\n)\nSELECT listing, units, rnk\nFROM ladder\nWHERE rnk <= {2}\nORDER BY units {3}, listing;",
      slots: [
        {
          answer: "id",
          kind: "keyword",
          label: "the listing stitch",
          why: "p.id = oi.product_id attaches each demand line to its listing. p.name = oi.product_id compares listing text against line ids — the ladder empties before any fold; a p.oi.id-style stitch references a column through the wrong alias and fails before a single rung is ranked.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the rung cutoff",
          why: "The board's cut is rank 4 — and on this db the cut returns FIVE listings, because Laptop Stand Aluminum and Wireless Mouse M3 share rank 4 at 36 units. A top-4 that means five rows is the tie policy made visible; under DENSE_RANK the same cutoff still returns five, but the shared rung reads differently downstream.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first read",
          why: "The board reads the 47-unit leader first, then 46, 38, then the 36-unit pair side by side. ASC opens on the tail and the merchandising slot decision inverts — the same rows, aimed at the wrong end of the meeting.",
        },
      ],
      distractors: ["ASC", "name", "3", "oi.id"],
      walkthrough:
        "Rank the folds, then keep a rung window. The CTE folds 251 order lines to one units figure per listing — one row per LISTING, not per line, which is the first grain call — and RANK() OVER (ORDER BY units DESC) stamps the rungs: 1, 2, 3, 4, 4, 6, 7, 8, 8, 8 for the ladder's top. The outer filter keeps rnk <= 4 and returns five rows: Desk Mat Extended 47 at rank 1, Noise-Canceling Headset 46 at 2, HDMI 2.1 Cable 2m 38 at 3, and the 36-unit pair — Laptop Stand Aluminum and Wireless Mouse M3 — both at rank 4. That fifth row is the story: a LIMIT-4 query would silently drop one tied listing, and which one it drops is an accident of scan order, not a policy. RANK shares the rung and skips to 6 next; DENSE_RANK would hand the next distinct count rung 5; ROW_NUMBER would split the tie arbitrarily. The three-way tie at 30 two rungs later is the reason the policy is written down: a board that resolves ties by scan order reshuffles between runs, and merchandising slots are real revenue. The distractors each break differently: ASC reads the board from the tail; name in the stitch empties the fold; 3 trims the tie block off the result entirely; and oi.id through the p. alias is a syntax error before any ranking happens.",
    },
    {
      id: "cs-coupang-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The demand spine walk",
      brief:
        "Growth brief on the storefront db, Coupang-flavored: the 14-month demand spine (2024-01 to 2025-02) is the growth call's home turf — per-month Rocket orders and GMV with LAG deltas, trough and jump named. Probed facts: the spine opens at 3,731.97 over 8 orders in January 2024, drifts down a stair of −122.33, −992.56, −148.17, +441.40, −862.88 to the 1,193.86 July trough (delta −853.57), jumps +1,158.21 into August's 2,352.07, and lands at 2,390.53 over 7 orders in February 2025; monthly order counts run 6 to 9. The walk's population floor keeps months carrying at least six placed orders — every bucket clears it — and the first delta is NULL by definition: the baseline, never a zero.",
      ask: "Return the 14-month spine — month, placed orders, GMV to 2 decimals and month-over-month delta to 2 decimals — in calendar order.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME('%Y-%m', o.created_at) AS month,\n         COUNT(*) AS placed,\n         SUM(o.total) AS gmv\n  FROM orders o\n  GROUP BY month\n  HAVING COUNT(*) >= {1}\n)\nSELECT month,\n       placed,\n       ROUND(gmv, 2) AS gmv,\n       ROUND(gmv - LAG({2}) OVER (ORDER BY {3}), 2) AS delta\nFROM spine\nORDER BY month;",
      slots: [
        {
          answer: "6",
          kind: "number",
          label: "the month floor",
          why: "The spine's floor keeps months carrying at least six Rocket orders — on this db every one of the 14 buckets clears it (6 to 9), so the walk is complete. Push the floor to 9 and only September survives, and the LAG deltas recompute over one row — NULL everywhere. The floor lives inside the CTE so the window measures the population it reports.",
        },
        {
          answer: "gmv",
          kind: "keyword",
          label: "the walked measure",
          why: "The demand story walks GMV: gmv - LAG(gmv) per month. LAG(placed) walks order counts instead — a different board; LAG over a column the spine does not carry errors out, because the CTE exposes only the folded measure, not the raw column.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the walk's order key",
          why: "LAG must follow the month key — ORDER BY month inside the OVER. Order by placed or GMV and the deltas compare non-adjacent months; the walk becomes a scatter wearing a trend's title.",
        },
      ],
      distractors: ["status", "orders", "memo", "DESC"],
      walkthrough:
        "Stage the spine, then walk it. The CTE buckets 103 orders into 14 months with STRFTIME('%Y-%m', …) — year plus zero-padded month, because '%m' alone merges the two Januarys — folds placed counts (6 to 9 per month) and GMV, and the HAVING floor inside the CTE keeps months with at least six placed orders; every bucket clears it, so the walk is the full 14 rows. The outer query subtracts LAG(gmv) from gmv, ordered by month: 3,731.97 opens with a NULL delta — the baseline, reported as baseline — then −122.33, −992.56, −148.17, +441.40, −862.88 down to the 1,193.86 July trough (delta −853.57), then the +1,158.21 jump into August's 2,352.07, and a stair that lands at 2,390.53 in February 2025. The read: the trough and the jump are the two cells the growth call names — a July that books barely a third of January, then a recovery month that nearly doubles — while the 6-to-9 order counts explain why the deltas are stair-sized, not cliff-sized. The distractors each break differently: status in the floor compares a count against text and the spine empties; orders, memo and the direction keyword reference nothing the spine exposes and error out before a single delta computes. The discipline the audit grades: the first delta is NULL — label it baseline, never coalesce it to zero.",
    },
    {
      id: "cs-coupang-6",
      tier: "medium",
      topic: "s6",
      universe: "month-close",
      title: "The settlement coverage split",
      brief:
        "Seller-finance brief at month-end close, Coupang-flavored: the settlement walk classifies every statement by coverage — exact (settled equals claimed), partial (some legs, not all), none (zero legs) — because the three classes go to three different owners: the paid book files, the lone partial goes to collections, the never-settled go to dunning. Probed facts: 28 statements in INTEGER cents; the split reads 21 exact worth 65,612, 1 partial (#25: 4,000 settled of 6,148 claimed), 6 none worth 15,217; two anomalies the walk must survive — #11 is 'void' yet carries a settled 925.00 leg, and #28 claims 'paid' with zero legs (1,756.00). The status column is a claim; the payment rows are the record — the CASE reads the money, never the claim.",
      ask: "Return every settlement statement with its claimed status, claimed and settled dollars to 2 decimals, and its coverage class (none / exact / partial) — worst class first, biggest claim first within a class.",
      template:
        "SELECT i.id AS statement_id,\n       i.status AS claimed_status,\n       ROUND(i.amount_cents / 100.0, 2) AS claimed,\n       ROUND(COALESCE(SUM(p.amount_cents), 0) / 100.0, 2) AS settled,\n       CASE\n         WHEN COUNT(p.id) = 0 THEN {1}\n         WHEN SUM(p.amount_cents) = i.amount_cents THEN {2}\n         ELSE {3}\n       END AS coverage\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {4}\nGROUP BY i.id\nORDER BY coverage {5}, claimed DESC;",
      slots: [
        {
          answer: "'none'",
          kind: "keyword",
          label: "the never-settled label",
          why: "Zero payment legs means 'none' — the dunning class, 6 statements worth 15,217 on this db, including the paid-status lie #28 (1,756.00). 'paid' here would relabel the exact statements the dunning list exists for; 'partial' would send the whole never-settled book into a collections conversation it cannot win.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the fully-settled label",
          why: "Settled equals claimed means 'exact' — 21 statements worth 65,612, the filing cabinet's clean book. 'void' would mislabel paid statements; 'none' would dump the good book into the dunning queue and bury the real anomalies under 21 false positives.",
        },
        {
          answer: "'partial'",
          kind: "keyword",
          label: "the collections label",
          why: "Some-but-not-all legs means 'partial' — exactly one statement on this book, #25 at 4,000 of 6,148, a collections conversation and not a dunning row. Swapping the 'partial' and 'none' labels sends the dunning list to collections and the partial to dunning — both calls wrong, both owners confused.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the settlement stitch",
          why: "Legs reference their statement by invoice_id, so the stitch is p.invoice_id = i.id. p.invoice_id = p.id folds the legs table against itself — every statement suddenly carries all 27 legs and the coverage CASE classifies fiction with no error anywhere.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first walk",
          why: "DESC walks partial → none → exact, opening the close on the lone partial (#25) and the dunning book before the clean book. ASC opens on 21 exact statements and the meeting ends before the anomalies are read.",
        },
      ],
      distractors: ["'paid'", "'void'", "p.invoice_id", "ASC"],
      walkthrough:
        "One LEFT JOIN, one fold, one CASE that reads the money. The stitch p.invoice_id = i.id hangs each statement's legs off its row; the fold COALESCE(SUM(p.amount_cents), 0) turns statements with zero legs into a settled 0.00 — the outer guard is what makes the six never-settled statements classifiable at all — and the CASE branches on the money: COUNT(p.id) = 0 is 'none' (6 statements, 15,217, including the paid-status lie #28), settled-equals-claimed is 'exact' (21 statements, 65,612), and the ELSE catches the book's one partial, #25 at 4,000 of 6,148. The anomalies prove the CASE reads the right column: #11 is 'void' yet lands in 'exact' because its 925.00 leg settled — the status is a claim, the legs are the record. ORDER BY coverage DESC walks partial → none → exact, worst book first, with claimed DESC breaking ties biggest-exposure-first inside each class. The distractors each break differently: 'paid' and 'void' relabel classes the owners route on; p.invoice_id in the stitch folds legs against legs and invents 27-leg statements; and ASC opens the close on the clean book, exactly where the anomalies hide.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "Rocket-versus-scheduled share: the share of orders served inside the Rocket window versus the slow lane is this db's immediate-delivery drill — a conditional rate with the denominator decided first." },
    { slug: "average-selling-price", why: "ASP per listing weighted by units sold is how the pricing pod reads shelf price against demand — a join fold where numerator and denominator live at different grains." },
    { slug: "product-sales-analysis-ii", why: "Units per listing is the best-seller fold's raw material — the ladder that runs 47, 46, 38 down to a three-way tie at 30 starts as this aggregation." },
    { slug: "the-most-recent-three-orders", why: "A WOW member's latest Rocket runs: top-N-per-member with a window — the retention pod's 'what did this member buy lately' read." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Argmax per member: each WOW member's most-ordered product is the personalization feed's opening query — and tie handling is the interview." },
    { slug: "trial-balance-check", why: "The GL close: debits must equal credits — 181,080 against 181,080 on this db — a conditional-SUM reconciliation finance runs before any number ships." },
    { slug: "find-churn-risk-customers", why: "WOW lapse risk: members whose last Rocket order ages past the renewal window — an anti-join with date math that drives the winback calendar." },
    { slug: "group-sold-products-by-the-date", why: "Per-day SKU manifests: GROUP_CONCAT folds the day's Rocket runs into one cell — the ops board's dispatch-manifest shape." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heaviest Rocket member: argmax over order counts with a subquery — the concentration story (one member runs 24 of 103 orders) in one query." },
    { slug: "dormant-reactivation", why: "Dormant-member winback: NOT EXISTS over recent orders flags the members the retention calendar targets — the same shape as the settlement-dunning list." },
    { slug: "game-play-analysis-iv", why: "Second-Rocket cadence: members whose next order lands the day after the first — a first-occurrence subquery plus a join, the early-retention signal." },
    { slug: "fix-product-name-format", why: "Listing title hygiene: the catalog feed arrives casing-broken and 'keyboard' versus 'Keyboard' splits one product into two — string cleanup before any join." },
    { slug: "monthly-transactions-i", why: "The monthly settlement rollup with an abort flag: month buckets plus a conditional count — the finance packet's spine on this db's 14-month window." },
    { slug: "unpopular-books", why: "Listings below the velocity bar: anti-join plus HAVING finds products whose units never cross the floor — the dead-catalog review (this db's honest answer is zero)." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Category-stack members: bought Rocket Fresh and Electronics but never Apparel — conditional aggregation across three flags, the cross-sell screen's exact shape." },
    { slug: "find-stores-with-inventory-imbalance", why: "Stock-versus-demand imbalance per listing: two conditional aggregates compared per group — the Rocket Fresh replenishment read (Desk Mat holds 260 stock against 47 sold)." },
    { slug: "immediate-food-delivery-i", why: "The Rocket-window share by day part: immediate delivery against scheduled — the funnel counts topic's percentage drill, with the denominator (all orders, or just completed?) decided out loud before the division." },
    { slug: "unique-orders-and-customers-per-month", why: "Orders AND members per month in one fold — the two-grain census the business review opens with (EU's 45 orders collapse to 8 members), month-bucketed." },
    { slug: "product-sales-analysis-i", why: "Units per listing folded across the join chain — the raw material of the best-seller ladder that runs 47, 46, 38 down to a three-way tie at 30." },
    { slug: "average-time-of-process-per-machine", why: "Per-stage cycle time is the dispatch-latency drill in miniature: avg(created→shipped) with the unstamped population excluded — 2.98 days over 82 of 103 orders here." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat cadence inside a window: members whose second Rocket order lands within seven days of the first — the dawn-network loyalty signal, all window math." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest demand per listing — the freshness read merchandising runs before re-shelving decisions, top-N-per-group with a window or a correlated subquery." },
    { slug: "rank-scores", why: "The tie-ladder drill in its purest form: shared rungs, gaps after ties, and the RANK/DENSE_RANK/ROW_NUMBER policy call — this db's units ladder ties at 36 and 30 make it concrete." },
    { slug: "sellers-with-no-sales", why: "Sellers whose listings never moved: the anti-join behind the badge review's bench — and on this db every seller sells, so proving the confident zero is the exercise." },
    { slug: "employees-with-missing-information", why: "Rows present in one table, missing in its twin — the settlement-records screen: statements without legs and legs without statements, both directions in one drill." },
    { slug: "weather-type-in-each-country", why: "A CASE pivot over market buckets — the classification shape behind the coverage split (exact / partial / none) and the price bands, where the empty premium bucket must still print." },
    { slug: "count-salary-categories", why: "One-pass CASE bands that must sum to the whole — the census discipline this kit's 52+30+14+7 = 103 identity lives on, practiced on classification buckets." },
    { slug: "queries-quality-and-percentage", why: "Quality rate with an honest denominator — the abort-share drill: conditional count over ALL placed orders, 100.0 before the division, rounding only at the end." },
    { slug: "confirmation-rate", why: "Pooled confirmation rate per actor — the COD-refusal map's twin: per-market shares (8.1 / 6.7 / 5.3) that must reconcile to the 6.8% network read." },
    { slug: "consecutive-numbers", why: "Streak detection over ordered rows — the demand-spine skill in miniature: LAG over consecutive months/days and the discipline of the NULL first row." },
    { slug: "bank-account-summary-ii", why: "Credit-versus-debit folding per account — the ledger drill behind the trial balance (181,080 against 181,080), with the cents-safe 100.0 read." },
    { slug: "products-worth-over-invoices", why: "Listings whose value exceeds their settlement statements — the invoice-book comparison drill that pairs the catalog to the money tables in INTEGER cents." },
  ],
};
