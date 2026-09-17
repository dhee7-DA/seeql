// Fix-the-query puzzles for the landing sandbox. Each puzzle loads a
// deliberately broken query and a business question; the checker verifies
// the user's result against a reference query that ONLY ever runs
// server-side (the sandbox route) — reference SQL and the lesson text
// never ship in the public puzzle list, so the JS bundle holds no answers.

export interface LandingPuzzle {
  id: string;
  emoji: string;
  title: string;
  /** The business question the FIXED query must answer. */
  question: string;
  /** Deliberately buggy query — loaded into the editor as the start state. */
  broken: string;
  /** Progressive nudges, cheapest first. Safe to ship. */
  hints: string[];
  /** The correct query — server-side only. */
  reference: string;
  /** Why the bug was a bug — revealed only on solve. */
  lesson: string;
}

export const LANDING_PUZZLES: LandingPuzzle[] = [
  {
    id: "vanishing-orders",
    emoji: "🕳️",
    title: "The vanishing orders",
    question:
      "Every order with how much was refunded on it. Orders never refunded must still appear — with refunded = 0.",
    broken: `SELECT o.id, o.status, SUM(r.amount) AS refunded
FROM orders o
JOIN refunds r ON r.order_id = o.id
GROUP BY o.id
ORDER BY o.id;`,
    hints: [
      "Run it and count the rows — the orders table has 103 rows. Where did the rest go?",
      "JOIN keeps only orders that HAVE a refund; LEFT JOIN keeps every order. And SUM over no rows is NULL — wrap it in COALESCE(…, 0.0).",
    ],
    reference: `SELECT o.id, o.status, COALESCE(SUM(r.amount), 0.0) AS refunded
FROM orders o
LEFT JOIN refunds r ON r.order_id = o.id
GROUP BY o.id
ORDER BY o.id;`,
    lesson:
      "INNER JOIN drops any order without a refund — 81 of 103 orders vanished. LEFT JOIN keeps every left-side row, and COALESCE(SUM(r.amount), 0.0) turns the no-refund NULL into a real 0.",
  },
  {
    id: "biggest-spenders",
    emoji: "💸",
    title: "The five biggest spenders",
    question: "The top 5 customers by TOTAL amount spent across all their orders.",
    broken: `SELECT c.name, o.total AS spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
ORDER BY spent DESC
LIMIT 5;`,
    hints: [
      "It runs — but is the answer right? The biggest spender's real total is 7,262.35. No single row comes close, because o.total is ONE order's amount.",
      "Fold each customer's orders into one row first — SUM(o.total) with GROUP BY c.id — then ORDER BY + LIMIT chop the folded list.",
    ],
    reference: `SELECT c.name, SUM(o.total) AS spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY spent DESC
LIMIT 5;`,
    lesson:
      "o.total is a single order's price tag. GROUP BY c.id with SUM(o.total) folds each customer's orders into one row — then ORDER BY spent DESC LIMIT 5 picks the top five folded customers, not five random orders.",
  },
  {
    id: "five-plus-club",
    emoji: "⚖️",
    title: "The 5+ order club",
    question: "Which customers have placed MORE than 5 orders? Show their name and order count.",
    broken: `SELECT c.name, COUNT(o.id) AS orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE COUNT(o.id) > 5
GROUP BY c.id;`,
    hints: [
      "Read the error: COUNT can't live inside WHERE — WHERE filters rows one by one, BEFORE groups exist, so the count doesn't exist yet.",
      "The filter you want runs AFTER the grouping. SQLite has a clause for exactly that — swap WHERE for HAVING.",
    ],
    reference: `SELECT c.name, COUNT(o.id) AS orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
HAVING COUNT(o.id) > 5;`,
    lesson:
      "WHERE runs before GROUP BY — at that point COUNT(o.id) doesn't exist yet, so SQLite rejects it. HAVING is the post-grouping filter: HAVING COUNT(o.id) > 5 keeps only the customers whose finished group is big enough.",
  },
];

export interface PuzzleVerdict {
  id: string;
  solved: boolean;
  /** Why it's not solved yet — shape / row count / values guidance. */
  feedback?: string;
  /** The lesson — only ever attached when solved. */
  lesson?: string;
}

const cellEq = (x: unknown, y: unknown): boolean => {
  if (typeof x === "number" && typeof y === "number") {
    // money-ish tolerance — SUM rounding differences don't fail a solver
    return Math.abs(x - y) <= 0.005 * Math.max(1, Math.abs(x), Math.abs(y));
  }
  return x === y;
};

const rowEq = (a: unknown[], b: unknown[]): boolean =>
  a.length === b.length && a.every((v, i) => cellEq(v, b[i]));

/** Order-insensitive, numeric-tolerant multiset comparison. Row ORDER is
 *  never part of correctness (ties happen), but every row must be there. */
export function resultSetsEqual(a: unknown[][], b: unknown[][]): boolean {
  if (a.length !== b.length) return false;
  const used = new Array<boolean>(b.length).fill(false);
  for (const ra of a) {
    let hit = -1;
    for (let j = 0; j < b.length; j++) {
      if (!used[j] && rowEq(ra, b[j])) {
        hit = j;
        break;
      }
    }
    if (hit === -1) return false;
    used[hit] = true;
  }
  return true;
}

/** Compare a solver's result against the reference and phrase the gap. */
export function buildPuzzleVerdict(
  puzzle: LandingPuzzle,
  user: { columns: string[]; rows: unknown[][] },
  ref: { columns: string[]; rows: unknown[][] },
): PuzzleVerdict {
  if (user.columns.length !== ref.columns.length) {
    return {
      id: puzzle.id,
      solved: false,
      feedback: `So close — but the answer has ${ref.columns.length} columns, yours has ${user.columns.length}. Reread the question.`,
    };
  }
  if (user.rows.length !== ref.rows.length) {
    return {
      id: puzzle.id,
      solved: false,
      feedback: `Row count is off: yours has ${user.rows.length}, the right answer has ${ref.rows.length}. Some rows are escaping — or sneaking in.`,
    };
  }
  if (!resultSetsEqual(user.rows, ref.rows)) {
    return {
      id: puzzle.id,
      solved: false,
      feedback:
        "Right row count, wrong values — check what each column computes and how the tables are joined.",
    };
  }
  return { id: puzzle.id, solved: true, lesson: puzzle.lesson };
}
