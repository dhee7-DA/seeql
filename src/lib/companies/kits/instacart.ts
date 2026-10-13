// Instacart — kit 4 of the Food & Quick-commerce domain (Batch E).
// Grocery batches and shopper gig math: basket size, item-level best-sellers,
// retail-partner store economics, and the batch-fate denominators that make
// 'lines picked' and 'batches kept' two different grains. Pool provenance:
// 2 tagged sql rows (Instacart tags) — most-frequently-ordered-product-per-
// customer and channel-ltv-vs-cac — lead the problem list and topic slugs;
// the other 14 problems and remaining slugs are THEME-CURATED from the sql
// rows in scripts/company-pools.md to Instacart's known screen themes
// (basket depth, catalog argmax, store inventory, re-order cohorts).
// Case studies run on the storefront db with probed figures from
// scripts/company-facts.md, mapped honestly: orders = grocery batches,
// order_items = basket lines, products = catalog items, quantity = units per
// line, suppliers = retail partner stores, region = fulfillment zone,
// shipped_at = batch-drop timestamp, invoices/payments = partner billing.

import type { CompanyKit } from "../types";

export const instacartKit: CompanyKit = {
  id: "instacart",
  domainId: "food",
  name: "Instacart",
  tagline: "Grocery batches and shopper gig math",
  accent: "text-lime-500",

  brief: [
    "Instacart is the grocery marketplace where a customer's order becomes a shopper's batch: pick the items from a partner store's shelves, check out, and drop at the door. The unit of work is the **BATCH** — one order, many basket lines, one gig — and the analytics reality follows: every meaningful fold starts at basket grain and everything item-level (**251 basket lines** on this ledger) must be folded back to it without drift. Basket size is the company's heartbeat: 251 lines across 103 batches, an average basket value of **338.19** against a 25.47-to-1,088.44 spread, and best-seller reads that distinguish units picked (**47** for the top catalog item) from lines picked (24) — a two-grain distinction interviewers probe relentlessly.",
    "The data org splits into batch ops (acceptance, fill, drop times by zone), catalog and retail-partner analytics (which stores and items move the basket — the top partner store holds **11,130.25** of this ledger's GMV, **32%**), and customer growth (repeat and re-order behavior, where the 3,000-plus spenders hold **63.5%** of revenue). Zone-shaped dashboards open the day; catalog deep-dives fill the midday; the gig side of the marketplace — batch acceptance and shopper economics — keeps a denominator on every rate. *The interviewer across the table has almost certainly owned a basket-size or fill-rate metric through a week where the mix shifted, and their questions carry that weather.*",
    "Interview style is catalog-flavored and grain-obsessed. A screen typically opens with a warm-up join (attach basket lines to batches and catalog items), escalates into a fold with a grain rule (**units versus lines, baskets versus customers**), then either an argmax question (most-frequently-ordered item per customer, top store by GMV) or a rate question where the trap is integer division, fan-out, or a HAVING-versus-WHERE misplacement. Follow-ups are spoken out loud: '*is that units or lines?*', 'does that denominator include unaccepted batches?', 'above the average of WHAT population?'. Candidates who narrate grain and population before writing SQL consistently outperform.",
    "Preparation strategy: the band carries 2 Instacart-tagged sql rows — `most-frequently-ordered-product-per-customer` and `channel-ltv-vs-cac` — and both lead this kit because they are real Instacart screens (per-customer argmax; personal-clock trailing value). The other 14 problems are theme-curated from the band's sql rows to Instacart's known probes: basket-depth-aov, repeat-purchase-rate, find-stores-with-inventory-imbalance, weeks-of-supply, rfm-segmentation. The two case studies run on the live storefront db, mapped honestly onto grocery: orders are batches, `order_items` are basket lines, products are catalog items, suppliers are partner stores. One case rebuilds the batch best-seller read (a three-table chain); the other rebuilds the above-average-basket census for the pricing review. Both are mechanically audited against the probed db figures.",
  ],

  dayInLife: [
    "**08:20 —** The day starts on the batch board — overnight batches versus basket lines, fill by zone, drop-time latency, and the partner-store roster with their ratings. The first query is almost always a reconciliation: did every batch's lines land, do line-level sums tie to batch totals, does the catalog join fan out the way the model says (**251 lines, 103 batches — 2.44 lines per batch** on this ledger, and yes, someone always re-derives it). The analyst who can write the two-sided diff — which zone's line counts don't tie to its batch counts, by how much, since when — is the one the ops lead pings first. While the shelves wake up, the best-seller strip goes out: one row per catalog item, **units picked beside lines picked**, because the two crowns are different items on different weeks.",
    "**12:30 —** The midday batch queue spikes and a fill-rate dip goes red. The fire-fight drill-down splits by store, by category, by basket position — was it a {rose:out-of-stock} item, a {violet:substitution} wave, or a data gap? The gig side keeps its own denominator on the same fire: unaccepted batches stay in the population, because *a fill rate that filters its failures first is a lie with a leaderboard*. Mitigation ships before the afternoon crest; the RCA lands in the EOD writeup.",
    "**15:00 —** Deep work, two crowns at once. A basket-size review folds units and lines side by side — **47 units over 24 lines** for the top item here — never one wearing the other's name; a partner-store review folds GMV share per store with the rating bench visible (**4.6 and 4.8** hold the trusted slots). Every deep-dive ends the same way: the definition written next to the number — 'basket value = `SUM(total) ÷ COUNT(DISTINCT batch)`, lines don't double-count' — because a basket metric without its grain is a rumor that survives until the pricing review.",
    "**17:20 —** Stakeholder cycles, then the close. The pricing team wants the above-average-basket census — **42 of 103 batches** sit above the 338.19 network average and carry **69.79% of GMV** — computed against a stated population, because a filtered average silently moves the fence. Growth wants re-order cohorts and channel value at the customer's personal clock, not the calendar's. The last hour is the EOD writeup — the day's fire, the definitions that held, tomorrow's first reconciliation — because *Instacart SQL exists to keep baskets, shelves and gig supply honest in the same query, at the hour the batch queue spikes*.",
  ],

  metrics: [
    { name: "Batch fill rate", what: "Batches that completed with a drop timestamp ÷ batches requested. On this ledger 82 of 103 carry a drop timestamp (52 delivered + 30 shipped); the 21-row gap is the pending-plus-cancelled queue the gig side manages." },
    { name: "Basket size (lines & units)", what: "Basket lines per batch and units per batch, folded side by side: 251 lines across 103 batches here. COUNT(*) counts lines; SUM(quantity) counts units — the two-grain read the whole catalog team lives by." },
    { name: "Average basket value", what: "SUM(total) ÷ COUNT(*) at batch grain: 338.19 on this ledger, spread 25.47 to 1,088.44. The pricing team's fence-post number — always beside the population it was averaged over." },
    { name: "Batch best-seller", what: "Top catalog item by UNITS picked (47 here, over 24 lines) versus by lines — two crowns that rotate weekly. The argmax read that decides catalog placement and promo slots." },
    { name: "Partner-store GMV share", what: "Revenue folded per retail partner store: the top store holds 11,130.25 (32% of this ledger). Concentration reads that decide which stores get demand steering." },
    { name: "Store rating bench", what: "Partner stores at or above the 4.5 rating floor: 2 of 6 here (4.6, 4.8). The trust read behind store ranking — a row filter when the rating lives on the store row, a HAVING floor when ratings fold from events." },
    { name: "Re-order & repeat rate", what: "Share of customers (or items) reordered inside a window. The 63.5% revenue share held by 3,000-plus spenders is the business reason this metric gets weekly screen time." },
    { name: "Batch drop latency", what: "Accept-to-drop delta averaged over completed batches only: 2.98 days average, 2-to-4 range on this ledger, slowest zone LATAM at 3.50. The population statement IS the metric." },
  ],

  topics: [
    {
      name: "Batch-grain aggregation",
      why: "Everything at Instacart starts by folding basket lines back to batches without letting the fan-out lie. The trap is grain drift: joining lines fans batches out, and COUNT(*) stops counting batches the moment the join lands — DISTINCT is the fold.",
      slugs: ["basket-depth-aov", "product-sales-analysis-ii", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Units-versus-lines folds",
      why: "Catalog reads split into two grains — units picked (SUM(quantity)) versus lines picked (COUNT(*)) — and interviewers force the distinction: 47 units over 24 lines for this ledger's top item. Per-item folds with join-aggregate discipline are the daily bread.",
      slugs: ["product-sales-analysis-iii", "students-and-examinations", "warehouse-manager"],
    },
    {
      name: "Catalog argmax & best-sellers",
      why: "Most-frequently-ordered item per customer, most recent order per item, best seller per period — argmax is THE Instacart shape, and the tagged row here is the real screen. The trap is ties and the ROW_NUMBER-versus-MAX choice.",
      slugs: ["most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "product-sales-analysis-iv"],
    },
    {
      name: "Basket completeness & gaps",
      why: "Recipes are membership sets: customers who bought A and B but not C, relational-division reads for full-basket buyers, restock reviews for items that stopped selling. Conditional membership and anti-joins decide promo targeting.",
      slugs: ["customers-who-bought-a-and-b-not-c", "customers-who-bought-all-products", "sellers-with-no-sales"],
    },
    {
      name: "Re-order & repeat reads",
      why: "Grocery retention is re-ordering: repeat-purchase rates, two-purchases-within-seven-days windows, revenue cohorts. The 63.5% revenue concentration from big spenders is why this family gets screen time every cycle.",
      slugs: ["repeat-purchase-rate", "users-with-two-purchases-within-seven-days", "cohort-repeat-revenue"],
    },
    {
      name: "Partner-store economics",
      why: "Store reads fold price, units and ratings per retail partner: weighted average selling price, inventory imbalance between stores, weeks of supply. The 32% GMV share held by one store is why concentration math matters here.",
      slugs: ["average-selling-price", "find-stores-with-inventory-imbalance", "weeks-of-supply"],
    },
    {
      name: "Shop windows & weekday rhythm",
      why: "Grocery demand is a calendar thing: the weekly shop, the 30-day activity window, weekday pivots. Period listings and day-of-week folds decide staffing and promo timing — and the window's boundaries are the trap.",
      slugs: ["list-the-products-ordered-in-a-period", "sales-by-day-of-the-week", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Customer value tiers",
      why: "Basket value tiers, RFM tiles, channel value at the customer's personal clock — the tagged channel-ltv-vs-cac row is the real screen. NTILE buckets and trailing-window revenue folds decide who gets the nudges.",
      slugs: ["rfm-segmentation", "channel-ltv-vs-cac", "spend-histogram"],
    },
    {
      name: "Growth cohorts & stickiness",
      why: "New-customer counts, retention matrices, growth accounting — the weekly-active discipline of grocery growth teams. One customer's ten batches count once, and the cohort clock starts at the FIRST batch, not the calendar's.",
      slugs: ["cohort-retention-matrix", "new-users-daily-count", "growth-accounting"],
    },
    {
      name: "Escalation shapes: subqueries & CASE",
      why: "Screens close with composed asks: above-average reads via scalar subqueries, first-batch status checks in CASE, market-entry comparisons. The escalation is composition — two populations and a fence in one query, no panic.",
      slugs: ["immediate-food-delivery-i", "second-highest-salary", "market-analysis-i"],
    },
  ],

  theory: [
    {
      id: "instacart-t1",
      q: "Basket lines attach to batches on one key and to catalog items on another. When does the join fan out, and which count still counts BATCHES afterward?",
      a: "The fan-out happens the moment one batch matches multiple lines — 103 batches become 251 rows on this ledger. After the fan-out, only COUNT(DISTINCT batch_id) still counts batches: COUNT(*) counts 251 line rows, and COUNT(line_id) skips only NULLs, which with a NOT NULL key is 251 too. The discipline is stating the grain out loud before the FROM clause: basket-size reads LIVE at line grain (SUM(quantity) is 47 for the top item, over 24 lines), while batch counts, fill rates and AOV must fold lines back to batches or they're fiction. The subtle follow-up is aggregate placement: SUM(o.total) after joining lines multiplies every batch total by its line count — on this ledger that inflates GMV from 34,833.28 to a nonsense number — so money aggregates either stay at batch grain or divide the fan-out back out. That's the first thing an Instacart screen watches you protect.",
      tag: "joins",
    },
    {
      id: "instacart-t2",
      q: "Rank catalog items by units picked per week. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one do you hand the catalog review?",
      a: "They disagree exactly where units tie. RANK gives both tied items the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing item that doesn't exist. DENSE_RANK gives the tie the same rung and keeps the sequence compact (1, 2, 2, 3). ROW_NUMBER splits the tie arbitrarily (1, 2, 3, 4) unless you add a deterministic tie-breaker like item id, which makes it the dedupe tool, not the leaderboard tool. The catalog review gets DENSE_RANK: best-seller lists are read as 'who's nth', and a skipped rung generates a meeting about an item that was never there. On a 103-batch ledger ties are everywhere — 47 units over the top item against 46 on the next means two items share a shelf-edge conversation — and the LIMIT-1-OFFSET-1 'second best-seller' habit breaks on every tie. The honest second place is DENSE_RANK = 2, and if two items share it, the promo gets both.",
      tag: "windows",
    },
    {
      id: "instacart-t3",
      q: "On this ledger — 103 batches, 251 basket lines, 16 customers — narrate what COUNT(*), COUNT(DISTINCT customer_id) and SUM(quantity) each measure, and where each belongs.",
      a: "Three numbers, three grains, all true at once. COUNT(*) at line grain is 251 — basket lines, the pick-audit grain. COUNT(DISTINCT customer_id) is 16 — repeat customers folded back to people, the audience grain. SUM(quantity) is total units picked — the shelf-demand grain, and the reason the best-seller crown (47 units on the top item) is a units crown, not a lines crown. The Instacart trap is reporting one grain under another's name: 'lines per batch' is COUNT(*)/COUNT(DISTINCT batch_id) at 2.44 and meaningful, but quoting 251 as 'baskets processed' inflates the gig workload by 2.4x. The strong answer assigns a grain to each form out loud — rows, distinct entities, summed quantities — and picks the grain the question names: basket size wants units AND lines side by side, fill rate wants batches, re-order rate wants customers. That assignment habit is the single most-drilled reflex in this kit.",
      tag: "aggregation",
    },
    {
      id: "instacart-t4",
      q: "The drop timestamp is NULL until the batch is delivered. What is your NULL policy for a batch-latency metric, and what does AVG do about the NULLs whether you ask or not?",
      a: "AVG ignores NULLs silently — so AVG(drop_ts - accept_ts) over ALL batches is already 'average latency of completed batches', a population chosen by NULL semantics rather than by you. On this ledger that's the 82 completed batches averaging 2.98 days; the 21 rows without a timestamp (14 pending, 7 cancelled) have no latency YET. The policy is to make that choice explicit: latency exists only for completed batches, so filtering the NULLs in WHERE is correct — and then the report's subtitle says so. Three behaviors to narrate: in filters, NULL fails both = and != comparisons, so 'drop_ts < cutoff' silently drops in-flight batches; in joins, NULL keys never match; in aggregates, COUNT(col) skips them while COUNT(*) keeps the row. What you never do is COALESCE a fake zero into the latency column — a pending batch with zero latency reads as instant picking in the gig review, which is worse than a hole. Guard the population, not the decoration.",
      tag: "nulls",
    },
    {
      id: "instacart-t5",
      q: "'Stores whose fill share fell below 90%' — WHERE or HAVING, and why can't the other clause see the share at all?",
      a: "HAVING, because the fill share is a group fact: it exists only after GROUP BY store folds the batches and the conditional SUM divides by COUNT(*). Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before groups form, so the share literally does not exist yet; the engine throws 'no such column', and that error is the pipeline order teaching itself. The split that predicts every placement: row predicates in WHERE (attributes of a single batch — zone, status, category), group predicates in HAVING (share thresholds, volume floors). The one subtlety worth saying out loud: pushing the completed-only condition into WHERE would be a definition change, not an optimization — it would shrink the fill rate's denominator to completed-only batches and every store would read 100%. Filter rows before the fold, filter groups after, and never let a WHERE do a HAVING's definitional work.",
      tag: "pipeline",
    },
    {
      id: "instacart-t6",
      q: "You need batches with a total above the network average. Walk me through the scalar subquery contract — and what happens on a filtered population where the inner query returns empty.",
      a: "A scalar subquery is contractually one column, zero-or-one rows. One row: its value joins the comparison — WHERE total > (SELECT AVG(total) FROM orders) runs the fold once and keeps the 42 above-average batches on this ledger (network average 338.19). Zero rows: it yields NULL, not an error, and total > NULL is UNKNOWN — the census ships empty with no complaint, which is the dangerous outcome on filtered populations (one zone, one store, one week) where the inner fold legitimately can come back empty. Two follow-ups separate seniors: the correlated cousin — WHERE o.total > (SELECT AVG(i.total) FROM orders i WHERE i.zone = o.zone) — re-runs per outer row and answers 'above MY zone's average', a different fence with a real cost profile; and the NULL-poisoning rule that NOT IN over a nullable inner list empties everything, while EXISTS or a LEFT JOIN anti-join survives. Saying which population the inner fold covers, and what happens when it's empty, is what this follow-up fishes for.",
      tag: "subqueries",
    },
    {
      id: "instacart-t7",
      q: "Batch events carry TEXT timestamps. How do you bucket them by month, diff them into drop latencies, and window a promo weekend — and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — gives the month spine; '%m' alone merges January 2024 with January 2025 into one phantom bucket, and this ledger spans 2024-01 to 2025-02 so the trap is live. Durations: JULIANDAY(drop_ts) - JULIANDAY(accept_ts) returns fractional days — the 2.98-day average with a 2-to-4 range is exactly that, rounded once at the end, never per row. Windows: half-open intervals — created_at >= '2024-11-29' AND < '2024-12-02' — never BETWEEN on the end boundary, which drops the promo weekend's last hours, the highest-basket hours of the event. The deeper break: these strings carry no timezone contract, and the NULL drop timestamp means every latency fold needs its population stated first — completed batches only. State the convention and the population, then query; never the reverse.",
      tag: "dates",
    },
    {
      id: "instacart-t8",
      q: "Batch event streams double-fire on retries, and catalog items get re-listed under new ids. How do you dedupe to one row per batch without losing the latest state — and how do you prove the dedupe didn't eat real batches?",
      a: "Two moves, then the proof. Detection: GROUP BY batch_id HAVING COUNT(*) > 1 is the cheapest duplicate census in SQL — run it before anything else and put the number in the ticket. Collapse: ROW_NUMBER() OVER (PARTITION BY batch_id ORDER BY event_at DESC, event_id DESC) = 1 keeps the latest state per batch, and the event_id tie-break is the part interviewers wait for — two events sharing a timestamp is the norm on retry storms, and without the tie-break 'latest' is engine-arbitrary. But collapsing is a decision, not a default: if the stream carries genuine state transitions (accepted → picked → delivered), folding them loses the funnel — so first ask whether the duplicates are retries of the SAME state or DISTINCT states, and keep the transitions if the funnel needs them. Re-listed items are the second dedupe: keep the newest listing per catalog item with the same ROW_NUMBER shape, and carry the id map, or GMV splits across ghosts. The proof is two counts before versus after — cheap, boring, run every time.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "instacart-mcq-1",
      prompt: "The db holds 103 batches spread across 251 basket lines. Which pair of counts belongs on the ops board's 'batches / lines' census?",
      choices: [
        "COUNT(DISTINCT o.id) on the joined table and COUNT(*) on order_items",
        "COUNT(*) on orders twice — batches and lines are the same grain",
        "COUNT(*) on orders and COUNT(customer_id)",
        "SUM(o.id) and COUNT(o.id)",
      ],
      answer: 0,
      why: "Batches fold from lines with DISTINCT: COUNT(DISTINCT o.id) over the joined table is 103, COUNT(*) over order_items is 251. The gap — 2.44 lines per batch — is the basket-size signal the census exists to expose.",
      notes: [
        { choice: 1, why: "103 versus 251 are different grains. Asserting they're the same inflates the gig workload by 2.4x in one cell." },
        { choice: 2, why: "COUNT(customer_id) counts line-level (or batch-level) rows — neither the batch nor the line count. Wrong metric entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "instacart-mcq-2",
      prompt: "The top catalog item shows 47 on the best-seller strip. The query was SUM(quantity) per item over basket lines. What would COUNT(quantity) have shown instead?",
      choices: [
        "The same 47 — COUNT and SUM agree on quantities",
        "The number of LINES the item appeared on — fewer than 47 when multi-unit lines exist",
        "NULL — COUNT cannot take a nullable column",
        "47 times the number of batches",
      ],
      answer: 1,
      why: "SUM(quantity) folds units (47 for this item); COUNT(quantity) counts non-NULL rows — lines (24 for the same item here). Two crowns, two grains; the best-seller strip must say which one it's wearing.",
      notes: [
        { choice: 0, why: "They agree only when every line has quantity 1. The moment a shopper picks two of an item on one line, units and lines diverge." },
        { choice: 2, why: "COUNT happily skips NULLs and returns a number. The failure isn't NULL — it's silently switching grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "instacart-mcq-3",
      prompt: "AVG(total) across all 103 batches is 338.19. Which query counts the above-average baskets?",
      choices: [
        "SELECT COUNT(*) FROM orders WHERE total > AVG(total)",
        "SELECT COUNT(*) FROM orders WHERE total > (SELECT AVG(total) FROM orders)",
        "SELECT COUNT(total > 338.19) FROM orders",
        "SELECT SUM(CASE WHEN total > AVG(total) THEN 1 ELSE 0 END) FROM orders",
      ],
      answer: 1,
      why: "AVG(total) doesn't exist until the fold completes, so the fence must ride in a scalar subquery: the inner fold computes 338.19 once, the outer WHERE keeps the 42 batches above it.",
      notes: [
        { choice: 0, why: "Aggregates can't appear in WHERE — 'misuse of aggregate function' errors out. The fence needs its own fold, hence the subquery." },
        { choice: 2, why: "Hardcoding 338.19 works today and lies tomorrow — the average moves with every new batch. Fences compute; they don't memorize." },
      ],
      difficulty: "medium",
    },
    {
      id: "instacart-mcq-4",
      prompt: "Two items tie at the top of a customer's order-frequency list. Which construction returns BOTH deterministically?",
      choices: [
        "MAX(quantity) per customer — the argmax fold",
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY cnt) = 1",
        "RANK() OVER (PARTITION BY customer_id ORDER BY cnt) = 1 — ties share the rung",
        "ORDER BY cnt DESC LIMIT 1 per customer",
      ],
      answer: 2,
      why: "RANK keeps tied items together at rank 1 — both rows return, deterministically. ROW_NUMBER = 1 splits the tie by an arbitrary order; MAX collapses to a number, not the item's identity.",
      notes: [
        { choice: 1, why: "ROW_NUMBER is the dedupe tool — exactly one row per customer, but WHICH row on a tie is engine-arbitrary. For 'all the winners', RANK." },
        { choice: 3, why: "LIMIT 1 applies to the whole result set, not per group — this returns one customer's winner, not every customer's." },
      ],
      difficulty: "medium",
    },
    {
      id: "instacart-mcq-5",
      prompt: "The top partner store holds 11,130.25 of the ledger's GMV. Which expression computes its 32% share without integer-division drift?",
      choices: [
        "100 * SUM(store_gmv) / SUM(total_gmv)",
        "SUM(store_gmv) / SUM(total_gmv) * 100",
        "100.0 * SUM(store_gmv) / SUM(total_gmv)",
        "SUM(store_gmv) / (100.0 * SUM(total_gmv))",
      ],
      answer: 2,
      why: "The 100.0 must meet the aggregate BEFORE any division: 100.0 * SUM(...) forces float arithmetic on the numerator, so the share survives with decimals. Both integer-100 and division-first variants truncate before promotion.",
      notes: [
        { choice: 0, why: "INTEGER 100 with integer SUMs truncates: a 32% share prints 32, but a 0.4% share prints 0. The silent bug hides until a small store checks its number." },
        { choice: 1, why: "Division happens first at integer precision — 11130/34833 truncates to 0, times 100 is still 0. Multiplication order is the whole game." },
      ],
      difficulty: "medium",
    },
    {
      id: "instacart-mcq-6",
      prompt: "'Stores moving at least 100 units this month' — the units fold lives on basket lines joined to batches. Where does the 100-unit floor go?",
      choices: [
        "WHERE SUM(quantity) >= 100 — before the GROUP BY",
        "HAVING SUM(quantity) >= 100 — after the GROUP BY",
        "LIMIT 100 on the folded result",
        "WHERE quantity >= 100 — filter the lines first",
      ],
      answer: 1,
      why: "SUM(quantity) is a group fact — it exists only after GROUP BY store folds the lines, so the floor belongs in HAVING. WHERE executes before groups form and cannot see the fold.",
      notes: [
        { choice: 3, why: "That filters single LINES above 100 units — a different (and nearly empty) population. Definition change, not a filter placement." },
        { choice: 2, why: "LIMIT caps row count, not a per-group threshold. 'At least 100' is a HAVING sentence in SQL grammar." },
      ],
      difficulty: "medium",
    },
    {
      id: "instacart-mcq-7",
      prompt: "promo_claims.customer_id is nullable. Why is `WHERE c.id NOT IN (SELECT customer_id FROM promo_claims)` dangerous for the 'customers who never claimed' read?",
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
      id: "instacart-mcq-8",
      prompt: "A per-day batch fold has day ties (several days at 9 batches). In SUM(batches) OVER (ORDER BY batches DESC), what does the running total at the FIRST 9-batch row include?",
      choices: [
        "Just that one row — running totals add row by row",
        "All 9-batch days — the default frame is RANGE, and peers ride together",
        "The whole table — an unordered window is global",
        "Nothing — window sums require an explicit ROWS BETWEEN",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes ordering PEERS — the running total jumps by the whole tied group at once. ROWS BETWEEN … CURRENT ROW counts one row. The frames disagree exactly where ties exist, which is every best-seller board on a 103-batch ledger.",
      notes: [
        { choice: 0, why: "That's the ROWS frame's behavior — and it takes an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW to get it. The default is RANGE-with-peers." },
        { choice: 3, why: "Windows work fine without explicit frames — they silently pick RANGE, which is precisely the surprise. State the frame; don't inherit it." },
      ],
      difficulty: "hard",
    },
    {
      id: "instacart-mcq-9",
      prompt: "The team wants 'catalog items that were re-ordered but never substituted'. substitutions.item_id is nullable. Which anti-join survives a NULL in the substitution list?",
      choices: [
        "WHERE item_id NOT IN (SELECT item_id FROM substitutions)",
        "LEFT JOIN substitutions s ON s.item_id = p.id WHERE s.item_id IS NULL",
        "INNER JOIN substitutions s ON s.item_id = p.id",
        "WHERE item_id != EVERY (SELECT item_id FROM substitutions)",
      ],
      answer: 1,
      why: "The LEFT JOIN + IS NULL shape never consults the nullable column's VALUES as a set — unmatched items simply have no partner row. NOT IN with one NULL empties everything; INNER JOIN returns the opposite population.",
      notes: [
        { choice: 0, why: "One NULL in the subquery and NOT IN can never be TRUE — zero rows, no error, total silence. The most expensive bug shape in anti-join work." },
        { choice: 2, why: "INNER JOIN keeps items that WERE substituted — the exact opposite of the ask. Direction matters as much as NULL handling." },
      ],
      difficulty: "hard",
    },
    {
      id: "instacart-mcq-10",
      prompt: "STRFTIME('%m', created_at) buckets the monthly basket trend. What breaks on a ledger spanning 2024-01 to 2025-02?",
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
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-instacart-1",
      tier: "medium",
      topic: "j3",
      universe: "catalog",
      title: "The batch best-seller",
      brief:
        "Instacart-flavored case on the storefront db (orders = grocery batches, order_items = basket lines, products = catalog items, quantity = units per line): the catalog review opens with the best-seller strip, and the definition is stamped before the query — the crown goes to UNITS picked, not lines picked, because multi-unit lines are exactly where the two crowns diverge. Probed facts: 251 basket lines across 103 batches; the top item by units shows 47 (this ledger's Desk-Mat-class item) against 46 on the runner-up — a one-unit margin, which is why the fold has to be right. Chain: basket lines → batches → catalog items.",
      ask: "Return the single top catalog item by units picked: item name, category, units — best first.",
      template:
        "SELECT p.name,\n       p.category,\n       {1}(oi.quantity) AS units\nFROM order_items oi\nJOIN orders o ON o.id = {2}\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id\nORDER BY units {3}\nLIMIT {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the units fold",
          why: "The crown is UNITS picked: SUM(quantity) folds multi-unit lines into shelf demand — 47 for the winner. COUNT(quantity) would crown by LINES (24 for the same item), a different strip with a different winner on different weeks.",
        },
        {
          answer: "oi.order_id",
          kind: "keyword",
          label: "the line-to-batch join key",
          why: "Basket lines attach to batches on order_id — the line's FK to the batch it was picked for. Joining on oi.id pairs line ids with batch ids, a wrong-key fan-out that silently reshuffles every fold.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-first direction",
          why: "The strip wants the TOP item on row one, so descending units order is the only honest direction. ASC would headline the thinnest catalog item as the best-seller.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-item cut",
          noVerify: true,
          why: "The strip opens with ONE crown — LIMIT 1. The full ranked list is the catalog team's appendix, not the review's headline.",
        },
      ],
      distractors: ["COUNT", "MAX", "oi.id", "ASC"],
      walkthrough:
        "A three-table chain where the fold's grain is the whole test. Basket lines join batches on oi.order_id (each line's FK to its batch), then batches-side lines join catalog items on product_id — the 251-line fan-out folds back per item, and SUM(quantity) is the units crown: Desk-Mat-class item at 47 units, one ahead of the 46-unit runner-up, a margin thin enough that any grain slip changes the winner. COUNT would flip the strip to lines (24 on the same item — the two crowns diverge because shoppers pick multiples), MAX would report the single largest line quantity and call it a best-seller, and joining on oi.id pairs line ids against batch ids — a wrong-key join that reshuffles which lines survive and lands a different item on top. DESC + LIMIT 1 serves the headline; ASC serves the bottom of the catalog. One unit of margin: this is why the definition gets stamped before the query runs.",
      },
    {
      id: "cs-instacart-2",
      tier: "hard",
      topic: "q2",
      universe: "pricing",
      title: "Baskets above the network average",
      brief:
        "Instacart-flavored case on the storefront db (orders = grocery batches): the pricing review needs the above-average-basket census, and the fence is computed, never memorized — 'above average' means above the full-population average of 338.19 (ledger range 25.47 to 1,088.44), not the average of whatever survived a filter. Probed facts: 103 batches totaling 34,833.28 in GMV; network average basket 338.19. The deliverable is two cells: how many batches sit above the fence, and what share of GMV they carry — the concentration read that decides where basket-size nudges go.",
      ask: "Return the count of batches above the network average basket value and their share of total GMV (2 decimals).",
      template:
        "SELECT {4} AS big_baskets,\n       ROUND(100.0 * {2} / (SELECT SUM(total) FROM orders), {3}) AS gmv_share\nFROM orders\nWHERE total {1} (SELECT AVG(total) FROM orders);",
      slots: [
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-fence operator",
          why: "'Above average' is strict: total > the computed 338.19 fence. Flipping to < counts the below-average side — the smaller-basket population the nudges are NOT aimed at.",
        },
        {
          answer: "SUM(total)",
          kind: "keyword",
          label: "the above-fence GMV fold",
          why: "The share's numerator is the GMV carried by above-average batches: SUM(total) over the filtered rows. COUNT(total) would divide a basket count by a dollar total — units over money, a share of nothing.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the share rounding precision",
          noVerify: true,
          why: "Pricing quotes shares to 2 decimals — 69.79, not 70. Rounding to 0 would smooth a 0.21-point drift into invisibility, exactly the drift this census exists to catch.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the above-fence batch counter",
          why: "The census's first cell is HOW MANY batches clear the fence: COUNT(*) over the filtered population — 42 here. MAX(total) would print the largest basket value where a count belongs.",
        },
      ],
      distractors: ["<", "<>", "MAX(total)", "0"],
      walkthrough:
        "A scalar-subquery census where the fence's population is the whole test. The inner fold (SELECT AVG(total) FROM orders) computes 338.19 over ALL 103 batches — no filter had touched it, which is the point: a WHERE applied to the inner fold would silently move the fence and every downstream share with it. The outer WHERE total > fence keeps 42 batches; COUNT(*) prints the count, SUM(total) folds their GMV, and dividing by the second scalar fold (the full 34,833.28) with 100.0-before-division yields 69.79% — two-fifths of the baskets carrying over two-thirds of the value. The traps the distractors encode: '<' flips to the 61-basket small-basket side, '<>' unions both sides into all 103 and a share of 100, MAX(total) prints 1,088.44 (a basket value) where a count belongs, and rounding to 0 prints 70 — smoothing away the 0.21 the pricing review was built to see. Fences compute; they don't memorize.",
      },
  ],

  problems: [
    { slug: "most-frequently-ordered-product-per-customer", why: "Tagged Instacart — the per-customer argmax screen: each basket owner's most-ordered item, ties and all. The catalog team's bread and butter." },
    { slug: "channel-ltv-vs-cac", why: "Tagged Instacart — channel value measured on the customer's personal 90-day clock, not the calendar's. The growth-attribution read this kit's cohort topics build toward." },
    { slug: "basket-depth-aov", why: "Basket depth and average order value in one fold — the two-grain census (lines versus value) this kit's whole vocabulary rests on. Curated pick." },
    { slug: "repeat-purchase-rate", why: "Share of customers who came back — the re-order rate that decides whether grocery retention is working. Curated pick." },
    { slug: "list-the-products-ordered-in-a-period", why: "Weekly-shop window listing with quantity floors — the period-boundary read that decides promo timing. Curated pick." },
    { slug: "product-sales-analysis-ii", why: "Per-item units and revenue folded at line grain — the best-seller strip's raw material. Curated pick." },
    { slug: "sales-by-day-of-the-week", why: "Weekday pivot of demand — the weekly-shop rhythm that decides shopper staffing. Curated pick." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Conditional basket membership — pasta and sauce, no parmesan: the recipe-gap read behind cross-sell nudges. Curated pick." },
    { slug: "find-stores-with-inventory-imbalance", why: "Stores holding the same item at lopsided counts — the rebalancing read that moves stock between dark stores. Curated pick." },
    { slug: "immediate-food-delivery-i", why: "The first-order kept share — batch-fate conditional counting in its cleanest warm-up form. Curated pick." },
    { slug: "average-selling-price", why: "Period-weighted price fold — a revenue-per-unit ratio where the weighting choice changes the answer, the store-economics follow-up in interview form. Curated pick." },
    { slug: "warehouse-manager", why: "Join-aggregate inventory read per site — stock and demand folded per store, the dark-store dashboard in miniature. Curated pick." },
    { slug: "weeks-of-supply", why: "Trailing-velocity stock cover — how many weeks the shelves hold at current pick rates, the replenishment trigger. Curated pick." },
    { slug: "rfm-segmentation", why: "NTILE basket-value tiers — the recency-frequency-monetary segmentation that decides who gets the nudges. Curated pick." },
    { slug: "cohort-repeat-revenue", why: "Revenue tracked by acquisition cohort — the concentration read behind the 63.5% big-spender share. Curated pick." },
    { slug: "returns-rate-by-category", why: "LEFT JOIN refund rate per category — the substitution-and-refund read that flags which catalog categories disappoint. Curated pick." },
  ],
};
