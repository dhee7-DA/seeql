// Blinkit — kit 13 of the Food & Quick-commerce domain (Batch L, wave 7).
// India quick-commerce: 10-minute dark stores, basket depth as the unit-
// economics engine, SKU availability as the promise's physical limit, and
// the settlement back office that decides whether a basket's money ever
// lands.
// Pool provenance: Blinkit carries 0 tagged LC problems in
// company-pools.md — the pool is FULLY theme-curated from the SQL band
// (16 problems, 30 topic slugs), every one mirroring a workflow Blinkit
// screens are known to probe (basket-depth folds, thin-shelf availability
// boards, price-band CASE histograms, funnel censuses at one pass,
// settlement anti-joins). 0 tagged LC — theme-curated, declared here per
// spec.
// Cases run on the storefront db (scripts/company-facts.md, probed
// 2026-10-12): orders = delivery baskets, order_items = basket lines,
// customers = households, products = dark-store SKUs, suppliers = SKU
// vendors, regions = dark-store clusters, shipped_at = basket-completion
// timestamp, invoices/payments = settlement statements (INTEGER cents —
// divide by 100.0). Probed traps honored: the promise is MINUTES but the
// completion-aging column is stored in DAYS (avg 2.98, range 2..4) — read
// honestly as the multi-day ops window, never as delivery minutes; the
// premium price band (>= 200) is EMPTY (max 199.99); every SKU has sold
// (never-ordered = 0), so shelf risk on this db is thinning, not dying —
// the honest availability read is stock minus units sold (3 SKUs at 14/15/
// 17 remaining); billing: 6 statements with no settlement = 15,217.00,
// incl. paid-with-no-payment #28 at 1,756.00 and the 4,000-of-6,148
// partial.

import type { CompanyKit } from "../types";

