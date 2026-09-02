import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson49: Lesson = {
  id: "lesson-49",
  num: 49,
  title: "Recursive CTEs — generate & walk",
  blurb: "WITH RECURSIVE: an anchor seed, a step that feeds itself, and the shapes it unlocks — number sequences, the zero-gap month spine for reports, string walking, and the termination discipline",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "Some query shapes aren't about joining data — they're about *generating* it: a sequence of numbers, a calendar of months, a walk down an org chart. Lesson 28's CTEs get one upgrade that unlocks all of it: **RECURSIVE**. A recursive CTE is a query that feeds its own output back in as input, step by step, until it decides to stop. It looks exotic; it's two parts and a guard.",
    },
    { kind: "diagram", figure: "d5-recursive-unfold" },
    { kind: "h", text: "Anchor + step + guard" },
    {
      kind: "code",
      caption: "Count to ten — the hello-world of recursion",
      sql: `WITH RECURSIVE seq(n) AS (
  SELECT 1                          -- anchor: the seed row(s)
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 10  -- step: runs on the LAST batch
)
SELECT n FROM seq;                  -- 1 … 10, in generation order`,
    },
    {
      kind: "bullets",
      items: [
        "The **anchor** SELECT seeds the queue — here one row, n = 1. The **step** SELECT then runs with `seq` meaning *the previous batch*, appending its output to the queue, over and over.",
        "Termination is data, not syntax: the step stops yielding rows when its WHERE cuts out — `n < 10` means n = 11 is never produced, the step returns nothing, the loop ends. **Every recursive CTE needs that guard**; without it the loop runs until memory gives out.",
        "`UNION ALL` appends every batch; `UNION` deduplicates — for generators they're equivalent, but on tree walks UNION's dedup can be a safety net against cycles.",
      ],
    },
    { kind: "h", text: "The report spine — every month, even empty ones" },
    {
      kind: "code",
      caption: "Fourteen month labels, generated — then joined to reality",
      sql: `WITH RECURSIVE months(m, label) AS (
  SELECT 1, '2024-01'
  UNION ALL
  SELECT m + 1, substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7)
  FROM months WHERE m < 14
)
SELECT label, COUNT(o.id) AS orders
FROM months
LEFT JOIN orders o ON substr(o.created_at, 1, 7) = label
GROUP BY label ORDER BY label;`,
    },
    {
      kind: "bullets",
      items: [
        "This is the professional move the pattern exists for: a **generated calendar LEFT JOINed** to facts. GROUP BY the spine — months with no orders would still appear (with 0), which a plain GROUP BY on orders silently drops.",
        "The storefront happens to have all 14 month buckets filled, so today the LEFT and INNER spellings agree — the discipline is for the quarter that hasn't happened yet.",
        "The same anchor-step shape walks hierarchies: an org chart (`employee_id → manager_id`), threaded comments, graph hops — each step follows the parent pointer one level deeper.",
      ],
    },
    {
      kind: "warn",
      text: "The guard is the whole safety story. `SELECT n + 1 FROM seq` with no WHERE is an infinite generator — SQLite will grind until memory dies. Bound every step (n < K), or add an outer LIMIT, and be suspicious of any recursive CTE you didn't write that lacks one.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "WITH RECURSIVE is native Postgres, spelled identically (the keyword goes on the WITH, once, no matter how many CTEs recurse). Postgres additionally offers `generate_series`, a built-in generator that covers the number and date spines without recursion.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8.0+ supports WITH RECURSIVE with the same anchor/step structure; 5.7 and older have no recursive CTEs at all — date spines there need helper tables or application loops.",
    },
    {
      kind: "tip",
      text: "Build generators in two runs: first SELECT the CTE alone and count its rows (months: 14), then attach the join. When the spine is wrong, every downstream number is wrong — and it's much easier to debug a 14-row list than a joined report.",
    },
  ],
  mcqs: [
    {
      id: "l49-q1",
      prompt: "In `WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 10) …` — what is `SELECT 1` called and when does it run?",
      choices: [
        "The step — every iteration",
        "The anchor — the seed, evaluated exactly once",
        "The guard — it stops the loop",
        "The base table",
      ],
      answer: 1,
      why: "The first SELECT is the anchor: it seeds the queue once, before any recursion. The step then runs repeatedly on the previous batch. Anchor once, step many times, guard decides when to stop.",
      notes: [
        { choice: 2, why: "The guard is the WHERE inside the step — n < 10. The anchor's job is only to give the loop its first row." },
      ],
    },
    {
      id: "l49-q2",
      prompt: "What happens if the recursive step has no terminating condition (`SELECT n + 1 FROM seq` with no WHERE)?",
      choices: [
        "SQLite refuses to run unbounded recursion",
        "The step yields nothing and the query returns the anchor",
        "Infinite generation — rows keep producing until resources give out",
        "An automatic stop after 100 rows",
      ],
      answer: 2,
      why: "Nothing in the syntax bounds the loop — n grows forever, batches keep appending, and the query runs until memory or limits kill it. Every recursive CTE needs its guard: a WHERE bound, a cycle-safe UNION, or an outer LIMIT.",
      notes: [
        { choice: 0, why: "The engine trusts you — recursion depth is your contract, not SQLite's. That's why the warn box says to be suspicious of guard-less recursive CTEs." },
      ],
    },
    {
      id: "l49-q3",
      prompt: "During recursion, what does the CTE's name (`seq`) refer to inside the step SELECT?",
      choices: [
        "All rows produced so far, accumulated",
        "Only the previous batch's rows — the step consumes the last output, appends its own",
        "The anchor's rows only",
        "The final result set — it's a look-ahead",
      ],
      answer: 1,
      why: "The step runs against the LAST batch only — that's the queue discipline that makes n + 1 produce 2, then 3, then 4 without seeing the whole history. (Postgres documents the same model: UNION ALL queues batches; UNION dedupes them.)",
      notes: [
        { choice: 0, why: "That's the working-table misconception — if the step saw all prior rows, n + 1 would generate a triangle of duplicates, not a clean sequence." },
      ],
    },
    {
      id: "l49-q4",
      prompt: "Why join the generated month spine to orders with LEFT JOIN instead of JOIN?",
      choices: [
        "LEFT JOIN is faster on generated tables",
        "Months with no orders must still appear (with 0) — INNER JOIN would silently drop them",
        "The spine requires LEFT JOIN syntax",
        "No difference — both drop empty months",
      ],
      answer: 1,
      why: "The spine exists to guarantee every bucket is present. INNER JOIN keeps only months with matching orders — the report's axes would shrink the first quarter with zero sales. The anchor-LEFT-facts pattern is the whole idiom.",
      notes: [
        { choice: 3, why: "They differ exactly when a month is empty — which is never in today's 14 buckets and inevitable in production. The spelling you choose is the behavior you'll get." },
      ],
    },
    {
      id: "l49-q5",
      prompt: "Which task is a natural fit for a recursive CTE?",
      choices: [
        "Averaging order totals per customer",
        "Walking an org chart from CEO to interns through manager_id links, level by level",
        "Renaming a column in a table",
        "Deduplicating rows in a table",
      ],
      answer: 1,
      why: "Org charts, threaded comments and graph hops are self-referencing walks — each level's rows are found FROM the previous level's rows, which is precisely the anchor-step contract. Aggregations and schema edits live elsewhere.",
      notes: [
        { choice: 0, why: "That's GROUP BY's territory (lesson 7) — no self-reference involved. Recursion earns its complexity only when depth is part of the question." },
      ],
    },
  ],
  problems: [
    {
      id: "l49-p1",
      title: "Count to ten",
      brief: "Generate the numbers **1 through 10** with a recursive CTE named `seq`, one column `n`, in order. The classic anchor-step-guard.",
      hints: [
        "Anchor SELECT 1; step SELECT n + 1 FROM seq WHERE n < 10.",
        "Shape: WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 10) SELECT n FROM seq;",
      ],
      difficulty: "easy",
      solution: "WITH RECURSIVE seq(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM seq WHERE n < 10\n)\nSELECT n FROM seq;",
      mistakes: [
        { test: "n < 100|n < 1000", message: "Bound drift — the brief says through 10. A wider guard still 'works' but returns rows nobody asked for." },
        { test: "n <= 10", message: "Off-by-one — with the step SELECT n + 1, a guard of n <= 10 produces an 11th row (n = 11). The bound must stop the NEXT value: n < 10." },
        { test: "^with(?!(\\s|/)recursive)", message: "The RECURSIVE keyword is required — without it SQLite refuses to let seq reference itself inside its own definition." },
      ],
      expected: EXPECTED["l49-p1"],
      ordered: true,
    },
    {
      id: "l49-p2",
      title: "The fourteen-month spine",
      brief: "Generate the storefront's full history spine: 14 rows, `m` from 1 and `label` from **'2024-01'** to **'2025-02'**, advancing with the printf month math. Verify against the known months list.",
      hints: [
        "Carry both columns in the CTE: months(m, label); advance m + 1 and rebuild the label with printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1).",
        "Shape: WITH RECURSIVE months(m, label) AS (SELECT 1, '2024-01' UNION ALL SELECT m + 1, substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7) FROM months WHERE m < 14) SELECT m, label FROM months;",
      ],
      difficulty: "medium",
      solution: "WITH RECURSIVE months(m, label) AS (\n  SELECT 1, '2024-01'\n  UNION ALL\n  SELECT m + 1,\n         substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7)\n  FROM months WHERE m < 14\n)\nSELECT m, label FROM months;",
      ordered: true,
      mistakes: [
        { test: "m < 12\\b", message: "The spine is 14 months — the storefront's history runs into 2025 (2025-01, 2025-02). Twelve stops at December and the report loses its tail." },
        { test: "2024 \\+ \\( m \\+ 1 \\) / 12|2024 \\+ m / 12(?!,)", message: "Label math off by one — inside the step, m is the CURRENT month: the NEXT label is 2024 + (m) / 12, (m) % 12 + 1. Adding m + 1 in the year term rolls January into February's year." },
        { test: "order by label desc", message: "The spine runs forward — '2024-01' first. Descending order isn't wrong SQL, but the verify expects the generation order the brief described." },
      ],
      expected: EXPECTED["l49-p2"],
    },
    {
      id: "l49-p3",
      title: "Walk a comma-separated list",
      brief: "Legacy exports arrive as one string: **'delivered,shipped,pending,cancelled'**. Walk it with a recursive CTE that peels the first token on every step — final output: one column `status`, four rows, tokens in order.",
      hints: [
        "The step: next head = substr(rest, 1, INSTR(rest, ',') - 1); next rest = substr(rest, INSTR(rest, ',') + 1); continue while rest still contains a comma.",
        "Shape: WITH RECURSIVE split(status, rest) AS (SELECT '', 'delivered,shipped,pending,cancelled' UNION ALL SELECT substr(rest, 1, INSTR(rest, ',') - 1), substr(rest, INSTR(rest, ',') + 1) FROM split WHERE rest LIKE '%,%') SELECT status FROM split WHERE status != '';",
      ],
      difficulty: "hard",
      solution: "WITH RECURSIVE split(status, rest) AS (\n  SELECT '', 'delivered,shipped,pending,cancelled'\n  UNION ALL\n  SELECT substr(rest, 1, INSTR(rest, ',') - 1),\n         substr(rest, INSTR(rest, ',') + 1)\n  FROM split WHERE rest LIKE '%,%'\n)\nSELECT status FROM split WHERE status != '';",
      ordered: true,
      mistakes: [
        { test: "instr \\( rest , ',' \\) \\+ 2", message: "Off-by-one on the cut — INSTR returns the comma's position, so the remainder starts at INSTR + 1; +2 would swallow the first letter of every token." },
        { test: "where rest != ''\\s*\\)", message: "The guard is about commas — stop when rest has no comma left (rest LIKE '%,%'). Comparing rest != '' stops one step early and drops the final token." },
        { test: "\\bjoin\\b|\\bgroup by\\b", message: "No join or grouping needed — this is pure string surgery, one token per recursive step, in generation order." },
      ],
      expected: EXPECTED["l49-p3"],
    },
    {
      id: "l49-p4",
      title: "The zero-gap revenue report",
      brief: "The monthly report, built properly: reuse the 14-month spine and LEFT JOIN orders by `substr(created_at, 1, 7)`; output `label AS month` and `COUNT(o.id) AS orders`, grouped and ordered by the spine. Fourteen rows — today all populated, and the query stays correct for the first empty month.",
      hints: [
        "The spine drives FROM; orders joins LEFT ON substr(o.created_at, 1, 7) = label; COUNT(o.id) counts matches without losing empty months.",
        "Shape: WITH RECURSIVE months(m, label) AS (…) SELECT label AS month, COUNT(o.id) AS orders FROM months LEFT JOIN orders o ON substr(o.created_at, 1, 7) = label GROUP BY label ORDER BY label;",
      ],
      difficulty: "hard",
      solution: "WITH RECURSIVE months(m, label) AS (\n  SELECT 1, '2024-01'\n  UNION ALL\n  SELECT m + 1,\n         substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7)\n  FROM months WHERE m < 14\n)\nSELECT months.label AS month,\n       COUNT(o.id) AS orders\nFROM months\nLEFT JOIN orders o ON substr(o.created_at, 1, 7) = months.label\nGROUP BY months.label\nORDER BY months.label;",
      ordered: true,
      mistakes: [
        { test: "(?<!left )\\bjoin orders\\b", message: "INNER JOIN drops empty months — the spine exists to keep them (0 orders that month is a fact, not an absence). LEFT JOIN, spine on the left." },
        { test: "substr \\( o\\.created_at , 1 , 4 \\)", message: "That joins on YEAR — every order of 2024 matches every 2024 month and counts explode. The month key is substr(created_at, 1, 7): '2024-05'." },
        { test: "count \\( \\* \\) as orders", message: "COUNT(*) counts the spine row itself — empty months would report 1. COUNT(o.id) counts only the matched orders, so gaps read 0." },
      ],
      expected: EXPECTED["l49-p4"],
    },
  ],
  takeaway: "WITH RECURSIVE = anchor once, step on the last batch, guard decides when to stop — generators for sequences and calendar spines, walks for hierarchies, and always the bound that makes the loop end.",
};
