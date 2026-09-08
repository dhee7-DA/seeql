// Try-it missions — tiny challenges that live in the playground.
//
// Every mission is checked against the SHAPE of the query's result (columns,
// row count, ordering, values) — never against the SQL text. Two learners can
// write completely different queries and both pass: what matters is whether
// the data comes out right. That's the whole point of SQL.
//
// XP flows into the same zustand ledger the Learn app uses (awardXp with a
// stable idempotent key), so Playground ↔ Learn share one progress story.

import type { CellValue, ExecResult } from "@/lib/sql-types";
import { xpForDifficulty, type Difficulty } from "@/lib/curriculum/gamification";

export interface MissionCheckInput {
  columns: string[];
  rows: CellValue[][];
  statementType: string;
}

export interface MissionVerdict {
  pass: boolean;
  /** plain-English coaching — what the result shape told us */
  feedback: string;
}

export interface Mission {
  id: string;
  title: string;
  prompt: string;
  /** the target shape, in plain words — shown before running */
  shape: string;
  hint: string;
  /** one-click starting point loaded into the editor */
  starter: string;
  difficulty: Difficulty;
  check: (r: MissionCheckInput) => MissionVerdict;
}

export const MISSION_XP: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
};

// ---- helpers -------------------------------------------------------------

const isNum = (v: CellValue) =>
  typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)));

const num = (v: CellValue) => (typeof v === "number" ? v : Number(v));

function findCol(columns: string[], re: RegExp): number {
  return columns.findIndex((c) => re.test(c));
}

/** every value in column ci satisfies pred? (false when the column doesn't exist) */
function colEvery(rows: CellValue[][], ci: number, pred: (v: CellValue) => boolean): boolean {
  if (ci < 0 || rows.length === 0) return false;
  return rows.every((r) => r[ci] !== null && pred(r[ci]));
}

/** values in column ci non-increasing top to bottom? */
function isNonIncreasing(rows: CellValue[][], ci: number): boolean {
  if (ci < 0 || rows.length < 2) return false;
  for (let i = 1; i < rows.length; i++) {
    if (!isNum(rows[i][ci]) || !isNum(rows[i - 1][ci])) return false;
    if (num(rows[i][ci]) > num(rows[i - 1][ci])) return false;
  }
  return true;
}

// ---- missions ------------------------------------------------------------