export const blinkitKit: CompanyKit = {
  id: "blinkit",
  domainId: "food",
  name: "Blinkit",
  tagline: "India quick-commerce: 10-minute dark stores",
  accent: "text-yellow-400",

  brief: [
    "Blinkit is India's quick-commerce original — dark stores stacked inside dense neighborhoods, a **10-minute** delivery promise, and a unit-economics story written in basket depth and SKU availability. On the training db that reads as **103 baskets** fanning into **251 line items**, a status stream of {emerald:delivered} 52 / {sky:shipped} 30 / {amber:pending} 14 / {rose:cancelled} 7, and a 16-SKU shelf that must keep selling. The first Blinkit lesson: *the promise is minutes, but this db stores days* — completion aging averages **2.98** on a 2..4 range, and the analyst who reads it as delivery minutes has already failed the screen.",
    "The data org runs on three rails. Dark-store ops owns availability — stock minus units sold per SKU, the thin-shelf board, restock aging; assortment and pricing owns the shelf itself — 8 budget SKUs averaging **32.06**, 8 mid-band at **111.50**, and a premium band (>= 200) that is *empty at max 199.99*, a fact candidates get asked to discover, not assume; settlement ops owns the billing spine where money is integer cents and a skipped `/100.0` is a 100x incident. The culture is SQL-first: a standup opens with a fold, and the fold prints its population — 103 baskets, 251 lines — before any rate is read.",
    "Interviews are hands-on SQL against a storefront-shaped schema, in a plain editor where your syntax errors are yours. Expect the basket-depth census (26 one-line baskets, 29 two-line, 25 three-line, 23 four-line — average 2.44 lines), the thin-shelf fold gated at a remaining-stock threshold, the funnel with its denominators, and the settlement anti-join — 6 statements with no payment = **15,217.00**, one marked {emerald:paid} with zero payment rows (#28 at 1,756.00). The interviewers grade whether the denominator you say is the denominator you queried.",
    "Prep like a dark-store analyst, not a generic SQL student. Drill one-pass censuses (`FILTER (WHERE …)` and conditional SUM), CASE band histograms with the ELSE arm as a finding, staged availability folds (`stock - SUM(quantity)` in a derived table, then the gate), and rank functions with a tie policy. Say the population sentence before the FROM clause: {emerald:delivered}, {sky:shipped}, {amber:pending} and {rose:cancelled} are four numerators over the same 103 rows, *and the shelf only has 16 SKUs — every fold should reconcile to a number you can count on your fingers*.",
  ],

  dayInLife: [
    "**08:20 —** store-ops standup: the funnel census first — {emerald:delivered} 52, {sky:shipped} 30, {amber:pending} 14, {rose:cancelled} 7 over 103 baskets — then the thin-shelf alert: three SKUs with **20 units or fewer** of cover (14, 15, 17 remaining). A cluster's numbers look off; before flagging it you re-run the two grains yourself — `COUNT(*)` for baskets, `COUNT(DISTINCT customer_id)` for households — because *a cluster can gain baskets while losing households, and only the pair of columns says which*.",
    "**12:15 —** deep work: the basket-depth fold. 251 lines over 103 baskets = **2.44** lines average, but the histogram is the story — 26 one-line baskets, 29 two-line, 25 three-line, 23 four-line — and the one-liners are the free-delivery-threshold conversation waiting to happen. The availability board rides the same query session: the staged fold `stock - SUM(quantity)` per SKU, gated at the threshold, ranked thinnest first — Headset at **14** remaining, Mic at 15, Smart Watch S at 17 — each row carrying its stock-and-sold provenance so ops can argue with the number.",
    "**17:00 —** category review with the assortment lead: Audio is thinning — two of the three thin SKUs sit in that one category — while Accessories moves the most units (**121 across 54 baskets touched**). The pricing footnote ships too: the premium band is *empty* (max 199.99), so 'premiumization' on this db means mix, not price points. The EOD note is one screen: the depth histogram, the thin-shelf board, the settlement queue (6 statements, **15,217.00**, the paid-no-payment anomaly separated) — *every fold with its population sentence printed above it*.",
  ],

  metrics: [
    {
      name: "Basket depth",
      what: "Lines per basket: 251 lines over 103 baskets = **2.44** average, histogram 26 one-liners / 29 two-line / 25 three-line / 23 four-line. The threshold conversion lever — every free-delivery threshold is a bet on this histogram.",
    },
    {
      name: "Thin-shelf census",
      what: "SKUs whose remaining cover (stock minus units sold) drops to 20 or fewer: **3 SKUs** — Noise-Canceling Headset at **14**, Studio Desktop Mic at **15**, Smart Watch S at **17**. Availability is a subtraction; the fold runs per SKU before any gate.",
    },
    {
      name: "Status funnel",
      what: "{emerald:delivered} 52, {sky:shipped} 30, {amber:pending} 14, {rose:cancelled} 7 over 103 placed baskets. A pending basket is a restock delay, a cancelled one a lost basket — boards that merge them misread logistics as churn.",
    },
    {
      name: "10-minute promise, honest",
      what: "Completion aging reads `JULIANDAY(shipped_at) - JULIANDAY(created_at)`: avg **2.98 days**, 2..4 range, over the 82 completed baskets. The promise is minutes; this column is DAYS — the training stand-in for the production minute-grain feed, and the unit gets said out loud.",
    },
    {
      name: "Price bands",
      what: "8 budget SKUs averaging **32.06**, 8 mid-band at **111.50**, premium (>= 200) {rose:empty} — the max price is 199.99 (Smart Watch S). Band edges are definitions; the empty band is a finding, not a query bug.",
    },
    {
      name: "Category velocity",
      what: "Accessories moves the most units (**121** across 54 baskets touched), Audio carries the most value (**11,744.01**). Units and value rank categories differently — the mix conversation starts where the two boards disagree.",
    },
    {
      name: "Vendor concentration",
      what: "Nordic Gadgets AB **32%** of revenue, Midwest Hardware Co **26.7%** — half the book rides two vendors. The concentration fold runs before every assortment change, because a stockout at a concentrated vendor is a network event.",
    },
    {
      name: "Settlement exposure",
      what: "6 statements with no payment = **15,217.00**, including #28 marked {emerald:paid} with zero payment rows and one partial (4,000 of 6,148). The queue is an anti-join — `LEFT JOIN … IS NULL` — not a status filter.",
    },
  ],

  topics: [
    {
      name: "Basket depth & lines per basket",
      why: "Blinkit's unit economics are basket-shaped: 251 lines over 103 baskets = 2.44, but the histogram (26/29/25/23 by line count) is what the threshold team actually moves. Screens drill the fold at order grain — COUNT(*) of lines per basket, then re-folding the histogram — because folding at line grain is the classic 2.4x census bug.",
      slugs: ["basket-depth-aov", "customer-order-frequency", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Availability & thin shelves",
      why: "The dark-store promise dies at the shelf: remaining cover = stock minus units sold, folded per SKU and gated at a threshold (3 SKUs at 14/15/17 on this db). Screens drill the staged fold — aggregate lines per SKU in a derived table, then filter and rank — because gating before the fold ranks lines, not shelves.",
      slugs: ["find-stores-with-inventory-imbalance", "warehouse-manager", "weeks-of-supply"],
    },
    {
      name: "Dark-store clusters at two grains",
      why: "Cluster reviews open with baskets AND households in one row — 45 baskets from 8 EU households, 37 from 5 APAC. Two columns at two grains in one SELECT is the house census; mixing them (COUNT(*) where COUNT(DISTINCT) belongs) is the classic bug the interviewer plants on purpose.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Funnel & kept demand",
      why: "The status funnel is four numerators over one population: 52 delivered, 30 shipped, 14 pending, 7 cancelled. Kept-demand share is a conditional count — SUM(CASE WHEN status = 'cancelled' …) over COUNT(*) — and the 14 {amber:pending} baskets are a restock population the churn board must never absorb.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "drop-type-1-orders-for-customers-with-type-0-orders"],
    },
    {
      name: "Price bands & CASE histograms",
      why: "The shelf is banded: 8 budget SKUs at 32.06 average, 8 mid at 111.50, premium >= 200 empty at max 199.99. Screens drill the CASE band fold with the ELSE arm treated as a finding — an empty band on this db is a real fact about the assortment, and candidates who 'fix' it with a COALESCE have misunderstood the shelf.",
      slugs: ["spend-histogram", "create-a-session-bar-chart", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Rank trio & shelf boards",
      why: "Thin-shelf boards, velocity boards and vendor boards are all top-N with ties: ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and the dark-store team needs the tie policy stated before the rank runs. LIMIT-boundary ties are the classic 'why does my top-3 return 4 rows' bug.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary"],
    },
    {
      name: "One-pass censuses",
      why: "Standups are query-budgeted: the funnel, the band histogram and the cluster census each get one pass. FILTER (WHERE …) and conditional SUM build the whole 52/30/14/7 picture in a single scan, with branch totals that must reconcile to COUNT(*) = 103 before the board ships.",
      slugs: ["active-businesses", "ratings-histogram", "count-the-number-of-experiments"],
    },
    {
      name: "Vendor mix & concentration",
      why: "Six vendors carry the shelf, and two of them — Nordic Gadgets AB (32%) and Midwest Hardware Co (26.7%) — carry over half the revenue. Screens drill revenue-per-vendor folds through products and order_items, and the share math that prints 100.0 * fold / total, rounded once at the end.",
      slugs: ["sales-analysis-i", "product-sales-analysis-ii", "products-worth-over-invoices"],
    },
    {
      name: "Demand calendars",
      why: "Dark stores live on the demand curve: month spines via SUBSTR(created_at, 1, 7) — 2024-01's 3,731.97 peak down to 2024-07's 1,193.86 trough — and day-of-week pivots for staffing. Screens drill the bucket key and the honesty rule: bucket on created_at for demand, never on the completion timestamp.",
      slugs: ["monthly-transactions-i", "sales-by-day-of-the-week", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Settlement anti-joins",
      why: "The billing spine is where the money hides: 6 statements with no payment = 15,217.00, and #28 is marked {emerald:paid} with zero payment rows — invisible to any status filter. LEFT JOIN … IS NULL and NOT EXISTS until reflex; NOT IN against a nullable key is the silent queue-emptier the screens love.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
  ],

  theory: [
    {
      id: "blinkit-t1",
      q: "Baskets fan into 251 order_items rows over 103 baskets. Walk me through what happens to COUNT(*), AVG and basket-value math when that join ships unguarded.",
      a: "The join multiplies rows: each of the 103 baskets appears once per line, so COUNT(*) reads 251 — line grain, not basket grain. AVG(o.total) looks safe but isn't the question's grain; SUM(o.total) / COUNT(*) is the classic casualty: the numerator inflates ~2.44x and the denominator inflates with it, landing near 338.19 ÷ 2.44. The guards: COUNT(DISTINCT o.id) as the denominator, or pre-aggregate order_items per basket in a derived table and join the fold. My discipline is to state the grain out loud before the FROM clause — *basket value is basket-grain math, and the join to lines exists only when the question is about the shelf*.",
      tag: "joins",
    },
    {
      id: "blinkit-t2",
      q: "The funnel reads 52 delivered, 30 shipped, 14 pending, 7 cancelled. How do you build that census in one pass, and what must the branches reconcile to?",
      a: "One scan, conditional folds: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), same for shipped/pending/cancelled — or the FILTER (WHERE …) shape where the engine supports it — beside COUNT(*) = 103. The contract is arithmetic: the four branches must sum to COUNT(*) or the census has a hole, which is why I ship them in the same SELECT. The trap is a missing ELSE arm: CASE without ELSE returns NULL, and SUM skips NULLs — a branch can silently read 0 for the wrong reason. On this db LATAM genuinely reads 0 pending on 2 baskets — *a zero that's a fact, not a bug, and the reconciliation to 103 is what proves the difference*.",
      tag: "aggregation",
    },
    {
      id: "blinkit-t3",
      q: "shipped_at is NULL for 21 of 103 baskets. What do COUNT(*), COUNT(shipped_at) and the aging AVG each return, and which one feeds the availability board?",
      a: "COUNT(*) reads 103 placed baskets; COUNT(shipped_at) reads 82 — the 52 delivered plus 30 shipped that actually completed; AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) skips NULLs automatically and reads 2.98 days over that same 82. The board wants aging over completed baskets only — folding pending baskets in as zero would flatter the fastest stores and hide the queue. And I refuse to COALESCE the NULLs to a default date: a basket in the queue has no age yet, not zero age. The honest query says its population — *82 completed of 103 placed, 21 open* — and the 21 belong to the refund-window file, not the latency histogram.",
      tag: "nulls",
    },
    {
      id: "blinkit-t4",
      q: "Blinkit's promise is 10 minutes but the training db stores completion aging in days (avg 2.98, range 2..4). How do you present that without either lying or dodging?",
      a: "I state the unit as part of the answer: JULIANDAY returns fractional days, so 2.98 here is DAYS — the training stand-in for the production feed where the identical expression runs on minute-grain timestamps. What transfers is the shape: filter to completed baskets (shipped_at IS NOT NULL — 82 of 103), compute the diff, bucket by cluster, read the spread. What does not transfer is the number: reading 2.98 as minutes would mean the network beats every quick-commerce SLA on earth, which is the pattern-match the interviewer is watching for. *Grain honesty is the deliverable — the query is the same, the unit is a sentence, and the sentence is graded.*",
      tag: "dates",
    },
    {
      id: "blinkit-t5",
      q: "The thin-shelf board gates at 'remaining stock <= 20'. Why does that gate need a derived table, and where do WHERE and HAVING each sit?",
      a: "Because 'remaining' is itself a fold: p.stock - SUM(oi.quantity) only exists after joining order_items and grouping by SKU — you can't filter on an aggregate in the same SELECT that computes it, and WHERE rejects aggregates outright. The derived table stages one row per SKU (103-basket lines collapsed to 16 shelf rows), then the outer query applies the gate: WHERE t.remaining <= 20 keeps the Headset at 14, the Mic at 15, the Smart Watch S at 17. HAVING would be the alternative if I grouped in one layer — but staging keeps the fold testable and the grain explicit. *Availability is a subtraction over a fold, and the fold has to exist before the gate can judge it* — that sentence is the whole two-layer design.",
      tag: "pipeline",
    },
    {
      id: "blinkit-t6",
      q: "You need 'SKUs whose remaining cover is below the network average cover.' Compare the scalar-subquery, derived-table and correlated shapes.",
      a: "The scalar subquery folds the whole shelf once — (SELECT AVG(remaining) FROM …) — and the outer query judges each SKU against that single number: cheap, readable, right for one baseline. The derived table stages per-SKU folds first (stock, sold, remaining), then the outer query filters and ranks — right when the board needs the staged columns anyway. The correlated shape re-computes a baseline per row — right for per-group comparisons, wrong for a single network number, and it burns a scan per row. On 16 SKUs all three work; the habit matters at scale. *One baseline, judged once = scalar; per-SKU context = correlated; a board you'll re-read = staged.* The dark-store team ships the staged version because the fold's provenance survives the review.",
      tag: "subqueries",
    },
    {
      id: "blinkit-t7",
      q: "The thin-shelf board ranks 3 SKUs (14, 15, 17 remaining). Which rank function, and what happens when tomorrow's fold produces a tie?",
      a: "RANK() OVER (ORDER BY remaining ASC) is the board's contract: thinnest first, and ties share a rank with a gap after — two SKUs both at 15 would read 1-2-2-4, which is the truth ops needs (two shelves equally thin, the next one clearly fourth). ROW_NUMBER breaks the tie arbitrarily — fine for a pick list, wrong for a board — and DENSE_RANK reads 1-2-2-3, which undercounts the shelf count. The discipline is choosing the tie policy with the stakeholder, then writing the function that implements it, with a deterministic tiebreaker (category, then name) so the export is reproducible. *Ranks are tie policies, not syntax — the day the fold produces a tie is the day the choice pays for itself.*",
      tag: "windows",
    },
    {
      id: "blinkit-t8",
      q: "Before the dark-store dashboard ships you get ten minutes of review. What are the cents, band and census checks you always run?",
      a: "Cents first: settlement money is integer cents, so anything touching invoices or payments divides by 100.0 before it rounds — the settlement queue reads 15,217 dollars, not 1,521,700 cents, and the missing /100.0 is a 100x incident that survives every eyeball test. Bands: CASE histograms ship with their ELSE arm audited — the premium band (>= 200) is legitimately empty at max 199.99, and an empty arm is a finding to print, not a bug to patch. Census: branch totals reconcile to the population — 52 + 30 + 14 + 7 = 103, the depth histogram 26 + 29 + 25 + 23 = 103 baskets, 251 lines. *If the fold doesn't reconcile to a number you can count on your fingers, the query has a hole before it has a bug.*",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "blinkit-mcq-1",
      prompt: "The basket-depth histogram reads 26 one-line baskets, 29 two-line, 25 three-line, 23 four-line. Which line count is the mode, and what reconciles the histogram to the books?",
      choices: [
        "2 lines is the mode; the four branches sum to 103 baskets and 251 lines",
        "1 line is the mode; the branches sum to 103 baskets",
        "4 lines is the mode; the branches sum to 251 lines",
        "No mode exists; the histogram can't reconcile",
      ],
      answer: 0,
      why: "29 two-line baskets is the largest branch — the mode. The reconciliation is two-way: 26+29+25+23 = 103 baskets and 1×26 + 2×29 + 3×25 + 4×23 = 251 lines, which is exactly the order_items census. A histogram that fails either sum has a fold bug.",
      notes: [
        { choice: 1, why: "26 one-line baskets is the smallest branch, not the mode — and one-way reconciliation (baskets only) misses the line check that catches grain bugs." },
        { choice: 2, why: "Counting 251 (lines) as the basket population is the classic fan-out error: the histogram lives at basket grain, and 4-line baskets are the smallest branch anyway." },
      ],
      difficulty: "easy",
    },
    {
      id: "blinkit-mcq-2",
      prompt: "The thin-shelf board gates at remaining cover <= 20 units. How many SKUs qualify on this db, and which are they?",
      choices: [
        "3 — Noise-Canceling Headset (14), Studio Desktop Mic (15), Smart Watch S (17)",
        "4 — the three above plus 4K Webcam Pro (39)",
        "0 — every SKU has healthy cover",
        "16 — remaining is computed per line, so every SKU qualifies",
      ],
      answer: 0,
      why: "The staged fold (stock − SUM(quantity) per SKU) leaves exactly three SKUs at or under 20: 14, 15 and 17. The next SKU up is the 4K Webcam Pro at 39 — outside the gate by 19 units, which is why the threshold number is a signed definition.",
      notes: [
        { choice: 1, why: "39 > 20 — the Webcam only enters if someone quietly moves the threshold, which is exactly the definition drift the gate exists to prevent." },
        { choice: 3, why: "That's the line-grain bug: remaining is a per-SKU fold, not a per-line value — gating unaggregated lines ranks lines, not shelves." },
      ],
      difficulty: "easy",
    },
    {
      id: "blinkit-mcq-3",
      prompt: "How many baskets on this db carried exactly one line, and which shape finds them?",
      choices: [
        "26 — GROUP BY order_id in a derived table, HAVING COUNT(*) = 1",
        "26 — WHERE line_count = 1 directly on order_items",
        "251 — every line is one line",
        "0 — every basket has at least two lines",
      ],
      answer: 0,
      why: "Lines per basket is a fold: GROUP BY order_id, HAVING COUNT(*) = 1 — 26 baskets qualify. The fold has to happen before the filter; order_items has no line_count column, and counting rows at line grain answers a different question entirely.",
      notes: [
        { choice: 1, why: "That's the missing-staging bug: there is no line_count column to filter on — the count must be computed per order_id first, which is what the derived table (or HAVING) does." },
        { choice: 3, why: "The probed histogram says 26 one-liners exist — the 10-minute promise runs on plenty of single-item runs." },
      ],
      difficulty: "easy",
    },
    {
      id: "blinkit-mcq-4",
      prompt: "A teammate computes network basket value as SUM(o.total) / COUNT(*) after joining orders to order_items (103 baskets → 251 lines). What do they get?",
      choices: [
        "Roughly 2.4x too small — the denominator counts line rows, not baskets",
        "Exactly 338.19 — joins don't change aggregates",
        "Roughly 2.4x too big — the numerator duplicates",
        "NULL — SUM returns NULL after joins",
      ],
      answer: 0,
      why: "The join fans 103 baskets into 251 rows, so o.total repeats per line: the numerator inflates ~2.44x but COUNT(*) inflates with it — the ratio lands near 338.19 ÷ 2.44. The fix: SUM(o.total) / COUNT(DISTINCT o.id), or pre-aggregate order_items before joining.",
      notes: [
        { choice: 1, why: "Joins absolutely change aggregates when they fan out — the single most common basket-value bug in quick-commerce reporting." },
        { choice: 2, why: "Both sides scale, so the ratio shrinks rather than grows — the duplicated total divides by a duplicated count." },
      ],
      difficulty: "medium",
    },
    {
      id: "blinkit-mcq-5",
      prompt: "The pricing team asks for the premium band: products priced >= 200. What does the band fold return, and what is the finding?",
      choices: [
        "0 products — the premium band is genuinely empty; max price is 199.99 (Smart Watch S)",
        "1 product — Smart Watch S at 199.99 counts as premium",
        "8 products — the mid band leaks in",
        "The query errors — 200 exceeds the column's range",
      ],
      answer: 0,
      why: "The shelf tops out at 199.99, so the >= 200 band is empty — a real fact about the assortment, not a query bug. The CASE histogram should print the empty arm as a row with 0, because 'premium' being absent IS the finding the pricing review needs.",
      notes: [
        { choice: 1, why: "199.99 < 200 — boundary arithmetic, not rounding. The band edge is a definition, and 199.99 sits just under it by design." },
        { choice: 2, why: "That's the empty-band-as-bug reflex: 'fixing' the fold with a COALESCE or a moved edge manufactures a premium tier the shelf doesn't have." },
      ],
      difficulty: "medium",
    },
    {
      id: "blinkit-mcq-6",
      prompt: "A CASE funnel writes SUM(CASE WHEN status = 'pending' THEN 1 END) with no ELSE. For the LATAM cluster (2 baskets, 0 pending), what does the branch return, and what's the fix?",
      choices: [
        "NULL — SUM skips NULLs and reads NULL, so add ELSE 0",
        "0 — CASE defaults to 0, nothing to fix",
        "2 — the ELSE-less arm counts all rows",
        "The query errors — ELSE is mandatory",
      ],
      answer: 0,
      why: "CASE without ELSE yields NULL, SUM ignores NULLs, and the branch reads NULL — not the 0 the board wants. The fix is ELSE 0, which is why the house style writes the full arm: conditional folds must produce numbers everywhere, including genuine zeros like LATAM's 0 pending on 2 baskets.",
      notes: [
        { choice: 1, why: "That's the NULL-vs-zero confusion: an absent ELSE is NULL by spec, and NULL propagates through SUM as absence — the board prints a blank exactly where a fact (0) belongs." },
        { choice: 2, why: "ELSE is optional syntax but mandatory semantics for census folds — the LATAM 0 is a real zero, and only ELSE 0 prints it as one." },
      ],
      difficulty: "medium",
    },
    {
      id: "blinkit-mcq-7",
      prompt: "Completion aging reads 2.98 on the training db. In production the same query runs on minute-grain courier events. What did NOT change?",
      choices: [
        "The population rule — completed baskets only (shipped_at IS NOT NULL), never the 21 open ones",
        "The unit — it's minutes in both systems",
        "The aging values — 2.98 transfers directly",
        "The join — production requires a couriers table",
      ],
      answer: 0,
      why: "The shape transfers, the unit doesn't: julianday diffs are DAYS here (2.98 days, 2..4 range) and minutes in production, but the population rule is identical — age only baskets that completed (82 of 103), because a queued basket has no latency, not zero latency.",
      notes: [
        { choice: 1, why: "2.98 minutes would beat every quick-commerce SLA on earth — the db stores DAYS precisely so you must state the unit instead of pattern-matching." },
        { choice: 2, why: "The values absolutely change with the unit; the honest transfer is the query shape plus the population sentence." },
      ],
      difficulty: "medium",
    },
    {
      id: "blinkit-mcq-8",
      prompt: "Tomorrow the thin-shelf fold returns two SKUs both at 15 remaining. The board ships RANK() OVER (ORDER BY remaining). What does the board show?",
      choices: [
        "Both SKUs share rank 2 (ranks read 1-2-2-4 with a gap) — the tie is visible, not hidden",
        "Both SKUs get rank 2 with no gap (1-2-2-3)",
        "Each gets a distinct arbitrary rank (1-2-3-4)",
        "The query errors on the tie",
      ],
      answer: 0,
      why: "RANK gives tied rows the same rank and skips the next — 1-2-2-4 — which is the honest board: two equally thin shelves, and the next SKU clearly fourth. DENSE_RANK would read 1-2-2-3 and undercount the shelf; ROW_NUMBER would break the tie arbitrarily.",
      notes: [
        { choice: 1, why: "That's DENSE_RANK's contract — no gaps. The dark-store board wants the gap, because the number of SKUs thinner than yours matters for restock priority." },
        { choice: 2, why: "That's ROW_NUMBER's contract — arbitrary tie-breaking. Fine for a pick list, wrong for a board someone will screenshot." },
      ],
      difficulty: "hard",
    },
    {
      id: "blinkit-mcq-9",
      prompt: "The settlement queue needs statements with NO payment row. Which shape is silently WRONG on a nullable join key?",
      choices: [
        "WHERE i.id NOT IN (SELECT invoice_id FROM payments)",
        "LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "All three are equivalent and safe",
      ],
      answer: 0,
      why: "NOT IN with one NULL invoice_id in the subquery makes every comparison UNKNOWN — the whole queue empties with no error. The LEFT JOIN … IS NULL and NOT EXISTS shapes are NULL-safe; the subquery variant needs an explicit IS NOT NULL guard at minimum.",
      notes: [
        { choice: 3, why: "They're only equivalent when the subquery's population is NULL-free — 'invoice_id is never NULL' is an assumption, and settlement data keeps disproving assumptions." },
        { choice: 2, why: "NOT EXISTS is NULL-safe but reads as a per-row probe — on big ledgers the LEFT JOIN anti-join plan can be materially cheaper." },
      ],
      difficulty: "hard",
    },
    {
      id: "blinkit-mcq-10",
      prompt: "Statement #25 shows 6,148.00 owed with a single 4,000.00 settlement against it. The queue classifies coverage as exact / partial / none. Where does #25 land, and why does the status filter miss it?",
      choices: [
        "Partial — 4,000 of 6,148 settles less than owed; coverage is a fold over payments, not a status column",
        "Exact — 4,000 is a round number, so it's fully settled",
        "None — a partial settlement counts as no settlement",
        "The row errors — coverage can't be computed",
      ],
      answer: 0,
      why: "Coverage is computed: fold payments per statement (SUM of amount_cents / 100.0), compare to the owed amount, and classify — 4,000.00 of 6,148.00 is the db's one verified partial. A status filter can't see it; the classification lives in the LEFT JOIN + CASE coverage fold, which is exactly why the queue folds coverage instead of trusting the column.",
      notes: [
        { choice: 1, why: "'Exact' is a money comparison, not a rounding aesthetic — 4,000.00 ≠ 6,148.00, and calling a 2,148.00 gap settled is how AR quietly rots." },
        { choice: 2, why: "'None' is the no-payment-rows arm — 6 statements at 15,217.00 including the paid-with-no-payment anomaly #28. Merging partials into it hides recoverable money." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-blinkit-1",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The store-cluster funnel",
      brief: "Store-ops memo, Blinkit-flavored on the storefront db: the morning standup opens on the cluster funnel — every placed basket lands in exactly one of {emerald:delivered} 52, {sky:shipped} 30, {amber:pending} 14 or {rose:cancelled} 7 (103 total), and the board splits the first two from the last two *because a pending basket is a restock delay, not a lost basket*. Scaled clusters only — at least **19** placed baskets — biggest cluster first. Probed fold: EU 45 baskets / 335.32 avg / 24 delivered / 6 pending; APAC 37 / 313.66 / 21 / 5; US 19 / 383.48 / 5 / 3. The branches must reconcile to COUNT(*) per cluster — one population, many numerators.",
      ask: "Return the cluster funnel: store_cluster, baskets, avg_basket, fulfilled_now, never_left — biggest cluster first, scaled clusters only.",
      template: "SELECT c.region AS store_cluster,\n       COUNT(*) AS baskets,\n       ROUND(AVG(o.total), 2) AS avg_basket,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS fulfilled_now,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS never_left\nFROM orders o\nJOIN customers c ON {3}\nGROUP BY c.region\nHAVING COUNT(*) >= {4}\nORDER BY baskets {5}",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the fulfilled arm",
          why: "Fulfilled-now means status = 'delivered' — 24 EU / 21 APAC / 5 US of the 52 network-wide. Arm it 'shipped' and the board counts the 30 in-flight baskets as landed; arm it 'cancelled' and you've merged a lost-sale census into a fulfillment KPI.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the never-left arm",
          why: "Never-left is the pending queue — 6 EU / 5 APAC / 3 US of the 14 network-wide — a restock-delay population, distinct from {rose:cancelled} (3/3/1). The distinction is the board's whole argument; merging them misreads logistics as churn.",
        },
        {
          answer: "c.id = o.customer_id",
          kind: "keyword",
          label: "the cluster join key",
          why: "Clusters attach to baskets through the household: c.id = o.customer_id. Join on c.id = o.id and baskets pair with whatever household shares their row id — the funnel shrinks to a 16-row coincidence and every cluster reads wrong with no error.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the scaled-cluster gate",
          why: "The gate keeps the three scaled clusters: EU 45, APAC 37, and the US exactly 19 — ON the boundary. LATAM's 2-basket population waits outside; a gate of 20 silently deletes a whole cluster from the standup deck while 18 changes nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-cluster direction",
          why: "The standup reads top-down: 45, 37, 19. ASC opens on the smallest scaled cluster — a correct query that spends the room's ten minutes backwards.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "c.customer_id = o.customer_id", "c.id = o.id", "20", "ASC"],
      walkthrough: "The funnel is two conditional counts over one population. The CASE arms split the 52 {emerald:delivered} (24 EU / 21 APAC / 5 US) from the 14 {amber:pending} (6 / 5 / 3) — arm 'shipped' into the wrong slot and the board counts the 30 in-flight baskets as landed; arm 'cancelled' in and the restock-delay population becomes a lost-sale census. The join keys clusters to baskets on `c.id = o.customer_id`; join on `c.id = o.id` and the fold pairs baskets with whatever household shares their row id. The gate at 19 keeps the three scaled clusters — US sits exactly on it, so 20 deletes a cluster while 18 changes nothing. Per-cluster branches reconcile to COUNT(*): 24 + 6 + shipped 12 + cancelled 3 = 45 EU. *One population, many numerators — that sentence is the whole funnel.*",
    },
    {
      id: "cs-blinkit-2",
      tier: "hard",
      topic: "t5",
      universe: "inventory",
      title: "The thin-shelf board",
      brief: "Availability memo, Blinkit-flavored: the dark-store team wants the thin-shelf board before the weekend surge — every SKU whose remaining cover (stock minus units sold across the **251** basket lines) has dropped to **20 units or fewer**, ranked thinnest first, because a stockout on a fast mover breaks the 10-minute promise harder than any routing bug. The fold is staged: one row per SKU, `remaining = p.stock - SUM(oi.quantity)`, then the window ranks the survivors. Probed board: **3 SKUs** — Noise-Canceling Headset at **14** remaining, Studio Desktop Mic at **15**, Smart Watch S at **17** — and no product is dead (never-ordered = 0), so the risk is thinning, not dying.",
      ask: "Return the thin-shelf board: sku, category, remaining, thin_rank — thinnest first, 20 units or fewer.",
      template: "SELECT t.name AS sku,\n       t.category,\n       t.remaining,\n       {1} OVER (ORDER BY t.remaining ASC) AS thin_rank\nFROM (\n  SELECT p.id, p.name, p.category, p.stock,\n         {2} AS remaining\n  FROM products p\n  JOIN order_items oi ON {3}\n  GROUP BY p.id\n) t\nWHERE t.remaining <= {4}\nORDER BY thin_rank ASC",
      slots: [
        {
          answer: "RANK()",
          kind: "keyword",
          label: "the tie-aware rank",
          why: "RANK gives tied shelves the same rank with a gap after — the honest board when two SKUs thin out together. ROW_NUMBER and DENSE_RANK change the tie policy silently, and NTILE/PERCENT_RANK aren't ranks at all — they bucket the board instead of ordering it.",
        },
        {
          answer: "p.stock - SUM(oi.quantity)",
          kind: "keyword",
          label: "the remaining-cover fold",
          why: "Availability is a subtraction over a fold: stock minus units sold per SKU — Headset 60 − 46 = 14. Raw SUM(oi.quantity) reads demand as cover; bare p.stock ignores sales; the plus-variant claims restocks that never landed.",
        },
        {
          answer: "oi.product_id = p.id",
          kind: "keyword",
          label: "the line-to-SKU key",
          why: "Lines reference SKUs by product_id, so the stitch is oi.product_id = p.id. Join on p.id = p.id and every SKU absorbs all 251 lines' quantity — every shelf reads negative and the board fills with phantom stockouts.",
        },
        {
          answer: "20",
          kind: "number",
          noVerify: true,
          label: "the thin-shelf threshold",
          why: "The gate is a signed definition: <= 20 units of cover. It keeps exactly the probed three (14, 15, 17) — the next SKU up is the 4K Webcam Pro at 39, outside by 19 units. Move it to 40 and a SKU the team never staffed for walks onto the board.",
        },
      ],
      distractors: ["NTILE(2)", "PERCENT_RANK()", "SUM(oi.quantity)", "p.id = p.id", "40", "15"],
      walkthrough: "Staged fold first: the derived table joins order_items to products on `oi.product_id = p.id` and collapses 251 line rows to one row per SKU with `remaining = p.stock - SUM(oi.quantity)` — fold before the window, or the rank runs over line grain and the board counts lines, not shelves. The outer query keeps `remaining <= 20`: Headset **14** (60 stock − 46 sold), Mic **15** (45 − 30), Smart Watch S **17** (40 − 23), and RANK() over the ASC ordering hands them ranks 1-2-3 with no ties to fight — but the function still matters, because tomorrow's fold can tie. Raise the cutoff to 40 and the 4K Webcam Pro (39 remaining) walks onto a board the team never staffed for; use raw SUM(oi.quantity) as remaining and the board reads demand as cover. *Availability is a subtraction, and the subtraction needs the fold before the rank.*",
    },
  ],

  problems: [
    { slug: "basket-depth-aov", why: "Lines per basket beside value per basket — the 251-over-103 fold (2.44 lines) that is Blinkit's whole unit-economics story." },
    { slug: "find-stores-with-inventory-imbalance", why: "SKU cover folded per cluster — the thin-shelf board's practice shape: stock minus sold, gated at a threshold, ranked thinnest first." },
    { slug: "customer-order-frequency", why: "Households hitting the N-basket gate — the repeat-purchase tier the retention budget defends, drilled until HAVING-vs-WHERE is reflex." },
    { slug: "immediate-food-delivery-i", why: "Immediate-fulfillment share with the honest denominator — the 10-minute promise's funnel read, one status at a time." },
    { slug: "the-category-of-each-member-in-the-store", why: "Spend-band classification via CASE — basket-size tiers (budget 32.06 avg vs mid 111.50) with edges that are definitions, not vibes." },
    { slug: "most-frequently-ordered-product-per-customer", why: "The habitual SKU per household — dark-store assortment is personalization at person grain, argmax per key over basket lines." },
    { slug: "list-the-products-ordered-in-a-period", why: "SKUs that moved in a window — the weekly availability review's first fold: what sold, in the window, aggregated at SKU grain." },
    { slug: "group-sold-products-by-the-date", why: "Lines folded into daily comma lists — the dark-store picking manifest, one cell per day, straight from the 251-line book." },
    { slug: "sales-by-day-of-the-week", why: "Weekday demand pivots — dark stores live and die by the day-of-week curve, and the CASE pivot is the staffing drill." },
    { slug: "warehouse-manager", why: "Stock folded per SKU beside what moved — the availability fold (stock, sold, remaining) in one query, the thin-shelf board's skeleton." },
    { slug: "product-sales-analysis-iii", why: "SKUs that never sold — here it returns 0 (never-ordered = 0), which is the lesson: shelf risk on this db is thinning (14/15/17 remaining), not dying." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share math with 100.0 before the divide — the cancel-share read (8.1% APAC on 37) rounded once at the end like every Blinkit rate." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Basket-combo logic — households that pair two categories and skip a third: the assortment-gap screen at person grain." },
    { slug: "second-highest-salary", why: "Second-place reads without LIMIT fragility — the leaderboard edge case every dark-store top-N board hits eventually." },
    { slug: "find-customers-with-positive-revenue-this-year", why: "HAVING-gated folds — the profit-screen shape: aggregate first, then judge the fold, never the rows beneath it." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary banding with NTILE — the retention segmentation Blinkit's CRM runs on basket history every quarter." },
  ],
};
