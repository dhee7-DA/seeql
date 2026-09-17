// Fill drills for Module 1 (lessons 1-8 + capstone lesson 35).
//
// Golden example file — every fill here follows the contract:
//   - id "lN-fK" unique across the course
//   - template: SQL with {1}..{n} slot markers; the COMPLETED text must be
//     valid SQL that runs on the seed db (scripts/fill-audit.ts enforces it)
//   - answers[i] completes slot i+1; every answer must appear in chips;
//     answers pairwise distinct
//   - chips: 4-6 distinct options — correct ones + tempting distractors
//   - notes: per-slot coaching for the most tempting wrong chip
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 1 — Databases, tables & your storefront
  1: [
    {
      id: "l1-f1",
      prompt: "Pull every column of every row from the orders table.",
      template: "SELECT {1}\nFROM {2};",
      chips: ["*", "ALL", "orders", "customers", "products"],
      answers: ["*", "orders"],
      why: "`*` asks for every column, and orders is the table this storefront records purchases in. The statement reads top to bottom as \"give me everything the orders table has\".",
      notes: [
        { slot: 2, why: "customers is a real table here, but the brief asked for orders — reread the last noun of the instruction." },
        { slot: 1, why: "`ALL` is a real SQL keyword (it is the default duplicate mode), but it does not mean \"every column\" — `*` does." },
      ],
    },
    {
      id: "l1-f2",
      prompt: "Count how many customers the storefront has — one number, nothing else.",
      template: "SELECT {1}\nFROM {2};",
      chips: ["COUNT(*)", "SUM(*)", "customers", "orders", "ROWS(*)"],
      answers: ["COUNT(*)", "customers"],
      why: "COUNT(*) counts rows, so counting the rows of customers gives the customer total. SUM would try to add values together — it needs a numeric column and answers a different question.",
      notes: [
        { slot: 1, why: "SUM adds up values; it cannot count rows by itself and SUM(*) is not valid SQL." },
        { slot: 2, why: "You want the size of the customer list, so the rows being counted must come from customers." },
      ],
    },
    {
      id: "l1-f3",
      prompt: "List each supplier's name next to its region.",
      template: "SELECT {1}\nFROM {2};",
      chips: ["name, region", "name region", "name; region", "suppliers", "supplier"],
      answers: ["name, region", "suppliers"],
      why: "Columns in the SELECT list are separated by commas, and both live on the suppliers table. `name region` without the comma would be read as renaming name to region.",
      notes: [
        { slot: 1, why: "`name; region` ends the statement early — the semicolon is a statement terminator, not a separator." },
        { slot: 2, why: "The table is named suppliers (plural); there is no supplier table in this database." },
      ],
    },
    {
      id: "l1-f4",
      prompt: "This template names two columns you must fill from memory of the catalog: which column holds the product's id, and which holds its display name?",
      template: "SELECT {1}, {2}\nFROM products\nLIMIT 3;",
      chips: ["id", "name", "product_id", "title", "product_name"],
      answers: ["id", "name"],
      why: "The products table keys its rows with id and calls the display column name. product_id does exist — but on order_items, where it points back at products.id.",
      notes: [
        { slot: 2, why: "There is no title or product_name column here — this schema keeps it plain: name." },
      ],
    },
    {
      id: "l1-f5",
      prompt: "A teammate's report crashed with `no such column: ship_city`. Fill in the column that actually exists so it runs.",
      template: "SELECT id AS order_id, {1}, created_at\nFROM orders\nLIMIT 5;",
      chips: ["status", "ship_city", "city", "customer_name", "postal_code"],
      answers: ["status"],
      why: "orders tracks its lifecycle in status (delivered, pending, …) and the parcel hand-off in shipped_at — but it has no address columns at all. Address fields live on customers, one join away.",
      notes: [
        { slot: 1, why: "customer_name looks plausible but the name is on the customers table; reaching across tables is Module 2 territory." },
      ],
    },
  ],

  // Lesson 2 — SELECT & FROM — reading data
  2: [
    {
      id: "l2-f1",
      prompt: "Give the supplier's name column a friendlier output label: supplier_name.",
      template: "SELECT name AS {1}\nFROM suppliers;",
      chips: ["supplier_name", "supplier name", "suppliers_name", "'supplier_name'", "AS supplier_name"],
      answers: ["supplier_name"],
      why: "AS renames the output column; the alias is a bare identifier with no spaces. 'supplier_name' in single quotes would be a text literal, not a column label.",
      notes: [
        { slot: 1, why: "The alias must be one identifier — a space inside would need quoting, and the AS keyword already did the renaming." },
      ],
    },
    {
      id: "l2-f2",
      prompt: "From each line item, show the product bought and how many units — product first, then quantity.",
      template: "SELECT {1}\nFROM order_items;",
      chips: ["product_id, quantity", "quantity, product_id", "product_id quantity", "product_name, quantity"],
      answers: ["product_id, quantity"],
      why: "Two columns, comma-separated, in the order the brief asks for. order_items references products by product_id — the product's display name lives on the products table, not here.",
      notes: [
        { slot: 1, why: "Both column orders would run, but the brief said product first — and `product_id quantity` without a comma is a syntax error." },
      ],
    },
    {
      id: "l2-f3",
      prompt: "Show every column of the suppliers table, spelled out explicitly — no `*` shortcut.",
      template: "SELECT {1}\nFROM suppliers;",
      chips: ["id, name, region, rating", "id, name, city, rating", "id, name, region", "name, region, rating", "id, rating, name, region"],
      answers: ["id, name, region, rating"],
      why: "Suppliers carries exactly four columns: id, name, region and rating. Naming them explicitly documents intent and survives new columns being added later.",
      notes: [
        { slot: 1, why: "city belongs to customers, not suppliers — that chip would crash with `no such column: city`." },
      ],
    },
    {
      id: "l2-f4",
      prompt: "Compute a doubled price for each product, keeping the real price beside it.",
      template: "SELECT name, price, {1}\nFROM products\nLIMIT 4;",
      chips: ["price * 2", "price x 2", "price^2", "double(price)", "price * 2 AS double_price"],
      answers: ["price * 2 AS double_price"],
      why: "`*` multiplies, and AS names the computed column so the output has a readable header. The bare expression would still run but arrive with a cryptic auto-generated column name.",
      notes: [
        { slot: 1, why: "`price x 2` and `double(price)` are not SQL — there is no x operator and no double() function in SQLite." },
      ],
    },
    {
      id: "l2-f5",
      prompt: "Prove SQLite can compute without any table at all: make it return the number 2.",
      template: "SELECT {1};",
      chips: ["1 + 1", "1 + 1 FROM", "one + one", "SUM(1 + 1)"],
      answers: ["1 + 1"],
      why: "A SELECT with expressions and no FROM clause is legal in SQLite — the engine evaluates the expression and returns one row. Handy for testing math and functions.",
      notes: [
        { slot: 1, why: "`one + one` would be read as two unknown columns — identifiers, not numbers. Numbers are written as digits." },
      ],
    },
  ],

  // Lesson 3 — WHERE — filtering rows
  3: [
    {
      id: "l3-f1",
      prompt: "Keep only the orders that were delivered.",
      template: "SELECT id, total\nFROM orders\nWHERE {1};",
      chips: ["status = 'delivered'", "status != 'delivered'", "delivered = status", "status: 'delivered'", "status contains 'delivered'"],
      answers: ["status = 'delivered'"],
      why: "WHERE takes a boolean expression; `=` compares the status column to the text 'delivered' in single quotes. Text values always need quotes — unquoted delivered would be read as a column name.",
      notes: [
        { slot: 1, why: "`status: 'delivered'` and `contains` are not SQL comparison syntax; the equality operator is a single `=`." },
      ],
    },
    {
      id: "l3-f2",
      prompt: "Find keyboards — but only the ones under $100.",
      template: "SELECT name, price\nFROM products\nWHERE category = 'Keyboard' {1} price < 100;",
      chips: ["AND", "OR", "&&", "THEN", "BUT"],
      answers: ["AND"],
      why: "Both conditions must hold, so the clauses are joined with AND. OR would return every keyboard plus every cheap product of any category.",
      notes: [
        { slot: 1, why: "SQLite quirk: it does accept `&&` for AND — but AND is the keyword every other engine speaks; write the portable one." },
      ],
    },
    {
      id: "l3-f3",
      prompt: "List products whose name starts with “Lap”.",
      template: "SELECT name\nFROM products\nWHERE name {1};",
      chips: ["LIKE 'Lap%'", "LIKE Lap%", "MATCHES 'Lap%'", "STARTS 'Lap'", "GLOB 'Lap*'"],
      answers: ["LIKE 'Lap%'"],
      why: "LIKE matches text patterns; `%` stands in for any tail, so 'Lap%' catches Laptop Pro and Laptop Air alike. The pattern is quoted text, just like any string value.",
      notes: [
        { slot: 1, why: "SQLite also has GLOB, whose wildcard is `*` and matching is case-sensitive — a different (case-honest) tool than LIKE." },
      ],
    },
    {
      id: "l3-f4",
      prompt: "Some customers have no region on file. Find them — the rows where region is missing.",
      template: "SELECT name, city\nFROM customers\nWHERE {1};",
      chips: ["region IS NULL", "region = NULL", "region == NULL", "NULL region", "region IS NOT NULL"],
      answers: ["region IS NULL"],
      why: "NULL is “no value”, and comparing anything to it with `=` yields NULL — neither true nor false — so the row is dropped. The dedicated test IS NULL is the only reliable way to detect missing values.",
      notes: [
        { slot: 1, why: "`region = NULL` silently matches nothing, which is the classic NULL trap this lesson exists to teach." },
      ],
    },
    {
      id: "l3-f5",
      prompt: "Target two cities at once: Boston and Seattle.",
      template: "SELECT name, city\nFROM customers\nWHERE city {1} ('Boston', 'Seattle');",
      chips: ["IN", "=", "LIKE", "BETWEEN", "ANY"],
      answers: ["IN"],
      why: "IN tests membership in a list — city matches either value, replacing two OR comparisons. BETWEEN needs two bounds and LIKE needs a pattern; neither fits a value list.",
      notes: [
        { slot: 1, why: "`=` compares against exactly one value; a parenthesised list after it is a syntax error." },
      ],
    },
    {
      id: "l3-f6",
      prompt: "Fix this attempted report of big orders — the second column keeps crashing with `no such column`. Make it run.",
      template: "SELECT id, {1}\nFROM orders\nWHERE total > 400;",
      chips: ["status", "ship_city", "city", "customer_name", "postal_code"],
      answers: ["status"],
      why: "orders columns are id, customer_id, status, total and created_at — anything address-like lives on customers, not here. status is the real column that describes where each order stands.",
      notes: [
        { slot: 1, why: "customer_name looks plausible but the name is on the customers table; joining tables is Module 2 territory." },
      ],
    },
  ],

  // Lesson 4 — NULL — working with missing data
  4: [
    {
      id: "l4-f1",
      prompt: "A teammate hunted unshipped cancelled orders with `WHERE shipped_at = NULL` — it ran but returned zero rows. Fill both slots so the query actually finds them.",
      template: "SELECT id, status, total\nFROM orders\nWHERE shipped_at {1} AND status = {2};",
      chips: ["IS NULL", "= NULL", "IS NOT NULL", "'cancelled'", "cancelled"],
      answers: ["IS NULL", "'cancelled'"],
      why: "`= NULL` evaluates to unknown for every row — including the 21 unshipped ones — so IS NULL is the test that finds them, and `status = 'cancelled'` keeps the 7 of those that were cancelled. Text values always wear single quotes.",
      notes: [
        { slot: 1, why: "`= NULL` was the original bug — it can never be true, not even for NULL rows. IS NOT NULL is the opposite ask: the 82 orders that DID ship." },
        { slot: 2, why: "Unquoted cancelled is read as a column name and crashes — status values are text in single quotes." },
      ],
    },
    {
      id: "l4-f2",
      prompt: "Two numbers, one row: how many orders exist, and how many of them carry a ship date.",
      template: "SELECT COUNT(*) AS all_orders, COUNT({1}) AS with_ship_date\nFROM orders;",
      chips: ["shipped_at", "total", "created_at", "*", "status"],
      answers: ["shipped_at"],
      why: "COUNT(*) counts rows (103); COUNT(shipped_at) counts present values only (82). The 21-order gap is the unshipped pipeline — the lesson's missing-data metric.",
      notes: [
        { slot: 1, why: "total and created_at are never NULL here, so counting them returns 103 too — the counted column must be the one that can go missing: shipped_at." },
      ],
    },
    {
      id: "l4-f3",
      prompt: "List every order that HAS shipped — id, status and the ship date itself.",
      template: "SELECT id, status, shipped_at\nFROM orders\nWHERE {1};",
      chips: ["shipped_at IS NOT NULL", "shipped_at IS NULL", "shipped_at != NULL", "shipped_at = 'shipped'", "shipped_at EXISTS"],
      answers: ["shipped_at IS NOT NULL"],
      why: "IS NOT NULL is the dedicated 'a value exists' test — it keeps the 82 orders with a real ship date. `!= NULL` looks equivalent but yields unknown for NULL rows and matches nothing.",
      notes: [
        { slot: 1, why: "`shipped_at IS NULL` finds the 21 still-waiting orders — the complement of the ask. And EXISTS belongs to subqueries, not bare columns." },
      ],
    },
    {
      id: "l4-f4",
      prompt: "The pending-orders report shows a blank where the ship date should be. Fill in the function that substitutes a fallback, and the column to fall back to.",
      template: "SELECT id, {1}(shipped_at, {2}) AS ship_or_created\nFROM orders\nWHERE status = 'pending';",
      chips: ["COALESCE", "ROUND", "created_at", "shipped_at", "total"],
      answers: ["COALESCE", "created_at"],
      why: "COALESCE walks its arguments left to right and returns the first non-NULL one — for the 14 pending orders shipped_at is NULL, so created_at steps in as the fallback date.",
      notes: [
        { slot: 1, why: "ROUND trims floats; it has no fallback logic. The first-non-NULL function is COALESCE (IFNULL is its two-argument twin)." },
        { slot: 2, why: "Falling back to shipped_at itself substitutes NULL for NULL — the fallback must be a column that is actually filled, like created_at." },
      ],
    },
    {
      id: "l4-f5",
      prompt: "Turn the lesson's gap into a metric: one number — orders placed but never shipped.",
      template: "SELECT COUNT(*) - COUNT({1}) AS still_waiting\nFROM {2};",
      chips: ["shipped_at", "total", "orders", "order_items", "customers"],
      answers: ["shipped_at", "orders"],
      why: "COUNT(*) counts all 103 rows while COUNT(shipped_at) counts only the 82 with a ship date — the subtraction leaves 21: the 14 pending plus 7 cancelled orders still waiting.",
      notes: [
        { slot: 1, why: "total is never NULL, so COUNT(total) is 103 and the metric reads 0 — subtraction only measures missingness on a nullable column." },
        { slot: 2, why: "order_items has no shipped_at column — the metric lives on orders." },
      ],
    },
  ],

  // Lesson 5 — ORDER BY & LIMIT — sorting and top-N
  5: [
    {
      id: "l5-f1",
      prompt: "A teammate's 'top 5 orders' report came back with the five SMALLEST totals. Fix the sort direction and the cap.",
      template: "SELECT id, total\nFROM orders\nORDER BY total {1}\nLIMIT {2};",
      chips: ["DESC", "ASC", "5", "10", "TOP 5"],
      answers: ["DESC", "5"],
      why: "Ascending puts the cheapest on top — DESC ranks biggest first and LIMIT 5 caps the sorted list. Sort first, cap second: that pairing is the top-N pattern.",
      notes: [
        { slot: 1, why: "ASC is the default that produced the five smallest — 'most expensive' needs DESC." },
        { slot: 2, why: "The brief asks for five; LIMIT 10 would ship a top-ten instead." },
      ],
    },
    {
      id: "l5-f2",
      prompt: "Directory view: customers by region A→Z, and within each region the newest signup first.",
      template: "SELECT name, region, created_at\nFROM customers\nORDER BY region {1}, created_at {2};",
      chips: ["ASC", "DESC", "UP", "DOWN"],
      answers: ["ASC", "DESC"],
      why: "Keys apply left to right, each with its own direction: region ASC lays out APAC before US, and created_at DESC lifts the latest signup to the top of every regional block.",
      notes: [
        { slot: 1, why: "DESC here would run the regions Z→A — the first key's direction decides which region leads, and the brief said A→Z." },
        { slot: 2, why: "Without DESC each regional block shows its OLDEST signup — 'newest first' is the reverse direction." },
      ],
    },
    {
      id: "l5-f3",
      prompt: "Page two of the alphabetical customer roster: skip the first five names, return the next five.",
      template: "SELECT name, city\nFROM customers\nORDER BY name\nLIMIT 5 {1} 5;",
      chips: ["OFFSET", "SKIP", "AFTER", "OFFSET BY", "FROM"],
      answers: ["OFFSET"],
      why: "OFFSET skips rows after the sort has run: LIMIT 5 OFFSET 5 returns names six to ten — page 2 of a 5-per-page pager over 16 customers.",
      notes: [
        { slot: 1, why: "SKIP reads naturally but isn't SQL — SQLite spells the skip keyword OFFSET, and it always follows the LIMIT." },
      ],
    },
    {
      id: "l5-f4",
      prompt: "Sorting the sale-price report crashes with `no such column: discount_price` — the alias was actually named something else. Reference the real one.",
      template: "SELECT name, price * 0.9 AS sale_price\nFROM products\nORDER BY {1}\nLIMIT 3;",
      chips: ["sale_price", "discount_price", "sale price", "price * 0.9", "AS sale_price"],
      answers: ["sale_price"],
      why: "ORDER BY is the one clause that runs after SELECT, so aliases are visible to it — and this alias is spelled sale_price. The reference sorts the computed column without recomputing it.",
      notes: [
        { slot: 1, why: "`price * 0.9` would actually run — it re-derives the value instead of using the alias the SELECT already created. And `sale price` with a space isn't one identifier." },
      ],
    },
    {
      id: "l5-f5",
      prompt: "The three biggest orders still pending — filter first, then rank and cap.",
      template: "SELECT id, total\nFROM orders\nWHERE status = {1}\nORDER BY total DESC\nLIMIT {2};",
      chips: ["'pending'", "pending", "'shipped'", "3", "5"],
      answers: ["'pending'", "3"],
      why: "WHERE trims the 103 orders to the 14 pending ones; only then do sort and LIMIT rank the survivors — the biggest pending order tops out at 1088.44.",
      notes: [
        { slot: 1, why: "Unquoted pending is read as a column name — status values are text in single quotes." },
        { slot: 2, why: "The brief says three; LIMIT 5 hands back a top-five." },
      ],
    },
  ],

  // Lesson 6 — DISTINCT — the uniqueness lens
  6: [
    {
      id: "l6-f1",
      prompt: "The order lifecycle in one clean list: show each status value once.",
      template: "SELECT {1} status\nFROM orders;",
      chips: ["DISTINCT", "UNIQUE", "DISTINCT ON", "ONLY", "SINGLE"],
      answers: ["DISTINCT"],
      why: "DISTINCT collapses the 103 order rows into the four status values that exist — cancelled, delivered, pending, shipped. One keyword turns transactional noise into the value set.",
      notes: [
        { slot: 1, why: "UNIQUE is a table constraint, not a SELECT keyword; DISTINCT ON is PostgreSQL-only — plain DISTINCT runs everywhere." },
      ],
    },
    {
      id: "l6-f2",
      prompt: "Fill a supplier-filter dropdown: every region we buy from, one row each, laid out A→Z. The sort column is already set — pick the deduped column and the direction.",
      template: "SELECT DISTINCT {1}\nFROM suppliers\nORDER BY region {2};",
      chips: ["region", "name", "rating", "ASC", "DESC"],
      answers: ["region", "ASC"],
      why: "Six suppliers share just four region values — APAC, EU, LATAM, US — and DISTINCT collapses the repeats; ascending order presents the dropdown alphabetically.",
      notes: [
        { slot: 1, why: "name would list all six suppliers — a dropdown wants the value SET, and the column being deduped here is region." },
        { slot: 2, why: "DESC presents the dropdown backwards — alphabetical is ASC, the default direction." },
      ],
    },
    {
      id: "l6-f3",
      prompt: "Prove how many different customers have ever ordered — one number, derived from order behavior.",
      template: "SELECT COUNT({1} customer_id) AS buyers\nFROM {2};",
      chips: ["DISTINCT", "ALL", "orders", "customers", "order_items"],
      answers: ["DISTINCT", "orders"],
      why: "DISTINCT inside the aggregate collapses 103 order rows to the unique buyers before counting: 16 customers have placed at least one order. The orders table is the behavioral source.",
      notes: [
        { slot: 1, why: "ALL is the default duplicate mode — it counts 103 orders, not distinct buyers." },
        { slot: 2, why: "customers counts signups; the brief wants buying behavior proven from orders — the two only agree here because every customer has ordered." },
      ],
    },
    {
      id: "l6-f4",
      prompt: "The city–region pair list crashes in strict engines: `for SELECT DISTINCT, ORDER BY expressions must appear in select list`. Sort by a column the query actually returns.",
      template: "SELECT DISTINCT city, region\nFROM customers\nORDER BY {1};",
      chips: ["city", "name", "email", "id", "active"],
      answers: ["city"],
      why: "A DISTINCT result may only be sorted by columns it returned — city is in the SELECT list, so ORDER BY city runs everywhere. The store's 16 customers live in 16 distinct cities, so all 16 pairs survive the dedupe.",
      notes: [
        { slot: 1, why: "name, email and id never appear in the SELECT list — sorting a DISTINCT result by them is exactly what the error forbids (SQLite may tolerate it; portable SQL doesn't)." },
      ],
    },
    {
      id: "l6-f5",
      prompt: "Marketing's city list: the distinct cities of our ACTIVE customers only.",
      template: "SELECT DISTINCT {1}\nFROM customers\nWHERE active = {2};",
      chips: ["city", "region", "name", "1", "0"],
      answers: ["city", "1"],
      why: "WHERE runs before DISTINCT: the 14 active customers survive the filter first, then the dedupe collapses their cities into the set — 14 cities, one per active customer in this store.",
      notes: [
        { slot: 1, why: "region would dedupe down to 4 values — the brief asked for cities." },
        { slot: 2, why: "active = 0 selects the two churned customers — 1 is the flag for active." },
      ],
    },
  ],

  // Lesson 7 — Aggregates — COUNT, SUM, AVG, MIN, MAX
  7: [
    {
      id: "l7-f1",
      prompt: "The headline row: how many orders has the store taken, and what's the revenue?",
      template: "SELECT COUNT(*) AS order_count, {1}(total) AS revenue\nFROM {2};",
      chips: ["SUM", "AVG", "COUNT", "orders", "customers"],
      answers: ["SUM", "orders"],
      why: "SUM(total) adds every order's total — 34833.28 across 103 orders — while COUNT(*) supplies the order count; two aggregates share one summary row.",
      notes: [
        { slot: 1, why: "AVG would divide revenue by order count — the brief wants the whole sum, not the mean." },
        { slot: 2, why: "customers carries no total column — the money lives on orders." },
      ],
    },
    {
      id: "l7-f2",
      prompt: "How much of one product does a typical order line buy? Average the units, rounded for the report.",
      template: "SELECT ROUND(AVG({1}), 2) AS avg_qty\nFROM {2};",
      chips: ["quantity", "total", "unit_price", "order_items", "orders"],
      answers: ["quantity", "order_items"],
      why: "order_items is the line-level table where quantity lives: AVG over its lines comes to 1.98 units, and ROUND(x, 2) trims the long float tail SQLite loves to grow.",
      notes: [
        { slot: 1, why: "total measures order value, not units per line — the ask is the quantity column." },
        { slot: 2, why: "orders has no quantity column — the per-line count lives on order_items." },
      ],
    },
    {
      id: "l7-f3",
      prompt: "When did the store make its very first sale? One date, no sorting.",
      template: "SELECT {1}(created_at) AS first_order\nFROM orders;",
      chips: ["MIN", "MAX", "COUNT", "SUM", "FIRST"],
      answers: ["MIN"],
      why: "MIN works on text too: ISO dates like '2024-01-01' compare chronologically as strings, so MIN(created_at) is the store's first order date — no ORDER BY needed.",
      notes: [
        { slot: 1, why: "MAX walks the other end of the envelope — it returns the LATEST date. FIRST isn't a function SQLite offers." },
      ],
    },
    {
      id: "l7-f4",
      prompt: "The shipping KPI should count orders that have a ship date — and the export's column is literally headed `COUNT(*)`. Fix the counted column and give the column its proper heading.",
      template: "SELECT COUNT({1}) {2} shipped\nFROM orders;",
      chips: ["shipped_at", "*", "AS", "ALIAS", "total"],
      answers: ["shipped_at", "AS"],
      why: "COUNT(shipped_at) counts the 82 rows where a ship date exists, skipping NULLs, and AS names the output column 'shipped' instead of the miserable literal `COUNT(*)` heading.",
      notes: [
        { slot: 1, why: "`*` counts rows (103) — the KPI wants present ship dates, so the nullable column goes inside the COUNT." },
        { slot: 2, why: "ALIAS isn't SQL — the rename keyword is AS." },
      ],
    },
    {
      id: "l7-f5",
      prompt: "The price envelope in one row: the cheapest product and the priciest.",
      template: "SELECT MIN(price) AS floor_price, {1}(price) AS ceil_price\nFROM {2};",
      chips: ["MAX", "MIN", "AVG", "products", "orders"],
      answers: ["MAX", "products"],
      why: "MIN and MAX form the column's envelope — 14.99 to 199.99 — sitting side by side on the single summary row the products table collapses into.",
      notes: [
        { slot: 1, why: "MIN twice would report the floor twice — the ceiling is MAX's job." },
        { slot: 2, why: "orders has no price column — the envelope is over the catalog, products." },
      ],
    },
  ],

  // Lesson 8 — GROUP BY & HAVING — buckets and gates
  8: [
    {
      id: "l8-f1",
      prompt: "One row per order status, biggest bucket first.",
      template: "SELECT status, COUNT(*) AS n\nFROM orders\nGROUP BY {1}\nORDER BY n {2};",
      chips: ["status", "customer_id", "total", "ASC", "DESC"],
      answers: ["status", "DESC"],
      why: "GROUP BY status builds one bucket per lifecycle value, and ORDER BY n DESC ranks them delivered (52), shipped (30), pending (14), cancelled (7). Every SELECT column is grouped or aggregated — the strictest rule in SELECT-land, kept.",
      notes: [
        { slot: 1, why: "GROUP BY customer_id would build 16 customer buckets — the brief wants one row per status." },
        { slot: 2, why: "ASC surfaces the tiniest bucket first — 'biggest first' is DESC." },
      ],
    },
    {
      id: "l8-f2",
      prompt: "The leaderboard: total spend per customer, biggest spender on top.",
      template: "SELECT customer_id, SUM(total) AS spend\nFROM orders\nGROUP BY {1}\nORDER BY {2} DESC;",
      chips: ["customer_id", "status", "total", "spend", "COUNT(*)"],
      answers: ["customer_id", "spend"],
      why: "Each customer's orders collapse into one bucket and SUM adds the bucket up — customer 1 leads at 7262.35 across 24 orders. ORDER BY may use the alias spend because it runs after SELECT.",
      notes: [
        { slot: 1, why: "Bucketing by status would rank lifecycle stages, not customers — the per-customer question groups by customer_id." },
        { slot: 2, why: "total isn't in the SELECT list — the summed column wears the alias spend, and the alias is what sorts." },
      ],
    },
    {
      id: "l8-f3",
      prompt: "The crowded-status report crashed with `misuse of aggregate function COUNT()` — the gate sat in WHERE, which runs before buckets exist. Move the gate and keep the bar: statuses with MORE THAN 10 orders.",
      template: "SELECT status, COUNT(*) AS n\nFROM orders\nGROUP BY status\n{1} COUNT(*) > {2};",
      chips: ["HAVING", "WHERE", "FILTER", "10", "3"],
      answers: ["HAVING", "10"],
      why: "HAVING is the gate for buckets: it tests COUNT(*) after grouping, keeping delivered (52), shipped (30) and pending (14) while cancelled's 7 falls out. WHERE can't see aggregates — it runs before they exist.",
      notes: [
        { slot: 1, why: "WHERE after GROUP BY is a syntax error, and before GROUP BY no aggregate exists yet — the bucket gate is spelled HAVING." },
        { slot: 2, why: "'More than 10' is > 10 — the brief's number goes in verbatim." },
      ],
    },
    {
      id: "l8-f4",
      prompt: "Two gates in one query: customers whose DELIVERED revenue tops 2000.",
      template: "SELECT customer_id, ROUND(SUM(total), 2) AS spend\nFROM orders\nWHERE status = {1}\nGROUP BY customer_id\n{2} SUM(total) > {3}\nORDER BY spend DESC;",
      chips: ["'delivered'", "delivered", "HAVING", "WHERE", "2000", "20000"],
      answers: ["'delivered'", "HAVING", "2000"],
      why: "The two-gate pipeline in full: WHERE passes only delivered order rows into the buckets, then HAVING gates the buckets on their SUM — three customers survive the 2000 bar (3054.89, 2961.81, 2075.47).",
      notes: [
        { slot: 1, why: "Unquoted delivered is read as a column name — status values are text in single quotes." },
        { slot: 2, why: "WHERE after GROUP BY is a syntax error; testing a bucket's SUM is HAVING's job." },
        { slot: 3, why: "20000 keeps zero buckets — the threshold must match the brief." },
      ],
    },
    {
      id: "l8-f5",
      prompt: "Average order value per lifecycle stage: one row per status.",
      template: "SELECT status, {1}(total) AS avg_total\nFROM orders\nGROUP BY {2};",
      chips: ["AVG", "SUM", "COUNT", "status", "customer_id"],
      answers: ["AVG", "status"],
      why: "The aggregate runs inside each bucket: shipped orders average 399.89, cancelled just 164.64 — four buckets, one average each. status stays bare in the SELECT because it's the grouping column.",
      notes: [
        { slot: 1, why: "SUM would report each stage's whole revenue — the brief asks for per-order average value." },
        { slot: 2, why: "GROUP BY customer_id would build 16 customer buckets — the brief's buckets are statuses." },
      ],
    },
  ],

  // Lesson 35 — Case study capstone: Module 1's tools under one brief
  35: [
    {
      id: "l35-f1",
      prompt: "The founder's first ask: EU customers we can actually email — region EU, active flag on, alphabetical by name.",
      template: "SELECT name, city\nFROM customers\nWHERE region = {1} AND active = {2}\nORDER BY {3};",
      chips: ["'EU'", "EU", "1", "0", "name", "city"],
      answers: ["'EU'", "1", "name"],
      why: "Two conditions, one AND: region = 'EU' and active = 1 keep 7 of the 8 EU customers (one is dormant), and ORDER BY name lays the mailing list out alphabetically.",
      notes: [
        { slot: 1, why: "Unquoted EU is read as a column name — region values are text in single quotes." },
        { slot: 2, why: "active = 0 selects the churned two — 1 is the flag marketing wants." },
        { slot: 3, why: "city would alphabetize by city — the brief said by name." },
      ],
    },
    {
      id: "l35-f2",
      prompt: "The warehouse-depth report crashed with `no such column: units_in_stock` — the schema names that column something else. Fill the REAL column and the right tool for total units.",
      template: "SELECT {1}({2}) AS total_stock\nFROM products;",
      chips: ["SUM", "COUNT", "stock", "units_in_stock", "quantity"],
      answers: ["SUM", "stock"],
      why: "The column is stock, and SUM adds it across all 16 products — 2845 units on the shelves. COUNT(stock) would count 16 rows: 'how many products', a different question than 'how deep'.",
      notes: [
        { slot: 1, why: "COUNT would report 16 products, not units — depth is a summing question." },
        { slot: 2, why: "quantity lives on order_items, not products — the shelf-stock column is plain stock." },
      ],
    },
    {
      id: "l35-f3",
      prompt: "Cities served: how many DIFFERENT cities the customer base covers — proven from the data, not assumed.",
      template: "SELECT COUNT({1} city) AS cities_served\nFROM {2};",
      chips: ["DISTINCT", "ALL", "customers", "orders", "name"],
      answers: ["DISTINCT", "customers"],
      why: "DISTINCT inside COUNT collapses repeats before counting: 16 customers in 16 distinct cities, so the metric reports 16 — and the spelling guarantees it stays honest if two customers ever share a city.",
      notes: [
        { slot: 1, why: "ALL (the default) counts rows, not kinds — today the numbers agree, but the DISTINCT spelling is what proves it." },
        { slot: 2, why: "orders knows nothing about cities — the geographic footprint comes from customers." },
      ],
    },
    {
      id: "l35-f4",
      prompt: "The premium shelf: the five most expensive products, priciest first — with a name tiebreaker so the list is reproducible.",
      template: "SELECT name, price\nFROM products\nORDER BY price {1}, name\nLIMIT {2};",
      chips: ["DESC", "ASC", "5", "8", "OFFSET 5"],
      answers: ["DESC", "5"],
      why: "DESC puts the 199.99 Smart Watch S on top and the cap keeps five rows, down to the 89.99 keyboard — sorting by name second costs nothing and pins the order the day two prices tie.",
      notes: [
        { slot: 1, why: "ASC serves the five CHEAPEST — the premium shelf is the other end of the sort." },
        { slot: 2, why: "The brief asks for five; 8 would leak three more products onto the shelf." },
      ],
    },
    {
      id: "l35-f5",
      prompt: "The founder's last ask: crowded categories — buckets holding MORE THAN 2 products, alphabetical.",
      template: "SELECT category, COUNT(*) AS product_count\nFROM products\nGROUP BY {1}\n{2} COUNT(*) > {3}\nORDER BY category;",
      chips: ["category", "price", "HAVING", "WHERE", "2", "3"],
      answers: ["category", "HAVING", "2"],
      why: "The full bucket pipeline: GROUP BY category builds seven buckets, HAVING gates them on their own COUNT, and Accessories, Audio and Electronics — 3 products each — clear the > 2 bar.",
      notes: [
        { slot: 1, why: "Bucketing by price would build a bucket per price point — the founder's buckets are categories." },
        { slot: 2, why: "WHERE can't test COUNT — it runs before buckets exist; HAVING is the bucket gate." },
        { slot: 3, why: "'More than 2' is > 2 — writing 3 changes the boundary the brief specified." },
      ],
    },
  ],
};
