// DoorDash — kit 1 of the Food & Quick-commerce domain (Batch F).
// The US delivery marketplace: the 30-minute promise vs actual latency,
// Dasher-marketplace supply balancing, batch economics, and the honest
// placed-vs-kept demand split that every marketplace lives by.
// Pool provenance: DoorDash carries 6 tagged sql rows in company-pools.md —
// all 6 ship here (problems 1-6 + topic slots); the remaining 10 problems and
// 24 topic slugs are theme-curated from the SQL band (delivery SLA math,
// cancellation shares, zone censuses, daypart demand curves) and say so.
// Cases run on the storefront db (scripts/company-facts.md, probed 2026-10-12):
// orders = deliveries, shipped_at = delivery timestamp, region = delivery zone,
// suppliers = merchant partners. On this training db latency is stored in
// DAYS (avg 2.98, range 2..4) — the same julianday shape that reads minutes
// on production event streams.

import type { CompanyKit } from "../types";

export const doordashKit: CompanyKit = {
  id: "doordash",
  domainId: "food",
  name: "DoorDash",
  tagline: "Dashers, deliveries and the 30-minute promise",
  accent: "text-red-500",

  brief: [
    "DoorDash runs the largest local-commerce marketplace in the US: restaurants, convenience and grocery merchants on one side, a flexible Dasher fleet on the other, and a customer promise measured in minutes — the delivery promise is the product. The operating artifacts are all logistics-shaped: Dashers go `online` and `offline` in real time, orders get batched (**one Dasher, two or three orders per run**), {amber:Peak Pay} pays bonuses into thin-supply windows, and DashPass membership shapes who orders how often. Every analyst here learns the same first lesson: *'orders placed' and 'orders delivered' are different populations*, and every rate you publish — on-time share, cancellation share, fill rate — is only as honest as its denominator.",
    "The data org is logistics-first. Supply-demand teams balance Dasher hours against order minutes per zone; **ETA science** owns the promise itself; new-vertical teams (grocery, convenience, alcohol) run funnels that end in a doorstep handoff. The culture is SQL-first: a zone review opens with a query, an experiment readout is a query with a definition attached, and the event stream — `placed, assigned, picked up, delivered, cancelled` — is the raw material every dashboard folds. The reflex being hired for is stitching event timestamps into per-delivery funnels and folding them per zone **without letting the grain blur**.",
    "Interviews screen for exactly that. Expect cancellation-share math where the denominator is **placed orders** (never the kept subset), latency averages over the population that actually has a delivery timestamp — and the sentence '*in-flight orders have no latency yet*' said out loud. Expect two-grain censuses (deliveries AND diners per zone), merchant-partner joins, leaderboard windows with tie rules, and basket-value ratios where the scalar-subquery baseline is the network average. The interviewers are listening for the narrate-then-write habit: **grain, filter, denominator, sort** — stated before the first keystroke.",
    "To prep: drill conditional aggregation (`SUM(CASE WHEN …)` and `COUNT FILTER`), the rank trio with tie-breakers, `julianday`-style diffs between timestamps, and anti-joins for demand hygiene. Practice saying which population each WHERE leaves — this db trains it honestly: **103 deliveries, 82 of them with a delivery timestamp**, average latency **2.98 days** (the same query shape reads ~34 minutes on production minute-grain events), and 7 cancelled orders whose share of each zone is the interview's favorite trap.",
  ],

  dayInLife: [
    "**08:10 —** The morning opens on the supply-demand board, not the revenue board. Overnight delivery latency per zone, Dasher online-minutes versus order-minutes, unassigned-order spikes — the analyst's first query is almost always a reconciliation: did every placed order get a delivery event, does the assigned-to-delivered count reconcile against the assignment stream, which zones drifted above promise. A latency average is meaningless until its population is stated — **delivered-and-shipped only**, *in-flight orders have no latency yet* — and the analyst who writes that sentence into the query header is the one whose number survives the 9am review.",
    "**11:45 —** The lunch peak fires and the board goes red: unassigned orders spike while Dasher online-minutes thin, and the war room wants a split, not a hunch. The fire-fight query is a one-pass status fold — {emerald:delivered}, {amber:pending}, {rose:cancelled} — per zone, so the room can see whether this was a demand burst, a supply gap or a cancellation wave. The rule of the room never changes: *cancellation share is cancelled ÷ placed*, with the cancelled rows inside the fold — filter them out first and every zone reads 0% or 100%. Mitigation ships before the crest; the post-mortem comes after.",
    "**14:30 —** Midday is definition triage. A zone manager wants cancellation share by suburb with DashPass excluded; an ETA scientist wants the p50 and p90 of assign-to-deliver for batched versus single orders; a merchant partner wants their delivered count netted against the refunds window. Each ask is a conditional aggregate wearing a business rule, and the query gets written twice: once to answer, once with the denominator printed in the metric name — '**cancellation share (of placed)**', '**on-time share (of delivered)**' — because at DoorDash a ratio without its population is treated as a rumor.",
    "**16:30 —** The afternoon runs stakeholder cycles. Peak Pay burn goes to finance weekly; batch-rate reads (orders per Dasher run) feed the economics model; the merchant-partner review walks delivered volume and take rate per partner with the join keys named. The rituals hold: a weekly business review where every headline number carries its SQL, and a post-mortem culture where a mis-defined denominator is treated as an incident, not a typo. The last thirty minutes are the **EOD writeup** — what fired at lunch, which definitions held, what tomorrow's first query must reconcile — because *DoorDash SQL exists to keep a minutes-scale promise auditable at zone scale*.",
  ],

  metrics: [
    { name: "On-time delivery share", what: "Deliveries inside the promise window ÷ DELIVERED orders — the denominator is the metric, because in-flight orders have no latency yet and cancelled orders never will. The promise-side headline." },
    { name: "Delivery latency", what: "Average assign-to-deliver time per zone. On the training db it is julianday diff math averaging 2.98 days with a 2..4 range; in production the identical shape reads minutes. The query is the skill; the grain is a footnote you must say out loud." },
    { name: "Cancellation share", what: "Cancelled orders ÷ PLACED orders, per zone and window. The placed denominator is the honesty test — filtering cancelled rows first collapses every zone's share to 0 or 100 and ships a lie." },
    { name: "Dasher supply-demand ratio", what: "Dasher online-minutes ÷ order-minutes per zone per hour. The balancing metric behind Peak Pay — a two-sided fold where either side alone is half a story." },
    { name: "Basket value (AOV)", what: "Delivery value ÷ orders. The network reads 338.19 on this db; zones above and below it are the growth-vs-suburb story, and the scalar-subquery baseline is the interview's favorite shape." },
    { name: "Batch rate", what: "Orders completed per Dasher run. The unit-economics lever: batching two orders halves the per-order delivery cost and doubles the fan-out risk in every join that follows." },
    { name: "Take rate", what: "Commission plus fees ÷ delivered GMV, per merchant partner. The marketplace's real revenue lens — a ratio whose two sides live at different grains, so the join discipline IS the test." },
    { name: "Peak Pay burn", what: "Bonus payout ÷ GMV in the boosted windows. The promo-efficiency read: conditional SUM over the peak rows only, with the window filter placed before the fold, not after." },
  ],

  topics: [
    {
      name: "The two-grain zone census",
      why: "'Deliveries AND diners per zone' opens every DoorDash zone review, and the trap is counting both at one grain: COUNT(*) counts delivery rows, COUNT(DISTINCT customer_id) folds repeat demand back to people. The gap between the columns is the intensity signal — a zone with heavy repeat diners needs different supply than one living off new orders.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "article-views-ii"],
    },
    {
      name: "Kept demand & cancellation math",
      why: "The marketplace's most-watched ratio is kept ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows that COUNT(*) divides. Drill it until placing the status filter in the wrong clause feels physically wrong — that filter move is the denominator-drift bug that ruins cancellation maps.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-i"],
    },
    {
      name: "Dasher supply & running sums",
      why: "Batch economics is capacity math: how many orders fit a run before the bag is full, how many minutes of demand does the online fleet cover. Running totals and cumulative windows answer it — and the door-dash twist is that capacity questions are always cumulative, never point-in-time.",
      slugs: ["last-person-to-fit-in-the-elevator", "last-person-to-fit-in-the-bus", "game-play-analysis-iii"],
    },
    {
      name: "Golden hours & date math",
      why: "Repeat demand has a clock: diners whose second order lands inside a golden window are the cohort DashPass offers chase. Screens drill date diffs, first-event subqueries and windowed 'days between orders' math — the retention inputs computed, not asserted.",
      slugs: ["find-golden-hour-customers", "user-activity-for-the-past-30-days-i", "the-latest-login-in-2020"],
    },
    {
      name: "Funnel steps from event streams",
      why: "A delivery is a funnel: placed → assigned → picked up → delivered. Event-stream reporting pivots those steps into columns and reads conversion between them, and the SQL is FIRST_VALUE-style funnels plus conditional pivots. The follow-up is always: which step can be NULL, and what does your query do about it?",
      slugs: ["funnel-step-conversion", "email-engagement-funnel", "ads-funnel"],
    },
    {
      name: "As-of states & point-in-time reads",
      why: "Every historical question is an as-of question: which Peak Pay bonus was live when the order landed, which menu price applied at order time. SCD2 as-of joins and half-open intervals are the shapes — and the trap is joining on 'current state' when the ask is explicitly historical.",
      slugs: ["point-in-time-asof", "product-price-at-a-given-date", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Merchant partner joins",
      why: "Supply-side reporting attaches every order to its merchant partner — supplier tables joined through product catalogs — and asks what survives: does a partner with zero delivered orders appear in the revenue table? INNER versus LEFT is a decision about who survives, and this kit drills it as one.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Zone leaderboards & the rank trio",
      why: "Top zones by latency, top merchants by delivered volume, worst suburbs by cancellation — logistics reporting is leaderboard reporting, and ties are everywhere when many zones share metrics. ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and LIMIT-boundary ties are the classic 'why does my top-8 return 9 rows' bug.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary"],
    },
    {
      name: "Rates with honest denominators",
      why: "On-time share, cancellation share, confirmation rate — DoorDash's ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided before the ratio, ROUND only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "One-pass censuses under a query budget",
      why: "Zone reviews are query-budgeted: the status census, the region census and the merchant census each get one pass, not four sequential scans. FILTER (WHERE …) and AVG-over-flags build a whole demand picture in one scan, with branch totals that must reconcile to COUNT(*).",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "total-traveled-distance"],
    },
  ],

  theory: [
    {
      id: "doordash-t1",
      q: "A zone dashboard reports 'delivered demand' and 'cancellation share' side by side. Where does the status filter live in each query, and why does moving it to the wrong clause destroy exactly one of them?",
      a: "The delivered-demand total wants a row-level filter: WHERE status IN ('delivered','shipped') discards cancelled and pending rows before the fold, because they are not delivered demand. The cancellation share wants the OPPOSITE: it needs cancelled rows inside the fold so the numerator can count them while COUNT(*) holds the placed denominator — its status rule lives inside SUM(CASE WHEN …), never in WHERE. Move the share's rule into WHERE and the denominator shrinks to the numerator's population: every zone reads 0% or 100%. Move the demand total's rule into HAVING and the cancelled value is already inside every group total, un-removable. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT — is the whole answer: row-facts filter in WHERE, group-facts judge in HAVING, conditional flags fold inside aggregates.",
      tag: "aggregation",
    },
    {
      id: "doordash-t2",
      q: "Deliveries join to diners for the zone census, and to merchant partners for the supply review. How do you choose INNER versus LEFT for each — and what does the choice silently delete?",
      a: "Decide from the survival rule the business question implies. The zone census joins deliveries to diners: a delivery with no diner row is corruption, so INNER is honest — and worth a data-quality flag, not silence. The merchant-partner review joins products to partners and partners to deliveries: a partner whose listings never delivered is exactly who the review is about, so LEFT from partners keeps them, arriving with NULL delivery columns that conditional counts turn into zeros. The DoorDash trap is filtering the right table in WHERE — WHERE o.status = 'delivered' after a LEFT JOIN kills the NULL payloads and silently inner-joins, deleting the zero-delivery partners the review needed. Move the predicate into ON, or inner-join deliberately and say so. Join type is a population decision, not a habit.",
      tag: "joins",
    },
    {
      id: "doordash-t3",
      q: "The merchant leaderboard ranks partners by delivered volume, and two partners tie at the cut. Walk me through what ROW_NUMBER, RANK and DENSE_RANK each do at that tie — and which one the business actually wants.",
      a: "ROW_NUMBER splits the tie arbitrarily — 4 and 5 with no rule visible to the reader, and the loser depends on the engine's sort mood unless you add a tie-breaker. RANK gives both tied partners rank 4 and jumps the next to 6 — the gap implies a fifth partner that doesn't exist. DENSE_RANK shares rank 4 and hands the next distinct volume rank 5 — ties share a rung with no gap. Which is 'right' is a business decision: a bonus pays exactly N partners, so ROW_NUMBER with a deterministic tie-break (partner id ASC) is correct; a tier ladder admits ties, so DENSE_RANK is correct; RANK is for 'who is strictly ahead of whom'. The senior tell is saying the tie policy out loud before writing the window — at marketplace scale, partner ties are the norm, and the LIMIT that follows the window is where the policy becomes visible.",
      tag: "windows",
    },
    {
      id: "doordash-t4",
      q: "shipped_at is NULL until a delivery completes. What do COUNT(*), COUNT(shipped_at) and AVG over a julianday diff each measure — and what sentence must accompany the latency average?",
      a: "COUNT(*) counts rows — all 103 placed deliveries on this db. COUNT(shipped_at) counts non-NULL values — the 82 that actually have a delivery timestamp (delivered plus shipped); the 21-row gap IS the in-flight-plus-cancelled picture, and reporting only one of the two numbers hides either demand or leakage. AVG(JULIANDAY(shipped_at) − JULIANDAY(created_at)) ignores NULLs silently, so it averages latency over the completed population — 2.98 days here, range 2 to 4 — which is correct arithmetic wearing an unstated definition. The sentence that must accompany it: 'average delivery latency of completed deliveries; pending and cancelled orders are out of scope because they have no latency yet.' A WHERE clause doing definitional work without saying so is exactly what DoorDash reviewers hunt — the filter is fine, the silence is the bug.",
      tag: "nulls",
    },
    {
      id: "doordash-t5",
      q: "Your alias works in ORDER BY but errors in WHERE. Explain with the evaluation order, and tell me where a per-zone latency threshold belongs.",
      a: "Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT — where aliases are born — then ORDER BY. When WHERE executes, the alias does not exist, so the engine throws 'no such column'; SQLite pragmatically resolves aliases in GROUP BY, HAVING and ORDER BY but never in WHERE, and Postgres agrees on WHERE — so the portable habit is the underlying expression everywhere except ORDER BY. The threshold question is a grain question: 'deliveries above 30 minutes' is a row predicate, WHERE; 'zones whose AVERAGE latency beats 2.98 days' is a group predicate, HAVING — the fold must exist before the average can be judged. Writing the row-predicate in HAVING wastes the fold; writing the group-predicate in WHERE is impossible. Say the grain first — 'per zone' or 'per delivery' — and the clause chooses itself.",
      tag: "pipeline",
    },
    {
      id: "doordash-t6",
      q: "Find the zones whose average basket beats the network average. Walk me through the scalar subquery — its contract, and what happens when the inner query returns nothing.",
      a: "The shape is HAVING AVG(o.total) > (SELECT AVG(total) FROM orders): a scalar subquery is contractually 0-or-1 rows, 1 column. One row — here the network AOV, 338.19 on this db — joins the comparison, and the fold happens twice at two grains: per-zone baskets inside, the network baseline once. Zero rows: the scalar yields NULL, not an error, and every comparison against NULL is UNKNOWN — the report returns nothing with no complaint. On this table the inner fold always fires (103 orders), but filter the inner query to one zone or one window and the empty-inner bug ships for real. The correlated cousin — beating the diner's OWN average — re-runs per outer row and answers a different question at a different cost. Naming which population the inner fold covers, and what its empty case does, is what the follow-up is fishing for.",
      tag: "subqueries",
    },
    {
      id: "doordash-t7",
      q: "Delivery events carry TEXT timestamps. How do you compute latency, bucket demand by month, and slice a promise window — and where does each approach quietly break?",
      a: "Three tools, three caveats. Latency: JULIANDAY(shipped_at) − JULIANDAY(created_at) gives fractional days — this db's 2.98 average is exactly that, rounded once at the end, never per row; in production the same shape over minute-grain events reads a fraction of a day, and the unit is a property of the inputs, not the function. Buckets: STRFTIME('%Y-%m', created_at) or SUBSTR(created_at, 1, 7) on ISO text — both give '2025-02', and the SUBSTR shortcut dies the day the format drifts off fixed-width ISO. Windows: half-open intervals — created_at >= '2025-02-01' AND < '2025-03-01' — because BETWEEN on the boundary string drops the last night's deliveries. And the population caveat rides on every date fold: shipped_at is NULL until delivery, so state which orders the window is measuring before the window measures them.",
      tag: "dates",
    },
    {
      id: "doordash-t8",
      q: "Before a zone dashboard ships, you get ten minutes of query review. What are the two-grain and fan-out checks you run every time?",
      a: "Two checks, run as reflexes. One-grain-per-COUNT: after any join, ask 'one row per what?' out loud — joining deliveries to line items fans 103 orders into 251 rows, COUNT(*) silently starts counting line items, and every downstream AOV divides by the wrong thing; COUNT(DISTINCT o.id) folds the fan-out back, or fold per order in a derived table first. Reconciliation: the branch totals must add back to the whole — delivered plus shipped plus pending plus cancelled equals COUNT(*) of placed, and a one-pass census whose FILTER branches don't reconcile is lying in a column you didn't print. The duplicate check rides along: GROUP BY the natural key HAVING COUNT(*) > 1 before any leaderboard ships, because a double-loaded event doubles a zone's demand and halves its latency in the same stroke. Boring, cheap, always run — that is what makes the dashboard trustworthy.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "doordash-mcq-1",
      prompt: "On the training db, 82 of 103 deliveries carry a delivery timestamp (shipped_at); 14 are pending and 7 cancelled. What does COUNT(shipped_at) return — and what is the 21-row gap?",
      choices: [
        "103 — COUNT never skips rows",
        "82 — the completed set; the gap is the in-flight plus cancelled demand with no timestamp yet",
        "52 — COUNT counts only fully delivered orders",
        "0 — aggregates return NULL when any input is NULL",
      ],
      answer: 1,
      why: "COUNT(column) counts non-NULL values: 82. The 21-row gap (14 pending + 7 cancelled) is the population with no delivery event yet — the gap itself is the in-flight-plus-lost read.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rows; COUNT(column) skips NULLs. That NULL-blindness is a feature here — it is exactly how the completed subset is measured." },
        { choice: 3, why: "AVG returns NULL only when EVERY input is NULL. With 82 real timestamps present, a real count — and a real average over a shrunken population — comes back." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-2",
      prompt: "AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) reads 2.98 on the training db. The same query over production minute-grain events reads 0.0236. What changed?",
      choices: [
        "JULIANDAY returns whole days, so production needs a different function",
        "Nothing but the grain of the inputs — julianday diffs are fractional days either way; 0.0236 days ≈ 34 minutes",
        "Production must divide by 24 to convert hours into days",
        "The training db is wrong — latency should read 2.98 minutes",
      ],
      answer: 1,
      why: "JULIANDAY diffs carry the unit of the underlying timestamps: days on the training db (2.98), a fraction of a day on minute-grain events. The query shape is identical; the grain is a fact about the data you must state.",
      notes: [
        { choice: 0, why: "JULIANDAY is fractional by design — that is precisely how a 34-minute production latency survives the same expression as a 2.98-day training one." },
        { choice: 2, why: "Dividing by 24 converts days to days-per-hour nonsense here. Know your input grain and round once at the end — conversion math belongs to the readout, not the pipeline." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-3",
      prompt: "A merchant leaderboard: two partners tie at 30 deliveries, the next has 28. RANK() OVER (ORDER BY deliveries DESC) assigns the 28-delivery partner rank…",
      choices: ["2", "3", "4", "30"],
      answer: 1,
      why: "RANK shares rank 1 between the tied partners and skips to 3 — gaps kept. DENSE_RANK would say 2; ROW_NUMBER would say 3 but with an arbitrary split of the tie above.",
      notes: [
        { choice: 0, why: "That is DENSE_RANK's answer: ties share a rung and the next distinct value follows with NO gap. RANK leaves the gap — it counts the partners ahead, not the rungs." },
        { choice: 3, why: "Ranks count positions, not deliveries. The 28-delivery partner sits in the third position regardless of how big the tied leader group is." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-4",
      prompt: "HAVING AVG(o.total) > (SELECT AVG(total) FROM orders) — the network basket average is 338.19. Zone averages: US 383.48, LATAM 426.22, EU 335.32, APAC 313.66. Which zones survive?",
      choices: [
        "All four — every zone contributes to the network average",
        "US and LATAM only — the zones above the network basket",
        "EU and APAC only — the zones below it",
        "None — a zone can never beat the average it is part of",
      ],
      answer: 1,
      why: "The scalar subquery computes the network-wide AOV (34833.28 ÷ 103 = 338.19) once; zones fold their own averages and compare. US 383.48 and LATAM 426.22 clear it; EU 335.32 and APAC 313.66 do not — a zone can absolutely beat a weighted network average that other zones drag down.",
      notes: [
        { choice: 3, why: "That's true of every row against itself, not of a group average against the global one. LATAM's tiny, heavy-basket zone pulls its own average far above the network's." },
        { choice: 0, why: "Then the comparison would be decoration. Half the zones sit below 338.19 — the HAVING is doing real work, which is why the baseline's population (ALL 103 orders) matters." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-5",
      prompt: "Partners LEFT JOINed to their deliveries, then WHERE o.status = 'delivered'. Partners with zero delivered orders…",
      choices: [
        "Appear with NULL counts — LEFT JOIN keeps them",
        "Vanish — the WHERE filter on the right table's column silently turns the join into an INNER JOIN",
        "Appear once each — DISTINCT guarantees it",
        "Appear with zero — SQL coerces missing rows to 0",
      ],
      answer: 1,
      why: "Unmatched partners carry NULL delivery columns; NULL = 'delivered' is UNKNOWN and fails WHERE, deleting exactly the partners the LEFT JOIN existed to keep. The predicate belongs in ON — or the inner-join semantics must be a stated decision.",
      notes: [
        { choice: 0, why: "LEFT-ness survives only inside ON. The moment the right table's column is judged in WHERE, the NULL payloads are discarded and the join collapses." },
        { choice: 2, why: "DISTINCT dedupes rows that exist; it resurrects none. The partners aren't duplicated — they're absent, which is worse because the report looks complete." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-6",
      prompt: "Deliveries join to their line items (103 orders fan into 251 rows). The AOV query reads SUM(total)/COUNT(*) and returns 138.78 instead of 338.19. Why?",
      choices: [
        "SUM(total) double-counts batched orders",
        "COUNT(*) now counts line-item rows (251), not orders (103) — the fan-out changed the denominator's grain",
        "The join dropped orders with no line items",
        "total must be CAST to integer before averaging",
      ],
      answer: 1,
      why: "After the fan-out, COUNT(*) counts 251 joined rows. Fold per order first (SUM by order id in a derived table), or divide by COUNT(DISTINCT o.id) — 34833.28 ÷ 103 = 338.19. Grain-per-COUNT is the reflex being tested.",
      notes: [
        { choice: 0, why: "SUM over the joined rows is fine when total lives at order grain and the join is to items — the numerator didn't move; the denominator did. Saying 'one row per what?' for every COUNT is the fix." },
        { choice: 2, why: "Dropped orders would change the numerator too and the error would be visible. 138.78 is 34833.28 ÷ 251 — a clean per-line-item value, the signature of the fan-out, not of loss." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-7",
      prompt: "products.merchant_id is a nullable FK. Why is WHERE merchant_id NOT IN (SELECT id FROM merchants) dangerous for the 'listings never ordered' report?",
      choices: [
        "It's slower than a LEFT JOIN — performance, not correctness",
        "One NULL id in the subquery empties the whole result — x NOT IN (…, NULL) can never be TRUE",
        "It converts NULL merchant_ids to zero and mismatches them",
        "It ignores duplicate merchant ids and undercounts",
      ],
      answer: 1,
      why: "The membership test against a set containing NULL yields UNKNOWN, and NOT UNKNOWN is still UNKNOWN — every row fails and the anti-join ships empty. NOT EXISTS or LEFT JOIN + IS NULL is the NULL-proof shape.",
      notes: [
        { choice: 0, why: "The failure is silent CORRECTNESS: the query runs, returns zero rows, and the report ships looking clean. Performance is the smaller crime here." },
        { choice: 2, why: "NULLs don't coerce — they poison the three-valued logic itself. The empty result is not a mismatch; it's the logic collapsing." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-8",
      prompt: "The demand tracker folds orders per minute, then runs SUM(orders) OVER (ORDER BY minute). Two minute-buckets tie at the same timestamp value. What does the running total at the FIRST of them include?",
      choices: [
        "Just that one bucket — running totals walk row by row",
        "All buckets tied at that timestamp — the default frame is RANGE, and peers ride together",
        "The whole table — an unordered window is global",
        "Nothing — window sums refuse duplicate ORDER BY keys",
      ],
      answer: 1,
      why: "OVER (ORDER BY …) defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes ordering PEERS — the running total jumps by the whole tie group at once. ROWS BETWEEN … CURRENT ROW is the row-by-row version, and it must be written explicitly.",
      notes: [
        { choice: 0, why: "That's the ROWS frame — which nobody wrote. The default RANGE silently promotes timestamp ties from rows to peer groups, exactly where demand bursts cluster." },
        { choice: 3, why: "Duplicate ORDER BY keys are legal; they're what makes RANGE and ROWS diverge. The surprise isn't an error — it's a trend line that steps in peer-sized jumps." },
      ],
      difficulty: "hard",
    },
    {
      id: "doordash-mcq-9",
      prompt: "WHERE JULIANDAY(shipped_at) - JULIANDAY(created_at) > 0.5 filters 'deliveries slower than half a day'. Which deliveries does it silently drop?",
      choices: [
        "None — the comparison is exact for every order",
        "The 21 in-flight-plus-cancelled orders — NULL diff compares UNKNOWN, failing WHERE without a whisper",
        "Fast deliveries — the filter is backwards",
        "Batched orders — julianday can't diff batched timestamps",
      ],
      answer: 1,
      why: "shipped_at is NULL until delivery, so the diff is NULL for 14 pending and 7 cancelled orders; NULL > 0.5 is UNKNOWN and fails the filter. Sometimes that's the right definition — but the population (completed deliveries only) must be stated, because the report reads as if it covered everyone.",
      notes: [
        { choice: 0, why: "'Exact' is the trap: the filter is exact for the 82 orders that have timestamps and silently absent for the other 21. That silent absence is the definition drift DoorDash reviewers hunt." },
        { choice: 2, why: "The comparison is >, deliberately — 'slower than promise' is the question. The bug being graded is the NULL population, not the direction." },
      ],
      difficulty: "hard",
    },
    {
      id: "doordash-mcq-10",
      prompt: "The top-8 merchant leaderboard returns 9 rows. What class of bug is this, and which fix is honest?",
      choices: [
        "A join fan-out — remove duplicate rows with DISTINCT",
        "A tie at the cut boundary — keep both tied partners (rank honestly with RANK/DENSE_RANK) or force exactly 8 with ROW_NUMBER plus a deterministic tie-breaker",
        "An off-by-one in LIMIT — set LIMIT 7",
        "A NULL ranking — filter NULL deliveries first",
      ],
      answer: 1,
      why: "Two partners tie at eighth place and ORDER BY + LIMIT keeps both (or drops one arbitrarily). The honest fix states the policy: RANK/DENSE_RANK and show every partner at the boundary rank, or ROW_NUMBER with an id tie-break to force exactly 8 — a business decision someone owns.",
      notes: [
        { choice: 0, why: "DISTINCT would collapse legitimate distinct partners that happen to share a value — it treats a tie as duplication and deletes real businesses from the board." },
        { choice: 2, why: "LIMIT 7 doesn't remove the tie; it just moves the boundary and still returns whatever the engine's stable sort feels like at the seam. Ties need a policy, not a smaller number." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-doordash-1",
      tier: "easy",
      topic: "j7",
      universe: "growth",
      title: "The zone latency board",
      brief:
        "DoorDash-flavored brief on the storefront db: the growth board opens with the zone latency read, and the zone manager is blunt — 'the promise is per zone, so rank me the zones by delivery latency, worst first.' The definition is fixed: average delivery latency = JULIANDAY(delivery timestamp) − JULIANDAY(order timestamp), computed ONLY over orders that have a delivery timestamp — in-flight and cancelled orders have no latency yet. Probed facts: 82 of 103 orders qualify (avg 2.98 days, range 2..4); by zone LATAM 3.5 (2 orders), US 3.07 (15), EU 2.94 (36), APAC 2.93 (29). Note the training db stores latency in days — production runs the identical query over minute-grain events.",
      ask: "Return the ONE zone with the worst average delivery latency: zone, avg_days (2 decimals), deliveries — worst first, single row.",
      template:
        "SELECT c.region AS zone,\n       ROUND(AVG(JULIANDAY(o.{1}) - JULIANDAY(o.created_at)), 2) AS avg_days,\n       COUNT(*) AS deliveries\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS NOT NULL\nGROUP BY c.region\nORDER BY avg_days {2}\nLIMIT {3};",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the delivery timestamp",
          why: "The latency diff must END at the delivery timestamp: JULIANDAY(o.shipped_at) − JULIANDAY(o.created_at). Plug in created_at and every zone averages 0.0 — a perfect board that measures nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The board chases the WORST zone, so descending puts LATAM's 3.5 on top. ASC would crown APAC's 2.93 — a correct query that sends the team to fix the healthiest zone.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-row cut",
          noVerify: true,
          why: "The ask is THE worst zone — one row. LIMIT 1 keeps exactly LATAM 3.5; LIMIT 2 hands the board a runner-up nobody requested.",
        },
      ],
      distractors: ["created_at", "status", "ASC", "2"],
      walkthrough:
        "A latency board is a join, a fold, and a population statement. The join attaches each of the 103 orders to its diner's zone; WHERE shipped_at IS NOT NULL keeps the 82 completed deliveries — 2.98-day network average, 2..4 range — because pending and cancelled orders have no latency yet and must not fake one. GROUP BY zone folds them: LATAM 3.5 over 2 orders, US 3.07 over 15, EU 2.94 over 36, APAC 2.93 over 29. ORDER BY avg_days DESC + LIMIT 1 crowns LATAM. Swap the diff's second timestamp to created_at and every zone reads 0.0 — the silent zero that ships as 'promise kept everywhere'. Swap it to status and JULIANDAY of text yields NULL, an empty board. ASC crowns the best zone; LIMIT 2 dilutes a single-zone decision. The deliverable is one row, and the population sentence — 'completed deliveries only' — is what makes it defensible.",
    },
    {
      id: "cs-doordash-2",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "Zones above the network basket",
      brief:
        "DoorDash-flavored brief on the storefront db: the pricing team is tuning basket-size incentives and wants the zones that ALREADY order big — 'show me the zones whose average basket beats the network average; those are where a smaller discount moves the same demand.' The definition is fixed: basket = average order total per zone, compared against the network AOV computed over ALL placed orders — no status filter, because the baseline must be the whole demand the network actually priced. Probed facts: network AOV is 34833.28 ÷ 103 = 338.19; zone baskets are LATAM 426.22 (2 orders), US 383.48 (19), EU 335.32 (45), APAC 313.66 (37). Two zones clear the bar.",
      ask: "Return every zone whose average basket beats the network AOV of 338.19: zone, basket_avg (2 decimals), deliveries — biggest basket first.",
      template:
        "SELECT c.region AS zone,\n       ROUND(AVG(o.total), 2) AS basket_avg,\n       COUNT(*) AS deliveries\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING AVG(o.total) > (SELECT {1}({2}) FROM orders)\nORDER BY basket_avg {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the baseline aggregate",
          why: "The network baseline is an AVERAGE over all 103 orders — 338.19. SUM would compare zone baskets against 34833.28 and empty the report; COUNT would compare against 103 and empty it too.",
        },
        {
          answer: "total",
          kind: "keyword",
          label: "the basket column",
          why: "The baseline averages o.total — order value at order grain. customer_id would average 8.5 and wave every zone through, a filter that filters nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-basket order",
          why: "The pricing read wants the heaviest baskets first: LATAM 426.22, then US 383.48. ASC would open on the marginal zone instead of the incentive-ready one.",
        },
      ],
      distractors: ["SUM", "COUNT", "customer_id", "ASC"],
      walkthrough:
        "Two folds, two grains, one comparison. The outer GROUP BY folds 103 orders into four zone baskets — LATAM 426.22, US 383.48, EU 335.32, APAC 313.66 — while the scalar subquery folds the SAME table once, globally: AVG(total) over all rows = 34833.28 ÷ 103 = 338.19. HAVING judges each zone's folded average against that single number; two zones clear it and ORDER BY DESC hands the pricing team the incentive-ready list. Swap AVG for SUM and the bar becomes 34833.28 — the report empties, no error, just silence. Swap total for customer_id and the bar drops to 8.5 — every zone passes and the 'filter' filters nothing. COUNT builds a bar of 103 and empties it too; ASC flips the story to the weakest baskets. The deliberate no-status-filter in the baseline is the definition: the network priced ALL placed demand, so the comparison must use it — denominator drift works in both directions.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "The tagged pool's centerpiece: a conditional percentage over first-order demand where the denominator is the whole test — DoorDash's cancellation-share question in textbook form." },
    { slug: "immediate-food-delivery-i", why: "The first pass at placed-versus-kept demand: read the preferred delivery moment before any percentage lands — the warm-up half of the kept-rate drill." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Running-sum capacity: how many orders fit a batch before it crosses the limit — the batch-economics drill, cumulative by construction." },
    { slug: "find-golden-hour-customers", why: "Diners whose repeat order lands inside a golden window — the DashPass-offer cohort definition, computed from date diffs rather than asserted." },
    { slug: "funnel-step-conversion", why: "The event-stream funnel pivot — placed, assigned, picked up, delivered as columns — the Dasher-logistics funnel in one query." },
    { slug: "point-in-time-asof", why: "As-of state reads: which promo and price were live when the order landed — the SCD2 shape behind every historical-rate question." },
    { slug: "trips-and-users", why: "Cancelled-rate by city with exclusion windows — the marketplace screen's hardest classic: cancelled ÷ (cancelled − excluded), denominator discipline at its most brutal." },
    { slug: "confirmation-rate", why: "Confirmation share by user with NULL-tolerant rounding — the delivered-as-promised rate, computed honestly over the right population." },
    { slug: "average-time-of-process-per-machine", why: "Julianday-style latency averaged per unit — assign-to-deliver time per Dasher run, the same diff-average shape the zone latency board runs." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share math with 100.0 before the division — participation rates for the DashPass cohort, rounded once at the end." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The demand argmax: which diner orders most — the buyer-side twin of the merchant leaderboard, decided on a grouped count." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each diner's favorite merchant item, tie-proofed — the personalization input, argmax with a deterministic tie-break." },
    { slug: "the-most-recent-three-orders", why: "The app's recent-orders rail: latest three deliveries per diner via ROW_NUMBER with a PARTITION and a deterministic tie-break." },
    { slug: "active-businesses", why: "One-pass conditional flags per merchant — how many activity types did this partner fire; the query-budget census habit from the clinic." },
    { slug: "sales-by-day-of-the-week", why: "Daypart demand pivot — weekend surge versus weekday base, the staffing-and-Peak-Pay input computed as a column per day." },
    { slug: "average-selling-price", why: "Weighted price per window — marketplace basket math where the weighting choice changes the answer, a favorite DoorDash follow-up." },
  ],
};
