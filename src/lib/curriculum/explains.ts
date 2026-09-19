// Explain-back — the reverse skill: read the SQL, say what it does.
//
// Writing SQL proves you can build; explaining it proves you UNDERSTAND.
// The learner writes a plain-English explanation and it's graded against
// concept groups — synonym sets a working analyst might use ("groups",
// "per city", "for each city" all count). Core concepts must all appear;
// bonus concepts earn a richer verdict. Rule-based, offline, and honest:
// the grader shows exactly which concepts it looked for.

export interface ConceptGroup {
  /** Canonical name shown in the feedback. */
  name: string;
  /** Any of these (case/punctuation-insensitive) satisfies the concept. */
  any: string[];
}

export interface ExplainItem {
  /** Stable id, e.g. "x1" — XP ledger key `explain:x1`. */
  id: string;
  title: string;
  sql: string;
  /** Concepts the explanation MUST hit, in course order. */
  core: ConceptGroup[];
  /** Nice-to-have nuance concepts — coverage shown, not required. */
  bonus?: ConceptGroup[];
  /** The model explanation shown after grading. */
  model: string;
  skill: string;
}

export const EXPLAIN_XP = 10;

export const EXPLAINS: ExplainItem[] = [
  {
    id: "x1",
    title: "The price ladder",
    sql: "SELECT name, price\nFROM products\nWHERE price > 100\nORDER BY price DESC;",
    core: [
      { name: "source — products", any: ["product"] },
      { name: "filter — over 100", any: [">100", "over 100", "above 100", "greater than 100", "more than 100", "expensive"] },
      { name: "projection — name and price", any: ["name", "price"] },
      { name: "sort — highest first", any: ["desc", "descending", "highest", "most expensive", "biggest", "largest", "top"] },
    ],
    bonus: [{ name: "row order is part of the output", any: ["order", "sorted", "ladder", "rank"] }],
    model:
      "Pull each product's name and price, keep only the rows priced over 100, and hand them back with the most expensive first — the DESC on price makes it a ladder from top to bottom.",
    skill: "where",
  },
  {
    id: "x2",
    title: "The pending meter",
    sql: "SELECT COUNT(*)\nFROM orders\nWHERE status = 'pending';",
    core: [
      { name: "source — orders", any: ["order"] },
      { name: "filter — status pending", any: ["pending"] },
      { name: "count the surviving rows", any: ["count", "how many", "number of", "tally"] },
    ],
    bonus: [{ name: "one row out — a scalar", any: ["one row", "single", "scalar"] }],
    model:
      "Count how many orders are currently sitting in 'pending' status. The WHERE gate runs first, then COUNT(*) collapses whatever survived into a single number.",
    skill: "aggregates",
  },
  {
    id: "x3",
    title: "The city buckets",
    sql: "SELECT city, COUNT(*) AS members\nFROM customers\nGROUP BY city;",
    core: [
      { name: "source — customers", any: ["customer"] },
      { name: "grouping — one bucket per city", any: ["group", "per city", "each city", "bucket", "by city"] },
      { name: "counting within each bucket", any: ["count", "how many", "number of", "members", "tally"] },
    ],
    bonus: [{ name: "grain changed — rows are cities now", any: ["grain", "one row per", "collapse"] }],
    model:
      "Sort the customers into one bucket per city, then count the members in each bucket. The output grain is cities — one row per distinct city with its head-count.",
    skill: "groupby",
  },
  {
    id: "x4",
    title: "The silent customers",
    sql: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;",
    core: [
      { name: "left join keeps ALL customers", any: ["left join", "all customer", "every customer", "even if", "even when", "without matching"] },
      { name: "the NULL test finds non-matches", any: ["is null", "null", "no match", "no order", "never order"] },
    ],
    bonus: [{ name: "anti-join vocabulary", any: ["anti-join", "anti join", "missing side", "unmatched"] }],
    model:
      "Left-join every customer to their orders so customers without any survive the join with NULLs on the order side; the IS NULL test then keeps exactly those — the customers who have never ordered. This shape has a name: an anti-join.",
    skill: "joins",
  },
  {
    id: "x5",
    title: "The big buckets only",
    sql: "SELECT status, SUM(total) AS value\nFROM orders\nGROUP BY status\nHAVING SUM(total) > 5000;",
    core: [
      { name: "grouping by status", any: ["group", "per status", "each status", "bucket"] },
      { name: "summing totals within buckets", any: ["sum", "total", "revenue", "add up"] },
      { name: "filtering GROUPS after aggregation", any: ["having", "after group", "after aggregat", "only group", "keep group"] },
    ],
    bonus: [{ name: "WHERE vs HAVING distinction", any: ["where filters rows", "not where", "having filters group"] }],
    model:
      "Bucket the orders by status, total each bucket, and then — only after the collapse — keep the buckets worth more than 5000. HAVING is WHERE's post-aggregation twin: WHERE can't see the sums because it runs before they exist.",
    skill: "groupby",
  },
  {
    id: "x6",
    title: "The dedupe lens",
    sql: "SELECT DISTINCT category\nFROM products;",
    core: [
      { name: "source — products", any: ["product"] },
      { name: "dedupe — each category once", any: ["distinct", "unique", "once", "dedupe", "duplicate", "no repeat"] },
    ],
    bonus: [{ name: "column list source", any: ["category column", "the categories"] }],
    model:
      "Read every product's category, then collapse the repeats so each distinct category appears exactly once — the value set behind any dropdown.",
    skill: "select",
  },
  {
    id: "x7",
    title: "The careful raise",
    sql: "UPDATE products\nSET price = price * 1.1\nWHERE category = 'Audio';",
    core: [
      { name: "it's a write, not a read", any: ["update", "change", "modify", "write", "raise", "increase"] },
      { name: "the raise is 10 percent", any: ["1.1", "10%", "10 percent", "ten percent"] },
      { name: "scoped to Audio rows only", any: ["audio", "where", "only"] },
    ],
    bonus: [{ name: "the WHERE discipline — no WHERE hits every row", any: ["without where", "all rows", "every row would", "safety"] }],
    model:
      "Raise the price of every Audio product by ten percent — price * 1.1 read from the row's own current value. The WHERE clause is the safety rail: drop it and the raise silently sweeps all sixteen products in every category.",
    skill: "writes",
  },
  {
    id: "x8",
    title: "The two-stage crown",
    sql: "SELECT name\nFROM products\nWHERE price = (SELECT MAX(price) FROM products);",
    core: [
      { name: "inner query finds the max price", any: ["inner", "subquery", "first finds", "max", "highest price", "maximum"] },
      { name: "outer query matches that price", any: ["outer", "then", "equal", "= that", "matches"] },
    ],
    bonus: [{ name: "ties would survive", any: ["tie", "both", "more than one"] }],
    model:
      "Two stages: the inner query computes the single highest price in the table, and the outer query returns whichever products are priced exactly at it. If two products tied at the top, both would come back.",
    skill: "subqueries",
  },
  {
    id: "x9",
    title: "The ranking that keeps its rows",
    sql: "SELECT name, price,\n       RANK() OVER (ORDER BY price DESC) AS price_rank\nFROM products;",
    core: [
      { name: "every product row survives", any: ["every", "all product", "each product", "still", "one row per", "no collapse"] },
      { name: "rank by price, highest = 1", any: ["rank", "position", "place", "1 =", "first"] },
      { name: "descending price order", any: ["desc", "descending", "highest first", "most expensive"] },
    ],
    bonus: [{ name: "window ≠ GROUP BY", any: ["window", "unlike group", "does not collapse", "keeps rows"] }],
    model:
      "Give every product a rank by price — most expensive is 1 — WITHOUT collapsing anything: a window function annotates each row instead of grouping them. Unlike GROUP BY, all sixteen products stay in the output, each wearing its rank.",
    skill: "windows",
  },
  {
    id: "x10",
    title: "The write with a receipt",
    sql: "INSERT INTO orders (customer_id, status, total, created_at)\nVALUES (7, 'pending', 129.99, '2025-03-01')\nRETURNING id;",
    core: [
      { name: "a new order row is created", any: ["insert", "new row", "new order", "add"] },
      { name: "the values become the row", any: ["value", "7", "129.99", "pending"] },
      { name: "returning hands back the id", any: ["returning", "back the id", "new id", "generated id"] },
    ],
    bonus: [{ name: "no SELECT needed afterwards", any: ["without select", "no second query", "in one step"] }],
    model:
      "Insert one new pending order for customer 7 at 129.99, and — thanks to RETURNING id — get the auto-assigned id straight back in the same statement, no follow-up SELECT required.",
    skill: "writes",
  },
];
