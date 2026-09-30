// Keyword Mastery bank — Running totals MCQs, part A (kb-rt-q01..q13).
// Facts probed via scripts/m5-facts.ts: monthly revenue running total
// 2024-01 3731.97 → 2024-08 20931.27 (first month past 20000) → grand
// 34833.28 over 14 months; worst month July 1193.86; Alice's running COUNT
// jumps 13 → 16 on shared dates (RANGE default frame).
import type { Mcq } from "../types";

export const windowMcqsRtA: Mcq[] = [
  {
    id: "kb-rt-q01", difficulty: "easy",
    prompt: "Which window definition computes a running total of order totals along the date timeline?",
    choices: [
      "SUM(total) OVER ()",
      "SUM(total) OVER (ORDER BY created_at)",
      "SUM(total) GROUP BY created_at",
      "TOTAL(created_at)",
    ],
    answer: 1,
    why: "A running total is SUM with a window ORDER BY and no explicit frame — the default frame (UNBOUNDED PRECEDING AND CURRENT ROW) accumulates from the start up to each row. The empty OVER() in choice A is a whole-table total (34833.28 everywhere), not a running one. The cumulative build is the canonical window-function use case.",
  },
  {
    id: "kb-rt-q02", difficulty: "easy",
    prompt: "What does the FIRST row of a running total show?",
    choices: ["0", "That row's own value", "NULL", "The grand total"],
    answer: 1,
    why: "The frame on the first row contains only the first row, so the running sum equals its own value — 2024-01's running revenue is that month's revenue, 3731.97. Running totals start where the data starts, not at zero; if the report wants a zero seed row, that is a presentation-layer union, not a window setting.",
  },
  {
    id: "kb-rt-q03", difficulty: "medium",
    prompt: "Over the month spine (GROUP BY month), which expression yields the cumulative revenue walk?",
    choices: [
      "SUM(SUM(total)) OVER (ORDER BY month)",
      "SUM(total) OVER (ORDER BY total)",
      "AVG(total) OVER (ORDER BY month)",
      "COUNT(*) OVER (ORDER BY month)",
    ],
    answer: 0,
    why: "The inner SUM(total) is the GROUP BY aggregate (one revenue figure per month); the outer window SUM walks it across months — the aggregate-of-aggregate pattern. Ordering by total instead of month would accumulate in VALUE order, producing a nonsense timeline. Probed walk: 3731.97 → 7341.61 → 9958.69 → … → 34833.28.",
  },
  {
    id: "kb-rt-q04", difficulty: "medium",
    prompt: "The monthly running revenue first exceeds 20000 in which month?",
    choices: ["June (17385.34)", "August (20931.27)", "September (24047.31)", "December (30773.25)"],
    answer: 1,
    why: "The walk sits at 17385.34 after June and 18579.20 after July, then August's 2352.07 pushes the cumulative to 20931.27 — the first month past the 20000 mark. Threshold-crossings are the running total's headline trick: the WHERE clause cannot see cumulative values, so the filter happens in a derived table over the window column.",
    notes: [{ choice: 2, why: "September is when it reaches 24047.31 — past, but not FIRST past; July's weak 1193.86 month is what delays the crossing to August." }],
  },
  {
    id: "kb-rt-q05", difficulty: "medium",
    prompt: "Why does July — with 8 orders — contribute the smallest monthly revenue (1193.86) while January's 8 orders contribute 3731.97?",
    choices: [
      "A running-total bug",
      "Order COUNT and order VALUE are different axes — July's tickets are small; the running total accumulates value, not count",
      "January is always the biggest month",
      "July orders are cancelled",
    ],
    answer: 1,
    why: "Both months hold 8 orders, but the running total walks MONEY: January's tickets averaged ~466 against July's ~149. A running count (COUNT(*) OVER …) would treat them equally. The lesson generalizes: choose the column under the window deliberately — SUM(total) for money walks, COUNT(*) for volume walks — and never assume counts imply values.",
  },
  {
    id: "kb-rt-q06", difficulty: "medium",
    prompt: "Running totals per CUSTOMER need which clause added to the window?",
    choices: ["DISTINCT", "PARTITION BY customer_id — each customer's walk starts over at their first order", "HAVING", "Nothing — one global walk serves all"],
    answer: 1,
    why: "PARTITION BY restarts the running total inside each customer: Alice's walk runs 0 → 152.52 → … → 7262.35 over her 24 orders while Bruno's runs independently. Without the partition, all customers blend into one store-wide walk. The window definition is the whole contract: ORDER BY decides the stride, PARTITION BY decides whose ledger it is.",
  },
  {
    id: "kb-rt-q07", difficulty: "easy",
    prompt: "What is the LAST row of a full-timeline running total equal to?",
    choices: ["0", "The grand total — 34833.28 for revenue on this seed", "The average", "Row count"],
    answer: 1,
    why: "By the final row the frame has swept every row, so the running total lands on the whole-partition sum: the 14-month walk ends at 34833.28. That identity is also the cheapest audit — if the walk's last row disagrees with a GROUP BY grand total, the window's partition or filter differs somewhere.",
  },
  {
    id: "kb-rt-q08", difficulty: "medium",
    prompt: "Which frame makes the running total WINDOW-cover exactly the last 3 rows (a 3-row moving average's denominator, say)?",
    choices: [
      "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
      "No frame — defaults are always 3 rows",
    ],
    answer: 0,
    why: "The explicit frame 2 PRECEDING AND CURRENT ROW pins a 3-row sliding window — edge rows see fewer rows (the frame clips at the partition start). The default frame is unbounded-preceding, i.e. the full running walk. Running total versus moving window is literally a frame-clause choice over the same SUM.",
  },
  {
    id: "kb-rt-q09", difficulty: "hard",
    prompt: "Alice's running order count (COUNT(*) OVER (PARTITION BY customer_id ORDER BY created_at)) jumps from 13 to 16 on one row. Why?",
    choices: [
      "The count is broken",
      "Default frames are RANGE-based: her several orders sharing the same created_at are PEERS, and the frame sweeps all of them at once — the count leaps by the tie-block size",
      "She cancelled 3 orders",
      "COUNT cannot run in windows",
    ],
    answer: 1,
    why: "RANGE UNBOUNDED PRECEDING AND CURRENT ROW includes all peers of the current row — same-date orders enter the frame together, so the cumulative count moves in tie-block jumps (13 → 16). Switching to ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW counts row-by-row for a strict 1,2,3… walk. Same function, same ordering — the frame keyword (RANGE vs ROWS) is the whole difference.",
  },
  {
    id: "kb-rt-q10", difficulty: "medium",
    prompt: "Which quantity does `SUM(total) OVER (ORDER BY created_at) - SUM(total) OVER (ORDER BY created_at ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)` approximate per row?",
    choices: [
      "The grand total",
      "The previous row's total — a hand-rolled LAG via two running windows (subtracting the 2-row window's sum from the running total)",
      "The average total",
      "Zero",
    ],
    answer: 1,
    why: "The running total minus the recent window peels back the walk: full-run-so-far minus (this row + previous row) leaves the previous row's value. A clever identity — and a good demonstration that running windows compose — but in practice LAG(total) OVER (ORDER BY created_at) says it directly. The composed form earns its keep in engines or contexts where the offset function is unavailable.",
  },
  {
    id: "kb-rt-q11", difficulty: "medium",
    prompt: "The finance team wants a month-end balance column: cumulative revenue at each month end. The honest shape is…",
    choices: [
      "One query per month UNIONed",
      "GROUP BY month, walk with SUM(SUM(total)) OVER (ORDER BY month) — one row per month, each carrying its month-end balance",
      "Running total over raw orders with DISTINCT months",
      "MAX(total) OVER (ORDER BY month)",
    ],
    answer: 1,
    why: "Month-end balance is a per-month grain: stage the monthly revenue (GROUP BY), then walk it. Raw-row running totals carry the balance at every ORDER — one value per order, not per month — and DISTINCT on top cannot re-aggregate. Grain first, then window: the walk is always at the grain of the rows entering it.",
  },
  {
    id: "kb-rt-q12", difficulty: "easy",
    prompt: "Running totals are computed AFTER which clauses — meaning their output is invisible to them?",
    choices: ["SELECT and FROM", "WHERE, GROUP BY and HAVING", "JOIN only", "None — they run first"],
    answer: 1,
    why: "The logical pipeline runs FROM → WHERE → GROUP BY/HAVING → SELECT (windows live here) → ORDER BY/LIMIT. So the running total only sees filtered, grouped rows, and its column cannot appear in WHERE/HAVING at the same level — 'running total > 20000' filters live in a derived table or CTE, as the August-crossing query demonstrates.",
  },
  {
    id: "kb-rt-q13", difficulty: "medium",
    prompt: "Which pair reads like a ledger: 'order total' and 'balance after this order' per customer, one pass?",
    choices: [
      "total, SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS balance",
      "total, SUM(total) GROUP BY customer_id",
      "total, AVG(total) OVER ()",
      "total, COUNT(*) OVER (PARTITION BY total)",
    ],
    answer: 0,
    why: "The partitioned, ordered SUM is exactly a bank ledger: each order stamped with the balance it leaves behind, ending at the customer's lifetime total (Alice's walk ends at 7262.35). The id tiebreaker keeps same-day orders in a strict sequence so the balance walk is reproducible. This is the pattern behind every 'balance walk' report.",
  },
];
