import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson52: Lesson = {
  id: "lesson-52",
  num: 52,
  title: "The books — invoices, payments & cents",
  blurb: "The store's own money: four book tables, integer cents, invoice lifecycle and the outstanding balance",
  minutes: 14,
  blocks: [
    {
      kind: "p",
      text: "Orders record *intent* — an invoice records **money owed**. Module 9 opens the store's actual books: four new tables that every finance team on earth would recognize. `invoices` (money we billed), `payments` (money that arrived), `expenses` (money that left), and `ledger_entries` (the double-entry mirror of all of it). Same storefront customers as always — but now Alice owes us money, and some of it is *late*.",
    },
    { kind: "diagram", figure: "fin1-books-map" },
    { kind: "h", text: "Money is INTEGER cents" },
    {
      kind: "p",
      text: "Look closely at the column names: `amount_cents`, not `amount`. Every money value in the books is an **integer count of cents** — 614800 cents, never 6148.00 dollars. This is deliberate, and it's how real financial systems work: floating point `REAL` values can't represent 0.1 exactly, so sums of dollars silently drift by fractions of a cent. Accountants do not forgive drifting cents. Store integer cents; divide by 100 only when *displaying*.",
    },
    {
      kind: "code",
      caption: "The display pattern: compute in cents, convert at the edge",
      sql: `SELECT number, amount_cents,
       ROUND(amount_cents / 100.0, 2) AS dollars
FROM invoices
ORDER BY id
LIMIT 3;   -- INV-2024-001 · 486000 · 4860.0`,
    },
    {
      kind: "bullets",
      items: [
        "`amount_cents / 100.0` — the `.0` forces float division. `100` alone would do INTEGER division and `$6148.00` would come out as `6148`… usually right, catastrophically wrong for anything with cents.",
        "Round once, at the end, for display. Never round at every step — rounding errors compound exactly like interest.",
        "SQLite has no MONEY or DECIMAL type. Postgres offers real `NUMERIC`; MySQL has `DECIMAL(12,2)`. When you meet them, the integer-cents discipline still applies — they just enforce it for you.",
      ],
    },
    { kind: "h", text: "The invoice lifecycle" },
    {
      kind: "code",
      caption: "Three statuses, 28 invoices, one full year of billing",
      sql: `SELECT status, COUNT(*) AS n,
       ROUND(SUM(amount_cents) / 100.0, 2) AS total_dollars
FROM invoices
GROUP BY status
ORDER BY status;
-- open  6 · 19609.0   money still owed to us
-- paid 21 · 66443.0   settled (in theory — lesson 56 audits this)
-- void  1 ·   925.0   cancelled — must NEVER reach revenue`,
    },
    {
      kind: "bullets",
      items: [
        "**open** — issued, awaiting payment. The lifeblood of the AR (accounts receivable) report.",
        "**paid** — settled. But *how do we know?* A status is a claim; the `payments` table is the evidence. Lesson 56 finds an invoice where the claim is false.",
        "**void** — issued by mistake, cancelled. It stays in the books for audit, but it must be excluded from every revenue figure. The one void invoice (INV-2024-011, $925.00) is a landmine for the careless `SUM()`.",
      ],
    },
    { kind: "h", text: "Outstanding balance — the first real AR number" },
    {
      kind: "p",
      text: "An invoice can be **partially paid**: INV-2025-025 for $6,148.00 has received $4,000.00 so far. So the amount we're actually owed is never just `amount_cents` — it's the invoice minus whatever payments have landed against it:",
    },
    {
      kind: "code",
      caption: "Outstanding per open invoice — a correlated subquery per row",
      sql: `SELECT i.number,
       ROUND((i.amount_cents - COALESCE(
         (SELECT SUM(p.amount_cents)
          FROM payments p WHERE p.invoice_id = i.id), 0)) / 100.0, 2) AS outstanding
FROM invoices i
WHERE i.status = 'open'
ORDER BY outstanding DESC;
-- six rows, led by Emma Wilson's INV-2025-024 at 4937.0`,
    },
    {
      kind: "bullets",
      items: [
        "`COALESCE(…, 0)` — an open invoice with **zero** payments gets `SUM() = NULL` from the subquery. NULL minus nothing is NULL; COALESCE turns it into the honest 0. (Lesson 4's promise, doing finance work.)",
        "Why a subquery and not a JOIN? A JOIN would fan out — each payment duplicates its invoice row, and `SUM(amount_cents)` would overcount the invoice total. Lesson 15's fan-out trap, now wearing a suit.",
      ],
    },
    {
      kind: "warn",
      text: "Never build money sums on JOINed invoice × payment rows directly. One invoice with three payments would count its face value three times. Aggregate the many-side first (subquery or CTE), THEN attach it to the one-side.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Integer cents + ROUND at the edge is the whole discipline. `PRAGMA foreign_keys` is honoured here, so a payment pointing at a missing invoice simply cannot be inserted — which is exactly why the data errors lesson 56 hunts for are so instructive.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres has `NUMERIC(p, s)` — exact decimal arithmetic. `SUM(amount)` over NUMERIC never drifts. Many shops still store integer cents anyway: it survives ETL into systems that aren't so careful.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL's `DECIMAL(12,2)` is the twin of Postgres NUMERIC. Watch the display division: `amount_cents / 100` in MySQL also does float division when the column is integer — but portability still favors the explicit `/ 100.0`.",
    },
    {
      kind: "tip",
      text: "Every report in this module stands on three habits: integer cents, status-aware sums (void never counts), and outstanding = invoice − payments. The next lesson turns payments into a customer's running balance — the account statement.",
    },
  ],
  mcqs: [
    {
      id: "l52-q1",
      prompt: "Why is money stored as INTEGER cents instead of REAL dollars?",
      choices: [
        "Integers sort faster than floats",
        "REAL can't represent 0.1 exactly, so dollar sums drift by fractions of a cent",
        "Cents make the numbers look bigger",
        "SQLite requires INTEGER for money",
      ],
      answer: 1,
      why: "Binary floats can't represent most decimal fractions exactly; millions of additions accumulate visible error. Integer cents are exact under addition — the accountant-grade choice.",
      notes: [
        { choice: 0, why: "Sorting speed is irrelevant at this scale. The stake is exactness: SUM over REAL 0.1-dollar rows does not equal 0.3." },
      ],
    },
    {
      id: "l52-q2",
      prompt: "`ROUND(amount_cents / 100.0, 2)` — what does the `.0` in `100.0` buy you?",
      choices: [
        "Nothing — 100 would behave identically",
        "It forces float division; `/ 100` would be INTEGER division and silently drop the cents",
        "It converts the result to TEXT",
        "It rounds to the nearest hundred",
      ],
      answer: 1,
      why: "INTEGER / INTEGER is INTEGER division in SQLite. `614875 / 100` = 6148, not 6148.75 — a two-cent lie per row, every time. The `.0` promotes to float before dividing.",
      notes: [
        { choice: 0, why: "With integer operands SQLite truncates: 486000/100 happens to look fine, but 486050/100 = 4860 loses the 50 cents. Never divide money by a bare integer." },
      ],
    },
    {
      id: "l52-q3",
      prompt: "Which invoice status must be excluded from every revenue figure — and why does it stay in the table?",
      choices: [
        "paid — it's already collected, so it's not revenue",
        "open — it isn't real until paid",
        "void — cancelled billing stays for the audit trail but never counts as revenue",
        "None — all statuses belong in revenue",
      ],
      answer: 2,
      why: "A voided invoice was issued by mistake. Auditors need to see that it happened (and that it was cancelled), but SUMming it into revenue books $925.00 the store never earned.",
      notes: [
        { choice: 0, why: "Paid invoices are precisely the revenue you DID book — accrual accounting recognizes revenue when invoiced, not when cash arrives." },
      ],
    },
    {
      id: "l52-q4",
      prompt: "An open invoice has no payment rows yet. What does `(SELECT SUM(amount_cents) FROM payments WHERE invoice_id = i.id)` return — and what fixes it?",
      choices: [
        "0 — SUM defaults to zero; nothing needed",
        "NULL — wrap it in COALESCE(…, 0) so the outstanding math survives",
        "It errors — you can't SUM zero rows",
        "The invoice amount — SUM falls back to the outer row",
      ],
      answer: 1,
      why: "SUM over an empty set is NULL (not 0!), and `amount_cents - NULL` is NULL — the whole outstanding column would vanish for never-touched invoices. COALESCE pins it to 0.",
      notes: [
        { choice: 0, why: "This is the classic COUNT-vs-SUM intuition slip: COUNT returns 0 for no rows, but SUM returns NULL. Lesson 4's ghost, back for money." },
      ],
    },
    {
      id: "l52-q5",
      prompt: "Why compute an invoice's outstanding with a correlated SUBQUERY instead of joining invoices to payments and summing?",
      choices: [
        "Subqueries are always faster",
        "A join fans out — each payment row duplicates the invoice, inflating any SUM of invoice amounts",
        "JOINs can't reference two tables",
        "The subquery caches the result",
      ],
      answer: 1,
      why: "Fan-out: invoice $6,148 × its 1 payment row joins fine, but aggregate `SUM(i.amount_cents)` over invoice×payment rows and a 3-payment invoice counts its face value three times. Aggregate the payments per invoice first, then attach.",
      notes: [
        { choice: 1, why: "Right idea, wrong tool: DISTINCT after a fan-out join hides the bug instead of fixing it, and breaks the moment two invoices share a total." },
      ],
    },
    {
      id: "l52-q6",
      prompt: "INV-2025-025 is `open` for 614800 cents and has one 400000-cent payment. What does the customer still owe?",
      choices: ["614800 cents — open means untouched", "1014800 — invoice plus payments", "214800 cents — $2,148.00", "400000 cents — the payment"],
      answer: 2,
      why: "Outstanding = amount − payments received = 614800 − 400000 = 214800 cents. Partial payments are normal; the status says 'not fully settled', not 'untouched'.",
      notes: [
        { choice: 0, why: "That's why the AR report must subtract payments, not just filter status — the status is a summary, the payments are the evidence." },
      ],
    },
    {
      id: "l52-q7",
      prompt: "The store's books run from 2024-02 to 2025-02. What does `status != 'void'` protect in `SUM(amount_cents)` over invoices?",
      choices: [
        "Nothing — void invoices are already excluded from the table",
        "It removes INV-2024-011's $925.00, which would otherwise inflate revenue",
        "It excludes unpaid invoices",
        "It filters test data",
      ],
      answer: 1,
      why: "The void invoice stays in the table forever, wearing status 'void'. One forgotten filter books $925.00 of phantom revenue — small here, catastrophic at scale.",
      notes: [
        { choice: 2, why: "Unpaid (open) invoices ARE revenue under accrual accounting — the money is owed. Void is the only status that means 'this never happened'." },
      ],
    },
    {
      id: "l52-q8",
      prompt: "`due_on` is `issued_on + 30 days` on every invoice. Which query finds invoices that are LATE as of a fixed reporting date '2025-03-15'?",
      choices: [
        "WHERE due_on < issued_on",
        "WHERE status = 'open' AND due_on < '2025-03-15'",
        "WHERE paid_on > due_on",
        "WHERE julianday(due_on) > 30",
      ],
      answer: 1,
      why: "Late = still open AND past the due date. Payments have no bearing on lateness of an open invoice — and comparing ISO dates as text works because of zero-padded ordering.",
      notes: [
        { choice: 2, why: "There is no paid_on on the invoice — payments live in another table. And a paid-late invoice is no longer late; it's collected." },
      ],
    },
    {
      id: "l52-q9",
      prompt: "Why does the books schema keep `payments` as its own table instead of a `paid_cents` column on invoices?",
      choices: [
        "To make queries harder",
        "An invoice can receive SEVERAL payments over time (deposits, splits) — one-to-many demands its own table",
        "SQLite limits columns per table",
        "So invoices can be deleted faster",
      ],
      answer: 1,
      why: "INV-2024-001 was paid in two wires ($2,430 + $2,430). A single column couldn't hold the payment history — dates, methods, amounts — without destroying it. One-to-many = new table, always.",
      notes: [
        { choice: 3, why: "Invoices are never deleted — finance keeps everything for audit. The void status exists precisely so nothing needs to disappear." },
      ],
    },
    {
      id: "l52-q10",
      prompt: "Payment method split on the books: card = 16 payments · $37,364.00, wire = 12 · $35,216.00. What single query produced both rows?",
      choices: [
        "SELECT method, COUNT(*), SUM(amount_cents)/100.0 FROM payments GROUP BY method;",
        "Two separate queries — one per method",
        "SELECT method FROM payments WHERE method IN ('card','wire');",
        "SELECT DISTINCT method, COUNT(*) OVER () FROM payments;",
      ],
      answer: 0,
      why: "GROUP BY the dimension (method), aggregate the measures (COUNT, SUM) — the module-1 skeleton, straight onto finance data.",
      notes: [
        { choice: 3, why: "A window function doesn't collapse rows — COUNT(*) OVER () paints the grand total onto every payment, not one row per method." },
      ],
    },
    {
      id: "l52-q11",
      prompt: "Ledger accounts include `accounts_receivable` with debit $86,052.00 and credit $69,612.00. What does the $16,440.00 net debit represent?",
      choices: [
        "Cash the store has in the bank",
        "Money still owed TO the store — receivables not yet settled",
        "Profit for the year",
        "An accounting error — nets must be zero",
      ],
      answer: 1,
      why: "Receivable is an ASSET account: debits (invoices issued) grow it, credits (collections) shrink it. The net debit is exactly what customers still owe — which lesson 56 reconciles against the invoices.",
      notes: [
        { choice: 3, why: "Only the whole BOOKS must balance (debits = credits across every account). Individual accounts are SUPPOSED to have nets — that's what they tell you." },
      ],
    },
  ],
  problems: [
    {
      id: "l52-p1",
      title: "The paid ledger",
      brief: "The settled invoices, in dollars: output `number`, `issued_on`, `dollars` = ROUND(amount_cents/100.0, 2) for status 'paid', ordered by issued_on then number.",
      hints: [
        "Filter the status, convert once in the SELECT, and the two-key ORDER BY makes the walk deterministic.",
        "Shape: SELECT number, issued_on, ROUND(amount_cents/100.0, 2) AS dollars FROM invoices WHERE status = 'paid' ORDER BY issued_on, number;",
      ],
      difficulty: "easy",
      solution:
        "SELECT number, issued_on,\n  ROUND(amount_cents / 100.0, 2) AS dollars\nFROM invoices\nWHERE status = 'paid'\nORDER BY issued_on, number;",
      mistakes: [
        { test: "amount_cents\\s+as\\s+dollars|amount_cents\\s*\\/\\s*100\\s*[,)]", message: "Raw cents or integer division leak — the brief wants dollars with cents: ROUND(amount_cents / 100.0, 2)." },
        { test: "status\\s*!=\\s*'paid'|status\\s*=\\s*'open'", message: "The paid ledger lists settled invoices: WHERE status = 'paid' (21 rows)." },
        { test: "order\\s+by\\s+dollars\\s+desc", message: "Biggest-first is a different report — the brief wants the calendar walk: ORDER BY issued_on, number." },
      ],
      expected: EXPECTED["l52-p1"],
      ordered: true,
    },
    {
      id: "l52-p2",
      title: "Status census",
      brief: "One row per invoice status: `status`, `n` (count), `total` = ROUND(SUM(amount_cents)/100.0, 2). Order alphabetically by status.",
      hints: [
        "GROUP BY collapses the lifecycle into its three states; the money aggregate rides along.",
        "Shape: SELECT status, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS total FROM invoices GROUP BY status ORDER BY status;",
      ],
      difficulty: "easy",
      solution:
        "SELECT status, COUNT(*) AS n,\n  ROUND(SUM(amount_cents) / 100.0, 2) AS total\nFROM invoices\nGROUP BY status\nORDER BY status;",
      mistakes: [
        { test: "where\\s+status", message: "No filter — the census counts ALL three statuses, including void ($925.00 of cancelled billing)." },
        { test: "count\\s*\\(\\s*amount_cents\\s*\\)", message: "COUNT(column) skips NULLs — harmless here, but COUNT(*) is the honest row-count idiom." },
        { test: "sum\\s*\\(\\s*amount_cents\\s*\\)\\s+as\\s+total\\s*(,|from)", message: "That's raw cents — divide by 100.0 inside ROUND for the dollar figure the brief names." },
      ],
      expected: EXPECTED["l52-p2"],
      ordered: true,
    },
    {
      id: "l52-p3",
      title: "The year's revenue",
      brief: "Total invoiced revenue, void excluded: one column `revenue` = ROUND(SUM(amount_cents)/100.0, 2) over non-void invoices.",
      hints: [
        "One aggregate, one WHERE — but the WHERE is load-bearing: the void invoice is real money that was never earned.",
        "Shape: SELECT ROUND(SUM(amount_cents)/100.0, 2) AS revenue FROM invoices WHERE status != 'void';",
      ],
      difficulty: "medium",
      solution:
        "SELECT ROUND(SUM(amount_cents) / 100.0, 2) AS revenue\nFROM invoices\nWHERE status != 'void';",
      mistakes: [
        { test: "status\\s*=\\s*'paid'", message: "Revenue is recognized when INVOICED, not when paid — open invoices count too. Only void is excluded." },
        { test: "status\\s*=\\s*'void'", message: "That SELECTS the void invoice alone ($925.00) — you want to EXCLUDE it: status != 'void'." },
        { test: "\\bavg\\s*\\(", message: "AVG is the average invoice size — the brief wants the total: SUM." },
      ],
      expected: EXPECTED["l52-p3"],
    },
    {
      id: "l52-p4",
      title: "Billing by customer",
      brief: "Revenue invoiced per customer (void excluded): `name`, `billed` = ROUND(SUM(amount_cents)/100.0, 2), biggest first. Eleven customers.",
      hints: [
        "Join invoices to customers for the name, group by the name, and keep the void filter from the previous problem.",
        "Shape: SELECT c.name, ROUND(SUM(i.amount_cents)/100.0, 2) AS billed FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status != 'void' GROUP BY c.name ORDER BY billed DESC, c.name;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name,\n  ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nWHERE i.status != 'void'\nGROUP BY c.name\nORDER BY billed DESC, c.name;",
      mistakes: [
        { test: "group\\s+by\\s+i\\.customer_id\\s+order", message: "Grouping by id is fine but then SELECT c.name needs it in GROUP BY too (or group by c.name directly as the brief's output is the name)." },
        { test: "\\bwhere\\s+c\\.name", message: "WHERE filters rows before grouping — no customer filter was asked; every billed customer belongs." },
        { test: "left\\s+join|status\\s*=\\s*void", message: "Every invoice has a customer (INNER JOIN suffices), and 'void' must be EXCLUDED with !=, not selected." },
      ],
      expected: EXPECTED["l52-p4"],
      ordered: true,
    },
    {
      id: "l52-p5",
      title: "The outstanding six",
      brief: "Per open invoice: `number`, `outstanding` = ROUND((amount_cents − payments received)/100.0, 2). Only open invoices; biggest outstanding first. Remember the zero-payment COALESCE.",
      hints: [
        "Correlated subquery sums the payments per invoice; COALESCE turns 'no payments' into 0 before the subtraction.",
        "Shape: SELECT number, ROUND((amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = invoices.id), 0))/100.0, 2) AS outstanding FROM invoices WHERE status = 'open' ORDER BY outstanding DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT number,\n  ROUND((amount_cents - COALESCE(\n    (SELECT SUM(p.amount_cents)\n     FROM payments p\n     WHERE p.invoice_id = invoices.id), 0)) / 100.0, 2) AS outstanding\nFROM invoices\nWHERE status = 'open'\nORDER BY outstanding DESC;",
      mistakes: [
        { test: "coalesce\\s*\\(", message: "COALESCE is required here — six open invoices, five untouched by payments, all SUM to NULL without it." },
        { test: "join\\s+payments[^;]*group\\s+by\\s+number", message: "The join shape CAN work if you sum PAYMENTS and subtract, but summing invoice amounts over the joined rows double-counts — the subquery keeps the one-side clean." },
        { test: "amount_cents\\s*-\\s*sum\\s*\\(", message: "Mixing the row value and the aggregate in one SELECT without grouping mixes levels — put the SUM inside the per-invoice subquery." },
      ],
      expected: EXPECTED["l52-p5"],
      ordered: true,
    },
    {
      id: "l52-p6",
      title: "The collection ratio",
      brief: "How much of the billed money has actually arrived? One row, two columns: `billed` = non-void invoice total, `collected` = total payments to non-void invoices, both ROUND(…/100.0, 2).",
      hints: [
        "Two aggregates over two different tables can't share one FROM — stage one side as a subquery in FROM (a derived table) or compute one inside the other.",
        "Shape: SELECT ROUND((SELECT SUM(amount_cents) FROM invoices WHERE status != 'void')/100.0, 2) AS billed, ROUND((SELECT SUM(p.amount_cents) FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.status != 'void')/100.0, 2) AS collected;",
      ],
      difficulty: "hard",
      solution:
        "SELECT\n  ROUND((SELECT SUM(amount_cents) FROM invoices\n         WHERE status != 'void') / 100.0, 2) AS billed,\n  ROUND((SELECT SUM(p.amount_cents)\n         FROM payments p\n         JOIN invoices i ON i.id = p.invoice_id\n         WHERE i.status != 'void') / 100.0, 2) AS collected;",
      mistakes: [
        { test: "from\\s+invoices\\s+i\\s*,\\s*payments|cross\\s+join\\s+payments", message: "A cross join of the two tables multiplies every invoice by every payment before summing — the number explodes. Keep the aggregates in separate scopes." },
        { test: "collected[^;]*from\\s+payments\\s*;", message: "Summing payments WITHOUT excluding the void invoice's $925.00 overstates collections — join to invoices and filter status there." },
        { test: "\\bavg\\b|ratio\\s*=", message: "No division of the two aggregates asked (that's a next-step metric) — the brief wants the two raw dollar figures side by side." },
      ],
      expected: EXPECTED["l52-p6"],
    },
  ],
  takeaway: "Finance SQL is module-1 SQL wearing a suit: integer cents, status-aware sums, outstanding = invoice − payments — and the void invoice waiting to punish the unfiltered SUM.",
};
