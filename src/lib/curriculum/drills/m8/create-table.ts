// Drill set — CREATE TABLE (Module 8, secondary, 14 questions).
// Engine-verified receipts (db/custom.db, scripts/thin-facts2.ts): the
// storefront has 9 tables and NOTHING else in sqlite_master (no extra
// indexes/views); products columns: id INTEGER PRIMARY KEY (notnull 0 —
// PK columns report 0), name TEXT NOT NULL, category TEXT NOT NULL, price
// REAL NOT NULL, stock INTEGER NOT NULL DEFAULT 0, supplier_id INTEGER NOT
// NULL REFERENCES suppliers(id); customers.active INTEGER NOT NULL DEFAULT 1
// (14 active / 2 inactive); longest product name 23 chars, category 11;
// region values APAC / EU / LATAM / US. Probed errors: inserting NULL into
// name → "NOT NULL constraint failed: products.name"; unknown FK target →
// "foreign key mismatch"; PRAGMA table_info is the receipt reader.

import type { DrillQ } from "../types";

const KW = "CREATE TABLE";

export const CREATE_TABLE: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr8-ct-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which line correctly opens a products-style table definition?",
    choices: [
      "`CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, …)`",
      "`CREATE products TABLE (id INTEGER PRIMARY KEY, …)`",
      "`NEW TABLE products (id INTEGER PRIMARY KEY, …)`",
      "`CREATE TABLE products VALUES (id INTEGER PRIMARY KEY, …)`",
    ],
    answer: 0,
    why: "`CREATE TABLE <name> ( <column> <type> <constraints>, … )` — keyword order is CREATE TABLE, name, parens. Column lines pair a name with a type (INTEGER/TEXT/REAL), then constraints. The storefront's own products opens exactly this way.",
    notes: [
      { choice: 1, why: "TABLE follows CREATE, always. Reordered keywords are the parser's first complaint." },
    ],
  },
  { id: "dr8-ct-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which column line gives new rows a sensible default shelf count of zero?",
    choices: [
      "`stock INTEGER NOT NULL DEFAULT 0`",
      "`stock INTEGER DEFAULT 0 NOT NULL` — order doesn't matter, right?",
      "`stock INTEGER NOT NULL = 0`",
      "`stock INTEGER CHECK DEFAULT 0`",
    ],
    answer: 0,
    why: "`NOT NULL DEFAULT 0` is the storefront's literal products.stock line: insert a row without naming stock and it lands at 0, never NULL. Both orderings parse in SQLite — the convention is NOT NULL first — but `= 0` isn't grammar and CHECK needs a condition.",
    notes: [
      { choice: 2, why: "Assignment syntax lives in UPDATE's SET. DDL expresses defaults with the DEFAULT keyword." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr8-ct-03", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `id INTEGER PRIMARY KEY` promise in SQLite?",
    choices: [
      "The column is the row's unique address — and NULLs in it are auto-assigned an unused rowid",
      "The column must be filled by hand with unique numbers",
      "The column is encrypted",
      "The table can hold only one other column",
    ],
    answer: 0,
    why: "In SQLite an INTEGER PRIMARY KEY is the rowid alias: the row's address in the b-tree. Insert NULL (or omit it) and the engine assigns the next unused integer — that's how RETURNING id echoes 17 after 16 products. Unique, fast to look up (SEARCH … USING INTEGER PRIMARY KEY), never NULL.",
    notes: [
      { choice: 1, why: "You MAY supply your own value, but omission is the normal path — the engine's counter is the whole reason inserts stay one-statement simple." },
    ],
  },
  { id: "dr8-ct-04", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `supplier_id INTEGER NOT NULL REFERENCES suppliers(id)` enforce?",
    choices: [
      "Every product's supplier_id must match some supplier's id — with foreign_keys ON, orphan products are rejected",
      "supplier_id must equal the product's own id",
      "The suppliers table gets a product_id column",
      "Nothing until you type it twice",
    ],
    answer: 0,
    why: "REFERENCES is the FK contract: values must exist in the parent's id column (when PRAGMA foreign_keys = ON). It's the schema-level guarantee behind the drill fact that deleting a referenced supplier fails — relationships live in DDL, not just in query joins.",
    notes: [
      { choice: 2, why: "The link is one-directional: the child names the parent. Adding a column to suppliers isn't part of any FK spelling." },
    ],
  },
  { id: "dr8-ct-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "NOT NULL is declared on products.name. What does the engine do with `INSERT INTO products (id, category, price, stock, supplier_id) VALUES (17, 'Video', 79.99, 10, 2)` — name omitted?",
    choices: [
      "The row inserts with name = '' — empty but present",
      "Rejected — 'NOT NULL constraint failed: products.name' (no DEFAULT to fall back on)",
      "The row inserts with name = NULL and a warning",
      "The engine invents a name from the category",
    ],
    answer: 1,
    why: "NOT NULL without DEFAULT means the column is REQUIRED at insert time: omitting it (or passing NULL explicitly) fails loudly with the constraint's name attached. The storefront's name/category/price all carry NOT NULL — the column-list contract from lesson-41 in DDL form.",
    notes: [
      { choice: 0, why: "Empty string is a VALUE — it would pass. The failure is for NULL, the absence of any value. Different things; only one is banned here." },
    ],
  },
  { id: "dr8-ct-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`customers.active INTEGER NOT NULL DEFAULT 1` — 16 customers inserted, two rows later flipped to 0. What did DEFAULT buy?",
    choices: [
      "Every new customer started active without naming the column; the flips are ordinary UPDATEs on top",
      "active can never change after insert",
      "The column stores 16 permanently",
      "DEFAULT only works on PRIMARY KEYs",
    ],
    answer: 0,
    why: "DEFAULT is the insert-time fallback: 16 rows entered as active=1 without anyone typing it. Engine receipt: 14 on / 2 off — the two zeros came from explicit UPDATEs afterwards. Defaults encode the common case; writes adjust the exceptions.",
  },

  // ---------- edge ----------
  { id: "dr8-ct-07", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "A CHECK guard: `price REAL NOT NULL CHECK (price > 0)`. What does it do that NOT NULL alone doesn't?",
    choices: [
      "Rejects zero and negative prices at insert AND update time — any write must satisfy the predicate",
      "Makes the price column faster",
      "Rounds prices to positives",
      "Nothing — CHECK is documentation",
    ],
    answer: 0,
    why: "NOT NULL bans one value (NULL); CHECK bans a whole predicate's failures — price = 0, price = −5, price = −0.01 all bounce ('CHECK constraint failed'). It re-fires on UPDATE too: a legitimate row can't be edited into an illegitimate one. This is the engine-level guard the stock-drill problem wished it had.",
    notes: [
      { choice: 2, why: "CHECK evaluates; it never rewrites. A −5 price errors out, it doesn't get corrected to 5." },
    ],
  },
  { id: "dr8-ct-08", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "SQLite's type system is famously loose: `price TEXT` would still store 89.99 somehow. Why declare REAL anyway?",
    choices: [
      "Affinity: REAL nudges inserted values toward numeric storage (89.99 stays a number, not TEXT '89.99'), keeping AVG/SUM arithmetic honest",
      "Types are pure decoration in SQLite",
      "REAL makes the column unique",
      "TEXT can't store numbers at all",
    ],
    answer: 0,
    why: "SQLite runs on type AFFINITY, not rigid types — a TEXT column would coerce most inputs to strings. Declaring REAL gives the column numeric affinity: 89.99 stores as a float, aggregates compute numerically, and ordering compares 9.99 < 89.99 numerically instead of '89.99' < '9.99' lexically. Types are contracts you declare, not straitjackets the engine enforces.",
    notes: [
      { choice: 1, why: "Affinity is loose but real — it decides storage class per value. Decoration would be if NOTHING changed, and ordering/aggregation differences are easy to demo." },
    ],
  },
  { id: "dr8-ct-09", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`CREATE TABLE region_stats (region TEXT PRIMARY KEY, customers INTEGER)` — a TEXT primary key over APAC/EU/LATAM/US. How does it behave?",
    choices: [
      "Legal and unique — a non-INTEGER PK creates a unique index instead of a rowid alias; region lookups search that index",
      "Illegal — PKs must be INTEGER",
      "Legal, and it becomes the rowid alias too",
      "Legal, but duplicates are allowed",
    ],
    answer: 0,
    why: "Any column (or column list) can be PRIMARY KEY — uniqueness is enforced via a unique index when the type isn't INTEGER PRIMARY KEY (the rowid-alias case). Four region rows, one per region, guaranteed. The lesson-64 hook lives in the OTHER case: only the INTEGER PK is the row's physical address.",
    notes: [
      { choice: 2, why: "Rowid-alias status is exclusive to INTEGER PRIMARY KEY (exact spelling matters — 'INT PRIMARY KEY' is close but not the alias)." },
    ],
  },

  // ---------- errors ----------
  { id: "dr8-ct-10", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`CREATE TABLE products (…)` errors with 'table products already exists'. What's the honest reading?",
    choices: [
      "The schema is corrupted",
      "CREATE TABLE is for NEW tables — the 9-table storefront already owns the name; use IF NOT EXISTS or a new name",
      "SQLite caps tables at 9",
      "The parens are mismatched",
    ],
    answer: 1,
    why: "Names are unique per database. `CREATE TABLE IF NOT EXISTS` makes re-runs idempotent (script-friendly, silently skips when present); otherwise pick a fresh name. sqlite_master is the receipt: 9 tables, products among them.",
    notes: [
      { choice: 2, why: "No such cap — the limit is disk and patience. The collision is the NAME, not the count." },
    ],
  },
  { id: "dr8-ct-11", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "You declared `supplier_id INTEGER REFERENCES supplers(id)` — typo'd parent. When does this bite?",
    choices: [
      "Immediately — CREATE TABLE fails",
      "Silently at CREATE (SQLite doesn't verify the parent at DDL time by default), then at INSERT/UPDATE time: 'foreign key mismatch' when the FK can't resolve",
      "Never — typos in FKs are ignored",
      "At the next VACUUM",
    ],
    answer: 1,
    why: "SQLite is famously permissive at DDL: the typo'd REFERENCES is accepted, and the pain arrives at write time when foreign_keys is ON and the target can't be matched — 'foreign key mismatch'. Read your DDL back with PRAGMA or sqlite_master; typos in contracts fail late, not loud.",
    notes: [
      { choice: 0, why: "Some engines validate parents at DDL; SQLite's default is trust-then-fail-at-write. The late failure is the trap." },
    ],
  },
  { id: "dr8-ct-12", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "After a CREATE, how do you READ BACK what the schema actually stored (columns, types, NOT NULL flags)?",
    choices: [
      "`PRAGMA table_info(products)` — or SELECT from pragma_table_info('products')",
      "`SELECT * FROM products` shows the DDL",
      "`DESCRIBE products;`",
      "`EXPLAIN products;`",
    ],
    answer: 0,
    why: "pragma_table_info is the receipt reader: one row per column with name, declared type, notnull flag, default. It's how the course verified the products columns (id PK notnull 0, the five NOT NULLs). DESCRIBE is MySQL spelling; EXPLAIN is for query plans, not schemas.",
    notes: [
      { choice: 1, why: "SELECT * shows DATA, not structure — an empty table shows no columns at all in most tools' output." },
    ],
  },

  // ---------- predict ----------
  { id: "dr8-ct-13", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "`CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL UNIQUE); INSERT INTO tags (label) VALUES ('sale'), ('sale');` — what happens?",
    choices: [
      "First insert lands (id 1), second fails — 'UNIQUE constraint failed: tags.label'",
      "Both land — UNIQUE is per-row",
      "Both fail — the table is fresh",
      "The second insert updates the first",
    ],
    answer: 0,
    why: "UNIQUE makes duplicates a constraint violation — the first row inserts (engine-assigned id 1), the second bounces with the constraint's name in the error. That's the same machinery the products' name-conflict drills ride; UNIQUE and PRIMARY KEY are siblings (UNIQUE allows NULLs in most engines, PK doesn't).",
    notes: [
      { choice: 1, why: "UNIQUE is per-COLUMN across rows — that's its entire job. Per-row uniqueness would be meaningless." },
    ],
  },
  { id: "dr8-ct-14", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A teammate proposes making every column NOT NULL 'for safety'. What's the sharpest counter-example from the storefront schema?",
    choices: [
      "orders.shipped_at TEXT — NULL is MEANINGFUL there (not shipped yet); forcing a value would fabricate fake ship dates",
      "products.price — obviously should be NOT NULL",
      "customers.id — PKs are already non-NULL",
      "None — all-NOT-NULL is best practice",
    ],
    answer: 0,
    why: "NULL is data when it means 'not yet / not applicable'. shipped_at = NULL distinguishes pending orders (14 of them) from shipped ones — a DEFAULT of '1970-01-01' or '' would poison every date filter and min/max. The lesson's judgment: constrain what must exist, leave honest holes nullable.",
    notes: [
      { choice: 3, why: "Blanket NOT NULL erases the three-valued logic that carrying statuses REQUIRES — the NULL lesson's whole point, now in DDL." },
    ],
  },
];
