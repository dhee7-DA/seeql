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
//
// 3x EXPANSION (append-only; every original byte preserved): brief 4→6,
// dayInLife 4→5, metrics 8→12, topics 10→15, theory sbx-t9..t24, mcqs
// sbx-mcq-11..30, cases cs-sbx-3..6 (families j7/t5/x3/q6 — pairwise distinct
// and distinct from the original t6/t7), problems 16→32. All new case figures
// re-probed against db/custom.db: settlement stack paid 21/66,443.00 + open
// 6/19,609.00 + void 1/925.00 = TOTAL 28/86,977.00 (banner-first under dollars
// DESC); coverage census exact 21/65,612.00, partial 1/6,148.00 (4,000.00
// received, statement #25), no payment 6/15,217.00 (anomaly #28 paid-no-leg at
// 1,756.00); rails card 16/37,364.00 + wire 11/32,248.00 = 69,612.00 tying to
// the ledger cash debit; supplier fold Nordic 11,130.25 / Midwest 9,294.93 /
// Alpine 4,765.63 under a 4,000.00 floor; lifetime-spend board Alice
// 7,262.35 / Emma 6,640.56 / Grace 4,574.23 with all 16 lifetime sums distinct.
// New topic/problem slugs are Theme-menu curated — Starbucks' tagged pool is
// exactly the 3 problems already used verbatim in the original kit.

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
    "Behind the loyalty boards sits the settlement back office, and it has its own economics. Twenty-eight partner redemption statements are booked at **86,977.00** — {emerald:paid} 21 for 66,443.00, {amber:open} 6 for 19,609.00, {rose:void} 1 for 925.00 — and the coverage census is the honest cut: 21 statements settle exact at **65,612.00**, one is partial (4,000.00 received of 6,148.00), six carry no payment at all and hold **15,217.00**, anomaly #28 included. Cash moves on two rails — {sky:card} 37,364.00 across 16 payments versus {violet:wire} 32,248.00 across 11 — and sourcing is just as concentrated: Nordic Gadgets carries **32%** of partner revenue and Midwest Hardware 26.7%, so the top two roasting partners hold 58.7% of the book.",
    "Prep for the expanded screen in four passes. Week one: rebuild the settlement stack — a `UNION ALL` grand-total fold over `invoices` (paid, open, void, then the **TOTAL** banner at 28 statements / 86,977.00) until the cents ÷ 100.0 reflex is automatic. Week two: the coverage census as a two-CTE build — fold payments per statement, classify exact/partial/no-payment, fold again — the shape that catches both #25's split and #28's silence. Week three: rank-after-fold boards — lifetime spend per member, `ROW_NUMBER` over the folded sum, a documented cut at the top three. Week four: drill the failure modes — wrong-key joins, integer division, windows over filtered spines — *because the interviewer grades the population sentence you say before the query you type*.",
  ],

  dayInLife: [
    "**08:05 —** open the loyalty health board before standup: yesterday's placed transactions, the {rose:cancelled} share against the PLACED denominator, and the visit ladder — how many members crossed their next visit tier. A market's repeat cohort looks thin; before pinging anyone, you re-run the census yourself: `COUNT(*)` for transactions, `COUNT(DISTINCT customer_id)` for members, side by side, because *a market can gain transactions while losing members* and the gap between the two columns is the whole story.",
    "**11:00 —** deep work: the offer-eligibility pick. The personalization team needs each member's most recent store transaction to time the next offer drop, so you stage a derived table, `ROW_NUMBER() OVER (PARTITION BY member ORDER BY visit DESC)`, and keep the rn column visible for audit — 16 members, 16 picks, zero fan-out. Mid-build the offer PM asks why one member's 'latest visit' moved backward; the answer is a late-arriving transaction restating the pick, *so you timestamp the snapshot in the dashboard footnote before the queue ships*.",
    "**15:15 —** store-throughput cycle: the monthly close review with market leads. You fold transactions per month with a `HAVING` gate, then hang LAG momentum off the fold — and the room catches the subtlety live: months filtered out by the gate are skipped by LAG too, so July's comparison lands on May, not the missing June. *Momentum over a filtered spine is a definition*, and you write the spine's WHERE clause on the whiteboard before anyone argues about the deltas.",
    "**17:45 —** write the EOD note: one screen, three folds — kept demand by market, the offer-eligibility pick list, month-over-month throughput with the LAG trap footnoted — each with its population sentence attached. Tomorrow's redemption-settlement review gets the anti-join pre-staged: six statements with no payment row, **15,217.00** in the dunning queue; *the note is one page because the queries are the exhibit*, and every figure in it re-runs in under a minute.",
    "**21:30 —** the settlement close, after the stores go quiet. The stack query runs first: {emerald:paid} **66,443.00**, {amber:open} 19,609.00, {rose:void} 925.00, and the `UNION ALL` banner row — **TOTAL 28 statements, 86,977.00** — leading the board because the dollars sort biggest-first. Then the coverage census: 21 exact at 65,612.00, one partial holding at 4,000.00 of 6,148.00, six silent statements worth **15,217.00**. #11 is still void-but-paid at 925.00 and #28 still paid with no payment leg at 1,756.00 — *both footnoted, neither chased tonight*. Last pass is the cross-foot: {sky:card} 37,364.00 plus {violet:wire} 32,248.00 equals the ledger's 69,612.00 cash debit, the trial balance reads 181,080.00 against 181,080.00, delta zero — and the note ships with every figure re-runnable in under a minute.",
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
    {
      name: "Partner concentration",
      what: "Revenue share by roasting partner through the two-hop fold (partners → menu SKUs → transaction lines): Nordic Gadgets 11,130.25 (**32%**), Midwest Hardware 9,294.93 (26.7%), Alpine Audio 4,765.63. The top two carry 58.7% of the book — concentration is the sourcing-risk line every quarterly review opens with, and the 4,000.00 HAVING floor is what keeps the long tail off the headline chart.",
    },
    {
      name: "Settlement book stack",
      what: "The `UNION ALL` grand-total board: 21 paid statements at 66,443.00, 6 open at 19,609.00, 1 void at 925.00, and the TOTAL banner at **28 / 86,977.00** leading the board. Branch dollars must reconcile to the banner to the cent — and every branch divides `amount_cents` by 100.0 before it rounds; one missing divisor and the banner reads 8,697,700.",
    },
    {
      name: "Payment coverage census",
      what: "Exact 21 / **65,612.00** billed and settled; partial 1 / 6,148.00 with 4,000.00 received (statement #25); no payment 6 / **15,217.00**. Coverage is computed from folded payment cash, never from the status column — #28 is marked paid yet has zero payment rows, which is precisely the gap a status filter hides.",
    },
    {
      name: "Rail mix",
      what: "Settlement cash by method: {sky:card} 16 payments / 37,364.00 versus {violet:wire} 11 / 32,248.00 — 69,612.00 total, tying to the ledger cash account's debit to the cent. The mix steers dunning strategy: wires settle slower, cards reverse cleaner, and a rail that drifts from its ledger foot is a finding before it is a trend.",
    },
  ],

  topics: [
    {
      name: "Rewards frequency & repeat visits",
      why: "Starbucks Rewards is a frequency machine, and the first screen is always the visit fold: transactions per member, banded, gated with HAVING. The trap is grain — COUNT(*) counts transactions, COUNT(DISTINCT customer_id) folds repeat demand back to people, and the gap between them is visit intensity per member.",
      slugs: ["repeat-purchase-rate", "find-loyal-customers", "customer-order-frequency", "sales-by-day-of-the-week", "find-golden-hour-customers", "average-time-of-process-per-machine", "not-boring-movies", "biggest-single-number", "bank-account-summary-ii"],
    },
    {
      name: "Kept demand & cancellation math",
      why: "The loyalty board's most-watched ratio is kept ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows COUNT(*) divides. On this db that reads 7 of 103 = 6.8% — drill it until putting the status filter in the wrong clause feels physically wrong.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-i", "ads-performance"],
    },
    {
      name: "Two-grain market census",
      why: "'Transactions AND members per market' opens every Starbucks market review: 45 transactions from 8 EU members, 37 from 5 APAC members, 19 from 2 US members. Two columns at two grains in one SELECT is the house census, and mixing the grains is the classic bug.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "article-views-ii", "product-sales-analysis-ii", "sales-analysis-i", "project-employees-i", "employee-bonus", "combine-two-tables", "investments-in-2016", "trips-and-users", "project-employees-ii"],
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
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "top-travellers"],
    },
    {
      name: "Rates with honest denominators",
      why: "Redemption load, repeat-visit share, offer conversion — Starbucks ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided before the ratio, ROUND only at the very end.",
      slugs: ["percentage-of-users-attended-a-contest", "queries-quality-and-percentage", "confirmation-rate", "fix-names-in-a-table"],
    },
    {
      name: "Dormant members & settlement anti-joins",
      why: "Anti-joins are the dunning team's daily bread: statements with no payment row, members with no redemption ever. On this db every member has transacted (never-ordered = 0 — the customer anti-join is empty), so the honest drill is the settlement ledger: 6 statements with no payment = 15,217.00 outstanding, anomaly #28 included.",
      slugs: ["find-churn-risk-customers", "customers-who-never-order", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Ticket baselines & scalar subqueries",
      why: "'Markets above the network ticket' is the favorite shape: the outer query folds 103 transactions into market tickets (LATAM 426.22, US 383.48) while a scalar subquery folds the same table once, globally — 338.19. HAVING judges each market against that single number, and the denominator you choose is the definition.",
      slugs: ["market-analysis-i", "game-play-analysis-iv", "find-expensive-cities", "employees-earning-more-than-their-managers", "actors-and-directors-who-cooperated-at-least-three-times"],
    },
    {
      name: "One-pass status folds",
      why: "Market reviews are query-budgeted: the status census, the market census and the SKU census each get one pass, not four scans. FILTER (WHERE …) and AVG-over-flags build a whole demand picture in one scan, with branch totals that must reconcile to COUNT(*).",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "ratings-histogram"],
    },
    {
      name: "Sourcing folds & partner concentration",
      why: "Supply-side Starbucks is a two-hop fold: roasting partners join to menu SKUs, SKUs join to transaction lines, and revenue rolls up per partner — Nordic Gadgets 11,130.25, Midwest Hardware 9,294.93, Alpine Audio 4,765.63. The traps are the join key (lines must land on product id, not order id — the wrong key returns zero or nonsense) and the fold expression (quantity times the line's unit price, not the catalog price, which drifts Nordic to 11,118.49).",
      slugs: ["product-sales-analysis-iii", "sales-analysis-iii", "average-selling-price"],
    },
    {
      name: "Grand-total stacks & set-op discipline",
      why: "The settlement book ships as a UNION ALL stack — paid, open, void, then a literal TOTAL banner at 28 / 86,977.00 — and the ORDER BY sits on the compound, sorting the banner to the top. Screens drill UNION ALL versus deduping UNION (the branches never collide here, so the choice is a contract, not a result), and why branch dollars must reconcile to the banner before the board ships.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "movie-rating"],
    },
    {
      name: "Frequency floors & HAVING gates",
      why: "Frequency is gated, not averaged: the VIP tier at 14+ visits keeps Alice (24), Emma (17) and Grace (14) while Maya sits at 13 on the sidewalk, and the sourcing floor at 4,000.00 keeps exactly three partners. HAVING filters the fold after it exists; WHERE filters rows before it — swap them and the gate either errors or quietly redefines the cohort.",
      slugs: ["classes-more-than-5-students", "number-of-employees-who-met-the-target", "customer-placing-the-largest-number-of-orders", "rfm-segmentation"],
    },
    {
      name: "Staged census CTEs",
      why: "The coverage census is a two-stage build: fold payments per statement in one CTE, classify exact/partial/no-payment against the fold in a second, then fold the classes. Stage the fold or the classification fans out — and grouping by a class computed in the same SELECT as its fold is exactly the alias-visibility trap the pipeline lesson teaches.",
      slugs: ["unique-orders-and-customers-per-month", "group-sold-products-by-the-date", "game-play-analysis-v"],
    },
    {
      name: "Rank-after-fold boards",
      why: "Lifetime-spend leaderboards rank a folded number, not a raw row: sum per member in a staged CTE, ROW_NUMBER over the folded sum in the next. All 16 lifetime sums here are distinct, so the cut at rank <= 3 is clean — but the drill is what changes when ties arrive, and why the cut lives in a staged layer, never in the window's own WHERE.",
      slugs: ["maximum-transaction-each-day", "the-most-recent-orders-for-each-product", "second-highest-salary"],
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
    {
      id: "sbx-t9",
      q: "The settlement board adds a running settled-to-date column: SUM over the payment spine ordered by paid_on. When do ROWS and RANGE frames disagree, and which do you ship?",
      a: "The default frame is RANGE UNBOUNDED PRECEDING to CURRENT ROW, and RANGE treats ORDER BY peers as one group: two payments on the same day both read the day's full running total, so the column jumps twice at once. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks one row at a time — each payment sees only the cash that actually landed before it. On distinct dates they agree, which is why the bug hides until a same-day double-settlement shows up on the spine. My rule: running money gets an explicit ROWS frame and a comment naming it, because *a frame you didn't choose is a definition someone else chose for you*. On this db the rails cross-foot card 37,364.00 plus wire 32,248.00 to 69,612.00 — the running column must land on that exact number, once.",
      tag: "windows",
    },
    {
      id: "sbx-t10",
      q: "You ship the settlement stack as UNION ALL with a TOTAL banner. Why UNION ALL and not UNION, and where does the ORDER BY go?",
      a: "UNION ALL appends; UNION dedupes. The stack's branches never collide here (paid/open/void versus the literal TOTAL row), so dedupe is a no-op today — but the contract you ship is the one that survives next quarter's data, and a deduping UNION silently eats legitimate identical branch rows, after which branch counts stop reconciling to the banner and nobody knows why. ORDER BY on a compound sits after the last branch and sorts the combined result — it resolves the first branch's aliases, which is exactly how ORDER BY dollars DESC drives the 86,977.00 banner to the top of the board. The discipline: identical column shapes per branch, the banner as a literal, *the sort on the compound, never inside a branch*.",
      tag: "setops",
    },
    {
      id: "sbx-t11",
      q: "Before ranking lifetime spend you stage it in a CTE. Why fold first and rank second, instead of doing both in one pass?",
      a: "Because a window over a GROUP BY mixes grains in one breath: ROW_NUMBER needs the folded number to exist before it can order it, and the only way to guarantee that is a staged layer — CTE or derived table — whose rows are already member-grain. Inline, you either window raw transactions (ranking visits, not members) or nest aggregates the parser refuses. The staged shape audits for free, too: the spends CTE prints 16 rows with 16 distinct sums, Alice 7,262.35 down to Olivia 444.80, and the rank layer cuts on top of a number you can point at. *Fold, then rank, then cut — three layers, three reviewable definitions*; one dense query has zero. That is why the lifetime board ships as two stages and not a one-liner nobody can defend.",
      tag: "staging",
    },
    {
      id: "sbx-t12",
      q: "Six settlement statements have no payment row. Walk me through the three anti-join shapes and when each is the right one.",
      a: "NOT IN (SELECT invoice_id FROM payments) is the seductive one and the dangerous one: a single NULL invoice_id in the subquery makes every comparison UNKNOWN and the list returns zero rows — silently. NOT EXISTS reads the intent out loud and stops at the first match; LEFT JOIN … IS NULL keeps the left rows and shows you the hole itself. On this db the honest drill is the settlement ledger: 6 statements, 15,217.00 outstanding, and one of them (#28) is marked paid — so a status filter would miss it even with the anti-join done right. I ship NOT EXISTS for gates, LEFT JOIN IS NULL when the analyst needs to see the unpaid rows, and never NOT IN over a nullable column. *The shape is a policy decision, not a style preference*.",
      tag: "nulls",
    },
    {
      id: "sbx-t13",
      q: "The coverage census classifies each statement exact/partial/no-payment, then counts classes. Why two CTEs, and why does GROUP BY coverage work?",
      a: "Stage one folds payments per invoice — one row per statement, paid_cents summed. Stage two LEFT JOINs statements to that fold and computes the CASE class beside the folded cash, with COALESCE(paid_cents, 0) so the silent six read zero rather than NULL. By the time the outer query runs, coverage is a plain column of the classes CTE, so GROUP BY coverage groups a real column — no alias-visibility problem, no 'aggregate not allowed in GROUP BY' error. Collapse fold and classification into one SELECT and you get fan-out (every payment row classified separately) or an illegal GROUP BY on a computed alias. *Two CTEs, two grains, one census*: 21 exact at 65,612.00, one partial, six silent — each number carrying its own definition.",
      tag: "ctes",
    },
    {
      id: "sbx-t14",
      q: "The market review wants each market's SKU mix as one cell. How do you build it, and what does GROUP_CONCAT quietly not promise?",
      a: "GROUP_CONCAT over the market fold produces one comma-joined cell per market — and the two things it does not promise are order and uniqueness. Order is unspecified (unless your SQLite version supports ORDER BY inside the aggregate), so the cell can reshuffle between runs; duplicates persist if the join fans out, so fold the line table first or the manifest lists one SKU three times. The default separator is a bare comma — 'Flat White,Cold Brew' — readable enough, but plan the parse. I ship GROUP_CONCAT for row-limited manifests and audit footnotes, never for anything a downstream machine consumes. *A text cell is a display decision; the fold beneath it is still a set* — and the set's grain is the thing you actually signed off on.",
      tag: "aggregation",
    },
    {
      id: "sbx-t15",
      q: "amount_cents is INTEGER, orders.total is REAL. What does each division actually compute, and where do teams get burned?",
      a: "INTEGER / INTEGER in SQLite is integer division: 400000 / 614800 = 0 — the #25 coverage ratio collapses to zero and the partial payment reads as nothing received. Anything divided by 100.0 promotes to floating point first, which is why settlement money divides by 100.0 before it rounds: 6,961,200 cents becomes 69,612.00. And ratios multiply by 100.0 before the division, not after — 100.0 * 400000 / 614800 is 65.06, while 400000 / 614800 * 100.0 is still zero. The sneaky part is that most cent figures divide evenly, so the bug passes review row after row and only detonates on the partial. *Type promotion is part of the metric definition*, which is why it lives in the query, not in the dashboard's formatting layer.",
      tag: "types",
    },
    {
      id: "sbx-t16",
      q: "In the coverage census, where does COALESCE belong and where does NULLIF, and what does each say to the reader?",
      a: "COALESCE(p.paid_cents, 0) speaks for the LEFT JOIN's hole: no payment fold exists, so the arithmetic reads zero — a defensible claim, the six silent statements genuinely have 0.00 settled. NULLIF is the opposite gesture: it turns a value back into NULL to say 'this number is not meaningfully here' — NULLIF(paid_cents, 0) keeps a display column honest instead of printing a manufactured 0.00, and NULLIF on a divisor turns a zero denominator into an explicit NULL rather than a silent collapse. They are not interchangeable: COALESCE manufactures data for arithmetic; NULLIF refuses to. *Pick the one whose sentence you can defend in the month-close review* — on this db that is COALESCE for the fold and NULLIF for presentation.",
      tag: "nulls",
    },
    {
      id: "sbx-t17",
      q: "Find members who transacted in consecutive calendar months. Sketch the gaps-and-islands shape and where it breaks.",
      a: "Bucket each transaction to its month string, collapse to distinct member-months, order by month inside the member, and stamp month_index = ROW_NUMBER() over that order. For true consecutive runs, the month's ordinal position minus the row number is constant — group by that constant and every group is an island; MIN and MAX of the month strings give its span. It breaks where the spine has holes the data never announces: a member active in January and March reads as two one-month islands, which is correct only if you have agreed that a skipped February breaks the streak — that is a definition to state, not infer. On this db the streak cohort feeds the earn-rate experiments, and *the island key IS the business rule*, so write it on the whiteboard before the query.",
      tag: "windows",
    },
    {
      id: "sbx-t18",
      q: "Why can ORDER BY reference an alias that WHERE cannot, and what does that imply for the settlement stack's sort?",
      a: "SELECT's aliases are born at the select step; WHERE runs before select, so a WHERE referencing an alias names a column that does not exist yet. ORDER BY runs after, so it resolves aliases — and on a compound like the UNION ALL settlement stack, the ORDER BY sits after the last branch, sorts the combined result, and borrows the first branch's column names. That is why ORDER BY dollars DESC is legal and drives the TOTAL banner to the top at 86,977.00, while WHERE dollars > 0 would error. HAVING is the fold's own filter — post-GROUP BY, pre-select — which is where the 14+ visit tier and the 4,000.00 sourcing floor both live. *Say the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and the legality of every clause answers itself*.",
      tag: "pipeline",
    },
    {
      id: "sbx-t19",
      q: "The partner fold counts listings as COUNT(DISTINCT p.id). Why DISTINCT, and when is COUNT(*) the right answer instead?",
      a: "The fold joins partners to products to line items: each product appears once per partner, but each line item repeats its product — a SKU bought forty times becomes forty rows. COUNT(*) counts those line rows and prints demand, not listings; COUNT(DISTINCT p.id) collapses the fan-out back to catalog grain — 3 listings for Nordic Gadgets, matching the fact sheet. The general rule: COUNT(*) is honest only at the grain you folded, and the moment a join can repeat a key, COUNT DISTINCT is the repair. The reverse trap is over-DISTINCTing: COUNT(DISTINCT customer_id) in the market census is right (8 EU members from 45 transactions), but DISTINCT over an already-unique grain just burns a sort. *Choose the count by naming the grain out loud first*.",
      tag: "joins",
    },
    {
      id: "sbx-t20",
      q: "The offer team wants 'days until the member's next visit'. What does LEAD return for the newest visit, and how do you present it?",
      a: "LEAD(created_at) OVER (PARTITION BY member ORDER BY created_at) returns NULL on each member's latest row — there is no next visit yet, and that NULL is information, not corruption: the member sits at the frontier of their own timeline. The bug is COALESCE-ing it to zero or to today's date, which fabricates an interval that makes hot members look dormant. Present the frontier explicitly: next_visit NULL means 'awaiting the next transaction — offer-eligible today', and every dated row computes a real gap. The same censoring shows on the month spine: LEAD over 2025-02, the last bucket, is NULL because February has no successor yet. *Window edges are where the data ends; a good query says so instead of filling the silence*.",
      tag: "windows",
    },
    {
      id: "sbx-t21",
      q: "Rank members by lifetime spend. Where does the rank function sit relative to the fold, and what is your tie policy?",
      a: "The fold comes first — SUM(o.total) per member in a staged CTE — and the rank sits in the next layer over the folded column; ranking raw transactions ranks visits, not members. On this db the policy is easy because all 16 lifetime sums are distinct: ROW_NUMBER, RANK and DENSE_RANK agree exactly, and the cut at rank <= 3 returns Alice 7,262.35, Emma 6,640.56, Grace 4,574.23 with no argument. The discipline is knowing what changes when ties arrive: RANK skips after a tie, DENSE_RANK does not, and ROW_NUMBER breaks ties arbitrarily unless you add a deterministic tiebreaker like name. *State the tie policy before the tie exists* — a leaderboard that discovers its rules during a live review has already lost the room.",
      tag: "windows",
    },
    {
      id: "sbx-t22",
      q: "A teammate's coverage census returns partial = 595. What class of bug is that, and how do you catch it before it ships?",
      a: "It is a wrong-key join on a folded table: the payments CTE was folded to statement grain — GROUP BY invoice_id exposes (invoice_id, paid_cents) — but the join reached for p.id, a column that no longer exists or exists with a different meaning. Grain dies at the fold: the only legal key back to statements is invoice_id, and joining anything else fans the census out — 595 'partials' is 28 statements multiplied by 27 payment rows, a number nobody checked against the table's own 28. The catches are cheap: reconcile any census to COUNT(*) of the base table first, and read the CTE's SELECT list before writing its join. *A join key is a definition of relatedness; the wrong key defines a fiction* — and fictions reconcile to nothing.",
      tag: "quality",
    },
    {
      id: "sbx-t23",
      q: "How do you make the settlement query audit itself, so the reviewer checks a sentence instead of re-deriving the math?",
      a: "Build the identities into the output. The stack's TOTAL banner must equal the sum of its branches — 66,443.00 + 19,609.00 + 925.00 = 86,977.00 — and the board shows all four numbers on one screen. The rails cross-foot to the ledger: card 37,364.00 plus wire 32,248.00 is 69,612.00, exactly the cash account's debit total. The trial balance ties at 181,080.00 debits against 181,080.00 credits, delta zero. Coverage counts must sum to 28: 21 + 1 + 6. Each identity is a query a reviewer runs in seconds, and any drift is a finding, not a formatting issue. *A number that carries its own cross-foot is the only kind worth shipping* — everything else is a promise someone else has to keep, usually during the audit that finds it.",
      tag: "quality",
    },
    {
      id: "sbx-t24",
      q: "This db is 103 orders. When does performance thinking still matter, and what transfers to production?",
      a: "The instincts, not the timings. Sargability — keeping functions off the filtered column so a plan can use an index — matters identically at a hundred million rows. One-pass censuses (CASE branches or FILTER over a single scan) beat four passes here and quadratically in production. A scalar subquery that references no outer column is a constant and evaluates once; a correlated one re-runs per row, which is waste at any scale. What does not transfer is panic: at 103 rows a cross join is a teaching tool, not an incident, and micro-optimizing before reading the plan is theater. The honest habit this db trains: name the scan, check the fan-out, then decide whether the query or the schema owes the fix. *Scale changes the numbers, never the reasoning*.",
      tag: "performance",
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
    {
      id: "sbx-mcq-11",
      prompt: "The settlement stack ships three status branches (paid, open, void) plus one TOTAL banner branch via UNION ALL. How many rows does the board show?",
      choices: ["4", "3", "28", "7"],
      answer: 0,
      why: "One row per branch: three status groups plus the appended banner — 4 rows. The 28 is the statement count folded inside the TOTAL row, not the board's row count.",
      notes: [
        { choice: 1, why: "That's the branch count without the banner — appending the TOTAL row is the entire point of the UNION ALL shape." },
        { choice: 2, why: "28 is COUNT(*) over invoices, a cell inside the TOTAL row. Confusing the folded count with the board's row count is the grain slip the two-grain census drills." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbx-mcq-12",
      prompt: "The card rail sums to 3,736,400 amount_cents across 16 payments. What does ROUND(SUM(amount_cents) / 100.0, 2) print?",
      choices: ["37364.00", "3736400.00", "3736.40", "37364"],
      answer: 0,
      why: "Settlement money is integer cents: 3,736,400 / 100.0 = 37,364.00 dollars — the card rail's verified total. The /100.0 runs before the ROUND, never after.",
      notes: [
        { choice: 1, why: "That's the missing-divisor 100x incident — raw cents in a stakeholder memo." },
        { choice: 2, why: "Cents-to-dollars is /100, not /1000 — that's the milli-unit trap." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbx-mcq-13",
      prompt: "The seasonality board buckets orders with SUBSTR(created_at, 1, 7). How many month buckets does the fold produce on this db?",
      choices: ["14", "12", "24", "1"],
      answer: 0,
      why: "Order dates run 2024-01-01 to 2025-02-27 with no empty months — 14 '%Y-%m' buckets, from 3,731.97 in 2024-01 down to 2025-02.",
      notes: [
        { choice: 1, why: "12 assumes one calendar year — the stream spans two Januaries and two Februaries." },
        { choice: 2, why: "24 assumes two full years — the data stops in February 2025." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbx-mcq-14",
      prompt: "The settlement stack's branch dollars must reconcile to the banner. Paid 66,443.00 + open 19,609.00 + void 925.00 = ?",
      choices: ["86977.00", "86677.00", "86997.00", "87977.00"],
      answer: 0,
      why: "66,443 + 19,609 + 925 = 86,977.00 — the TOTAL banner across all 28 statements. If the branches don't sum to the banner, a branch was filtered, not folded.",
      notes: [
        { choice: 1, why: "Off by 300 — a filtered branch or a fat-fingered digit; the cross-foot exists to catch exactly this." },
        { choice: 3, why: "That's 1,000 over — the kind of error a banner-first board surfaces in one glance, which is why the banner ships." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-15",
      prompt: "GROUP_CONCAT(p.name) over a market's menu SKUs — what separator does the default produce?",
      choices: ["A bare comma, no space", "A comma followed by a space", "A semicolon", "A pipe"],
      answer: 0,
      why: "The default separator is ',' with no space — 'Flat White,Cold Brew'. Explicit is better for exports; either way, order and uniqueness are not promised by the aggregate.",
      notes: [
        { choice: 1, why: "That's the comma-space you'd write deliberately — GROUP_CONCAT(x, ', ') — not the default." },
        { choice: 2, why: "Semicolons need a custom separator argument too; the default never invents one." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-16",
      prompt: "Running settled-to-date: SUM(amount_cents) OVER (ORDER BY paid_on). Two payments share the same paid_on. What does the DEFAULT frame do?",
      choices: [
        "RANGE includes both peers — both rows show the day's combined running total",
        "ROWS walks one row at a time — the second payment sees the first's cash",
        "The query errors on duplicate ORDER BY values",
        "The second row reads NULL",
      ],
      answer: 0,
      why: "The default frame is RANGE … CURRENT ROW, and RANGE treats ORDER BY peers as one group — same-day payments jump the running total together. ROWS … CURRENT ROW is the explicit frame that walks one row at a time.",
      notes: [
        { choice: 1, why: "That's ROWS — the frame you'd choose deliberately for running money, not the default you inherited." },
        { choice: 2, why: "Duplicate keys are legal in ORDER BY; the danger is silent, not syntactic." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbx-mcq-17",
      prompt: "In the coverage census, silent statements read COALESCE(p.paid_cents, 0). What does the settled column show for the six with no payment fold?",
      choices: ["0.00", "NULL", "15217.00", "The billed amount"],
      answer: 0,
      why: "COALESCE substitutes 0 cents for the missing fold, so after /100.0 the settled cell reads 0.00 — a defensible claim that no cash moved on those statements.",
      notes: [
        { choice: 1, why: "NULL is what the raw LEFT JOIN carries — the COALESCE exists precisely to turn that into arithmetic-ready zero." },
        { choice: 2, why: "15,217.00 is the six statements' BILLED total — mixing the billed and settled columns is the census's classic misread." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-18",
      prompt: "Months with fewer than 7 orders must leave the throughput spine. WHERE COUNT(*) >= 7 errors. Where does the gate go, and what survives?",
      choices: ["HAVING — 11 of 14 months survive", "WHERE — 11 of 14 months", "HAVING — all 14 months", "ORDER BY — 11 of 14 months"],
      answer: 0,
      why: "The gate filters groups after the fold, so it lives in HAVING: 11 of 14 months keep, dropping the three 6-order months (2024-06, 2024-11, 2025-01) — and LAG over the gated spine then skips them.",
      notes: [
        { choice: 1, why: "WHERE can't see aggregates at all — it filters rows before the fold exists." },
        { choice: 3, why: "ORDER BY sorts, never filters — the three 6-order months would stay on the board." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-19",
      prompt: "On the UNION ALL settlement stack, ORDER BY dollars DESC sits after the last branch. What exactly does it sort?",
      choices: [
        "The combined 4-row result, resolving dollars from the first branch's alias",
        "Only the last branch's rows",
        "Each branch independently, then concatenates",
        "Nothing — ORDER BY is illegal on compounds",
      ],
      answer: 0,
      why: "An ORDER BY on a compound sorts the whole combined result and may reference the first SELECT's output names — that's how the 86,977.00 TOTAL banner sorts to the top. A branch-local sort cannot survive a set operation.",
      notes: [
        { choice: 1, why: "Branch-local ORDER BY is ignored or rejected in a compound — only the final one counts." },
        { choice: 3, why: "It's not just legal, it's the standard shape — the banner-first board depends on it." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbx-mcq-20",
      prompt: "The coverage census joins invoices to a CTE folded per invoice. Why does ON p.id = i.id fail?",
      choices: [
        "The fold dropped payment grain — the CTE exposes invoice_id and paid_cents, no id column",
        "p.id is a reserved name",
        "CTEs cannot be joined",
        "JOIN requires table aliases to match",
      ],
      answer: 0,
      why: "After GROUP BY invoice_id, the CTE's grain is statement — its SELECT list is (invoice_id, paid_cents) and p.id simply doesn't exist. Even where a wrong key exists, joining statement grain to the wrong statement key defines a fiction: 595 'partials' instead of 1.",
      notes: [
        { choice: 2, why: "CTEs join like any table — the failure is the column list, not the mechanism." },
        { choice: 3, why: "Aliases are free to differ; the census joins invoices i to paid p happily when the keys are right." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbx-mcq-21",
      prompt: "Market AOVs read EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. Their simple average versus the network ticket of 338.19?",
      choices: [
        "364.67 — and the gap is why you never average averages",
        "338.19 — identical by construction",
        "426.22 — the max dominates",
        "313.66 — the min dominates",
      ],
      answer: 0,
      why: "(335.32 + 313.66 + 383.48 + 426.22) / 4 = 364.67, far above the true network ticket 338.19 (34,833.28 / 103). Market transaction counts differ (45, 37, 19, 2), so only a weighted fold reproduces the network number.",
      notes: [
        { choice: 1, why: "Averaging averages ignores the weights — LATAM's 426.22 counts as much as EU's 335.32 despite representing 2 transactions, not 45." },
        { choice: 2, why: "The max is one market's ticket, not any network definition — the scalar baseline folds the same table once, globally." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbx-mcq-22",
      prompt: "The partner fold counts listings as COUNT(DISTINCT p.id). What would COUNT(*) count instead?",
      choices: [
        "Line-item rows — a SKU bought repeatedly repeats once per line",
        "The same listing count",
        "The number of partners",
        "Nothing — it errors",
      ],
      answer: 0,
      why: "The fold joins partners to SKUs to transaction lines, so COUNT(*) counts line rows — demand, not catalog. COUNT(DISTINCT p.id) collapses the fan-out back to 3 listings for Nordic Gadgets.",
      notes: [
        { choice: 1, why: "Identical only if every product sold exactly once — the 251-line reality makes them diverge immediately." },
        { choice: 2, why: "Partners are the fold's groups, not its rows — COUNT(*) is scoped inside each group." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbx-mcq-23",
      prompt: "Fulfillment latency is julianday(shipped_at) - julianday(created_at). Which population does AVG run over on this db?",
      choices: ["The 82 rows with shipped_at non-NULL", "All 103 rows", "Only the 52 delivered rows", "Only the 14 pending rows"],
      answer: 0,
      why: "AVG ignores NULLs automatically, so the average runs over the 82 completed fulfillments (52 delivered + 30 shipped) and reads 2.98 days on a 2..4 range. Saying that population out loud is the grain the promise board publishes.",
      notes: [
        { choice: 1, why: "Including in-flight rows would drag the average down — they have no latency yet, not zero latency." },
        { choice: 2, why: "Delivered-only is a different definition — shipped orders carry completion timestamps too, and the board states which population it chose." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbx-mcq-24",
      prompt: "The classes CTE keeps COALESCE(p.paid_cents, 0) for arithmetic. What does NULLIF(paid_cents, 0) change in a display column?",
      choices: [
        "Silent statements show NULL instead of a manufactured 0.00 — 'not meaningfully here'",
        "They show 0.00",
        "They drop from the result",
        "It converts cents to dollars",
      ],
      answer: 0,
      why: "NULLIF turns the sentinel back into NULL: the settled column then says 'no payment event' rather than asserting a zero-dollar settlement. COALESCE makes data for math; NULLIF refuses to for display.",
      notes: [
        { choice: 1, why: "That's the COALESCE behavior the CTE already has — the question asks about the opposite gesture." },
        { choice: 3, why: "No conversion happens — NULLIF(x, 0) either passes x through or returns NULL." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-25",
      prompt: "All 16 lifetime sums are distinct, so WHERE rnk <= 3 and ORDER BY lifetime DESC LIMIT 3 return the same rows. Why does the board still ship the rank form?",
      choices: [
        "Rank survives ties with an explicit policy — LIMIT cuts them arbitrarily",
        "LIMIT is slower on this table",
        "Windows are required by the platform",
        "They are never equivalent",
      ],
      answer: 0,
      why: "With distinct sums the two agree — Alice 7,262.35, Emma 6,640.56, Grace 4,574.23 — but the rank form states its tie policy (ROW_NUMBER, RANK or DENSE_RANK) in the SQL while LIMIT silently picks, and the rank column ships in the output, auditable.",
      notes: [
        { choice: 2, why: "Nothing requires windows — the preference is auditability under ties, not syntax." },
        { choice: 3, why: "On tie-free folds they are exactly equivalent — which is the trap: the equivalence is data-dependent, not guaranteed." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-26",
      prompt: "Settled-to-date must add cash one payment at a time, even when two payments share a date. Which frame ships?",
      choices: [
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "No frame — the default is fine",
        "PARTITION BY paid_on",
      ],
      answer: 0,
      why: "ROWS walks one row at a time, so same-date payments stack in arrival order instead of jumping together. RANGE — the default — treats ORDER BY peers as one group and double-counts the day in both rows.",
      notes: [
        { choice: 2, why: "The default IS RANGE — inheriting it is exactly how the peer-jump bug ships." },
        { choice: 3, why: "Partitioning by paid_on restarts the running total every day — a different board entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-27",
      prompt: "The market screen computes the network ticket (338.19) inside a scalar subquery. When does that subquery re-evaluate?",
      choices: [
        "Never per row — it references no outer column, so it evaluates as a constant",
        "Once per market row",
        "Once per transaction row",
        "SQLite refuses to run it",
      ],
      answer: 0,
      why: "(SELECT AVG(total) FROM orders) references nothing from the outer query — one evaluation, one baseline, compared in HAVING against every market's fold. Make it correlated (a WHERE on the outer market) and it re-runs per group, recomputing the same number for nothing.",
      notes: [
        { choice: 2, why: "That's the correlated shape — per-row cost for a constant answer, the classic wasted scan." },
        { choice: 3, why: "The query runs fine — it's the house favorite for 'markets above the network ticket'." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbx-mcq-28",
      prompt: "A status list built with UNION meets NULLs: SELECT status FROM invoices WHERE amount_cents > 800000 UNION SELECT NULL. What does UNION do with duplicate NULLs?",
      choices: [
        "Dedupes them — set operations treat NULLs as equal",
        "Keeps both NULLs",
        "Errors on NULL comparison",
        "Converts NULL to 0",
      ],
      answer: 0,
      why: "In set operations NULLs compare as equal, so UNION collapses duplicate NULL rows to one — while WHERE x = NULL never matches. It's the one context where NULL equality holds, and a reason the deduping UNION can surprise you.",
      notes: [
        { choice: 1, why: "That's UNION ALL — which is exactly why the settlement stack prefers it: append, never dedupe." },
        { choice: 2, why: "No error — three-valued logic resolves quietly, which is what makes set-op NULL handling worth knowing." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbx-mcq-29",
      prompt: "LEAD(revenue) OVER (ORDER BY month) runs on the 14-month spine. What does 2025-02's next_revenue read?",
      choices: ["NULL — there is no next bucket", "0.00", "3,731.97 — it wraps to 2024-01", "It errors"],
      answer: 0,
      why: "2025-02 is the spine's last row; LEAD has nothing ahead and returns NULL — the window's edge is information ('no successor yet'), not corruption. COALESCE-ing it to zero would fabricate a month.",
      notes: [
        { choice: 1, why: "Zero asserts a month with no revenue existed — it didn't; the calendar just ended." },
        { choice: 2, why: "Windows never wrap — LEAD is row-relative on the spine, not circular." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbx-mcq-30",
      prompt: "Statement #25 received 400,000 cents of 614,800. What does 400000/614800 return in SQLite, and what's the fix?",
      choices: [
        "0 — integer division; multiply by 100.0 first to read 65.06",
        "0.65 — it's already a ratio",
        "65 — integer division rounds",
        "NULL — division at these magnitudes fails",
      ],
      answer: 0,
      why: "INTEGER / INTEGER truncates: 400000/614800 is 0, so the partial payment reads as nothing received. 100.0 * 400000 / 614800 promotes to REAL first and reads 65.06 — multiply before the divide; the 100.0's placement is the whole bug.",
      notes: [
        { choice: 1, why: "That's the REAL-division result — INTEGER operands never produce it without the 100.0 promotion." },
        { choice: 2, why: "Integer division truncates toward zero, it doesn't round — 0.65 floors to 0." },
      ],
      difficulty: "hard",
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
    {
      id: "cs-sbx-3",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "Partner concentration ledger",
      brief: "Starbucks-flavored brief on the storefront db: the sourcing review opens with partner concentration, and the supply lead is blunt — 'fold revenue through the menu: roasting partners join to SKUs, SKUs to transaction lines; revenue is quantity times the line's unit price, not the catalog price, and I only want partners carrying at least 4,000.00.' Probed facts: the fold reads Nordic Gadgets **11,130.25**, Midwest Hardware **9,294.93**, Alpine Audio 4,765.63 — the 4,000.00 floor keeps exactly these three and drops Andes (3,613.25), Shenzhen (3,049.07) and Pacific (2,980.15).",
      ask: "Return partner, SKU listings and line revenue (2 decimals) for partners at or above the 4,000.00 floor — biggest first.",
      template: "SELECT s.name AS partner,\n       COUNT(DISTINCT p.id) AS listings,\n       ROUND(SUM({1} * {2}), 2) AS revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON {3}\nGROUP BY s.name\nHAVING SUM(oi.quantity * oi.unit_price) >= {4}\nORDER BY revenue DESC",
      slots: [
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the units column",
          why: "Revenue multiplies units moved by what each unit actually sold for — SUM(oi.quantity * oi.unit_price) reproduces Nordic's 11,130.25. Summing unit_price alone halves the figure; quantity-squared folds 25,648.29 of nonsense that reconciles to no ledger.",
        },
        {
          answer: "oi.unit_price",
          kind: "keyword",
          label: "the line price column",
          why: "The line's unit_price is what the customer paid — the catalog p.price drifts Nordic to 11,118.49, plausible-looking and wrong. Price histories move; the line records the truth of that transaction.",
        },
        {
          answer: "oi.product_id = p.id",
          kind: "keyword",
          label: "the line-to-SKU join key",
          why: "Lines land on products via product_id — join on order_id instead and no order id ever equals a product id: the fold returns zero rows, a sourcing report with no sourcing in it.",
        },
        {
          answer: "4000",
          kind: "number",
          noVerify: true,
          label: "the concentration floor",
          why: "HAVING SUM(...) >= 4000 keeps exactly three partners — Nordic, Midwest, Alpine — and drops the 3,613.25-and-under tail. At 3,000 the tail floods back; at 9,000 Alpine leaves; the floor IS the definition of 'concentrated book'.",
        },
      ],
      distractors: ["p.price", "oi.quantity * oi.quantity", "oi.order_id = p.id", "9000", "3000", "11130.25"],
      walkthrough: "A sourcing fold is a two-hop join folded once: partners → SKUs on supplier_id, SKUs → lines on product_id, then SUM(quantity * unit_price) per partner — Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, and the HAVING floor at 4,000.00 keeps exactly those three. The catalog price is the classic drift: p.price in the fold prints Nordic 11,118.49, close enough to survive a glance and wrong to the cent. The join key is the other trap — oi.order_id = p.id matches nothing (0 rows), while a squared quantity folds 25,648.29 that no ledger has ever seen. The floor is a definition: 3,000 re-admits the whole six-partner tail, 9,000 hides Alpine, and *a concentration chart whose cutoff nobody can quote is a chart nobody can act on*.",
    },
    {
      id: "cs-sbx-4",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The lifetime-spend board",
      brief: "Starbucks-flavored brief on the storefront db: the loyalty team's quarterly deck leads with the lifetime-spend board — 'fold spend per Rewards member, rank the folds, keep the top 3 with the rank column visible; the deck cites members, not transactions.' Probed facts: the fold reads Alice Chen **7,262.35**, Emma Wilson 6,640.56, Grace Kim 4,574.23 as ranks 1-3 — and all **16** lifetime sums are distinct, so the cut at rank <= 3 is clean, no tie policy to argue.",
      ask: "Return member, market, lifetime spend (2 decimals) and rank for the top 3 — rank order.",
      template: "WITH spends AS (\n  SELECT c.name AS member, c.region,\n         SUM(o.total) AS lifetime\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  GROUP BY c.id\n),\nranked AS (\n  SELECT member, region, ROUND(lifetime, 2) AS lifetime,\n         ROW_NUMBER() OVER (ORDER BY {1}) AS rnk\n  FROM spends\n)\nSELECT member, region, lifetime, rnk\nFROM ranked\nWHERE rnk <= {2}\nORDER BY rnk {3}",
      slots: [
        {
          answer: "lifetime DESC",
          kind: "keyword",
          label: "the ranking order",
          why: "Biggest spend first: ORDER BY lifetime DESC lands rank 1 on Alice's 7,262.35. ASC hands the podium to the three SMALLEST members — Olivia 444.80, Dmitri 599.26, Jamal 645.60 — a VIP list of the winback queue.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the podium cut",
          why: "WHERE rnk <= 3 keeps Alice, Emma and Grace — the verified top three. At 4 Maya Patel's 3,644.56 slips in and the deck's podium grows a member nobody approved.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the board direction",
          why: "ORDER BY rnk ASC reads 1, 2, 3 — Alice at the top, the way a podium reads. DESC lists Grace, Emma, Alice, an upside-down board; sort by lifetime instead and the rank column stops matching the visual order.",
        },
      ],
      distractors: ["lifetime", "region", "member", "rnk", "4", "1"],
      walkthrough: "Rank-after-fold is two stages because a window cannot rank a number that doesn't exist yet: stage one folds SUM(o.total) per member — 16 rows, 16 distinct sums, Alice 7,262.35 down to Olivia 444.80 — and stage two stamps ROW_NUMBER() OVER (ORDER BY lifetime DESC) and cuts at rnk <= 3: Alice, Emma 6,640.56, Grace 4,574.23. Flip the window to ASC and the 'top' board is the three smallest spenders; order by region or name and the podium is arbitrary members wearing rank numbers. The cut is a definition: 4 admits Maya's 3,644.56, 1 leaves Alice alone. All sums are distinct here, so ROW_NUMBER, RANK and DENSE_RANK agree — *but the board ships the rank form anyway, because the day a tie arrives, the policy is already written in the SQL*.",
    },
    {
      id: "cs-sbx-5",
      tier: "medium",
      topic: "x3",
      universe: "refund-audit",
      title: "The settlement stack with the TOTAL banner",
      brief: "Starbucks-flavored brief on the storefront db: the settlement review ships one board — status branches plus a grand-total banner, dollars not cents. Probed facts: {emerald:paid} 21 statements / **66,443.00**, {amber:open} 6 / 19,609.00, {rose:void} 1 / 925.00, and the banner reads **TOTAL 28 / 86,977.00**, leading the board because the dollars sort biggest-first. The branches must reconcile to the banner — 66,443.00 + 19,609.00 + 925.00 = 86,977.00, no orphans, no double-count.",
      ask: "Return bucket, statement count and dollars (2 decimals) per status plus the TOTAL banner — biggest dollars first.",
      template: "SELECT {1} AS bucket,\n       COUNT(*) AS statements,\n       ROUND(SUM({2}) / {4}, 2) AS dollars\nFROM invoices\nGROUP BY status\nUNION ALL\nSELECT {3}, COUNT(*),\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM invoices\nORDER BY dollars {5}",
      slots: [
        {
          answer: "status",
          kind: "keyword",
          label: "the bucket expression",
          why: "The bucket IS the statement status — SELECT status AS bucket over GROUP BY status builds the three branches the review reconciles. Bucket on amount_cents and each group wears an arbitrary statement's amount as its name, a stack that reads like noise.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the money column",
          why: "The settlement ledger stores integer cents in amount_cents — SUM(amount_cents) / 100.0 prints 86,977.00. Summing the status text folds to zeros; there is no other money column on this table.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the banner literal",
          why: "The banner branch appends a literal 'TOTAL' label so the grand row is self-describing on the board. Any other literal ships a banner that lies about what it is — and the reviewer's cross-foot starts at the label.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "amount_cents is integer cents: divide by 100.0 and 8,697,700 cents reads 86,977.00 dollars. Divide by 10 and every figure inflates tenfold — the 100x-family incident, one keystroke wide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the board order",
          why: "ORDER BY dollars DESC leads with the 86,977.00 banner, then paid, open, void — biggest first, the way the room reads it. ASC buries the banner at the bottom, beneath the 925.00 void.",
        },
      ],
      distractors: ["'OPEN'", "'paid'", "paid_on", "10", "1000", "ASC"],
      walkthrough: "A grand-total stack is one fold twice: the first branch GROUPs BY status and folds COUNT(*) and SUM(amount_cents) / 100.0 — paid 21 / 66,443.00, open 6 / 19,609.00, void 1 / 925.00 — and the second branch folds the whole table with a literal 'TOTAL' banner: 28 / 86,977.00. UNION ALL appends; the ORDER BY sits on the compound and drives the banner to the top under DESC. The traps are all one-keystroke wide: /10 inflates every figure tenfold, an 'OPEN' banner labels the grand row as a status it isn't, and ASC demotes the banner below the void — *a board whose biggest number isn't its first row has already lost the room's attention*. Branch-to-banner reconcile is the audit: 66,443.00 + 19,609.00 + 925.00 = 86,977.00, every run, no exceptions.",
    },
    {
      id: "cs-sbx-6",
      tier: "hard",
      topic: "q6",
      universe: "fraud",
      title: "Coverage census: exact, partial, silent",
      brief: "Starbucks-flavored brief on the storefront db: the fraud spot-check wants the payment coverage census — 'fold each statement's payments, classify exact / partial / no payment, then count classes; a statement marked paid with zero payment rows is the finding, so classify from folded cash, never from status.' Probed facts: exact 21 / **65,612.00** billed and settled; partial 1 / 6,148.00 with 4,000.00 received (statement #25); no payment 6 / **15,217.00** with zero settled — #28 sits there, marked paid.",
      ask: "Return coverage class, statement count, billed and settled dollars (2 decimals) — busiest class first.",
      template: "WITH paid AS (\n  SELECT {1}, SUM(amount_cents) AS paid_cents\n  FROM payments\n  GROUP BY invoice_id\n),\nclasses AS (\n  SELECT i.id, i.status, i.amount_cents,\n         COALESCE(p.paid_cents, 0) AS paid_cents,\n         CASE WHEN {2} IS NULL THEN 'no payment'\n              WHEN p.paid_cents = i.amount_cents THEN 'exact'\n              ELSE 'partial' END AS coverage\n  FROM invoices i\n  LEFT JOIN paid p ON {3}\n)\nSELECT coverage, COUNT(*) AS invoices,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS billed,\n       ROUND(SUM(paid_cents) / 100.0, 2) AS settled\nFROM classes\nGROUP BY coverage\nHAVING COUNT(*) >= {4}\nORDER BY invoices {5}",
      slots: [
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the fold key",
          why: "The fold groups payments per statement — GROUP BY invoice_id with invoice_id selected keeps the CTE's grain at statement level. Fold by anything else and the census joins to a grain that no longer exists.",
        },
        {
          answer: "p.invoice_id",
          kind: "keyword",
          label: "the no-payment probe",
          why: "The CASE tests p.invoice_id IS NULL: a statement with no fold lands in 'no payment'. Probe i.id instead and the test never fires — the silent six reclassify as partial, the finding evaporates, and the census approves itself.",
        },
        {
          answer: "p.invoice_id = i.id",
          kind: "keyword",
          label: "the fold-to-statement key",
          why: "Statement key joins statement key: p.invoice_id = i.id restores one row per statement. p.id doesn't exist on the folded CTE — the grain died at GROUP BY — and any other key defines a fiction the counts will report obediently.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the class floor",
          why: "HAVING COUNT(*) >= 1 keeps every class that exists — 21, 6 and the lone partial whose 4,000.00-of-6,148.00 split IS the finding. Raise the floor to 2 and the partial row vanishes: the fraud spot-check ships blind.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the census order",
          why: "ORDER BY invoices DESC reads exact (21), no payment (6), partial (1) — busiest class first, findings at the bottom but visible. ASC leads with the single partial row, burying the 21-row majority below the fold.",
        },
      ],
      distractors: ["id", "p.id", "p.id = i.id", "2", "7", "ASC"],
      walkthrough: "The census is a two-CTE build because the fold must exist before the classification can judge it. Stage one folds payments per invoice; stage two LEFT JOINs statements to the fold, COALESCEs the missing cash to zero, and CASEs the class: p.invoice_id IS NULL means no payment, folded cash equal to billed means exact, anything between means partial. The outer fold counts classes — exact 21 / 65,612.00, no payment 6 / 15,217.00, partial 1 / 6,148.00 settled at 4,000.00 — and the class counts reconcile to 28. The failure modes are silent: probe i.id for p.invoice_id and the six unpayees reclassify as partial (7 partials, finding gone); join on p.id and the error message is the lucky outcome; raise the floor to 2 and the lone partial — statement #25's split — disappears from the exact board that should have flagged it. *A census that can hide its own finding isn't a control; it's a cover story*.",
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
    { slug: "product-sales-analysis-ii", why: "Units and revenue per menu SKU from the line fold — the attach board behind the category crowns, where the join to order_items must pre-aggregate or the 251-line fan-out lies." },
    { slug: "sales-analysis-i", why: "Aggregate spend per member with a window read on top — the same fold the lifetime board runs before ROW_NUMBER ranks it, drilled at raw shape first." },
    { slug: "top-travellers", why: "ORDER BY a folded total DESC — the podium query for partner revenue (Nordic 11,130.25 first), with NULL-rated members teaching what LEFT JOIN grain does to a ranking." },
    { slug: "project-employees-i", why: "Three-table chain grain: partners → SKUs → lines is exactly this shape, and the drill is keeping COUNT DISTINCT honest through the middle hop." },
    { slug: "employee-bonus", why: "LEFT JOIN with COALESCE defaults — the settlement fold's no-payment branch, where missing cash must read 0.00, not NULL, before any ratio touches it." },
    { slug: "combine-two-tables", why: "The LEFT JOIN baseline on a db where every member has transacted (never-ordered = 0) — so the honest exercise is knowing why the anti-join side is empty here and what would populate it elsewhere." },
    { slug: "employees-earning-more-than-their-managers", why: "Compare each row against an aggregate of its own table — the scalar-baseline instinct behind 'markets above the network ticket', trained on a self-join." },
    { slug: "not-boring-movies", why: "Filter plus ORDER BY with an id-parity twist — the cancellation-share drill: the predicate lives in WHERE, the denominator in COUNT(*), and the two clauses never swap jobs." },
    { slug: "fix-names-in-a-table", why: "String reshaping for in-world output — member names formatted for the offer queue, the text-function muscle behind every readable export the loyalty team ships." },
    { slug: "investments-in-2016", why: "Tie-and-window logic — duplicate detectors for the statement ledger, where two rows sharing a key is a reconciliation finding, not a nuisance." },
    { slug: "biggest-single-number", why: "Aggregate with a possible NULL outcome — the honest 'no row qualifies' answer, the same discipline as an empty premium band or an empty anti-join." },
    { slug: "actors-and-directors-who-cooperated-at-least-three-times", why: "HAVING on a pair fold — partner-pair concentration, the same gate shape as the 14+ VIP tier and the 4,000.00 sourcing floor." },
    { slug: "ads-performance", why: "Conditional rates over one population — offer CTR by market with the placed denominator, the CASE-ratio the loyalty board publishes every cycle." },
    { slug: "bank-account-summary-ii", why: "Join a transactions table to its accounts and fold per owner — the payments-to-statements fold with COALESCE defaults, cents divided by 100.0 before it rounds." },
    { slug: "trips-and-users", why: "CASE-branched rates over a join — cancelled share by market (7 of 103 = 6.8%) with exclusions that silently change the denominator, the hardest ratio drill in the kit." },
    { slug: "project-employees-ii", why: "EXISTS-shaped filtering after a fold — statements with at least one payment versus the six with none, both counted honestly in one pass." },
  ],
};
