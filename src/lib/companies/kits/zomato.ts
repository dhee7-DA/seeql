// Zomato — kit 3 of the Food & Quick-commerce domain (Batch E).
// India's restaurant-discovery-to-hyperlocal-delivery platform: zone-shaped
// delivery ops, hygiene-rated restaurant partners, and a dining-out surface
// that makes 'orders placed' and 'orders kept' two different numbers.
// Pool provenance: Zomato has 0 tagged rows in the band — all 16 problems
// and 30 topic slugs are THEME-CURATED from the sql rows in
// scripts/company-pools.md (the delivery-canonical immediate-food-delivery
// pair and trips-and-users carry DoorDash/Uber tags, included because they
// are the food-delivery screens). Case studies run on the storefront db with
// probed figures from scripts/company-facts.md, mapped honestly:
// orders = delivery orders, order_items = plate lines, shipped_at =
// delivery-completed timestamp, products = menu items, suppliers = restaurant
// merchant partners, region = delivery zone, invoices/payments/expenses =
// partner-settlement and ops finance.

import type { CompanyKit } from "../types";

export const zomatoKit: CompanyKit = {
  id: "zomato",
  domainId: "food",
  name: "Zomato",
  tagline: "Restaurant discovery to hyperlocal delivery",
  accent: "text-pink-400",

  brief: [
    "Zomato is India's restaurant platform — the discovery app where the country decides where to eat, and the delivery network that brings the plate home. Two surfaces, one dataset: dining-out (browse, ratings, hygiene scores, menus) and hyperlocal delivery (zone-shaped fleets, kitchen prep windows, rider handoffs). The business reality every analyst internalizes: *a placed order is not a kept order*. Restaurants reject or out-of-stock, riders redeploy, customers cancel — on this kit's proxy ledger 103 placed orders split into **52 delivered, 30 shipped, 14 pending and 7 cancelled**, and the **6.8% cancellation share** is not noise, it is the number the ops floor manages. Zone by zone the shares diverge — APAC 3 of 37 (8.1%), EU 3 of 45 (6.7%), US 1 of 19 (5.3%), LATAM 0 of 2 — which is exactly the kind of denominator-vs-numerator split Zomato screens love to watch you compute.",
    "The data org is zone-first. A city or zone lead opens the day on a delivery-health board — placed versus delivered versus cancelled, delivery latency, merchant fill — and '*why did APAC's cancellation share tick up*' is a question someone answers in SQL before standup. Merchant-side analytics is the second pillar: hygiene ratings (the 4.5-plus trusted bench holds **2 of this ledger's 6 partners, rated 4.6 and 4.8**), menu mix, plate economics per category — the {amber:Audio-class} category leads this ledger at **11,744.01** in revenue on 97 units, while the Accessories class touches the most orders (**54 of 103**). Ratings, menus and delivery events all land as timestamped rows, so month buckets and date math are daily tools, not interview trivia.",
    "Interview style is honest-denominator country. A screen usually opens with a warm-up join (attach customers to their orders, merchants to their plates), escalates into conditional aggregation with a status rule (**cancellation share by zone**, delivered-only latency), then either a window question (rank zones by monthly demand, running revenue) or a rate question where the trap is integer division or a WHERE clause that silently shrinks the denominator. Follow-ups are spoken out loud: '*does a cancelled order count in your denominator?*', 'is that per order or per customer?', 'which month are you calling peak, and by what measure?'. Candidates who narrate **grain, filter placement and population** before writing SQL consistently outperform.",
    "Preparation strategy: Zomato has no tagged rows in the band, so this kit is theme-curated — every problem mirrors a workflow Zomato screens are known to probe: the `immediate-food-delivery` pair for kept-share denominators, ratings-histogram for hygiene-score reads, restaurant-growth for rolling demand, find-peak-calling-hours for the dinner-rush hour argmax. The two case studies run on the live storefront db, mapped honestly onto delivery: orders are delivery orders, `order_items` are plate lines, `shipped_at` is the delivery-completed timestamp, suppliers are merchant partners, region is the zone. One case rebuilds the zone cancellation map the ops review opens with; the other rebuilds the monthly demand close for the growth deck. Both are mechanically audited against the probed db figures.",
  ],

  dayInLife: [
    "**08:30 —** The day starts on the zone board — overnight placed-versus-delivered-versus-cancelled by zone, delivery latency against the **2-to-4-day window** this ledger shows, and merchant fill on the rated bench. The first query is almost always a reconciliation: did the order stream land completely, does the zone rollup tie to the raw rows, do plate-line sums tie to order totals. The analyst who can write the two-sided diff — which zone lost rows, by how much, since when — is the one the zone lead pings first. Before the second coffee, the cancellation map goes out: one row per zone, placed, cancelled, share, worst zone on top, because *the intervention targets one zone, not four*.",
    "**12:15 —** The lunch spike lands with a question attached: why did APAC's cancellation share tick up — **3 of 37 (8.1%)** against EU 6.7%, US 5.3%, LATAM flat at 0 of 2? The drill-down splits by month, by merchant rating tier, by plate category: was it a merchant outage, a demand spike the fleet couldn't hold, or a data gap? The {rose:cancelled} rows stay inside the fold while the placed denominator holds, and the answer ships with the split that found it.",
    "**14:45 —** The deep-dive block. A hygiene-rating review needs the 4.5-plus bench (**4.6 and 4.8** on this ledger) with their revenue contribution folded honestly; a menu-mix question needs the category crowns — **11,744.01 from the top category versus 3,294.29 from the highest-reach one** — with orders-touched counted at `DISTINCT order` grain, not line grain. Every deep-dive ends the same way: the definition written next to the number — 'cancellation share = cancelled ÷ placed, pending stays in the denominator' — because a share without its denominator is a rumor that survives until the ops review.",
    "**17:30 —** Stakeholder cycles. The monthly close wants the demand trend bucketed by `STRFTIME` month — **2024-01's 3,731.97 peak against 2024-07's 1,193.86 trough**, with cancellations carried alongside — and it wants the buckets to survive a year-boundary audit, which is where '%Y-%m' versus '%m' stops being pedantry. Growth wants repeat-order concentration (the 3,000-plus spenders hold **63.5%** of this ledger's revenue) at customer grain, not order grain. The last hour is the EOD writeup — what spiked, which definition held, what tomorrow's reconciliation must tie — because the post-mortem culture treats a metric whose definition drifted mid-spike as an incident, and *Zomato SQL exists to keep demand, delivery and merchant health honest in the same query, at the hour the spike happens*.",
  ],

  metrics: [
    { name: "Orders delivered", what: "Delivery orders that reached a delivery timestamp. On this ledger 82 of 103 carry one (52 delivered-status + 30 shipped-status); the other 21 are the pending-plus-cancelled gap the zone floor manages." },
    { name: "Zone cancellation share", what: "Cancelled ÷ placed, per zone. Probed here: APAC 3 of 37 = 8.1% is the worst zone against EU 6.7%, US 5.3%, LATAM 0% — a conditional-count ratio whose denominator is fixed before the ratio is computed." },
    { name: "Delivery latency", what: "Order-to-delivery-timestamp delta, averaged over completed deliveries only. This ledger averages 2.98 days inside a 2-to-4 range, split EU 2.94 / APAC 2.93 / US 3.07 / LATAM 3.50 — the population statement IS the metric." },
    { name: "Hygiene-rated bench share", what: "Merchants at or above the 4.5 rating floor: 2 of this ledger's 6 partners (4.6, 4.8). The trust read behind discovery ranking — and a HAVING-floor drill, not a WHERE one." },
    { name: "Cuisine/category crowns", what: "Revenue and units folded per menu category: Audio-class 11,744.01 on 97 units leads, while Accessories-class touches the most orders (54 of 103). Two crowns — value and reach — and both get quoted." },
    { name: "Repeat-order concentration", what: "Revenue share held by customers whose lifetime spend crosses a threshold: 63.5% from the 3,000-plus spenders here. A customer-grain read that dies the moment order-grain COUNT(*) sneaks in." },
    { name: "Monthly demand trend", what: "Orders and revenue bucketed by SUBSTR/STRFTIME month: 14 buckets from 2024-01 to 2025-02, peaking at 3,731.97 (2024-01) and troughing at 1,193.86 (2024-07, with 2 of the 7 cancellations)." },
    { name: "Average order value", what: "SUM(total) ÷ COUNT(*) at order grain: 338.19 on this ledger, with a 25.47-to-1,088.44 spread. The basket read the merchant team quotes — always beside its min/max, never alone." },
  ],

  topics: [
    {
      name: "Order-fate conditional counts",
      why: "Everything at Zomato starts by folding placed orders into per-zone, per-month aggregates without letting status pollute the total. Delivered, shipped, pending, cancelled — order fate is a CASE branch inside a SUM, and the ELSE arm's width is the audit of your denominator.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Zone cancellation shares",
      why: "Cancellation share is cancelled ÷ placed — the denominator is the whole test, and 100.0-before-division is the habit that keeps the share honest. Trips-and-users is the canonical delivery screen here: cancellation share with exclusions, where one careless filter moves the denominator.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "trips-and-users"],
    },
    {
      name: "Hygiene ratings & review reads",
      why: "Discovery runs on ratings: hygiene benches, rating histograms, polarized review spreads. Folding ratings per merchant with a quality floor (the 4.5-plus bench: 2 of 6 partners here) is a GROUP BY + HAVING read — and the floor belongs in HAVING, not WHERE.",
      slugs: ["ratings-histogram", "find-books-with-polarized-opinions", "article-views-ii"],
    },
    {
      name: "Delivery latency & golden windows",
      why: "Latency questions pair two timestamps of one order — placed with delivered — and average the delta over completed rows only. The 2.98-day average and the 2-to-4 range are exactly that shape, and 'first order inside the dinner window' is the date-math cohort gate beside it.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Menu-mix argmax & crowns",
      why: "Which menu category leads revenue (11,744.01) versus which touches the most orders (54 of 103) are two different crowns, and screens love forcing you to pick the grain. Argmax per item and top-customer-by-orders are the ranking muscles behind every menu review.",
      slugs: ["product-sales-analysis-ii", "the-most-recent-orders-for-each-product", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Peak hours & weekday pivots",
      why: "Demand is a dinner-rush shaped thing: peak ordering hour per zone, weekday pivots for the weekend spike, weekend-count gates. Hour argmax per city and day-of-week pivots are the exact query shapes the demand team ships weekly.",
      slugs: ["find-peak-calling-hours-for-each-city", "sales-by-day-of-the-week", "tasks-count-in-the-weekend"],
    },
    {
      name: "Month buckets & demand trend",
      why: "The monthly close lives on STRFTIME buckets — 14 of them on this ledger, 2024-01 to 2025-02 — and the classic bug is '%m' merging January 2024 with January 2025 into one phantom bucket. Bucket, then rank, then carry cancellations alongside.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Repeat-order cohorts",
      why: "Retention here is re-ordering: customers who bought A and B but not C, loyal-customer islands, cohort retention matrices. The 63.5% revenue concentration from big spenders is the business reason this family gets screen time.",
      slugs: ["cohort-retention-matrix", "customers-who-bought-a-and-b-not-c", "find-loyal-customers"],
    },
    {
      name: "NULL policy on the delivery clock",
      why: "The delivery timestamp is NULL until the order completes — 21 of 103 rows here. Screens probe whether your filters, joins and aggregates handle those holes on purpose: report them, coalesce them, or exclude them with a stated reason.",
      slugs: ["null-blank-audit", "employees-with-missing-information", "find-customer-referee"],
    },
    {
      name: "Escalation shapes: CASE & subqueries",
      why: "Screens close with composed asks: classification CASEs (weather-type shape), above-average reads via scalar subqueries, monthly ratio stacks. The escalation is composition — status logic and second-stage aggregates in one query, no panic.",
      slugs: ["weather-type-in-each-country", "second-highest-salary", "immediate-food-delivery-iii"],
    },
  ],

  theory: [
    {
      id: "zomato-t1",
      q: "Orders attach to customers on one key and to merchant partners through a two-hop chain. When do you insist on a LEFT JOIN in a delivery read, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. If the question is order-shaped — cancellation share, latency, plate mix — the order table is the spine and INNER joins that attach customer and merchant attributes are right, because every unmatched row would distort a rate built on order counts. If the question is supply-shaped — which merchant partners carried listings that never sold this month — the merchant table is the spine and LEFT JOIN + IS NULL is the only honest shape: INNER would drop exactly the partners you're hunting for. The delivery-specific discipline is doing both directions deliberately: demand reads join from orders outward, merchant reads join from supply inward, and 'which side is the spine' is a sentence you say out loud before the FROM clause. On this kit's proxy ledger every order resolves to a customer and every plate line to a menu item, so INNER and LEFT coincide — which is precisely why the interviewer asks you to reason about the shape instead of leaning on the data to save you.",
      tag: "joins",
    },
    {
      id: "zomato-t2",
      q: "Rank delivery zones by monthly orders. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one do you hand the ops floor?",
      a: "They disagree exactly where orders tie. RANK gives both tied zones the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing zone that doesn't exist. DENSE_RANK gives the tie the same rung and keeps the sequence compact (1, 2, 2, 3). ROW_NUMBER splits the tie arbitrarily (1, 2, 3, 4) unless you add a deterministic tie-breaker like zone id, which makes it the dedupe tool, not the leaderboard tool. The ops floor gets DENSE_RANK: zone rankings are read as 'who's nth', and a skipped rung generates a meeting about a zone that was never there. On a 103-order ledger ties are everywhere — monthly demand buckets land within an order or two of each other — so the rank trio is a business decision about who shares a rung, not a syntax preference. And the LIMIT-1-OFFSET-1 'second place' habit breaks on every tie; the honest second place is DENSE_RANK = 2, and if two zones share it, the answer is 'both', not 'whichever the engine sorted first'.",
      tag: "windows",
    },
    {
      id: "zomato-t3",
      q: "On this ledger — 103 placed orders, 82 with a delivery timestamp, 16 customers — narrate what COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) each return.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every placed order, the denominator grain of cancellation and completion shares. COUNT(shipped_at) is 82 — the completed subset, because COUNT skips NULLs; that column is the numerator grain, and the gap between 103 and 82 IS the pending-plus-cancelled picture (14 pending, 7 cancelled). COUNT(DISTINCT customer_id) is 16 — repeat orders folded back to people, the audience grain. The delivery trap is reporting one grain under another's name: 'orders per customer' computed as COUNT(*)/COUNT(DISTINCT customer_id) is 6.4 and meaningful, but 'completion share' computed over DISTINCT customers mixes numerator and audience grains and produces a number nobody can act on. The strong answer assigns a grain to each form out loud — rows, non-null rows, distinct entities — and refuses to let them blur. That two-grain habit is the single most-drilled reflex in this kit.",
      tag: "aggregation",
    },
    {
      id: "zomato-t4",
      q: "The delivery timestamp is NULL until the order completes. What is your NULL policy for a delivery-latency metric, and what does AVG do about the NULLs whether you ask or not?",
      a: "AVG ignores NULLs silently — so AVG(delivered_ts - placed_ts) over ALL orders is already 'average latency of completed orders', a population chosen by NULL semantics rather than by you. On this ledger that's the 82 completed rows averaging 2.98 days; the 21 rows without a timestamp (14 pending, 7 cancelled) have no latency YET. The policy is to make that choice explicit: latency exists only for completed deliveries, so filtering the NULLs in WHERE is correct — and then the report's subtitle says so. Three behaviors to narrate: in filters, NULL fails both = and != comparisons, so 'shipped_at < cutoff' silently drops in-flight orders; in joins, NULL keys never match; in aggregates, COUNT(col) skips them while COUNT(*) keeps the row. What you never do is COALESCE a fake zero into the latency column — a pending order with zero latency reads as instant delivery in the zone review, which is worse than a hole. Guard the population, not the decoration: define who has latency, state it, and let NULL mean 'not yet'.",
      tag: "nulls",
    },
    {
      id: "zomato-t5",
      q: "'Zones whose cancellation share exceeds 7%' — WHERE or HAVING, and why can't the other clause see the share at all?",
      a: "HAVING, because the cancellation share is a group fact: it exists only after GROUP BY zone folds the orders and the conditional SUM divides by COUNT(*). Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before groups form, so the share literally does not exist yet; the engine throws 'no such column', and that error is the pipeline order teaching itself. The split that predicts every placement: row predicates in WHERE (status = 'cancelled' inside the CASE numerator, not as a row filter — the moment you put it in WHERE the denominator shrinks to cancelled-only and every zone reads 100%), group predicates in HAVING (share thresholds, order-count floors). On this ledger the shares are APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0% — a 7% floor keeps APAC and EU, and only a HAVING-computed share can say that. Filter rows before the fold, filter groups after, and never let a WHERE do a HAVING's definitional work.",
      tag: "pipeline",
    },
    {
      id: "zomato-t6",
      q: "You need orders with a total above the network average. Walk me through the scalar subquery contract — and what happens on a filtered staging set where the inner query returns empty.",
      a: "A scalar subquery is contractually one column, zero-or-one rows. One row: its value joins the comparison — WHERE total > (SELECT AVG(total) FROM orders) runs the fold once and keeps the 42 above-average orders on this ledger (average 338.19). Zero rows: it yields NULL, not an error, and total > NULL is UNKNOWN — the report ships empty with no complaint, which is the dangerous outcome on filtered staging sets (one zone, one month, one merchant tier) where the inner fold legitimately can come back empty. Two follow-ups separate seniors: the correlated cousin — WHERE o.total > (SELECT AVG(i.total) FROM orders i WHERE i.zone = o.zone) — re-runs per outer row and answers 'above MY zone's average', a different question with a real cost profile; and the NULL-poisoning rule that NOT IN over a nullable inner list empties everything, while EXISTS or a LEFT JOIN anti-join survives. Saying which population the inner fold covers, and what happens when it's empty, is exactly what this follow-up is fishing for.",
      tag: "subqueries",
    },
    {
      id: "zomato-t7",
      q: "Order events carry TEXT timestamps. How do you bucket them by month, diff them into delivery durations, and window a dinner-rush night — and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — gives the month spine; the '%m'-only shortcut merges January 2024 with January 2025 into one phantom bucket, and this ledger spans 2024-01 to 2025-02 so the trap is live. Durations: JULIANDAY(delivered_ts) - JULIANDAY(placed_ts) returns fractional days — the 2.98-day average with a 2-to-4 range is exactly that, rounded once at the end, never per row. Windows: half-open intervals — created_at >= '18:00' AND < '22:00' — never BETWEEN on the end boundary, which drops the dinner rush's last minutes, the highest-volume minutes of the night. The deeper break: these strings carry no timezone contract, and the NULL delivery timestamp means every duration fold needs its population stated first — completed orders only. State the convention and the population, then query; never the reverse.",
      tag: "dates",
    },
    {
      id: "zomato-t8",
      q: "Order event streams double-fire on retries. How do you dedupe to one row per order without losing the latest state — and how do you prove the dedupe didn't eat real orders?",
      a: "Two moves, then the proof. Detection: GROUP BY order_id HAVING COUNT(*) > 1 is the cheapest duplicate census in SQL — run it before anything else and put the number in the ticket. Collapse: ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY event_at DESC, event_id DESC) = 1 keeps the latest state per order, and the event_id tie-break is the part interviewers wait for — two events sharing a timestamp is the norm on retry storms, and without the tie-break 'latest' is engine-arbitrary. But collapsing is a decision, not a default: if the stream carries genuine state transitions (placed → picked → delivered), folding them loses the funnel — so first ask whether the duplicates are retries of the SAME state or DISTINCT states, and keep the transitions if the funnel needs them. The proof is two counts: COUNT(*) before versus after, and COUNT(*) versus COUNT(DISTINCT order_id) — if they diverge unexpectedly, the dedupe ate real orders. Cheap, boring, run every time; that's what makes it a habit instead of a hope.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "zomato-mcq-1",
      prompt: "The orders table holds 103 delivery orders from 16 customers. Which pair of counts belongs on the zone board's 'orders / customers' census?",
      choices: [
        "COUNT(*) and COUNT(DISTINCT customer_id)",
        "COUNT(*) and COUNT(customer_id)",
        "COUNT(DISTINCT customer_id) and COUNT(customer_id)",
        "COUNT(*) twice — orders and customers are the same grain",
      ],
      answer: 0,
      why: "COUNT(*) counts order rows (103); COUNT(DISTINCT customer_id) folds repeat orders back to people (16). The gap — 6.4 orders per customer — is the repeat-demand signal the two-grain census exists to expose.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) skips only NULLs; with a NOT NULL FK it counts 103 too. DISTINCT is the fold, not NULL-skipping." },
        { choice: 3, why: "Orders and customers are different grains — 103 versus 16. Asserting they're the same erases the repeat-order signal entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "zomato-mcq-2",
      prompt: "7 of 103 placed orders are cancelled. Which expression computes the network cancellation share, 6.8%?",
      choices: [
        "100 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)",
        "COUNT(status = 'cancelled') / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)",
        "AVG(status = 'cancelled') * 100",
      ],
      answer: 2,
      why: "The conditional SUM counts cancelled rows at the same fold where COUNT(*) holds all placed orders, and 100.0 forces real division: 7/103 = 6.8%. Both guards — same-grain denominator, float promotion — in one expression.",
      notes: [
        { choice: 0, why: "INTEGER 100 first means integer division: 7/103 truncates to 0 before any multiplication. Every sub-1% share prints 0 — the classic silent bug." },
        { choice: 1, why: "COUNT takes an expression only in the sense of counting non-NULL values; a boolean comparison column isn't a thing here — this is a syntax error, and 'COUNT IF' thinking is the tell." },
      ],
      difficulty: "easy",
    },
    {
      id: "zomato-mcq-3",
      prompt: "Zone cancellations: EU 3 of 45, APAC 3 of 37, US 1 of 19, LATAM 0 of 2. Which query returns the single worst zone by cancellation share — and which zone is it?",
      choices: [
        "WHERE status = 'cancelled' GROUP BY region ORDER BY COUNT(*) DESC LIMIT 1 — ties EU and APAC at 3",
        "GROUP BY region, compute 100.0*SUM(cancelled-flag)/COUNT(*), ORDER BY ... DESC, LIMIT 1 — APAC at 8.1%",
        "GROUP BY region HAVING COUNT(*) > 1 — EU, biggest volume",
        "GROUP BY region ORDER BY COUNT(*) DESC LIMIT 1 — EU, most orders",
      ],
      answer: 1,
      why: "Share is a group fact: the CASE-SUM numerator over the COUNT(*) denominator of ALL placed orders, sorted descending, cut to one — APAC 3/37 = 8.1%, worst despite tying EU on raw counts (3 each). The denominator is the metric.",
      notes: [
        { choice: 0, why: "Filtering cancelled first shrinks the denominator to the numerator's population — every surviving zone reads 100%, and the tie at 3 breaks arbitrarily. Denominator drift, the delivery report killer." },
        { choice: 2, why: "Raw volume ignores exposure: APAC's 3 cancels came from 37 orders, EU's from 45. Without the share, the intervention targets volume, not risk." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-4",
      prompt: "AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) over ALL 103 orders returns 2.98. What population did AVG silently choose?",
      choices: [
        "All 103 orders — NULLs count as zero duration",
        "Only the cancelled orders — they end the funnel",
        "The 82 rows with a delivery timestamp — AVG skips NULL inputs",
        "It returns NULL — one NULL poisons the whole aggregate",
      ],
      answer: 2,
      why: "Aggregates ignore NULL inputs: the 2.98-day average runs over the 82 completed deliveries only. That IS the right population for latency (uncompleted orders have no latency yet) — but it must be stated, because the query never said it.",
      notes: [
        { choice: 0, why: "NULLs are never zeros in aggregates — zero-latency bugs come from COALESCE-ing the column, not from AVG itself. A coalesced pending order reads as instant delivery." },
        { choice: 3, why: "AVG returns NULL only when EVERY input is NULL. With 82 real latencies present, a real average comes back — over a silently-shrunk population." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-5",
      prompt: "'Merchant partners with an average rating of at least 4.5' — the ratings live on the partner row itself. WHERE rating >= 4.5 or HAVING AVG(rating) >= 4.5?",
      choices: [
        "HAVING — every rating read is a group fact",
        "WHERE rating >= 4.5 — the rating is a row attribute, no fold needed",
        "Neither — you need a window function",
        "WHERE AVG(rating) >= 4.5 after GROUP BY partner",
      ],
      answer: 1,
      why: "When the rating lives on the merchant row, the 4.5 floor is a row predicate: WHERE keeps the 2 of 6 partners (4.6, 4.8) with no GROUP BY at all. HAVING AVG(...) is for ratings spread across many rows folded per merchant.",
      notes: [
        { choice: 0, why: "HAVING without GROUP BY folds the whole table into one group — you'd get a single mysterious row, not the two-partner bench." },
        { choice: 3, why: "WHERE cannot see aggregates — AVG doesn't exist until groups form. This choice errors out, and the error is the pipeline-order lesson." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-6",
      prompt: "STRFTIME('%m', created_at) buckets the monthly demand trend. What breaks on a ledger spanning 2024-01 to 2025-02?",
      choices: [
        "Nothing — '%m' is the standard month bucket",
        "January 2024 and January 2025 collapse into one bucket, faking a demand spike",
        "The bucket values come out NULL for the 2025 rows",
        "STRFTIME only accepts date columns, not text timestamps",
      ],
      answer: 1,
      why: "'%m' emits the month-of-year alone: '2024-01' and '2025-01' both bucket as '01', so two Januaries sum into one phantom peak. '%Y-%m' keeps the year in the key — the difference between a trend and a hallucination.",
      notes: [
        { choice: 2, why: "STRFTIME returns a value for every row; the failure is silent bucket-merging, not NULLs. Silent is worse — the chart looks plausible." },
        { choice: 3, why: "STRFTIME happily takes ISO text timestamps. The trap is the format string, not the input type." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-7",
      prompt: "promo.customer_id is nullable. Why is `WHERE c.id NOT IN (SELECT customer_id FROM promo_claims)` dangerous for the 'customers who never claimed' read?",
      choices: [
        "It's slower than a LEFT JOIN anti-join",
        "One NULL customer_id in the claim list empties the entire result — permanently",
        "It converts NULL customer ids to zero, matching nobody",
        "It ignores duplicate customer ids in the claim list",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows while the query looks reasonable. NOT EXISTS or LEFT JOIN + IS NULL is the NULL-proof anti-join.",
      notes: [
        { choice: 0, why: "Performance is secondary; the failure is CORRECTNESS — an empty promo-eligibility report that ships looking valid. NULL poisoning is a logic bug, not a speed one." },
        { choice: 2, why: "NULLs don't convert to anything — they poison the membership test itself. The result is empty, not zero-filled; that's what makes it dangerous." },
      ],
      difficulty: "hard",
    },
    {
      id: "zomato-mcq-8",
      prompt: "A per-day revenue fold has day ties (several days at 8 orders). In SUM(revenue) OVER (ORDER BY orders DESC), what does the running total at the FIRST 8-order row include?",
      choices: [
        "Just that one row — running totals add row by row",
        "All 8-order days — the default frame is RANGE, and peers ride together",
        "The whole table — an unordered window is global",
        "Nothing — window sums require an explicit ROWS BETWEEN",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes ordering PEERS — the running total jumps by the whole tied group at once. ROWS BETWEEN … CURRENT ROW counts one row. The frames disagree exactly where ties exist, which is every demand leaderboard on a 103-order ledger.",
      notes: [
        { choice: 0, why: "That's the ROWS frame's behavior — and it takes an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW to get it. The default is RANGE-with-peers." },
        { choice: 3, why: "Windows work fine without explicit frames — they silently pick RANGE, which is precisely the surprise. State the frame; don't inherit it." },
      ],
      difficulty: "hard",
    },
    {
      id: "zomato-mcq-9",
      prompt: "Orders join to plate lines: 103 orders fan out to 251 rows. On the joined result, which count still counts ORDERS?",
      choices: [
        "COUNT(*) — it always counts the primary entity",
        "COUNT(oi.id) — NULLs are skipped automatically",
        "COUNT(DISTINCT o.id) — folding the fan-out back to the order grain",
        "SUM(o.id) — ids sum to the row count",
      ],
      answer: 2,
      why: "After the fan-out, only COUNT(DISTINCT o.id) folds plate lines back to orders — COUNT(*) counts 251 rows. COUNT(oi.id) skips only NULLs; with a NOT NULL key it counts 251 too.",
      notes: [
        { choice: 0, why: "COUNT(*) counts ROWS of the joined result — the fan-out IS the result. 'Primary entity' is a hope, not semantics; DISTINCT is the fold." },
        { choice: 3, why: "SUM over ids is a meaningless number that happens to be huge. Sanity-check magnitude: order counts are smaller than plate-line counts, never larger." },
      ],
      difficulty: "hard",
    },
    {
      id: "zomato-mcq-10",
      prompt: "The zone review targets the WORST cancellation zone first. The share is computed per zone. Which ORDER BY + LIMIT lands the intervention target on row one?",
      choices: [
        "ORDER BY cancel_share ASC LIMIT 1 — lowest share on top",
        "ORDER BY placed DESC LIMIT 1 — biggest zone on top",
        "ORDER BY cancel_share DESC LIMIT 1 — highest share on top",
        "No ORDER BY needed — GROUP BY returns the worst group first",
      ],
      answer: 2,
      why: "Worst-first means highest share first: DESC puts APAC's 8.1% on row one. ASC would crown LATAM's perfect 0-of-2 — a zone with two orders isn't a cancellation story, it's a rounding artifact pretending to be one.",
      notes: [
        { choice: 0, why: "That's the best-zone read — a correct query aimed at the opposite end of the map. Direction is a business decision, not a default." },
        { choice: 3, why: "GROUP BY returns groups in arbitrary order without ORDER BY. Every 'top N' read needs its direction stated." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-zomato-1",
      tier: "easy",
      topic: "j7",
      universe: "funnel",
      title: "The zone cancellation map",
      brief:
        "Zomato-flavored case on the storefront db (orders = delivery orders, region = zone): the ops review opens with the zone cancellation map, and the definition is fixed before the query — cancellation share is cancelled orders ÷ ALL placed orders, pending and delivered stay in the denominator. Probed facts: 103 placed orders, 7 cancelled (6.8% network-wide); by zone APAC 37 placed / 3 cancelled, EU 45 / 3, US 19 / 1, LATAM 2 / 0. The zone lead wants the single worst zone on top — one row — because the intervention targets one zone, not four.",
      ask: "Return the one zone with the highest cancellation share: zone, placed, cancelled, cancel_pct, worst first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS placed,\n       SUM(CASE WHEN o.status {1} 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / {2}, 1) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY cancel_pct {3}\nLIMIT {4};",
      slots: [
        {
          answer: "=",
          kind: "keyword",
          label: "the cancelled-status match",
          why: "The numerator is ONE status: 'cancelled'. A single = keeps the CASE flag exact; flipping the operator counts everything that is NOT cancelled and turns the cancellation map into a delivered-orders map.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the placed-orders denominator",
          why: "The denominator is ALL placed orders in the zone — pending, delivered, shipped and cancelled alike — which is COUNT(*) at the same fold the CASE-SUM rides on. COUNT(cancelled) errors (the alias isn't visible in its own SELECT list), and any smaller denominator flatters the share.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The intervention targets the WORST zone, so descending puts the highest cancellation share on top. ASC would crown LATAM's 0.0% — a two-order zone, not a cancellation story.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-zone cut",
          noVerify: true,
          why: "The ask is THE worst zone — one row. LIMIT 1 keeps exactly that decision row; LIMIT 4 would hand the review a leaderboard nobody requested.",
        },
      ],
      distractors: ["<>", "COUNT(cancelled)", "SUM(*)", "ASC", "4"],
      walkthrough:
        "A rate where the denominator is the whole test. The CASE flag turns 'cancelled' into a 1/0 indicator; SUM adds the 1s (APAC 3 of 37, EU 3 of 45, US 1 of 19, LATAM 0 of 2) while COUNT(*) counts every placed order — same rows, same fold, no drift, pending and delivered stay in the denominator by construction. 100.0 before the division forces real arithmetic, and ORDER BY cancel_pct DESC + LIMIT 1 lands the map on APAC — 3 cancelled of 37 placed, 8.1%, the worst zone despite EU matching it on raw counts, because EU's 3 came from 45. The distractor that kills reports is the operator flip: status <> 'cancelled' turns the numerator into the 96 non-cancelled orders and the map becomes a completion map wearing a cancellation title. SUM(*) in the denominator slot is a syntax error (only COUNT takes the star), COUNT(cancelled) errors on its own alias, ASC serves LATAM's 0.0, and LIMIT 4 hands back all four zones when the ask was one.",
      },
    {
      id: "cs-zomato-2",
      tier: "medium",
      topic: "t4",
      universe: "growth",
      title: "The monthly demand close",
      brief:
        "Zomato-flavored case on the storefront db (orders = delivery orders): the growth deck's demand slide needs the month buckets — and the close has a rule: the 'best month' headline is picked by REVENUE, not order count, with the order count carried beside it so nobody argues. Probed facts: 14 monthly buckets from 2024-01 to 2025-02; the trend peaks at 2024-01 with 8 orders and 3,731.97 revenue, and troughs at 2024-07 with 1,193.86 (carrying 2 of the ledger's 7 cancellations); network totals 103 orders and 34,833.28. Buckets must survive the year boundary — '%m' alone would merge the two Januaries into one phantom spike.",
      ask: "Return the single best month by delivery revenue: month, orders, revenue (2 decimals), best first.",
      template:
        "SELECT STRFTIME({1}, o.created_at) AS month,\n       COUNT(*) AS orders,\n       ROUND(SUM(o.total), {2}) AS revenue\nFROM orders o\nGROUP BY month\nORDER BY revenue {3}\nLIMIT {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the year-safe month key",
          why: "'%Y-%m' keeps the year in the bucket key so 2024-01 and 2025-01 stay separate on a ledger that spans both years. '%m' alone merges them into one phantom '01' bucket and fakes a demand spike.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue rounding precision",
          noVerify: true,
          why: "Money is quoted to 2 decimals in the close — ROUND(..., 2) prints 3,731.97 exactly as the deck expects. Rounding to 0 would print 3,732 and break the tie-out to the ledger's 34,833.28 total.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-month direction",
          why: "The close wants the BEST month on top, so descending revenue order is the only honest direction. ASC would headline 2024-07's trough as if it were the peak.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-month cut",
          noVerify: true,
          why: "The headline is ONE month — LIMIT 1. Keeping all 14 buckets is the trend chart's job; the slide asked for the peak.",
        },
      ],
      distractors: ["'%Y'", "'%m'", "'%d/%m/%Y'", "ASC", "0"],
      walkthrough:
        "A bucket-and-rank close where the year boundary is the trap. STRFTIME('%Y-%m', created_at) folds 103 orders into 14 year-safe buckets; '%m' alone would merge 2024-01 (8 orders, 3,731.97) with 2025-01 (6 orders, 1,669.50) into a 14-order phantom '01' bucket, and '%Y' would erase months entirely, crowning a single '2024' row at 29,884.03-ish. With the buckets right, SUM(o.total) folded per month and rounded once at the end puts 2024-01 on top at 3,731.97 over 8 orders — the peak by revenue, though not by count (2024-02 and 2024-09 tie at 9 orders, a distinction the close insists on). DESC + LIMIT 1 is the headline read; ASC would headline 2024-07's 1,193.86 trough. The '0' distractor rounds revenue to whole units — 3,732 on the slide against a ledger that ties out at 2 decimals — the kind of drift a close review exists to catch.",
      },
  ],

  problems: [
    { slug: "immediate-food-delivery-i", why: "The kept-share warm-up: share of first orders meeting a status rule — the placed-versus-kept CASE-SUM reflex every Zomato zone read starts from. Curated food-delivery pick (DoorDash-tagged row)." },
    { slug: "immediate-food-delivery-ii", why: "Kept-share ratio where the denominator is the whole test — cancellation and completion shares in textbook clothing. Curated food-delivery pick (DoorDash-tagged row)." },
    { slug: "trips-and-users", why: "Cancellation share per city per day with excluded accounts — the canonical delivery screen this kit's zone cancellation map generalizes. Curated pick (Uber-tagged row), included because it IS the interview." },
    { slug: "queries-quality-and-percentage", why: "Two rates folded in one pass with the 100.0-before-division fix — the honest-denominator muscle behind every zone share Zomato asks for. Curated pick." },
    { slug: "confirmation-rate", why: "LEFT JOIN acceptance share where unmatched ids coalesce to zero — merchant-acceptance reporting in textbook form, NULL policy included. Curated pick." },
    { slug: "ratings-histogram", why: "Average ratings bucketed into a histogram — the hygiene-score read discovery ranking is built on. Curated pick." },
    { slug: "find-books-with-polarized-opinions", why: "Review-spread detection across ratings — polarized merchant feedback is a hygiene signal, and the HAVING-floor shape is the drill. Curated pick." },
    { slug: "product-sales-analysis-ii", why: "Per-item revenue and units folded at line grain — the menu-mix read behind every category-crown slide. Curated pick." },
    { slug: "list-the-products-ordered-in-a-period", why: "Monthly menu-demand listing with quantity floors — the Feb-style month window the demand close lives in. Curated pick." },
    { slug: "restaurant-growth", why: "Rolling 7-day average of daily spend — the moving-average read Zomato growth reviews use to smooth the dinner-rush noise. Curated pick." },
    { slug: "find-peak-calling-hours-for-each-city", why: "Hour argmax per zone — the peak-ordering-hour query, dinner-rush edition. Curated pick." },
    { slug: "sales-by-day-of-the-week", why: "Weekday pivot of demand — the weekend-spike read that decides rider staffing. Curated pick." },
    { slug: "find-golden-hour-customers", why: "First-order-inside-the-window cohort gates — date math plus cohort definition, the golden-hour read. Curated pick." },
    { slug: "average-time-of-process-per-machine", why: "Paired timestamps self-joined into durations per unit — placed-to-delivered latency in its cleanest form. Curated pick." },
    { slug: "cohort-retention-matrix", why: "Month-by-month retention grid — the repeat-order cohort view behind the 63.5% big-spender concentration. Curated pick." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Conditional basket membership — ordered the mains, skipped the dessert: cross-sell gaps in one query. Curated pick." },
  ],
};
