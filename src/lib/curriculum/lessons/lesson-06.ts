import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson06: Lesson = {
  id: "lesson-06",
  num: 6,
  title: "DISTINCT — the uniqueness lens",
  blurb: "Collapse duplicates into the set of values that actually exist",
  minutes: 11,
  blocks: [
    {
      kind: "p",
      text: "Ask the orders table \"who has ordered?\" with `SELECT customer_id FROM orders` and you get ~100 rows — customers repeated for every purchase. Append **DISTINCT** and the engine collapses duplicates: same rows in, a *set* out. One keyword turns transactional noise into the analytical question you actually meant.",
    },
    { kind: "diagram", figure: "l5-distinct" },
    {
      kind: "code",
      caption: "One row per value that exists",
      sql: "SELECT DISTINCT status FROM orders;",
      runnable: true,
    },
    { kind: "h", text: "How DISTINCT decides" },
    {
      kind: "bullets",
      items: [
        "It applies to the **entire selected row**, not the first column — `SELECT DISTINCT city, region` returns each **combination** once: Berlin/EU appears once even if two customers live in Berlin.",
        "Columns that are already unique (ids) barely change; low-cardinality columns (`status`, `region`) collapse completely; high-cardinality ones shrink only slightly.",
        "It composes with the toolkit: filter first (`WHERE` runs before SELECT), sort the deduped set with `ORDER BY`, cap it with `LIMIT`.",
        "**One caution** — if you're deduping to \"fix\" doubled rows, first ask **why** the duplicates exist. Often the real bug is a repeated join or a missing filter; DISTINCT silences the symptom, not the bug.",
      ],
    },
    { kind: "diagram", figure: "l6-distinct-mech" },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL refuses to sort a deduplicated result by a column it didn't return: `SELECT DISTINCT city FROM customers ORDER BY region` fails with \"for SELECT DISTINCT, ORDER BY expressions must appear in select list\". Keeping the sort key in the SELECT list — as every query in this lesson does — runs on every engine.",
    },
    {
      kind: "tip",
      text: "`SELECT DISTINCT region FROM suppliers ORDER BY region;` is the standard way to populate a filter dropdown with clean, sorted options.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL (and SQLite 3.30+) can attach a condition straight to an aggregate: `COUNT(*) FILTER (WHERE active = 1)`. MySQL has no FILTER clause — the portable spelling is `SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END)`, which Module 3 teaches properly.",
    },
  ],
  mcqs: [
    {
      id: "l6-q1",
      prompt: "`SELECT DISTINCT city, region FROM customers` returns…",
      choices: [
        "Each city once, ignoring region",
        "Each unique city–region combination once",
        "All rows, sorted uniquely",
        "Only rows where city equals region",
      ],
      answer: 1,
      why: "DISTINCT operates on whole output rows. Two customers in the same city and region collapse into one; same city in a different region does not.",
      notes: [
        { choice: 0, why: "That's the first-column myth — DISTINCT can't ignore region, because the output row *is* the pair: a city appearing in two regions would stay two rows." },
      ],
    },
    {
      id: "l6-q2",
      prompt: "`SELECT DISTINCT customer_id FROM orders` returns one row per…",
      choices: [
        "order",
        "customer who has placed at least one order",
        "customer in the customers table",
        "month in the data",
      ],
      answer: 1,
      why: "Deduping the ids in orders gives the set of customers with ≥1 order. Customers with zero orders can't appear — their id is never in the table.",
      notes: [
        { choice: 2, why: "In this store both lists happen to hold 16 only because every customer has ordered — a list derived from orders can never contain a customer who never ordered." },
      ],
    },
    {
      id: "l6-q3",
      prompt: "DISTINCT runs relative to WHERE how?",
      choices: [
        "Before WHERE — you dedupe the whole table",
        "After WHERE — filter first, then collapse",
        "Instead of WHERE",
        "Undefined order",
      ],
      answer: 1,
      why: "Logical order is FROM → WHERE → SELECT (and DISTINCT is part of SELECT). Filtering first also gives DISTINCT less work to do.",
      notes: [
        { choice: 0, why: "If DISTINCT ran before WHERE, values you explicitly filtered out would still appear — WHERE trims rows first, then SELECT projects and dedupes what's left." },
      ],
    },
    {
      id: "l6-q4",
      prompt: "You dedupe and the row count drops wildly. Best first reaction?",
      choices: [
        "Ship it — fewer rows is faster",
        "DISTINCT is broken in SQLite",
        "Investigate why duplicates existed — a join or filter may be wrong",
        "Add more DISTINCTs everywhere",
      ],
      answer: 2,
      why: "Big surprises from DISTINCT usually reveal doubled data upstream (fan-out from a join, missing filter). Treat it as a signal, not a fix.",
      notes: [
        { choice: 0, why: "Fewer rows isn't a win if the missing rows were real — totals and rates go quietly wrong. The drop is a clue to chase, not a performance feature." },
      ],
    },
    {
      id: "l6-q5",
      prompt: "`SELECT DISTINCT city, region FROM customers` — what does DISTINCT apply to?",
      choices: [
        "Only the first column, city",
        "The whole row combination — unique (city, region) pairs",
        "Each column independently",
        "Only rows that contain NULLs",
      ],
      answer: 1,
      why: "DISTINCT deduplicates entire output rows. With two columns, a pair survives if that exact combination hasn't appeared before.",
      notes: [
        { choice: 0, why: "There's no first-column-only mode — DISTINCT judges each full output row, so region rides along in every pair it examines." },
      ],
    },
    {
      id: "l6-q6",
      prompt: "Why does `SELECT DISTINCT region FROM customers` return 4 rows while `SELECT region FROM customers` returns 16?",
      choices: [
        "DISTINCT drops NULL rows",
        "16 customers share only 4 distinct region values — EU, APAC, US, LATAM",
        "DISTINCT hides 12 customers illegally",
        "It errors and returns a cached result",
      ],
      answer: 1,
      why: "The full list repeats values (8 customers are EU); DISTINCT collapses repeats to the value set. Same data, different lens.",
      notes: [
        { choice: 2, why: "Nothing is hidden — all 16 customer rows still exist in the table; the query simply reports the set of region values instead of one row per customer." },
      ],
    },
    {
      id: "l6-q7",
      prompt: "How do DISTINCT and ORDER BY interact?",
      choices: [
        "They can't be combined",
        "ORDER BY runs on the already-deduplicated result",
        "DISTINCT sorts automatically",
        "ORDER BY undoes the deduplication",
      ],
      answer: 1,
      why: "Dedup happens as rows are produced; ORDER BY then sorts the final distinct set. (Which is why DISTINCT + ORDER BY needs the ORDER BY columns in the select list in some engines.)",
      notes: [
        { choice: 2, why: "Any ordering you see without ORDER BY is an engine artifact — deduping often runs through a sort internally, but only ORDER BY guarantees it." },
      ],
    },
    {
      id: "l6-q8",
      prompt: "`COUNT(DISTINCT customer_id)` on orders answers which business question?",
      choices: [
        "How many orders exist",
        "How many distinct customers ever placed an order",
        "How many customers are inactive",
        "How many orders each customer placed",
      ],
      answer: 1,
      why: "Combining a count with DISTINCT inside the aggregate gives 'how many different values exist' — here 16, because every customer has ordered at least once.",
      notes: [
        { choice: 0, why: "That's plain COUNT(*)'s answer (103) — the DISTINCT inside collapses repeated customer ids to the unique buyers *before* the counting happens." },
      ],
    },
    {
      id: "l6-q9",
      prompt: "What happens to NULL values under DISTINCT?",
      choices: [
        "They are removed entirely",
        "All NULLs collapse into a single NULL row",
        "Each NULL stays separate",
        "DISTINCT errors on NULL",
      ],
      answer: 1,
      why: "Deduplication treats all NULLs as one value — a subtle difference from comparison, where NULL never equals NULL.",
      notes: [
        { choice: 2, why: "Lesson 4's 'NULL never equals NULL' doesn't govern deduping — group-identity semantics fold every NULL into a single row." },
      ],
    },
    {
      id: "l6-q10",
      prompt: "DISTINCT customer_id pulled from `orders` — why is that more honest than listing customers from `customers` here?",
      choices: [
        "It's faster",
        "It answers 'who actually ordered' from behavior data — the customers table only says who signed up",
        "customers lacks the id column",
        "DISTINCT hides inactive customers",
      ],
      answer: 1,
      why: "Derived lists reflect what happened. In this store both give 16, but on real data the behavioral list is the one analysts trust.",
      notes: [
        { choice: 0, why: "Speed isn't the difference — both queries are cheap. The difference is meaning: who signed up versus who actually transacted." },
      ],
    },
    {
      id: "l6-q11",
      prompt: "When is DISTINCT usually a code smell rather than a solution?",
      choices: [
        "When used with a single column",
        "When it hides accidental row duplication caused by a bad join or a missing filter",
        "When combined with ORDER BY",
        "Never — DISTINCT is always the right tool",
      ],
      answer: 1,
      why: "If rows are duplicated because of fan-out (Module 2), DISTINCT papers over the bug instead of fixing it — and different columns break the illusion. Fix the source.",
      notes: [
        { choice: 3, why: "DISTINCT is the right tool for genuine set questions — dropdown values, unique ids, value pairs. The smell is only when it masks accidental duplication." },
      ],
    },
  ],
  problems: [
    {
      id: "l6-p1",
      title: "The lifecycle of an order",
      brief: "Return the distinct values of `status` in the orders table, alphabetically.",
      hints: [
        "The brief wants the set of values that exist, not one row per order — DISTINCT collapses the repeats, and ORDER BY lays the set out alphabetically.",
        "Shape: SELECT DISTINCT status FROM orders ORDER BY status;",
      ],
      difficulty: "easy",
      solution: "SELECT DISTINCT status FROM orders ORDER BY status;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bdistinct\\b).)*$", message: "Without DISTINCT you get one row per order (103 of them) — the keyword collapses the repeated statuses into the four values that exist." },
        { test: "\\border\\s+by\\s+status\\s+desc\\b", message: "Alphabetical order is ascending — DESC lists the statuses Z to A." },
        { test: "\\bselect\\s+\\*", message: "The star returns every column of every order — the brief wants the single `status` column, deduplicated." },
      ],
      expected: EXPECTED["l6-p1"],
      ordered: true,
    },
    {
      id: "l6-p2",
      title: "Everyone who ever ordered",
      brief: "Return the distinct `customer_id` values that appear in orders.",
      hints: [
        "Each customer's id repeats once per order they placed — select the id column and let DISTINCT squash the repeats.",
        "Shape: SELECT DISTINCT customer_id FROM orders;",
      ],
      difficulty: "easy",
      solution: "SELECT DISTINCT customer_id FROM orders;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bdistinct\\b).)*$", message: "A plain SELECT returns one row per order — DISTINCT is what folds the 103 repeats into the set of customers who ordered." },
        { test: "\\bcount\\s*\\(", message: "COUNT collapses the list into a single number — the brief wants the values themselves: SELECT DISTINCT customer_id." },
        { test: "\\bselect\\s+\\*", message: "The star returns whole order rows — the brief asks for one column, `customer_id`, deduplicated." },
      ],
      expected: EXPECTED["l6-p2"],
    },
    {
      id: "l6-p3",
      title: "The region map",
      brief: "Return every distinct `city`, `region` pair from customers, sorted by city.",
      hints: [
        "Two columns means DISTINCT judges the pair — a (city, region) combination survives once even when several customers share it.",
        "Shape: SELECT DISTINCT city, region FROM customers ORDER BY city;",
      ],
      difficulty: "medium",
      solution: "SELECT DISTINCT city, region FROM customers ORDER BY city;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bdistinct\\b).)*$", message: "Without DISTINCT you'll list all 16 customers — the keyword keeps each city–region pair once." },
        { test: "select\\s+distinct\\s+city\\b(?!,)", message: "DISTINCT city alone erases the region dimension — the brief wants the pair, so select both: city, region." },
        { test: "\\bselect\\s+\\*", message: "Every column of every customer is more than the ask — return exactly `city` and `region`, deduplicated." },
      ],
      expected: EXPECTED["l6-p3"],
      ordered: true,
    },
    {
      id: "l6-p4",
      title: "The category list",
      brief: "The store's distinct product categories, alphabetically. One column, seven rows.",
      hints: [
        "Seven categories hide among the product rows — DISTINCT gives each category one row, and ORDER BY sorts the list A to Z.",
        "Shape: SELECT DISTINCT category FROM products ORDER BY category;",
      ],
      difficulty: "easy",
      solution: "SELECT DISTINCT category FROM products ORDER BY category;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bdistinct\\b).)*$", message: "Without DISTINCT the category repeats once per product — the keyword is what leaves seven single rows." },
        { test: "\\border\\s+by\\s+category\\s+desc\\b", message: "Alphabetical means ascending — DESC runs the categories Z to A." },
        { test: "\\bselect\\s+\\*", message: "The brief wants one column, `category` — not the full product rows." },
      ],
      expected: EXPECTED["l6-p4"],
      ordered: true,
    },
    {
      id: "l6-p5",
      title: "The status menu",
      brief: "Every distinct order status, alphabetically — the full lifecycle in four words.",
      hints: [
        "Same lens as the lifecycle problem: one row per status value that exists, laid out in alphabetical order.",
        "Shape: SELECT DISTINCT status FROM orders ORDER BY status;",
      ],
      difficulty: "easy",
      solution: "SELECT DISTINCT status FROM orders ORDER BY status;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bdistinct\\b).)*$", message: "A plain SELECT repeats each status once per order — DISTINCT collapses them to the four lifecycle values." },
        { test: "\\border\\s+by\\s+status\\s+desc\\b", message: "Alphabetical order is ascending — DESC reverses the lifecycle listing." },
        { test: "\\bselect\\s+\\*", message: "One column is the ask: `status`, deduplicated — not whole order rows." },
      ],
      expected: EXPECTED["l6-p5"],
      ordered: true,
    },
    {
      id: "l6-p6",
      title: "Regions in play",
      brief: "Distinct customer regions, alphabetical. Four rows — the store's geographic footprint.",
      hints: [
        "The 16 customers share just a few region values — DISTINCT turns the repeated column into the geographic footprint.",
        "Shape: SELECT DISTINCT region FROM customers ORDER BY region;",
      ],
      difficulty: "easy",
      solution: "SELECT DISTINCT region FROM customers ORDER BY region;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bdistinct\\b).)*$", message: "Without DISTINCT you get one row per customer — the four regions only emerge once repeats collapse." },
        { test: "\\border\\s+by\\s+region\\s+desc\\b", message: "Alphabetical is ascending — DESC lists the regions Z to A." },
        { test: "\\bselect\\s+\\*", message: "The brief asks for the single `region` column — extra columns change what counts as a duplicate and break the four-row set." },
      ],
      expected: EXPECTED["l6-p6"],
      ordered: true,
    },
    {
      id: "l6-p7",
      title: "Region × activity",
      brief: "Distinct combinations of `region` and `active` from customers, ordered by region then active. Spot which regions have churned customers.",
      hints: [
        "Region alone would erase the churn dimension — pair it with the 0/1 flag so active and churned rows stay separate; DISTINCT now dedupes the combination.",
        "Shape: SELECT DISTINCT region, active FROM customers ORDER BY region, active;",
      ],
      difficulty: "medium",
      solution: "SELECT DISTINCT region, active FROM customers ORDER BY region, active;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bdistinct\\b).)*$", message: "All 16 customers come back without DISTINCT — the keyword reduces them to the unique region × activity combinations." },
        { test: "select\\s+distinct\\s+region\\b(?!,)", message: "DISTINCT region alone drops the `active` column — select the pair so churned and active regions don't merge." },
        { test: "\\border\\s+by\\s+region\\s+desc", message: "The brief orders region ascending, then active — DESC on region reverses the intended layout." },
      ],
      expected: EXPECTED["l6-p7"],
      ordered: true,
    },
    {
      id: "l6-p8",
      title: "Basket sizes seen",
      brief: "The distinct `quantity` values used in order lines, smallest to largest. A quick read of how much of one product people buy at once.",
      hints: [
        "The same few quantities repeat across all 248 order lines — DISTINCT extracts the value set, and ascending order ranks it smallest to largest.",
        "Shape: SELECT DISTINCT quantity FROM order_items ORDER BY quantity;",
      ],
      difficulty: "medium",
      solution: "SELECT DISTINCT quantity FROM order_items ORDER BY quantity;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bdistinct\\b).)*$", message: "Every line repeats its quantity — without DISTINCT the same value shows up dozens of times." },
        { test: "\\border\\s+by\\s+quantity\\s+desc\\b", message: "Smallest to largest is ascending — DESC flips the ladder." },
        { test: "\\bfrom\\s+orders\\b", message: "`quantity` is a column of order_items, the line-level table — orders has no quantity to select." },
      ],
      expected: EXPECTED["l6-p8"],
      ordered: true,
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "`DISTINCT` is a **sieve for values**: pour the result set in, and one copy of every distinct combination comes out. The mental picture that saves you: DISTINCT operates on the **whole output row** — the full tuple of selected columns — never on one column. `SELECT DISTINCT region, city` asks for unique *pairs*, which is why it can return many rows even though regions are few. The moment you add a column 'just to also see it', you change what 'duplicate' means.",
    },
    {
      kind: "engine",
      title: "you run SELECT DISTINCT region FROM customers",
      steps: [
        "**FROM + WHERE** — 16 customer rows gathered (filters would run first as always).",
        "**Project** — each row shrinks to its `region` value: a stream of 16 strings, duplicates included.",
        "**Dedupe** — the engine holds a working set of seen values and drops repeats. NULL handling matters here: all NULLs collapse to **one** NULL row — DISTINCT treats NULLs as equal to each other (the famous exception to 'NULL never equals').",
        "**Output** — 4 rows: EU, APAC, US, LATAM — in *no guaranteed order* until you ORDER BY. DISTINCT output is a set, not a sorted list.",
      ],
    },
    { kind: "diagram", figure: "v6-distinct-sieve" },
    {
      kind: "h",
      text: "The analyst's first data-quality instrument",
    },
    {
      kind: "p",
      text: "Row-count drops are where DISTINCT becomes diagnostic. This store's `customers` has 16 rows, 4 distinct regions — normal; regions *should* repeat. But it also has **16 distinct cities for 16 customers**: every single customer lives in a different city. That asymmetry (region repeats, city never does) is a fingerprint of how the data was generated — and in real datasets, the same technique finds the opposite problem: 4,000 rows with 4,000 distinct order-ids is healthy, but 4,000 rows with 3,997 distinct ids means three duplicates sneaked in. `COUNT(*)` vs `COUNT(DISTINCT id)` is the cheapest duplicate detector you own, and it needs no joins, no tools, no permissions.",
    },
    { kind: "code", sql: "SELECT COUNT(*) AS rows_total,\n       COUNT(DISTINCT id) AS distinct_ids\nFROM customers;", caption: "the two-number duplicate check — equal is healthy, a gap means dupes" },
    {
      kind: "myth",
      myth: "\"`SELECT DISTINCT region, city` dedupes just the first column — regions.\"",
      truth: "It dedupes the **pair**. Only 4 regions exist, but region+city pairs are unique 16 times over, so you get 16 rows back. Anyone burned by this wrote a 'deduplicated' report that wasn't. One tuple = one dedupe unit, always.",
    },
    {
      kind: "myth",
      myth: "\"DISTINCT removes NULLs too — they're not real values.\"",
      truth: "It keeps exactly **one** NULL. Dedupe asks 'have I seen this value?' and NULL is treated as seen-after-first-sight. (COUNT(DISTINCT col) is the odd one out — it counts no NULL at all.)",
    },
    {
      kind: "edge",
      items: [
        { c: "SELECT COUNT(DISTINCT region) FROM customers;", r: "**4** — the aggregate form collapses inside COUNT. NULLs would be skipped here, unlike plain `SELECT DISTINCT` which keeps one." },
        { c: "SELECT DISTINCT city FROM customers;", r: "16 rows for 16 customers — the all-unique fingerprint. This is how you discover a column is a natural key without any schema knowledge." },
        { c: "SELECT DISTINCT region FROM customers ORDER BY region;", r: "APAC, EU, LATAM, US — sorted. DISTINCT without ORDER BY has undefined order; the two clauses compose fine (dedupe first, sort second)." },
        { c: "SELECT DISTINCT status, customer_id FROM orders;", r: "Unique *pairs* — **37** rows here (vs 4 for DISTINCT status alone). One extra column changed what 'duplicate' means, nearly ninefold." },
      ],
    },
    {
      kind: "tip",
      text: "DISTINCT is a smell as well as a tool: if your report needs DISTINCT to be correct, ask *why duplicates exist* — a missing filter (are you accidentally counting both test arms?) or a join fanout (Module 2's most famous lesson) is usually the true culprit. DISTINCT hides symptoms; great analysts cure causes.",
    },
  ],
  takeaway: "DISTINCT dedupes whole output rows — not the first column — after WHERE has filtered, every NULL counts as one value, and a surprising row-count drop is a bug signal to investigate, not a feature.",
};
