import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson45: Lesson = {
  id: "lesson-45",
  num: 45,
  title: "CREATE TABLE — shapes & constraints",
  blurb: "The DDL door: column types, PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT, CHECK and REFERENCES — the promises the engine enforces on every future write, and how to introspect what you built",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "Every table you've queried for six modules began as a **CREATE TABLE** — a contract signed before the first row existed. The columns are only half of it; the other half is the **constraints**: the promises the engine now enforces on every INSERT, UPDATE and DELETE, forever. Lesson 43's FK fence, lesson 44's upsert targets — they all exist because a CREATE TABLE once declared them. Time to sign one yourself.",
    },
    { kind: "diagram", figure: "d1-table-anatomy" },
    {
      kind: "code",
      caption: "A full anatomy — every constraint in one statement",
      sql: `CREATE TABLE coupons (
  id      INTEGER PRIMARY KEY,              -- unique, never NULL, auto-assigns
  code    TEXT NOT NULL UNIQUE,             -- required + no duplicates
  pct     INTEGER NOT NULL CHECK (pct BETWEEN 1 AND 50),   -- value rule, every write
  active  INTEGER NOT NULL DEFAULT 1        -- fills itself when omitted
);`,
    },
    { kind: "h", text: "The constraint roster" },
    {
      kind: "bullets",
      items: [
        "**PRIMARY KEY** — the row's identity: unique, never NULL. `INTEGER PRIMARY KEY` is also SQLite's rowid alias, so it self-assigns `max+1` (lesson 41) and is the natural upsert target (lesson 44).",
        "**NOT NULL** — the column must receive a value; omitting it in an INSERT is an error unless a DEFAULT covers the gap.",
        "**UNIQUE** — no two rows share a value. Unlike the PK, a table may carry many UNIQUE columns, and (in SQLite) NULLs are allowed and never collide.",
        "**DEFAULT** — the value used when the column is omitted. It fires on INSERT only — UPDATEs always say what they mean.",
        "**CHECK (expr)** — a rule every written row must satisfy, on INSERT **and** UPDATE. `CHECK (pct BETWEEN 1 AND 50)` outlives every future developer's good intentions.",
        "**REFERENCES other(id)** — the foreign key: the engine refuses values that don't exist in the parent — the fence you met live in lesson 43.",
      ],
    },
    { kind: "h", text: "Types, briefly" },
    {
      kind: "bullets",
      items: [
        "SQLite stores TEXT, INTEGER, REAL, BLOB — and accepts anything, anywhere; the declared type is an **affinity** that nudges conversion (numeric text into an INTEGER column becomes a number). Lesson 1's dialect note showed the flip side: Postgres and MySQL would reject the mismatch SQLite shrugs at.",
        "Write correct types anyway — the affinity keeps ROUND math sane, comparisons predictable, and the schema portable to engines that do enforce.",
      ],
    },
    { kind: "h", text: "Introspect what you built" },
    {
      kind: "code",
      caption: "Two mirrors for schema objects",
      sql: `SELECT name, type, dflt_value, "notnull" FROM pragma_table_info('coupons');
SELECT name, type FROM sqlite_master WHERE name = 'coupons';   -- table | view | index`,
    },
    {
      kind: "bullets",
      items: [
        "`pragma_table_info('t')` is one row per column — name, declared type, NOT NULL flag, DEFAULT, and a `pk` flag you can count. It's how the grader verifies your DDL in this module.",
        "`sqlite_master` lists every schema object — tables, views, indexes — with the SQL that created them. Reading DDL back is a legitimate superpower in an unfamiliar database.",
      ],
    },
    {
      kind: "warn",
      text: "A CHECK is a one-way door: rows already inside satisfy it, and every future write must too. Add `CHECK (price >= 0)` and no import can sneak a -5 — but fixing an over-tight rule later means a table rebuild (lesson 46's rename dance). Write rules you can live with.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres auto-increments with `GENERATED ALWAYS AS IDENTITY` (or SERIAL in old code) rather than `INTEGER PRIMARY KEY`; CHECK, DEFAULT, UNIQUE and REFERENCES all match SQLite's spelling, and constraints can be NAMED (`CONSTRAINT pct_range CHECK …`) for friendlier error messages.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL uses `AUTO_INCREMENT` on the integer key, and only enforced CHECK from version 8.0.16 (earlier versions parsed and ignored it). UNIQUE and FK behave as you'd expect with the right storage engine (InnoDB).",
    },
    {
      kind: "tip",
      text: "Declare the FK even though this app turns enforcement on: the REFERENCES line is documentation the engine can act on — in this course it literally refuses orphan writes (lesson 43's fence), in migrations it guides tooling, and in code review it tells the next reader what points at what.",
    },
  ],
  mcqs: [
    {
      id: "l45-q1",
      prompt: "How does PRIMARY KEY differ from UNIQUE?",
      choices: [
        "They're identical",
        "One PK per table that's never NULL; many UNIQUE columns allowed, and UNIQUE tolerates NULLs",
        "UNIQUE is faster because it builds an index and PK doesn't",
        "PK must be numeric; UNIQUE can be any type",
      ],
      answer: 1,
      why: "A table declares exactly one PRIMARY KEY — unique and NOT NULL by definition. Any number of other columns can be UNIQUE; SQLite even allows NULLs in UNIQUE columns (each NULL is 'different'). Both build indexes under the hood.",
      notes: [
        { choice: 3, why: "PKs don't have to be numeric in SQL at large (Postgres loves UUID PKs) — the invariant is uniqueness + no NULLs, not the type." },
      ],
    },
    {
      id: "l45-q2",
      prompt: "A row is inserted omitting a `DEFAULT 1` column, and later an UPDATE sets another column. When does the DEFAULT fire?",
      choices: [
        "On both writes",
        "Only on the INSERT — UPDATE writes exactly what you assign",
        "Only on the UPDATE",
        "Never — DEFAULTs are documentation",
      ],
      answer: 1,
      why: "DEFAULT fills an omitted column at insert time. UPDATE always assigns explicitly — no assignment, no change, and the default never re-fires. That's why 'backfill then default' migrations need an UPDATE step (lesson 46).",
      notes: [
        { choice: 0, why: "If defaults re-fired on every UPDATE, any change to an unrelated column would reset this one — the opposite of what an in-place edit means." },
      ],
    },
    {
      id: "l45-q3",
      prompt: "`CHECK (pct BETWEEN 1 AND 50)` exists on coupons. An UPDATE tries to set pct = 0 on an existing row. Result?",
      choices: [
        "It succeeds — CHECK only guards INSERTs",
        "It fails — CHECK evaluates on UPDATE too",
        "It succeeds with a warning",
        "The whole table gets recreated",
      ],
      answer: 1,
      why: "CHECK is enforced on every write that touches the column — INSERT and UPDATE alike. A row can never leave the allowed range once it's inside it; that's the 'one-way door' the warning mentioned.",
      notes: [
        { choice: 0, why: "Insert-only checks would let updates rot the data — the whole value of a CHECK is that the rule holds for the table's lifetime." },
      ],
    },
    {
      id: "l45-q4",
      prompt: "`supplier_id INTEGER REFERENCES suppliers(id)` — what does the engine do when an INSERT supplies supplier_id 99 and no supplier 99 exists?",
      choices: [
        "Inserts with a warning",
        "Inserts with NULL instead",
        "Refuses — FOREIGN KEY constraint failed",
        "Creates supplier 99 automatically",
      ],
      answer: 2,
      why: "The FK promise: a child value must exist in the parent's referenced column. This exact refusal is the lesson-43 fence, seen from the insert side — the engine would rather error than manufacture an orphan.",
      notes: [
        { choice: 1, why: "NULL would be allowed only if the column itself were nullable — ours is NOT NULL, so there's no silent fallback. It's refuse or accept-a-real-value." },
      ],
    },
    {
      id: "l45-q5",
      prompt: "Which query counts the NOT NULL columns of a freshly created table?",
      choices: [
        "SELECT COUNT(*) FROM pragma_table_info('t') WHERE \"notnull\" = 1",
        "SELECT COUNT(*) FROM t",
        "SELECT COUNT(*) FROM sqlite_master WHERE name = 't'",
        "DESCRIBE t",
      ],
      answer: 0,
      why: "pragma_table_info('t') exposes one row per column with its flags — \"notnull\" among them. DESCRIBE is MySQL spelling, not SQLite; counting table ROWS or schema OBJECTS answers different questions entirely.",
      notes: [
        { choice: 2, why: "sqlite_master would confirm the table EXISTS — one row — but says nothing about its columns' constraints. The pragma views are the column-level mirror." },
      ],
    },
    {
      id: "l45-q6",
      prompt: "A colleague declares `email VARCHAR(30)`. What has SQLite actually stored?",
      choices: [
        "A 30-character-limited string column",
        "A column whose declared type is just a name — SQLite's affinity nudges it toward TEXT storage, no length limit",
        "An error — VARCHAR isn't SQLite",
        "A 30-byte binary blob",
      ],
      answer: 1,
      why: "SQLite's type system is affinity, not enforcement: VARCHAR(30) reads as TEXT-affinity and the 30 is decoration — a 200-character email stores fine. Length rules are app policy (or a CHECK like LENGTH(email) <= 30). Declared types guide storage class, they don't police content.",
      notes: [
        { choice: 0, why: "Length truncation or rejection would be MySQL's behavior. SQLite stores what you give it — the declared type only biases how values are held." },
      ],
    },
    {
      id: "l45-q7",
      prompt: "`SELECT sql FROM sqlite_master WHERE name = 'wishlists'` returns text. What is it?",
      choices: [
        "The rows of the table, concatenated",
        "The exact CREATE TABLE statement you ran — the schema's own source code",
        "A query plan for scanning the table",
        "An error — sqlite_master hides DDL",
      ],
      answer: 1,
      why: "sqlite_master stores the verbatim CREATE text for every object — the schema is introspectable down to its original spelling. That's how tools diff schemas, how the Data Explorer lists objects, and how you audit what a migration actually ran (minus cosmetic reformatting).",
      notes: [
        { choice: 2, why: "Query plans live in EXPLAIN QUERY PLAN's output at runtime — sqlite_master is the catalog, not the optimizer." },
      ],
    },
    {
      id: "l45-q8",
      prompt: "`body TEXT NOT NULL` versus `body TEXT CHECK (body IS NOT NULL)` — what differs?",
      choices: [
        "Nothing — both reject NULLs identically",
        "The CHECK version also rejects empty strings",
        "NOT NULL applies to inserts only",
        "The CHECK version is faster",
      ],
      answer: 0,
      why: "Both block NULL on every write — the CHECK spelling is just the manual transmission. NOT NULL is the declarative form with a clear pragma flag and better error reporting; write CHECK (x IS NOT NULL) only when the NULL rule needs to combine with other conditions.",
      notes: [
        { choice: 1, why: "Empty strings pass both — '' is a value, not a missing marker. Blocking it needs CHECK (LENGTH(body) > 0), a different promise entirely." },
      ],
    },
    {
      id: "l45-q9",
      prompt: "A wishlists table declares `UNIQUE (customer_id, product_id)`. What does that promise?",
      choices: [
        "Each customer_id appears at most once",
        "Each product_id appears at most once",
        "The PAIR is unique — a customer may save many products, a product may be saved by many customers, but never twice the same pair",
        "Both columns are individually unique",
      ],
      answer: 2,
      why: "Composite uniqueness constrains the tuple: the same customer saving the same product twice is the duplicate being prevented. This is exactly the wishlist/basket semantic — and the same leftmost-prefix index rule from lesson 48 powers the lookup behind it.",
      notes: [
        { choice: 0, why: "Per-column uniqueness would cap a customer at ONE saved product — a wishlist of one. The pair is the identity being protected." },
      ],
    },
    {
      id: "l45-q10",
      prompt: "You create a table with `REFERENCES customers(id)`, then INSERT supplying customer_id 999. The insert SUCCEEDS on a colleague's machine and FAILS on yours. Why?",
      choices: [
        "The table got corrupted in transit",
        "Foreign-key enforcement is a per-connection PRAGMA (foreign_keys=ON) — your session has it on, theirs off",
        "SQLite randomly enforces constraints",
        "999 is only invalid on Tuesdays",
      ],
      answer: 1,
      why: "SQLite declares FKs at CREATE time but enforces them only when the connection sets PRAGMA foreign_keys = ON — it's off by default for backward compatibility. The storefront's API runs with it on (lesson 43's fence fired), but a raw sqlite3 CLI session may not. Deployment settings are part of the contract.",
      notes: [
        { choice: 0, why: "Nothing corrupted — the constraint is real, its enforcement is a session setting. That asymmetry surprises everyone exactly once." },
      ],
    },
    {
      id: "l45-q11",
      prompt: "`CREATE TABLE wishlists (…)` runs twice in one migration script. Second run?",
      choices: [
        "Silently succeeds — CREATE TABLE is idempotent",
        "Error: table wishlists already exists — unless the script says CREATE TABLE IF NOT EXISTS",
        "The first table is replaced",
        "The second becomes a view",
      ],
      answer: 1,
      why: "Re-creating an existing object is an error, not a no-op — the engine refuses to guess whether overwrite means merge, replace or abort. IF NOT EXISTS exists for the deliberate idempotent-migration case; without it, the error is your safety net catching a double-run.",
      notes: [
        { choice: 2, why: "Replacement would be catastrophic by default — schemas change via ALTER or explicit DROP + CREATE, never via silent re-CREATE." },
      ],
    },
    {
      id: "l45-q12",
      prompt: "Which column definition makes omission-at-insert legal AND a NULL impossible?",
      choices: [
        "`stock INTEGER` — plain",
        "`stock INTEGER NOT NULL` — strict",
        "`stock INTEGER NOT NULL DEFAULT 0` — required eventually, defaulted when omitted",
        "`stock INTEGER DEFAULT NULL` — explicit hole",
      ],
      answer: 2,
      why: "NOT NULL DEFAULT is the two-part promise: the column never holds NULL, and inserts that skip it receive the default instead of an error. It's exactly how the storefront's own `stock INTEGER NOT NULL DEFAULT 0` and `active INTEGER NOT NULL DEFAULT 1` work.",
      notes: [
        { choice: 1, why: "Bare NOT NULL makes omission an error — every insert must name the column. The DEFAULT clause is what buys the omission rights back." },
      ],
    },
    {
      id: "l45-q13",
      prompt: "When does a CHECK constraint actually evaluate?",
      choices: [
        "Once, when the table is created",
        "On every INSERT and every UPDATE that touches the row — forever",
        "Only on INSERTs, not UPDATEs",
        "Nightly, by the engine's maintenance job",
      ],
      answer: 1,
      why: "A CHECK is a standing law, not a one-time gate: every write that would leave the row violating it fails, whether the bad value arrives via INSERT, UPDATE, or lesson 44's upsert DO UPDATE branch. That permanence is the difference between a constraint and a script.",
      notes: [
        { choice: 2, why: "UPDATEs are checked too — the coupon question above hinged on exactly this: an UPDATE setting pct = 0 on an existing row hits the CHECK just like an insert would." },
      ],
    },
    {
      id: "l45-q14",
      prompt: "Which of these CAN'T a CHECK constraint contain?",
      choices: [
        "A comparison between two columns of the same row",
        "A function call like LENGTH(email) > 0",
        "A subquery over another table — CHECKs are row-local by design",
        "An IN list like done IN (0, 1)",
      ],
      answer: 2,
      why: "CHECK expressions see only the row being written — same-row columns, literals and scalar functions all work, but subqueries are refused (the engine won't re-evaluate other tables per row). Cross-row rules need triggers, or the data model itself. The storefront's CHECK (done IN (0, 1)) is the classic row-local form.",
      notes: [
        { choice: 0, why: "Same-row comparisons are fine — CHECK (end_date >= start_date) is a textbook use. It's OTHER tables a CHECK can't see." },
      ],
    },
    {
      id: "l45-q15",
      prompt: "What does `pragma_table_info('orders')` return one row of?",
      choices: [
        "One row per table in the schema",
        "One row per index on the table",
        "One row per COLUMN — name, type, notnull, dflt_value and pk flags side by side",
        "One row per foreign key violation",
      ],
      answer: 2,
      why: "pragma_table_info is the column-level mirror: six rows for orders, one per column, each carrying its name, declared type, notnull flag, default expression and pk position. It's how every tool — including this course's graders — reads a contract back from the engine.",
      notes: [
        { choice: 0, why: "Tables live in sqlite_master — the pragma zooms INTO one table's columns. Two mirrors, two altitudes." },
      ],
    },
    {
      id: "l45-q16",
      prompt: "In pragma_table_info's output, which column holds a column's DEFAULT expression?",
      choices: [
        "`dflt_value` — NULL when the column has no default",
        "`type` — defaults are part of the type string",
        "`pk` — defaults ride on primary keys",
        "There's no such column — defaults aren't introspectable",
      ],
      answer: 0,
      why: "dflt_value carries the default expression verbatim (0, 'standard', datetime('now')) and reads NULL for columns without one — which is why counting `WHERE dflt_value IS NOT NULL` counts the defaulted columns. Introspection is complete: names, types, flags, defaults, all queryable.",
      notes: [
        { choice: 3, why: "Defaults are fully introspectable — every clause of the contract shows up in the pragma output. Nothing about the schema is hidden." },
      ],
    },
  ],
  problems: [
    {
      id: "l45-p1",
      title: "The wishlists table",
      brief: "Customers save products they covet. Create **wishlists**: `id` INTEGER PRIMARY KEY, `customer_id` INTEGER **NOT NULL REFERENCES customers(id)**, `product_id` INTEGER **NOT NULL REFERENCES products(id)**, `added_at` TEXT NOT NULL. The grader introspects the schema to check all four columns.",
      hints: [
        "Plain DDL — CREATE TABLE with the four lines; the FKs are REFERENCES clauses on the two id columns.",
        "Shape: CREATE TABLE wishlists (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), product_id INTEGER NOT NULL REFERENCES products(id), added_at TEXT NOT NULL);",
      ],
      difficulty: "easy",
      solution: "CREATE TABLE wishlists (\n  id          INTEGER PRIMARY KEY,\n  customer_id INTEGER NOT NULL REFERENCES customers(id),\n  product_id  INTEGER NOT NULL REFERENCES products(id),\n  added_at    TEXT NOT NULL\n);",
      verify: "SELECT type, name FROM sqlite_master WHERE name = 'wishlists';",
      mistakes: [
        { test: "customer_id integer ,|customer_id integer references", message: "customer_id needs its NOT NULL before the REFERENCES — the contract is 'required AND points at customers'. Same for product_id." },
        { test: "primary key autoincrement|serial|identity", message: "SQLite's INTEGER PRIMARY KEY self-assigns as a rowid alias — no AUTOINCREMENT keyword needed (and the portability spellings belong to other engines)." },
        { test: "varchar \\s*\\(|char \\s*\\(", message: "SQLite's declared types are TEXT, INTEGER, REAL, BLOB — TEXT with affinity is the string column; length limits are app policy here." },
      ],
      mutating: true,
      expected: EXPECTED["l45-p1"],
    },
    {
      id: "l45-p2",
      title: "Coupons with teeth",
      brief: "Marketing's coupon table needs rules: **coupons** (id INTEGER PRIMARY KEY, `code` TEXT NOT NULL **UNIQUE**, `pct` INTEGER NOT NULL **CHECK (pct BETWEEN 1 AND 50)**, `active` INTEGER NOT NULL DEFAULT 1). The verify query counts the NOT NULL columns with no default — expect `code` and `pct`.",
      hints: [
        "Four constraint kinds on four columns — PK, UNIQUE, CHECK, DEFAULT — spelled exactly as in the anatomy block.",
        "Shape: CREATE TABLE coupons (id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE, pct INTEGER NOT NULL CHECK (pct BETWEEN 1 AND 50), active INTEGER NOT NULL DEFAULT 1);",
      ],
      difficulty: "medium",
      solution: "CREATE TABLE coupons (\n  id     INTEGER PRIMARY KEY,\n  code   TEXT NOT NULL UNIQUE,\n  pct    INTEGER NOT NULL CHECK (pct BETWEEN 1 AND 50),\n  active INTEGER NOT NULL DEFAULT 1\n);",
      verify: "SELECT name FROM pragma_table_info('coupons') WHERE \"notnull\" = 1 AND dflt_value IS NULL;",
      mistakes: [
        { test: "check \\( pct > 0 \\)|check \\( pct >= 0 \\)", message: "Too loose — the rule is BETWEEN 1 AND 50: a 0% or 99% coupon must be structurally impossible, not merely unusual." },
        { test: "pct integer not null , active", message: "The CHECK vanished between pct and active — without it any future INSERT can write pct 500 and the table will happily hold it." },
        { test: "code text ,|code text not null , pct", message: "code lost its UNIQUE — two rows with code 'SPRING' is exactly the duplicate the marketing team fears. UNIQUE turns that into an error." },
      ],
      mutating: true,
      expected: EXPECTED["l45-p2"],
    },
    {
      id: "l45-p3",
      title: "An audit trail that timestamps itself",
      brief: "Create **audit_log** (id INTEGER PRIMARY KEY, `at` TEXT NOT NULL **DEFAULT (datetime('now'))**, `action` TEXT NOT NULL). The function default needs parentheses around the expression. Verify counts columns with any default — expect 1.",
      hints: [
        "Function-call defaults wrap the whole call in parens: DEFAULT (datetime('now')).",
        "Shape: CREATE TABLE audit_log (id INTEGER PRIMARY KEY, at TEXT NOT NULL DEFAULT (datetime('now')), action TEXT NOT NULL);",
      ],
      difficulty: "medium",
      solution: "CREATE TABLE audit_log (\n  id     INTEGER PRIMARY KEY,\n  at     TEXT NOT NULL DEFAULT (datetime('now')),\n  action TEXT NOT NULL\n);",
      verify: "SELECT COUNT(*) AS n FROM pragma_table_info('audit_log') WHERE dflt_value IS NOT NULL;",
      mistakes: [
        { test: "default datetime", message: "DEFAULT (datetime('now')) — the expression form needs the parentheses around the call; bare DEFAULT datetime('now') is a syntax error in SQLite." },
        { test: "default 'now'|default current_timestamp", message: "DEFAULT 'now' stores the four-letter word; the running timestamp comes from the function call (datetime('now')), wrapped in parens as an expression default." },
        { test: "action text default|action integer", message: "action is a plain NOT NULL TEXT — the only default in this table belongs to at; a default on action would make the verify count 2." },
      ],
      mutating: true,
      expected: EXPECTED["l45-p3"],
    },
    {
      id: "l45-p4",
      title: "Refunds, fenced twice",
      brief: "Finance wants **refunds**: id INTEGER PRIMARY KEY, `order_id` INTEGER NOT NULL **REFERENCES orders(id)**, `amount` REAL NOT NULL **CHECK (amount > 0)**, `reason` TEXT. Refunds are strictly positive — a zero or negative refund is a bug, not a business case. Verify expects exactly 1 PK column.",
      hints: [
        "Same anatomy as before: NOT NULL before REFERENCES; CHECK with a strict inequality.",
        "Shape: CREATE TABLE refunds (id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id), amount REAL NOT NULL CHECK (amount > 0), reason TEXT);",
      ],
      difficulty: "hard",
      solution: "CREATE TABLE refunds (\n  id       INTEGER PRIMARY KEY,\n  order_id INTEGER NOT NULL REFERENCES orders(id),\n  amount   REAL NOT NULL CHECK (amount > 0),\n  reason   TEXT\n);",
      verify: "SELECT COUNT(*) AS n FROM pragma_table_info('refunds') WHERE pk = 1;",
      mistakes: [
        { test: "check \\( amount >= 0 \\)|check \\( amount < 0 \\)", message: "Boundary drift — the brief says strictly positive: amount > 0. `>= 0` would bless zero refunds; `< 0` blesses only the nonsensical ones." },
        { test: "references orders\\s*[,)]", message: "The FK must name the referenced COLUMN: REFERENCES orders(id) — the fence needs a target, not just a table." },
        { test: "amount integer", message: "Money is REAL here — INTEGER truncates 12.50 to 12. Match the storefront's own orders.total typing." },
      ],
      mutating: true,
      expected: EXPECTED["l45-p4"],
    },
    {
      id: "l45-p5",
      title: "Backup by constructor",
      brief: "Before experimenting on suppliers, snapshot it: `CREATE TABLE suppliers_backup AS SELECT * FROM suppliers`. Then the verify SELECT counts the copy — six suppliers should be sitting in the new table.",
      hints: [
        "CREATE TABLE … AS SELECT builds the columns FROM the query's own output — no column list needed.",
        "Shape: CREATE TABLE suppliers_backup AS SELECT * FROM suppliers; then SELECT COUNT(*) AS n FROM suppliers_backup;",
      ],
      difficulty: "easy",
      solution: "CREATE TABLE suppliers_backup AS SELECT * FROM suppliers;",
      verify: "SELECT COUNT(*) AS n FROM suppliers_backup;",
      mistakes: [
        { test: "insert\\s+into\\s+suppliers_backup", message: "The table doesn't exist yet — INSERT fills tables, CREATE TABLE … AS SELECT builds and fills in one statement. That's the backup's whole trick." },
        { test: "where\\s+region", message: "A full snapshot needs no filter — every supplier, every column. Filtered copies are exports, not backups." },
        { test: "primary\\s+key", message: "CTAS copies DATA and column names, not constraints — the copy has no PK, no NOT NULL. It's a snapshot, not a sibling; real schema copies are migrations." },
      ],
      mutating: true,
      expected: EXPECTED["l45-p5"],
    },
    {
      id: "l45-p6",
      title: "The required-columns census",
      brief: "Read the products contract back: list `name` from **pragma_table_info('products')** where the column is NOT NULL (`\"notnull\" = 1`), ordered by `cid`. Five required columns should answer, in table order.",
      hints: [
        "pragma_table_info is a table-valued function — FROM it like any table; quote \"notnull\" because it's a keyword-looking name.",
        "Shape: SELECT name FROM pragma_table_info('products') WHERE \"notnull\" = 1 ORDER BY cid;",
      ],
      difficulty: "medium",
      solution: "SELECT name\nFROM pragma_table_info('products')\nWHERE \"notnull\" = 1\nORDER BY cid;",
      ordered: true,
      mistakes: [
        { test: "where\\s+notnull(?!\\s*=)", message: "Unquoted notnull reads as a keyword soup — the pragma column is \"notnull\" (quoted), compared to 1. The quotes aren't decoration." },
        { test: "notnull\\s*=\\s*0", message: "Inverted — notnull = 1 lists the REQUIRED columns (5 of them). The = 0 side returns just the id, whose rowid-alias nature makes notnull read 0." },
        { test: "sqlite_master", message: "sqlite_master knows the table's CREATE text; the column-level contract lives in pragma_table_info. Different mirror, different question." },
      ],
      expected: EXPECTED["l45-p6"],
    },
    {
      id: "l45-p7",
      title: "The status ledger",
      brief: "Analytics wants a status-census staging table: **order_status_log** with `status` TEXT **PRIMARY KEY** and `transitions` INTEGER **NOT NULL DEFAULT 0**. Verify the default is structural: count its columns whose `dflt_value` IS NOT NULL.",
      hints: [
        "Two columns, one PK, one default — the verify counts dflt_value IS NOT NULL rows in pragma_table_info.",
        "Shape: CREATE TABLE order_status_log (status TEXT PRIMARY KEY, transitions INTEGER NOT NULL DEFAULT 0); then SELECT COUNT(*) AS n FROM pragma_table_info('order_status_log') WHERE dflt_value IS NOT NULL;",
      ],
      difficulty: "medium",
      solution: "CREATE TABLE order_status_log (\n  status      TEXT PRIMARY KEY,\n  transitions INTEGER NOT NULL DEFAULT 0\n);",
      verify: "SELECT COUNT(*) AS n FROM pragma_table_info('order_status_log') WHERE dflt_value IS NOT NULL;",
      mistakes: [
        { test: "default\\s+'0'|default\\s*\\(\\s*0\\s*\\)", message: "Numbers default bare — DEFAULT 0. Quoted '0' stores a string that then compares funny against integer counts." },
        { test: "transitions\\s+integer\\s+not\\s+null\\s*,", message: "The default vanished between the clauses — NOT NULL DEFAULT 0 is one definition: required eventually, zero when omitted." },
        { test: "status\\s+integer", message: "Statuses are words — 'delivered', 'pending', 'shipped', 'cancelled' all live as TEXT in orders.status. Match the parent's typing." },
      ],
      mutating: true,
      expected: EXPECTED["l45-p7"],
    },
    {
      id: "l45-p8",
      title: "The orders contract, read back",
      brief: "Forty-plus lessons on one table — time to see it as the engine does: list every column `name` of **pragma_table_info('orders')** ordered by `cid`. Six rows: the full contract you've been querying since lesson 2.",
      hints: [
        "No WHERE this time — the whole contract, in positional order.",
        "Shape: SELECT name FROM pragma_table_info('orders') ORDER BY cid;",
      ],
      difficulty: "easy",
      solution: "SELECT name\nFROM pragma_table_info('orders')\nORDER BY cid;",
      ordered: true,
      mistakes: [
        { test: "from\\s+orders\\s*;|from\\s+orders\\s+order", message: "That reads the DATA (103 rows) — pragma_table_info('orders') is the table-valued mirror of the schema. FROM it instead of the table itself." },
        { test: "order\\s+by\\s+name", message: "Alphabetical scrambles the contract — cid is the column's positional index, the order the CREATE statement wrote. Column order is part of the schema." },
        { test: "where\\s+\"?notnull\"?\\s*=\\s*1", message: "That filters to required columns only (4 of 6) — this census wants ALL six, holes included. shipped_at's NULL-ability is part of the contract too." },
      ],
      expected: EXPECTED["l45-p8"],
    },
  ],
  takeaway: "CREATE TABLE is the moment you legislate: PK for identity, NOT NULL and UNIQUE for honesty, DEFAULT for convenience, CHECK for value rules, REFERENCES for the fence — and pragma_table_info is how you read the law back.",
  deep: [
    {
      kind: "mind",
      text: "CREATE TABLE is the moment the database **learns what a lie looks like**: every constraint you declare converts a future class of bad data from \"silently accepted\" into \"loudly rejected\". The storefront's contract: INTEGER PRIMARY KEY (the rowid — a free b-tree, lesson 48's topic), NOT NULL on every fact, DEFAULTs for optional flags (active = 1), REAL for prices this coarse, and INTEGER cents where exactness matters (invoices.amount_cents — float money is how accounting bugs breed). FKs (REFERENCES suppliers(id)) declare the graph. Constraint design is requirements engineering in disguise: each one is a sentence like \"an order cannot exist without a customer\" — written once, enforced forever, by the only witness that never gets tired.",
    },
    {
      kind: "engine",
      title: "you run CREATE TABLE products (…, supplier_id INTEGER NOT NULL REFERENCES suppliers(id))",
      steps: [
        "**Schema write** — the definition lands in sqlite_master; the table exists with zero rows. Types here are AFFINITIES (TEXT/INTEGER/REAL) — SQLite still stores what you give it, coerced politely.",
        "**Constraint compilation** — NOT NULL / CHECK / DEFAULT / FK become per-write checks from now on; the cost is paid on every INSERT/UPDATE, not at creation.",
        "**FK wiring** — REFERENCES records the graph edge; whether it ENFORCES depends on the connection's PRAGMA foreign_keys (lesson 43's fence) — the declaration is the option, the pragma is the switch.",
        "**The rollback** — DDL in this sandbox also runs in the rolled-back transaction: you can CREATE, test, and vanish. Schema experiments are cheap; production schema changes are not.",
      ],
    },
    {
      kind: "myth",
      myth: "\"I can add constraints later when the data grows up — start loose, tighten over time.\"",
      truth: "Bad data **arrives faster than refactor plans**: loose tables accumulate rows that violate the constraints you meant to add, and tightening then requires cleaning history you can't fully see. Declare the lie-detectors at birth; ALTER is for the exceptions.",
    },
    {
      kind: "edge",
      items: [
        { c: "REAL money", r: "0.1 + 0.2 ≠ 0.3 in binary floats; SUM over float money drifts. The invoice/expense tables store INTEGER cents — exactness by representation, not by rounding luck." },
        { c: "INTEGER PRIMARY KEY ≠ rowid alias", r: "Only INTEGER PRIMARY KEY aliases the rowid (free lookups); a TEXT pk or a composite pk builds a separate index instead. The id choice has a performance shape, not just a style." },
        { c: "UNIQUE vs PK", r: "A table can have one PK and many UNIQUEs (invoice.number is UNIQUE, id is PK). Both create indexes; both reject duplicates — PK is identity, UNIQUE is a business rule." },
        { c: "CHECK with functions", r: "CHECK (length(number) = 8) runs per write and can't reference other tables. It's the right tool for shape rules; \"valid supplier\" needs the FK, not a CHECK." },
      ],
    },  ],
};
