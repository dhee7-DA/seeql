import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson36: Lesson = {
  id: "lesson-36",
  num: 36,
  title: "Case study — who's still buying?",
  blurb: "Module 2's joins under one brief: retention, anti-joins, honest revenue and region mates",
  minutes: 16,
  blocks: [
    {
      kind: "p",
      text: "The founder is back, and this time the questions cross tables: *'Who orders the most? Who has orders stuck without a shipping scan? Who never got anything delivered? What's each category actually worth — and don't inflate the total this time.'* Single-table SQL can't answer any of it, because every answer lives on the far side of a foreign key. This is Module 2's toolkit under one brief: joins as instruments, each chosen for what it keeps and what it drops.",
    },
    {
      kind: "bullets",
      items: [
        "**Order counts** need a widening join — customers pulled alongside their orders, then bucketed per customer.",
        "**'Never shipped' / 'never delivered'** are anti-joins: keep the customer rows whose order arm came up NULL.",
        "**Category revenue** walks the item lines — `order_items → products` — because that's where quantity and unit price live.",
        "**The honest total** is the trap: join first, sum later, and the numbers multiply. The brief says *don't*.",
        "**Region mates** are a self-join — the customers table pairing with itself.",
      ],
    },
    { kind: "diagram", figure: "l36-join-instruments" },
    {
      kind: "warn",
      text: "The fan-out trap in numbers: orders joined to order_items repeats every order's total once per line item — the store's 34,833.28 becomes 103,244.55. Three times the truth, zero errors thrown. When a total must match reality, sum the table that owns the column.",
    },
    {
      kind: "tip",
      text: "For every anti-join, ask WHERE the filter lives: `status = 'shipped'` belongs in ON (filtering the order arm), while `o.id IS NULL` belongs in WHERE (testing what survived). Swap them and the query silently becomes an inner join.",
    },
  ],
  mcqs: [
    {
      id: "l36-q1",
      prompt: "For 'customers with no shipped order', why does `status = 'shipped'` belong in ON — not WHERE?",
      choices: [
        "It doesn't — WHERE is always equivalent",
        "In ON it filters only the order arm, so customers with zero shipped orders survive as NULL rows; in WHERE they'd be deleted",
        "ON is faster for status checks",
        "WHERE can't reference status columns",
      ],
      answer: 1,
      why: "The LEFT JOIN must produce NULL-carrying rows for the six no-shipment customers — that IS the answer. A WHERE on status would discard those NULL rows before you could test them, collapsing the anti-join into an inner join.",
      notes: [
        { choice: 0, why: "Equivalence holds only for inner joins. The entire anti-join pattern depends on the outer join's NULL rows surviving to the WHERE stage." },
      ],
    },
    {
      id: "l36-q2",
      prompt: "`SELECT ROUND(SUM(o.total), 2) FROM orders o JOIN order_items oi ON oi.order_id = o.id` returns 103,244.55 — but the real revenue is 34,833.28. What happened?",
      choices: [
        "The join dropped rows",
        "Every order's total was counted once per line item — a 3-line order contributed its total three times",
        "ROUND is lossy",
        "order_items contains duplicate rows",
      ],
      answer: 1,
      why: "103 orders fan out to 251 line items; each order's total rides along on every copy. The sum triple-counts by design of the join shape — the fix is summing `orders.total` with no items join, or aggregating items separately.",
      notes: [
        { choice: 2, why: "ROUND never touches the input values, only the display. The inflation is structural: 251 lines vs 103 orders is roughly the 3× you see." },
      ],
    },
    {
      id: "l36-q3",
      prompt: "In the per-customer count, why `COUNT(o.id)` rather than `COUNT(*)` after a LEFT JOIN?",
      choices: [
        "No reason — they're always identical",
        "If a customer had zero orders, COUNT(*) would count the NULL-filled row as 1 while COUNT(o.id) correctly reports 0",
        "COUNT(*) is illegal after LEFT JOIN",
        "COUNT(o.id) is faster",
      ],
      answer: 1,
      why: "COUNT(*) counts rows — including the preserved-but-empty ones LEFT JOIN manufactures. COUNT(o.id) counts real matches. Every customer here has at least one order, so today they agree; the habit exists for the day someone doesn't.",
      notes: [
        { choice: 0, why: "They agree on this seed precisely because all 16 customers ordered. The distinction is the difference between a lucky query and a correct one." },
      ],
    },
    {
      id: "l36-q4",
      prompt: "The region-mates self-join uses `c1.id < c2.id`. What does the inequality buy, concretely?",
      choices: [
        "Faster joins",
        "No self-pairs, no mirrors: 39 ordered pairs instead of 16 self-pairs + 78 mirrored duplicates",
        "It sorts the output",
        "It converts the join to an outer join",
      ],
      answer: 1,
      why: "Without it, Alice pairs with herself and with Bruno AND Bruno with Alice — 94 rows of noise. One-sided `<` keeps each pair exactly once, in canonical order.",
      notes: [
        { choice: 2, why: "The sort comes later and separately — the inequality's job is set-shaped: it decides WHICH pairs exist (no self, no mirror), not how they display." },
      ],
    },
  ],
  problems: [
    {
      id: "l36-p1",
      title: "The heaviest buyers",
      brief: "Top **5 customers by order count**: `name` and `order_count`, busiest first (name breaks ties). Join customers to their orders, bucket per customer, cap the list.",
      hints: [
        "Widen customers with orders, GROUP BY the customer, count the order ids, sort desc, LIMIT 5.",
        "Shape: SELECT c.name, COUNT(o.id) AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY order_count DESC, c.name LIMIT 5;",
      ],
      difficulty: "medium",
      solution: "SELECT c.name, COUNT(o.id) AS order_count\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY order_count DESC, c.name\nLIMIT 5;",
      mistakes: [
        { test: "\\bcount\\(\\s*\\*\\s*\\)", message: "COUNT(*) would count preserved NULL rows as orders if any customer were orderless. COUNT(o.id) counts real matches — the safe habit." },
        { test: "\\blimit\\s+16\\b|\\blimit\\s+10\\b", message: "The brief caps at five — LIMIT 5 after the sort, not before." },
        { test: "\\bgroup\\s+by\\s+o\\.id\\b", message: "Grouping by order id makes one bucket per ORDER — the bucket is the customer (c.id), counting that customer's orders." },
      ],
      expected: EXPECTED["l36-p1"],
      ordered: true,
    },
    {
      id: "l36-p2",
      title: "Stuck before shipping",
      brief: "Customers with **no shipped order at all** — spelled as an anti-join (LEFT JOIN + IS NULL). Output `name`, alphabetical. Six names.",
      hints: [
        "LEFT JOIN with the status filter in ON keeps every customer; the six with no shipped order carry NULL order ids — test for them in WHERE.",
        "Shape: SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL ORDER BY c.name;",
      ],
      difficulty: "medium",
      solution: "SELECT c.name FROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'\nWHERE o.id IS NULL\nORDER BY c.name;",
      mistakes: [
        { test: "\\bwhere\\b[^;]*\\bstatus\\s*=\\s*'shipped'", message: "status = 'shipped' in WHERE kills the NULL rows you're hunting — the filter belongs in ON, and WHERE tests o.id IS NULL." },
        { test: "\\binner\\s+join\\b|\\bjoin\\s+orders\\b(?!\\s)", message: "An inner join keeps only matched rows — 'never shipped' is defined by the UNmatched survivors, which only LEFT JOIN preserves." },
        { test: "\\bnot\\s+exists\\b", message: "NOT EXISTS reaches the same six names — but this drill is the anti-join spelling: LEFT JOIN, status in ON, IS NULL in WHERE." },
      ],
      expected: EXPECTED["l36-p2"],
      ordered: true,
    },
    {
      id: "l36-p3",
      title: "The delivered drought",
      brief: "Who has **never received a delivered order**? Same anti-join shape, different status. Output `name`, alphabetical — expect a single lonely row.",
      hints: [
        "Copy the stuck-before-shipping shape and swap the status literal.",
        "Shape: SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL ORDER BY c.name;",
      ],
      difficulty: "easy",
      solution: "SELECT c.name FROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'\nWHERE o.id IS NULL\nORDER BY c.name;",
      mistakes: [
        { test: "'shipped'", message: "Wrong status — shipped has six holdouts; the delivered probe finds the single customer who never got a completed delivery." },
        { test: "\\bcount\\b|\\bgroup\\s+by\\b", message: "No counting needed — the ask is a name list. Bucketing would collapse the very rows you're surfacing." },
      ],
      expected: EXPECTED["l36-p3"],
      ordered: true,
    },
    {
      id: "l36-p4",
      title: "What each category is worth",
      brief: "Revenue per category from the item lines: `category` and `revenue` (2 decimals), richest first. The lines live in order_items — join them to products for the shelf name.",
      hints: [
        "Each line is quantity × unit_price; bucket by the product's category and sum the line values.",
        "Shape: SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY revenue DESC;",
      ],
      difficulty: "medium",
      solution: "SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY revenue DESC;",
      mistakes: [
        { test: "sum\\s*\\(\\s*oi\\.quantity\\s*\\)\\s|sum\\s*\\(\\s*unit_price\\s*\\)", message: "SUM(quantity) counts units, SUM(unit_price) adds sticker prices — revenue needs the PRODUCT of the two, per line, then summed." },
        { test: "\\borders\\b", message: "Orders carry order totals, not line economics. The category split lives on the items side — orders would drag in the fan-out trap for free." },
        { test: "\\border\\s+by\\s+category\\b", message: "Alphabetical hides the answer — the review reads richest-first, ORDER BY revenue DESC." },
      ],
      expected: EXPECTED["l36-p4"],
      ordered: true,
    },
    {
      id: "l36-p5",
      title: "The honest total",
      brief: "Storewide revenue as **one** value, `true_revenue` (2 decimals). The brief is explicit: no joins — and now you know why.",
      hints: [
        "The total column lives on orders; summing it needs nothing but the table that owns it.",
        "Shape: SELECT ROUND(SUM(total), 2) AS true_revenue FROM orders;",
      ],
      difficulty: "easy",
      solution: "SELECT ROUND(SUM(total), 2) AS true_revenue FROM orders;",
      mistakes: [
        { test: "\\bjoin\\b", message: "The fan-out trap exactly: joining items triples every order total (34,833.28 becomes 103,244.55). Sum the owning table, unjoined." },
        { test: "\\bcount\\b", message: "103 orders is a count of receipts — revenue is the SUM of their totals." },
        { test: "\\bwhere\\b", message: "No filter — cancelled and pending money still passed through the store; the brief wants the whole book." },
      ],
      expected: EXPECTED["l36-p5"],
    },
    {
      id: "l36-p6",
      title: "Region mates",
      brief: "How many **pairs of customers share a region** — each pair counted once, nobody paired with themselves? One value, `region_pairs`. (The self-join with `a.id < b.id` is the spell.)",
      hints: [
        "Join customers to itself on region, break ties of self and mirror with the one-sided inequality, then count the survivors.",
        "Shape: SELECT COUNT(*) AS region_pairs FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id;",
      ],
      difficulty: "hard",
      solution: "SELECT COUNT(*) AS region_pairs\nFROM customers a\nJOIN customers b ON a.region = b.region AND a.id < b.id;",
      mistakes: [
        { test: "a\\.id\\s*<>\\s*b\\.id|a\\.id\\s*=\\s*b\\.id\\s*and", message: "`<>` keeps mirrors (Alice-Bruno AND Bruno-Alice) and `=` keeps self-pairs. The one-sided `<` prunes both at once." },
        { test: "\\bdistinct\\s+region\\b", message: "COUNT(DISTINCT region) answers 'how many regions have customers' (4) — the ask is how many PAIRS form inside them." },
        { test: "\\bgroup\\s+by\\b", message: "No buckets wanted — one number for the whole store. GROUP BY would hand back per-region pair counts, a different report." },
      ],
      expected: EXPECTED["l36-p6"],
    },
  ],
  takeaway: "Every cross-table brief picks its join by what it must keep: inner for matches, LEFT+IS NULL for the missing, self-join for pairs — and totals stay honest by summing the table that owns the column.",
};
