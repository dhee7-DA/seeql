import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson27: Lesson = {
  id: "lesson-27",
  num: 27,
  title: "Derived tables — a query in FROM",
  blurb: "Group first, join second: wrap an aggregate in parentheses, alias it, and query it like a table",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "A scalar subquery yields a value; an `IN` subquery yields a list. The third placement is the workhorse: a **derived table** — a full `SELECT` wrapped in parentheses, sitting in `FROM`. It produces rows *with columns you named*, and the outer query treats those rows exactly like a table: join it, filter it, order it. The superpower is sequencing — **the aggregation happens first, and whatever joins come afterward see clean, one-row-per-group results.**",
    },
    { kind: "diagram", figure: "q3-two-stage" },
    {
      kind: "code",
      caption: "Who has spent over 1000 lifetime? Group the 103 orders into 16 rows, then join",
      sql: `SELECT c.name, d.spend
FROM customers c
JOIN (
  SELECT customer_id, SUM(total) AS spend
  FROM orders
  GROUP BY customer_id
) d ON d.customer_id = c.id
WHERE d.spend > 1000
ORDER BY d.spend DESC;   -- 8 customers, Alice Chen 7262.35 first`,
    },
    { kind: "h", text: "The rules of the shape" },
    {
      kind: "bullets",
      items: [
        "**Alias it.** The `d` after the closing parenthesis is the table's name — you'll reference `d.spend` in WHERE, ON and ORDER BY. Name the inner aggregates too (`AS spend`): an unaliased `SUM(total)` column can't be reached by name.",
        "The derived table is **uncorrelated** here — computed once, up front, before the join ever runs. (Correlated derived tables don't exist; that's LATERAL territory, out of scope.)",
        "`WHERE d.spend > 1000` filters an *aggregate result* — logically impossible in the inner query's WHERE, trivial once the summary exists as rows. Same power as HAVING, different route: you can also join, sort and reuse it.",
        "Two derived tables in one FROM is legal: `FROM (…) a JOIN (…) b ON …` — the nearest thing to views you can build inside a single statement.",
      ],
    },
    { kind: "h", text: "Why group-then-join beats join-then-group" },
    {
      kind: "bullets",
      items: [
        "Join first and every joined-in column rides along duplicated: group customers *after* joining order_items and each customer's row count is inflated by their line items — the lesson-15 fanout, now corrupting filters and averages.",
        "Derived first: `GROUP BY customer_id` collapses 103 orders to 16 rows **before** anything duplicates. The join is then 1-to-1 — customers (16) to spenders (16) — and fanout never fires.",
        "The store's own warning shot: `SUM(o.total)` over orders joined to order_items reads 103,244.55 — nearly 3× the true 34,833.28. Aggregate before you widen, always.",
      ],
    },
    { kind: "diagram", figure: "q7-fanout-safe" },
    {
      kind: "code",
      caption: "The same shape, one level up: region spend, filtered as rows",
      sql: `SELECT d.region, d.spend
FROM (
  SELECT c.region AS region, SUM(o.total) AS spend
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region
) d
WHERE d.spend > 5000
ORDER BY d.spend DESC;   -- EU 15089.23, APAC 11605.45, US 7286.16`,
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL requires the alias — `FROM (SELECT …)` without a name is a syntax error. So does MySQL. Get in the habit now: every derived table gets a short alias.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite is the lenient one: it will happily run an unaliased derived table. Write the alias anyway — the query travels, and the next engine may be stricter.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL materializes derived tables to an internal temp table before the outer query runs (8.0 merges some simple ones back in). On either engine the *semantics* are identical — stage one, then stage two.",
    },
    {
      kind: "tip",
      text: "Debug a derived table by running the inner SELECT alone. If the 16-row per-customer summary looks right on its own, the outer join-and-filter is the only thing left to blame — and it's 5 lines.",
    },
  ],
  mcqs: [
    {
      id: "l27-q1",
      prompt: "Which engines reject a derived table with no alias?",
      choices: ["All of them", "None — aliases are optional everywhere", "PostgreSQL and MySQL; SQLite tolerates it", "Only SQLite"],
      answer: 2,
      why: "SQLite lets the unnamed table slide; Postgres and MySQL throw a syntax error. Since the alias costs nothing, always write it — `) d ON …` — and the query runs anywhere.",
      notes: [
        { choice: 0, why: "Strictly SQLite is the outlier, not the rule — it accepts the anonymous form. But 'runs on SQLite' is a low bar: alias it for portability." },
      ],
    },
    {
      id: "l27-q2",
      prompt: "When does an uncorrelated derived table compute, relative to the outer JOIN?",
      choices: [
        "After the join — it sees joined rows",
        "Once, up front — the outer query consumes finished rows",
        "Once per outer row",
        "Only if the optimizer feels like it — results differ",
      ],
      answer: 1,
      why: "No outer reference inside means one evaluation before the join. That sequencing is the whole point: groups are already 1-per-customer when the join fans nothing out.",
      notes: [
        { choice: 2, why: "Once-per-row is the correlated scalar's bill. Derived tables can't correlate — they run once and become a plain table." },
      ],
    },
    {
      id: "l27-q3",
      prompt: "Inside the derived table you wrote `SUM(total)` with no alias. The outer query tries `WHERE d.???`. What's available to reference?",
      choices: ["total — the original name survives", "sum_total — engines auto-name it", "Nothing — name it with AS first", "d — the whole row object"],
      answer: 2,
      why: "An unaliased aggregate has no contract name (SQLite invents one, Postgres names it sum, MySQL sum(total)…). Alias it inside — `SUM(total) AS spend` — and the outer query can say `d.spend` on every engine.",
      notes: [
        { choice: 0, why: "total is the raw column; after SUM it has no declared name. The outer query needs the AS alias to reach the computed column." },
      ],
    },
    {
      id: "l27-q4",
      prompt: "Why is join-then-group dangerous but group-then-join (derived) safe against fanout?",
      choices: [
        "Joins are slower than subqueries",
        "GROUP BY after a join groups inflated rows; the derived table aggregates before anything duplicates",
        "Derived tables cache on disk",
        "They're identical — style only",
      ],
      answer: 1,
      why: "Once rows multiply, every aggregate downstream sees duplicates (the 103,244.55 ghost). Pre-grouping to one row per key means the join that follows is 1:1 and cannot multiply anything.",
      notes: [
        { choice: 3, why: "Results can be IDENTICAL for simple sums — and wildly different the moment another one-to-many join enters. The ordering is a correctness tool, not a taste." },
      ],
    },
    {
      id: "l27-q5",
      prompt: "`WHERE spend > 1000` against a derived table's column — what does it filter?",
      choices: [
        "Raw orders before grouping",
        "The aggregate results, one row per group",
        "Customers only",
        "Nothing — WHERE can't see derived columns",
      ],
      answer: 1,
      why: "By the time the outer WHERE runs, the summary IS rows: 16 spenders, 8 above the bar. It's HAVING's power with FROM-level freedom — sort it, join it, reuse it.",
      notes: [
        { choice: 0, why: "The inner query is already finished — its rows are grouped and summed. The outer query never sees raw orders at all." },
      ],
    },
    {
      id: "l27-q6",
      prompt: "What's the essential difference between `WHERE x IN (SELECT …)` and `FROM (SELECT …) d`?",
      choices: [
        "IN is faster",
        "IN consumes a single-column list as a test; FROM consumes whole rows as a table to build on",
        "They're interchangeable spellings",
        "IN runs per row; FROM runs once",
      ],
      answer: 1,
      why: "Placement decides the shape: WHERE-in takes one column and answers membership; FROM takes the full row set — many columns, joined, filtered, ordered — as the new working table.",
      notes: [
        { choice: 3, why: "Uncorrelated, both run once. The difference is what they hand the outer query: a list to test against vs a table to keep working with." },
      ],
    },
    {
      id: "l27-q7",
      prompt: "The busiest month drill: `FROM (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) d ORDER BY n DESC, mon LIMIT 1`. Why the tie-breaker `mon`?",
      choices: [
        "SQLite requires a second ORDER BY key",
        "Two months tie at 9 orders — without it the winner is arbitrary",
        "LIMIT 1 needs sorted dates",
        "It makes the query faster",
      ],
      answer: 1,
      why: "2024-02 and 2024-09 both ran 9 orders. With ties, row order among equals is undefined — `mon` as the second key makes the single-row answer deterministic (February wins on alphabet).",
      notes: [
        { choice: 0, why: "No engine demands a second key — but grading, screenshots and sanity all do. Ties + LIMIT is exactly where nondeterminism bites." },
      ],
    },
    {
      id: "l27-q8",
      prompt: "You need, per region: delivered-only revenue. Where does `WHERE status = 'delivered'` belong in the derived-table plan?",
      choices: [
        "Outer query, after the join",
        "Inside the derived table, before GROUP BY — the aggregation sees only delivered rows",
        "It can't be expressed with a derived table",
        "In a second derived table joined on region",
      ],
      answer: 1,
      why: "Push the filter down into stage one: group the delivered rows only. Filtering after the join also works, but pre-filtering keeps the groups honest and the derived table small.",
      notes: [
        { choice: 2, why: "It's fully expressible — the derived table is just another SELECT with its own WHERE, GROUP BY, even its own joins. That's the flexibility being taught." },
      ],
    },
  ],
  problems: [
    {
      id: "l27-p1",
      title: "The four-figure club",
      brief: "Lifetime spend above 1000 — via a **derived table**: group orders per customer, join to customers for names. Output `name` and `spend` (2 decimals), biggest spender first. Eight qualify.",
      hints: [
        "Stage one: SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id — wrapped in FROM parentheses with an alias.",
        "Shape: SELECT c.name, d.spend FROM customers c JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d ON d.customer_id = c.id WHERE d.spend > <bar> ORDER BY d.spend DESC;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c.name, d.spend\nFROM customers c\nJOIN (\n  SELECT customer_id, SUM(total) AS spend\n  FROM orders\n  GROUP BY customer_id\n) d ON d.customer_id = c.id\nWHERE d.spend > 1000\nORDER BY d.spend DESC;",
      mistakes: [
        { test: "\\bhaving\\b", message: "HAVING would filter inside the grouping — fine SQL, but this drill stages it: the derived table produces the spend rows, the OUTER WHERE does the filtering." },
        { test: "^select\\s+sum\\s*\\(|\\bsum\\s*\\(\\s*total\\s*\\)\\s+as\\s+spend\\s+from\\s+customers", message: "Aggregate orders, not customers — stage one reads FROM orders and groups by customer_id; customers only enters at the join for the name." },
        { test: "\\bjoin\\s+orders\\b(?!.*(group\\s+by))", message: "If orders is joined directly the rows fan out — group them in the parenthesized stage first, then join the 1:1 result to customers." },
      ],
      expected: EXPECTED["l27-p1"],
      ordered: true,
    },
    {
      id: "l27-p2",
      title: "Count the club",
      brief: "Same question as a number: how many customers have lifetime spend above 1000? Keep the derived-table shape, wrap it in a count. Output one column `big_spenders`.",
      hints: [
        "The derived table is unchanged; the outer query becomes SELECT COUNT(*) … FROM customers JOIN (…) d WHERE …",
        "Shape: SELECT COUNT(*) AS big_spenders FROM customers c JOIN (<stage one>) d ON d.customer_id = c.id WHERE d.spend > <bar>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS big_spenders\nFROM customers c\nJOIN (\n  SELECT customer_id, SUM(total) AS spend\n  FROM orders\n  GROUP BY customer_id\n) d ON d.customer_id = c.id\nWHERE d.spend > 1000;",
      mistakes: [
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+from\\s+orders\\b", message: "Counting orders gives 103 — the derived stage collapses them to 16 customers first; count the JOINED rows after the WHERE." },
        { test: "\\bsum\\s*\\(\\s*\\*\\s*\\)", message: "SUM(*) isn't a thing — the count goes in the OUTER query; stage one stays a per-customer SUM(total)." },
        { test: "\\bhaving\\b", message: "The filter lives in the outer WHERE against d.spend — that's the two-stage shape being practiced." },
      ],
      expected: EXPECTED["l27-p2"],
    },
    {
      id: "l27-p3",
      title: "Heavy regions",
      brief: "Regions whose **total revenue** exceeds 5000 — derived table over orders joined to customers, grouped by region. Output `region` and `spend` (2 decimals), biggest first.",
      hints: [
        "Stage one already needs the join (region lives on customers); the derived table wraps that whole GROUP BY, the outer query filters and orders.",
        "Shape: SELECT d.region, d.spend FROM (SELECT c.region AS region, SUM(o.total) AS spend FROM orders o JOIN customers c ON … GROUP BY c.region) d WHERE d.spend > <bar> ORDER BY d.spend DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT d.region, d.spend\nFROM (\n  SELECT c.region AS region, SUM(o.total) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n) d\nWHERE d.spend > 5000\nORDER BY d.spend DESC;",
      mistakes: [
        { test: "\\bwhere\\s+spend\\b", message: "The bare alias won't resolve — the derived table's column is reached through its alias: WHERE d.spend > 5000. (A WHERE on a grouped aggregate never runs — that's the staging problem this drill fixes.)" },
        { test: "\\bhaving\\b", message: "HAVING inside the derived table would work — but the drill stages it: group inside, filter outside on the named column d.spend." },
        { test: "\\bcity\\b|\\bname\\s+as\\s+region", message: "Regions, not cities — region is a column of customers (EU, APAC, US, LATAM); group by it, don't select customer names." },
      ],
      expected: EXPECTED["l27-p3"],
      ordered: true,
    },
    {
      id: "l27-p4",
      title: "The regulars",
      brief: "Customers with **at least 10 orders**: derived table counting orders per customer, joined back for names. Output `name` and `orders`, busiest first.",
      hints: [
        "Stage one: COUNT(*) per customer_id. Stage two: join customers, keep counts ≥ 10.",
        "Shape: SELECT c.name, d.orders FROM customers c JOIN (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) d ON … WHERE d.orders >= <bar> ORDER BY d.orders DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name, d.orders\nFROM customers c\nJOIN (\n  SELECT customer_id, COUNT(*) AS orders\n  FROM orders\n  GROUP BY customer_id\n) d ON d.customer_id = c.id\nWHERE d.orders >= 10\nORDER BY d.orders DESC;",
      mistakes: [
        { test: "count\\s*\\(\\s*o\\.id\\s*\\)\\s+as\\s+orders\\s+from\\s+customers", message: "That shape works with GROUP BY on the join — but the drill groups INSIDE the derived table (one row per customer_id), then joins for the name." },
        { test: ">\\s*10\\b", message: "Boundary check — 'at least 10' includes 10; the comparison is >=. (It changes nothing today, but it's the habit that survives.)" },
        { test: "\\bhaving\\b", message: "Two routes again — this one stages: COUNT inside the derived table, WHERE d.orders outside." },
      ],
      expected: EXPECTED["l27-p4"],
      ordered: true,
    },
    {
      id: "l27-p5",
      title: "Above their category",
      brief: "Products priced above **their own category's average**: derived table averaging price per category, joined back to products. Output `name`, `price`, `category`, priciest first. Seven products.",
      hints: [
        "Stage one: category, AVG(price) — two columns, seven rows. Stage two: join products ON category, compare price to the borrowed average.",
        "Shape: SELECT p.name, p.price, p.category FROM products p JOIN (SELECT category, AVG(price) AS avg_price FROM products GROUP BY category) a ON a.category = p.category WHERE p.price > a.avg_price ORDER BY p.price DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT p.name, p.price, p.category\nFROM products p\nJOIN (\n  SELECT category, AVG(price) AS avg_price\n  FROM products\n  GROUP BY category\n) a ON a.category = p.category\nWHERE p.price > a.avg_price\nORDER BY p.price DESC;",
      mistakes: [
        { test: "select\\s+avg\\s*\\(\\s*price\\s*\\)\\s+from\\s+products\\s*\\)", message: "One storewide average answers the lesson-25 question — the brief compares against each CATEGORY's own average, so the derived table groups by category." },
        { test: "\\bgroup\\s+by\\s+p\\.category\\b(?![^;]*derived)", message: "One GROUP BY can't compare a row to its group's average — the average must arrive as a JOINable column from the derived stage." },
        { test: "\\bhaving\\b", message: "HAVING filters whole groups, not the rows inside them — this question keeps individual products, so the comparison rides on the joined average." },
      ],
      expected: EXPECTED["l27-p5"],
      ordered: true,
    },
    {
      id: "l27-p6",
      title: "The busiest month",
      brief: "Which month took the most orders? Derived table: month bucket + count, then pick the top row. Output `mon` (like `2024-02`) and `n`. Break ties by earlier month.",
      hints: [
        "Stage one: strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n, grouped by mon. Stage two: ORDER BY n DESC, mon ASC LIMIT 1.",
        "Shape: SELECT d.mon, d.n FROM (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) d ORDER BY d.n DESC, d.mon LIMIT 1;",
      ],
      difficulty: "hard",
      solution:
        "SELECT d.mon, d.n\nFROM (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders\n  GROUP BY mon\n) d\nORDER BY d.n DESC, d.mon\nLIMIT 1;",
      mistakes: [
        { test: "\\blimit\\s+1\\s*$", message: "LIMIT 1 without the sort is a coin flip — order by n DESC first, then mon ASC so the tie resolves deterministically." },
        { test: "\\bsubstr\\s*\\(\\s*created_at", message: "SUBSTR slices by position — strftime('%Y-%m', created_at) is the date-aware bucket: it reads the calendar, not character offsets." },
        { test: "\\bmax\\s*\\(\\s*n\\s*\\)", message: "MAX(n) returns the number 9, not the month it belongs to — order the derived rows and take the top one instead." },
      ],
      expected: EXPECTED["l27-p6"],
      ordered: true,
    },
    {
      id: "l27-p7",
      title: "Above the store average",
      brief: "Customers whose **average order** beats the storewide average order (338.19, but compute it live). Derived table: per-customer averages; compare against a scalar subquery; join for names. Output `name` and `avg_total` (2 decimals), highest first.",
      hints: [
        "Two subquery kinds in one query: the derived table makes 16 per-customer averages; the scalar in WHERE computes the storewide one.",
        "Shape: SELECT c.name, d.avg_total FROM customers c JOIN (SELECT customer_id, AVG(total) AS avg_total FROM orders GROUP BY customer_id) d ON … WHERE d.avg_total > (SELECT AVG(total) FROM orders) ORDER BY d.avg_total DESC;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name, ROUND(d.avg_total, 2) AS avg_total\nFROM customers c\nJOIN (\n  SELECT customer_id, AVG(total) AS avg_total\n  FROM orders\n  GROUP BY customer_id\n) d ON d.customer_id = c.id\nWHERE d.avg_total > (SELECT AVG(total) FROM orders)\nORDER BY d.avg_total DESC;",
      mistakes: [
        { test: "having\\s+avg\\s*\\(\\s*total\\s*\\)\\s*>\\s*\\(\\s*select\\s+avg", message: "That's the HAVING route — legitimate, but the drill stages it: per-customer averages as a derived table, storewide average as the scalar, both meeting in the outer WHERE." },
        { test: "^select\\s+avg\\s*\\(\\s*total\\s*\\)\\s+as\\s+avg_total\\s+from\\s+orders\\s*;", message: "One storewide average alone isn't the answer — it must be computed PER CUSTOMER first (16 averages), then compared against the storewide one." },
        { test: "\\bgroup\\s+by\\s+c\\.name\\b", message: "Group orders by customer_id inside the derived table — names join in afterwards; grouping the joined rows directly reopens the fanout door." },
      ],
      expected: EXPECTED["l27-p7"],
      ordered: true,
    },
    {
      id: "l27-p8",
      title: "Delivered, by region",
      brief: "Delivered-only revenue per region, **filtered inside the derived table** (push the WHERE down): keep regions whose delivered revenue exceeds 3000. Output `region` and `delivered_spend` (2 decimals), biggest first.",
      hints: [
        "Stage one: join orders→customers, WHERE status = 'delivered' BEFORE grouping, group by region. Stage two: filter and sort the summary rows.",
        "Shape: SELECT d.region, d.delivered_spend FROM (SELECT c.region AS region, SUM(o.total) AS delivered_spend FROM orders o JOIN customers c ON … WHERE o.status = '<status>' GROUP BY c.region) d WHERE d.delivered_spend > <bar> ORDER BY d.delivered_spend DESC;",
      ],
      difficulty: "hard",
      solution:
        "SELECT d.region, d.delivered_spend\nFROM (\n  SELECT c.region AS region, SUM(o.total) AS delivered_spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  WHERE o.status = 'delivered'\n  GROUP BY c.region\n) d\nWHERE d.delivered_spend > 3000\nORDER BY d.delivered_spend DESC;",
      mistakes: [
        { test: "group\\s+by[^;]*status", message: "Grouping by status answers a different report — the brief groups by REGION and uses status only as a pre-filter inside the derived table." },
        { test: "where\\s+d\\.delivered_spend\\s+>[^;]*'delivered'", message: "The status filter belongs INSIDE the parentheses (pre-aggregation); the outer WHERE only cuts the summary rows below the bar." },
        { test: "\\bhaving\\s+status", message: "HAVING runs after grouping and can't re-filter raw status rows meaningfully — push `status = 'delivered'` into the derived table's WHERE, before GROUP BY." },
      ],
      expected: EXPECTED["l27-p8"],
      ordered: true,
    },
  ],
  takeaway: "A derived table stages the aggregation as a real table — alias it, name its columns, and the outer query joins and filters clean one-row-per-group results that fanout can never touch.",
};
