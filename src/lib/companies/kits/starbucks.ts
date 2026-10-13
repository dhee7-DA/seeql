// Starbucks — kit 9 of the Food & Quick-commerce domain (wave 6, Batch 92c).
// Global coffee at loyalty scale: the Rewards program is the data spine —
// member frequency ladders, per-market store throughput, offer
// personalization, and the redemption-settlement back office that keeps the
// stars economy honest.
// Pool provenance: Starbucks carries 3 tagged LC problems in
// company-pools.md (repeat-purchase-rate, find-loyal-customers,
// sales-by-day-of-the-week) — used verbatim as the tagged lead of the pool.
// The remaining 13 problems and all 30 topic slugs are theme-curated from the
// SQL band (Theme menu), every one mirroring a workflow Starbucks screens are
// known to probe (frequency ladders, per-member picks, month buckets,
// cancellation shares, settlement anti-joins).
// Cases run on the storefront db (scripts/company-facts.md, probed
// 2026-10-12): orders = registered store transactions (café + Mobile Order &
// Pay), shipped_at = fulfillment completion, customers = Rewards members,
// products = menu SKUs, suppliers = roasting/supply partners, region =
// market. On this training db fulfillment latency is stored in DAYS (avg
// 2.98, range 2..4) — the same julianday shape that reads minutes on
// production event streams. Invoices/payments are partner redemption
// settlements in INTEGER cents (divide by 100.0).

import type { CompanyKit } from "../types";

