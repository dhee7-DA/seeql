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
  ],

  dayInLife: [
    "**07:40 —** open the ops board before the franchise call: yesterday's placed transactions, the {rose:cancelled} share against the PLACED denominator, and the per-market state columns — delivered, in-transit, cancelled — from one `CASE WHEN` pass. A market's cancelled column looks high; before escalating, you re-run the census yourself and check the branch totals sum back to COUNT(*) — *if the branches don't reconcile to the placed count, the board is lying and the call hasn't started yet*.",
    "**10:30 —** deep work: the promo-lift read. The value-menu window closed Sunday; you fold transactions per market inside and outside the window, gate with a `HAVING` on volume so thin markets don't headline, and hang the lift ratio on top with `100.0` before the division. Mid-build the pricing PM asks why one market's lift swings wild; the answer is a 2-transaction market — LATAM's **2 placed / 852.44** — *and you gate it out in the query rather than explain it away in the meeting*.",
    "**14:30 —** menu-mix cycle: the pricing review with the category team. The band fold prints value **8 SKUs @ 32.06**, core **8 SKUs @ 111.5**, premium empty — and the argument is whether a 199.99 limited-time SKU counts as premium. It doesn't: the band edge is `price >= 200`, the max on the menu is 199.99, and *moving the edge to win an argument is how boards stop meaning anything* — you footnote the edge and ship the fold.",
    "**17:30 —** write the EOD note: one screen, three folds — market state board, gated promo lift, menu-band mix — each with its population sentence attached. Tomorrow's franchise close gets the grand-total stack pre-staged: per-market revenue, then the `UNION ALL` TOTAL row (**34,833.28** network) leading the board; *the note is one page because the queries are the exhibit*, and every figure re-runs in under a minute.",
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
  ],

  topics: [
    {
      name: "Order states & kept demand",
      why: "The ops board's most-watched ratio is kept ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows COUNT(*) divides. On this db that reads 7 of 103 = 6.8% — drill it until putting the status filter in the wrong clause feels physically wrong.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-i"],
    },
    {
      name: "Market census, two grains",
      why: "'Transactions AND accounts per market' opens every ops review: 45 transactions from 8 EU accounts, 19 from 2 US accounts. The two columns at two grains in one SELECT is the house census, and mixing the grains is the classic bug — COUNT(*) counts transactions, COUNT(DISTINCT customer_id) counts people.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "unique-orders-and-customers-per-month"],
    },
    {
      name: "CASE pivots & one-pass boards",
      why: "The franchise ops room is query-budgeted: the market board gets ONE scan. CASE WHEN branches inside SUM build the placed / delivered / cancelled / in-transit columns in a single pass, and the branch totals must reconcile to COUNT(*) — the reconciliation IS the correctness test.",
      slugs: ["reformat-department-table", "rearrange-products-table", "weather-type-in-each-country"],
    },
    {
      name: "Menu-mix & price bands",
      why: "The menu is engineered in bands, and the band fold is a CASE histogram: value (< 50) 8 SKUs @ 32.06, core (50-200) 8 @ 111.5, premium empty at max price 199.99. Screens drill the band edge as a definition — moving 200 to 199 'to make the premium band exist' is the trap the interviewer plants.",
      slugs: ["spend-histogram", "product-price-at-a-given-date", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Store velocity & service latency",
      why: "Velocity is a latency fold: julianday(shipped_at) - julianday(created_at) over the 82 completed of 103 placed, avg 2.98 days, US 3.07 slowest among big markets. Per-store averages and top-performer gates drill the same shape the drive-thru timer reports.",
      slugs: ["average-time-of-process-per-machine", "find-top-performing-driver", "trips-and-users"],
    },
    {
      name: "Promo windows & date math",
      why: "Promos live in windows, and the lift read is date math before it is a ratio: transactions inside the window vs outside, repeat visits within N days, daypart pivots. Screens drill the boundary — >= vs > on the window edge decides which demand the promo gets credit for.",
      slugs: ["find-golden-hour-customers", "users-with-two-purchases-within-seven-days", "friday-purchases-i"],
    },
    {
      name: "Leaderboards & the rank trio",
      why: "Top markets by velocity, top SKUs by attach, worst markets by cancellation — ops reporting is leaderboard reporting, and ties are everywhere. ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and LIMIT-boundary ties are the classic 'why does my top-3 return 4 rows' bug.",
      slugs: ["rank-scores", "top-earners", "group-employees-of-the-same-salary"],
    },
    {
      name: "Joins across the franchise chain",
      why: "Partner revenue and menu attach fold through the chain — partners → menu SKUs → line items — and the fan-out discipline is the graded skill: 103 transactions fan into 251 lines, so COUNT(*) and SUM(o.total) drift unless the grain is pinned. INNER versus LEFT is a decision about who survives the board.",
      slugs: ["combine-two-tables", "average-selling-price", "product-sales-analysis-i"],
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
  ],
};
