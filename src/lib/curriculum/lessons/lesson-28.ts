import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson28: Lesson = {
  id: "lesson-28",
  num: 28,
  title: "CTEs — WITH, the readable subquery",
  blurb: "Name your inner queries, chain them top-down, and build reports one honest step at a time",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "The derived table earned its keep but buried the logic mid-query: by the time you read `JOIN (SELECT … GROUP BY …) d`, you're three levels deep in parentheses. **CTEs** — Common Table Expressions — fix the reading order: `WITH name AS (SELECT …)` declares the inner query *first*, gives it a name, and the main query runs afterward, using that name like a table. Same machinery as a derived table; radically better ergonomics.",
    },
    { kind: "diagram", figure: "q4-staging" },
    {
      kind: "code",
      caption: "The region-spend report, staged: build the summary, then read it",
      sql: `WITH region_spend AS (
  SELECT c.region AS region, SUM(o.total) AS spend
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region
)
SELECT region, spend FROM region_spend
ORDER BY spend DESC;   -- EU 15089.23 · APAC 11605.45 · US 7286.16 · LATAM 852.44`,
    },
    { kind: "h", text: "Why WITH beats buried parentheses" },
    {
      kind: "bullets",
      items: [
        "**Top-down reading.** The reader meets the data before the question. A derived table forces inside-out decoding; a CTE reads like a recipe.",
        "**One name, many uses.** The main query (and any *later* CTE) can reference `region_spend` repeatedly — a derived table would have to be pasted twice.",
        "**Chaining.** A second CTE may build on the first: `WITH spend AS (…), big AS (SELECT * FROM spend WHERE s > 2000)` — each stage a small, testable query. Forward references only: later CTEs can see earlier ones, never the reverse.",
        "**Debugging.** Comment out the final SELECT, run the CTE alone — every stage is runnable in isolation. That's what 'common table' buys: named, inspectable steps.",
      ],
    },
    { kind: "diagram", figure: "q8-cte-chain" },
    {
      kind: "code",
      caption: "A two-CTE chain: 16 customers → 5 big spenders → 5 named rows",
      sql: `WITH spend AS (
  SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id
), big AS (
  SELECT * FROM spend WHERE s > 2000
)
SELECT c.name, b.s
FROM big b JOIN customers c ON c.id = b.customer_id
ORDER BY b.s DESC;   -- Alice, Emma, Grace, Maya, Chloe`,
    },
    { kind: "h", text: "Scope, order and the fine print" },
    {
      kind: "bullets",
      items: [
        "A CTE lives for **exactly one statement** — the one whose WITH it decorates. The next query on your screen never heard of it. (Views are the persistent cousin; modules 1–3 met none, and that's deliberate.)",
        "`ORDER BY` inside a CTE is legal SQL but pointless — the outer query makes no promise to preserve it. Sort **once**, in the final SELECT.",
        "`WITH RECURSIVE` is the self-referencing variant — org charts, bill-of-materials, graph walks. Powerful, and honestly out of scope here: nothing in this storefront is tree-shaped.",
        "The whole thing is **one statement**: one WITH, one final SELECT, one semicolon at the very end. Semicolons after a CTE's closing parenthesis are a syntax error.",
      ],
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL grew CTEs in **8.0** (2018) — every version before it must spell these as derived tables. If a client codebase predates 8.0, WITH doesn't parse at all.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres adds `AS MATERIALIZED` (or `NOT MATERIALIZED`) hints: force the CTE to compute once into a temp structure, or let the planner inline it. SQLite decides on its own — semantics never change either way.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite has supported CTEs since 3.8.3 (2014) and chains them comfortably — this whole module runs on the engine in your browser. A CTE referenced once is typically inlined; referenced multiple times, it may materialize.",
    },
    {
      kind: "tip",
      text: "Refactor drill: take any lesson-27 derived-table query and rewrite it as a CTE chain — same rows out, half the nesting. Once a query grows a second join or a second aggregation, WITH usually wins on clarity. Reach for derived tables when the inner query is one short line.",
    },
  ],
  mcqs: [
    {
      id: "l28-q1",
      prompt: "After your WITH-query finishes, the next query on the same connection says `SELECT * FROM region_spend`. What happens?",
      choices: [
        "It works — CTEs persist for the session",
        "Error — the CTE's scope ended with its statement",
        "It returns an empty result",
        "It silently creates the CTE again",
      ],
      answer: 1,
      why: "A CTE is scoped to exactly the statement it decorates. For anything longer-lived you'd create a VIEW — a different object with different rules.",
      notes: [
        { choice: 0, why: "That's a temp table or view's contract. CTEs are syntax-level conveniences: defined, consumed, gone — all within one statement." },
      ],
    },
    {
      id: "l28-q2",
      prompt: "In `WITH a AS (…), b AS (SELECT * FROM a …)` — which reference is legal?",
      choices: [
        "b may read a; a may not read b",
        "a may read b — WITH resolves names globally",
        "Either direction works",
        "Neither — CTEs can't reference each other",
      ],
      answer: 0,
      why: "CTEs chain forward: each one sees the earlier definitions, like statements in a script. `a` referencing `b` would be a forward reference — a syntax error (unless you go recursive, which is its own keyword).",
      notes: [
        { choice: 3, why: "Referencing earlier CTEs is the feature — the chain in this lesson's second example (spend → big) is exactly that. Only backward/forward confusion is forbidden." },
      ],
    },
    {
      id: "l28-q3",
      prompt: "What does WITH add over a derived table, mechanically?",
      choices: [
        "New query powers — CTEs can do things derived tables can't",
        "Nothing — same capabilities, different placement and a name",
        "Faster execution on all engines",
        "Persistent storage across statements",
      ],
      answer: 1,
      why: "Every CTE can be rewritten as a derived table (paste the body into FROM) and vice versa. The wins are human: named, top-down, reusable, debuggable — not mechanical.",
      notes: [
        { choice: 2, why: "Engines may inline or materialize either form; identical results, and no general speed crown. Readability is the honest reason to prefer WITH." },
      ],
    },
    {
      id: "l28-q4",
      prompt: "A CTE ends with `ORDER BY spend DESC` and the main query does `SELECT * FROM that_cte` with no ORDER BY. What order comes out?",
      choices: [
        "Descending — the CTE's sort is preserved",
        "Undefined — sort in the final SELECT",
        "Ascending — the outer query resets it",
        "Insertion order of the underlying table",
      ],
      answer: 1,
      why: "Relational results have no inherent order, and an inner ORDER BY grants no promise to the outer query. The final SELECT is the only place sorting is contractual.",
      notes: [
        { choice: 0, why: "It usually LOOKS preserved on small tables — which is exactly how latent bugs ship. One ORDER BY, at the end, always." },
      ],
    },
    {
      id: "l28-q5",
      prompt: "Which engine version gate matters most for WITH in the wild?",
      choices: [
        "MySQL pre-8.0 has no CTEs at all",
        "SQLite never supported them",
        "Postgres only since 12",
        "CTEs are universal since forever",
      ],
      answer: 0,
      why: "MySQL 8.0 (2018) is the real cliff — countless production codebases sit below it. SQLite has had CTEs since 2014 and Postgres for over a decade.",
      notes: [
        { choice: 1, why: "Opposite — SQLite is one of the earliest mainstream adopters (3.8.3, 2014). The engine this app runs is fully CTE-capable." },
      ],
    },
    {
      id: "l28-q6",
      prompt: "The main query joins the same CTE twice: `FROM totals t1 JOIN totals t2 ON t1.region = t2.region AND t1.mon > t2.mon`. Legal?",
      choices: [
        "No — a CTE may be referenced only once",
        "Yes — that's a core advantage over pasting the derived table twice",
        "Only with WITH RECURSIVE",
        "Only if the CTE is a single table scan",
      ],
      answer: 1,
      why: "Multiple references to one named definition are precisely what WITH is for — the self-join shape that would otherwise duplicate a heavy derived table verbatim.",
      notes: [
        { choice: 2, why: "RECURSIVE is for a CTE referencing ITSELF inside its own body — a different feature (tree walks), not needed for plain repeated references." },
      ],
    },
    {
      id: "l28-q7",
      prompt: "Where does the semicolon go in a WITH statement?",
      choices: [
        "After each CTE's closing parenthesis",
        "Only at the very end of the whole statement",
        "After the WITH keyword",
        "CTEs can't be terminated — they need a GO batch separator",
      ],
      answer: 1,
      why: "WITH + final SELECT is one statement: commas separate CTE definitions inside the WITH clause, and the single semicolon closes the entire thing.",
      notes: [
        { choice: 0, why: "A semicolon there splits the statement in half — the final SELECT would be orphaned with an unknown table name. Commas join CTEs; one semicolon at the end." },
      ],
    },
    {
      id: "l28-q8",
      prompt: "Which refactor keeps the SAME rows out: a lesson-27 derived table, or the equivalent CTE chain?",
      choices: [
        "The CTE — it re-evaluates with fresh data",
        "Identical rows — placement changes reading order, not semantics",
        "The derived table — CTEs deduplicate rows",
        "Whoever runs last is fresher",
      ],
      answer: 1,
      why: "Same body, same plan, same rows — WITH is a readability upgrade. That guarantee is what makes the refactor drill safe: rewrite, rerun, compare outputs, commit.",
      notes: [
        { choice: 0, why: "Both evaluate within the same statement against the same snapshot — neither is 'fresher'. Determinism is the point of the drill." },
      ],
    },
  ],
  problems: [
    {
      id: "l28-p1",
      title: "Region spend, the WITH way",
      brief: "Rebuild the region revenue report as a CTE: `WITH region_spend AS (…)` grouping orders joined to customers by region. Output `region` and `spend` (2 decimals), biggest first.",
      hints: [
        "The CTE body is the stage-one you know: join orders to customers, group by region, SUM with an alias. The main query selects and sorts it.",
        "Shape: WITH region_spend AS (SELECT c.region AS region, SUM(o.total) AS spend FROM orders o JOIN customers c ON … GROUP BY c.region) SELECT region, spend FROM region_spend ORDER BY spend DESC;",
      ],
      difficulty: "easy",
      solution:
        "WITH region_spend AS (\n  SELECT c.region AS region, SUM(o.total) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT region, spend FROM region_spend\nORDER BY spend DESC;",
      mistakes: [
        { test: ";\\s*select", message: "One statement — the WITH clause and the final SELECT are joined, no semicolon between them. The semicolon closes the whole thing at the very end." },
        { test: "\\bfrom\\s+\\(\\s*select", message: "That's the derived-table spelling — this drill names the stage with WITH first, then reads the name in the main query." },
        { test: "\\border\\s+by\\b[^)]*\\bdesc\\b\\s*\\)", message: "That ORDER BY sits inside the CTE body — legal but pointless: the outer query makes no promise to keep it. Sort once, in the final SELECT." },
      ],
      expected: EXPECTED["l28-p1"],
      ordered: true,
    },
    {
      id: "l28-p2",
      title: "Count via CTE",
      brief: "Using a CTE for per-customer spend, count customers above 1000 lifetime. Output one column `big_spenders`.",
      hints: [
        "CTE: customer_id + SUM(total) grouped per customer. Main query: COUNT(*) with a WHERE on the CTE's column.",
        "Shape: WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id) SELECT COUNT(*) AS big_spenders FROM spend WHERE s > <bar>;",
      ],
      difficulty: "easy",
      solution:
        "WITH spend AS (\n  SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id\n)\nSELECT COUNT(*) AS big_spenders FROM spend WHERE s > 1000;",
      mistakes: [
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+from\\s+orders\\b", message: "Counting raw orders gives 103 — the CTE first collapses them to 16 per-customer rows; count the survivors of the WHERE." },
        { test: "\\bsum\\s*\\(\\s*s\\s*\\)", message: "s is already the per-customer sum — the outer query counts rows, it doesn't aggregate the aggregate." },
        { test: ";\\s*select", message: "The CTE and the count are one statement — no semicolon after the CTE body." },
      ],
      expected: EXPECTED["l28-p2"],
    },
    {
      id: "l28-p3",
      title: "The two-stage chain",
      brief: "Chain two CTEs: `spend` (per-customer totals) then `big` (only spend above 2000). Final query joins `big` to customers for names. Output `name` and `s` (2 decimals), biggest first. Five rows.",
      hints: [
        "First CTE groups; second CTE selects from the first with a WHERE. The main query does the join and the sort.",
        "Shape: WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id), big AS (SELECT * FROM spend WHERE s > <bar>) SELECT c.name, b.s FROM big b JOIN customers c ON c.id = b.customer_id ORDER BY b.s DESC;",
      ],
      difficulty: "medium",
      solution:
        "WITH spend AS (\n  SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id\n), big AS (\n  SELECT * FROM spend WHERE s > 2000\n)\nSELECT c.name, b.s\nFROM big b JOIN customers c ON c.id = b.customer_id\nORDER BY b.s DESC;",
      mistakes: [
        { test: "big\\s+as\\s*\\(\\s*select[^;]*\\bfrom\\s+orders", message: "The second CTE builds on the FIRST — `FROM spend WHERE s > 2000` — not a fresh scan of orders. That's what chaining means." },
        { test: "\\bwith\\s+big\\s+as", message: "One WITH, two definitions separated by a comma — `WITH spend AS (…), big AS (…)`. Two WITH keywords won't parse." },
        { test: "where\\s+b\\.s\\s*>", message: "The > 2000 filter lives inside the `big` CTE — the final query only joins, names and sorts. That's the staging discipline." },
      ],
      expected: EXPECTED["l28-p3"],
      ordered: true,
    },
    {
      id: "l28-p4",
      title: "Two lists, one crowd",
      brief: "Two CTEs — `elec` (customers who bought Electronics) and `audio` (bought Audio) — then join them on customer to keep the overlap. Output `name`, alphabetical. Eleven names.",
      hints: [
        "Each CTE carries the three-table walk filtered by category; the main query INNER JOINs them on customer id.",
        "Shape: WITH elec AS (SELECT DISTINCT o.customer_id AS cid FROM orders o JOIN … WHERE p.category = '<c1>'), audio AS (… '<c2>' …) SELECT c.name FROM elec e JOIN audio a ON a.cid = e.cid JOIN customers c ON c.id = e.cid ORDER BY c.name;",
      ],
      difficulty: "medium",
      solution:
        "WITH elec AS (\n  SELECT DISTINCT o.customer_id AS cid\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE p.category = 'Electronics'\n), audio AS (\n  SELECT DISTINCT o.customer_id AS cid\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE p.category = 'Audio'\n)\nSELECT c.name\nFROM elec e\nJOIN audio a ON a.cid = e.cid\nJOIN customers c ON c.id = e.cid\nORDER BY c.name;",
      mistakes: [
        { test: "\\bintersect\\b", message: "INTERSECT works — but this drill composes two NAMED stages with a join. Same 11 people; the CTE route is the one being built." },
        { test: "\\bunion\\b", message: "UNION merges the lists (either-shelf buyers) instead of intersecting them — the brief wants both shelves on one record." },
        { test: "category\\s*=\\s*'(video|wearables)'", message: "The pair is Electronics and Audio — 12 and 11 buyers respectively, overlapping in 11. Other categories answer different questions." },
      ],
      expected: EXPECTED["l28-p4"],
      ordered: true,
    },
    {
      id: "l28-p5",
      title: "Surge months",
      brief: "Which months ran **more than 8 orders**? CTE: month buckets with counts. Main query: filter and list. Output `mon` and `n`, calendar order.",
      hints: [
        "The CTE is the standard strftime bucket: mon + COUNT(*). The main query keeps the tall months.",
        "Shape: WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, n FROM monthly WHERE n > <bar> ORDER BY mon;",
      ],
      difficulty: "medium",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon, n FROM monthly WHERE n > 8 ORDER BY mon;",
      mistakes: [
        { test: ">\\s*=\\s*8\\b", message: "Boundary — 'more than 8' is strictly > 8; >= 8 would admit six more months to the list." },
        { test: "\\bhaving\\b", message: "The filter sits in the main query against the CTE's named column — HAVING belongs to the CTE's own GROUP BY, which has no bar to apply." },
        { test: "order\\s+by\\s+n\\s+desc", message: "The brief wants calendar order — ORDER BY mon. (Sorting by count answers 'which was biggest', a different question.)" },
      ],
      expected: EXPECTED["l28-p5"],
      ordered: true,
    },
    {
      id: "l28-p6",
      title: "The shipper list, inverted",
      brief: "CTE `shippers`: customers who DO have a shipped order. Main query: everyone not on that list — via NOT IN (safe: the CTE's ids come from a NOT NULL column). Output `name`, alphabetical. Six names.",
      hints: [
        "Stage one is a DISTINCT customer_id scan filtered to shipped. Stage two negates membership against the CTE's name.",
        "Shape: WITH shippers AS (SELECT DISTINCT customer_id AS cid FROM orders WHERE status = '<status>') SELECT name FROM customers WHERE id NOT IN (SELECT cid FROM shippers) ORDER BY name;",
      ],
      difficulty: "hard",
      solution:
        "WITH shippers AS (\n  SELECT DISTINCT customer_id AS cid\n  FROM orders WHERE status = 'shipped'\n)\nSELECT name FROM customers\nWHERE id NOT IN (SELECT cid FROM shippers)\nORDER BY name;",
      mistakes: [
        { test: "\\bnot\\s+exists\\b", message: "The lesson-26 probe is correct SQL — this drill routes the anti-join through a NAMED list: build the shippers CTE, then negate it with NOT IN." },
        { test: "from\\s+orders\\s+where\\s+status\\s*=\\s*'shipped'\\s*$", message: "That returns the 10 shippers — the brief wants their six complements. The CTE is the membership list; the main query keeps everyone OFF it." },
        { test: "distinct\\s+name\\s+from\\s+orders", message: "Names live on customers — the CTE collects ids from orders, and the main query joins/negates against the customers table." },
      ],
      expected: EXPECTED["l28-p6"],
      ordered: true,
    },
    {
      id: "l28-p7",
      title: "Category champions",
      brief: "Top-earning product in each category, via CTE chain: `cat_rev` (revenue per product across order_items→products), then keep each category's maximum. Output `category`, `name`, `rev` (2 decimals), by revenue descending. Seven rows.",
      hints: [
        "CTE one: revenue per product (SUM(quantity * unit_price)) joined to products for category and name. CTE two — or the main query — keeps rows whose rev equals that category's MAX.",
        "Shape: WITH cat_rev AS (SELECT p.category AS category, p.name AS name, SUM(oi.quantity * oi.unit_price) AS rev FROM order_items oi JOIN products p ON … GROUP BY p.id) SELECT category, name, ROUND(rev, 2) AS rev FROM cat_rev c WHERE rev = (SELECT MAX(rev) FROM cat_rev c2 WHERE c2.category = c.category) ORDER BY rev DESC;",
      ],
      difficulty: "hard",
      solution:
        "WITH cat_rev AS (\n  SELECT p.category AS category, p.name AS name,\n         SUM(oi.quantity * oi.unit_price) AS rev\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id\n)\nSELECT category, name, ROUND(rev, 2) AS rev\nFROM cat_rev c\nWHERE rev = (\n  SELECT MAX(rev) FROM cat_rev c2 WHERE c2.category = c.category\n)\nORDER BY rev DESC;",
      mistakes: [
        { test: "\\brow_number\\b|\\bover\\b", message: "Window functions are two lessons away — the pre-window spelling is the correlated MAX: each row compared against its category's best." },
        { test: "\\bmax\\s*\\(\\s*rev\\s*\\)\\s+as\\s+rev\\s+from", message: "MAX alone collapses to one row per category and loses the product name — keep every candidate row and filter with a correlated comparison." },
        { test: "group\\s+by\\s+p\\.category", message: "Grouping by category averages the products together — the revenue belongs to each PRODUCT (group by p.id); category comes along for the naming." },
      ],
      expected: EXPECTED["l28-p7"],
      ordered: true,
    },
    {
      id: "l28-p8",
      title: "Region shares",
      brief: "Extend the region CTE with each region's **share of total revenue**: a second column computed against the SUM over the CTE itself. Output `region`, `spend` (2 decimals), `share_pct` (1 decimal), biggest share first.",
      hints: [
        "CTE as usual; the main query computes spend * 100.0 / (SELECT SUM(spend) FROM region_spend) — the CTE referenced twice, no second scan of orders.",
        "Shape: WITH region_spend AS (…) SELECT region, ROUND(spend, 2) AS spend, ROUND(spend * 100.0 / (SELECT SUM(spend) FROM region_spend), 1) AS share_pct FROM region_spend ORDER BY share_pct DESC;",
      ],
      difficulty: "hard",
      solution:
        "WITH region_spend AS (\n  SELECT c.region AS region, SUM(o.total) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT region,\n  ROUND(spend, 2) AS spend,\n  ROUND(spend * 100.0 / (SELECT SUM(spend) FROM region_spend), 1) AS share_pct\nFROM region_spend\nORDER BY share_pct DESC;",
      mistakes: [
        { test: "\\*\\s*100\\s*/", message: "Integer division hazard — spend * 100 / total truncates to whole percents in many engines. Multiply by 100.0 so the math stays decimal before rounding." },
        { test: "\\(\\s*select\\s+sum\\s*\\(\\s*total\\s*\\)\\s+from\\s+orders", message: "Re-scanning orders for the grand total re-runs the whole join the CTE already did — divide by the SUM over region_spend itself, the CTE referenced a second time." },
        { test: "\\bshare_pct\\s*=\\s*share_pct", message: "The share column is defined once in the SELECT list — computing it against itself would need a second CTE layer. Build it directly from spend and the CTE total." },
      ],
      expected: EXPECTED["l28-p8"],
      ordered: true,
    },
  ],
  takeaway: "WITH names each staging query, chains them top-down, and lets the final SELECT read like the question it always was — same rows as the derived table, half the parenthesis archaeology.",
};
