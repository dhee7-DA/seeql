import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson31: Lesson = {
  id: "lesson-31",
  num: 31,
  title: "Windows I — rank without collapsing",
  blurb: "OVER, PARTITION BY and the three rankers: ROW_NUMBER, RANK, DENSE_RANK — plus top-N-per-group",
  minutes: 14,
  blocks: [
    {
      kind: "p",
      text: "Every aggregate you've met collapses: 16 customers in, one SUM out. **Window functions** compute across rows too — but each row *keeps its identity*. `RANK() OVER (ORDER BY spend DESC)` looks at all 16 spends to place each customer, then hands back 16 rows: the value, the crowd's context, and its position in line. This is the machinery behind leaderboards, top-N lists and 'best in category' reports — and it's the last major SQL family this course promised you.",
    },
    { kind: "diagram", figure: "t3-ranked" },
    {
      kind: "code",
      caption: "The spend leaderboard — 16 rows in, 16 rows out, each wearing its rank",
      sql: `SELECT c.name,
       ROUND(SUM(o.total), 2) AS spend,
       RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY rk;   -- Alice Chen 7262.35 is #1 … Olivia Brown 444.80 is #16`,
    },
    { kind: "h", text: "The three rankers — same data, different tie policy" },
    {
      kind: "table",
      headers: ["function", "on ties", "after a 5-way tie at 1", "use it for"],
      rows: [
        ["ROW_NUMBER()", "arbitrary but unique", "6", "top-N, dedupe-one-of"],
        ["RANK()", "tied, then a GAP", "6", "leaderboards, sport-style"],
        ["DENSE_RANK()", "tied, no gaps", "2", "tiers and levels"],
      ],
      caption: "All three: fn() OVER (ORDER BY …)",
    },
    {
      kind: "bullets",
      items: [
        "Rank by **region name** and the tie is engineered for you: five APAC customers share rank 1 — the EU block then sits at **RANK 6** (positions 1–5 taken) but **DENSE_RANK 2** (second tie group). Same query, one word apart.",
        "`ROW_NUMBER()` has no ties at all — five APAC rows get 1, 2, 3, 4, 5 in whatever order the engine walks. Never rely on its order without an explicit, fully-deterministic ORDER BY inside OVER.",
        "`ORDER BY` **inside** OVER defines the ranking; `ORDER BY` outside defines the presentation. Two different sorts — both usually wanted.",
      ],
    },
    { kind: "diagram", figure: "t7-partition-rank" },
    { kind: "h", text: "PARTITION BY — a leaderboard per group" },
    {
      kind: "code",
      caption: "Ranks restart inside each region",
      sql: `SELECT c.name, c.region,
       RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS rk_in_region
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;`,
    },
    { kind: "h", text: "Top-N per group — the pattern you came for" },
    {
      kind: "code",
      caption: "Best order per customer — the window runs in a CTE, the filter runs after",
      sql: `WITH ranked AS (
  SELECT c.name, o.id AS order_id, o.total,
         ROW_NUMBER() OVER (PARTITION BY o.customer_id
                            ORDER BY o.total DESC, o.id) AS rn
  FROM orders o JOIN customers c ON c.id = o.customer_id
)
SELECT name, order_id, total FROM ranked
WHERE rn = 1 ORDER BY total DESC;   -- Farid #74 1088.44 … 16 rows`,
    },
    {
      kind: "warn",
      text: "`WHERE rn = 1` cannot live in the same SELECT as the window call — WHERE runs BEFORE window functions are computed. Wrap the window in a CTE or derived table and filter outside; that two-step shape is not stylistic, it's the law of SQL's evaluation order.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Window functions landed in SQLite 3.25 (2018) — every engine this course touches has them, including the browser runtime.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL grew windows in 8.0 (2018) too. Pre-8.0 code emulates this lesson with correlated MAX subqueries (lesson 26) or self-joins — every pre-window query in module 4 is also the fallback spelling.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres adds window *named windows* (WINDOW clause) and tuple-wise cousins like `percent_rank()`. The core three rankers behave identically across all engines — ties and all.",
    },
    {
      kind: "tip",
      text: "The pre-window spelling you learned in lessons 26–28 (correlated MAX per group) answers the same top-per-group questions. Reach for windows when you need the RANKING itself; reach for the correlated form when you only need the winner's row.",
    },
  ],
  mcqs: [
    {
      id: "l31-q1",
      prompt: "What is the essential difference between `SUM(total) GROUP BY customer_id` and `SUM(total) OVER (PARTITION BY customer_id)`?",
      choices: [
        "The window version is faster",
        "GROUP BY collapses to one row per customer; OVER stamps the sum on every original row",
        "They return identical row sets",
        "OVER can't be used with SUM",
      ],
      answer: 1,
      why: "Same arithmetic, different shape: GROUP BY emits 16 summary rows; the window keeps all 103 order rows, each annotated with its owner's total.",
      notes: [
        { choice: 2, why: "The row COUNTS differ — 16 vs 103. The per-customer VALUES agree, but the windows preserve the rows underneath." },
      ],
    },
    {
      id: "l31-q2",
      prompt: "Five APAC customers tie on region. ROW_NUMBER gives them…",
      choices: ["Five 1s", "1, 2, 3, 4, 5 — unique, arbitrary order", "One 1 and four NULLs", "An error — ties break it"],
      answer: 1,
      why: "ROW_NUMBER never repeats a number — ties are broken arbitrarily unless your ORDER BY inside OVER is fully deterministic (add a tiebreaker column to control it).",
      notes: [
        { choice: 0, why: "Five 1s is RANK/DENSE_RANK territory. ROW_NUMBER's contract is uniqueness — that's why top-N-per-group filters use rn = 1." },
      ],
    },
    {
      id: "l31-q3",
      prompt: "The first tie group holds 5 rows. What rank does the NEXT row get from RANK()?",
      choices: ["2", "5", "6", "1"],
      answer: 2,
      why: "RANK counts positions: five rows occupy positions 1–5, so the next row is position 6 — the gap IS the message: 'five people tied ahead of you'.",
      notes: [
        { choice: 0, why: "That's DENSE_RANK — no gaps, next tie group is 2. Same input, opposite philosophy about what the numbers mean." },
      ],
    },
    {
      id: "l31-q4",
      prompt: "Which ranking function suits *membership tiers* — gold/silver/bronze levels with no skipped level numbers?",
      choices: ["ROW_NUMBER()", "RANK()", "DENSE_RANK()", "NTILE()"],
      answer: 2,
      why: "DENSE_RANK packs tie groups with no gaps — tier 2 follows tier 1 directly regardless of how many people tied. RANK would skip (1, 1, 3…), inventing a tier that nobody holds.",
      notes: [
        { choice: 3, why: "NTILE buckets by COUNT, not by value ties — a different job (quartiles), arriving in the next lesson." },
      ],
    },
    {
      id: "l31-q5",
      prompt: "`WHERE rn = 1` written in the same SELECT as `ROW_NUMBER() OVER (…) AS rn` fails. Why?",
      choices: [
        "Windows can't be aliased",
        "WHERE evaluates before window functions — rn doesn't exist yet",
        "rn needs a table prefix",
        "SQLite doesn't allow row numbers in WHERE",
      ],
      answer: 1,
      why: "SQL's logical order runs WHERE first, windows later. The fix is structural: compute the window in a CTE/derived table, filter in the outer query — the two-step top-N pattern.",
      notes: [
        { choice: 3, why: "The engine fully supports windows — the failure is evaluation ORDER, which is why wrapping (not tweaking) fixes it on every engine." },
      ],
    },
    {
      id: "l31-q6",
      prompt: "What does PARTITION BY change about RANK()?",
      choices: [
        "It sorts the final output",
        "It restarts the ranking inside each group",
        "It removes ties",
        "It collapses each group to one row",
      ],
      answer: 1,
      why: "PARTITION BY slices rows into independent leagues — each region's ranks run 1..N afresh. It's GROUP BY's segmentation without the collapsing.",
      notes: [
        { choice: 0, why: "Presentation order is still the outer ORDER BY's job. PARTITION only defines the scope the ranking resets within." },
      ],
    },
    {
      id: "l31-q7",
      prompt: "Ranking months by order count, two months tie at 9 orders. How many distinct rank numbers does RANK() output across the 14 months?",
      choices: ["14 — no ties on counts", "12 — the tie merges two numbers", "4 — one per count value 6, 7, 8, 9", "13"],
      answer: 2,
      why: "Counts here are only {6, 7, 8, 9} — DENSE_RANK would yield exactly 4 distinct numbers, and RANK's first three groups land on 1, 3, 7. The tie structure, not the row count, drives it.",
      notes: [
        { choice: 1, why: "RANK doesn't merge ties — it keeps them EQUAL and then skips: ranks 1 (×2), 3 (×4), 7 (×5), 12 (×3). Distinct numbers: still 4." },
      ],
    },
    {
      id: "l31-q8",
      prompt: "Which engine pair GATES this lesson's syntax in legacy codebases?",
      choices: [
        "SQLite pre-3.25 and MySQL pre-8.0 lack windows entirely",
        "Postgres lacks PARTITION BY",
        "Windows are a SQL Server extension",
        "All engines have had windows since 2005",
      ],
      answer: 0,
      why: "Both holdouts caught up in 2018 — SQLite 3.25 and MySQL 8.0. Everything newer (this app's engine included) runs the full window family natively.",
      notes: [
        { choice: 2, why: "Windows are core SQL:2003 standard features — SQL Server popularized them early, but every major engine implements them now." },
      ],
    },
    {
      id: "l31-q9",
      prompt: "Two customers tie with the same order count. What does ROW_NUMBER do with the tie?",
      choices: [
        "Gives both the same number",
        "Assigns distinct consecutive numbers anyway — the tie is broken arbitrarily (add your own tie-breaker to control it)",
        "Skips the second row entirely",
        "Errors on the tie",
      ],
      answer: 1,
      why: "ROW_NUMBER's contract is uniqueness: 1, 2, 3, … with no repeats and no gaps, ties be damned. Which of the tied rows gets the lower number is unspecified — `ORDER BY orders DESC, name` would pin it down.",
      notes: [
        { choice: 0, why: "Same numbers is RANK's behavior. If the output must be unique (paging, deduping), ROW_NUMBER is the tool — at the price of an arbitrary tie order." },
      ],
    },
    {
      id: "l31-q10",
      prompt: "In the APAC ranking, Farid and Hiro tie. Hiro is ROW_NUMBER 5. What is his RANK()?",
      choices: ["5 — RANK equals ROW_NUMBER", "4 — RANK gives tied rows the same rank", "6 — RANK skips ahead after ties", "NULL — ties are unrankable"],
      answer: 1,
      why: "RANK counts rows strictly ahead plus one: Farid and Hiro both sit behind exactly 3 APAC customers, so both are rank 4. ROW_NUMBER kept them 4 and 5; RANK lets them share 4.",
      notes: [
        { choice: 2, why: "6 is what a row AFTER this tie would receive — RANK jumps from 4 to 6 (five rows at-or-ahead), DENSE_RANK would hand it 5. Hiro isn't after the tie; he's inside it, at 4." },
      ],
    },
    {
      id: "l31-q11",
      prompt: "`ROW_NUMBER() OVER (PARTITION BY region ORDER BY total_spent DESC)` on customers — how many rows receive the number 1?",
      choices: ["1 — one global number one", "4 — one per region (EU, APAC, US, LATAM)", "16 — every row is someone's number 1", "0 — PARTITION needs an aggregate"],
      answer: 1,
      why: "PARTITION BY restarts the numbering inside each region. Four regions means four independent sequences — four number-1s, each the top spender of their own region.",
      notes: [
        { choice: 0, why: "That's the no-PARTITION spelling: one global race across all 16 customers. The partition is what turns a leaderboard into per-group leaderboards." },
      ],
    },
    {
      id: "l31-q12",
      prompt: "You computed `ROW_NUMBER() OVER (ORDER BY total DESC) AS rn` and now want only rn ≤ 3. Why does `WHERE rn <= 3` on the same query level fail?",
      choices: [
        "rn is a reserved name",
        "Window functions evaluate after WHERE — the number doesn't exist yet when WHERE runs; wrap the query and filter outside",
        "WHERE can't compare numbers",
        "It works — rn is just another alias",
      ],
      answer: 1,
      why: "Windows run in the SELECT stage, after FROM/WHERE/GROUP/HAVING have done their jobs. The standard move: put the ROW_NUMBER in a derived table or CTE, then filter `rn <= 3` in the outer query — the top-N-per-group pattern.",
      notes: [
        { choice: 3, why: "Other aliases from the SELECT list are also off-limits to WHERE (clause ordering). The difference here: even engines that resolve aliases won't materialize a window mid-WHERE." },
      ],
    },
    {
      id: "l31-q13",
      prompt: "The top-1-product-per-category query (ROW_NUMBER partitioned by category, filtered rn = 1) returns how many rows for this store's 7 categories?",
      choices: ["1 — one global top product", "7 — exactly one row per category", "16 — every product once", "It depends on ties"],
      answer: 1,
      why: "rn = 1 exists once per partition: seven categories, seven winners — Audio's Noise-Canceling Headset, Wearables' Smart Watch S, and five more. Partition + rn filter = per-group champion query.",
      notes: [
        { choice: 3, why: "ROW_NUMBER can't tie — the ORDER BY inside OVER decides the winner even when revenues are equal. (RANK would return two rows for a tied top spot.)" },
      ],
    },
    {
      id: "l31-q14",
      prompt: "`ORDER BY total` with several NULL totals in SQLite — where do the NULL rows land by default?",
      choices: [
        "First — SQLite sorts NULLs before everything in ascending order",
        "Last — NULL is treated as the biggest value",
        "They're dropped from the sort",
        "Randomly",
      ],
      answer: 0,
      why: "SQLite's default (ascending) puts NULLs first. `NULLS LAST` — or sorting DESC where they naturally sink — is how you push the missing-data rows to the report's bottom.",
      notes: [
        { choice: 1, why: "That's PostgreSQL's default (NULLS LAST for ASC). Engines disagree — spell your intention with NULLS FIRST/LAST instead of relying on the house rule." },
      ],
    },
  ],
  problems: [
    {
      id: "l31-p1",
      title: "The spend leaderboard",
      brief: "Rank every customer by lifetime spend: output `name`, `spend` (2 decimals) and `rk` from RANK() OVER (ORDER BY spend DESC), leaderboard order. Sixteen rows.",
      hints: [
        "The rank rides on the aggregate — RANK() OVER (ORDER BY SUM(o.total) DESC) alongside the grouped SUM.",
        "Shape: SELECT c.name, ROUND(SUM(o.total), 2) AS spend, RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk FROM customers c JOIN orders o ON … GROUP BY c.id ORDER BY rk;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c.name, ROUND(SUM(o.total), 2) AS spend,\n  RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY rk;",
      mistakes: [
        { test: "\\brow_number\\s*\\(", message: "ROW_NUMBER works (no ties here) — but the brief names RANK, and leaderboards are RANK's contract when ties DO appear." },
        { test: "\\bgroup\\s+by\\b[^;]*\\brank\\s*\\(\\s*\\)\\s+over\\s*\\(\\s*\\)", message: "The window needs the same ORDER BY as the leaderboard: OVER (ORDER BY SUM(o.total) DESC) — an empty OVER ranks everyone 1." },
        { test: "order\\s+by\\s+spend\\s+desc\\s*;", message: "Sort by the rank column (rk) — after this lesson, the rank IS the presentation order." },
      ],
      expected: EXPECTED["l31-p1"],
      ordered: true,
    },
    {
      id: "l31-p2",
      title: "Top five, numbered",
      brief: "The five biggest orders, each wearing its row number: output `id`, `total`, and `rn` from ROW_NUMBER() OVER (ORDER BY total DESC), top 5 only.",
      hints: [
        "ROW_NUMBER over the whole table, then LIMIT 5 on the outside — the window and the LIMIT are different layers.",
        "Shape: SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn FROM orders ORDER BY rn LIMIT 5;",
      ],
      difficulty: "easy",
      solution:
        "SELECT id, total,\n  ROW_NUMBER() OVER (ORDER BY total DESC) AS rn\nFROM orders\nORDER BY rn\nLIMIT 5;",
      mistakes: [
        { test: "\\brank\\s*\\(\\s*\\)", message: "RANK would also work (totals are unique here) — the brief asks for ROW_NUMBER, the no-ties numberer." },
        { test: "over\\s*\\(\\s*\\)", message: "An empty OVER leaves the numbering unordered — ROW_NUMBER needs ORDER BY total DESC inside the OVER to know which five rows lead." },
        { test: "\\bpartition\\s+by\\b", message: "No partition — this leaderboard spans the whole table; PARTITION would restart numbering per customer." },
      ],
      expected: EXPECTED["l31-p2"],
      ordered: true,
    },
    {
      id: "l31-p3",
      title: "Ties, both ways",
      brief: "The tie laboratory: for every customer output `name`, `region`, `rk` = RANK() OVER (ORDER BY region) and `drk` = DENSE_RANK() OVER (ORDER BY region). Sort by rk, then name. Watch the APAC block.",
      hints: [
        "Two windows over the same ORDER BY — one skips after ties, one packs. No aggregate, no join: FROM customers suffices.",
        "Shape: SELECT name, region, RANK() OVER (ORDER BY region) AS rk, DENSE_RANK() OVER (ORDER BY region) AS drk FROM customers ORDER BY rk, name;",
      ],
      difficulty: "medium",
      solution:
        "SELECT name, region,\n  RANK() OVER (ORDER BY region) AS rk,\n  DENSE_RANK() OVER (ORDER BY region) AS drk\nFROM customers\nORDER BY rk, name;",
      mistakes: [
        { test: "\\bpartition\\s+by\\b", message: "No partitioning — one league over all 16 rows; PARTITION would restart the ranks per region and erase the very gap being demonstrated." },
        { test: "\\brow_number\\s*\\(", message: "ROW_NUMBER would break the ties and hide the gap — the lab needs RANK (skips) beside DENSE_RANK (packs)." },
        { test: "\\bgroup\\s+by\\b", message: "Nothing aggregates — every customer row survives, annotated by two window calls." },
      ],
      expected: EXPECTED["l31-p3"],
      ordered: true,
    },
    {
      id: "l31-p4",
      title: "Regional podiums",
      brief: "Spend rank WITHIN each region: output `name`, `region`, `spend` (2 decimals) and `rk_in_region` from RANK() OVER (PARTITION BY region ORDER BY spend DESC). Sort by region, then rank.",
      hints: [
        "The window partitions by region while the underlying query still groups by customer — both levels in one query.",
        "Shape: SELECT c.name, c.region, ROUND(SUM(o.total), 2) AS spend, RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS rk_in_region FROM customers c JOIN orders o ON … GROUP BY c.id ORDER BY c.region, rk_in_region;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name, c.region, ROUND(SUM(o.total), 2) AS spend,\n  RANK() OVER (PARTITION BY c.region\n               ORDER BY SUM(o.total) DESC) AS rk_in_region\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY c.region, rk_in_region;",
      mistakes: [
        { test: "over\\s*\\(\\s*order\\s+by\\s+sum\\s*\\(\\s*o\\.total\\s*\\)\\s+desc\\s*\\)\\s+as\\s+rk_in_region\\s*$", message: "Without PARTITION BY region you get one global league — the brief wants ranks that restart inside each region." },
        { test: "partition\\s+by\\s+c\\.name", message: "Partitioning by name gives a league of one — everyone is rank 1. The partition is the REGION." },
        { test: "group\\s+by\\s+c\\.region", message: "Grouping by region collapses customers away — group by c.id (the person), partition the WINDOW by region." },
      ],
      expected: EXPECTED["l31-p4"],
      ordered: true,
    },
    {
      id: "l31-p5",
      title: "Their best day",
      brief: "Each customer's biggest single order — the top-N-per-group pattern: ROW_NUMBER partitioned by customer in a CTE, outer WHERE rn = 1. Output `name`, `order_id`, `total`, biggest total first. Sixteen rows.",
      hints: [
        "Stage one ranks that customer's orders by total DESC; stage two keeps rn = 1. The tie-breaker o.id keeps it deterministic.",
        "Shape: WITH ranked AS (SELECT c.name, o.id AS order_id, o.total, ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.total DESC, o.id) AS rn FROM orders o JOIN customers c ON c.id = o.customer_id) SELECT name, order_id, total FROM ranked WHERE rn = 1 ORDER BY total DESC;",
      ],
      difficulty: "hard",
      solution:
        "WITH ranked AS (\n  SELECT c.name, o.id AS order_id, o.total,\n    ROW_NUMBER() OVER (PARTITION BY o.customer_id\n                       ORDER BY o.total DESC, o.id) AS rn\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n)\nSELECT name, order_id, total FROM ranked\nWHERE rn = 1\nORDER BY total DESC;",
      mistakes: [
        { test: "where\\s+rn\\s*=\\s*1[^;]*\\brow_number", message: "The filter and the window can't share a SELECT — rn doesn't exist until after WHERE. The CTE computes it; the outer query filters it." },
        { test: "\\bmax\\s*\\(\\s*total\\s*\\)", message: "MAX(total) per customer finds the VALUE but loses which order row it came from — the window keeps the row and its rank together." },
        { test: "\\bpartition\\s+by\\s+c\\.region", message: "Partition by customer (o.customer_id) — the brief is per-person bests, not regional ones." },
      ],
      expected: EXPECTED["l31-p5"],
      ordered: true,
    },
    {
      id: "l31-p6",
      title: "Category champions, windowed",
      brief: "The top-earning product per category, via the window pattern: revenue per product (from order_items joined to products), ROW_NUMBER partitioned by category, keep rn = 1. Output `category`, `name`, `rev` (2 decimals), by revenue descending. Seven rows.",
      hints: [
        "The CTE groups revenue per product (GROUP BY p.id) and ranks within category; the outer query keeps the champions.",
        "Shape: WITH rev AS (SELECT p.category AS category, p.name AS name, SUM(oi.quantity * oi.unit_price) AS r, ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS rn FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id) SELECT category, name, ROUND(r, 2) AS rev FROM rev WHERE rn = 1 ORDER BY r DESC;",
      ],
      difficulty: "hard",
      solution:
        "WITH rev AS (\n  SELECT p.category AS category, p.name AS name,\n    SUM(oi.quantity * oi.unit_price) AS r,\n    ROW_NUMBER() OVER (PARTITION BY p.category\n                       ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS rn\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id\n)\nSELECT category, name, ROUND(r, 2) AS rev FROM rev\nWHERE rn = 1\nORDER BY r DESC;",
      mistakes: [
        { test: "group\\s+by\\s+p\\.category", message: "Grouping by category merges the products — revenue must be per PRODUCT (GROUP BY p.id); the window partitions by category on top." },
        { test: "where\\s+rn\\s*=\\s*1[^;]*over", message: "Same-level filtering can't see the window — rn is computed after WHERE. CTE first, filter second." },
        { test: "\\brank\\s*\\(\\s*\\)\\s+over\\s*\\(\\s*partition", message: "RANK works when revenues are tie-free — ROW_NUMBER is the deterministic choice the brief names, immune to surprise ties." },
      ],
      expected: EXPECTED["l31-p6"],
      ordered: true,
    },
    {
      id: "l31-p7",
      title: "Month ranks, gaps and all",
      brief: "Rank months by order count (fewest rows = rank 1? No — most orders = rank 1): output `mon`, `n`, and `rk` = RANK() OVER (ORDER BY n DESC). Sort by rk, then mon. Study the ties: two months share rank 1.",
      hints: [
        "Bucket months first (a CTE gives mon + n), then rank the buckets — windows over grouped results live in the next query level.",
        "Shape: WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, n, RANK() OVER (ORDER BY n DESC) AS rk FROM monthly ORDER BY rk, mon;",
      ],
      difficulty: "hard",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon, n, RANK() OVER (ORDER BY n DESC) AS rk\nFROM monthly\nORDER BY rk, mon;",
      mistakes: [
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+over", message: "COUNT(*) OVER would keep 103 raw order rows — the buckets come first (CTE), the ranking rides on the 14 monthly counts." },
        { test: "dense_rank", message: "DENSE_RANK packs 1,2,3… — the brief wants RANK's gaps visible: 1, 1, then 3." },
        { test: "order\\s+by\\s+n\\s+desc\\s*;", message: "The presentation sort is rk (then mon) — the n DESC lives INSIDE the OVER, not outside." },
      ],
      expected: EXPECTED["l31-p7"],
      ordered: true,
    },
    {
      id: "l31-p8",
      title: "Price positions",
      brief: "Rank the catalog by price, priciest first: output `name`, `price`, and `rk` from RANK() OVER (ORDER BY price DESC), rank order. Sixteen rows.",
      hints: [
        "One table, one window, no aggregation — the purest form of the pattern.",
        "Shape: SELECT name, price, RANK() OVER (ORDER BY price DESC) AS rk FROM products ORDER BY rk;",
      ],
      difficulty: "medium",
      solution:
        "SELECT name, price,\n  RANK() OVER (ORDER BY price DESC) AS rk\nFROM products\nORDER BY rk;",
      mistakes: [
        { test: "order\\s+by\\s+price\\s+desc\\s*;", message: "That sorts without ranking — the brief wants the rk column: RANK() OVER (ORDER BY price DESC), presented by rank." },
        { test: "\\bpartition\\s+by\\s+category", message: "No partitions — one global price league across the whole catalog." },
        { test: "row_number", message: "ROW_NUMBER is fine on tie-free data — the brief names RANK for the leaderboard contract when ties appear." },
      ],
      expected: EXPECTED["l31-p8"],
      ordered: true,
    },
  ],
  takeaway: "OVER computes across rows without collapsing them — ROW_NUMBER for unique positions, RANK for leaderboards with gaps, DENSE_RANK for gapless tiers, PARTITION BY for a league per group, and top-N-per-group always filters OUTSIDE the window.",
};
