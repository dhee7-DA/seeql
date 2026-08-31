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
  ],
  takeaway: "A literal label column keeps a stack's origins queryable, arms are full SELECTs (wrap per-arm ORDER BY/LIMIT in FROM subqueries), and column count is law while types are only manners.",
};
