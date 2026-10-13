// Wayfair — kit 10 of the E-commerce & Marketplace domain (Batch K, wave 6).
// Home-goods e-commerce, pure drop-ship edition: the platform owns little
// inventory, suppliers hold the stock, casts (product pages) are the shelf,
// and big-ticket delivery is where the margin lives or dies. Pool provenance:
// 0 tagged LC rows — theme-curated: every problem and topic slug below is
// curated from scripts/company-pools.md's theme menu to mirror workflows
// Wayfair screens are known to probe (supplier scorecards, drop-ship chain
// joins, dormant-vendor anti-joins, big-ticket bands, cast hygiene,
// settlement cents). Case studies run on the storefront db with probed
// figures from scripts/company-facts.md — mapped honestly as suppliers=
// drop-ship vendors, products=casts (catalog SKUs), orders=customer orders,
// order_items=units per order, shipped_at=carrier handoff. Extended probe
// receipts (supplier units 82/109/77/51/99/80; big-ticket bands >=500: 25
// orders with 9 delivered, 200-499.99: 40/22, <200: 38/21) live in the worklog.

import type { CompanyKit } from "../types";

export const wayfairKit: CompanyKit = {
  id: "wayfair",
  domainId: "ecom",
  name: "Wayfair",
  tagline: "Home goods e-commerce: casts, suppliers, logistics",
  accent: "text-indigo-400",

  brief: [
    "**Wayfair** is the pure-drop-ship home-goods platform: the website is the shelf, **suppliers hold the inventory**, and the platform's job is demand, casting and logistics. Every product page — a *cast* in the house vocabulary — is a promise a vendor fulfills, which means the analytics grain stack runs vendor-first: vendors hold casts, casts carry price, orders fan into unit lines, lines trace back to exactly one vendor. On this kit's proxy db the census reads **6 vendors behind 16 casts**, **103 orders** fanning into 251 unit lines, and $34,833.28 of demand at an average ticket of **$338.19** — a db small enough to hold in your head, shaped exactly like the supplier read you'd run in the Boston office.",
    "Concentration is the number the supplier review opens with: the top vendor books **11130.25** — **32%** of platform demand — and the top two clear 58% together, so one vendor's hiccup is a platform event. Big-ticket is the other obsession: **25 of 103 orders** sit at 500-or-more total and only **9 of those have delivered**, which is the drop-ship delivery risk in one sentence — *the highest-value promises are the ones still in flight*. The fulfillment clock reads `shipped_at` → non-NULL on **82 of 103 orders** (52 delivered + 30 shipped), averaging **2.98 days**, range 2-to-4 — and the 14 pending orders are exactly where a vendor-sourcing delay shows up first.",
    "Interview style is supplier-flavored and chain-literate. Screens open with a warm-up two-table join (orders to customers), escalate into the **drop-ship chain** — orders → unit lines → casts → vendors, three joins, one honest fold — then land on either a vendor scorecard (revenue, units, rating, share of platform) or a threshold census with the NULL trap attached ('vendors with no sales this quarter' is the classic, and `NOT IN` with a NULL in the subquery is the answer that ends the round). Follow-ups are spoken: 'is that revenue per cast or per vendor?', 'does a cancelled order count in your placed base?', 'what does your rating gate exclude?'",
    "Preparation strategy: Wayfair carries **zero tagged problems** in this app's registry, so the kit is fully theme-curated — sixteen problems and ten topics drawn from the band to mirror known Wayfair screen themes: vendor scorecard folds, three-table drop-ship chains, dormant-vendor anti-joins, big-ticket banding, cast hygiene, settlement math on the cents tables. The two case studies run on the live db: one rebuilds the **vendor scorecard** the supplier review opens with (chain join, rating gate, revenue-ranked), the other rebuilds the **big-ticket band census** merch and logistics argue over. Both are mechanically audited against the probed figures.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the supplier board, and the first query is a reconciliation: do the unit-line folds tie to order totals, does the status census reconcile to `COUNT(*)` — **52 delivered, 30 shipped, 14 pending, 7 cancelled** on the current fold. The concentration tile is next: the top vendor at **32%** of demand (11130.25), the top two at 58% — and any vendor above a third is a single point of failure the review will name. The pending pile gets its first read of the day: 14 orders unfulfilled, and the analyst's eye goes to which vendors they trace to, because *in drop-ship, a pending order is usually a vendor story, not a logistics one*.",
    "**11:00 —** Midday is the deep-dive block. The vendor scorecard lands first: a three-table chain (orders → unit lines → casts → vendors) folded to revenue, units and rating per vendor — **Nordic Gadgets AB 11130.25 over 82 units at 4.6**, Midwest Hardware 9294.93 over 109 units at 4.4 — and the fold's grain is the interview: units ride the vendor's lines, revenue rides quantity × unit_price, and ratings come from the vendor table, not from a join that would fan them out. The big-ticket read follows: **25 orders at 500+, 9 delivered** — the in-flight risk table logistics wants broken out by band. Every deep-dive ends with the definition written beside the number: *vendor revenue = SUM(quantity × unit_price) through the cast chain, cancelled orders included in placed, excluded from delivered*.",
    "**14:00 —** The afternoon tilts to stakeholder cycles. Merchandising wants the cast read: which casts carry their vendors — the per-cast revenue fold the catalog review opens with — and which casts sit stale at the bottom of the price ladder (**199.99** is the ceiling; nothing above it exists, so any 'premium band' query that returns rows has a threshold bug). Finance wants the settlement hygiene pass: invoices and payments store INTEGER cents, the dollar read is `amount_cents / 100.0`, and the known anomalies are named — a void invoice carrying a payment (id 11, 925 dollars), a paid invoice with zero payment rows (id 28), and one partial settlement (4000 of 6148 on invoice 25). Each deliverable ships with its SQL attached.",
    "**17:30 —** The day closes in review mode. The vendor scorecard ships ranked — Nordic 4.6, Midwest 4.4, Alpine 4.8 at the top of the revenue table — with the rating gate stated (`>= 4.4`, the bench that survives the promo-eligibility bar) and the dormant-vendor watch attached: the anti-join shape that would catch a vendor whose casts never sell, written NULL-safe because *one NULL in a NOT IN subquery empties the report and nobody questions an empty report*. Tomorrow's two must-reconcile numbers are written down: the big-ticket in-flight pile and the vendor concentration delta. In a drop-ship platform the next shift inherits queries that vendors will effectively audit — so the grain and the gate ride in the query comments.",
  ],

  metrics: [
    { name: "Vendor concentration", what: "Top vendor's share of platform demand — Nordic at 32% (11130.25 of 34833.28), top two at 58%. The single-point-of-failure read that opens every supplier review." },
    { name: "Vendor revenue", what: "Demand folded through the drop-ship chain per vendor — SUM(quantity × unit_price) over unit lines joined to casts. Nordic 11130.25, Midwest 9294.93, Alpine 4765.63 on the current fold." },
    { name: "Big-ticket mix", what: "Orders at 500+ total — 25 of 103, with only 9 delivered. The margin story and the in-flight delivery risk share one number, and both teams watch it daily." },
    { name: "Handoff latency", what: "Days from order to carrier handoff on the 82 orders with `shipped_at` — 2.98 average, 2-to-4 range. Population stated first: pending orders have no latency YET." },
    { name: "Vendor rating bench", what: "Vendors at 4.4+ rating — Nordic 4.6, Midwest 4.4, Alpine 4.8. The promo-eligibility gate merch applies before featuring a cast." },
    { name: "Cast productivity", what: "Revenue per cast per vendor — Nordic's 3 casts book 11130.25 while Pacific's 3 book 2980.15. Shelf depth means nothing without the yield beside it." },
    { name: "Kept-order share", what: "Non-cancelled orders ÷ placed — 7 of 103 cancel (6.8%). The denominator rule (cancelled stays in the placed base) is the whole test." },
    { name: "Settlement coverage", what: "Invoices classified exact / partial / none — 21 exact, 1 partial (4000 of 6148), 6 unpaid worth 15217 dollars. The cents-level fold finance runs before the close." },
  ],

  topics: [
    {
      name: "Vendor scorecards at the chain grain",
      why: "Vendor revenue folds through three hops — orders → unit lines → casts → vendors — and every Wayfair screen opens somewhere on that chain. The trap is grain drift: 103 orders fan into 251 lines, and a SUM over the joined rows is line revenue, not order count; ratings live on the vendor table and must not be re-fanned by the join.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "average-selling-price"],
    },
    {
      name: "Dormant-vendor anti-joins",
      why: "Drop-ship health is read from the silent side: vendors whose casts never sold, casts with no demand in a window, customers who browsed but never bought. LEFT JOIN + IS NULL (and its NOT EXISTS twin) is the shape — and the NOT IN NULL trap is the follow-up that ends screens, because one NULL in the subquery empties the report and an empty report looks like good news.",
      slugs: ["sellers-with-no-sales", "customers-who-never-order", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Big-ticket bands and thresholds",
      why: "The 500-plus ticket is where Wayfair's margin and its delivery risk both live — 25 orders, 9 delivered. Banding is CASE work: threshold arms in the right order, ELSE as the catch-all, and a threshold that actually matches the business (the premium PRICE band at 200 is empty on this db — max cast price 199.99 — which is the trap the band census is designed to catch).",
      slugs: ["number-of-rich-customers", "calculate-orders-within-each-interval", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "The delivery clock on big tickets",
      why: "Big-ticket promises are the expensive ones to break: handoff latency on `shipped_at`, repeat-purchase windows after delivery, latest-order-per-cast recency. The drills pair a date diff with a per-group latest-row pick — the two shapes logistics uses to decide which in-flight orders get a phone call.",
      slugs: ["users-with-two-purchases-within-seven-days", "second-day-confirmation", "the-most-recent-three-orders"],
    },
    {
      name: "Cast hygiene and catalog shape",
      why: "A cast page is the whole storefront: titles arrive messy, serials arrive malformed, and a join on a dirty cast name is a silent fan-out nobody catches until the census doubles. Case-folding, SUBSTR extraction, GLOB guards — the warm-up round where catalog analysts are made or exposed.",
      slugs: ["fix-product-name-format", "find-products-with-valid-serial-numbers", "recyclable-and-low-fat-products"],
    },
    {
      name: "Concentration and share folds",
      why: "'Top vendor = 32%' is a share, and shares punish sloppy folds: the denominator is platform revenue (34833.28), the numerator folds through the chain, and the percentage needs 100.0 before the division. The drills pair an attendance-share fold with a rank-as-percentage — the exact math behind the concentration tile.",
      slugs: ["percentage-of-users-attended-a-contest", "compute-the-rank-as-a-percentage", "queries-quality-and-percentage"],
    },
    {
      name: "Drop-ship chain joins",
      why: "The three-table chain is THE Wayfair join: vendors to casts on supplier_id, casts to lines on product_id, and the interview is whether you can keep the chain straight while a fold rides on it. Two-hop warm-ups graduate to four-table capstones; wrong-key joins fan out quietly and the vendor census doubles.",
      slugs: ["count-artist-occurrences-on-spotify-ranking-list", "combine-two-tables", "top-competitors"],
    },
    {
      name: "Warehouse and stock folds",
      why: "The platform owns little inventory but reads it constantly: stock-on-hand per location, FIFO layer consumption for the owned-warehouse edge, LEFT JOIN stock counts that must keep zero-stock casts visible. The drills pair a join-aggregate with a keep-all-left fold — the two shapes the inventory count runs on.",
      slugs: ["warehouse-manager", "fifo-inventory-cogs", "count-student-number-in-departments"],
    },
    {
      name: "Ranking windows for vendor boards",
      why: "Vendor podiums, top casts per vendor, second-priciest cast in a category — supplier reporting is leaderboard reporting. The rank trio and the tie-break habit are reflexes here, and the argmax-via-window is the difference between a podium and a LIMIT 1 that splits ties arbitrarily.",
      slugs: ["department-top-three-salaries", "second-highest-salary", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Settlement money math",
      why: "Vendors get paid on invoices, and on this db those tables keep money as INTEGER cents — every dollar read is amount_cents / 100.0. Reconciliation folds (coverage classification, split-payment detection, month-bucketed aging) are the closest thing this kit has to a finance round, and the anomalies are real: a void invoice that collected, a paid invoice with no payments.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "monthly-transactions-i"],
    },
  ],

  theory: [
    {
      id: "wayfair-t1",
      q: "The drop-ship chain runs orders → unit lines → casts → vendors. When do you insist on a LEFT JOIN in a supplier read, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. If the question is demand-shaped — vendor revenue, cast productivity, big-ticket counts — the order stream is the spine and INNER joins attaching cast and vendor attributes are right, because every unmatched row would distort a fold built on line counts. If the question is supply-shaped — vendors whose casts never sold, casts with no demand this quarter — the vendor table is the spine and LEFT JOIN + IS NULL is the only honest shape: INNER drops exactly the vendors you're hunting for. The drop-ship discipline is saying which side is the spine before the FROM clause. One honesty note this db earns: every cast HAS sold and every order resolves to a customer (zero never-ordered rows on both sides), so INNER and LEFT coincide here — which is exactly why the interviewer asks you to reason about the shape instead of leaning on the data to save you. And the standing warning: a WHERE on the right-table column after a LEFT JOIN silently converts it to INNER.",
      tag: "joins",
    },
    {
      id: "wayfair-t2",
      q: "Rank vendors by revenue for the supplier review. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one ships?",
      a: "They disagree exactly where the metric ties. RANK gives tied vendors the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing vendor that doesn't exist. DENSE_RANK shares the rung and keeps the sequence compact (1, 2, 2, 3). ROW_NUMBER splits the tie arbitrarily (1, 2, 3, 4) unless you add a deterministic tie-breaker like vendor id, which makes it the dedupe tool, not the leaderboard tool. The review ships DENSE_RANK with an explicit secondary sort: vendor boards are read as 'who's nth', a skipped rung generates a meeting about a vendor that was never there, and a deterministic tie-break keeps the board identical between the morning run and the afternoon re-run. The LIMIT-1-OFFSET-1 'second place' habit breaks on every tie — and ties are real at the units grain here (vendors sit at 82 and 80 units within three of each other) even where revenue separates. The honest second place is DENSE_RANK = 2, ties included, tie-break stated.",
      tag: "windows",
    },
    {
      id: "wayfair-t3",
      q: "On the orders table — 103 rows, 251 unit lines after the join, 16 customers — narrate what COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) each return, and which grain each serves.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every order, the placed denominator for kept-share and vendor-mix work. COUNT(shipped_at) is 82 — the handed-off subset, because COUNT skips NULLs; the gap between 103 and 82 IS the 14 pending plus 7 cancelled, and the gap is a fulfillment signal, not a data bug. COUNT(DISTINCT customer_id) is 16 — repeat orders folded back to buyers, the demand-side grain. And after the unit-line join a fourth number appears: COUNT(*) becomes 251 — lines, not orders — which is why average ticket (34833.28 ÷ 103 = 338.19) and average line value (÷ 251) are different metrics that share a numerator. The drop-ship trap is reporting one grain under another's name: vendor revenue per ORDER requires COUNT(DISTINCT order_id) after the fan-out, and 'orders per vendor' computed as lines ÷ vendors is a meaningless intensity that collapses the first time a vendor asks what it means. The strong answer assigns a grain to every COUNT out loud.",
      tag: "aggregation",
    },
    {
      id: "wayfair-t4",
      q: "`shipped_at` is NULL until carrier handoff, and cancelled orders never get one. What is your NULL policy for the handoff-latency metric and for vendor-facing delivery reads?",
      a: "Define who has the metric, state it, never launder the hole. For latency, the population is the 82 handed-off orders: WHERE shipped_at IS NOT NULL is correct and the subtitle says so — 2.98 days average, 2-to-4 range. The subtle bug is the unfiltered version 'working anyway': AVG skips NULL rows silently and returns the same 2.98 — the number is right while the denominator discipline is broken, and the day a share rides beside it the NULLs corrupt the rate. For vendor-facing reads the failure is louder: a delivery-rate denominator that includes pending orders punishes vendors for orders still in their queue, and one that includes cancelled orders punishes them for demand that never existed — both are population choices that become vendor disputes. Three NULL behaviors to narrate: filters (NULL fails = and !=), aggregates (COUNT(col) skips, COUNT(*) keeps), comparisons (NULL <= 3 is UNKNOWN, not FALSE). In drop-ship the NULL policy is contract language — state it before the query, not after the dispute.",
      tag: "nulls",
    },
    {
      id: "wayfair-t5",
      q: "'Only show vendors rated 4.4 or better' — WHERE or HAVING, and why does the placement matter if rating is a plain column?",
      a: "Here's the subtlety: rating is a plain vendor column, so WHERE s.rating >= 4.4 works — and after GROUP BY vendor, HAVING s.rating >= 4.4 works identically, because rating is constant within the group. The interviewer is testing whether you know WHY both work and when they diverge: row predicates in WHERE run before the fold and shrink its input (cheaper, and the only option for non-grouped filters); group predicates in HAVING run after the fold and are mandatory for aggregates — 'at least 3 casts' is HAVING COUNT(*) >= 3, and no WHERE can see that count. The failure mode to narrate: putting a group filter in WHERE throws 'no such column', and the error message is the pipeline order teaching itself. On the vendor board the gate is a business decision stated out loud — 4.4 keeps Nordic (4.6), Midwest (4.4) and Alpine (4.8) and drops Andes (4.0), Shenzhen (4.1) and Pacific (3.9) — and the deck says which vendors the gate excludes, because a gate nobody can see is a gate nobody can argue with.",
      tag: "pipeline",
    },
    {
      id: "wayfair-t6",
      q: "You need each cast's price as of a given date, where the price history only has rows for changes. Walk me through the scalar-subquery shape — and what happens when a cast never repriced.",
      a: "The as-of lookup is a correlated scalar: for each cast, SELECT price FROM price_history WHERE cast_id = c.id AND changed_on <= :date ORDER BY changed_on DESC LIMIT 1 — the latest change before the cutoff. The contract matters: a scalar subquery is 0-or-1 rows, and the zero case is the whole question — a cast that never repriced returns NULL, not an error, and every display or comparison against NULL needs a stated policy. The Wayfair-flavored fix is a deliberate fallback: COALESCE((subquery), c.current_price) — 'if no change on record, the current price IS the as-of price' — which turns a data gap into a documented definition, exactly what a vendor dispute needs. The correlated cost is real: the inner query re-runs per outer row, fine at 16 casts and a full scan at 16 million, so at scale you stage the latest-per-cast window in a CTE and join. Saying which population the inner fold covers — repriced versus never-repriced — is exactly what the follow-up is fishing for.",
      tag: "subqueries",
    },
    {
      id: "wayfair-t7",
      q: "Order and handoff timestamps arrive as TEXT. How do you bucket them by month, diff them in days, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on ISO text — both give '2025-01', and the SUBSTR shortcut works only while the format stays fixed-width ISO; one loose timestamp and the vendor aging report quietly mis-buckets. Diffs: JULIANDAY(shipped_at) − JULIANDAY(created_at) returns fractional days — this db's 2.98-day average is exactly that, rounded once at the END, not per row; rounding per row then averaging is a different, wrong metric. Windows: half-open intervals — created_at >= '2025-01-01' AND < '2025-02-01' — never BETWEEN on the last day, which drops the big-ticket orders placed the final evening of a month whose settlement you're aging. The deeper breaks: shipped_at is NULL until handoff, so every latency fold states its population first (82 of 103), and vendor SLA reads must anchor to a stated reference date, not to whatever the max timestamp happens to be. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "wayfair-t8",
      q: "Vendor settlements must reconcile: invoices, payments and expenses all store INTEGER cents, and payments can arrive as two rows on one invoice. How do you keep the fold honest?",
      a: "Two disciplines. Units: every dollar read is amount_cents / 100.0 — the .0 promotes to real arithmetic before the division, because integer ÷ integer truncates and a 6148-cent invoice prints as 61 dollars; divide once, at the display edge, after the fold. Duplicates: GROUP BY invoice_id HAVING COUNT(*) > 1 finds the split-settlement invoices — five on this db (ids 1, 5, 12, 19, 22) — and collapsing them is a DECISION, not a default: folding two genuine part-payments into one hides a shortfall, so the honest version classifies coverage first (exact 21, partial 1 at 4000-of-6148, none 6 worth 15217 dollars) and only then dedupes the display layer. The known anomaly classes to hunt: a void invoice that still carries a payment (id 11, 925 dollars) and a paid invoice with zero payment rows (id 28) — vendor statements exist to catch exactly these. Detect with an aggregate, dedupe with a deterministic tie-break, and be able to say which rows your dedupe discarded and why the business agreed to lose them.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "wayfair-mcq-1",
      prompt: "Vendor revenue for the scorecard: 251 unit lines trace through casts to 6 vendors. Which fold computes Nordic Gadgets AB's 11130.25?",
      choices: [
        "SUM(unit_price) FROM order_items",
        "SUM(quantity * unit_price) FROM order_items joined to casts to vendors",
        "COUNT(*) FROM order_items",
        "SUM(quantity) FROM order_items",
      ],
      answer: 1,
      why: "Vendor revenue is money: quantity × unit_price summed across the vendor's lines through the cast chain — Nordic lands at 11130.25. SUM(unit_price) prices one unit per line, SUM(quantity) counts units (82 for Nordic), COUNT(*) counts lines.",
      notes: [
        { choice: 0, why: "One unit per line priced — ignores quantity entirely. The magnitude check catches it: 82 units × 149.99-class prices ≈ 11k, not a sum of unit prices." },
        { choice: 3, why: "82 is Nordic's unit census — real, but not revenue. The money only appears when price multiplies into the fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "wayfair-mcq-2",
      prompt: "Merch asks for the big-ticket count: orders with total 500 or more. Of 103 orders, how many qualify?",
      choices: [
        "25 — and only 9 of them have delivered so far",
        "40 — the mid band rides with the big band",
        "78 — everything above the 25.47 minimum ticket",
        "9 — the delivered big tickets only",
      ],
      answer: 0,
      why: "The >= 500 band holds 25 of 103 orders, and the delivery risk is the point: only 9 delivered, the rest in flight or cancelled. The band, its size, and its delivery state are one sentence.",
      notes: [
        { choice: 1, why: "40 is the 200-to-499.99 mid band — a different threshold. Bands are definitions; quote the threshold beside the count or the number is decoration." },
        { choice: 3, why: "9 is the delivered SUBSET — filtering to delivered before counting silently drops the in-flight risk the metric exists to expose." },
      ],
      difficulty: "easy",
    },
    {
      id: "wayfair-mcq-3",
      prompt: "A 'premium casts' band is defined as price >= 200. What does the honest band census return?",
      choices: [
        "2 casts — Smart Watch S at 199.99 and the 149.99 headset",
        "0 casts — the max cast price is 199.99, so the premium band is empty",
        "8 casts — the mid band averages 111.50",
        "An error — CASE can't return an empty band",
      ],
      answer: 1,
      why: "The cast price ladder tops out at 199.99 (Smart Watch S), so a >= 200 band returns zero rows — and GROUP BY band simply shows no premium group. Any 'premium' row in a report means the threshold is wrong, not that premium casts appeared.",
      notes: [
        { choice: 0, why: "199.99 is BELOW 200 — a classic boundary miss. Threshold arithmetic is the whole question; 'close to 200' is not 'at least 200'." },
        { choice: 2, why: "8 casts at an average of 111.50 is the MID band (50–199.99) — real numbers wearing the premium band's name." },
      ],
      difficulty: "easy",
    },
    {
      id: "wayfair-mcq-4",
      prompt: "The drop-ship chain joins vendors → casts → unit lines. Which join keys keep the chain honest?",
      choices: [
        "products.supplier_id = suppliers.id, order_items.product_id = products.id",
        "order_items.order_id = suppliers.id, products.product_id = order_items.id",
        "Both joins on product name — names are unique",
        "suppliers.id = order_items.product_id directly — skip the casts table",
      ],
      answer: 0,
      why: "The chain is supplier_id (cast → vendor) and product_id (line → cast). Joining on names assumes uniqueness the data doesn't promise, and skipping the cast table loses the vendor attribution entirely.",
      notes: [
        { choice: 1, why: "Those keys cross entities — an order id against a vendor id matches nothing or the wrong thing. Key-by-key verification against the schema is the 30-second habit that saves the fold." },
        { choice: 3, why: "There is no supplier_id on order_items — vendor attribution flows through the cast. A 'shortcut' join on ids that don't relate is a fan-out or an empty set." },
      ],
      difficulty: "medium",
    },
    {
      id: "wayfair-mcq-5",
      prompt: "Find vendors whose casts never sold this quarter. Why is `WHERE id NOT IN (SELECT supplier_id FROM sales)` the fragile shape?",
      choices: [
        "It's slower than a LEFT JOIN",
        "One NULL in the subquery empties the entire result — NOT IN can never be TRUE against a NULL",
        "It ignores vendors with exactly one sale",
        "It converts missing vendor ids to zero",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) is UNKNOWN, and NOT UNKNOWN is still UNKNOWN — one stray NULL supplier_id silently returns zero rows while the query looks fine. NOT EXISTS or LEFT JOIN + IS NULL is the NULL-proof anti-join.",
      notes: [
        { choice: 0, why: "Performance is secondary; the failure is CORRECTNESS — the dormant-vendor report ships empty and nobody questions it, because empty reads as 'no dormant vendors'." },
        { choice: 2, why: "The sales volume is irrelevant — the shape fails on ONE NULL regardless of volume. The fix is semantics (EXISTS / IS NULL), not tuning." },
      ],
      difficulty: "medium",
    },
    {
      id: "wayfair-mcq-6",
      prompt: "The vendor board gates at rating 4.4+. Ratings: Nordic 4.6, Midwest 4.4, Alpine 4.8, Andes 4.0, Shenzhen 4.1, Pacific 3.9. Which query keeps exactly the right vendors after GROUP BY vendor?",
      choices: [
        "WHERE COUNT(*) >= 4.4",
        "HAVING rating >= 4.4 — keeps Nordic, Midwest, Alpine",
        "HAVING rating > 4.4 — keeps Nordic, Midwest, Alpine",
        "WHERE rating >= 4.4 is invalid after GROUP BY",
      ],
      answer: 1,
      why: "rating is a plain vendor column, so HAVING rating >= 4.4 keeps Nordic (4.6), Midwest (4.4) and Alpine (4.8) — the >= boundary is exactly what keeps Midwest on the board. (WHERE rating >= 4.4 is also legal pre-grouping here since rating is per-row; the trap in choice 4 is calling it invalid.)",
      notes: [
        { choice: 0, why: "COUNT(*) is an integer row tally — >= 4.4 compares counts to a rating. Wrong column, wrong units, and the gate silently becomes 'any vendor with at least one line'." },
        { choice: 2, why: "Strict > drops Midwest (4.4 is not > 4.4) — the exact vendor the bench definition includes. Boundary operators are the quiet way gates lose their members." },
      ],
      difficulty: "medium",
    },
    {
      id: "wayfair-mcq-7",
      prompt: "Big-ticket delivery share: 9 of the 25 orders at 500+ have delivered. Which expression prints 36.0?",
      choices: [
        "100 * 9 / 25",
        "100.0 * 9 / 25",
        "ROUND(9 / 25, 2)",
        "9 / 25 * 100.0",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic before the division: 36.0 exactly. In drop-ship this share is the in-flight risk read — and integer math is how a real 36% silently prints as 0 or 36 depending on the engine.",
      notes: [
        { choice: 0, why: "100 * 9 / 25 is integer division end-to-end in SQLite: 900 / 25 happens to equal 36 — this one survives by luck, which is precisely why the habit is dangerous on the next denominator that doesn't divide evenly." },
        { choice: 2, why: "9 / 25 is 0 in integer math — the share reads 0.00 before rounding can save it. Promote FIRST, round LAST." },
      ],
      difficulty: "medium",
    },
    {
      id: "wayfair-mcq-8",
      prompt: "A vendor's 'catalog value' is computed as SUM(products.price) after joining vendors → casts → unit lines. Why does the number overstate reality?",
      choices: [
        "Prices are stored in cents and the sum reads as dollars",
        "Each cast's price repeats once per sold unit line — the fan-out multiplies catalog value by sales volume",
        "SUM ignores NULL prices, which deflates the total",
        "It doesn't — SUM over any join is order-grain by default",
      ],
      answer: 1,
      why: "The line join repeats each cast once per sold unit: a cast priced 149.99 that sold 46 times contributes 46 × its price to the 'catalog value'. The fan-out turns a stock-read into a demand-read — SUM over the cast table alone, or COUNT(DISTINCT product_id) per vendor, is the honest fold.",
      notes: [
        { choice: 0, why: "Cents live on invoices and payments, not on cast prices — orders.total and prices are REAL dollars here. Wrong-table instinct, wrong fix." },
        { choice: 3, why: "SUM is grain-agnostic — it sums whatever rows the join produced. Assuming a default grain is how the fan-out survives code review." },
      ],
      difficulty: "hard",
    },
    {
      id: "wayfair-mcq-9",
      prompt: "Finance wants split-settlement invoices: invoices paid across multiple payment rows. Which query finds them — and how many are there?",
      choices: [
        "SELECT invoice_id FROM payments GROUP BY invoice_id HAVING COUNT(*) > 1 — five invoices (1, 5, 12, 19, 22)",
        "SELECT invoice_id FROM payments WHERE COUNT(*) > 1 — five invoices",
        "GROUP BY invoice_id HAVING SUM(amount_cents) > 1 — one invoice",
        "SELECT DISTINCT invoice_id FROM payments — every invoice is split",
      ],
      answer: 0,
      why: "The split detector is a grouped count with a HAVING gate: five invoices on this db carry two payment rows each (ids 1, 5, 12, 19, 22) — plus one genuinely partial settlement (invoice 25, 4000 of 6148) that the collapse decision must protect.",
      notes: [
        { choice: 1, why: "WHERE can't see COUNT(*) — no groups exist at filter time, and the engine rejects it. The error message is the pipeline order teaching itself." },
        { choice: 3, why: "DISTINCT lists all invoices with any payment (27 payment rows over 28 invoices) — it dedupes, it doesn't gate. A census without a threshold is a list, not a finding." },
      ],
      difficulty: "hard",
    },
    {
      id: "wayfair-mcq-10",
      prompt: "A delivery-rate report computes AVG(julianday(shipped_at) - julianday(created_at)) over ALL 103 orders without a population filter. What is TRUE about the result?",
      choices: [
        "It errors — julianday(NULL) is undefined",
        "It returns 2.98 — and that silent correctness is the trap, because AVG skips NULL rows and the denominator discipline is broken",
        "It returns a lower average — pending orders count as 0 days",
        "It returns 103 — one latency per order",
      ],
      answer: 1,
      why: "AVG ignores NULL inputs, so the unfiltered average over 82 non-NULL latencies equals the filtered one — 2.98. The number is right; the DISCIPLINE is broken: any companion rate (on-time share ÷ all orders) now rides a denominator that includes 21 orders with no latency, and the report's subtitle never said which population it covered.",
      notes: [
        { choice: 0, why: "julianday(NULL) is NULL, and AVG skips NULLs — the query runs fine, which is exactly what makes it dangerous. Silent population swaps don't crash; they ship." },
        { choice: 2, why: "NULLs are skipped, not zero-filled — a 0-day pending order would drag the average DOWN to ~2.4. Knowing the engine skips (not zeros) is what tells you the average barely moves while the denominator lies." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-wayfair-1",
      tier: "medium",
      topic: "j3",
      universe: "supplier",
      title: "The vendor scorecard chain",
      brief:
        "Wayfair-flavored case on the storefront db (suppliers = drop-ship vendors, products = casts, order_items = unit lines): the supplier review opens with the vendor scorecard, and the category director is explicit about the contract: 'revenue through the cast chain, units beside it, rating on the board — and only the promo-eligible bench, rating 4.4 or better.' Probed facts: vendor revenue reads Nordic Gadgets AB 11130.25 (32% of platform demand), Midwest Hardware Co 9294.93, Alpine Audio GmbH 4765.63, with Andes Naturals SA 3613.25, Shenzhen Electro 3049.07 and Pacific Textiles 2980.15 below the gate; unit volumes run Nordic 82, Midwest 109, Alpine 77; ratings are Nordic 4.6, Midwest 4.4, Alpine 4.8. The 4.4 gate keeps exactly the top three by revenue — a coincidence the review likes and the query must prove.",
      ask: "Return the promo-eligible vendors (rating 4.4+) with name, rating, revenue to 2 decimals, and units — biggest revenue first.",
      template:
        "SELECT s.name,\n       s.rating,\n       ROUND({1}(oi.quantity * oi.unit_price), 2) AS revenue,\n       SUM(oi.quantity) AS units\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.id\nHAVING s.rating >= {2}\nORDER BY revenue {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the revenue fold",
          why: "SUM(quantity × unit_price) folds every unit line into vendor revenue — Nordic lands at 11130.25 (82 units through three casts). MAX would crown the single priciest line as a vendor's whole book; AVG would price one average line, not the shelf.",
        },
        {
          answer: "4.4",
          kind: "number",
          label: "the promo-eligibility gate",
          why: "The bench is rating >= 4.4: Nordic 4.6, Midwest 4.4, Alpine 4.8 survive; Andes 4.0, Shenzhen 4.1 and Pacific 3.9 drop. 4.4 is Midwest's own rating — a result cell — so the gate and the marginal vendor it keeps are the same number, which is the boundary the review will argue.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The scorecard leads with the concentration story: 11130.25, then 9294.93, then 4765.63. ASC would open the review on Pacific Textiles — a vendor the gate just excluded — and bury the 32% share the meeting exists to discuss.",
        },
      ],
      distractors: ["AVG", "MAX", "4.0", "4.6"],
      walkthrough:
        "A vendor scorecard is a three-table chain with a fold and a gate, and the grain of each layer is the interview. The chain is vendor → cast on supplier_id, cast → line on product_id — 251 unit lines, each tracing to exactly one vendor. The fold: SUM(quantity × unit_price), rounded once, per vendor — Nordic 11130.25 over 82 units, Midwest 9294.93 over 109 (the volume leader that revenue still doesn't crown), Alpine 4765.63 over 77. The gate: HAVING rating >= 4.4 keeps exactly three vendors — and the boundary case IS the lesson, because Midwest's 4.4 survives the >= while Andes' 4.0, Shenzhen's 4.1 and Pacific's 3.9 drop. The distractors encode the scorecard bugs: AVG in the fold prices one average line (Nordic reads 258.84 across its 43 lines, not 11130.25 — the vendor looks broke); MAX crowns the priciest single line; a 4.0 gate reads as 'keep everyone at 4.0+' and drags Andes onto a promo bench it never earned; a 4.6 gate silently expels Midwest — the vendor the gate was calibrated to keep. Chain, fold, gate, order: each is a decision the vendor will audit.",
    },
    {
      id: "cs-wayfair-2",
      tier: "easy",
      topic: "s6",
      universe: "growth",
      title: "The big-ticket band census",
      brief:
        "Wayfair-flavored case on the storefront db (orders = customer orders): merch and logistics share one deck, and the page they argue over is the big-ticket band census — how much of the order book sits at 500-or-more, and how much of it has actually delivered. Probed facts: of 103 orders, 25 sit at 500-or-more with only 9 delivered; the mid band (200 to 499.99) holds 40 orders with 22 delivered; the value band (under 200) holds 38 with 21 delivered. The deck's convention: every band must carry at least 25 orders to be reported — the big-ticket band's own headcount is the floor, so the gate at 25 keeps all three bands and any higher gate would silently drop the row the meeting is about.",
      ask: "Return the order bands (big_ticket 500+, mid_ticket 200-499.99, value under 200) with order counts and delivered counts — biggest band first, bands under 25 orders dropped.",
      template:
        "SELECT CASE WHEN total >= {1} THEN 'big_ticket'\n            WHEN total >= {2} THEN 'mid_ticket'\n            ELSE 'value' END AS band,\n       COUNT(*) AS orders,\n       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered\nFROM orders\nGROUP BY band\nHAVING COUNT(*) >= {3}\nORDER BY orders {4};",
      slots: [
        {
          answer: "500",
          kind: "number",
          label: "the big-ticket threshold",
          noVerify: true,
          why: "The big-ticket definition is 500+: 25 of 103 orders qualify. A 400 threshold swells the band to 34 (14 mid-band orders migrate up) and the in-flight risk read changes; a 600 threshold shrinks it to 20 and the deck's headline moves.",
        },
        {
          answer: "200",
          kind: "number",
          label: "the mid-band threshold",
          noVerify: true,
          why: "The mid band is 200 to 499.99: 40 orders, 22 delivered. Note the arm order matters — the 500 arm fires first, so this threshold only needs to be below 500; pushing it to 600 turns the mid band into an empty group and the census loses a row.",
        },
        {
          answer: "25",
          kind: "number",
          label: "the reporting floor",
          why: "The deck reports bands of at least 25 orders — the big-ticket band's own headcount. The gate at 25 keeps all three bands (40, 38, 25); a gate of 30 or more silently drops the big-ticket row, which is the exact row the meeting is about. 25 appears as a result cell — the floor and the smallest reported band are the same number.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-band-first direction",
          why: "The census reads mid (40), value (38), big (25) — size order, so the small big-ticket row lands last with its 9-delivered punchline visible. ASC would invert the story and open the deck on the band with the least revenue weight.",
        },
      ],
      distractors: ["400", "600", "30", "ASC"],
      walkthrough:
        "A band census is CASE arms in the right order plus a gate you can defend. The CASE evaluates top-down: 500+ is big_ticket, then 200-to-499.99 is mid_ticket, everything else is value — arm order is load-bearing, because the mid arm only sees rows the big arm didn't catch. The delivered arm is a second CASE fold riding beside it: 22 of 40 mid, 21 of 38 value, and the punchline — 9 of 25 big-ticket — is the in-flight risk logistics opened the meeting for. The HAVING floor at 25 is a materiality decision the deck states: it keeps all three bands today, but it's written so a thinner band dies automatically rather than getting a manual exemption. The distractors encode the census killers: a 400 big-threshold migrates 9 orders (the 400-to-499.99 tickets) into the headline band and the in-flight risk inflates overnight; a 600 threshold drops the band to 20 and the deck's headline understates the risk; a 30 reporting floor silently deletes the big-ticket row — the meeting convenes and the subject is gone; ASC inverts the read. Bands, arms, floor, order: four decisions, one census nobody can argue with.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-cast revenue from unit lines — the vendor-scorecard opener fold, quantity × price summed at the cast grain. Curated (Wayfair has no registry tags)." },
    { slug: "product-sales-analysis-iii", why: "Cast totals split by date window — the before-during-after promo comparison merch argues with. Curated." },
    { slug: "sellers-with-no-sales", why: "The vendor-side anti-join: casts that never sold, vendors dormant in a window — the drop-ship health read from the silent side. Curated." },
    { slug: "number-of-rich-customers", why: "Orders above a spend threshold — the big-ticket census at 500+, threshold and denominator in one fold. Curated." },
    { slug: "calculate-orders-within-each-interval", why: "Orders banded by size intervals — the band census shape, CASE arms in load-bearing order. Curated." },
    { slug: "the-category-of-each-member-in-the-store", why: "CASE-tier classification per customer — ticket-class banding (value / mid / big) in textbook form. Curated." },
    { slug: "warehouse-manager", why: "Stock-on-hand join aggregate — shelf value folded per location, the warehouse-side read behind fill-rate calls. Curated." },
    { slug: "fifo-inventory-cogs", why: "FIFO layer consumption — the owned-inventory edge of a drop-ship platform, cost layers consumed in order. Curated." },
    { slug: "count-artist-occurrences-on-spotify-ranking-list", why: "Two-hop join with a grouped count — orders → casts → vendors, the chain muscle before the four-table capstone. Curated." },
    { slug: "combine-two-tables", why: "LEFT JOIN enrichment at two grains — orders with customer attributes, where unmatched rows must survive. Curated." },
    { slug: "department-top-three-salaries", why: "Top-3 per group via window — the vendor podium per category, tie-aware and deterministic. Curated." },
    { slug: "second-highest-salary", why: "Runner-up reads without LIMIT tricks — the second-priciest cast in a category, honest on ties. Curated." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest-per-group argmax — the most recent order per cast, the recency rail logistics sorts in-flight risk by. Curated." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat-window reads — buyers who came back inside a week, the big-ticket follow-through signal. Curated." },
    { slug: "trial-balance-check", why: "Conditional SUM reconciliation — the settlement cents check that keeps vendor statements tying before the close. Curated." },
    { slug: "monthly-transactions-i", why: "Month-bucketed money with a status filter — vendor invoice aging at the month grain, cents folded honestly. Curated." },
  ],
};
