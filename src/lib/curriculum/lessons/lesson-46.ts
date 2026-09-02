import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson46: Lesson = {
  id: "lesson-46",
  num: 46,
  title: "ALTER & DROP — schema evolution",
  blurb: "ADD COLUMN and the default backfill, RENAME COLUMN and RENAME TABLE, DROP COLUMN's modern arrival, DROP TABLE with the safety on — and why the sandbox is the only place dropping is fun",
  minutes: 10,
  blocks: [
    {
      kind: "p",
      text: "Tables are contracts, but requirements move: suppliers get phone numbers, customers join a loyalty tier, a table turns out to be misnamed. **ALTER TABLE** edits the contract in place — one operation per statement, each instant, because SQLite mostly edits the schema *catalog* rather than rewriting rows. **DROP** is the other direction: delete the object entirely. In this module the sandbox makes even that safe — the object comes back on rollback.",
    },
    { kind: "diagram", figure: "d2-alter-paths" },
    { kind: "h", text: "ADD COLUMN — and the quiet backfill" },
    {
      kind: "code",
      caption: "Every existing customer instantly has the new column",
      sql: `ALTER TABLE customers ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard';

SELECT tier, COUNT(*) AS n FROM customers GROUP BY tier;
-- standard | 16  ← the default reached backward to all existing rows`,
    },
    {
      kind: "bullets",
      items: [
        "One `ALTER TABLE … ADD COLUMN col type [constraints]` statement adds the column; it's metadata — instant even on a million rows.",
        "Existing rows read back as the DEFAULT for a default'd column, or NULL otherwise. There's no per-row rewrite to wait for — the default is applied on read.",
        "One catch the compiler enforces: `ADD COLUMN … NOT NULL` **requires** a constant DEFAULT — otherwise old rows would have no legal value.",
      ],
    },
    { kind: "h", text: "RENAME — columns and tables" },
    {
      kind: "code",
      caption: "Two spellings, one effect each",
      sql: `ALTER TABLE products RENAME COLUMN stock TO units_in_stock;
ALTER TABLE suppliers RENAME TO vendors;`,
    },
    {
      kind: "bullets",
      items: [
        "`RENAME COLUMN old TO new` fixes a naming mistake without touching data — every future query must use the new name immediately.",
        "`RENAME TABLE old TO new` (also `ALTER TABLE old RENAME TO new`) re-labels the object; SQLite keeps foreign-key references pointing correctly, but your SQL — views you wrote, saved queries, application code — needs updating by hand.",
      ],
    },
    { kind: "h", text: "DROP — with intent" },
    {
      kind: "bullets",
      items: [
        "`DROP TABLE name` removes the table and its data, atomically. `DROP COLUMN` arrived in SQLite 3.35 (2021) — modern engines can shed a column, though indexed or PK columns resist.",
        "The sandbox caveat is the safety feature: here DROP runs inside the grader's transaction and **everything comes back**. In production, DROP TABLE is the least reversible statement in SQL — backups and transactions are not optional.",
      ],
    },
    {
      kind: "warn",
      text: "SQLite has no `ALTER COLUMN TYPE` and no way to change constraints in place. Changing a column's type or editing a CHECK means the classic rebuild: create the corrected table, `INSERT INTO new SELECT … FROM old`, drop the old, rename the new — wrapped in a transaction. Tools like Prisma Migrate generate exactly this dance for you.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres ALTER is richer: `ALTER COLUMN … TYPE text` re-types in place, `SET / DROP NOT NULL`, `SET / DROP DEFAULT` all exist as one-liners. MySQL answers with `MODIFY COLUMN` / `CHANGE COLUMN` — same powers, different grammar.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite keeps ALTER deliberately small — ADD COLUMN, RENAME, DROP COLUMN (3.35+), DROP TABLE. Before 3.35, dropping a column required the full 12-step rebuild ritual, which is why 'SQLite can't drop columns' still haunts old Stack Overflow answers.",
    },
    {
      kind: "tip",
      text: "The introspection loop from lesson 45 is your feedback channel: run the ALTER, then `SELECT name FROM pragma_table_info('suppliers')` and look for the new column before you trust it. One statement, one check — no surprises.",
    },
  ],
  mcqs: [
    {
      id: "l46-q1",
      prompt: "`ALTER TABLE customers ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard'` — what do existing rows show for tier?",
      choices: [
        "NULL — the column didn't exist when they were inserted",
        "'standard' — the DEFAULT reaches all existing rows",
        "An error — rows can't gain values retroactively",
        "Empty strings",
      ],
      answer: 1,
      why: "SQLite applies the constant DEFAULT to existing rows on read — all 16 customers read back 'standard' immediately. Only a NOT NULL column without a default is refused, since old rows would have no legal value.",
      notes: [
        { choice: 0, why: "NULL is what happens WITHOUT a default. With a constant default, the value is defined for every row — that's precisely why the NOT NULL + DEFAULT pairing works." },
      ],
    },
    {
      id: "l46-q2",
      prompt: "Which ADD COLUMN does SQLite refuse?",
      choices: [
        "ADD COLUMN notes TEXT",
        "ADD COLUMN priority INTEGER DEFAULT 5",
        "ADD COLUMN locked INTEGER NOT NULL — no DEFAULT",
        "ADD COLUMN at TEXT DEFAULT '2026-01-01'",
      ],
      answer: 2,
      why: "NOT NULL without a constant default would strand existing rows — they'd have no value and nowhere to get one. Attach a DEFAULT (or leave the column nullable) and the ALTER goes through.",
      notes: [
        { choice: 1, why: "Constants — numbers, strings — are exactly what defaults may be on ADD COLUMN. It's the missing default on a NOT NULL column that's illegal." },
      ],
    },
    {
      id: "l46-q3",
      prompt: "You need a column to change from INTEGER to TEXT. What does SQLite offer?",
      choices: [
        "ALTER TABLE … ALTER COLUMN … TYPE",
        "ALTER COLUMN TYPE is a one-liner",
        "Nothing direct — rebuild: new table, INSERT INTO … SELECT, drop, rename",
        "UPDATE the column's type per row",
      ],
      answer: 2,
      why: "SQLite has no ALTER COLUMN TYPE. The portable recipe is the rebuild dance — and it's exactly what migration tools generate. Postgres and MySQL do have one-liner type changes, which is why this is a favorite dialect-trap question.",
      notes: [
        { choice: 0, why: "That spelling is Postgres's (`ALTER COLUMN … TYPE text`). SQLite parses a much smaller ALTER vocabulary — type changes aren't in it." },
      ],
    },
    {
      id: "l46-q4",
      prompt: "What does `DROP TABLE order_items` do inside this course's sandboxed grader?",
      choices: [
        "Permanently deletes the table — reset required",
        "Errors — DROP is disabled",
        "Drops it; the transaction rollback brings it back after grading",
        "Only empties the rows",
      ],
      answer: 2,
      why: "Every graded write runs inside BEGIN … ROLLBACK: the DROP really happens, the verify query confirms the object is gone from sqlite_master, and then the rollback restores it. In production there is no such undo.",
      notes: [
        { choice: 3, why: "Emptying rows is DELETE's job — DROP removes the table object itself: columns, constraints, data, all of it. That's why it's the heavyweight of the two." },
      ],
    },
    {
      id: "l46-q5",
      prompt: "Why is `ALTER TABLE … ADD COLUMN` instant even on a huge table?",
      choices: [
        "SQLite parallelizes the row rewrite",
        "It only edits the schema catalog — existing rows supply the new value on read via the default",
        "It defers the change until the next query",
        "It copies the table in the background",
      ],
      answer: 1,
      why: "The table's rows are untouched — the catalog gains a column entry, and rows that never stored that column read back the declared DEFAULT. The same logic explains why NOT NULL demands a constant default: it must be computable without touching rows.",
      notes: [
        { choice: 3, why: "No copy happens — that's the old rebuild path for type changes. The whole virtue of ADD COLUMN is that it's a catalog edit." },
      ],
    },
    {
      id: "l46-q6",
      prompt: "A view references `suppliers.region`. After `ALTER TABLE suppliers RENAME COLUMN region TO vendor_region`, what happens to the view?",
      choices: [
        "It breaks — queries against it fail with 'no such column'",
        "SQLite rewrites the view's stored definition to use the new name",
        "The view keeps the old name until manually rebuilt",
        "The view is dropped automatically",
      ],
      answer: 1,
      why: "Since SQLite 3.25, RENAME COLUMN (and RENAME TABLE) edits the stored text of every view and trigger that references the old name. The convenience layer survives the rename — that's why renames are considered safe operations while drops are not.",
      notes: [
        { choice: 0, why: "Breaking dependents was pre-3.25 behavior (and is still how DROP COLUMN thinks). Modern SQLite treats rename as a schema-wide consistent edit." },
      ],
    },
    {
      id: "l46-q7",
      prompt: "`ALTER TABLE customers ADD COLUMN email_copy TEXT UNIQUE` — why does SQLite refuse this?",
      choices: [
        "customers already has an email column",
        "ADD COLUMN cannot carry a UNIQUE (or PRIMARY KEY) constraint — uniqueness needs an index over the EXISTING rows, which ADD COLUMN won't build",
        "UNIQUE is only for CREATE TABLE",
        "TEXT columns can't be unique",
      ],
      answer: 1,
      why: "Uniqueness is enforced by a unique index, and building one means checking every existing row for duplicates — that's a table-wide operation, not an instant catalog edit. ADD COLUMN stays instant by refusing UNIQUE/PRIMARY KEY outright; create the UNIQUE INDEX separately if the data can pass it.",
      notes: [
        { choice: 2, why: "UNIQUE lives happily inside CREATE TABLE too — the refusal is specific to ADD COLUMN's instant-edit contract, not to where UNIQUE is allowed generally." },
      ],
    },
    {
      id: "l46-q8",
      prompt: "`ALTER TABLE products DROP COLUMN name` — besides being business madness, why would SQLite refuse it here?",
      choices: [
        "name is indexed or otherwise depended on — DROP COLUMN refuses columns that an index, view, trigger or the PK references",
        "name is too popular a column name",
        "TEXT columns can't be dropped",
        "DROP COLUMN needs a backup first",
      ],
      answer: 0,
      why: "DROP COLUMN (3.35+) is picky by design: if the column is a PK, sits inside any index, or is referenced by a view or trigger, the drop errors instead of stranding dependents. Columns that nothing points at — like our probed phone — drop cleanly.",
      notes: [
        { choice: 2, why: "Any column type can go — the refusal list is about DEPENDENTS, never about declared types. Affinity doesn't protect anything." },
      ],
    },
    {
      id: "l46-q9",
      prompt: "A cleanup script ends with `DROP TABLE IF EXISTS staging_tmp`. What did IF EXISTS buy?",
      choices: [
        "Faster drops",
        "A backup of the table before dropping",
        "Silence when the table's already gone — first run drops it, re-runs don't error",
        "It drops only the table's rows",
      ],
      answer: 2,
      why: "Bare DROP TABLE errors when the object is missing — fine for a deliberate drop, hostile for re-runnable scripts. IF EXISTS makes the statement idempotent: run it once or ten times, the end state is the same and no error interrupts the script.",
      notes: [
        { choice: 0, why: "No speed difference — IF EXISTS only changes what 'already missing' means: silence instead of an error. The drop itself is identical, and re-runnable scripts are the beneficiary." },
      ],
    },
    {
      id: "l46-q10",
      prompt: "The team needs products.price to become INTEGER cents. ALTER can't change types. What's the rebuild dance?",
      choices: [
        "UPDATE the column to integers until it complies",
        "CREATE new table with right contract → INSERT INTO … SELECT to copy → DROP old → RENAME new into place",
        "ALTER TYPE price INTEGER — SQLite 3.40 syntax",
        "VACUUM the table until the type changes",
      ],
      answer: 1,
      why: "Type and constraint changes are the one thing ALTER cannot do in place — the contract lives in the CREATE statement. The dance is four statements that production runs inside one transaction: build the right-shape table, copy the data across, remove the old, rename the new. Every migration framework is this pattern with logging.",
      notes: [
        { choice: 0, why: "UPDATE changes values, never the column's declared type — the schema text would still say REAL, and the affinity would keep accepting decimals." },
      ],
    },
    {
      id: "l46-q11",
      prompt: "After `ALTER TABLE orders RENAME TO orders_archive`, an old dashboard still queries `FROM orders`. What does it get?",
      choices: [
        "The archived table — renames leave aliases",
        "An empty orders table SQLite helpfully recreates",
        "Error: no such table: orders — a rename moves the name, it doesn't leave a forwarding address",
        "The orders view, if one exists",
      ],
      answer: 2,
      why: "RENAME is a move, not a symlink: the name 'orders' no longer resolves anywhere, so dependents must be updated (which SQLite does for views/triggers, but NOT for queries living in app code or dashboards). Renames are safe in the schema and still breaking at the edges — plan the deploy.",
      notes: [
        { choice: 0, why: "No alias is left behind — that's the difference between a rename and a view. Anything outside the schema that spelled the old name needs its own fix." },
      ],
    },
    {
      id: "l46-q12",
      prompt: "Why is there no `ALTER TABLE suppliers ADD COLUMN phone TEXT, RENAME COLUMN rating TO stars;` in SQLite?",
      choices: [
        "There is — commas separate ALTER operations",
        "The grammar allows one operation per ALTER TABLE statement; two changes are two statements",
        "Combined operations need a paid SQLite build",
        "Only RENAME supports combining",
      ],
      answer: 1,
      why: "Each ALTER TABLE carries exactly one operation — the grammar has no combined form. Two schema edits are two statements, which is a feature: each is instant, each is atomic, and each lands in the migration log as its own reviewable line.",
      notes: [
        { choice: 0, why: "Commas inside CREATE TABLE define columns — ALTER's grammar never gained the combined form. The one-operation rule keeps renames and adds independently reversible." },
      ],
    },
    {
      id: "l46-q13",
      prompt: "The order_items table has a FK to orders. After `ALTER TABLE orders RENAME TO orders_archive`, what do those FK references point at?",
      choices: [
        "Nothing — the FKs are orphaned and enforcement stops",
        "orders_archive — SQLite rewrites referencing FKs (and views/triggers) to follow the rename",
        "A ghost table named orders that SQLite keeps for compatibility",
        "They point at the table's rowid, which never changes",
      ],
      answer: 1,
      why: "Renames (3.25+) cascade through the schema's internal references: FK clauses in other tables, view definitions, trigger bodies — all rewritten to the new name. The schema stays internally consistent after a rename, which is what makes it the SAFE schema change (unlike drops, which SQLite won't cascade).",
      notes: [
        { choice: 0, why: "Orphaned FKs would poison every future write — SQLite explicitly edits the referencing text so enforcement continues seamlessly." },
      ],
    },
    {
      id: "l46-q14",
      prompt: "`ALTER TABLE products RENAME COLUMN stock TO units_in_stock` — what happens to the 16 stored stock values?",
      choices: [
        "They're wiped — the new column starts empty",
        "They survive untouched — a rename re-labels the column, it never rewrites data",
        "They're converted to NULL and back",
        "They move to a backup table",
      ],
      answer: 1,
      why: "RENAME is a metadata edit: the name in the catalog changes, the rows don't move, every value keeps its slot. That's why it's instant on any table size — contrast with the rebuild dance needed for TYPE changes, where data must be physically copied across the new contract.",
      notes: [
        { choice: 0, why: "Wiping on rename would make the safest ALTER the most destructive — it's the opposite: the ONLY data movement in this lesson's verbs is in your imagination." },
      ],
    },
  ],
  problems: [
    {
      id: "l46-p1",
      title: "Suppliers get phones",
      brief: "Add a nullable **phone** TEXT column to **suppliers** — no default, no NOT NULL (existing suppliers have unknown numbers). Verify expects the column to exist.",
      hints: [
        "One ALTER TABLE, one ADD COLUMN, the plainest form.",
        "Shape: ALTER TABLE suppliers ADD COLUMN phone TEXT;",
      ],
      difficulty: "easy",
      solution: "ALTER TABLE suppliers ADD COLUMN phone TEXT;",
      verify: "SELECT COUNT(*) AS n FROM pragma_table_info('suppliers') WHERE name = 'phone';",
      mistakes: [
        { test: "not null", message: "The brief says nullable — NOT NULL without a default would also be refused outright, since six existing suppliers would have no value." },
        { test: "default", message: "No default needed — unknown numbers should read NULL, not a fake placeholder like 'unknown' that then pollutes every query." },
        { test: "alter table suppliers column phone", message: "There's no COLUMN keyword after the table name — the spelling is ALTER TABLE suppliers ADD COLUMN phone TEXT; the ADD carries the COLUMN." },
      ],
      mutating: true,
      expected: EXPECTED["l46-p1"],
    },
    {
      id: "l46-p2",
      title: "The loyalty tier lands",
      brief: "Add **tier** TEXT **NOT NULL DEFAULT 'standard'** to **customers** — every existing customer must instantly read as 'standard'. The verify query groups by tier: expect one row, `standard | 16`.",
      hints: [
        "NOT NULL is allowed because you're also supplying a constant DEFAULT — that's the legal pairing.",
        "Shape: ALTER TABLE customers ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard';",
      ],
      difficulty: "medium",
      solution: "ALTER TABLE customers ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard';",
      verify: "SELECT tier, COUNT(*) AS n FROM customers GROUP BY tier;",
      mistakes: [
        { test: "tier text not null\\s*;|tier text not null$", message: "NOT NULL without a DEFAULT is refused on ADD COLUMN — the 16 existing rows would have no legal value. Pair it: NOT NULL DEFAULT 'standard'." },
        { test: "update customers set tier", message: "UPDATE can't add a column — the column must exist first. The ALTER does both jobs in one statement: adds the column and backfills the default." },
        { test: "default null", message: "DEFAULT NULL contradicts NOT NULL — the brief wants every customer to read 'standard', the loyalty program's entry rung." },
      ],
      mutating: true,
      expected: EXPECTED["l46-p2"],
    },
    {
      id: "l46-p3",
      title: "Stock, renamed honestly",
      brief: "The column `products.stock` is really a units-on-hand count. **RENAME COLUMN** it to **units_in_stock**, then prove it: the verify query reads `units_in_stock` for product 1 — expect 120.",
      hints: [
        "ALTER TABLE products RENAME COLUMN old TO new — no type, no data change, a pure re-label.",
        "Shape: ALTER TABLE products RENAME COLUMN stock TO units_in_stock;",
      ],
      difficulty: "medium",
      solution: "ALTER TABLE products RENAME COLUMN stock TO units_in_stock;",
      verify: "SELECT units_in_stock FROM products WHERE id = 1;",
      mistakes: [
        { test: "change column|modify column", message: "That's MySQL grammar — SQLite's spelling is RENAME COLUMN stock TO units_in_stock." },
        { test: "rename stock to units_in_stock\\s*;|alter table rename column", message: "The table name can't be skipped — every ALTER starts ALTER TABLE products, then the operation." },
        { test: "add column units_in_stock", message: "ADD would create a second, empty column next to stock — RENAME re-labels the existing one and keeps all 16 values." },
      ],
      mutating: true,
      expected: EXPECTED["l46-p3"],
    },
    {
      id: "l46-p4",
      title: "Drop the scaffold",
      brief: "The importer's staging table **order_items** is being replaced by a new pipeline (fictional, but the muscle is real): DROP the **order_items** table entirely. The verify query expects it gone from sqlite_master. This is the sandbox — the table returns after grading.",
      hints: [
        "DROP TABLE name — one statement, atomic, and here: reversible by rollback.",
        "Shape: DROP TABLE order_items;",
      ],
      difficulty: "hard",
      solution: "DROP TABLE order_items;",
      verify: "SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'order_items';",
      mistakes: [
        { test: "drop table (customers|orders|products|suppliers)", message: "Wrong table — the ticket targets order_items, the line-item scaffold. Dropping orders or products would trip FK dependencies in production." },
        { test: "delete from order_items", message: "DELETE empties the rows but the table object remains — sqlite_master would still show it. DROP removes the object itself." },
        { test: "\\bif exists\\b", message: "IF EXISTS silences the error when the table's already gone — reasonable in scripts, but here the table exists and the brief wants the plain DROP; keep the statement honest about what it expects." },
      ],
      mutating: true,
      expected: EXPECTED["l46-p4"],
    },
    {
      id: "l46-p5",
      title: "A notes margin for customers",
      brief: "Support wants to annotate customers. Add a nullable **notes** TEXT column to **customers** (no default — an absent note is a real absence), then the verify counts the columns: customers should widen from 7 to 8.",
      hints: [
        "One operation, one statement: ALTER TABLE … ADD COLUMN notes TEXT.",
        "Shape: ALTER TABLE customers ADD COLUMN notes TEXT; then SELECT COUNT(*) AS n FROM pragma_table_info('customers');",
      ],
      difficulty: "easy",
      solution: "ALTER TABLE customers ADD COLUMN notes TEXT;",
      verify: "SELECT COUNT(*) AS n FROM pragma_table_info('customers');",
      mistakes: [
        { test: "not\\s+null", message: "The brief says nullable — NOT NULL without a default would also be refused outright, since sixteen existing customers would have no legal value." },
        { test: "default\\s+''.|default\\s+''\\s*;", message: "DEFAULT '' fakes absence with an empty string — the missing marker is NULL, which is what a bare TEXT column gives every existing row." },
        { test: "alter\\s+table\\s+customers\\s+column", message: "No COLUMN keyword after the table name — the spelling is ADD COLUMN; the ADD carries it." },
      ],
      mutating: true,
      expected: EXPECTED["l46-p5"],
    },
    {
      id: "l46-p6",
      title: "Archive the orders table",
      brief: "The reporting migration renames **orders** to **orders_archive** in one statement. Verify by finding the new name in sqlite_master as a table.",
      hints: [
        "RENAME TO moves the whole object — columns, rows, indexes and all.",
        "Shape: ALTER TABLE orders RENAME TO orders_archive; then SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'orders_archive';",
      ],
      difficulty: "medium",
      solution: "ALTER TABLE orders RENAME TO orders_archive;",
      verify: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'orders_archive';",
      mistakes: [
        { test: "rename\\s+column\\s+orders", message: "RENAME COLUMN renames a column INSIDE a table — the table itself is RENAME TO, no COLUMN keyword." },
        { test: "create\\s+table\\s+orders_archive", message: "CREATE builds a sibling, then you'd copy rows and drop the original — a four-statement dance for what RENAME does in one catalog edit." },
        { test: "update.*rename|update\\s+sqlite_master", message: "Never write the catalog by hand — sqlite_master is SQLite's own ledger; ALTER is the sanctioned pen." },
      ],
      mutating: true,
      expected: EXPECTED["l46-p6"],
    },
    {
      id: "l46-p7",
      title: "Drop the rating column",
      brief: "Supplier ratings move to an external review service — the column is coming out. `ALTER TABLE suppliers DROP COLUMN rating`, then the verify counts the columns: 4 becomes 3.",
      hints: [
        "One statement, one drop — rating is referenced by no index or view here, so the drop sails through.",
        "Shape: ALTER TABLE suppliers DROP COLUMN rating; then SELECT COUNT(*) AS n FROM pragma_table_info('suppliers');",
      ],
      difficulty: "medium",
      solution: "ALTER TABLE suppliers DROP COLUMN rating;",
      verify: "SELECT COUNT(*) AS n FROM pragma_table_info('suppliers');",
      mistakes: [
        { test: "delete\\s+from\\s+suppliers", message: "DELETE empties rows — the column and its values would be re-created NULL on the next insert. DROP COLUMN removes the column itself from the contract." },
        { test: "update\\s+suppliers\\s+set\\s+rating\\s*=\\s*null", message: "NULLing keeps the column alive with holes — the ticket says the column is OUT, not empty. DROP is the verb." },
        { test: "drop\\s+table", message: "The table survives — only the rating column goes. DROP TABLE would take id, name and region down with it." },
      ],
      mutating: true,
      expected: EXPECTED["l46-p7"],
    },
    {
      id: "l46-p8",
      title: "The customer contract, before and after",
      brief: "Before any ALTER lands, snapshot the contract: list every column `name` of **pragma_table_info('customers')** ordered by `cid` — seven rows, the original shape that problem 5 will widen.",
      hints: [
        "The full column list, positional order — no WHERE, ORDER BY cid.",
        "Shape: SELECT name FROM pragma_table_info('customers') ORDER BY cid;",
      ],
      difficulty: "easy",
      solution: "SELECT name\nFROM pragma_table_info('customers')\nORDER BY cid;",
      ordered: true,
      mistakes: [
        { test: "select\\s+\\*\\s+from\\s+customers", message: "That returns 16 customer ROWS — the contract is the 7 column NAMES from pragma_table_info, one row per column." },
        { test: "where\\s+\"?notnull\"?\\s*=\\s*1", message: "This snapshot wants all seven columns — id's rowid-alias quirk (notnull reads 0) is part of the shape too." },
        { test: "order\\s+by\\s+name", message: "The contract's order is positional (cid), not alphabetical — alphabetical would bury id behind active and city." },
      ],
      expected: EXPECTED["l46-p8"],
    },
  ],
  takeaway: "ALTER edits the contract one operation at a time — ADD COLUMN backfills via its default, RENAME re-labels, DROP removes — while type and constraint changes need the full rebuild dance, and DROP TABLE outside a sandbox is the least reversible statement in SQL.",
};
