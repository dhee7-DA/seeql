// Keyword Mastery bank — Subqueries MCQs, part I (derived tables kb-dt-q01..q15).
// Facts probed via scripts/m4-facts{,2}.ts: spend derived top5 Alice 7262.35 /
// Emma 6640.56 / Grace 4574.23 / Maya 3644.56 / Chloe 2667.93, >2000 = 5,
// category averages (Wearables 139.50 … Accessories 27.49), two-derived join
// (EU 8/15089.23 … LATAM 1/852.44), buckets heavy 4 / steady 1 / light 11,
// avg 2.4369 items per order, SQLite tolerates alias-less derived tables,
// scalar-from-derived (orders above avg-of-per-customer-maxes) = 13.
import type { Mcq } from "../types";

export const subqueryMcqsI: Mcq[] = [
  {
    id: "kb-dt-q01", difficulty: "easy",
    prompt: "What is a derived table?",
    choices: [
      "A subquery in the FROM clause whose result the outer query treats as a table",
      "A stored view created with CREATE VIEW",
      "Any query with an aggregate",
      "A temporary physical table on disk",
    ],
    answer: 0,
    why: "Derived means built at query time: `FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id)` produces rows in memory that the outer query joins, filters, and projects like any table. Unlike a view, it has no name outside its query and evaporates when the query ends.",
  },
  {
    id: "kb-dt-q02", difficulty: "easy",
    prompt: "Which alias fact is TRUE for derived tables in SQLite?",
    choices: [
      "Portable SQL requires an alias (`FROM (…) d`) — SQLite happens to tolerate the omission, but every other engine demands it",
      "Aliases are optional everywhere",
      "SQLite requires aliases, Postgres does not",
      "Derived tables cannot have aliases",
    ],
    answer: 0,
    why: "The alias names the derived result for the outer query's references (d.spend, d.customer_id). SQLite quietly auto-names unnamed subqueries — a permissive extension; Postgres errors with 'subquery in FROM must have an alias'. Write the alias anyway: it is the portable contract.",
  },
  {
    id: "kb-dt-q03", difficulty: "medium",
    prompt: "Which query stages per-customer spend, then filters to whales in the OUTER query?",
    choices: [
      "SELECT c.name, d.spend FROM customers c INNER JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d ON d.customer_id = c.id WHERE d.spend > 2000",
      "SELECT name, SUM(total) spend FROM customers WHERE spend > 2000",
      "SELECT c.name FROM customers c WHERE SUM(o.total) > 2000",
      "SELECT customer_id, SUM(total) FROM orders WHERE spend > 2000 GROUP BY customer_id",
    ],
    answer: 0,
    why: "Stage one (the derived table) computes each customer's total; stage two joins it back to the directory and applies the 2000 threshold to the AGGREGATE. Filtering an aggregate in plain WHERE fails — the derived table promotes the aggregate to an ordinary column first. Five whales qualify.",
  },
  {
    id: "kb-dt-q04", difficulty: "easy",
    prompt: "kb-dt-q03's pattern returns how many customers above 2000 spend?",
    choices: ["3", "5", "8", "16"],
    answer: 1,
    why: "Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56, Chloe 2667.93 — five customers clear 2000. The derived table made their aggregates joinable and filterable in one clean pass.",
  },
  {
    id: "kb-dt-q05", difficulty: "medium",
    prompt: "Why stage the aggregation in a derived table instead of using HAVING?",
    choices: [
      "The derived table's aggregate becomes an ordinary column — joinable to other tables and reusable in WHERE, ORDER BY, even further joins",
      "HAVING is deprecated",
      "Derived tables run faster on every query",
      "HAVING cannot use SUM",
    ],
    answer: 0,
    why: "HAVING filters groups inside one aggregation. The derived-table form promotes the aggregate to a column: you can then JOIN it back to customers for names, filter with plain WHERE, sort by it, or combine with other staged results. It is the two-phase pattern: compute, then compose.",
  },
  {
    id: "kb-dt-q06", difficulty: "medium",
    prompt: "Two derived tables joined: per-region customer counts ⋈ per-region revenue. Which region shows 1 customer and 852.44 revenue?",
    choices: ["LATAM", "US", "APAC", "EU"],
    answer: 0,
    why: "The first derived table counts customers per region (LATAM: 1); the second sums order revenue per region (LATAM: 852.44). The join on region pairs them — LATAM is the store's smallest market. EU anchors the other extreme: 8 customers, 15089.23.",
  },
  {
    id: "kb-dt-q07", difficulty: "hard",
    prompt: "In the two-derived join, why does the counts side need no customer filter while the revenue side joins orders?",
    choices: [
      "Counting customers is directory-native (GROUP BY region on customers); revenue lives on orders, so its derivation must aggregate through the orders→customers join first",
      "Both sides need identical FROMs",
      "Revenue cannot be aggregated",
      "The counts side is illegal",
    ],
    answer: 0,
    why: "Each derived table is an independent query with its own joins: `SELECT region, COUNT(*) FROM customers GROUP BY region` needs no orders; `SELECT c.region, SUM(o.total) FROM orders o JOIN customers c … GROUP BY c.region` must hop the foreign key. Staging lets each side take its own shortest path before the final pairing.",
  },
  {
    id: "kb-dt-q08", difficulty: "medium",
    prompt: "Which query stages per-order line counts and keeps the biggest baskets?",
    choices: [
      "SELECT order_id, n FROM (SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id) d WHERE n = 4",
      "SELECT order_id, COUNT(*) FROM orders",
      "SELECT order_id FROM order_items WHERE COUNT(*) = 4",
      "SELECT order_id, n FROM (SELECT order_id, n FROM order_items) WHERE n > 4",
    ],
    answer: 0,
    why: "The derived table counts lines per order (the n column); the outer WHERE keeps the four-line baskets. Probed: several orders tie at the maximum of 4 items — ids 1, 6, 11, 15 among them. The average basket is 2.4369 lines, so 4-item carts are the outliers.",
  },
  {
    id: "kb-dt-q09", difficulty: "medium",
    prompt: "Bucket staging: order counts grouped into heavy (>=8), steady (5–7), light (<5). Which bucket holds exactly 1 customer?",
    choices: ["heavy", "steady", "light", "none"],
    answer: 1,
    why: "The distribution — 24, 17, 14, 13, 5, then a tail of small counts — puts the four heavies at >=8, the lone 5-order customer at 5 (steady), and eleven customers under 5 (light). The derived table computes counts first; the outer CASE-with-GROUP BY buckets the staged numbers.",
  },
  {
    id: "kb-dt-q10", difficulty: "hard",
    prompt: "Scalar-from-derived: `WHERE total > (SELECT AVG(t) FROM (SELECT MAX(total) AS t FROM orders GROUP BY customer_id))` compares each order against…",
    choices: [
      "The average of per-customer maximums — a higher bar than the plain average order (13 orders clear it)",
      "The plain average order total",
      "The maximum order",
      "Each customer's own average",
    ],
    answer: 0,
    why: "The inner derived table computes 16 customer maxima; the scalar averages them. That 'average of bests' (a summary of the heavy tail) exceeds the plain 338.19 — only 13 orders clear it. Derived tables compose inside scalar subqueries exactly as they do in FROM.",
  },
  {
    id: "kb-dt-q11", difficulty: "easy",
    prompt: "Which column-naming practice makes derived tables readable?",
    choices: [
      "Alias every computed column inside the subquery (SUM(total) AS spend) so the outer query references d.spend",
      "Leave computed columns unnamed",
      "Use the table's name",
      "Number the columns",
    ],
    answer: 0,
    why: "The inner alias becomes the derived table's column name; the outer query and the join conditions reference it. Unnamed expressions force positional or engine-generated names — fragile and unreadable. Name at the boundary, alias at the table.",
  },
  {
    id: "kb-dt-q12", difficulty: "medium",
    prompt: "Per-category average price, derived: which shelf averages the highest?",
    choices: ["Wearables — 139.50", "Audio — 109.66", "Video — 84.50", "Electronics — 57.83"],
    answer: 0,
    why: "The derived table (SELECT category, AVG(price) … GROUP BY category) ranks the seven shelves: Wearables 139.50 tops the list, Accessories 27.49 bottoms it. Joining the derived averages back to products adds per-shelf product counts — Wearables has just 2 products.",
  },
  {
    id: "kb-dt-q13", difficulty: "hard",
    prompt: "Why can the derived category-average table join back to products WITHOUT changing each product's price test?",
    choices: [
      "The derived table holds ONE row per category (GROUP BY collapsed it), so the join is 1:1 per category — no fan-out",
      "Because prices are unique",
      "Because categories are unique per product",
      "It does fan out — that is a bug",
    ],
    answer: 0,
    why: "Grain discipline: the derived table's grain is category (one row each), products carry one category each, so the join never multiplies rows. Derive at the grain you will join at — the same lesson as join fan-out, applied to staged aggregates.",
  },
  {
    id: "kb-dt-q14", difficulty: "medium",
    prompt: "Correlated test vs derived join for 'products above category average': both return 7. When SHOULD you prefer the derived form?",
    choices: [
      "When the same staged average feeds multiple consumers (filters, sorts, further joins) or the tables are large enough that per-row re-aggregation hurts",
      "Never — correlation is always better",
      "Only in MySQL",
      "Only when the answer differs",
    ],
    answer: 0,
    why: "One staging pass, many uses: the derived table computes averages once and the outer query joins/filters/sorts against the materialized result. Correlation recomputes per row and answers one question per query. Same 7 rows, different engineering profiles.",
  },
  {
    id: "kb-dt-q15", difficulty: "easy",
    prompt: "Which census keyword do these items belong to?",
    choices: [
      "Derived tables — subqueries staged in FROM",
      "Scalar subqueries",
      "WITH (CTE)",
      "Views",
    ],
    answer: 0,
    why: "The taxonomy's derived-table matcher fires on FROM (SELECT… in SQL or 'derived table/inline view' prose. CTEs (WITH … AS) stage the same way but carry a name and different syntax — a separate keyword row. Views are persisted; derived tables are per-query.",
  },
];
