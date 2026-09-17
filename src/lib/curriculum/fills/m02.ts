// Fill drills for Module 2 — Joins & Relationships (lessons 9-16 + capstone 36).
//
// Same contract as m01.ts (the golden example):
//   - id "lN-fK" unique across the course, starting at f1 per lesson
//   - template: SQL with {1}..{n} slot markers; the COMPLETED text must be
//     valid, read-only SQL that runs on the seed db (scripts/fill-audit.ts)
//   - answers[i] completes slot i+1; every answer must appear in chips;
//     answers pairwise distinct (chips are removed once placed)
//   - chips: 4-6 distinct options — correct ones + tempting distractors
//   - notes: per-slot coaching for the most tempting wrong chip
//   - every lesson: >=1 fix-the-broken-query fill, 1-2 multi-slot fills
// Numbers quoted in `why` texts were verified against the fresh seed
// (scripts/fill-scratch-5b*.ts): 103 orders / 251 lines / 34833.28 vs
// 103244.55 / 39 region pairs / 6 never-shipped / 1 never-delivered.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 9 — Two tables, one answer (the FK lookup join)
  9: [
    {
      id: "l9-f1",
      prompt: "Your first join: pull each order with its buyer's name alongside — order id, name, total, first 5 rows.",
      template: "SELECT o.id, c.name, o.total\nFROM orders o\n{1} customers c ON {2}\nLIMIT 5;",
      chips: ["JOIN", "LEFT JOIN", "c.id = o.customer_id", "o.id = c.id", "c.name = o.name"],
      answers: ["JOIN", "c.id = o.customer_id"],
      why: "The foreign key is the thread: `o.customer_id` stores the customer's id, so the match rule pairs `c.id` with `o.customer_id` — one output row per order, now carrying the buyer's name.",
      notes: [
        { slot: 2, why: "`o.id = c.id` pairs the two tables' primary keys against each other — unrelated counters that happen to collide. The thread to the buyer is the foreign key o.customer_id." },
        { slot: 2, why: "`c.name = o.name` compares names — and orders has no name column at all, so the query errors." },
        { slot: 1, why: "LEFT JOIN would run too, but nothing needs preserving here — every order has a buyer, and the plain lookup is the bare JOIN (which already means INNER)." },
      ],
    },
    {
      id: "l9-f2",
      prompt: "The sourced catalog: each product with its supplier's name, alphabetical, first 10.",
      template: "SELECT p.name, s.name AS supplier\nFROM products p\nJOIN {1} ON {2} = p.supplier_id\nORDER BY p.name\nLIMIT 10;",
      chips: ["suppliers s", "customers c", "s.id", "p.id", "s.rating"],
      answers: ["suppliers s", "s.id"],
      why: "products carries `supplier_id`, so the second table is suppliers, paired through `s.id = p.supplier_id`. The AS supplier alias matters: both tables call their name column name.",
      notes: [
        { slot: 1, why: "products has no customer_id — the foreign-key thread here points at suppliers, not customers." },
        { slot: 2, why: "`p.id` is the product's own primary key; the supplier thread is the foreign key p.supplier_id, which lands on s.id." },
        { slot: 2, why: "`s.rating` is a decimal score, not a key — matching it against supplier_id pairs random rows." },
      ],
    },
    {
      id: "l9-f3",
      prompt: "Fix this attempted report — a teammate deleted the match rule and now every order is paired with every customer (1,648 rows). Make each order pair with its actual buyer again.",
      template: "SELECT o.id, c.name, o.total\nFROM orders o\nJOIN customers c {1}\nORDER BY o.id\nLIMIT 5;",
      chips: ["ON c.id = o.customer_id", "ON o.id = c.id", "AND c.id = o.customer_id", "WHERE c.id = o.customer_id"],
      answers: ["ON c.id = o.customer_id"],
      why: "A JOIN with no match rule degenerates into a cartesian product — 103 × 16 = 1,648 rows. `ON c.id = o.customer_id` is the match rule that keeps each order with its actual buyer: 103 rows.",
      notes: [
        { slot: 1, why: "`AND …` dangles with nothing to attach to — the keyword that introduces a match rule is ON. (SQLite even runs a condition-less JOIN instead of erroring, which is why the nonsense result arrived at all.)" },
        { slot: 1, why: "`WHERE c.id = o.customer_id` happens to return the right rows here, but the pairing belongs in ON — WHERE is for filtering what the join produced, and writing the rule in ON keeps the query honest about its shape." },
        { slot: 1, why: "`ON o.id = c.id` matches ids 1-16 against each other — collisions between two independent counters, not real order→buyer pairs." },
      ],
    },
    {
      id: "l9-f4",
      prompt: "Marketing wants the dormant accounts: every order placed by an inactive customer. The flag lives on customers — join it in, then filter on it.",
      template: "SELECT o.id, c.name, c.active\nFROM orders o\nJOIN customers c ON {1}\nWHERE {2} = 0\nORDER BY o.id;",
      chips: ["c.id = o.customer_id", "o.id = c.id", "c.active", "o.active", "c.region"],
      answers: ["c.id = o.customer_id", "c.active"],
      why: "Whether an account is active is a fact about the customer, so it rides the join: match through the foreign key, then filter `c.active = 0`. The seed's two sleeping accounts (Keiko Sato, Dmitri Volkov) place 6 orders.",
      notes: [
        { slot: 2, why: "There is no `o.active` — orders doesn't track account state; the flag lives on customers and only reaches the query through the join." },
        { slot: 1, why: "`o.id = c.id` collides the two tables' id counters with each other — the real thread is orders.customer_id → customers.id." },
      ],
    },
    {
      id: "l9-f5",
      prompt: "Complete the SELECT so the buyer's name appears — the FROM already nicknames both tables for you.",
      template: "SELECT o.id, {1}.name, o.total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id\nLIMIT 5;",
      chips: ["c", "o", "orders", "customers"],
      answers: ["c"],
      why: "`c` is the nickname minted by `customers c` in FROM — every reference to the joined side goes through it. Qualifying with the alias is the habit that keeps joins readable about their sources.",
      notes: [
        { slot: 1, why: "`o` is orders' nickname, and orders carries no name column — `o.name` fails with `no such column: o.name`." },
        { slot: 1, why: "Once a table wears an alias, the original name retires — `customers.name` no longer resolves; the alias is the only handle." },
      ],
    },
  ],

  // Lesson 10 — INNER JOIN mechanics
  10: [
    {
      id: "l10-f1",
      prompt: "The fan-out census: one number — how many rows does joining orders to order_items produce? Count the pairs on purpose.",
      template: "SELECT COUNT(*) AS rows\nFROM orders o\n{1} order_items oi ON {2};",
      chips: ["JOIN", "LEFT JOIN", "oi.order_id = o.id", "oi.id = o.id"],
      answers: ["JOIN", "oi.order_id = o.id"],
      why: "The census counts PAIRS: each of the 251 lines rides on its order through order_items.order_id → orders.id. Feel the multiplication — 251 rows out of 103 orders.",
      notes: [
        { slot: 2, why: "`oi.id = o.id` pits the two tables' primary keys against each other — unrelated counters. The foreign key is order_items.order_id." },
        { slot: 1, why: "LEFT JOIN would count the same 251 here (every line finds its order), but the census is the plain inner join — bare JOIN is its exact spelling." },
      ],
    },
    {
      id: "l10-f2",
      prompt: "Fix this attempted query — it dies with `ambiguous column name: name`, because both joined tables have one. Qualify the reference so it names the product.",
      template: "SELECT {1}, s.name AS supplier, p.price\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nORDER BY p.price DESC\nLIMIT 5;",
      chips: ["p.name", "s.name", "name", "products.name", "product_name"],
      answers: ["p.name"],
      why: "products and suppliers both carry a name column, so a bare reference has two candidates and SQLite refuses to guess. `p.name` says which one you meant — and the AS supplier alias keeps the two headers apart.",
      notes: [
        { slot: 1, why: "`s.name` is legal but it's the SUPPLIER's name — the report's first column should be the product, and the supplier's name already has its own aliased column next to it." },
        { slot: 1, why: "`products.name` fails once the alias p exists — aliased tables answer only to their alias." },
      ],
    },
    {
      id: "l10-f3",
      prompt: "The APAC book of business: the first 10 orders placed by customers in the APAC region. The filter column lives on the joined side — that's the point.",
      template: "SELECT o.id, c.name, o.status\nFROM orders o\nJOIN customers c ON {1}\nWHERE {2} = 'APAC'\nORDER BY o.id\nLIMIT 10;",
      chips: ["c.id = o.customer_id", "o.id = c.id", "c.region", "o.region", "c.city"],
      answers: ["c.id = o.customer_id", "c.region"],
      why: "The match rule rides the foreign key, and the region filter lands on the joined side like any WHERE. orders has no region column — it only appears once customers join in.",
      notes: [
        { slot: 2, why: "There is no `o.region` — region lives on customers. The INNER JOIN delivers the column so you can filter on it." },
        { slot: 1, why: "`o.id = c.id` matches the two id counters against each other — order 1 with customer 1 and so on. The buyer thread is o.customer_id." },
      ],
    },
    {
      id: "l10-f4",
      prompt: "One row per order, no duplicates: the 251 joined lines repeat each order id once per line — collapse them back to the real 103.",
      template: "SELECT {1} oi.order_id AS id\nFROM order_items oi\nORDER BY id;",
      chips: ["DISTINCT", "UNIQUE", "ALL", "TOP", "FIRST"],
      answers: ["DISTINCT"],
      why: "DISTINCT keeps a single copy of each repeated value — the fanout collapses back to 103 rows, one per order that actually has lines.",
      notes: [
        { slot: 1, why: "`ALL` is the duplicate-KEEPING default — it's exactly what you're undoing. (TOP and FIRST aren't SQLite keywords at all.)" },
        { slot: 1, why: "`UNIQUE` is a constraint keyword for table definitions — it has no place in a SELECT list." },
      ],
    },
    {
      id: "l10-f5",
      prompt: "Line by line: the first 15 order lines with the product they refer to. Alias-and-qualify: both tables own an id column.",
      template: "SELECT oi.id, {1}.name, oi.quantity\nFROM order_items oi\nJOIN products p ON {2}\nORDER BY oi.id\nLIMIT 15;",
      chips: ["p", "oi", "s", "p.id = oi.product_id", "p.id = oi.id"],
      answers: ["p", "p.id = oi.product_id"],
      why: "One hop per join: each line pairs with its product through `oi.product_id → p.id`, and popular products appear again and again — the row multiplication lesson 10 is about.",
      notes: [
        { slot: 1, why: "`oi` is the line itself — it stores product_id, not the product's name; the name lives on the joined products side." },
        { slot: 2, why: "`p.id = oi.id` compares a product's key with the LINE's key — different counters entirely; the foreign key is oi.product_id." },
      ],
    },
  ],

  // Lesson 11 — Three-table chains
  11: [
    {
      id: "l11-f1",
      prompt: "The flagship chain: who bought what — order lines with the buyer and the product. Two threads leave order_items; write all three match rules.",
      template: "SELECT oi.id, c.name AS customer, p.name AS product\nFROM order_items oi\nJOIN orders o    ON {1}\nJOIN customers c ON {2}\nJOIN products p  ON {3}\nORDER BY oi.id\nLIMIT 5;",
      chips: ["o.id = oi.order_id", "c.id = o.customer_id", "p.id = oi.product_id", "c.id = oi.customer_id", "p.id = o.product_id"],
      answers: ["o.id = oi.order_id", "c.id = o.customer_id", "p.id = oi.product_id"],
      why: "Two threads leave order_items: order_id up to orders (then customer_id up to customers), and product_id straight to products. One JOIN … ON per hop — three joins, four tables, 251 lines with buyers and products attached.",
      notes: [
        { slot: 2, why: "order_items has no customer_id — the buyer is one more hop up, through orders.customer_id." },
        { slot: 3, why: "orders has no product_id — products hangs directly off order_items.product_id, skipping orders entirely." },
      ],
    },
    {
      id: "l11-f2",
      prompt: "Fix this attempted chain — a teammate reused the alias `o` for products, and now even the FIRST join errors with `ambiguous column name: o.id`. Give products its own nickname.",
      template: "SELECT oi.id, c.name AS customer, p.name AS product\nFROM order_items oi\nJOIN orders o    ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nJOIN products {1} ON p.id = oi.product_id\nORDER BY oi.id\nLIMIT 5;",
      chips: ["p", "o", "c", "oi"],
      answers: ["p"],
      why: "The alias `o` already names orders — rebinding it to products gives every `o.id` reference two candidates, and SQLite resolves names over the whole FROM at once. A fresh alias (`products p`) restores the chain.",
      notes: [
        { slot: 1, why: "That's the collision itself — `o` is taken by orders, and a second binding poisons even the earlier ON clauses that worked before." },
        { slot: 1, why: "`c` and `oi` are already spoken for by customers and order_items — the new table needs a name of its own." },
      ],
    },
    {
      id: "l11-f3",
      prompt: "The wearable trail: every order line involving a Wearables product, with buyer and product named. The category filter lands on the last table in the chain.",
      template: "SELECT oi.id, c.name AS customer, p.name AS product\nFROM order_items oi\nJOIN orders o    ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nJOIN {1} ON p.id = oi.product_id\nWHERE {2} = 'Wearables'\nORDER BY oi.id;",
      chips: ["products p", "suppliers s", "p.category", "o.status", "c.city"],
      answers: ["products p", "p.category"],
      why: "The category lives on products, so that hop joins in and the filter lands on it — the seed carries 25 Wearables lines. Once a table is in the chain, its columns are ordinary filterable columns: no extra joins needed.",
      notes: [
        { slot: 2, why: "`o.status` would filter orders, not product categories — the Wearables test is on the products side." },
        { slot: 1, why: "suppliers is one more hop past products and has no category column — it adds nothing to this trail." },
      ],
    },
    {
      id: "l11-f4",
      prompt: "The supplier trail: the first 15 lines with product AND supplier names. Two hops — items → products → suppliers.",
      template: "SELECT oi.id, p.name AS product, {1}.name AS supplier\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON {2}\nORDER BY oi.id\nLIMIT 15;",
      chips: ["s", "p", "s.id = p.supplier_id", "p.id = s.supplier_id", "s.id = oi.supplier_id"],
      answers: ["s", "s.id = p.supplier_id"],
      why: "Two hops, one JOIN each: items reach products via product_id, then products reach suppliers via supplier_id — the supplier's name now rides on every line.",
      notes: [
        { slot: 2, why: "Backwards — suppliers has no supplier_id column; the foreign key lives on products (p.supplier_id) and points at s.id." },
        { slot: 2, why: "order_items has no supplier_id either — the supplier is reached FROM products, one hop past it." },
        { slot: 1, why: "`p` is already taken by products — the supplier side needs its own alias, which the JOIN line just minted: s." },
      ],
    },
    {
      id: "l11-f5",
      prompt: "Big Berlin baskets: lines whose order was placed by a Berlin customer AND totals over 500. The chain already carries both filter columns.",
      template: "SELECT oi.id, c.name, o.total\nFROM order_items oi\nJOIN orders o    ON o.id = oi.order_id\nJOIN customers c ON {1}\nWHERE c.city = 'Berlin' AND o.total > 500\nORDER BY oi.id;",
      chips: ["c.id = o.customer_id", "o.id = c.id", "c.id = oi.customer_id", "o.customer_id = oi.order_id"],
      answers: ["c.id = o.customer_id"],
      why: "Match on the real foreign key and the chain delivers both filter columns — city on customers, total on orders. Berlin's six big baskets spread across 18 lines.",
      notes: [
        { slot: 1, why: "`o.id = c.id` collides the two id counters — the buyer thread is orders.customer_id → customers.id." },
        { slot: 1, why: "`o.customer_id = oi.order_id` compares a customer id with an order id — numbers from two different id spaces that occasionally collide." },
      ],
    },
  ],

  // Lesson 12 — LEFT JOIN: keep the left side
  12: [
    {
      id: "l12-f1",
      prompt: "The whole book, gaps and all: every customer with every order they've placed — written defensively as an outer join, ordered by name then order id.",
      template: "SELECT c.name, o.id AS order_id, o.total\nFROM customers c\n{1} orders o ON {2}\nORDER BY c.name, o.id;",
      chips: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "o.customer_id = c.id", "o.id = c.id"],
      answers: ["LEFT JOIN", "o.customer_id = c.id"],
      why: "LEFT protects the FROM side — every customer stays, NULL-filled if they'd never ordered. The ON reads right-to-left here because orders holds the foreign key: `o.customer_id = c.id`.",
      notes: [
        { slot: 1, why: "RIGHT JOIN protects orders instead — the wrong side of this brief, and a keyword older SQLite builds reject outright. Flip the tables and stay LEFT." },
        { slot: 1, why: "INNER (bare JOIN) gives the same rows on this seed — everyone has ordered — but the brief asks for the defensive spelling that could never silently drop a customer." },
        { slot: 2, why: "`o.id = c.id` matches the two id counters against each other; the customer thread is o.customer_id." },
      ],
    },
    {
      id: "l12-f2",
      prompt: "Fix this attempted audit — the never-shipped report returns NOTHING, because the status filter sits in WHERE and deletes the NULL rows the answer is made of. Put each piece where it belongs.",
      template: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n{1}\nWHERE {2}\nORDER BY c.name;",
      chips: ["AND o.status = 'shipped'", "WHERE o.status = 'shipped'", "o.id IS NULL", "o.id IS NOT NULL", "AND c.name IS NULL"],
      answers: ["AND o.status = 'shipped'", "o.id IS NULL"],
      why: "Inside ON, `o.status = 'shipped'` shapes the match — customers without one stay, NULL-filled. `WHERE o.id IS NULL` then keeps exactly those gaps: the seed's six never-shipped customers.",
      notes: [
        { slot: 1, why: "A second WHERE can't exist — and that's the point: in WHERE the status test would delete the NULL-filled rows before IS NULL could find them, silently turning the join inner. Right-table conditions belong in ON." },
        { slot: 2, why: "`IS NOT NULL` keeps the matched customers — the opposite of never-shipped. The gaps are where the order arm came up NULL." },
        { slot: 2, why: "`c.name IS NULL` tests the left side, which is never NULL — every customer would survive, matched or not." },
      ],
    },
    {
      id: "l12-f3",
      prompt: "Flip the protection: rewrite so ORDERS are the guaranteed side — every order survives even if its buyer went missing.",
      template: "SELECT o.id, c.name\nFROM orders o\n{1} customers c ON c.id = o.customer_id\nORDER BY o.id\nLIMIT 5;",
      chips: ["LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "NATURAL JOIN", "CROSS JOIN"],
      answers: ["LEFT JOIN"],
      why: "Whatever FROM names is the protected side — orders sits there, so LEFT JOIN guarantees all 103 orders survive. On this seed every order has a buyer, but the guarantee is about orders, not customers.",
      notes: [
        { slot: 1, why: "RIGHT JOIN would protect the joined side (customers) instead — position decides protection, and customers sits on the right here." },
        { slot: 1, why: "NATURAL JOIN pairs same-named columns automatically — the opposite of this schema's deliberately different FK names, and SQLite doesn't support it anyway." },
      ],
    },
    {
      id: "l12-f4",
      prompt: "The spotless audit: count the customers with NO cancelled order. Cancelled orders attach when they exist; the count lives on the customers where nothing attached.",
      template: "SELECT COUNT(*) AS spotless\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND {1}\nWHERE {2};",
      chips: ["o.status = 'cancelled'", "o.status = 'pending'", "o.id IS NULL", "c.id IS NULL", "o.total IS NULL"],
      answers: ["o.status = 'cancelled'", "o.id IS NULL"],
      why: "The status test in ON shapes the match; `o.id IS NULL` keeps the customers nothing attached to — the seed's 12 spotless records.",
      notes: [
        { slot: 1, why: "Pending is a different watch list — this audit is about cancelled orders." },
        { slot: 2, why: "`c.id` comes from the left side and is never NULL — the test would count every customer (16), matched or not." },
        { slot: 2, why: "`o.total IS NULL` would work here on this seed, but total could legitimately be NULL in other data — the primary key o.id is the airtight no-match signature." },
      ],
    },
    {
      id: "l12-f5",
      prompt: "The shipped dossier's match rule: every customer with their shipped orders, gaps kept. Which condition completes the ON clause — and why there?",
      template: "SELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND {1}\nORDER BY c.name, o.id;",
      chips: ["o.status = 'shipped'", "c.status = 'shipped'", "o.shipped_at IS NOT NULL", "WHERE o.status = 'shipped'"],
      answers: ["o.status = 'shipped'"],
      why: "In ON, the status test shapes matching: the 30 shipped orders attach, and the 6 customers without one survive as NULL rows — 36 rows total. In WHERE the same test would delete those 6 and silently turn the join inner.",
      notes: [
        { slot: 1, why: "customers has no status column — status is a fact about orders." },
        { slot: 1, why: "`o.shipped_at IS NOT NULL` looks equivalent, but shipped_at is the lesson-4 teaching column — NULL for pending and cancelled orders that DID match; status is the cleaner condition on the match." },
        { slot: 1, why: "The ON clause can't open with WHERE — two WHERE clauses in one query don't parse." },
      ],
    },
  ],

  // Lesson 13 — Anti-join: finding the holes
  13: [
    {
      id: "l13-f1",
      prompt: "The three-piece anti-join, assembled in full: customers who have NEVER had a delivered order.",
      template: "SELECT c.name\nFROM customers c\n{1} orders o\n       ON o.customer_id = c.id\n      {2} o.status = 'delivered'\nWHERE {3}\nORDER BY c.name;",
      chips: ["LEFT JOIN", "INNER JOIN", "AND", "OR", "o.id IS NULL", "c.id IS NULL"],
      answers: ["LEFT JOIN", "AND", "o.id IS NULL"],
      why: "The anti-join in full: LEFT JOIN preserves everyone, AND keeps the delivered-only match inside ON, and `o.id IS NULL` keeps just the gaps — exactly one customer has never been delivered to.",
      notes: [
        { slot: 1, why: "INNER JOIN drops the very rows the anti-join hunts — the never-delivered customer has no matching row to keep." },
        { slot: 2, why: "OR would match every order OR delivered ones — that's every order, and the holes vanish entirely." },
        { slot: 3, why: "`c.id` comes from the left side and is never NULL — the no-match test aims at the right table's primary key, o.id." },
      ],
    },
    {
      id: "l13-f2",
      prompt: "Fix this attempted sweep — products that appear in NO pending order. The two-hop list is built correctly; the final no-match test is missing. Complete it.",
      template: "SELECT p.name\nFROM products p\nLEFT JOIN (\n  SELECT DISTINCT oi.product_id\n  FROM order_items oi\n  JOIN orders o ON o.id = oi.order_id\n  WHERE o.status = 'pending'\n) pend ON pend.product_id = p.id\n{1}\nORDER BY p.name;",
      chips: [
        "WHERE pend.product_id IS NULL",
        "WHERE p.id IS NULL",
        "WHERE NOT IN (pend.product_id)",
        "WHERE pend.product_id IS NOT NULL",
        "AND pend.product_id IS NULL",
      ],
      answers: ["WHERE pend.product_id IS NULL"],
      why: "Filter first, join second: the subquery collects every product_id seen in a pending order, and the IS NULL test keeps the products it never touched — five of the sixteen never ride a pending order.",
      notes: [
        { slot: 1, why: "`p.id` comes from the outer products table and is never NULL — the test must aim at the joined arm: pend.product_id." },
        { slot: 1, why: "`NOT IN (pend.product_id)` isn't even valid spelling against a bare column — and the lesson's warn stands: NOT IN over a subquery returns nothing if that subquery ever yields a single NULL." },
        { slot: 1, why: "`AND …` dangles with no clause to extend — the no-match test is a fresh WHERE condition." },
      ],
    },
    {
      id: "l13-f3",
      prompt: "Active and spotless: among active customers (active = 1), who has never had an order cancelled? The status stays in ON; the active flag is a LEFT-side filter, safe in WHERE.",
      template: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status = {1}\nWHERE {2} AND c.active = 1\nORDER BY c.name;",
      chips: ["'cancelled'", "'delivered'", "o.id IS NULL", "o.status IS NULL", "c.id IS NULL"],
      answers: ["'cancelled'", "o.id IS NULL"],
      why: "The anti-join is unchanged — status in ON, IS NULL in WHERE. The new part filters the LEFT table: `c.active = 1` just narrows who enters the query. Eleven active names make the spotless list.",
      notes: [
        { slot: 2, why: "`o.status IS NULL` happens to work on this seed, but status could be NULL in real data — the primary key o.id is the reliable no-match signature." },
        { slot: 1, why: "Delivered is the opposite watch list — the record must be spotless of CANCELLED orders." },
        { slot: 2, why: "`c.id IS NULL` tests the left side, which never goes NULL — it would keep all 16 customers." },
      ],
    },
    {
      id: "l13-f4",
      prompt: "The no-shipment census: one number — customers who have never had an order in 'shipped' status. Which column makes the no-match test airtight?",
      template: "SELECT COUNT(*) AS no_shipment\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'\nWHERE {1};",
      chips: ["o.id IS NULL", "o.shipped_at IS NULL", "o.status IS NULL", "c.id IS NULL", "o.total IS NULL"],
      answers: ["o.id IS NULL"],
      why: "o.id is the right table's primary key — NULL exactly when nothing matched. Six customers have no shipment. `shipped_at` would lie: it's also NULL for the 21 pending and cancelled orders that DID match, inventing holes.",
      notes: [
        { slot: 1, why: "shipped_at is NULL for every pending and cancelled order too — those customers matched real orders, so testing it over-reports the holes." },
        { slot: 1, why: "`c.id` never goes NULL — the test would count every customer, not the gaps." },
      ],
    },
    {
      id: "l13-f5",
      prompt: "The complement audit: customers whose EVERY order is delivered. Match on any order that is NOT delivered, keep the gaps, count them.",
      template: "SELECT {1} AS clean_customers\nFROM customers c\nLEFT JOIN orders o\n       ON o.customer_id = c.id\n      AND o.status {2} 'delivered'\nWHERE o.id IS NULL;",
      chips: ["COUNT(*)", "SUM(*)", "<>", "="],
      answers: ["COUNT(*)", "<>"],
      why: "\"Every order delivered\" is the complement: match on `o.status <> 'delivered'`, keep the customers where nothing attached, and count them — three names make the clean list.",
      notes: [
        { slot: 2, why: "Equality matches delivered orders — it finds customers WITH deliveries, the opposite audit." },
        { slot: 1, why: "SUM needs a numeric column and can't count rows — the hole counter is COUNT(*)." },
      ],
    },
  ],

  // Lesson 14 — Self-join: a table against itself
  14: [
    {
      id: "l14-f1",
      prompt: "The regional roll call: every same-region customer pair, no mirrors, no self-pairs. The table appears twice — spell the second copy and the guard.",
      template: "SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region\nFROM customers c1\n{1} customers {2}\n     ON  c1.region = c2.region\n     AND {3}\nORDER BY c1.region, pair_a;",
      chips: ["JOIN", "c2", "c1", "c1.id < c2.id", "c1.id <> c2.id"],
      answers: ["JOIN", "c2", "c1.id < c2.id"],
      why: "The same table twice, each copy under its own alias: c2 shares the region, and the strict `<` guard removes self-pairs and mirrors in one comparison — 39 honest pairs (EU 28, APAC 10, US 1, LATAM 0).",
      notes: [
        { slot: 3, why: "`<>` drops self-pairs but keeps BOTH mirror orientations — every pair twice. Only strict `<` keeps one." },
        { slot: 2, why: "The second copy needs a DIFFERENT alias — reusing c1 is the ambiguity the two aliases exist to solve." },
      ],
    },
    {
      id: "l14-f2",
      prompt: "The US duo: same-region pairs, but only in the US region. Should be a very short list.",
      template: "SELECT c1.name AS pair_a, c2.name AS pair_b\nFROM customers c1\nJOIN customers c2\n     ON c1.region = c2.region AND c1.id < c2.id\nWHERE c1.region = {1}\nORDER BY pair_a;",
      chips: ["'US'", "'LATAM'", "US", "'EU'", "'APAC'"],
      answers: ["'US'"],
      why: "Two customers live stateside — Emma Wilson and Jamal Wright make exactly one pair. The region is text, so it wears single quotes.",
      notes: [
        { slot: 1, why: "Unquoted US would be read as a column name — region values are text and need quotes." },
        { slot: 1, why: "LATAM is the lesson's zero-pair region: Bruno is its only customer, and pairing needs two distinct people." },
      ],
    },
    {
      id: "l14-f3",
      prompt: "Fix this attempted count — a teammate's pair counter reads 94, self-pairs and mirrors included. The honest total is 39. Complete the join so each pair counts once.",
      template: "SELECT COUNT(*) AS pair_count\nFROM customers c1\nJOIN customers c2\n     ON  {1}\n     AND {2};",
      chips: ["c1.region = c2.region", "c1.city = c2.city", "c1.id < c2.id", "c1.id <> c2.id", "c1.id = c2.id"],
      answers: ["c1.region = c2.region", "c1.id < c2.id"],
      why: "Region equality gathers same-region copies and the strict id inequality prunes self-pairs and mirrors — 28 EU + 10 APAC + 1 US + 0 LATAM = 39. The 94 came from counting the raw n² grid.",
      notes: [
        { slot: 2, why: "`<>` keeps both mirror orientations, so every pair counts twice (78) — and `=` adds 16 self-pairs on top. Strict `<` does both jobs in one comparison." },
        { slot: 1, why: "`c1.city = c2.city` is a legal join — but provably empty here: all 16 customers live in different cities. The brief is about regions." },
      ],
    },
    {
      id: "l14-f4",
      prompt: "Category siblings: products that share a category, one row per pair. The guard rails do the heavy lifting — same three lines, different table.",
      template: "SELECT p1.name AS sibling_a, p2.name AS sibling_b, p1.category\nFROM {1}\n     ON  p1.category = p2.category\n     AND p1.id < p2.id\nORDER BY p1.category, sibling_a;",
      chips: [
        "products p1 JOIN products p2",
        "products p1 JOIN suppliers p2",
        "customers p1 JOIN products p2",
        "products p1, products p2",
      ],
      answers: ["products p1 JOIN products p2"],
      why: "Pairing rows by a shared key means joining the table to a second copy of ITSELF: products p1 against products p2 — 12 sibling pairs, each named once.",
      notes: [
        { slot: 1, why: "suppliers has no category column — and the ON's p1./p2. references expect two copies of products." },
        { slot: 1, why: "The comma style can't carry the ON that follows — one explicit JOIN per pairing." },
      ],
    },
    {
      id: "l14-f5",
      prompt: "Same-month doubles: pair each order with others from the same customer AND the same calendar month (SUBSTR(created_at, 1, 7)), guarded to one orientation. Write all three conditions.",
      template: "SELECT o1.id AS first_id, o2.id AS second_id,\n       SUBSTR(o1.created_at, 1, 7) AS month\nFROM orders o1\nJOIN orders o2\n     ON  {1}\n     AND {2}\n     AND {3}\nORDER BY first_id, second_id;",
      chips: [
        "o1.customer_id = o2.customer_id",
        "o1.id < o2.id",
        "SUBSTR(o1.created_at, 1, 7) = SUBSTR(o2.created_at, 1, 7)",
        "o1.id = o2.id",
        "o1.total = o2.total",
      ],
      answers: [
        "o1.customer_id = o2.customer_id",
        "o1.id < o2.id",
        "SUBSTR(o1.created_at, 1, 7) = SUBSTR(o2.created_at, 1, 7)",
      ],
      why: "A two-part shared key — same customer AND same month slice — with the one-sided id guard keeping one orientation per double: 32 of them on this seed.",
      notes: [
        { slot: 2, why: "`=` matches each order with itself — 103 degenerate pairs; the strict `<` blocks self-pairs and mirrors alike." },
        { slot: 3, why: "`o1.total = o2.total` tests amount, not time — two different customers can spend the same in different months." },
        { slot: 1, why: "Same total doesn't make a double — the pairing key is the shared customer." },
      ],
    },
  ],

  // Lesson 15 — Joins + aggregates
  15: [
    {
      id: "l15-f1",
      prompt: "The spend leaderboard: total spend per customer, biggest first. Join, bucket, round — three pieces.",
      template: "SELECT c.name, {1} AS spend\nFROM customers c\nJOIN orders o ON {2}\n{3} c.id\nORDER BY spend DESC;",
      chips: ["ROUND(SUM(o.total), 2)", "SUM(o.total)", "o.customer_id = c.id", "c.id = o.id", "GROUP BY", "HAVING"],
      answers: ["ROUND(SUM(o.total), 2)", "o.customer_id = c.id", "GROUP BY"],
      why: "Join first, collapse second: match through the foreign key, bucket per customer with `GROUP BY c.id` (displaying c.name), and the rounded sum crowns Alice Chen at 7,262.35.",
      notes: [
        { slot: 1, why: "The bare SUM runs, but money wants two decimals — ROUND(…, 2) keeps the leaderboard readable." },
        { slot: 2, why: "`c.id = o.id` collides the two id counters — the spend thread is o.customer_id → c.id." },
        { slot: 3, why: "HAVING filters groups after they form — the missing piece here is the bucketing keyword itself: GROUP BY." },
      ],
    },
    {
      id: "l15-f2",
      prompt: "Fix this attempted report — a teammate's orders-per-customer count uses the row counter, which reports 1 for a customer with zero orders (the ghost row). Which count sees through the NULL?",
      template: "SELECT c.name, {1} AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\n{2} COUNT(o.id) > 0\nORDER BY orders DESC;",
      chips: ["COUNT(o.id)", "COUNT(*)", "SUM(o.id)", "HAVING", "WHERE"],
      answers: ["COUNT(o.id)", "HAVING"],
      why: "COUNT(*) counts the NULL-filled ghost row as 1; `COUNT(o.id)` skips NULLs and reports the honest 0. And the bucket-level test needs HAVING — aggregates don't exist yet at WHERE time.",
      notes: [
        { slot: 1, why: "The ghost row is a real row — COUNT(*) reports an order that never happened. Only a right-side column like o.id can see through the NULL." },
        { slot: 2, why: "WHERE runs before groups exist — COUNT isn't visible there; filters on aggregates go in HAVING." },
        { slot: 1, why: "SUM(o.id) adds ids together — a meaningless number, not a count of orders." },
      ],
    },
    {
      id: "l15-f3",
      prompt: "Revenue by category: line-item revenue — quantity × unit_price, summed — per product category, richest first.",
      template: "SELECT p.category, {1} AS revenue\nFROM order_items oi\nJOIN products p ON {2}\nGROUP BY p.category\nORDER BY revenue DESC;",
      chips: [
        "ROUND(SUM(oi.quantity * oi.unit_price), 2)",
        "ROUND(SUM(oi.quantity), 2)",
        "ROUND(SUM(oi.unit_price), 2)",
        "p.id = oi.product_id",
        "oi.id = p.id",
      ],
      answers: ["ROUND(SUM(oi.quantity * oi.unit_price), 2)", "p.id = oi.product_id"],
      why: "Line revenue is quantity × unit_price per line, summed inside each category bucket — Audio leads the store at 11,744.01. The label lives on products; the measures on order_items.",
      notes: [
        { slot: 1, why: "SUM(quantity) counts units sold, not money — the price has to be multiplied in per line before summing." },
        { slot: 1, why: "SUM(unit_price) adds sticker prices while ignoring how many units each line sold." },
        { slot: 2, why: "`oi.id = p.id` compares the line's key with the product's key — different counters; the foreign key is oi.product_id." },
      ],
    },
    {
      id: "l15-f4",
      prompt: "Revenue per customer REGION: the 103 orders collapse into regional buckets. Which clause carves them?",
      template: "SELECT c.region, ROUND(SUM(o.total), 2) AS revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\n{1} c.region\nORDER BY revenue DESC;",
      chips: ["GROUP BY", "HAVING", "ORDER BY", "WHERE", "PARTITION BY"],
      answers: ["GROUP BY"],
      why: "`GROUP BY c.region` makes one bucket per distinct region — four rows for APAC, EU, LATAM and US, EU leading at 15,089.23. The bucket count equals the DISTINCT values of the grouped column.",
      notes: [
        { slot: 1, why: "ORDER BY sorts, it never buckets — without GROUP BY the SUM spans all 103 orders in a single row." },
        { slot: 1, why: "HAVING filters groups after they form — it can't create the region buckets." },
      ],
    },
    {
      id: "l15-f5",
      prompt: "The heavy users: customers with MORE THAN 10 orders, busiest first. The condition is about a group, not a row.",
      template: "SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\n{1} COUNT(o.id) > {2}\nORDER BY orders DESC;",
      chips: ["HAVING", "WHERE", "10", "3", "ORDER BY"],
      answers: ["HAVING", "10"],
      why: "`HAVING` evaluates after the buckets form — exactly what a per-group count needs. Four customers clear the bar of 10: Alice (24), Emma (17), Grace (14), Maya (13).",
      notes: [
        { slot: 1, why: "WHERE runs before groups exist and can't see COUNT — group-level tests go in HAVING." },
        { slot: 2, why: "The brief's bar is MORE THAN 10 — a lower threshold would admit half the store." },
        { slot: 2, why: "ORDER BY can't introduce the filter — it only ranks what HAVING kept." },
      ],
    },
  ],

  // Lesson 16 — Capstone: join pitfalls & power moves
  16: [
    {
      id: "l16-f1",
      prompt: "Commit the crime on purpose: sum the one-side column AFTER the join, and stare at the inflated total (the store's truth is 34,833.28).",
      template: "SELECT ROUND(SUM(o.total), 2) AS inflated\nFROM orders o\n{1} order_items oi ON {2};",
      chips: ["JOIN", "LEFT JOIN", "oi.order_id = o.id", "oi.id = o.id"],
      answers: ["JOIN", "oi.order_id = o.id"],
      why: "The 103 orders fan out to 251 lines, so each total rides along once per line — the join replicates, SUM dutifully adds every copy: 103,244.55, almost 3× the truth. No error, no warning.",
      notes: [
        { slot: 2, why: "`oi.id = o.id` pits the two primary keys against each other — the replication (and the crime) happens along the real foreign key oi.order_id." },
        { slot: 1, why: "LEFT JOIN inflates identically here (every order has lines) — the crime is the one-side SUM across a one-to-many join, whatever the outer keyword." },
      ],
    },
    {
      id: "l16-f2",
      prompt: "Fix this attempted dashboard — it summed o.total across the join and triple-counted revenue. Bucket per order so the line-item SUM stays inside each order's own lines.",
      template: "SELECT o.id,\n       o.total,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\n{1} {2}\nORDER BY o.id\nLIMIT 10;",
      chips: ["GROUP BY", "HAVING", "o.id", "SUM(o.total)", "COUNT(*)"],
      answers: ["GROUP BY", "o.id"],
      why: "`GROUP BY o.id` partitions the 251 joined rows so each SUM sees exactly one order's own lines — order 1's rebuild (576.54) now matches its stored total exactly. Aggregate first, join second.",
      notes: [
        { slot: 1, why: "HAVING filters buckets after they form — the missing piece is the bucketing itself: GROUP BY." },
        { slot: 2, why: "SUM(o.total) or COUNT(*) here would group by the wrong thing — the bucket key is the order's own primary key, o.id." },
      ],
    },
    {
      id: "l16-f3",
      prompt: "The damage report: honest revenue, inflated revenue, and the ratio — in one row. The honest figure MUST come from its own scan; inside the join it's already contaminated.",
      template: "SELECT\n  {1} AS honest,\n  ROUND(SUM(o.total), 2) AS inflated,\n  ROUND(SUM(o.total) / {2}, 2) AS ratio\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id;",
      chips: [
        "(SELECT ROUND(SUM(total), 2) FROM orders)",
        "(SELECT SUM(total) FROM orders)",
        "(SELECT SUM(total) FROM order_items)",
        "SUM(o.total)",
      ],
      answers: ["(SELECT ROUND(SUM(total), 2) FROM orders)", "(SELECT SUM(total) FROM orders)"],
      why: "The baseline is a scalar subquery over plain orders — 34,833.28 — while the joined SUM reads 103,244.55. The ratio lands on 2.96: the join nearly tripled the truth.",
      notes: [
        { slot: 1, why: "order_items has no total column — that subquery errors; the honest figure is the stored orders.total, scanned unjoined." },
        { slot: 2, why: "SUM(o.total) in the denominator is the inflated number itself — the ratio would read 1.00 and hide the damage." },
        { slot: 2, why: "The baseline keeps full precision (no ROUND) so the division isn't rounding's opinion — the honest column is the one that displays rounded." },
      ],
    },
    {
      id: "l16-f4",
      prompt: "The trusted leaderboard: top 5 customers by LINE-ITEM revenue — the measure that can't be inflated. Three tables, one clean answer.",
      template: "SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM customers c\nJOIN orders o ON {1}\nJOIN order_items oi ON oi.order_id = o.id\n{2} c.id\nORDER BY revenue DESC\nLIMIT 5;",
      chips: ["o.customer_id = c.id", "o.id = c.id", "GROUP BY", "ORDER BY", "WHERE"],
      answers: ["o.customer_id = c.id", "GROUP BY"],
      why: "Line-item revenue is defined per LINE, so the join multiplies nothing that matters. Bucket per customer — Alice Chen leads at 7,262.35 — and the number survives the pre-flight checklist.",
      notes: [
        { slot: 1, why: "`o.id = c.id` collides the two id counters — the chain rides orders.customer_id → c.id." },
        { slot: 2, why: "ORDER BY ranks but never buckets — without GROUP BY c.id the SUM spans every customer's lines in one row." },
      ],
    },
    {
      id: "l16-f5",
      prompt: "The DISTINCT salvage audit: how many distinct ORDERS ride on the 251 joined rows? Dedupe by identity, not by accident.",
      template: "SELECT COUNT(*) AS rows_joined,\n       COUNT({1}) AS orders_distinct\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id;",
      chips: ["DISTINCT o.id", "DISTINCT oi.id", "o.id", "DISTINCT *", "ALL o.id"],
      answers: ["DISTINCT o.id"],
      why: "COUNT(DISTINCT o.id) dedupes the fanout by identity: 251 rows collapse back to 103 real orders. The same trick on totals would dedupe VALUES — one shared amount and an order silently drops from the sum.",
      notes: [
        { slot: 1, why: "Every line id is unique — deduping lines counts 251 again, not the 103 orders riding on them." },
        { slot: 1, why: "COUNT(DISTINCT *) isn't valid spelling — dedupe a named key column." },
      ],
    },
  ],

  // Lesson 36 — Case study: Module 2's joins under one brief (capstone)
  36: [
    {
      id: "l36-f1",
      prompt: "The heaviest buyers: top 5 customers by order count, busiest first. Module 2's widening join, bucketed and zero-safe.",
      template: "SELECT c.name, COUNT({1}) AS order_count\nFROM customers c\n{2} orders o ON {3}\nGROUP BY c.id\nORDER BY order_count DESC, c.name\nLIMIT 5;",
      chips: ["o.id", "c.id", "LEFT JOIN", "JOIN", "o.customer_id = c.id"],
      answers: ["o.id", "LEFT JOIN", "o.customer_id = c.id"],
      why: "The widening join rides the foreign key, LEFT keeps every customer so the count can never lie about zeros, and `COUNT(o.id)` counts real matches — Alice Chen tops the leaderboard at 24.",
      notes: [
        { slot: 1, why: "COUNT(c.id) counts customers, not their orders — every group would read 1. The right side's id is the column that sees through NULLs." },
        { slot: 2, why: "Bare JOIN gives the same rows today (everyone has ordered) — but LEFT documents the zero-safe intent: the day an orderless customer appears, the count stays honest at 0." },
        { slot: 3, why: "The FK thread points from the many side home: o.customer_id = c.id. o.id = c.id would collide the two counters." },
      ],
    },
    {
      id: "l36-f2",
      prompt: "Stuck before shipping: customers with NO shipped order at all, spelled as the full anti-join. Place all three pieces — the case study's tip says exactly where each lives.",
      template: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n       ON {1}\n      {2}\nWHERE {3}\nORDER BY c.name;",
      chips: ["o.customer_id = c.id", "o.id = c.id", "AND o.status = 'shipped'", "WHERE o.status = 'shipped'", "o.id IS NULL"],
      answers: ["o.customer_id = c.id", "AND o.status = 'shipped'", "o.id IS NULL"],
      why: "The status test lives in ON (shaping the match), the no-match test in WHERE (`o.id IS NULL`) — swap them and the six never-shipped customers (Bruno, Chloe, Dmitri, Farid, Keiko, Olivia) are deleted instead of found.",
      notes: [
        { slot: 2, why: "A second WHERE can't parse — and conceptually: status = 'shipped' in WHERE would kill the NULL rows you're hunting, collapsing the anti-join into an inner join." },
        { slot: 1, why: "`o.id = c.id` collides the two id counters — the customer thread is the foreign key o.customer_id." },
      ],
    },
    {
      id: "l36-f3",
      prompt: "What each category is worth: revenue per category from the item lines, richest first — the measure that can't inflate.",
      template: "SELECT p.category, {1} AS revenue\nFROM order_items oi\nJOIN products p ON {2}\nGROUP BY p.category\nORDER BY revenue DESC;",
      chips: [
        "ROUND(SUM(oi.quantity * oi.unit_price), 2)",
        "ROUND(SUM(o.total), 2)",
        "ROUND(AVG(oi.unit_price), 2)",
        "p.id = oi.product_id",
        "oi.order_id = p.id",
      ],
      answers: ["ROUND(SUM(oi.quantity * oi.unit_price), 2)", "p.id = oi.product_id"],
      why: "Category worth lives on the item lines — quantity × unit_price summed per product category, Audio richest at 11,744.01. Reaching for o.total here would drag the fan-out trap in for free.",
      notes: [
        { slot: 1, why: "orders.total is an order-level fact — joined in, every total replicates once per line (the case study's 3× crime). The line's own quantity × unit_price is the safe measure." },
        { slot: 1, why: "AVG of sticker prices ignores units sold — revenue multiplies the two per line, then sums." },
        { slot: 2, why: "`oi.order_id = p.id` pairs a line's ORDER with a product — unrelated keys; products hangs off oi.product_id." },
      ],
    },
    {
      id: "l36-f4",
      prompt: "Fix this attempted report — the founder's dashboard reads 103,244.55 because someone joined items in. The brief is explicit: NO joins. Rebuild the true number from the table that owns the column.",
      template: "SELECT {1} AS true_revenue\n{2};",
      chips: ["ROUND(SUM(total), 2)", "COUNT(total)", "FROM orders", "FROM orders o JOIN order_items oi ON oi.order_id = o.id", "FROM order_items"],
      answers: ["ROUND(SUM(total), 2)", "FROM orders"],
      why: "Revenue is a fact of orders — sum it straight from the owning table and the store's truth reads 34,833.28. No join, no replication, no 3× surprise.",
      notes: [
        { slot: 2, why: "That's the crime scene — 251 replicated rows and 103,244.55. The brief says no joins for exactly this reason." },
        { slot: 1, why: "COUNT tallies receipts (103 of them), not money — revenue is the SUM of totals." },
        { slot: 2, why: "order_items owns quantity and unit_price, not total — summing `total` there errors with `no such column`." },
      ],
    },
    {
      id: "l36-f5",
      prompt: "Region mates: how many pairs of customers share a region — each pair once, nobody paired with themselves? The module's last instrument points the table at itself.",
      template: "SELECT COUNT(*) AS region_pairs\nFROM customers a\n{1} customers b\n     ON a.region = b.region\n     AND {2};",
      chips: ["JOIN", "LEFT JOIN", "a.id < b.id", "a.id <> b.id", "a.id = b.id"],
      answers: ["JOIN", "a.id < b.id"],
      why: "Region equality gathers same-region copies and the strict `<` keeps each pair exactly once — 39 pairs, EU's 28 leading the count. The same three lines pair any table that shares a key.",
      notes: [
        { slot: 2, why: "`<>` keeps both mirror orientations — every pair counts twice (78); `=` adds 16 self-pairs. Only the one-sided `<` prunes both." },
        { slot: 1, why: "LEFT JOIN would fabricate a NULL row for every customer without a smaller-id partner — COUNT(*) drifts to 43 ghosts. Pairing is an inner job." },
      ],
    },
  ],
};
