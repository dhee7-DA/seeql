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
    {
      id: "l49-q6",
      prompt: "In a recursive CTE, how many times does the anchor SELECT run, versus the step SELECT?",
      choices: [
        "Both run once",
        "Anchor once; the step runs once per queued row until the queue empties",
        "Anchor per row; step once",
        "Both loop forever",
      ],
      answer: 1,
      why: "The anchor seeds the queue with one pass — 1 row, once. Then the step consumes that queue: each queued row produces its step-rows, which re-queue, until a step yields nothing. Five numbers on the way out means the step ran five times; the anchor never re-ran.",
      notes: [
        { choice: 0, why: "A step that ran once could never produce 1, 2, 3, 4, 5 — the self-feeding IS the recursion. The anchor is the seed; the step is the growth." },
      ],
    },
    {
      id: "l49-q7",
      prompt: "Why does the sequence CTE use `UNION ALL` between anchor and step rather than plain `UNION`?",
      choices: [
        "UNION is illegal inside recursive CTEs",
        "UNION ALL skips the dedupe pass — sequences never repeat a value, so deduping is pure overhead",
        "UNION ALL is faster to type",
        "They're identical here — pick either",
      ],
      answer: 1,
      why: "UNION dedupes the accumulating result on every cycle — extra work a 1..n sequence never needs since each n is distinct. UNION ALL appends raw. (The flip side: for graph walks with possible cycles, UNION's dedupe IS the termination strategy — the choice is semantic, not style.)",
      notes: [
        { choice: 3, why: "On this data both produce the same five rows — but the engine pays for UNION's dedupe every cycle. Same answer, different bill." },
      ],
    },
    {
      id: "l49-q8",
      prompt: "`WITH RECURSIVE months AS (…), seq AS (SELECT 1 …)` — what does RECURSIVE apply to?",
      choices: [
        "Only the first CTE (months)",
        "The WITH list as a whole — each CTE then decides by its own shape whether it actually recurses; a CTE that never references itself is just plain",
        "Nothing — RECURSIVE before two CTEs is a syntax error",
        "Only CTEs written in capitals",
      ],
      answer: 1,
      why: "RECURSIVE is a property of the WITH clause, not of each CTE — SQLite requires the keyword once if ANY member recurses, and members that don't self-reference behave as ordinary CTEs. The keyword licenses self-reference; it doesn't mandate it.",
      notes: [
        { choice: 0, why: "Order doesn't grant recursion — a CTE is recursive because its step references its own name, not because of its position in the list." },
      ],
    },
    {
      id: "l49-q9",
      prompt: "Walking an employees table's management chain: `manager_id` points up. What does the recursive step look like?",
      choices: [
        "SELECT e.* FROM employees e — the whole table, every time",
        "SELECT e.* FROM employees e JOIN chain c ON e.manager_id = c.id — each round finds the people whose manager is someone already in the chain",
        "SELECT manager_id FROM employees GROUP BY manager_id",
        "There is no step — org charts need a stored procedure",
      ],
      answer: 1,
      why: "This is the shape that makes RECURSIVE famous: the step joins a REAL table (employees) against the CTE's own output (chain), following the self-referencing FK one level per cycle. The anchor is the CEO; each cycle adds one reporting layer. Sequences generate from nothing — walks follow real edges.",
      notes: [
        { choice: 0, why: "Scanning the whole table each round ignores the chain — the JOIN ON the FK against the CTE is what turns rows into a path." },
      ],
    },
    {
      id: "l49-q10",
      prompt: "How many times may the recursive step reference the CTE's own name?",
      choices: [
        "Unlimited — it's just a name",
        "Exactly once — SQLite permits a single self-reference per step",
        "Twice — once per UNION arm",
        "Never in the first iteration",
      ],
      answer: 1,
      why: "SQLite's recursive step may cite the CTE exactly once — two self-references are a prepare-time error. Need a join between two generations (say, 'compare me to my manager's manager')? Wrap the recursive CTE in an outer query that joins it to itself — the restriction is on the step, not on what you build around the result.",
      notes: [
        { choice: 2, why: "UNION arms share one step — the anchor arm can't reference the CTE at all, and the step arm keeps its single self-reference." },
      ],
    },
    {
      id: "l49-q11",
      prompt: "The anchor outputs `(1, '2024-01')` — two columns. What must the step SELECT output?",
      choices: [
        "Whatever it likes — columns are computed at the end",
        "Exactly two columns, same positions — anchor and step must agree in column count (lesson 18's alignment law)",
        "One column — the step adds the increment",
        "Three — the step may extend the row",
      ],
      answer: 1,
      why: "The alignment law travels: a recursive CTE's arms are UNION ALL'd, and UNION arms need matching column counts. The step's (m + 1, next-label) slots into the same (m, label) shape the anchor declared — mismatch is an immediate error, not a NULL-filled surprise.",
      notes: [
        { choice: 2, why: "The step appends ROWS, never columns — the shape is frozen by the anchor (or an explicit column list) before the first cycle runs." },
      ],
    },
    {
      id: "l49-q12",
      prompt: "A recursive CTE's step produces zero rows on some cycle. What happens?",
      choices: [
        "The recursion restarts from the anchor",
        "The queue is empty — the CTE is done; that zero-row cycle IS the termination",
        "SQLite inserts a NULL row and continues",
        "The query errors — steps must always produce rows",
      ],
      answer: 1,
      why: "Termination is nothing mystical: the step feeds the queue, an empty step output empties the queue, and the CTE ends. Your WHERE guard is what engineers that empty cycle — n < 14 fails exactly when the next month would overshoot — and a forgotten guard means the queue never empties.",
      notes: [
        { choice: 3, why: "Zero rows is a perfectly legal step result — it's the ONLY legal way out. Errors come from infinite loops hitting memory limits, not from empty steps." },
      ],
    },
    {
      id: "l49-q13",
      prompt: "Which set operator joins a recursive CTE's anchor to its step?",
      choices: [
        "UNION or UNION ALL — ALL appends raw, plain UNION dedupes the accumulator each cycle",
        "JOIN — the step joins its own output",
        "EXCEPT — the step subtracts from the anchor",
        "There's no operator — the arms are just comma-separated",
      ],
      answer: 0,
      why: "The anchor and step are UNION'd arms: UNION ALL is the sequence workhorse (no dedupe cost, duplicates legal), while plain UNION dedupes the running result every cycle — which for graph walks with cycles is actually the termination strategy, not just overhead.",
      notes: [
        { choice: 1, why: "The step references the CTE in its FROM — that's the self-feeding — but the arms themselves are glued by a set operator, exactly like lesson 17's stacks." },
      ],
    },
    {
      id: "l49-q14",
      prompt: "`WITH RECURSIVE t(n, label) AS (…)` — what does the `(n, label)` list do?",
      choices: [
        "Declares the output columns' names — otherwise they come from the anchor's SELECT list",
        "Caps how many rows the CTE may produce",
        "Declares their SQLite types — TEXT for label, INTEGER for n",
        "Nothing — column lists on CTEs are a syntax error",
      ],
      answer: 0,
      why: "The parenthesized list names the CTE's columns (and fixes their order) for the whole recursion — anchor and step must produce exactly that many. Omit it and the names are inherited from the anchor's output aliases. Types aren't declared here; SQLite's affinity rules apply as always.",
      notes: [
        { choice: 1, why: "Row count is the guard's job (WHERE), not the column list's. The list is pure naming — one more place SQL keeps shape and meaning separate." },
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
    {
      id: "l49-p5",
      title: "The countdown",
      brief: "Flip the sequence: generate **5 down to 1** — anchor `SELECT 5`, step subtracts, guard keeps it above the floor. Output one column `n`, five rows in countdown order.",
      hints: [
        "The anchor is the ceiling (5); the step moves down (n - 1); the guard stops before the floor (n > 1).",
        "Shape: WITH RECURSIVE t(n) AS (SELECT 5 UNION ALL SELECT n - 1 FROM t WHERE n > 1) SELECT n FROM t;",
      ],
      difficulty: "easy",
      solution: "WITH RECURSIVE t(n) AS (\n  SELECT 5\n  UNION ALL\n  SELECT n - 1 FROM t WHERE n > 1\n)\nSELECT n FROM t;",
      mistakes: [
        { test: "n\\s*\\+\\s*1", message: "That counts up — the countdown's step is n - 1, anchored at 5. The guard flips with it: n > 1, not n < 5." },
        { test: "where\\s+n\\s*>\\s*=?\\s*0", message: "Guard drift — n > 0 would emit a zero row after 1. The countdown ends AT 1, so the step must refuse when n = 1: WHERE n > 1." },
        { test: "order\\s+by\\s+n\\s+desc", message: "Unneeded decoration — the anchor-then-step cycle already emits 5, 4, 3, 2, 1 in generation order. ORDER BY on a recursive sequence is a habit, not a requirement." },
      ],
      expected: EXPECTED["l49-p5"],
    },
    {
      id: "l49-p6",
      title: "Powers of two",
      brief: "Generate the powers of two up to 64: anchor **1**, step multiplies by **2**, guard stops after 64 — seven rows total (1, 2, 4, 8, 16, 32, 64) in one column `n`.",
      hints: [
        "The step computes the NEXT power (n * 2); the guard checks the CURRENT one has room to double (n < 64).",
        "Shape: WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n * 2 FROM t WHERE n < 64) SELECT n FROM t;",
      ],
      difficulty: "medium",
      solution: "WITH RECURSIVE t(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n * 2 FROM t WHERE n < 64\n)\nSELECT n FROM t;",
      mistakes: [
        { test: "where\\s+n\\s*<=\\s*64", message: "Off-by-one doubling — with n <= 64 the step fires on 64 too and emits 128. The guard tests the CURRENT row (n < 64), so 64 is the last thing produced." },
        { test: "n\\s*\\+\\s*n|n\\s*\\*\\s*n", message: "Wrong growth — doubling is n * 2. n * n explodes (1, 1, 1…) and n + n is just 2n counting by ones." },
        { test: "select\\s+2\\s+union|select\\s+2\\s*$", message: "Anchor at 1 — 2 as the seed skips the first power. The sequence's identity is 1 = 2 to the 0th; everything else follows from the step." },
      ],
      expected: EXPECTED["l49-p6"],
    },
    {
      id: "l49-p7",
      title: "The three strongest months",
      brief: "Awards season: off the 14-month spine, find each month's revenue (`SUM(o.total)` rounded to 2) via LEFT JOIN on the month prefix, and output the **top 3 by revenue** — `month`, `revenue`, strongest first.",
      hints: [
        "Reuse the spine verbatim, aggregate the joined orders with GROUP BY the label, then ORDER BY revenue DESC LIMIT 3.",
        "Shape: WITH RECURSIVE months(m, label) AS (SELECT 1, '2024-01' UNION ALL SELECT m + 1, substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7) FROM months WHERE m < 14) SELECT months.label AS month, ROUND(SUM(o.total), 2) AS revenue FROM months LEFT JOIN orders o ON substr(o.created_at, 1, 7) = months.label GROUP BY months.label ORDER BY revenue DESC, months.label ASC LIMIT 3;",
      ],
      difficulty: "hard",
      solution: "WITH RECURSIVE months(m, label) AS (\n  SELECT 1, '2024-01'\n  UNION ALL\n  SELECT m + 1,\n         substr(printf('%04d-%02d', 2024 + (m) / 12, (m) % 12 + 1), 1, 7)\n  FROM months WHERE m < 14\n)\nSELECT months.label AS month,\n       ROUND(SUM(o.total), 2) AS revenue\nFROM months\nLEFT JOIN orders o ON substr(o.created_at, 1, 7) = months.label\nGROUP BY months.label\nORDER BY revenue DESC, months.label ASC\nLIMIT 3;",
      ordered: true,
      mistakes: [
        { test: "order\\s+by\\s+revenue\\s+asc", message: "Ascending finds the WEAKEST months — awards want DESC, strongest first, LIMIT 3." },
        { test: "join\\s+orders\\s+o(?!\\s+on)", message: "An inner join would shrink the spine to months-with-orders — fine today, wrong the day an empty month arrives. LEFT JOIN from the spine keeps the 14-row contract." },
        { test: "limit\\s+14\\s*;", message: "That's the whole spine — the podium is three rows. LIMIT 3 after the descending sort, nothing more." },
      ],
      expected: EXPECTED["l49-p7"],
    },
    {
      id: "l49-p8",
      title: "The January day spine",
      brief: "Fine-grained calendars: generate every day of **January 2024** — anchor `date('2024-01-01')`, step `date(d, '+1 day')`, guard keeps the CURRENT day before '2024-01-31'. Output one column `d`, 31 rows in order.",
      hints: [
        "date(…, '+1 day') is the step's engine — SQLite's date arithmetic from lesson 30, now self-feeding.",
        "Shape: WITH RECURSIVE days(d) AS (SELECT date('2024-01-01') UNION ALL SELECT date(d, '+1 day') FROM days WHERE d < '2024-01-31') SELECT d FROM days;",
      ],
      difficulty: "hard",
      solution: "WITH RECURSIVE days(d) AS (\n  SELECT date('2024-01-01')\n  UNION ALL\n  SELECT date(d, '+1 day') FROM days WHERE d < '2024-01-31'\n)\nSELECT d FROM days;",
      mistakes: [
        { test: "\\+\\s*7\\s+day|'\\+1\\s+month'", message: "Wrong stride — a day spine advances one day per cycle: '+1 day'. Week and month strides build different calendars entirely." },
        { test: "where\\s+d\\s*<\\s*'2024-02-01'", message: "Overshoot guard — d < '2024-02-01' lets the step fire on the 31st and emit Feb 1 (32 rows). The last day must never step: d < '2024-01-31'." },
        { test: "strftime|\\bnow\\b", message: "The spine is January 2024, fixed — anchored at date('2024-01-01'). now() would drift to whatever day you run it, and strftime alone doesn't step." },
      ],
      expected: EXPECTED["l49-p8"],
    },
  ],
  takeaway: "WITH RECURSIVE = anchor once, step on the last batch, guard decides when to stop — generators for sequences and calendar spines, walks for hierarchies, and always the bound that makes the loop end.",
};
