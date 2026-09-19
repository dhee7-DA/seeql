// Interview-prep track — the classics, live on the storefront.
//
// Each rung is a famous screening question made concrete on this database:
// scalar-subquery lookups, the second-max trick, per-group extremes, the
// anti-join, the census, above-average filters and the LAG growth walk.
// Every expected grid was produced by running the reference solution
// against the live seed db (receipts: tool-results/practice-banks-facts*.txt).
// Grading compares result ROWS (multiset, order-insensitive unless the
// rung says ordered) — any query that produces the truth passes.

import type { CellValue } from "@/lib/sql-types";

export interface InterviewRung {
  /** Stable id, e.g. "i1" — XP ledger key `interview:i1`. */
  id: string;
  /** Rung number in the ladder (1 = warm-up). */
  num: number;
  difficulty: "easy" | "medium" | "hard";
  title: string;
  /** The interviewer's ask, verbatim. */
  ask: string;
  /** Why this exact question keeps showing up in screens. */
  why: string;
  /** Reference solution shown after solving. */
  solution: string;
  /** Expected result (verified live). */
  columns: string[];
  rows: CellValue[][];
  /** true → row order is graded (ORDER BY is part of the ask). */
  ordered: boolean;
  /** Suggested plan of attack, revealed as hint 1. */
  hint: string;
  skill: string;
}

export const INTERVIEW_XP = { easy: 10, medium: 15, hard: 20 } as const;