export const starbucksKit: CompanyKit = {
  id: "starbucks",
  domainId: "food",
  name: "Starbucks",
  tagline: "Global coffee: rewards, stores, personalization",
  accent: "text-green-500",

  brief: [
    "Starbucks is the world's largest coffee chain — tens of thousands of stores, a beverage engine that refreshes seasonally, and Starbucks Rewards, the loyalty program that turns a morning latte into a data relationship. The operating artifacts are frequency-shaped: `stars` earn-and-redeem ledgers, member visit ladders, Mobile Order & Pay queues, and per-market store throughput boards. Every analyst here learns the same first lesson: *a 'visit' is a member-store-day population, not a row count*, and every rate the loyalty team publishes — redemption load, repeat-visit share, offer conversion — is only as honest as its denominator.",
    "The data org splits along the member journey. Loyalty analytics owns the rewards economy — earn rates, star balances, redemption windows; store analytics owns throughput and labor — transactions per store-hour, mobile-order mix, peak dayparts; personalization owns the offer engine — who gets the double-star Saturday, and what the offer pulled them back for. The culture is SQL-first: a market review opens with a query, an offer readout is a query with its population sentence attached, and the transaction stream — `{emerald:placed}, {emerald:fulfilled}, {rose:cancelled}` — is the raw material every board folds.",
    "Interviews are hands-on SQL against a storefront-shaped schema, in a plain editor where your syntax errors are yours. Expect the two-grain census (**transactions AND members per market**), the frequency gate (members at 14+ visits — the tier this db defines), cancellation shares with placed denominators, and month-bucket seasonality — 2024-01's **3,731.97** peak against 2024-07's **1,193.86** trough is the shape they drill. Fulfillment latency reads `shipped_at - created_at` — here 82 of 103 orders carry a completion timestamp, averaging **2.98 days** on a 2..4 range. Settlement money beyond order totals is integer cents: redemption statements read `amount_cents / 100.0` or they read 100x too big.",
    "Prep like a loyalty analyst, not a generic SQL student. Drill frequency ladders (`COUNT(*)` per member, then HAVING gates), per-member window picks (ROW_NUMBER with PARTITION BY — the offer-eligibility query), month buckets with LAG momentum, and scalar-subquery baselines — *markets above the network ticket* is the house favorite. Say your population out loud before you write the FROM clause: {emerald:placed}, {rose:cancelled}, and {emerald:fulfilled} transactions are three different numerators, and the interviewer is grading the sentence you say before the query you type.",
  ],

  dayInLife: [
    "**08:05 —** open the loyalty health board before standup: yesterday's placed transactions, the {rose:cancelled} share against the PLACED denominator, and the visit ladder — how many members crossed their next visit tier. A market's repeat cohort looks thin; before pinging anyone, you re-run the census yourself: `COUNT(*)` for transactions, `COUNT(DISTINCT customer_id)` for members, side by side, because *a market can gain transactions while losing members* and the gap between the two columns is the whole story.",
    "**11:00 —** deep work: the offer-eligibility pick. The personalization team needs each member's most recent store transaction to time the next offer drop, so you stage a derived table, `ROW_NUMBER() OVER (PARTITION BY member ORDER BY visit DESC)`, and keep the rn column visible for audit — 16 members, 16 picks, zero fan-out. Mid-build the offer PM asks why one member's 'latest visit' moved backward; the answer is a late-arriving transaction restating the pick, *so you timestamp the snapshot in the dashboard footnote before the queue ships*.",
    "**15:15 —** store-throughput cycle: the monthly close review with market leads. You fold transactions per month with a `HAVING` gate, then hang LAG momentum off the fold — and the room catches the subtlety live: months filtered out by the gate are skipped by LAG too, so July's comparison lands on May, not the missing June. *Momentum over a filtered spine is a definition*, and you write the spine's WHERE clause on the whiteboard before anyone argues about the deltas.",
    "**17:45 —** write the EOD note: one screen, three folds — kept demand by market, the offer-eligibility pick list, month-over-month throughput with the LAG trap footnoted — each with its population sentence attached. Tomorrow's redemption-settlement review gets the anti-join pre-staged: six statements with no payment row, **15,217.00** in the dunning queue; *the note is one page because the queries are the exhibit*, and every figure in it re-runs in under a minute.",
  ],

  metrics: [
    {
      name: "Member visit ladder",
      what: "Transactions per member, banded. On this db the ladder reads 2 one-timers, 10 mid-band members (2-5 visits) and 4 power members up to 24 visits — the repeat-visit engine is the growth story, so the bands are watched weekly, not the average.",
    },
    {
      name: "Kept-demand share",
      what: "Kept transactions ÷ PLACED transactions. 103 placed, 7 {rose:cancelled} — 6.8% — but only if the denominator stays the full placed population. Filtering status first collapses every market's share and ships a lie.",
    },
    {
      name: "Fulfillment latency",
      what: "Completion minus order time over transactions that HAVE a completion timestamp: 82 of 103 here, avg 2.98 days on a 2..4 range. In production the identical julianday shape reads minutes for Mobile Order & Pay; the grain is a footnote you say out loud.",
    },
    {
      name: "Ticket (AOV)",
      what: "Transaction value ÷ transactions: 34833.28 ÷ 103 = 338.19 network-wide, spanning 25.47 solo runs to 1,088.44 office runs. Markets above and below the 338.19 baseline are the scalar-subquery comparison every screen drills.",
    },
    {
      name: "Stars redemption load",
      what: "Redeemed value ÷ earned value per period — the stars economy's burn gauge. The settlement ledger behind it is integer cents, so every redemption statement divides by 100.0 before it rounds; a missing /100.0 is a 100x incident.",
    },
    {
      name: "Offer conversion",
      what: "Members who transacted after a targeted offer ÷ members targeted. The pick list feeding it is a per-member window (latest visit, rank 1) — fan the join out and the numerator counts transactions twice, not members once.",
    },
    {
      name: "Market throughput",
      what: "Placed transactions and revenue per market: EU 45 / 15,089.23, APAC 37 / 11,605.45, US 19 / 7,286.16, LATAM 2 / 852.44. Two grains per row — transactions and members (8, 5, 2, 1) — and mixing them is the classic census bug.",
    },
    {
      name: "Seasonal momentum",
      what: "Month-over-month delta on the monthly transaction fold: 2024-01 peaks at 3,731.97, 2024-07 troughs at 1,193.86. LAG over the month spine computes it — but months the gate removes are skipped, so momentum inherits the spine's filters.",
    },
  ],

  topics: [
    {
      name: "Rewards frequency & repeat visits",
      why: "Starbucks Rewards is a frequency machine, and the first screen is always the visit fold: transactions per member, banded, gated with HAVING. The trap is grain — COUNT(*) counts transactions, COUNT(DISTINCT customer_id) folds repeat demand back to people, and the gap between them is visit intensity per member.",
      slugs: ["repeat-purchase-rate", "find-loyal-customers", "customer-order-frequency"],
    },
    {
      name: "Kept demand & cancellation math",
      why: "The loyalty board's most-watched ratio is kept ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows COUNT(*) divides. On this db that reads 7 of 103 = 6.8% — drill it until putting the status filter in the wrong clause feels physically wrong.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-i"],
    },
    {
      name: "Two-grain market census",
      why: "'Transactions AND members per market' opens every Starbucks market review: 45 transactions from 8 EU members, 37 from 5 APAC members, 19 from 2 US members. Two columns at two grains in one SELECT is the house census, and mixing the grains is the classic bug.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "article-views-ii"],
    },
    {
      name: "Personalization windows",
      why: "The offer engine runs on per-member picks: latest visit per member (ROW_NUMBER with PARTITION BY), favorite SKU per member, most recent three orders for the app rail. Screens drill the partition-per-member shape until the rn column, the WHERE rn = 1 and the anti-fan-out discipline are one motion.",
      slugs: ["the-most-recent-three-orders", "most-frequently-ordered-product-per-customer", "game-play-analysis-ii"],
    },
    {
      name: "Month buckets & seasonal throughput",
      why: "Coffee is seasonal and the store board is monthly: SUBSTR(created_at,1,7) buckets 103 transactions into 14 months, 2024-01's 3,731.97 peak against 2024-07's 1,193.86 trough. Buckets, gates and LAG momentum over the same spine are the throughput interview, end to end.",
      slugs: ["list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i", "the-latest-login-in-2020"],
    },
    {
      name: "Leaderboards & the rank trio",
      why: "Top markets by demand, top SKUs by attach, worst stores by cancellation — loyalty reporting is leaderboard reporting, and ties are everywhere. ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and LIMIT-boundary ties are the classic 'why does my top-8 return 9 rows' bug.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Rates with honest denominators",
      why: "Redemption load, repeat-visit share, offer conversion — Starbucks ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided before the ratio, ROUND only at the very end.",
      slugs: ["percentage-of-users-attended-a-contest", "queries-quality-and-percentage", "confirmation-rate"],
    },
    {
      name: "Dormant members & settlement anti-joins",
      why: "Anti-joins are the dunning team's daily bread: statements with no payment row, members with no redemption ever. On this db every member has transacted (never-ordered = 0 — the customer anti-join is empty), so the honest drill is the settlement ledger: 6 statements with no payment = 15,217.00 outstanding, anomaly #28 included.",
      slugs: ["find-churn-risk-customers", "customers-who-never-order", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Ticket baselines & scalar subqueries",
      why: "'Markets above the network ticket' is the favorite shape: the outer query folds 103 transactions into market tickets (LATAM 426.22, US 383.48) while a scalar subquery folds the same table once, globally — 338.19. HAVING judges each market against that single number, and the denominator you choose is the definition.",
      slugs: ["market-analysis-i", "game-play-analysis-iv", "find-expensive-cities"],
    },
    {
      name: "One-pass status folds",
      why: "Market reviews are query-budgeted: the status census, the market census and the SKU census each get one pass, not four scans. FILTER (WHERE …) and AVG-over-flags build a whole demand picture in one scan, with branch totals that must reconcile to COUNT(*).",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "ratings-histogram"],
    },
  ],

  theory: [
    {
      id: "sbx-t1",
      q: "The loyalty board shows 'placed transactions' and 'kept-demand share' side by side. Where does each number's population live, and why does filtering status in the wrong clause ruin the share?",
      a: "Placed transactions is COUNT(*) over the whole orders table — all 103 rows regardless of state. Kept-demand share is a conditional count over that SAME population: SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) in the numerator, COUNT(*) in the denominator, so the 7 cancelled rows read as 6.8%. The bug happens when you write WHERE status != 'cancelled' first: the denominator silently loses the cancelled rows, every market reads ~0% cancellations, and the board turns green overnight. The rule I follow: one population sentence per query — 'all placed transactions' — and the numerator is a flag inside it, never a WHERE outside it. *Denominators are definitions, not implementation details.*",
      tag: "aggregation",
    },
    {
      id: "sbx-t2",
      q: "Transactions join to members for the visit census. When do you COUNT(*) and when COUNT(DISTINCT customer_id), and what does the gap between them tell the business?",
      a: "COUNT(*) answers 'how many transactions' at transaction grain; COUNT(DISTINCT customer_id) answers 'how many members' at person grain, folding repeat demand back to people. On this db the EU market reads 45 transactions from 8 members, US 19 from 2 — the same query emits both columns, and the gap between them is visits per member. The trap is joining to order_items before the census: 103 transactions fan into 251 line rows and COUNT(*) becomes 251, a number nobody asked for. My discipline: fold at the grain the stakeholder speaks — *members and transactions per market in one pass, line items only when the question is about the basket*.",
      tag: "joins",
    },
    {
      id: "sbx-t3",
      q: "The offer-eligibility query picks each member's latest transaction with ROW_NUMBER. Walk me through the PARTITION BY choice, and what breaks if you partition on the wrong key.",
      a: "PARTITION BY member (c.id) makes the window restart per member, so ROW_NUMBER counts that member's transactions newest-first and WHERE rn = 1 keeps exactly one pick per member — 16 members, 16 picks here. Partition on o.id instead and every row becomes its own partition: rn = 1 for all 103, the filter is dead, and the 'pick list' is just the raw transaction stream wearing a window costume. Partition on c.region and you collapse to 4 picks — one member per market. The pick key IS the business definition: *one offer slot per member per cycle*, so the partition must be the member, the ORDER BY must be the visit timestamp, and I keep the rn column in the output so the pick is auditable on sight.",
      tag: "windows",
    },
    {
      id: "sbx-t4",
      q: "shipped_at is NULL until a fulfillment completes. What do COUNT(*), COUNT(shipped_at) and AVG over the latency diff each return, and which one feeds the promise board?",
      a: "COUNT(*) counts all 103 placed transactions; COUNT(shipped_at) counts only the 82 rows with a completion timestamp (52 delivered + 30 shipped); the AVG of julianday(shipped_at) - julianday(created_at) ignores NULLs automatically and reads 2.98 days over that same 82. The promise board wants latency over completed fulfillments only — including pending rows as zero latency would drag it down and lie about the promise. What I refuse to do is COALESCE the NULL to zero 'to fill the gaps': an order in flight has no latency yet, not zero latency. The honest query states its population — *82 completed of 103 placed* — and lets the pending 14 wait outside.",
      tag: "nulls",
    },
    {
      id: "sbx-t5",
      q: "Your alias works in ORDER BY but errors in WHERE. Explain with the evaluation pipeline, and where HAVING sits for the throughput gate.",
      a: "SELECT's aliases are created at the select step, which runs after FROM/JOIN/WHERE/GROUP BY but before ORDER BY — so `ORDER BY monthly_revenue` resolves, while `WHERE monthly_revenue > 2000` references a column that doesn't exist yet. The throughput gate lives in HAVING because it filters groups after the fold: HAVING COUNT(*) >= 7 keeps the months with 7-plus transactions — 11 of 14 on this db, dropping the three 6-order months. WHERE filters rows pre-fold (transaction-level facts like status); HAVING filters post-fold (month-level facts like volume). Saying the pipeline out loud — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT — is how I debug these *before* the editor does.",
      tag: "pipeline",
    },
    {
      id: "sbx-t6",
      q: "Find the markets whose average ticket beats the network average. Why a scalar subquery, and what breaks if you write the baseline as a second GROUP BY?",
      a: "The network baseline is one number — AVG(total) over all 103 transactions = 34833.28 ÷ 103 = 338.19 — while the market ticket is a per-group fold. A scalar subquery computes the global fold independently: HAVING AVG(o.total) > (SELECT AVG(total) FROM orders). Two markets clear it here (LATAM 426.22, US 383.48). If you try to join a second grouped copy back, you've built a derived table you don't need and invited a grain mismatch — the join fans out and the averages double-count. The scalar form keeps one query, one scan, one definition; *the baseline is a number, not a table*, and writing it that way makes the population explicit in the SQL itself.",
      tag: "subqueries",
    },
    {
      id: "sbx-t7",
      q: "Monthly throughput folds into a CTE, then LAG hangs momentum off it. The gate dropped three months — what does LAG compare against now, and how do you keep the board honest?",
      a: "LAG reads the previous row of whatever spine it runs over — after HAVING COUNT(*) >= 7 removed the three 6-transaction months, the spine has holes, so July's momentum compares against May's 2,910.31, not the missing June. That's not a bug; it's a definition — momentum-over-a-filtered-spine. The honesty fix is to decide the spine deliberately: if the board must compare adjacent calendar months, build the month spine from a date spine (or drop the HAVING) so LAG never skips; if the gate is the definition, footnote 'gated spine' on the board. On this db the ungated spine has all 14 months — 2024-01's 3,731.97 down the curve to 2025-02's 2,390.53 — and *the footnote is what stops a market lead from filing the delta as a data incident*.",
      tag: "dates",
    },
    {
      id: "sbx-t8",
      q: "Before the loyalty dashboard ships you get ten minutes of query review. What are the two-grain, cents and NULL checks you always run?",
      a: "Three checks, in order of how often they've burned me. Grain: every folded number states its population — 103 placed, 82 completed, 7 cancelled — and any join to order_items must pre-aggregate or the 251-line fan-out inflates counts. Cents: settlement money is integer cents, so anything touching redemption statements divides by 100.0 before it rounds — the six unsettled statements read 15,217 dollars, not 1,521,700 cents, and a missing /100.0 is a 100x incident. NULLs: NOT IN against a nullable column returns an empty set silently, so anti-joins go through LEFT JOIN … IS NULL or NOT EXISTS. *Ten minutes of population sentences is cheaper than a quarter of dashboard therapy* — that's the sentence I end reviews with.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "sbx-mcq-1",
      prompt: "On the training db, 82 of 103 transactions carry a fulfillment timestamp (shipped_at non-null). What does COUNT(shipped_at) return over all transactions?",
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
      id: "sbx-mcq-2",
      prompt: "The offer engine needs each Rewards member's LATEST transaction. Which PARTITION BY makes ROW_NUMBER() deliver exactly one pick per member?",
      choices: [
        "PARTITION BY customer id, ORDER BY created_at DESC",
        "PARTITION BY order id, ORDER BY created_at DESC",
        "PARTITION BY region, ORDER BY created_at DESC",
        "PARTITION BY created_at, ORDER BY customer id",
      ],
      answer: 0,
      why: "Partitioning by the member restarts the count per member; ordering newest-first puts rn = 1 on the latest transaction — 16 members, 16 picks on this db. WHERE rn = 1 is then the pick list.",
      notes: [
        { choice: 1, why: "Every transaction becomes its own partition — rn = 1 everywhere, the filter is a no-op, and the 'pick list' is all 103 rows." },
        { choice: 2, why: "That collapses to one pick per market — 4 rows on this db — silently dropping 12 members from the offer queue." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbx-mcq-3",
      prompt: "The seasonality board buckets transactions with SUBSTR(created_at, 1, 7). Why that slice and not the raw created_at column?",
      choices: [
        "'%Y-%m' strings sort and group chronologically; raw timestamps fragment into one bucket per instant",
        "SUBSTR is faster than GROUP BY",
        "Raw timestamps would include cancelled orders",
        "SUBSTR converts the text to a date type",
      ],
      answer: 0,
      why: "The month string '2024-01' … '2025-02' sorts lexicographically in calendar order and groups 103 rows into 14 clean buckets — the 3,731.97-to-1,193.86 seasonal shape falls out. The raw column groups per-timestamp: 103 one-row buckets.",
      notes: [
        { choice: 2, why: "Bucketing never filters — cancelled rows land in their months either way; excluding them is a separate WHERE decision with a denominator cost." },
        { choice: 3, why: "SUBSTR returns text, not a date — that's exactly why the '%Y-%m' shape works: sortable strings without a type conversion." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbx-mcq-4",
      prompt: "The VIP visit tier gates at COUNT(*) >= 14 transactions per member. How many members qualify on this db?",
      choices: ["3", "4", "5", "16"],
      answer: 0,
      why: "Exactly three members cross 14 transactions: Alice Chen 24, Emma Wilson 17, Grace Kim 14. Maya Patel sits at 13 — one visit short of the gate, and the HAVING clause is what makes that boundary honest.",
      notes: [
        { choice: 1, why: "That's the >= 13 tier — Maya's 13 slips in. The gate number IS the definition; 14 excludes her by design." },
        { choice: 3, why: "16 is every member in the db — all 16 have transacted at least once (never-ordered = 0), but the frequency gate is about repeat demand, not existence." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-5",
      prompt: "A redemption statement shows 92500 amount_cents, marked {rose:void}, but a settlement payment references it. What does ROUND(amount_cents / 100.0, 2) print, and why does the /100.0 matter?",
      choices: [
        "925.00 — settlement money is integer cents, so dollars need the /100.0",
        "92500 — cents are the reporting unit",
        "92.50 — cents divide by 1000",
        "NULL — ROUND over cents returns NULL",
      ],
      answer: 0,
      why: "invoices.amount_cents is integer cents: 92500 cents = $925.00 — and this exact row is the verified void-but-paid anomaly #11 in the reconciliation table. Every money figure leaving a cents table divides by 100.0 before it rounds.",
      notes: [
        { choice: 1, why: "Raw cents don't belong in a stakeholder memo — 92500 reads as a data error, and the audit of every settlement join starts with the /100.0." },
        { choice: 2, why: "That's the 1000x trap (milli-units). Cents-to-dollars is /100; the ROUND is for the fractional cents that remain after division." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-6",
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
        { choice: 1, why: "Joins absolutely change aggregates when they fan out — this is the single most common ticket bug in loyalty reporting." },
        { choice: 2, why: "Both sides scale, so the ratio shrinks rather than grows — the duplicated total divides by a duplicated count." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-7",
      prompt: "The monthly throughput query folds a CTE with HAVING COUNT(*) >= 7 (three 6-transaction months drop), then hangs LAG(revenue) OVER (ORDER BY month) on it. What does July's prev_revenue compare against?",
      choices: [
        "May's 2910.31 — LAG reads the previous surviving row, and June was filtered out",
        "June's 2047.43 — LAG reads calendar-adjacent months regardless of filtering",
        "NULL — the gap breaks LAG",
        "July's own revenue — LAG restarts after gaps",
      ],
      answer: 0,
      why: "LAG is a row-relative function over the query's spine, not the calendar: after HAVING removes June, July's previous row IS May. Momentum-over-a-gated-spine is a definition — footnote it, or build an ungated month spine if adjacency matters.",
      notes: [
        { choice: 1, why: "That's the calendar intuition, not the mechanics — LAG never consults dates it can't see; the filtered month is invisible to it." },
        { choice: 2, why: "LAG across a gap doesn't error or reset — it silently compares across the hole, which is exactly why the spine choice needs a footnote." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbx-mcq-8",
      prompt: "SELECT customer_id FROM members WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE total > 500) — the subquery's population can contain NULLs in production. What happens?",
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
      id: "sbx-mcq-9",
      prompt: "A market leaderboard built with ORDER BY revenue DESC LIMIT 3 keeps returning 4 rows after a teammate switches to RANK() with a rank filter. What class of bug is this?",
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
      id: "sbx-mcq-10",
      prompt: "Six redemption statements have no payment row; their amount_cents sum to 1521700. What does ROUND(SUM(i.amount_cents) / 100.0, 2) return, and what else is true of those six?",
      choices: [
        "15217.00 — and one of them is marked {emerald:paid} with zero payment rows (anomaly #28)",
        "15217.00 — and all six are marked open",
        "1521700.00 — the /100.0 is optional",
        "0.00 — SUM skips unpaid statements",
      ],
      answer: 0,
      why: "1521700 cents ÷ 100.0 = 15,217.00 across the 6 unsettled statements — five open, plus the verified paid-with-no-payments anomaly #28 at 1,756.00. The status column is exactly why the dunning queue needs a row-level read, not just a status filter.",
      notes: [
        { choice: 1, why: "Five are open; #28 is the trap — a statement can be marked paid while its settlement payment never landed, which is a reconciliation finding, not a filter predicate." },
        { choice: 2, why: "Skipping the /100.0 ships a 100x number — the single most expensive character omission in settlement reporting." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-sbx-1",
      tier: "medium",
      topic: "t6",
      universe: "growth",
      title: "The offer-eligibility pick",
      brief: "Starbucks-flavored brief on the storefront db: the personalization team loads the offer queue tonight, and the PM is blunt — 'one pick per Rewards member: their most recent store transaction, with the market attached; a member with a stale last-visit gets the winback offer instead of the seasonal drop.' The definition is fixed: latest = MAX(created_at) per member, delivered as ROW_NUMBER() OVER (PARTITION BY member ORDER BY visit DESC), rank 1 only, rank column kept visible so the queue is auditable. Probed facts: all **16 members** have transacted (never-ordered = 0), and the freshest picks run from Emma Wilson **2025-02-27** and Isabella Rossi **2025-02-25** back to Liam O'Brien 2024-03-06.",
      ask: "Return one row per member: member, market, last_visit, pick rank (1) — alphabetical by member.",
      template: "SELECT t.name AS member,\n       t.region AS market,\n       t.last_visit,\n       t.rn AS pick\nFROM (\n  SELECT c.name, c.region, o.created_at AS last_visit,\n         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY o.created_at {2}) AS rn\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n) t\nWHERE t.rn = {3}\nORDER BY member",
      slots: [
        {
          answer: "c.id",
          kind: "keyword",
          label: "the member partition key",
          why: "The window must restart per member — PARTITION BY c.id gives 16 partitions of one pick each. Partition by o.id and every transaction becomes its own partition (103 picks); partition by c.region and the queue collapses to one member per market.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the newest-first direction",
          why: "Latest visit means ORDER BY o.created_at DESC inside the window — rn = 1 lands on 2025-02-27 for Emma Wilson. ASC hands rank 1 to the member's OLDEST transaction: a winback offer sent to the most active member in the queue, with perfect confidence.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the pick rank",
          why: "WHERE t.rn = 1 keeps exactly one row per member — the pick. Rank 2 would return each member's second-latest visit, a queue that offers people what they already outgrew a visit ago; the visible rn column is what makes the cut auditable.",
        },
      ],
      distractors: ["o.id", "c.region", "o.created_at", "ASC", "2"],
      walkthrough: "An offer queue is a window pick, not a GROUP BY — the per-member identity has to survive the fold, and ROW_NUMBER is how. The derived table joins members to transactions (all 16 members have demand here; never-ordered = 0), stamps ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY o.created_at DESC), and the outer WHERE t.rn = 1 slices one pick per member: Emma Wilson 2025-02-27, Isabella Rossi 2025-02-25, Maya Patel 2025-02-10 — down to Liam O'Brien's 2024-03-06, whose pick IS the winback signal. Partition on o.id and the rn filter dies (all 103 rows are rank 1); partition on region and 12 members silently leave the queue; flip to ASC and the queue targets stale visits for active members. The rank column ships in the output because *a pick nobody can audit is a pick nobody trusts* — one late-arriving transaction restates it, and the footnote needs the mechanics, not an apology.",
    },
    {
      id: "cs-sbx-2",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "Throughput momentum, month over month",
      brief: "Starbucks-flavored brief on the storefront db: the month-close review needs the seasonal momentum board — monthly placed transactions and revenue, side by side with last month's revenue — and the market leads will read the deltas live. Definition is fixed: month = SUBSTR(created_at, 1, 7); the spine gates at COUNT(*) >= 7 (this db's 'stable months' bar), LAG(revenue) OVER (ORDER BY month) hangs the comparison. Probed facts: the ungated curve runs 2024-01 **3,731.97** down to 2024-07's **1,193.86** trough and back to 2025-02 **2,390.53**; the gate drops 2024-06 (6), 2024-11 (6) and 2025-01 (6), so July's momentum compares against May — *and the board must say so*.",
      ask: "Return the gated month spine with momentum: month, orders, revenue, prev_revenue (2 decimals) — chronological.",
      template: "WITH monthly AS (\n  SELECT {1} AS month,\n         COUNT(*) AS orders,\n         ROUND(SUM({2}), 2) AS revenue\n  FROM orders\n  GROUP BY month\n  HAVING COUNT(*) >= {5}\n)\nSELECT month, orders, revenue,\n       ROUND(LAG({3}) OVER (ORDER BY month {4}), 2) AS prev_revenue\nFROM monthly\nORDER BY month",
      slots: [
        {
          answer: "SUBSTR(created_at, 1, 7)",
          kind: "keyword",
          label: "the month bucket expression",
          why: "The '%Y-%m' slice buckets 103 transactions into sortable months — the seasonal spine. The raw created_at fragments into per-instant buckets and LAG compares microseconds apart; shipped_at buckets by fulfillment month and shifts a January order into February's story.",
        },
        {
          answer: "total",
          kind: "keyword",
          label: "the revenue column",
          why: "Revenue folds orders.total at transaction grain — 3,731.97 in the 2024-01 peak. Summing status folds text to zeros; customer_id adds up member ids; both print plausible-looking boards that reconcile to nothing.",
        },
        {
          answer: "revenue",
          kind: "keyword",
          label: "the LAG column",
          why: "Momentum is LAG(revenue) — last month's revenue beside this month's (2024-02 shows 3,731.97 against its own 3,609.64). LAG(orders) compares counts instead and ships a different board; the column you lag is the metric the room reads.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the spine direction",
          why: "LAG looks backward along ORDER BY month ASC — chronological. DESC flips the window: January's 'previous' becomes February's 3,609.64 and the whole board reads the future as the past, a momentum chart running backwards.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the stable-month gate",
          why: "HAVING COUNT(*) >= 7 keeps 11 of 14 months — the spine drops the three 6-order months (2024-06, 2024-11, 2025-01). The gate is the definition of 'stable'; at 8 it would drop five months and July's comparison would slide to April.",
        },
      ],
      distractors: ["created_at", "shipped_at", "unit_price", "orders", "DESC", "8"],
      walkthrough: "Momentum is a two-stage build: fold the spine, then hang the window off it. Stage one buckets with SUBSTR(created_at, 1, 7) and folds COUNT(*) and SUM(total) — the curve from 3,731.97 (Jan) through the 1,193.86 (Jul) trough. Stage two's HAVING COUNT(*) >= 7 drops the three 6-order months, and THIS is the teaching point the board must carry: LAG runs over the surviving rows, so July's prev_revenue is May's 2,910.31 — June is invisible to the window, not zero. Swap the bucket to raw created_at and the spine shatters into per-instant rows; bucket on shipped_at and demand migrates to fulfillment months; flip the window to DESC and every comparison reads backwards. The gate at 7 (not 8) keeps July itself on the board — *momentum over a gated spine is a definition, and the footnote naming the dropped months is what stops a market lead from filing June's absence as a data incident*.",
    },
  ],

  problems: [
    { slug: "repeat-purchase-rate", why: "TAGGED Starbucks problem (with Chipotle): the repeat-visit share is the loyalty program's headline rate — placed members vs returning members over the same placed denominator, the exact ratio the Rewards board publishes." },
    { slug: "find-loyal-customers", why: "TAGGED Starbucks problem (with Amazon, Google): gaps-and-islands over visit sequences — consecutive-month members are the streak cohort the earn-rate experiments chase, computed rather than asserted." },
    { slug: "sales-by-day-of-the-week", why: "TAGGED Starbucks problem (with Amazon): the daypart pivot — weekday commute volume against weekend linger, the labor-scheduling input every store manager files weekly." },
    { slug: "customer-order-frequency", why: "Members who visit at least N times in a window — literally the 14+ VIP tier gate (COUNT(*) >= 14 lives here), drilled until the HAVING-vs-WHERE boundary is reflex." },
    { slug: "immediate-food-delivery-ii", why: "First-order demand with a conditional percentage — the new-member first-week conversion read, where the denominator is the population that actually placed a first order." },
    { slug: "the-most-recent-three-orders", why: "The app's recent-orders rail: latest three transactions per member via ROW_NUMBER with a PARTITION — the same per-member pick shape as the offer queue, three slots deep." },
    { slug: "find-golden-hour-customers", why: "Members whose repeat visit lands inside the golden window — the winback-offer cohort, computed from date math rather than asserted by the campaign deck." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share math with 100.0 before the division — participation rates for the loyalty cohort, rounded once at the end like every Starbucks rate." },
    { slug: "rank-scores", why: "The rank trio on tie-heavy data — market leaderboards and star-tier ladders where ROW_NUMBER, RANK and DENSE_RANK diverge exactly at the ties the room argues about." },
    { slug: "market-analysis-i", why: "Markets above the network baseline via scalar subquery — the 338.19 ticket comparison, where the denominator you choose is the definition being graded." },
    { slug: "number-of-accounts-that-did-not-stream", why: "The anti-join census on a settlement-shaped table — the dunning queue's SQL heart: statements with no payment row, counted honestly with NOT EXISTS / LEFT JOIN IS NULL." },
    { slug: "confirmation-rate", why: "Confirmation share per member with NULL-tolerant rounding — the order-funnel's silent step, computed over the population that could confirm." },
    { slug: "average-time-of-process-per-machine", why: "Latency averaged per unit — fulfillment time per store, the same julianday-diff shape as the 2.98-day promise board." },
    { slug: "active-businesses", why: "One-pass conditional flags per market — how many demand states did this market fire; the query-budget census the monthly close runs on." },
    { slug: "queries-quality-and-percentage", why: "Ratio quality with rounded shares — redemption-load math where 100.0 placement and ROUND timing are the graded reflexes, not the arithmetic." },
    { slug: "rfm-segmentation", why: "NTILE quintiles over recency-frequency-monetary — the star-tier segmentation itself: five bands, every member tiled, no band invented by eyeball." },
  ],
};
