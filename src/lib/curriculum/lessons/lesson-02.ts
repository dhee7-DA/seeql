import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson02: Lesson = {
  id: "lesson-02",
  num: 2,
  title: "SELECT & FROM — reading data",
  blurb: "Choose exactly the columns you want, rename them, and compute new ones on the fly",
  minutes: 14,
  blocks: [
    {
      kind: "p",
      text: "Every read query shares one skeleton: `SELECT` lists **what to return**, `FROM` says **where the rows come from**. The SELECT clause does two jobs — master both and you can already answer a surprising amount of real business questions.",
    },
    { kind: "h", text: "The two jobs of SELECT" },
    {
      kind: "bullets",
      items: [
        "**Projection** — pick which columns you keep, in the order you list them. `SELECT price, name` and `SELECT name, price` return the same data shaped differently — and for a report or CSV export, that shape **is** the deliverable.",
        "**Derivation** — compute a column that isn't there, evaluated **per row**: `quantity * unit_price AS line_total` turns two existing columns into a new one.",
        "`SELECT *` means \"all columns\" — fine for exploring, wasteful in reports: it fetches columns you don't need and breaks silently when someone adds one.",
      ],
    },
    { kind: "diagram", figure: "l2-projection" },
    {
      kind: "code",
      caption: "Projection — pick and reorder columns",
      sql: "SELECT name, price FROM products LIMIT 5;",
      runnable: true,
    },
    {
      kind: "p",
      text: "Derived columns need a name: give them an `AS` **alias**, or the engine invents an ugly one like `quantity * unit_price` — painful for whoever reads your export next.",
    },
    {
      kind: "code",
      caption: "Derivation — compute a column that isn't there",
      sql: "SELECT id, quantity, unit_price, quantity * unit_price AS line_total FROM order_items LIMIT 5;",
      runnable: true,
    },
    { kind: "diagram", figure: "l2-expr-math" },
    { kind: "h", text: "Habits that scale" },
    {
      kind: "bullets",
      items: [
        "Uppercase keywords — `select … from` runs fine, but the convention makes 200-line queries scannable.",
        "Comment with `--` — one line saying **why** beats ten lines of clever SQL.",
        "Write `AS` even where it's optional (SQLite allows dropping it) — every other database and every style guide expects it.",
      ],
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "Gluing text together — SQLite and PostgreSQL use `name || ' (' || city || ')'`; MySQL doesn't support `||` for strings (it means logical OR there), so you'd write CONCAT(name, ' (', city, ')') instead.",
    },
  ],
  mcqs: [
    {
      id: "l2-q1",
      prompt: "What does projection mean in a SELECT clause?",
      choices: [
        "Sorting rows into a chosen order",
        "Choosing which columns the result contains",
        "Joining two tables together",
        "Filtering which rows survive",
      ],
      answer: 1,
      why: "Projection = column selection. It shapes the result horizontally; filtering rows (WHERE, lesson 3) shapes it vertically.",
      notes: [
        { choice: 3, why: "Filtering rows is WHERE's job (lesson 3) — projection is purely about which columns survive into the output." },
      ],
    },
    {
      id: "l2-q2",
      prompt: "What does `SELECT name AS customer_name` do?",
      choices: [
        "Renames the column in the database",
        "Returns the column under the heading customer_name",
        "Filters rows where name equals customer_name",
        "Creates a new table",
      ],
      answer: 1,
      why: "AS is an output alias — it only renames the column in the query result. The table itself is never changed by a SELECT.",
      notes: [
        { choice: 0, why: "A SELECT can never change the database — AS only affects the output heading. Renaming a stored column would take ALTER TABLE." },
      ],
    },
    {
      id: "l2-q3",
      prompt: "In `SELECT price * 1.2 FROM products`, the multiplication runs…",
      choices: [
        "once for the whole table",
        "once per returned row",
        "only when the column is numeric",
        "never — SELECT can't compute",
      ],
      answer: 1,
      why: "Expressions in the SELECT list are evaluated row by row, producing one output value per row — that's how derived columns work.",
      notes: [
        { choice: 0, why: "There's no whole-table pass — each row computes its own `price * 1.2`, which is why the derived value lands in every row." },
      ],
    },
    {
      id: "l2-q4",
      prompt: "Why is `SELECT *` discouraged in production reports?",
      choices: [
        "It runs slower on every database, always",
        "It can't be used with LIMIT",
        "It fetches unneeded columns and breaks when the schema changes",
        "It only works on small tables",
      ],
      answer: 2,
      why: "SELECT * couples your query to the current schema. A new column appears and your export, dashboard or INSERT wrapper silently changes shape. Name your columns.",
      notes: [
        { choice: 0, why: "Speed isn't the real issue — the killer is silent breakage: the result's shape changes the moment the schema grows a column." },
      ],
    },
    {
      id: "l2-q5",
      prompt: "What's wrong with `SELECT name price FROM products`?",
      choices: [
        "Nothing — it returns one column",
        "The missing comma makes it an alias: it returns `name` under the heading `price`",
        "SQLite requires uppercase keywords",
        "price must be quoted",
      ],
      answer: 1,
      why: "Without a comma, `price` is read as an (optional) alias for `name`. You get one column headed price containing names — a silent, confusing bug. Separate columns with commas.",
      notes: [
        { choice: 0, why: "It does run — silently. `price` becomes the alias and you ship a column of names labelled \"price\". That's nastier than an error." },
      ],
    },
    {
      id: "l2-q6",
      prompt: "`SELECT name, name FROM products` returns…",
      choices: [
        "An error — duplicate columns are forbidden",
        "Two identical name columns",
        "Only one name column",
        "The name column and its data type",
      ],
      answer: 1,
      why: "The SELECT list may repeat columns — each entry becomes one output column. Harmless but pointless; usually a leftover from editing.",
      notes: [
        { choice: 2, why: "The engine doesn't deduplicate — each entry in the SELECT list produces exactly one output column, even when two are identical." },
      ],
    },
    {
      id: "l2-q7",
      prompt: "Is `SELECT name n FROM customers` valid SQL?",
      choices: [
        "No — AS is mandatory for aliases",
        "Yes — AS is optional; n becomes the output heading",
        "Yes, but only for single-letter aliases",
        "No — aliases can't follow a column directly",
      ],
      answer: 1,
      why: "AS is optional sugar. `name n` and `name AS n` are identical. Many teams keep AS for readability — aliases are much easier to spot.",
      notes: [
        { choice: 0, why: "SQLite makes AS optional (so do Postgres and MySQL) — but every style guide keeps it, because aliased columns are easy to grep for." },
      ],
    },
    {
      id: "l2-q8",
      prompt: "`SELECT price * 0.92 AS price_eur` — what kind of value lands in price_eur?",
      choices: [
        "Text",
        "A computed decimal number, one per row",
        "A single total for the whole table",
        "An integer, always",
      ],
      answer: 1,
      why: "Arithmetic in the SELECT list is evaluated row by row and keeps decimal precision — the table itself is untouched.",
      notes: [
        { choice: 2, why: "No total appears — there's no aggregate here, so every row gets its own `price * 0.92`. Table-wide totals need SUM (lesson 6)." },
      ],
    },
    {
      id: "l2-q9",
      prompt: "What does the FROM clause control?",
      choices: [
        "Which rows are returned",
        "Which columns are returned",
        "Which table(s) the query reads from",
        "The order of the rows",
      ],
      answer: 2,
      why: "FROM names the source. Row filtering is WHERE (lesson 3), column choice is SELECT, ordering is ORDER BY (lesson 5) — each clause owns one concern.",
      notes: [
        { choice: 0, why: "Rows are WHERE's concern (lesson 3) — FROM only names the source the rows are read from." },
      ],
    },
    {
      id: "l2-q10",
      prompt: "In `SELECT name, 1 AS one FROM products`, what does the output look like?",
      choices: [
        "An error — literals can't be selected",
        "name plus a constant column where every row shows 1",
        "name plus the number of products",
        "A single row containing 1",
      ],
      answer: 1,
      why: "Literal expressions are computed per row, so a constant repeats down the result. Handy for tagging exports.",
      notes: [
        { choice: 3, why: "Nothing collapses to one row — there's no aggregate, so the constant 1 rides along beside every product name." },
      ],
    },
    {
      id: "l2-q11",
      prompt: "What does the database do with `-- lookup line` inside a query?",
      choices: [
        "Tries to execute it",
        "Ignores everything from -- to the end of the line",
        "Returns it as a warning",
        "Treats it as a column name",
      ],
      answer: 1,
      why: "-- starts a comment that runs to end of line. The engine strips it before parsing — comments are purely for humans.",
      notes: [
        { choice: 0, why: "If comments executed, every annotated query would crash — the parser never even sees the text after `--` on that line." },
      ],
    },
  ],
  problems: [
    {
      id: "l2-p1",
      title: "Price list",
      brief: "From `products`, return `name` and `price` for every product.",
      hints: [
        "Pure projection: two columns, every row, nothing computed.",
        "Shape: SELECT name, price FROM products;",
      ],
      difficulty: "easy",
      solution: "SELECT name, price FROM products;",
      mistakes: [
        { test: "\\bselect\\s+\\*", message: "The star drags in id, stock and more — project exactly `name` and `price`." },
      ],
      expected: EXPECTED["l2-p1"],
    },
    {
      id: "l2-p2",
      title: "Where our customers live",
      brief: "Return `name`, `city` and `region` for all customers.",
      hints: [
        "Three columns from customers — the order you list them is the order the output shows.",
        "Shape: SELECT name, city, region FROM customers;",
      ],
      difficulty: "easy",
      solution: "SELECT name, city, region FROM customers;",
      mistakes: [
        { test: "\\bselect\\s+\\*", message: "Projection, not the star — name exactly `name`, `city` and `region`." },
      ],
      expected: EXPECTED["l2-p2"],
    },
    {
      id: "l2-p3",
      title: "Line totals",
      brief: "From `order_items`, return `id`, `quantity`, `unit_price`, plus a derived column `line_total` = quantity × unit_price.",
      hints: [
        "Multiply two existing columns, then name the result with AS.",
        "Shape: SELECT id, quantity, unit_price, quantity * unit_price AS <alias> FROM order_items;",
      ],
      difficulty: "medium",
      solution: "SELECT id, quantity, unit_price, quantity * unit_price AS line_total FROM order_items;",
      mistakes: [
        { test: "unit_price\\s+from\\b", message: "The derived column needs a name: `quantity * unit_price AS line_total`. Without AS the heading is the raw expression and the grader can't match it." },
      ],
      expected: EXPECTED["l2-p3"],
    },
    {
      id: "l2-p4",
      title: "Prices in euros",
      brief: "The finance team thinks in euros. Return every product's `name` and its price converted at 0.92, aliased as `price_eur`.",
      hints: [
        "Convert with arithmetic, then alias so the heading is usable by the finance team.",
        "Shape: SELECT name, price * 0.92 AS price_eur FROM products;",
      ],
      difficulty: "medium",
      solution: "SELECT name, price * 0.92 AS price_eur FROM products;",
      mistakes: [
        { test: "\\*\\s*0\\.92\\s+from\\b", message: "Alias the result: `price * 0.92 AS price_eur` — without AS the column is headed by the raw expression." },
        { test: "\\bselect\\s+\\*", message: "Project `name` plus the computed column — the star adds columns nobody asked for." },
      ],
      expected: EXPECTED["l2-p4"],
    },
    {
      id: "l2-p5",
      title: "Shelf levels",
      brief: "Return `name` and `stock` for every product — the raw inventory list you'll aggregate in lesson 7.",
      hints: [
        "Two columns after SELECT, no LIMIT, no filtering.",
        "Shape: SELECT name, stock FROM products;",
      ],
      difficulty: "easy",
      solution: "SELECT name, stock FROM products;",
      mistakes: [
        { test: "\\bselect\\s+\\*", message: "Two columns are asked for — the star would return price, active and the rest too." },
      ],
      expected: EXPECTED["l2-p5"],
    },
    {
      id: "l2-p6",
      title: "The signup ledger",
      brief: "Return every customer's `name` and `created_at` — the full signup ledger, oldest records included.",
      hints: [
        "Projection on customers — the ledger includes *every* signup.",
        "Shape: SELECT name, created_at FROM customers;",
      ],
      difficulty: "easy",
      solution: "SELECT name, created_at FROM customers;",
      mistakes: [
        { test: "\\bwhere\\b", message: "The full ledger means every customer — a WHERE filter would silently drop signups." },
      ],
      expected: EXPECTED["l2-p6"],
    },
    {
      id: "l2-p7",
      title: "Half-price sale",
      brief: "Marketing wants a flash-sale sheet. Return every product's `name` and its price halved, aliased as `sale_price`.",
      hints: [
        "Halve with arithmetic, then give the expression a real name with AS.",
        "Shape: SELECT name, price * 0.5 AS sale_price FROM products;",
      ],
      difficulty: "medium",
      solution: "SELECT name, price * 0.5 AS sale_price FROM products;",
      mistakes: [
        { test: "\\*\\s*0\\.5\\s+from\\b", message: "Alias the halved price: `price * 0.5 AS sale_price` — an unnamed expression can't match the expected column." },
      ],
      expected: EXPECTED["l2-p7"],
    },
    {
      id: "l2-p8",
      title: "First ten line totals",
      brief: "Return `id` and `line_total` (quantity × unit_price) for the first 10 rows of `order_items`. Derived columns + LIMIT — the bread and butter of line-level exports.",
      hints: [
        "Two output columns: the raw id and the computed total — then cap the rows.",
        "Shape: SELECT id, quantity * unit_price AS line_total FROM order_items LIMIT <n>;",
      ],
      difficulty: "medium",
      solution: "SELECT id, quantity * unit_price AS line_total FROM order_items LIMIT 10;",
      mistakes: [
        { test: "quantity\\s+\\*\\s+unit_price\\s+from\\b", message: "Name the derived column with AS (… AS line_total) — the raw expression as heading won't match." },
        { test: "\\bselect\\s+\\*", message: "Only `id` and the computed total belong in the output." },
      ],
      expected: EXPECTED["l2-p8"],
    },
    {
      id: "l2-p9",
      title: "The complete supplier card",
      brief: "Return `name`, `region` and `rating` for every supplier — three columns, one clean projection.",
      hints: [
        "Three column names, comma-separated, in the order asked.",
        "Shape: SELECT name, region, rating FROM suppliers;",
      ],
      difficulty: "easy",
      solution: "SELECT name, region, rating FROM suppliers;",
      mistakes: [
        { test: "\\bselect\\s+\\*", message: "Three columns exactly — the star would smuggle in id and the rest." },
      ],
      expected: EXPECTED["l2-p9"],
    },
  ],
  takeaway: "SELECT shapes the output — projection picks columns and derivation computes new ones (alias anything computed) — while FROM names the source the rows come from.",
};
