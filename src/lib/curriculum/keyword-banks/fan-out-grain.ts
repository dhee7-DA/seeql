// Keyword Mastery bank — Join fan-out & grain (gap closer: +8 MCQs).
// Facts probed via scripts/m2-facts*.ts: honest total 34833.28 vs join-sum
// 103244.55 (x2.964); 251 join rows from 103 orders; 4-item orders 1/6/11.
import type { Mcq } from "../types";
import type { KeywordBank } from "./index";

const mcqs: Mcq[] = [
  {
    id: "kb-fn-q01", difficulty: "easy",
    prompt: "What does 'join fan-out' mean?",
    choices: [
      "A join that fails",
      "One input row appearing multiple times in the result because its partner matched several rows — the join multiplies rows",
      "Splitting a table into two",
      "An index spreading out",
    ],
    answer: 1,
    why: "When orders join line items, an order with 4 items contributes 4 result rows. Anything computed over those rows — SUM, AVG, COUNT — now measures the multiplied world.",
  },
  {
    id: "kb-fn-q02", difficulty: "easy",
    prompt: "`orders o JOIN order_items oi` produces how many rows on the seed (103 orders, 251 items)?",
    choices: ["103", "251", "25853", "354"],
    answer: 1,
    why: "251 — one row per item, each carrying its order's data. The row count follows the MANY side; 25853 would be the cross join (no ON at all).",
    notes: [{ choice: 2, why: "25853 = 103 × 251 is what happens when the ON clause is missing — fan-out's catastrophic cousin." }],
  },
  {
    id: "kb-fn-q03", difficulty: "medium",
    prompt: "SUM(o.total) over `orders JOIN order_items` reads 103244.55 while the true order total is 34833.28. Why?",
    choices: [
      "The join dropped rows",
      "Each order's total repeated once per line item — an order with 4 items counts its total 4 times (inflation ×2.964 overall)",
      "Rounding",
      "order_items has NULLs",
    ],
    answer: 1,
    why: "The fan-out multiplied every order total by its item count. 251 rows ÷ 103 orders = 2.44 average multiplicity, weighted by order size — the composite lands at ×2.964.",
  },
  {
    id: "kb-fn-q04", difficulty: "medium",
    prompt: "Which fix computes the honest 34833.28 total from the joined world?",
    choices: [
      "SUM(DISTINCT o.total)",
      "Pre-aggregate: sum the totals BEFORE joining, or join a per-order aggregate back — never SUM the duplicated column directly",
      "AVG(o.total) × 103",
      "Add GROUP BY o.id",
    ],
    answer: 1,
    why: "DISTINCT would wrongly merge two orders sharing a total (real data does that). The honest fix stages the per-order number first: derived table, CTE, or a window-free subquery.",
    notes: [{ choice: 0, why: "The classic near-miss: SUM(DISTINCT) fixes the demo number and corrupts real data the first time two orders tie." }],
  },
  {
    id: "kb-fn-q05", difficulty: "medium",
    prompt: "COUNT(DISTINCT o.id) over the orders×items join returns what, and why does it work?",
    choices: [
      "251 — join rows",
      "103 — distinct order ids collapse the fan-out honestly, because ids are unique per order",
      "It errors",
      "2.44",
    ],
    answer: 1,
    why: "DISTINCT on a KEY is safe — ids identify rows, so deduping them cannot merge different orders. Counting entities over a fanned-out join = COUNT(DISTINCT entity_key).",
  },
  {
    id: "kb-fn-q06", difficulty: "hard",
    prompt: "'Grain' in analytics means…",
    choices: [
      "The database's file size",
      "What one row of the result represents — one order, one line item, one customer-day; every aggregation is only valid at its grain",
      "The primary key's type",
      "The query's speed",
    ],
    answer: 1,
    why: "Grain is the contract of a result set. orders is one-row-per-order; the join to items is one-row-per-item; SUM(order.total) mixes grains and lies. Fixing grain first is the discipline that prevents fan-out bugs.",
  },
  {
    id: "kb-fn-q07", difficulty: "hard",
    prompt: "Order 1 has 4 line items totalling 576.54. In the fanned-out join, how much does order 1 contribute to SUM(o.total)?",
    choices: ["576.54", "144.14", "2306.16 — four copies of its total", "0"],
    answer: 2,
    why: "4 × 576.54 = 2306.16 — the order's total rides on every item row. Multiply that by every multi-item order and the ledger inflates to 103244.55 against an honest 34833.28.",
  },
  {
    id: "kb-fn-q08", difficulty: "hard",
    prompt: "A dashboard mixes grains in ONE query: revenue per customer (needs order grain) AND line-item count (needs item grain). The honest pattern is…",
    choices: [
      "One join, both aggregates, accept the distortion",
      "Two grains, staged: aggregate line items per order first (or per customer), THEN join that result to the order/customer level numbers",
      "SUM(DISTINCT) everything",
      "CROSS JOIN to normalize",
    ],
    answer: 1,
    why: "Each metric must be computed at its native grain before the worlds merge — the staged pattern keeps revenue on order rows and counts on item rows. Mixing grains in one flat join is how dashboards quietly double revenue.",
  },
];

export const fanOutGrainBank: KeywordBank = {
  kw: "Join fan-out & grain",
  moduleNum: 2,
  mcqs,
  cases: [],
  problems: [],
};
