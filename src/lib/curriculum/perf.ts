// Slow-query detective — the performance lab's graded bank.
//
// Every case's grader was verified against the REAL EXPLAIN QUERY PLAN the
// engine prints for the solution on the storefront sandbox (probe session
// 2026-09-20): the "require" patterns match the actual AFTER plan, the
// "forbid" patterns match the actual BEFORE plan. Grading is plan-shape
// based, not string-match-the-answer: any index that produces the required
// access path clears the case.

export interface DetectiveCase {
  /** Stable id — XP ledger key `perf:<id>`. */
  id: string;
  title: string;
  /** Stakeholder framing: who is hurting, and how it shows. */
  story: string;
  /** The slow query — planned live, never stored results. */
  sql: string;
  /** Three hint rungs, mentor rules: no SQL / shape / full solution. */
  hints: [string, string, string];
  /** The reference solution, shown only when asked for. */
  solution: string;
  /** Every pattern must match the AFTER plan text (case-insensitive). */
  require: RegExp[];
  /** No pattern may match the AFTER plan text. */
  forbid?: RegExp[];
  /** Tables/aliases that must NOT get a bare (indexless) SCAN afterwards. */
  forbidBareScanOf?: string[];
  /** Case is about uniqueness — the DDL must say CREATE UNIQUE INDEX. */
  requireUniqueDdl?: boolean;
  /** The takeaway, shown once cleared. */
  why: string;
  skill: string;
}

export const PERF_XP = 15;

export const DETECTIVES: DetectiveCase[] = [
  {
    id: "d1",
    title: "The account manager's ask",
    story:
      "An account manager opens a customer's order history dozens of times a day. On this playground's 103 orders it is instant; on the real system — millions of orders — the same query takes nine seconds. The plan will show you exactly why.",
    sql: "SELECT id, status, total\nFROM orders\nWHERE customer_id = 7;",
    hints: [
      "Run the plan first and read the word it uses for orders — SCAN or SEARCH? What does each word say about how rows are found?",
      "The query filters orders by customer_id and no index exists on that column. Build one: CREATE INDEX <name> ON <table>(<column>);",
      "CREATE INDEX idx_orders_customer ON orders(customer_id);",
    ],
    solution: "CREATE INDEX idx_orders_customer ON orders(customer_id);",
    require: [/SEARCH\s+orders\s+USING\s+INDEX/i],
    forbidBareScanOf: ["orders"],
    why: "One index turns a full sweep of every order into a single B-tree descent. Same query, same rows — a completely different path. This is the highest-leverage CREATE INDEX in the whole storefront: every customer-facing history and every join into orders leans on it.",
    skill: "schema",
  },
  {
    id: "d2",
    title: "The pending queue",
    story:
      "The ops dashboard refreshes every minute: pending orders, newest first. Every refresh full-sweeps orders AND sorts what it found in scratch memory. Two costs, one fix.",
    sql: "SELECT id, created_at\nFROM orders\nWHERE status = 'pending'\nORDER BY created_at DESC;",
    hints: [
      "The plan has two expensive steps: SCAN orders, and USE TEMP B-TREE FOR ORDER BY. One composite index can remove both — which columns, and in which order?",
      "Equality filter first, sort column second: an index on (status, created_at) finds the pending rows AND hands them over already in created_at order.",
      "CREATE INDEX idx_orders_status_created ON orders(status, created_at);",
    ],
    solution: "CREATE INDEX idx_orders_status_created ON orders(status, created_at);",
    require: [/SEARCH\s+orders\s+USING\s+(COVERING\s+)?INDEX/i],
    forbid: [/TEMP\s+B-TREE\s+FOR\s+ORDER\s+BY/i],
    forbidBareScanOf: ["orders"],
    why: "A composite index is filter AND sort in one structure: equality column first, sort column second. The TEMP B-TREE vanishes because the index delivers rows already in created_at order — DESC included. Index only (status) and the sort cost comes straight back: the ORDER BY column has to be in the index for the plan to lose its sorter.",
    skill: "schema",
  },
  {
    id: "d3",
    title: "The overdue ladder",
    story:
      "Finance chases open invoices oldest-due-first, every single morning. The AR clerk's screen has started to feel sluggish, and the plan confirms the suspicion: a full sweep of invoices plus a temporary sort on every load.",
    sql: "SELECT number, due_on, amount_cents\nFROM invoices\nWHERE status = 'open'\nORDER BY due_on;",
    hints: [
      "Same disease as the pending queue, different table: an equality filter (status) plus an ORDER BY (due_on). What shape of index cures both at once?",
      "Build the composite on invoices — filter column first, sort column second.",
      "CREATE INDEX idx_invoices_status_due ON invoices(status, due_on);",
    ],
    solution: "CREATE INDEX idx_invoices_status_due ON invoices(status, due_on);",
    require: [/SEARCH\s+invoices\s+USING\s+(COVERING\s+)?INDEX/i],
    forbid: [/TEMP\s+B-TREE\s+FOR\s+ORDER\s+BY/i],
    forbidBareScanOf: ["invoices"],
    why: "The pattern generalizes: WHERE status = ? ORDER BY col is the composite-index jingle — (status, col). Finance gets the ladder instantly and the temp sort is gone from every refresh. This exact shape — equality then sort — is one of the most reusable recipes in production indexing.",
    skill: "schema",
  },
  {
    id: "d4",
    title: "The catalog shelf",
    story:
      "The product browser filters by category all day. You could index just category — but notice what this query reads: category and name, nothing else. There is a version of the index that lets SQLite skip the table entirely.",
    sql: "SELECT category, name\nFROM products\nWHERE category = 'Audio';",
    hints: [
      "Index only category and the plan says SEARCH ... USING INDEX (category=?) — but SQLite still visits the table row to fetch name. What does the plan print when the table is never visited?",
      "Put BOTH columns in the index: the filter column first, the returned column second. The plan should end up saying COVERING.",
      "CREATE INDEX idx_products_category_name ON products(category, name);",
    ],
    solution: "CREATE INDEX idx_products_category_name ON products(category, name);",
    require: [/SEARCH\s+products\s+USING\s+COVERING\s+INDEX/i],
    forbidBareScanOf: ["products"],
    why: "A covering index holds every column the query touches, so the table itself is never read — the plan literally says COVERING. Analysts append the SELECT-list columns to an index for exactly this: reads become index-only. The trade is a wider index on disk — a good deal when the query runs constantly.",
    skill: "schema",
  },
  {
    id: "d5",
    title: "The quarter's ledger",
    story:
      "The quarterly report walks one account across a date range. The ledger is the fastest-growing table in the system — a full sweep here hurts first and hurts most, and next year it is twelve months wider again.",
    sql: "SELECT entry_date, debit_cents, credit_cents\nFROM ledger_entries\nWHERE account = 'accounts_receivable'\n  AND entry_date >= '2024-04-01'\n  AND entry_date < '2024-07-01';",
    hints: [
      "Two conditions, one table: an equality on account and a range on entry_date. Composite indexes handle exactly this pairing — but the column order decides how much the index can do.",
      "Equality column first, range column second: (account, entry_date). SQLite descends once on the equality, then slides along the index through the range.",
      "CREATE INDEX idx_ledger_account_date ON ledger_entries(account, entry_date);",
    ],
    solution: "CREATE INDEX idx_ledger_account_date ON ledger_entries(account, entry_date);",
    require: [/SEARCH\s+ledger_entries\s+USING\s+INDEX/i],
    forbidBareScanOf: ["ledger_entries"],
    why: "Equality then range — the golden order for composite indexes. Read the constraint list in the plan: (account=? AND entry_date>? AND entry_date<?). One B-tree descent serves both conditions. Flip the order and the equality can only filter after the range scan — the plan gets worse and no amount of extra indexing fully saves it.",
    skill: "schema",
  },
  {
    id: "d6",
    title: "The login lookup — and a promise",
    story:
      "Sign-in looks a customer up by email. That lookup must be fast — and the system must never hold two accounts with the same email. One statement delivers both.",
    sql: "SELECT id, name, city\nFROM customers\nWHERE email = 'alice.chen@example.com';",
    hints: [
      "Speed comes from any index on email. The uniqueness promise comes from one keyword in the CREATE INDEX statement itself.",
      "CREATE UNIQUE INDEX does double duty: a B-tree for lookups, and the engine now rejects a second row with the same email — integrity enforced by the database, not by app code.",
      "CREATE UNIQUE INDEX idx_customers_email ON customers(email);",
    ],
    solution: "CREATE UNIQUE INDEX idx_customers_email ON customers(email);",
    require: [/SEARCH\s+customers\s+USING\s+INDEX/i],
    forbidBareScanOf: ["customers"],
    requireUniqueDdl: true,
    why: "UNIQUE INDEX is performance and integrity in one statement: the lookup descends the B-tree like any index, and the database itself now guarantees one account per email — no forgotten validation in some endpoint can ever violate it. When a column is logically unique, say so in the schema.",
    skill: "schema",
  },
];

