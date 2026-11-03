import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l66-mcqs";
import { ROWS as PROBS } from "./banks/l66-problems";

export const lesson66: Lesson = {
  id: "lesson-66",
  num: 66,
  title: "The star schema — facts, dimensions, surrogate keys",
  blurb:
    "The warehouse's load-time anatomy: fact_sales (239 order lines, keys + measures, nothing else), four dimensions orbiting it (a 425-day date spine, 16 products with a department rollup, 4 stores, 21 SCD customer versions) and the surrogate-key discipline that lets history change without breaking a single fact",
  minutes: 20,
  blocks: [
    {
      kind: "p",
      text: "Lesson 65 named the workloads; this lesson builds the star. The design rule is one sentence: **the fact holds keys and measures, nothing else** — every attribute that describes a thing lives on that thing's dimension table, joined by a key. Around the 239-line `fact_sales` orbit four dimensions: `dim_date` (a 425-day calendar spine), `dim_product` (the 16 products plus a merchandising rollup the source never had), `dim_store` (4 locations) and `dim_customer` — which carries **21 rows for 16 buyers**, and that asymmetry is the interesting part.",
    },
    { kind: "diagram", figure: "m14-star-map" },
    { kind: "h", text: "The fact: skinny on purpose" },
    {
      kind: "code",
      caption: "fact_sales — the whole table, no hiding",
      sql: `SELECT id, order_id,             -- line id + degenerate dimension (drill-through)
       date_key, customer_key, product_key, store_key,   -- four dimension handles
       quantity,                         -- additive measure
       gross_cents, discount_cents, net_cents            -- additive money measures
FROM fact_sales LIMIT 3;
-- 239 rows: one per non-cancelled order line, keys resolve, money in cents`,
    },
    {
      kind: "bullets",
      items: [
        "**`order_id` joins to nothing.** It's a *degenerate dimension*: an operational handle kept on the fact for drill-through — from any aggregate you can walk back to the order. No dimension table needed; it has no attributes worth slicing.",
        "**Measures are additive by design.** quantity, gross, discount, net — SUM them across any slice and the answer means something. Ratios (margin %, discount rate) get computed from sums at query time, never stored per line.",
        "**`id` is the fact's own surrogate** — 1…239. The next lesson's `fact_returns` will reference it: fact-to-fact lineage.",
      ],
    },
    { kind: "h", text: "The dimensions: attributes at their natural cardinality" },
    {
      kind: "code",
      caption: "Four dimensions, four jobs",
      sql: `SELECT COUNT(*) FROM dim_date;      -- 425: the full calendar 2024-01-01 → 2025-02-28
SELECT COUNT(*) FROM dim_product;   -- 16: name, category, department, list & unit cost
SELECT COUNT(*) FROM dim_store;     -- 4:  name, city, region
SELECT COUNT(*) FROM dim_customer;  -- 21: 16 buyers → 21 versions (SCD Type 2)`,
    },
    {
      kind: "bullets",
      items: [
        "**The date spine over-delivers.** `date_key` (INTEGER 20240101), `iso_date`, `month`, `month_name`, `quarter`, `year`, `dow`, `is_weekend` — the whole calendar pre-computed once, so no query ever calls strftime again. It covers days with zero sales too: calendar truth, gapless by construction.",
        "**The rollup column is a load-time decision.** `department` doesn't exist in the operational `products` table — the warehouse's `dim_product` derives it (Electronics/Audio/Video/Accessories/Wearables → **Tech**; Apparel/Fitness → **Lifestyle**). One place defines 'Tech'; every report inherits the definition.",
        "**`unit_cost_cents` enables real margin.** The source only had a selling price; the warehouse tracks cost — so margin is `net_cents − quantity × unit_cost_cents`, a JOIN away, not a guess.",
      ],
    },
    { kind: "h", text: "Surrogate keys: the handle that survives change" },
    {
      kind: "p",
      text: "A **surrogate key** is a warehouse-assigned handle with no business meaning — `customer_sk` 1…21, `date_key`, `product_key`, `store_key`. The natural key (`customer_id` = 2, Bruno) says *who*; the surrogate says *who-and-when- era*. When Bruno's region changed on 2024-08-01, the warehouse didn't UPDATE his row — it opened a **new version** with a new `customer_sk` and a half-open validity window. Facts loaded before the move keep pointing at the old version; facts after, the new one. History is rows, not edits.",
    },
    {
      kind: "code",
      caption: "The SCD Type 2 shape (lesson 67 teaches it hands-on)",
      sql: `SELECT customer_sk, customer_id, name, region, valid_from, valid_to, is_current
FROM dim_customer WHERE customer_id = 2 ORDER BY customer_sk;
-- sk 3 | Bruno Silva | LATAM | 1900-01-01 → 2024-08-01 | 0
-- sk 4 | Bruno Silva | US    | 2024-08-01 → 9999-12-31 | 1
-- half-open [from, to): every date lands in exactly ONE version`,
    },
    {
      kind: "bullets",
      items: [
        "**Half-open windows `[valid_from, valid_to)`**: the as-of predicate `d >= valid_from AND d < valid_to` matches exactly one version — never zero, never two. `BETWEEN` (inclusive both ends) double-matches on change dates; that bug ships to production weekly.",
        "**The open end is a sentinel, not NULL**: the current version runs to `9999-12-31` so the same predicate works everywhere. And the *start* reaches back to `1900-01-01` — the dimension's history begins before the data does, so even pre-signup source rows resolve.",
        "**The integrity receipt**: zero fact rows have a `customer_key` whose window misses the sale date. That query (lesson's problems) is the load's bond.",
      ],
    },
    {
      kind: "warn",
      text: "Joining the fact to dim_customer on `customer_id` instead of `customer_sk` silently fans out: 5 buyers match two versions each, their sales double-count, and no error appears anywhere. The grain receipt (COUNT DISTINCT pairs) catches it — if you keep the habit.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres warehouses often generate surrogates with IDENTITY/sequences and enforce the half-open windows with an EXCLUDE constraint (a GiST index on customer_id WITH =, daterange(valid_from, valid_to) WITH &&) — overlap becomes physically impossible.",
    },
    {
      kind: "dialect",
      db: "snowflake",
      text: "Snowflake loads typically MERGE source rows into the dimension: match on natural key + is_current, close the old window, insert the new version. Lesson 67 builds exactly that logic in SQLite's UPDATE+INSERT pair.",
    },
    {
      kind: "tip",
      text: "The naming discipline is load-bearing: *_key columns join; *_id columns identify the natural thing; *_sk are surrogates. Read any warehouse schema's column names and the join graph falls out before you open a single ER diagram.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "A hotel key card, not a house deed. The deed says WHO owns the building (customer_id — the natural key). The key card says who may open door 204 THIS week (customer_sk — the surrogate). Hotels re-key constantly: the guest returns, the card is re-encoded, the lock's ledger keeps every card ever cut with its valid window. Lose the card? The deed still proves ownership. But ask 'who could open 204 on March 3rd?' and only the card ledger answers — half-open windows and all. Facts join by key cards.",
    },
    {
      kind: "engine",
      title: "One fact line's load, end to end",
      steps: [
        "Source row: order 41, line 3 → product 13, quantity 1, unit price 199.99, order date 2024-09-12.",
        "date_key: integer-encode the order date → 20240912; the spine guarantees the row exists.",
        "customer_key: resolve Bruno's version at 2024-09-12 → [2024-08-01, 9999-12-31) → sk 4 (US).",
        "store_key: deterministic spread → ((41−1)×7+3) mod 4 + 1 = 2 (Austin Depot).",
        "Measures: gross = round(199.99×100)×1 = 19999; line id 62… 62 % 8 ≠ 3, no promo; net = 19999.",
        "Receipt: 239 lines loaded = 239 source lines; every key resolves; every window contains its date.",
      ],
    },
    {
      kind: "myth",
      myth: "Surrogate keys are just auto-increment integers.",
      truth:
        "The mechanics overlap; the meaning doesn't. An auto-increment is a storage convenience on the source. A surrogate is a *design contract* on the warehouse: no business meaning, assigned at load, free to version. The proof is dim_customer — customer_id 2 has TWO surrogates (3 and 4), which no auto-increment table would allow.",
    },
    {
      kind: "myth",
      myth: "The star schema is denormalized, so it's 'wrong' by database standards.",
      truth:
        "Normalization optimizes for transactional integrity under churn; the star optimizes for read clarity under load. Dimensions ARE denormalized on purpose (department on dim_product, not a dim_department join chain — that would be snowflaking). Both designs are 'right' for their workload; confusing them is the only wrong move.",
    },
    {
      kind: "edge",
      items: [
        { c: "A product's department changes next quarter. UPDATE dim_product?", r: "That's a business decision about history: if 'Tech' simply improves its taxonomy, UPDATE (SCD Type 0/1) is fine. If reports must remember what it WAS called, version the row like dim_customer (Type 2). The fact never changes either way — only the dimension does." },
        { c: "Two source rows have the same natural key but different people (id collisions after a merger).", r: "The surrogate absorbs it: each becomes its own dimension row with its own sk. Natural keys are the source's problem; the warehouse never re-uses a handle." },
        { c: "Why 9999-12-31 and not NULL for the open end?", r: "The as-of predicate `d < valid_to` must stay uniform. With NULL you'd write COALESCE(valid_to, '9999-12-31') in every query — one forgotten COALESCE silently drops every current-version row. The sentinel makes the invariant load-bearing in the data itself." },
        { c: "Should fact_sales carry customer_name 'for convenience'?", r: "No — that's the wide-table slide. Names change (typo fixes, legal renames); a fact column would freeze the typo into 239 rows. The join is one equality; keep the fact skinny." },
        { c: "The spine has days with zero sales. Why not build it from DISTINCT sale dates?", r: "Because time series must show honest zeros: 'we made $0 on March 3rd' is a finding, not a gap. A sales-derived spine erases the days you'd most want to see. Calendar truth first; the fact fills it in." },
      ],
    },
  ],
  mcqs: mcqBank("l66", MCQS),
  problems: probBankX("l66", PROBS),
  takeaway:
    "Facts hold keys + measures at a declared grain; dimensions hold attributes at their natural cardinality; surrogate keys with half-open validity windows make history queryable — and the whole anatomy is provable with countable receipts (239 = 239 = 239; 0 orphaned keys).",
};
