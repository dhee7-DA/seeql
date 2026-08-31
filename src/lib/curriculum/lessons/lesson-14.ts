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
    {
      kind: "dialect",
      db: "sqlite",
      text: "Self-joins take no special syntax in SQLite — or in PostgreSQL or MySQL: the same table simply appears twice in FROM, once per alias. The names c1 and c2 are conventions; the only hard requirement is that the aliases differ.",
    },
    { kind: "h", text: "The two guard rails" },
    { kind: "diagram", figure: "j14-two-aliases" },
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
      notes: [
        { choice: 0, why: "Aliases buy readability, not speed — here they're load-bearing: two copies of customers means two name columns, and an unqualified reference is simply ambiguous." },
      ],
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
      notes: [
        { choice: 0, why: "Nothing gets sorted — `<` is a join condition deciding which row pairs survive, while actual ordering is still ORDER BY's job." },
      ],
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
      notes: [
        { choice: 0, why: "Not the same: <> keeps both (Farid, Grace) and (Grace, Farid) since each satisfies the inequality — only a strict < keeps one orientation." },
      ],
    },
    {
      id: "l14-q4",
      prompt: "Which region produces zero same-region customer pairs in this store?",
      choices: ["EU", "APAC", "US", "LATAM"],
      answer: 3,
      why: "Bruno is LATAM's only customer, and pairing needs two distinct people. EU has 8 customers (28 pairs), APAC 5 (10 pairs), US 2 (1 pair).",
      notes: [
        { choice: 2, why: "The US is small but not pairless — its 2 customers form exactly 1 pair; LATAM is the region where a single customer (Bruno) has nobody to pair with." },
      ],
    },
  ],
  problems: [
    {
      id: "l14-p1",
      title: "Regional roll call",
      brief: "List every same-region customer pair. Output: `pair_a` (alias c1.name exactly), `pair_b` (alias c2.name exactly), `region` — ordered by region, then pair_a. Use `c1.id < c2.id` so no self-pairs or mirrors sneak in.",
      hints: [
        "List customers twice under two aliases, keep copies that share a region, and use the id inequality to keep exactly one orientation of each pair.",
        "Shape: SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id ORDER BY <col>, <col>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region\nFROM customers c1\nJOIN customers c2\n     ON  c1.region = c2.region\n     AND c1.id < c2.id\nORDER BY c1.region, pair_a;",
      mistakes: [
        { test: "c1\\.region\\s*=\\s*c2\\.region(?![^;]*\\.id\\s*[<>])", message: "Without the id comparison every pair appears twice (Farid & Grace and Grace & Farid) and everyone pairs with themselves — `c1.id < c2.id` removes self-pairs and mirrors in one comparison." },
        { test: "c1\\.id\\s*<>\\s*c2\\.id|c2\\.id\\s*<>\\s*c1\\.id", message: "`<>` only removes self-pairs — both mirror orientations satisfy it, so each pair shows up twice. The strict `<` keeps exactly one." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "This task is graded on row order — append ORDER BY c1.region, pair_a." },
      ],
      expected: EXPECTED["l14-p1"],
      ordered: true,
    },
    {
      id: "l14-p2",
      title: "Count the pairs",
      brief: "How many same-region pairs exist in total? Output: a single row, single column named `pairs`. Your l14-p1 query wrapped in COUNT(*) — if you get 39, your guard rails are on.",
      hints: [
        "The join is already right from the last problem — stop listing rows and count them instead.",
        "Shape: SELECT COUNT(*) AS pairs FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id;",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS pairs\nFROM customers c1\nJOIN customers c2\n     ON  c1.region = c2.region\n     AND c1.id < c2.id;",
      mistakes: [
        { test: "count\\s*\\(\\s*distinct", message: "Every surviving join row already IS one pair, so plain COUNT(*) is the pair count — COUNT(DISTINCT c1.id) would count customers who appear in a pair, collapsing each customer's pairs down to one." },
        { test: "c1\\.region\\s*=\\s*c2\\.region(?![^;]*\\.id\\s*[<>])", message: "Without `c1.id < c2.id` the join counts self-pairs and both mirrors — the guard is what turns raw matches into each unordered pair exactly once." },
        { test: "\\bgroup\\s+by\\b", message: "No GROUP BY is needed — the brief wants one grand total, and COUNT(*) without GROUP BY collapses the whole join into that single row." },
      ],
      expected: EXPECTED["l14-p2"],
    },
    {
      id: "l14-p3",
      title: "The US duo",
      brief: "Same-region pairs, but only in the US region. Output: `pair_a`, `pair_b`, `region`, ordered by pair_a. Should be a very short list — two customers live stateside.",
      hints: [
        "Same pair query, one row filter added before the pairing happens.",
        "Shape: SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id WHERE c1.region = <region> ORDER BY <col>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region\nFROM customers c1\nJOIN customers c2\n     ON  c1.region = c2.region\n     AND c1.id < c2.id\nWHERE c1.region = 'US'\nORDER BY pair_a;",
      mistakes: [
        { test: "region\\s*=\\s*'(eu|apac|latam)'", message: "Wrong region — the brief asks for the US duo, so the filter is c1.region = 'US'." },
        { test: "c1\\.region\\s*=\\s*c2\\.region(?![^;]*\\.id\\s*[<>])", message: "Without the `c1.id < c2.id` guard even this tiny region self-pairs and mirrors — two customers alone produce four unguarded rows instead of one pair." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "This task is graded on row order — append ORDER BY pair_a." },
      ],
      expected: EXPECTED["l14-p3"],
      ordered: true,
    },
    {
      id: "l14-p4",
      title: "Category siblings",
      brief: "Products that share a category, one row per pair. Output: `sibling_a` (alias p1.name), `sibling_b` (alias p2.name), `category` — ordered by category, then sibling_a. Same pattern, different table: the guard rails do the heavy lifting.",
      hints: [
        "The exact same pair pattern, pointed at products: category is the shared key, product ids the guard rail.",
        "Shape: SELECT p1.name AS sibling_a, p2.name AS sibling_b, p1.category FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id ORDER BY <col>, <col>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT p1.name AS sibling_a, p2.name AS sibling_b, p1.category\nFROM products p1\nJOIN products p2\n     ON  p1.category = p2.category\n     AND p1.id < p2.id\nORDER BY p1.category, sibling_a;",
      mistakes: [
        { test: "p1\\.category\\s*=\\s*p2\\.category(?![^;]*\\.id\\s*[<>])", message: "Same guard rail as the customer version: without `p1.id < p2.id` every sibling pair shows up twice and each product pairs with itself." },
        { test: "\\bjoin\\s+(orders|order_items|customers|suppliers)\\b", message: "No other table is needed — pairing products by category means joining products to a second copy of itself: products p2." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "This task is graded on row order — append ORDER BY p1.category, sibling_a." },
      ],
      expected: EXPECTED["l14-p4"],
      ordered: true,
    },
  ],
  takeaway: "A self-join lists one table twice under two aliases; `c1.id < c2.id` removes self-pairs and mirror duplicates in a single comparison, and the same three lines pair any table that shares a key.",
};
