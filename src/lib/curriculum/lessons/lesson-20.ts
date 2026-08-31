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
    { kind: "code",
      caption: "Minus applied to products — price > 100, but not Audio",
      sql: `SELECT name FROM products WHERE price > 100
EXCEPT
SELECT name FROM products WHERE category = 'Audio'
ORDER BY name;    -- 4K Webcam Pro, Smart Watch S`,
    },
    { kind: "h", text: "Dialect watch" },
    {
      kind: "bullets",
      items: [
        "**SQLite and Postgres**: full support. **MySQL**: only since **8.0.31** — before that, anti-joins mean `LEFT JOIN … IS NULL` or `NOT EXISTS` (and *never* raw `NOT IN` with a nullable column).",
        "Postgres also ships `EXCEPT ALL` (keeps multiplicities: 3 minus 1 copy = 2). SQLite and MySQL do not — EXCEPT is always distinct there.",
        "Every engine compares **all output columns**. `SELECT *` on two differently-shaped tables errors instead of silently guessing — project exactly the columns you mean.",
      ],
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
    },
  ],
  problems: [
    {
      id: "l20-p1",
      title: "Nothing on the road",
      brief: "Customer ids with **no shipped order at all** — via EXCEPT. Output one column `id`, ascending. Six customers.",
      hint: "SELECT id FROM customers EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='shipped' ORDER BY id.",
      difficulty: "easy",
      solution:
        "SELECT id FROM customers\nEXCEPT\nSELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'\nORDER BY id;",
      expected: EXPECTED["l20-p1"],
      ordered: true,
    },
    {
      id: "l20-p2",
      title: "Expensive, but not audio",
      brief: "Names of products priced over 100 that are **not** in the Audio category. Output one column `name`, alphabetical.",
      hint: "SELECT name FROM products WHERE price > 100 EXCEPT SELECT name FROM products WHERE category='Audio' ORDER BY name.",
      difficulty: "easy",
      solution:
        "SELECT name FROM products WHERE price > 100\nEXCEPT\nSELECT name FROM products WHERE category = 'Audio'\nORDER BY name;",
      expected: EXPECTED["l20-p2"],
      ordered: true,
    },
    {
      id: "l20-p3",
      title: "Both directions of the arrow",
      brief: "Show the asymmetry in one row: `one_way` = count of delivered EXCEPT cancelled, `other_way` = count of cancelled EXCEPT delivered.",
      hint: "Two scalar subqueries, each wrapping one EXCEPT; subtract nothing — just select them side by side.",
      difficulty: "medium",
      solution:
        "SELECT\n  (SELECT COUNT(*) FROM (\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n     EXCEPT\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n   )) AS one_way,\n  (SELECT COUNT(*) FROM (\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n     EXCEPT\n     SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n   )) AS other_way;",
      expected: EXPECTED["l20-p3"],
    },
    {
      id: "l20-p4",
      title: "Name the waiting list",
      brief: "The **names** of customers with no shipped order — but the second arm must pull customer names *through the orders table* (JOIN customers on orders). Output one column `name`, alphabetical.",
      hint: "SELECT name FROM customers EXCEPT SELECT c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status='shipped' ORDER BY name.",
      difficulty: "hard",
      solution:
        "SELECT name FROM customers\nEXCEPT\nSELECT c.name\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'shipped'\nORDER BY name;",
      expected: EXPECTED["l20-p4"],
      ordered: true,
    },
  ],
};
