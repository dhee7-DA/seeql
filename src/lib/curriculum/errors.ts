// Error clinic bank — deliberate debugging practice.
//
// Seven items throw the REAL SQLite error (captured live from the sandbox,
// receipts in tool-results/practice-banks-facts.txt); five are silent bugs —
// the statement runs clean and returns a confidently wrong answer, which is
// how bugs actually reach production. Every distractor is a plausible
// misreading, and every item ships with the fixed SQL.

export interface ClinicItem {
  /** Stable id, e.g. "e1" — XP ledger key `clinic:e1`. */
  id: string;
  title: string;
  /** In-world framing: what was being attempted. */
  brief: string;
  sql: string;
  /** The engine's verdict. kind "error" → the message shown; kind "silent" → it ran. */
  kind: "error" | "silent";
  /** For silent items: what the run actually returned (one-line receipt). */
  receipt?: string;
  /** The exact engine message for error items. */
  message?: string;
  choices: string[];
  answer: number;
  why: string;
  fixedSql: string;
  skill: string;
}

export const CLINIC_XP = 8;

export const CLINICS: ClinicItem[] = [
  {
    id: "e1",
    title: "The unterminated string",
    brief: "A teammate filtered customers by city, hit Run, and the engine refused to even read the statement.",
    sql: "SELECT name FROM customers WHERE city = 'Springfield",
    kind: "error",
    message: "unrecognized token: \"'Springfield\"",
    choices: [
      "The string literal is never closed — the opening quote swallows the rest of the statement",
      "The city column doesn't exist on customers",
      "SQLite requires a semicolon and the statement has none",
      "String comparisons must use DOUBLE quotes in SQL",
    ],
    answer: 0,
    why: "The opening ' before Springfield has no closing partner, so the lexer hits the end of the input mid-token and reports 'unrecognized token'. Missing semicolons are fine in this sandbox (it strips trailing ones), single quotes are correct for strings, and the error would say 'no such column' if city were the problem.",
    fixedSql: "SELECT name FROM customers WHERE city = 'Springfield';",
    skill: "debugging",
  },
  {
    id: "e2",
    title: "The table that isn't there",
    brief: "Someone hand-typed a query against the roster from memory. The engine answered instantly — with an error.",
    sql: "SELECT name FROM custumers WHERE region = 'north';",
    kind: "error",
    message: "no such table: custumers",
    choices: [
      "A typo in the table name — custumers instead of customers",
      "The customers table is locked by another query",
      "The region filter is invalid for this table",
      "Table names are case-sensitive and must be CUSTOMERS",
    ],
    answer: 0,
    why: "'no such table: custumers' names the exact problem — the misspelled identifier. SQLite resolves table names case-insensitively, and a bad WHERE column would raise 'no such column' instead. Typo-first debugging: read the identifier in the error literally.",
    fixedSql: "SELECT name FROM customers WHERE region = 'US';",
    skill: "debugging",
  },
  {
    id: "e3",
    title: "The dangling AND",
    brief: "A filter was being written interactively — and the runner was clicked one keystroke too early.",
    sql: "SELECT name, region FROM customers WHERE region = 'north' AND",
    kind: "error",
    message: "incomplete input",
    choices: [
      "The statement ends mid-expression — AND promises a right-hand side that never arrives",
      "AND must be lowercase in SQLite",
      "Two conditions can never be combined with AND",
      "The select list is missing an aggregate to use AND",
    ],
    answer: 0,
    why: "'incomplete input' is SQLite saying the parser reached the end while still expecting something — here, the second operand of AND. AND is case-insensitive, combining conditions is its whole job, and aggregates have nothing to do with it. The fix is finishing the thought: AND active = 1.",
    fixedSql: "SELECT name, region FROM customers WHERE region = 'US' AND active = 1;",
    skill: "debugging",
  },
  {
    id: "e7",
    title: "The clauses in the wrong order",
    brief: "An analyst tried to filter aggregated prices — but wrote the clauses in the order they'd say them out loud.",
    sql: "SELECT AVG(price) AS average\nFROM products\nORDER BY average DESC\nHAVING average > 10;",
    kind: "error",
    message: "near \"HAVING\": syntax error",
    choices: [
      "HAVING must come before ORDER BY — the clause pipeline has a fixed order",
      "HAVING cannot reference an alias, only the full aggregate",
      "AVG cannot be aliased in SQLite",
      "ORDER BY on an aggregate is not allowed",
    ],
    answer: 0,
    why: "The logical pipeline is SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT, and the parser enforces it: after ORDER BY it expects LIMIT or end, so HAVING is 'near' a syntax error. (The alias-in-HAVING part is actually legal on this engine — the order is the crime.) And ORDER BY on a single-row aggregate is pointless, not illegal.",
    fixedSql: "SELECT AVG(price) AS average\nFROM products\nHAVING AVG(price) > 10;",
    skill: "debugging",
  },
  {
    id: "e8",
    title: "The vanishing comma",
    brief: "A quick census of regions — and the parser trips over a missing separator.",
    sql: "SELECT region COUNT(*) FROM customers GROUP BY region;",
    kind: "error",
    message: "near \"(\": syntax error",
    choices: [
      "A comma is missing between region and COUNT(*) in the select list",
      "COUNT requires the star, not a column argument",
      "GROUP BY cannot follow a select list with two items",
      "region is a reserved word and cannot be selected",
    ],
    answer: 0,
    why: "Without the comma the parser reads 'region COUNT' as one thing, then hits '(' where an alias or FROM should be — hence 'near \"(\"'. COUNT takes any expression including columns, GROUP BY position is fine, and region is not reserved.",
    fixedSql: "SELECT region, COUNT(*) FROM customers GROUP BY region;",
    skill: "debugging",
  },
  {
    id: "e9",
    title: "The LIMIT that can't count",
    brief: "Someone tried to be expressive about how many rows they wanted. The engine was not charmed.",
    sql: "SELECT name FROM customers LIMIT 'five';",
    kind: "error",
    message: "datatype mismatch",
    choices: [
      "LIMIT needs an integer — a string literal won't parse as a row count",
      "LIMIT must be written before ORDER BY",
      "The word LIMIT is reserved and spelled LIMITED in SQLite",
      " customers has too few rows for a LIMIT clause",
    ],
    answer: 0,
    why: "'datatype mismatch' is the engine refusing to interpret 'five' as a number — LIMIT's operand must be an integer expression (or -1 for unlimited). Clause order is LIMIT-last, the keyword is spelled LIMIT, and LIMIT never complains about table size.",
    fixedSql: "SELECT name FROM customers LIMIT 5;",
    skill: "debugging",
  },
  {
    id: "e11",
    title: "The INSERT with a hole in it",
    brief: "A product row was being added with only a name. The constraint contract had opinions.",
    sql: "INSERT INTO products (name) VALUES ('Test widget');",
    kind: "error",
    message: "NOT NULL constraint failed: products.category",
    choices: [
      "category was omitted from the column list and has no DEFAULT — the NOT NULL contract fails",
      "The products table rejects any INSERT while other users are reading",
      "VALUES rows must list every column of the table in order",
      "The name needs to be at least 5 characters long",
    ],
    answer: 0,
    why: "The error names the violated contract verbatim: products.category is NOT NULL with no default, and the statement never supplies it. The column-list contract is exactly what makes partial INSERTs legal — but only for columns that are nullable or defaulted. (This ran in the sandbox, so the failed insert left no trace.)",
    fixedSql: "INSERT INTO products (name, category, price, supplier_id) VALUES ('Test widget', 'Audio', 49.99, 1);",
    skill: "writes",
  },
  // ---- silent bugs: it runs, it returns, it's wrong -----------------------
  {
    id: "e4",
    title: "The mystery city (silent bug)",
    brief: "“Count the customers and show the city.” It ran. The result says 16 and… Berlin? Nobody asked for Berlin specifically.",
    sql: "SELECT COUNT(*), city FROM customers;",
    kind: "silent",
    receipt: "1 row: 16 | Berlin",
    choices: [
      "Mixing a bare column with an aggregate: COUNT collapses 16 rows into one, and SQLite just picks some row's city for the bare column",
      "Berlin is the city with the most customers, so GROUP BY was implied",
      "COUNT(*) returned 16 because there are 16 cities",
      "The query is fine — 16 customers all live in Berlin",
    ],
    answer: 0,
    why: "An aggregate with no GROUP BY collapses the whole table to ONE row — and any bare column in that SELECT is undefined: SQLite picks an arbitrary row's value (here, Berlin). This is exactly why standard SQL rejects it outright; SQLite's lax mode silently guesses instead. The count of distinct cities needs GROUP BY city.",
    fixedSql: "SELECT COUNT(*) AS members, city FROM customers GROUP BY city;",
    skill: "groupby",
  },
  {
    id: "e5",
    title: "The flag that never says yes (silent bug)",
    brief: "“List the active members.” It ran perfectly and returned… zero rows. The data explorer disagrees.",
    sql: "SELECT name FROM customers WHERE active = 'yes' LIMIT 5;",
    kind: "silent",
    receipt: "0 rows — while SELECT COUNT(*) FROM customers WHERE active = 1 returns 14",
    choices: [
      "active is an integer 0/1 flag — comparing it to the TEXT 'yes' matches nothing",
      "The LIMIT 5 cut off all the matching rows",
      "active means something else — it needs a JOIN to be meaningful",
      "Boolean columns must be compared with the IS keyword",
    ],
    answer: 0,
    why: "The column stores 0s and 1s; 'yes' is text, and 1 = 'yes' is false in SQLite (it compares as a type mismatch, never true). The clause runs, the filter kills every row, zero results — no error to point at. LIMIT didn't hide anything: the filter did.",
    fixedSql: "SELECT name FROM customers WHERE active = 1 LIMIT 5;",
    skill: "debugging",
  },
  {
    id: "e6",
    title: "The JOIN that lost its ON (silent bug)",
    brief: "“Orders with customer names.” The statement ran — and returned 1,648 rows for a 103-order store.",
    sql: "SELECT orders.id, customers.name\nFROM orders\nINNER JOIN customers;",
    kind: "silent",
    receipt: "1,648 rows — 103 orders × 16 customers",
    choices: [
      "With no ON clause the INNER JOIN degrades to a cartesian product — every order paired with every customer",
      "1,648 is correct: 1,648 orders exist once customers are counted properly",
      "The join silently deduplicated — the real count is smaller",
      "INNER JOIN requires the tables to be listed in a specific order",
    ],
    answer: 0,
    why: "Missing ON is syntactically legal in SQLite: the join falls back to a cross join, 103 × 16 = 1,648 rows, every order stamped with all sixteen names. The database won't stop you — the row count is the smell. Always pair a JOIN with its ON in the same breath.",
    fixedSql: "SELECT orders.id, customers.name\nFROM orders\nINNER JOIN customers ON customers.id = orders.customer_id;",
    skill: "joins",
  },
  {
    id: "e10",
    title: "The equality that can't find NULL (silent bug)",
    brief: "“Find the orders that never shipped.” It ran, returned zero rows — and ops shipped it to a dashboard.",
    sql: "SELECT * FROM orders WHERE shipped_at = NULL;",
    kind: "silent",
    receipt: "0 rows — while shipped_at IS NULL finds 21",
    choices: [
      "= NULL is never true — comparing anything to unknown yields unknown, which the WHERE gate drops; NULL needs IS NULL",
      "shipped_at has no NULLs — the zero rows are correct",
      "The star projection broke the filter",
      "NULL values need quotes: '= \"NULL\"'",
    ],
    answer: 0,
    why: "The classic. In three-valued logic, 1 = NULL, 'x' = NULL and even NULL = NULL all evaluate to unknown — and WHERE keeps only true. So the statement is valid, runs, and lies by omission: 21 orders are unshipped. IS NULL is not a stylistic variant; it's the only test that works.",
    fixedSql: "SELECT * FROM orders WHERE shipped_at IS NULL;",
    skill: "null",
  },
  {
    id: "e12",
    title: "The GROUP BY looking at the wrong column (silent bug)",
    brief: "“Spend per customer.” Someone grouped by the wrong column. It ran — and every customer_id in the output is a coin flip.",
    sql: "SELECT customer_id, SUM(total)\nFROM orders\nGROUP BY status;",
    kind: "silent",
    receipt: "4 rows — customer_id values like 1, 13, 16, 1 paired with status-bucket sums",
    choices: [
      "The SELECT shows customer_id but the grouping key is status — SQLite picks an arbitrary customer_id from each status bucket",
      "GROUP BY status is equivalent to GROUP BY customer_id here",
      "The sums are wrong because SUM ignores cancelled orders",
      "Only four customers have ever ordered",
    ],
    answer: 0,
    why: "Every non-aggregated SELECT column should be in the GROUP BY — the select/group contract. SQLite's lax mode lets it slide and then fills customer_id with whichever row it touched last in each bucket: arbitrary, stable-looking, meaningless. SUM itself is fine; the grouping key is the bug. (Also: cancelled orders ARE in the sums — only NULL totals would be skipped.)",
    fixedSql: "SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id;",
    skill: "groupby",
  },
];
