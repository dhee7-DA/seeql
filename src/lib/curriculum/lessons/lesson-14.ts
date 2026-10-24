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
    {
      kind: "warn",
      text: "Drop the `c1.id < c2.id` line and the same-region query doesn't error — it quietly returns every pairing twice, plus each customer paired with themselves: the 39 honest pairs swell to 94 rows. Self-joins are the easiest place to multiply rows without noticing, so count the result before you trust it.",
    },
    { kind: "h", text: "The numbers on this data" },
    {
      kind: "bullets",
      items: [
        "The 5 APAC customers form 10 pairs, the 8 EU customers 28, the 2 US customers exactly 1 — and LATAM none, because Bruno is the region's only customer. **39 pairs in total**, every one produced by the same three lines of SQL.",
        "Swap `region` for `category` and the same query pairs products — that's the sign of a pattern worth memorizing.",
      ],
    },
    { kind: "diagram", figure: "j14-mirror" },
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
    {
      id: "l14-q5",
      prompt: "`FROM customers c1 JOIN customers c2` with NO ON condition — how many rows? (16 customers.)",
      choices: ["16", "32", "256", "120"],
      answer: 2,
      why: "No ON means no match rule: every row pairs with every row, including itself — 16 × 16 = 256. The id guard is what turns this cartesian pile into pairs.",
      notes: [
        { choice: 3, why: "120 is C(16,2) — unordered pairs of DIFFERENT customers, which needs the c1.id < c2.id guard. Unguarded you also get self-pairs and mirrors: 256." },
      ],
    },
    {
      id: "l14-q6",
      prompt: "Which join condition still lets a row appear paired with itself?",
      choices: ["c1.id = c2.id", "c1.id <> c2.id", "c1.id < c2.id", "none of them do"],
      answer: 0,
      why: "Only equality matches a row against its own id — 16 degenerate self-pairs, plus every pair twice. <> drops self-pairs but keeps mirrors (a,b) and (b,a); < drops both — that is why it is the pair-counting guard.",
      notes: [
        { choice: 1, why: "A row's id never differs from itself, so <> already excludes self-pairs — its weakness is keeping the mirror copies." },
      ],
    },
    {
      id: "l14-q7",
      prompt: "The US region has exactly 2 customers. How many same-region pairs does the guard `c1.id < c2.id` produce for it?",
      choices: ["0 — a region needs at least 3 customers", "1", "2 — each customer pairs once", "4 — every ordered combination"],
      answer: 1,
      why: "Two customers make exactly one unordered pair: the smaller id takes c1, the larger c2, and C(2,2) = 1. Add a third customer and the count would jump to 3 — pairs grow quadratically.",
      notes: [
        { choice: 2, why: "The second 'pair' would be the same two names swapped — exactly what the < guard removes." },
        { choice: 3, why: "4 = 2 × 2 is the unguarded ordered count, including both self-pairs." },
      ],
    },
    {
      id: "l14-q8",
      prompt: "Which brief genuinely needs a SELF-join?",
      choices: [
        "orders beside their buyer's name",
        "customer pairs from the same region",
        "products beside their supplier's rating",
        "orders per status",
      ],
      answer: 1,
      why: "Pairing rows of one table with other rows of the SAME table is self-join territory — customers against customers. The others reach across tables (foreign-key joins) or collapse rows (aggregation).",
      notes: [
        { choice: 0, why: "orders→customers is a hop between two different tables along a foreign key — a regular join." },
      ],
    },
    {
      id: "l14-q9",
      prompt: "`customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id` — how many pairs form on this data?",
      choices: ["16", "39", "78", "94"],
      answer: 1,
      why: "The store's region crowds are EU 8, APAC 5, US 2, LATAM 1 — giving 28 + 10 + 1 + 0 = 39 pairs. `c1.id < c2.id` removes self-pairs and mirror duplicates in one stroke.",
      notes: [
        { choice: 3, why: "94 is 39 mirrors + 39 mirrors + 16 self-pairs — the raw shape before the inequality prunes it. That's what you get with `c1.id <> c2.id` plus DISTINCT... or nothing at all." },
      ],
    },
    {
      id: "l14-q10",
      prompt: "`customers a JOIN customers b ON a.city = b.city AND a.id < b.id` — how many rows?",
      choices: [
        "8 — the EU half",
        "0 — all 16 customers live in different cities, so no pair can form",
        "16 — everyone pairs with themselves",
        "256 — the full grid",
      ],
      answer: 1,
      why: "A legal join with zero matches is still a legal result: the store's 16 customers occupy 16 distinct cities, so the same-city join is provably empty.",
      notes: [
        { choice: 2, why: "Self-pairs need a.id = b.id — the `<` forbids them. An empty result here is a verified fact about the data, not a broken query." },
      ],
    },
    {
      id: "l14-q11",
      prompt: "What changes when a join's ON uses `<`, `>` or BETWEEN instead of `=`?",
      choices: [
        "Nothing — they're synonyms",
        "One left row can now match MANY right rows by design — the result's size is chosen by the ranges, not by keys",
        "It becomes an outer join",
        "Only the first match survives",
      ],
      answer: 1,
      why: "Equality joins pair keys one-to-one; non-equi conditions match whole intervals. That's the machinery behind range joins like band ladders — and behind accidental fan-out when the ranges overlap.",
      notes: [
        { choice: 3, why: "No implicit dedupe exists — every (left, right) pair that satisfies the condition lands in the result. Bounds discipline is the author's job." },
      ],
    },
    {
      id: "l14-q12",
      prompt: "Why must a self-join alias the table twice (`c1`, `c2`)?",
      choices: [
        "For performance — two copies load faster",
        "Because one FROM reference can't be mentioned twice unaliased — the two roles need their own names",
        "Because SQL requires c1/c2 naming specifically",
        "To avoid NULL rows",
      ],
      answer: 1,
      why: "`FROM customers JOIN customers` is ambiguous — every column name refers to two tables. Aliases split the one table into two addressable roles: left scout and right scout.",
      notes: [
        { choice: 2, why: "c1/c2 is just a readable habit — a1/a2, lefty/righty, anything consistent works. What's mandatory is that the names exist and differ." },
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
    {
      id: "l14-p5",
      title: "Same-region, both in",
      brief: "The roll call, active accounts only: same-region customer pairs where BOTH customers are active (active = 1). Output: `pair_a` (alias c1.name), `pair_b` (alias c2.name), `region` — ordered by region, then pair_a.",
      hints: [
        "The pairing pattern is unchanged; the new condition is about the pair's MEMBERS, so it belongs in ON beside the id guard — both sides must pass the flag.",
        "Shape: SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id AND c1.active = <flag> AND c2.active = <flag> ORDER BY <col>, <col>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region\nFROM customers c1\nJOIN customers c2\n     ON  c1.region = c2.region\n     AND c1.id < c2.id\n     AND c1.active = 1\n     AND c2.active = 1\nORDER BY c1.region, pair_a;",
      mistakes: [
        { test: "\\bc1\\.active\\s*=\\s*1(?![^;]*c2\\.active)", message: "Both members must be active — the guard needs c1.active = 1 AND c2.active = 1, not just one side." },
        { test: "c1\\.region\\s*=\\s*c2\\.region(?![^;]*\\.id\\s*<)", message: "Without the c1.id < c2.id guard every pair shows up twice and each customer pairs with itself." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "This task is graded on row order — append ORDER BY c1.region, pair_a." },
      ],
      expected: EXPECTED["l14-p5"],
      ordered: true,
    },
    {
      id: "l14-p6",
      title: "Same-month doubles",
      brief: "Which customers placed two orders in the same calendar month? Pair each order with others from the same customer AND the same `SUBSTR(created_at, 1, 7)` month, guarded by `o1.id < o2.id`. Output: `first_id` (alias o1.id), `second_id` (alias o2.id), `month` — ordered by first_id, then second_id.",
      hints: [
        "The shared key is now two-part: same customer AND same month slice of created_at. Both equalities live in ON beside the id guard.",
        "Shape: SELECT o1.id AS first_id, o2.id AS second_id, SUBSTR(o1.created_at, 1, 7) AS month FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id AND SUBSTR(o1.created_at, 1, 7) = SUBSTR(o2.created_at, 1, 7) ORDER BY <col>, <col>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT o1.id AS first_id, o2.id AS second_id, SUBSTR(o1.created_at, 1, 7) AS month\nFROM orders o1\nJOIN orders o2\n     ON  o1.customer_id = o2.customer_id\n     AND o1.id < o2.id\n     AND SUBSTR(o1.created_at, 1, 7) = SUBSTR(o2.created_at, 1, 7)\nORDER BY first_id, second_id;",
      mistakes: [
        { test: "date\\s*\\(\\s*o1\\.created_at\\s*\\)\\s*=\\s*date\\s*\\(\\s*o2", message: "That tests the same DAY — the brief asks for the same MONTH: compare SUBSTR(created_at, 1, 7) on both sides." },
        { test: "o1\\.customer_id\\s*=\\s*o2\\.customer_id(?![^;]*o1\\.id\\s*<)", message: "Without the o1.id < o2.id guard every double appears mirrored and each order pairs with itself." },
        { test: "^(?!select.*substr)", message: "The month slice needs SUBSTR(created_at, 1, 7) — select it (aliased month) and compare it across the two orders in ON." },
      ],
      expected: EXPECTED["l14-p6"],
      ordered: true,
    },
    {
      id: "l14-p7",
      title: "Supplier twins",
      brief: "Switch tables: which SUPPLIERS share a region? Output: `twin_a` (alias s1.name), `twin_b` (alias s2.name), `region` — ordered by region, then twin_a. Six suppliers spread over four regions: expect a short list.",
      hints: [
        "The same three-line pattern, pointed at suppliers: region is the shared key, supplier ids the guard rail.",
        "Shape: SELECT s1.name AS twin_a, s2.name AS twin_b, s1.region FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id ORDER BY <col>, <col>;",
      ],
      difficulty: "medium",
      solution:
        "SELECT s1.name AS twin_a, s2.name AS twin_b, s1.region\nFROM suppliers s1\nJOIN suppliers s2\n     ON  s1.region = s2.region\n     AND s1.id < s2.id\nORDER BY s1.region, twin_a;",
      mistakes: [
        { test: "\\bjoin\\s+(products|orders|customers)\\b", message: "No other table is needed — pairing suppliers by region means joining suppliers to a second copy of itself: suppliers s2." },
        { test: "s1\\.region\\s*=\\s*s2\\.region(?![^;]*\\.id\\s*<)", message: "Same guard rail as every self-join: without s1.id < s2.id each pair shows up mirrored and each supplier pairs with itself." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "This task is graded on row order — append ORDER BY s1.region, twin_a." },
      ],
      expected: EXPECTED["l14-p7"],
      ordered: true,
    },
    {
      id: "l14-p8",
      title: "Regional trios",
      brief: "Upsize the pattern: same-region customer TRIOS — c1, c2, c3 with c1.id < c2.id < c3.id, all sharing a region. How many exist? Output a single row, single column `trios`.",
      hints: [
        "A trio is a pair plus one more: chain a third copy of customers with its own guard (c2.id < c3.id) and the same region equality.",
        "Shape: SELECT COUNT(*) AS trios FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id JOIN customers c3 ON c2.region = c3.region AND c2.id < c3.id;",
      ],
      difficulty: "hard",
      solution:
        "SELECT COUNT(*) AS trios\nFROM customers c1\nJOIN customers c2\n     ON  c1.region = c2.region\n     AND c1.id < c2.id\nJOIN customers c3\n     ON  c2.region = c3.region\n     AND c2.id < c3.id;",
      mistakes: [
        { test: "^(?!.*\\bc3\\b)", message: "A trio needs a third copy — JOIN customers c3 ON c2.region = c3.region AND c2.id < c3.id extends the chain." },
        { test: "c2\\.region\\s*=\\s*c3\\.region(?![^;]*c2\\.id\\s*<\\s*c3)", message: "The third member needs its own guard — without c2.id < c3.id each trio is counted in every permutation." },
        { test: "\\bcount\\s*\\(\\s*\\*\\s*\\)(?!\\s+as\\s+trios)", message: "The single column must be headed `trios` — alias it: COUNT(*) AS trios." },
      ],
      expected: EXPECTED["l14-p8"],
    },
  ],
  takeaway: "A self-join lists one table twice under two aliases; `c1.id < c2.id` removes self-pairs and mirror duplicates in a single comparison, and the same three lines pair any table that shares a key.",
  deep: [
    {
      kind: "mind",
      text: "A self-join is **one table wearing two name tags**. The rows of customers become two independent populations — \"a\" and \"b\" — because the question needs *pairs from one set*: who shares my region, which orders are older than which, which invoices mirror each other. The aliases are not cosmetics; they are the only thing keeping the two roles apart. The classic discipline is the asymmetric pair test `a.id < b.id`: it keeps each unordered pair exactly once and forbids self-pairing. Drop the inequality and every pair doubles (a,b) and (b,a) while (a,a) sneaks in too — 39 true region pairs become 88 rows of noise. Self-joins are where alias discipline stops being style and becomes correctness.",
    },
    {
      kind: "engine",
      title: "you run FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id",
      steps: [
        "**Two passes over one table** — the engine scans customers as \"a\" and, per a-row, scans it again as \"b\". One physical table, two logical roles; 16 × 16 = 256 candidate pairs.",
        "**ON prunes** — region equality keeps same-region pairs (5 APAC, 8 EU, 2 US, 1 LATAM members), and `a.id < b.id` kills mirrors and self-pairs.",
        "**Emit** — 10 + 28 + 1 + 0 = 39 rows, each a unique unordered pair. The count C(n,2) per region is your reconciliation check.",
        "**Cost warning** — self-joins scale quadratically without indexes: 256 pairs here is trivial, 100k × 100k is not. The ON columns need indexes in production.",
      ],
    },
    {
      kind: "myth",
      myth: "\"You can't join a table to itself — SQL will complain about the duplicate name.\"",
      truth: "SQL only complains if you **reuse the same alias**. Two distinct aliases make the engine treat it as two independent row sources; the \"same table\" restriction exists only in your head, not in the engine's.",
    },
    {
      kind: "edge",
      items: [
        { c: "Forgetting the inequality", r: "Without `a.id < b.id`, every pair appears twice (a,b) and (b,a), plus 16 self-pairs (a,a): 39 becomes 94. The pair count doubles and pollutes — the inequality is the dedupe." },
        { c: "Using ≠ instead of <", r: "`a.id <> b.id` still allows both directions — 78 rows. The directionless pair needs a directionless test: order the ids and keep one orientation." },
        { c: "Pairs across a hierarchy", r: "Employee → manager is a self-join on reports_to = e.id. Managers are also employees, so LEFT JOIN from employees to their manager keeps the CEO's NULL — preservation matters inside the org chart too." },
        { c: "Three-role self-join", r: "\"Customers in the same city as someone in the same region as…\" chains a.id < b.id AND b.city = c.city — legal, but read it aloud or the roles blur. Name tags exist to be read." },
      ],
    },  ],
};
