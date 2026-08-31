import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson14: Lesson = {
  id: "lesson-14",
  num: 14,
  title: "Self-join: a table against itself",
  blurb: "Pairing rows with other rows in the same table — aliases stop being optional",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "Some questions compare a table to *itself*: which customers live in the same region, which products share a category. The **self-join** lists the same table twice in FROM, each copy wearing a different alias — and from that moment the two copies behave like two independent tables ranging over all 16 customers.",
    },
    { kind: "diagram", figure: "j6-self-join" },
    {
      kind: "code",
      caption: "Same-region pairs — without mirrors or self-pairs",
      sql: `SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region
FROM customers c1
JOIN customers c2
     ON  c1.region = c2.region
     AND c1.id < c2.id
ORDER BY c1.region, pair_a;`,
    },
    { kind: "h", text: "The two guard rails" },
    {
      kind: "bullets",
      items: [
        "**`c1.id < c2.id` kills two birds.** It removes self-pairs (a customer paired with themselves) **and** mirror duplicates — without it, \"Farid & Grace\" and \"Grace & Farid\" would both appear.",
        "**Aliases are mandatory here.** Both copies own a column called `name`, so a bare reference is ambiguous. Rename in the SELECT (`AS pair_a`, `AS pair_b`) so the output columns are distinguishable.",
        "Feeling unsure whether you need `<` or `<>`? `c1.id <> c2.id` only removes self-pairs — mirrors survive, doubling your result. Strict `<` does both jobs at once (and only works cleanly when the id is unique, which primary keys are).",
      ],
    },
    { kind: "h", text: "The numbers on this data" },
    {
      kind: "bullets",
      items: [
        "The 5 APAC customers form 10 pairs, the 8 EU customers 28, the 2 US customers exactly 1 — and LATAM none, because Bruno is the region's only customer. **39 pairs in total**, every one produced by the same three lines of SQL.",
        "Swap `region` for `category` and the same query pairs products — that's the sign of a pattern worth memorizing.",
      ],
    },
  ],
  mcqs: [
    {
      id: "l14-q1",
      prompt: "In a self-join, why are aliases mandatory rather than just convenient?",
      choices: [
        "They make the query run faster",
        "Both copies of the table own the same column names — without aliases every reference is ambiguous",
        "SQLite requires the aliases c1 and c2 specifically",
        "Aliases are only needed when joining three or more tables",
      ],
      answer: 1,
      why: "Two copies of customers means two id columns, two name columns… A bare name cannot be resolved, so the query errors until you qualify with c1./c2.",
    },
    {
      id: "l14-q2",
      prompt: "What does the condition `c1.id < c2.id` accomplish?",
      choices: [
        "It sorts the output by id",
        "It removes self-pairs and mirror duplicates in one stroke",
        "It limits the result to 2 rows per region",
        "It replaces the need for ON c1.region = c2.region",
      ],
      answer: 1,
      why: "A row can never be less than itself (no self-pairs), and of the two mirrors (a,b) and (b,a) exactly one satisfies a < b. Pair count becomes C(n,2).",
    },
    {
      id: "l14-q3",
      prompt: "Using `c1.id <> c2.id` instead of `<` would…",
      choices: [
        "Give the same result",
        "Drop self-pairs but keep both mirror duplicates, doubling rows",
        "Return an error",
        "Return only the self-pairs",
      ],
      answer: 1,
      why: "Both (Farid, Grace) and (Grace, Farid) satisfy <>, so each pair appears twice. Strict < keeps exactly one orientation per pair.",
    },
    {
      id: "l14-q4",
      prompt: "Which region produces zero same-region customer pairs in this store?",
      choices: ["EU", "APAC", "US", "LATAM"],
      answer: 3,
      why: "Bruno is LATAM's only customer, and pairing needs two distinct people. EU has 8 customers (28 pairs), APAC 5 (10 pairs), US 2 (1 pair).",
    },
  ],
  problems: [
    {
      id: "l14-p1",
      title: "Regional roll call",
      brief: "List every same-region customer pair. Output: `pair_a` (alias c1.name exactly), `pair_b` (alias c2.name exactly), `region` — ordered by region, then pair_a. Use `c1.id < c2.id` so no self-pairs or mirrors sneak in.",
      hint: "JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id, ORDER BY c1.region, pair_a.",
      difficulty: "medium",
      solution:
        "SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region\nFROM customers c1\nJOIN customers c2\n     ON  c1.region = c2.region\n     AND c1.id < c2.id\nORDER BY c1.region, pair_a;",
      expected: EXPECTED["l14-p1"],
      ordered: true,
    },
    {
      id: "l14-p2",
      title: "Count the pairs",
      brief: "How many same-region pairs exist in total? Output: a single row, single column named `pairs`. Your l14-p1 query wrapped in COUNT(*) — if you get 39, your guard rails are on.",
      hint: "SELECT COUNT(*) AS pairs FROM customers c1 JOIN customers c2 ON … AND c1.id < c2.id.",
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS pairs\nFROM customers c1\nJOIN customers c2\n     ON  c1.region = c2.region\n     AND c1.id < c2.id;",
      expected: EXPECTED["l14-p2"],
    },
    {
      id: "l14-p3",
      title: "The US duo",
      brief: "Same-region pairs, but only in the US region. Output: `pair_a`, `pair_b`, `region`, ordered by pair_a. Should be a very short list — two customers live stateside.",
      hint: "Add WHERE c1.region = 'US' (or put it in the ON — both work for inner joins).",
      difficulty: "easy",
      solution:
        "SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region\nFROM customers c1\nJOIN customers c2\n     ON  c1.region = c2.region\n     AND c1.id < c2.id\nWHERE c1.region = 'US'\nORDER BY pair_a;",
      expected: EXPECTED["l14-p3"],
      ordered: true,
    },
    {
      id: "l14-p4",
      title: "Category siblings",
      brief: "Products that share a category, one row per pair. Output: `sibling_a` (alias p1.name), `sibling_b` (alias p2.name), `category` — ordered by category, then sibling_a. Same pattern, different table: the guard rails do the heavy lifting.",
      hint: "FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id.",
      difficulty: "hard",
      solution:
        "SELECT p1.name AS sibling_a, p2.name AS sibling_b, p1.category\nFROM products p1\nJOIN products p2\n     ON  p1.category = p2.category\n     AND p1.id < p2.id\nORDER BY p1.category, sibling_a;",
      expected: EXPECTED["l14-p4"],
      ordered: true,
    },
  ],
};
