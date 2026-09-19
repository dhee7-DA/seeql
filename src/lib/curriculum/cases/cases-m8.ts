// Case batch M8 — Schema, Views & Beyond (lessons 45–49, 51), cs-1606…cs-1611.
// DDL-and-schema cases in the chip-rebuild format. Figures anchored to the
// live db where cited (orders.customer_id SCAN→SEARCH, month revenue
// 2024-07 = 1078.04).
import type { CaseStudy } from "./types";

export const casesM8: CaseStudy[] = [
  {
    id: "cs-1606",
    tier: "easy",
    topic: "d1",
    universe: "catalog",
    title: "The session contract",
    brief:
      "From: Backend. Re: auth storage.\n\nWe need a `sessions` table: one row per login, an auto-assigned id, a required link to the customer, an unguessable token that must always be present, and a created_at. Write the CREATE TABLE — the constraint contract IS the design review.",
    ask: "Create the sessions table with a surrogate key, a NOT NULL foreign key, and a mandatory token.",
    template: `CREATE TABLE sessions (
  {1} INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL {2} customers(id),
  token TEXT NOT NULL,
  created_at TEXT NOT NULL
);`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the surrogate key",
        why: "INTEGER PRIMARY KEY is SQLite's rowid alias — the auto-assigned, never-changing handle every row deserves. Naming it id is the convention the whole schema follows.",
      },
      {
        answer: "REFERENCES",
        kind: "keyword",
        label: "the foreign-key clause",
        why: "The inline form is column type then REFERENCES parent(pk) — one clause that makes the engine enforce that every session's customer actually exists. 'FOREIGN KEY' is the table-level spelling, not the inline one.",
      },
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the token's mandatory flag",
        why: "A session without a token authenticates nothing — the column is required, and NOT NULL is how the table says so. The constraint contract from lesson-45, applied.",
      },
    ],
    distractors: ["PRIMARY KEY", "FOREIGN KEY", "ON DELETE"],
    walkthrough:
      "Four lines, four contracts: the surrogate id (rowid alias, auto-assigned), the enforced relationship (REFERENCES customers(id)), and two NOT NULLs that make half-finished rows impossible. CREATE TABLE is the one statement where thinking about tomorrow is cheapest — every constraint added here is a bug class that can never be written, versus an app-side check that can be bypassed by any writer.",
  },
  {
    id: "cs-1607",
    tier: "medium",
    topic: "d2",
    universe: "catalog",
    title: "The schema evolves",
    brief:
      "From: Product. Re: clearance flag.\n\nMarketing wants to flag discontinued products without deleting them — history stays queryable. Add a `discontinued` flag column to products: integer, must always be 0 or 1 in spirit, existing rows should immediately read as NOT discontinued. Then the data team marks the sub-$10 items. Two statements, schema first.",
    ask: "Add the discontinued column (defaulting existing rows to 0), then flag products priced under 10.",
    template: `{1} TABLE products ADD COLUMN discontinued INTEGER NOT NULL {2} 0;
UPDATE products SET discontinued = {3} WHERE price < 10;`,
    slots: [
      {
        answer: "ALTER",
        kind: "keyword",
        label: "the schema-evolution verb",
        why: "Changing a table's shape is ALTER's job — ADD COLUMN is one of its paths. UPDATE changes row data; it can't add a column, and CREATE would build a second table.",
      },
      {
        answer: "DEFAULT 0",
        kind: "keyword",
        label: "the existing-rows answer",
        why: "A new NOT NULL column needs an answer for the 16 rows that already exist — DEFAULT 0 fills them with 'not discontinued' in the same breath. DEFAULT NULL would violate the NOT NULL you just wrote on the same line.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the flag value",
        why: "The flag is boolean-by-convention: 1 marks discontinued, 0 marks active. Flipping the pair flags everything EXCEPT the cheap items — a silent inversion no error will ever report.",
      },
    ],
    distractors: ["UPDATE", "DEFAULT NULL", "0"],
    walkthrough:
      "ALTER TABLE adds the column with DEFAULT 0 so all existing rows are born 'active'; the follow-up UPDATE sets discontinued = 1 exactly where price < 10. Schema change and data change are different verbs on different layers — the classic mix-up is reaching for UPDATE to do ALTER's job. And the DEFAULT clause is the migration story: without it, NOT NULL on a populated table is an instant error, because ALTER can't guess what the past rows should read.",
  },
  {
    id: "cs-1608",
    tier: "medium",
    topic: "d3",
    universe: "growth",
    title: "The saved lens",
    brief:
      "From: Growth board. Re: the monthly chart.\n\nEvery dashboard wants the same monthly revenue series — non-cancelled orders bucketed by month, rounded, newest-ready. Six dashboards re-typing this join-free aggregate is six chances for drift. Save it once as a VIEW named month_revenue; the chart then selects FROM the lens, filters its month, done.",
    ask: "Create the month_revenue view: non-cancelled revenue per month, rounded to 2 decimals.",
    template: `CREATE {1} month_revenue AS
SELECT SUBSTR(created_at, 1, 7) AS {2},
       ROUND(SUM(total), 2) AS revenue
FROM orders
WHERE status != {3}
GROUP BY month;`,
    slots: [
      {
        answer: "VIEW",
        kind: "keyword",
        label: "the saved-query object",
        why: "A VIEW stores the SELECT, not the data — every read re-runs it against live tables, so the chart can never drift from the truth. CREATE TABLE would snapshot data and go stale the moment an order lands.",
      },
      {
        answer: "month",
        kind: "keyword",
        label: "the bucket column's name",
        why: "SUBSTR(created_at, 1, 7) slices '2024-07-15' down to '2024-07' — and the alias month is what every consumer filters and groups by. The alias IS the view's public API.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the excluded status",
        why: "Revenue excludes cancelled orders — status != 'cancelled' keeps pending, shipped AND delivered. Filtering to 'delivered' would quietly understate every month by the in-flight money.",
      },
    ],
    distractors: ["TABLE", "year", "'delivered'"],
    walkthrough:
      "CREATE VIEW month_revenue AS … saves the query under a name; SUBSTR(created_at, 1, 7) is the month bucket; the != 'cancelled' gate keeps all real money. The board chart becomes SELECT revenue FROM month_revenue WHERE month = '2024-07' → 1078.04, verified against the live orders. When the definition needs to change, it changes in ONE place — the drift between six dashboards was the smell, and the view is the fix (lesson-47's reporting layer, exactly).",
  },
  {
    id: "cs-1609",
    tier: "hard",
    topic: "d4",
    universe: "funnel",
    title: "The scan that must become a search",
    brief:
      "From: Performance. Re: dashboard latency.\n\nEvery funnel query filters orders by customer — WHERE customer_id = ?. EXPLAIN QUERY PLAN says 'SCAN orders' for each one: all 103 rows read to find a handful, every time. Build the index that turns the scan into a search, and name it like the convention: idx_orders_customer.",
    ask: "Create the index on orders(customer_id) named idx_orders_customer.",
    template: `CREATE {1} idx_orders_customer
{2} orders ({3});`,
    slots: [
      {
        answer: "INDEX",
        kind: "keyword",
        label: "the object kind",
        why: "An INDEX is a sorted side-structure over a column — the thing that turns SCAN into SEARCH. A VIEW saves a query; an index saves LOOKUP TIME. Different tools, different bills.",
      },
      {
        answer: "ON",
        kind: "keyword",
        label: "the target table clause",
        why: "CREATE INDEX name ON table(columns) — the ON clause is not optional syntax garnish; it names the table the sorted copy serves.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the indexed column",
        why: "Index the column the WHERE filters by — customer_id. Indexing customer_name (a column orders doesn't even have) would build a perfect shortcut to nowhere.",
      },
    ],
    distractors: ["VIEW", "FROM", "customer_name"],
    walkthrough:
      "CREATE INDEX idx_orders_customer ON orders(customer_id) — and the plan flips: 'SCAN orders' becomes 'SEARCH orders USING INDEX idx_orders_customer (customer_id=?)', verified live in the lesson-48 3D scene (103 rows read vs 24 for customer 1). The trade is written in the same plan: every INSERT, UPDATE and DELETE on orders now maintains the sorted tree. Index the columns you FILTER by, not the ones you display — reads pay for the shortcut, writes pay the rent.",
  },
  {
    id: "cs-1610",
    tier: "medium",
    topic: "d5",
    universe: "growth",
    title: "The self-feeding counter",
    brief:
      "From: Data eng. Re: the numbers spine.\n\nReporting needs a spine of numbers 1 through 10 without a table to hold them. WITH RECURSIVE is the self-feeding query: an anchor row, a UNION ALL, and a step that reads the query's own output until the guard stops it. Build cnt(x) as 1..10 and count it.",
    ask: "Generate 1..10 with a recursive CTE named cnt and return its row count.",
    template: `WITH {1} cnt(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + {2} FROM cnt WHERE x < {3}
)
SELECT COUNT(*) FROM cnt;`,
    slots: [
      {
        answer: "RECURSIVE",
        kind: "keyword",
        label: "the self-feeding keyword",
        why: "WITH RECURSIVE is what licenses the CTE to read itself inside its own step — one keyword between WITH and the name. 'LOOP' doesn't exist in SQL; the recursion IS the loop.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the step size",
        why: "x + 1 walks integers one at a time: 1, 2, 3 … A step of 2 counts only the odds and hands back 5 rows — same query shape, half the spine, wrong census.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the guard ceiling",
        why: "WHERE x < 10 is the brake: the feed stops when the step would produce 11. Kill the guard and the recursion runs until the engine cuts it off — the infinite CTE is a rite of passage.",
      },
    ],
    distractors: ["LOOP", "2", "100"],
    walkthrough:
      "WITH RECURSIVE cnt(x): the anchor SELECT 1 plants the first row; UNION ALL feeds each result back in; x + 1 from cnt produces the next; WHERE x < 10 stops the machine at exactly ten rows. COUNT(*) reads the spine: 10. This is lesson-49's generator — the same shape that builds month spines for calendars and walks org charts that no table stores. Recursive SQL is a while-loop you can SELECT from.",
  },
  {
    id: "cs-1611",
    tier: "hard",
    topic: "dcap",
    universe: "month-close",
    title: "The reporting layer",
    brief:
      "From: Controller. Re: close checklist.\n\nCapstone the module: stand up the reporting lens the close runs on. One view — month_revenue, non-cancelled, by month, rounded. The close probe then asks one question of it: what did July 2024 book? Build the definition and mind the ledger — the money lives in orders.total, not in the invoices table.",
    ask: "Create the month_revenue view over orders and probe July 2024 from it.",
    template: `CREATE VIEW {1} AS
SELECT SUBSTR(created_at, 1, 7) AS {2},
       ROUND(SUM({3}), 2) AS revenue
FROM orders
WHERE status != 'cancelled'
GROUP BY month;

SELECT revenue FROM month_revenue WHERE month = '2024-07';`,
    slots: [
      {
        answer: "month_revenue",
        kind: "keyword",
        label: "the lens's name",
        why: "The view's name is its contract with every consumer — month_revenue says grain and measure in two words. The probe at the bottom must FROM exactly this name.",
      },
      {
        answer: "month",
        kind: "keyword",
        label: "the bucket alias",
        why: "SUBSTR(created_at, 1, 7) yields '2024-07' — aliased month, and GROUP BY month works because the alias is in scope. The probe's WHERE month = '2024-07' leans on the same name.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the revenue measure",
        why: "Order money lives in orders.total. amount_cents belongs to the INVOICES ledger — summing it here would report a different company. Same-shaped column list, different books.",
      },
    ],
    distractors: ["VIEW", "created_at", "amount_cents"],
    walkthrough:
      "The view materializes nothing and conceals everything: nine dashboards now share one definition of monthly revenue, and the close probe reads 1078.04 for 2024-07 — the verified non-cancelled July total. Using created_at raw would group by the full timestamp (one bucket per order — grain destroyed); amount_cents would cross the streams between the orders ledger and the invoices ledger. Schema, views, and one honest probe — the module in three slots.",
  },
];
