import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson29: Lesson = {
  id: "lesson-29",
  num: 29,
  title: "Text & type toolkit — reshape any value",
  blurb: "UPPER, SUBSTR, LENGTH and the || operator; CAST for types; COALESCE for NULLs — the promise from lesson 4 comes due",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "The data in a column is not always the data in your head. Email handles hide before an `@`, names arrive in mixed case, prices print `89.99` where a shelf label wants `89`, and lesson 4's NULLs still sit there needing a *decision*. **Scalar functions** reshape one value at a time — every row flows through the same pipes — and this lesson collects the ones you'll use weekly.",
    },
    { kind: "diagram", figure: "t1-text-pipeline" },
    {
      kind: "code",
      caption: "Four reshape pipes over one table scan",
      sql: `SELECT name,
       UPPER(name)                        AS shout,
       LENGTH(name)                       AS name_len,
       SUBSTR(email, 1, INSTR(email, '@') - 1) AS handle
FROM customers LIMIT 4;   -- Alice Chen → ALICE CHEN · 10 · alice.chen`,
    },
    { kind: "h", text: "The string toolbox" },
    {
      kind: "bullets",
      items: [
        "`SUBSTR(s, start, len)` — positions are **1-based**: the first character is 1, and `SUBSTR('2024-05-09', 1, 7)` yields `'2024-05'`. Omit `len` and it runs to the end.",
        "`INSTR(s, needle)` — the 1-based position of the first hit (`INSTR('a@b', '@')` → 2), or 0 when absent. Handle extraction is the classic duo: slice up to `INSTR(…, '@') - 1`.",
        "`LENGTH(s)` counts characters — `Liam O'Brien` is 12, apostrophe included. `TRIM(s)` shaves stray spaces from both ends; `REPLACE(s, from, to)` swaps substrings.",
        "`||` glues strings: `name || ' <' || email || '>'` builds a contact line. This is also the portability divide — see the dialect notes.",
      ],
    },
    { kind: "h", text: "CAST — forcing the type" },
    {
      kind: "code",
      caption: "CAST truncates toward zero — it is not rounding",
      sql: `SELECT name, price, CAST(price AS INTEGER) AS whole
FROM products WHERE id IN (1, 2, 13);
-- Mechanical Keyboard K1  89.99 → 89
-- Wireless Mouse M3       34.50 → 34
-- Smart Watch S          199.99 → 199`,
    },
    {
      kind: "bullets",
      items: [
        "`CAST(expr AS type)` — INTEGER drops the fraction, TEXT renders the value, REAL promotes. `CAST('42' AS INTEGER)` even parses text into numbers.",
        "Want 89.99 → 90? That's `ROUND(price, 0)` — lesson 7's display habit. CAST and ROUND answer different questions: *type change* vs *value change*.",
        "Lesson 7's `ROUND(AVG(total), 2)` and today's CAST finally sit in the same toolbox: round for readers, cast for type logic.",
      ],
    },
    { kind: "diagram", figure: "t5-null-coalesce" },
    { kind: "h", text: "COALESCE — the NULL decision, kept" },
    {
      kind: "bullets",
      items: [
        "`COALESCE(x, y, z…)` returns the **first non-NULL argument**, walking left to right: `COALESCE(shipped_at, 'awaiting')` prints a real date for 82 orders and the word `awaiting` for the 21 that never shipped.",
        "`IFNULL(x, y)` is the two-argument short form (SQLite/MySQL). `NULLIF(a, b)` is the inverse: NULL when `a = b` — the guard that turns dangerous zeros into honest NULLs before an AVG.",
        "Lesson 4 said *\"you'll meet it properly in a later module\"* — this is that meeting. Lesson 25's NOT IN landmine also has its antidote here: `COALESCE` on the guarded column, or an explicit `IS NOT NULL` filter.",
      ],
    },
    {
      kind: "warn",
      text: "A function wrapped around an indexed column in WHERE (`WHERE UPPER(name) = 'ALICE'`) can defeat index use — the engine must transform every row before comparing. On 16 rows it's irrelevant; on 16 million it's a career lesson. Filter with the raw column where possible.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL has no `||` for concatenation by default — that spelling is logical OR there. Use `CONCAT(a, b, …)`. `SUBSTR`/`LENGTH`/`UPPER`/`TRIM`/`REPLACE` all exist with the same names; `INSTR` too.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres concatenates with `||` like SQLite, and adds the `||`-free `CONCAT`. Substring is `SUBSTRING(s FROM a FOR b)` (though `SUBSTR` works), position is `POSITION('@' IN s)` or `STRPOS` — and it casts with the shorthand `price::integer`.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite ships the whole toolbox in core: `||`, `SUBSTR`, `INSTR`, `LENGTH`, `UPPER/LOWER`, `TRIM`, `REPLACE`, `CAST`, `COALESCE`, `IFNULL`, `NULLIF` — all engine-side, no extensions, exactly what this app runs.",
    },
    {
      kind: "tip",
      text: "Run the reshape on a LIMIT 4 first and eyeball the column. String surgery is the easiest place to be off-by-one — `SUBSTR(email, 1, INSTR(email, '@'))` keeps the @, minus one drops it. Look before you ship.",
    },
  ],
  mcqs: [
    {
      id: "l29-q1",
      prompt: "What does `SUBSTR('2024-05-09', 1, 7)` return?",
      choices: ["'024-05-0'", "'2024-05'", "'2024-05-09'", "'2024-0'"],
      answer: 1,
      why: "SUBSTR is 1-based: start at character 1, take 7 characters — `'2024-05'`. Zero-based thinking is the classic off-by-one here.",
      notes: [
        { choice: 0, why: "That's what a 0-based start would give. SQL string positions start at 1 — always." },
      ],
    },
    {
      id: "l29-q2",
      prompt: "Which engine refuses `name || ' <' || email || '>'` as a concatenation?",
      choices: ["SQLite", "PostgreSQL", "MySQL (use CONCAT)", "All three accept it"],
      answer: 2,
      why: "MySQL reads `||` as logical OR by default — gluing strings there is `CONCAT(a, b, …)`. SQLite and Postgres both concatenate with `||`.",
      notes: [
        { choice: 3, why: "That's the trap — it runs on two of three engines and silently misbehaves (or errors) on the third. Know which dialect you're in." },
      ],
    },
    {
      id: "l29-q3",
      prompt: "`CAST(199.99 AS INTEGER)` returns…",
      choices: ["200 — it rounds", "199 — it truncates", "199.99 — no-op", "An error — needs ROUND first"],
      answer: 1,
      why: "CAST changes type, chopping the fraction toward zero. Turning 199.99 into 200 is ROUND's job — a value change, not a type change.",
      notes: [
        { choice: 0, why: "That's banker's-adjacent intuition from display rounding. CAST never looks at the fraction — it discards it." },
      ],
    },
    {
      id: "l29-q4",
      prompt: "`COALESCE(NULL, NULL, 'x', 'y')` returns…",
      choices: ["NULL", "'x'", "'y'", "An error — too many arguments"],
      answer: 1,
      why: "COALESCE walks left to right and returns the first non-NULL: the first two arguments fall through, `'x'` wins. `COALESCE` over all-NULL arguments returns NULL.",
      notes: [
        { choice: 3, why: "COALESCE takes any number of arguments — two is just the common case. The walk stops at the first non-NULL." },
      ],
    },
    {
      id: "l29-q5",
      prompt: "What is `NULLIF(a, b)` for?",
      choices: [
        "Returning NULL when a and b are equal — the zero-guard",
        "Returning b when a is NULL",
        "Comparing two NULLs safely",
        "Deleting duplicate values",
      ],
      answer: 0,
      why: "`NULLIF(total, 0)` turns fake zeros into real NULLs so AVG ignores them. It's COALESCE's mirror image: one manufactures values, the other manufactures NULLs.",
      notes: [
        { choice: 1, why: "That's IFNULL(a, b)'s contract. NULLIF's result is NULL when the two arguments MATCH." },
      ],
    },
    {
      id: "l29-q6",
      prompt: "`LENGTH('Liam O''Brien')` — the customer name `Liam O'Brien` — counts how many characters?",
      choices: ["11 — apostrophes don't count", "12 — every character counts", "13 — the '' escape counts twice", "An error"],
      answer: 1,
      why: "LENGTH counts every character including spaces and the apostrophe — 12 here. (The doubled `''` is only SQL-literal escaping for the quote, not part of the stored value.)",
      notes: [
        { choice: 2, why: "The `''` in the literal collapses to one `'` in storage — the escape syntax never reaches the data." },
      ],
    },
    {
      id: "l29-q7",
      prompt: "`INSTR(email, '@')` returns 0 for a malformed address with no @. What does `SUBSTR(email, 1, INSTR(email, '@') - 1)` then produce?",
      choices: [
        "The whole email",
        "An error — position 0 is invalid",
        "NULL",
        "A zero-length string",
      ],
      answer: 3,
      why: "0 − 1 = −1, and a negative length yields an empty string in SQLite — no crash, just an empty handle. Edge inputs deserve a glance before you trust the pipeline.",
      notes: [
        { choice: 1, why: "Surprisingly forgiving — SUBSTR clamps instead of throwing. Which is exactly why eyeballing a LIMIT 4 sample matters." },
      ],
    },
    {
      id: "l29-q8",
      prompt: "In SQLite, `WHERE name = 'alice chen'` finds no row for 'Alice Chen'. Which comparison is case-insensitive here?",
      choices: [
        "= — it's case-insensitive for TEXT",
        "LIKE — case-insensitive for ASCII by default",
        "Both",
        "Neither — SQLite has no case-insensitive matching",
      ],
      answer: 1,
      why: "SQLite's `=` is case-sensitive for TEXT; `LIKE` folds case for ASCII letters. That's why `UPPER(name) = 'ALICE CHEN'` is the explicit, portable normalization.",
      notes: [
        { choice: 0, why: "Postgres also keeps = case-sensitive, MySQL depends on collation — assuming = folds case is how 'temporarily missing rows' bugs are born." },
      ],
    },
  ],
  problems: [
    {
      id: "l29-p1",
      title: "Handle extraction",
      brief: "Email handles: everything before the `@`. Use SUBSTR with INSTR to slice it. Output `name` and `handle`, alphabetical by name.",
      hints: [
        "INSTR finds the @ position; SUBSTR keeps from 1 up to one before it.",
        "Shape: SELECT name, SUBSTR(email, 1, INSTR(email, '@') - 1) AS handle FROM customers ORDER BY name;",
      ],
      difficulty: "easy",
      solution:
        "SELECT name, SUBSTR(email, 1, INSTR(email, '@') - 1) AS handle\nFROM customers\nORDER BY name;",
      mistakes: [
        { test: "instr\\s*\\(\\s*email\\s*,\\s*'@'\\s*\\)\\s*\\)", message: "That slice stops AT the @ and keeps it — subtract 1 to drop the separator: SUBSTR(email, 1, INSTR(email, '@') - 1)." },
        { test: "\\bsubstr\\s*\\(\\s*email\\s*,\\s*0\\b", message: "Positions are 1-based in SQL — start is 1, not 0. A 0 start shifts the whole string one character left." },
        { test: "\\breplace\\s*\\(\\s*email\\s*,\\s*'@example", message: "REPLACE chops the domain but couples you to one host — INSTR finds the @ wherever it sits. Slice by position instead." },
      ],
      expected: EXPECTED["l29-p1"],
      ordered: true,
    },
    {
      id: "l29-p2",
      title: "Long addresses",
      brief: "How many customer emails run **longer than 20 characters**? Output one column `long_emails`.",
      hints: [
        "LENGTH counts every character; the count is a plain aggregate over the filtered rows.",
        "Shape: SELECT COUNT(*) AS long_emails FROM customers WHERE LENGTH(email) > <bar>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS long_emails FROM customers\nWHERE LENGTH(email) > 20;",
      mistakes: [
        { test: "length\\s*\\(\\s*email\\s*\\)\\s+as", message: "The brief wants a count, not a list — LENGTH belongs in the WHERE, COUNT(*) in the SELECT with the alias." },
        { test: ">\\s*=\\s*20", message: "Boundary — 'longer than 20' is strictly > 20; >= 20 would sweep in exactly-20 addresses too." },
        { test: "\\bdistinct\\b", message: "Emails are unique already — no dedupe needed; just filter by length and count." },
      ],
      expected: EXPECTED["l29-p2"],
    },
    {
      id: "l29-p3",
      title: "The shout list",
      brief: "Every customer name in capitals: output one column `shout` containing UPPER(name), sorted alphabetically by the shouted value.",
      hints: [
        "UPPER wraps the name in the SELECT list; the sort rides the alias.",
        "Shape: SELECT UPPER(name) AS shout FROM customers ORDER BY shout;",
      ],
      difficulty: "easy",
      solution:
        "SELECT UPPER(name) AS shout FROM customers\nORDER BY shout;",
      mistakes: [
        { test: "\\blower\\s*\\(", message: "LOWER whispers — the brief wants capitals: UPPER." },
        { test: "\\bsubstr\\s*\\(", message: "No slicing — the full name, uppercased, is the whole task." },
        { test: "\\bgroup\\s+by\\b", message: "Nothing to group — one row per customer, reshaped and sorted." },
      ],
      expected: EXPECTED["l29-p3"],
      ordered: true,
    },
    {
      id: "l29-p4",
      title: "Signup cohorts, sliced",
      brief: "Which year did customers sign up in? Slice the first 4 characters of `created_at` and count. Output `yr` and `n`, chronological.",
      hints: [
        "created_at is TEXT 'YYYY-MM-DD' — SUBSTR(created_at, 1, 4) is the year; GROUP BY the slice.",
        "Shape: SELECT SUBSTR(created_at, 1, 4) AS yr, COUNT(*) AS n FROM customers GROUP BY yr ORDER BY yr;",
      ],
      difficulty: "medium",
      solution:
        "SELECT SUBSTR(created_at, 1, 4) AS yr, COUNT(*) AS n\nFROM customers\nGROUP BY yr\nORDER BY yr;",
      mistakes: [
        { test: "\\bstrftime\\s*\\(", message: "strftime is next lesson's date-aware tool — this drill slices with SUBSTR. Both give '2023'/'2024'; the brief wants the string surgery." },
        { test: "\\bsubstr\\s*\\(\\s*created_at\\s*,\\s*1\\s*,\\s*2\\b", message: "Two characters is the month slice — four gives the year '2023'/'2024'." },
        { test: "\\bsum\\s*\\(", message: "Cohorts are counts of customers, not sums — COUNT(*) grouped by the year slice." },
      ],
      expected: EXPECTED["l29-p4"],
      ordered: true,
    },
    {
      id: "l29-p5",
      title: "Whole-price shelf tags",
      brief: "Shelf labels drop the cents by truncation: output `name`, `price`, and `whole_price` = CAST(price AS INTEGER), priciest product first.",
      hints: [
        "CAST wraps the price in the SELECT list; the sort stays on the raw price.",
        "Shape: SELECT name, price, CAST(price AS INTEGER) AS whole_price FROM products ORDER BY price DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT name, price, CAST(price AS INTEGER) AS whole_price\nFROM products\nORDER BY price DESC;",
      mistakes: [
        { test: "\\bround\\s*\\(\\s*price\\s*,\\s*0\\s*\\)", message: "ROUND(price, 0) rounds 199.99 → 200 — the brief wants truncation: CAST drops the fraction without looking at it." },
        { test: "\\bcast\\s*\\(\\s*price\\s+as\\s+text\\s*\\)", message: "That renders prices as strings — the brief wants INTEGER: the whole-number truncation." },
        { test: "\\binteger\\s*\\(\\s*price", message: "That's C-style casting — SQL spells it CAST(price AS INTEGER)." },
      ],
      expected: EXPECTED["l29-p5"],
      ordered: true,
    },
    {
      id: "l29-p6",
      title: "The awaiting shelf",
      brief: "Give every unshipped order a label: output `id` and `ship_label` where `ship_label` = COALESCE(shipped_at, 'awaiting') — restricted to orders whose shipped_at IS NULL, ordered by id.",
      hints: [
        "Filter to the NULL rows, then let COALESCE do the replacement — the drill is seeing the fallback fire on every row.",
        "Shape: SELECT id, COALESCE(shipped_at, '<fallback>') AS ship_label FROM orders WHERE shipped_at IS NULL ORDER BY id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT id, COALESCE(shipped_at, 'awaiting') AS ship_label\nFROM orders\nWHERE shipped_at IS NULL\nORDER BY id;",
      mistakes: [
        { test: "=\\s*'awaiting'", message: "`shipped_at = 'awaiting'` compares against the word — the column is NULL, and NULL = anything is never true. COALESCE replaces, WHERE IS NULL selects." },
        { test: "\\bifnull\\s*\\(", message: "IFNULL gives the same answer — this drill spells the general form COALESCE, which scales to any number of fallbacks." },
        { test: "coalesce\\s*\\(\\s*shipped_at\\s*,\\s*created_at\\s*\\)", message: "Falling back to created_at would print order dates as ship dates — the brief wants the literal 'awaiting' label." },
      ],
      expected: EXPECTED["l29-p6"],
      ordered: true,
    },
    {
      id: "l29-p7",
      title: "Contact lines",
      brief: "Build one contact string per customer with `||`: `name || ' <' || email || '>'`. Output one column `contact`, alphabetical.",
      hints: [
        "Three concatenations in one expression — name, a decorated angle-bracket wrapper around the email.",
        "Shape: SELECT name || ' <' || email || '>' AS contact FROM customers ORDER BY contact;",
      ],
      difficulty: "medium",
      solution:
        "SELECT name || ' <' || email || '>' AS contact\nFROM customers\nORDER BY contact;",
      mistakes: [
        { test: "\\bconcat\\s*\\(", message: "CONCAT is the MySQL spelling — on SQLite and Postgres the operator is ||. (If this query must run on MySQL, CONCAT is the right rewrite.)" },
        { test: "\\+\\s*email|email\\s*\\+", message: "The + operator means arithmetic — with TEXT operands SQLite coerces to numbers and yields 0. String gluing is ||." },
        { test: "\\bupper\\s*\\(|\\blower\\s*\\(", message: "No case changes asked — the contact line preserves the stored name and email exactly." },
      ],
      expected: EXPECTED["l29-p7"],
      ordered: true,
    },
    {
      id: "l29-p8",
      title: "EU handles",
      brief: "Handles for the EU crowd only: slice each EU customer's email handle (everything before the `@`). Output one column `handle`, sorted by handle.",
      hints: [
        "Combine this lesson's trio: WHERE region = 'EU', SUBSTR + INSTR for the slice, ORDER BY the alias.",
        "Shape: SELECT SUBSTR(email, 1, INSTR(email, '@') - 1) AS handle FROM customers WHERE region = '<region>' ORDER BY handle;",
      ],
      difficulty: "hard",
      solution:
        "SELECT SUBSTR(email, 1, INSTR(email, '@') - 1) AS handle\nFROM customers\nWHERE region = 'EU'\nORDER BY handle;",
      mistakes: [
        { test: "\\bregion\\s*=\\s*'(us|apac|latam)'", message: "Wrong region — EU is the brief; APAC would return 5 handles, US only 2." },
        { test: "\\blike\\s+'%@%", message: "LIKE %email% patterns can't slice — INSTR finds the position and SUBSTR does the cutting." },
        { test: "order\\s+by\\s+name\\b", message: "The brief sorts by the handle itself — name isn't even in the output list." },
      ],
      expected: EXPECTED["l29-p8"],
      ordered: true,
    },
  ],
  takeaway: "Scalar functions reshape one value at a time — SUBSTR/INSTR slice by 1-based position, CAST changes type (truncating, not rounding), and COALESCE finally makes the NULL decision lesson 4 promised.",
};
