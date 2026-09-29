// Keyword Mastery bank — LEFT JOIN (gap closer: +16 MCQs, +6 problems).
// Facts probed via scripts/m2-facts*.ts: plain customers LEFT JOIN orders = 103
// (FK complete, equals INNER here); pending-in-ON = 22 rows, 8 NULL-padded;
// WHERE placement = 14; HAVING COUNT(o.id) = 0 → 8 customers.
import type { Mcq, Problem } from "../types";
import { EXPECTED } from "../expected";
import type { KeywordBank } from "./index";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

const mcqs: Mcq[] = [
  {
    id: "kb-lj-q01", difficulty: "easy",
    prompt: "What does `LEFT JOIN` guarantee that `INNER JOIN` does not?",
    choices: ["Faster execution", "Every row of the left table appears at least once", "Every row of the right table appears", "Sorted output"],
    answer: 1,
    why: "LEFT JOIN preserves the left table: unmatched left rows still appear, padded with NULLs on the right side. INNER JOIN drops them.",
    notes: [{ choice: 2, why: "Keeping every right-table row is RIGHT JOIN's contract, not LEFT JOIN's." }],
  },
  {
    id: "kb-lj-q02", difficulty: "easy",
    prompt: "In `customers c LEFT JOIN orders o ON o.customer_id = c.id`, which table is preserved?",
    choices: ["orders", "customers", "Both equally", "Whichever is smaller"],
    answer: 1,
    why: "The LEFT table — customers — keeps all 16 rows even if a customer had no orders. Each customer then gets one output row per matching order.",
  },
  {
    id: "kb-lj-q03", difficulty: "easy",
    prompt: "A customer with no matching orders appears in a LEFT JOIN result. What do the order columns hold?",
    choices: ["0", "Empty strings", "NULL", "The query errors"],
    answer: 2,
    why: "Unmatched left rows are NULL-padded: every orders column is NULL. That is why COUNT(o.id) — not COUNT(*) — is the tool that skips them.",
  },
  {
    id: "kb-lj-q04", difficulty: "easy",
    prompt: "Is `LEFT OUTER JOIN` different from `LEFT JOIN`?",
    choices: ["Yes — OUTER adds unmatched right rows", "No — OUTER is optional noise", "Yes — OUTER changes NULL handling", "Only in SQLite"],
    answer: 1,
    why: "OUTER is an optional keyword; LEFT JOIN and LEFT OUTER JOIN are the same operation everywhere, including SQLite.",
  },
  {
    id: "kb-lj-q05", difficulty: "medium",
    prompt: "On the seed storefront, how many rows does `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id;` return?",
    choices: ["16", "103", "119", "251"],
    answer: 1,
    why: "103 — the same as the INNER JOIN here, because every one of the 16 customers has at least one order and orders multiply the row count. No NULL-padding rows exist on this seed.",
    notes: [
      { choice: 0, why: "16 would require one row per customer — but a customer with several orders contributes several rows (Alice Chen alone has 24)." },
      { choice: 2, why: "119 (16+103) would be the count if unmatched customers existed; on this seed every customer matches." },
    ],
  },
  {
    id: "kb-lj-q06", difficulty: "medium",
    prompt: "`customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'` returns how many rows on the seed?",
    choices: ["14", "16", "22", "103"],
    answer: 2,
    why: "22: the 14 pending orders match their customers, and the 8 customers with no pending order each contribute one NULL-padded row. The ON filter decides matches, not survival.",
    notes: [{ choice: 3, why: "103 would ignore the pending filter — it restricts which orders match, so non-pending orders match nothing." }],
  },
  {
    id: "kb-lj-q07", difficulty: "medium",
    prompt: "Moving `o.status = 'pending'` from the ON clause to WHERE drops that LEFT JOIN from 22 rows to 14. Why?",
    choices: ["WHERE runs before the join", "WHERE removes the NULL-padded rows — the 8 customers with no pending order disappear", "ON cannot hold status filters", "SQLite optimizes it differently"],
    answer: 1,
    why: "WHERE filters the joined result. The 8 NULL-padded rows have o.status = NULL, fail the test, and vanish — the join quietly becomes an INNER JOIN. Keeping them requires the filter in ON.",
    notes: [{ choice: 0, why: "The logical pipeline is FROM (with joins) first, WHERE second — the filter runs after the join, which is exactly why it kills preserved rows." }],
  },
  {
    id: "kb-lj-q08", difficulty: "medium",
    prompt: "In a LEFT JOIN with a compound ON filter, which count treats customers with no match as zero?",
    choices: ["COUNT(*)", "COUNT(o.id)", "COUNT(c.id)", "SUM(1)"],
    answer: 1,
    why: "COUNT(o.id) counts non-NULL order ids only, so a NULL-padded customer counts 0 — e.g. the 8 customers with no pending orders. COUNT(*) counts every row including padded ones.",
    notes: [{ choice: 2, why: "COUNT(c.id) equals COUNT(*) here — c.id is never NULL in a LEFT JOIN that preserves customers." }],
  },
  {
    id: "kb-lj-q09", difficulty: "easy",
    prompt: "`… LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL` is the classic idiom for what?",
    choices: ["Finding matched pairs", "An anti-join: left rows with no match", "Doubling the result", "Emulating FULL OUTER JOIN alone"],
    answer: 1,
    why: "Unmatched left rows are exactly the rows where the right side is NULL. Filtering on the right table's key being NULL keeps only the holes — the anti-join pattern.",
  },
  {
    id: "kb-lj-q10", difficulty: "medium",
    prompt: "On the seed, how many customers have NO pending orders (LEFT JOIN with pending in ON, `WHERE o.id IS NULL`)?",
    choices: ["6", "8", "12", "14"],
    answer: 1,
    why: "8: Bruno Silva, Dmitri Volkov, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer and Olivia Brown. The other 8 customers hold the 14 pending orders between them.",
  },
  {
    id: "kb-lj-q11", difficulty: "hard",
    prompt: "A team reports 'pending spend per customer, including customers with none' as `SUM(o.total)` over the pending-in-ON LEFT JOIN, with no COALESCE. What do the 8 no-pending customers show?",
    choices: ["0", "NULL", "The query errors", "Their full spend"],
    answer: 1,
    why: "SUM over a group whose only row is NULL-padded returns NULL — SQL aggregates skip NULLs but return NULL when handed nothing. Wrap it: COALESCE(SUM(o.total), 0).",
    notes: [{ choice: 0, why: "0 is the business answer, but the engine returns NULL — the display-layer lie every dashboard author eventually meets." }],
  },
  {
    id: "kb-lj-q12", difficulty: "medium",
    prompt: "Which WHERE clause silently converts `customers LEFT JOIN orders` into INNER-JOIN behaviour?",
    choices: ["WHERE c.active = 1", "WHERE o.total > 500", "WHERE c.region = 'EU'", "WHERE o.id IS NULL"],
    answer: 1,
    why: "Any predicate on the right table's columns rejects the NULL-padded rows. `o.total > 500` keeps only matched orders — preservation is gone. Filtering the left table (c.*) is safe.",
    notes: [{ choice: 3, why: "o.id IS NULL is the deliberate exception — it selects the padded rows themselves, the anti-join idiom." }],
  },
  {
    id: "kb-lj-q13", difficulty: "hard",
    prompt: "`customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 500` returns how many rows on the seed?",
    choices: ["25", "31", "103", "41"],
    answer: 1,
    why: "31: the 25 orders over 500 match, and 6 customers have no order that big, so each adds one NULL-padded row. Predicting this means counting both the matches and the misses.",
    notes: [{ choice: 0, why: "25 is the INNER version. The LEFT JOIN's whole point is the extra 6 padded rows." }],
  },
  {
    id: "kb-lj-q14", difficulty: "easy",
    prompt: "One customer has 5 orders. How many rows does that customer contribute to a LEFT JOIN of customers to orders?",
    choices: ["1", "5", "0", "Depends on the ON clause direction"],
    answer: 1,
    why: "One output row per matching order — the join's grain is 'customer × their orders'. LEFT JOIN preserves existence, it does not flatten multiplicity.",
  },
  {
    id: "kb-lj-q15", difficulty: "medium",
    prompt: "`customers c RIGHT JOIN orders o ON o.customer_id = c.id` is equivalent to which query?",
    choices: ["customers LEFT JOIN orders (same order)", "orders LEFT JOIN customers (tables swapped)", "customers INNER JOIN orders", "A FULL OUTER JOIN"],
    answer: 1,
    why: "RIGHT JOIN keeps the right table; swapping the tables and using LEFT gives the identical result — 103 rows here. RIGHT JOIN exists to spare you rewriting long chains, not because it does something new.",
  },
  {
    id: "kb-lj-q16", difficulty: "hard",
    prompt: "Which query lists customers with zero pending orders alongside a hard 0 (not NULL)?",
    choices: [
      "LEFT JOIN (pending in ON) + GROUP BY, reading SUM(o.total) with HAVING COUNT(o.id) = 0",
      "LEFT JOIN (pending in ON) + GROUP BY + SELECT COALESCE(SUM(o.total), 0)",
      "INNER JOIN on status = 'pending' + GROUP BY",
      "CROSS JOIN customers to orders, filter status in WHERE",
    ],
    answer: 1,
    why: "COALESCE turns the NULL from summing an empty group into 0. The HAVING variant finds the same 8 customers but still reports NULL spend — finding the hole and filling it are different moves.",
  },
];

