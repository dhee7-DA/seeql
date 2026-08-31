import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson05: Lesson = {
  id: "lesson-05",
  num: 5,
  title: "ORDER BY & LIMIT — sorting and top-N",
  blurb: "Put rows in a deliberate order, take the top of the list, and paginate results",
  minutes: 14,
  blocks: [
    {
      kind: "p",
      text: "Lesson 1 said tables have no order — so if a result needs order, you must request it, and `ORDER BY` is that request. It sorts ascending (`ASC`, the default) or descending (`DESC`), and runs near the end of the pipeline — which is why you **can** sort by a SELECT alias here, unlike in WHERE.",
    },
    { kind: "diagram", figure: "l4-sort-limit" },
    {
      kind: "code",
      caption: "The catalog, most expensive first",
      sql: "SELECT name, price FROM products ORDER BY price DESC;",
      runnable: true,
    },
    { kind: "h", text: "Multi-key sorting" },
    {
      kind: "bullets",
      items: [
        "`ORDER BY category ASC, price DESC` reads left to right — sort by category, then **within** each category by price, highest first.",
        "Ties fall through to the next key; rows still tied after all keys come back in no guaranteed order.",
        "Add a final tiebreaker (often the primary key) when the exact order of your export matters.",
      ],
    },
    { kind: "h", text: "LIMIT & OFFSET" },
    {
      kind: "bullets",
      items: [
        "**LIMIT** caps how many rows come back, and runs **after** the sort — so `ORDER BY price DESC LIMIT 3` is the top-3 by price, not \"3 random rows sorted\".",
        "That pairing is the single most-used reporting pattern in existence: the biggest orders, the latest signups, the worst offenders.",
        "**OFFSET** skips rows first — `LIMIT 5 OFFSET 10` is page 3 of a 5-per-page view.",
      ],
    },
    {
      kind: "code",
      caption: "Top 3 orders ever",
      sql: "SELECT id, total FROM orders ORDER BY total DESC LIMIT 3;",
      runnable: true,
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "NULL placement differs by engine: SQLite sorts NULLs first ascending (last descending); PostgreSQL defaults the opposite way. Both can say it explicitly with NULLS FIRST / NULLS LAST — portable code filters NULLs or COALESCEs before relying on placement.",
    },
    {
      kind: "warn",
      text: "Top-N is only honest if the sort key is total. On ties at the cut-off, which rows make the list is arbitrary — add a tiebreaker (`ORDER BY total DESC, id ASC`) when the boundary matters.",
    },
  ],
  mcqs: [
    {
      id: "l5-q1",
      prompt: "Default sort direction without ASC/DESC?",
      choices: ["DESC", "ASC", "Insert order", "Random but stable"],
      answer: 1,
      why: "Plain ORDER BY col means ascending. Write DESC explicitly for biggest/first — reading it beats assuming it.",
      notes: [
        { choice: 2, why: "Insert order was lesson 1's point: tables have no order of their own — ASC is what a bare ORDER BY means." },
      ],
    },
    {
      id: "l5-q2",
      prompt: "`ORDER BY total DESC LIMIT 3` returns…",
      choices: [
        "3 random rows, sorted",
        "The first 3 rows of the table, sorted",
        "The 3 biggest-total rows",
        "An error — LIMIT needs OFFSET",
      ],
      answer: 2,
      why: "Sorting happens first, the cap applies to the sorted list — that's the standard top-N pattern.",
      notes: [
        { choice: 1, why: "That's LIMIT without ORDER BY — undefined rows. With ORDER BY in front, the cap applies to the *sorted* list, which is what makes it top-N." },
      ],
    },
    {
      id: "l5-q3",
      prompt: "`LIMIT 5 OFFSET 10` gives you…",
      choices: [
        "Rows 1–5",
        "Rows 6–10",
        "Rows 11–15",
        "10 rows starting from row 5",
      ],
      answer: 2,
      why: "OFFSET skips 10 rows, LIMIT then returns the next 5 — page 3 in a 5-per-page pagination scheme.",
      notes: [
        { choice: 1, why: "Rows 6–10 would be page 2 — you skipped only five there (LIMIT 5 OFFSET 5)." },
      ],
    },
    {
      id: "l5-q4",
      prompt: "`ORDER BY category, price DESC` does what?",
      choices: [
        "Sorts by price, then breaks ties by category",
        "Sorts by category A→Z, and within each category by price high→low",
        "Sorts both columns ascending",
        "Errors — directions must match",
      ],
      answer: 1,
      why: "Keys apply left to right; each key carries its own direction. Mixed directions per key are normal and useful.",
      notes: [
        { choice: 0, why: "Key order is backwards — price sorts first only when it's written first. Category leads, price breaks the ties within each category." },
      ],
    },
    {
      id: "l5-q5",
      prompt: "`ORDER BY total DESC, id ASC` — what is the second key for?",
      choices: [
        "It reverses the first sort",
        "Breaking ties: rows with equal totals are ordered by id ascending",
        "It sorts by column number 2",
        "Nothing — only the first key matters",
      ],
      answer: 1,
      why: "Multi-key sorting applies keys left to right; later keys only decide among ties. Deterministic tiebreakers keep results stable across runs.",
      notes: [
        { choice: 2, why: "ORDER BY 2 would mean the *second SELECT-list column* (positional shorthand) — id here, but by position, not name." },
      ],
    },
    {
      id: "l5-q6",
      prompt: "`SELECT * FROM orders LIMIT 5` (no ORDER BY) returns…",
      choices: [
        "The 5 smallest ids, guaranteed",
        "An unspecified 5 rows — without ORDER BY, LIMIT alone has no defined 'first'",
        "A database error — LIMIT needs ORDER BY",
        "5 random rows, different on every run",
      ],
      answer: 1,
      why: "Tables are unordered sets; LIMIT chops an undefined order. SQLite usually shows insertion order, but 'usually' is not a guarantee — add ORDER BY when 'first' matters.",
      notes: [
        { choice: 3, why: "Not random in practice — SQLite is *deterministic* but unspecified: the same 5 rows come back, yet nothing in the standard says which 5." },
      ],
    },
    {
      id: "l5-q7",
      prompt: "How do you fetch rows 11–15 of a sorted result?",
      choices: [
        "LIMIT 5 OFFSET 10",
        "LIMIT 11, 15 — smallest and largest",
        "TOP 5 SKIP 10",
        "You cannot — SQL returns whole tables only",
      ],
      answer: 0,
      why: "LIMIT 5 OFFSET 10 skips ten sorted rows and returns the next five. Page size = LIMIT, page number drives OFFSET — that's pagination in its rawest form.",
      notes: [
        { choice: 1, why: "The comma form means something else entirely (MySQL's LIMIT offset, count) — LIMIT 11, 15 skips 11 and returns 15, a completely different window." },
      ],
    },
    {
      id: "l5-q8",
      prompt: "`ORDER BY 2` sorts by…",
      choices: [
        "The column named '2'",
        "The second column in the SELECT list",
        "The row number",
        "Nothing — it's invalid",
      ],
      answer: 1,
      why: "Integers in ORDER BY are positional shorthand for SELECT-list columns. Legal but fragile — adding a column silently re-sorts your query. Prefer explicit names.",
      notes: [
        { choice: 0, why: "No column is *named* 2 — the integer is a position in the SELECT list, a shorthand that works but shouldn't ship." },
      ],
    },
    {
      id: "l5-q9",
      prompt: "`ORDER BY price` with no direction sorts…",
      choices: [
        "Ascending — ASC is the default",
        "Descending",
        "In insertion order",
        "Undefined until you write ASC",
      ],
      answer: 0,
      why: "ASC is implied. Write DESC when you need biggest-first; many teams write ASC explicitly just so the intent reads clearly.",
      notes: [
        { choice: 2, why: "Storage order is never the answer — the sort key decides, and without DESC that decision is ascending." },
      ],
    },
    {
      id: "l5-q10",
      prompt: "`ORDER BY name` on customers — how are the names compared?",
      choices: [
        "By string (lexicographic) order: 'Alice' before 'Bruno'",
        "By row length",
        "Randomly — text cannot be sorted",
        "By signup date automatically",
      ],
      answer: 0,
      why: "Text sorts lexicographically (case and locale rules apply). Numbers sort numerically: 9 < 10 — but '10' < '9' as text, another reason types matter.",
      notes: [
        { choice: 1, why: "Length isn't a sort key — 'Zoe' sorts after 'Albert' lexicographically despite being shorter." },
      ],
    },
    {
      id: "l5-q11",
      prompt: "`ORDER BY shipped_at ASC` — where do the 21 NULL (never-shipped) orders land in SQLite?",
      choices: [
        "At the end",
        "At the start — SQLite sorts NULLs first ascending",
        "They are dropped from the result",
        "Randomly interleaved",
      ],
      answer: 1,
      why: "In SQLite, NULLs sort before everything else ascending (and last descending). Engines differ here — Postgres defaults the opposite way — so NULL placement is worth checking whenever the column can be NULL.",
      notes: [
        { choice: 2, why: "Sorting never drops rows — the 21 NULLs are in the result, just clustered at the very start." },
      ],
    },
    {
      id: "l5-q12",
      prompt: "The 5 most expensive products require which clause combination?",
      choices: [
        "ORDER BY price LIMIT 5",
        "ORDER BY price DESC LIMIT 5",
        "WHERE price > 5",
        "LIMIT 5 DESC",
      ],
      answer: 1,
      why: "Sort descending so the top of the list is the most expensive, then LIMIT keeps the first five. WHERE can't know 'most expensive' — it filters rows, not ranks.",
      notes: [
        { choice: 0, why: "Ascending order puts the *cheapest* on top — the priciest five need DESC before the LIMIT." },
      ],
    },
    {
      id: "l5-q13",
      prompt: "`SELECT name, price * 0.92 AS price_eur FROM products ORDER BY price_eur DESC` — is sorting by the alias legal?",
      choices: [
        "Yes — ORDER BY runs after SELECT, so the alias already exists",
        "No — aliases are only usable in HAVING",
        "Yes, but only in SQLite",
        "No — you must repeat the whole expression",
      ],
      answer: 0,
      why: "ORDER BY is the one clause that runs *after* SELECT, so SELECT aliases are visible to it (unlike WHERE). This works in SQLite, PostgreSQL and MySQL alike.",
      notes: [
        { choice: 1, why: "It's WHERE that can't see aliases (it runs first) — ORDER BY runs last and can sort by them happily." },
      ],
    },
    {
      id: "l5-q14",
      prompt: "Which of these queries lists products from cheapest to priciest?",
      choices: [
        "ORDER BY price DESC",
        "ORDER BY price ASC",
        "ORDER BY price — which is identical to the ASC version",
        "The first and second differ; the third is invalid",
      ],
      answer: 2,
      why: "ASC is the default direction, so `ORDER BY price` and `ORDER BY price ASC` are the same query — and both sort cheapest-first. Only DESC inverts.",
      notes: [
        { choice: 0, why: "DESC is biggest-first — that's the *most* expensive first, the opposite of the ask." },
      ],
    },
    {
      id: "l5-q15",
      prompt: "Two orders tie for 3rd-biggest total at your LIMIT cut-off. What makes the top-N list deterministic?",
      choices: [
        "A tiebreaker key, like ORDER BY total DESC, id ASC",
        "WHERE total = MAX(total)",
        "A bigger LIMIT until the right rows appear",
        "ORDER BY RANDOM()",
      ],
      answer: 0,
      why: "Ties at the cut-off make the choice arbitrary; a final tiebreaker (often the primary key) fixes exactly which rows make the list and in what order.",
      notes: [
        { choice: 3, why: "RANDOM() would make things *worse* — a different list on every run. Determinism comes from a stable tiebreaker key." },
      ],
    },
    {
      id: "l5-q16",
      prompt: "What does `SELECT * FROM orders OFFSET 10` (no LIMIT) do in SQLite?",
      choices: [
        "A syntax error — OFFSET must follow a LIMIT in SQLite",
        "Skips 10 rows and returns the rest",
        "Returns the first 10 rows",
        "Paginates automatically at 10 per page",
      ],
      answer: 0,
      why: "SQLite requires the pair LIMIT <n> OFFSET <m> (use LIMIT -1 for 'no cap'). PostgreSQL, by contrast, happily accepts a bare OFFSET — a real dialect difference.",
      notes: [
        { choice: 1, why: "That's the PostgreSQL behavior — SQLite is stricter and rejects the query outright." },
      ],
    },
    {
      id: "l5-q17",
      prompt: "Sort customers by region A→Z, then by newest signup first *within* each region. Which is right?",
      choices: [
        "ORDER BY region, created_at",
        "ORDER BY region ASC, created_at DESC",
        "ORDER BY created_at DESC, region",
        "ORDER BY region DESC, created_at ASC",
      ],
      answer: 1,
      why: "Keys apply left to right, each with its own direction: region ascending groups A→Z, then created_at DESC puts the newest signup at the top of each regional group.",
      notes: [
        { choice: 2, why: "Key order is backwards — that sorts by date globally, only using region to break ties. The grouping column comes first." },
      ],
    },
    {
      id: "l5-q18",
      prompt: "Why do style guides prefer `ORDER BY price` over `ORDER BY 2`?",
      choices: [
        "Positional references are slower",
        "Inserting a column into the SELECT list silently re-targets the sort — positionals are fragile",
        "ORDER BY 2 is invalid in modern SQL",
        "Names sort faster than numbers",
      ],
      answer: 1,
      why: "Integers in ORDER BY are positions in the SELECT list — they work, but adding or reordering a column silently changes what you're sorting by. Explicit names survive edits.",
      notes: [
        { choice: 2, why: "It's perfectly valid (and ancient) SQL — the problem is fragility, not validity." },
      ],
    },
    {
      id: "l5-q19",
      prompt: "How does PostgreSQL spell the same pagination as SQLite's `LIMIT 5 OFFSET 10`?",
      choices: [
        "FETCH FIRST 5 ROWS ONLY OFFSET 10 ROWS — standard SQL, same semantics",
        "PostgreSQL cannot paginate",
        "SKIP 10 TAKE 5",
        "ROWNUM BETWEEN 11 AND 15",
      ],
      answer: 0,
      why: "The SQL:2008 standard spelling is FETCH FIRST n ROWS ONLY (with OFFSET) — Postgres supports it alongside LIMIT. MySQL uses the comma form LIMIT offset, count. Same window, three spellings.",
      notes: [
        { choice: 3, why: "ROWNUM belongs to Oracle's world — Postgres uses LIMIT/OFFSET or the standard FETCH form." },
      ],
    },
    {
      id: "l5-q20",
      prompt: "Which ORDER BY puts the most recently created order at the top?",
      choices: [
        "ORDER BY created_at",
        "ORDER BY created_at DESC",
        "ORDER BY created_at ASC",
        "ORDER BY DATE(created_at)",
      ],
      answer: 1,
      why: "Dates here are ISO text, so the largest value is the latest — DESC puts it first. Plain and ASC both put the oldest at the top.",
      notes: [
        { choice: 0, why: "No direction means ASC — the *oldest* order tops that list." },
      ],
    },
  ],
  problems: [
    {
      id: "l5-p1",
      title: "The expensive shelf",
      brief: "Return `name` and `price` of the 5 most expensive products, highest first.",
      hints: [
        "Sort so the priciest lands on top, then cap the list at five.",
        "Shape: SELECT name, price FROM products ORDER BY price DESC LIMIT <n>;",
      ],
      difficulty: "easy",
      solution: "SELECT name, price FROM products ORDER BY price DESC LIMIT 5;",
      mistakes: [
        { test: "\\border\\s+by\\s+price\\s+asc\\b", message: "ASC puts the cheapest on top — 'most expensive' needs DESC." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "This task is graded on row ORDER — you need ORDER BY price DESC (plus LIMIT 5)." },
      ],
      expected: EXPECTED["l5-p1"],
      ordered: true,
    },
    {
      id: "l5-p2",
      title: "Three biggest orders",
      brief: "Return `id` and `total` of the 3 orders with the largest totals, largest first. Break ties by smaller `id` first.",
      hints: [
        "Two sort keys: total descending, then id ascending as the deterministic tiebreaker.",
        "Shape: SELECT id, total FROM orders ORDER BY total DESC, id ASC LIMIT <n>;",
      ],
      difficulty: "medium",
      solution: "SELECT id, total FROM orders ORDER BY total DESC, id ASC LIMIT 3;",
      mistakes: [
        { test: "\\border\\s+by\\s+total\\s+desc\\s*(;|limit)", message: "The brief asks for a tiebreaker — append `, id ASC` so tied totals order deterministically by id." },
      ],
      expected: EXPECTED["l5-p2"],
      ordered: true,
    },
    {
      id: "l5-p3",
      title: "Page two of the roster",
      brief: "Return `name` and `city` of customers 6–10 in alphabetical order by name (page 2 of a 5-per-page list).",
      hints: [
        "Sort alphabetically, skip the first page, take the second.",
        "Shape: SELECT name, city FROM customers ORDER BY name ASC LIMIT 5 OFFSET <skip>;",
      ],
      difficulty: "medium",
      solution: "SELECT name, city FROM customers ORDER BY name ASC LIMIT 5 OFFSET 5;",
      mistakes: [
        { test: "offset\\s+10", message: "Page 2 of 5-per-page skips only the first *five* rows — LIMIT 5 OFFSET 5. OFFSET 10 would be page 3." },
        { test: "offset\\s+5\\s+limit\\s+5", message: "SQLite's clause order is LIMIT first, OFFSET second: LIMIT 5 OFFSET 5." },
      ],
      expected: EXPECTED["l5-p3"],
      ordered: true,
    },
    {
      id: "l5-p4",
      title: "The budget shelf",
      brief: "The 5 cheapest products, cheapest first. Return `name` and `price`.",
      hints: [
        "Cheapest first is ascending — the default direction.",
        "Shape: SELECT name, price FROM products ORDER BY price ASC LIMIT <n>;",
      ],
      difficulty: "easy",
      solution: "SELECT name, price FROM products ORDER BY price ASC LIMIT 5;",
      mistakes: [
        { test: "\\border\\s+by\\s+price\\s+desc\\b", message: "DESC lists the priciest first — cheapest-first is ASC (or a bare ORDER BY price)." },
      ],
      expected: EXPECTED["l5-p4"],
      ordered: true,
    },
    {
      id: "l5-p5",
      title: "The heavy orders",
      brief: "Top 5 orders by value. Return `id` and `total`, biggest first — with `id ASC` as a deterministic tiebreaker.",
      hints: [
        "Same shape as the three-biggest task, but five rows — keep the tiebreaker.",
        "Shape: SELECT id, total FROM orders ORDER BY total DESC, id ASC LIMIT <n>;",
      ],
      difficulty: "medium",
      solution: "SELECT id, total FROM orders ORDER BY total DESC, id ASC LIMIT 5;",
      mistakes: [
        { test: "\\border\\s+by\\s+total\\s+desc\\s*(;|limit)", message: "Without `, id ASC` the tie order is arbitrary — the brief demands the deterministic tiebreaker." },
      ],
      expected: EXPECTED["l5-p5"],
      ordered: true,
    },
    {
      id: "l5-p6",
      title: "Page two of the catalog",
      brief: "Products 6–10 alphabetically. Return `name`, sorted by name — skip the first 5.",
      hints: [
        "Alphabetical = ORDER BY name; skip five, take five.",
        "Shape: SELECT name FROM products ORDER BY name LIMIT <n> OFFSET <skip>;",
      ],
      difficulty: "medium",
      solution: "SELECT name FROM products ORDER BY name LIMIT 5 OFFSET 5;",
      mistakes: [
        { test: "offset\\s+10", message: "Products 6–10 means skipping five rows — OFFSET 5. OFFSET 10 starts at product 11." },
      ],
      expected: EXPECTED["l5-p6"],
      ordered: true,
    },
    {
      id: "l5-p7",
      title: "The full roster, A to Z",
      brief: "Every customer's `name` and `city`, alphabetical by name.",
      hints: [
        "One sort key, ascending — the default direction.",
        "Shape: SELECT name, city FROM customers ORDER BY name;",
      ],
      difficulty: "easy",
      solution: "SELECT name, city FROM customers ORDER BY name;",
      mistakes: [
        { test: "\\blimit\\b", message: "No cap was requested — every customer belongs on the roster." },
        { test: "\\border\\s+by\\s+name\\s+desc", message: "DESC runs Z to A — the roster reads A to Z (ascending)." },
      ],
      expected: EXPECTED["l5-p7"],
      ordered: true,
    },
    {
      id: "l5-p8",
      title: "The six newest orders",
      brief: "The 6 most recent orders by `created_at` (ties: latest id first). Return `id` and `created_at`.",
      hints: [
        "Newest first = created_at DESC; ties broken by id DESC ('latest id first').",
        "Shape: SELECT id, created_at FROM orders ORDER BY created_at DESC, id DESC LIMIT <n>;",
      ],
      difficulty: "medium",
      solution: "SELECT id, created_at FROM orders ORDER BY created_at DESC, id DESC LIMIT 6;",
      mistakes: [
        { test: "\\border\\s+by\\s+created_at\\s+asc\\b", message: "ASC lists the oldest first — 'most recent' needs DESC." },
        { test: "\\border\\s+by\\s+created_at\\s+desc\\s*(;|limit)", message: "The brief specifies a tie direction: latest id first — append `, id DESC`." },
      ],
      expected: EXPECTED["l5-p8"],
      ordered: true,
    },
  ],
  takeaway: "ORDER BY sorts (keys read left to right, ASC by default, each with its own direction), LIMIT caps the sorted result — that's top-N — and OFFSET skips ahead; together they turn an unordered table into a deliberate list.",
};
