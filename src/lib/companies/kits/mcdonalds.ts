// McDonald's — kit 10 of the Food & Quick-commerce domain (wave 6, Batch 92c).
// QSR at planetary scale: franchise store velocity, promo lift reads, and the
// menu-mix architecture (value band vs core band) that pricing reviews are
// graded on — one-pass market boards and grand-total stacks for the ops room.
// Pool provenance: McDonald's carries 0 tagged LC problems in
// company-pools.md — the pool is FULLY theme-curated from the SQL band
// (16 problems, 30 topic slugs), every one mirroring a workflow McDonald's
// screens are known to probe (placed-vs-kept demand, CASE pivots, price
// bands, store service latency, promo windows, grand-total stacks).
// 0 tagged LC — theme-curated, declared here per spec.
// Cases run on the storefront db (scripts/company-facts.md, probed
// 2026-10-12): orders = store transactions (counter + app + delivery),
// shipped_at = fulfillment completion, customers = app accounts, products =
// menu SKUs, suppliers = franchise/distribution partners, region = market.
// Menu-price architecture fact (probed): the value band (< 50) holds 8 SKUs
// at 32.06 avg, the core band (50-200) holds 8 SKUs at 111.5 avg, and the
// premium band (>= 200) is EMPTY — max menu price 199.99. Fulfillment
// latency is stored in DAYS (avg 2.98, range 2..4). Settlement money is
// INTEGER cents (divide by 100.0).
//
// 3x EXPANSION (task 94) — APPEND-ONLY: brief 4→6, dayInLife 3→4, metrics 8→12,
// topics 10→15, theory 8→24 (mcd-t9..t24), mcqs 10→30 (mcd-mcq-11..30),
// cases 2→6 (cs-mcdonalds-3..6 on families j7/t4/j5/q6 — pairwise distinct and
// distinct from the original s7/x3), problems 16→32. All new figures re-verified
// against the db by read-only probes: partner fold Nordic 3 SKUs/11,130.25 (gate 3
// keeps the four 3-SKU partners), expense gate-3 months 8 with peak 2024-08
// 3,210.00, AR chase 6 invoices/15,217.00 led by #24 4,937.00 with #28 a
// status-'paid' no-payment row at 1,756.00, coverage census exact 21/65,612.00 ·
// partial 1/6,148.00 (4,000.00 settled) · none 6/15,217.00, rails 16 card/
// 37,364.00 + 11 wire/32,248.00 = 69,612.00 cash tie, ledger 181,080.00/181,080.00/0.

import type { CompanyKit } from "../types";