const problems: Problem[] = [
  p({
    id: "kb-lj-p01", difficulty: "easy",
    title: "Customer roster with order count",
    brief: "The CRM wants the full customer roster with how many orders each has placed. Even though every seed customer has orders, the report must be built LEFT-JOIN-first so a future zero-order customer would still appear with a 0.",
    hints: ["Preserve customers, count matches with COUNT(o.id), not COUNT(*).", "GROUP BY the customer to aggregate the match multiplicity."],
    solution: "SELECT c.name, COUNT(o.id) AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY order_count DESC, c.name ASC;",
  }),
  p({
    id: "kb-lj-p02", difficulty: "easy",
    title: "Roster with pending counts",
    brief: "Support triage needs each customer next to their pending-order count. The compound-ON LEFT JOIN is the shape: the status filter lives in ON so customers without pending work still surface with a zero.",
    hints: ["LEFT JOIN orders with `AND o.status = 'pending'` in the ON clause.", "COUNT(o.id) turns NULL-padded rows into 0."],
    solution: "SELECT c.name, COUNT(o.id) AS pending_count FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' GROUP BY c.id ORDER BY pending_count DESC, c.name ASC;",
  }),
  p({
    id: "kb-lj-p03", difficulty: "medium",
    title: "Customers with no pending work",
    brief: "The retention desk wants the names of customers who currently have nothing pending — the anti-join over the pending subset. Expect 8 names, alphabetically.",
    hints: ["LEFT JOIN with the pending filter in ON, then keep only `o.id IS NULL` rows.", "Sort by name for the triage list."],
    solution: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-lj-p04", difficulty: "medium",
    title: "Pending spend including zeros",
    brief: "Finance wants pending money per customer, and explicitly wants 0.00 — not NULL — for the eight customers with no pending orders. COALESCE is the promise keeper.",
    hints: ["Same compound-ON LEFT JOIN, SUM(o.total) grouped per customer.", "Wrap the SUM in COALESCE(..., 0) so empty groups report zero."],
    solution: "SELECT c.name, COALESCE(SUM(o.total), 0) AS pending_spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' GROUP BY c.id ORDER BY pending_spend DESC, c.name ASC;",
  }),
  p({
    id: "kb-lj-p05", difficulty: "medium",
    title: "Big-order gaps",
    brief: "Merchandising is studying the 500-plus spenders and wants the counter-shape too: every customer with no order over 500, listed alphabetically. The LEFT JOIN with the threshold in ON finds them.",
    hints: ["LEFT JOIN orders with `AND o.total > 500` in ON; keep `o.id IS NULL`.", "Six customers qualify on the seed."],
    solution: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 500 WHERE o.id IS NULL ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-lj-p06", difficulty: "hard",
    title: "Unshipped watchlist per region",
    brief: "Logistics wants, per region, how many orders are still unshipped (shipped_at IS NULL) — but only counting real orders, so regions with zero unshipped rows should not appear at all. Join customers to their unshipped orders and aggregate.",
    hints: ["LEFT JOIN with `o.shipped_at IS NULL` in ON, then keep `o.id IS NOT NULL` to drop padded rows.", "GROUP BY region; EU 9, APAC 8, US 4 on the seed."],
    solution: "SELECT c.region, COUNT(o.id) AS unshipped FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL WHERE o.id IS NOT NULL GROUP BY c.region ORDER BY unshipped DESC, c.region ASC;",
  }),
];

export const leftJoinBank: KeywordBank = {
  kw: "LEFT JOIN",
  moduleNum: 2,
  mcqs,
  cases: [],
  problems,
};
