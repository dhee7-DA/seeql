// Zepto — kit 14 of the Food & Quick-commerce domain (Batch L, wave 7).
// Quick-commerce at Zepto speed: sub-10-minute grocery from densifying
// dark stores, retention baskets as the growth engine, promo burn as the
// weekly argument, and the settlement anomaly ledger that decides whether
// a basket's money ever landed.
// Pool provenance: Zepto carries 0 tagged LC problems in company-pools.md
// — the pool is FULLY theme-curated from the SQL band (16 problems, 30
// topic slugs), every one mirroring a workflow Zepto screens are known to
// probe (scalar-baseline splits, LAG month walks, basket-depth folds,
// cohort retention, promo-spend pacing, settlement anti-joins). 0 tagged
// LC — theme-curated, declared here per spec.
// Cases run on the storefront db (scripts/company-facts.md, probed
// 2026-10-12): orders = delivery baskets, order_items = basket lines,
// customers = households, products = dark-store SKUs, suppliers = SKU
// vendors, regions = store clusters, shipped_at = basket-completion
// timestamp, invoices/payments = settlement statements (INTEGER cents —
// divide by 100.0). Probed traps honored: the promise is sub-10-MINUTE but
// the completion-aging column is stored in DAYS (avg 2.98, range 2..4) —
// read honestly as the multi-day ops window, never as delivery minutes;
// the anomaly ledger is verified row-level: void-but-paid #11 at 925.00,
// paid-no-payments #28 at 1,756.00, 5 split-payment invoices, one partial
// (4,000 of 6,148); 42 of 103 baskets sit above the 338.19 network
// baseline carrying 24,309.68.

import type { CompanyKit } from "../types";

