import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson07: Lesson = {
  id: "lesson-07",
  num: 7,
  title: "Aggregates — COUNT, SUM, AVG, MIN, MAX",
  blurb: "Collapse a whole table into the numbers the business actually asks for",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "Everything so far returned *rows*. Questions like \"how many orders?\", \"what's the average order value?\" return a **single number computed from many rows**. Five functions do exactly that: `COUNT` counts, `SUM` adds up, `AVG` averages, `MIN`/`MAX` find the extremes.",
    },
    { kind: "diagram", figure: "l6-aggregate" },
    {
      kind: "code",
      caption: "One row out, no matter how many rows in",
      sql: "SELECT COUNT(*) AS order_count, ROUND(SUM(total), 2) AS revenue, ROUND(AVG(total), 2) AS avg_order FROM orders;",
      runnable: true,
    },
    { kind: "h", text: "Habits with aggregates" },
    {
      kind: "bullets",
      items: [
        "**Always alias them** — the engine's default heading for `COUNT(*)` is literally `COUNT(*)`, miserable in exports and impossible to reference.",
        "**Round for display** — raw floats come back as `2777.3874999999995`; `ROUND(x, 2)` at the last step keeps reports honest to the cent. Never round data you'll keep computing on.",
        "**NULLs are ignored** (lesson 4): `AVG(total)` averages only present values; `COUNT(shipped_at)` counts only shipped orders while `COUNT(*)` counts all rows — the gap between the two COUNTs is itself a metric (the share still waiting to ship).",
        "**MIN/MAX work on text and dates too** — `MIN(created_at)` is the store's first order date.",
      ],
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "AVG's output type differs by engine: PostgreSQL averages INTEGER columns into an exact NUMERIC and MySQL into a DECIMAL, but SQLite has only REAL — so AVG(quantity) can come back as 2.1299999999999999. Here the ROUND(x, 2) habit is not optional.",
    },
    { kind: "h", text: "One structural rule" },
    {
      kind: "bullets",
      items: [
        "A query with an aggregate returns **exactly one row** for the whole table — the next lesson generalizes this to one row *per group*.",
        "You cannot mix a bare column with a whole-table aggregate — `SELECT customer_id, COUNT(*)` without GROUP BY has no single honest answer. SQLite tolerates it and hands you an arbitrary row; do not rely on that.",
      ],
    },
    {
      kind: "tip",
      text: "`COUNT(*)` counts rows; `COUNT(column)` counts values. Compare them to measure missingness: `SELECT COUNT(*) AS all_rows, COUNT(shipped_at) AS shipped FROM orders;`",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "The empty-set rule travels: SQLite, PostgreSQL and MySQL all return NULL — not 0 — from SUM, AVG, MIN and MAX over zero rows, while COUNT returns 0. Reports that must show a zero wrap it: `COALESCE(SUM(total), 0)`.",
    },
  ],
  mcqs: [
    {
      id: "l7-q1",
      prompt: "How many rows does `SELECT AVG(total) FROM orders` return?",
      choices: ["One", "As many as there are distinct totals", "Zero if the table is big", "One per month"],
      answer: 0,
      why: "An aggregate without GROUP BY collapses the entire input to a single row — even an empty table returns one row (with NULL inside).",
      notes: [
        { choice: 1, why: "Rows-per-distinct-value requires buckets, and buckets only exist when GROUP BY asks for them — a bare aggregate has no groups to enumerate, so it returns exactly one row." },
      ],
    },
    {
      id: "l7-q2",
      prompt: "On a table where shipped_at is NULL for 27 of 100 rows, `COUNT(shipped_at)` returns…",
      choices: ["100", "27", "73", "NULL"],
      answer: 2,
      why: "COUNT(column) counts present values only: 100 − 27 = 73. That gap is exactly the \"not shipped yet\" population.",
      notes: [
        { choice: 0, why: "100 is COUNT(*)'s number — COUNT(shipped_at) walks the same rows but skips the 27 NULLs on the way, which is the entire difference between the two." },
      ],
    },
    {
      id: "l7-q3",
      prompt: "Why wrap aggregates in ROUND(x, 2)?",
      choices: [
        "Required syntax for SUM",
        "It fixes NULLs",
        "Float results carry long tails — rounding keeps reports to the cent",
        "It makes queries faster",
      ],
      answer: 2,
      why: "AVG/SUM on floats produce values like 41.67000000000001. ROUND at the presentation layer keeps the number clean without touching the underlying math.",
      notes: [
        { choice: 1, why: "ROUND never fills holes — ROUND(NULL, 2) is still NULL. Its only job is trimming the float tail." },
      ],
    },
    {
      id: "l7-q4",
      prompt: "Which query finds the date of the store's first order?",
      choices: [
        "SELECT TOP 1 created_at FROM orders",
        "SELECT MIN(created_at) AS first_order FROM orders;",
        "SELECT COUNT(created_at) FROM orders;",
        "SELECT SUM(created_at) FROM orders;",
      ],
      answer: 1,
      why: "MIN works on dates because ISO text sorts chronologically. (TOP is SQL Server, not SQLite — the portable form is ORDER BY … LIMIT 1.)",
      notes: [
        { choice: 0, why: "TOP is SQL Server dialect — SQLite answers it with a syntax error; the portable first-row tool is ORDER BY … LIMIT 1, and MIN is the no-sort shortcut." },
      ],
    },
    {
      id: "l7-q5",
      prompt: "`AVG(total)` on orders computes 338.19. If 10 rows had NULL totals, how would AVG change?",
      choices: [
        "It would treat them as 0 and drop",
        "It would divide by the remaining non-NULL rows only",
        "It would return NULL",
        "It would error",
      ],
      answer: 1,
      why: "Aggregates skip NULLs: AVG's denominator is COUNT(column), not COUNT(*). On this table total is never NULL — but that guarantee is a schema fact, not a SQL one.",
      notes: [
        { choice: 0, why: "NULL isn't zero — counting them as 0 would drag the average down. Aggregates instead drop NULL rows from both the numerator and the denominator." },
      ],
    },
    {
      id: "l7-q6",
      prompt: "What does `SUM(total)` return for a table with zero matching rows?",
      choices: [
        "0",
        "NULL — SUM of nothing is no value, not zero",
        "An error",
        "Infinity",
      ],
      answer: 1,
      why: "SUM over an empty set is NULL. COUNT returns 0, but SUM/AVG/MIN/MAX return NULL — a famous source of 'my report shows blank' bugs.",
      notes: [
        { choice: 0, why: "Zero is a *value*, and nothing was summed — the engine reports the absence of a value as NULL. Only COUNT returns 0 on an empty set." },
      ],
    },
    {
      id: "l7-q7",
      prompt: "`SELECT COUNT(*), SUM(total) FROM orders` produces…",
      choices: [
        "103 rows, one per order",
        "One row: the count 103 and the grand total 34833.28",
        "Two rows: one count, one sum",
        "An error — you can't mix aggregates",
      ],
      answer: 1,
      why: "Multiple aggregates in one SELECT collapse all rows into a single summary row, each aggregate computed over the same input set.",
      notes: [
        { choice: 2, why: "Aggregates in one SELECT don't stack — they sit side by side as columns of the same single summary row, each computed over the same input." },
      ],
    },
    {
      id: "l7-q8",
      prompt: "Why write `ROUND(AVG(total), 2)` instead of raw AVG(total)?",
      choices: [
        "ROUND makes the query faster",
        "Raw AVG carries floating-point tails like 338.1864077… — rounding gives report-ready 338.19",
        "AVG returns text without ROUND",
        "ROUND is required by SQLite",
      ],
      answer: 1,
      why: "AVG of REALs produces long decimals. Rounding to 2 is presentation logic done once, at the source, so every consumer sees the same number.",
      notes: [
        { choice: 3, why: "Nothing breaks without ROUND — SQLite happily returns 338.1864077…. ROUND is presentation polish, not syntax you owe." },
      ],
    },
    {
      id: "l7-q9",
      prompt: "`MIN(created_at)` and `MAX(created_at)` on TEXT dates return…",
      choices: [
        "An error — MIN/MAX are numeric only",
        "The earliest and latest dates — ISO 'YYYY-MM-DD' text sorts chronologically",
        "Random dates",
        "The date with the most orders",
      ],
      answer: 1,
      why: "MIN/MAX work on any orderable type, including text. ISO-8601 dates compare correctly as strings — one more reason to store dates in that format.",
      notes: [
        { choice: 0, why: "MIN/MAX work on anything orderable, text included — ISO 'YYYY-MM-DD' strings compare chronologically, so earliest and latest come straight out." },
      ],
    },
    {
      id: "l7-q10",
      prompt: "Can an aggregate like COUNT(*) appear inside WHERE?",
      choices: [
        "Yes, freely",
        "No — aggregates aren't allowed in WHERE; filtering on them needs HAVING (next lesson)",
        "Only with MAX",
        "Yes, but the result is wrong",
      ],
      answer: 1,
      why: "WHERE runs before rows are grouped, when aggregates don't exist yet. 'Filter on a group total' is precisely the job HAVING was invented for.",
      notes: [
        { choice: 0, why: "Try it and SQLite replies 'misuse of aggregate function' — WHERE runs before grouping, so no aggregate exists yet to test. The gate belongs in HAVING." },
      ],
    },
    {
      id: "l7-q11",
      prompt: "`MAX(price)` across products returns 199.99. What does `MIN(price)` return?",
      choices: [
        "0",
        "14.99 — the HDMI cable, the cheapest item in the catalog",
        "199.99",
        "The average price",
      ],
      answer: 1,
      why: "MIN and MAX form the envelope of the column: 14.99 to 199.99. Together they're the fastest sanity check that no price is absurd.",
      notes: [
        { choice: 2, why: "199.99 is the MAX you were just handed — MIN walks the opposite end of the envelope, the cheapest product in the catalog." },
      ],
    },
    {
      id: "l7-q12",
      prompt: "What's the difference between `COUNT(*)` and `COUNT(product_id)` on order_items?",
      choices: [
        "None — identical always",
        "Here none (product_id is never NULL); generally COUNT(column) skips NULLs",
        "COUNT(*) is always smaller",
        "COUNT(product_id) isn't valid",
      ],
      answer: 1,
      why: "With a NOT NULL column the two agree (251 = 251). The gap opens when NULLs exist — which is why knowing your schema matters before trusting either.",
      notes: [
        { choice: 0, why: "They only *look* identical because product_id is never NULL here — one NULL row would split the two counts, which is why they're different questions." },
      ],
    },
  ],
  problems: [
    {
      id: "l7-p1",
      title: "How many orders?",
      brief: "Return a single value `order_count`: the number of rows in orders.",
      hints: [
        "A whole-table count is the simplest aggregate there is: COUNT(*) eats every row and hands back one number — aliased exactly as the brief spells it.",
        "Shape: SELECT COUNT(*) AS <alias> FROM orders;",
      ],
      difficulty: "easy",
      solution: "SELECT COUNT(*) AS order_count FROM orders;",
      mistakes: [
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+from", message: "The engine's default heading would be literal `COUNT(*)` — alias the column: COUNT(*) AS order_count." },
        { test: "count\\s*\\(\\s*distinct", message: "COUNT(DISTINCT customer_id) counts unique buyers (16) — the brief wants every order row, so count with plain COUNT(*)." },
        { test: "\\bselect\\s+\\*", message: "Listing the orders isn't counting them — wrap the rows in COUNT(*) to collapse them into one number." },
      ],
      expected: EXPECTED["l7-p1"],
    },
    {
      id: "l7-p2",
      title: "Average basket",
      brief: "Return `avg_order_total`: the average of `total`, rounded to 2 decimal places.",
      hints: [
        "AVG(total) computes the mean but leaves a long float tail — wrap it in ROUND(x, 2) and name the column exactly `avg_order_total`.",
        "Shape: SELECT ROUND(AVG(total), 2) AS <alias> FROM orders;",
      ],
      difficulty: "easy",
      solution: "SELECT ROUND(AVG(total), 2) AS avg_order_total FROM orders;",
      mistakes: [
        { test: "avg\\s*\\(\\s*total\\s*\\)\\s+as\\b", message: "Bare AVG(total) returns the raw float tail (338.1864077…) — the brief wants report-ready 2-decimal rounding: ROUND(AVG(total), 2)." },
        { test: ",\\s*2\\s*\\)\\s+from", message: "The rounding is there but the name isn't — alias the column: AS avg_order_total." },
        { test: "avg\\s*\\(\\s*total\\s*\\)\\s+from", message: "Two fixes in one: wrap it in ROUND(AVG(total), 2) and alias it AS avg_order_total." },
      ],
      expected: EXPECTED["l7-p2"],
    },
    {
      id: "l7-p3",
      title: "The headline numbers",
      brief: "In one query return `order_count` (COUNT *) and `revenue` (SUM of total, rounded to 2) for all orders.",
      hints: [
        "Two aggregates share one output row — count every order and sum every total side by side, each rounded and wearing its own alias.",
        "Shape: SELECT COUNT(*) AS <alias>, ROUND(SUM(total), 2) AS <alias> FROM orders;",
      ],
      difficulty: "medium",
      solution: "SELECT COUNT(*) AS order_count, ROUND(SUM(total), 2) AS revenue FROM orders;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bcount\\s*\\().)*$", message: "The revenue is there but the count isn't — two aggregates in one SELECT: COUNT(*) AS order_count plus the SUM." },
        { test: "^select\\b(?:(?!\\bsum\\s*\\().)*$", message: "Only the count made it — the brief also wants revenue: ROUND(SUM(total), 2) AS revenue in the same SELECT list." },
        { test: "sum\\s*\\(\\s*total\\s*\\)\\s+as\\b", message: "Bare SUM(total) drags the float tail into the report — wrap it: ROUND(SUM(total), 2)." },
      ],
      expected: EXPECTED["l7-p3"],
    },
    {
      id: "l7-p4",
      title: "Price envelope",
      brief: "From products, return `min_price` and `max_price` (MIN/MAX of price, rounded to 2).",
      hints: [
        "The price envelope is one row, two aggregates: MIN and MAX each wrapped in ROUND and wearing its own alias.",
        "Shape: SELECT ROUND(MIN(price), 2) AS <alias>, ROUND(MAX(price), 2) AS <alias> FROM products;",
      ],
      difficulty: "medium",
      solution: "SELECT ROUND(MIN(price), 2) AS min_price, ROUND(MAX(price), 2) AS max_price FROM products;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bmin\\s*\\().)*$", message: "The top of the envelope is there but the floor isn't — add ROUND(MIN(price), 2) AS min_price to the same SELECT list." },
        { test: "^select\\b(?:(?!\\bmax\\s*\\().)*$", message: "Only the cheapest made it — the envelope needs the ceiling too: ROUND(MAX(price), 2) AS max_price." },
        { test: "(min|max)\\s*\\(\\s*price\\s*\\)\\s+as\\b", message: "Un-rounded MIN/MAX leak the raw float — the brief rounds both extremes to 2 decimals." },
      ],
      expected: EXPECTED["l7-p4"],
    },
    {
      id: "l7-p5",
      title: "The item ledger",
      brief: "How many order lines exist in total? Return a single column named `items` counting all rows of `order_items`.",
      hints: [
        "The line table is the schema's finest grain — count its rows outright and alias the column exactly `items`.",
        "Shape: SELECT COUNT(*) AS <alias> FROM order_items;",
      ],
      difficulty: "easy",
      solution: "SELECT COUNT(*) AS items FROM order_items;",
      mistakes: [
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+from", message: "Name the column: COUNT(*) AS items — a bare COUNT(*) ships with the literal heading 'COUNT(*)'." },
        { test: "\\bselect\\s+\\*", message: "Listing 248 rows isn't the ask — COUNT(*) collapses them into the single number the brief wants." },
      ],
      expected: EXPECTED["l7-p5"],
    },
    {
      id: "l7-p6",
      title: "The customer base",
      brief: "Count the customers. Return one column named `customers`.",
      hints: [
        "One aggregate over one table — count the customer rows and alias the column exactly as spelled in the brief.",
        "Shape: SELECT COUNT(*) AS <alias> FROM customers;",
      ],
      difficulty: "easy",
      solution: "SELECT COUNT(*) AS customers FROM customers;",
      mistakes: [
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+from", message: "The alias is part of the grade: COUNT(*) AS customers." },
        { test: "\\bselect\\s+\\*", message: "The roster itself isn't wanted — count the rows: COUNT(*)." },
        { test: "\\bfrom\\s+orders\\b", message: "That counts purchases (103) — the brief counts customers, so the table is customers." },
      ],
      expected: EXPECTED["l7-p6"],
    },
    {
      id: "l7-p7",
      title: "The order-value envelope",
      brief: "Return `smallest` and `largest` order totals (MIN and MAX of `total`, rounded to 2) — one row, two aggregates.",
      hints: [
        "One row, two aggregates: the smallest and largest order totals, each ROUNDed to 2 and aliased.",
        "Shape: SELECT ROUND(MIN(total), 2) AS <alias>, ROUND(MAX(total), 2) AS <alias> FROM orders;",
      ],
      difficulty: "medium",
      solution: "SELECT ROUND(MIN(total), 2) AS smallest, ROUND(MAX(total), 2) AS largest FROM orders;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bmin\\s*\\().)*$", message: "The largest total is there but the smallest isn't — add ROUND(MIN(total), 2) AS smallest to the same row." },
        { test: "^select\\b(?:(?!\\bmax\\s*\\().)*$", message: "Only the floor of the envelope — the brief also wants the ceiling: ROUND(MAX(total), 2) AS largest." },
        { test: "(min|max)\\s*\\(\\s*total\\s*\\)\\s+as\\b", message: "Round both extremes — bare MIN/MAX return the raw float tail." },
      ],
      expected: EXPECTED["l7-p7"],
    },
    {
      id: "l7-p8",
      title: "Basket averages per line",
      brief: "What's the average `quantity` per order line? Return one column `avg_qty`, rounded to 2 decimals.",
      hints: [
        "Average the quantity column across every order line — one aggregate, rounded to two decimals, aliased `avg_qty`.",
        "Shape: SELECT ROUND(AVG(quantity), 2) AS <alias> FROM order_items;",
      ],
      difficulty: "medium",
      solution: "SELECT ROUND(AVG(quantity), 2) AS avg_qty FROM order_items;",
      mistakes: [
        { test: "avg\\s*\\(\\s*quantity\\s*\\)\\s+as\\b", message: "AVG(quantity) alone carries the float tail — wrap it: ROUND(AVG(quantity), 2)." },
        { test: ",\\s*2\\s*\\)\\s+from", message: "Rounded but unnamed — alias the column: AS avg_qty." },
        { test: "avg\\s*\\(\\s*quantity\\s*\\)\\s+from", message: "Two fixes in one: wrap it in ROUND(AVG(quantity), 2) and alias it AS avg_qty." },
      ],
      expected: EXPECTED["l7-p8"],
    },
    {
      id: "l7-p9",
      title: "Ratings, summarized",
      brief: "Supplier quality at a glance: return `min_rating` and `max_rating` from suppliers, rounded to 1 decimal.",
      hints: [
        "Ratings round to ONE decimal here — MIN and MAX in a single row, each in its own ROUND(x, 1) and its own alias.",
        "Shape: SELECT ROUND(MIN(rating), 1) AS <alias>, ROUND(MAX(rating), 1) AS <alias> FROM suppliers;",
      ],
      difficulty: "medium",
      solution: "SELECT ROUND(MIN(rating), 1) AS min_rating, ROUND(MAX(rating), 1) AS max_rating FROM suppliers;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bmin\\s*\\().)*$", message: "The best rating is there but the worst isn't — add ROUND(MIN(rating), 1) AS min_rating." },
        { test: "^select\\b(?:(?!\\bmax\\s*\\().)*$", message: "Only the floor of the ratings — add the ceiling: ROUND(MAX(rating), 1) AS max_rating." },
        { test: "(min|max)\\s*\\(\\s*rating\\s*\\)\\s+as\\b|rating\\s*\\)\\s*,\\s*2\\s*\\)", message: "The brief wants one-decimal rounding — each extreme goes in its own ROUND(x, 1), not ROUND(x, 2) and not bare." },
      ],
      expected: EXPECTED["l7-p9"],
    },
  ],
  takeaway: "Aggregates collapse many rows into one number — COUNT counts rows, COUNT(column) counts values, the rest skip NULLs and return NULL over empty sets — so alias every aggregate and ROUND for display.",
};