export const mcdonaldsKit: CompanyKit = {
  id: "mcdonalds",
  domainId: "food",
  name: "McDonald's",
  tagline: "QSR at planetary scale: menus, stores, promos",
  accent: "text-yellow-500",

  brief: [
    "McDonald's is the largest quick-service restaurant company on earth — tens of thousands of franchised and company-operated stores, a menu engineered in bands (value tier, core tier, limited-time premium drops), and a promo calendar that turns a double-cheese window into a global demand event. The operating artifacts are throughput-shaped: transactions per store-hour, placed-vs-kept demand, ticket bands, and the promo-lift readout every market files. Every analyst here learns the same first lesson: *a 'market number' is a population sentence before it is a figure*, and every rate — cancellation share, promo lift, kept demand — is only as honest as its denominator.",
    "The data org is ops-first. Store analytics owns velocity and labor — peak dayparts, fulfillment time, queue health; menu analytics owns mix and pricing — band migration after a value-menu change, the attach rate of limited-time offers; franchise finance owns settlements and promo accruals, where the money lives in integer cents and a missing `/100.0` is a 100x incident. The culture is SQL-first: a market review opens with a query, a promo readout is a query with its window attached, and the transaction stream — `{emerald:placed}, {emerald:fulfilled}, {rose:cancelled}` — is the raw material every board folds.",
    "Interviews are hands-on SQL against a storefront-shaped schema, in a plain editor where your syntax errors are yours. Expect the one-pass market board (placed / delivered / cancelled / in-transit per market from `CASE WHEN` branches over one scan), the grand-total stack (markets, then a `UNION ALL` TOTAL row), and the menu-band fold — on this db the value band holds **8 SKUs at 32.06 average**, the core band **8 SKUs at 111.5**, and the premium band (>= 200) is *empty*: max menu price 199.99. Fulfillment latency reads `shipped_at - created_at` — 82 of 103 transactions carry a completion timestamp, averaging **2.98 days** on a 2..4 range.",
    "Prep like a QSR ops analyst, not a generic SQL student. Drill conditional folds (SUM(CASE WHEN …) until the branch totals reconcile to COUNT(*) on sight), month buckets with LAG momentum, cancellation shares with placed denominators, and the band histogram — *value vs core vs premium* is the menu-mix interview in one GROUP BY. Say your population out loud before you write the FROM clause: {emerald:placed}, {rose:cancelled}, and {emerald:fulfilled} demand are three different numerators, and the interviewer is grading the sentence you say before the query you type.",
    "The settlement side is where the cents discipline earns its keep. The ledger books **28 invoices worth 86,977.00** — 21 paid at 66,443.00, 6 open at 19,609.00, 1 void at 925.00 — but {violet:coverage} is a different cut than status: 21 invoices settle exact at 65,612.00, 1 is partial (4,000.00 of 6,148.00), and 6 carry {rose:no payment} at all (15,217.00), a set that includes a status-'paid' invoice with zero payment rows. The rails split 16 card settlements at 37,364.00 against 11 wires at 32,248.00 — **69,612.00, tying to the cash account's debit side to the dollar** — and the trial balance cross-foots 181,080.00 against 181,080.00 at delta 0. *A board that doesn't reconcile to that sentence gets rebuilt, not explained.*",
    "Prep like the menu-finance team hires. Four weeks: week one, conditional folds and populations — market boards, kept-demand shares, branch reconciliation. Week two, joins with grain pinned — the 251-line fan-out over 103 transactions, COUNT(DISTINCT) discipline, the partner chain through the menu. Week three, the settlement toolkit — anti-joins for the unpaid book, staged CTEs for coverage classes, `/100.0` on every cents column, STRFTIME month spines with LAG momentum. Week four, stacks and timing — grand-total boards, one-pass FILTER censuses. *If you can fold the coverage census — exact, partial, none — from a two-CTE start in under five minutes, you are the profile.*",
  ],

  dayInLife: [
    "**07:40 —** open the ops board before the franchise call: yesterday's placed transactions, the {rose:cancelled} share against the PLACED denominator, and the per-market state columns — delivered, in-transit, cancelled — from one `CASE WHEN` pass. A market's cancelled column looks high; before escalating, you re-run the census yourself and check the branch totals sum back to COUNT(*) — *if the branches don't reconcile to the placed count, the board is lying and the call hasn't started yet*.",
    "**10:30 —** deep work: the promo-lift read. The value-menu window closed Sunday; you fold transactions per market inside and outside the window, gate with a `HAVING` on volume so thin markets don't headline, and hang the lift ratio on top with `100.0` before the division. Mid-build the pricing PM asks why one market's lift swings wild; the answer is a 2-transaction market — LATAM's **2 placed / 852.44** — *and you gate it out in the query rather than explain it away in the meeting*.",
    "**14:30 —** menu-mix cycle: the pricing review with the category team. The band fold prints value **8 SKUs @ 32.06**, core **8 SKUs @ 111.5**, premium empty — and the argument is whether a 199.99 limited-time SKU counts as premium. It doesn't: the band edge is `price >= 200`, the max on the menu is 199.99, and *moving the edge to win an argument is how boards stop meaning anything* — you footnote the edge and ship the fold.",
    "**17:30 —** write the EOD note: one screen, three folds — market state board, gated promo lift, menu-band mix — each with its population sentence attached. Tomorrow's franchise close gets the grand-total stack pre-staged: per-market revenue, then the `UNION ALL` TOTAL row (**34,833.28** network) leading the board; *the note is one page because the queries are the exhibit*, and every figure re-runs in under a minute.",
    "**21:15 —** the settlement close, after the restaurants go quiet. The coverage census runs first — **21 exact / 1 partial / 6 unpaid** — then the AR chase list: 6 invoices at 15,217.00, led by #24 at 4,937.00, with #28 flagged because its status says paid and its payment count says zero. Rail cross-foot: card 16/37,364.00 plus wire 11/32,248.00 = **69,612.00**, tying to cash; the trial balance prints 181,080.00 against 181,080.00, delta 0. *The close ships because the numbers agree, not because the deck looks good.*",
  ],

  metrics: [
    {
      name: "Market velocity board",
      what: "Placed, delivered, in-transit and {rose:cancelled} transactions per market, folded in ONE CASE WHEN pass: EU 45/24/12/3, APAC 37/21/8/3, US 19/5/10/1, LATAM 2/2/0/0. Branch totals must reconcile to COUNT(*) or the board is broken.",
    },
    {
      name: "Kept-demand share",
      what: "Kept transactions ÷ PLACED transactions. 103 placed, 7 {rose:cancelled} — 6.8% network-wide, 8.1% in APAC vs 5.3% in the US. Only honest if the denominator stays the full placed population — filtering status first deletes the numerator from the denominator.",
    },
    {
      name: "Menu-band mix",
      what: "SKU count and average price per band: value (< 50) **8 @ 32.06**, core (50-200) **8 @ 111.5**, premium (>= 200) **empty** — max menu price 199.99. A 50/50 value-core menu is the pricing story; a premium band that doesn't exist is the trap.",
    },
    {
      name: "Ticket (AOV)",
      what: "Transaction value ÷ transactions: 34833.28 ÷ 103 = 338.19 network-wide, from 25.47 snack runs to 1,088.44 family boxes. Markets above the 338.19 baseline (LATAM 426.22, US 383.48) are the scalar-subquery drill.",
    },
    {
      name: "Promo lift",
      what: "Lifted transactions ÷ baseline transactions across a promo window, 100.0 before the division, ROUND at the end. The promo ledger sits in expenses — Ads: **14 line items, 4,570** — and the lift is only honest when both sides share a population sentence.",
    },
    {
      name: "Fulfillment latency",
      what: "Completion minus order time over transactions that HAVE a completion timestamp: 82 of 103 here, avg 2.98 days on a 2..4 range; US 3.07 is the slowest large market, APAC 2.93 the fastest. In production the same julianday shape reads minutes at drive-thru grain.",
    },
    {
      name: "Store partner concentration",
      what: "Revenue share per franchise/distribution partner: the top partner carries **11,130.25 (32%)**, the top two **59%** of network revenue. Concentration is a supply-risk dial, and it folds from line items through the menu — a three-table chain with fan-out discipline.",
    },
    {
      name: "Seasonal momentum",
      what: "Month-over-month revenue delta on the monthly fold: 2024-01 peaks at **3,731.97**, 2024-07 troughs at **1,193.86**. LAG over the month spine computes it — and inherits every filter the spine carries, which is a definition, not a bug.",
    },
    {
      name: "Settlement coverage classes",
      what: "Every invoice classified on MONEY, not status: 21 {emerald:exact} at 65,612.00, 1 {amber:partial} (4,000.00 of 6,148.00), 6 {rose:no payment} at 15,217.00. The unpaid six include a status-'paid' invoice and the exact 21 include the void-but-settled 925.00 one — a census that outranks the status column.",
    },
    {
      name: "Rail mix",
      what: "Card 16 payments / **37,364.00** vs wire 11 / **32,248.00** — 69,612.00 that ties to the cash account's debit side. Method mix is the reconciliation day's audit trail: a rail total that drifts from cash is the first alarm the close hears.",
    },
    {
      name: "AR exposure",
      what: "The unpaid book: **6 invoices / 15,217.00** — EU 4/8,524.00, US 1/4,937.00, APAC 1/1,756.00. Chase lists sort amount DESC so the biggest hole tops the call, and #28 (status paid, zero payments) is the anomaly row the anti-join surfaces.",
    },
    {
      name: "Expense season burn",
      what: "Rent 14 lines / **16,800.00** is the fixed floor, Ads 14 / 4,570.00 flexes with the promo calendar, and the gate-3 month census prints the {amber:2024-08 peak at 3,210.00} against quiet 1,719.00 Januarys. Burn seasonality feeds the promo plan.",
    },
  ],

  topics: [
    {
      name: "Order states & kept demand",
      why: "The ops board's most-watched ratio is kept ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows COUNT(*) divides. On this db that reads 7 of 103 = 6.8% — drill it until putting the status filter in the wrong clause feels physically wrong.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-i", "basket-depth-aov", "number-of-rich-customers", "the-most-recent-three-orders"],
    },
    {
      name: "Market census, two grains",
      why: "'Transactions AND accounts per market' opens every ops review: 45 transactions from 8 EU accounts, 19 from 2 US accounts. The two columns at two grains in one SELECT is the house census, and mixing the grains is the classic bug — COUNT(*) counts transactions, COUNT(DISTINCT customer_id) counts people.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "unique-orders-and-customers-per-month", "the-number-of-employees-which-report-to-each-employee", "find-loyal-customers"],
    },
    {
      name: "CASE pivots & one-pass boards",
      why: "The franchise ops room is query-budgeted: the market board gets ONE scan. CASE WHEN branches inside SUM build the placed / delivered / cancelled / in-transit columns in a single pass, and the branch totals must reconcile to COUNT(*) — the reconciliation IS the correctness test.",
      slugs: ["reformat-department-table", "rearrange-products-table", "weather-type-in-each-country", "bank-account-summary"],
    },
    {
      name: "Menu-mix & price bands",
      why: "The menu is engineered in bands, and the band fold is a CASE histogram: value (< 50) 8 SKUs @ 32.06, core (50-200) 8 @ 111.5, premium empty at max price 199.99. Screens drill the band edge as a definition — moving 200 to 199 'to make the premium band exist' is the trap the interviewer plants.",
      slugs: ["spend-histogram", "product-price-at-a-given-date", "the-category-of-each-member-in-the-store", "ratings-histogram", "maximum-transaction-each-day"],
    },
    {
      name: "Store velocity & service latency",
      why: "Velocity is a latency fold: julianday(shipped_at) - julianday(created_at) over the 82 completed of 103 placed, avg 2.98 days, US 3.07 slowest among big markets. Per-store averages and top-performer gates drill the same shape the drive-thru timer reports.",
      slugs: ["average-time-of-process-per-machine", "find-top-performing-driver", "trips-and-users", "customer-placing-the-largest-number-of-orders", "find-total-time-spent-by-each-employee"],
    },
    {
      name: "Promo windows & date math",
      why: "Promos live in windows, and the lift read is date math before it is a ratio: transactions inside the window vs outside, repeat visits within N days, daypart pivots. Screens drill the boundary — >= vs > on the window edge decides which demand the promo gets credit for.",
      slugs: ["find-golden-hour-customers", "users-with-two-purchases-within-seven-days", "friday-purchases-i", "transactions-per-visit-histogram"],
    },
    {
      name: "Leaderboards & the rank trio",
      why: "Top markets by velocity, top SKUs by attach, worst markets by cancellation — ops reporting is leaderboard reporting, and ties are everywhere. ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and LIMIT-boundary ties are the classic 'why does my top-3 return 4 rows' bug.",
      slugs: ["rank-scores", "top-earners", "group-employees-of-the-same-salary"],
    },
    {
      name: "Joins across the franchise chain",
      why: "Partner revenue and menu attach fold through the chain — partners → menu SKUs → line items — and the fan-out discipline is the graded skill: 103 transactions fan into 251 lines, so COUNT(*) and SUM(o.total) drift unless the grain is pinned. INNER versus LEFT is a decision about who survives the board.",
      slugs: ["combine-two-tables", "average-selling-price", "product-sales-analysis-i", "count-student-number-in-departments"],
    },
    {
      name: "Rates with honest denominators",
      why: "Promo lift, cancellation share, in-transit ratio — QSR rates punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided before the ratio, ROUND only at the very end.",
      slugs: ["percentage-of-users-attended-a-contest", "queries-quality-and-percentage", "ads-performance"],
    },
    {
      name: "Grand-total stacks & census folds",
      why: "The franchise close wants the total row in the same result set: per-market revenue stacked with a UNION ALL TOTAL row — 15,089.23 + 11,605.45 + 7,286.16 + 852.44 against the network **34,833.28**. One-pass FILTER censuses and grand-total stacks are the clinic moves the close is graded on.",
      slugs: ["count-salary-categories", "the-airport-with-the-most-flights", "active-businesses"],
    },
    {
      name: "Settlement rails & the cents discipline",
      why: "Franchise finance settles in integer cents, and the rails split card (16/37,364.00) from wire (11/32,248.00). Screens drill the `/100.0` habit on every cents column and the zero-fill for accounts that never moved — a summary that drops the quiet rows under-reports the book by definition.",
      slugs: ["monthly-transactions-ii", "bank-account-summary-ii", "npv-queries"],
    },
    {
      name: "AR chase & the unpaid book",
      why: "The chase list is a pure anti-join: 6 invoices / 15,217.00 survive a LEFT JOIN … IS NULL against payments, including a status-'paid' row no payment ever touched. Drilling the rows that DIDN'T happen — sellers with no sales, visitors who never transacted — is how the chase reflex is built.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "find-churn-risk-customers", "employee-bonus", "sales-analysis-ii"],
    },
    {
      name: "Coverage classes & staged folds",
      why: "The coverage census (exact 21 / partial 1 / none 6) cannot be judged inside the payment scan: you stage per-invoice paid sums in a CTE, LEFT JOIN them onto invoices, then classify with CASE. Two-stage builds are the house shape whenever an aggregate must meet its own base row.",
      slugs: ["game-play-analysis-iv", "investments-in-2016", "market-analysis-i", "product-sales-analysis-iii"],
    },
    {
      name: "Expense seasons & month buckets",
      why: "Expense burn is seasonal and promo-driven, so the month spine is STRFTIME('%Y-%m') with a materiality gate: HAVING COUNT(*) >= 3 keeps the eight 3-line months and surfaces the 3,210.00 August peak. Bucketing drills boundary discipline — '%m' alone merges Februarys across years into one fake season.",
      slugs: ["list-the-products-ordered-in-a-period", "customer-order-frequency", "number-of-employees-who-met-the-target", "sales-by-day-of-the-week", "classes-more-than-5-students", "article-views-ii"],
    },
    {
      name: "Manifests & text folds",
      why: "Store-close packages read like manifests — SKUs sold per day, cities per market, vendor labels cleaned for the export. GROUP_CONCAT folds rows into one cell and text functions normalize the labels; both punish separator sloppiness and NULL handling, which is exactly what the screen probes.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "fix-names-in-a-table"],
    },
  ],

  theory: [
    {
      id: "mcd-t1",
      q: "The ops board shows 'placed transactions' and 'kept-demand share' per market. Where does each number's population live, and why does filtering status in the wrong clause ruin the share?",
      a: "Placed transactions is COUNT(*) over the whole orders table — all 103 rows regardless of state. Kept-demand share is a conditional count over that SAME population: SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) in the numerator, COUNT(*) in the denominator, so the 7 cancelled rows read as 6.8% network-wide and 8.1% in APAC. The bug happens when you write WHERE status != 'cancelled' first: the denominator silently loses the cancelled rows, every market reads ~0% cancellations, and the board turns green overnight. One population sentence per query — 'all placed transactions' — and the numerator is a flag inside it, never a WHERE outside it. *Denominators are definitions, not implementation details.*",
      tag: "aggregation",
    },
    {
      id: "mcd-t2",
      q: "Your market board computes delivered, in-transit and cancelled in one pass. Walk me through the CASE WHEN fold, and the reconciliation test that proves it's right.",
      a: "Each column is SUM(CASE WHEN status = '…' THEN 1 ELSE 0 END) over the same GROUP BY market — EU reads 45 placed, 24 delivered, 12 in-transit, 3 cancelled. The test the fold must pass: the branch columns sum to the placed count per row (24 + 12 + 3 + the 6 pending = 45) — if they don't, a state is missing from the CASE and the board is quietly wrong. The alternative — four separate queries with WHERE filters — produces four different populations and a board nobody can reconcile. I ship the one-pass fold because *branch totals that reconcile to COUNT(*) are the cheapest correctness proof SQL offers*, and the ops room reads the reconciliation, not the query.",
      tag: "aggregation",
    },
    {
      id: "mcd-t3",
      q: "Two franchise partners tie on revenue and the leaderboard must show both. Walk me through RANK, DENSE_RANK and ROW_NUMBER, and which you ship.",
      a: "ROW_NUMBER breaks ties arbitrarily (stable only with an explicit tiebreaker), RANK gives both partners rank 1 and skips to 3, DENSE_RANK gives both rank 1 and continues at 2. For a partner leaderboard the stakeholder question is 'who's next after the tie' — if a rank-3 slot should exist, RANK; if the board should read 1, 1, 2, DENSE_RANK. On this db the six partners' revenues (11,130.25 down to 2,980.15) happen to be distinct, so all three agree — but I never rely on that. I ship RANK plus a deterministic tiebreaker like `ORDER BY revenue DESC, partner ASC` and say the tie policy out loud, because *an unbreakable tie is a definition the business hasn't made yet*.",
      tag: "windows",
    },
    {
      id: "mcd-t4",
      q: "shipped_at is NULL until a fulfillment completes. What do COUNT(*), COUNT(shipped_at) and AVG over the latency diff each return, and which one feeds the velocity board?",
      a: "COUNT(*) counts all 103 placed transactions; COUNT(shipped_at) counts only the 82 rows with a completion timestamp (52 delivered + 30 shipped); the AVG of julianday(shipped_at) - julianday(created_at) ignores NULLs automatically and reads 2.98 days over that same 82 — US 3.07, APAC 2.93. The velocity board wants service time over completed fulfillments only; including pending rows as zero latency would flatter the slowest stores and lie about the promise. What I refuse to do is COALESCE the NULL to zero 'to fill the gaps': an order in the queue has no latency yet, not zero latency. The honest query states its population — *82 completed of 103 placed* — and lets the pending 14 wait outside.",
      tag: "nulls",
    },
    {
      id: "mcd-t5",
      q: "The menu-band fold buckets SKUs as value / core / premium. Why is the premium band EMPTY on this menu, and why is 'fixing' the edge wrong?",
      a: "Because the band edge is a definition: premium is price >= 200, and the most expensive SKU on this menu is 199.99 — so the premium group is genuinely empty, and the fold reads value 8 SKUs @ 32.06, core 8 @ 111.5, premium 0. A GROUP BY only prints bands that contain rows, so 'premium' vanishes unless you build the band spine deliberately (a cross-join of band names, or a RIGHT JOIN from the spine). 'Fixing' it by moving the edge to 199 manufactures a premium band of exactly one SKU and breaks every historical comparison — the board changes because the definition changed, not the menu. The honest move is to footnote the empty band; *an empty group that should exist is a finding, not a bug*.",
      tag: "quality",
    },
    {
      id: "mcd-t6",
      q: "Find the markets whose average ticket beats the network average. Why a scalar subquery, and what breaks if you write the baseline as a second GROUP BY?",
      a: "The network baseline is one number — AVG(total) over all 103 transactions = 34833.28 ÷ 103 = 338.19 — while the market ticket is a per-group fold. A scalar subquery computes the global fold independently: HAVING AVG(o.total) > (SELECT AVG(total) FROM orders). Two markets clear it here (LATAM 426.22, US 383.48). If you try to join a second grouped copy back, you've built a derived table you don't need and invited a grain mismatch — the join fans out and the averages double-count. The scalar form keeps one query, one scan, one definition; *the baseline is a number, not a table*, and writing it that way makes the population explicit in the SQL itself.",
      tag: "subqueries",
    },
    {
      id: "mcd-t7",
      q: "The franchise close wants per-market revenue AND a grand total in one result set. Walk me through the UNION ALL stack, and what must stay aligned across the arms.",
      a: "Two SELECTs stacked with UNION ALL: the first folds revenue per market (EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44), the second folds the whole table and labels the row 'TOTAL' — 34,833.28. Alignment is the contract: both arms must emit the same column count and compatible types — market label first, revenue second — and the total arm must scan the same population (all 103 rows, no status filter) or the total won't reconcile with the sum of the parts. UNION (not ALL) would dedupe and could silently drop a market whose revenue equals another's label collision — no; the real risk is ORDER BY placement: one ORDER BY after the stack sorts the combined result, which is how the TOTAL row leads the board. *A total row is a definition too: same table, same population, same column shape — or it's decoration.*",
      tag: "pipeline",
    },
    {
      id: "mcd-t8",
      q: "Before the ops dashboard ships you get ten minutes of query review. What are the two-grain, cents and NULL checks you always run?",
      a: "Three checks, in order of how often they've burned me. Grain: every folded number states its population — 103 placed, 82 completed, 7 cancelled — and any join to order_items must pre-aggregate or the 251-line fan-out inflates counts; the market board must also show both grains (transactions AND accounts: EU 45 vs 8). Cents: settlement money is integer cents, so anything touching invoices or payments divides by 100.0 before it rounds — the six unpaid settlements read 15,217 dollars, not 1,521,700 cents. NULLs: NOT IN against a nullable column returns an empty set silently, so anti-joins go through LEFT JOIN … IS NULL or NOT EXISTS. *Ten minutes of population sentences is cheaper than a quarter of dashboard therapy* — that's how I end reviews.",
      tag: "quality",
    },
    {
      id: "mcd-t9",
      q: "The rail ledger runs a running settled-amount column ORDER BY paid_on. Two settlements share a paid_on date. When do ROWS and RANGE frames disagree, and which do you ship?",
      a: "ROWS counts physical rows, so the running total steps line by line through the two same-day settlements; RANGE treats same-order-key rows as peers, so both settle-days land in the window together and the running total jumps by the day's whole batch at once. For a daily cash read, RANGE is the honest grain — the day settles as a day. For a ledger replay where each row is its own event, ROWS. The discipline is saying which one the board means: on the rail stack — card 16/37,364.00, wire 11/32,248.00 — the total reconciles to 69,612.00 either way, but *the intermediate rows are different reports, and stakeholders quote intermediates*.",
      tag: "windows",
    },
    {
      id: "mcd-t10",
      q: "Your grand-total stack arm labels rows 'TOTAL' while the other arm emits market names. What are the alignment contracts for set-operation arms, and where does SQLite forgive what production won't?",
      a: "Three contracts: same column count, compatible types per position, and the same population sentence per arm. SQLite is forgiving — it will happily stack a text label against region names in column one and type the column loosely — but Postgres errors on incompatible arms, and the forgiving behavior hides drift: swap an arm's column order and the board still prints, reconciling to nothing. The house rule: both arms SELECT the same shape explicitly — market-or-label first, ROUND(x, 2) money second — and the total arm scans the same unfiltered 103-row population so 34,833.28 reconciles with the parts it sums. *Set ops concatenate; they never reconcile for you.*",
      tag: "setops",
    },
    {
      id: "mcd-t11",
      q: "When do you reach for a scalar subquery versus a derived table on this db, and what decides it?",
      a: "The shape of the thing being compared. A scalar subquery computes ONE independent number — the network baseline AVG(total) = 338.19 — and drops it into a HAVING or SELECT without touching the outer grain. A derived table (or CTE) stages a per-group fold — paid sums per invoice, per-market revenue — when the comparison is group-to-group or aggregate-to-base-row. The failure mode is hybrid: joining a grouped copy back to its base table invites a grain mismatch and double-counted averages. Markets above ticket baseline (LATAM 426.22, US 383.48) are scalar work; the coverage census is staged work. *One number, scalar; one fold per group, derived — and never a join that multiplies the grain you're averaging.*",
      tag: "subqueries",
    },
    {
      id: "mcd-t12",
      q: "COALESCE and NULLIF both touch NULLs. State your fill-versus-guard policy on the settlement tables.",
      a: "They solve opposite problems and I never let one impersonate the other. COALESCE FILLS an absent value with a defined substitute: the unpaid six invoices have no payment leg, the LEFT JOIN leaves paid_cents NULL, and the coverage census needs COALESCE(paid.paid_cents, 0) so WHEN paid_cents = 0 can classify them as 'no payment' — NULL = 0 evaluates to UNKNOWN and they'd vanish from every class. NULLIF GUARDS a computation: SUM(amount_cents) / NULLIF(COUNT(*), 0) turns a divide-by-zero into NULL instead of an error or a garbage ratio. Fill when absence means zero; guard when a zero denominator is a lie you refuse to print. *One is a definition, the other a fuse — swapping them is how boards hide holes.*",
      tag: "nulls",
    },
    {
      id: "mcd-t13",
      q: "Count the franchise network three ways: COUNT(*), COUNT(shipped_at), COUNT(DISTINCT product_id) over order_items. What does each measure?",
      a: "Three different populations in one breath. COUNT(*) over orders is 103 placed transactions — every row, state irrelevant. COUNT(shipped_at) is 82 — only rows carrying a completion timestamp, the fulfilled 52 delivered plus 30 shipped. COUNT(DISTINCT product_id) over order_items is menu breadth — how many of the 16 SKUs actually sold through 251 line rows. The interview trap is quoting any of them as 'orders': lines are not transactions, fulfilled is not placed, and 16 possible SKUs is not 16 selling. Each count states its grain out loud, and the ops room's first question on any board is which of the three the number claims to be. *A count without its grain is a rumor.*",
      tag: "aggregation",
    },
    {
      id: "mcd-t14",
      q: "The store-close package wants one cell per day listing the SKUs sold. Walk me through GROUP_CONCAT's contract and its two classic hazards.",
      a: "GROUP_CONCAT(product_name) folds the day's line rows into one comma-joined cell — the manifest shape. Hazard one: the default separator is a bare comma with no space, and SKU names containing commas corrupt the field — pass an explicit ' | ' when names aren't atomic. Hazard two: order is not guaranteed unless the aggregate carries ORDER BY (SQLite supports GROUP_CONCAT(x ORDER BY x)); a manifest that shuffles between runs reads as data drift to a stakeholder. NULLs are skipped silently, so a day with rows but NULL names prints a shorter list, not an error. I use it for display, never for math — *the moment a string cell gets parsed back into numbers, the design is wrong.*",
      tag: "strings",
    },
    {
      id: "mcd-t15",
      q: "A teammate computes the partial-payment ratio as SUM(amount_cents) / COUNT(*) over invoice #25's payments and reports 65. What happened?",
      a: "Integer division on integer cents. #25 is the 6,148.00 invoice with 4,000.00 settled — 400000 cents over one payment row — and INTEGER / INTEGER truncates toward zero, printing 65 where the honest figure is 65.03 (or 65.0 at one decimal). The fix is promoting before the divide: / 100.0 for dollars, 1.0 * numerator for ratios, ROUND only at the very end. This db is saturated with the trap because every settlement column is integer cents — invoices, payments, expenses, ledger — and the same bug wore a different costume when someone summed 457000 cents of Ads and called it 4,570,000. *Promote at the division, round at the display, and never between.*",
      tag: "types",
    },
    {
      id: "mcd-t16",
      q: "Before any settlement board ships you cross-foot it. Which identities does the ledger hand you for free?",
      a: "Three free proofs. The rail identity: card 37,364.00 plus wire 32,248.00 equals 69,612.00, which must equal the cash account's debit side — a method GROUP BY that doesn't tie to the ledger's cash row means a payment row is mis-coded. The trial balance: total debits 181,080.00 against credits 181,080.00, delta 0 — anything I compute on the ledger participates in that closure. The coverage identity: exact billed 65,612.00 plus partial 6,148.00 plus unpaid 15,217.00 equals the 86,977.00 invoice book. I build the check INTO the query — a TOTAL arm, a delta column, a HAVING — so the board prints its own alibi. *A reconciliation that lives in the analyst's head ships in nobody's deck.*",
      tag: "quality",
    },
    {
      id: "mcd-t17",
      q: "Why can't you gate 'months with at least 3 expense lines' in WHERE, and what does that clause boundary teach?",
      a: "WHERE runs before the fold: at that stage there are no groups and no COUNT to compare — the aggregate doesn't exist yet. HAVING runs after GROUP BY, on the folded rows, so HAVING COUNT(*) >= 3 keeps the eight 3-line expense months and drops the six 2-line ones. The boundary teaches clause-time: WHERE filters rows into the fold, HAVING filters groups out of the result, and an aggregate in WHERE isn't just wrong, it's meaningless. The interview move is recognizing when a filter LOOKS like a row filter but is really a group definition — 'thin months', 'small markets', 'partners under 2 SKUs' are all HAVING. *If the condition needs the fold to exist, it lives after the fold.*",
      tag: "pipeline",
    },
    {
      id: "mcd-t18",
      q: "You hang LEAD(due_on) over the AR book ordered by due_on for an aging board. What does the edge return, and what's the honest treatment?",
      a: "The last row's LEAD is NULL — there is no next invoice — and a board that COALESCEs it to zero or a sentinel invents urgency that isn't there. The honest treatment: let the NULL print (or label it explicitly as 'no successor') and say the population: LEAD reads the query's spine, so a HAVING gate or WHERE filter upstream makes the next row of the SURVIVING spine, not the calendar's next invoice — the same censoring that made July's LAG read May when June was gated out. Same rule for LAG on the first month: no predecessor is a NULL, not a zero. *Window functions answer questions about the result set you built; if you filtered the spine, the window never saw what you removed.*",
      tag: "windows",
    },
    {
      id: "mcd-t19",
      q: "The partner leaderboard ranks suppliers by folded revenue. Can you RANK() inside the same SELECT as the GROUP BY, and what's the cleaner build?",
      a: "SQLite allows it and I refuse it: RANK() OVER (ORDER BY SUM(oi.quantity * oi.unit_price) DESC) in the grouped SELECT mixes fold time and window time in one pass, and the semantics get murky the moment a second aggregate or a HAVING gate joins — the window can read a fold the HAVING is about to delete. The cleaner build stages the fold in a CTE (partner, skus, revenue), then ranks over the staged rows: Nordic Gadgets AB 11,130.25 takes rank 1, Midwest Hardware Co 9,294.93 rank 2, cleanly, with the tie policy applied to finished numbers. Rank-after-fold is also the shape that survives porting — *staged folds rank honestly because the rows they rank are final.*",
      tag: "windows",
    },
    {
      id: "mcd-t20",
      q: "Join keys look interchangeable on small tables — id against id, name against name. What's your hygiene routine before a three-table chain ships?",
      a: "Every join key gets read aloud against the schema, because small-N tables make wrong keys LOOK right: join products p ON p.id = s.id and ids 1..6 collide between products and suppliers, pairing the Mechanical Keyboard with whichever supplier shares its number — the fold still prints, at 34,833.28 per phantom partner, and nothing errors. The routine: keys must be the declared relationship (p.supplier_id = s.id, oi.product_id = p.id), each join's fan-out is predicted before running (16 products, 251 lines — the second hop multiplies), and the result's grain is named after the last join. Name columns too: two columns both called id after a chain is a foot-gun the reader trips on. *Joins don't fail loudly; they fail plausibly.*",
      tag: "joins",
    },
    {
      id: "mcd-t21",
      q: "What makes a query self-auditing, and which of this db's boards already carry their own proof?",
      a: "A self-auditing query prints its reconciliation next to its result, so correctness is visible without re-running anything. The market state board does it: the four CASE branches sum back to the market's placed count — EU 24 + 12 + 3 + 6 = 45 — and a broken branch shows as a row that doesn't close. The grand-total stack does it: the TOTAL arm 34,833.28 must equal the sum of the market arms above it. The coverage census does it: 21 + 1 + 6 invoices = 28, and 65,612.00 + 6,148.00 + 15,217.00 = 86,977.00. I add a delta column when the room won't do arithmetic — 'placed - states = 0' — because a zero the reader can see beats a proof they must trust. *Build the proof into the exhibit; the walkthrough then becomes a tour, not a defense.*",
      tag: "quality",
    },
    {
      id: "mcd-t22",
      q: "These tables are tiny — 103 orders, 251 lines. Does performance thinking still matter in the interview, and what instincts do you show?",
      a: "Yes — because the instinct, not the milliseconds, is what transfers to a table a million rows wide. The instincts I narrate: one scan beats four — the CASE board reads every row once instead of four filtered passes; sargability — wrapping the date column in STRFTIME forces a scan, so a hot production query would bucket via range predicates instead; pre-aggregate before joining — folding order_items to one row per order BEFORE the join keeps the 251-line fan-out out of the ratio math; and count the result before you trust it — 8 gate-3 months, 4 gate-3 partners, 6 unpaid invoices are all checkable on sight. *On small data, performance talk is really correctness talk said with a plan.*",
      tag: "performance",
    },
    {
      id: "mcd-t23",
      q: "A teammate slaps DISTINCT on every query that 'has duplicates'. When is DISTINCT a pinned grain and when is it a confession?",
      a: "DISTINCT is a confession when it deletes rows to hide a fan-out — the join multiplied 103 transactions into 251 lines, the ticket average came out wrong, and DISTINCT papers over the duplicate totals while leaving every other aggregate silently inflated. It's a pinned grain when it's the definition: COUNT(DISTINCT p.id) per supplier measures LISTINGS — 3, 3, 2, 2, 3, 3 — not 251 line rows, and that distinct is the number the business means. The diagnostic: if DISTINCT changes a count, ask whether the pre-DISTINCT count was a grain error; if it changes a SUM or AVG, it's almost always a fan-out bug wearing a band-aid. Fix the join, then the DISTINCT either survives as a definition or disappears as a scar. *Every DISTINCT is a sentence about grain — write it or read it, never sleepwalk past it.*",
      tag: "quality",
    },
    {
      id: "mcd-t24",
      q: "The month spine can be sliced with STRFTIME('%Y-%m', …), '%m', or '%Y'. What does each print on this db, and how do you choose?",
      a: "The format string IS the definition. '%Y-%m' prints the 14-month spine from 2024-01 to 2025-02 — the honest seasonality grain where 2024-08 peaks at 3,210.00 in expenses. '%m' collapses every January into one row and every February into another — this db's two Februarys merge into a 4-line, 3,090.00 phantom season — useless for trends, occasionally right for month-of-year effects. '%Y' prints a 2-row year fold: 2024 against 2025-partial, where the short 2025 window makes any comparison a denominator trap. I choose by asking what the board compares: months to months, Februaries to Februaries, or years to years — and I footnote the format like any other edge. *A bucket boundary is a business definition wearing SQL clothes.*",
      tag: "dates",
    },
  ],

  mcqs: [
    {
      id: "mcd-mcq-1",
      prompt: "The one-pass market board folds four status columns from the 103 placed transactions. What must the branch columns do per market for the board to be trusted?",
      choices: [
        "Sum (with the pending column) back to the market's placed COUNT(*)",
        "Each be greater than zero",
        "Match the previous day's values",
        "Sum to 103 in every single market",
      ],
      answer: 0,
      why: "The CASE WHEN branches partition each market's rows, so delivered + in-transit + cancelled + pending must equal that market's placed count — EU 24+12+3+6 = 45. That per-row reconciliation is the correctness proof of a one-pass fold.",
      notes: [
        { choice: 3, why: "The branches sum to the MARKET's placed count, not the network's 103 — a per-group check, not a global one." },
        { choice: 1, why: "A zero column is fine — LATAM's in-transit and cancelled are both 0 on this db; zeros reconcile, missing states don't." },
      ],
      difficulty: "easy",
    },
    {
      id: "mcd-mcq-2",
      prompt: "On the training db, 82 of 103 transactions carry a fulfillment timestamp. What does COUNT(shipped_at) return over all transactions?",
      choices: ["82", "103", "0", "NULL"],
      answer: 0,
      why: "COUNT(column) counts non-NULL values only — 82 here (52 delivered + 30 shipped). COUNT(*) would count all 103 rows including the 14 pending and 7 cancelled that have no completion timestamp yet.",
      notes: [
        { choice: 1, why: "That's COUNT(*), a different function. COUNT(shipped_at) skips NULLs — the whole point of distinguishing them on a table where 21 rows are in-flight or cancelled." },
        { choice: 3, why: "COUNT never returns NULL — with zero non-NULL rows it returns 0. The 82 completed rows guarantee a real count here." },
      ],
      difficulty: "easy",
    },
    {
      id: "mcd-mcq-3",
      prompt: "The menu-band fold uses CASE WHEN price < 50 THEN 'value' WHEN price < 200 THEN 'core' ELSE 'premium' END. What prints for the premium band?",
      choices: [
        "Nothing — GROUP BY only shows bands containing rows, and no SKU prices >= 200 (max 199.99)",
        "A row with 0 SKUs — GROUP BY prints empty groups",
        "A row with 8 SKUs — the core band spills over",
        "An error — CASE must cover every row",
      ],
      answer: 0,
      why: "The ELSE 'premium' arm catches no rows because the max menu price is 199.99, and GROUP BY never invents empty groups — the premium band is absent from the output. Building a visible zero-row band takes a band spine (cross join or right join), not a CASE tweak.",
      notes: [
        { choice: 2, why: "That's the SQL instinct from BI tools that left-join a spine — raw GROUP BY drops absent groups; the absence itself is the finding." },
        { choice: 3, why: "CASE with ELSE covers every row by construction — the issue is which rows land in the ELSE, and the answer is none." },
      ],
      difficulty: "easy",
    },
    {
      id: "mcd-mcq-4",
      prompt: "The velocity board computes AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) over all 103 transactions. What does it print, and what's wrong with it?",
      choices: [
        "2.98 — it's fine; AVG ignores the 21 NULL-fulfillment rows automatically",
        "It errors — you can't subtract NULL timestamps",
        "0 — the NULL rows contribute zero days",
        "21 — it counts the missing fulfillments",
      ],
      answer: 0,
      why: "AVG skips NULLs by design, so the average runs over the 82 completed rows and prints 2.98 (range 2..4). The query is honest — but the ANALYST must still say the population out loud: the average is over completed fulfillments, not placed transactions.",
      notes: [
        { choice: 2, why: "NULLs don't contribute zero — they're excluded entirely. Treating them as zero would drag the average down and flatter slow stores." },
        { choice: 1, why: "NULL arithmetic yields NULL per row, but the aggregate ignores NULL rows rather than failing — the danger is silent population drift, not an error." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-5",
      prompt: "A promo ledger line shows 4570 amount_cents for the Ads category (14 lines). What does ROUND(SUM(amount_cents) / 100.0, 2) return, and why the /100.0?",
      choices: [
        "4570.00 — settlement money is integer cents, so dollars need the /100.0",
        "4570 — cents and dollars coincide here",
        "4.57 — cents divide by 1000",
        "NULL — ROUND over cents returns NULL",
      ],
      answer: 0,
      why: "expenses.amount_cents is integer cents: 457000 cents = $4,570.00 across the 14 Ads lines — the promo-spend figure the lift readout divides against. Every money figure leaving a cents table divides by 100.0 before it rounds.",
      notes: [
        { choice: 2, why: "That's the coincidence trap — the /100.0 is not optional even when digits look right; skip it once on a bigger ledger and it's a 100x incident." },
        { choice: 1, why: "Raw cents don't belong in a stakeholder memo — 457000 reads as a data error, and the audit of every finance join starts with the /100.0." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-6",
      prompt: "Transactions fan into 251 order_items rows (103 transactions). A teammate computes network ticket as SUM(o.total) / COUNT(*) after joining orders to order_items. What do they get?",
      choices: [
        "Roughly 2.4x too small — the denominator counts line rows, not transactions",
        "Exactly 338.19 — joins don't change aggregates",
        "Roughly 2.4x too big — the numerator duplicates",
        "Zero — SUM returns NULL after joins",
      ],
      answer: 0,
      why: "The join fans 103 transactions into 251 rows, so o.total repeats per line: the numerator inflates ~2.44x but COUNT(*) inflates with it — 34833.28 × 2.44 ÷ 251 ≈ 338.19 ÷ 2.44. The fix: SUM(o.total) / COUNT(DISTINCT o.id), or pre-aggregate order_items before joining.",
      notes: [
        { choice: 1, why: "Joins absolutely change aggregates when they fan out — this is the single most common ticket bug in ops reporting." },
        { choice: 2, why: "Both sides scale, so the ratio shrinks rather than grows — the duplicated total divides by a duplicated count." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-7",
      prompt: "The franchise close stacks per-market revenue with a UNION ALL TOTAL row: SELECT region, ROUND(SUM(total),2) … GROUP BY region UNION ALL SELECT 'TOTAL', ROUND(SUM(total),2) FROM orders. What guarantees the TOTAL reconciles with the parts?",
      choices: [
        "Both arms scan the same unfiltered population — 103 rows, no WHERE — and share column shape",
        "UNION ALL deduplicates mismatches",
        "The GROUP BY in the first arm enforces reconciliation",
        "The ORDER BY sorts the TOTAL last, which reconciles it",
      ],
      answer: 0,
      why: "Reconciliation is a population claim: the total arm must fold the same 103 unfiltered rows the per-market arms partition — 15,089.23 + 11,605.45 + 7,286.16 + 852.44 = 34,833.28. Add a status filter to one arm and the board stops adding up, silently.",
      notes: [
        { choice: 1, why: "UNION ALL never dedupes or reconciles — it just concatenates; alignment of populations is the analyst's job, not the operator's." },
        { choice: 3, why: "ORDER BY changes reading order, not arithmetic — a sorted wrong total is still wrong, just presentable." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-8",
      prompt: "SELECT customer_id FROM accounts WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE total > 500) — the subquery's population can contain NULLs in production. What happens?",
      choices: [
        "The query returns zero rows whenever the subquery yields one NULL",
        "NULLs are ignored and the anti-join works",
        "Only rows with NULL totals are excluded",
        "SQLite raises a type error",
      ],
      answer: 0,
      why: "NOT IN with a NULL in the list makes every comparison UNKNOWN, so no row passes — the anti-join silently empties. The safe shapes: NOT EXISTS, LEFT JOIN … IS NULL, or a WHERE inside the subquery that excludes NULLs first.",
      notes: [
        { choice: 1, why: "That's the intuition everyone has and the bug everyone ships — three-valued logic makes x NOT IN (…NULL…) evaluate to UNKNOWN, not TRUE." },
        { choice: 3, why: "It's not a syntax or type error — the danger is precisely that it executes and returns an empty set with no complaint." },
      ],
      difficulty: "hard",
    },
    {
      id: "mcd-mcq-9",
      prompt: "A top-3 market leaderboard built with ORDER BY revenue DESC LIMIT 3 keeps returning 4 rows after a teammate switches to RANK() with a rank filter. What class of bug is this?",
      choices: [
        "Tie handling at the LIMIT boundary — RANK gives tied markets the same rank, so a rank-1 tie yields two rank-1 rows plus ranks 2 and 3",
        "Integer division in the revenue expression",
        "A NULL revenue row leaking through",
        "A missing GROUP BY",
      ],
      answer: 0,
      why: "RANK is not a filter — with a tie at the top, two markets share rank 1 and the WHERE rank <= 3 set still has four rows. The fix is a tie policy: DENSE_RANK, a deterministic tiebreaker, or ROW_NUMBER if the business accepts an arbitrary cut.",
      notes: [
        { choice: 1, why: "Division bugs distort values, not row counts — the symptom here is row-count inflation from ties, not wrong numbers." },
        { choice: 2, why: "A NULL revenue row would sort last under DESC, never break into the top set — and it wouldn't explain a consistent 4-row result." },
      ],
      difficulty: "hard",
    },
    {
      id: "mcd-mcq-10",
      prompt: "The month spine is gated with HAVING COUNT(*) >= 7 (three 6-transaction months drop), then LAG(revenue) OVER (ORDER BY month) hangs momentum off it. What does July's prev_revenue compare against?",
      choices: [
        "May's 2910.31 — LAG reads the previous surviving row, and June was filtered out",
        "June's 2047.43 — LAG reads calendar-adjacent months regardless of filtering",
        "NULL — the gap breaks LAG",
        "July's own revenue — LAG restarts after gaps",
      ],
      answer: 0,
      why: "LAG is row-relative over the query's spine, not the calendar: after HAVING removes June (6 transactions), July's previous row IS May. Momentum-over-a-gated-spine is a definition — footnote it, or build an ungated month spine if adjacency matters.",
      notes: [
        { choice: 1, why: "That's the calendar intuition, not the mechanics — LAG never consults months it can't see; the filtered month is invisible to it." },
        { choice: 2, why: "LAG across a gap doesn't error or reset — it silently compares across the hole, which is exactly why the spine choice needs a footnote." },
      ],
      difficulty: "hard",
    },
    {
      id: "mcd-mcq-11",
      prompt: "The expense month spine uses STRFTIME('%Y-%m', spent_on). What does it print for a line spent on 2024-08-05?",
      choices: ["'2024-08'", "'2024-8'", "'08'", "It errors on a non-numeric format"],
      answer: 0,
      why: "'%Y-%m' is the four-digit year, a dash, and the zero-padded two-digit month — '2024-08'. That string is the month spine's key: sortable, unique per month, and it keeps this db's 14 months from 2024-01 to 2025-02 as 14 separate buckets.",
      notes: [
        { choice: 1, why: "SQLite doesn't strip the zero-padding — '%m' is defined as two digits; a '2024-8' label would mean you wrote something else entirely, and text sort breaks ('2024-10' sorts before '2024-8')." },
        { choice: 2, why: "'%m' alone is month-only — it merges February 2024 (1,440.00) and February 2025 (1,650.00) into one 3,090.00 phantom bucket." },
      ],
      difficulty: "easy",
    },
    {
      id: "mcd-mcq-12",
      prompt: "In the partner fold, 16 SKUs sell through 251 line rows. What does COUNT(DISTINCT p.id) per supplier measure?",
      choices: [
        "Listings — how many of that partner's SKUs actually sold (2 or 3)",
        "The partner's share of the 251 line rows",
        "Always 16 — DISTINCT ignores the GROUP BY",
        "The partner's line-item count",
      ],
      answer: 0,
      why: "COUNT(DISTINCT p.id) pins the grain to products: Nordic Gadgets AB reads 3, Alpine Audio GmbH 2 — listings that moved, not lines that sold. Without DISTINCT you'd count line rows (251 across the network); with the GROUP BY it's per partner.",
      notes: [
        { choice: 3, why: "That's COUNT(*)'s answer — the fan-out grain. The DISTINCT is exactly what promotes 'lines sold' into 'SKUs listed', the number the partner review quotes." },
        { choice: 2, why: "DISTINCT evaluates inside each group — a per-partner fold, not a global constant." },
      ],
      difficulty: "easy",
    },
    {
      id: "mcd-mcq-13",
      prompt: "You need only the expense months with at least 3 lines. Which clause holds the gate, and why?",
      choices: [
        "HAVING COUNT(*) >= 3 — the count only exists after GROUP BY folds the rows",
        "WHERE COUNT(*) >= 3 — counts are row-level facts",
        "LIMIT 3 — keep the first three months",
        "WHERE month IN (the 3-line months), listed manually",
      ],
      answer: 0,
      why: "WHERE runs before the fold, where no group or COUNT exists yet; HAVING runs after GROUP BY and filters groups — gate 3 keeps the eight 3-line months (2024-01 1,719.00 … 2025-01 1,959.00) and drops the six 2-line ones.",
      notes: [
        { choice: 1, why: "An aggregate in WHERE is meaningless at row time — the engine errors, and the error is the lesson: the fold hasn't happened yet." },
        { choice: 2, why: "LIMIT truncates the sorted result, it doesn't define materiality — gate 3 is a definition about group size, not a page size." },
      ],
      difficulty: "easy",
    },
    {
      id: "mcd-mcq-14",
      prompt: "GROUP_CONCAT(product_name) over a day's sold SKUs returns a comma string. What contract must you check before the manifest ships?",
      choices: [
        "Separator and order — the default is a bare comma and row order is not guaranteed without ORDER BY inside the aggregate",
        "Nothing — GROUP_CONCAT is deterministic by spec",
        "That the cell parses back to the row count via COUNT",
        "That every product name is under 255 characters",
      ],
      answer: 0,
      why: "GROUP_CONCAT's default separator is ',' with no space and no guaranteed ordering unless the aggregate carries ORDER BY — a manifest that shuffles between runs reads as data drift. It's a display fold: names containing commas corrupt the field, so pass an explicit ' | ' and sort deliberately.",
      notes: [
        { choice: 2, why: "Parsing a folded string back into numbers inverts the fold — if the consumer needs counts, ship the COUNT column beside the manifest, never a string to re-split." },
        { choice: 1, why: "Determinism is exactly what it doesn't promise — same rows, different order is legal output, which is the hazard." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-15",
      prompt: "LAG(revenue) OVER (ORDER BY month) runs over the full 14-month expense spine. What does the first row's prev_revenue return?",
      choices: ["NULL — no predecessor exists", "0 — the window fills the edge with zero", "The first month's own revenue", "It errors on the first row"],
      answer: 0,
      why: "LAG reads the previous row in the partition, and the first row has none — NULL is the honest edge. The board either lets the NULL print or labels it 'no predecessor'; COALESCE to 0 would print January's momentum as -100%, a fake collapse.",
      notes: [
        { choice: 1, why: "Zero is a value, the edge is the ABSENCE of one — filling it invents a baseline the data never had." },
        { choice: 3, why: "Window edges are well-defined, not errors — the danger is silent NULLs downstream, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-16",
      prompt: "A running settled-amount column uses SUM(amount) OVER (ORDER BY paid_on ROWS UNBOUNDED PRECEDING). Two settlements share a paid_on. What changes if you switch to RANGE?",
      choices: [
        "RANGE treats the same-day rows as peers — the running total jumps by the whole day's batch at once",
        "RANGE sorts them differently, changing which row leads",
        "Nothing — ROWS and RANGE are aliases on ordered windows",
        "RANGE excludes ties entirely, shrinking the total",
      ],
      answer: 0,
      why: "ROWS steps physical rows, so the two same-day settlements produce two intermediate totals; RANGE includes all peers of the current ORDER BY key, so both rows show the day's combined batch. The final total reconciles either way — the intermediates differ, and stakeholders quote intermediates.",
      notes: [
        { choice: 1, why: "Neither frame re-sorts — ORDER BY fixed the order; the frames differ only in what the window CONTAINS." },
        { choice: 2, why: "RANGE doesn't shrink anything — for peer rows it's strictly larger than ROWS, never smaller." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-17",
      prompt: "You build the unpaid book as SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments. A teammate flips the arms. What do they get?",
      choices: [
        "Payment rows whose invoice_id matches no invoice — on this db, an empty set and no chase list",
        "The same 6 unpaid invoices — EXCEPT is symmetric",
        "All 28 invoices — the flip widens the left arm",
        "A syntax error — arms must be swapped together with WHERE",
      ],
      answer: 0,
      why: "EXCEPT is directional: A EXCEPT B keeps rows of A with no match in B. Invoices-minus-payments is the 6-invoice unpaid book; payments-minus-invoices asks which payment rows are orphaned — on this db, none, so the board reads empty and the AR call has no list.",
      notes: [
        { choice: 1, why: "Direction is the whole semantics — EXCEPT answers 'in the first arm, absent from the second', and swapping the arms answers a different question." },
        { choice: 2, why: "The flip doesn't widen anything — it inverts the anti-join, and this db's payments all reference real invoices." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-18",
      prompt: "In the coverage census, the staged CTE LEFT JOINs per-invoice paid sums onto invoices. Why does the classification need COALESCE(paid.paid_cents, 0)?",
      choices: [
        "The 6 unpaid invoices LEFT JOIN to NULL paid sums, and NULL = 0 is UNKNOWN — without the fill they vanish from every class",
        "To convert cents to dollars early",
        "To make the SUM over paid_cents legal",
        "To dedupe the joined rows",
      ],
      answer: 0,
      why: "The unpaid six have no payment leg, so the LEFT JOIN leaves paid_cents NULL; CASE WHEN paid_cents = 0 THEN 'no payment' never fires on NULL — three-valued logic makes the comparison UNKNOWN. COALESCE pins absence to zero so the census reads 21 exact / 1 partial / 6 none.",
      notes: [
        { choice: 3, why: "LEFT JOIN on invoice_id doesn't fan out — one staged row per invoice; the problem is NULL semantics, not duplicates." },
        { choice: 1, why: "The /100.0 happens at display; COALESCE here is about classification logic, not units." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-19",
      prompt: "A ratio template reads SUM(amount_cents) / COUNT(*). A reviewer swaps in NULLIF(COUNT(*), 0). What did they change?",
      choices: [
        "A guard — empty groups now yield NULL instead of a divide-by-zero error or garbage",
        "A fill — NULL denominators become zero",
        "Nothing — NULLIF(x, 0) is identity for counts",
        "A rounding change — NULLIF truncates like integer division",
      ],
      answer: 0,
      why: "NULLIF(x, 0) returns NULL when x is 0, so a zero denominator dissolves into NULL arithmetic — a flagged hole — instead of an error or an infinite ratio. It's the guard policy for any denominator a filter could legitimately empty.",
      notes: [
        { choice: 1, why: "That's COALESCE's job and the opposite direction — NULLIF manufactures NULLs to expose holes; COALESCE fills them by definition." },
        { choice: 2, why: "For non-zero counts it IS identity — the point is the zero case, exactly the case you can't test on a full table until production empties one." },
      ],
      difficulty: "hard",
    },
    {
      id: "mcd-mcq-20",
      prompt: "SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) FROM customers c — what's the execution shape, and why does it pass here but scare a DBA?",
      choices: [
        "Correlated — the subquery re-runs per customer row: 16 executions over 103 orders is trivial, per-million-rows it's a plan disaster",
        "Scalar-folded once — the subquery runs a single time before the scan",
        "It fails — you can't reference the outer table inside a subquery",
        "It fans out — customers multiply against orders",
      ],
      answer: 0,
      why: "The inner WHERE references c.id, so the subquery is correlated: once per outer row. On this db that's 16 small counts — fine. The instinct to state: pre-aggregate (fold orders per customer_id, then join) when the outer side grows, because correlated shapes rescan instead of folding once.",
      notes: [
        { choice: 3, why: "No join exists in this shape — the subquery returns one scalar per row, so nothing fans out; the cost is per-row execution, not multiplication." },
        { choice: 2, why: "Correlation is the entire point of a correlated subquery — it's legal and sometimes the clearest expression of the intent." },
      ],
      difficulty: "hard",
    },
    {
      id: "mcd-mcq-21",
      prompt: "The chase list is invoices LEFT JOIN payments WHERE p.id IS NULL. How many rows does it return on this db, and what are they?",
      choices: [
        "6 — the invoices with no payment leg, 15,217.00 total",
        "22 — the invoices that DO have payments",
        "28 — every invoice survives a LEFT JOIN",
        "0 — the NULL filter empties the result",
      ],
      answer: 0,
      why: "LEFT JOIN keeps all 28 invoices and attaches payment legs where they exist; IS NULL keeps the unmatched — 6 invoices totaling 15,217.00, including #28, a status-'paid' invoice that no payment ever touched. That's the chase list the AR call reads top-down.",
      notes: [
        { choice: 1, why: "That's IS NOT NULL's inversion — the settled book, not the chase list. One keyword flips the population." },
        { choice: 2, why: "The LEFT JOIN preserves all 28 rows but the WHERE then keeps only the unmatched — preserving and keeping are different clauses." },
      ],
      difficulty: "easy",
    },
    {
      id: "mcd-mcq-22",
      prompt: "Which set operator returns only the rows present in BOTH arms — the natural fit for 'SKUs sold in both January and February'?",
      choices: ["INTERSECT", "UNION ALL", "EXCEPT", "CROSS JOIN"],
      answer: 0,
      why: "INTERSECT keeps the shared rows, deduped — both arms' populations must share column shape. UNION ALL concatenates, EXCEPT subtracts directionally, and CROSS JOIN pairs everything with everything.",
      notes: [
        { choice: 1, why: "UNION ALL appends — a January+February stack with duplicates, not an overlap read." },
        { choice: 3, why: "CROSS JOIN isn't a set op at all — it's the 16×16 pairing board, the band spine's building block." },
      ],
      difficulty: "easy",
    },
    {
      id: "mcd-mcq-23",
      prompt: "The bucket format is '%m' instead of '%Y-%m'. What does the February fold print on this db?",
      choices: [
        "One merged '02' bucket — 4 lines, 3,090.00, a phantom season",
        "Two February rows — GROUP BY preserves the years",
        "NULL — '%m' can't parse a full date",
        "An error — the format string is invalid",
      ],
      answer: 0,
      why: "'%m' extracts the month alone, so February 2024 (2 lines, 1,440.00) and February 2025 (2 lines, 1,650.00) fold into one '02' group of 4 lines and 3,090.00. The bucket IS the definition — '%m' answers 'how do Februaries compare as a season' and lies about everything else.",
      notes: [
        { choice: 1, why: "GROUP BY groups the EXPRESSION's value — '02' — not the underlying rows; the year is gone the moment the format drops it." },
        { choice: 3, why: "'%m' is a valid format; the failure mode is a plausible wrong fold, not a crash." },
      ],
      difficulty: "easy",
    },
    {
      id: "mcd-mcq-24",
      prompt: "An order was re-shipped twice, leaving three fulfillment rows per order id. Which window pattern keeps only the latest row per order?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY shipped_at DESC) = 1, filtered in a staged outer query",
        "DISTINCT on the order id",
        "GROUP BY order_id with MAX(shipped_at) alone",
        "LAG(shipped_at) IS NULL",
      ],
      answer: 0,
      why: "ROW_NUMBER assigns 1..n inside each order's partition; filtering rn = 1 (in a CTE or outer query — window functions can't sit in WHERE) keeps the latest leg deterministically. The tiebreaker lives in the ORDER BY, so re-runs of the query agree.",
      notes: [
        { choice: 2, why: "MAX(shipped_at) finds the latest TIMESTAMP but GROUP BY hides which ROW it came from — you'd still need a join-back, which is the staged shape wearing a hat." },
        { choice: 3, why: "LAG IS NULL finds the FIRST row of each partition — the earliest leg, the opposite of the target." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-25",
      prompt: "The expense census gates HAVING COUNT(*) >= 3 and prints 8 months. A teammate proposes >= 2 'to be inclusive'. What do they print?",
      choices: [
        "All 14 months — the gate becomes a census, and the 2-line quiet months headline again",
        "The same 8 months — 2-line months average under the fold anyway",
        "6 months — the gate inverts and keeps the dropped rows",
        "An empty board — the gate is stricter than any month",
      ],
      answer: 0,
      why: "This db splits cleanly: 8 months carry 3 lines, 6 carry 2. Gate 3 is materiality; gate 2 admits every month, and the 3,210.00 August peak now sits beside 1,440.00 Februaries with no gate story at all. The gate number IS the definition being shipped.",
      notes: [
        { choice: 2, why: "HAVING >= never inverts — that would be a different predicate (< 2) or a misread of the census split." },
        { choice: 3, why: "Gate 4 would be the empty board — every month has 2 or 3 lines; gate 2 is the maximally inclusive direction." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-26",
      prompt: "WHERE RANK() OVER (ORDER BY revenue DESC) <= 3 fails to compile in most engines. What's the standard fix?",
      choices: [
        "Stage the ranking in a CTE or derived table, filter the rank outside it",
        "Move the rank into HAVING",
        "Cast the window to an integer first",
        "Use GROUP BY revenue instead",
      ],
      answer: 0,
      why: "Window functions evaluate after WHERE, so they can't appear in it — the fix is staging: WITH ranked AS (…, RANK() OVER … AS rn) SELECT … WHERE rn <= 3. The stage also documents that the rank is computed on a defined spine before the cut.",
      notes: [
        { choice: 1, why: "HAVING filters groups after aggregation, not window output — the timing is just as wrong, one stage later." },
        { choice: 3, why: "GROUP BY collapses rows — it's the opposite move; the top-N cut needs every candidate row ranked first." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-27",
      prompt: "RANK() OVER (ORDER BY SUM(o.total) DESC) sits in the same SELECT as its own GROUP BY region. Why does the team stage the fold in a CTE before ranking?",
      choices: [
        "Fold time and window time in one pass gets murky — a staged fold ranks final rows, survives HAVING edits, and ports cleanly",
        "SQLite can't compute SUM inside a window's ORDER BY",
        "CTEs make the query run in one scan instead of two",
        "The window would duplicate every grouped row",
      ],
      answer: 0,
      why: "Mixing the fold and the rank in one SELECT couples the window to a fold the HAVING might still filter — the rank can read groups about to be deleted. Staging (fold CTE, then rank over it) ranks finished numbers: Nordic 11,130.25 at rank 1, Midwest 9,294.93 at 2, with the tie policy applied to stable rows.",
      notes: [
        { choice: 1, why: "SQLite actually allows aggregates in a window's ORDER BY — the objection is semantics and portability, not syntax." },
        { choice: 3, why: "Windows add columns, never rows — the duplication fear misreads what OVER does." },
      ],
      difficulty: "medium",
    },
    {
      id: "mcd-mcq-28",
      prompt: "The chase list flips one keyword: WHERE p.id IS NULL becomes IS NOT NULL. What does the board now show?",
      choices: [
        "The settled book — 22 invoices with payment legs, the chase list's complement",
        "The same 6 invoices, sorted differently",
        "All 28 invoices — the condition is now trivially true",
        "An empty result — no invoice has a non-NULL payment id",
      ],
      answer: 0,
      why: "IS NOT NULL keeps the matched legs: 22 of 28 invoices carry at least one payment (the 6-row hole is the complement). The flip turns the fraud screen into the settlement report — and proves one keyword owns the entire population sentence.",
      notes: [
        { choice: 2, why: "Trivially true would need something like 1 = 1 — IS NOT NULL is still a real filter, just on the other side of the join." },
        { choice: 3, why: "22 invoices DO have payment legs — the anti-join's unmatched count is 6, so its mirror is far from empty." },
      ],
      difficulty: "hard",
    },
    {
      id: "mcd-mcq-29",
      prompt: "The stack's TOTAL arm emits the literal 'TOTAL' in column one while the market arm emits region names. SQLite accepts the stack. Why is the discipline still 'keep arm shapes deliberately aligned'?",
      choices: [
        "SQLite types the column loosely, so drift ships silently — stricter engines error, and the label column is the row's identity either way",
        "SQLite stores both arms as numbers, truncating the label",
        "The ORDER BY after the stack normalizes the types",
        "UNION ALL casts everything to TEXT automatically",
      ],
      answer: 0,
      why: "SQLite's dynamic typing lets a text label share a column with region names — forgiving in dev, a portability trap in prod, where stricter engines reject mismatched arms. The real contract is semantic: the label IS the row's identity ('TOTAL' reads as a total; 'NET' reads as a mystery), and aligned shapes are what make the stack auditable.",
      notes: [
        { choice: 1, why: "Nothing truncates — the label prints fine, which is precisely the hazard: forgiving engines make drifted arms look correct." },
        { choice: 3, why: "UNION ALL does no casting — each arm's column keeps its own type, and downstream readers inherit the ambiguity." },
      ],
      difficulty: "hard",
    },
    {
      id: "mcd-mcq-30",
      prompt: "An aging board computes LEAD(due_on) OVER (ORDER BY due_on) over the 6-invoice chase list. What does the last row print, and what's the honest treatment?",
      choices: [
        "NULL — there is no next invoice; label the edge or let the NULL print, never fill it with a fake date",
        "The first row's due_on — windows wrap around",
        "0 — the default for window edges",
        "Today's date — LEAD falls back to the current timestamp",
      ],
      answer: 0,
      why: "LEAD reads the next row in the partition; the last row has none, so NULL is the honest edge. COALESCE to a sentinel date or zero invents aging that isn't in the data — on a 6-row chase list the edge row is #18 at 873.00, and its 'next due' is genuinely unknown.",
      notes: [
        { choice: 1, why: "Windows don't wrap — the frame ends where the partition ends; wraparound would make the oldest invoice look current again." },
        { choice: 2, why: "There's no default fill in LEAD — the optional third argument exists, and choosing it is a definition the board must footnote." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-mcd-1",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The market state board, one pass",
      brief: "McDonald's-flavored brief on the storefront db: the franchise ops call starts in ten minutes and the board must show every market's demand states in ONE scan — placed, delivered, cancelled, in-transit — because the ops room is query-budgeted and four separate queries arrive four minutes apart. Definition is fixed: placed = COUNT(*) over ALL transactions (no status filter — a {rose:cancelled} order was still demand the store generated); the state columns are SUM(CASE WHEN …) branches over the same fold, and they must reconcile to the placed count with the pending arm. Probed facts: EU reads **45 placed / 24 delivered / 3 cancelled / 12 in-transit**, APAC **37 / 21 / 3 / 8**, US **19 / 5 / 1 / 10**; the review gates at COUNT(*) >= 19 so LATAM's 2-transaction market can't headline a lift story.",
      ask: "Return per market (placed >= 19): market, placed, delivered, cancelled, in_transit — busiest market first.",
      template: "SELECT c.region AS market,\n       COUNT(*) AS placed,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS delivered,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS cancelled,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS in_transit\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY placed {4}",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the delivered state",
          why: "The delivered branch counts status = 'delivered' — EU 24, APAC 21, US 5. 'Shipped' would print the in-transit counts under the delivered header (US 10 instead of 5) and the board reconciles against nothing; 'pending' ships the queue as wins.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the cancelled state",
          why: "The cancelled branch counts status = 'cancelled' — 3 EU, 3 APAC, 1 US, the 6.8% network numerator. 'Pending' mislabels the 14 in-flight rows as dead demand; 'void' is a settlement status and prints an all-zero column that looks like good news.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the volume gate",
          why: "HAVING COUNT(*) >= 19 keeps EU (45), APAC (37) and US (19) — and gates out LATAM's 2-transaction market, whose ratios swing on single orders. The gate number IS the materiality definition; 37 would silently drop the US from its own ops review.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The ops call reads top-down from the biggest market: EU 45, APAC 37, US 19. ASC opens the review on the smallest board row — a correct query that wastes the room's ten minutes backwards.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "'void'", "ASC", "37"],
      walkthrough: "A one-pass state board is a CASE WHEN fold with a reconciliation contract. GROUP BY market folds 103 transactions into placed counts (EU 45, APAC 37, US 19, LATAM 2), and each SUM(CASE WHEN status = …) branch reads one state from the SAME rows — EU's 24 delivered + 12 in-transit + 3 cancelled + 6 pending reconcile to 45 placed, which is the proof the board is complete. HAVING COUNT(*) >= 19 is materiality: LATAM's 2 orders sit out because a market that size can't headline a state story. Swap the delivered arm to 'shipped' and US's board claims 10 delivered — the exact number its in-transit column should show; swap cancelled to 'pending' and dead demand becomes a queue; flip the gate to 37 and the US vanishes from its own review. The status filter deliberately stays out of WHERE: *placed is the denominator population, and the states are flags inside it — that sentence is what the ops room is actually grading*.",
    },
    {
      id: "cs-mcd-2",
      tier: "hard",
      topic: "x3",
      universe: "growth",
      title: "The franchise close stack",
      brief: "McDonald's-flavored brief on the storefront db: the franchise close ships tonight and the board needs per-market revenue WITH the network total in the same result set — one export, no spreadsheet arithmetic. Definition is fixed: both arms scan the same unfiltered population (all **103** transactions — the TOTAL must reconcile with the parts), the grand row is labelled 'TOTAL', and the stack sorts by revenue so the total leads. Probed facts: EU **15,089.23**, APAC **11,605.45**, US **7,286.16**, LATAM **852.44**, network **34,833.28** — the arms' column shapes must match (market label, revenue) or the UNION ALL refuses the stack.",
      ask: "Return per-market revenue plus a TOTAL row in one stack: market, revenue (2 decimals) — biggest revenue first.",
      template: "SELECT c.region AS market,\n       ROUND(SUM({1}), 2) AS revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nUNION ALL\nSELECT {2} AS market,\n       ROUND(SUM({3}), 2) AS revenue\nFROM orders\nORDER BY revenue {4}",
      slots: [
        {
          answer: "o.total",
          kind: "keyword",
          label: "the per-market revenue column",
          why: "Market revenue folds orders.total at transaction grain — EU 15,089.23. Summing customer_id adds up member ids (a number that prints, reconciles to nothing); SUM(status) folds text to 0.00 per market.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The grand row must be labelled 'TOTAL' so the export reads as a stack, not a mystery fifth market. Any other literal prints fine and ships a board the ops room can't cite — the label IS the row's identity.",
        },
        {
          answer: "total",
          kind: "keyword",
          label: "the network-wide revenue column",
          why: "The total arm folds the same orders.total over ALL 103 rows — 34,833.28, which reconciles with the four market rows above. Summing a different column breaks the reconciliation silently: the stack still prints, the board still lies.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "One ORDER BY after the stack sorts the combined result: TOTAL 34,833.28 first, then EU 15,089.23 down to LATAM 852.44. ASC buries the total at the bottom of the export and opens the close on the smallest market.",
        },
      ],
      distractors: ["o.customer_id", "o.status", "ASC", "'NET'", "o.shipped_at"],
      walkthrough: "A grand-total stack is two folds with one contract. Arm one folds revenue per market — GROUP BY region over the join, SUM(o.total) printing EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. Arm two folds the SAME table with no WHERE — 34,833.28 — labelled 'TOTAL', because a total is only a total if its population matches the parts it sums. UNION ALL concatenates (UNION would dedupe — a real hazard when two markets ever tie); the single ORDER BY revenue DESC after the stack sorts the combined set and leads the close with the total. Substituting customer_id for either fold prints plausible numbers that reconcile to nothing; 'pending' as the label ships a board the room can't cite; ASC hands the smallest market the first slide. *The stack's honesty lives in the population match — same table, same rows, same column shape — and that's the sentence the walkthrough leaves you with*.",
    },
    {
      id: "cs-mcdonalds-3",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The partner attach ledger",
      brief: "McDonald's-flavored brief on the storefront db: the distribution-partner review starts in twenty minutes and the supply team wants the attach ledger — SKUs listed AND revenue folded per partner through the menu chain (partners → menu SKUs → line items) — gated so partners with fewer than 3 moving SKUs can't headline. Definition is fixed: revenue is line value `SUM(oi.quantity * oi.unit_price)` at line grain, listings are COUNT(DISTINCT p.id) at SKU grain, and the gate is a HAVING on that SKU count. Probed facts: with the gate at 3 the board reads Nordic Gadgets AB **3 SKUs / 11,130.25**, Midwest Hardware Co 3 / 9,294.93, Shenzhen Electro 3 / 3,049.07, Pacific Textiles 3 / 2,980.15 — while Alpine Audio GmbH (4,765.63) and Andes Naturals SA (3,613.25) sit out at 2 SKUs each.",
      ask: "Return per partner (listed SKUs >= 3): partner, skus, revenue (2 decimals) — biggest revenue first.",
      template: "SELECT s.name AS partner,\n       COUNT(DISTINCT p.id) AS skus,\n       ROUND(SUM(oi.quantity * {1}), 2) AS revenue\nFROM suppliers s\nJOIN products p ON {2}\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.name\nHAVING COUNT(DISTINCT p.id) >= {3}\nORDER BY revenue {4}",
      slots: [
        {
          answer: "oi.unit_price",
          kind: "keyword",
          label: "the line-value column",
          why: "Revenue at line grain is quantity × the LINE's unit_price — Nordic reads 11,130.25. Substituting p.price drifts every fold (Nordic 11,118.49) because menu price and line price disagree; the ledger reconciles to nothing. 'ASC' as a column is a syntax error.",
        },
        {
          answer: "p.supplier_id = s.id",
          kind: "keyword",
          label: "the declared partner key",
          why: "The chain hangs on the declared relationship p.supplier_id = s.id. Joining p.id = s.id pairs ids that happen to collide between small tables — the fold returns EMPTY (no product id meets a supplier id with lines) — and any number in an ON clause cross-joins the whole network.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the SKU-count gate",
          why: "HAVING COUNT(DISTINCT p.id) >= 3 keeps the four 3-SKU partners and their 26,454.40 combined revenue — and drops Alpine (4,765.63) and Andes (3,613.25), whose 2-SKU books can't headline a concentration story. Gate 2 re-admits them (all 6 partners); gate 4 empties the board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review reads concentration top-down: Nordic 11,130.25 first. ASC opens on Pacific Textiles' 2,980.15 and buries the 32% partner — a correct board that argues the opposite of the supply-risk point.",
        },
      ],
      distractors: ["p.price", "p.id = s.id", "2", "4", "ASC"],
      walkthrough: "The partner ledger is a three-table chain with two grains pinned. First hop: suppliers to menu SKUs on the declared key p.supplier_id = s.id — join p.id = s.id instead and the small tables' colliding ids pair into an empty board. Second hop: SKUs to line items, where 103 transactions fan into 251 rows — that's why listings are COUNT(DISTINCT p.id) (Nordic 3, Alpine 2) while revenue folds the line expression SUM(oi.quantity * oi.unit_price) to 11,130.25. The two grains coexist because each measures its own definition; the HAVING gate >= 3 is materiality on the SKU grain, keeping Nordic/Midwest/Shenzhen/Pacific and their 26,454.40 combined, dropping Alpine and Andes. Substituting p.price for oi.unit_price looks harmless and drifts Nordic to 11,118.49 — the exact reconciliation break the partner would dispute. *The ledger's proof is its sort: 11,130.25 down to 2,980.15, biggest partner first, or the concentration story reads backwards.*",
    },
    {
      id: "cs-mcdonalds-4",
      tier: "medium",
      topic: "t4",
      universe: "expense",
      title: "The expense season census",
      brief: "McDonald's-flavored brief on the storefront db: the franchise P&L review wants the expense season read — spend per month, gated for materiality — and the CFO has defined 'a real month' as 3+ expense lines. The spine is STRFTIME('%Y-%m', spent_on) (the format string IS the definition: '%m' alone merges this db's two Februarys into a 3,090.00 phantom season), money divides by 100.0 because expense amounts are integer cents, and the gate is HAVING COUNT(*) >= 3. Probed facts: the gate-3 census prints 8 months — 2024-01 1,719.00, 2024-03 1,917.00, 2024-04 1,749.00, 2024-07 1,794.00, {amber:2024-08 3,210.00} the peak, 2024-10 1,859.00, 2024-11 1,974.00, 2025-01 1,959.00 — and the six 2-line months (1,440.00 … 1,650.00) sit out.",
      ask: "Return per month (3+ lines): month, lines, dollars (2 decimals) — earliest month first.",
      template: "SELECT STRFTIME({1}, spent_on) AS month,\n       COUNT(*) AS lines,\n       ROUND(SUM(amount_cents) / {2}, 2) AS dollars\nFROM expenses\nGROUP BY month\nHAVING COUNT(*) >= {3}\nORDER BY month {4}",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket format",
          why: "'%Y-%m' prints the 14-month spine's honest grain — '2024-08'. '%m' merges both Februarys into one '02' bucket (4 lines, 3,090.00); '%Y' folds to a 2-row year read; any other literal returns a NULL month and one garbage row.",
        },
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents-to-dollars divisor",
          why: "Expense money is INTEGER cents: 171900 cents prints 1,719.00 only through /100.0. Dividing by 1000.0 shrinks every month to tenths (171.90) — a P&L the CFO reads as a rounding error — and a bare number divides nothing coherently.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the materiality gate",
          why: "HAVING COUNT(*) >= 3 keeps the eight 3-line months and drops the six 2-line ones — the CFO's definition of a real month, and 3 is a live cell in every printed row (lines = 3). Gate 2 admits all 14 months; gate 4 empties the census.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A season read walks the calendar forward — 2024-01 first, the 3,210.00 August peak landing mid-table where the trend owns it. DESC opens on 2025-01 and reads the year backwards; the peak would headline before its context exists.",
        },
      ],
      distractors: ["'%m'", "'%Y'", "1000.0", "2", "4", "DESC"],
      walkthrough: "The expense census is a bucket definition wearing a HAVING. STRFTIME('%Y-%m', spent_on) builds the 14-month spine — the format string is the definition, because '%m' merges the two Februarys into a 4-line, 3,090.00 phantom season and '%Y' collapses everything to a 2-row year fold. GROUP BY month folds the 36 expense lines; COUNT(*) is the gate grain and ROUND(SUM(amount_cents) / 100.0, 2) is the money grain — integer cents promote at the divide or the P&L prints cents. Gate 3 keeps the eight real months: 2024-01 1,719.00 through 2025-01 1,959.00, with 2024-08's 3,210.00 peak mid-table where the promo-season story lives. Gate 2 would print all 14 months and bury the definition; gate 4 prints nothing and the review has no exhibit. *ASC keeps the calendar honest — a season read that starts in 2025 is a season read upside down.*",
    },
    {
      id: "cs-mcdonalds-5",
      tier: "medium",
      topic: "j5",
      universe: "fraud",
      title: "The AR chase list",
      brief: "McDonald's-flavored brief on the storefront db: the fraud spot-check needs the AR chase list — every invoice with NO payment leg — for Monday's collections call, top 3 by amount. The population is defined by the anti-join: invoices LEFT JOIN payments, keep WHERE p.id IS NULL; money divides by 100.0 (invoice amounts are integer cents); sort biggest-first so the biggest hole tops the call. Probed facts: the full book is 6 invoices / **15,217.00**, and the top-3 cut prints #24 US **4,937.00**, #26 EU 3,562.00, #27 EU 2,794.00 — with #28 flagged separately: its status says paid and its payment count says zero (1,756.00, APAC).",
      ask: "Return the top 3 unpaid invoices: invoice, market, status, amount (2 decimals) — biggest amount first.",
      template: "SELECT i.id AS invoice,\n       c.region AS market,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS amount\nFROM invoices i\n{1} payments p ON p.invoice_id = i.id\nJOIN customers c ON c.id = i.customer_id\nWHERE {2}\nORDER BY amount {3}\nLIMIT {4}",
      slots: [
        {
          answer: "LEFT JOIN",
          kind: "keyword",
          label: "the preserving join",
          why: "The chase list needs invoices that DON'T match a payment, so the invoice side must survive unmatched: LEFT JOIN. An INNER JOIN keeps only matched pairs — the anti-join's WHERE p.id IS NULL then filters against rows that no longer exist and the list prints empty.",
        },
        {
          answer: "p.id IS NULL",
          kind: "keyword",
          label: "the unmatched-leg filter",
          why: "p.id IS NULL keeps the 6 unmatched invoices — 15,217.00 of exposure, including #28's paid-status-no-payment anomaly. IS NOT NULL flips to the 22-invoice settled book; 1 = 1 opens the whole 28-invoice ledger onto a fraud call.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-hole-first direction",
          why: "Collections works the biggest exposure first: #24 at 4,937.00 tops the call. ASC leads with #18's 873.00 and burns the meeting on the smallest hole — right rows, wrong order, dead ten minutes.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the top-3 cut",
          noVerify: true,
          why: "LIMIT 3 delivers the call's opening slide — the three biggest holes (4,937.00 / 3,562.00 / 2,794.00) — from a 6-row book. It's a page-size, not a definition, so the audit skips its value check; 6 would ship the whole book.",
        },
      ],
      distractors: ["JOIN", "p.id IS NOT NULL", "1 = 1", "ASC", "6"],
      walkthrough: "The chase list is an anti-join wearing a collections hat. LEFT JOIN preserves all 28 invoices and hangs payment legs where they exist; WHERE p.id IS NULL keeps the six that never got one — 15,217.00 of exposure. The join to customers regionalizes the call (US 4,937.00, EU 8,524.00 across four invoices, APAC 1,756.00), and the sort ORDER BY amount DESC leads with #24's 4,937.00 hole. The list's star is #28: status 'paid', zero payment rows — a status the books claim and the money contradicts, which is why the chase reads the ANTI-JOIN and not the status column. Swap LEFT for INNER and the unmatched rows vanish before the filter sees them: empty list, clean call, wrong answer. Flip IS NULL to IS NOT NULL and you've shipped the settled book. *The anti-join is the only honest reader of what didn't happen — and #28 is what it exists to catch.*",
    },
    {
      id: "cs-mcdonalds-6",
      tier: "hard",
      topic: "q6",
      universe: "month-close",
      title: "The coverage census, staged",
      brief: "McDonald's-flavored brief on the storefront db: the month-close ships a coverage census — every invoice classified by what its MONEY did, not what its status claims: exact (settled to the cent), partial, or no payment. The build is staged: a paid CTE folds payment sums per invoice, a classes CTE LEFT JOINs them onto invoices with COALESCE(..., 0), and the CASE classifies. Probed facts: **21 exact / 65,612.00** billed and settled, **1 partial / 6,148.00** with 4,000.00 settled (invoice #25), **6 no payment / 15,217.00** — and the census catches what status hides: #28 (status paid, zero payments) lands in no payment, while void-but-settled #11 (925.00) sits inside exact.",
      ask: "Return the coverage census: coverage class, invoice count, billed (2 decimals), settled (2 decimals) — most invoices first.",
      template: "WITH paid AS (\n  SELECT invoice_id, SUM(amount_cents) AS paid_cents\n  FROM payments\n  GROUP BY invoice_id\n),\nclasses AS (\n  SELECT i.id, i.status, i.amount_cents,\n         COALESCE(paid.paid_cents, 0) AS paid_cents\n  FROM invoices i\n  LEFT JOIN paid ON paid.invoice_id = i.id\n)\nSELECT CASE\n         WHEN paid_cents = 0 THEN {1}\n         WHEN paid_cents = amount_cents THEN 'exact'\n         ELSE {2}\n       END AS coverage,\n       COUNT(*) AS invoices,\n       ROUND(SUM(amount_cents) / {3}, 2) AS billed,\n       ROUND(SUM(paid_cents) / 100.0, 2) AS settled\nFROM classes\nGROUP BY coverage\nORDER BY invoices {4}",
      slots: [
        {
          answer: "'no payment'",
          kind: "keyword",
          label: "the zero-settlement class label",
          why: "The paid_cents = 0 arm names the 6 invoices with no settlement — 15,217.00 billed, 0.00 settled, including #28 whose status claims paid. Any other literal relabels the hole ('void' reads as an accounting void, not a chase item) and the census misidentifies its own fraud row.",
        },
        {
          answer: "'partial'",
          kind: "keyword",
          label: "the in-between class label",
          why: "The ELSE arm names rows where 0 < paid < billed — exactly one: #25, 4,000.00 of 6,148.00. 'overpaid' would describe a class that doesn't exist and mislabel the one row that does; the ELSE is where half-truths live, so its label is the census's most-read cell.",
        },
        {
          answer: "100.0",
          kind: "keyword",
          label: "the billed-column divisor",
          why: "Invoice money is INTEGER cents: exact billed prints 65,612.00 only through /100.0. Dividing by 1000.0 shrinks the column to 65.61 — a census three orders of magnitude off that still sums internally, which is the worst kind of wrong.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-invoices-first direction",
          why: "The close reads the census biggest-class-first: exact 21, no payment 6, partial 1 — materiality leads, the one-row anomaly lands last where it belongs. ASC opens the close on the partial row and buries the 21-invoice majority.",
        },
      ],
      distractors: ["'overpaid'", "'void'", "1000.0", "ASC"],
      walkthrough: "The census is a two-stage fold because the classification compares an aggregate to its own base row — impossible inside the payment scan. Stage one folds payments per invoice; stage two LEFT JOINs that onto invoices and COALESCEs the absent legs to 0, because NULL = 0 is UNKNOWN and the six unpaid would vanish from every class. The CASE then reads money, not status: paid = 0 → 'no payment' (6 invoices / 15,217.00, with status-paid #28 hiding inside), paid = billed → 'exact' (21 / 65,612.00 — void-but-settled #11 at 925.00 sits here, proving the census outranks the status column), else 'partial' (1 / 6,148.00 with 4,000.00 settled — #25). The identity closes it: 21 + 1 + 6 = 28 invoices, and 65,612.00 + 6,148.00 + 15,217.00 = 86,977.00, the whole book. Swap a class label and the fraud row changes identity; mistune the divisor and every dollar cell shrinks while the counts stay plausible. *The census is the close's strongest exhibit because it classifies what the money did — and lets the status column explain itself to the auditors.*",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "First-order demand with a conditional percentage — the new-app-user promo-lift read, where the denominator is the population that actually placed a first order." },
    { slug: "immediate-food-delivery-i", why: "Placed-versus-kept demand, first pass: read the fulfillment window before any percentage lands — the ops board's front door on this db's transaction stream." },
    { slug: "sales-by-day-of-the-week", why: "Daypart demand pivot — breakfast commute versus late-night window, the staffing input computed as a column instead of eyeballed by the store manager." },
    { slug: "ads-performance", why: "Promo channel ratios with exposure-based shares — the lift readout's SQL heart: lifted ÷ shown, 100.0 before the division, ROUND at the end." },
    { slug: "transactions-per-visit-histogram", why: "Conversion histogram — transactions per account-visit bucketed: the QSR funnel's visit-to-order shape, zero-filled so the empty bands still print." },
    { slug: "spend-histogram", why: "Ticket bands via NTILE/CASE — the value-vs-core band histogram on transaction totals, the menu-mix board's raw material." },
    { slug: "average-time-of-process-per-machine", why: "Service time averaged per unit — fulfillment time per store, the same julianday-diff shape as the 2.98-day velocity board." },
    { slug: "trips-and-users", why: "Cancelled-rate by market with exclusion windows — the ops screen's hardest classic: cancelled ÷ placed with a population the filters keep trying to move." },
    { slug: "rank-scores", why: "The rank trio on tie-heavy data — store and market leaderboards where ROW_NUMBER, RANK and DENSE_RANK diverge exactly at the ties the room argues about." },
    { slug: "count-salary-categories", why: "Conditional counts stacked with UNION ALL — the grand-total stack's practice shape: branches, then the TOTAL row, same population both arms." },
    { slug: "reformat-department-table", why: "CASE pivots — rows to columns in one pass, the exact mechanic behind the market state board's delivered / in-transit / cancelled columns." },
    { slug: "weather-type-in-each-country", why: "Conditional flags per group — one scan, many states, the ops-room query budget in its purest form." },
    { slug: "find-stores-with-inventory-imbalance", why: "Supply imbalance across stores — stock vs sold per SKU per partner, the supply-side read that pre-empts the 86%-sold-out headset before the stockout." },
    { slug: "basket-depth-aov", why: "Basket depth and ticket together — lines per transaction beside 338.19 AOV, the mix read that separates bigger baskets from pricier ones." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share math with 100.0 before the division — participation rates for the app-account cohort, rounded once at the end like every QSR rate." },
    { slug: "average-selling-price", why: "Weighted price per window — menu-price mix math where the weighting choice changes the answer, a favorite follow-up on the 111.5 core-band average." },
    { slug: "product-sales-analysis-iii", why: "Per-SKU attach over a buy window — the LTO readout's bones: which menu items sold inside the promo period and which sat out, folded at the SKU grain." },
    { slug: "classes-more-than-5-students", why: "The HAVING-gate reflex in its purest form — 'at least N' is a group definition, the same clause-time lesson as the gate-3 expense census." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Argmax on the app-account cohort — the heaviest buyer (24 transactions, 7,262.35) surfaced by order count, with the tie policy the interviewer always asks for." },
    { slug: "number-of-rich-customers", why: "Big-ticket census above a threshold — the family-box readout: how many transactions cleared the premium band, counted once per account." },
    { slug: "ratings-histogram", why: "Bucket-and-count histogram — the ticket-band drill in another coat: value / core / premium counts printed as a bar chart's data layer." },
    { slug: "find-total-time-spent-by-each-employee", why: "Labor minutes folded per worker — the store-staffing input: julianday-diff style duration math aggregated at the unit that schedules shifts." },
    { slug: "employee-bonus", why: "Conditional payout eligibility — promo accruals as CASE: who earned the bonus window and who the ELSE arm quietly zeroes out." },
    { slug: "the-number-of-employees-which-report-to-each-employee", why: "Two-grain counting per manager — store headcounts beside transactions per market: COUNT(*) and COUNT(DISTINCT) coexisting in one board." },
    { slug: "maximum-transaction-each-day", why: "Per-day peak fold — the biggest ticket each service day, the argmax pattern the ops board runs before the hourly rush meeting." },
    { slug: "the-most-recent-three-orders", why: "Recency cut per account — the top-3-latest shape behind the app's 'your recent orders' rail, ranked and LIMIT-pinned." },
    { slug: "find-loyal-customers", why: "The repeat-visit census — accounts ordering 2+ times, the loyalty population behind the 63.5% concentration figure, enumerated with a HAVING gate instead of asserted." },
    { slug: "duplicate-emails", why: "Duplicate detection on app accounts — the dedupe screen that keeps one account per identity before any spend fold trusts its grain." },
    { slug: "article-views-ii", why: "Duplicate-row detection across dimensions — the same pattern that catches a double-booked settlement or a re-ship logged twice." },
    { slug: "count-student-number-in-departments", why: "LEFT JOIN zero-fill census — count the quiet rows too: markets and partners with no activity must print zeros, not vanish." },
    { slug: "sales-analysis-ii", why: "Converted-vs-missed demand — the anti-join flip: buyers who bought product X versus the population that never did, the chase-list shape on the demand side." },
    { slug: "bank-account-summary", why: "Deposit/withdrawal folds with zero-fill — the settlement summary's skeleton: money in, money out, and the accounts that never moved still on the board." },
  ],
};
