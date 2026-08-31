import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson19: Lesson = {
  id: "lesson-19",
  num: 19,
  title: "INTERSECT: rows present in both",
  blurb: "The overlap of two result sets — with a built-in dedupe and NULL-safe comparison",
  minutes: 11,
  blocks: [
    {
      kind: "p",
      text: "**INTERSECT** keeps only the rows that appear in *both* arms. Where `UNION` merges piles, `INTERSECT` asks of each row: *does the second arm have you too?* Only survivors from the overlap come out.",
    },
    { kind: "diagram", figure: "s3-intersect" },
    {
      kind: "code",
      caption: "Customers who have BOTH a delivered and a cancelled order",
      sql: `SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
INTERSECT
SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'
ORDER BY customer_id;      -- 4 customers: ids 1, 5, 11, 13`,
    },
    { kind: "h", text: "What counts as “in both”" },
    {
      kind: "bullets",
      items: [
        "INTERSECT compares **entire rows** — every output column, not just the id. Change the SELECT list and you change the overlap.",
        "It runs with **DISTINCT semantics**: an arm that produces the same row twice still counts once, and the result never contains duplicates (our 15 delivered-order customers ∩ 4 cancelled-order customers = **4**).",
        "Comparison is **NULL-safe**: for set operations, two NULLs are considered duplicates of each other — unlike `WHERE col = col`, which never matches when NULL is involved. The `shipped_at` holes from lesson 4 do not poison an INTERSECT.",
      ],
    },
    { kind: "diagram", figure: "s11-both-sides" },
    { kind: "h", text: "The join you already know" },
    {
      kind: "bullets",
      items: [
        "`A INTERSECT B` is the set answer to a question joins answer with **INNER JOIN + DISTINCT** — on this db both routes return the same 4 double-trouble customers. Verified row for row.",
        "A third spelling: `WHERE customer_id IN (SELECT … cancelled)` inside the delivered arm. Three routes, one answer — pick by readability.",
        "INTERSECT reads best when both arms are *independent filters over the same shape*: cheap products **and** well-stocked products, customers who ordered **and** customers who complained.",
      ],
    },
    { kind: "code",
      caption: "Same 4 via INNER JOIN — the pre-8.0.31 MySQL spelling",
      sql: `SELECT COUNT(DISTINCT a.customer_id) AS both_count
FROM orders a
JOIN orders b
     ON  b.customer_id = a.customer_id
     AND b.status = 'cancelled'
WHERE a.status = 'delivered';   -- 4`,
    },
    { kind: "h", text: "On this database" },
    {
      kind: "bullets",
      items: [
        "delivered ∩ cancelled = **4** (ids 1, 5, 11, 13) — customers who completed orders *and* had one cancelled: double trouble worth a service review.",
        "delivered ∩ pending = **8** — every customer currently waiting also has history.",
        "products: price < 50 ∩ stock > 100 = **7** — the cheap-and-plenty shelf, from Desk Mat Extended to Wireless Mouse M3.",
      ],
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "**SQLite and Postgres**: full support. **MySQL**: only since **8.0.31** (October 2022) — older versions must emulate with `JOIN + DISTINCT` or `IN`.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres offers `INTERSECT ALL`, which keeps duplicate *multiplicities*; SQLite and MySQL have no `ALL` variant here — it is always distinct.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "All engines dedupe the result; none will hand you an overlap with repeated rows even if an arm repeats them.",
    },
    {
      kind: "tip",
      text: " INTERSECT arms must have the same column count — and the overlap is on ALL columns. If you only care about ids, select only the id in both arms; an extra column quietly shrinks the result to rows identical on everything.",
    },
  ],
  mcqs: [
    {
      id: "l19-q1",
      prompt: "15 customers have a delivered order, 4 have a cancelled order, and every cancelled-order customer also has a delivered order. What does delivered INTERSECT cancelled return?",
      choices: ["0 rows", "4 rows", "11 rows", "15 rows"],
      answer: 1,
      why: "The overlap is exactly the cancelled set, since it sits fully inside the delivered set: 4 rows — ids 1, 5, 11 and 13 on this store.",
      notes: [
        { choice: 2, why: "11 is delivered EXCEPT cancelled — subtraction, not intersection; INTERSECT keeps the ids both sets share." },
      ],
    },
    {
      id: "l19-q2",
      prompt: "Which pre-8.0.31 MySQL query most faithfully emulates `A INTERSECT B` over the same output column?",
      choices: [
        "SELECT * FROM a, b",
        "SELECT DISTINCT v FROM a JOIN b ON b.v = a.v",
        "SELECT v FROM a UNION SELECT v FROM b",
        "SELECT v FROM a WHERE v IS NOT NULL",
      ],
      answer: 1,
      why: "INNER JOIN on the value plus DISTINCT reproduces the distinct overlap. A UNION merges instead of intersecting; the comma join pairs every row with every other.",
      notes: [
        { choice: 2, why: "UNION merges the sets (everything in either) — the overlap needs rows that match on the value, which is the join's job." },
      ],
    },
    {
      id: "l19-q3",
      prompt: "Arm A returns the same row three times; arm B contains that row once. How often does INTERSECT output it?",
      choices: ["Three times", "Once", "Twice", "Not at all — duplicates poison the match"],
      answer: 1,
      why: "INTERSECT is distinct by definition — multiplicity is discarded in both arms, so the shared row survives exactly once.",
      notes: [
        { choice: 0, why: "Multiplicity never survives a set operation — the repeated row collapses to one before the overlap is taken." },
      ],
    },
    {
      id: "l19-q4",
      prompt: "Two arms each output the single value NULL. What does `arm1 INTERSECT arm2` produce?",
      choices: [
        "Nothing — NULL never equals NULL",
        "One row with NULL",
        "An error",
        "One row per arm — two NULL rows",
      ],
      answer: 1,
      why: "Set operations treat NULLs as duplicates of each other (grouping semantics, not comparison semantics). One NULL row comes out — this is exactly where INTERSECT beats NOT IN-style filtering.",
      notes: [
        { choice: 0, why: "That's *comparison* semantics (NULL = NULL is unknown) — set operations use grouping semantics, where NULLs count as duplicates of each other." },
      ],
    },
  ],
  problems: [
    {
      id: "l19-p1",
      title: "Double trouble",
      brief: "List the ids of customers who have **both** a delivered and a cancelled order. Output one column `customer_id`, sorted ascending. Use INTERSECT.",
      hints: [
        "Two independent customer sets — everyone delivered, everyone cancelled — and INTERSECT keeps only the ids that appear in both.",
        "Shape: SELECT DISTINCT customer_id FROM orders WHERE status = '<s1>' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status = '<s2>' ORDER BY customer_id;",
      ],
      difficulty: "easy",
      solution:
        "SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\nINTERSECT\nSELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\nORDER BY customer_id;",
      mistakes: [
        { test: "\\bunion\\b", message: "UNION merges the two sets into one pile — the brief wants the *overlap*: customers holding both statuses. That operator is INTERSECT." },
        { test: "^select\\b(?:(?!\\bintersect\\b).)*$", message: "The overlap needs both sets — write the delivered arm and the cancelled arm and meet them with INTERSECT." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The ids must come out ascending — the compound takes one ORDER BY customer_id, at the very end." },
      ],
      expected: EXPECTED["l19-p1"],
      ordered: true,
    },
    {
      id: "l19-p2",
      title: "How much overlap",
      brief: "Same question, now as a count: how many customers sit in both the delivered and the cancelled sets? Output one column `overlap`.",
      hints: [
        "Same overlap as the last task — wrap the INTERSECT in a FROM subquery and COUNT(*) the survivors.",
        "Shape: SELECT COUNT(*) AS overlap FROM (<delivered set> INTERSECT <cancelled set>);",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS overlap FROM (\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n  INTERSECT\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n);",
      mistakes: [
        { test: "\\bunion\\b", message: "UNION counts the combined set (15) — the brief wants the overlap, so INTERSECT the two arms and count the survivors (4)." },
        { test: "^select\\s+distinct", message: "That lists the four ids again — the brief wants a single number: wrap the INTERSECT in a FROM subquery and COUNT(*) it." },
        { test: "count\\s*\\(\\s*\\*\\s*\\)\\s+from", message: "Name the output column — alias the count AS overlap, since the brief names it `overlap`: SELECT COUNT(*) AS overlap FROM (…)." },
      ],
      expected: EXPECTED["l19-p2"],
    },
    {
      id: "l19-p3",
      title: "Cheap and plentiful",
      brief: "Product names priced under 50 **and** stocked above 100 — one INTERSECT, one column `name`, alphabetical. Seven products qualify.",
      hints: [
        "Two independent product lists — the cheap ones and the well-stocked ones — and the overlap is the shelf: INTERSECT keeps names present in both.",
        "Shape: SELECT name FROM products WHERE <cond1> INTERSECT SELECT name FROM products WHERE <cond2> ORDER BY name;",
      ],
      difficulty: "medium",
      solution:
        "SELECT name FROM products WHERE price < 50\nINTERSECT\nSELECT name FROM products WHERE stock > 100\nORDER BY name;",
      mistakes: [
        { test: "\\bunion\\b", message: "UNION pools both lists (cheap OR well-stocked) — the brief wants products that are BOTH, which is the overlap: INTERSECT." },
        { test: "^select\\b(?:(?!\\bintersect\\b).)*$", message: "The brief asks for one INTERSECT — write the cheap arm and the stocked arm and meet them in the middle." },
        { test: "price\\s*<=\\s*50|stock\\s*>=\\s*100", message: "Boundary check — 'under 50' is price < 50 and 'above 100' is stock > 100; the equality edge changes membership." },
      ],
      expected: EXPECTED["l19-p3"],
      ordered: true,
    },
    {
      id: "l19-p4",
      title: "The join spelling",
      brief: "Prove the equivalence: count the customers with both a delivered and a cancelled order using a single **INNER JOIN** (no INTERSECT). Output one column `both_count`.",
      hints: [
        "Count customers, not order pairs — self-join orders to orders on customer_id with the cancelled status pinned on the b side, then COUNT(DISTINCT a.customer_id).",
        "Shape: SELECT COUNT(DISTINCT a.customer_id) AS both_count FROM orders a JOIN orders b ON <join condition> AND b.status = '<s2>' WHERE a.status = '<s1>';",
      ],
      difficulty: "hard",
      solution:
        "SELECT COUNT(DISTINCT a.customer_id) AS both_count\nFROM orders a\nJOIN orders b\n     ON  b.customer_id = a.customer_id\n     AND b.status = 'cancelled'\nWHERE a.status = 'delivered';",
      mistakes: [
        { test: "count\\s*\\(\\s*\\*\\s*\\)", message: "The join multiplies rows — every delivered × cancelled pair becomes a row, so COUNT(*) counts pairs, not people. COUNT(DISTINCT a.customer_id) collapses them back to customers." },
        { test: "\\bintersect\\b", message: "This task asks for the join spelling on purpose — reproduce the overlap with the self-join and see why the two routes agree." },
        { test: "^select\\b(?![^;]*'cancelled')[^;]*\\bjoin\\b", message: "One side lost its status — without b.status = 'cancelled' the b side matches any other order, and you'd count repeat customers, not the delivered-and-cancelled overlap." },
      ],
      expected: EXPECTED["l19-p4"],
    },
  ],
  takeaway: "INTERSECT keeps the rows present in both arms — distinct by definition, NULL-safe by grouping semantics, and equivalent to INNER JOIN + DISTINCT over the same output column.",
};
