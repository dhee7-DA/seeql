// Keyword Mastery bank — Anti-join (gap closer: +14 MCQs, +14 problems).
// Facts probed via scripts/m2-facts*.ts / m2-error-facts*.ts:
// plain never-ordered customers = 0 (FK complete — the honest empty); no pending = 8;
// no delivered = 1 (Liam O'Brien); no shipped = 6; no cancelled = 12; unpaid invoices = 6.
import type { Mcq, Problem } from "../types";
import { EXPECTED } from "../expected";
import type { KeywordBank } from "./index";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

const mcqs: Mcq[] = [
  {
    id: "kb-aj-q01", difficulty: "easy",
    prompt: "What is an anti-join?",
    choices: [
      "A join that errors on purpose",
      "A query shape that returns left rows with NO match on the right — the holes, not the pairs",
      "A join with negative numbers",
      "A FULL OUTER JOIN variant",
    ],
    answer: 1,
    why: "Anti-join is a pattern, not a keyword: keep the left rows that match nothing. Two idioms implement it — LEFT JOIN … WHERE right.key IS NULL, and NOT EXISTS.",
  },
  {
    id: "kb-aj-q02", difficulty: "easy",
    prompt: "Which two SQL shapes express the anti-join?",
    choices: [
      "CROSS JOIN and UNION",
      "LEFT JOIN + IS NULL, and NOT EXISTS",
      "INNER JOIN + DISTINCT, and MINUS",
      "RIGHT JOIN + COALESCE",
    ],
    answer: 1,
    why: "The LEFT JOIN leaves unmatched rows NULL-padded and the IS NULL test filters them out; NOT EXISTS probes per row. Modern planners treat them identically — pick the one your team reads faster.",
  },
  {
    id: "kb-aj-q03", difficulty: "easy",
    prompt: "In `customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`, what does `o.id IS NULL` detect?",
    choices: ["Orders with NULL ids", "Customers whose join found no order — the NULL-padded rows", "Deleted orders", "Duplicate customers"],
    answer: 1,
    why: "A padded row has real customer columns and all-NULL order columns; testing the right side's key isolates exactly the customers with no order.",
  },
  {
    id: "kb-aj-q04", difficulty: "medium",
    prompt: "On this seed, `customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL` returns ZERO rows. What does that mean?",
    choices: [
      "The join is broken",
      "The FK is complete in practice: every one of the 16 customers has placed at least one order — there are no holes to find",
      "Orders is empty",
      "The id column is NULL somewhere",
    ],
    answer: 1,
    why: "A zero-row anti-join is a data fact: the customer base is fully active. The lesson — anti-joins prove presence of holes; when they find none, that is the headline.",
  },
  {
    id: "kb-aj-q05", difficulty: "medium",
    prompt: "The retention team wants customers with NO pending orders. Where must the status filter go?",
    choices: [
      "In WHERE next to o.id IS NULL",
      "Inside the ON clause: ON o.customer_id = c.id AND o.status = 'pending' — then o.id IS NULL means 'no PENDING order'",
      "In HAVING",
      "Nowhere — LEFT JOIN already does it",
    ],
    answer: 1,
    why: "The anti-join tests matches against a SUBSET. The subset definition rides in ON; putting it in WHERE would first drop non-pending rows and then find customers with no orders AT ALL — a different (and here, empty) question.",
    notes: [{ choice: 0, why: "WHERE o.status = 'pending' AND o.id IS NULL is self-contradictory — a padded row has NULL status, so nothing survives both tests." }],
  },
  {
    id: "kb-aj-q06", difficulty: "medium",
    prompt: "How many customers have no pending orders (anti-join over the pending subset)?",
    choices: ["0", "6", "8", "14"],
    answer: 2,
    why: "8: Bruno, Dmitri, Hiro, Isabella, Jamal, Liam, Noah, Olivia. The other 8 customers own the 14 pending orders. Subset anti-joins bite where plain anti-joins come back empty.",
  },
  {
    id: "kb-aj-q07", difficulty: "medium",
    prompt: "NOT EXISTS version of the no-pending anti-join — which is correct?",
    choices: [
      "WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)",
      "WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')",
      "WHERE EXISTS (SELECT 1 FROM orders o WHERE o.status = 'pending')",
      "WHERE o.status NOT IN ('pending')",
    ],
    answer: 1,
    why: "The subquery must test the SAME subset as the ON-clause version: orders of THIS customer that are pending. Choice 0 asks 'never ordered at all' — empty on this seed.",
  },
  {
    id: "kb-aj-q08", difficulty: "medium",
    prompt: "Which customer is the ONLY one with no delivered orders?",
    choices: ["Bruno Silva", "Keiko Sato", "Liam O'Brien", "Noah Meyer"],
    answer: 2,
    why: "Liam O'Brien (Cork, EU) has never reached 'delivered' — the seed's one true delivery-hole customer. An anti-join over the delivered subset returns exactly him.",
  },
  {
    id: "kb-aj-q09", difficulty: "hard",
    prompt: "Anti-join over 'shipped' subset returns 6 customers; over 'delivered' returns 1. Why do the counts differ so much?",
    choices: [
      "Shipped is a superset of delivered — more ways to NOT be in it… actually reversed: delivered (52) is bigger than shipped (30), yet shipped's hole-set is larger because the subsets overlap differently per customer",
      "The joins are inconsistent",
      "NULL handling differs",
      "They should be equal",
    ],
    answer: 0,
    why: "Holes measure who misses a subset entirely. A customer can be delivered-but-never-shipped? No — but pending-and-cancelled-only customers miss BOTH. The 6 no-shipped customers include 3 who have delivered orders… the counts probe different per-customer histories, so they diverge.",
  },
  {
    id: "kb-aj-q10", difficulty: "medium",
    prompt: "Six invoices have no payment rows — found by `payments pay RIGHT JOIN invoices i WHERE pay.id IS NULL`. What is the LEFT JOIN equivalent (same 6 rows)?",
    choices: [
      "invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id WHERE pay.id IS NULL",
      "payments pay LEFT JOIN invoices i ON pay.invoice_id = i.id WHERE i.id IS NULL",
      "invoices i LEFT JOIN payments pay WHERE i.id IS NULL",
      "CROSS JOIN with IS NULL",
    ],
    answer: 0,
    why: "Preserve the side you hunt holes in: invoices LEFT JOIN payments, test the payment key. The RIGHT JOIN version preserves the same side from the other direction — identical rows.",
  },
  {
    id: "kb-aj-q11", difficulty: "hard",
    prompt: "Why do anti-joins and NOT IN diverge on NULLs?",
    choices: [
      "They never diverge",
      "`x NOT IN (subquery)` returns no rows at all if the subquery yields one NULL — unknown kills the test — while NOT EXISTS and LEFT JOIN/IS NULL are NULL-safe",
      "NOT IN is faster",
      "Anti-joins ignore NULLs by definition",
    ],
    answer: 1,
    why: "NOT IN compares against every list element; one NULL makes the comparison unknown for every row and the result empties silently. The NULL-safe idioms (NOT EXISTS, LEFT JOIN + IS NULL) are the audit-grade tools.",
  },
  {
    id: "kb-aj-q12", difficulty: "medium",
    prompt: "The no-cancelled anti-join returns 12 customers. How many customers HAVE cancelled orders?",
    choices: ["12", "4", "7", "16"],
    answer: 1,
    why: "16 − 12 = 4 customers own the seed's 7 cancelled orders. Anti-join counts and direct counts always sum to the population — the first sanity check of any hole-finding query.",
  },
  {
    id: "kb-aj-q13", difficulty: "hard",
    prompt: "An analyst writes the no-shipped anti-join but puts `o.status = 'shipped'` in WHERE instead of ON. What comes back?",
    choices: [
      "The correct 6 customers",
      "Empty — the WHERE tests a padded row's status, which is NULL, so `= 'shipped'` fails before the IS NULL test can fire",
      "All 16 customers",
      "A syntax error",
    ],
    answer: 1,
    why: "WHERE o.status = 'shipped' AND o.id IS NULL is unsatisfiable: padded rows have NULL status, matched shipped rows have real ids. The subset definition must live in ON — placement is the anti-join's whole game.",
  },
  {
    id: "kb-aj-q14", difficulty: "hard",
    prompt: "Performance note: on modern SQLite, LEFT JOIN + IS NULL versus NOT EXISTS for anti-joins —",
    choices: [
      "NOT EXISTS is always faster",
      "The planner typically compiles both to the same anti-join operator; indexes on the join key matter far more than idiom choice",
      "LEFT JOIN is always faster",
      "Neither uses indexes",
    ],
    answer: 1,
    why: "The idioms are planner-equivalent in modern engines; the real lever is an index on o.customer_id (and status for subset anti-joins). Write the readable one, index the key, measure if it ever matters.",
  },
];

