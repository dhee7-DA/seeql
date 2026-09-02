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
      expected: EXPECTED["l46-p4"],
    },
  ],
  takeaway: "ALTER edits the contract one operation at a time — ADD COLUMN backfills via its default, RENAME re-labels, DROP removes — while type and constraint changes need the full rebuild dance, and DROP TABLE outside a sandbox is the least reversible statement in SQL.",
};