export const zeptoKit: CompanyKit = {
  id: "zepto",
  domainId: "food",
  name: "Zepto",
  tagline: "Quick-commerce at Zepto speed: dark stores and SLAs",
  accent: "text-purple-300",

  brief: [
    "Zepto runs quick-commerce at Zepto speed — dark stores densifying across Indian metros, a sub-**10-minute** promise, retention baskets as the growth engine and promo burn as the weekly argument. On the training db that reads as **103 baskets** carrying **251 lines**, a status stream of {emerald:delivered} 52 / {sky:shipped} 30 / {amber:pending} 14 / {rose:cancelled} 7, and total demand of **34,833.28**. The first Zepto lesson: *the promise is sub-10-minute, but this db stores days* — completion aging averages **2.98** on a 2..4 range, and the candidate who quotes it as delivery minutes has mistaken the training stand-in for the production feed.",
    "The data org splits by fight. Growth owns the baseline split — **42** of 103 baskets sit above the **338.19** network baseline, carrying **24,309.68** of demand — and the densification census behind it; retention owns the repeat ladder, from 2 one-basket households to Alice Chen's **24** baskets at 7,262.35; marketing owns promo burn against the spend calendar (Ads at **4,570** of 25,416 total spend); settlement ops owns the anomaly ledger — void-but-paid #11 at **925.00**, paid-no-payments #28 at 1,756.00, five split-payment invoices — where money is integer cents and `/100.0` is a house rule, not a style choice.",
    "Interviews are hands-on SQL against a storefront-shaped schema, in a plain editor where your syntax errors are yours. Expect the scalar-baseline screen (fold the network average once, judge every basket against it), the LAG month walk (2024-01's 3,731.97 opening, the 2024-11 cliff at **-1,326.87**, the 2024-08 rebound at **+1,158.21**, first row honestly NULL), the two-grain cluster census, and the settlement anti-join — 6 statements with no payment = **15,217.00**. The interviewers grade whether the baseline you judge against is computed or assumed.",
    "Prep like a growth analyst, not a generic SQL student. Drill subquery shapes until you can say which one fits: scalar for one baseline, derived for staged boards, correlated for per-row context. Add window walks (`LAG`/`LEAD` with the direction named), one-pass censuses, and the population sentence before every FROM clause: {emerald:delivered}, {sky:shipped}, {amber:pending} and {rose:cancelled} are four numerators over the same 103 rows, *and the promo team will spend real money on whichever split you hand them — so the split's definition gets signed, not improvised*.",
  ],

  dayInLife: [
    "**08:05 —** the growth board before standup: the baseline split — **42** baskets above the 338.19 network baseline carrying **24,309.68**, the other 61 below — and the two-grain cluster census beside it (45 EU baskets from 8 households, 19 US from 2). A number looks too clean; before the growth lead sees it you re-run the baseline yourself with `(SELECT AVG(total) FROM orders)` — *a hardcoded 338.19 survives until the next basket lands, and hardcoded baselines are how wrong splits get funded*.",
    "**11:45 —** deep work: the demand walk. A CTE folds 103 baskets into 14 month rows via `SUBSTR(created_at, 1, 7)`, then LAG walks the steps: the trough month 2024-07 at **1,193.86** (-853.57), the August rebound **+1,158.21**, the November cliff **-1,326.87**, February 2025 closing at 2,390.53 (+721.03) — first row NULL, *because there is no January-minus-something, and COALESCE-ing it to zero is how fake flat months get invented*. The promo-burn overlay rides the same query session: Ads at 4,570 against the 25,416 spend book, peak month 3,210.",
    "**16:30 —** the promo-burn review with the growth lead: one screen, three folds — the above-baseline split by cluster (EU **18** baskets / 10,899.05, APAC 13 / 6,784.10, US 10 / 5,873.57, LATAM's single 752.96 basket gated out), the demand walk with its NULL-carrying first row, and the settlement anomaly ledger (#11 void-but-paid at **925.00**, #28 paid-no-payments at 1,756.00 — both invisible to a status filter). The EOD note ships with the population sentence above every fold and *the baseline definition signed in the footnote*.",
  ],

  metrics: [
    {
      name: "Baseline split",
      what: "Baskets above vs below the network baseline: **42** of 103 above **338.19**, carrying **24,309.68**. The scalar fold computes the baseline once; the split is the promo team's favorite argument, and its definition gets signed.",
    },
    {
      name: "Above-baseline cluster fold",
      what: "EU 18 baskets / 10,899.05 / 605.50 avg, APAC 13 / 6,784.10 / 521.85, US 10 / 5,873.57 / 587.36, LATAM 1 / 752.96 gated out at scale. The gate number (10) is a definition — US sits exactly on it.",
    },
    {
      name: "Demand walk",
      what: "14 month buckets of placed demand with LAG steps: 2024-01 opens at 3,731.97, the 2024-07 trough reads 1,193.86 (-853.57), the sharpest cliff is 2024-11 at **-1,326.87**, the best rebound 2024-08 at **+1,158.21**. First row NULL — a walk has no step zero.",
    },
    {
      name: "Basket depth",
      what: "251 lines over 103 baskets = **2.44** lines average; 26 baskets are one-liners. Depth is the retention-basket lever — every free-delivery threshold is a bet on this fold.",
    },
    {
      name: "Repeat ladder",
      what: "Households by basket count: 2 one-basket households up to Alice Chen's **24** baskets / 7,262.35 and Emma Wilson's 17 / 6,640.56. Densification is people-grain math; COUNT(DISTINCT customer_id) is the fold that keeps it honest.",
    },
    {
      name: "Status funnel",
      what: "{emerald:delivered} 52, {sky:shipped} 30, {amber:pending} 14, {rose:cancelled} 7 over 103 placed baskets. Cancel share by cluster (APAC 8.1%, EU 6.7%, US 5.3%) is a conditional count over the placed denominator — never a WHERE.",
    },
    {
      name: "10-minute promise, honest",
      what: "Completion aging reads `JULIANDAY(shipped_at) - JULIANDAY(created_at)`: avg **2.98 days**, 2..4 range, over the 82 completed baskets. The promise is sub-10-minute; this column is DAYS — the multi-day ops window, never delivery minutes.",
    },
    {
      name: "Settlement anomaly ledger",
      what: "Void-but-paid #11 at **925.00**, paid-no-payments #28 at 1,756.00, five split-payment invoices, one partial (4,000 of 6,148) — and 6 statements with no payment at all = **15,217.00**. Every row is invisible to a status filter; all of them are anti-joins.",
    },
  ],

  topics: [
    {
      name: "Scalar baselines & the split",
      why: "Zepto's growth reviews argue about one number: the network baseline. The scalar subquery folds AVG(total) once — 338.19 — and every basket is judged against it, splitting 42 above from 61 below. Screens drill the shape until the candidate can say why hardcoding the baseline survives a demo and dies in production.",
      slugs: ["market-analysis-i", "find-expensive-cities", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "Dark-store densification census",
      why: "Densification is two grains in one row: baskets AND households per cluster — 45 from 8 EU households, 19 from 2 US ones. The census is the density argument, and mixing COUNT(*) with COUNT(DISTINCT customer_id) is the classic bug the interviewer plants before the promo money moves.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "find-followers-count"],
    },
    {
      name: "Retention baskets & repeat demand",
      why: "Retention is a ladder, not a rate: 2 one-basket households at the bottom, Alice Chen at 24 baskets / 7,262.35 at the top. Screens drill repeat-rate folds over the placed denominator and frequency gates (HAVING COUNT(*) >= N) — the tier definitions the CRM spends against.",
      slugs: ["repeat-purchase-rate", "customer-order-frequency", "cohort-retention-matrix"],
    },
    {
      name: "Promo burn & spend pacing",
      why: "Promo burn is a running-sum problem: Ads at 4,570 of 25,416 total spend, month peaks at 3,210, and every campaign's cumulative curve against its budget. Screens drill running totals and pacing breaches — the fold that says 'stop spending' before the finance close says it for you.",
      slugs: ["budget-pacing", "monthly-transactions-i", "roas-by-campaign"],
    },
    {
      name: "Month walks & LAG",
      why: "The demand walk is LAG over a month spine: SUBSTR(created_at, 1, 7) builds 14 buckets, each row carries its step — the -1,326.87 November cliff, the +1,158.21 August rebound, first row NULL. Screens drill the direction (month order, not value order) and the NULL-first-row honesty that fake flat months want to erase.",
      slugs: ["week-over-week-churn", "growth-accounting", "biggest-window-between-events"],
    },
    {
      name: "Basket depth & lines",
      why: "Depth is the retention-basket lever: 251 lines over 103 baskets = 2.44, with the 26 one-line baskets as the threshold-conversion target. Screens drill folds at order grain and the fan-out guard — join to lines and every count inflates ~2.44x unless DISTINCT or a pre-fold is applied.",
      slugs: ["basket-depth-aov", "most-frequently-ordered-product-per-customer", "group-sold-products-by-the-date"],
    },
    {
      name: "Multi-day ops windows",
      why: "The 2.98-day completion aging (2..4 range, 82 of 103 completed) is the honest multi-day read on a db that stores days where production stores minutes. Screens drill julianday arithmetic, the shipped_at IS NOT NULL population rule, and the unit statement the interviewer is listening for.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "find-golden-hour-customers"],
    },
    {
      name: "Settlement anti-joins",
      why: "The anomaly ledger is anti-join country: 6 statements with no payment = 15,217.00, #28 marked paid with zero payment rows, #11 void-but-paid at 925.00. Status filters see none of it — LEFT JOIN … IS NULL and NOT EXISTS until reflex, and NOT IN against a nullable key is the silent queue-emptier.",
      slugs: ["customers-who-never-order", "number-of-accounts-that-did-not-stream", "dormant-reactivation"],
    },
    {
      name: "Rank trio & top-N boards",
      why: "Growth boards rank everything: households by lifetime spend (7,262.35 down to 444.80), clusters by above-baseline count (18/13/10). ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and the promo team's top-N cut is where LIMIT-boundary ties turn into duplicate rows.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-three-orders"],
    },
    {
      name: "Funnel CASE arms",
      why: "The funnel is CASE arms over one population: 52 delivered / 30 shipped / 14 pending / 7 cancelled, branch totals reconciling to 103. Screens drill the full-arm discipline (ELSE 0, because a missing ELSE prints NULL where a real zero belongs) and the immediate-delivery share shapes Zepto runs on every new cohort.",
      slugs: ["immediate-food-delivery-i", "loan-types", "calculate-orders-within-each-interval"],
    },
  ],

  theory: [
    {
      id: "zepto-t1",
      q: "The densification census shows baskets and households per cluster in one row. What does each column count, and what does joining order_items do to them?",
      a: "Baskets is COUNT(*) over orders at basket grain — 45 in the EU cluster; households is COUNT(DISTINCT o.customer_id) — 8 EU households. The gap between the columns is baskets per household, the density number the expansion team densifies toward. Joining order_items unguarded fans 103 baskets into 251 line rows: COUNT(*) reads 251, and every fold downstream inherits the line grain. My rule: fold at the grain the stakeholder speaks — clusters, baskets, households — and pre-aggregate lines before they touch a census. *Two columns, two grains, one row: the day the households column equals the baskets column is the day the join fanned out.*",
      tag: "joins",
    },
    {
      id: "zepto-t2",
      q: "Growth wants 'baskets above the network baseline, by cluster.' Walk the fold, and defend the baseline's construction.",
      a: "Stage the baseline as a scalar subquery — (SELECT AVG(total) FROM orders) = 338.19 over all 103 baskets — then the outer query filters o.total > that number and folds per cluster: EU 18 baskets / 10,899.05, APAC 13 / 6,784.10, US 10 / 5,873.57, LATAM 1 gated out. The baseline is computed over the same population the split draws from — filter the subquery and you've changed the definition while keeping the query green. What I state before shipping: one row, one column guaranteed, population sentence attached. *A baseline judged once and applied everywhere is the scalar fold's whole contract — and the promo team spends real money on whichever definition you hand them.*",
      tag: "aggregation",
    },
    {
      id: "zepto-t3",
      q: "The demand walk's first row shows NULL delta. Why is that correct, and what would make it wrong?",
      a: "Correct, because LAG has nothing behind the first row — there is no January-minus-something — and NULL is the honest print of that absence. Wrong is anything that papers over it: COALESCE to 0 invents a flat month, dropping the row shrinks the spine to 13 buckets, and both lies survive eyeball tests. The same NULL discipline runs through the aging fold: shipped_at is NULL for the 21 open baskets, AVG skips them and reads 2.98 days over the 82 completed — counting them as zero would flatter the fastest cluster. *NULLs at the edge of a window are data, not defects — the walk's shape depends on leaving them alone.*",
      tag: "nulls",
    },
    {
      id: "zepto-t4",
      q: "You're asked for the month-over-month demand walk. Which timestamp do you bucket on, and what does the other one give you?",
      a: "Demand buckets on created_at — SUBSTR(created_at, 1, 7) builds the '%Y-%m' spine that sorts correctly: 3,731.97 opening in 2024-01 down to the 1,193.86 July trough. Bucketing on shipped_at gives you the fulfillment walk instead — 21 baskets with no completion timestamp vanish, and a June basket lands in July's story. The two walks answer different questions: demand (what the growth team moves) versus service (what ops fixes), and the interviewer is checking whether you know which one you were asked for. *The timestamp you bucket on is a definition; the walk you ship is a decision — and February 2025's +721.03 only means something on the spine it was asked for.*",
      tag: "dates",
    },
    {
      id: "zepto-t5",
      q: "The cluster split gates at 'clusters with at least 10 above-baseline baskets.' Where does that gate live, and what happens at the boundary?",
      a: "In HAVING, because it filters a fold: COUNT(*) after GROUP BY — WHERE runs before the fold exists and rejects aggregates outright. The gate at 10 keeps EU 18, APAC 13 and the US at exactly 10 — sitting ON the boundary, which makes the gate number a signed definition: 11 deletes a cluster from the promo split, 9 changes nothing. The alias rule rides along: ORDER BY can use the SELECT's alias, HAVING must re-state the aggregate, because the pipeline runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. *Boundary values are where definitions get tested — say the gate out loud before you write it.*",
      tag: "pipeline",
    },
    {
      id: "zepto-t6",
      q: "Compare the three subquery shapes — scalar, derived, correlated — on Zepto's actual boards. When does each earn its place?",
      a: "Scalar: one baseline, judged once — (SELECT AVG(total) FROM orders) = 338.19 behind the 42/61 split. Derived: a staged fold you'll read again — per-cluster or per-month boards built in a CTE, then filtered, because the staged grain (one row per cluster, one per month) survives the review. Correlated: per-row context — each basket judged against its own cluster's average, re-computed per row, correct but scan-hungry. The failure modes differ too: a scalar subquery that returns multiple rows quietly uses the first (GROUP BY customer_id inside it shifts the split with no error), and a correlated probe that forgets its correlation becomes a cross join. *One number = scalar; a board = derived; a per-row world = correlated — and the choice is the answer.*",
      tag: "subqueries",
    },
    {
      id: "zepto-t7",
      q: "LAG and LEAD both walk the demand spine. How do you choose the direction, and what does the frame have to do with it?",
      a: "LAG looks back — this month minus the prior one — which is the growth walk's native direction: the -1,326.87 November cliff and the +1,158.21 August rebound both read as steps FROM the past. LEAD looks forward — this month minus the next — which reads the same cliff as +1,326.87 on the wrong side; the numbers mirror and the narrative inverts. The frame matters for cumulative asks: the default RANGE frame collapses ties, so a revenue-based running sum over tied values needs ROWS BETWEEN to behave. My discipline: name the direction out loud ('this month versus last'), keep the ORDER BY on the calendar key, and leave the first row's NULL alone. *A walk is a direction plus a key — get either wrong and the cliff becomes a rebound.*",
      tag: "windows",
    },
    {
      id: "zepto-t8",
      q: "Before the growth dashboard ships you get ten minutes of review. What are the anomaly, cents and grain checks you always run?",
      a: "Anomalies first: the settlement ledger's known ghosts — #11 void-but-paid at 925.00, #28 paid-no-payments at 1,756.00, the 4,000-of-6,148 partial — must appear exactly once in the recon fold, which means the fold is an anti-join + coverage CASE, never a status filter. Cents: invoices, payments and ledger are integer cents — 1,960,900 cents reads 19,609.00 only after /100.0, and the missing division is a 100x incident. Grain: every fold states its population — 103 baskets, 251 lines, 42 above baseline — and joins to lines pre-aggregate. *The anomaly ledger exists because someone ran the check; the dashboard ships because the check reconciled.*",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "zepto-mcq-1",
      prompt: "The growth board's baseline is built as (SELECT AVG(total) FROM orders). What does it return on this db, and over what population?",
      choices: [
        "338.19 — folded once over all 103 baskets",
        "578.80 — folded over the 42 above-baseline baskets",
        "338.19 — folded over the 16 households",
        "NULL — AVG can't run inside a subquery",
      ],
      answer: 0,
      why: "The scalar subquery folds the whole book once: SUM(total) = 34,833.28 over COUNT(*) = 103 → 338.19. Every basket is then judged against that single number — 42 clear it. The population is all placed baskets, which is exactly why the subquery must stay unfiltered.",
      notes: [
        { choice: 1, why: "578.80 is the average OF the above-baseline baskets — a different definition computed after the split. Baselines judged after the split always flatter it." },
        { choice: 2, why: "Households are a person-grain dimension, not the demand population — the baseline lives on baskets, and saying so is part of the answer." },
      ],
      difficulty: "easy",
    },
    {
      id: "zepto-mcq-2",
      prompt: "How many baskets sit above the 338.19 network baseline, and what do they carry?",
      choices: [
        "42 baskets carrying 24,309.68",
        "61 baskets carrying 24,309.68",
        "42 baskets carrying 34,833.28",
        "16 baskets — one per household",
      ],
      answer: 0,
      why: "The probed split: 42 of 103 baskets clear the baseline, carrying 24,309.68 of the 34,833.28 total — the concentration argument the growth lead opens with. The other 61 baskets carry the rest.",
      notes: [
        { choice: 1, why: "61 is the BELOW-baseline count — flipping the comparison silently hands the promo team the wrong half of the book." },
        { choice: 2, why: "34,833.28 is the whole book's value; the 42 above-baseline baskets carry a subset of it, and the subset is the story." },
      ],
      difficulty: "easy",
    },
    {
      id: "zepto-mcq-3",
      prompt: "What is average basket depth on this db, computed honestly?",
      choices: [
        "2.44 lines per basket — 251 order_items rows over 103 baskets",
        "103 lines per basket — every basket in the book",
        "338.19 — the value baseline doubles as depth",
        "2.98 — the aging average doubles as depth",
      ],
      answer: 0,
      why: "Depth is a line-to-basket ratio: 251 ÷ 103 = 2.44. It's a different fold from value (338.19) and from aging (2.98) — three numbers that all describe baskets, and the candidate who confuses them has folded at three different grains in one sentence.",
      notes: [
        { choice: 3, why: "2.98 days is completion aging over the 82 completed baskets — an interval metric, not a count ratio. Same table, different grain, different question." },
        { choice: 1, why: "103 is the basket count; dividing lines by nothing yields the whole book, not a per-basket figure." },
      ],
      difficulty: "easy",
    },
    {
      id: "zepto-mcq-4",
      prompt: "The above-baseline cluster fold gates at HAVING COUNT(*) >= 10. Which cluster drops, and why can't a gate of 9 save it?",
      choices: [
        "LATAM — it has 1 above-baseline basket, and 1 < 9 just as 1 < 10",
        "US — it has exactly 10, and 10 < 10 is false so it drops",
        "APAC — 13 < 9 is false so it drops",
        "None — every cluster has at least 10",
      ],
      answer: 0,
      why: "LATAM's single above-baseline basket (752.96) fails both gates — 1 fails 9 as surely as it fails 10. The US sits exactly ON the 10 gate, so 11 is the number that silently deletes it; 9 is the number that changes nothing. Boundary arithmetic is definition arithmetic.",
      notes: [
        { choice: 1, why: "The US cluster is exactly AT the gate — inclusive >= keeps it. Lowering the gate doesn't remove a qualifying cluster; it changes nothing at all here." },
        { choice: 3, why: "LATAM is probed at 1 above-baseline basket — the small population the gate exists to exclude from a trend read." },
      ],
      difficulty: "medium",
    },
    {
      id: "zepto-mcq-5",
      prompt: "The demand walk's first month (2024-01) shows delta NULL. A teammate COALESCEs it to 0 for the deck. What broke?",
      choices: [
        "The honesty of the walk — there is no prior month, so NULL is the true step; 0 invents a flat month",
        "Nothing — NULL and 0 are equivalent in a walk",
        "The sort order — NULLs sort differently than 0",
        "The fold — LAG can't be used with ROUND",
      ],
      answer: 0,
      why: "LAG has nothing behind the first row, and NULL is the honest print of that absence. COALESCE to 0 manufactures a flat month that reads as 'no change' in a deck — a claim the spine never made. The probed walk carries the NULL: 3,731.97 opens the series, first delta empty.",
      notes: [
        { choice: 1, why: "NULL is absence, 0 is a measured step of zero — the walk's first row is the former, and the deck that prints the latter has asserted a fact nobody measured." },
        { choice: 3, why: "ROUND(NULL, 2) is NULL — the fold handles the edge fine; the problem is the cosmetic fix on top of it." },
      ],
      difficulty: "medium",
    },
    {
      id: "zepto-mcq-6",
      prompt: "Which month posts the sharpest drop in the demand walk, and which the best rebound?",
      choices: [
        "2024-11 drops -1,326.87; 2024-08 rebounds +1,158.21",
        "2024-07 drops -853.57; 2025-02 rebounds +721.03",
        "2024-03 drops -992.56; 2024-05 rebounds +441.40",
        "2024-12 drops -431.97; 2024-09 rebounds +763.97",
      ],
      answer: 0,
      why: "The probed walk: November falls 2,975.67 → 1,648.80 (-1,326.87), the sharpest cliff; August rebounds 1,193.86 → 2,352.07 (+1,158.21), the best jump. The other pairs are real walk values but not the extremes — which is why the extreme-hunt runs on the ORDER BY over the computed step, not on eyeballing the revenue column.",
      notes: [
        { choice: 1, why: "Both are genuine steps — the July trough and the February close — but the extreme fold ranks all 13 steps; these aren't the extremes." },
        { choice: 2, why: "March's -992.56 and May's +441.40 are mid-table steps; picking them by eye from the revenue column is exactly the error the LAG fold prevents." },
      ],
      difficulty: "medium",
    },
    {
      id: "zepto-mcq-7",
      prompt: "The walk computes m.revenue - LAG(m.revenue) OVER (ORDER BY m.month). A teammate swaps LAG for LEAD 'to fix a sign'. What actually happens?",
      choices: [
        "The walk mirrors — each step reads against the NEXT month, so the November cliff prints as +1,326.87 on the wrong row and the narrative inverts",
        "Nothing — LAG and LEAD are aliases",
        "The query errors — you can't mix direction functions",
        "Only the first row changes",
      ],
      answer: 0,
      why: "LEAD looks forward: revenue minus the NEXT month. The cliff at November (-1,326.87 under LAG) becomes +1,326.87 attributed to October under LEAD — same magnitudes, inverted signs, shifted rows. Direction is a definition: LAG reads this-versus-prior, and that's the walk the growth board asked for.",
      notes: [
        { choice: 1, why: "The sign didn't need fixing — the reader did. A mirrored walk ranks rebounds as cliffs and hands the promo team yesterday's month on today's row." },
        { choice: 3, why: "Every row shifts under the swap; the first and last rows trade their NULLs between them." },
      ],
      difficulty: "hard",
    },
    {
      id: "zepto-mcq-8",
      prompt: "APAC shows 3 cancelled baskets out of 37 placed. Which fold prints the honest 8.1%?",
      choices: [
        "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) over all placed APAC baskets",
        "COUNT(status = 'cancelled') / COUNT(DISTINCT customer_id)",
        "3 / 37 as written",
        "100.0 * 3 / (37 - 3) over non-cancelled baskets",
      ],
      answer: 0,
      why: "Cancel share is a conditional count over the placed denominator: 3 of 37 = 8.1%, with 100.0 before the divide and one ROUND at the end. Distinct-household denominators answer a different question (households affected), and shrinking the denominator to non-cancelled is the trick that zeroes every cluster's rate.",
      notes: [
        { choice: 3, why: "That's the WHERE-before-the-fold bug: the denominator must be all placed baskets (37), or the numerator's own rows vanish from the base they're measured against." },
        { choice: 2, why: "Integer-ish division drifts toward zero — 3/37 as written reads 0 in engines that don't promote; the 100.0 multiplier and the rounding are part of the contract." },
      ],
      difficulty: "medium",
    },
    {
      id: "zepto-mcq-9",
      prompt: "Statement #11 is marked 'void' with a 925.00 payment against it. The recon dashboard filters invoices WHERE status = 'void'. What does the ledger review conclude?",
      choices: [
        "The filter sees the void but not the payment — the anomaly needs the payments anti-join/coverage fold to surface as void-but-paid",
        "#11 is clean — void statements have no money, by definition",
        "#11 appears twice in the dashboard",
        "The dashboard errors on #11",
      ],
      answer: 0,
      why: "#11 is the probed void-but-paid anomaly: a void status with 925.00 of payment rows behind it. The status column alone can't express 'void but money moved' — the coverage fold (payments per statement beside status) is what surfaces it, and the anomaly ledger exists precisely because status filters kept missing these.",
      notes: [
        { choice: 1, why: "That's the assumption the data disproves — the payment landed against a voided statement, which is the finding, not a contradiction." },
        { choice: 2, why: "Duplicates would need a join fan-out; the defect here is invisibility, not multiplication — a status filter shows the void and hides the money." },
      ],
      difficulty: "hard",
    },
    {
      id: "zepto-mcq-10",
      prompt: "The 6 open settlement statements sum to 1,960,900 amount_cents. What does ROUND(SUM(i.amount_cents) / 100.0, 2) return, and what did skipping the /100.0 cost?",
      choices: [
        "19,609.00 — and skipping it ships a 100x figure (1,960,900) that survives every eyeball test",
        "196.09 — cents divide by 1000",
        "19,609.00 — and skipping it changes nothing",
        "NULL — SUM over cents can't round",
      ],
      answer: 0,
      why: "INTEGER cents divide by 100.0 once, at the fold: 1,960,900 / 100.0 = 19,609.00 across the 6 open statements. Skip the division and the board prints 1,960,900 — a plausible-looking number that is exactly 100x wrong, which is why the cents rule is a house law at Zepto, not a style preference.",
      notes: [
        { choice: 1, why: "That's the milli-units trap: cents-to-dollars is /100; the /1000 reflex misprices every statement by 10x." },
        { choice: 2, why: "A 100x error is the single most expensive character omission in settlement reporting — and it passes the eyeball test because every row looks like money." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-zepto-1",
      tier: "medium",
      topic: "q2",
      universe: "growth",
      title: "The baseline split",
      brief: "Growth memo, Zepto-flavored on the storefront db: the promo-burn review needs the basket split that argues about itself — the **42** baskets above the network baseline (**338.19**, computed as a scalar fold over the same 103 orders) carry **24,309.68**, and the growth lead wants them split by cluster with a scale gate so LATAM's single above-baseline basket (752.96) can't pose as a trend. Definition fixed: above = `o.total > (SELECT AVG(total) FROM orders)`, clusters need at least **10** qualifying baskets. Probed fold: EU **18 baskets / 10,899.05 / 605.50 avg**, APAC 13 / 6,784.10 / 521.85, US 10 / 5,873.57 / 587.36 — LATAM waits outside at 1.",
      ask: "Return the baseline split: store_cluster, promo_free_baskets, basket_value, avg_basket — biggest cluster first, scaled clusters only.",
      template: "SELECT c.region AS store_cluster,\n       COUNT(*) AS promo_free_baskets,\n       ROUND(SUM(o.total), 2) AS basket_value,\n       ROUND(AVG(o.total), 2) AS avg_basket\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total {1} ({2})\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY promo_free_baskets {4}",
      slots: [
        {
          answer: ">",
          kind: "keyword",
          label: "the baseline direction",
          why: "Above means strictly greater — 42 baskets clear the 338.19 baseline. Flip to '<' and the board hands the promo team the 61 below-baseline baskets; '!=' admits everything and the split becomes the whole book.",
        },
        {
          answer: "SELECT AVG(total) FROM orders",
          kind: "keyword",
          label: "the network baseline",
          why: "The baseline folds the whole book once — 34,833.28 over 103 = 338.19 — unfiltered, so the split draws from the same population it judges against. GROUP BY inside it turns one baseline into 16 private averages (SQLite quietly takes the first), and MAX(total) empties the board.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the scaled-cluster gate",
          why: "The gate keeps the clusters with a real above-baseline book: EU 18, APAC 13, and the US exactly 10 — sitting ON the boundary. LATAM's single 752.96 basket fails a gate of 9 as surely as 10; 11 silently deletes the US cluster.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-cluster direction",
          why: "The review reads top-down: 18, 13, 10. ASC opens on the smallest scaled cluster — a correct query that spends the room's ten minutes backwards.",
        },
      ],
      distractors: ["<", "!=", "SELECT MAX(total) FROM orders", "SELECT AVG(total) FROM orders GROUP BY customer_id", "11", "ASC"],
      walkthrough: "The scalar subquery folds the whole book once — SELECT AVG(total) FROM orders = 338.19 — and the outer WHERE judges each of the 103 baskets against that single number: 42 clear it, carrying 24,309.68. The cluster fold then reads EU 18 / 10,899.05, APAC 13 / 6,784.10, US 10 / 5,873.57; the gate at 10 keeps exactly these three — US sits ON the boundary, so 11 deletes a cluster, and 9 doesn't save LATAM (its 1 basket still fails). Flip the direction to '<' and the board flips to the 61 below-baseline baskets; '!=' admits everything. Group the subquery by customer_id and the 'baseline' becomes 16 private averages — SQLite quietly takes the first row and the split shifts without an error. *One baseline, computed once, applied everywhere: that's the scalar fold's whole contract, and the promo budget spends against it.*",
    },
    {
      id: "cs-zepto-2",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The demand walk",
      brief: "Month-close memo, Zepto-flavored: the finance review wants the demand walk — 14 month buckets of placed demand (`SUBSTR(created_at, 1, 7)` over the 103 baskets), each row carrying its step against the prior month, first row honestly NULL because *there is no prior to walk from*. Definition fixed: bucket on `created_at`, never on `shipped_at` — demand is placed-time; the completion timestamp belongs to the service walk, and the 21 open baskets would vanish from it entirely. Probed walk: 2024-01 opens at **3,731.97**, the 2024-07 trough lands at **1,193.86** (-853.57), the sharpest cliff is 2024-11 at **-1,326.87**, the best rebound 2024-08 at **+1,158.21**, and 2025-02 closes at 2,390.53 (+721.03).",
      ask: "Return the walk: month, revenue, delta (2 decimals, first row NULL) — calendar order.",
      template: "WITH monthly AS (\n  SELECT SUBSTR({1}, 1, 7) AS month,\n         ROUND(SUM(o.total), 2) AS revenue\n  FROM orders o\n  GROUP BY month\n)\nSELECT m.month,\n       m.revenue,\n       ROUND({2}, 2) AS delta\nFROM monthly m\nORDER BY {3}",
      slots: [
        {
          answer: "o.created_at",
          kind: "keyword",
          label: "the demand timestamp",
          why: "Demand buckets on placed time — SUBSTR(created_at, 1, 7) builds the '%Y-%m' spine that sorts as a calendar. Bucket on shipped_at and you ship the fulfillment walk instead: 21 open baskets vanish and June's demand lands in July's story.",
        },
        {
          answer: "m.revenue - LAG(m.revenue) OVER (ORDER BY m.month)",
          kind: "keyword",
          label: "the walk step",
          why: "The step is this month minus the PRIOR one, in calendar order — the -1,326.87 November cliff and the +1,158.21 August rebound both read correctly only in that direction. ORDER BY m.revenue scrambles the spine into a leaderboard; LEAD mirrors every sign onto the wrong row.",
        },
        {
          answer: "m.month",
          kind: "keyword",
          label: "the calendar order",
          why: "A walk is ordered by its calendar key — '%Y-%m' strings sort correctly. Order by revenue (or by the delta) and the rows stop being a sequence: cliffs and rebounds interleave and the 'walk' becomes a leaderboard with NULLs scattered through it.",
        },
      ],
      distractors: ["o.shipped_at", "SUBSTR(o.created_at, 1, 4)", "m.revenue - LAG(m.revenue) OVER (ORDER BY m.revenue)", "LEAD(m.revenue) OVER (ORDER BY m.month)", "LAG(m.revenue) OVER (ORDER BY m.month)", "m.revenue"],
      walkthrough: "Stage the spine first: the CTE folds 103 baskets into 14 month rows via `SUBSTR(created_at, 1, 7)` — '%Y-%m' strings sort as calendars — then LAG walks the steps on ORDER BY m.month: -122.33 into February, -992.56 into March, the trough -853.57 into July's 1,193.86, the August rebound +1,158.21, the November cliff -1,326.87, and +721.03 into February 2025's 2,390.53. The first row's delta stays NULL — there is no January-minus-something, and COALESCE-ing it to 0 is how fake flat months get invented. Bucket on `shipped_at` instead and the walk measures fulfillment, not demand — the 21 open baskets vanish from the spine entirely. Order by revenue and the walk scrambles into a leaderboard; swap LAG for LEAD and every sign mirrors onto the wrong month. *A walk is a direction plus a key — both slots are definitions, and the close signs both.*",
    },
  ],

  problems: [
    { slug: "repeat-purchase-rate", why: "The repeat share over the placed denominator — Zepto's retention headline, computed as a ratio of two folds over the same population." },
    { slug: "customer-order-frequency", why: "Households at the N-basket gate — the cadence tier behind Zepto's densification math, drilled until HAVING is reflex." },
    { slug: "market-analysis-i", why: "Clusters judged against the 338.19 scalar baseline — the above-baseline fold (42 baskets, 24,309.68) as a practice shape." },
    { slug: "week-over-week-churn", why: "LAG transitions across periods — the demand walk's weekly cousin: this month's step beside last month's, folded at the same grain." },
    { slug: "budget-pacing", why: "Running sums against a burn budget — the promo-pacing fold: Ads at 4,570 of 25,416, flagged before it breaches, not after." },
    { slug: "basket-depth-aov", why: "Lines-per-basket beside value — 251 over 103, the depth metric every free-delivery threshold at Zepto bets on." },
    { slug: "average-time-of-process-per-machine", why: "Aging per unit through a fold — the multi-day ops window (2.98 avg over 82 completed) computed honestly, NULLs excluded by construction." },
    { slug: "cohort-retention-matrix", why: "Cohort-by-month survival grids — the retention-basket matrix: which signup month keeps ordering at basket N." },
    { slug: "immediate-food-delivery-ii", why: "First-basket conversion with the honest denominator — the newest cohort's earliest retention signal, computed not asserted." },
    { slug: "customers-who-never-order", why: "The anti-join reflex — returns 0 here (every household has ordered), pointing the real drill at billing's 6 unsettled statements at 15,217.00." },
    { slug: "find-churn-risk-customers", why: "Last-basket aging past the window — the winback list computed from date math, the retention team's Monday query." },
    { slug: "queries-quality-and-percentage", why: "Ratios folded with quality rates in one pass — the vendor and promo scorecards Zepto ships weekly, rounded once at the end." },
    { slug: "restaurant-growth", why: "Rolling demand windows — the 7-day moving-average shape behind every Zepto growth-board trendline." },
    { slug: "keep-latest-dedupe", why: "Keep-latest per key — household and store-attribute changes arriving as multiple rows, collapsed to current state with ROW_NUMBER." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Batches judged against a fold-of-a-fold — the above-average quantity screen, scalar-baseline logic at line grain." },
    { slug: "winback-recovery", why: "Dormant households pulled back — the winback window computed from last-basket dates, the retention team's hardest fold." },
  ],
};
