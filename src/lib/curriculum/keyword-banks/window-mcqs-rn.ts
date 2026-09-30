// Keyword Mastery bank — ROW_NUMBER MCQs (kb-rn-q01..q18).
// Facts probed via scripts/m5-facts.ts: top-3 orders by total desc are
// #74 1088.44 / #43 945.21 / #39 845.92; no two orders share a total (103
// distinct); rn=1 per customer yields exactly 16 rows; per-customer top
// orders c1→#3 767.64, c2→#6 752.96, c3→#43 945.21, c4→#80 435.09, c5→#39 845.92.
import type { Mcq } from "../types";

export const windowMcqsRn: Mcq[] = [
  {
    id: "kb-rn-q01", difficulty: "easy",
    prompt: "What shape does ROW_NUMBER() return?",
    choices: [
      "A ranking with gaps after ties",
      "A unique 1, 2, 3… counter over the window — no ties possible",
      "The total number of rows",
      "The row's primary key",
    ],
    answer: 1,
    why: "ROW_NUMBER() is a window function that hands out strictly sequential integers across the window — every row gets its own number even when the ORDER BY values tie. Ranking functions like RANK compress ties; the row_number counter never does.",
  },
  {
    id: "kb-rn-q02", difficulty: "easy",
    prompt: "`ROW_NUMBER() OVER (ORDER BY total DESC)` numbers the first row as…",
    choices: ["0", "1", "103", "NULL"],
    answer: 1,
    why: "Window numbering is 1-based: the highest total (1088.44, order 74) becomes row 1. Every window position function starts at 1 — there is no zero-based counting anywhere in the OVER clause family.",
  },
  {
    id: "kb-rn-q03", difficulty: "easy",
    prompt: "On the seed, which order does `ROW_NUMBER() OVER (ORDER BY total DESC)` place first?",
    choices: ["Order 1", "Order 74 (1088.44)", "Order 103", "It depends on the storage order"],
    answer: 1,
    why: "The window ORDER BY total DESC drives the numbering: 1088.44 is the maximum total, and it sits on order 74. The window function re-sorts the partition for numbering regardless of how the table happens to be stored.",
  },
  {
    id: "kb-rn-q04", difficulty: "medium",
    prompt: "How do you keep only the three biggest orders using ROW_NUMBER()?",
    choices: [
      "WHERE ROW_NUMBER() OVER (ORDER BY total DESC) <= 3 directly on the table",
      "Number in a derived table or CTE, then filter WHERE row_num <= 3 outside",
      "ORDER BY total DESC LIMIT 3 ROW_NUMBER",
      "Use TOP 3 ROW_NUMBER",
    ],
    answer: 1,
    why: "Window functions are computed AFTER WHERE in the logical pipeline, so the row_number filter cannot appear in the same query level's WHERE — the standard move stages the numbering in a derived table (or CTE) and filters the computed column outside: `SELECT * FROM (SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders) WHERE rn <= 3`. That returns orders 74, 43 and 39. For a plain top-N, LIMIT 3 is simpler — row_number earns its keep when N comes per group.",
    notes: [{ choice: 0, why: "That errors: the alias doesn't exist yet in the same level's WHERE — the window value is not visible to the phase that runs before windowing." }],
  },
  {
    id: "kb-rn-q05", difficulty: "medium",
    prompt: "`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC)` then keeping rn = 1 returns how many rows on the seed?",
    choices: ["1", "3", "16", "103"],
    answer: 2,
    why: "PARTITION BY restarts the row_number counter inside each customer, and rn = 1 keeps each customer's single biggest order. Sixteen customers, sixteen rn=1 rows — the classic greatest-per-group pattern, no GROUP BY and no correlated subquery needed. The PARTITION BY clause is what makes the numbering per-group instead of global.",
  },
  {
    id: "kb-rn-q06", difficulty: "medium",
    prompt: "Customer 1's biggest order — which the per-customer rn = 1 pattern surfaces — is…",
    choices: ["Order 3 at 767.64", "Order 7 at 152.52", "Order 74 at 1088.44", "Order 43 at 945.21"],
    answer: 0,
    why: "Partitioned by customer_id and ordered by total DESC, customer 1's rows renumber among themselves: their maximum total is 767.64 on order 3, so that row carries rn = 1. Order 74 belongs to customer 6 — global first, not customer 1's first. The row_number partition changes who competes for the number one slot.",
    notes: [{ choice: 2, why: "Order 74 is the global champion but it partitions under customer 6 — inside customer 1's window it never appears." }],
  },
  {
    id: "kb-rn-q07", difficulty: "medium",
    prompt: "ROW_NUMBER() with an OVER clause that has NO ORDER BY — what happens in SQLite?",
    choices: [
      "A syntax error — ORDER BY is mandatory",
      "Numbers are assigned in arbitrary order (implementation-defined, stable within the scan)",
      "All rows get number 1",
      "Numbers follow primary-key order by guarantee",
    ],
    answer: 1,
    why: "The syntax is legal — `ROW_NUMBER() OVER ()` — but with no window ORDER BY the sequence is assigned in whatever order rows visit the window; any row could get any number. It is occasionally useful for pure enumeration, but never for ranking: without the ordering clause the numbers carry no meaning. The window definition is what gives the counter its semantics.",
  },
  {
    id: "kb-rn-q08", difficulty: "hard",
    prompt: "Two rows tie on the window ORDER BY value. Which is TRUE about the row_number output?",
    choices: [
      "Both get the same number",
      "They get consecutive distinct numbers in an unspecified order",
      "The second gets NULL",
      "The query errors on the tie",
    ],
    answer: 1,
    why: "ROW_NUMBER must hand out unique counters, so ties are broken arbitrarily — both rows get numbers, but which of the tied rows is 5 and which is 6 is not guaranteed. (On this seed the 103 order totals are all distinct, so total-DESC numbering is fully deterministic — but the general rule stands.) Add a deterministic tiebreaker column to the window ORDER BY when reproducibility matters.",
    notes: [{ choice: 0, why: "Equal numbers are RANK's behavior, not row_number's — the row_number contract is uniqueness, ties or not." }],
  },
  {
    id: "kb-rn-q09", difficulty: "easy",
    prompt: "Which pair differs fundamentally?",
    choices: [
      "ROW_NUMBER() and RANK()",
      "ROW_NUMBER() and COUNT(*)",
      "ORDER BY and LIMIT",
      "SELECT and FROM",
    ],
    answer: 0,
    why: "ROW_NUMBER hands out strictly consecutive counters (1,2,3,4…) while RANK awards tied rows the same rank and skips ahead (1,1,3,4…). Both are window functions sharing the OVER clause, but their tie philosophy is opposite: row_number invents order, rank preserves equality.",
  },
  {
    id: "kb-rn-q10", difficulty: "medium",
    prompt: "The month-close deck wants each customer's LARGEST order. The rn = 1 pattern returns 16 rows. What does the SAME pattern with rn = 2 return (where a customer has one)?",
    choices: [
      "Each customer's second-biggest order — 16 rows again",
      "Each customer's smallest order",
      "Empty — rn starts at 1",
      "An error — rn must be filtered to 1",
    ],
    answer: 0,
    why: "rn = 2 walks one step down each customer's private leaderboard: their second-largest ticket. Customers with fewer than two orders simply drop out (no row carries rn = 2 for them), so the result can be smaller than 16 — on this seed every customer has at least two orders, but the pattern's honest semantics are 'where it exists'. The row_number per-partition ladder is a general positional accessor, not just a top-1 tool.",
  },
  {
    id: "kb-rn-q11", difficulty: "medium",
    prompt: "You need the top 5 orders OVERALL and the top 5 orders PER CUSTOMER from one query. Which approach is honest?",
    choices: [
      "One ROW_NUMBER() OVER (ORDER BY total DESC) serves both",
      "Two row_number windows — one global, one PARTITION BY customer_id — exposed as two columns, filtered per need outside",
      "LIMIT 5 handles both automatically",
      "PARTITION BY nothing equals PARTITION BY customer_id",
    ],
    answer: 1,
    why: "Global and partitioned numbering are different window definitions: `ROW_NUMBER() OVER (ORDER BY total DESC)` and `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC)` can coexist in one SELECT as separate columns. Stage them in a derived table and filter `WHERE global_rn <= 5 OR part_rn = 1`. One window cannot answer both questions — the OVER clause scope IS the question being asked.",
  },
  {
    id: "kb-rn-q12", difficulty: "easy",
    prompt: "Where can ROW_NUMBER() legally appear?",
    choices: [
      "Only in WHERE",
      "In the SELECT list (and ORDER BY) of a query whose FROM supplies rows — always inside an OVER clause",
      "Anywhere a column name can, with no OVER needed",
      "Only inside a GROUP BY",
    ],
    answer: 1,
    why: "ROW_NUMBER is a window function: it must carry its OVER clause and it lives in the SELECT list (or the outer ORDER BY). It cannot appear in WHERE or HAVING at the same query level — those run before the window pass. The window definition attaches to the function, not to the query.",
  },
  {
    id: "kb-rn-q13", difficulty: "hard",
    prompt: "`SELECT id, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders WHERE status = 'pending'` — what is rn 1 on the seed's pending slice?",
    choices: [
      "Order 74 — the global maximum",
      "The biggest PENDING order — the WHERE ran first, shrinking the partition to 14 rows",
      "Order 1 — pending always starts the table",
      "NULL — pending rows cannot be numbered",
    ],
    answer: 1,
    why: "WHERE filters before the window pass, so the partition is the 14 pending orders, and rn 1 is the biggest among THEM — the global champion 1088.44 (order 74, status pending!) actually heads this slice too, which is a seed coincidence worth checking: 74 IS pending, so it takes pending's rn 1. The general lesson stands: the window sees post-WHERE rows, so every window ranking is relative to the filtered slice, not the raw table.",
  },
  {
    id: "kb-rn-q14", difficulty: "medium",
    prompt: "Which query keeps each customer's earliest order using ROW_NUMBER()?",
    choices: [
      "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at, id) filtered to rn = 1",
      "ROW_NUMBER() OVER (ORDER BY created_at) filtered to rn = 1",
      "ROW_NUMBER() OVER (PARTITION BY created_at ORDER BY customer_id) at rn = 1",
      "MAX(created_at) with GROUP BY customer_id",
    ],
    answer: 0,
    why: "Earliest per customer = partition by the customer, order by the date ascending (with id as the deterministic tiebreaker for same-day orders), keep rn = 1. The global numbering in choice B would keep only the single earliest order in the whole store (order 6, 2024-01-01). MAX(created_at) grouped returns the DATE per customer but not the order row around it — the row_number ladder fetches full rows.",
  },
  {
    id: "kb-rn-q15", difficulty: "hard",
    prompt: "An analyst's rn = 1 per customer query returns 16 rows but the SECOND-biggest order for some customers is missing when they ask for rn <= 2. What is the most likely cause?",
    choices: [
      "ROW_NUMBER skips numbers after ties",
      "They wrote the rn filter in the same level's WHERE as the window — no, that would error; the real cause is they kept rn = 1 OR rn = 2 but a customer has only one order, which is correct behavior, not a bug",
      "The window ORDER BY was ascending by mistake",
      "row_number caps at 1 per partition",
    ],
    answer: 1,
    why: "ROW_NUMBER never skips — that is RANK's gap behavior. If a customer has a single order, there is no rn = 2 row to show, and the result set legitimately shrinks. The discipline is to check the data before blaming the function: partitions of size 1 cannot produce a second rung. Ascending sort would produce 'second-smallest', a different but visible wrongness; the reported symptom (missing rungs for small partitions) is the honest-arithmetic case.",
  },
  {
    id: "kb-rn-q16", difficulty: "medium",
    prompt: "What does `ROW_NUMBER() OVER (ORDER BY total DESC) - 1` compute for the top row?",
    choices: ["0", "1", "-1", "103"],
    answer: 0,
    why: "The top row's row_number is 1, so the expression yields 0 — a quick zero-based rank. The arithmetic happens after the window computes: the OVER clause produces 1,2,3… and then the SELECT expression shifts it. Useful when an API expects zero-based positions; useless as a tie solution, since the shift preserves uniqueness, not equality handling.",
  },
  {
    id: "kb-rn-q17", difficulty: "easy",
    prompt: "ROW_NUMBER() OVER (ORDER BY id) over the 103-order table numbers order 74 as…",
    choices: ["1", "74", "103", "Cannot say"],
    answer: 1,
    why: "Ordering by id makes the row_number follow primary-key order, so row_number equals the id itself for every row — order 74 gets number 74. A self-demonstrating case: when the window ORDER BY column happens to be a dense 1..N key, the counter mirrors it.",
  },
  {
    id: "kb-rn-q18", difficulty: "hard",
    prompt: "Judgment call: the warehouse wants 'the most recent order per customer' for a sync job. Why is ROW_NUMBER over created_at DESC, id DESC the safer build than a GROUP BY + MAX(created_at) join-back?",
    choices: [
      "row_number is always faster on every engine",
      "The row_number ladder fetches the whole winning row in one pass — the join-back must re-join on (customer_id, created_at) and can duplicate when two orders share the same latest timestamp unless a tiebreaker is added",
      "GROUP BY cannot compute MAX on dates",
      "row_number ignores NULL dates automatically",
    ],
    answer: 1,
    why: "MAX(created_at) per customer returns timestamps, not rows; joining back on the timestamp duplicates winners whenever ties exist. Folding id into the window ORDER BY (created_at DESC, id DESC) gives a deterministic rn = 1 per partition — one row per customer, whole row, no second pass. The window function approach puts the tiebreak INSIDE the definition where it cannot be forgotten, which is what a sync job that must not double-send cares about.",
  },
];
