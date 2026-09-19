// Schema studio — modeling judgment drills.
//
// Querying is half the job; the other half is deciding what a table
// should LOOK like. Ten scenarios across four exercise kinds: spot the
// design smell, pick the key, choose the type, match the verb to the
// operation. Each item grades a single choice and coaches the why —
// the content stands on the course's own M8 (schema, views, indexes).

export interface StudioItem {
  /** Stable id, e.g. "d1" — XP ledger key `studio:d1`. */
  id: string;
  kind: "smell" | "key" | "type" | "verb";
  kindLabel: string;
  title: string;
  /** The scenario. May contain `code` and **bold** rich-text markers. */
  brief: string;
  choices: string[];
  answer: number;
  why: string;
  skill: string;
}

export const STUDIO_XP = 8;

export const STUDIO_ITEMS: StudioItem[] = [
  {
    id: "d1",
    kind: "key",
    kindLabel: "Pick the key",
    title: "The primary key for line items",
    brief:
      "A colleague designs `order_items` to record what was bought: each row is one product on one order, and the same product can legitimately appear twice on one order (two units, two rows). The columns: `order_id`, `product_id`, `quantity`, `unit_price`. What should the primary key be?",
    choices: [
      "A new surrogate `id INTEGER PRIMARY KEY` — let SQLite assign it",
      "`(order_id, product_id)` as a composite key",
      "`(order_id, product_id, quantity)` as a composite key",
      "No primary key — line items don't need one",
    ],
    answer: 0,
    why:
      "The same product can appear twice on one order, so (order_id, product_id) isn't unique — and adding quantity into the key makes no sense (two rows with the same everything except an id would collide the moment quantities match). A surrogate id is always unique, never changes, and doesn't encode business rules that will drift. Natural keys are for natural uniqueness; order lines don't have it.",
    skill: "schema",
  },
  {
    id: "d2",
    kind: "smell",
    kindLabel: "Spot the smell",
    title: "The comma catalog",
    brief:
      "A supplier table stores what each supplier provides as one column: `provides TEXT` holding values like `'cables, adapters, hubs'`. Queries keep using LIKE '%cables%' and keep being wrong. What's the design flaw?",
    choices: [
      "Repeating values packed in one column — 1NF violation; it needs a suppliers ↔ categories junction table",
      "The column should be named `provide_list`",
      "TEXT is the wrong type — it should be JSON",
      "Nothing: LIKE '%cables%' is the standard way to query lists",
    ],
    answer: 0,
    why:
      "A column that holds a LIST is a table pretending to be a spreadsheet cell. LIKE '%cables%' matches 'paracables' and misses 'Cables' — the string shape breaks every relational guarantee: no joins, no indexes on members, no referential integrity. First normal form says: atomic values, one per cell — the many-to-many relationship becomes its own junction table.",
    skill: "schema",
  },
  {
    id: "d3",
    kind: "smell",
    kindLabel: "Spot the smell",
    title: "The address triplets",
    brief:
      "The old `customers_v0` table has columns `address1`, `address2`, `address3` — “for people with several addresses.” The team wants to migrate. What's the right move?",
    choices: [
      "One `addresses` table with one row per address, foreign key to customers — repeating groups become rows",
      "Add `address4` through `address10` for headroom",
      "Keep three columns but make them nullable and document them",
      "Merge all three into one comma-separated column on migration",
    ],
    answer: 0,
    why:
      "Numbered columns are a repeating group wearing column names — the same 1NF violation as comma-packing, just wider. They cap out (what about the customer with four?), force NULL gymnastics ('which address is the primary?'), and make 'all addresses in Berlin' a three-way OR. The relational answer is rows: one address per row, and the relationship does the counting.",
    skill: "schema",
  },
  {
    id: "d4",
    kind: "type",
    kindLabel: "Choose the type",
    title: "Money as text",
    brief:
      "A scraped feed stores prices like `'€1.299,00'` into a TEXT column. The team then writes `SUM(price)` and gets… nothing useful. What's the fix?",
    choices: [
      "Store money in a numeric type (INTEGER cents like this course's books, or REAL) and format the currency only at the display edge",
      "Cast inside every query: SUM(CAST(price AS REAL))",
      "Keep TEXT but add an index on it",
      "Store a second column with the same number as text without symbols",
    ],
    answer: 0,
    why:
      "Types are contracts: TEXT prices can't be summed, ranged or compared numerically — '9' sorts after '10' in text-land. Casting per-query is a band-aid that breaks on the first messy row. The course's own convention is the strong answer: INTEGER cents (no float rounding surprises), with '€1.299,00' parsed ONCE at the pipeline edge, never stored.",
    skill: "schema",
  },
  {
    id: "d5",
    kind: "verb",
    kindLabel: "Match the verb",
    title: "DROP, DELETE, or ALTER?",
    brief:
      "Three cleanup requests arrive: (1) remove the `legacy_code` column from products; (2) remove all discontinued products' rows; (3) remove the whole `temp_import` table. Which verb pairs with which?",
    choices: [
      "ALTER TABLE products DROP COLUMN — DELETE FROM products WHERE … — DROP TABLE temp_import",
      "DELETE COLUMN — DROP ROWS — DELETE TABLE",
      "DROP TABLE products would do all three with WHERE clauses",
      "ALTER for all three — ALTER TABLE … REMOVE …",
    ],
    answer: 0,
    why:
      "Three verbs, three scopes: ALTER changes SCHEMA (the column), DELETE removes ROWS (with a WHERE — always), DROP removes the whole TABLE including its definition. Mixing them up is how 'delete the rows' becomes 'delete the table' — the sandbox rolls graded writes back, production won't.",
    skill: "schema",
  },
  {
    id: "d6",
    kind: "smell",
    kindLabel: "Spot the smell",
    title: "The stored total",
    brief:
      "An `order_summaries` table stores `order_total` next to the order's items — but it keeps drifting from `SUM(quantity * unit_price)` on order_items. The team re-runs a nightly 'fix' query. What's the underlying flaw?",
    choices: [
      "A stored derived value — the total is a function of other data, so it belongs in a query or a view, not a column",
      "The fix query should run every hour instead of nightly",
      "order_total should be REAL instead of INTEGER",
      "The items table should also store the order total per row",
    ],
    answer: 0,
    why:
      "Any column computable from other columns is a second copy of the truth, and two copies always drift. The nightly 'fix' isn't maintenance — it's a confession that the column shouldn't exist. Compute it on read (a view is perfect for this), or accept the reconciliation cost forever. This course's finance module stores cents and derives balances for exactly this reason.",
    skill: "schema",
  },
  {
    id: "d7",
    kind: "key",
    kindLabel: "Pick the key",
    title: "The foreign key on orders",
    brief:
      "Orders need to reference the customer who placed them. The `customers.id` column is `INTEGER PRIMARY KEY`. What goes on `orders`?",
    choices: [
      "`customer_id INTEGER NOT NULL REFERENCES customers(id)` — a foreign key column per relationship",
      "Store the customer's NAME on the order",
      "Store a comma-separated list of order ids on the CUSTOMER instead",
      "No reference — match orders to customers by ordering date",
    ],
    answer: 0,
    why:
      "The relationship lives on the many side: one column holding the parent's primary key, declared REFERENCES so the engine enforces that the customer exists. Storing the name breaks when names change (and duplicates); storing order-ids on the customer inverts the grain and packs a list into a cell again; date-matching is not a relationship at all.",
    skill: "schema",
  },
  {
    id: "d8",
    kind: "smell",
    kindLabel: "Spot the smell",
    title: "The index that never gets used",
    brief:
      "Queries against orders almost always filter `WHERE customer_id = ?`. The db has NO index on orders beyond the primary key. EXPLAIN QUERY PLAN shows 'SCAN orders' every time. What's the fix?",
    choices: [
      "CREATE INDEX idx_orders_customer ON orders(customer_id) — turn the scan into a SEARCH",
      "Add more RAM to the database",
      "Rewrite the queries to avoid WHERE",
      "VACUUM the table until the plan changes",
    ],
    answer: 0,
    why:
      "SCAN means: read all 103 rows to find the few you want — every time. An index on the filtered column is a sorted side-structure the engine can SEARCH (the plan literally switches to 'SEARCH orders USING INDEX'). The lesson-48 3D scene shows this exact trade: reads get a shortcut, writes pay rent on the tree.",
    skill: "schema",
  },
  {
    id: "d9",
    kind: "type",
    kindLabel: "Choose the type",
    title: "The status dropdown",
    brief:
      "Orders carry a status that can only be one of: 'pending', 'shipped', 'delivered', 'cancelled'. A teammate proposes TEXT with a CHECK constraint. Why is that the right call over a free TEXT column?",
    choices: [
      "CHECK turns the allowed values into a contract — typos and mystery statuses are rejected at write time",
      "TEXT with CHECK is faster than TEXT alone",
      "A free TEXT column is equally safe — the app validates anyway",
      "The status should be an INTEGER code with no constraint",
    ],
    answer: 0,
    why:
      "The database is the last line of defense: app validation can be bypassed, migrations can forget, but a CHECK constraint rejects 'shiped' forever, at write time, for every writer. The course's own status chaos ('bronze' vs 'BRONZE') is exactly what unchecked text becomes. INTEGER codes trade readability for nothing — you'd still need a lookup table to read them.",
    skill: "schema",
  },
  {
    id: "d10",
    kind: "smell",
    kindLabel: "Spot the smell",
    title: "The view that saves the join",
    brief:
      "Six dashboards all re-type the same three-table join between customers, orders and order_items — with tiny copy-paste drift between them. What's the schema-level fix?",
    choices: [
      "CREATE VIEW with the canonical join — every dashboard selects FROM the view and the drift dies",
      "Copy the join into a Python service instead",
      "Add a column to orders that already contains the joined result",
      "Tell each dashboard owner to write their own version",
    ],
    answer: 0,
    why:
      "A view is a saved SELECT the engine treats like a table: define the canonical join once, and every consumer gets the same grain, the same names, the same filters — schema changes now happen in one place. Lesson-47's reporting layer is exactly this: nine raw tables, one named lens.",
    skill: "schema",
  },
];
