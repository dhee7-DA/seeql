// Fill drills for Module 9 — SQL for Finance (lessons 52-57).
//
// Every completed SQL here executes read-only against the seed db, verified
// by scripts/m9-fill-audit.ts (Prisma $queryRawUnsafe, same discipline as
// the lost scripts/fill-audit.ts).
//
// Seed facts verified against the live db (scripts/m9-db-inspect.ts):
// invoices 28 (open 6 · $19,609.00 · paid 21 · $66,443.00 · void 1 ·
// INV-2024-011 · $925.00); payments 27 · $69,612.00 (zero orphans);
// INV-2025-025 $6,148.00 face, $4,000.00 paid → $2,148.00 outstanding;
// ledger_entries 80, debits = credits = $181,080.00; AR trial 86,052/69,612,
// cash 69,612/25,416, expenses 25,416/0, revenue 0/86,052; ledger AR net
// 16,440 vs open AR 15,609 → gaps: ghost paid invoice INV-2025-028 ·
// $1,756.00 (NOT EXISTS) + void payment $925.00 (refund owed); aging AS OF
// 2025-03-15: Pedro INV-2024-018 107 days; ladder current 1·2794.0, 1-30
// 2·5710.0, 31-60 1·4937.0, 61-90 1·1295.0, 90+ 1·873.0; monthly billing
// 2024-02…2025-02 (13 buckets), Aug 2024 +144.9%; monthly expenses 14
// buckets, mean 1815.43, SD 423.12 (population), Aug 2024 3210.0 → z 3.30.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 52 — the books: integer cents, invoice lifecycle, outstanding AR.
  52: [
    {
      id: "l52-f1",
      prompt:
        "Show the first three invoices the way finance reads them: number plus amount in dollars, rounded to 2 decimals. Compute in cents, convert at the edge.",
      template: "SELECT number,\n       ROUND({1} / 100.0, 2) AS dollars\nFROM invoices\nORDER BY id\nLIMIT 3;",
      chips: ["amount_cents", "amount", "amount_dollars", "cents"],
      answers: ["amount_cents"],
      why: "The books store integer cents — amount_cents / 100.0 with the .0 forces float division at display time. INV-2024-001 reads 4860.0. Dividing by a plain 100 would do INTEGER division and silently drop every cent.",
      notes: [
        { slot: 1, why: "There is no `amount` column in the books — every money value ends in _cents. The conversion happens in the SELECT, never in the stored data." },
      ],
    },
    {
      id: "l52-f2",
      prompt:
        "First finance reflex: total booked revenue in dollars, excluding cancelled bills. The one void invoice is audit noise — it must never reach a revenue figure.",
      template: "SELECT ROUND(SUM({1}) / 100.0, 2) AS revenue\nFROM invoices\nWHERE status {2} 'void';",
      chips: ["amount_cents", "amount", "<>", "="],
      answers: ["amount_cents", "<>"],
      why: "Booked revenue is $86,052.00 — open ($19,609.00) plus paid ($66,443.00) — while the void invoice (INV-2024-011, $925.00) stays out. status <> 'void' keeps both live statuses in one scan.",
      notes: [
        { slot: 1, why: "`amount` is the column that doesn't exist; the cents discipline means the SUM runs on amount_cents and the divide-by-100 happens outside." },
        { slot: 2, why: "status = 'void' would return exactly the wrong thing — the cancelled bill's own $925.00 as \"revenue\"." },
      ],
    },
    {
      id: "l52-f3",
      prompt:
        "An open invoice with zero payments makes SUM() return NULL inside the outstanding-balance subquery. Complete the query so an unpaid invoice shows an honest 0, then subtract.",
      template: "SELECT i.number,\n       ROUND((i.amount_cents - COALESCE(\n         (SELECT SUM(p.amount_cents)\n          FROM payments p\n          WHERE p.invoice_id = i.id), {1})) / 100.0, 2) AS outstanding\nFROM invoices i\nWHERE i.status = 'open';",
      chips: ["0", "NULL", "'0'", "0.0"],
      answers: ["0"],
      why: "COALESCE(subquery, 0) turns the empty-SUM NULL into the honest zero before the subtraction — lesson 4's promise doing finance work. Six open rows come back, led by Emma Wilson's INV-2025-024 at 4937.0.",
      notes: [
        { slot: 1, why: "COALESCE's job is replacing NULL — passing NULL as the fallback would change nothing, and NULL minus NULL is still NULL." },
      ],
    },
    {
      id: "l52-f4",
      prompt:
        "Status is a claim; payments are the evidence. Show the total received against invoice INV-2025-025 — the one Alice partially paid.",
      template: "SELECT SUM(p.amount_cents) / 100.0 AS paid\nFROM payments p\nWHERE p.invoice_id =\n  (SELECT {1} FROM invoices WHERE number = 'INV-2025-025');",
      chips: ["id", "number", "customer_id", "COUNT(*)"],
      answers: ["id"],
      why: "The subquery translates the human-readable number into the key payments actually store: $4,000.00 arrives against INV-2025-025, leaving $2,148.00 of its $6,148.00 still open.",
      notes: [
        { slot: 1, why: "payments.invoice_id holds the numeric key, not the text number — join on id; number is only the label humans read." },
      ],
    },
    {
      id: "l52-f5",
      prompt:
        "PRAGMA foreign_keys protects the books — but audit it like an accountant: count payments that point at an invoice which does not exist.",
      template: "SELECT COUNT(*) AS orphans\nFROM payments p\nLEFT JOIN invoices i ON i.id = {1}\nWHERE i.id IS NULL;",
      chips: ["p.invoice_id", "p.id", "i.invoice_id", "i.id"],
      answers: ["p.invoice_id"],
      why: "Zero orphans — every one of the 27 payments lands on a real invoice. The LEFT JOIN keeps every payment row; the IS NULL test keeps only those whose invoice never showed up.",
      notes: [
        { slot: 1, why: "i.id IS NULL is the DETECTION test in WHERE — the join condition needs the many-side key p.invoice_id to match against." },
      ],
    },
  ],

  // Lesson 53 — running balances: staging (UNION ALL, signed) + the window walk.
  53: [
    {
      id: "l53-f1",
      prompt:
        "Build the statement timeline: invoices push the balance up, payments pull it down. Complete the payments branch so everything downstream stays a plain running SUM.",
      template: "SELECT 'payment' AS kind, p.paid_on AS d, {1} AS amt\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nWHERE i.customer_id = 1;",
      chips: ["-p.amount_cents", "p.amount_cents", "SUM(p.amount_cents)", "p.paid_on"],
      answers: ["-p.amount_cents"],
      why: "Payments are stored positive — the negation happens ONCE, at staging, so the balance walk is a pure SUM(amt) OVER (…). Alice's timeline: 5 invoices up, 9 payments down, 14 rows.",
      notes: [
        { slot: 1, why: "An aggregate inside the staging branch would collapse rows before the window walk — staging must stay row-per-event." },
      ],
    },
    {
      id: "l53-f2",
      prompt:
        "Bolt the two tables into one timeline and keep every event: two identical $2,430.00 payments are two real arrivals of cash, not a duplicate to clean.",
      template: "SELECT 'invoice' AS kind, issued_on AS d, amount_cents AS amt\nFROM invoices\nWHERE customer_id = 1\n{1}\nSELECT 'payment', p.paid_on, -p.amount_cents\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nWHERE i.customer_id = 1;",
      chips: ["UNION ALL", "UNION", "INTERSECT", "EXCEPT"],
      answers: ["UNION ALL"],
      why: "UNION deduplicates whole rows and would hide real money; UNION ALL appends faithfully. Alice's statement: 14 rows — 5 invoices + 9 payments — with the two identical card payments both kept.",
      notes: [
        { slot: 1, why: "UNION's dedup pass is exactly the behavior an audit-grade statement can't afford. Deduplication is a decision, and here it's the wrong one." },
      ],
    },
    {
      id: "l53-f3",
      prompt:
        "Turn the staged timeline into a statement: each event's date with the balance AFTER it — the sum of every amount up to and including that row, in date order.",
      template: "SELECT d,\n       ROUND(SUM(amt) OVER ({1} d) / 100.0, 2) AS balance\nFROM (\n  SELECT issued_on AS d, amount_cents AS amt FROM invoices WHERE customer_id = 1\n  UNION ALL\n  SELECT p.paid_on, -p.amount_cents\n  FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = 1\n) t\nORDER BY d;",
      chips: ["ORDER BY", "PARTITION BY", "GROUP BY", "ORDER"],
      answers: ["ORDER BY"],
      why: "SUM(amt) OVER (ORDER BY d) is the walk: aggregate semantics turned into a running line, 14 rows in, 14 out — no GROUP BY collapse. Alice's walk ends at $2,148.00, matching lesson 52's correlated subquery exactly.",
      notes: [
        { slot: 1, why: "PARTITION BY would split rows into groups that each restart — the walk order comes from ORDER BY inside the OVER." },
      ],
    },
    {
      id: "l53-f4",
      prompt:
        "Many customers, many walks — restart the balance at each customer's first event, so Alice's payments never pay down Pedro's debt.",
      template: "SELECT name, d,\n       SUM(amt) OVER (PARTITION BY {1} ORDER BY d) / 100.0 AS balance\nFROM (\n  SELECT c.name, i.issued_on AS d, i.amount_cents AS amt\n  FROM invoices i JOIN customers c ON c.id = i.customer_id\n  UNION ALL\n  SELECT c.name, p.paid_on, -p.amount_cents\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n  JOIN customers c ON c.id = i.customer_id\n) t;",
      chips: ["name", "d", "amt", "kind"],
      answers: ["name"],
      why: "PARTITION BY name gives every customer an independent statement that restarts at its first invoice. Without it, all events braid into one global walk where payments land on the wrong debt.",
      notes: [
        { slot: 1, why: "The partition key must be the customer identity itself — the date orders the walk, it doesn't define whose money is being walked." },
      ],
    },
    {
      id: "l53-f5",
      prompt:
        "Sanity-check the staging before trusting the walk: count Alice's timeline events — every invoice and every payment, duplicates included.",
      template: "SELECT {1} AS events\nFROM (\n  SELECT issued_on AS d, amount_cents AS amt FROM invoices WHERE customer_id = 1\n  UNION ALL\n  SELECT p.paid_on, -p.amount_cents\n  FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = 1\n) t;",
      chips: ["COUNT(*)", "COUNT(amt)", "SUM(amt)", "COUNT(DISTINCT amt)"],
      answers: ["COUNT(*)"],
      why: "14 — five invoices plus nine payments, every event kept. COUNT(amt) would drop rows where amt is NULL, and COUNT(DISTINCT amt) would collapse the two identical $2,430.00 payments into one — hiding real money twice over.",
      notes: [
        { slot: 1, why: "SUM(amt) is the balance, not the event count — the sanity check is about ROWS, and only COUNT(*) guarantees every row answers." },
      ],
    },
  ],

  // Lesson 54 — AR aging: AS OF discipline, julianday math, the CASE ladder.
  54: [
    {
      id: "l54-f1",
      prompt:
        "Age the open invoices against the frozen report date 2025-03-15: whole days between the due date and the report date. Pedro's bill should top the list.",
      template: "SELECT i.number,\n  CAST(julianday('2025-03-15') - {1}(i.due_on) AS INTEGER) AS days_late\nFROM invoices i\nWHERE i.status = 'open'\nORDER BY days_late DESC;",
      chips: ["julianday", "date", "strftime", "unixepoch"],
      answers: ["julianday"],
      why: "julianday turns each date into a fractional day count, so the difference IS the age in days; CAST to INTEGER drops the fraction. Pedro's INV-2024-018 leads at 107 days — a decision, not an oversight. Future due dates come out negative: the current bucket knocking.",
      notes: [
        { slot: 1, why: "date() returns text, not a number — the subtraction needs the numeric julianday timeline, not a formatted label." },
      ],
    },
    {
      id: "l54-f2",
      prompt:
        "Turn days-late into buckets with the CASE ladder. Write the first rung: everything not late yet — due today or in the future — is current.",
      template: "SELECT CASE\n         WHEN days_late <= 0 THEN 'current'\n         WHEN days_late <= 30 THEN '1-30'\n         WHEN days_late <= 60 THEN '31-60'\n         WHEN days_late <= 90 THEN '61-90'\n         ELSE '90+' END AS bucket\nFROM (\n  SELECT CAST(julianday('2025-03-15') - julianday(due_on) AS INTEGER) AS days_late\n  FROM invoices WHERE status = 'open'\n);",
      chips: ["<=", "=", "<", ">="],
      answers: ["<="],
      why: "<= 0, not = 0 — an invoice due tomorrow is not late today, and negative days (future due dates) must flow into current too. CASE stops at the first true test, so each later rung inherits the earlier bounds for free.",
      notes: [
        { slot: 1, why: "= 0 would strand every negative day into the 1-30 bucket below — the ladder only works if the first rung catches ALL of not-late." },
      ],
    },
    {
      id: "l54-f3",
      prompt:
        "The ladder must age money still owed, not sticker prices. Complete the detail query so each open invoice carries its outstanding — face value minus payments received.",
      template: "SELECT i.number,\n       i.amount_cents - COALESCE((SELECT SUM(p.amount_cents)\n         FROM payments p WHERE p.invoice_id = i.id), 0) AS {1}\nFROM invoices i\nWHERE i.status = 'open';",
      chips: ["outstanding", "amount_cents", "days_late", "face"],
      answers: ["outstanding"],
      why: "Aging OUTSTANDING, not face: Alice's INV-2025-025 sits in the 1-30 bucket at $2,148.00 — her $4,000.00 partial payment already left the building. Aging the full $6,148.00 would double-count money received.",
      notes: [
        { slot: 1, why: "amount_cents would alias the FACE value — the column this report must NOT age. The whole point of the column is face minus collected." },
      ],
    },
    {
      id: "l54-f4",
      prompt:
        "Alphabetical order walks the ladder as '1-30, 31-60, 61-90, 90+, current' — gibberish. Complete the custom-key sort so the buckets report in real ladder order.",
      template: "SELECT bucket, COUNT(*) AS n,\n       ROUND(SUM(outstanding) / 100.0, 2) AS total\nFROM (\n  SELECT CASE\n           WHEN days_late <= 0 THEN 'current'\n           WHEN days_late <= 30 THEN '1-30'\n           WHEN days_late <= 60 THEN '31-60'\n           WHEN days_late <= 90 THEN '61-90'\n           ELSE '90+' END AS bucket,\n         outstanding\n  FROM (\n    SELECT i.number,\n           CAST(julianday('2025-03-15') - julianday(i.due_on) AS INTEGER) AS days_late,\n           i.amount_cents - COALESCE((SELECT SUM(p.amount_cents)\n             FROM payments p WHERE p.invoice_id = i.id), 0) AS outstanding\n    FROM invoices i WHERE i.status = 'open'\n  )\n)\nGROUP BY bucket\nORDER BY CASE bucket WHEN 'current' THEN 0 WHEN '1-30' THEN 1\n                     WHEN '31-60' THEN 2 WHEN '61-90' THEN 3\n                     ELSE {1} END;",
      chips: ["4", "0", "1", "NULL"],
      answers: ["4"],
      why: "The ELSE catches the one bucket the WHENs didn't name — '90+' — and sorts it last. The report then reads like a doctor's chart: current 1 · 2794.0, 1-30 2 · 5710.0, 31-60 1 · 4937.0, 61-90 1 · 1295.0, 90+ 1 · 873.0.",
      notes: [
        { slot: 1, why: "0 would tie '90+' with 'current' and let the engine pick an arbitrary order — the closed switch needs the final rung's key." },
      ],
    },
    {
      id: "l54-f5",
      prompt:
        "The wide shape pivots the ladder into one row of columns. Complete the 90+ column so non-matching rows contribute zero instead of sinking the SUM.",
      template: "SELECT\n  ROUND(SUM(CASE WHEN days_late <= 0 THEN out ELSE 0 END) / 100.0, 2) AS current,\n  ROUND(SUM(CASE WHEN days_late > 90 THEN out {1} 0 END) / 100.0, 2) AS b90plus\nFROM (\n  SELECT CAST(julianday('2025-03-15') - julianday(i.due_on) AS INTEGER) AS days_late,\n         i.amount_cents - COALESCE((SELECT SUM(p.amount_cents)\n           FROM payments p WHERE p.invoice_id = i.id), 0) AS out\n  FROM invoices i WHERE i.status = 'open'\n);",
      chips: ["ELSE", "THEN", "WHEN", "AND"],
      answers: ["ELSE"],
      why: "Without ELSE, non-matching rows contribute NULL and SUM dies for any bucket with no members — the ELSE 0 is load-bearing. This store: 2794.0 | 5710.0 | 4937.0 | 1295.0 | 873.0 in one row, ready to paste into the Monday meeting.",
      notes: [
        { slot: 1, why: "THEN opens the value branch that's already there — the missing half is the fallback for rows that matched no WHEN." },
      ],
    },
  ],

  // Lesson 55 — MoM growth: strftime buckets, LAG, growth %, the sliding frame.
  55: [
    {
      id: "l55-f1",
      prompt:
        "Stage the billing history: one row per month with revenue in cents, cancelled bills excluded. Extract the month key from issued_on with strftime.",
      template: "WITH monthly AS (\n  SELECT strftime({1}, issued_on) AS mon,\n         SUM(amount_cents) AS rev\n  FROM invoices\n  WHERE status != 'void'\n  GROUP BY mon\n)\nSELECT mon, rev FROM monthly ORDER BY mon;",
      chips: ["'%Y-%m'", "'%Y'", "'%m'", "%Y-%m"],
      answers: ["'%Y-%m'"],
      why: "'%Y-%m' yields the zero-padded bucket key ('2024-02') — 13 months deep, 2024-02 through 2025-02. Unquoted, %Y-%m would be an identifier error; '%Y' or '%m' alone would bucket at the wrong grain.",
      notes: [
        { slot: 1, why: "Month-over-month needs month keys — a %Y bucket is yearly, a %m bucket folds every January of every year together." },
      ],
    },
    {
      id: "l55-f2",
      prompt:
        "Pull last month's revenue into this month's row — no self-join, no correlated subquery. Complete the peek.",
      template: "SELECT mon, rev,\n       {1}(rev) OVER (ORDER BY mon) AS prev\nFROM (\n  SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev\n  FROM invoices WHERE status != 'void'\n  GROUP BY mon\n) monthly;",
      chips: ["LAG", "LEAD", "FIRST_VALUE", "ROW_NUMBER"],
      answers: ["LAG"],
      why: "LAG(rev) OVER (ORDER BY mon) is the previous row's value pulled into this row. The first month's prev is NULL — there IS no February-before-February, and that NULL is the honest answer to 'growth versus what?'.",
      notes: [
        { slot: 1, why: "LEAD looks the other way — next month pulled back. The trend question 'up versus LAST month' is LAG's." },
      ],
    },
    {
      id: "l55-f3",
      prompt:
        "Growth is measured against where you were: complete the percent-change column — (this month − last month), as a percentage of last month.",
      template: "SELECT mon,\n  ROUND(100.0 * (rev - prev) / {1}, 1) AS pct\nFROM (\n  SELECT mon, rev, LAG(rev) OVER (ORDER BY mon) AS prev\n  FROM (\n    SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev\n    FROM invoices WHERE status != 'void'\n    GROUP BY mon\n  ) monthly\n) peeked\nORDER BY mon;",
      chips: ["prev", "rev", "mon", "100.0"],
      answers: ["prev"],
      why: "The denominator is prev — where you WERE. Swap it to rev and every percentage silently means something else. On this store the line whipsaws: 2024-08 prints +144.9% — real, but two invoices outweighing one; the moving average is the antidote.",
      notes: [
        { slot: 1, why: "rev in the denominator measures change against where you ARE — the number still computes, it just answers a different question without telling you." },
      ],
    },
    {
      id: "l55-f4",
      prompt:
        "The trend under the noise: average each month together with the two months before it, using an explicit sliding frame.",
      template: "SELECT mon,\n  ROUND(AVG(rev) OVER (\n    ORDER BY mon\n    {1} BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) / 100.0, 2) AS ma3\nFROM (\n  SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev\n  FROM invoices WHERE status != 'void'\n  GROUP BY mon\n) monthly;",
      chips: ["ROWS", "RANGE", "GROUPS", "PARTITION"],
      answers: ["ROWS"],
      why: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW clips to exactly three physical rows and slides. RANGE would interpret 2 as two mon VALUES (months back) — different semantics that happen to agree here only because month keys are unique; ROWS is the honest spelling of 'the last three'.",
      notes: [
        { slot: 1, why: "PARTITION BY would restart the average per group — there's nothing to restart here; the frame is what slides, and ROWS declares it." },
      ],
    },
    {
      id: "l55-f5",
      prompt:
        "One forgotten filter bends the whole trend around fake money: keep the void bill out of the monthly staging.",
      template: "SELECT strftime('%Y-%m', issued_on) AS mon,\n       SUM(amount_cents) AS rev\nFROM invoices\nWHERE status {1} 'void'\nGROUP BY mon;",
      chips: ["!=", "=", "IS", "LIKE"],
      answers: ["!="],
      why: "status != 'void' keeps open and paid — the money that actually happened. July's face total carries the $925.00 void; one forgotten filter and the growth line bends around a bill that was cancelled.",
      notes: [
        { slot: 1, why: "= 'void' would report ONLY the cancelled invoice — the trend of fake money. IS pairs with NULL, not with a text value." },
      ],
    },
  ],

  // Lesson 56 — reconciliation: trial balance, the two catches, naming the gap.
  56: [
    {
      id: "l56-f1",
      prompt:
        "The books checking themselves: one row per account with total debits and total credits, in dollars.",
      template: "SELECT account,\n       ROUND(SUM({1}) / 100.0, 2) AS debits,\n       ROUND(SUM(credit_cents) / 100.0, 2) AS credits\nFROM ledger_entries\nGROUP BY account\nORDER BY account;",
      chips: ["debit_cents", "credit_cents", "amount_cents", "balance"],
      answers: ["debit_cents"],
      why: "The trial balance: accounts_receivable 86052.0 / 69612.0, cash 69612.0 / 25416.0, operating_expenses 25416.0 / 0.0, sales_revenue 0.0 / 86052.0. Individual accounts are SUPPOSED to lean — only the whole book must balance.",
      notes: [
        { slot: 1, why: "credit_cents in the debits column would mirror the report — the ledger stores the two sides in named columns; read the one the column header promises." },
      ],
    },
    {
      id: "l56-f2",
      prompt:
        "The grand test in one row: total debits minus total credits across every entry. The result must be zero — the books can prove themselves.",
      template: "SELECT ROUND((SUM(debit_cents) - SUM({1})) / 100.0, 2) AS must_be_zero\nFROM ledger_entries;",
      chips: ["credit_cents", "debit_cents", "amount_cents", "id"],
      answers: ["credit_cents"],
      why: "0.00 — $181,080.00 of debits against $181,080.00 of credits, because every event wrote both legs. But balanced only proves SELF-consistent, not true: the ghost and the refund below are both invisible to this number.",
      notes: [
        { slot: 1, why: "Subtracting debits from debits gives 0 for a different reason — every leg would cancel itself; the test needs both SIDES of the books." },
      ],
    },
    {
      id: "l56-f3",
      prompt:
        "Catch #1 — a status that claims 'paid' with no payment evidence. Find invoices marked paid where no payment row exists at all.",
      template: "SELECT i.number, ROUND(i.amount_cents / 100.0, 2) AS amount\nFROM invoices i\nWHERE i.status = 'paid'\n  AND NOT {1} (SELECT 1 FROM payments p WHERE p.invoice_id = i.id);",
      chips: ["EXISTS", "IN", "NULL", "LIKE"],
      answers: ["EXISTS"],
      why: "NOT EXISTS is the NULL-safe anti-join: it asks 'is there ANY evidence?' and one $1,756.00 invoice later the answer is no — INV-2025-028, marked paid, no money ever arrived. NOT IN would collapse to zero rows the day payments grows a NULL.",
      notes: [
        { slot: 1, why: "NOT IN against a subquery that could return NULL flips the whole predicate to unknown — lesson 13's collapse, now an audit risk." },
      ],
    },
    {
      id: "l56-f4",
      prompt:
        "Catch #2 — money arrived against a cancelled bill. Join payments to their invoice, keep the voids: that's the refund owed.",
      template: "SELECT i.number, p.paid_on,\n       ROUND({1} / 100.0, 2) AS refund_owed\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nWHERE i.status = 'void';",
      chips: ["p.amount_cents", "i.amount_cents", "p.invoice_id", "i.amount_cents - p.amount_cents"],
      answers: ["p.amount_cents"],
      why: "INV-2024-011 · 2024-08-20 · $925.00 — Liam paid a bill that was later cancelled. The money that arrived is the PAYMENT's own amount; that's not revenue and not AR, it's a refund owed back to the customer.",
      notes: [
        { slot: 1, why: "i.amount_cents is the face value of the voided bill — the number printed on paper, not the money that actually moved." },
      ],
    },
    {
      id: "l56-f5",
      prompt:
        "Name the gap: economic truth is every open invoice plus the uncollected 'paid' ghost ($1,756.00, already caught). Complete the query that adds them up.",
      template: "SELECT ROUND((SUM(amount_cents) + 175600) / 100.0, 2) AS truth_ar\nFROM invoices\nWHERE status = {1};",
      chips: ["'open'", "'paid'", "'void'", "'open', 'paid'"],
      answers: ["'open'"],
      why: "$15,609.00 of open AR plus the $1,756.00 ghost = $17,365.00 — and now every cent of the ledger's $16,440.00 disagreement is named: the void payment's $925.00 credit that no AR debit ever balanced. Unexplained: $0.00. Tied out.",
      notes: [
        { slot: 1, why: "The 'paid' invoices net to zero in the walk (collected) except the ghost — which is the +175600 already added. Summing paid here would double-count it." },
      ],
    },
  ],

  // Lesson 57 — the gaze: CUME_DIST, the variance identity, Newton, z-scores.
  57: [
    {
      id: "l57-f1",
      prompt:
        "Standings, not ranks: show each non-void invoice's amount with the fraction of rows at or below it. The top of the distribution must read 1.0.",
      template: "SELECT number,\n       ROUND(amount_cents / 100.0, 2) AS amount,\n       ROUND(CUME_DIST() OVER ({1} amount_cents), 3) AS cd\nFROM invoices\nWHERE status != 'void';",
      chips: ["ORDER BY", "PARTITION BY", "ORDER", "GROUP BY"],
      answers: ["ORDER BY"],
      why: "CUME_DIST() OVER (ORDER BY amount_cents) = the share of the distribution at or below each row, always ending at 1.0. Over the 27 live invoices the top — INV-2025-025 at 6148.0 — reads cd 1.000, and exactly three invoices sit above 0.9.",
      notes: [
        { slot: 1, why: "PARTITION BY would compute the standings inside separate groups — the distribution here is the whole population, so it's ordered, not partitioned." },
      ],
    },
    {
      id: "l57-f2",
      prompt:
        "SQLite ships no STDDEV — build it. Step one is the variance identity: the average of the squares minus the square of the average. Complete it.",
      template: "SELECT AVG(spend * spend) - AVG(spend) * {1} AS var\nFROM (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses GROUP BY mon\n) monthly;",
      chips: ["AVG(spend)", "SUM(spend)", "spend", "AVG(spend * spend)"],
      answers: ["AVG(spend)"],
      why: "variance = AVG(x²) − AVG(x)² — one pass of AVG, no extensions needed. On the store's 14 monthly expense totals it feeds a mean of $1,815.43 and, after Newton, an SD of $423.12.",
      notes: [
        { slot: 1, why: "SUM(spend) is a total, not an average — squaring it would explode the variance by a factor of n² and every z-score with it." },
      ],
    },
    {
      id: "l57-f3",
      prompt:
        "Step two is the square root: a recursive CTE running Newton's method. Each step refines guess g by averaging it with var/g. Complete the step.",
      template: "WITH monthly AS (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses GROUP BY mon\n),\nstats AS (\n  SELECT AVG(spend) AS a, AVG(spend * spend) - AVG(spend) * AVG(spend) AS var\n  FROM monthly\n),\nnewton(n, g) AS (\n  SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5\n  UNION ALL\n  SELECT n + 1, (g + (SELECT var FROM stats) / {1}) / 2.0\n  FROM newton WHERE n < 30\n)\nSELECT n, g FROM newton WHERE n = 30;",
      chips: ["g", "n", "var", "2.0"],
      answers: ["g"],
      why: "g ← (g + var/g)/2 — each step DOUBLES the correct digits, so 30 iterations is overkill by a mile. The engine has no SQRT, but it has arithmetic and a loop, and that's the whole library.",
      notes: [
        { slot: 1, why: "var/g is the side that needs g — dividing by n would average against the row counter, and Newton's convergence dies with it." },
      ],
    },
    {
      id: "l57-f4",
      prompt:
        "How weird is August? Measure each month in standard deviations from the mean: (spend − mean) ÷ SD. Complete the z-score column.",
      template: "WITH monthly AS (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses GROUP BY mon\n),\nstats AS (\n  SELECT AVG(spend) AS a, AVG(spend * spend) - AVG(spend) * AVG(spend) AS var\n  FROM monthly\n),\nnewton(n, g) AS (\n  SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5\n  UNION ALL\n  SELECT n + 1, (g + (SELECT var FROM stats) / g) / 2.0\n  FROM newton WHERE n < 30\n)\nSELECT mon,\n       ROUND((spend - (SELECT a FROM stats))\n                   / (SELECT {1} FROM newton WHERE n = 30), 2) AS z\nFROM monthly\nORDER BY z DESC;",
      chips: ["g", "n", "var", "a"],
      answers: ["g"],
      why: "g at n = 30 IS the square root of the variance — the SD. August's $3,210.00 prints z = 3.30: not a judgement call anymore, a statistical event (the trade show, wearing a number). |z| ≥ 3 flags roughly 0.1% of months.",
      notes: [
        { slot: 1, why: "a is the MEAN — subtracting it is already done. Dividing by the mean again would measure ratio, not deviation, and the sigma language collapses." },
      ],
    },
    {
      id: "l57-f5",
      prompt:
        "The biggest month so far, without the LAST_VALUE frame trap: aggregate semantics don't play frame games. Complete the running maximum.",
      template: "SELECT mon, spend,\n       {1}(spend) OVER (ORDER BY mon) AS biggest_so_far\nFROM (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses GROUP BY mon\n) me;",
      chips: ["MAX", "LAST_VALUE", "FIRST_VALUE", "SUM"],
      answers: ["MAX"],
      why: "MAX(spend) OVER (ORDER BY mon) is a running max — the largest value up to each row, no frame subtleties. LAST_VALUE with the default RANGE frame stops at the CURRENT row and returns spend itself: the most-common window bug in the wild, dodged by using an aggregate.",
      notes: [
        { slot: 1, why: "LAST_VALUE is for when the value IS a position — with the default frame ending at the current row it hands back your own value, not the running champion." },
      ],
    },
  ],
};
