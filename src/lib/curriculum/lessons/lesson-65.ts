import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l65-mcqs";
import { ROWS as PROBS } from "./banks/l65-problems";

export const lesson65: Lesson = {
  id: "lesson-65",
  num: 65,
  title: "OLAP vs OLTP — two questions, two shapes",
  blurb:
    "The same store, two jobs: the storefront answers 'did order 12 ship?' in milliseconds; the board asks 'which quarter owned the most net?' over 14 months. This lesson names the two workloads, derives the warehouse FROM the storefront you already know, and proves the grain contract with countable receipts",
  minutes: 20,
  blocks: [
    {
      kind: "p",
      text: "Sixteen modules taught you to **read** a live storefront: 103 orders, 16 products, one database you can query in your head. But the questions have been getting bigger — revenue by quarter, concentration by year, region mix over time — and those questions read every row and write none. That workload has a name (**OLAP** — online analytical processing), and so does the store's own day job (**OLTP** — online transaction processing). This module builds the second home those questions deserve: a **warehouse layer derived from the storefront you already know**, starting with the shape decision that drives everything else.",
    },
    { kind: "h", text: "One checkout vs one board meeting" },
    {
      kind: "code",
      caption: "The OLTP shape — many small writes, single-row reads",
      sql: `-- the store's day: hundreds of small, latency-critical statements
INSERT INTO orders (customer_id, status, total, created_at) VALUES (5, 'pending', 87.47, '2024-01-05');
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (1, 13, 1, 199.99);
UPDATE products SET stock = stock - 1 WHERE id = 13;
SELECT status FROM orders WHERE id = 12;          -- one row, by key`,
    },
    {
      kind: "code",
      caption: "The OLAP shape — few fat reads, zero writes",
      sql: `-- the board's day: one query, every fact line, nothing written
SELECT d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_product d ON d.product_key = f.product_key
GROUP BY d.department
ORDER BY net_dollars DESC;                        -- Tech $30,702.42 · Lifestyle $2,532.24`,
    },
    {
      kind: "bullets",
      items: [
        "**The write shape decides the design.** Checkout touches a handful of rows with locking and durability guarantees; the report touches *all* of them and touches nothing. Optimizing for both in one table means optimizing for neither.",
        "**Same SQL, opposite physics.** Nothing in the board query is exotic — SUM, GROUP BY, one join. What differs is *how many rows* it must touch and *how often*. OLTP owns the chatty path; OLAP owns the fat one.",
        "**The warehouse is derived, never a replacement.** The storefront keeps transacting; `fact_sales` is rebuilt FROM it. Every warehouse number can walk back to the order that produced it — provenance runs one way.",
      ],
    },
    { kind: "diagram", figure: "m14-star-map" },
    { kind: "h", text: "Derive, don't duplicate" },
    {
      kind: "p",
      text: "This course's warehouse is honest about its source: `fact_sales` is literally `order_items` joined to non-cancelled orders, one row per line — **239 fact lines, and the source counts 239 too**. That equality is not luck; it is the **grain contract**, and it is checkable. Cancelled orders never sold, so they never load. Pending and shipped lines did sell (the money is owed), so they load.",
    },
    {
      kind: "code",
      caption: "The grain receipt — run it any time the warehouse feels wrong",
      sql: `SELECT (SELECT COUNT(*) FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'cancelled')              AS source_lines,   -- 239
       (SELECT COUNT(*) FROM fact_sales)             AS fact_lines,     -- 239
       (SELECT COUNT(DISTINCT order_id || '-' || product_key)
          FROM fact_sales)                           AS distinct_pairs; -- 239`,
    },
    {
      kind: "bullets",
      items: [
        "**Grain is a sentence before it is a schema.** 'One row per order line.' Say it out loud; every aggregate's meaning follows. Get it wrong — one row per *order*, say — and SUM(net_cents) silently mis-values every multi-line basket.",
        "**Rules bake into the load.** `status != 'cancelled'` ran ONCE, at load. Analysts stop re-deciding saleability in ten slightly different WHERE clauses — the single best argument for a warehouse layer.",
        "**Money stays integer cents on both sides.** 239 lines sum to exactly $33,234.66 net. The dollars conversion happens once, at display, in ROUND.",
      ],
    },
    { kind: "h", text: "What each side stores" },
    {
      kind: "table",
      caption: "The same sale, stored twice — on purpose",
      headers: ["", "storefront (OLTP)", "warehouse (OLAP)"],
      rows: [
        ["unit of work", "one transaction (order + items + stock)", "one load (derived, rebuildable)"],
        ["row shape", "normalized: orders → order_items → products", "star: fact line + 4 dimension tables"],
        ["writes", "hundreds per day, small", "none after load"],
        ["reads", "single rows by key", "aggregates over everything"],
        ["truth", "right now (status: pending/shipped)", "as it was (region at sale, promo at sale)"],
        ["answers", \"did order 12 ship?\", "which quarter owned the most net?"],
      ],
    },
    {
      kind: "warn",
      text: "The classic beginner move is pointing the warehouse's queries BACK at the operational tables ('just join products for the department'). Don't. The operational schema exists for transactions and WILL churn — a column renamed there breaks every report mid-quarter. The star is self-contained on purpose: facts + dimensions + keys, nothing reaching back.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres plays both roles with table partitioning and BRIN indexes on big fact tables; materialized views give warehouse-lite rollups that REFRESH on a schedule. Most real 'analytics on Postgres' stories are exactly this lesson: a derived layer, loaded from the operational schema.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery is OLAP-native: columnar storage bills you per column scanned, so SELECT * at scale is a real invoice. There is no operational OLTP sibling — Google's own docs say point transactions elsewhere (Cloud SQL/Spanner) and keep BigQuery for the fat reads.",
    },
    {
      kind: "dialect",
      db: "snowflake",
      text: "Snowflake separates storage, compute and a virtual-warehouse layer that scales per workload — the OLTP/OLAP split made literal. Loading is COPY INTO from stages; the star schema lands exactly as this lesson builds it.",
    },
    {
      kind: "tip",
      text: "The habit this module drills: before writing ANY warehouse query, say the grain out loud and check the receipt (source lines = fact lines = distinct pairs). Every surprising total in this module turns out to be a grain surprise wearing a costume.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "A restaurant and its cookbook. The dining room (OLTP) takes orders one at a time, all evening, each one small and urgent — you cannot batch tonight's tables into a monthly load. The cookbook (OLAP) is written once from thousands of served meals: it answers 'which dishes carry the margin' and is consulted quietly, read-only, in batches. Ask the dining room for a margin analysis mid-rush and you slow every table down; ask the cookbook whether table 7's risotto is ready and it stares blankly — it never knew table 7 existed. Two artifacts, one kitchen, both indispensable, neither substituting for the other.",
    },
    {
      kind: "engine",
      title: "What the load actually did (countable every step)",
      steps: [
        "Read the operational rows: orders joined to order_items — every line, 249 of them.",
        "Apply the saleability rule once: cancelled orders (1 order / 10 lines) drop — 239 lines remain.",
        "Resolve keys: each line's order date picks a date_key from the spine, a store_key, and — the interesting one — a customer version whose validity window contains the sale date.",
        "Derive measures: gross_cents from unit price × quantity; a 10% promo on every 8th line; net = gross − discount.",
        "Emit the grain receipt: 239 source lines = 239 fact lines = 239 distinct pairs. The load is auditable forever.",
      ],
    },
    {
      kind: "myth",
      myth: "The warehouse duplicates the store — why keep both?",
      truth:
        "Nothing duplicates: the store owns events, the warehouse owns derivations. Delete the store and the warehouse freezes forever; delete the warehouse and you re-run the business from receipts. They answer different questions — 'is my order here yet' and 'where did the margin go' — and neither schema can cheaply become the other.",
    },
    {
      kind: "myth",
      myth: "OLAP is just OLTP with more rows — same indexes, same tuning.",
      truth:
        "The workload inverts. OLTP lives on narrow point lookups (index by key, touch one row); OLAP lives on whole-table scans where an index is useless — you're reading everything anyway. That's why warehouses favor wide denormalized reads, columnar formats, and pre-built buckets (the date spine) instead of OLTP's beloved b-trees.",
    },
    {
      kind: "edge",
      items: [
        { c: "An order has TWO lines for the same product (2× HDMI cable). Does the grain break?", r: "The source allowed it; this seed didn't produce one (239 lines = 239 distinct pairs). If it did, the contract still holds — one fact row PER LINE, and COUNT(DISTINCT order||product) would read 238 against 239 lines. The receipt is exactly what catches that surprise." },
        { c: "A pending order refunds later — does fact_sales change?", r: "No — the fact records the sale as loaded. The refund belongs to fact_returns (lesson 71's conformed second fact), not to rewriting history. Facts are load-time snapshots; corrections arrive as NEW rows, never in-place edits." },
        { c: "Why not just add indexes to the storefront and keep asking big questions there?", r: "At 103 rows, you can — and should (module 11 did). At ten million, every dashboard query steals latency from checkout. The warehouse isn't a performance hack; it's a workload separation with a feed between the two." },
        { c: "Who owns 'net = gross − discount' if the promo rules change next quarter?", r: "The load does — one place. Facts loaded under the old rule keep the old net (history stays true); next quarter's loads apply the new rule. That's the quiet superpower of baking derivations into loads: rules version with time." },
        { c: "The board wants REAL-TIME margin. Doesn't that kill the nightly load?", r: "It stretches the feed, not the design: streaming loads (micro-batches) land lines minutes after checkout. The star shape and the grain contract survive — only the freshness number in the corner of the dashboard changes." },
      ],
    },
  ],
  mcqs: mcqBank("l65", MCQS),
  problems: probBankX("l65", PROBS),
  takeaway:
    "OLTP owns small urgent writes; OLAP owns fat read-only aggregates — and the warehouse layer is DERIVED from the operational store with a countable grain receipt (239 source lines = 239 fact lines = 239 distinct pairs), business rules baked into the load, and integer cents end to end.",
};
