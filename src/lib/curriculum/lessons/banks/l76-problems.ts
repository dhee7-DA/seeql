import type { ProbRowX } from "./l64-util";

// Lesson 76 — One language, many accents: the dialect map. 12 problems.
// All solutions run on the storefront (SQLite grader); briefs translate from
// BigQuery/SQL Server/MySQL/Postgres spellings. Facts: shipped lag avg 3.0
// · date('2024-01-31','+1 month') = '2024-03-02' · top-3 totals 1088.44 /
// 945.21 / 39845.92 — expected is engine-captured, briefs stay count-free
// except where verified.

export const ROWS: ProbRowX[] = [
  ["DATEDIFF, SQLite spelling", "BigQuery writes DATE_DIFF(shipped_at, created_at, DAY). Translate: for the five newest shipped orders, output `id`, `ship_days` = the whole-day lag between order and shipment — `CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER)`, newest orders first (id desc).", ["julianday converts a date to a day number; subtraction is the DATEDIFF.", "Shape: SELECT id, CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS ship_days FROM orders WHERE shipped_at IS NOT NULL ORDER BY id DESC LIMIT 5;"], "medium",
    "SELECT id,\n  CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS ship_days\nFROM orders\nWHERE shipped_at IS NOT NULL\nORDER BY id DESC\nLIMIT 5;",
    [["datediff", "No such function here — julianday(a) - julianday(b) IS the date difference."], ["created_at\\s*-\\s*shipped_at", "Direction matters — the lag runs order → shipment, so shipped_at minus created_at."]], true],
  ["CONCAT, operator spelling", "MySQL writes CONCAT(customer_id, '-', status). Translate: output `id`, `label` = id, a dash, and the status — operator concatenation — for orders 1–5 (id order).", ["SQLite concatenates with ||.", "Shape: SELECT id, customer_id || '-' || status AS label FROM orders ORDER BY id LIMIT 5;"], "easy",
    "SELECT id, customer_id || '-' || status AS label\nFROM orders\nORDER BY id\nLIMIT 5;",
    [["concat\\s*\\(", "No CONCAT function in SQLite — the || operator is the spelling."], ["\\\\|\\\\|\\\\s*\"'-'\"\\\\|\\\\|", "Quote the dash with single quotes: '-' — double quotes mean identifiers."]], true],
  ["The missing-value map", "SQL Server ISNULL(shipped_at, 'not shipped'), Oracle NVL, MySQL IFNULL — all one idea. Output `id`, `ship` = IFNULL(shipped_at, 'not shipped') for the five unshipped orders (id order).", ["IFNULL substitutes only for NULL.", "Shape: SELECT id, IFNULL(shipped_at, 'not shipped') AS ship FROM orders WHERE shipped_at IS NULL ORDER BY id LIMIT 5;"], "easy",
    "SELECT id, IFNULL(shipped_at, 'not shipped') AS ship\nFROM orders\nWHERE shipped_at IS NULL\nORDER BY id\nLIMIT 5;",
    [["coalesce", "COALESCE works too — but the brief names the dialect trio's SQLite spelling: IFNULL."], ["is\\s+not\\s+null", "IS NOT NULL filters; the ask SUBSTITUTES — IFNULL keeps the row and fills the hole."]], true],
  ["TOP, FETCH, LIMIT", "SQL Server writes SELECT TOP 3 … ORDER BY total DESC. Translate: the three heaviest orders — output `id`, `total`, heaviest first.", ["LIMIT 3 is the SQLite spelling.", "Shape: SELECT id, total FROM orders ORDER BY total DESC LIMIT 3;"], "easy",
    "SELECT id, total\nFROM orders\nORDER BY total DESC\nLIMIT 3;",
    [["top\\s+3", "TOP is SQL Server's dialect — SQLite speaks LIMIT."], ["fetch", "FETCH FIRST is the standard form, but SQLite only speaks LIMIT."]], true],
  ["Identifier quoting", "Postgres writes \"name\"; MySQL writes `name`. Output `name` for the first three suppliers (id order) — SQLite accepts both spellings, the standard one preferred.", ["Double quotes for identifiers.", "Shape: SELECT name FROM suppliers ORDER BY id LIMIT 3;"], "easy",
    "SELECT name\nFROM suppliers\nORDER BY id\nLIMIT 3;",
    [["'", "Single quotes are STRINGS — identifiers take double quotes (or backticks/brackets, accepted here)."], ["\\bselect\\s+id\\b", "The ask is the supplier NAME, not the id."]], true],
  ["SUBSTR, both spellings", "Postgres standard form SUBSTRING(name FROM 1 FOR 3); SQLite's native form is SUBSTR. Output `name`, `tag` = the first three characters of each supplier name — all six, id order.", ["SUBSTR(name, 1, 3) — SQLite's spelling.", "Shape: SELECT name, SUBSTR(name, 1, 3) AS tag FROM suppliers ORDER BY id;"], "easy",
    "SELECT name, SUBSTR(name, 1, 3) AS tag\nFROM suppliers\nORDER BY id;",
    [["substring", "SUBSTRING works in SQLite too — but the native spelling is SUBSTR(x, start, len)."], ["length", "The ask is a three-character slice, not a length."]], true],
  ["The month-clamp surprise", "Oracle's ADD_MONTHS(DATE '2024-01-31', 1) clamps to 2024-02-29. SQLite's date('2024-01-31', '+1 month') does something else — output `clamped` and see.", ["One row, one date() call with the modifier.", "Shape: SELECT date('2024-01-31', '+1 month') AS clamped;"], "easy",
    "SELECT date('2024-01-31', '+1 month') AS clamped;",
    [["2024-02", "That would be the clamp — SQLite rolls the overflow instead. Run it and read the month."], ["datetime", "date() is the function; datetime adds a time part the ask doesn't want."]], true],
  ["Ship lag, bulk", "The ops question, any engine's syntax: how many shipped orders landed within **3 days**? Output `n` — `WHERE julianday(shipped_at) - julianday(created_at) <= 3`.", ["Julian subtraction inside COUNT, NULLs excluded by the predicate itself.", "Shape: SELECT COUNT(*) AS n FROM orders WHERE julianday(shipped_at) - julianday(created_at) <= 3;"], "medium",
    "SELECT COUNT(*) AS n\nFROM orders\nWHERE julianday(shipped_at) - julianday(created_at) <= 3;",
    [["cast", "Whole-day CAST inside COUNT(*) changes nothing — the comparison filters, the count totals."], ["<\\s*3", "Within 3 days is <= 3 — the boundary row counts too."]], false],
  ["Which engine is this?", "SQLite's date toolkit has a signature: one-argument date(). Output `d` = date('2024-01-15') — one row, the date echoed back.", ["date() with a single argument.", "Shape: SELECT date('2024-01-15') AS d;"], "easy",
    "SELECT date('2024-01-15') AS d;",
    [["to_date", "That's Oracle/Postgres — not here."], ["cast", "The string is already ISO — date() reads it directly."]], true],
  ["Booleans, stored", "Postgres stores TRUE/FALSE; SQLite stores 1/0. Count the active customers — `WHERE active = 1` — output `n`.", ["The flag is a 0/1 integer.", "Shape: SELECT COUNT(*) AS n FROM customers WHERE active = 1;"], "easy",
    "SELECT COUNT(*) AS n\nFROM customers\nWHERE active = 1;",
    [["=\\s*true", "true isn't a value here — the flag is the integer 1."], ["is\\s+1", "IS works for NULLs; equality for 1 — either runs, = is the spelling."]], false],
  ["Pagination, already portable", "LIMIT 3 OFFSET 2 runs unchanged in MySQL, Postgres and SQLite. The second page of a price-descending product listing: output `name`, `price` — positions 3–5.", ["ORDER BY price DESC, then LIMIT 3 OFFSET 2.", "Shape: SELECT name, price FROM products ORDER BY price DESC LIMIT 3 OFFSET 2;"], "easy",
    "SELECT name, price\nFROM products\nORDER BY price DESC\nLIMIT 3 OFFSET 2;",
    [["offset\\s+3", "OFFSET skips the FIRST two — positions 3–5 need OFFSET 2."], ["limit\\s+2", "A page of three is LIMIT 3."]], true],
  ["COUNT(*) vs COUNT(col), portable", "The one count difference every engine shares: COUNT(*) counts rows, COUNT(col) counts values. Output `all_rows`, `with_ship` for orders — the full census beside the shipped-only one.", ["Two aggregates, one row.", "Shape: SELECT COUNT(*) AS all_rows, COUNT(shipped_at) AS with_ship FROM orders;"], "easy",
    "SELECT COUNT(*) AS all_rows, COUNT(shipped_at) AS with_ship\nFROM orders;",
    [["count\\s*\\(\\s*distinct", "No DISTINCT — the contrast is rows vs non-NULL values."], ["where\\s+shipped", "No filter — the two counts live in ONE row, contrast included."]], false],
];