export const MISSIONS: Mission[] = [
  {
    id: "pending-only",
    title: "The pending pile",
    prompt: "Show every order that is still pending.",
    shape: "14 rows · every row shows status pending",
    hint: "WHERE status = 'pending' — and no LIMIT, or you'll only see part of the pile.",
    starter: "SELECT id, customer_id, status, total\nFROM orders\nWHERE …",
    difficulty: "easy",
    check: ({ columns, rows, statementType }) => {
      if (statementType !== "SELECT") {
        return { pass: false, feedback: "This mission needs a SELECT — it's about reading data." };
      }
      const statusCol = columns.findIndex((c) => /status/i.test(c));
      const pending =
        statusCol >= 0
          ? colEvery(rows, statusCol, (v) => String(v).toLowerCase() === "pending")
          : false;
      if (!pending) {
        return {
          pass: false,
          feedback:
            rows.length === 0
              ? "No rows came back — check the spelling of the status value ('pending')."
              : "Some rows that came back are not pending. The filter should keep ONLY pending orders.",
        };
      }
      if (rows.length !== 14) {
        return {
          pass: false,
          feedback: `All rows are pending — but you returned ${rows.length} of the 14. Drop any LIMIT so the whole pile shows.`,
        };
      }
      return { pass: true, feedback: "All 14 pending orders, and nothing else. Clean filter." };
    },
  },
  {
    id: "top-ten",
    title: "The heavy orders",
    prompt: "Show the 10 orders with the highest total, biggest first.",
    shape: "10 rows · one numeric column strictly ordered high → low",
    hint: "ORDER BY total DESC with LIMIT 10.",
    starter: "SELECT id, customer_id, status, total\nFROM orders\nORDER BY …\nLIMIT …",
    difficulty: "easy",
    check: ({ columns, rows, statementType }) => {
      if (statementType !== "SELECT") {
        return { pass: false, feedback: "Run a SELECT — this mission reads data." };
      }
      const totalCol = findCol(columns, /^(.*_)?total$/i) ?? findCol(columns, /total|amount|price/i);
      if (totalCol < 0) {
        return { pass: false, feedback: "I can't see the order total in the result — include the total column so the ordering is visible." };
      }
      if (rows.length !== 10) {
        return { pass: false, feedback: `Got ${rows.length} rows — the brief says exactly 10 (LIMIT 10).` };
      }
      if (!isNonIncreasing(rows, totalCol)) {
        return { pass: false, feedback: "The totals are not in descending order — sort biggest first (DESC)." };
      }
      return { pass: true, feedback: `Top 10, biggest first — the heaviest order is ${num(rows[0][totalCol])}.` };
    },
  },
  {
    id: "eu-projection",
    title: "EU roster, minimal",
    prompt: "Show only the name and region of EU customers — no extra columns.",
    shape: "2 columns exactly (name, region) · every region = EU",
    hint: "SELECT name, region FROM customers WHERE region = 'EU'.",
    starter: "SELECT name, region\nFROM customers\nWHERE …",
    difficulty: "easy",
    check: ({ columns, rows, statementType }) => {
      if (statementType !== "SELECT") {
        return { pass: false, feedback: "Run a SELECT — this mission reads data." };
      }
      if (columns.length !== 2) {
        return {
          pass: false,
          feedback: `The brief says only name and region — your result has ${columns.length} columns. Projection is part of the answer.`,
        };
      }
      const regionCol = findCol(columns, /region/i);
      const nameCol = findCol(columns, /name/i);
      if (nameCol < 0 || regionCol < 0) {
        return { pass: false, feedback: "The two columns should be name and region." };
      }
      if (!colEvery(rows, regionCol, (v) => String(v) === "EU")) {
        return { pass: false, feedback: "Some rows are not EU — the WHERE clause should keep only EU customers." };
      }
      if (rows.length === 0) {
        return { pass: false, feedback: "No rows — check the region value ('EU')." };
      }
      return { pass: true, feedback: `${rows.length} EU customers, two columns, nothing spare. Tidy.` };
    },
  },
  {
    id: "status-revenue",
    title: "Revenue by status",
    prompt: "For each order status, show the total revenue across all orders.",
    shape: "4 rows · one status column · one numeric revenue column",
    hint: "GROUP BY status with SUM(total) — the status vocabulary: delivered, shipped, pending, cancelled.",
    starter: "SELECT status,\n       SUM(total) AS revenue\nFROM orders\nGROUP BY …",
    difficulty: "medium",
    check: ({ columns, rows, statementType }) => {
      if (statementType !== "SELECT") {
        return { pass: false, feedback: "Run a SELECT — this mission reads data." };
      }
      const statusCol = findCol(columns, /status/i);
      if (statusCol < 0) {
        return { pass: false, feedback: "No status column in the result — group by status so each bucket is labelled." };
      }
      const statuses = new Set(rows.map((r) => String(r[statusCol]).toLowerCase()));
      const all = ["delivered", "shipped", "pending", "cancelled"];
      const missing = all.filter((s) => !statuses.has(s));
      if (missing.length > 0) {
        return {
          pass: false,
          feedback: `${missing.join(", ")} missing from the result — all 4 statuses should appear. Did a WHERE clause eat them?`,
        };
      }
      if (rows.length !== 4) {
        return { pass: false, feedback: `Expected 4 groups (one per status) — got ${rows.length}. Check the GROUP BY.` };
      }
      const numCol = columns.findIndex((c, i) => i !== statusCol && rows.every((r) => isNum(r[i])));
      if (numCol < 0) {
        return { pass: false, feedback: "The revenue column should be numeric — SUM(total) produces a number." };
      }
      const zero = rows.every((r) => num(r[numCol]) === 0);
      if (zero) {
        return { pass: false, feedback: "Every revenue is 0 — you're summing something that's always zero. Try SUM(o.total)." };
      }
      return { pass: true, feedback: "All four statuses with their revenue. That's a GROUP BY doing its job." };
    },
  },
  {
    id: "big-spenders",
    title: "The big spenders",
    prompt: "Show the 5 customers with the highest total spend, ranked top first.",
    shape: "5 rows · customer names · a numeric spend column, ordered high → low",
    hint: "JOIN orders to customers, SUM(total), GROUP BY customer, ORDER BY … DESC LIMIT 5.",
    starter: "SELECT c.name,\n       SUM(o.total) AS spend\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY …\nORDER BY …\nLIMIT 5",
    difficulty: "medium",
    check: ({ columns, rows, statementType }) => {
      if (statementType !== "SELECT") {
        return { pass: false, feedback: "Run a SELECT — this mission reads data." };
      }
      const nameCol = findCol(columns, /name|customer/i);
      if (nameCol < 0) {
        return { pass: false, feedback: "I can't tell which customer each row is — include the customer name." };
      }
      const names = new Set(rows.map((r) => String(r[nameCol])));
      if (rows.length !== 5) {
        return { pass: false, feedback: `Got ${rows.length} rows — the leaderboard is exactly 5 (LIMIT 5).` };
      }
      if (names.size !== 5) {
        return { pass: false, feedback: "The same customer appears twice — GROUP BY customer so each has one row." };
      }
      const spendCol = columns.findIndex((c, i) => i !== nameCol && rows.every((r) => isNum(r[i])));
      if (spendCol < 0) {
        return { pass: false, feedback: "No numeric spend column — SUM(o.total) gives each customer's spend." };
      }
      if (!isNonIncreasing(rows, spendCol)) {
        return { pass: false, feedback: "Not sorted biggest spend first — ORDER BY the spend DESC." };
      }
      return { pass: true, feedback: `${String(rows[0][nameCol])} tops the leaderboard with ${num(rows[0][spendCol])}. The join + fold worked.` };
    },
  },
  {
    id: "frequent-flyers",
    title: "The regulars",
    prompt: "Show customers with MORE than 5 orders. (A WHERE can't see aggregates — HAVING can.)",
    shape: "1–20 rows · customer name · an order-count column where every value > 5",
    hint: "GROUP BY customer, then HAVING COUNT(*) > 5.",
    starter: "SELECT c.name,\n       COUNT(*) AS order_count\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY …\nHAVING …",
    difficulty: "hard",
    check: ({ columns, rows, statementType }) => {
      if (statementType !== "SELECT") {
        return { pass: false, feedback: "Run a SELECT — this mission reads data." };
      }
      const nameCol = findCol(columns, /name|customer/i);
      if (nameCol < 0) {
        return { pass: false, feedback: "Include the customer name so each row says who it is." };
      }
      const countCols = columns
        .map((_, i) => i)
        .filter((i) => i !== nameCol && rows.every((r) => isNum(r[i])));
      if (countCols.length === 0) {
        return { pass: false, feedback: "No numeric count column — COUNT(*) per customer is the point of this mission." };
      }
      const countCol =
        countCols.find((i) => /count|orders|cnt/i.test(columns[i])) ?? countCols[0];
      const allOver5 = rows.every((r) => num(r[countCol]) > 5);
      if (!allOver5) {
        return {
          pass: false,
          feedback:
            rows.some((r) => num(r[countCol]) === 5) || rows.some((r) => num(r[countCol]) < 5)
              ? "Customers with 5 or fewer orders slipped in — the threshold is MORE than 5 (HAVING COUNT(*) > 5)."
              : "The counts don't look like order counts — count the orders per customer.",
        };
      }
      if (rows.length > 20) {
        return { pass: false, feedback: `${rows.length} rows is too many regulars — make sure you're grouping by customer, not by order.` };
      }
      return { pass: true, feedback: `${rows.length} regulars with more than 5 orders each. HAVING unlocked.` };
    },
  },
];

export const MISSION_XP_TOTAL = MISSIONS.reduce((n, m) => n + MISSION_XP[m.difficulty], 0);
export { xpForDifficulty };