const problems: Problem[] = [
  p({
    id: "kb-aj-p01", difficulty: "easy",
    title: "The never-shipped six",
    brief: "Logistics chases accounts whose orders NEVER shipped — customers with no shipped order at all. LEFT JOIN + subset in ON + IS NULL; expect six names, alphabetically.",
    hints: ["LEFT JOIN orders with AND o.status = 'shipped' inside ON.", "Keep WHERE o.id IS NULL; sort by name."],
    solution: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-aj-p02", difficulty: "easy",
    title: "The delivery hole",
    brief: "Quality asks which customer has NEVER had a delivered order. The subset anti-join returns exactly one name: Liam O'Brien.",
    hints: ["LEFT JOIN with AND o.status = 'delivered' in ON, keep o.id IS NULL.", "One row expected."],
    solution: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-aj-p03", difficulty: "easy",
    title: "No pending work",
    brief: "The retention desk's list: customers with no pending orders, via the subset anti-join — eight names, alphabetically.",
    hints: ["LEFT JOIN + AND o.status = 'pending' in ON, WHERE o.id IS NULL.", "Eight rows from Bruno Silva to Olivia Brown."],
    solution: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-aj-p04", difficulty: "easy",
    title: "Unpaid invoices, left-join style",
    brief: "The AR sweep via LEFT JOIN instead of RIGHT: every invoice preserved, keep the ones whose payment columns are NULL — the six unpaid invoices, alphabetically.",
    hints: ["invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id.", "WHERE pay.id IS NULL; ORDER BY i.number."],
    solution: "SELECT i.number FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id WHERE pay.id IS NULL ORDER BY i.number ASC;",
  }),
  p({
    id: "kb-aj-p05", difficulty: "medium",
    title: "Never ordered anything — the honest empty",
    brief: "Integrity baseline: customers with no orders AT ALL, via NOT EXISTS. On this seed the answer is an empty set — every customer has ordered. Prove it with the query; empty is the pass condition.",
    hints: ["WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id).", "Zero rows expected — the FK-complete truth."],
    solution: "SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-aj-p06", difficulty: "medium",
    title: "Products never ordered",
    brief: "Catalog coverage check: products with no order_items rows, via LEFT JOIN + IS NULL. The seed's honest answer: none — all sixteen products have sold at least once.",
    hints: ["products p LEFT JOIN order_items oi ON oi.product_id = p.id.", "WHERE oi.id IS NULL; empty result expected."],
    solution: "SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL ORDER BY p.name ASC;",
  }),
  p({
    id: "kb-aj-p07", difficulty: "medium",
    title: "No cancellations club",
    brief: "The clean-record list: customers who have NEVER cancelled an order. Twelve names qualify — the four with cancellations drop out.",
    hints: ["LEFT JOIN + AND o.status = 'cancelled' in ON, WHERE o.id IS NULL.", "Sort by name; expect 12 rows."],
    solution: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' WHERE o.id IS NULL ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-aj-p08", difficulty: "medium",
    title: "No-shipped via NOT EXISTS",
    brief: "Same six customers as the LEFT JOIN version, but written with NOT EXISTS — the subquery tests THIS customer's shipped orders. Both idioms, identical rows.",
    hints: ["WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped').", "Six names, alphabetically."],
    solution: "SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-aj-p09", difficulty: "medium",
    title: "Invoices never paid, NOT EXISTS edition",
    brief: "The unpaid six via the probe idiom: invoices for which no payment row exists. Same list as the LEFT JOIN sweep — INV-2024-018 through INV-2025-028.",
    hints: ["WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id).", "Six invoice numbers, ordered."],
    solution: "SELECT i.number FROM invoices i WHERE NOT EXISTS (SELECT 1 FROM payments pay WHERE pay.invoice_id = i.id) ORDER BY i.number ASC;",
  }),
  p({
    id: "kb-aj-p10", difficulty: "medium",
    title: "Suppliers never ordered from",
    brief: "Sourcing audit: suppliers none of whose products ever appear in order_items. Chain the probe through products — the seed's honest answer is empty (every supplier has sold).",
    hints: ["WHERE NOT EXISTS (SELECT 1 FROM products p INNER JOIN order_items oi ON oi.product_id = p.id WHERE p.supplier_id = s.id).", "Empty result expected."],
    solution: "SELECT s.name FROM suppliers s WHERE NOT EXISTS (SELECT 1 FROM products p INNER JOIN order_items oi ON oi.product_id = p.id WHERE p.supplier_id = s.id) ORDER BY s.name ASC;",
  }),
  p({
    id: "kb-aj-p11", difficulty: "hard",
    title: "Never in a big order",
    brief: "The whale-hunt complement: customers who have NEVER placed an order over 500.00. The threshold rides in the ON clause; six customers live entirely below the line.",
    hints: ["LEFT JOIN orders with AND o.total > 500 in ON, keep o.id IS NULL.", "Six names, alphabetically."],
    solution: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 500 WHERE o.id IS NULL ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-aj-p12", difficulty: "hard",
    title: "Never bought Audio",
    brief: "Category reach: customers with no Audio purchase at all — the probe runs through orders AND order_items AND products, with the category test inside the probe. Most of the catalog's Audio volume belongs to few customers; the hole-list is long.",
    hints: ["WHERE NOT EXISTS (SELECT 1 FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id INNER JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Audio').", "Sort by name."],
    solution: "SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o INNER JOIN order_items oi ON oi.order_id = o.id INNER JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Audio') ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-aj-p13", difficulty: "hard",
    title: "Holes and owners in one grid",
    brief: "The AR reconciliation wants both sides of the hole story per invoice status: how many invoices have payments, how many do not. LEFT JOIN invoices to payments, group by status, count with COUNT(pay.id) and a CASE-flag for the payment-less.",
    hints: ["COUNT(CASE WHEN pay.id IS NULL THEN 1 END) counts the holes; COUNT(DISTINCT i.id) counts invoices.", "open: 5 holes of 6; paid: 1 hole of 21; void: 0 of 1."],
    solution: "SELECT i.status, COUNT(DISTINCT i.id) AS invoices, COUNT(CASE WHEN pay.id IS NULL THEN 1 END) AS unpaid_invoices FROM invoices i LEFT JOIN payments pay ON pay.invoice_id = i.id GROUP BY i.status ORDER BY i.status ASC;",
  }),
  p({
    id: "kb-aj-p14", difficulty: "hard",
    title: "The complete hole census",
    brief: "One query, four anti-joins' worth of truth: per customer — has_pending (1/0), has_shipped, has_delivered, has_cancelled — via four EXISTS flags. The all-zero row would be a never-ordered customer; on this seed, nobody is, but Liam's delivered flag is the famous 0.",
    hints: ["Four SELECT EXISTS(SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = '…') columns.", "ORDER BY name; scan for the interesting 0s."],
    solution: "SELECT c.name, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') AS has_pending, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') AS has_shipped, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') AS has_delivered, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled') AS has_cancelled FROM customers c ORDER BY c.name ASC;",
  }),
];

export const antiJoinBank: KeywordBank = {
  kw: "Anti-join",
  moduleNum: 2,
  mcqs,
  cases: [],
  problems,
};
