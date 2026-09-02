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
      expected: EXPECTED["l45-p4"],
    },
  ],
  takeaway: "CREATE TABLE is the moment you legislate: PK for identity, NOT NULL and UNIQUE for honesty, DEFAULT for convenience, CHECK for value rules, REFERENCES for the fence — and pragma_table_info is how you read the law back.",
};