export interface StingVerdict {
  pass: boolean;
  /** What the grader still missed — empty when pass. */
  misses: string[];
}

/** Grade a detective sting against the AFTER plan. Pure, deterministic. */
export function gradeSting(
  c: DetectiveCase,
  indexDdls: string[],
  afterRows: Array<{ detail: string }>,
): StingVerdict {
  if (indexDdls.length === 0) {
    return { pass: false, misses: ["No index was created — the plan cannot change on its own."] };
  }
  const text = afterRows.map((r) => r.detail).join("\n");
  const misses: string[] = [];

  for (const re of c.require) {
    if (!re.test(text)) {
      misses.push(`The plan never shows ${re.source.replace(/\\s\+/g, " ").replace(/\\/g, "")}`);
    }
  }
  for (const re of c.forbid ?? []) {
    if (re.test(text)) {
      misses.push(`The plan still contains ${re.source.replace(/\\s\+/g, " ").replace(/\\/g, "")}`);
    }
  }
  if (c.forbidBareScanOf?.length) {
    const bare = afterRows
      .filter((r) => /^SCAN\s+/i.test(r.detail) && !/USING\s+(COVERING\s+)?INDEX/i.test(r.detail))
      .map((r) => r.detail.match(/^SCAN\s+([^\s]+)/i)?.[1] ?? "");
    for (const t of c.forbidBareScanOf) {
      if (bare.includes(t)) {
        misses.push(`${t} is still being read with a bare SCAN — the index never got used`);
      }
    }
  }
  if (c.requireUniqueDdl && !indexDdls.some((d) => /CREATE\s+UNIQUE\s+INDEX/i.test(d))) {
    misses.push("The UNIQUE keyword is missing — speed without the integrity promise");
  }
  return { pass: misses.length === 0, misses };
}
