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
    "Preparation strategy: company-pools.md carries no Coupang section — zero tagged rows — so all ten topic slug sets and all sixteen problems here are **theme-curated** from the pools file's SQL rows to this kit's known screen shapes: funnel censuses, dispatch-latency math, tie-heavy best-seller ladders, honest-denominator rates and the cents-safe settlement book. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:Rocket-badge seller bench} the marketplace pod audits monthly, the other rebuilds the {sky:dawn-dispatch clock} fulfillment ops reads every morning. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
  ],
};
