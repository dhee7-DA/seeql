import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson18: Lesson = {
  id: "lesson-18",
  num: 18,
  title: "Stacking real data: labels, arms, alignment",
  blurb: "Tag each row with its source, give arms their own limits, and keep types honest",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "Real reports stack **different sources**: customers and suppliers, top sellers and bottom sellers, this month and last month. Once rows from two tables share a pile, nothing remembers where a row came from — unless you add a **literal label column**.",
    },
    { kind: "diagram", figure: "s2-stack-labels" },
    {
      kind: "code",
      caption: "One directory, two sources — the label column tells them apart",
      sql: `SELECT name, 'customer' AS kind FROM customers
UNION ALL
SELECT name, 'supplier' FROM suppliers
ORDER BY kind, name;      -- 22 rows: 16 tagged customer, 6 tagged supplier`,
    },
    { kind: "h", text: "The label column trick" },
    {
      kind: "bullets",
      items: [
        "A literal like `'customer'` is a **constant expression** — the same value on every row of that arm. Alias it once (`AS kind`) and the whole pile carries a `kind` column, because names come from the first arm.",
        "Labels make stacked data **groupable and filterable after the fact**: `GROUP BY kind` counts sources, `WHERE kind = 'supplier'` un-stacks a slice. Without the label the pile is anonymous.",
        "This is the standard shape of a **staged report**: several narrow queries, one tag each, one stack, one summary on the outside.",
      ],
    },
    { kind: "h", text: "Arms can be anything — wrap them" },
    {
      kind: "bullets",
      items: [
        "Each arm of a compound is a full `SELECT` — it may filter, aggregate, even join. The compound only cares about the **shape**: same column count, compatible types.",
        "When an arm needs its own `ORDER BY … LIMIT` (a \"top 3\" slice, say), **wrap it in a FROM subquery**: `SELECT id, total FROM (SELECT id, total FROM orders ORDER BY total DESC, id LIMIT 3)`. This parses in SQLite, Postgres and MySQL alike.",
        "The bare parenthesized arm — `(SELECT … LIMIT 3) UNION ALL …` — works in Postgres and MySQL but is a **syntax error in SQLite** (verified on this database). The FROM-wrap costs nothing and travels everywhere.",
      ],
    },
    { kind: "code",
      caption: "Top shelf and bottom shelf in one pile",
      sql: `SELECT id, total, 'top' AS tag
FROM (SELECT id, total FROM orders
      ORDER BY total DESC, id ASC LIMIT 3)
UNION ALL
SELECT id, total, 'bottom'
FROM (SELECT id, total FROM orders
      ORDER BY total ASC, id ASC LIMIT 3)
ORDER BY tag DESC, total DESC, id;`,
    },
    { kind: "h", text: "Alignment: count is law, types are manners" },
    {
      kind: "bullets",
      items: [
        "**Column count is enforced.** Two columns over three is an immediate error — no engine will pad or guess for you.",
        "**Types are coerced, differently.** Stack the number `1` on the text `'1'`: SQLite happily stores both (dynamic typing); Postgres and MySQL pick one common type. Queries that mix types per arm *look* fine in SQLite and then misbehave portably.",
        "`NULL` stacks without any ceremony — an arm returning NULLs just hands the pile a few holes, which matters next lesson when `INTERSECT`/`EXCEPT` compare rows.",
      ],
    },
    { kind: "diagram", figure: "s10-position-binding" },
    {
      kind: "dialect",
      db: "sqlite",
      text: "`UNION ALL` labeling works identically in SQLite, Postgres and MySQL — another fully portable pattern.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "`ORDER BY 1` (positional) sorts by the first output column in all three engines, but named columns survive refactors better.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL before 8.0.31 has no `INTERSECT`/`EXCEPT` at all (next two lessons) — stacking with `UNION [ALL]` is the *only* set op those versions offer.",
    },
    {
      kind: "tip",
      text: "Reading someone else's compound? Rewrite it mentally as three steps: what does each arm produce, how are the arms combined, what happens to the pile at the end (one ORDER BY). Every compound, however long, is those three questions.",
    },
  ],
  mcqs: [
    {
      id: "l18-q1",
      prompt: "Why add a literal label column like `'customer' AS kind` to each arm of a stack?",
      choices: [
        "It makes the query run faster",
        "It keeps the source of each row queryable — you can GROUP BY or filter by it after stacking",
        "It is required for UNION ALL to work",
        "It renames the table at runtime",
      ],
      answer: 1,
      why: "A stack forgets its origins. The label column is the only trace of where each row came from — and it enables group-by-source summaries.",
      notes: [
        { choice: 2, why: "UNION ALL stacks unlabeled arms perfectly well — the label is for the person querying the pile, not a requirement of the operator." },
      ],
    },
    {
      id: "l18-q2",
      prompt: "Arm 1 selects three columns, arm 2 selects two. What happens?",
      choices: [
        "The missing column is filled with NULL",
        "The extra column is dropped",
        "An error — arms must produce the same number of columns",
        "Only the first arm's rows are returned",
      ],
      answer: 2,
      why: "Column count is the one hard rule of stacking. Every engine rejects the mismatch; none pads or guesses.",
      notes: [
        { choice: 0, why: "No engine pads a short arm with NULLs — column count is the one hard shape rule of stacking." },
      ],
    },
    {
      id: "l18-q3",
      prompt: "You need one arm of a UNION to return only its top 3 rows — in a way that also runs on SQLite. Which form do you write?",
      choices: [
        "(SELECT … ORDER BY x LIMIT 3) UNION ALL …",
        "SELECT … UNION ALL (SELECT … LIMIT 3) with TOP 3",
        "SELECT … FROM (SELECT … ORDER BY x LIMIT 3) UNION ALL …",
        "Run two separate queries and paste the results",
      ],
      answer: 2,
      why: "SQLite rejects parentheses around compound arms, so the portable form wraps the limited arm in a FROM subquery. Postgres and MySQL accept both, but the FROM-wrap runs everywhere.",
      notes: [
        { choice: 0, why: "Parenthesized arms run in Postgres and MySQL but are a syntax error in SQLite — the FROM-wrap is the spelling that runs everywhere." },
      ],
    },
    {
      id: "l18-q4",
      prompt: "Stacking `SELECT 1` on `SELECT '1'` behaves how across engines?",
      choices: [
        "Error in every engine",
        "SQLite stacks both as-is; Postgres/MySQL coerce to one common type",
        "Postgres/MySQL stack both as-is; SQLite errors",
        "All three silently drop the text row",
      ],
      answer: 1,
      why: "SQLite's dynamic typing stacks number and text side by side; the typed engines pick a common type. Mixing types per arm is a portability trap, not a syntax error.",
      notes: [
        { choice: 0, why: "Nothing errors — SQLite's dynamic typing stacks 1 and '1' side by side; only the typed engines force a common type." },
      ],
    },
    {
      id: "l18-q5",
      prompt: "`SELECT name, 'customer' AS kind FROM customers UNION ALL SELECT name FROM suppliers` — what happens?",
      choices: [
        "Supplier rows come back with kind = NULL",
        "Error — arm 1 produces two columns, arm 2 only one",
        "The pile keeps two columns; supplier rows repeat the last kind",
        "SQLite fills kind with the text 'supplier' for supplier rows",
      ],
      answer: 1,
      why: "The label literal is a column like any other, so every arm must carry one at the same position. Arm 2 produces one column against arm 1's two — column count is law, and no engine pads.",
      notes: [
        { choice: 0, why: "Nothing fills missing columns — stacking has no NULL-padding pass. The shape mismatch is rejected before a single row is produced." },
      ],
    },
    {
      id: "l18-q6",
      prompt: "In `SELECT name AS label FROM customers UNION ALL SELECT name AS tag FROM suppliers ORDER BY …`, which spelling is the guaranteed-portable one?",
      choices: [
        "ORDER BY label — headers come from the first arm",
        "ORDER BY tag — the last arm's alias works too",
        "ORDER BY suppliers.name — qualify with the source table",
        "Both aliases resolve identically in every engine",
      ],
      answer: 0,
      why: "A compound takes its output names from arm 1 — the pile's column is label, whatever arm 2 calls its own expression. SQLite tolerates the arm-2 alias (verified on this db), but only the arm-1 name is a contract.",
      notes: [
        { choice: 3, why: "SQLite happens to resolve tag here because both aliases sit on the same single column — Postgres would refuse the unknown output name. Portability lives in arm 1." },
      ],
    },
    {
      id: "l18-q7",
      prompt: "`SELECT quantity FROM order_items UNION ALL SELECT rating FROM suppliers` stacks whole numbers on decimals. What does SQLite do?",
      choices: [
        "An error — arms must share one declared type",
        "It stacks as-is — integers stay integers, decimals keep their fractions",
        "Every rating is truncated to a whole number",
        "Both columns are converted to text",
      ],
      answer: 1,
      why: "SQLite's dynamic typing appends value-for-value with no coercion pass (verified on this db). Postgres instead resolves one common numeric type — INTEGER promotes — and hard-errors only on truly incompatible pairs like text-on-number.",
      notes: [
        { choice: 2, why: "No truncation pass exists — values cross the pile unchanged. The lesson's warning is about portability, not corruption." },
      ],
    },
    {
      id: "l18-q8",
      prompt: "You need each supplier's name next to its average product price. Stack or join — and why?",
      choices: [
        "Stack: UNION ALL of suppliers and a per-supplier average — same shape",
        "Join: the two facts belong on the same supplier row — set ops can't relate columns",
        "INTERSECT the two lists on supplier name",
        "EXCEPT the suppliers from the products",
      ],
      answer: 1,
      why: "Stacking appends same-shape rows to a pile; it can never place a supplier beside a value computed about that supplier. Relating columns across tables is exactly what JOIN + GROUP BY are for.",
      notes: [
        { choice: 0, why: "Even pre-computing the averages per arm leaves you piling rows, not pairing them — the stack has no mechanism to align a supplier with its own number." },
      ],
    },
    {
      id: "l18-q9",
      prompt: "Arm one selects 3 columns, arm two selects 2. What happens when SQLite stacks them?",
      choices: [
        "The missing column fills with NULL",
        "Error before any row is returned — SELECTs to the left and right of UNION must have the same number of result columns",
        "The extra column is dropped from arm one",
        "It works — column count is advisory",
      ],
      answer: 1,
      why: "Compound SELECTs are validated up front: both arms must project the same column count. The error message even names the operators involved — alignment is checked, never improvised.",
      notes: [
        { choice: 0, why: "No auto-padding exists in SQL. If you want a trailing NULL column, add the literal NULL explicitly in the shorter arm." },
      ],
    },
    {
      id: "l18-q10",
      prompt: "`SELECT name FROM customers UNION SELECT city FROM customers` — what is the result column called?",
      choices: ["city — the last arm wins", "name — the first arm names the columns", "A generated name like 'column1'", "Both, split into two columns"],
      answer: 1,
      why: "Position binds the values, but naming comes from the first arm. The output column is `name`, full stop — rename it there (`AS label`) to control what the header says.",
      notes: [
        { choice: 2, why: "Unlike a bare expression, compound SELECTs take their header from arm one. The awkward names only appear when arm one's column is itself an unnamed expression." },
      ],
    },
    {
      id: "l18-q11",
      prompt: "Arm one projects prices (numbers), arm two projects product names (text). SQLite stacks them anyway. What did you build?",
      choices: [
        "A clean numeric column — SQLite converts names to numbers",
        "A single mixed-type column that sorts and aggregates unreliably — legal, and almost always a bug",
        "An error on the second row",
        "Two columns — types keep arms separate",
      ],
      answer: 1,
      why: "SQLite's flexible typing permits the stack, but the shared column now holds both kinds of values: MAX() picks odd winners, joins mismatch, charts lie. Alignment means same count, same meaning, same type.",
      notes: [
        { choice: 0, why: "Nothing coerces on insert into the result column — 'Smart Watch S' stays text. Strict engines would refuse the stack outright; SQLite just trusts you." },
      ],
    },
  ],
  problems: [
    {
      id: "l18-p1",
      title: "The full directory",
      brief: "Build one labeled directory: every customer name tagged `'customer'` and every supplier name tagged `'supplier'`. Output: `name`, `kind` — ordered by `kind`, then `name`. 22 rows expected.",
      hints: [
        "A stack forgets where each row came from — add a constant label column to every arm and alias it once (AS kind) on the first.",
        "Shape: SELECT name, '<tag1>' AS kind FROM customers UNION ALL SELECT name, '<tag2>' FROM suppliers ORDER BY <keys>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT name, 'customer' AS kind FROM customers\nUNION ALL\nSELECT name, 'supplier' FROM suppliers\nORDER BY kind, name;",
      mistakes: [
        { test: "union\\s+all\\s+select\\s+name\\s+from\\s+suppliers", message: "The second arm drops its label — every arm must add its own literal tag, or the pile loses a column mid-stack." },
        { test: "'customer'\\s+from\\s+customers", message: "Alias the literal once — AS kind on the first arm is what names the pile's second column." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The directory must come out ordered by kind, then name — one ORDER BY at the very end of the compound." },
      ],
      expected: EXPECTED["l18-p1"],
      ordered: true,
    },
    {
      id: "l18-p2",
      title: "Count each source",
      brief: "Using the same labeled stack, report how many rows each `kind` contributes. Output: `kind`, `n` — ordered by `kind`.",
      hints: [
        "The label column makes the pile groupable — wrap the labeled stack in a FROM subquery and GROUP BY kind outside it.",
        "Shape: SELECT kind, COUNT(*) AS n FROM (<labeled stack>) GROUP BY kind ORDER BY kind;",
      ],
      difficulty: "medium",
      solution:
        "SELECT kind, COUNT(*) AS n FROM (\n  SELECT 'customer' AS kind FROM customers\n  UNION ALL\n  SELECT 'supplier' AS kind FROM suppliers\n) GROUP BY kind\nORDER BY kind;",
      mistakes: [
        { test: "^select\\s+count\\b", message: "Two stacked totals come back as anonymous rows — the brief wants one row per kind: group the labeled pile by kind and count inside a single query." },
        { test: "\\bunion\\b(?!\\s+all\\b)", message: "Plain UNION collapses the identical labeled rows — sixteen 'customer' rows would shrink to one. Keep UNION ALL so the counts stay 16 and 6." },
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "The brief wants one row per source — GROUP BY kind after the wrapped stack, with COUNT(*) AS n." },
      ],
      expected: EXPECTED["l18-p2"],
      ordered: true,
    },
    {
      id: "l18-p3",
      title: "Top shelf, bottom shelf",
      brief: "In one pile: the 3 biggest orders (by `total`, ties broken by lowest `id`) tagged `'top'`, and the 3 smallest tagged `'bottom'`. Output: `id`, `total`, `tag` — ordered `top` rows first, each group by `total` descending.",
      hints: [
        "Each arm needs its own top-3 slice — give every arm a FROM subquery with its own ORDER BY + LIMIT inside, then tag and stack.",
        "Shape: SELECT id, total, '<tag1>' AS tag FROM (SELECT … ORDER BY total DESC LIMIT 3) UNION ALL SELECT id, total, '<tag2>' FROM (SELECT … ORDER BY total ASC LIMIT 3) ORDER BY <keys>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT id, total, 'top' AS tag\nFROM (SELECT id, total FROM orders\n      ORDER BY total DESC, id ASC LIMIT 3)\nUNION ALL\nSELECT id, total, 'bottom' AS tag\nFROM (SELECT id, total FROM orders\n      ORDER BY total ASC, id ASC LIMIT 3)\nORDER BY tag DESC, total DESC, id;",
      mistakes: [
        { test: "^\\(\\s*select|\\bunion\\s*(all\\s*)?\\(\\s*select", message: "SQLite rejects parentheses around a compound arm — wrap the limited arm in a FROM subquery instead: SELECT … FROM (SELECT … ORDER BY total … LIMIT 3)." },
        { test: "union\\s+all\\s+select\\s+id\\s*,\\s*total\\s+from", message: "The bottom arm lost its tag — both arms must carry their literal ('top' / 'bottom') so the pile keeps three columns end to end." },
        { test: "\\blimit\\s+\\d+\\s*\\)\\s*(;|$)", message: "The compound ends right after the last wrapped arm — the finished pile still needs its final ORDER BY (tag DESC, total DESC, id)." },
      ],
      expected: EXPECTED["l18-p3"],
      ordered: true,
    },
    {
      id: "l18-p4",
      title: "US directory",
      brief: "One labeled pile of the names of US-based customers *and* US-based suppliers. Output: `name`, `kind` — ordered by `kind`, then `name`. Three rows expected.",
      hints: [
        "Same labeled stack as the directory — push the region filter into each arm so only US rows enter the pile.",
        "Shape: SELECT name, '<tag1>' AS kind FROM customers WHERE region = '<r>' UNION ALL SELECT name, '<tag2>' FROM suppliers WHERE region = '<r>' ORDER BY <keys>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT name, 'customer' AS kind FROM customers WHERE region = 'US'\nUNION ALL\nSELECT name, 'supplier' FROM suppliers WHERE region = 'US'\nORDER BY kind, name;",
      mistakes: [
        { test: "\\bjoin\\b", message: "A JOIN pairs each US customer with US suppliers row-by-row — the brief wants two independent US lists stacked into one pile: UNION ALL." },
        { test: "^select\\b(?:(?!\\bwhere\\b).)*$", message: "Only three rows are expected — filter each arm with WHERE region = 'US' so the pile gets just the US names." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The pile must come out ordered by kind, then name — one ORDER BY at the very end of the compound." },
      ],
      expected: EXPECTED["l18-p4"],
      ordered: true,
    },
    {
      id: "l18-p5",
      title: "Open vs dead, one pile",
      brief: "The ops queue as one pile: every pending order id tagged `'pending'`, every cancelled id tagged `'cancelled'`. Output: `id`, `kind` — ordered by `id`. 21 rows expected.",
      hints: [
        "Two same-shape lists — the waiting orders and the dead ones — each arm filters its own status and carries its own literal tag.",
        "Shape: SELECT id, '<tag1>' AS kind FROM orders WHERE status = '<s1>' UNION ALL SELECT id, '<tag2>' FROM orders WHERE status = '<s2>' ORDER BY id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT id, 'pending' AS kind FROM orders WHERE status = 'pending'\nUNION ALL\nSELECT id, 'cancelled' FROM orders WHERE status = 'cancelled'\nORDER BY id;",
      mistakes: [
        { test: "'(open|dead|live|lost)'", message: "Those tags aren't in the brief — the pile must read 'pending' and 'cancelled', the statuses as the data spells them." },
        { test: "union\\s+(all\\s+)?select\\s+(id|order_id)\\s*,\\s*'[^']*'\\s+from\\s+orders(?!\\s+where)", message: "The stacked arm lost its status filter — without WHERE it tags all 103 orders. Push the filter into each arm so only that status enters." },
        { test: "order\\s+by\\s+kind\\b|^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The queue must come out ordered by id — one ORDER BY id at the very end of the compound (the kind tag is a label, not the sort key)." },
      ],
      expected: EXPECTED["l18-p5"],
      ordered: true,
    },
    {
      id: "l18-p6",
      title: "Filtering the pile",
      brief: "Person directory, Berlin office only: stack customers (name, city) with suppliers (name, region) AS `person`, `place` — then keep only rows where place = 'Berlin'. Output: `person`, `place` — ordered by `person`. Suppliers can't appear (they have no city), and the filter belongs on the combined pile, not inside an arm.",
      hints: [
        "place is a column of the finished pile, not of either table — wrap the labeled stack in a FROM subquery and filter the pile outside it.",
        "Shape: SELECT person, place FROM (SELECT name AS person, city AS place FROM customers UNION ALL SELECT name, region FROM suppliers) WHERE place = '<p>' ORDER BY person;",
      ],
      difficulty: "hard",
      solution:
        "SELECT person, place FROM (\n  SELECT name AS person, city AS place FROM customers\n  UNION ALL\n  SELECT name, region FROM suppliers\n) WHERE place = 'Berlin'\nORDER BY person;",
      mistakes: [
        { test: "(?<!\\) )where\\s+place\\b", message: "There is no place column inside the arms — customers filters with city, suppliers with region. place exists only on the wrapped pile, so the WHERE belongs outside the subquery." },
        { test: "\\bfrom\\s+suppliers\\s+where\\s+city\\b|\\bfrom\\s+customers\\s+where\\s+region\\s*=\\s*'berlin'", message: "Wrong geography for that arm — suppliers have region only (EU/APAC/US/LATAM, no cities), and no customer region reads 'Berlin'. The Berlin rows come from the customers' city column; filter the pile by place." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The directory must come out ordered by person — one ORDER BY person after the wrapped pile's WHERE." },
      ],
      expected: EXPECTED["l18-p6"],
      ordered: true,
    },
    {
      id: "l18-p7",
      title: "The triple directory",
      brief: "Summarize a three-source pile in one pass: stack labeled arms — 'customer', 'supplier', 'product' — inside a FROM subquery, then GROUP BY kind outside it. Output: `kind`, `n` — ordered by `kind` (16 · 6 · 16).",
      hints: [
        "The labels make the pile groupable — stack the three arms first, then run one GROUP BY kind with COUNT(*) over the wrapped pile.",
        "Shape: SELECT kind, COUNT(*) AS n FROM (SELECT '<label1>' AS kind FROM <t1> UNION ALL SELECT '<label2>' FROM <t2> UNION ALL SELECT '<label3>' FROM <t3>) GROUP BY kind ORDER BY kind;",
      ],
      difficulty: "hard",
      solution:
        "SELECT kind, COUNT(*) AS n FROM (\n  SELECT 'customer' AS kind FROM customers\n  UNION ALL\n  SELECT 'supplier' FROM suppliers\n  UNION ALL\n  SELECT 'product' FROM products\n) GROUP BY kind\nORDER BY kind;",
      mistakes: [
        { test: "\\bunion\\b(?!\\s+all\\b)", message: "Plain UNION dedupes the pile before the GROUP BY — sixteen identical 'customer' rows collapse to one and every count reports 1. Keep UNION ALL so each source keeps its rows." },
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+from\\s+(customers|suppliers|products)\\b", message: "One COUNT per arm reports three separate one-row piles — the brief wants the stack summarized in a single pass: wrap the labeled arms in a FROM subquery, then GROUP BY kind outside." },
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$|group\\s+by\\s+kind\\s*;", message: "Both clauses live outside the wrap: GROUP BY kind makes one row per source, then ORDER BY kind lines them up — customer, product, supplier." },
      ],
      expected: EXPECTED["l18-p7"],
      ordered: true,
    },
    {
      id: "l18-p8",
      title: "Cross-shelf top 5",
      brief: "One leaderboard across shelves: stack every order's customer name with its rounded total (`ROUND(total, 2)`) against every supplier name with its `rating`. Output: `entity`, `score` — ORDER BY score DESC, entity, then LIMIT 5.",
      hints: [
        "Same shape both arms — a name and a number — but arm 1's number is the order total (rounded) and its name must be joined in from customers; the ranking happens once, on the pile.",
        "Shape: SELECT c.name AS entity, ROUND(o.total, 2) AS score FROM orders o JOIN customers c ON <join> UNION ALL SELECT name, rating FROM suppliers ORDER BY score DESC, entity LIMIT <n>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name AS entity, ROUND(o.total, 2) AS score\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nUNION ALL\nSELECT name, rating FROM suppliers\nORDER BY score DESC, entity\nLIMIT 5;",
      mistakes: [
        { test: "^select\\s+name\\s*,\\s*(?:round\\s*\\(\\s*)?total", message: "orders has no name column — arm 1 must JOIN customers on customer_id to pull each order's buyer (c.name AS entity)." },
        { test: "order\\s+by\\s+score\\s*asc\\b|order\\s+by\\s+score\\s*,", message: "A top-5 needs the biggest first — ORDER BY score DESC (entity as tiebreaker); ascending would surface the 25.47 floor of the pile." },
        { test: "^select\\b(?:(?!\\blimit\\b).)*$", message: "Five rows — the final ORDER BY score DESC, entity must be followed by LIMIT 5 at the very end of the compound." },
      ],
      expected: EXPECTED["l18-p8"],
      ordered: true,
    },
  ],
  takeaway: "A literal label column keeps a stack's origins queryable, arms are full SELECTs (wrap per-arm ORDER BY/LIMIT in FROM subqueries), and column count is law while types are only manners.",
};
