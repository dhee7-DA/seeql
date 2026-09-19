// Query golf — same result, fewer strokes.
//
// A "stroke" (see golf-score.ts) = one SQL clause keyword — subqueries
// included; a subquery's clauses cost exactly like top-level ones — plus
// the columns of the first select list (SELECT * bills the hole's
// starColumns; DISTINCT rides free with SELECT). The starter always
// returns the RIGHT answer verbosely; the par is the leanest correct
// shape we know. Every starter≡par equivalence was verified live against
// the seed db, and EXPLAIN QUERY PLAN step counts are shown as the
// engine's own measure of the work (receipts:
// tool-results/practice-banks-facts*.txt).

export interface GolfHole {
  /** Stable id, e.g. "g1" — XP ledger key `golf:g1`. */
  id: string;
  title: string;
  /** The business target the result must satisfy. */
  target: string;
  /** Correct-but-verbose reference the learner is handed. */
  starter: string;
  /** Leanest correct shape we know — the par. */
  par: string;
  /** Row-order sensitivity for grading learner attempts. */
  ordered: boolean;
  /** Columns the starter's table actually has — the bill for SELECT *. */
  starColumns: number;
  /** What the leaner shape teaches. */
  lesson: string;
  skill: string;
}

export const GOLF_XP = { eagle: 15, par: 10, bogey: 6 } as const;

export const GOLF_HOLES: GolfHole[] = [
  {
    id: "g1",
    title: "Hole 1 · Prune the projection",
    target: "The two US members — id and name, alphabetical.",
    starter: "SELECT * FROM customers WHERE region = 'US' ORDER BY name LIMIT 10;",
    par: "SELECT id, name FROM customers WHERE region = 'US' ORDER BY name LIMIT 5;",
    ordered: true,
    starColumns: 7,
    lesson:
      "SELECT * drags all seven columns into memory, over the wire and into the result — when the ask needs two. The LIMIT that can't bite (2 rows < 10) is a separate smell: limits should mean something.",
    skill: "select",
  },
  {
    id: "g2",
    title: "Hole 2 · DISTINCT beats GROUP BY",
    target: "The cities that have at least one active member — no duplicates.",
    starter: "SELECT city FROM customers WHERE active = 1 GROUP BY city;",
    par: "SELECT DISTINCT city FROM customers WHERE active = 1;",
    ordered: false,
    starColumns: 7,
    lesson:
      "GROUP BY is an aggregation machine — it exists to feed COUNT/SUM/AVG. With no aggregate in the SELECT it's a DISTINCT wearing a heavier coat: one extra clause, the same 14 cities, and a reader left hunting for an aggregate that isn't there.",
    skill: "select",
  },
  {
    id: "g3",
    title: "Hole 3 · The HAVING that filters nothing",
    target: "Members per region for every region on the roster, biggest first.",
    starter: "SELECT region, COUNT(*) AS n FROM customers GROUP BY region HAVING n >= 1 ORDER BY n DESC;",
    par: "SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC;",
    ordered: true,
    starColumns: 7,
    lesson:
      "Every bucket GROUP BY makes holds at least one row by definition — so HAVING n >= 1 is a gate no group can fail. It reads like diligence and does zero work (had the threshold been 2, LATAM's single member would have been filtered out — check the data before you gate). Drop the dead clause, keep the same grid.",
    skill: "groupby",
  },
  {
    id: "g4",
    title: "Hole 4 · Drop the redundant ORDER BY",
    target: "Total spend per customer over 1,000 — row order not part of the ask.",
    starter: "SELECT c.name, SUM(o.total) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.name\nHAVING SUM(o.total) > 1000\nORDER BY spent DESC;",
    par: "SELECT c.name, SUM(o.total) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nHAVING SUM(o.total) > 1000;",
    ordered: false,
    starColumns: 7,
    lesson:
      "Two wins: the ORDER BY serves no ask (unordered grading — row order was never part of the target), and GROUP BY c.id is the defensive key. Grouping by name would merge two same-named customers into one bucket; grouping by the primary key never does.",
    skill: "joins",
  },
  {
    id: "g5",
    title: "Hole 5 · The probe per row",
    target: "Every product with its line-item count.",
    starter: "SELECT p.name,\n       (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) AS items\nFROM products p;",
    par: "SELECT p.name, COUNT(oi.id) AS items\nFROM products p\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY p.id;",
    ordered: false,
    starColumns: 6,
    lesson:
      "The scalar subquery re-scans 251 items once per product — sixteen probes, sixteen inner scans. The GROUP BY census walks the items once. Same 16 rows, same counts; one of them scales.",
    skill: "subqueries",
  },
  {
    id: "g6",
    title: "Hole 6 · The double sort",
    target: "The three cheapest in-stock products over $100, cheapest first.",
    starter: "SELECT name, price\nFROM (\n  SELECT name, price\n  FROM products\n  WHERE price > 100 AND stock > 0\n  ORDER BY price\n  LIMIT 3\n)\nORDER BY price;",
    par: "SELECT name, price\nFROM products\nWHERE price > 100 AND stock > 0\nORDER BY price\nLIMIT 3;",
    ordered: true,
    starColumns: 6,
    lesson:
      "The derived table sorts, limits, and then the outer query sorts the same three rows again — the plan shows it: five steps versus two, two TEMP B-TREEs for one ordering. A subquery that only re-wraps its own SELECT is a round trip the engine pays for nothing.",
    skill: "subqueries",
  },
];
