import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson25: Lesson = {
  id: "lesson-25",
  num: 25,
  title: "Subqueries inside WHERE — ask in two steps",
  blurb: "A query inside a query: compare rows to a computed value, or to a whole computed list",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "Some questions can't be answered in one pass. *Which products cost more than average?* — you can't write that number down, because the average comes from the data itself. A **subquery** lets the answer to one question become a building block of another: the inner `SELECT` runs, its result drops into the outer query, and the comparison happens as if you had typed the number yourself.",
    },
    { kind: "diagram", figure: "q1-nested" },
    {
      kind: "code",
      caption: "The catalog average is 71.78 — computed live, never hardcoded",
      sql: `SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products);   -- 6 products`,
    },
    { kind: "h", text: "The two shapes of a subquery" },
    {
      kind: "bullets",
      items: [
        "**Scalar subquery** — returns exactly one value (one row, one column). Drop it anywhere a value could go: `>`, `<`, `=`, even the SELECT list. Our average-price example is scalar: 16 prices in, one number out.",
        "**Column subquery** — returns a list of values down one column. It pairs with `IN`: `WHERE id IN (SELECT …)` reads as *id is one of the values that inner query produced*.",
        "The inner query is **uncorrelated** when it mentions no outer column — SQLite runs it once, up front. (When it *does* read an outer column, everything changes: that's lesson 26.)",
      ],
    },
    { kind: "diagram", figure: "q5-in-pipeline" },
    {
      kind: "code",
      caption: "IN (SELECT …): who has a cancelled order on their record?",
      sql: `SELECT name
FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE status = 'cancelled')
ORDER BY name;   -- Alice, Emma, Keiko, Maya — 4 names`,
    },
    {
      kind: "bullets",
      items: [
        "The inner query is a full query — joins and all: `(SELECT customer_id FROM orders o JOIN order_items oi ON … JOIN products p … WHERE p.category = 'Electronics')` is a legal membership list. **12 customers** have bought Electronics.",
        "Duplicates in the list are harmless: `IN` is a membership test, not a counter. Three cancelled orders from one customer still mean *in*.",
        "`NOT IN` flips the question: everyone **not** on the list. Customers with no cancelled order: 16 − 4 = **12**.",
      ],
    },
    { kind: "h", text: "The NOT IN landmine" },
    {
      kind: "warn",
      text: "If the subquery's column contains even one NULL, `NOT IN` returns **nothing** — not an error, an empty result. `x NOT IN (1, 2, NULL)` can never be true: unknown comparisons are never true, so every row fails the test. It is the single most-famous subquery trap in SQL.",
    },
    {
      kind: "bullets",
      items: [
        "Why this store is safe: `customer_id` is declared `NOT NULL`, so the cancelled list can't hide a NULL — the 12-customer answer is trustworthy.",
        "The same question spelled `NOT EXISTS` is immune: NULLs simply never match the probe. That's lesson 26's headline, and lesson 13 already met it from the anti-join side.",
        "If you must use NOT IN on a nullable column, guard it: `WHERE id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL …)` — or switch to NOT EXISTS and sleep well.",
      ],
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "PostgreSQL throws an error if a scalar subquery returns more than one row — *more than one row returned by a subquery*. That strictness catches bugs early.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite is looser: a scalar subquery returning several rows quietly uses the **first row** and carries on. Portable code shouldn't rely on either behavior — write subqueries that provably return one row (an aggregate like AVG/COUNT is the easiest guarantee).",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL refuses `LIMIT` inside an `IN (SELECT …)` subquery (error 1235). When you need a top-N list as the membership set, wrap it in one more derived-table layer — lesson 27's trick.",
    },
    {
      kind: "tip",
      text: "Read nested queries inside-out when planning, outside-in when writing: decide the inner question first ('the cancelled list'), write it, run it alone — then wrap it. A subquery you can't run by itself is a bug you haven't met yet.",
    },
  ],
  mcqs: [
    {
      id: "l25-q1",
      prompt: "The inner query in `WHERE price > (SELECT AVG(price) FROM products)` returns how many values?",
      choices: ["Exactly one — it's an aggregate", "One per product", "16 values", "Zero or one"],
      answer: 0,
      why: "AVG always collapses to a single number (or NULL for an empty table) — that's what makes the comparison legal as a scalar subquery.",
      notes: [
        { choice: 1, why: "AVG groups nothing — it consumes all 16 prices and returns one number. The comparison happens against that single value, per outer row." },
      ],
    },
    {
      id: "l25-q2",
      prompt: "How many times does the uncorrelated inner query run while the outer query processes 16 products?",
      choices: ["16 times — once per row", "Once — its result is reused", "Twice", "Depends on the price column"],
      answer: 1,
      why: "No outer column appears inside, so SQLite computes the list once up front and every outer row compares against the same value — 71.78 here.",
      notes: [
        { choice: 0, why: "Once-per-row is the *correlated* pattern, which needs the inner query to mention an outer column. This one doesn't — it's computed a single time." },
      ],
    },
    {
      id: "l25-q3",
      prompt: "A customer placed three cancelled orders. In `WHERE id IN (SELECT customer_id FROM orders WHERE status = 'cancelled')`, their id appears in the list three times. Do they appear three times in the result?",
      choices: ["Yes — one row per list hit", "No — the outer row either matches or doesn't", "Only if you add DISTINCT", "Only with IN ALL"],
      answer: 1,
      why: "IN is a membership test on each outer row — a row qualifies once no matter how many times it appears in the list. Each of the 4 cancelled-order customers comes out exactly once.",
      notes: [
        { choice: 2, why: "DISTINCT protects the *subquery's* list from duplicates, but the outer side never duplicates anyway — a WHERE clause keeps or drops whole rows, it never copies them." },
      ],
    },
    {
      id: "l25-q4",
      prompt: "The subquery `SELECT customer_id FROM orders WHERE status = 'cancelled'` secretly returned one row with NULL. What does `NOT IN` over that list return?",
      choices: ["All customers except those on the list", "An empty result", "An error", "Only the NULL row's customer"],
      answer: 1,
      why: "`id NOT IN (…, NULL)` can never be true — the comparison against NULL is unknown, and unknown fails WHERE. The whole question quietly collapses to zero rows.",
      notes: [
        { choice: 0, why: "That's what intuition says — and what would happen with IS NOT NULL guarding the list. One NULL poisons the entire NOT IN, no exception rows." },
      ],
    },
    {
      id: "l25-q5",
      prompt: "`customer_id` is declared NOT NULL on this store. Why does that make the 12-customer NOT IN answer trustworthy?",
      choices: [
        "NOT NULL makes the query run faster",
        "The landmine needs a NULL in the list — the declaration makes one impossible",
        "It forces SQLite to sort the list first",
        "It converts NOT IN into NOT EXISTS automatically",
      ],
      answer: 1,
      why: "The trap needs a NULL to compare against. A NOT NULL column can't produce one, so the list is safe and NOT IN behaves exactly like intuition expects.",
      notes: [
        { choice: 3, why: "Nothing converts automatically — the spelling stays NOT IN. It's safe here only because a NULL literally cannot exist in that column." },
      ],
    },
    {
      id: "l25-q6",
      prompt: "Which question REQUIRES a subquery (a plain join over the same tables cannot answer it)?",
      choices: [
        "Products that belong to the Audio category",
        "Products priced above the catalog's average price",
        "Customers together with their cities",
        "Orders placed in March",
      ],
      answer: 1,
      why: "Comparing each row against an aggregate of the whole table mixes two levels of the same data — a join can only stitch rows sideways, never against a summary of their own table. The scalar subquery is the tool.",
      notes: [
        { choice: 0, why: "`category = 'Audio'` is a plain WHERE on a literal — no second query needed. The tell for a subquery is comparing rows to a *computed* quantity." },
      ],
    },
    {
      id: "l25-q7",
      prompt: "SQLite's scalar subquery returns 3 rows by accident. What happens?",
      choices: [
        "Error — immediately",
        "It uses the first row and continues",
        "It returns NULL",
        "It averages the three rows",
      ],
      answer: 1,
      why: "SQLite quietly takes the first row of the result. PostgreSQL would throw an error instead — so code that 'works' on this db may be a time bomb elsewhere. Guarantee one row with an aggregate.",
      notes: [
        { choice: 0, why: "That's PostgreSQL's (correct, strict) reaction. SQLite is looser — which is precisely why the quiet-first-row behavior is dangerous." },
      ],
    },
    {
      id: "l25-q8",
      prompt: "`SELECT name, price, (SELECT AVG(price) FROM products) AS catalog_avg FROM products` — how many columns and rows come out?",
      choices: [
        "2 columns, 16 rows",
        "3 columns, 16 rows — every row carries the same avg",
        "3 columns, 1 row",
        "3 columns, 6 rows",
      ],
      answer: 1,
      why: "A scalar subquery in the SELECT list is just another per-row expression — 16 products stay 16 rows, each stamped with the same 71.78 for comparison.",
      notes: [
        { choice: 3, why: "The 6-above-average count belongs to the WHERE version. Without a WHERE, the subquery in SELECT annotates every row — it filters nothing." },
      ],
    },
  ],
  problems: [
    {
      id: "l25-p1",
      title: "Above the average shelf",
      brief: "List every product priced above the **catalog average price** — computed live with a scalar subquery, never hardcoded. Output `name` and `price`, priciest first. Six products qualify.",
      hints: [
        "The average of all 16 prices is itself a query — compute it in parentheses and compare each product's price against it.",
        "Shape: SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) ORDER BY price DESC;",
      ],
      difficulty: "easy",
      solution:
        "SELECT name, price FROM products\nWHERE price > (SELECT AVG(price) FROM products)\nORDER BY price DESC;",
      mistakes: [
        { test: "\\bgroup\\s+by\\b", message: "No grouping needed — the average covers the whole catalog in one scalar subquery, and each product row compares itself against that single number." },
        { test: "avg\\s*\\(\\s*price\\s*\\)\\s+as\\b", message: "The brief wants the *products* above the average, not the average itself — keep AVG inside the parenthesized subquery and select name, price from products." },
        { test: "^select\\b(?:(?!\\bfrom\\s+products\\b).)*$|\\borders\\b", message: "The shelf comes from products — the orders table has nothing to do with sticker prices. One scan of products plus one scalar subquery." },
      ],
      expected: EXPECTED["l25-p1"],
      ordered: true,
    },
    {
      id: "l25-p2",
      title: "Count the above-average orders",
      brief: "How many orders total more than the **average order total**? One scalar subquery, one count. Output a single column `above_avg`.",
      hints: [
        "Wrap the aggregate-of-aggregates: the inner query returns one number (the storewide average), the outer counts orders beating it.",
        "Shape: SELECT COUNT(*) AS above_avg FROM orders WHERE total > (SELECT AVG(total) FROM orders);",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS above_avg FROM orders\nWHERE total > (SELECT AVG(total) FROM orders);",
      mistakes: [
        { test: "\\bgroup\\s+by\\b", message: "This is one storewide number — no buckets. The inner query computes the mean; the outer counts how many orders clear it." },
        { test: "\\bavg\\s*\\(\\s*total\\s*\\)\\s+as\\b", message: "The average itself isn't the answer — it's the comparison target. 42 orders beat it; count those with COUNT(*)." },
        { test: ">\\s*338", message: "Never hardcode the average — compute it live with the scalar subquery, so the answer survives new data." },
      ],
      expected: EXPECTED["l25-p2"],
    },
    {
      id: "l25-p3",
      title: "The electronics crowd",
      brief: "Which customers have ever bought something from the **Electronics** category? Answer with `IN (SELECT …)` — the subquery may join, the outer query may not. Output `name`, alphabetical.",
      hints: [
        "The inner query walks orders → order_items → products and returns the customer_ids that bought Electronics; the outer just checks membership.",
        "Shape: SELECT name FROM customers WHERE id IN (SELECT o.customer_id FROM orders o JOIN order_items oi ON … JOIN products p ON … WHERE p.category = '<cat>') ORDER BY name;",
      ],
      difficulty: "medium",
      solution:
        "SELECT name FROM customers\nWHERE id IN (\n  SELECT o.customer_id FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE p.category = 'Electronics'\n)\nORDER BY name;",
      mistakes: [
        { test: "^select\\b[^;]*\\bjoin\\b(?![^;]*\\))", message: "The outer query stays join-free — that's the drill. Push the three-table walk INTO the parenthesized subquery; outside stays `WHERE id IN (…)`." },
        { test: "\\bnot\\s+in\\b", message: "NOT IN answers the opposite crowd — everyone who never touched Electronics. The brief wants the buyers: plain IN." },
        { test: "category\\s*=\\s*'(audio|video|accessories|wearables|apparel|fitness)'", message: "Wrong shelf — the brief says Electronics; the category literal must match exactly." },
      ],
      expected: EXPECTED["l25-p3"],
      ordered: true,
    },
    {
      id: "l25-p4",
      title: "The cancelled club",
      brief: "Customers holding at least one cancelled order, via `IN (SELECT …)`. Output `name`, alphabetical. Four names expected.",
      hints: [
        "The inner list is a one-line query over orders filtered by status; the outer checks each customer's id against it.",
        "Shape: SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = '<status>') ORDER BY name;",
      ],
      difficulty: "easy",
      solution:
        "SELECT name FROM customers\nWHERE id IN (SELECT customer_id FROM orders WHERE status = 'cancelled')\nORDER BY name;",
      mistakes: [
        { test: "\\bjoin\\b", message: "No join needed — the membership list is a simple filtered scan of orders, and the outer query already knows how to reach customers by id." },
        { test: "\\bnot\\s+in\\b", message: "That returns the 12 customers with a clean record — the brief wants the 4 who carry a cancellation. Plain IN." },
        { test: "status\\s*=\\s*'(shipped|delivered|pending)'", message: "Wrong status — the club is defined by 'cancelled'; other statuses answer a different question (delivered would list 15)." },
      ],
      expected: EXPECTED["l25-p4"],
      ordered: true,
    },
    {
      id: "l25-p5",
      title: "Clean records",
      brief: "The mirror question, with `NOT IN`: customers with **no** cancelled order. Output `name`, alphabetical. (Safe here because `customer_id` is NOT NULL — the landmine can't fire.)",
      hints: [
        "Flip the membership test: everyone whose id is not on the cancelled list. 16 customers minus the 4 on it.",
        "Shape: SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') ORDER BY name;",
      ],
      difficulty: "easy",
      solution:
        "SELECT name FROM customers\nWHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled')\nORDER BY name;",
      mistakes: [
        { test: "\\bnot\\s+exists\\b", message: "Same answer, different spelling — this drill is about NOT IN working on a NULL-free list. Save NOT EXISTS for the next lesson, where it becomes the hero." },
        { test: "\\bleft\\s+join\\b", message: "That's the lesson-13 anti-join route — correct in spirit, but this task spells the answer with NOT IN over a membership list." },
        { test: "\\bin\\b(?!\\s*\\()", message: "Bare IN without NOT lists the guilty four — the brief wants the clean twelve." },
      ],
      expected: EXPECTED["l25-p5"],
      ordered: true,
    },
    {
      id: "l25-p6",
      title: "Against the catalog",
      brief: "Annotate every product with the catalog average: output `name`, `price`, and a third column `catalog_avg` — the average price as a scalar subquery in the SELECT list. Order by price, priciest first.",
      hints: [
        "The scalar subquery lives in the SELECT list now — it runs once and stamps the same value on all 16 rows.",
        "Shape: SELECT name, price, (SELECT ROUND(AVG(price), 2) FROM products) AS catalog_avg FROM products ORDER BY price DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT name, price,\n  (SELECT ROUND(AVG(price), 2) FROM products) AS catalog_avg\nFROM products\nORDER BY price DESC;",
      mistakes: [
        { test: "\\bwhere\\b", message: "Nothing is filtered here — the brief annotates ALL 16 products. The subquery moves into the SELECT list as a per-row column." },
        { test: "catalog_avg\\s*=", message: "The alias is declared with AS in the SELECT list, not with an equals sign — `… AS catalog_avg`." },
        { test: "\\bgroup\\s+by\\b", message: "No grouping — AVG over the whole table is already a single value; the 16 product rows just carry it along." },
      ],
      expected: EXPECTED["l25-p6"],
      ordered: true,
    },
    {
      id: "l25-p7",
      title: "Electronics but never audio",
      brief: "Niche collectors: customers who bought **Electronics** but never bought **Audio**. Two membership tests — one IN, one NOT IN — over the same joined subquery shape. Output `name`, alphabetical.",
      hints: [
        "Copy the L25-p3 subquery shape twice: once requiring an Electronics hit, once rejecting every Audio hit.",
        "Shape: SELECT name FROM customers WHERE id IN (<electronics ids>) AND id NOT IN (<audio ids>) ORDER BY name;",
      ],
      difficulty: "hard",
      solution:
        "SELECT name FROM customers\nWHERE id IN (\n  SELECT o.customer_id FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE p.category = 'Electronics'\n)\nAND id NOT IN (\n  SELECT o.customer_id FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE p.category = 'Audio'\n)\nORDER BY name;",
      mistakes: [
        { test: "\\bintersect\\b", message: "INTERSECT finds customers in BOTH lists — the brief wants Electronics-without-Audio: one membership kept, one rejected. IN + NOT IN." },
        { test: "\\bexcept\\b", message: "EXCEPT over the two id sets would also work — but this lesson's toolkit is the double WHERE: IN for Electronics, NOT IN for Audio." },
        { test: "\\bnot\\s+exists\\b", message: "NOT EXISTS is next lesson's hero — here, build the Audio id list and reject it with NOT IN (safe: customer_id never NULL)." },
      ],
      expected: EXPECTED["l25-p7"],
      ordered: true,
    },
    {
      id: "l25-p8",
      title: "Pricey categories",
      brief: "Which categories price **above the catalog average**? Compare each category's mean price against the storewide mean with a subquery inside HAVING. Output `category` and `avg_price` (2 decimals), richest average first.",
      hints: [
        "The GROUP BY averages per category; HAVING compares each group average to the storewide scalar subquery.",
        "Shape: SELECT category, ROUND(AVG(price), 2) AS avg_price FROM products GROUP BY category HAVING AVG(price) > (SELECT AVG(price) FROM products) ORDER BY avg_price DESC;",
      ],
      difficulty: "hard",
      solution:
        "SELECT category, ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY category\nHAVING AVG(price) > (SELECT AVG(price) FROM products)\nORDER BY avg_price DESC;",
      mistakes: [
        { test: "\\bwhere\\b[^;]*\\bavg\\s*\\(", message: "WHERE can't see aggregates — the storewide average belongs in HAVING, where group results are already computed." },
        { test: "having\\s+avg_price", message: "HAVING reads the aggregate expression, not the alias — some engines allow it, portable SQL repeats AVG(price) on both sides of the comparison." },
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "Per-category averages need the GROUP BY — without it, AVG is one storewide number, not seven category numbers." },
      ],
      expected: EXPECTED["l25-p8"],
      ordered: true,
    },
  ],
  takeaway: "A subquery answers the inner question first — one value for a scalar comparison, one column for IN — and the NOT IN landmine means: never trust it on a nullable column.",
};
