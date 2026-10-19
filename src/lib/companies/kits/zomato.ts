// Zomato — kit 3 of the Food & Quick-commerce domain (Batch E).
// India's restaurant-discovery-to-hyperlocal-delivery platform: zone-shaped
// delivery ops, hygiene-rated restaurant partners, and a dining-out surface
// that makes 'orders placed' and 'orders kept' two different numbers.
// Pool provenance: Zomato has 0 tagged rows in the band — all 32 problems
// and 46 topic slugs are THEME-CURATED from the sql rows in
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
    "Preparation strategy: Zomato has no tagged rows in the band, so this kit is theme-curated — every problem mirrors a workflow Zomato screens are known to probe: the `immediate-food-delivery` pair for kept-share denominators, ratings-histogram for hygiene-score reads, restaurant-growth for rolling demand, find-peak-calling-hours for the dinner-rush hour argmax. The case studies run on the live storefront db, mapped honestly onto delivery: orders are delivery orders, `order_items` are plate lines, `shipped_at` is the delivery-completed timestamp, suppliers are merchant partners, region is the zone. Two of them rebuild the screens this kit is known for — the zone cancellation map the ops review opens with, and the monthly demand close for the growth deck. All are mechanically audited against the probed db figures.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Zomato's zone floors and merchant pods rehearse: the zone cancellation map, the monthly demand close, a refund-exposure ledger that classifies every order's fate, a merchant supply-bench rank that keeps ties riding together, a one-pass fate census with `FILTER`, and a clean-record anti-join that finds the 12 of 16 customers who have never cost a cancellation. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the '*does a cancelled order count in your denominator?*' follow-up tests.",
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
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "customer-who-visited-but-did-not-transact", "customer-order-frequency"],
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
      slugs: ["product-sales-analysis-ii", "the-most-recent-orders-for-each-product", "customer-placing-the-largest-number-of-orders", "orders-with-maximum-quantity-above-average", "basket-depth-aov", "the-most-recent-three-orders"],
    },
    {
      name: "Peak hours & weekday pivots",
      why: "Demand is a dinner-rush shaped thing: peak ordering hour per zone, weekday pivots for the weekend spike, weekend-count gates. Hour argmax per city and day-of-week pivots are the exact query shapes the demand team ships weekly.",
      slugs: ["find-peak-calling-hours-for-each-city", "sales-by-day-of-the-week", "tasks-count-in-the-weekend", "friday-purchases-i", "calculate-orders-within-each-interval"],
    },
    {
      name: "Month buckets & demand trend",
      why: "The monthly close lives on STRFTIME buckets — 14 of them on this ledger, 2024-01 to 2025-02 — and the classic bug is '%m' merging January 2024 with January 2025 into one phantom bucket. Bucket, then rank, then carry cancellations alongside.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "unique-orders-and-customers-per-month", "monthly-transactions-ii", "restaurant-growth"],
    },
    {
      name: "Repeat-order cohorts",
      why: "Retention here is re-ordering: customers who bought A and B but not C, loyal-customer islands, cohort retention matrices. The 63.5% revenue concentration from big spenders is the business reason this family gets screen time.",
      slugs: ["cohort-retention-matrix", "customers-who-bought-a-and-b-not-c", "find-loyal-customers", "repeat-purchase-rate", "game-play-analysis-v", "customers-who-never-order"],
    },
    {
      name: "NULL policy on the delivery clock",
      why: "The delivery timestamp is NULL until the order completes — 21 of 103 rows here. Screens probe whether your filters, joins and aggregates handle those holes on purpose: report them, coalesce them, or exclude them with a stated reason.",
      slugs: ["null-blank-audit", "employees-with-missing-information", "find-customer-referee", "calculate-special-bonus", "the-number-of-users-that-are-eligible-for-discount"],
    },
    {
      name: "Escalation shapes: CASE & subqueries",
      why: "Screens close with composed asks: classification CASEs (weather-type shape), above-average reads via scalar subqueries, monthly ratio stacks. The escalation is composition — status logic and second-stage aggregates in one query, no panic.",
      slugs: ["weather-type-in-each-country", "second-highest-salary", "immediate-food-delivery-iii", "recyclable-and-low-fat-products", "keep-latest-dedupe", "fix-product-name-format"],
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
    {
      id: "zomato-t9",
      q: "Merchant attribution needs three hops: orders → order_items → products → suppliers. Where does the grain break in that chain, and how do you keep both the order-side and merchant-side reads honest?",
      a: "The break is at the first hop: joining orders to order_items fans 103 orders into 251 plate lines, so every order-level attribute — status, total, zone — repeats per line, and SUM(o.total) on the joined rows returns 103,244.55 instead of the true 34,833.28. The rule is to aggregate at the grain you're adding: fold order_items to per-order or per-product spend first, THEN join upward for merchant attributes. On merchant-side reads the fan-out is the point — 251 lines folded by the product's supplier gives each partner its true plate volume — but then order counts must be COUNT(DISTINCT order_id), never COUNT(*), or a three-plate order triples. Say which grain each stage outputs before you write the join; that sentence is what the interviewer is actually grading.",
      tag: "joins",
    },
    {
      id: "zomato-t10",
      q: "The zone lead wants running monthly revenue per zone, not one network-wide running total. What does the window need, and what does the default frame do to tied months?",
      a: "PARTITION BY c.region ORDER BY month — the partition restarts the running sum at each zone's first month, so APAC's series starts at APAC's January, not after EU's. Without the partition, SUM(...) OVER (ORDER BY month) produces one cumulative series that crosses zone boundaries, a number no zone recognizes as its own. The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which includes ORDER-BY peers: months tying on revenue enter the total together, which is correct for a leaderboard-style sum but surprising if you expected row-by-row. Close the loop with an outer ORDER BY region, month — window ordering is not output ordering — and narrate 'partition resets, frame includes peers' as the two sentences that make the running total defensible.",
      tag: "windows",
    },
    {
      id: "zomato-t11",
      q: "The ops board wants delivered, shipped, pending and cancelled counts in one pass. Build it two ways — SUM(CASE) and COUNT FILTER — and say when each wins.",
      a: "Same fold, two dialects. SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) and COUNT(*) FILTER (WHERE status = 'delivered') both return 52 on this ledger, from the same single scan of 103 rows. FILTER reads like the business rule — 'count rows where status is delivered' — and skips the ELSE ceremony; CASE-SUM is the portable form that runs on any engine. The one-pass discipline is the real content: every bucket shares the same COUNT(*) denominator, so the four counts must add back to 103 — a free tie-out that a WHERE-per-bucket approach destroys. The trap is mixing populations mid-query: COUNT(*) FILTER for one column and a filtered COUNT for another silently runs them over different rows. Pick one conditional shape, use it for every bucket, and check the sum.",
      tag: "aggregation",
    },
    {
      id: "zomato-t12",
      q: "'Show me every month, even the quiet ones' — why can GROUP BY not promise that, and how do you build the spine it needs?",
      a: "GROUP BY folds only rows that exist: a month with zero orders is not a short bar, it is a missing row, and no amount of COUNT-ing changes that. The fix is a calendar spine — a recursive CTE of months (or a dates dimension) LEFT JOINed to the demand fold, with the NULL payload COALESCEd to 0 so the quiet month prints as a zero instead of vanishing. The same honesty applies inside a row: SUM(CASE WHEN status = 'cancelled' THEN 1 END) without an ELSE yields NULL — not 0 — for any bucket with no cancellations, and the chart prints a hole where a zero belongs. COALESCE the display, state the zero-fill in the subtitle ('months with no orders shown as 0'), and never let a missing row masquerade as a quiet month — silence and zero are different findings.",
      tag: "nulls",
    },
    {
      id: "zomato-t13",
      q: "You aliased ROUND(SUM(total), 2) AS revenue and then wrote WHERE revenue > 1000. Why does that fail, and why does ORDER BY revenue work?",
      a: "Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before SELECT, so the alias does not exist yet and the engine errors. ORDER BY runs after SELECT, so it sees the alias fine, and SQLite (unlike strict engines) also resolves aliases in GROUP BY and HAVING. Two escapes, two different questions: repeat the expression in WHERE — WHERE total > 1000 filters ORDERS before the fold, which is not the same as filtering folded monthly revenue above 1,000 — or stage the fold in a CTE and filter the aggregated grain outside, which preserves the 'folded revenue above 1,000' meaning. The follow-up is exactly this: 'which population did you mean to filter?' Placement is semantics, not style.",
      tag: "pipeline",
    },
    {
      id: "zomato-t14",
      q: "'Orders above MY zone's average ticket' — walk me through the correlated version, and what you'd reach for instead on a big table.",
      a: "The correlated shape: WHERE o.total > (SELECT AVG(i.total) FROM orders i JOIN customers ic ON ic.id = i.customer_id WHERE ic.region = oc.region) — the inner fold re-runs per outer row, once per order here, which is fine on 103 rows and a different conversation on millions. The scalar contract still holds: one column, at most one row; a zone whose inner fold comes back empty yields NULL, the comparison goes UNKNOWN, and those outer rows drop silently. The window alternative attaches the zone average to every row in one pass — AVG(o.total) OVER (PARTITION BY c.region) computed alongside, then compare — same answer, no per-row re-execution. Interviewers accept either; they are listening for 're-runs per row' and the empty-inner NULL failure mode, which are the two things that separate a working query from a fragile one.",
      tag: "subqueries",
    },
    {
      id: "zomato-t15",
      q: "Product wants the dinner-rush hour split. You open the orders table and every created_at stamps 00:00. Now what?",
      a: "Probe first, promise second. On this ledger every order event carries a midnight timestamp — STRFTIME('%H', created_at) returns '00' for all 103 rows, so the hour dimension is dead on arrival and any 'peak ordering hour' answer would be fiction wearing a chart. The professional move is reporting upward: the data cannot support the ask at hour grain; the closest honest cuts are date-level (STRFTIME('%Y-%m-%d')) or weekday (STRFTIME('%w') — Monday leads this ledger with 20 orders, Saturday trails with 8). The tools for the hour read remain correct — half-open windows (>= '18:00' AND < '22:00', never BETWEEN on the close) and '%H' extraction — they are just aimed at data that cannot answer. The reflex being tested: verify the grain actually present in the timestamps before committing to a slice.",
      tag: "dates",
    },
    {
      id: "zomato-t16",
      q: "Before the zone board ships, how do you prove its numbers tie to the raw rows?",
      a: "A two-sided diff, every time. Aggregate side: the board's per-zone counts. Raw side: recompute COUNT(*) per region from orders joined to customers, then diff on the key — 37 + 45 + 19 + 2 must equal 103, and the delta column must be zero everywhere. Same drill at other grains: the monthly revenue fold must sum to 34,833.28, and plate-line spend folded per category must equal order totals folded per month — two different grains landing on the same 34,833.28 is the tie-out that proves both folds. Where a diff is nonzero, bisect by day or by status until the offending slice surfaces. The analyst who ships the tie-out line ('sum of zones = network = 103, delta 0') ends the meeting; the one who ships four unaudited numbers gets asked to produce exactly that line under pressure.",
      tag: "quality",
    },
    {
      id: "zomato-t17",
      q: "GROUP BY region versus GROUP BY region, city — what changes, and what breaks when you stack the two rollups into one report?",
      a: "region folds 103 orders into 4 rows; region, city folds into 16 — and on this ledger city grain IS customer grain, one city per customer, so the 'city rollup' is a per-customer read wearing a geography name. The grouping column order does not change the groups, only the default presentation; the display order is ORDER BY's job. The break comes when the rollups stack: UNION-ing a city rollup under a zone rollup and then summing the column double-counts every order — the same 103 orders live in both layers. Rollups must be labeled with a scope column ('zone' versus 'city') and never summed across scope rows; totals come from the raw fold, once. Narrate the output as a sentence — 'one row per zone' or 'one row per zone-city' — before writing the GROUP BY; the mush 'by region and city' is where grains die.",
      tag: "groupby",
    },
    {
      id: "zomato-t18",
      q: "Merchant menu feeds arrive with 'SHAWARMA house', 'shawarma-house ' and 'Shawarma House'. How do you normalize without breaking the join?",
      a: "Clean on both sides, symmetrically, and pick one canonical form. For comparisons: UPPER(TRIM(name)) — TRIM kills the trailing space that makes 'shawarma-house ' a different key, UPPER makes casing irrelevant to the match. For display, build the presentation separately (SQLite lacks INITCAP; UPPER + LOWER with SUBSTR gets the capitalization you want) so the join key and the label are different columns with different rules. The trap is normalizing in the report but not the join: the same merchant under three spellings becomes three GROUP BY rows and the merchant's revenue splits three ways — a number that ties to nothing. The receipt is a before-count: COUNT(DISTINCT normalized) before and after cleanup; the drop from three spellings to one is the proof the dedupe worked, and it goes in the ticket.",
      tag: "strings",
    },
    {
      id: "zomato-t19",
      q: "Three ways to find customers with zero cancellations — NOT IN, NOT EXISTS, LEFT JOIN + IS NULL. Which survives a NULL, and which do you ship?",
      a: "On this ledger 12 of 16 customers have never cancelled — the clean-record bench a loyalty push targets. The LEFT JOIN shape: FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' WHERE o.id IS NULL — note the status filter lives in the ON clause; move it to WHERE and the LEFT JOIN quietly becomes an INNER join, keeping only the 4 cancelled-on customers, the exact opposite bench. NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') dies on a single NULL in the claim list — the whole result empties. NOT EXISTS is NULL-proof, reads closest to intent, and optimizes well. Ship NOT EXISTS or the LEFT JOIN anti-join; keep NOT IN for lists you have proven NOT NULL, and say that proof out loud.",
      tag: "joins",
    },
    {
      id: "zomato-t20",
      q: "'The two most recent orders per customer' — why does the MAX(created_at) join-back fail, and how do you do it in SQLite?",
      a: "The join-back returns one row per group, not two — MAX(created_at) is a single value, so the customer's second-most-recent order is structurally unreachable by that shape. The window shape: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) computed in a CTE, then filter WHERE rn <= 2 outside — SQLite has no QUALIFY, so the two-step is mandatory, and the id DESC tie-break is what makes 'most recent' deterministic when two orders share a timestamp. Say the rank-trio difference out loud: RANK would keep both tied rows (possibly three rows for a 'top two' ask), while ROW_NUMBER cuts to exactly two, arbitrarily unless the tie-breaker exists. The filter on rn must live outside the window — WHERE cannot see window output — which is the same pipeline rule as every other SELECT-stage alias.",
      tag: "windows",
    },
    {
      id: "zomato-t21",
      q: "AOV prints 338.19 but the ops floor says a 'typical order' feels smaller. Who is right, and how do you present both?",
      a: "Both — they summarize different things. The mean 338.19 is pulled up by the 1,088.44 maximum; the median order (the 52nd of 103 sorted) is 285.10, about 50 lower, and that gap is the skew. SQLite has no MEDIAN(): fake it with ORDER BY total LIMIT 1 OFFSET (COUNT(*) - 1) / 2 over a subquery, or NTILE(4) for quartiles, and state which convention you used. The ops floor quotes the median — 'typical order' is a middle-of-the-pack statement; finance quotes the mean because it ties out: 34,833.28 ÷ 103 = 338.19, revenue ÷ orders, auditable. The strong answer quotes the pair beside min/max (25.47 to 1,088.44) and lets the skew explain itself, because a mean without its tail is a number waiting to be challenged in the review.",
      tag: "aggregation",
    },
    {
      id: "zomato-t22",
      q: "The close wants the fate census AND a TOTAL row underneath, in one result set. How do you build it, and why UNION ALL?",
      a: "Two branches, one stack. The grouped branch: GROUP BY status gives delivered 52, shipped 30, pending 14, cancelled 7. The scalar branch: SELECT 'TOTAL', COUNT(*), ROUND(SUM(total), 2) over the unfiltered table gives 103 and 34,833.28. Glue with UNION ALL — it concatenates without a dedupe pass, which is the honest operator when every row belongs; a bare UNION adds a distinct-sort for nothing and can silently drop two legitimately identical rows. The discipline is positional: both branches must produce the same column count and compatible types — the 'TOTAL' label in the status slot, counts and money in the same positions — and the ORDER BY after the stack sorts the combined set. The TOTAL row is the report's built-in tie-out: 52 + 30 + 14 + 7 must equal 103 before anything ships.",
      tag: "pipeline",
    },
    {
      id: "zomato-t23",
      q: "'How many orders were in-flight at noon on Jan 15?' — what does the delivery timestamp's NULL contract do to that query?",
      a: "In-flight means placed and not yet completed: created_at <= '2024-01-15 12:00' AND (shipped_at IS NULL OR shipped_at > '2024-01-15 12:00'). The NULL contract — shipped_at stays NULL until the order completes — makes the IS NULL arm the still-outstanding population, not an error to scrub. The two classic failures: shipped_at > T alone drops every never-completed order, understating in-flight by the whole pending-plus-cancelled gap; COALESCE(shipped_at, '9999-12-31') works but reads like a hack unless commented. Cancelled orders are a definition call — they never complete, so decide and document whether they count as in-flight before their cancel moment. State the as-of convention in the subtitle ('in-flight as of 12:00, evaluated against placed and completed timestamps only') — an as-of number without its convention is a rumor.",
      tag: "dates",
    },
    {
      id: "zomato-t24",
      q: "APAC holds 3 of 7 cancellations — 43% of them — but its cancellation share is 8.1%. Are both numbers honest, and when do you quote which?",
      a: "Different denominators, different questions, both honest. 3/7 answers 'where do the network's cancellations come from' — a share-of-cancellations that sums to 100 across zones (APAC 43%, EU 43%, US 14%, LATAM 0%). 3/37 = 8.1% answers 'how risky is one placed order in APAC' — the zone cancellation share the ops floor manages, with every placed order in the denominator. The sin is quoting 43% as APAC's 'cancellation rate': it flatters APAC precisely because APAC is big — a large zone contributes many cancellations even at a low rate. Write the denominator next to the number ('3 of 7 network cancels' versus '3 of 37 placed') and never let either travel alone; the follow-up 'is that a share of cancels or a share of orders?' is the interviewer checking whether you know you computed two different metrics.",
      tag: "aggregation",
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
    {
      id: "zomato-mcq-11",
      prompt: "The zone board adds a 'delivery revenue' column per zone. Which SELECT item belongs under that name?",
      choices: [
        "SUM(o.total)",
        "COUNT(o.id)",
        "AVG(o.total)",
        "MAX(o.total)",
      ],
      answer: 0,
      why: "Revenue is money added up: SUM(o.total) folds each zone's order totals into rupees. COUNT returns a row count wearing a revenue name, AVG divides the volume away, and MAX is one order's ticket — on this ledger 1,088.44, not any zone's revenue.",
      notes: [
        { choice: 1, why: "COUNT(o.id) gives 45 and 37 for EU and APAC — order counts, not revenue. A count can't be compared against money no matter how the column is labeled." },
        { choice: 2, why: "AVG(o.total) is the per-order ticket per zone — a useful number, but it erases how many orders carried it. Zone revenue needs both, as separate columns." },
      ],
      difficulty: "easy",
    },
    {
      id: "zomato-mcq-12",
      prompt: "Delivery latency: ROUND(JULIANDAY(shipped_at) - JULIANDAY(created_at), 1) per row, then AVG — versus AVG of the raw diff, rounded once at the end. Why do they disagree?",
      choices: [
        "They never disagree — rounding is order-independent",
        "Per-row rounding shifts every latency by up to 0.05 before averaging, so the average of rounded values is not the rounded average",
        "JULIANDAY cannot be rounded",
        "AVG of REALs returns an integer",
      ],
      answer: 1,
      why: "Each per-row ROUND moves that row's latency up to half a tick, and those moves don't cancel — the mean of rounded values drifts from the rounded mean. Round once, at the display layer, on the final aggregate; keep every intermediate computation full-precision.",
      notes: [
        { choice: 0, why: "Rounding is order-dependent in exactly this way — it's the classic 'round once at the end' lesson. The drift is small but systematic, and a close review ties figures to 2 decimals." },
        { choice: 2, why: "JULIANDAY returns a REAL and rounds fine. The issue is WHEN the rounding happens, not whether it can." },
      ],
      difficulty: "easy",
    },
    {
      id: "zomato-mcq-13",
      prompt: "The rider-staffing sheet pivots demand by weekday with STRFTIME('%w', created_at). A bucket prints '6'. Which day is it, and why does the sheet's JS developer disagree with the SQL?",
      choices: [
        "Saturday — SQLite numbers Sunday 0 through Saturday 6, while JavaScript's getDay agrees, but Python's weekday() starts at Monday 0",
        "Friday — SQLite numbers Monday 1 through Sunday 7",
        "Sunday — SQLite starts the week on Monday at 0",
        "It's week-of-year, not a weekday — '%w' means ISO week",
      ],
      answer: 0,
      why: "'%w' emits 0=Sunday through 6=Saturday, so '6' is Saturday — on this ledger the quietest day, 8 orders. The trap is cross-language convention drift: Python's weekday() would call the same day 5. Pin the mapping in the sheet's header, not in tribal memory.",
      notes: [
        { choice: 1, why: "That's '%u'-style or a 1-based habit from other engines — SQLite's '%w' is Sunday-zeroed, matching JavaScript's getDay but not Python." },
        { choice: 3, why: "'%W' is week-of-year; '%w' is weekday. One letter, entirely different bucket — and a chart that silently relabels every bar." },
      ],
      difficulty: "easy",
    },
    {
      id: "zomato-mcq-14",
      prompt: "GROUP BY c.region, c.city on this ledger — how many rows come back, and what is the grain?",
      choices: [
        "4 rows — the region dominates the grouping",
        "One row per zone-city — 16 here, since each of the 16 customers sits in its own city",
        "64 rows — region × city cartesian",
        "An error — you cannot group by two columns",
      ],
      answer: 1,
      why: "Multi-column GROUP BY folds on the tuple: one row per distinct (region, city) pair — 16 on this ledger, because city grain equals customer grain here. Column order changes nothing about the groups; only ORDER BY changes presentation.",
      notes: [
        { choice: 0, why: "Regions don't 'dominate' — the tuple is the key. If you wanted region-only rows, group by region alone; the second column changes the grain, it doesn't decorate it." },
        { choice: 2, why: "GROUP BY is a fold, not a cross join. 64 would be every region-city combination including ones with no orders — that's a calendar-spine job, not a GROUP BY." },
      ],
      difficulty: "easy",
    },
    {
      id: "zomato-mcq-15",
      prompt: "Growth wants a census of registered users who never placed an order. Which query shape is correct — and what does it return on this ledger?",
      choices: [
        "LEFT JOIN orders + WHERE o.id IS NULL — zero rows here, and that's the finding",
        "INNER JOIN orders — every registered user appears",
        "WHERE o.customer_id IS NOT NULL",
        "CROSS JOIN customers to orders",
      ],
      answer: 0,
      why: "The anti-join keeps customers whose order side never matched. On this ledger all 16 registered users have ordered, so the honest result is zero rows — a finding ('no dormant registrations'), not a bug. The shape matters because the day a dormant user registers, the query must already be right.",
      notes: [
        { choice: 1, why: "INNER JOIN keeps only users WITH orders — the exact opposite census. Empty-vs-full is the difference between the two joins, and it's the whole question." },
        { choice: 2, why: "That filters the joined rows to matched ones — same INNER semantics. The 'IS NOT NULL' reflex belongs to the LEFT JOIN payload check, pointed the wrong way here." },
      ],
      difficulty: "easy",
    },
    {
      id: "zomato-mcq-16",
      prompt: "The merchant pod wants each partner's menu categories folded into one cell — 'Audio, Electronics'. Which function does that in SQLite?",
      choices: [
        "GROUP_CONCAT(DISTINCT p.category)",
        "STRING_AGG(p.category, ', ')",
        "CONCAT(p.category)",
        "JOIN(p.category, ', ')",
      ],
      answer: 0,
      why: "GROUP_CONCAT is SQLite's fold-to-string aggregate, and DISTINCT keeps a partner who sold three Audio plates from printing 'Audio, Audio, Electronics'. STRING_AGG is Postgres; CONCAT and JOIN aren't aggregates here — they'd error or concat within one row.",
      notes: [
        { choice: 1, why: "Right idea, wrong dialect — STRING_AGG fails on SQLite. Knowing which engines carry which fold-to-string name is part of the portability story." },
        { choice: 2, why: "CONCAT joins values of a SINGLE row. Folding many rows into one cell needs an aggregate — that's the entire difference." },
      ],
      difficulty: "easy",
    },
    {
      id: "zomato-mcq-17",
      prompt: "SELECT DISTINCT c.region FROM orders o JOIN customers c ... returns the same four rows as GROUP BY c.region here. When is DISTINCT the right tool?",
      choices: [
        "Never — GROUP BY is always correct",
        "When you need the distinct values and no folding — and the moment someone adds a count, DISTINCT must become GROUP BY",
        "Whenever the table has duplicates",
        "Only with an ORDER BY",
      ],
      answer: 1,
      why: "DISTINCT dedupes; GROUP BY folds. For 'which zones have orders', both land on the same four rows — DISTINCT states the intent with no aggregate machinery. The follow-up 'now with order counts per zone' is where DISTINCT structurally dies and GROUP BY takes over.",
      notes: [
        { choice: 0, why: "Dogma, not SQL. DISTINCT is the honest minimal tool for a distinct-values read; reaching for GROUP BY with no aggregate hides the intent." },
        { choice: 2, why: "Vague — every GROUP BY output is also 'deduplicated'. The distinction is whether an aggregation rides along, not whether rows repeat." },
      ],
      difficulty: "easy",
    },
    {
      id: "zomato-mcq-18",
      prompt: "SELECT STRFTIME('%Y-%m', created_at) AS month, COUNT(*) AS orders FROM orders GROUP BY month HAVING orders >= 8 — does the HAVING clause work in SQLite?",
      choices: [
        "Yes — HAVING evaluates after groups and the SELECT list, so SQLite resolves the alias",
        "No — HAVING can only reference aggregates written out in full",
        "No — HAVING requires a WHERE twin",
        "Yes, but only if the alias is also the GROUP BY key",
      ],
      answer: 0,
      why: "SQLite resolves SELECT aliases in HAVING (and GROUP BY and ORDER BY) because those stages run at or after the SELECT list — the same leniency that makes WHERE month = '2024-01' fail. Here it keeps the six months with 8-or-more orders, ties included.",
      notes: [
        { choice: 1, why: "That's the strict-engine rule (Postgres would demand HAVING COUNT(*) >= 8). SQLite is lenient — but know which dialect you're in, because the portable form is the spelled-out aggregate." },
        { choice: 3, why: "The alias resolution has nothing to do with being the grouping key — any SELECT alias works in SQLite's HAVING. The GROUP BY month alias is a separate, also-fine leniency." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-19",
      prompt: "'Top eight customers by orders placed' — the counts run 24, 17, 14, 13, 5, then FOUR customers tied at 4. What does ORDER BY n DESC LIMIT 8 actually return?",
      choices: [
        "Eight rows — an arbitrary 8 of the 11 customers at or above the cut, picked by whatever order the engine happens to produce",
        "Eight rows, always the same eight, because LIMIT is deterministic",
        "Eleven rows — LIMIT expands to include ties",
        "An error — LIMIT cannot follow a tie",
      ],
      answer: 0,
      why: "The cut lands inside the 4-way tie at 4 orders: 5 unique counts above, 11 customers at-or-above, LIMIT keeps 8 — which 8 depends on scan and sort order, not on business logic. Either state a tie-break rule (id, or name) or return all tied customers and say so.",
      notes: [
        { choice: 1, why: "Deterministic-looking output is the trap — the SAME query can return different 8-subsets across engines or re-runs. Ties make LIMIT a coin flip." },
        { choice: 2, why: "LIMIT never expands. INCLUDING TIES exists in some engines (FETCH FIRST 8 ROWS WITH TIES) — SQLite has no such clause, so the tie handling must be yours." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-20",
      prompt: "To close January's demand fold you wrote WHERE created_at <= '2024-01-31'. Which January orders silently vanish?",
      choices: [
        "None — the bound covers all of January 31",
        "Every January-31 timestamp — '2024-01-31 00:00:00' sorts AFTER the string '2024-01-31', so the comparison excludes it",
        "Only orders after noon on Jan 31",
        "The first order of February",
      ],
      answer: 1,
      why: "Text comparison is character-by-character: '2024-01-31 00:00:00' shares its prefix with '2024-01-31' and then continues — so it's GREATER, and <= drops it. The month-close fix is the half-open bound: created_at >= '2024-01-01' AND created_at < '2024-02-01'.",
      notes: [
        { choice: 0, why: "That's the intuition from DATE types, and it's exactly what TEXT timestamps break. The silent exclusion is why month folds must use '< first of next month'." },
        { choice: 2, why: "Nothing time-of-day-related happens — the whole day disappears at once, because the comparison never reaches hours. Every Jan-31 order leaves the fold together." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-21",
      prompt: "Running monthly revenue per zone: SUM(o.total) OVER (ORDER BY month) with no PARTITION BY — what did you build?",
      choices: [
        "Four running totals, one per zone",
        "One network-wide running total that crosses zone boundaries — no zone's row shows its own cumulative",
        "An error — SUM OVER needs a partition",
        "A per-month average",
      ],
      answer: 1,
      why: "Without PARTITION BY region the window is one series over all rows: EU's April 'running total' contains EU and APAC months alike. PARTITION BY c.region restarts the accumulation per zone — the number the zone lead actually reads.",
      notes: [
        { choice: 0, why: "That's what a partition would give. Spot the tell: a zone's 'running total' exceeding its full-period revenue means the series never reset." },
        { choice: 2, why: "PARTITION BY is optional in window syntax — omitting it is legal and silently global. The quietest bugs are the ones that compile." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-22",
      prompt: "Monthly fold: SUM(CASE WHEN status = 'cancelled' THEN 1 END) — no ELSE. What does a month with zero cancellations print?",
      choices: [
        "0",
        "NULL — no ELSE arm means non-matching rows contribute NULL, and SUM over all-NULL yields NULL",
        "It errors — CASE needs an ELSE",
        "The previous month's value",
      ],
      answer: 1,
      why: "CASE without ELSE returns NULL for non-matching rows; SUM ignores NULLs, and a group with no 1s sums to NULL — the chart prints a hole where a zero belongs. Write ELSE 0, or COALESCE the display, and say 'zero' out loud as a finding, not a gap.",
      notes: [
        { choice: 0, why: "That's what ELSE 0 gives — which is exactly why the ELSE arm matters. Without it, the fold speaks NULL, not zero." },
        { choice: 2, why: "ELSE is optional syntax. The failure is silent and well-formed — a NULL in the cells that renders as a gap, the worst kind of bug for a trend chart." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-23",
      prompt: "Repeat-demand pairs: FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND b.created_at > a.created_at AND JULIANDAY(b.created_at) - JULIANDAY(a.created_at) <= 7. Why the strict > on the date?",
      choices: [
        "It counts each within-7-days pair once — a symmetric <= would count both orderings and double the pairs (11 become 22-ish on this ledger)",
        "It's required syntax for self-joins",
        "It excludes same-day orders entirely from the pair set",
        "It makes the query faster",
      ],
      answer: 0,
      why: "A self-join on the same table matches in both directions unless you impose an asymmetric condition. Strict > (with the 7-day window) keeps exactly one orientation per pair — 11 repeat-demand pairs here. Drop the direction and every pair returns twice, doubling the repeat signal.",
      notes: [
        { choice: 2, why: "Same-day pairs survive via the JULIANDAY diff = 0 <= 7 — the strict > only kills the REVERSED orientation, not the same-day forward one." },
        { choice: 3, why: "The direction halves the row count, which is a correctness requirement wearing a performance hat. Even if the engine got faster, 22 pairs would still be the wrong answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-24",
      prompt: "After joining orders to order_items, SUM(o.total) prints 103,244.55 but finance's network revenue is 34,833.28. What happened?",
      choices: [
        "Finance is wrong — the join found extra orders",
        "Each order's total repeated once per plate line (251 lines over 103 orders) — order-grain money must be summed before the join, or summed as line-grain unit_price * quantity",
        "Floating-point drift accumulated",
        "SUM ignores NULLs, so rows were dropped",
      ],
      answer: 1,
      why: "The fan-out multiplies: every order total rides on each of its plate lines, roughly tripling the sum. Both honest fixes land on 34,833.28 — SUM at order grain before joining, or SUM(oi.unit_price * oi.quantity) at line grain. The number didn't drift; the grain did.",
      notes: [
        { choice: 2, why: "REAL arithmetic on this scale loses nothing near 103,244 — the 3x gap is structural, not numerical. Magnitude sanity-checks catch fan-out inflation instantly." },
        { choice: 3, why: "NULL-skipping can only shrink a sum. Inflation means the same money was counted more than once — always a join-grain story." },
      ],
      difficulty: "hard",
    },
    {
      id: "zomato-mcq-25",
      prompt: "'The two most recent orders per customer': a join-back on MAX(created_at) per customer. How many rows per customer does it return?",
      choices: [
        "Two — MAX finds the second-latest too",
        "One — MAX is a single value; the second-most-recent order is structurally unreachable by a join-back",
        "All of them — the join has no filter",
        "Zero for customers with one order",
      ],
      answer: 1,
      why: "MAX(created_at) resolves to one timestamp per customer, and the join-back keeps only rows matching it — the latest order, once. Top-N per group needs ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) staged in a CTE, filtered rn <= 2 outside.",
      notes: [
        { choice: 0, why: "MAX is one value — there is no 'second MAX' hiding in it. The second-latest needs a ranking, or a second anti-join against the first-latest (a mess the window replaces)." },
        { choice: 2, why: "The join-back DOES filter — on equality with the max. That equality is precisely what amputates everything but the newest row." },
      ],
      difficulty: "hard",
    },
    {
      id: "zomato-mcq-26",
      prompt: "Friday average basket: AVG(CASE WHEN STRFTIME('%w', created_at) = '5' THEN total ELSE 0 END) versus the same CASE with the ELSE dropped. What changes?",
      choices: [
        "Nothing — AVG ignores zeros and NULLs identically",
        "With ELSE 0, the 88 non-Friday rows enter the average as zeros and deflate it; without ELSE they're NULL and AVG skips them, giving the true Friday-only mean",
        "The ELSE-less version errors",
        "ELSE 0 is required for AVG to work",
      ],
      answer: 1,
      why: "AVG sums non-NULL values and divides by the COUNT of non-NULL inputs — zeros count as data, NULLs don't. ELSE 0 turns a weekday-filtered average into a whole-week average wearing a Friday label. Omit the ELSE (or filter Friday in a subquery) when the denominator must be Fridays only.",
      notes: [
        { choice: 0, why: "Zeros and NULLs are opposites in AVG: zeros pull the mean down and inflate the divisor; NULLs exit both. Confusing them is the single most common conditional-aggregate bug." },
        { choice: 2, why: "The ELSE-less CASE is perfectly legal — it just yields NULLs, which happens to be exactly the behavior the Friday-only read needs." },
      ],
      difficulty: "hard",
    },
    {
      id: "zomato-mcq-27",
      prompt: "Month-over-month cancellation-share change: LAG(cancel_pct) OVER (ORDER BY month) where cancel_pct is the SELECT alias holding the share. Why does it fail, and what fixes it?",
      choices: [
        "Window expressions can't see sibling SELECT aliases — repeat the full share expression inside LAG, or stage the monthly fold in a CTE and apply LAG outside",
        "LAG cannot appear in the same query as GROUP BY",
        "LAG requires PARTITION BY to work",
        "The alias must be quoted",
      ],
      answer: 0,
      why: "Expressions in the same SELECT list can't reference each other's aliases — LAG needs the underlying expression, not the label. Repeating the CASE-SUM ratio inside LAG works but is unreadable; the CTE stages the fold once, then LAG reads the staged column. Same rule as WHERE-versus-alias, one stage later.",
      notes: [
        { choice: 1, why: "LAG and GROUP BY coexist fine — the aggregate folds per group and the window reads the grouped result. The failure is alias visibility, not coexistence." },
        { choice: 2, why: "PARTITION BY is optional. It controls WHERE the window restarts, never whether the function parses." },
      ],
      difficulty: "hard",
    },
    {
      id: "zomato-mcq-28",
      prompt: "The demand trend must print every month from 2024-01 to 2025-02 — including months with zero orders, should a quiet one land. What does the query need?",
      choices: [
        "A calendar spine: a generated month list LEFT JOINed to the orders fold, with COALESCE turning unmatched months into zeros",
        "A GROUP BY with an extra flag",
        "Nothing — GROUP BY prints empty groups as zeros",
        "An INNER JOIN to a dates table",
      ],
      answer: 0,
      why: "GROUP BY folds rows that exist; a month with no orders has no rows, so it produces no group. The spine (recursive CTE of months or a dates dimension) supplies the missing keys, the LEFT JOIN carries the fold, and COALESCE(sum, 0) prints the honest zero.",
      notes: [
        { choice: 1, why: "There is no flag that materializes a group from zero rows. Missing months are a data-shape problem, solved by supplying the keys, not configuring the fold." },
        { choice: 3, why: "INNER JOIN is the anti-fix — it deletes exactly the unmatched spine months the report exists to show. The join type IS the zero-fill policy." },
      ],
      difficulty: "hard",
    },
    {
      id: "zomato-mcq-29",
      prompt: "'How many of our 16 customers are repeat buyers (2+ orders)?' — which query shape answers it?",
      choices: [
        "WHERE COUNT(*) >= 2 over orders",
        "A per-customer fold (GROUP BY customer_id HAVING COUNT(*) >= 2) wrapped in an outer COUNT — 14 of 16 here",
        "COUNT(DISTINCT status) over orders",
        "COUNT(*) / COUNT(DISTINCT customer_id)",
      ],
      answer: 1,
      why: "Repeat-buyer is a property of a per-customer aggregate, so the fold must happen first — the inner GROUP BY/HAVING produces the qualifying customers, the outer COUNT numbers them: 14. 6.4 orders per customer (mcq-1's ratio) is a different metric entirely — average load, not reach.",
      notes: [
        { choice: 0, why: "WHERE cannot see aggregates — COUNT doesn't exist before groups form. The error is the pipeline order teaching itself again." },
        { choice: 3, why: "That's orders-per-customer (6.4), not the count of repeat customers. Two metrics, one table, and confusing them is the exact grain failure this screen hunts." },
      ],
      difficulty: "medium",
    },
    {
      id: "zomato-mcq-30",
      prompt: "The 'second-worst zone' read: ORDER BY cancel_share DESC LIMIT 1 OFFSET 1. When does it lie?",
      choices: [
        "When two zones tie at the second-worst share — OFFSET picks one arbitrarily and hides the tie",
        "Always — OFFSET is deprecated",
        "When the share column is rounded",
        "It never lies if the ORDER BY is deterministic",
      ],
      answer: 0,
      why: "OFFSET-1 assumes the runner-up is unique. On this ledger the shares (8.1 / 6.7 / 5.3 / 0.0) don't tie — but the placed-order counts DO (EU and APAC at 3 cancels), and the trap transfers the moment the ranking key changes. DENSE_RANK = 2 returns both silver zones; 'both' is the honest second place.",
      notes: [
        { choice: 3, why: "Deterministic ordering fixes WHICH row OFFSET grabs, not whether grabbing one row is the right answer to a tied question. The tie is in the data, not the sort." },
        { choice: 2, why: "Rounding is downstream of ties, not a cause of them — and rounding can even CREATE ties, which strengthens the case for rank-based cuts." },
      ],
      difficulty: "hard",
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
    {
      id: "cs-zomato-3",
      tier: "medium",
      topic: "s6",
      universe: "refund-audit",
      title: "The refund-exposure ledger",
      brief:
        "Refund-audit brief, in-world: before the weekly finance sync, the ops lead wants every placed order classified by what it owes the customer — 'refund_now' (cancelled: money already taken and owed back), 'refund_watch' (pending: money at risk until the kitchen confirms), 'cleared' (delivered or shipped: no refund exposure). Probed on the storefront db (orders = delivery orders): the 103 placed orders split into 82 cleared carrying 27,567.79, 14 refund_watch at 6,113.00, and 7 refund_now at 1,152.49 — so 7,265.49 of placed value sits in refund-exposed buckets. The CASE label IS the policy: each branch names a bucket the refund team actually works from.",
      ask: "Return one row per fate bucket: label, order count, and exposure amount (2 decimals), biggest exposure first.",
      template:
        "SELECT {1}\n         WHEN o.status = 'cancelled' THEN 'refund_now'\n         WHEN o.status = 'pending' THEN 'refund_watch'\n         {2} 'cleared' END AS fate,\n       COUNT(*) AS orders,\n       ROUND(SUM(o.total), 2) AS exposure\nFROM orders o\nGROUP BY fate\nORDER BY exposure {3};",
      slots: [
        {
          answer: "CASE",
          kind: "keyword",
          label: "the classifier keyword",
          why: "The fate buckets are a CASE expression: WHEN branches translate status codes into the refund team's vocabulary. Any other opener fails to parse — the CASE keyword is the boundary between raw status rows and a report the finance sync can read.",
        },
        {
          answer: "ELSE",
          kind: "keyword",
          label: "the catch-all branch",
          why: "ELSE 'cleared' catches delivered AND shipped in one arm — the no-exposure bucket. Without the ELSE those rows would fall out as NULL fates, and the exposure column would print a hole where 27,567.79 belongs; the ledger must classify every order, not just the exposed ones.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure-first direction",
          why: "Biggest exposure on top puts the cleared bucket (27,567.79) first and the refund_now bucket (1,152.49) last — the sync reads the whole ledger in exposure order. ASC would lead with refund_watch, burying the context that 7.2k of 34.8k sits exposed.",
        },
      ],
      distractors: ["COALESCE", "WHEN", "ASC"],
      walkthrough:
        "A classification pass where the CASE is the policy. Three WHEN-branches: cancelled maps to 'refund_now' (7 orders, 1,152.49 — money taken and owed back), pending maps to 'refund_watch' (14 orders, 6,113.00 — at risk until the kitchen confirms), and the ELSE arm sweeps delivered and shipped into 'cleared' (82 orders, 27,567.79 — no exposure). GROUP BY the fate alias folds 103 orders into three buckets, SUM(o.total) adds the money at the same fold, and ROUND(..., 2) prints it the way finance quotes it. The stack is the tie-out: 7 + 14 + 82 = 103 and 1,152.49 + 6,113.00 + 27,567.79 = 34,833.28 — the ledger reconciles to the network total by construction. The ELSE arm is the one that bites when omitted: drop it and delivered/shipped orders become NULL fates, the exposure column grows a hole, and the sync asks where 27.5k went. ORDER BY exposure DESC keeps the biggest bucket on top; ASC would open the meeting on the smallest.",
      },
    {
      id: "cs-zomato-4",
      tier: "medium",
      topic: "t5",
      universe: "supplier",
      title: "The merchant supply-bench rank",
      brief:
        "Supplier-audit brief, in-world: the merchant pod ranks restaurant partners by how deep a menu they run on the platform — menu-item count — and the read has a tie rule: partners at the same rung ride together, because the top-two RUNGS are the bench, not a headcount. Probed on the storefront db (suppliers = merchant partners, products = menu items): four partners run three menu items each (Midwest Hardware Co 4.4, Nordic Gadgets AB 4.6, Pacific Textiles 3.9, Shenzhen Electro 4.1) and two run two (Alpine Audio GmbH 4.8, Andes Naturals SA 4.0). DENSE_RANK keeps the tie as one rung — rank 1 four times, rank 2 twice — so the rung-2 pair survives the cut with the leaders.",
      ask: "Return partner, rating, menu count, and a no-gap bench rank for every partner in the top two rungs, best rung first.",
      template:
        "WITH bench AS (\n  SELECT s.name,\n         s.rating,\n         COUNT(p.id) AS menus,\n         {1}() OVER (ORDER BY COUNT(p.id) {2}) AS bench_rank\n  FROM suppliers s\n  LEFT JOIN products p ON p.supplier_id = s.id\n  GROUP BY s.id\n)\nSELECT name, rating, menus, bench_rank\nFROM bench\nWHERE bench_rank <= {3}\nORDER BY bench_rank, menus DESC, name;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap rung function",
          why: "DENSE_RANK stamps the four 3-menu partners rank 1 and the two 2-menu partners rank 2 — tied partners share a rung and no rung is skipped. RANK would stamp the 2-menu pair rank 5, and the WHERE-rank cut would delete them; ROW_NUMBER would number the tied quartet 1-4 arbitrarily, splitting a tie the business rule says to keep.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the deepest-menu-first direction",
          why: "The bench is ranked from the deepest menu down, so the window ORDER BY runs descending — 3-menu partners take rung 1. ASC would crown the two-menu partners rung 1 and push the deep-bench quartet to rank 2, a correct-looking query answering the opposite question.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the top-two-rung cut",
          why: "WHERE bench_rank <= 2 keeps both rungs — all six partners, ties riding together. That is the tie rule made SQL: the cut is on RANK RUNGS, not row counts, so the 2-menu pair (including Alpine Audio at 4.8, the platform's best-rated partner) stays on the bench with the leaders.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "1"],
      walkthrough:
        "A rank with a tie rule. The CTE folds each supplier's menu rows with COUNT(p.id) — 3 for Midwest, Nordic, Pacific and Shenzhen, 2 for Alpine and Andes — and DENSE_RANK() OVER (ORDER BY COUNT(p.id) DESC) stamps rungs over the folded counts: rank 1 four times, rank 2 twice, no gaps. The outer WHERE bench_rank <= 2 keeps every partner at the top two rungs — all six — because the bench is defined by rungs, not headcount. The two broken chips fail differently: RANK stamps the 2-menu pair rank 5 (the gap where ranks 3-4 would live), and the rung cut then deletes the best-rated partner on the platform; ROW_NUMBER splits the four-way tie 1-through-4 by whatever order the engine scans, so two arbitrary partners make the cut and two don't. ASC inverts the bench, crowning the thinnest menus. When the brief says 'top two rungs', DENSE_RANK plus a rank-cut is the shape that keeps ties honest.",
      },
    {
      id: "cs-zomato-5",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Funnel brief, in-world: the ops board's header strip needs the whole placed-to-kept funnel in ONE row — placed, delivered, in transit, waiting, cancelled, kept share, cancellation share — computed in a single scan so every bucket shares the same denominator. Probed on the storefront db (orders = delivery orders): 103 placed split 52 delivered, 30 shipped, 14 pending, 7 cancelled; kept (delivered + shipped) is 82 of 103 = 79.6%, cancellation share is 7 of 103 = 6.8%. FILTER (WHERE ...) is the one-pass tool: each bucket is a conditional count over the same 103 rows, and the buckets must add back to placed.",
      ask: "Return one row: placed, delivered, in transit, waiting, cancelled, kept_pct, cancel_pct.",
      template:
        "SELECT COUNT(*) AS placed,\n       COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS in_transit,\n       COUNT(*) FILTER (WHERE status = 'pending') AS waiting,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE status {1} ('delivered', 'shipped')) / {2}, 1) AS kept_pct,\n       ROUND({3} * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct\nFROM orders;",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the kept-bucket membership test",
          why: "IN ('delivered', 'shipped') catches BOTH kept buckets in one predicate — the 82 orders that either reached the customer or are on the road. NOT IN flips the count to the 21 non-kept orders (20.4%), and '=' cannot take a list — the kept share becomes a syntax error.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the shared denominator",
          why: "Both shares divide by COUNT(*) — all 103 placed orders, the same population every FILTER bucket rides on. Summing any conditional count over that same fold gives 103 back, which is the free tie-out; a smaller denominator quietly flatters the kept share.",
        },
        {
          answer: "100.0",
          kind: "keyword",
          label: "the real-division guard",
          why: "100.0 forces REAL division before the fraction: 82/103 = 79.6 and 7/103 = 6.8. INTEGER 100 lets SQLite truncate 7/103 to 0 first — every sub-1% share prints 0.0, the classic silent bug this kit drills in mcq-2.",
        },
      ],
      distractors: ["NOT IN", "=", "SUM(o.total)", "100"],
      walkthrough:
        "One scan, seven numbers. COUNT(*) counts all 103 placed orders; four FILTER clauses each count their status bucket over the same rows — 52 delivered, 30 in transit, 14 waiting, 7 cancelled — and the strip's built-in tie-out is that they sum to 103. The kept share wraps a fifth FILTER (status IN ('delivered','shipped') = 82) over COUNT(*): 100.0 * 82 / 103 = 79.6. The cancellation share rides the CASE-SUM form — SUM over the 1/0 flags divided by the same COUNT(*) — 6.8, deliberately the other dialect so the strip shows both. The two dangerous chips are the denominator pair: NOT IN silently flips the kept share to 20.4 (the funnel inverted), and integer 100 truncates 7/103 to zero before any decimal survives — 0.0 on the board while 7 orders sit cancelled. SUM(o.total) in a count slot prints rupees where orders belong. One row, one scan, one denominator — and every number on the strip reconciles.",
      },
    {
      id: "cs-zomato-6",
      tier: "hard",
      topic: "j5",
      universe: "growth",
      title: "The clean-record anti-join",
      brief:
        "Growth-board brief, in-world: the loyalty push targets customers who have NEVER cost the platform a cancellation — the clean-record bench. The read is an anti-join with a twist: the cancelled-orders filter must live in the ON clause, not WHERE, or the LEFT JOIN collapses into an INNER join and returns the exact opposite bench. Probed on the storefront db (orders = delivery orders, customers = registered users): 12 of 16 customers have zero cancellations — EU 7 of 8 registered, APAC 3 of 5, US 1 of 2, LATAM 1 of 1. The 4 excluded accounts carry all 7 cancellations (EU's one repeat-canceller alone holds 3). Region-level counts, worst bench last.",
      ask: "Return region and clean-record customer count per zone, deepest bench first.",
      template:
        "SELECT c.region,\n       COUNT(c.id) AS clean_record\nFROM customers c\n{1} JOIN orders o ON o.customer_id = c.id {2} o.status = 'cancelled'\nWHERE o.id {3} NULL\nGROUP BY c.region\nORDER BY clean_record {4};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the customer-preserving join",
          why: "LEFT JOIN keeps all 16 customers, handing the 12 with no cancelled orders a NULL payload that o.id IS NULL catches. INNER JOIN keeps only the 4 customers WITH cancellations — and then IS NULL deletes even those, returning an empty set: the bench vanishes in one keyword swap.",
        },
        {
          answer: "AND",
          kind: "keyword",
          label: "the ON-clause filter placement",
          why: "AND o.status = 'cancelled' narrows WHICH orders join while every customer row still survives the LEFT JOIN — the anti-join's engine. Moving the status filter to WHERE evaluates after the join and turns the query inner: the 12 clean customers (whose matched rows got filtered to nothing) are deleted — the exact opposite of the bench.",
        },
        {
          answer: "IS",
          kind: "keyword",
          label: "the NULL-payload test",
          why: "o.id IS NULL is the only way to test for the unmatched rows the LEFT JOIN manufactured — o.id = NULL is UNKNOWN for every row, and the report ships empty while looking syntactically fine. The NULL payload IS the signal; equality can never see it.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the deepest-bench-first direction",
          why: "DESC puts EU's 7-of-8 bench on top — the push targets the deepest clean bench first, with APAC's 3 behind it. ASC would lead with LATAM's single clean customer, a one-account zone presented as a segment.",
        },
      ],
      distractors: ["INNER", "WHERE", "OR", "=", "ASC"],
      walkthrough:
        "An anti-join where filter placement IS the metric. The LEFT JOIN pairs every customer with their cancelled orders only — the o.status = 'cancelled' condition sits in the ON clause, so customers with no cancellations still survive the join carrying a NULL payload. WHERE o.id IS NULL keeps exactly those unmatched rows: 12 customers, folded per region into EU 7, APAC 3, US 1, LATAM 1. The three failure modes are each a different lie: INNER JOIN deletes the unmatched rows before the WHERE can see them — an empty report; the status filter moved to WHERE runs after the join and converts it to an INNER join, keeping the 4 cancelled-on customers instead of the 12 — the opposite bench with a plausible row count; and o.id = NULL poisons the payload test into UNKNOWN, silently emptying the result. OR in the ON clause matches every customer to every cancelled order and inflates the counts. Sort DESC and the deepest bench leads; the 4 excluded accounts — 7 cancellations among them — stay outside by design, which is the whole point of a clean-record read.",
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
    { slug: "basket-depth-aov", why: "Basket depth and average order value at order grain — the 338.19 AOV read, always quoted beside min/max and never alone. Curated pick." },
    { slug: "repeat-purchase-rate", why: "Share of customers ordering again in a window — the re-order rate this kit's 63.5% big-spender concentration is built on. Curated pick." },
    { slug: "customer-order-frequency", why: "Orders per customer per period — the frequency histogram growth reads before any retention push. Curated pick." },
    { slug: "customers-who-never-order", why: "Registered-but-dormant users via anti-join — zero rows on this ledger and still the right shape to ship. Curated pick." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Browsed, never bought — the discovery-surface abandonment read that sits one step before the cancellation share. Curated pick." },
    { slug: "the-most-recent-three-orders", why: "Top-N recency per customer — the two-most-recent-orders screen with ROW_NUMBER over the MAX join-back. Curated pick." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Plate lines above the average quantity — scalar subquery plus a HAVING floor on the menu-mix grain. Curated pick." },
    { slug: "recyclable-and-low-fat-products", why: "Two-flag catalog filtering — the veg/non-veg menu attribute screen, CASE-free but CASE-minded. Curated pick." },
    { slug: "fix-product-name-format", why: "Merchant menu-feed casing cleanup — INITCAP-style normalization before any GROUP BY can trust the name. Curated pick." },
    { slug: "monthly-transactions-ii", why: "Month buckets with cancelled amounts excluded — the demand close's conditional-aggregation escalation. Curated pick." },
    { slug: "friday-purchases-i", why: "Weekday-window demand comparison — the Friday-versus-rest split rider staffing is planned from. Curated pick." },
    { slug: "calculate-orders-within-each-interval", why: "Orders bucketed into time intervals — the dinner-rush window read, interval math included. Curated pick." },
    { slug: "game-play-analysis-v", why: "Day-1 return cohorts via first-event CTE — the order-tomorrow retention gate in textbook clothing. Curated pick." },
    { slug: "the-number-of-users-that-are-eligible-for-discount", why: "NULL-safe promo eligibility — a conditional read where one NULL flips the population. Curated pick." },
    { slug: "calculate-special-bonus", why: "COALESCE the incentive: riders and partners with NULL fields still print — display policy in one query. Curated pick." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest dedupe with a tie-breaker — the double-fired order-event stream, collapsed and proven. Curated pick." },
  ],
};
