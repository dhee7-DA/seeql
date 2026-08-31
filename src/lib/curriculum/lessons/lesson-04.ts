import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson04: Lesson = {
  id: "lesson-04",
  num: 4,
  title: "NULL — working with missing data",
  blurb: "Why = NULL matches nothing, three-valued logic, and IS NULL / IS NOT NULL",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "Real data has holes: an order that hasn't shipped has no ship date. SQL marks those holes **NULL** — not zero, not an empty string, but the *absence of a value*. In our store, `orders.shipped_at` stays NULL for pending and cancelled orders, because those orders simply have not shipped yet.",
    },
    { kind: "h", text: "Why = NULL matches nothing" },
    {
      kind: "bullets",
      items: [
        "Comparisons with NULL don't return true or false — they return **unknown**: `shipped_at = NULL` is unknown, and so is `shipped_at != NULL`.",
        "**WHERE keeps only definitely-true rows**, so any comparison with NULL quietly drops the row — including comparisons that look like they should match.",
        "That's why `WHERE shipped_at = NULL` is legal SQL that always returns zero rows.",
      ],
    },
    { kind: "diagram", figure: "l3-null-logic" },
    { kind: "h", text: "The fix, and where NULL leaks" },
    {
      kind: "bullets",
      items: [
        "**`IS NULL` / `IS NOT NULL`** are the only reliable tests — there is no equals-sign shortcut, in SQLite or anywhere else.",
        "**Arithmetic leaks it**: `total + bonus` is NULL whenever bonus is NULL — unknown plus anything is unknown.",
        "**Aggregates ignore it**: `COUNT(*)` counts rows, `COUNT(shipped_at)` counts present values, `AVG` averages only present values. Sometimes that's what you want; sometimes it silently hides broken data — always know which question you're asking.",
      ],
    },
    {
      kind: "code",
      caption: "Find what hasn't happened yet",
      sql: "SELECT id, status, created_at FROM orders WHERE shipped_at IS NULL;",
      runnable: true,
    },
    { kind: "diagram", figure: "l4-null-spread" },
    {
      kind: "tip",
      text: "If you ever need \"treat missing as zero\", the function is `COALESCE(x, 0)` — it returns the first non-NULL argument. You'll meet it properly in a later module.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "When you genuinely want to compare against NULL, standard SQL offers IS DISTINCT FROM (PostgreSQL has it). MySQL has the NULL-safe operator <=>; SQLite's own trick: `a IS b` behaves like = but treats two NULLs as equal.",
    },
  ],
  mcqs: [
    {
      id: "l4-q1",
      prompt: "Why does `WHERE shipped_at = NULL` return no rows?",
      choices: [
        "Because the column is empty",
        "Because = with NULL evaluates to unknown, and WHERE keeps only true rows",
        "Because NULL rows are deleted at insert time",
        "Because it's a syntax error SQLite ignores",
      ],
      answer: 1,
      why: "Comparing anything to NULL with = yields unknown, never true. NULL needs IS NULL — that's the whole lesson.",
      notes: [
        { choice: 0, why: "The column isn't \"empty\" — it holds NULL, the absence of a value. Even a truly empty string '' would fail = NULL." },
      ],
    },
    {
      id: "l4-q2",
      prompt: "Which condition finds orders that HAVE shipped?",
      choices: [
        "WHERE shipped_at <> NULL",
        "WHERE shipped_at = NOT NULL",
        "WHERE shipped_at IS NOT NULL",
        "WHERE NOT shipped_at",
      ],
      answer: 2,
      why: "IS NOT NULL is the dedicated test for \"a value exists\". Negated equals signs fail for the same three-valued-logic reason as plain equals.",
      notes: [
        { choice: 0, why: "Same trap, mirrored — <> with NULL is unknown too, so it also matches nothing. Only IS NOT NULL works." },
      ],
    },
    {
      id: "l4-q3",
      prompt: "`COUNT(*)` vs `COUNT(shipped_at)` on the orders table — what's different?",
      choices: [
        "Nothing, they're identical",
        "COUNT(shipped_at) also counts rows where shipped_at IS NULL",
        "COUNT(shipped_at) skips rows where shipped_at IS NULL",
        "COUNT(*) only works on numeric columns",
      ],
      answer: 2,
      why: "COUNT(column) counts present values only; COUNT(*) counts rows. The gap between the two numbers IS your missing-data count.",
      notes: [
        { choice: 1, why: "Backwards — COUNT(column) is the one that *skips* NULLs; COUNT(*) counts every row regardless." },
      ],
    },
    {
      id: "l4-q4",
      prompt: "`total + 10` where total is NULL evaluates to…",
      choices: ["10", "NULL", "0", "An error"],
      answer: 1,
      why: "Unknown propagates through arithmetic: NULL + 10 is NULL, and it silently flows into your results unless you handle it (e.g. COALESCE).",
      notes: [
        { choice: 0, why: "NULL isn't zero — unknown + 10 stays unknown. Treating missing as zero is a decision you must make explicitly with COALESCE." },
      ],
    },
    {
      id: "l4-q5",
      prompt: "`COUNT(*)` vs `COUNT(shipped_at)` on the orders table — what do they return?",
      choices: [
        "Both 103",
        "103 vs 82 — COUNT(column) skips NULLs",
        "82 vs 103",
        "Both 82",
      ],
      answer: 1,
      why: "COUNT(*) counts rows; COUNT(column) counts non-NULL values. 21 orders have no shipped_at, so COUNT(shipped_at) sees 82. You'll run both in lesson 7.",
      notes: [
        { choice: 0, why: "21 orders carry no ship date, so COUNT(shipped_at) misses them — 82. The 21-row gap is precisely the missing-data report." },
      ],
    },
    {
      id: "l4-q6",
      prompt: "What does the expression `NULL = NULL` evaluate to?",
      choices: [
        "TRUE — they're identical",
        "FALSE — NULLs never match",
        "Unknown — comparisons with NULL are neither true nor false",
        "It's a syntax error",
      ],
      answer: 2,
      why: "Any comparison with NULL yields 'unknown', and WHERE keeps only definitely-true rows. That's why = NULL matches nothing — including other NULLs.",
      notes: [
        { choice: 1, why: "Not even FALSE — unknown. FALSE would at least be an answer ('they don't match'); unknown is the engine saying \"can't know\"." },
      ],
    },
    {
      id: "l4-q7",
      prompt: "An order row has `shipped_at IS NULL`. Which statuses can it carry in this store?",
      choices: [
        "Only 'pending'",
        "Only 'cancelled'",
        "'pending' or 'cancelled' — both stay unshipped",
        "Any status at all",
      ],
      answer: 2,
      why: "Delivered and shipped orders have real ship dates; pending (14) and cancelled (7) stay NULL — 21 holes in total.",
      notes: [
        { choice: 0, why: "Cancelled orders never ship either — both statuses carry NULL shipped_at: 14 + 7 = 21 rows." },
      ],
    },
    {
      id: "l4-q8",
      prompt: "A price column has 10 rows, 3 of them NULL. What does AVG(price) compute over?",
      choices: [
        "All 10 rows, treating NULL as 0",
        "The 7 non-NULL values only",
        "It returns NULL always",
        "It errors on the first NULL",
      ],
      answer: 1,
      why: "Aggregates skip NULLs entirely: AVG divides by 7, not 10. Knowing whether NULLs exist in a measure column is essential before trusting an average.",
      notes: [
        { choice: 0, why: "That's the dangerous assumption — AVG ignores NULLs and divides by 7. NULL-as-zero semantics require an explicit COALESCE." },
      ],
    },
    {
      id: "l4-q9",
      prompt: "Which condition finds orders that HAVE shipped?",
      choices: [
        "WHERE shipped_at = 'yes'",
        "WHERE shipped_at IS NOT NULL",
        "WHERE shipped_at EXISTS",
        "WHERE NOT shipped_at IS NULL AND shipped_at = shipped_at",
      ],
      answer: 1,
      why: "IS NOT NULL is the exact complement of IS NULL — the standard way to keep rows where the value exists.",
      notes: [
        { choice: 2, why: "EXISTS answers \"does any *row* exist?\" for subqueries — it doesn't test a column's value. IS NOT NULL is the tool." },
      ],
    },
    {
      id: "l4-q10",
      prompt: "`WHERE shipped_at IS NULL OR status = 'pending'` — which orders match?",
      choices: [
        "Only pending orders",
        "All 21 unshipped orders — every pending order is also unshipped, so the OR adds nothing here",
        "Only cancelled orders",
        "No orders — OR fails with IS NULL",
      ],
      answer: 1,
      why: "The OR is honest but redundant in this store: all 14 pending orders are already among the 21 unshipped. Redundant conditions aren't wrong — just noise worth noticing.",
      notes: [
        { choice: 0, why: "It's a superset — the IS NULL arm also pulls in the 7 cancelled orders." },
      ],
    },
    {
      id: "l4-q11",
      prompt: "Why is `WHERE shipped_at = NULL` never the right tool?",
      choices: [
        "It's a typo for == NULL",
        "Comparing with NULL yields 'unknown', so the row never passes WHERE",
        "It works but is slow",
        "It returns all rows",
      ],
      answer: 1,
      why: "Equality with NULL is never definitely true, and WHERE only keeps definitely-true rows. The dedicated IS NULL operator is the one comparison built for missing values.",
      notes: [
        { choice: 2, why: "It \"works\" in the sense that it runs — and deterministically returns nothing. Speed was never the problem." },
      ],
    },
  ],
  problems: [
    {
      id: "l4-p1",
      title: "Still in the warehouse",
      brief: "Return `id`, `status`, `created_at` for every order that has NOT shipped yet.",
      hints: [
        "The reliable test for \"no value yet\" is IS NULL.",
        "Shape: SELECT id, status, created_at FROM orders WHERE shipped_at IS NULL;",
      ],
      difficulty: "easy",
      solution: "SELECT id, status, created_at FROM orders WHERE shipped_at IS NULL;",
      mistakes: [
        { test: "=\\s*null", message: "= NULL can never match — not even for NULL rows. The dedicated test is `shipped_at IS NULL`." },
      ],
      expected: EXPECTED["l4-p1"],
    },
    {
      id: "l4-p2",
      title: "Out the door",
      brief: "Return `id`, `status`, `shipped_at` for every order that HAS a ship date.",
      hints: [
        "The complement test: IS NOT NULL keeps rows where the date exists.",
        "Shape: SELECT id, status, shipped_at FROM orders WHERE shipped_at IS NOT NULL;",
      ],
      difficulty: "easy",
      solution: "SELECT id, status, shipped_at FROM orders WHERE shipped_at IS NOT NULL;",
      mistakes: [
        { test: "<>\\s*null|!=\\s*null", message: "Negated equals still yields unknown for NULL rows — the working form is `shipped_at IS NOT NULL`." },
      ],
      expected: EXPECTED["l4-p2"],
    },
    {
      id: "l4-p3",
      title: "Shipped but not delivered",
      brief: "Return `id`, `shipped_at` of orders that have a ship date but whose `status` is not `'delivered'` — these are in transit.",
      hints: [
        "A date must exist AND the status must differ from 'delivered'.",
        "Shape: … WHERE shipped_at IS NOT NULL AND status <> 'delivered';",
      ],
      difficulty: "medium",
      solution: "SELECT id, shipped_at FROM orders WHERE shipped_at IS NOT NULL AND status != 'delivered';",
      mistakes: [
        { test: "\\bor\\b", message: "BOTH conditions must hold — OR would return everything unshipped plus everything not-delivered." },
        { test: "<>\\s*null|!=\\s*null", message: "For NULL checks <> / != silently fail — the existence test is `shipped_at IS NOT NULL`." },
      ],
      expected: EXPECTED["l4-p3"],
    },
    {
      id: "l4-p4",
      title: "The open pipeline",
      brief: "Every order with no ship date — the live workload. Return `id` and `status` for orders where `shipped_at IS NULL`. Twenty-one rows.",
      hints: [
        "Twenty-one rows are waiting — the test is IS NULL.",
        "Shape: SELECT id, status FROM orders WHERE shipped_at IS NULL;",
      ],
      difficulty: "easy",
      solution: "SELECT id, status FROM orders WHERE shipped_at IS NULL;",
      mistakes: [
        { test: "=\\s*null", message: "`shipped_at = NULL` runs but matches nothing — this lesson in action. The test is `shipped_at IS NULL`." },
      ],
      expected: EXPECTED["l4-p4"],
    },
    {
      id: "l4-p5",
      title: "With tracking numbers",
      brief: "Orders that DID ship: return `id` and `shipped_at` for rows where `shipped_at IS NOT NULL` — the first 10 by row storage.",
      hints: [
        "IS NOT NULL first, then cap the output with LIMIT.",
        "Shape: SELECT id, shipped_at FROM orders WHERE shipped_at IS NOT NULL LIMIT <n>;",
      ],
      difficulty: "easy",
      solution: "SELECT id, shipped_at FROM orders WHERE shipped_at IS NOT NULL LIMIT 10;",
      mistakes: [
        { test: "\\border\\s+by\\b", message: "No ordering was asked — \"first 10 by row storage\" is just LIMIT 10 with no ORDER BY." },
      ],
      expected: EXPECTED["l4-p5"],
    },
    {
      id: "l4-p6",
      title: "Gone for good",
      brief: "Cancelled orders never shipped — their shipped_at is NULL forever. Return the `id` of orders that are unshipped AND cancelled.",
      hints: [
        "Two facts about the same row — absence of a date and the status — joined with AND.",
        "Shape: SELECT id FROM orders WHERE shipped_at IS NULL AND status = 'cancelled';",
      ],
      difficulty: "medium",
      solution: "SELECT id FROM orders WHERE shipped_at IS NULL AND status = 'cancelled';",
      mistakes: [
        { test: "\\bor\\b", message: "OR would return *every* unshipped order — you want the cancelled slice of those, so AND." },
      ],
      expected: EXPECTED["l4-p6"],
    },
    {
      id: "l4-p7",
      title: "Unshipped, wide view",
      brief: "Return `id`, `status` and `total` for all orders that are pending OR unshipped. Compare the row count to l4-p4 — the OR adds nothing here, and proving that is the exercise.",
      hints: [
        "One OR is all it takes — resist adding extra conditions.",
        "Shape: SELECT id, status, total FROM orders WHERE status = 'pending' OR shipped_at IS NULL;",
      ],
      difficulty: "medium",
      solution: "SELECT id, status, total FROM orders WHERE status = 'pending' OR shipped_at IS NULL;",
      mistakes: [
        { test: "\\band\\b", message: "AND would demand a row be pending AND unshipped — the brief asks for either (though in this store every pending row is already unshipped)." },
      ],
      expected: EXPECTED["l4-p7"],
    },
    {
      id: "l4-p8",
      title: "Closed with a date",
      brief: "Delivered orders all carry a ship date. Return `id` and `total` for orders that shipped AND were delivered — first 10 rows.",
      hints: [
        "Shipped (the date exists) AND delivered — then LIMIT.",
        "Shape: SELECT id, total FROM orders WHERE shipped_at IS NOT NULL AND status = 'delivered' LIMIT <n>;",
      ],
      difficulty: "medium",
      solution: "SELECT id, total FROM orders WHERE shipped_at IS NOT NULL AND status = 'delivered' LIMIT 10;",
      mistakes: [
        { test: "\\bor\\b", message: "OR would include shipped-but-not-delivered orders — both conditions must hold." },
      ],
      expected: EXPECTED["l4-p8"],
    },
  ],
  takeaway: "NULL means 'no value' — comparisons with it yield unknown, so IS NULL / IS NOT NULL are the only reliable tests, arithmetic propagates it, and aggregates quietly skip it.",
};
