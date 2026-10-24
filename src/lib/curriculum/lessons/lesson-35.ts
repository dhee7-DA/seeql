import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson35: Lesson = {
  id: "lesson-35",
  num: 35,
  title: "Case study — the new analyst's first week",
  blurb: "Module 1's tools under one brief: a founder-facing snapshot built from single-table queries",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "You're the storefront's first data hire. On day one the founder slides you a note: *'I don't need anything fancy — tell me who our customers are, what the catalog looks like, and how deep the warehouse runs. Six numbers and two lists, please.'* No joins are allowed yet — everything you need lives in one table at a time, and that constraint is the point: this is Module 1's toolkit under a real brief, where YOU pick the tool for each ask.",
    },
    {
      kind: "table",
      headers: ["The founder's ask", "The tool"],
      rows: [
        ["Marketing-ready customers in the EU", "WHERE with two conditions"],
        ["How big is the budget shelf?", "COUNT + WHERE"],
        ["How many cities do we serve?", "COUNT(DISTINCT)"],
        ["How deep is the warehouse?", "SUM"],
        ["Name the five premium products", "ORDER BY + LIMIT"],
        ["Which categories are crowded?", "GROUP BY + HAVING"],
      ],
      caption: "Six asks, six different spells — the brief's real lesson is matching tool to question",
    },
    { kind: "diagram", figure: "l35-report-anatomy" },
    {
      kind: "tip",
      text: "Work like an analyst, not a student: for each ask, say the shape out loud first — 'that's a filter', 'that's a collapse', 'that's a bucket' — then write the SQL. Every number below is live-graded against the real store, so a wrong shape is a wrong number.",
    },
    { kind: "diagram", figure: "l35-question-to-sql" },
    { kind: "diagram", figure: "l35-clause-order" },
    {
      kind: "p",
      text: "The debrief: look at what the brief actually tested. Six asks, six tools, zero joins — and every answer came from naming the shape before writing the SQL. The founder's note is the analyst's daily reality: questions arrive in business language, and your first move is always translation — “how many cities” is COUNT(DISTINCT), “how deep is the warehouse” is SUM, “which categories are crowded” is a GROUP BY with a HAVING gate on the aggregate. Notice also what the single-table constraint bought you: no fan-out traps, no NULL-filled gaps, no grain decisions. Module 1's toolkit is small enough to hold in your head and honest enough to trust on day one — the next case studies will add joins, and with them, the grain discipline this course keeps returning to.",
    },
  ],
  mcqs: [
    {
      id: "l35-q1",
      prompt: "The founder asks: 'how many customers can we actually market to?' Two of the 16 are inactive. What do you run?",
      choices: [
        "COUNT(*) FROM customers — 16",
        "COUNT(*) FROM customers WHERE active = 1 — 14",
        "COUNT(DISTINCT region) — 4",
        "SUM(active) FROM customers — 30",
      ],
      answer: 1,
      why: "'Can we market to' is a filter: active = 1 keeps the 14 real recipients and drops Dmitri Volkov and Keiko Sato. COUNT(*) answers 'how many rows exist', which was never the question.",
      notes: [
        { choice: 3, why: "SUM over a 0/1 column does count the 1s — 14, not 30 — but WHERE + COUNT(*) states the intent in readable SQL. Same number, clearer contract." },
      ],
    },
    {
      id: "l35-q2",
      prompt: "The founder redefines the budget shelf mid-meeting: 'make it $50 and under'. Your current query is `WHERE price < 50`. What changes?",
      choices: [
        "Nothing — < already includes 50.00",
        "Switch to `price <= 50` (or BETWEEN 0 AND 50) — the strict < was excluding the boundary",
        "Switch to `price < 51` for safety",
        "Use IN (50) — only exact matches count now",
      ],
      answer: 1,
      why: "< is strict: a product at exactly 50.00 was outside the old shelf and must be inside the new one. <= (or BETWEEN 0 AND 50, which includes both edges) matches the spoken definition.",
      notes: [
        { choice: 2, why: "< 51 sweeps in products at 50.50 that the founder never asked for. Boundary questions deserve boundary operators, not slack." },
      ],
    },
    {
      id: "l35-q3",
      prompt: "The warehouse report runs `SUM(stock)`. If a supplier someday leaves stock NULL on some rows, what does the SUM do?",
      choices: [
        "Errors until every stock value is filled",
        "Skips the NULL rows and sums the rest — the report shrinks silently",
        "Treats NULL as zero, no change",
        "Returns NULL — one missing value poisons the total",
      ],
      answer: 1,
      why: "Aggregates ignore NULLs: SUM keeps adding the real values and never mentions what it skipped. That's convenient today and dangerous in a warehouse report — a shrinking total looks like falling inventory, not missing data. Pair it with COUNT(*) to watch the gap.",
      notes: [
        { choice: 3, why: "That's ||'s behavior, not SUM's. Aggregates are NULL-immune — which is precisely why they hide holes without erroring." },
      ],
    },
    {
      id: "l35-q4",
      prompt: "The premium list (`ORDER BY price DESC LIMIT 5`) hits a price tie exactly at the cutoff. What makes the five names deterministic?",
      choices: [
        "SQLite automatically adds id as a tie-breaker",
        "You do — a second sort key like `ORDER BY price DESC, name` decides ties by rule",
        "Nothing can — LIMIT with ties is always an error",
        "DISTINCT resolves the tie",
      ],
      answer: 1,
      why: "Top-N queries are only as deterministic as their sort keys. The engine breaks remaining ties arbitrarily; spelling `price DESC, name` turns 'some five' into 'these five'. Today's top five have no ties — the discipline is for the day one appears.",
      notes: [
        { choice: 0, why: "No hidden tie-breaker exists. If two products tied at 89.99, either could take slot five on different runs — that's a report nobody can reproduce." },
      ],
    },
  ],
  problems: [
    {
      id: "l35-p1",
      title: "Marketing-ready EU",
      brief: "The founder's first ask: active customers in the **EU** region — the ones marketing can actually email. Output `name` and `city`, alphabetical. Seven rows.",
      hints: [
        "Two conditions joined by AND: the region filter and the active flag. Then sort.",
        "Shape: SELECT name, city FROM customers WHERE region = 'EU' AND active = 1 ORDER BY name;",
      ],
      difficulty: "easy",
      solution: "SELECT name, city FROM customers\nWHERE region = 'EU' AND active = 1\nORDER BY name;",
      mistakes: [
        { test: "\\bactive\\s*=\\s*0\\b", message: "active = 0 selects the dormant two — marketing wants the living list, active = 1." },
        { test: "\\bjoin\\b", message: "No join needed — region and active both live on customers. Single-table module, single-table answers." },
        { test: "region\\s*=\\s*'(APAC|US|LATAM)'", message: "Wrong region — the brief says EU, which holds 8 customers, 7 of them active." },
      ],
      expected: EXPECTED["l35-p1"],
      ordered: true,
    },
    {
      id: "l35-p2",
      title: "How big is the budget shelf?",
      brief: "Count the products priced **under $50**. One value, `budget_count`.",
      hints: [
        "A count of rows that survive a filter — the strict inequality is deliberate.",
        "Shape: SELECT COUNT(*) AS budget_count FROM products WHERE price < 50;",
      ],
      difficulty: "easy",
      solution: "SELECT COUNT(*) AS budget_count FROM products\nWHERE price < 50;",
      mistakes: [
        { test: "<=\\s*50\\b", message: "The brief says under $50 — strict `<`. (Adding the boundary would only change the answer if a product cost exactly 50.00; the discipline matters more than today's data.)" },
        { test: "\\bsum\\s*\\(\\s*price\\s*\\)", message: "SUM adds prices together — the founder asked how MANY products, which is COUNT's job." },
        { test: "\\bdistinct\\b", message: "No dedupe needed — every product is one row. DISTINCT would matter for counting *kinds*, not stock rows." },
      ],
      expected: EXPECTED["l35-p2"],
    },
    {
      id: "l35-p3",
      title: "Cities we serve",
      brief: "How many distinct cities does the customer base cover? One value, `cities_served`.",
      hints: [
        "Counting *kinds*, not rows: the dedupe lens goes inside the COUNT.",
        "Shape: SELECT COUNT(DISTINCT city) AS cities_served FROM customers;",
      ],
      difficulty: "easy",
      solution: "SELECT COUNT(DISTINCT city) AS cities_served FROM customers;",
      mistakes: [
        { test: "count\\(\\s*\\*\\s*\\)", message: "COUNT(*) counts all 16 customers — but some cities could repeat. The ask is distinct cities; this dataset happens to have 16 customers in 16 distinct cities, and the query must prove it." },
        { test: "\\bgroup\\s+by\\s+city\\b", message: "GROUP BY city builds one bucket per city — close, but the brief wants a single number, and the bucket list would need counting anyway." },
      ],
      expected: EXPECTED["l35-p3"],
    },
    {
      id: "l35-p4",
      title: "Warehouse depth",
      brief: "Total units on hand across the whole catalog. One value, `total_stock`.",
      hints: [
        "One column collapsed to one sum — no filter, no grouping.",
        "Shape: SELECT SUM(stock) AS total_stock FROM products;",
      ],
      difficulty: "easy",
      solution: "SELECT SUM(stock) AS total_stock FROM products;",
      mistakes: [
        { test: "\\bcount\\b", message: "COUNT would report 16 products — the ask is total UNITS, which only SUM(stock) adds up." },
        { test: "\\bavg\\b", message: "AVG answers 'how deep is a typical shelf' — the founder wants the whole warehouse's depth." },
      ],
      expected: EXPECTED["l35-p4"],
    },
    {
      id: "l35-p5",
      title: "The premium shelf",
      brief: "Name the **five most expensive products**: `name` and `price`, priciest first. Include a tie-breaker so the list is reproducible.",
      hints: [
        "Sort descending, then cap. Sorting by name second costs nothing and buys determinism.",
        "Shape: SELECT name, price FROM products ORDER BY price DESC, name LIMIT 5;",
      ],
      difficulty: "medium",
      solution: "SELECT name, price FROM products\nORDER BY price DESC, name\nLIMIT 5;",
      mistakes: [
        { test: "\\blimit\\s+5\\s+offset\\b", message: "OFFSET skips rows — the founder wants the TOP five, which is LIMIT 5 with no skipping." },
        { test: "\\border\\s+by\\s+price\\s+asc\\b", message: "Ascending serves the five CHEAPEST — the premium shelf is the other end of the sort." },
        { test: "\\bwhere\\b", message: "Nothing is filtered — the price ranking IS the query. A WHERE would pre-shrink the pool before the sort ever ran." },
      ],
      expected: EXPECTED["l35-p5"],
      ordered: true,
    },
    {
      id: "l35-p6",
      title: "Crowded categories",
      brief: "Which categories hold **more than 2 products**? Output `category` and `product_count`, alphabetical.",
      hints: [
        "Bucket per category, count each bucket, then gate the buckets — the gate runs on groups, not rows.",
        "Shape: SELECT category, COUNT(*) AS product_count FROM products GROUP BY category HAVING COUNT(*) > 2 ORDER BY category;",
      ],
      difficulty: "medium",
      solution: "SELECT category, COUNT(*) AS product_count\nFROM products\nGROUP BY category\nHAVING COUNT(*) > 2\nORDER BY category;",
      mistakes: [
        { test: "\\bwhere\\b[^;]*\\bcount\\b", message: "WHERE can't see COUNT — it runs before buckets exist. The gate belongs in HAVING, after grouping." },
        { test: "having\\s+n\\b|having\\s+product_count", message: "SQLite tolerates the alias in HAVING, but portable SQL repeats the aggregate: HAVING COUNT(*) > 2." },
        { test: ">\\s*3\\b", message: "'More than 2' is > 2 — the strict boundary keeps the three-product categories and excludes nothing else today, but the number in the SQL must match the brief." },
      ],
      expected: EXPECTED["l35-p6"],
      ordered: true,
    },
  ],
  takeaway: "A brief becomes SQL by naming each ask's shape — filter, collapse, dedupe, bucket — and the six asks of a first-week report use six different spells from one module.",
  deep: [
    {
      kind: "mind",
      text: "A case study is **requirements engineering in miniature**: the brief arrives in stakeholder language and your job is to translate it into Module 1's shapes — filters, collapses, sorts and buckets — no joins, one table at a time, and every number live-graded against the real store. The professional habit this trains: before any SQL, restate each ask as a shape (\"that's a filter\", \"that's a fold at month grain\", \"that's a preservation problem\") and name the grain of the promised output. Most wrong answers in real analyst work are not syntax errors; they are right answers to a slightly different question — the translation step is where they die. Work the brief top to bottom, reconcile every number you can against another (count vs sum, detail vs summary), and treat any mismatch as a finding, not a nuisance.",
    },
    {
      kind: "edge",
      items: [
        { c: "The ask behind the ask", r: "\"How many customers do we have?\" often means \"how many can we market to\" — the active flag, the region filter, the dedupe. Ask which population the stakeholder means; the SQL is easy once the noun is exact." },
        { c: "Empty results are findings", r: "A brief that expects holes may find none (this seed's anti-joins return zero rows). Report \"checked, none found\" with the query attached — silence in the result set is evidence too." },
        { c: "Grain mixing in one report", r: "Customer counts beside order sums in one table: stage each grain in its own CTE and join on the shared dimension. One query, two grains, no fan-out — the case studies quietly drill this every time." },
        { c: "The reproducibility test", r: "Hard-code the as-of date, avoid date('now'), and keep every number re-derivable from the seed. A founder-facing snapshot that can't be re-run and matched is a screenshot, not a report." },
      ],
    },  ],
};
