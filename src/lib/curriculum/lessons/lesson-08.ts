import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson08: Lesson = {
  id: "lesson-08",
  num: 8,
  title: "GROUP BY & HAVING — buckets and gates",
  blurb: "One row per category, aggregates per bucket, and filtering on the aggregate itself",
  minutes: 18,
  blocks: [
    {
      kind: "p",
      text: "Lesson 7 collapsed the whole table into one number. Real questions come in groups — *revenue per customer*, *orders per status*. **GROUP BY** is the generalization: split rows into buckets by a column's value, run the aggregate **inside each bucket**, return one row per bucket.",
    },
    { kind: "diagram", figure: "l7-groupby" },
    {
      kind: "code",
      caption: "One row per status",
      sql: "SELECT status, COUNT(*) AS n FROM orders GROUP BY status;",
      runnable: true,
    },
    { kind: "h", text: "The strictest rule in SELECT-land" },
    {
      kind: "bullets",
      items: [
        "After GROUP BY, every SELECT column must be either **in the GROUP BY** or **inside an aggregate**.",
        "Why: within a bucket the grouping column has one value — legal — but any other column has as many values as the bucket has rows, and \"which one?\" has no honest answer.",
        "Engines that allow it silently pick a row and hand you garbage dressed as data. Make the rule a reflex.",
      ],
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "Engines disagree on enforcement: PostgreSQL always rejects a bare non-grouped column, and MySQL's ONLY_FULL_GROUP_BY mode (default since 5.7) does too — SQLite stays lenient and quietly picks an arbitrary row's value, which is why this bug hides until you port.",
    },
    { kind: "h", text: "Two gates: WHERE vs HAVING" },
    {
      kind: "bullets",
      items: [
        "**WHERE filters rows** on the way in — it runs before grouping, so it can't test aggregates.",
        "**HAVING filters buckets** on the way out — it runs after buckets exist and tests `COUNT(*) > 10`, `SUM(total) > 500`, … directly.",
        "Read any GROUP BY query as a two-gate pipeline: rows in through WHERE, buckets out through HAVING.",
      ],
    },
    { kind: "diagram", figure: "l8-where-having" },
    {
      kind: "code",
      caption: "HAVING — a gate for buckets",
      sql: "SELECT status, COUNT(*) AS n FROM orders GROUP BY status HAVING COUNT(*) > 10;",
      runnable: true,
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Alias rules around the gates: SQLite and MySQL happily accept `HAVING n > 10` when `n` is a SELECT alias, but PostgreSQL's HAVING only takes real expressions (`HAVING COUNT(*) > 10`) — its aliases work in ORDER BY and GROUP BY, never in WHERE or HAVING.",
    },
    { kind: "h", text: "Where this pays off" },
    {
      kind: "bullets",
      items: [
        "\"Top customers by spend\" — the single most requested query in analytics — is exactly three clauses: `GROUP BY customer_id`, `SUM(total) AS spend`, `ORDER BY spend DESC LIMIT 5`. You now own all three.",
        "Bucket per month with a `GROUP BY <date expression>`, rank with `ORDER BY … DESC`, cap with `LIMIT` — the leaderboard recipe composes with everything else you know.",
      ],
    },
    {
      kind: "tip",
      text: "Mentally pipeline every grouped query: FROM → WHERE (rows in) → GROUP BY (buckets) → aggregates (bucket → one row) → HAVING (buckets out) → SELECT (shape) → ORDER BY/LIMIT (rank). Every query you'll ever write fits this relay.",
    },
  ],
  mcqs: [
    {
      id: "l8-q1",
      prompt: "After `GROUP BY status`, which SELECT list is valid?",
      choices: [
        "SELECT status, total",
        "SELECT status, COUNT(*)",
        "SELECT customer_id, COUNT(*)",
        "SELECT *",
      ],
      answer: 1,
      why: "Every column must be grouped or aggregated. status is the grouping column and COUNT(*) is an aggregate — both legal. total and customer_id vary inside buckets, so they're not.",
      notes: [
        { choice: 0, why: "status is legal (it's the grouping key) — but total varies from row to row inside each bucket, and 'which one?' has no honest answer. It must go inside an aggregate: SUM(total)." },
      ],
    },
    {
      id: "l8-q2",
      prompt: "HAVING differs from WHERE because HAVING…",
      choices: [
        "runs before rows are grouped",
        "filters buckets after aggregation, so it can test COUNT/SUM/AVG",
        "only works on numeric columns",
        "replaces ORDER BY",
      ],
      answer: 1,
      why: "WHERE filters rows before grouping; HAVING filters groups after. That's why aggregate conditions must live in HAVING.",
      notes: [
        { choice: 0, why: "That's WHERE's slot — HAVING exists precisely because buckets must exist before you can test COUNT or SUM on them." },
      ],
    },
    {
      id: "l8-q3",
      prompt: "`SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id ORDER BY spend DESC LIMIT 5` returns…",
      choices: [
        "The 5 biggest orders",
        "The 5 customers with the highest total spend",
        "All customers sorted by id",
        "An error — can't ORDER BY an alias",
      ],
      answer: 1,
      why: "Grouping per customer, summing each bucket, ranking the buckets — the classic top-customers query. (ORDER BY the alias is fine: it runs after SELECT.)",
      notes: [
        { choice: 0, why: "That's the lesson-5 query (ORDER BY total DESC LIMIT 5) — here rows are bucketed per customer and summed first, so LIMIT 5 caps *customers*, each carrying a lifetime total." },
      ],
    },
    {
      id: "l8-q4",
      prompt: "In logical order, the pipeline is…",
      choices: [
        "SELECT → WHERE → GROUP BY → HAVING",
        "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY",
        "GROUP BY → WHERE → HAVING → LIMIT",
        "FROM → HAVING → WHERE → SELECT",
      ],
      answer: 1,
      why: "Rows are produced, filtered, bucketed, bucket-filtered, then shaped and ranked. Every clause slots into this relay — learn it once, read any query forever.",
      notes: [
        { choice: 2, why: "The text order suggests it, but WHERE runs before GROUP BY — rows must be filtered before there's anything to bucket, which is also why aggregates can't live in WHERE." },
      ],
    },
    {
      id: "l8-q5",
      prompt: "`GROUP BY status` on 103 orders produces how many groups?",
      choices: ["103", "4 — one per distinct status", "11", "Depends on ORDER BY"],
      answer: 1,
      why: "Groups = distinct values of the grouping key. Four statuses exist (delivered 52, shipped 30, pending 14, cancelled 7), so four buckets come out.",
      notes: [
        { choice: 0, why: "One row per input row is what *no* GROUP BY (or grouping by a unique id) produces — grouping by status buckets *equal* statuses together, so the group count tracks distinct values, not rows." },
      ],
    },
    {
      id: "l8-q6",
      prompt: "Which columns may appear in SELECT alongside an aggregate?",
      choices: [
        "Any column from the table",
        "Only the grouping key columns (and expressions of them) — everything else must be aggregated",
        "Only numeric columns",
        "At most one column total",
      ],
      answer: 1,
      why: "After grouping, each bucket is represented by its key values plus computed aggregates. A non-grouped column would be 'pick any row's value' — undefined behavior in strict engines.",
      notes: [
        { choice: 0, why: "That leniency is what MySQL's ONLY_FULL_GROUP_BY mode (default since 5.7) and PostgreSQL reject — an engine that allows it silently picks one arbitrary row per bucket." },
      ],
    },
    {
      id: "l8-q7",
      prompt: "WHERE vs HAVING — which runs first?",
      choices: [
        "HAVING first — it filters groups before rows exist",
        "WHERE first: it filters rows, then grouping happens, then HAVING filters groups",
        "They run simultaneously",
        "Only HAVING exists in SQLite",
      ],
      answer: 1,
      why: "The pipeline: WHERE (rows) → GROUP BY (buckets) → HAVING (buckets). That's why aggregates can't live in WHERE but can live in HAVING.",
      notes: [
        { choice: 0, why: "Buckets can't be filtered before they exist — HAVING is downstream of GROUP BY by definition; WHERE is the upstream row gate." },
      ],
    },
    {
      id: "l8-q8",
      prompt: "`GROUP BY region, active` on customers produces groups for…",
      choices: [
        "Each region only",
        "Each unique (region, active) combination",
        "Each customer",
        "The whole table as one group",
      ],
      answer: 1,
      why: "Multi-column grouping buckets by the value pair — EU/active, EU/churned, APAC/active, … Each combination is its own row in the result.",
      notes: [
        { choice: 0, why: "Same rule as DISTINCT's: grouping is by the whole key tuple, so (EU, 1) and (EU, 0) are different buckets — that's what lets you spot churned regions." },
      ],
    },
    {
      id: "l8-q9",
      prompt: "To find customers with more than 10 orders, the condition belongs in…",
      choices: [
        "WHERE COUNT(*) > 10",
        "HAVING COUNT(*) > 10, after GROUP BY customer_id",
        "ORDER BY COUNT(*) DESC",
        "LIMIT 10",
      ],
      answer: 1,
      why: "The condition is about a group (a customer's order count), not a single row — HAVING territory. WHERE would error or, worse, silently filter something else.",
      notes: [
        { choice: 0, why: "WHERE runs before any grouping, so COUNT(*) doesn't exist yet — SQLite replies 'misuse of aggregate function'. The gate belongs in HAVING, after GROUP BY customer_id." },
      ],
    },
    {
      id: "l8-q10",
      prompt: "Why group by `c.id` rather than `c.name` when aggregating spend per customer?",
      choices: [
        "Names are encrypted",
        "Ids are unique — two customers with the same name would otherwise merge into one bucket",
        "SQLite forbids grouping by text",
        "Names are too long",
      ],
      answer: 1,
      why: "The grouping key defines identity. Display the name, group by the id — the robust habit that survives duplicate names and porting to stricter engines.",
      notes: [
        { choice: 2, why: "SQLite groups by text happily — this lesson's own first query groups by the text column status. The case for ids is uniqueness, not type." },
      ],
    },
    {
      id: "l8-q11",
      prompt: "`GROUP BY region` on the 16 customers — which group is largest?",
      choices: [
        "APAC with 5",
        "EU with 8 customers",
        "US with 2",
        "LATAM with 1",
      ],
      answer: 1,
      why: "EU holds 8 of 16 customers (28 same-region pairs, if you've done Module 2's self-join). APAC 5, US 2, LATAM 1.",
      notes: [
        { choice: 0, why: "APAC's 5 is the biggest count *after* EU — reading the ranking wrong puts the runner-up on top." },
      ],
    },
  ],
  problems: [
    {
      id: "l8-p1",
      title: "Orders per status",
      brief: "Return each `status` with its order count as `n`, alphabetically by status.",
      hints: [
        "Bucket the rows by status first, then count inside each bucket — the alphabetical ask is a plain ORDER BY on the grouping column.",
        "Shape: SELECT status, COUNT(*) AS <alias> FROM orders GROUP BY status ORDER BY status;",
      ],
      difficulty: "easy",
      solution: "SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "Without GROUP BY the whole table is one bucket — COUNT(*) returns a single grand total instead of one row per status." },
        { test: "\\border\\s+by\\s+status\\s+desc\\b", message: "Alphabetical is ascending — DESC runs the statuses Z to A." },
      ],
      expected: EXPECTED["l8-p1"],
      ordered: true,
    },
    {
      id: "l8-p2",
      title: "Top customers by spend",
      brief: "Return `customer_id` and total spend as `spend` (SUM of total, rounded to 2), highest spender first, top 5 only.",
      hints: [
        "Sum inside each customer's bucket, rank the buckets by that sum, then cap the leaderboard at five rows.",
        "Shape: SELECT customer_id, ROUND(SUM(total), 2) AS <alias> FROM orders GROUP BY customer_id ORDER BY <alias> DESC LIMIT <n>;",
      ],
      difficulty: "medium",
      solution: "SELECT customer_id, ROUND(SUM(total), 2) AS spend FROM orders GROUP BY customer_id ORDER BY spend DESC LIMIT 5;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "Without GROUP BY, SUM(total) collapses all 103 orders into one grand total — bucket by customer_id to get a spend per customer." },
        { test: "\\border\\s+by\\s+spend\\s+asc\\b", message: "Highest spender first is DESC — ASC puts the smallest spender on top." },
        { test: "\\border\\s+by\\s+spend\\s+desc\\s*(;|$)", message: "The ranking is right but uncapped — the brief wants top 5 only: append LIMIT 5." },
      ],
      expected: EXPECTED["l8-p2"],
      ordered: true,
    },
    {
      id: "l8-p3",
      title: "Average basket per status",
      brief: "Return each `status` with its average order total as `avg_total` (rounded to 2).",
      hints: [
        "Same bucketing as the per-status count — but the aggregate inside each bucket is the mean total, rounded for display.",
        "Shape: SELECT status, ROUND(AVG(total), 2) AS <alias> FROM orders GROUP BY status;",
      ],
      difficulty: "medium",
      solution: "SELECT status, ROUND(AVG(total), 2) AS avg_total FROM orders GROUP BY status;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "One bucket for the whole table gives one overall average — GROUP BY status is what yields one average per status." },
        { test: "\\bcount\\s*\\(\\s*\\*", message: "That counts orders per status — the brief asks for the average order total per status: AVG(total)." },
        { test: "avg\\s*\\(\\s*total\\s*\\)\\s+as\\b", message: "Bare AVG(total) ships a long float tail — wrap it: ROUND(AVG(total), 2)." },
      ],
      expected: EXPECTED["l8-p3"],
    },
    {
      id: "l8-p4",
      title: "The busy statuses",
      brief: "Return `status` and `n` (its order count) — but only statuses with MORE than 10 orders. The filter must run on the aggregate, not the rows.",
      hints: [
        "The gate tests a property of each bucket, so it must run after GROUP BY — that's HAVING's whole reason to exist.",
        "Shape: SELECT status, COUNT(*) AS <alias> FROM orders GROUP BY status HAVING COUNT(*) > <n>;",
      ],
      difficulty: "hard",
      solution: "SELECT status, COUNT(*) AS n FROM orders GROUP BY status HAVING COUNT(*) > 10;",
      mistakes: [
        { test: "\\bwhere\\s+count\\s*\\(", message: "WHERE runs before buckets exist, so COUNT(*) isn't there yet (SQLite: 'misuse of aggregate') — move the condition to HAVING after the GROUP BY." },
        { test: "^select\\b(?:(?!\\bhaving\\b).)*$", message: "All four statuses came back — the brief keeps only the busy ones, and that gate is HAVING COUNT(*) > 10." },
      ],
      expected: EXPECTED["l8-p4"],
    },
    {
      id: "l8-p5",
      title: "Orders per customer",
      brief: "Count each customer's orders. Return `customer_id` and `orders` (the count), most orders first — tie-break by smaller customer_id.",
      hints: [
        "One bucket per customer, counted; rank buckets by the count, break ties toward the smaller id, cap at six.",
        "Shape: SELECT customer_id, COUNT(*) AS <alias> FROM orders GROUP BY customer_id ORDER BY <alias> DESC, customer_id ASC LIMIT <n>;",
      ],
      difficulty: "medium",
      solution: "SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id ORDER BY orders DESC, customer_id ASC LIMIT 6;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "Without GROUP BY, COUNT(*) is 103 for the whole table — bucket by customer_id so each customer gets their own count." },
        { test: "\\border\\s+by\\s+orders\\s+asc\\b", message: "Most orders first is DESC — ASC lists the lightest buyers at the top." },
        { test: "\\border\\s+by\\s+orders\\s+desc\\s*(;|limit)", message: "The tiebreaker is missing — append `, customer_id ASC` so equal counts order by smaller id, as the brief demands." },
      ],
      expected: EXPECTED["l8-p5"],
      ordered: true,
    },
    {
      id: "l8-p6",
      title: "Customers per region",
      brief: "How many customers sit in each region? Return `region` and `customers` (the count), largest region first.",
      hints: [
        "The customers table buckets by region — count each bucket, then rank the regions biggest-first.",
        "Shape: SELECT region, COUNT(*) AS <alias> FROM customers GROUP BY region ORDER BY <alias> DESC;",
      ],
      difficulty: "medium",
      solution: "SELECT region, COUNT(*) AS customers FROM customers GROUP BY region ORDER BY customers DESC;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "No GROUP BY means one row for the whole table — bucket by region to get a count per region." },
        { test: "\\border\\s+by\\s+customers\\s+asc\\b", message: "Largest region first is DESC — ASC leads with the smallest region." },
        { test: "\\bfrom\\s+orders\\b", message: "The count is of people, not purchases — FROM customers, grouped by region." },
      ],
      expected: EXPECTED["l8-p6"],
      ordered: true,
    },
    {
      id: "l8-p7",
      title: "Revenue per status",
      brief: "Sum of `total` per order status. Return `status` and `revenue` (rounded to 2), biggest revenue first.",
      hints: [
        "Revenue per bucket is SUM(total) inside each status — the ranking happens after the buckets exist.",
        "Shape: SELECT status, ROUND(SUM(total), 2) AS <alias> FROM orders GROUP BY status ORDER BY <alias> DESC;",
      ],
      difficulty: "medium",
      solution: "SELECT status, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY status ORDER BY revenue DESC;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "Without GROUP BY you get one grand revenue total — bucket by status for a revenue line per status." },
        { test: "\\border\\s+by\\s+revenue\\s+asc\\b", message: "Biggest revenue first is DESC — ASC leads with the quietest status." },
        { test: "\\bcount\\s*\\(\\s*\\*", message: "That's the order count from the first problem — revenue is SUM(total), the money column." },
      ],
      expected: EXPECTED["l8-p7"],
      ordered: true,
    },
    {
      id: "l8-p8",
      title: "Big spenders only",
      brief: "Customers whose total spend exceeds 4000. Return `customer_id` and `spend` (rounded to 2), biggest first. The gate is HAVING, not WHERE.",
      hints: [
        "Spend is a bucket property — build the buckets, gate them with HAVING on the SUM, then rank what survives.",
        "Shape: SELECT customer_id, ROUND(SUM(total), 2) AS <alias> FROM orders GROUP BY customer_id HAVING SUM(total) > <n> ORDER BY <alias> DESC;",
      ],
      difficulty: "hard",
      solution: "SELECT customer_id, ROUND(SUM(total), 2) AS spend FROM orders GROUP BY customer_id HAVING SUM(total) > 4000 ORDER BY spend DESC;",
      mistakes: [
        { test: "\\bwhere\\s+sum\\s*\\(", message: "SUM(total) doesn't exist at WHERE time — the spend gate runs after grouping: HAVING SUM(total) > 4000." },
        { test: "^select\\b(?:(?!\\bhaving\\b).)*$", message: "Without the HAVING gate every customer makes the list — the brief keeps only spend above 4000." },
        { test: "having\\s+sum\\s*\\(\\s*total\\s*\\)\\s*>\\s*400\\b", message: "One zero short — the brief says exceed 4000, not 400." },
      ],
      expected: EXPECTED["l8-p8"],
      ordered: true,
    },
    {
      id: "l8-p9",
      title: "Catalog by category",
      brief: "Count products per category. Return `category` and `products` (the count) — most products first, alphabetical for ties.",
      hints: [
        "Count inside each category bucket, rank by the count, and let the category name break ties alphabetically.",
        "Shape: SELECT category, COUNT(*) AS <alias> FROM products GROUP BY category ORDER BY <alias> DESC, category ASC;",
      ],
      difficulty: "medium",
      solution: "SELECT category, COUNT(*) AS products FROM products GROUP BY category ORDER BY products DESC, category ASC;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "No buckets, no per-category counts — GROUP BY category is what makes one row per category." },
        { test: "\\border\\s+by\\s+products\\s+asc\\b", message: "Most products first is DESC — ASC leads with the thinnest category." },
        { test: "\\border\\s+by\\s+products\\s+desc\\s*(;|limit)", message: "The tiebreaker is missing — append `, category ASC` so tied counts list alphabetically." },
      ],
      expected: EXPECTED["l8-p9"],
      ordered: true,
    },
  ],
  takeaway: "GROUP BY turns one aggregate into one-per-bucket — every SELECT column must be grouped or aggregated, WHERE filters rows in, HAVING filters buckets out, and ORDER BY/LIMIT rank the survivors.",
};
