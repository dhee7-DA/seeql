import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson20: Lesson = {
  id: "lesson-20",
  num: 20,
  title: "EXCEPT: in the first, never in the second",
  blurb: "The anti-join as a set operation — asymmetric, NULL-safe, and order-sensitive",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "**EXCEPT** keeps the rows of the *first* arm that never appear in the *second*. It is lesson 14's anti-join reborn as a set operation — no join, no `IS NULL`, just *mine minus ours*.",
    },
    { kind: "diagram", figure: "s4-except" },
    {
      kind: "code",
      caption: "Customers with nothing shipped — the L14 anti-join, one operator",
      sql: `SELECT id FROM customers
EXCEPT
SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'
ORDER BY id;      -- 6 customers, ids 2, 3, 4, 6, 11, 15`,
    },
    { kind: "h", text: "Asymmetry is the point" },
    {
      kind: "bullets",
      items: [
        "`A EXCEPT B` is **not** `B EXCEPT A`. On this store: delivered EXCEPT cancelled = **11** customers (completed orders, never a cancellation) — but cancelled EXCEPT delivered = **0**, because every cancelled-order customer also has a delivered one.",
        "The leftovers tell a story in both directions: shipped EXCEPT delivered = **1** — Liam O'Brien's single order left the warehouse and never arrived. The reverse, delivered EXCEPT shipped = **0**: nothing delivered without being shipped first. Physics, enforced by data.",
        "Because arms compare as sets, EXCEPT also **dedupes** — an arm repeating a row changes nothing.",
      ],
    },
    { kind: "h", text: "EXCEPT is an anti-join with DISTINCT" },
    {
      kind: "bullets",
      items: [
        "Three spellings, one answer. \"Customers with no shipped order\" resolves to the same **6** names whether you write the lesson-14 `LEFT JOIN … WHERE o.id IS NULL`, a `NOT EXISTS` subquery, or `customers EXCEPT shipped`. Pick by readability; pick EXCEPT when both sides are already queries.",
        "**EXCEPT is NULL-safe where `NOT IN` is not.** `id NOT IN (SELECT customer_id …)` returns *nothing at all* if the subquery yields a single NULL — the classic silent killer. Set operations use grouping semantics: NULLs simply match each other.",
        "The DISTINCT matters: `NOT EXISTS` preserves duplicates from the left side; EXCEPT collapses them. Usually harmless — occasionally the whole point.",
      ],
    },
    { kind: "diagram", figure: "s12-except-audit" },
    { kind: "code",
      caption: "Minus applied to products — price > 100, but not Audio",
      sql: `SELECT name FROM products WHERE price > 100
EXCEPT
SELECT name FROM products WHERE category = 'Audio'
ORDER BY name;    -- 4K Webcam Pro, Smart Watch S`,
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "**SQLite and Postgres**: full support. **MySQL**: only since **8.0.31** — before that, anti-joins mean `LEFT JOIN … IS NULL` or `NOT EXISTS` (and *never* raw `NOT IN` with a nullable column).",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres also ships `EXCEPT ALL` (keeps multiplicities: 3 minus 1 copy = 2). SQLite and MySQL do not — EXCEPT is always distinct there.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Every engine compares **all output columns**. `SELECT *` on two differently-shaped tables errors instead of silently guessing — project exactly the columns you mean.",
    },
    {
      kind: "warn",
      text: "The left arm defines what \"a row\" is. If you EXCEPT on `SELECT name` but meant ids, two different customers named alike collapse into one — compare on the unique column (id), display the pretty one (name).",
    },
  ],
  mcqs: [
    {
      id: "l20-q1",
      prompt: "delivered EXCEPT cancelled returns 11 rows on this store. How many does cancelled EXCEPT delivered return — and why?",
      choices: ["11 — EXCEPT is symmetric", "0 — every cancelled-order customer also has a delivered order", "4 — the cancelled customers", "15 — all customers"],
      answer: 1,
      why: "The cancelled set (ids 1, 5, 11, 13) sits entirely inside the delivered set, so subtracting it from delivered leaves 11, while subtracting delivered from cancelled leaves nothing. Order matters.",
      notes: [
        { choice: 0, why: "11 is the delivered-minus-cancelled count — EXCEPT is asymmetric, so swapping the arms subtracts the smaller set from itself and leaves 0." },
      ],
    },
    {
      id: "l20-q2",
      prompt: "Your `id NOT IN (SELECT customer_id FROM orders)` query returns zero rows although matches exist. Most likely cause?",
      choices: [
        "The subquery is unordered",
        "The subquery returns at least one NULL, which poisons the whole NOT IN",
        "NOT IN cannot be used with subqueries",
        "The id column is typed as TEXT",
      ],
      answer: 1,
      why: "One NULL in the right-hand list makes every comparison UNKNOWN, so NOT IN keeps nothing. EXCEPT / NOT EXISTS are the NULL-safe anti-joins.",
      notes: [
        { choice: 2, why: "NOT IN works fine with subqueries — the failure only happens when the subquery can produce a NULL, which poisons every comparison at once." },
      ],
    },
    {
      id: "l20-q3",
      prompt: "Which rows does `A EXCEPT B` keep?",
      choices: [
        "Rows of A plus rows of B, deduped",
        "Rows that appear in exactly one of A or B",
        "Rows of A (deduped) that never appear in B",
        "Rows of B that never appear in A",
      ],
      answer: 2,
      why: "EXCEPT is asymmetric: survivors come from the LEFT arm only, after removing anything the right arm contains — with duplicates collapsed.",
      notes: [
        { choice: 3, why: "That's the reversed direction — survivors always come from the LEFT arm; B EXCEPT A would answer a different question." },
      ],
    },
    {
      id: "l20-q4",
      prompt: "What does shipped EXCEPT delivered reveal on this store — and what does the reverse reveal?",
      choices: [
        "1 customer (Liam) with a shipped order and none delivered; the reverse is 0 — nothing ships after delivery",
        "0 and 0 — the statuses are identical",
        "6 customers and 6 customers",
        "1 and 103 — EXCEPT keeps unmatched right rows too",
      ],
      answer: 0,
      why: "Liam O'Brien's only order is shipped, never delivered. Reversed, delivered EXCEPT shipped is empty: causality holds in this data.",
      notes: [
        { choice: 2, why: "6 counts customers with *no* shipped order (the anti-join); shipped EXCEPT delivered isolates the single customer whose order left the warehouse and never arrived." },
      ],
    },
    {
      id: "l20-q5",
      prompt: "Arm A is `SELECT customer_id FROM orders` — 103 rows, customers repeated. Arm B is the 10 distinct customers with a shipped order. How many rows does `A EXCEPT B` return?",
      choices: ["93", "16", "6", "103"],
      answer: 2,
      why: "EXCEPT works on distinct rows: the 16 ordering customers minus the 10 shipped ones = 6, each appearing once — arm A's repeats collapse before the subtraction (verified on this db).",
      notes: [
        { choice: 0, why: "93 would be 103 − 10 with duplicates kept — EXCEPT is distinct by definition, so repeated rows collapse before any subtraction." },
      ],
    },
    {
      id: "l20-q6",
      prompt: "What does `SELECT status FROM orders EXCEPT SELECT status FROM orders` return?",
      choices: ["103 rows", "4 rows", "0 rows — every row of A is also in A", "1 row"],
      answer: 2,
      why: "Subtracting a set from itself leaves nothing: every distinct status in the left arm is cancelled out by the same value in the right arm. A EXCEPT A is always empty, duplicates or not.",
      notes: [
        { choice: 1, why: "4 is the DISTINCT status count — but those are exactly the rows the right arm removes, leaving the empty set." },
      ],
    },
    {
      id: "l20-q7",
      prompt: "Which is a REAL difference between `customers EXCEPT shipped-ids` and the lesson-14 `LEFT JOIN … WHERE o.id IS NULL` anti-join?",
      choices: [
        "EXCEPT compares whole rows; the LEFT JOIN matches only on the columns you join on",
        "The LEFT JOIN spelling also dedupes its result",
        "EXCEPT cannot take a subquery as its second arm",
        "They can never return the same rows",
      ],
      answer: 0,
      why: "EXCEPT diffs entire result rows; the anti-join's notion of 'match' is exactly the join keys. Project different columns and the two answers diverge — that's the whole design decision.",
      notes: [
        { choice: 1, why: "Backwards — LEFT JOIN + IS NULL preserves left-side duplicates; it's EXCEPT that collapses repeats." },
      ],
    },
    {
      id: "l20-q8",
      prompt: "Your prod database is MySQL 8.0.30 and rejects `EXCEPT`. The portable anti-join spelling is…",
      choices: [
        "LEFT JOIN … WHERE right.key IS NULL",
        "NOT IN (SELECT …) — safe on any version",
        "UNION ALL with a negative flag column",
        "CROSS JOIN plus a WHERE filter",
      ],
      answer: 0,
      why: "MySQL only grew INTERSECT/EXCEPT in 8.0.31 (October 2022); before that the anti-join is spelled LEFT JOIN + IS NULL (or NOT EXISTS).",
      notes: [
        { choice: 1, why: "NOT IN runs on old MySQL but dies silently if the subquery yields a single NULL — the NULL-safe spellings are LEFT JOIN + IS NULL and NOT EXISTS." },
      ],
    },
  ],
  problems: [
    {
      id: "l20-p1",
      title: "Nothing on the road",
      brief: "Customer ids with **no shipped order at all** — via EXCEPT. Output one column `id`, ascending. Six customers.",
      hints: [
        "Subtract sets: everything `customers` offers minus the customer ids that appear in the shipped-orders arm — EXCEPT keeps the difference.",
        "Shape: SELECT id FROM customers EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped' ORDER BY id;",
      ],
      difficulty: "easy",
      solution:
        "SELECT id FROM customers\nEXCEPT\nSELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'\nORDER BY id;",
      mistakes: [
        { test: "\\bunion\\b", message: "UNION stacks the two sets into one pile — the brief wants the difference: rows of the first arm that never appear in the second. That operator is EXCEPT." },
        { test: "\\bintersect\\b", message: "INTERSECT keeps rows present in *both* arms — the brief asks for the opposite: customers with no shipped order at all. Use EXCEPT." },
        { test: "^select\\b(?:(?!\\bexcept\\b).)*$", message: "This brief is the anti-join as a set operation: subtract the shipped-customer set from all customers with EXCEPT." },
      ],
      expected: EXPECTED["l20-p1"],
      ordered: true,
    },
    {
      id: "l20-p2",
      title: "Expensive, but not audio",
      brief: "Names of products priced over 100 that are **not** in the Audio category. Output one column `name`, alphabetical.",
      hints: [
        "Two product lists with a subtraction between them: the over-100 names minus the names the Audio arm returns.",
        "Shape: SELECT name FROM products WHERE price > 100 EXCEPT SELECT name FROM products WHERE category = 'Audio' ORDER BY name;",
      ],
      difficulty: "easy",
      solution:
        "SELECT name FROM products WHERE price > 100\nEXCEPT\nSELECT name FROM products WHERE category = 'Audio'\nORDER BY name;",
      mistakes: [
        { test: "\\bunion\\b", message: "UNION merges the two lists into one catalog — the brief wants the subtraction: EXCEPT keeps the over-100 names the Audio arm never returns." },
        { test: "\\bor\\b", message: "OR widens the net to rows matching *either* condition — you need products passing both: over 100 AND not Audio. As a set difference, that's EXCEPT." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The output must be alphabetical — the compound query takes one ORDER BY name, at the very end after the last arm." },
      ],
      expected: EXPECTED["l20-p2"],
      ordered: true,
    },
    {
      id: "l20-p3",
      title: "Both directions of the arrow",
      brief: "Show the asymmetry in one row: `one_way` = count of delivered EXCEPT cancelled, `other_way` = count of cancelled EXCEPT delivered.",
      hints: [
        "Each count lives in its own scalar subquery — wrap one EXCEPT per direction, then select the two counts side by side.",
        "Shape: SELECT (SELECT COUNT(*) FROM (<delivered-set> EXCEPT <cancelled-set>)) AS one_way, (SELECT COUNT(*) FROM (<cancelled-set> EXCEPT <delivered-set>)) AS other_way;",
      ],
      difficulty: "medium",
      solution:
        "SELECT\n  (SELECT COUNT(*) FROM (\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n     EXCEPT\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n   )) AS one_way,\n  (SELECT COUNT(*) FROM (\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n     EXCEPT\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n   )) AS other_way;",
      mistakes: [
        { test: "\\bunion\\b", message: "UNION merges or stacks sets — each count here is a *subtraction*: wrap delivered-EXCEPT-cancelled and its reverse in scalar subqueries." },
        { test: "^select\\b(?:(?!\\bexcept\\b).)*$", message: "The two counts come from set differences — compute delivered EXCEPT cancelled and cancelled EXCEPT delivered, each inside its own scalar subquery." },
        { test: "^(?:(?!\\bexcept\\b).)*\\bexcept\\b(?:(?!\\bexcept\\b).)*$", message: "Only one direction so far — the brief reports the asymmetry, so add the second scalar subquery with the two arms swapped." },
      ],
      expected: EXPECTED["l20-p3"],
    },
    {
      id: "l20-p4",
      title: "Name the waiting list",
      brief: "The **names** of customers with no shipped order — but the second arm must pull customer names *through the orders table* (JOIN customers on orders). Output one column `name`, alphabetical.",
      hints: [
        "Only the second arm changes: it must produce *names* through the orders table — join orders to customers there and keep the shipped filter.",
        "Shape: SELECT name FROM customers EXCEPT SELECT c.name FROM orders o JOIN customers c ON <join> WHERE o.status = 'shipped' ORDER BY name;",
      ],
      difficulty: "hard",
      solution:
        "SELECT name FROM customers\nEXCEPT\nSELECT c.name\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'shipped'\nORDER BY name;",
      mistakes: [
        { test: "\\bexcept\\b[^;]*\\bfrom\\s+orders\\s+where", message: "The second arm reads from orders alone, but orders has no name column — join customers through customer_id to pull each shipping customer's name." },
        { test: "status\\s*=\\s*'delivered'", message: "The waiting list is about *shipped* orders — the subtracting arm must filter status = 'shipped'." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The output must be alphabetical — append ORDER BY name at the very end of the compound query." },
      ],
      expected: EXPECTED["l20-p4"],
      ordered: true,
    },
    {
      id: "l20-p5",
      title: "Waiting, never stung",
      brief: "Customer ids that have a pending order but NO cancelled order at all: the pending-id set EXCEPT the cancelled-id set. Output one column `id`, ascending. Four ids expected.",
      hints: [
        "Two independent id sets — everyone waiting, everyone stung by a cancellation — and EXCEPT keeps the waiting ids the cancelled arm never returns.",
        "Shape: SELECT DISTINCT customer_id AS id FROM orders WHERE status = '<left>' EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status = '<right>' ORDER BY id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT DISTINCT customer_id AS id FROM orders WHERE status = 'pending'\nEXCEPT\nSELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\nORDER BY id;",
      mistakes: [
        { test: "\\bintersect\\b", message: "INTERSECT keeps ids in BOTH sets — the four cancelled veterans (1, 5, 11, 13). The brief wants the waiting ids with no cancellation: EXCEPT (3, 6, 7, 16)." },
        { test: "\\bunion\\b", message: "UNION stacks both sets (8 ids) — the brief subtracts: EXCEPT keeps pending ids the cancelled arm never returns." },
        { test: "status\\s*=\\s*'cancelled'[^;]*\\bexcept\\b", message: "The arms are swapped — cancelled EXCEPT pending drains to zero, because every cancelled customer is also waiting. The left arm must be the pending set." },
      ],
      expected: EXPECTED["l20-p5"],
      ordered: true,
    },
    {
      id: "l20-p6",
      title: "Many-line orders, not waiting",
      brief: "Fat orders, live ones only: ids of orders with 3 or more lines (GROUP BY order_id, HAVING COUNT(*) >= 3 over order_items) EXCEPT the ids currently pending. Output one column `id`, ascending. 41 rows expected.",
      hints: [
        "Build the fat-order id set first (GROUP BY order_id, HAVING COUNT(*) >= 3), then subtract the waiting ids with EXCEPT.",
        "Shape: SELECT order_id AS id FROM order_items GROUP BY order_id HAVING COUNT(*) >= <n> EXCEPT SELECT id FROM orders WHERE status = '<s>' ORDER BY id;",
      ],
      difficulty: "hard",
      solution:
        "SELECT order_id AS id FROM order_items\nGROUP BY order_id\nHAVING COUNT(*) >= 3\nEXCEPT\nSELECT id FROM orders WHERE status = 'pending'\nORDER BY id;",
      mistakes: [
        { test: "\\bintersect\\b", message: "INTERSECT keeps the fat orders that are ALSO waiting (7 of them) — the brief wants fat orders that are NOT: EXCEPT (41)." },
        { test: "having\\s+count\\s*\\(\\s*\\*\\s*\\)\\s*>\\s*3", message: "Boundary check — '3 or more lines' is HAVING COUNT(*) >= 3; a strict > 3 quietly drops every 3-line order." },
        { test: "^select\\b(?:(?!\\bexcept\\b).)*$|^select\\b(?:(?!\\border\\s+by\\b).)*$|^select\\s+order_id\\s+from\\b", message: "Shape check — the first arm must read SELECT order_id AS id FROM order_items …, the pending ids follow EXCEPT (SELECT id FROM orders WHERE status = 'pending'), and the compound ends with ORDER BY id." },
      ],
      expected: EXPECTED["l20-p6"],
      ordered: true,
    },
    {
      id: "l20-p7",
      title: "The last silent ids",
      brief: "Quietest three: of the customers with no shipped order at all, the three HIGHEST ids. Start from `customers`, EXCEPT the shipped-customer set. Output one column `id`, descending, capped at 3 rows — six customers qualify in total.",
      hints: [
        "The six-quiet-customers set from the lesson's opener, then one ORDER BY id DESC and a LIMIT — clauses every compound takes at the very end.",
        "Shape: SELECT id FROM customers EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped' ORDER BY id DESC LIMIT <n>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT id FROM customers\nEXCEPT\nSELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'\nORDER BY id DESC\nLIMIT 3;",
      mistakes: [
        { test: "\\bintersect\\b", message: "INTERSECT returns the customers who DID ship (10 ids) — the brief wants the six who never did: EXCEPT." },
        { test: "order\\s+by\\s+id\\s*(asc\\b)?\\s*(limit|;)", message: "The brief wants the LAST three — ORDER BY id DESC before LIMIT 3; an ascending cap would surface ids 2, 3, 4." },
        { test: "^select\\b(?:(?!\\blimit\\b).)*$", message: "Cap the pile — LIMIT 3 after the final ORDER BY id DESC; without it all six quiet customers come out." },
      ],
      expected: EXPECTED["l20-p7"],
      ordered: true,
    },
    {
      id: "l20-p8",
      title: "The symmetric difference",
      brief: "One row, three truths about delivered vs cancelled: `first_way` = count of delivered EXCEPT cancelled, `other_way` = count of cancelled EXCEPT delivered, `sym_diff` = both survivor piles stacked (UNION ALL, each EXCEPT wrapped in a FROM subquery) and counted. Output: 11, 0, 11.",
      hints: [
        "Three scalar subqueries: count each direction's EXCEPT, then count the two survivor piles stacked with UNION ALL into one.",
        "Shape: SELECT (SELECT COUNT(*) FROM (<d set> EXCEPT <c set>)) AS first_way, (SELECT COUNT(*) FROM (<c set> EXCEPT <d set>)) AS other_way, (SELECT COUNT(*) FROM (SELECT customer_id FROM (<d EXCEPT c>) UNION ALL SELECT customer_id FROM (<c EXCEPT d>))) AS sym_diff;",
      ],
      difficulty: "hard",
      solution:
        "SELECT\n  (SELECT COUNT(*) FROM (\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n     EXCEPT\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n   )) AS first_way,\n  (SELECT COUNT(*) FROM (\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n     EXCEPT\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n   )) AS other_way,\n  (SELECT COUNT(*) FROM (\n     SELECT customer_id FROM (\n        SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n        EXCEPT\n        SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n      )\n     UNION ALL\n     SELECT customer_id FROM (\n        SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n        EXCEPT\n        SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n      )\n   )) AS sym_diff;",
      mistakes: [
        { test: "\\bintersect\\b", message: "INTERSECT counts the overlap (4) — each column here is a SUBTRACTION: delivered-EXCEPT-cancelled (11) and its mirror (0)." },
        { test: "\\)\\s*union\\s+all\\s*\\(\\s*select|\\bunion\\s+all\\s*\\(\\s*select", message: "SQLite rejects parenthesized compound arms (verified on this db) — wrap each directional EXCEPT in a FROM subquery: SELECT customer_id FROM (…EXCEPT…) UNION ALL SELECT customer_id FROM (…EXCEPT…)." },
        { test: "^select\\b(?:(?!\\bsym_diff\\b).)*$", message: "Three numbers, one row — the third scalar subquery stacks both directional survivor piles with UNION ALL (each wrapped in a FROM subquery) and counts them AS sym_diff." },
      ],
      expected: EXPECTED["l20-p8"],
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "`EXCEPT` is **subtraction with whole rows**: everything in arm 1 that also appears in arm 2 is removed; what remains is the answer. The operator is *asymmetric* — `A EXCEPT B` and `B EXCEPT A` are different reports, and with overlapping populations each direction tells its own story, so the first thing to state (even just to yourself) is which population is being subtracted from. The second habit: EXCEPT is a **NULL-safe** difference — it does over a NULL-bearing column what `NOT IN` silently refuses to do.",
    },
    {
      kind: "engine",
      title: "you run SELECT email FROM customers EXCEPT SELECT email FROM blacklist",
      steps: [
        "**Arm 1** — all 16 customer emails stream out as candidates.",
        "**Arm 2** — the blacklist streams out as the removal set.",
        "**Grouping pass** — candidates are grouped; every group whose key also exists in arm 2 is deleted; survivors emit once each.",
        "**The NULL win** — if arm 2 held a NULL, a `NOT IN` over it would collapse to zero rows (the lesson-13 trap). EXCEPT's grouping just treats NULL as a value: it removes the NULL *row* and keeps the rest — the subtraction you actually meant.",
      ],
    },
    {
      kind: "myth",
      myth: "\"EXCEPT ALL keeps duplicates from the left arm, like UNION ALL keeps them from both.\"",
      truth: "**SQLite has no EXCEPT ALL.** The grammar ends at EXCEPT — duplicates from arm 1 collapse even when arm 2 never contained them. The multiset version needs arithmetic: count occurrences in arm 1, subtract counts from arm 2 in a GROUP BY, and re-expand — or accept the distinct result. PostgreSQL offers EXCEPT ALL; writing it in SQLite is a *parse error*, caught immediately, not a silent wrong number.",
    },
    {
      kind: "edge",
      items: [
        { c: "Direction mistakes", r: "`A EXCEPT B` ≠ `B EXCEPT A`. Probed both ways on this db: regions appear in both customers and suppliers, so `customers∖suppliers` and `suppliers∖customers` are both empty — but statuses vs invoice statuses differ in vocabulary, and only one direction says anything meaningful (all 4 order statuses survive; the reverse gives 4 minus 0 the other way). State which population you're subtracting from." },
        { c: "EXCEPT as anti-join", r: "`SELECT name FROM products EXCEPT SELECT p.name FROM order_items oi JOIN products p ON p.id=oi.product_id` → 0 rows here (every product sold at least once) — and it agrees with the NOT EXISTS anti-join, which is exactly how you audit one against the other." },
        { c: "Bare EXCEPT vs NOT IN", r: "NOT IN dies on NULLs in the sub-list; EXCEPT shrugs. The cost: EXCEPT is whole-row and distinct. When you need per-key, non-distinct difference, that's an anti-join's job (LEFT JOIN ... IS NULL)." },
        { c: "ORDER BY placement", r: "Same law as UNION: one ORDER BY, at the very end, sorting the subtraction result. An ORDER BY inside arm 1 is a syntax error." },
      ],
    },
  ],
  takeaway: "EXCEPT subtracts the second arm from the first — asymmetric, duplicate-collapsing, and NULL-safe where NOT IN silently fails — and the compound result takes a single ORDER BY, at the very end.",
};
