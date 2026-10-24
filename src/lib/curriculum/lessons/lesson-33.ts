import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson33: Lesson = {
  id: "lesson-33",
  num: 33,
  title: "String aggregation & grand totals",
  blurb: "GROUP_CONCAT folds rows into one cell, FILTER splits counts in one pass, and the UNION-ALL stack writes the TOTAL row SQLite won't",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "Two closing moves for the aggregation toolbox. First: the aggregate that returns **text** — `GROUP_CONCAT` folds every row in a group into one comma-joined cell, turning 'list everything' questions into one row each. Second: the **grand-total row** — the `TOTAL` line every finance report ends with. SQLite has no `ROLLUP` to write it for you, so you'll build the stack by hand with `UNION ALL` — and the hand-built version is exactly what the ROLLUP engines do under the hood.",
    },
    { kind: "diagram", figure: "x1-string-agg" },
    {
      kind: "code",
      caption: "Who shops the full lifecycle? Fold each customer's statuses, keep the complete ones",
      sql: `SELECT c.name, GROUP_CONCAT(DISTINCT o.status) AS statuses
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
HAVING COUNT(DISTINCT o.status) = 4;   -- Alice, Emma, Maya — the trio`,
    },
    { kind: "h", text: "The knobs" },
    {
      kind: "bullets",
      items: [
        "`GROUP_CONCAT(x)` — comma by default; `GROUP_CONCAT(x, ' | ')` picks the separator. The result is TEXT: one cell per group, however many rows went in.",
        "`GROUP_CONCAT(x ORDER BY x)` sorts the folded values (SQLite 3.44+). Without it the order is *whatever the scan produced* — Alice's came out `shipped,cancelled,delivered,pending`, no alphabet anywhere.",
        "`DISTINCT` works — `GROUP_CONCAT(DISTINCT o.status)` — but **not with a custom separator**: SQLite rejects `GROUP_CONCAT(DISTINCT x, ' | ')` outright. The workaround stages it: dedupe in a subquery, then concat the derived column.",
        "Watch the length: MySQL defaults `group_concat_max_len` to **1024 bytes** and silently truncates — a hundred folded names will lose their tails on MySQL and nowhere else.",
      ],
    },
    { kind: "h", text: "FILTER — many counts, one pass" },
    {
      kind: "code",
      caption: "The status census: four aggregates, one table scan",
      sql: `SELECT
  COUNT(*) FILTER (WHERE status = 'delivered')  AS delivered,
  COUNT(*) FILTER (WHERE status = 'shipped')    AS shipped,
  COUNT(*) FILTER (WHERE status = 'pending')    AS pending,
  COUNT(*) FILTER (WHERE status = 'cancelled')  AS cancelled,
  COUNT(*)                                      AS total
FROM orders;   -- 52 · 30 · 14 · 7 · 103`,
    },
    {
      kind: "bullets",
      items: [
        "The FILTER clause hangs a WHERE on one aggregate only — the same query as four separate filtered subqueries, one pass cheaper and far easier to read.",
        "You already know the portable spelling: `SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)` — module 3's pivot machine. FILTER is SQLite 3.30+/Postgres; MySQL has neither, so CASE remains the lingua franca.",
      ],
    },
    { kind: "diagram", figure: "x3-total-stack" },
    { kind: "h", text: "The grand-total stack" },
    {
      kind: "code",
      caption: "Detail rows, then the TOTAL row — one ledger, by hand",
      sql: `SELECT region, spend FROM (
  SELECT c.region AS region, ROUND(SUM(o.total), 2) AS spend
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region
  UNION ALL
  SELECT 'TOTAL', ROUND(SUM(total), 2) FROM orders
)
ORDER BY (region = 'TOTAL'), spend DESC;
-- EU · APAC · US · LATAM, then TOTAL 34833.28`,
    },
    {
      kind: "bullets",
      items: [
        "Arm one groups into detail rows; arm two has **no GROUP BY** — an aggregate with none yields exactly one row: the total. `UNION ALL` stacks them (ALL keeps it one pass, no dedupe).",
        "`ORDER BY (region = 'TOTAL'), spend DESC` sinks the total row to the bottom while details rank by spend — and note the wrapper: a UNION compound can only ORDER BY its output columns, so the boolean trick lives one level out. A tiny trick, endlessly reusable.",
        "Why not `ROLLUP`? SQLite simply doesn't have it. Postgres and MySQL 8 write `GROUP BY ROLLUP(region)` and get the same stack — the UNION-ALL spelling is the portable one, and reading it teaches what ROLLUP actually computes.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "GROUP_CONCAT is the only string aggregate; ORDER BY inside it since 3.44. No ROLLUP, no GROUPING SETS, no STRING_AGG — the stack pattern above is the native idiom.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres calls it `STRING_AGG(x, sep ORDER BY x)` and adds ARRAY_AGG for real arrays; `GROUP BY ROLLUP(region)`, `CUBE` and `GROUPING SETS` are all first-class.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL: GROUP_CONCAT with ORDER BY and custom separators both supported inside — but mind the 1024-byte default cap, raised per-session via group_concat_max_len. ROLLUP arrived with 8.0.",
    },
    {
      kind: "tip",
      text: "The fold is only as trustworthy as its inputs: fold DISTINCT ids when duplicates would repeat names, ORDER BY inside when the string is user-facing, and remember the whole cell is TEXT — you can't SUM your way back out of it.",
    },
  ],
  mcqs: [
    {
      id: "l33-q1",
      prompt: "GROUP_CONCAT(status) over a customer with 24 orders produces…",
      choices: [
        "24 comma-separated cells",
        "One TEXT cell containing 24 comma-joined statuses",
        "A number — like COUNT",
        "An error — aggregates can't return text",
      ],
      answer: 1,
      why: "It's still an aggregate: the group collapses to one row, but the folded VALUE is the joined string. COUNT counts the group; GROUP_CONCAT recites it.",
      notes: [
        { choice: 2, why: "Aggregates return whatever type they compute — AVG gives numbers, GROUP_CONCAT gives TEXT. The type follows the job." },
      ],
    },
    {
      id: "l33-q2",
      prompt: "Which spelling folds products into a pipe-separated list?",
      choices: [
        "GROUP_CONCAT(name, ' | ')",
        "GROUP_CONCAT(name SEPARATOR ' | ') — the only syntax",
        "CONCAT(name) GROUPED BY ' | '",
        "GROUP_CONCAT(name) || ' | '",
      ],
      answer: 0,
      why: "SQLite takes the separator as the optional second argument. MySQL additionally accepts the SEPARATOR keyword; the two-argument form is the common denominator.",
      notes: [
        { choice: 3, why: "That concatenates ONE pipe onto the end of the whole folded string — the separator belongs INSIDE the aggregate." },
      ],
    },
    {
      id: "l33-q3",
      prompt: "`GROUP_CONCAT(DISTINCT status, ' | ')` — what happens on SQLite?",
      choices: [
        "Works — distinct values, pipe-joined",
        "Rejected — DISTINCT allows no custom separator",
        "Silently ignores the separator",
        "Returns NULL",
      ],
      answer: 1,
      why: "Verified live on this engine: DISTINCT restricts GROUP_CONCAT to a single argument. Dedupe in a subquery first, then concat the derived column with any separator.",
      notes: [
        { choice: 0, why: "That's Postgres/MySQL behavior (STRING_AGG/GROUP_CONCAT with DISTINCT plus separator) — SQLite's parser refuses the combination." },
      ],
    },
    {
      id: "l33-q4",
      prompt: "Without ORDER BY inside the aggregate, what order does GROUP_CONCAT emit values in?",
      choices: [
        "Alphabetical",
        "Insertion order — the table's physical order",
        "Unspecified — whatever the scan produced",
        "Reverse of arrival",
      ],
      answer: 2,
      why: "SQL tables have no order, so the fold has none either — Alice's statuses arrived as shipped,cancelled,delivered,pending. User-facing strings get ORDER BY inside the aggregate (SQLite 3.44+).",
      notes: [
        { choice: 1, why: "Insertion order feels real on tiny tables — then a plan change reshuffles it in production. Unspecified means exactly that." },
      ],
    },
    {
      id: "l33-q5",
      prompt: "The FILTER clause's portable fallback — same four counts on MySQL — is…",
      choices: [
        "Four separate queries",
        "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) per column",
        "WHERE status = 'delivered' four times",
        "GROUP_CONCAT with numbers",
      ],
      answer: 1,
      why: "CASE routes each row to 1-or-0 per status; SUM totals the flags — module 3's pivot machine doing the same census. FILTER is just terser where it exists (SQLite 3.30+, Postgres).",
      notes: [
        { choice: 2, why: "WHERE filters the WHOLE query — four WHEREs would need four subqueries. CASE-per-aggregate keeps it one pass." },
      ],
    },
    {
      id: "l33-q6",
      prompt: "Why does the grand-total stack use UNION ALL rather than UNION?",
      choices: [
        "UNION would sort the stack",
        "Detail rows and the TOTAL row can't collide — dedupe would be wasted work (and risky if a detail matched)",
        "UNION can't mix aggregates",
        "They're identical here",
      ],
      answer: 1,
      why: "UNION dedupes across arms — if a region's row ever looked exactly like the total (one-region edge case), UNION would swallow it. ALL keeps both arms verbatim and skips the dedupe pass.",
      notes: [
        { choice: 0, why: "Neither UNION nor UNION ALL guarantees a sort — the ORDER BY after the stack does that. The ALL choice is about correctness and cost." },
      ],
    },
    {
      id: "l33-q7",
      prompt: "Arm two — `SELECT 'TOTAL', SUM(total) FROM orders` — has no GROUP BY. How many rows does it produce?",
      choices: [
        "103 — one per order",
        "One — an aggregate with no GROUP BY collapses the whole table",
        "Zero — GROUP BY is mandatory with aggregates",
        "Four — one per region",
      ],
      answer: 1,
      why: "That's the lesson-7 empty-set rule's twin: with aggregates and no GROUP BY, the entire table is one group — one row, even for zero input rows.",
      notes: [
        { choice: 0, why: "Without the aggregate that would be true — the SUM is what collapses 103 rows into the single TOTAL cell." },
      ],
    },
    {
      id: "l33-q8",
      prompt: "Which engines can spell this lesson's stack as GROUP BY ROLLUP(region) instead?",
      choices: [
        "All three — SQLite included",
        "Postgres and MySQL 8; SQLite has no ROLLUP",
        "Only SQLite",
        "None — ROLLUP is SQL Server-only",
      ],
      answer: 1,
      why: "ROLLUP is standard SQL that Postgres and MySQL 8 implement; SQLite never has. The UNION-ALL stack is the spelling that runs everywhere — including right here.",
      notes: [
        { choice: 3, why: "SQL Server popularized ROLLUP, but it's ISO standard syntax now — the holdout is SQLite, not the standard." },
      ],
    },
    {
      id: "l33-q9",
      prompt: "`SELECT GROUP_CONCAT(name) FROM customers` — what shape is the output?",
      choices: [
        "16 rows, one name each",
        "One row, one column: all 16 names comma-joined in a single string",
        "One row per letter",
        "An error — GROUP_CONCAT needs GROUP BY",
      ],
      answer: 1,
      why: "GROUP_CONCAT is an aggregate like SUM — it collapses the whole group (here: the entire table) into one value, a comma-separated string. It's a report's one-line summary spell.",
      notes: [
        { choice: 3, why: "Aggregates without GROUP BY legally cover the whole table — same as COUNT(*) ever did. GROUP BY only appears when you want one string PER group." },
      ],
    },
    {
      id: "l33-q10",
      prompt: "What does the second argument in `GROUP_CONCAT(name, ' | ')` control?",
      choices: [
        "The maximum string length",
        "The separator between values — a pipe-delimited list instead of the default comma",
        "Which column to sort by",
        "The number of values included",
      ],
      answer: 1,
      why: "The custom separator replaces the default ','. NULL rows contribute nothing and no stray separators appear — values are skipped, not printed as 'NULL'.",
      notes: [
        { choice: 3, why: "No LIMIT exists in GROUP_CONCAT — every non-NULL value in the group joins the string. Cap it upstream with a subquery if the list must be short." },
      ],
    },
    {
      id: "l33-q11",
      prompt: "`GROUP_CONCAT(DISTINCT status)` over one customer's orders returned 'shipped,cancelled,delivered,pending'. Is that order guaranteed?",
      choices: [
        "Yes — statuses sort alphabetically inside GROUP_CONCAT",
        "No — without ORDER BY inside the aggregate, the order is arbitrary and may change between runs or engines",
        "Yes — it follows the rows' insertion order by SQL law",
        "Yes — DISTINCT forces alphabetical order",
      ],
      answer: 1,
      why: "This exact string IS the proof: 'shipped,cancelled,delivered,pending' isn't alphabetical. GROUP_CONCAT concatenates in whatever order rows visit the aggregate — only the 3.44+ spelling with ORDER BY inside pins it down.",
      notes: [
        { choice: 0, why: "The observed string refutes that on this very data — 'cancelled' would come first alphabetically. Real observed order ≠ guaranteed order; that's the lesson." },
      ],
    },
    {
      id: "l33-q12",
      prompt: "`GROUP_CONCAT(DISTINCT region ORDER BY region)` over suppliers returns what on this store?",
      choices: [
        "'EU,APAC,LATAM,US' — DISTINCT's discovery order",
        "'APAC,EU,LATAM,US' — the ORDER BY inside the aggregate takes control",
        "4 rows, one per region",
        "An error — ORDER BY can't live inside an aggregate",
      ],
      answer: 1,
      why: "SQLite 3.44+ allows ORDER BY inside GROUP_CONCAT, making the string deterministic: all four supplier regions, alphabetized. On older engines the same query errors — one more portability line to walk.",
      notes: [
        { choice: 2, why: "GROUP_CONCAT is an aggregate — it returns ONE row per group, by definition. The row count never changes; only the string's interior order does." },
      ],
    },
    {
      id: "l33-q13",
      prompt: "`COUNT(*) FILTER (WHERE status = 'delivered')` — what does FILTER contribute to the census?",
      choices: [
        "It deletes non-delivered rows from the table",
        "It restricts THIS aggregate to matching rows only — delivered's 52, while sibling aggregates on the same row count their own statuses",
        "It sorts the result by delivered first",
        "It's a spelling error — aggregates take no conditions",
      ],
      answer: 1,
      why: "FILTER gives each aggregate its own private WHERE: one scan of orders yields delivered 52, shipped 30, pending 14, cancelled 7 side by side. It's the readable successor to SUM(CASE WHEN …) counters.",
      notes: [
        { choice: 3, why: "The FILTER clause is standard SQL (postgreSQL has it too) and SQLite 3.30+ runs it. The CASE form still works everywhere — FILTER is the clarity upgrade." },
      ],
    },
    {
      id: "l33-q14",
      prompt: "`SELECT region, COUNT(*) FILTER (WHERE active = 0) AS dormant FROM customers GROUP BY region` — what lands in `dormant` for EU (8 customers, 7 active) and US (2, both active)?",
      choices: [
        "EU 8 · US 2 — FILTER ignores the condition inside GROUP BY",
        "EU 1 · US 0 — the filter counts only the inactive rows within each region's bucket",
        "EU 0 · US 0 — active = 0 matches nothing",
        "One row total — FILTER collapses groups",
      ],
      answer: 1,
      why: "FILTER works fine inside GROUP BY: each region bucket counts its own inactive members. EU's single dormant customer (8 − 7 active) shows as 1; the US has none, so 0 — a zero that's real, not missing.",
      notes: [
        { choice: 2, why: "The two dormant customers in the whole store (Dmitri, Keiko) live in EU and APAC — but the count is still a COUNT, producing honest zeros where nobody matches, not empty rows." },
      ],
    },
  ],
  problems: [
    {
      id: "l33-p1",
      title: "The status recital",
      brief: "Every customer's statuses folded into one cell: output `name` and `statuses` = GROUP_CONCAT(DISTINCT status), alphabetical by name.",
      hints: [
        "Fold with DISTINCT so repeat statuses don't repeat in the string; the join feeds it all their orders.",
        "Shape: SELECT c.name, GROUP_CONCAT(DISTINCT o.status) AS statuses FROM customers c JOIN orders o ON … GROUP BY c.id ORDER BY c.name;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c.name, GROUP_CONCAT(DISTINCT o.status) AS statuses\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY c.name;",
      mistakes: [
        { test: "group_concat\\s*\\(\\s*distinct\\s+o?\\.?status\\s*,", message: "SQLite rejects DISTINCT with a custom separator — verify live on this engine. Keep GROUP_CONCAT(DISTINCT o.status) with the default comma, or dedupe in a subquery first." },
        { test: "\\bcount\\s*\\(\\s*distinct", message: "COUNT(DISTINCT status) gives the NUMBER of statuses (1–4) — the brief wants the recital itself: GROUP_CONCAT." },
        { test: "\\bgroup_concat\\s*\\(\\s*o\\.?status\\s*\\)", message: "Without DISTINCT the fold repeats — Alice's 24 orders would recite delivered 12 times. Fold the distinct set." },
      ],
      expected: EXPECTED["l33-p1"],
      ordered: true,
    },
    {
      id: "l33-p2",
      title: "The full-lifecycle count",
      brief: "How many customers hold all four statuses? Reuse the fold, wrap it in a count. Output one column `full_cycle`.",
      hints: [
        "The HAVING COUNT(DISTINCT status) = 4 crowd, counted from outside — subquery or CTE around the lesson's example.",
        "Shape: SELECT COUNT(*) AS full_cycle FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(DISTINCT status) = 4);",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS full_cycle\nFROM (\n  SELECT customer_id FROM orders\n  GROUP BY customer_id\n  HAVING COUNT(DISTINCT status) = 4\n);",
      mistakes: [
        { test: "\\bgroup_concat\\b", message: "The fold identifies the trio beautifully — but the answer is a NUMBER: count the groups that pass the HAVING bar." },
        { test: "=\\s*3\\s*;", message: "Hardcoding 3 reads the answer off the brief — the count must be computed: groups whose distinct-status tally reaches 4." },
        { test: "having\\s+count\\s*\\(\\s*\\*\\s*\\)", message: "COUNT(*) counts ORDERS (Alice alone has 24) — the lifecycle bar is COUNT(DISTINCT status) = 4." },
      ],
      expected: EXPECTED["l33-p2"],
    },
    {
      id: "l33-p3",
      title: "Supplier shelves",
      brief: "Each supplier's categories folded into one cell: output `name` and `cats` = GROUP_CONCAT(DISTINCT category) over suppliers joined to their products, alphabetical by supplier name.",
      hints: [
        "Join suppliers → products (products carries supplier_id), group by supplier, fold the distinct categories.",
        "Shape: SELECT s.name, GROUP_CONCAT(DISTINCT p.category) AS cats FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY s.name;",
      ],
      difficulty: "medium",
      solution:
        "SELECT s.name, GROUP_CONCAT(DISTINCT p.category) AS cats\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nGROUP BY s.id\nORDER BY s.name;",
      mistakes: [
        { test: "\\bfrom\\s+products\\s+join\\s+suppliers", message: "That works too — but group by the SUPPLIER id either way; grouping by product id would fold one category per row." },
        { test: "\\bgroup\\s+by\\s+p\\.category", message: "Grouping by category folds product names — the brief folds CATEGORIES per supplier: group by s.id." },
        { test: "\\bcount\\s*\\(", message: "Counting categories gives 2–3 per supplier — the brief wants the fold: the actual names in one cell." },
      ],
      expected: EXPECTED["l33-p3"],
      ordered: true,
    },
    {
      id: "l33-p4",
      title: "One-pass census",
      brief: "The status census with FILTER: one row, five columns — `delivered`, `shipped`, `pending`, `cancelled`, `total` — each a COUNT, the first four with FILTER (WHERE status = …).",
      hints: [
        "Five aggregates over one scan; four of them carry their own private WHERE via FILTER.",
        "Shape: SELECT COUNT(*) FILTER (WHERE status = '<s1>') AS delivered, … , COUNT(*) AS total FROM orders;",
      ],
      difficulty: "medium",
      solution:
        "SELECT\n  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,\n  COUNT(*) FILTER (WHERE status = 'shipped') AS shipped,\n  COUNT(*) FILTER (WHERE status = 'pending') AS pending,\n  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,\n  COUNT(*) AS total\nFROM orders;",
      mistakes: [
        { test: "\\bgroup\\s+by\\s+status", message: "Grouping gives four ROWS — the census is one row with five columns; FILTER conditions each aggregate instead." },
        { test: "\\bcase\\s+when", message: "The CASE pivot works identically — this drill spells it with FILTER, SQLite 3.30+'s native clause." },
        { test: "filter\\s*\\(\\s*status\\s*=", message: "FILTER wraps a full WHERE predicate: FILTER (WHERE status = 'delivered') — the WHERE keyword is part of the syntax." },
      ],
      expected: EXPECTED["l33-p4"],
    },
    {
      id: "l33-p5",
      title: "Category shopping lists",
      brief: "Per category, all product names comma-joined and ALPHABETICAL inside the cell: stage the sort in a subquery, then fold with a ', ' separator. Output `category` and `names`, category order.",
      hints: [
        "The inner query sorts (category, name); the outer folds — GROUP_CONCAT(name, ', ') with a custom separator (no DISTINCT, so it's legal).",
        "Shape: SELECT category, GROUP_CONCAT(name, ', ') AS names FROM (SELECT category, name FROM products ORDER BY category, name) GROUP BY category ORDER BY category;",
      ],
      difficulty: "medium",
      solution:
        "SELECT category, GROUP_CONCAT(name, ', ') AS names\nFROM (\n  SELECT category, name FROM products ORDER BY category, name\n)\nGROUP BY category\nORDER BY category;",
      mistakes: [
        { test: "group_concat\\s*\\(\\s*distinct\\s+name\\s*,", message: "The DISTINCT-plus-separator combo is rejected on SQLite — sort in the staging subquery instead; the fold then emits in scan order." },
        { test: "group_concat\\s*\\(\\s*name\\s*\\)", message: "That works but with the default comma and no space — the brief wants ', ' as the separator: GROUP_CONCAT(name, ', ')." },
        { test: "order\\s+by\\s+name\\s*;", message: "An outer ORDER BY name can't sort INSIDE the folded cell — the staging subquery's ORDER BY sets the fold order." },
      ],
      expected: EXPECTED["l33-p5"],
      ordered: true,
    },
    {
      id: "l33-p6",
      title: "The region ledger",
      brief: "Region spend WITH its grand-total row: detail rows per region, then a 'TOTAL' row via the second UNION ALL arm. Output `region` and `spend` (2 decimals) — TOTAL last, details by spend descending.",
      hints: [
        "Arm one: the grouped regions. Arm two: no GROUP BY, one row, literal 'TOTAL'. Wrap the stack in a subquery, then ORDER BY (region = 'TOTAL'), spend DESC — compounds can only ORDER BY output columns.",
        "Shape: SELECT region, spend FROM (<grouped arm> UNION ALL SELECT 'TOTAL', ROUND(SUM(total), 2) FROM orders) ORDER BY (region = 'TOTAL'), spend DESC;",
      ],
      difficulty: "hard",
      solution:
        "SELECT region, spend FROM (\n  SELECT c.region AS region, ROUND(SUM(o.total), 2) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n  UNION ALL\n  SELECT 'TOTAL', ROUND(SUM(total), 2) FROM orders\n)\nORDER BY (region = 'TOTAL'), spend DESC;",
      mistakes: [
        { test: "\\bunion\\b(?!\\s+all\\b)", message: "Bare UNION dedupes the stack — if a detail row ever equaled the total it would vanish. UNION ALL keeps both arms verbatim." },
        { test: "\\brollup\\b", message: "SQLite has no ROLLUP — this engine rejects it. The UNION ALL stack IS the native spelling (and what ROLLUP computes elsewhere)." },
        { test: "order\\s+by\\s+spend\\s+desc\\s*;", message: "That interleaves TOTAL with the details by value — the boolean key (region = 'TOTAL') pins the total row last." },
      ],
      expected: EXPECTED["l33-p6"],
      ordered: true,
    },
    {
      id: "l33-p7",
      title: "The monthly ledger",
      brief: "Same stack over time: month-bucketed revenue, then the TOTAL row. Output `mon` and `rev` (2 decimals) — calendar order with TOTAL last. Fifteen rows.",
      hints: [
        "Arm one: the strftime bucket report. Arm two: the literal 'TOTAL' row. Wrap the stack and sort outside it — calendar first, 'TOTAL' pinned last.",
        "Shape: SELECT mon, rev FROM (<bucket arm> UNION ALL SELECT 'TOTAL', ROUND(SUM(total), 2) FROM orders) ORDER BY (mon = 'TOTAL'), mon;",
      ],
      difficulty: "hard",
      solution:
        "SELECT mon, rev FROM (\n  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev\n  FROM orders\n  GROUP BY mon\n  UNION ALL\n  SELECT 'TOTAL', ROUND(SUM(total), 2) FROM orders\n)\nORDER BY (mon = 'TOTAL'), mon;",
      mistakes: [
        { test: "order\\s+by\\s+\\(\\s*mon\\s*=\\s*'total'\\s*\\)\\s*,\\s*rev", message: "The second sort key is the CALENDAR (mon), not revenue — TOTAL pinned last, then months in date order." },
        { test: "\\brunning\\b|over\\s*\\(", message: "A running total annotates every row — the ledger ADDS one total row at the end. Two different reports; the brief wants the stack." },
        { test: "\\brollup\\b", message: "Not on SQLite — hand-stack the arms: grouped months, then the no-GROUP-BY total arm, glued with UNION ALL." },
      ],
      expected: EXPECTED["l33-p7"],
      ordered: true,
    },
    {
      id: "l33-p8",
      title: "The operations matrix",
      brief: "The full report: per region, counts of delivered / shipped / pending / cancelled orders plus the row total — then the grand-total row. Output `region`, `delivered`, `shipped`, `pending`, `cancelled`, `total`; TOTAL last, regions by total descending.",
      hints: [
        "Arm one: GROUP BY region with four SUM(CASE WHEN …) counters plus COUNT(*). Arm two: the same five aggregates over the whole table with 'TOTAL' as region. Wrap the stack; sort outside.",
        "Shape: SELECT region, delivered, … FROM (<grouped arm> UNION ALL SELECT 'TOTAL', <same five aggregates> FROM orders) ORDER BY (region = 'TOTAL'), total DESC;",
      ],
      difficulty: "hard",
      solution:
        "SELECT region, delivered, shipped, pending, cancelled, total FROM (\n  SELECT c.region AS region,\n    SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,\n    SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS shipped,\n    SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending,\n    SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n    COUNT(*) AS total\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n  UNION ALL\n  SELECT 'TOTAL',\n    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END),\n    SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END),\n    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END),\n    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END),\n    COUNT(*)\n  FROM orders\n)\nORDER BY (region = 'TOTAL'), total DESC;",
      mistakes: [
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+filter", message: "FILTER works for the counts — but the drill is the pivot spelling: SUM(CASE WHEN … THEN 1 ELSE 0 END), the form every engine shares." },
        { test: "\\bgroup\\s+by\\s+region\\b[^;]*union", message: "Arm two must have NO GROUP BY — that's what collapses it to the single TOTAL row. Check both arms." },
        { test: "order\\s+by\\s+total\\s+desc\\s*;", message: "Without the boolean key (region = 'TOTAL') first, the total row sorts among the regions by size — pin it last." },
      ],
      expected: EXPECTED["l33-p8"],
      ordered: true,
    },
  ],
  takeaway: "GROUP_CONCAT folds a group into one TEXT cell (mind DISTINCT's no-separator rule and the unspecified order), FILTER splits counts in one pass, and the UNION ALL stack hand-builds the TOTAL row SQLite's missing ROLLUP would give you.",
  deep: [
    {
      kind: "mind",
      text: "GROUP_CONCAT is the **reverse telescope**: many rows fold into one text value — the only aggregate in the core toolkit whose output is not a number. It answers the \"show me the list\" report: which categories does this supplier feed, which products sat in that order. Its two disciplines: the fold **loses order guarantees** (SQLite concatenates in scan order unless you stage rows in a sorted subquery first), and the fold **needs a delimiter you chose deliberately** — commas inside data wreck naive joins. Pair it with the grand-total stack (aggregate OVER ()) and you get the report pattern: detail rows, subtotal rows, one total row — one query, no spreadsheet handiwork.",
    },
    {
      kind: "engine",
      title: "you run SELECT supplier_id, GROUP_CONCAT(name, ', ') FROM products GROUP BY supplier_id",
      steps: [
        "**Group scan** — 16 products fold into 6 supplier buckets; the aggregate accumulates a text buffer per bucket, appending ', '-separated names as rows arrive.",
        "**Order caveat** — the buffer's order follows arrival, not intent. Wrap the source in ORDER BY (a sorted subquery/CTE) when the list's order is part of the deliverable.",
        "**Grand-total layer** — COUNT(*) OVER () alongside GROUP_CONCAT stamps every row with the whole-set size: detail and summary in one result set, no UNION needed.",
        "**Output type** — one TEXT cell per group; long lists hit length limits in some engines (SQLite is generous, Postgres's string_agg too, but report UIs are not). Truncate deliberately.",
      ],
    },
    {
      kind: "myth",
      myth: "\"GROUP_CONCAT preserves row order — it concatenates alphabetically (or by id).\"",
      truth: "The standard provides **no order guarantee**. SQLite usually arrives in scan/rowid order and looks stable — until a plan change reorders the scan and your report's lists shuffle. Deterministic lists need a sorted stage feeding the fold.",
    },
    {
      kind: "edge",
      items: [
        { c: "Delimiters inside the data", r: "Product names containing ', ' split ambiguously downstream. Choose delimiters that cannot occur (' | ') or export structured formats instead of inventing syntax." },
        { c: "NULL members", r: "GROUP_CONCAT skips NULLs entirely — they neither appear nor leave a placeholder. A list of five rows with two NULLs reports three entries; is that the count your consumer expects?" },
        { c: "Empty groups can't exist", r: "Groups form FROM rows, so GROUP_CONCAT never returns NULL for a formed group (only for an all-NULL input column in some engines). Edge: distinguishing \"no members\" from \"no group\" matters in reports." },
        { c: "The 2× fan-out trap", r: "GROUP_CONCAT after a join inherits the join's fan-out: joined-to-items, each product name repeats per line. Fold at the right grain or the list duplicates — same disease as lesson 15, new symptom." },
      ],
    },  ],
};
