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
// Extended (R4-E): bank widened to 30 MCQs / 24 theory / 6 cases / 32 problems —
// cases 3-6 and problems 17-32 probed on the live storefront db (all figures
// cited in briefs are query-verified).

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
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks DoorDash screens on most: the zone latency board, the zones-above-network-basket read, the monthly demand pulse, the weekend-surge pivot behind Peak Pay planning, the month-close completion audit over a half-open window, and the per-zone month-over-month pace pack built on `LAG`. Run each on the live storefront database, then re-run a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the *'what population is that over?'* follow-up tests.",
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
      slugs: ["daily-leads-and-partners", "find-followers-count", "article-views-ii", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Kept demand & cancellation math",
      why: "The marketplace's most-watched ratio is kept ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows that COUNT(*) divides. Drill it until placing the status filter in the wrong clause feels physically wrong — that filter move is the denominator-drift bug that ruins cancellation maps.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-i", "unique-orders-and-customers-per-month", "sales-by-day-of-the-week", "average-selling-price"],
    },
    {
      name: "Dasher supply & running sums",
      why: "Batch economics is capacity math: how many orders fit a run before the bag is full, how many minutes of demand does the online fleet cover. Running totals and cumulative windows answer it — and the door-dash twist is that capacity questions are always cumulative, never point-in-time.",
      slugs: ["last-person-to-fit-in-the-elevator", "last-person-to-fit-in-the-bus", "game-play-analysis-iii", "average-time-of-process-per-machine"],
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
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier", "customers-who-never-order", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Zone leaderboards & the rank trio",
      why: "Top zones by latency, top merchants by delivered volume, worst suburbs by cancellation — logistics reporting is leaderboard reporting, and ties are everywhere when many zones share metrics. ROW_NUMBER, RANK and DENSE_RANK differ exactly at ties, and LIMIT-boundary ties are the classic 'why does my top-8 return 9 rows' bug.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary", "the-most-recent-three-orders"],
    },
    {
      name: "Rates with honest denominators",
      why: "On-time share, cancellation share, confirmation rate — DoorDash's ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided before the ratio, ROUND only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "percentage-of-users-attended-a-contest", "trips-and-users"],
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
    {
      id: "doordash-t9",
      q: "Walk me through building the zone census — deliveries AND diners per zone — and tell me what each column means to the supply team.",
      a: "Two counts, two grains, one fold. COUNT(*) after the delivery-to-diner join counts delivery rows — the load the rider network physically moves: EU 45, APAC 37, US 19, LATAM 2 on this db. COUNT(DISTINCT customer_id) folds repeat demand back to audience size: 8, 5, 2, 1. Neither is wrong; the ratio between them is the intensity signal — EU runs 5.6 orders per diner, a repeat-heavy metro that needs different rider posture than a new-user frontier. The trap that catches candidates is a third count: join to order_items and COUNT(*) silently counts line items (251, not 103). Saying 'one row per what?' for every COUNT in the query is the habit the interviewer is grading.",
      tag: "aggregation",
    },
    {
      id: "doordash-t10",
      q: "Partner GMV runs suppliers → products → order_items → orders. Where do the fan-outs live, and what folds safely at each hop?",
      a: "Revenue lives at line-item grain, so SUM(oi.unit_price * oi.quantity) folds safely through the whole chain — Nordic Gadgets reads 11130.25 across 38 orders. The danger is counting: COUNT(*) counts line items, not orders, so order volume must be COUNT(DISTINCT o.id) — that's how Midwest Hardware leads orders (45) while Nordic leads value (11130.25 vs 9294.93). Two argmaxes on the same chain disagree because they measure different grains. State the fold grain out loud at each hop — 'line grain for money, order grain for counts' — and the join discipline becomes mechanical instead of hopeful.",
      tag: "joins",
    },
    {
      id: "doordash-t11",
      q: "Rider capacity is a running sum of demand minutes. Write the frame — and tell me when the default frame lies.",
      a: "SUM(demand_minutes) OVER (ORDER BY minute ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) — explicit ROWS, because the default frame is RANGE, and RANGE includes ordering PEERS: two minute-buckets tied at the same timestamp enter the total together, so the coverage line steps in burst-sized jumps exactly where Rush demand clusters. ROWS is row-true: one row per step, deterministic. When the axis is dates with gaps, neither frame is calendar-true — that's a date-spine join, not a frame flag. The interview point is knowing the default exists and saying which frame the metric means before the deck ships.",
      tag: "windows",
    },
    {
      id: "doordash-t12",
      q: "Where do NULLs survive each pipeline stage — ON, WHERE, GROUP BY, DISTINCT, aggregates? Walk me through a delivery row with a NULL shipped_at.",
      a: "Five stages, five behaviors. ON: NULL join keys never match — an order with a NULL diner id vanishes from an INNER JOIN silently. WHERE: NULL fails every comparison, both = and !=, so 'not cancelled' must be written status != 'cancelled' OR status IS NULL. GROUP BY: NULLs are legal keys and fold into one group of their own — 21 NULL-shipped_at orders become a single honest bucket. DISTINCT: keeps exactly one NULL. Aggregates: COUNT(*) keeps the row, COUNT(shipped_at) skips it, AVG silently narrows its population. The policy that survives review: name the population every filter leaves, and probe NULLs deliberately instead of discovering them in production.",
      tag: "nulls",
    },
    {
      id: "doordash-t13",
      q: "PARTITION BY enrichment versus GROUP BY collapse — when does each serve the pipeline, and what happens to row count under each?",
      a: "COUNT(*) OVER (PARTITION BY dasher_id, day) computes each partition's fold but paints it onto every row — 103 deliveries in, 103 rows out, each now carrying its Dasher's day count as a passenger column; the delivery-grain pipeline keeps flowing. GROUP BY dasher_id, day collapses to one row per partition — right for a per-Dasher summary, fatal for a per-delivery pipeline that still needs the rows. The composition rule: enrich with windows first, fold with GROUP BY later — or stage the fold in a CTE and layer windows over it. The reflex question is always row count: 'how many rows survive this clause?' — if the answer surprises you, you picked the wrong tool.",
      tag: "windows",
    },
    {
      id: "doordash-t14",
      q: "The promise team wants latency tiers — p50 and p90 — over completed deliveries. How do you build them in SQL, and what sentence rides on the result?",
      a: "Stage the per-delivery latency first — JULIANDAY(shipped_at) − JULIANDAY(created_at) over the 82 completed rows only — then NTILE(4) OVER (ORDER BY latency) cuts quartiles and PERCENT_RANK gives the continuous 0-to-1 read; p50 is the tile-2 boundary, p90 the 0.9 percentile row. The population sentence is the deliverable: 'latency distribution of completed deliveries — pending and cancelled orders have no latency and are out of scope.' And add a deterministic tie-breaker to the window ORDER BY (latency, id), because NTILE must place tied rows somewhere and the tier boundaries should not move between runs. Aggregate first in a CTE, tier second — the window can't sit inside the same SELECT as the fold.",
      tag: "windows",
    },
    {
      id: "doordash-t15",
      q: "'Merchants with at least one delivered order in February' — do you reach for EXISTS, IN, or a JOIN, and why?",
      a: "EXISTS is the scale-safe answer: it's a semi-join that stops at the first matching row, never fans out, and treats NULL keys honestly — a product with NULL merchant_id simply doesn't exist in the check. IN works on small static lists but the NOT IN variant is the classic silent-empty bug: one NULL in the subquery and every row fails. A JOIN is the wrong tool for membership: a partner with 40 February orders multiplies the outer rows 40 times, and the DISTINCT you then need is a smell that says 'I joined to test existence.' Say the difference as a population claim — EXISTS asks 'does a match exist', JOIN asks 'how many matches are there' — and the follow-up question chooses the tool.",
      tag: "subqueries",
    },
    {
      id: "doordash-t16",
      q: "Build the weekday demand curve and the weekend split for Peak Pay planning. What are the STRFTIME('%w') traps?",
      a: "STRFTIME('%w', created_at) returns '0' through '6' as TEXT — and '0' is SUNDAY, not Monday, which is the first trap: the weekend test is IN ('0', '6') and it reads 24 of 103 orders versus 79 weekday. Second trap: the values are strings — IN (0, 6) with numerics matches nothing, because '0' = 0 is a type mismatch, not a comparison. Third: label the output — a leaderboard of bare weekday codes ships misread (Monday is '1'); CASE the codes into names in the same pass. The pivot itself is conditional counting: SUM(CASE WHEN STRFTIME('%w', …) IN ('0','6') THEN 1 ELSE 0 END) AS weekend_orders beside its weekday twin, branches summing back to COUNT(*).",
      tag: "dates",
    },
    {
      id: "doordash-t17",
      q: "Dark-store stock versus sold per SKU — where's the fan-out, and what does 'remaining' mean when the number goes negative?",
      a: "Stock lives on the product row, sold lives on order lines, so the join is products to order_items and the fan-out is the danger: one SKU on many lines means COUNT(*) counts lines, not units — the fold is SUM(oi.quantity). Remaining = stock − SUM(quantity): Noise-Canceling Headset reads 60 stocked, 46 sold, 14 remaining — the reorder signal — while Bluetooth Speaker Mini reads 210 stocked, 21 sold, 189 remaining — the slow tail an Instamart review flags for markdown or transfer. A negative remaining means oversold against shelf, a data-integrity incident, not a math curiosity. And the hygiene check rides along: every product on this db has sold at least once, so the never-ordered set is honestly empty — report the zero, don't invent demand.",
      tag: "joins",
    },
    {
      id: "doordash-t18",
      q: "Take rate is fees ÷ GMV. Why is AVG(per-order rate) the wrong fold, and what is the right one?",
      a: "Because it's an average of ratios instead of a ratio of sums: AVG(fee/total) weights a $4.99 snack order exactly as heavily as a $200 group cart, while SUM(fees) ÷ SUM(total) weights by money — the blended rate the finance partner actually banks. Whenever denominators vary, the two folds disagree, and the gap widens with basket variance — which delivery baskets have plenty of. The same rule governs kept demand: the marketplace's cancellation share is conditional sums over the PLACED whole, never the average of per-zone shares — small zones would outweigh big ones. Name it out loud: 'ratio of sums, weighted by the denominator' is the house fold for every rate on this board.",
      tag: "aggregation",
    },
    {
      id: "doordash-t19",
      q: "Why can't WHERE see a window function, and how do you stage around it when the ask is 'top three zones per month'?",
      a: "Because of the evaluation order: FROM, WHERE, GROUP BY, HAVING, SELECT — where the window layer paints — then ORDER BY. When WHERE runs, no window output exists yet, so RANK() in WHERE is a syntax error, not a style choice. The staging move is a CTE or derived table: the inner query folds per month and computes RANK() OVER (PARTITION BY month ORDER BY orders DESC), and the outer query filters rn <= 3. The same two-step carries LAG deltas, running sums, any window-shaped filter. It isn't ceremony — it's the grammar teaching you that windows are a presentation-layer computation over an already-folded set.",
      tag: "pipeline",
    },
    {
      id: "doordash-t20",
      q: "The promo pack needs the demand curve zero-filled — quiet months must print 0, not vanish. How do you build that?",
      a: "Aggregation only reports buckets that exist, so build the buckets first: a month spine (a recursive CTE walking 2024-01 through 2025-02, or a dimension table) LEFT JOINed to the facts, then COALESCE(SUM(total), 0) over the joined payload. The full-network curve on this db happens to have all 14 months populated — but break it by zone and the holes appear: LATAM placed no 2025 orders at all, so a per-zone curve without a spine silently hides the zone's quiet year. A missing row is a lie by omission in a promo deck: the stakeholder reads the chart as 'no data' at best and 'no demand' at worst — and only one of those is a decision. Spine, LEFT JOIN, COALESCE, and the reconciliation check that spine rows minus fact rows equals the empty count.",
      tag: "dates",
    },
    {
      id: "doordash-t21",
      q: "UNION, UNION ALL, EXCEPT, INTERSECT — give me the marketplace read for each.",
      a: "UNION ALL stacks without dedupe — the census branches and TOTAL rows, where every row belongs and a distinct pass would be pure cost with a side of row-deletion risk. UNION is the deduped union — right when two overlapping sources report the same entity and you want one row per thing. EXCEPT is set difference and the churn read: January's zone set EXCEPT February's answers 'who went quiet' — on this db it returns nothing, because all four zones delivered in both months, and the honest answer is the empty set. INTERSECT is the overlap — zones live in both windows. All four fold at column-shape grain, and they treat NULLs as equal members, which makes them safer than NOT IN for presence logic.",
      tag: "setops",
    },
    {
      id: "doordash-t22",
      q: "The scalar subquery's empty-inner contract — when does it bite in marketplace reporting?",
      a: "The contract is 0-or-1 rows, 1 column; zero rows yield NULL, and every comparison against NULL is UNKNOWN — so the report empties silently, no error, no warning. It bites the moment the inner fold's population can go empty: scope the network-basket baseline to a February window with no orders, or to a zone with no demand, and HAVING AVG(total) > (SELECT …) passes nothing while looking like a clean run. Guards are explicit: keep the baseline unfiltered when the definition says 'network', or COALESCE((SELECT …), 0) with a documented fallback. The correlated cousin re-runs per outer row and answers a different question — 'each zone vs the others' — at a different cost; knowing which one the business asked for is the whole answer.",
      tag: "subqueries",
    },
    {
      id: "doordash-t23",
      q: "A leaderboard must be reproducible across runs and refreshes. What determinism discipline do you apply before it ships?",
      a: "Total order first: every ORDER BY that feeds a ranking or a page boundary ends with a unique key — metric DESC, then id ASC — because ties otherwise resolve to the engine's sort mood and page two shuffles between refreshes. Then the tie policy as an owned decision: ROW_NUMBER when exactly N partners must appear (bonus pays N), RANK or DENSE_RANK when tied partners should share a rung — and the 'top-8 returns 9 rows' bug is that policy leaking, not a query defect. Finally the audit trail: the query that produced the board ships with the board, so the next analyst re-runs the definition rather than re-deriving it. Determinism isn't perfectionism — it's what makes a number survivable under 'how do you know?'",
      tag: "quality",
    },
    {
      id: "doordash-t24",
      q: "The commission schedule changed in March; the ask is February's take rate. How do you read history honestly?",
      a: "As-of joins with half-open validity intervals: JOIN rates r ON r.partner_id = o.partner_id AND r.valid_from <= o.created_at AND (r.valid_to > o.created_at OR r.valid_to IS NULL) — start inclusive, end exclusive, so each order instant matches exactly one schedule and adjacent changes never double-match. Joining the 'current' row fabricates history: March's rate would silently overwrite February's, and the take-rate trend becomes fiction with a straight face. The trap is joining on the entity key alone — the key picks the row SET, the interval picks the moment. And the population sentence rides on every as-of read: which schedule version, as of when, for which orders — stated in the metric name, not the Slack thread.",
      tag: "joins",
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
    {
      id: "doordash-mcq-11",
      prompt: "The zone census reads EU: 45 deliveries but only 8 distinct diners. Which pair of expressions produces both columns honestly — and what does the 45 ÷ 8 gap tell the supply team?",
      choices: [
        "COUNT(*) and COUNT(customer_id) — both count rows, so they always agree",
        "COUNT(*) counts delivery rows (45); COUNT(DISTINCT customer_id) folds repeat demand back to people (8) — the gap is order intensity per diner",
        "COUNT(DISTINCT customer_id) reads 45 because DISTINCT applies after the join fans out",
        "COUNT(*) reads 8 because GROUP BY region dedupes customers first",
      ],
      answer: 1,
      why: "COUNT(*) counts joined rows — one per delivery; COUNT(DISTINCT customer_id) collapses repeat demand back to people. 45 deliveries from 8 diners is a 5.6-orders-per-diner intensity signal — the number the supply team uses to plan rider posture for repeat-heavy zones versus new-user frontiers.",
      notes: [
        { choice: 2, why: "DISTINCT folds duplicates at the VALUE level: customer 1's five orders collapse to one value, which is exactly why the expression reads 8, not 45." },
        { choice: 3, why: "GROUP BY folds zones, not diners — one row per zone, and COUNT(*) inside it counts that zone's delivery rows. Deduping customers is the DISTINCT aggregate's job." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-12",
      prompt: "A teammate folds orders with `GROUP BY shipped_at` and gets 83 groups: 82 single-timestamp groups plus one crowd. What is the crowd?",
      choices: [
        "A join fan-out bug — dedupe it with DISTINCT",
        "The 21 orders with NULL shipped_at — GROUP BY keeps NULLs as one group of their own",
        "Cancelled orders — they group separately by business policy",
        "A timezone artifact — pre-dawn timestamps collapse into one bucket",
      ],
      answer: 1,
      why: "NULLs are legal GROUP BY keys: all 21 orders without a delivery timestamp (14 pending, 7 cancelled) fold into one NULL group. That crowd IS the in-flight-plus-lost picture — reading the group count as 'delivery days' is the misread this drill prevents.",
      notes: [
        { choice: 0, why: "No join here — a single-table GROUP BY cannot fan out. The extra group is data, not duplication." },
        { choice: 3, why: "Timezones don't create groups; NULL keys do. Check what the group's KEY actually is before theorizing." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-13",
      prompt: "Cancellation share by zone is cancelled ÷ PLACED. A teammate writes `WHERE status = 'cancelled'` and then `COUNT(*) / COUNT(*)`. What ships?",
      choices: [
        "The right shares — the filter isolates cancellations cleanly",
        "100% for every zone — the denominator shrank to the numerator's population",
        "0% everywhere — cancelled rows never survive the filter",
        "NULL — the division is degenerate",
      ],
      answer: 1,
      why: "Filter cancelled rows first and COUNT(*) counts ONLY cancelled orders in numerator and denominator — every zone reads 100%. The placed denominator must live in the same fold: SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) ÷ COUNT(*), with no WHERE on status anywhere.",
      notes: [
        { choice: 2, why: "The rows survive — that's the bug: they're ALL that survives. The filter doesn't delete cancellations; it deletes everything else." },
        { choice: 0, why: "A ratio needs its denominator from a DIFFERENT population than the numerator. Same-population division is always 1 — the filter made the metric tautological." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-14",
      prompt: "The demand tracker smooths order counts with `AVG(orders) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`. On the FIRST row of the month, how many days feed the average — and what does that mean for the trend line?",
      choices: [
        "Seven — the frame is always seven rows wide",
        "One — the frame truncates at the partition's start, so the early trend rides on thin data",
        "Six — the current row is never inside the frame",
        "The whole month — window frames ignore partition edges",
      ],
      answer: 1,
      why: "Frames truncate at the partition edge: day 1's '7-day' average is really a 1-day average, day 2's is 2-wide, and only day 7 onward is truly 7. The early trend line is thin-data theater — the honest deck annotates it or the honest analyst says so before the review.",
      notes: [
        { choice: 0, why: "That's the frame's MAXIMUM width, not its guarantee. Physical rows must exist; windows don't invent missing days." },
        { choice: 2, why: "CURRENT ROW is inside the frame — six preceding plus today makes seven when the history exists. Without history it's whatever remains." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-15",
      prompt: "The diner order stream needs a 'next order' column. Which function reads it — and what does the NEWEST order's row get?",
      choices: [
        "LAG(created_at) — and the newest order gets the oldest timestamp",
        "LEAD(created_at) — and the newest order gets NULL, because it has no next order yet",
        "LEAD(created_at) — and the newest order gets its own timestamp",
        "Both read forward; they differ only in sort direction",
      ],
      answer: 1,
      why: "LEAD peers one row AHEAD in the window order; the newest order has no successor, so its cell is honestly NULL. LAG would fill a column named 'next order' with history — the mislabel this drill prevents, and the NULL-end tells you which direction the window walked.",
      notes: [
        { choice: 0, why: "LAG walks backwards: under LAG it's the OLDEST order that gets NULL, not the newest. Direction and NULL-end are opposite pairs — check both." },
        { choice: 2, why: "Windows never self-reference — LEAD returns a NEIGHBOR or NULL, never the current row. A copy of created_at in that cell would be a different (broken) function." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-16",
      prompt: "'Diners with no orders in February' is written as `customers LEFT JOIN orders o ON o.customer_id = c.id WHERE o.created_at >= '2025-02-01' AND o.id IS NULL`. What returns?",
      choices: [
        "Exactly the February no-order diners",
        "Always empty — a kept row would need o.id NULL, but then o.created_at is NULL and fails the date filter",
        "All diners — the two predicates OR together in WHERE",
        "Only diners whose February orders were cancelled",
      ],
      answer: 1,
      why: "In the LEFT JOIN's NULL payload, o.created_at is NULL too; NULL >= '2025-02-01' is UNKNOWN, so every candidate row dies and the report ships empty no matter the data. The window filter belongs in ON — o.customer_id = c.id AND o.created_at >= '2025-02-01' — with only o.id IS NULL left in WHERE.",
      notes: [
        { choice: 0, why: "It can't: the date predicate tests the right table in WHERE — exactly the placement that deletes the NULL rows the anti-join feeds on." },
        { choice: 3, why: "Cancelled February orders are still February orders — and they'd have o.id NOT NULL, failing the IS NULL half anyway. The bug is upstream of status entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-17",
      prompt: "The cost memo stacks two fixed-cost category rows plus a labelled TOTAL row. Why does the house style say `UNION ALL` here and never plain `UNION`?",
      choices: [
        "UNION dedupes across branches and could delete a detail row that happens to match the TOTAL row's values",
        "They're identical — UNION just reads better in a memo",
        "UNION ALL is faster because it skips sorting — speed is the only concern",
        "UNION cannot stack queries with different column counts",
      ],
      answer: 0,
      why: "UNION applies DISTINCT across the stacked result sets; if a detail row's values ever matched the TOTAL row's, it would be silently deleted. In a stack where every row belongs and the grains differ, UNION ALL is the honest concatenation — and the dedupe pass it skips is pure cost.",
      notes: [
        { choice: 1, why: "They differ semantically, not just stylistically — the dedupe is a real transformation that can eat legitimate rows." },
        { choice: 2, why: "The speed gain is real but secondary; the correctness argument — never dedupe a stack of unlike grains — is what the reviewer wants to hear." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-18",
      prompt: "The one-pass zone fold prints EU: delivered 24, shipped 12, pending 6, cancelled 3, placed 45. What check just passed — and what breaks it?",
      choices: [
        "A rounding check — totals were verified to be integers",
        "The reconcile-to-placed check — branch totals must add back to COUNT(*); any filter applied to some branches but not COUNT(*) breaks it",
        "A primary-key check on the zone column",
        "An index-usage check — the fold must be one scan",
      ],
      answer: 1,
      why: "Branch totals plus in-transit must reconcile to placed: 24 + 12 + 6 + 3 = 45. The check breaks the moment a WHERE sneaks in front of some branches — say 'completed' gains shipped_at IS NOT NULL while COUNT(*) keeps all rows — and the add-back silently fails by the size of the excluded population.",
      notes: [
        { choice: 0, why: "Nothing here rounds — counts are integers by construction. The check is additive: populations, not precision." },
        { choice: 2, why: "Keys don't reconcile; populations do. The identity is about the fold's rows, not the group label's uniqueness." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-19",
      prompt: "Peak Pay bonuses carry start and end timestamps. Which join finds the bonus that was LIVE when each order was placed?",
      choices: [
        "JOIN bonuses b ON b.is_current = 1 — attach today's active bonus to every order",
        "JOIN bonuses b ON b.start <= o.created_at AND b.end > o.created_at — a half-open as-of interval",
        "JOIN bonuses b ON STRFTIME('%m', b.start) = STRFTIME('%m', o.created_at) — same-month match",
        "LEFT JOIN bonuses b ON b.end IS NULL — only bonuses with no end date",
      ],
      answer: 1,
      why: "The as-of interval is half-open — start inclusive, end exclusive — so exactly one live bonus matches each order instant and adjacent bonuses never double-match. Joining 'the current bonus' fabricates history: every historical order reads today's promo, and last quarter's Peak Pay analysis becomes fiction.",
      notes: [
        { choice: 2, why: "Month-grain matching double-matches orders inside overlap months and misses boundary orders — the honest shape is an instant interval, not a calendar bucket." },
        { choice: 3, why: "b.end IS NULL finds open-ended bonuses, not live-at-order-time ones — and the bonus that WAS live in February is precisely one that has since ended." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-20",
      prompt: "`GROUP_CONCAT(DISTINCT status)` per zone prints EU 'pending,shipped,cancelled,delivered' but APAC 'delivered,shipped,pending,cancelled'. What do you tell the stakeholder who wants the strings 'sorted'?",
      choices: [
        "Add ORDER BY inside GROUP_CONCAT — SQL guarantees per-zone alphabetical order",
        "GROUP_CONCAT(DISTINCT …) has no guaranteed order — the string is a payload proving which states EXIST, not their sequence; sort outside SQL or don't parse it",
        "The zones genuinely differ — APAC is missing a status",
        "CAST the statuses to INTEGER first — numeric sorting fixes the fold",
      ],
      answer: 1,
      why: "SQLite's GROUP_CONCAT concatenates in whatever order rows visit the fold; DISTINCT does not sort. EU and APAC hold the SAME four statuses in different walk orders — the column is set evidence, not sequence. Anything order-sensitive happens in the app layer, and the walkthrough says so.",
      notes: [
        { choice: 0, why: "SQLite has no ORDER BY inside GROUP_CONCAT — and even where a dialect supports it, building logic on concat order is the smell under review." },
        { choice: 2, why: "Compare as sets: both zones show all four statuses. The difference is walk order, which carries zero business meaning." },
      ],
      difficulty: "hard",
    },
    {
      id: "doordash-mcq-21",
      prompt: "Every delivery row needs its Dasher's running delivery count for the day — WITHOUT collapsing rows. Which shape keeps one row per delivery?",
      choices: [
        "GROUP BY dasher_id, day — fold, then join back to deliveries",
        "COUNT(*) OVER (PARTITION BY dasher_id, day) — the window paints the fold onto every row and keeps the grain",
        "SELECT DISTINCT dasher_id, day — dedupe to one row per Dasher-day",
        "A self-join of orders to orders counted with DISTINCT",
      ],
      answer: 1,
      why: "COUNT(*) OVER (PARTITION BY dasher_id, day) computes the fold per partition but attaches it to every row — 103 deliveries in, 103 rows out, each carrying its count as a passenger column. GROUP BY collapses to one row per Dasher-day and loses the delivery rows the pipeline still needs.",
      notes: [
        { choice: 0, why: "Fold-and-join-back works but is two moves and a join key to keep consistent; the window is one move — and the interview point is knowing windows keep rows." },
        { choice: 2, why: "DISTINCT dedupes output rows; it computes no count at all. You'd ship a list of Dasher-days with nothing attached." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-22",
      prompt: "The weekday demand pivot prints six columns — but the Sunday bucket VANISHES on weeks with no Sunday orders. Why, and what's the honest fix?",
      choices: [
        "A STRFTIME bug — '%w' sometimes skips '0'",
        "GROUP BY only folds buckets that exist; build the 7-row weekday spine first and LEFT JOIN the facts onto it, then COALESCE to 0",
        "Wrap the count in COALESCE(COUNT(*), 0) — that restores missing groups",
        "Use HAVING COUNT(*) >= 0 to force every bucket to print",
      ],
      answer: 1,
      why: "Aggregation can only report what arrives: no Sunday rows means no Sunday group, and nothing inside the fold can resurrect it. The fix is a bucket spine — a weekday dimension (or recursive CTE) LEFT JOINed to the facts so the missing bucket survives with a printed 0 — and COALESCE handles the NULL payload columns around it.",
      notes: [
        { choice: 2, why: "COALESCE acts on values in EXISTING rows; a missing group has no row to coalesce. The spine must exist before the fold." },
        { choice: 3, why: "HAVING filters groups after the fold — it can't create them. A zero-row bucket never reached HAVING at all." },
      ],
      difficulty: "hard",
    },
    {
      id: "doordash-mcq-23",
      prompt: "`SELECT DISTINCT region FROM customers` on this db — how many rows come back, and what does the query actually assert?",
      choices: [
        "103 — one per order",
        "16 — one per customer",
        "4 — one per distinct delivery zone; the query asserts the zone VOCABULARY, not volume",
        "1 — DISTINCT collapses everything to a single row",
      ],
      answer: 2,
      why: "DISTINCT returns the distinct VALUES of the column — EU, APAC, US, LATAM — regardless of whether a zone holds 45 orders or 2. It asserts the dimension's vocabulary, which is why it's the hygiene check for 'did a new zone code just appear in the feed'.",
      notes: [
        { choice: 1, why: "16 is the customer count. DISTINCT region doesn't count customers — it dedupes the region values themselves." },
        { choice: 0, why: "Orders aren't even in the query. And DISTINCT works on values, never on table volume." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-24",
      prompt: "Merchant names arrive from a vendor feed as 'Grill House ' — trailing space — and the join to orders matches nothing. Which predicate finds EVERY padded row before the join breaks?",
      choices: [
        "WHERE name LIKE 'Grill%'",
        "WHERE name != TRIM(name) — the row disagrees with its own trimmed self",
        "WHERE LENGTH(name) > 10",
        "WHERE name IS NULL",
      ],
      answer: 1,
      why: "Comparing a value to its own TRIM exposes all padding in one predicate — 'Grill House ' != 'Grill House' is TRUE exactly where the feed is dirty. The durable fix cleans the key once (or joins on TRIM(name) on BOTH sides); re-typing the padded literal into the query is how the bug ships again next feed.",
      notes: [
        { choice: 0, why: "That finds one specific merchant and still misses ' Grill House' or a double space. The self-comparison catches the whole class." },
        { choice: 2, why: "Length thresholds flag honest long names and miss short padded ones. 'Dirty' has a definition: the value differs from its cleaned self." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-25",
      prompt: "The recent-orders rail pages through `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at)` — and page 2 shows different orders on every refresh. Two orders share created_at. Diagnosis and fix?",
      choices: [
        "The window is broken — replace it with LIMIT/OFFSET",
        "Non-deterministic tie-break: equal created_at gives ROW_NUMBER no stable order — append a unique key (ORDER BY created_at, id DESC) so numbering is reproducible",
        "NULLs in created_at — COALESCE them to now()",
        "The partition is wrong — partition by order id instead",
      ],
      answer: 1,
      why: "ROW_NUMBER must number ties SOMEHOW, and without a tie-breaker the engine's choice isn't stable across plans — page boundaries shuffle between refreshes. A unique key appended to the window ORDER BY makes the total order deterministic, which is the difference between pagination and roulette.",
      notes: [
        { choice: 0, why: "LIMIT/OFFSET over the same non-deterministic sort shuffles identically — the bug is the ORDER, not the window." },
        { choice: 2, why: "The colliding rows aren't NULL; they're EQUAL. Coalescing changes nothing — a tie needs a third distinguishing key, not a default value." },
      ],
      difficulty: "hard",
    },
    {
      id: "doordash-mcq-26",
      prompt: "Which two forms count cancelled orders per zone in one pass — and why does the query budget accept both?",
      choices: [
        "COUNT(status) and SUM(status)",
        "COUNT(*) FILTER (WHERE status = 'cancelled') and SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) — same 0/1 flag, same fold, one scan",
        "COUNT(cancelled) and AVG(status)",
        "MAX(status = 'cancelled') and MIN(status)",
      ],
      answer: 1,
      why: "Both build the same 0/1 flag over the folded rows and add it up — FILTER is the dedicated syntax, SUM(CASE) the portable twin. Both live INSIDE the aggregate so the placed denominator COUNT(*) stays intact — which is the whole point of one-pass conditional counting under a query budget.",
      notes: [
        { choice: 0, why: "COUNT(status) counts non-NULL statuses — all of them — and SUM over text is not a count. The flag must be CONSTRUCTED, not borrowed from the column." },
        { choice: 3, why: "Boolean MIN/MAX return extremes, not occurrences. Conditional counting needs the 0/1 flag summed over the fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "doordash-mcq-27",
      prompt: "`SELECT region, AVG(total) AS zone_basket, (SELECT AVG(total) FROM orders) AS network_basket … GROUP BY region` — every row's network_basket reads 338.19. Bug?",
      choices: [
        "Yes — the subquery should vary by region; add a GROUP BY to it",
        "No — it's UNCORRELATED: it folds the whole table once and every outer row reads the same scalar; a shared baseline column is the point",
        "Yes — scalar subqueries can't live in SELECT; move it to HAVING",
        "No coincidence — it equals every zone average by definition",
      ],
      answer: 1,
      why: "An uncorrelated scalar subquery executes once — 34833.28 ÷ 103 = 338.19 — and every zone row prints that constant beside its own fold. That's the desired shape: zone basket against network basket on one row, no join needed. It's only a bug if the ask was 'each zone vs the OTHERS' average' — that's a correlated fold.",
      notes: [
        { choice: 0, why: "Scoping the baseline per region answers a different question — and destroys the network baseline the pricing brief explicitly requested." },
        { choice: 2, why: "Scalar subqueries are legal — and standard — in SELECT; that's where baseline columns live. HAVING is for filtering groups, not displaying constants." },
      ],
      difficulty: "hard",
    },
    {
      id: "doordash-mcq-28",
      prompt: "The Rush window reads `BETWEEN '18:00' AND '21:00'` and the Night window starts at '21:00'. An order at exactly 21:00:00 shows in BOTH packs. What happened?",
      choices: [
        "Timezone drift between the two queries",
        "BETWEEN is inclusive on BOTH ends — the boundary instant belongs to both intervals; windows must be half-open so each instant lands in exactly one pack",
        "The Night window should start at 21:01",
        "Nothing — boundary double-counting is standard practice",
      ],
      answer: 1,
      why: "BETWEEN includes both endpoints, so 21:00:00 satisfies >= '18:00' AND <= '21:00' and equally >= '21:00' — every seam double-counts. Half-open windows (start inclusive, end exclusive) tile the day without overlap or gap, which is what makes Rush + Night + off-peak reconcile to the day's placed total.",
      notes: [
        { choice: 2, why: "Starting at 21:01 carves a one-minute gap — orders landing in 21:00:00–21:01:00 vanish from both packs. Overlap became loss, same crime, opposite sign." },
        { choice: 3, why: "The reconciliation check catches it immediately: the packs sum to placed plus one row per seam. Double-counts are incidents, not conventions." },
      ],
      difficulty: "hard",
    },
    {
      id: "doordash-mcq-29",
      prompt: "`AVG(ROUND(latency, 1))` reads 3.0 on the board; `ROUND(AVG(latency), 1)` reads 2.98. Which is honest — and why do they disagree?",
      choices: [
        "Both — rounding is cosmetic and the gap is noise",
        "ROUND after the aggregate: rounding each diff before averaging bends the mean toward the rounded grid; aggregate over full precision, round the OUTPUT once",
        "ROUND before the aggregate — per-row rounding is more accurate",
        "Neither — CAST to INTEGER is the honest form for boards",
      ],
      answer: 1,
      why: "Per-row rounding quantizes the inputs: diffs of 2.96 and 3.04 both become 3.0, and the average of rounded values (3.0) is no longer the average of the latencies (2.98). Precision lost inside the fold can't be recovered outside it — aggregate raw, round once at the display edge.",
      notes: [
        { choice: 0, why: "The 0.02 gap is small today and structural forever: the bias direction depends on the data and compounds in every downstream percentile." },
        { choice: 2, why: "INTEGER casting destroys the fractional day entirely — a '2.98-day average' computed over whole numbers is a different metric wearing the same name." },
      ],
      difficulty: "medium",
    },
    {
      id: "doordash-mcq-30",
      prompt: "Which shape isolates zones that delivered in January but vanished in February — and what does the EMPTY result on this db tell you?",
      choices: [
        "INTERSECT of the two months' zone lists — overlap means churn",
        "January's zone set EXCEPT February's — zones present in January with no February presence; on this db it returns nothing, because all four zones delivered in both months",
        "A LEFT JOIN of the two lists on region WHERE the February side IS NULL — illegal across months",
        "GROUP BY region HAVING COUNT(*) = 0 for February — folds materialize absent groups",
      ],
      answer: 1,
      why: "EXCEPT is set difference: January's zone set minus February's — no joins, no NULL traps. On this db the result is empty because EU, APAC, US and LATAM all delivered in both months, and the honest analyst reports the empty set rather than inventing churn. The LEFT JOIN + IS NULL twin is equally legal and equally empty here.",
      notes: [
        { choice: 0, why: "INTERSECT answers the opposite question — zones present in BOTH months. Churn is a difference, not an overlap." },
        { choice: 3, why: "GROUP BY folds existing rows only; a zone with no February orders never forms a group. Absence needs a set difference or an anti-join." },
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
    {
      id: "cs-doordash-3",
      tier: "medium",
      topic: "t4",
      universe: "growth",
      title: "The monthly demand pulse",
      brief:
        "DoorDash-flavored brief on the storefront db: the growth board opens with the demand pulse — 'show me the first six months of the curve: deliveries, distinct diners, and demand value per month, so we can see whether the launch story holds.' Definitions fixed: month = STRFTIME('%Y-%m') on the order timestamp (never '%m' — merged years are fiction), diners = COUNT(DISTINCT customer_id) because repeat demand must fold back to people, value = SUM(total) rounded to two decimals. Probed on the db: 2024-01 opens at 8 deliveries / 5 diners / 3731.97, Feb peaks at 9 / 5 / 3609.64, and the sixth month 2024-06 lands at 6 / 5 / 2047.43.",
      ask: "Return month, deliveries, diners and demand value for the first six months of the curve, chronological order.",
      template:
        "SELECT STRFTIME({1}, created_at) AS month,\n       COUNT(*) AS deliveries,\n       {2}(DISTINCT customer_id) AS diners,\n       ROUND(SUM(total), 2) AS value\nFROM orders\nGROUP BY month\nORDER BY month {3}\nLIMIT {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month bucket",
          why: "'%Y-%m' buckets year-plus-month — '2024-01'. '%m' alone merges January 2024 into January 2025 and the curve becomes fiction; '%Y' collapses everything into two rows.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the diner counter",
          why: "COUNT(DISTINCT customer_id) folds repeat demand back to people — 5 diners behind January's 8 deliveries. SUM(DISTINCT customer_id) returns the sum of diner ids, a meaningless number that changes when a diner re-registers.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A demand pulse reads chronologically — 2024-01 on top so each month compares against the row above. DESC opens the board on 2025-02 and tells the launch story backwards.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the opener cut",
          why: "LIMIT 6 keeps the opening run the board asked for — six rows ending on 2024-06's 6 deliveries and 2047.43. The figure 6 is also the June delivery count sitting in the output, and the fade from 9 (Feb) to 6 (Jun) is the row the narrative quotes.",
        },
      ],
      distractors: ["'%m'", "'%Y'", "SUM", "DESC", "9"],
      walkthrough:
        "A pulse is a bucket, two counts at two grains, and a cut. STRFTIME('%Y-%m', created_at) folds 103 orders into 14 clean month buckets; COUNT(*) counts deliveries while COUNT(DISTINCT customer_id) folds each month's repeat demand back to diners — January's 8 deliveries came from 5 diners, March's 8 from 7. ROUND(SUM(total), 2) carries the money at two decimals: 3731.97 opening, 2047.43 by June. ORDER BY month ASC keeps the timeline honest and LIMIT 6 performs the board's cut — the launch run, not the whole curve. The traps are the Swiggy-cousin classics: '%m' merges 2024-01 into 2025-01 and the curve lies by omission; '%Y' collapses to two rows; SUM in the diner slot adds ids instead of counting people; DESC hands the board 2025 first; LIMIT 9 dilutes the cut. Grain per column, direction per story, cut per ask.",
    },
    {
      id: "cs-doordash-4",
      tier: "medium",
      topic: "s7",
      universe: "growth",
      title: "The weekend-surge pivot",
      brief:
        "DoorDash-flavored brief on the storefront db: Peak Pay planning needs the weekend-surge split per zone — 'how much demand lands Saturday-plus-Sunday versus the weekday base? That ratio is where the bonuses go.' Definition fixed: weekend = STRFTIME('%w') of '0' (Sunday) or '6' (Saturday) — SQLite's '%w' counts Sunday as 0, Monday as 1; both branches fold in one pass so the branches add back to placed. Probed on the db: 24 of 103 orders are weekend demand; by zone EU runs 11 weekend / 34 weekday (45 placed), APAC 9 / 28 (37), US 4 / 15 (19), LATAM 0 / 2 (2). EU carries the biggest absolute weekend load.",
      ask: "Return one row per zone: zone, weekend_orders, weekday_orders, placed — biggest weekend load first.",
      template:
        "SELECT c.region AS zone,\n       SUM(CASE WHEN STRFTIME('%w', o.created_at) {1} THEN 1 ELSE 0 END) AS weekend_orders,\n       SUM(CASE WHEN STRFTIME('%w', o.created_at) {2} THEN 1 ELSE 0 END) AS weekday_orders,\n       COUNT(*) AS placed\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY weekend_orders {3};",
      slots: [
        {
          answer: "IN ('0','6')",
          kind: "keyword",
          label: "the weekend test",
          why: "IN ('0','6') catches Sunday and Saturday — 24 orders network-wide, 11 in EU. The literal must be TEXT ('0','6'): IN (0,6) numerics never matches the string codes, and the branch silently reads zero.",
        },
        {
          answer: "NOT IN ('0','6')",
          kind: "keyword",
          label: "the weekday twin",
          why: "NOT IN ('0','6') is the complement — 79 weekday orders, 34 in EU — and together the branches reconcile to placed: 11 + 34 = 45. '= 5' (Friday only) undercounts the base and the surge ratio doubles for no reason.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-load order",
          why: "Peak Pay goes where the weekend load is: DESC puts EU's 11 on top. ASC would open the plan on LATAM's zero weekend orders — a zone with no surge to boost.",
        },
      ],
      distractors: ["= '0'", "IN ('1','5')", "ASC"],
      walkthrough:
        "One scan, two flags, one reconciliation. STRFTIME('%w', created_at) stamps each order '0'–'6' with Sunday as '0'; the CASE pairs build 0/1 flags inside two SUMs so the fold carries both branches in one pass — weekend 11/9/4/0 and weekday 34/28/15/2 per zone, and every row's branches add back to placed (EU 11 + 34 = 45), the census check that keeps the pivot honest. ORDER BY weekend_orders DESC aims the plan at EU's 11-order surge. The distractors are the real report bugs: '= '0'' narrows the weekend to Sunday only (16 network-wide) and the surge halves; IN ('1','5') reports Monday-plus-Friday as the weekend — 38 orders of fiction; ASC buries the actionable zone under LATAM's zero. And the quiet trap the chips can't show: numeric IN (0,6) matches nothing because '%w' returns text — the branch reads zero and the plan funds nothing.",
    },
    {
      id: "cs-doordash-5",
      tier: "easy",
      topic: "t3",
      universe: "month-close",
      title: "The February completion audit",
      brief:
        "Month-close brief, in-world: the controller needs the February slice of the delivery promise — 'which zones actually COMPLETED deliveries inside the February window, and what latency did they carry? Placed-in-February is a different population; I audit completions.' Definition fixed: completed means shipped_at falls inside the half-open window [2025-02-01, 2025-03-01) — half-open so the March 1 boundary never double-books — and latency = JULIANDAY(shipped_at) − JULIANDAY(created_at) over completed rows only. Probed on the db: exactly 5 deliveries completed in February (EU 3 at 2.67 days avg, APAC 2 at 2.5); January closed 4; and 13 orders placed in 2025, 3 of which still have no delivery timestamp.",
      ask: "Return zone, completed count, and avg latency in days (2 decimals) for deliveries completed inside the February window — most completions first.",
      template:
        "SELECT c.region AS zone,\n       COUNT(*) AS completed,\n       ROUND(AVG(JULIANDAY(o.{1}) - JULIANDAY(o.created_at)), 2) AS avg_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at >= {2} AND o.shipped_at < {3}\nGROUP BY c.region\nORDER BY completed DESC;",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the completion timestamp",
          why: "The audit is over COMPLETIONS, so the window slices shipped_at — the moment the delivery actually happened. Slicing created_at answers 'what was PLACED in February' (a different population) and julianday(status) is NULL everywhere — an empty board.",
        },
        {
          answer: "'2025-02-01'",
          kind: "keyword",
          label: "the window floor",
          why: "The floor is inclusive: '2025-02-01' opens the February window. '2025-01-01' widens it to January+February and the audit reads 9 completions instead of 5.",
        },
        {
          answer: "'2025-03-01'",
          kind: "keyword",
          label: "the half-open ceiling",
          why: "The ceiling is EXCLUSIVE — '< '2025-03-01'' — so March 1 deliveries stay in March and adjacent windows tile without overlap. Using '<= '2025-02-01'' collapses the window to nothing and the board ships empty.",
        },
      ],
      distractors: ["created_at", "status", "'2025-01-01'", "'2025-02-01'"],
      walkthrough:
        "A close is a population, a window, and a fold. The join attaches each order to its diner's zone; WHERE slices the COMPLETION timestamp over the half-open February window — >= '2025-02-01' AND < '2025-03-01' — keeping exactly 5 completed deliveries (EU 3, APAC 2; US and LATAM completed none, and their absence is a finding, not an error). AVG over the julianday diff runs on full precision and rounds once: 2.67 and 2.5 — against the network's 2.98 across all 82 completions. ORDER BY completed DESC puts the working zone on top. The traps are the month-close classics: slicing created_at audits placements, not completions; '2025-01-01' silently merges January's 4 into the read; a closed ceiling (<=) either empties the board or double-books the seam. Half-open windows and a named population are what make the number survive the controller's 'how do you know?'",
    },
    {
      id: "cs-doordash-6",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The per-zone pace pack",
      brief:
        "Month-close brief, in-world: the ops lead wants each zone's 2025 pace beside its own history — 'per zone, month by month through 2025: deliveries this month, and the month before, so each zone lead sees their own slope, not the network's.' Definition fixed: stage the zone-month fold in a CTE, then walk it with a window PARTITIONED BY zone so each zone's baseline is its own; the 2025 slice comes from a half-open month filter. Probed on the db: APAC ran 2 → 2, EU 3 → 4, US 1 → 1 across 2025-01 → 2025-02 (LATAM placed no 2025 orders at all); the first row of every zone's window is honestly NULL — the window is computed over the FILTERED rows, so December's baseline never enters the 2025 pack.",
      ask: "Return zone, month, deliveries, and the PRIOR month's deliveries within each zone, for months from 2025-01 onward.",
      template:
        "WITH zm AS (\n  SELECT c.region AS zone,\n         STRFTIME('%Y-%m', o.created_at) AS month,\n         COUNT(*) AS deliveries\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region, month\n)\nSELECT zone, month, deliveries,\n       {1}(deliveries) OVER ({2} BY zone ORDER BY month) AS prev_deliveries\nFROM zm\nWHERE month >= {3}\nORDER BY zone, month;",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(deliveries) walks each zone's window backwards one row — EU's 2025-02 row reads 3, January's own count. LEAD would read FORWARD and hand February the next month's count (NULL here) — the future re-labeled as history.",
        },
        {
          answer: "PARTITION",
          kind: "keyword",
          label: "the per-zone boundary",
          why: "PARTITION BY zone restarts the window per zone so each lead sees their OWN slope — APAC's 2 → 2, US's 1 → 1. ORDER BY alone would slide the baseline across zone boundaries: US's February would read EU's January count.",
        },
        {
          answer: "'2025-01'",
          kind: "keyword",
          label: "the 2025 slice",
          why: "month >= '2025-01' keeps the six 2025 zone-month rows. '2024-01' drags the whole 14-month history into the pack — and fills every prev_deliveries with real baselines, hiding the filtered-window NULL the ops lead must understand.",
        },
      ],
      distractors: ["LEAD", "SUM", "'2024-01'"],
      walkthrough:
        "Two stages, one window, one honest NULL. The CTE folds 103 orders into zone-month buckets — the grain the pack reads; the outer query walks each zone's slice with LAG(deliveries) OVER (PARTITION BY zone ORDER BY month): APAC 2 → 2, EU 3 → 4 (the only zone with a positive slope), US 1 → 1. WHERE month >= '2025-01' filters BEFORE the window paints, which is why every zone's first 2025 row reads NULL — the window computes over the FILTERED rows, so December's baseline never enters the pack; the ops lead reads 'no in-pack baseline', not 'zero demand'. LEAD would read the future; SUM would pile a running total into prev; '2024-01' fills the column with genuine 2024 baselines and buries the lesson the pack exists to teach. Windows over filtered sets: the NULL is the definition, and the walkthrough is where the pack says so.",
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
    { slug: "last-person-to-fit-in-the-bus", why: "Running-sum capacity at row grain: order the demand, accumulate the weight, cut at the limit — the batch-loading twin of the elevator drill, and the Dasher-bag question verbatim." },
    { slug: "game-play-analysis-iii", why: "Cumulative totals per player with a running SUM window — Rush-hour coverage math: how much demand the online fleet has absorbed so far, updated row by row." },
    { slug: "the-latest-login-in-2020", why: "Argmax inside a bounded window — the most recent event per diner within a fixed year: the same 'latest before cutoff' shape the month-close completion audit uses." },
    { slug: "email-engagement-funnel", why: "Open-to-action funnel rates with NULL-tolerant shares — the placed-to-delivered funnel in another costume, denominators decided before the division." },
    { slug: "ads-funnel", why: "Three-step conditional funnel pivoted into one row per unit — the Dasher-logistics funnel (placed → assigned → delivered) as a column fold." },
    { slug: "product-sales-analysis-i", why: "Units and revenue folded per product from line items — the line-grain money, order-grain count discipline the partner GMV chain drills." },
    { slug: "queries-quality-and-percentage", why: "Two ratios in one query with rounding at the edge — the on-time-share and cancellation-share math, 100.0 before the division." },
    { slug: "daily-leads-and-partners", why: "The two-grain daily census — DISTINCT on one column, COUNT(*) on another — the deliveries-AND-diners shape every zone review opens with." },
    { slug: "find-followers-count", why: "Distinct-count folds per entity — repeat demand collapsed to audience size, the intensity signal behind rider-supply planning." },
    { slug: "article-views-ii", why: "Argmax with a tie at the top — two readers tied on views; the leaderboard tie policy DoorDash makes you own." },
    { slug: "find-stores-with-inventory-imbalance", why: "Per-entity conditional censuses compared across stores — the one-pass branch-fold drill with reconciliation to the placed whole." },
    { slug: "total-traveled-distance", why: "Window enrichment that keeps every row — per-row state painted by a window function, the PARTITION-keeps-rows lesson in miniature." },
    { slug: "monthly-transactions-i", why: "Month buckets with a conditional count alongside — '%Y-%m' grammar plus the cancelled column folded inside the same GROUP BY." },
    { slug: "unique-orders-and-customers-per-month", why: "Orders AND distinct diners per month in one fold — the two-grain monthly pulse, each count at its own grain." },
    { slug: "customers-who-never-order", why: "The anti-join warm-up: diners with zero orders via LEFT JOIN + IS NULL — on this db the honest answer is an empty set, and saying so IS the drill." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest N per group via ROW_NUMBER with a deterministic tie-break — the recent-orders rail, reproducible across refreshes." },
  ],
};
