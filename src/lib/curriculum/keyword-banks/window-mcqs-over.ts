// Keyword Mastery bank — OVER & PARTITION BY MCQs (kb-wo-q01..q06; on-vs-where owns kb-ow).
// Closes the last MCQ gap on the window-umbrella keyword. Facts probed via
// scripts/m5-facts.ts: statuses cancelled 7 / delivered 52 / pending 14 /
// shipped 30, regions APAC 5 / EU 8 / LATAM 1 / US 2, COUNT(*) OVER() mixed
// with a bare aggregate collapses to one row (the aggregate lands first).
import type { Mcq } from "../types";

export const windowMcqsOver: Mcq[] = [
  {
    id: "kb-wo-q01", difficulty: "easy",
    prompt: "What does an OVER clause do that GROUP BY cannot?",
    choices: [
      "It filters rows before aggregation",
      "It computes an aggregate while keeping every row in the output",
      "It sorts the table on disk",
      "It joins two tables without a key",
    ],
    answer: 1,
    why: "The OVER clause defines a window function: the aggregate is computed over a partition of rows and STAMPED onto every row, without collapsing anything. GROUP BY collapses each group to one row; a window function keeps all 103 orders and annotates them. That keep-every-row behavior is the whole point of the window definition.",
  },
  {
    id: "kb-wo-q02", difficulty: "easy",
    prompt: "`SELECT id, status, COUNT(*) OVER (PARTITION BY status) FROM orders` — what does the COUNT column show for a delivered order?",
    choices: ["1", "52", "103", "The order's item count"],
    answer: 1,
    why: "PARTITION BY status slices the 103 orders into status groups — cancelled 7, delivered 52, pending 14, shipped 30 — and the window COUNT reports the size of the caller's own partition. A delivered order sees 52; the window function is a per-group census painted on every member row.",
    notes: [{ choice: 2, why: "103 is COUNT(*) OVER() with no partition — the whole set. The PARTITION BY clause narrows the census to the row's own status group." }],
  },
  {
    id: "kb-wo-q03", difficulty: "medium",
    prompt: "`SELECT COUNT(*) OVER() AS total, COUNT(*) AS plain FROM orders LIMIT 1` — what comes back?",
    choices: [
      "total = 103, plain = 103",
      "total = 103, plain = 1",
      "total = 1, plain = 103",
      "A syntax error — aggregates and OVER cannot share a SELECT",
    ],
    answer: 2,
    why: "The bare COUNT(*) is an aggregate: it collapses all 103 orders into ONE group row before anything is projected. The window function then runs over that post-aggregation result — a single row — so COUNT(*) OVER() sees 1. Order of operations: bare aggregates land first, the OVER clause measures what survives. Mixing them is the classic 'why is my window count 1' trap.",
    notes: [{ choice: 0, why: "That pair would require computing the window over raw rows — but the bare aggregate has already collapsed them. Drop the plain COUNT and OVER() reports 103 again." }],
  },
  {
    id: "kb-wo-q04", difficulty: "easy",
    prompt: "Which statement is TRUE about PARTITION BY versus GROUP BY?",
    choices: [
      "PARTITION BY merges NULL groups, GROUP BY does not",
      "PARTITION BY annotates every row of its group; GROUP BY emits one row per group",
      "They are interchangeable in every query",
      "PARTITION BY only works on numeric columns",
    ],
    answer: 1,
    why: "Both slice rows into groups, but the output shape differs: GROUP BY hands you one row per group (4 status rows), while PARTITION BY inside an OVER clause keeps every input row and attaches the group's window value to it — 103 rows, each labeled with its status group's statistics. The window definition annotates; the GROUP BY contracts.",
  },
  {
    id: "kb-wo-q05", difficulty: "medium",
    prompt: "A user writes `SUM(total) OVER (PARTITION BY customer_id)` and gets a different value on every row of the same customer. What is happening?",
    choices: [
      "The window is corrupt — SUM must be constant within a partition",
      "There is no ORDER BY in the window, so SUM spans the WHOLE partition — it must be identical per customer; different values mean the partitioning differs from what they think (e.g. two customers with near-identical names)",
      "SUM over a partition returns only the first row's total",
      "The query should have used GROUP BY instead",
    ],
    answer: 1,
    why: "SUM(total) OVER (PARTITION BY customer_id) without ORDER BY is a whole-partition total: every row of customer 1 shows 7262.35 (Alice's lifetime), every row of customer 2 shows 752.96's owner's total, and so on. If values differ inside what you believe is one partition, the partition key is not what you think — check for whitespace, alias confusion, or an accidental extra column in the PARTITION BY clause.",
  },
  {
    id: "kb-wo-q06", difficulty: "hard",
    prompt: "Judgment call: the dashboard needs each order to carry its status group's total revenue AND the store-wide total on the same row. What is the cleanest correct shape?",
    choices: [
      "Two GROUP BY queries UNIONed together",
      "SUM(total) OVER (PARTITION BY status) and SUM(total) OVER() side by side — two windows over the same rows",
      "SUM(total) GROUP BY status and CROSS JOIN the store total",
      "A correlated subquery per row computing both totals",
    ],
    answer: 1,
    why: "One scan, two window definitions: the PARTITION BY status window stamps each order's status-group revenue (delivered rows share 52-row territory), while the empty OVER() window stamps the store-wide 34833.28 everywhere. The window function layer composes — each OVER clause is an independent lens. The correlated subquery shape also works but re-scans per row, and the UNION shape changes the output grain to one row per group, dropping the per-order detail the dashboard wants.",
  },
];