export const INTERVIEW_RUNGS: InterviewRung[] = [
  {
    id: "i1",
    num: 1,
    difficulty: "easy",
    title: "The most expensive product",
    ask: "Return the name and price of the single most expensive product we stock.",
    why:
      "The warm-up classic. It tests whether you reach for a scalar subquery (or ORDER BY + LIMIT) instead of eyeballing the data — and whether you know MAX collapses rows.",
    solution: "SELECT name, price\nFROM products\nWHERE price = (SELECT MAX(price) FROM products);",
    columns: ["name", "price"],
    rows: [["Smart Watch S", 199.99]],
    ordered: false,
    hint: "Find the maximum price in an inner query; the outer query keeps the row(s) whose price equals it. Equality — not >= — so ties would survive too.",
    skill: "subqueries",
  },
  {
    id: "i2",
    num: 2,
    difficulty: "easy",
    title: "The second-highest price",
    ask: "Return the second-highest product price — the number only, as second_price.",
    why:
      "The famous one. It kills candidates who write LIMIT 1 OFFSET 1 without handling ties, and it teaches the 'aggregate over the remainder' shape.",
    solution: "SELECT MAX(price) AS second_price\nFROM products\nWHERE price < (SELECT MAX(price) FROM products);",
    columns: ["second_price"],
    rows: [[149.99]],
    ordered: false,
    hint: "MAX of everything strictly below the maximum. Ties at the top collapse into one MAX, so this shape is tie-safe — two products at 199.99 would still hand back 149.99.",
    skill: "subqueries",
  },
  {
    id: "i3",
    num: 3,
    difficulty: "medium",
    title: "The priciest item in every category",
    ask: "For each category, return the name and price of its most expensive product.",
    why:
      "The per-group extreme. It separates people who know the correlated-subquery shape (or the window-function one) from people who GROUP BY and hope — which drops the name.",
    solution: "SELECT p.name, p.category, p.price\nFROM products p\nWHERE p.price = (\n  SELECT MAX(price) FROM products\n  WHERE category = p.category\n)\nORDER BY p.category;",
    columns: ["name", "category", "price"],
    rows: [
      ["Laptop Stand Aluminum", "Accessories", 42.5],
      ["Cycling Jersey Pro", "Apparel", 65],
      ["Noise-Canceling Headset", "Audio", 149.99],
      ["Mechanical Keyboard K1", "Electronics", 89.99],
      ["Yoga Mat Eco 6mm", "Fitness", 32],
      ["4K Webcam Pro", "Video", 129],
      ["Smart Watch S", "Wearables", 199.99],
    ],
    ordered: false,
    hint: "Correlate: the inner MAX ranges only over the outer row's category. A plain GROUP BY category can't carry the name — unless you reach for RANK() OVER (PARTITION BY category).",
    skill: "subqueries",
  },
  {
    id: "i4",
    num: 4,
    difficulty: "medium",
    title: "The census of line items",
    ask: "Return the three most-ordered products by units sold (sum of quantity), name breaking ties.",
    why:
      "The JOIN + GROUP BY + ORDER BY trio, the single most common daily-report shape. The graded twist: the join fans out, your COUNT must count the right thing, and 'top three' means the LIMIT comes after the sort.",
    solution: "SELECT p.name, SUM(oi.quantity) AS units\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id\nORDER BY units DESC, p.name\nLIMIT 3;",
    columns: ["name", "units"],
    rows: [
      ["Desk Mat Extended", 47],
      ["Noise-Canceling Headset", 46],
      ["HDMI 2.1 Cable 2m", 38],
    ],
    ordered: true,
    hint: "Join, group by the product's id (never its name), aggregate, then sort. Top-3 means LIMIT 3 after the sort — and a tiebreak keeps the slice reproducible.",
    skill: "joins",
  },
  {
    id: "i5",
    num: 5,
    difficulty: "medium",
    title: "Revenue by status",
    ask: "Return each order status with its order count and revenue, biggest revenue first.",
    why:
      "The group-and-rank report every analyst writes weekly. It tests whether ORDER BY on an aggregate alias — and the business meaning of 'biggest' — are second nature.",
    solution: "SELECT status,\n       COUNT(*) AS orders,\n       ROUND(SUM(total), 2) AS revenue\nFROM orders\nGROUP BY status\nORDER BY revenue DESC;",
    columns: ["status", "orders", "revenue"],
    rows: [
      ["delivered", 52, 15571.07],
      ["shipped", 30, 11996.72],
      ["pending", 14, 6113],
      ["cancelled", 7, 1152.49],
    ],
    ordered: true,
    hint: "GROUP BY status, count and sum in the same SELECT, then sort by the aggregate. ROUND the sum to keep money honest at two decimals.",
    skill: "groupby",
  },
  {
    id: "i6",
    num: 6,
    difficulty: "medium",
    title: "Above the average",
    ask: "Return the suppliers whose rating is at least the average rating across all suppliers, best first.",
    why:
      "The aggregate-in-a-comparison pattern. The trap: writing AVG(rating) directly in the WHERE clause — aggregates can't filter rows, only HAVING (after grouping) or a subquery (before it) can.",
    solution: "SELECT name, rating\nFROM suppliers\nWHERE rating >= (SELECT AVG(rating) FROM suppliers)\nORDER BY rating DESC;",
    columns: ["name", "rating"],
    rows: [
      ["Alpine Audio GmbH", 4.8],
      ["Nordic Gadgets AB", 4.6],
      ["Midwest Hardware Co", 4.4],
    ],
    ordered: false,
    hint: "The inner query computes one number — the mean rating; the outer WHERE compares each row against it. Three of six suppliers clear the bar.",
    skill: "subqueries",
  },
  {
    id: "i7",
    num: 7,
    difficulty: "hard",
    title: "Invoices nobody paid",
    ask: "Return every invoice that has no payment at all — number and amount, biggest amount first.",
    why:
      "The anti-join, asked about money so it stings. NOT IN with a nullable subquery column is the legendary footgun; the LEFT JOIN … IS NULL shape is the safe reflex — either passes here.",
    solution: "SELECT i.number, i.amount_cents\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS NULL\nORDER BY i.amount_cents DESC;",
    columns: ["number", "amount_cents"],
    rows: [
      ["INV-2025-024", 493700],
      ["INV-2025-026", 356200],
      ["INV-2025-027", 279400],
      ["INV-2025-028", 175600],
      ["INV-2024-021", 129500],
      ["INV-2024-018", 87300],
    ],
    ordered: true,
    hint: "Left-join payments onto invoices and keep the rows where the payment side is NULL — or NOT IN (SELECT invoice_id FROM payments), safe only because that column can't be NULL. Six invoices are floating.",
    skill: "joins",
  },
  {
    id: "i8",
    num: 8,
    difficulty: "hard",
    title: "The growth walk",
    ask: "Return, for each month from 2024-03, its order revenue (cancelled excluded) and the month-over-month growth in percent, one decimal.",
    why:
      "The boss rung: a derived table for the monthly sums, LAG to pull the previous month beside the current one, and honest NULL for the first row — because there is no previous month to grow from.",
    solution: "SELECT month,\n       revenue,\n       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))\n             / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct\nFROM (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  WHERE status != 'cancelled'\n  GROUP BY month\n)\nWHERE month >= '2024-03'\nORDER BY month;",
    columns: ["month", "revenue", "growth_pct"],
    rows: [
      ["2024-03", 2480.97, null],
      ["2024-04", 2468.91, -0.5],
      ["2024-05", 2910.31, 17.9],
      ["2024-06", 2047.43, -29.6],
      ["2024-07", 1078.04, -47.3],
      ["2024-08", 2352.07, 118.2],
    ],
    ordered: true,
    hint: "Stage the monthly revenue in a derived table first, then LAG(revenue) OVER (ORDER BY month) twice — once for the difference, once for the divisor. The 100.0 matters: integer math would floor the percent to zero.",
    skill: "windows",
  },
];
