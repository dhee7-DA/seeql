import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson53: Lesson = {
  id: "lesson-53",
  num: 53,
  title: "Running balances — the account statement",
  blurb: "UNION ALL invoices and payments into one timeline, then SUM() OVER turns it into a customer's balance walk",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "Every bank statement ever printed is the same SQL shape: a **timeline of ins and outs**, with the balance recalculated after each line. The books hold the raw material — `invoices` add to what a customer owes, `payments` subtract — but they live in two tables. Lesson 24's set operations bolt them into one timeline; lesson 32's window functions walk it. Together they produce the single most-requested finance report in existence: the account statement.",
    },
    { kind: "diagram", figure: "fin2-statement-walk" },
    { kind: "h", text: "Two tables, one timeline" },
    {
      kind: "code",
      caption: "The staging act: invoices push the balance UP, payments pull it DOWN",
      sql: `SELECT 'invoice' AS kind, issued_on AS d,  amount_cents AS amt
FROM invoices      WHERE customer_id = 1
UNION ALL
SELECT 'payment', p.paid_on, -p.amount_cents
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
WHERE i.customer_id = 1
ORDER BY d;   -- 14 rows: 5 invoices, 9 payments, one Alice`,
    },
    {
      kind: "bullets",
      items: [
        "`UNION ALL`, never bare `UNION` — two payments of exactly $2,430.00 are legitimate distinct events; `UNION` would deduplicate them and **hide real money**. (Lesson 17's first rule, now an accounting control.)",
        "Payments enter **negated**: `-p.amount_cents`. The subtraction happens at staging, so the balance walk is a pure running `SUM` — no sign logic downstream.",
        "Both branches must agree on column count and order (kind, date, amount); the first branch's aliases name the output.",
      ],
    },
    { kind: "h", text: "The window walk" },
    {
      kind: "code",
      caption: "SUM() OVER (ORDER BY d) — the running total, in dollars",
      sql: `SELECT kind, d,
       ROUND(amt / 100.0, 2) AS amt,
       ROUND(SUM(amt) OVER (ORDER BY d) / 100.0, 2) AS balance
FROM ( /* …the UNION ALL staging from above… */ ) t
ORDER BY d;
-- 2025-01-22  invoice  6148.0   balance 6148.0
-- 2025-02-10  payment -4000.0   balance 2148.0  ← Alice today`,
    },
    {
      kind: "bullets",
      items: [
        "`SUM(amt) OVER (ORDER BY d)` — an aggregate turned into a *walk*: each row's value is the sum of everything up to and including it, in `d` order. No GROUP BY collapse; 14 rows in, 14 rows out.",
        "The ORDER BY inside OVER is the walk order; the outer ORDER BY is presentation. They match here — but they are different clauses doing different jobs.",
        "Alice's walk ends at **$2,148.00** — the outstanding balance lesson 52 computed with a correlated subquery. Same truth, second engine.",
      ],
    },
    {
      kind: "warn",
      text: "The default frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — RANGE, not ROWS. With duplicate dates, RANGE folds all same-date rows into one step (correct for statements!), while `ROWS` would expose intermediate half-applied balances. Know which you're on before trusting the walk.",
    },
    { kind: "h", text: "Many customers, many walks" },
    {
      kind: "code",
      caption: "PARTITION BY customer — one independent statement per customer",
      sql: `SELECT name, kind, d,
       SUM(amt) OVER (PARTITION BY name ORDER BY d) / 100.0 AS balance
FROM ( /* …staging joined to customers for the name… */ ) t;
-- each name restarts its walk at its first invoice`,
    },
    {
      kind: "bullets",
      items: [
        "Without `PARTITION BY name`, every customer's events would braid into one global walk — Alice's payments would pay down Pedro's debt.",
        "The final walk value IS the customer's current balance… with one asterisk: it counts **paid** invoices too, which net to zero. Settled history washes out — unless a 'paid' invoice secretly has no payments. Lesson 56 hunts exactly that ghost.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Window functions arrived in SQLite 3.25 (2018). The store's engine supports the full vocabulary: PARTITION BY, ORDER BY, and explicit frames — everything this lesson needs.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Identical syntax — and Postgres adds a performance trick for statements at scale: an index on (customer_id, issued_on) lets the window walk stream in order instead of sorting.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8+ matches the syntax too. Before MySQL 8 there were NO window functions — statements were self-join accumulators, the single most-copied stack-overflow snippet of the era. Cherish your OVER.",
    },
    {
      kind: "tip",
      text: "Statement = staging (UNION ALL, signed amounts) + walk (SUM OVER, ordered) + presentation (outer ORDER BY, dollar conversion). Memorize the three layers and every balance report in any warehouse is yours.",
    },
  ],
  mcqs: [
    {
      id: "l53-q1",
      prompt: "In the statement staging, why `UNION ALL` instead of `UNION`?",
      choices: [
        "UNION can't mix two different tables",
        "Two identical payment rows are distinct events — UNION would deduplicate them and hide real money",
        "UNION ALL is prettier output",
        "UNION requires the tables to have identical names",
      ],
      answer: 1,
      why: "UNION deduplicates whole rows. Two $2,430.00 card payments on the same day are two arrivals of real cash — collapsing them understates collections by one payment. Audit-grade reports use UNION ALL.",
      notes: [
        { choice: 0, why: "UNION happily mixes tables — its price is the deduplication pass, which is exactly the behavior you can't afford here." },
      ],
    },
    {
      id: "l53-q2",
      prompt: "Why do payments enter the staging timeline as `-p.amount_cents`?",
      choices: [
        "The payments table stores them negative already",
        "So the balance walk is one plain SUM — the sign logic happens once, at staging",
        "SQLite requires negative amounts in UNIONs",
        "To make invoices sort first",
      ],
      answer: 1,
      why: "Negate at the boundary and every downstream number is a straight running SUM — no CASE, no sign flipping in the window. One decision, three layers of simplicity.",
      notes: [
        { choice: 0, why: "The payments table stores positive cents — the negation is YOUR staging decision, which is why it belongs in the innermost SELECT." },
      ],
    },
    {
      id: "l53-q3",
      prompt: "What does `SUM(amt) OVER (ORDER BY d)` compute for the 3rd row of a walk?",
      choices: [
        "Just the 3rd row's amt",
        "The sum of all rows — same on every row",
        "The sum of rows 1 through 3 in `d` order — the running total",
        "An error — SUM can't take OVER",
      ],
      answer: 2,
      why: "ORDER BY inside OVER frames the window as 'everything from the start up to this row'. Each row sees its own prefix sum — that IS the statement walk.",
      notes: [
        { choice: 1, why: "A bare `SUM(amt) OVER ()` — no ORDER BY — does exactly that: the grand total painted on every row. The ORDER BY is what makes it a walk." },
      ],
    },
    {
      id: "l53-q4",
      prompt: "You drop `PARTITION BY name` from the multi-customer walk. What happens?",
      choices: [
        "Nothing — SQLite infers partitions",
        "Every customer's events braid into one global walk — Alice's payments reduce Pedro's balance",
        "The query errors on ambiguous columns",
        "Balances double",
      ],
      answer: 1,
      why: "The window then frames ALL rows into one sequence. A statement per customer needs the partition boundary — it's the SQL spelling of 'per account'.",
      notes: [
        { choice: 3, why: "Nothing doubles — the amounts are just summed across the wrong boundary. Wrong-partition bugs don't crash; they quietly misattribute money." },
      ],
    },
    {
      id: "l53-q5",
      prompt: "Alice's walk: invoice +4860 on Feb 5, then payments −2430 (Feb 20) and −2430 (Mar 5). What balance does the Mar 5 row show?",
      choices: ["−4860", "0", "2430", "4860"],
      answer: 1,
      why: "4860 − 2430 − 2430 = 0 — the invoice fully settled, exactly as the books say. The walk makes settlement visible as the balance touching zero.",
      notes: [
        { choice: 2, why: "2430 was the balance AFTER the first payment — the Mar 5 row applies the second one too. Each row includes its own amount (frame is …CURRENT ROW, not …PREVIOUS)." },
      ],
    },
    {
      id: "l53-q6",
      prompt: "The default window frame is RANGE … CURRENT ROW. Two payments share one date. What does RANGE do that ROWS wouldn't?",
      choices: [
        "RANGE skips the duplicates entirely",
        "RANGE peers at the date VALUES — all same-date rows join the frame together, so the balance steps once per distinct date",
        "RANGE reverses their order",
        "No difference — they're synonyms",
      ],
      answer: 1,
      why: "ROWS counts physical rows (one step per row — peers split across intermediate balances); RANGE compares ORDER BY values and includes PEERS as a block. For statements, stepping per date is the honest presentation.",
      notes: [
        { choice: 3, why: "Subtly different — and the difference is invisible until duplicate ORDER BY values appear. Which is exactly when it matters." },
      ],
    },
    {
      id: "l53-q7",
      prompt: "In the staging subquery, the payment branch joins payments → invoices. What breaks if that join is forgotten and `WHERE customer_id = 1` is applied to payments directly?",
      choices: [
        "Nothing — payments have customer_id too",
        "A syntax error — you can't filter payments by customer",
        "It returns ALL customers' payments — payments has no customer_id, only invoice_id; the join is the only path to the customer",
        "Only the first payment per customer survives",
      ],
      answer: 2,
      why: "The schema's discipline: payments reference INVOICES, and only invoices carry customer_id. Following the foreign-key chain is lesson 11's three-table hop, one link long.",
      notes: [
        { choice: 1, why: "Filtering an absent column errors, yes — but the deeper point is the join isn't optional plumbing, it's the only route from money-back to the customer." },
      ],
    },
    {
      id: "l53-q8",
      prompt: "The walk's LAST row per customer equals the customer's live balance. When does that lie?",
      choices: [
        "When the customer's name is long",
        "When a 'paid' invoice has no payment rows — the uncollected ghost rides the walk as if settled history, inflating the final number",
        "When all invoices are settled — then it shows 0 instead of nothing",
        "Never — the last row is always the balance",
      ],
      answer: 1,
      why: "Net-walk balance = invoiced − collected. A paid-status invoice with zero payments still adds its full face to the walk. On this store that's INV-2025-028's $1,756.00 — the lesson-56 catch, visible early if you cross-check against status-based outstanding.",
      notes: [
        { choice: 2, why: "A zero final balance is CORRECT for a fully settled customer — not a lie. The lie is specifically status-claims contradicted by missing evidence." },
      ],
    },
    {
      id: "l53-q9",
      prompt: "Why stage the UNION ALL in a derived table instead of writing the window function directly on each branch?",
      choices: [
        "Derived tables run faster",
        "Window functions can't be written on a UNION at all — the branches must first become one result set for the walk to see every event",
        "The aliases would collide",
        "To avoid the COALESCE",
      ],
      answer: 1,
      why: "A window over a UNION would evaluate per-branch — two walks, not one braided timeline. Staging first gives the window ONE ordered stream. Layer: stage, then walk, then present.",
      notes: [
        { choice: 2, why: "Aliases live only in the first branch — that's already handled. The forcing function is the single-stream requirement, not naming." },
      ],
    },
    {
      id: "l53-q10",
      prompt: "Days-to-pay: `julianday(MAX(paid_on)) - julianday(issued_on)` grouped per invoice. Why MAX?",
      choices: [
        "MAX is required by GROUP BY law",
        "Split payments land on different days — the LAST payment is the day the invoice finished settling",
        "MAX converts text to a date",
        "MIN would count deposits, MAX counts balances",
      ],
      answer: 1,
      why: "INV-2024-001 settled across two payments (Feb 20, Mar 5). The invoice 'finished paying' on its latest payment date — MAX — giving 29 days from issue, not 15.",
      notes: [
        { choice: 3, why: "Both are per-invoice payment facts, but the brief is 'days to pay' — settlement completes at the final payment. MIN would measure the deposit, a different (also useful) metric." },
      ],
    },
    {
      id: "l53-q11",
      prompt: "Global running collections end July 2024 at $33,756.50 (payments summed by month, walked). One $925.00 payment in that total is not really 'collected revenue'. Which?",
      choices: [
        "Emma's $4,937.00 open invoice",
        "The $925.00 paid against the VOID invoice — money received for a cancelled bill, refund owed",
        "Alice's $4,000.00 partial payment",
        "None — every payment in the walk is collectible",
      ],
      answer: 1,
      why: "INV-2024-011 was voided, but its $925.00 payment landed anyway (Aug 20). It inflates the collections walk until lesson 56's reconciliation flags it as a refund owed, not revenue collected.",
      notes: [
        { choice: 2, why: "Alice's partial is genuine money toward a live invoice — the walk SHOULD carry it. Only the void payment is money the store must give back." },
      ],
    },
  ],
  problems: [
    {
      id: "l53-p1",
      title: "Alice's statement",
      brief: "Customer 1's full walk: `kind` ('invoice'/'payment'), `d` (date), `amt` (signed, dollars) and `balance` = the running SUM in dollars, ordered by d then kind. Fourteen rows; final balance $2,148.00.",
      hints: [
        "Stage the UNION ALL first (payments negated, joined through invoices for the customer), then walk with SUM(amt) OVER (ORDER BY d, kind).",
        "Shape: SELECT kind, d, ROUND(amt/100.0,2) AS amt, ROUND(SUM(amt) OVER (ORDER BY d, kind)/100.0,2) AS balance FROM (SELECT 'invoice' AS kind, issued_on AS d, amount_cents AS amt FROM invoices WHERE customer_id = 1 UNION ALL SELECT 'payment', p.paid_on, -p.amount_cents FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = 1) t ORDER BY d, kind;",
      ],
      difficulty: "medium",
      solution:
        "SELECT kind, d,\n  ROUND(amt / 100.0, 2) AS amt,\n  ROUND(SUM(amt) OVER (ORDER BY d, kind) / 100.0, 2) AS balance\nFROM (\n  SELECT 'invoice' AS kind, issued_on AS d, amount_cents AS amt\n  FROM invoices WHERE customer_id = 1\n  UNION ALL\n  SELECT 'payment', p.paid_on, -p.amount_cents\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n  WHERE i.customer_id = 1\n) t\nORDER BY d, kind;",
      mistakes: [
        { test: "union[^\\s]", message: "Bare UNION deduplicates — two identical $2,430.00 payments would collapse into one and Alice's statement would hide real cash. UNION ALL." },
        { test: "amount_cents\\s+as\\s+amt\\s+from\\s+payments|from\\s+payments\\s+p?\\s*where\\s+customer_id", message: "Payments don't carry customer_id — join payments → invoices to reach the customer, and negate the amount: -p.amount_cents." },
        { test: "partition\\s+by", message: "One customer, one walk — PARTITION BY is for the multi-customer version. Here the ORDER BY inside OVER alone makes the running total." },
      ],
      expected: EXPECTED["l53-p1"],
      ordered: true,
    },
    {
      id: "l53-p2",
      title: "Who owes us today",
      brief: "Live balances by status: for open invoices, `name` and `balance` = ROUND(SUM(invoice amount − payments received)/100.0, 2), biggest first. Six customers.",
      hints: [
        "Per-invoice outstanding via the correlated subquery (lesson 52), then GROUP BY customer and sum the outstandings.",
        "Shape: SELECT c.name, ROUND(SUM(i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0))/100.0, 2) AS balance FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'open' GROUP BY c.name ORDER BY balance DESC, c.name;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name,\n  ROUND(SUM(i.amount_cents - COALESCE(\n    (SELECT SUM(p.amount_cents)\n     FROM payments p WHERE p.invoice_id = i.id), 0)) / 100.0, 2) AS balance\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nWHERE i.status = 'open'\nGROUP BY c.name\nORDER BY balance DESC, c.name;",
      mistakes: [
        { test: "status\\s*!=\\s*'open'|status\\s*=\\s*'paid'", message: "Live balances live on OPEN invoices — paid history nets to zero, and the walk-through-everything version drags in the lesson-56 ghost." },
        { test: "group\\s+by\\s+c\\.name[^;]*having", message: "No HAVING needed — every customer with an open invoice has a positive balance; the brief wants all six." },
        { test: "sum\\s*\\(\\s*i\\.amount_cents\\s*\\)\\s*-", message: "Summing invoices then subtracting a separate payments SUM mixes two granularities — Alice's $4,000 partial must land on HER invoice inside the per-invoice subquery." },
      ],
      expected: EXPECTED["l53-p2"],
      ordered: true,
    },
    {
      id: "l53-p3",
      title: "Emma's slide into debt",
      brief: "Customer 5's walk, same shape as Alice's: `kind`, `d`, `amt`, `balance` (dollars), ordered by d then kind. Seven rows ending at her full open invoice.",
      hints: [
        "Copy the l53-p1 skeleton and switch the customer — the structure IS the lesson.",
        "Shape: same UNION ALL staging with customer_id = 5, walked with SUM(amt) OVER (ORDER BY d, kind).",
      ],
      difficulty: "medium",
      solution:
        "SELECT kind, d,\n  ROUND(amt / 100.0, 2) AS amt,\n  ROUND(SUM(amt) OVER (ORDER BY d, kind) / 100.0, 2) AS balance\nFROM (\n  SELECT 'invoice' AS kind, issued_on AS d, amount_cents AS amt\n  FROM invoices WHERE customer_id = 5\n  UNION ALL\n  SELECT 'payment', p.paid_on, -p.amount_cents\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n  WHERE i.customer_id = 5\n) t\nORDER BY d, kind;",
      mistakes: [
        { test: "customer_id\\s*=\\s*1", message: "That's Alice's statement — the brief wants customer 5, Emma Wilson." },
        { test: "union[^\\s]", message: "UNION dedupes; Emma's history happens to survive it, but the discipline is UNION ALL — one duplicate payment away from a hidden deposit." },
        { test: "order\\s+by\\s+balance", message: "Sorting by balance scrambles the timeline — walk order is date order: ORDER BY d, kind." },
      ],
      expected: EXPECTED["l53-p3"],
      ordered: true,
    },
    {
      id: "l53-p4",
      title: "Days to pay",
      brief: "For every paid invoice that HAS payments: `number` and `days` = CAST(julianday(MAX(paid_on)) − julianday(issued_on) AS INTEGER). Slowest first. Twenty rows — and a familiar slowcoach on top.",
      hints: [
        "Join payments to invoices, GROUP BY the invoice, take MAX(paid_on) as the settlement date, and measure against issued_on with julianday.",
        "Shape: SELECT i.number, CAST(julianday(MAX(p.paid_on)) - julianday(i.issued_on) AS INTEGER) AS days FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'paid' GROUP BY i.id ORDER BY days DESC, i.number;",
      ],
      difficulty: "hard",
      solution:
        "SELECT i.number,\n  CAST(julianday(MAX(p.paid_on)) - julianday(i.issued_on) AS INTEGER) AS days\nFROM invoices i\nJOIN payments p ON p.invoice_id = i.id\nWHERE i.status = 'paid'\nGROUP BY i.id\nORDER BY days DESC, i.number;",
      mistakes: [
        { test: "\\bmin\\s*\\(\\s*p\\.paid_on", message: "MIN measures the deposit, not settlement — the brief is days to pay IN FULL: MAX(paid_on)." },
        { test: "status\\s*!=\\s*'paid'", message: "The paid book is the population — open invoices haven't finished paying, so their days-to-pay doesn't exist yet." },
        { test: "\\bavg\\s*\\(\\s*p\\.paid_on|julianday\\s*\\(\\s*p\\.paid_on\\s*\\)\\s*-", message: "julianday on raw payment rows measures per-PAYMENT lags, not the invoice's settlement — aggregate MAX first, then convert." },
      ],
      expected: EXPECTED["l53-p4"],
      ordered: true,
    },
    {
      id: "l53-p5",
      title: "The 30-day club",
      brief: "What share of paid invoices settle within 30 days of issue? One column `on_time_pct` = ROUND(100.0 * settled-in-30 / all-paid-with-payments, 1).",
      hints: [
        "Build the per-invoice days table (l53-p4) as a derived table, then CASE-count the ≤ 30 rows over COUNT(*).",
        "Shape: SELECT ROUND(100.0 * SUM(CASE WHEN days <= 30 THEN 1 ELSE 0 END) / COUNT(*), 1) AS on_time_pct FROM (SELECT julianday(MAX(p.paid_on)) - julianday(i.issued_on) AS days FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'paid' GROUP BY i.id) t;",
      ],
      difficulty: "hard",
      solution:
        "SELECT ROUND(100.0 *\n  SUM(CASE WHEN days <= 30 THEN 1 ELSE 0 END) / COUNT(*), 1) AS on_time_pct\nFROM (\n  SELECT julianday(MAX(p.paid_on)) - julianday(i.issued_on) AS days\n  FROM invoices i\n  JOIN payments p ON p.invoice_id = i.id\n  WHERE i.status = 'paid'\n  GROUP BY i.id\n) t;",
      mistakes: [
        { test: "<\\s*30", message: "Boundary — 'within 30 days' includes day 30 itself: days <= 30. Excluding it silently shrinks the club." },
        { test: "having\\s+days|where\\s+days\\s*<=\\s*30", message: "Filtering to fast payers BEFORE counting makes the ratio 100% forever — count the club over ALL payers with CASE, not WHERE." },
        { test: "\\bcount\\s*\\(\\s*days\\s+<=", message: "COUNT can't take a condition — SUM(CASE WHEN … THEN 1 ELSE 0 END) is the counting idiom inside one pass." },
      ],
      expected: EXPECTED["l53-p5"],
    },
    {
      id: "l53-p6",
      title: "The year of collections",
      brief: "Collections walked month by month: `mon`, `collected` (that month's payment total, dollars) and `running` (cumulative, dollars), chronological. Thirteen months, ending at the grand total.",
      hints: [
        "Stage monthly totals first (GROUP BY strftime month), then walk them — windows can't see through a GROUP BY in the same SELECT, so the derived table does the collapsing.",
        "Shape: SELECT mon, collected, ROUND(SUM(collected) OVER (ORDER BY mon)/100.0, 2) AS running FROM (SELECT strftime('%Y-%m', paid_on) AS mon, SUM(amount_cents)/100.0 AS collected FROM payments GROUP BY mon) t ORDER BY mon;",
      ],
      difficulty: "hard",
      solution:
        "SELECT mon, collected,\n  ROUND(SUM(collected) OVER (ORDER BY mon) / 100.0, 2) AS running\nFROM (\n  SELECT strftime('%Y-%m', paid_on) AS mon,\n    SUM(amount_cents) / 100.0 AS collected\n  FROM payments\n  GROUP BY mon\n) t\nORDER BY mon;",
      mistakes: [
        { test: "sum\\s*\\(\\s*sum\\s*\\(", message: "Nested aggregates don't parse — collapse to months in the derived table FIRST, then the window rides on the collapsed rows." },
        { test: "partition\\s+by\\s+mon", message: "PARTITION BY mon would restart the walk every month — each row would show only itself. The brief is cumulative: no partition, just ORDER BY mon." },
        { test: "order\\s+by\\s+running\\s+desc", message: "The walk is chronological — ORDER BY mon. Sorting by running DESC is a different (valid, but different) report." },
      ],
      expected: EXPECTED["l53-p6"],
      ordered: true,
    },
  ],
  takeaway: "Stage (UNION ALL, signed), walk (SUM OVER, ordered, partitioned per customer), present — the three-layer skeleton behind every balance statement ever emailed.",
  deep: [
    {
      kind: "mind",
      text: "An account statement is **time plus accumulation**: rows in chronological order, each carrying the balance after its event. The window form — SUM(amount) OVER (PARTITION BY account ORDER BY entry_date, id) — is the whole trick: partition is the account boundary, order is the timeline, and the ORDER-BY'd SUM becomes the snowball. Two details separate a toy from a bank-grade statement: the **tiebreak** (same-day entries post in id order; without it the statement re-shuffles between runs) and the **sign discipline** (debits and credits as signed values, or a CASE that signs them — mixing unsigned columns with subtraction logic mid-window is where balances go wrong). The seed's ledger carries 80 entries; the walk should reconcile to the raw SUM exactly — equality is the receipt.",
    },
    {
      kind: "engine",
      title: "you run SELECT entry_date, account, debit_cents - credit_cents, SUM(debit_cents - credit_cents) OVER (PARTITION BY account ORDER BY entry_date, id) AS balance FROM ledger_entries",
      steps: [
        "**Sign per row** — the signed delta (debit − credit) normalizes the two-column ledger into one additive stream. Positive = owed grows; negative = payment lands.",
        "**Stage + timeline** — PARTITION BY account isolates each account's walk; ORDER BY entry_date, id fixes same-day posting order deterministically.",
        "**Implicit frame** — ORDER BY inside OVER defaults the frame to 'start through current row': the running balance. The engine accumulates in one sort plus one pass — no self-join.",
        "**Reconcile** — final row's balance must equal SUM(delta) over the whole account. It always will, mathematically — the check is that YOUR delta expression matches the business's signing convention.",
      ],
    },
    {
      kind: "myth",
      myth: "\"Running balance needs a cursor or application code — SQL can't keep state row to row.\"",
      truth: "The window IS the state: the frame 'preceding through current' encodes everything accumulated so far. The pre-window idiom (correlated subquery summing all prior rows) computes the same thing at O(n²); ORDER-BY'd SUM is O(n log n) and reads like the statement it produces.",
    },
    {
      kind: "edge",
      items: [
        { c: "Same-timestamp events", r: "Opening and closing entry on one date: without the id tiebreak, their post-order is arbitrary and the EOD balance can differ run to run. (date, id) is the deterministic spine." },
        { c: "Reverse signing", r: "If the ledger stores credits as negatives already, debit - credit double-negates. Read the schema's convention FIRST — the walk is trivial; the sign contract is the exam." },
        { c: "Multi-account walk", r: "Forget the PARTITION and one account's balance opens with another's history. The partition is the wall between wallets." },
        { c: "Backdated entries", r: "An entry inserted with an OLD date lands mid-walk — every later balance shifts. That's correct double-entry behavior, but any cached statement is now stale: statements are derived, never stored." },
      ],
    },  ],
};
