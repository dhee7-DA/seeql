import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson03: Lesson = {
  id: "lesson-03",
  num: 3,
  title: "WHERE — filtering rows",
  blurb: "Comparisons, AND/OR logic, IN, BETWEEN and LIKE — the analyst's everyday toolkit",
  minutes: 16,
  blocks: [
    {
      kind: "p",
      text: "Projection picks columns; **WHERE picks rows**. It sits after FROM and tests a condition against every row — each row either survives or is dropped **before** any SELECT expression runs.",
    },
    { kind: "h", text: "Building conditions" },
    {
      kind: "bullets",
      items: [
        "**Comparisons** — `=`, `!=` (or `<>`), `>`, `>=`, `<`, `<=`, combined with **AND**, **OR** and **NOT**.",
        "**AND binds tighter than OR** — like × before +. `WHERE a = 1 OR a = 2 AND b = 3` means `a = 1 OR (a = 2 AND b = 3)`. When in doubt, parenthesize.",
        "**No filtering on SELECT aliases** — the filter has already run by the time aliases exist.",
      ],
    },
    { kind: "diagram", figure: "l3-where-gate" },
    {
      kind: "code",
      caption: "Two conditions that must both hold",
      sql: "SELECT id, status, total FROM orders WHERE status = 'delivered' AND total > 200;",
      runnable: true,
    },
    { kind: "h", text: "The three shorthands" },
    {
      kind: "bullets",
      items: [
        "**`IN`** checks membership in a list — `city IN ('Berlin', 'London')` is a tidy `city = 'Berlin' OR city = 'London'`.",
        "**`BETWEEN a AND b`** is inclusive on both ends — great for date ranges.",
        "**`LIKE`** does text patterns — `%` matches any run of characters, so `name LIKE '%Keyboard%'` finds every keyboard-ish product.",
      ],
    },
    {
      kind: "code",
      caption: "The three shorthands",
      sql: "-- products in two categories\nSELECT name, category FROM products WHERE category IN ('Audio', 'Video');\n\n-- orders from March 2024, inclusive range\nSELECT id, created_at FROM orders WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31';\n\n-- everything keyboard-shaped\nSELECT name FROM products WHERE name LIKE '%Keyboard%';",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Case rules bite here: `=` on text is case-sensitive ('DELIVERED' ≠ 'delivered'), yet SQLite's LIKE is case-INsensitive for ASCII — '%keyboard%' would still match. PostgreSQL's LIKE is case-sensitive (it offers ILIKE instead); MySQL follows the column's collation, usually insensitive.",
    },
    {
      kind: "warn",
      text: "Text values need single quotes: `WHERE city = 'Berlin'`. Double quotes are for identifiers in standard SQL. `WHERE city = Berlin` compares against a *column* named Berlin — a classic beginner error that SQLite reports as \"no such column\".",
    },
    { kind: "h", text: "The pipeline to memorize" },
    {
      kind: "steps",
      items: [
        "`FROM` — where the rows come from.",
        "`WHERE` — which rows survive.",
        "`SELECT` — what the output looks like.",
        "Later clauses slot into the relay: GROUP BY → HAVING → ORDER BY → LIMIT. The SQL **text** order is a lie told for readability; this is the execution order.",
      ],
    },
  ],
  mcqs: [
    {
      id: "l3-q1",
      prompt: "`WHERE city = 'Berlin' OR city = 'London' AND active = 1` is evaluated as…",
      choices: [
        "(city = 'Berlin' OR city = 'London') AND active = 1",
        "city = 'Berlin' OR (city = 'London' AND active = 1)",
        "Left to right, whatever comes first",
        "A syntax error in SQLite",
      ],
      answer: 1,
      why: "AND binds tighter than OR. The condition keeps all Berlin rows plus the London rows that are active — almost never what the writer intended. Parenthesize.",
      notes: [
        { choice: 0, why: "That's what most people *intend* — precedence decides otherwise. If you want the left reading, the parentheses must be yours, not the engine's." },
      ],
    },
    {
      id: "l3-q2",
      prompt: "Which is equivalent to `WHERE region = 'EU' OR region = 'APAC'`?",
      choices: [
        "WHERE region IN ('EU', 'APAC')",
        "WHERE region LIKE 'EU APAC'",
        "WHERE region BETWEEN 'EU' AND 'APAC'",
        "WHERE region = IN ('EU', 'APAC')",
      ],
      answer: 0,
      why: "IN (list) is exactly an OR-chain of equalities against the listed values — cleaner to read and easier to extend.",
      notes: [
        { choice: 2, why: "BETWEEN tests magnitude, not membership — it would compare 'EU' ≤ region ≤ 'APAC' lexicographically, which is nonsense here." },
      ],
    },
    {
      id: "l3-q3",
      prompt: "`WHERE name LIKE '%stand%'` matches…",
      choices: [
        "Names starting with \"stand\"",
        "Names ending with \"stand\"",
        "Names containing \"stand\" anywhere",
        "Exactly the name \"stand\"",
      ],
      answer: 2,
      why: "% matches any run of characters — including none — so '%stand%' matches 'Laptop Stand', 'standards', and 'stand' itself.",
      notes: [
        { choice: 0, why: "Anchored at the start would be 'stand%' — the *leading* % is what lets the pattern match anywhere in the name." },
      ],
    },
    {
      id: "l3-q4",
      prompt: "In logical execution order, WHERE runs…",
      choices: [
        "before FROM",
        "after SELECT",
        "after FROM but before SELECT",
        "at the same time as LIMIT",
      ],
      answer: 2,
      why: "FROM produces the rows, WHERE filters them, SELECT projects last (before ordering/limiting). That's why SELECT aliases can't be used inside WHERE.",
      notes: [
        { choice: 1, why: "If WHERE ran after SELECT, aliases *would* work in filters — they don't, which is the tell that filtering happens first." },
      ],
    },
    {
      id: "l3-q5",
      prompt: "Which operators test “not equal” in SQLite?",
      choices: [
        "Only !=",
        "Only <>",
        "Both != and <> work",
        "SQL uses =! ",
      ],
      answer: 2,
      why: "SQLite accepts both spellings. Pick one style and stay consistent — <> is the ANSI classic, != the programmer favorite.",
      notes: [
        { choice: 0, why: "Both parse in SQLite — <> isn't just accepted, it's the older ANSI form; != is the C-style favorite." },
      ],
    },
    {
      id: "l3-q6",
      prompt: "`WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'` — which rows match?",
      choices: [
        "March 1st only",
        "Everything except the two endpoints",
        "Both endpoints included — BETWEEN is inclusive",
        "Undefined without ORDER BY",
      ],
      answer: 2,
      why: "BETWEEN is inclusive on both ends. Dates here are TEXT in 'YYYY-MM-DD' form, which compares correctly as strings — that's why the ISO format matters.",
      notes: [
        { choice: 1, why: "Exclusive ranges need > and < — BETWEEN deliberately includes both endpoints, which is what makes date ranges read naturally." },
      ],
    },
    {
      id: "l3-q7",
      prompt: "`WHERE region = 'EU' AND city = 'Berlin' OR active = 1` — why is this risky?",
      choices: [
        "OR can't be combined with AND",
        "AND binds tighter than OR, so it reads (EU AND Berlin) OR active — probably not the intent",
        "Strings must use double quotes here",
        "It's fine — clauses evaluate left to right",
      ],
      answer: 1,
      why: "Precedence: AND before OR. Write parentheses explicitly — WHERE (region = 'EU' OR region = 'US') AND active = 1 — so the reader never has to guess.",
      notes: [
        { choice: 3, why: "Valid SQL — that's the danger. It runs without error and quietly returns the wrong audience." },
      ],
    },
    {
      id: "l3-q8",
      prompt: "`WHERE status IN ('pending', 'cancelled')` is equivalent to…",
      choices: [
        "WHERE status = 'pending' AND status = 'cancelled'",
        "WHERE status = 'pending' OR status = 'cancelled'",
        "WHERE status LIKE 'pending'",
        "WHERE status <> 'delivered'",
      ],
      answer: 1,
      why: "IN is shorthand for a chain of ORs over equality checks. A row can't equal two different values at once, which is why the AND version returns nothing.",
      notes: [
        { choice: 0, why: "A status can't be two values simultaneously — the AND version matches zero rows. IN is an OR-chain, never an AND-chain." },
      ],
    },
    {
      id: "l3-q9",
      prompt: "Can you filter on a computed expression like `WHERE price * 2 > 100`?",
      choices: [
        "No — WHERE only accepts stored columns",
        "Yes — expressions are evaluated per row, just like in SELECT",
        "Only if the column is aliased first",
        "Only with HAVING",
      ],
      answer: 1,
      why: "Any expression over the row's columns works in WHERE. (Naming that expression with an alias and filtering by alias is a different story — that's HAVING territory or a subquery.)",
      notes: [
        { choice: 0, why: "WHERE happily computes per-row expressions — `price * 2 > 100` is standard practice. The only restriction is on *aliases*, which don't exist yet." },
      ],
    },
    {
      id: "l3-q10",
      prompt: "`WHERE status = 'DELIVERED'` returns how many rows from `orders`?",
      choices: [
        "52 — case doesn't matter for strings",
        "0 — the stored values are lowercase, and string comparison is case-sensitive",
        "All 103 rows",
        "An error",
      ],
      answer: 1,
      why: "This store stores statuses as 'delivered', 'shipped', … in lowercase. 'DELIVERED' = 'delivered' is false in SQLite — a classic silent-empty-result bug.",
      notes: [
        { choice: 3, why: "No error — something worse: a clean, empty result set. Case-sensitive comparison just quietly matches nothing." },
      ],
    },
    {
      id: "l3-q11",
      prompt: "`WHERE stock >= 100` on products uses which comparison?",
      choices: [
        "Text comparison — stock is converted to a string",
        "Numeric comparison — stock is an INTEGER column",
        "It only works with BETWEEN",
        "It errors because >= isn't valid SQL",
      ],
      answer: 1,
      why: "stock is numeric, so >= compares numbers: 100, 120, 300… Text would compare '99' > '100' lexicographically — a subtle trap when columns hold numeric-looking text.",
      notes: [
        { choice: 0, why: "stock is INTEGER, so the comparison is numeric. If it *were* text, '99' would sort above '100' — the classic hidden-text trap." },
      ],
    },
    {
      id: "l3-q12",
      prompt: "`WHERE name LIKE '%Watch%'` matches which product names?",
      choices: [
        "Only names that start with Watch",
        "Names containing “Watch” anywhere — % stands for any run of characters",
        "Only names exactly equal to Watch",
        "Names ending in Watch",
      ],
      answer: 1,
      why: "% is the any-string wildcard, so '%Watch%' matches 'Smart Watch S'. '_' matches exactly one character — the other wildcard worth knowing.",
      notes: [
        { choice: 0, why: "Anchored to the start would be 'Watch%' — the leading % is what makes 'Smart Watch S' match." },
      ],
    },
  ],
  problems: [
    {
      id: "l3-p1",
      title: "Big tickets",
      brief: "Find all orders with a `total` greater than 200. Return every column.",
      hints: [
        "Every column stays — the only new part is the row filter.",
        "Shape: SELECT * FROM orders WHERE total > <n>;",
      ],
      difficulty: "easy",
      solution: "SELECT * FROM orders WHERE total > 200;",
      mistakes: [
        { test: "^select\\b(?:(?!\\bwhere\\b).)*$", message: "The brief asks for big orders only — add `WHERE total > 200` to the query." },
        { test: "total\\s*>=\\s*200", message: "'Greater than 200' is strict — >= would also include exactly 200." },
      ],
      expected: EXPECTED["l3-p1"],
    },
    {
      id: "l3-p2",
      title: "The audio shelf",
      brief: "Return every column of products in the `'Audio'` category.",
      hints: [
        "One equality filter — text values wear single quotes.",
        "Shape: SELECT * FROM products WHERE category = 'Audio';",
      ],
      difficulty: "easy",
      solution: "SELECT * FROM products WHERE category = 'Audio';",
      mistakes: [
        { test: "category\\s*=\\s*audio\\b", message: "Unquoted Audio reads as a *column* name — wrap the text in single quotes: category = 'Audio'." },
        { test: "category\\s*=\\s*\"audio\"", message: "Double quotes denote identifiers in SQL — text literals use single quotes: 'Audio'." },
      ],
      expected: EXPECTED["l3-p2"],
    },
    {
      id: "l3-p3",
      title: "March deliveries",
      brief: "Return `id`, `customer_id`, `total` for orders that are `'delivered'` AND were created in March 2024 (between `'2024-03-01'` and `'2024-03-31'`, inclusive).",
      hints: [
        "Both conditions must hold — AND joins them; BETWEEN covers the date range inclusively.",
        "Shape: … WHERE status = 'delivered' AND created_at BETWEEN '2024-03-01' AND '2024-03-31';",
      ],
      difficulty: "medium",
      solution: "SELECT id, customer_id, total FROM orders WHERE status = 'delivered' AND created_at BETWEEN '2024-03-01' AND '2024-03-31';",
      mistakes: [
        { test: "\\bor\\b", message: "An order must satisfy BOTH conditions — OR would return delivered orders from *any* month plus every March order." },
        { test: ">\\s*'2024-03-01'", message: "Careful with the boundary: BETWEEN is inclusive, but > alone drops March 1st itself. BETWEEN '2024-03-01' AND '2024-03-31' covers all of March." },
      ],
      expected: EXPECTED["l3-p3"],
    },
    {
      id: "l3-p4",
      title: "Active EU hubs",
      brief: "Return `name` and `city` of customers whose `region` is `'EU'` and whose `city` is Berlin, London or Madrid. One condition list, no OR-chains.",
      hints: [
        "Two conditions joined by AND — the city list is what IN is for.",
        "Shape: … WHERE region = 'EU' AND city IN ('Berlin', 'London', 'Madrid');",
      ],
      difficulty: "hard",
      solution: "SELECT name, city FROM customers WHERE region = 'EU' AND city IN ('Berlin', 'London', 'Madrid');",
      mistakes: [
        { test: "\\bor\\b", message: "OR between region and city would match any EU customer *or* anyone in those cities — the two conditions must BOTH hold, so AND joins them (IN handles the city list)." },
      ],
      expected: EXPECTED["l3-p4"],
    },
    {
      id: "l3-p5",
      title: "The impulse shelf",
      brief: "Products priced under 20 — the classic checkout-lure candidates. Return `name` and `price` for every product where `price < 20`.",
      hints: [
        "One strict numeric comparison — numbers wear no quotes.",
        "Shape: SELECT name, price FROM products WHERE price < 20;",
      ],
      difficulty: "easy",
      solution: "SELECT name, price FROM products WHERE price < 20;",
      mistakes: [
        { test: "price\\s*<=\\s*20", message: "'Under 20' is strict — <= would also include exactly 20." },
        { test: "price\\s*<\\s*'20'", message: "Numbers don't take quotes — `price < 20` compares numerically; '20' would compare as text." },
      ],
      expected: EXPECTED["l3-p5"],
    },
    {
      id: "l3-p6",
      title: "The inactive list",
      brief: "Two customers have churned. Return `name` and `active` for customers where `active = 0`.",
      hints: [
        "The flag is an integer — compare against the number 0, not the string.",
        "Shape: SELECT name, active FROM customers WHERE active = 0;",
      ],
      difficulty: "easy",
      solution: "SELECT name, active FROM customers WHERE active = 0;",
      mistakes: [
        { test: "active\\s*=\\s*'0'", message: "Don't quote the flag — active is an INTEGER column, so compare with the number 0, not the string '0'." },
      ],
      expected: EXPECTED["l3-p6"],
    },
    {
      id: "l3-p7",
      title: "The open orders",
      brief: "Every order whose status is 'pending'. Return `id`, `status` and `total`. Fourteen rows — the store's live workload.",
      hints: [
        "One equality on status — lowercase, inside single quotes.",
        "Shape: SELECT id, status, total FROM orders WHERE status = 'pending';",
      ],
      difficulty: "easy",
      solution: "SELECT id, status, total FROM orders WHERE status = 'pending';",
      mistakes: [
        { test: "status\\s*=\\s*pending\\b", message: "Unquoted pending reads as a column name — wrap it in single quotes: 'pending'. And remember: string comparison is case-sensitive, the stored value is lowercase." },
      ],
      expected: EXPECTED["l3-p7"],
    },
    {
      id: "l3-p8",
      title: "The mid-price band",
      brief: "Products priced between 50 and 100 inclusive — the considered-purchase band. Return `name` and `price`.",
      hints: [
        "Inclusive on both ends — BETWEEN says it in one word.",
        "Shape: SELECT name, price FROM products WHERE price BETWEEN 50 AND 100;",
      ],
      difficulty: "medium",
      solution: "SELECT name, price FROM products WHERE price BETWEEN 50 AND 100;",
      mistakes: [
        { test: "between\\s+100\\s+and\\s+50", message: "BETWEEN runs low-to-high: BETWEEN 50 AND 100 — reversed bounds match nothing." },
        { test: ">\\s*50\\s+and\\s+<\\s*100", message: "That excludes both endpoints — the band is inclusive, so 50 and 100 must count (BETWEEN 50 AND 100, or >= with <=)." },
      ],
      expected: EXPECTED["l3-p8"],
    },
    {
      id: "l3-p9",
      title: "The German Connection",
      brief: "Customers based in Berlin or Hamburg. Return `name` and `city` — one WHERE with OR, or the IN shorthand if you're feeling sharp.",
      hints: [
        "Two cities = a membership test — IN, or an OR pair if you prefer.",
        "Shape: SELECT name, city FROM customers WHERE city IN ('Berlin', 'Hamburg');",
      ],
      difficulty: "medium",
      solution: "SELECT name, city FROM customers WHERE city IN ('Berlin', 'Hamburg');",
      mistakes: [
        { test: "city\\s*=\\s*'berlin'\\s+and\\s+city\\s*=\\s*'hamburg'", message: "AND makes it impossible — a city can't be both at once. You want OR, or the tidy form: city IN ('Berlin', 'Hamburg')." },
      ],
      expected: EXPECTED["l3-p9"],
    },
  ],
  takeaway: "WHERE filters rows before anything else happens — comparisons combine with AND/OR (parenthesize when mixed), and IN, BETWEEN and LIKE are the three shorthands you'll use daily.",
};
