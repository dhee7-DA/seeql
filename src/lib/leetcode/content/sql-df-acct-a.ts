// Deep-dives — Data & Finance batch 3, accounting-close file A: the trial
// balance, the AR aging schedule and the period balance rollforward (3
// problems: 1 Easy + 2 Medium, all order:"exact" reads). Every money column
// is INTEGER cents with the _cents suffix; own tables, own seeds, original
// phrasing — never copied problem text. Batch 3 adds a per-dive DOMAIN
// PRIMER (LcPrimer): the concept taught from zero for first-time learners.
// Registry wiring (lead): 8037 trial-balance-check ·
// 8038 ar-aging-schedule · 8039 balance-rollforward.
import type { LcSqlDive } from "../types";

export const SQL_DF_ACCT_A: LcSqlDive[] = [
  {
    slug: "trial-balance-check",
    statement:
      "The accounts table lists the chart of accounts (account_id, account_name) and the journal_lines table records every posted amount as (line_id, entry_id, account_id, debit_cents, credit_cents). Every line carries exactly one nonzero side — debit_cents > 0 or credit_cents > 0, never both and never neither — so each line feeds exactly one of the two columns. Produce the per-account trial balance: debit_total_cents and credit_total_cents are each account's column sums, delta_cents is debit_total_cents minus credit_total_cents, and balance_status labels the account 'balanced' when the delta is 0, 'debit balance' when it is positive and 'credit balance' otherwise. Report one row per account that has at least one journal line — accounts with no lines are excluded — as the columns account_id, account_name, debit_total_cents, credit_total_cents, delta_cents and balance_status, ordered by account_id ascending.",
    examples: [
      {
        input:
          "account 1 cash — four lines post debits of 500000 and 75000 and credits of 500000 and 75000",
        output: "1 · cash · 575000 · 575000 · 0 · balanced",
        explanation:
          "Both columns sum to 575000, so the delta is 0 and the account reads balanced — the exact state the trial balance exists to confirm.",
      },
      {
        input:
          "account 5 payroll_expense — three lines post debits of 148000 and 54000 and a single credit of 200000",
        output: "5 · payroll_expense · 202000 · 200000 · 2000 · debit balance",
        explanation:
          "The debit column wins by 2000 cents, so the delta is positive and the label is debit balance — a real close would chase this account before moving on.",
      },
    ],
    constraints: [
      "every journal line carries exactly one nonzero side: debit_cents > 0 or credit_cents > 0, never both and never neither — the sums are well defined with no side-gating CASE",
      "delta_cents = debit_total_cents - credit_total_cents, and balance_status is 'balanced' at delta 0, 'debit balance' at positive delta, 'credit balance' otherwise",
      "one row per account with at least one journal line; an account with no lines contributes no row even though a LEFT JOIN variant would happily emit one",
      "ORDER BY account_id ASC",
    ],
    primer: {
      hook:
        "The trial balance is the ledger's daily smoke test: add up every account's debits and credits and confirm the two sides agree, because if they do not, something upstream posted wrong.",
      concept: [
        "Bookkeeping records money movement in a two-column format, and the two columns are called debit and credit. Despite the everyday meanings of those words, neither one means good or bad, gained or lost — they are simply the left side and the right side of an account, the way a notebook page has two columns. Every amount ever recorded sits in exactly one of the two columns. Which column an amount lands in is decided by conventions this exercise pins for you, and the report itself only cares about the totals of each column.",
        "The system is called double-entry bookkeeping because every business event touches at least two accounts at once — money arrives somewhere and leaves somewhere else. A customer payment might raise the cash account on one side while reducing the receivables account on the other. Because every event writes both a left-column amount and a right-column amount somewhere in the books, the grand total of all debits should equal the grand total of all credits. That symmetry is the whole trick: it gives accountants a mechanical way to detect half-finished or botched recordings.",
        "The trial balance is the report that checks that symmetry account by account: it sums the debit column and the credit column of every account and shows the difference, called the delta here. An account whose two totals agree is labeled balanced, and one whose totals disagree is carrying a debit balance or a credit balance depending on which side is heavier. It is the first checkpoint of every accounting close because nothing downstream — financial statements, tax filings, audit sign-offs — can be trusted while an account sits out of balance. A clean trial balance does not prove the books are right, but an unclean one proves something is wrong.",
        "When an account comes out of balance, close teams treat it as a stop sign rather than a rounding problem. The usual suspects are a line posted to only one side, an amount keyed with a typo, or a line parked in a suspense account while someone chases the missing detail. Teams investigate, correct with a reversing or correcting entry, and re-run the report until every account reads balanced or carries an explained balance. In this exercise the sign convention is uniform, so a positive delta simply means the debit column won.",
      ],
      worked: [
        "Say three lines hit the cash account: a 500000-cent debit, then a 200000-cent credit, then a 75000-cent debit.",
        "Add each column separately: debits total 500000 + 75000 = 575000 cents, credits total 200000 cents.",
        "The delta is 575000 - 200000 = 375000 cents, so cash carries a debit balance.",
        "Now a fourth line posts a 375000-cent credit: credits rise to 575000, the delta drops to 0, and cash reads balanced.",
        "Nothing about good or bad appeared anywhere in the arithmetic — only left-column totals versus right-column totals.",
      ],
      glossary: [
        { term: "debit", def: "the left column of an account, where increases land for asset and expense accounts" },
        { term: "credit", def: "the right column of an account, the mirror side of the debit column" },
        { term: "double-entry bookkeeping", def: "the recording system where every event touches at least two accounts so the columns stay in step" },
        { term: "journal line", def: "one recorded amount on one account, carrying a debit or a credit but never both" },
        { term: "trial balance", def: "the per-account report of debit totals, credit totals and their difference" },
        { term: "out of balance", def: "the state where an account's debit and credit totals disagree" },
      ],
      reallife: [
        "At a real company the trial balance is run constantly — staff accountants pull it daily or weekly, not just at month end. A controller scans the delta column for anything nonzero and assigns the investigation before the close calendar moves on. Payment runs, payroll postings and bank feeds all push lines into the journal, and any one of them can arrive half-posted. Catching a broken account the day it breaks is minutes of work; catching it three weeks later is an archaeology project.",
        "What breaks in practice is rarely dramatic. A bank feed posts the money side of a transaction while the matching invoice side fails validation; an intern keys 45000 as 54000 and two accounts disagree by a transposed pair; a line sits in suspense waiting for a document. The report drives real decisions: which accountant gets the ticket, whether the close slips, and whether an automated posting job needs to be switched off until it is fixed. Software teams that build billing or payments products run the same check over their own ledger tables, which is exactly the query you are about to write.",
      ],
      where:
        "Staff and general-ledger accountants run it daily, auditors demand it at every close, and fintech and payments-engineering interviews ask you to produce it from raw ledger tables.",
    },
    breakdown: [
      "The report is a per-account GROUP BY with a twist in the label column. Summing debit_cents and credit_cents per account gives the two column totals, and subtracting them gives the delta that decides the status. Because the pinned constraint guarantees each line has exactly one nonzero side, the two sums never pollute each other — no CASE gate is needed before summing. The whole computation rides on a join from each account to its lines, grouped by account.",
      "The traps all live in the join and the arithmetic. Joining lines to accounts without the account key fans every account out to every line, so each account's totals read the grand totals — 1071700 versus 1615000 on this seed — and every row mislabels itself the same way. Collapsing the two sides into one SUM(debit + credit) destroys the distinction the report exists to make: balanced cash would read 1150000 instead of a 0 delta. And flipping the subtraction (credit minus debit) keeps the magnitudes but relabels every nonzero account, turning debit-heavy payroll into a 'credit balance'.",
      "The quiet-account question decides the join type. The contract counts only accounts WITH lines, so an INNER JOIN happens to match it on this seed — but the LEFT JOIN variant emits a seventh row for the line-less account with NULL totals, and its CASE falls through every comparison to 'credit balance' because NULL never tests true. That behavior is worth knowing cold: the ELSE arm swallows NULL deltas silently. The honest query here is the plain INNER JOIN grouped by account, ordered by account_id.",
    ],
    edges: [
      "The fanout probe: joining journal_lines to accounts on a non-key filter (debit_cents >= 0) pairs every one of the 15 lines with every one of the 7 accounts, so each account's GROUP sums read the grand totals 1071700 and 1615000 — a report where every row is wrong in the same way.",
      "The one-total probe: SUM(debit_cents + credit_cents) reads cash at 1150000 instead of a 0 delta — the pinned XOR constraint keeps the two columns separate, and any query that merges them answers a different question.",
      "The sign flip: delta = credit_total - debit_total keeps cash 'balanced' but relabels all five nonzero accounts — payroll_expense becomes 'credit balance' and sales_revenue 'debit balance' at the exact same magnitudes.",
      "The line-less account: the LEFT JOIN variant emits a 7th row for suspense_bridge with NULL totals and — because NULL never tests true in a CASE — the label 'credit balance' from the ELSE arm; the contract excludes it, so the INNER JOIN is the honest read.",
    ],
    ladder: [
      { title: "Brute force — eyeball the lines", body: "Open the journal, add the debit column and the credit column per account by hand, subtract, and write the label next to each account. Honest work for 15 lines and hopeless for a million-row journal, and it repeats the same three operations every single day." },
      { title: "The pattern — group and label", body: "Join accounts to their lines, GROUP BY account, SUM each side once, and let one CASE expression turn the delta into the label. The join key is account_id and the pinned constraint guarantees each line feeds exactly one column." },
      { title: "The optimal idea — one pass, no gates", body: "O(L) over the L lines with a hash-grouped aggregate: the XOR constraint removes any need for side-gating CASEs, and the label derives from the delta inside the same SELECT. The whole report is one grouped pass plus a sort." },
    ],
    approach:
      "GROUP BY account over an accounts-to-lines join, SUM each side once, derive the delta and the label in the same SELECT",
    schema: {
      ddl: `CREATE TABLE accounts (
  account_id   INTEGER PRIMARY KEY,
  account_name TEXT    NOT NULL
);
CREATE TABLE journal_lines (
  line_id      INTEGER PRIMARY KEY,
  entry_id     INTEGER NOT NULL,
  account_id   INTEGER NOT NULL,
  debit_cents  INTEGER NOT NULL DEFAULT 0,
  credit_cents INTEGER NOT NULL DEFAULT 0
);`,
      seed: `-- 7 accounts: six with journal activity plus one silent row (account 7,
-- suspense_bridge) that has no lines and must not reach the output
INSERT INTO accounts (account_id, account_name) VALUES
  (1, 'cash'),
  (2, 'sales_revenue'),
  (3, 'accounts_payable'),
  (4, 'accounts_receivable'),
  (5, 'payroll_expense'),
  (6, 'inventory_clearing'),
  (7, 'suspense_bridge');
-- 15 lines, each with exactly one nonzero side (debit > 0 or credit > 0)
INSERT INTO journal_lines (line_id, entry_id, account_id, debit_cents, credit_cents) VALUES
  ( 1, 101, 1, 500000,      0),   -- cash in
  ( 2, 102, 1,      0, 500000),   -- cash out
  ( 3, 103, 1,  75000,      0),
  ( 4, 104, 1,      0,  75000),
  ( 5, 201, 2,      0, 420000),   -- revenue booked
  ( 6, 202, 2,      0, 180000),
  ( 7, 203, 2,  30000,      0),   -- refund bites revenue
  ( 8, 301, 3,      0,  95000),   -- vendor bill
  ( 9, 401, 4, 260000,      0),   -- customer billed
  (10, 402, 4,      0, 140000),   -- customer paid
  (11, 501, 5, 148000,      0),   -- payroll run
  (12, 502, 5,  54000,      0),
  (13, 503, 5,      0, 200000),   -- the credit side that leaves payroll +2000
  (14, 601, 6,   4700,      0),
  -- line 15 is the credit side that leaves inventory_clearing -300
  (15, 602, 6,      0,   5000);`,
      tables: [
        { name: "accounts", note: "7 accounts — six with journal activity and one silent row (suspense_bridge) the contract excludes" },
        { name: "journal_lines", note: "15 lines — every line carries exactly one nonzero side, so each feeds one of the two columns" },
      ],
    },
    code: `-- Per-account trial balance: SUM each side once, derive the delta,
-- and let one CASE turn the delta into the label
SELECT
    a.account_id,
    a.account_name,
    SUM(l.debit_cents)  AS debit_total_cents,
    SUM(l.credit_cents) AS credit_total_cents,
    SUM(l.debit_cents) - SUM(l.credit_cents) AS delta_cents,
    CASE
        WHEN SUM(l.debit_cents) - SUM(l.credit_cents) = 0 THEN 'balanced'
        WHEN SUM(l.debit_cents) - SUM(l.credit_cents) > 0 THEN 'debit balance'
        ELSE 'credit balance'
    END AS balance_status
FROM accounts a
JOIN journal_lines l ON l.account_id = a.account_id
GROUP BY a.account_id, a.account_name
ORDER BY a.account_id ASC;`,
    walkthrough: [
      "The FROM clause joins accounts to journal_lines on account_id and groups by the account pair. INNER JOIN is deliberate: the contract counts only accounts that have lines, and account 7 (suspense_bridge) has none. GROUP BY a.account_id, a.account_name keeps the name in scope for the projection without any second join.",
      "The two SUMs run per group: cash's four lines give debit 500000 + 75000 = 575000 and credit 575000, sales_revenue's three give 30000 versus 600000, and payroll_expense's three give 202000 versus 200000. delta_cents subtracts the sums in one expression, and the CASE reads that delta twice more to pick the label: 0 to 'balanced', positive to 'debit balance', negative to 'credit balance'. Cash lands at 0 and 'balanced'; payroll_expense lands at 2000 and 'debit balance'; inventory_clearing lands at -300 and 'credit balance'.",
      "The final SELECT projects the six contract columns in order and sorts by account_id ascending, yielding six rows — account 7 appears nowhere because no line ever referenced it. Every cell is an INTEGER: both sums aggregate INTEGER columns and the delta subtracts integers. The engine snapshot confirms the hand grid cell for cell.",
    ],
    time: "O(L + A log A) — one pass over the L lines to group, then the sort over A accounts",
    space: "O(A) — one aggregated row per active account",
    followUps: [
      "Add a totals row for the whole ledger — does a GROUPING SETS-style rollup or a UNION of a grand-total SELECT serve better, and what should the grand delta read when the books are healthy?",
      "Extend the report with a line_count per account and flag accounts whose entire balance comes from a single line (a one-line balance is the classic half-posted entry).",
      "Rewrite the query to show WHICH entry_id unbalanced payroll_expense — what does a per-entry debit-equals-credit check return on this seed?",
    ],
    related: ["gl-reconciliation", "duplicate-charge-pairs", "bank-account-summary-ii"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "ar-aging-schedule",
    statement:
      "The invoices table holds one row per bill sent (invoice_id, customer_id, invoice_date, due_date, total_cents), and invoice_payments holds zero or more payment rows per invoice (invoice_id, paid_cents). An invoice's outstanding is total_cents minus the SUM of its payment rows, and the schedule is built as of the fixed date '2026-10-01': days_past_due = CAST(julianday('2026-10-01') - julianday(due_date) AS INTEGER). Bucket the outstanding money as current when days_past_due <= 0 (not yet due counts as current), days_1_30 for 1 to 30, days_31_60 for 31 to 60, days_61_90 for 61 to 90 and days_over_90 for 91 or more. Invoices with outstanding <= 0 — fully paid or overpaid — are excluded entirely. Report one row per customer with total outstanding above 0: the columns customer_id, current_cents, days_1_30_cents, days_31_60_cents, days_61_90_cents, days_over_90_cents and total_outstanding_cents, ordered by customer_id ascending.",
    examples: [
      {
        input:
          "customer 501 — five unpaid invoices due 2026-10-01 (90000), 2026-09-01 (60000), 2026-08-02 (45000), 2026-07-17 (30000) and 2026-06-20 (25000)",
        output: "501 · 90000 · 60000 · 45000 · 30000 · 25000 · 250000",
        explanation:
          "The due dates sit 0, 30, 60, 76 and 103 days behind the as-of — the 30- and 60-day boundary invoices land in days_1_30 and days_31_60, and the five buckets sum to 250000.",
      },
      {
        input:
          "customer 502 — one 180000-cent invoice due 2026-05-15 with two partial payments of 60000 and 50000",
        output: "502 · 0 · 0 · 0 · 0 · 70000 · 70000",
        explanation:
          "Outstanding is 180000 - 60000 - 50000 = 70000 after SUMming both payments, 139 days past due, so the whole balance sits in days_over_90.",
      },
    ],
    constraints: [
      "the as-of date is the literal '2026-10-01' written into the SQL, and days_past_due = CAST(julianday('2026-10-01') - julianday(due_date) AS INTEGER) is exact because both operands are date-only strings",
      "outstanding = total_cents - SUM(paid_cents) over ALL payment rows of the invoice — zero payments means outstanding equals the full total",
      "invoices with outstanding <= 0 are excluded entirely: customer 503's fully paid invoice and customer 504's overpaid invoice (outstanding -15000, a credit balance to refund, not a receivable) produce no rows",
      "bucket edges are inclusive on the left: exactly 30 days belongs to days_1_30 and exactly 60 to days_31_60; one row per customer with total outstanding > 0, ORDER BY customer_id ASC",
    ],
    primer: {
      hook:
        "An AR aging schedule answers the only collections question that matters — who owes us money, how much, and how long have they owed it.",
      concept: [
        "When a company sells on credit, it records an account receivable: a promise from a customer to pay an invoice later. The invoice carries a total and a due date, and between the sale and the due date the money owed is simply current. Payments may arrive in pieces — a customer pays 40 percent this week and the rest next month — so what is still owed is the invoice total minus everything paid so far. That remaining number is the outstanding balance, and it is the number collections actually works from.",
        "Not every customer pays on time, so finance sorts outstanding invoices by how overdue they are: the days past due, counted from the due date to a fixed as-of date. The schedule groups those days into standard buckets — current, 1 to 30 days late, 31 to 60, 61 to 90 and over 90 — and reports one row per customer with the outstanding money in each bucket. Older buckets are worse news: the longer an invoice sits unpaid, the lower the odds it gets paid in full. An invoice that is fully paid drops out of the schedule entirely, no matter how late it was, because there is nothing left to collect.",
        "Analysts read the schedule for one number first: total outstanding, the sum across all buckets. The mix matters as much as the total — a customer owing 250000 cents with everything current is a healthy payer, while the same total sitting in the over-90 bucket is a problem file. A one-line cousin of this report is DSO, days sales outstanding, which compresses the whole schedule into how many days of sales are still waiting to become cash. The schedule is the detail behind that headline.",
        "The schedule also feeds the accountant's next step: the allowance for doubtful accounts. Because some old invoices will never be paid, accounting rules make companies estimate the uncollectible slice and hold it against receivables, and the over-90 bucket is where that estimate starts. Every dollar in the oldest buckets therefore carries a double cost — the cash is late and some of it may be written off. That is why controllers review aging weekly and why the buckets, not just the total, drive the conversation.",
      ],
      worked: [
        "One customer holds two invoices: invoice A for 60000 cents due 2026-09-01 and invoice B for 45000 cents due 2026-08-02, with the as-of date pinned at 2026-10-01.",
        "Count days past due from each due date: invoice A sits exactly 30 days behind, invoice B exactly 60.",
        "Bucket them: 30 days lands in the 1-to-30 bucket and 60 days lands in the 31-to-60 bucket — both are boundary days that belong to the earlier bucket.",
        "The customer's row reads 0 current, 60000 in days 1 to 30, 45000 in days 31 to 60, and a total outstanding of 105000 cents.",
        "If the customer later pays invoice A in full, its outstanding hits 0 and the row loses that 60000 — paid is paid, however late it was.",
      ],
      glossary: [
        { term: "accounts receivable", def: "money customers still owe the company for sales made on credit" },
        { term: "outstanding balance", def: "an invoice's total minus every payment applied to it so far" },
        { term: "days past due", def: "how many days an unpaid invoice sits beyond its due date, counted to a fixed as-of date" },
        { term: "aging bucket", def: "a range of days past due, such as 31 to 60, that groups invoices by age" },
        { term: "DSO", def: "days sales outstanding, the average number of days sales wait before turning into cash" },
        { term: "allowance for doubtful accounts", def: "the estimated slice of receivables expected never to be collected, held against the total" },
      ],
      reallife: [
        "In a real finance team the aging schedule belongs to the collections desk, and the controller reviews it weekly. Collectors work the oldest buckets first because recovery odds decay with age, and the schedule doubles as their literal worklist — each over-90 row is a phone call with a name on it. Sales credit teams read the same report before shipping to a customer: a buyer whose row is bloating in the 61-to-90 bucket may get moved to prepayment terms. The report directly drives cash forecasting, since the current bucket is money you expect soon and the over-90 bucket is money you hedge against.",
        "What breaks in practice is cash application lag — payments arrive but get applied to the wrong invoice or sit unapplied, making a paying customer look delinquent. Partial payments are the second headache: a system that reads any single payment instead of summing them all overstates what is owed, exactly the trap this problem plants. The numbers decide real things: bad-debt reserves, credit-limit changes, write-off approvals and which accounts get escalated to outside collection agencies.",
      ],
      where:
        "AR analysts, controllers and collections teams live in this report, and credit-risk and fintech interviews use it to test multi-step aggregation with pivoting.",
    },
    breakdown: [
      "Two grains stack here: the invoice grain (resolve one outstanding number) and the customer grain (pivot the buckets). Jumping straight from a joined row to the customer pivot double-counts any invoice with several payments and drops invoices with none. The fix is staging: a CTE that LEFT JOINs payments and groups by invoice produces exactly one outstanding row per invoice, with COALESCE treating zero payments as a full balance. From there the top query is a plain conditional aggregation.",
      "The buckets are CASE arms over days_past_due, and the edges bite by design: this seed parks invoices at exactly 0, 30, 60, 76, 103 and 139 days, so every boundary must fall on the correct side. Writing the arms with strict upper bounds (days < 30, < 60, < 90) slides the 30-day invoice into days_31_60 and the 60-day invoice into days_61_90 — the two most-missed cells in the grid. The ELSE 0 convention keeps every bucket column at a clean 0 instead of NULL when a customer has nothing in a bucket.",
      "The WHERE outstanding > 0 does double duty and must sit before the pivot. It removes fully paid invoice 17 — which is 21 days past due but owes nothing, proving the schedule tracks money, not lateness — and it removes customer 504's overpayment, whose negative outstanding would otherwise show up as negative money inside days_1_30 and quietly shrink the bucket. Excluding both is the contract's way of saying an aging schedule reports collectible amounts, and credit balances belong to a refund workflow, not a receivable.",
    ],
    edges: [
      "Bucket edges are inclusive on the left and this seed parks invoices exactly on two of them: due '2026-09-01' sits 30 days past due (days_1_30, not days_31_60) and due '2026-08-02' sits exactly 60 (days_31_60, not days_61_90).",
      "Invoice 17 is 21 days past due and fully paid: it produces no row, because outstanding 0 leaves nothing to age — the schedule tracks collectible money, not lateness.",
      "Customer 504's overpayment leaves outstanding at -15000; included, it would print -15000 inside days_1_30 and understate the bucket — the <= 0 exclusion exists because a credit balance is a refund, not a receivable.",
      "julianday on date-only strings returns values ending in .5, so a difference of two such values is an exact integer float and the CAST never truncates — the feared 29.999999 result only appears when timestamps carry time components.",
    ],
    ladder: [
      { title: "Brute force — sort and tally by hand", body: "Print every invoice with its payments, compute outstanding per invoice on paper, sort by customer, and tally the buckets by hand. It works for eight invoices, and it is exactly the mental model the SQL has to make mechanical." },
      { title: "The pattern — stage the grain, then pivot", body: "A CTE resolves each invoice to one outstanding row: LEFT JOIN the payments, group by invoice, COALESCE the no-payment case to the full total. The outer query then pivots with SUM(CASE) arms over days_past_due and filters to outstanding > 0." },
      { title: "The optimal idea — aggregate to the smallest grain first", body: "Still O(I + P) over invoices and payments: the per-invoice staging pass is unavoidable (payments must be summed somewhere), and once each invoice is one row the customer pivot is a single grouped scan. Aggregating in grain order — payments to invoice, invoices to customer — is the whole architecture." },
    ],
    approach:
      "stage per-invoice outstanding in a CTE (LEFT JOIN payments, COALESCE), then pivot SUM(CASE) buckets per customer filtered to outstanding > 0",
    schema: {
      ddl: `CREATE TABLE invoices (
  invoice_id   INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL,
  invoice_date TEXT    NOT NULL,
  due_date     TEXT    NOT NULL,
  total_cents  INTEGER NOT NULL
);
CREATE TABLE invoice_payments (
  invoice_id INTEGER NOT NULL,
  paid_cents INTEGER NOT NULL
);`,
      seed: `-- as-of date pinned at 2026-10-01 · customer 501 parks one invoice on every
-- bucket that matters: due 2026-10-01 (0 days), 2026-09-01 (30), 2026-08-02
-- (60), 2026-07-17 (76) and 2026-06-20 (103) behind the as-of
INSERT INTO invoices (invoice_id, customer_id, invoice_date, due_date, total_cents) VALUES
  (11, 501, '2026-08-20', '2026-10-01',  90000),
  (12, 501, '2026-08-01', '2026-09-01',  60000),
  (13, 501, '2026-07-15', '2026-08-02',  45000),
  (14, 501, '2026-06-01', '2026-07-17',  30000),
  (15, 501, '2026-04-28', '2026-06-20',  25000),
  (16, 502, '2026-02-10', '2026-05-15', 180000),   -- 139 days past due
  (17, 503, '2026-07-25', '2026-09-10',  40000),   -- fully paid below
  (18, 504, '2026-08-30', '2026-09-20',  50000);   -- overpaid below
-- two partial payments on invoice 16 · one payment each on 17 and 18
INSERT INTO invoice_payments (invoice_id, paid_cents) VALUES
  (16,  60000),
  (16,  50000),
  (17,  40000),
  (18,  65000);`,
      tables: [
        { name: "invoices", note: "8 invoices — customer 501 spans all five buckets including the 30- and 60-day boundary rows, 502 is partially paid, 503 fully paid, 504 overpaid" },
        { name: "invoice_payments", note: "4 payment rows — invoice 16 carries two partial payments, invoices 17 and 18 one each, the rest none" },
      ],
    },
    code: `-- Stage 1: one outstanding row per invoice (payments SUMmed, zero-payment
-- invoices ride through at full total), with days past due off the pinned as-of
WITH aged AS (
    SELECT
        i.customer_id,
        i.invoice_id,
        CAST(julianday('2026-10-01') - julianday(i.due_date) AS INTEGER) AS days_past_due,
        i.total_cents - COALESCE(SUM(p.paid_cents), 0) AS outstanding_cents
    FROM invoices i
    LEFT JOIN invoice_payments p ON p.invoice_id = i.invoice_id
    GROUP BY i.invoice_id, i.customer_id, i.due_date, i.total_cents
)
-- Stage 2: pivot the buckets per customer, keeping only collectible money
SELECT
    customer_id,
    SUM(CASE WHEN days_past_due <= 0 THEN outstanding_cents ELSE 0 END) AS current_cents,
    SUM(CASE WHEN days_past_due BETWEEN 1 AND 30 THEN outstanding_cents ELSE 0 END) AS days_1_30_cents,
    SUM(CASE WHEN days_past_due BETWEEN 31 AND 60 THEN outstanding_cents ELSE 0 END) AS days_31_60_cents,
    SUM(CASE WHEN days_past_due BETWEEN 61 AND 90 THEN outstanding_cents ELSE 0 END) AS days_61_90_cents,
    SUM(CASE WHEN days_past_due >= 91 THEN outstanding_cents ELSE 0 END) AS days_over_90_cents,
    SUM(outstanding_cents) AS total_outstanding_cents
FROM aged
WHERE outstanding_cents > 0
GROUP BY customer_id
ORDER BY customer_id ASC;`,
    walkthrough: [
      "The aged CTE works at the invoice grain: it LEFT JOINs invoice_payments on invoice_id, groups by the invoice's columns, and computes outstanding_cents = total_cents - COALESCE(SUM(p.paid_cents), 0). Invoice 16's two payments (60000 and 50000) collapse to one 70000 row; invoices 11 through 15 have no payments and ride through at full total. The CTE also carries days_past_due, CAST off the julianday difference against the pinned as-of.",
      "The outer query filters aged to outstanding_cents > 0 before grouping, which erases invoice 17 (outstanding 0) and invoice 18 (outstanding -15000) from consideration entirely. The five SUM(CASE) arms route each surviving invoice's outstanding into exactly one bucket column by its days_past_due — 0 or fewer to current, 1 to 30, 31 to 60, 61 to 90, then 91-plus to days_over_90. Customer 501 spreads 250000 across all five buckets; customer 502's single 70000 balance lands whole in days_over_90.",
      "total_outstanding_cents is the plain SUM(outstanding_cents) per customer — for 501 it reads 250000, the sum of its five bucket cells, which is the built-in cross-check that every arm's ELSE 0 routed money exactly once. GROUP BY customer_id and ORDER BY customer_id ASC produce the two contract rows. Both customers survive the filter; 503 and 504 appear nowhere.",
    ],
    time: "O(I + P + C log C) — payments summed per invoice, one pivot pass per customer, then the sort",
    space: "O(I) — the aged CTE materializes one row per invoice",
    followUps: [
      "Add a weighted_days column — outstanding cents times days past due per invoice — and derive each customer's average days past due per dollar owed.",
      "Rank customers by total outstanding and by share of the over-90 bucket — a window over the same aged CTE — and decide which account a collections team calls first.",
      "Compute track-level DSO from the schedule and check whether it moves with the over-90 share.",
    ],
    related: ["delinquency-buckets", "settlement-fails-aging", "duplicate-charge-pairs"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "balance-rollforward",
    statement:
      "The opening_balances table carries each account's starting point for the period (account_id, opening_cents) and journal_lines records activity (line_id, entry_id, account_id, debit_cents, credit_cents, entry_date). The activity window is pinned to '2026-09-01' through '2026-09-30' inclusive, so a line dated exactly '2026-09-30' counts and anything outside does not. Build the rollforward with the uniform sign convention pinned for this exercise: debit_total_cents and credit_total_cents are the window's column sums per account, and closing_cents = opening_cents + debit_total_cents - credit_total_cents for every account. Every account in opening_balances appears — accounts with no window activity carry their opening straight through with 0 in both totals — as the columns account_id, opening_cents, debit_total_cents, credit_total_cents and closing_cents, ordered by account_id ascending.",
    examples: [
      {
        input:
          "account 2 — opens at 40000 and posts debits of 65000 (2026-09-04) and 20000 (2026-09-30) plus a 30000 credit (2026-09-11)",
        output: "2 · 40000 · 85000 · 30000 · 95000",
        explanation:
          "The 2026-09-30 debit counts because the window is inclusive on both ends, so 40000 + 85000 - 30000 = 95000.",
      },
      {
        input: "account 1 — opening_cents 125000 and no journal lines anywhere in the window",
        output: "1 · 125000 · 0 · 0 · 125000",
        explanation:
          "The LEFT JOIN finds no September lines, COALESCE pads both totals to 0 and the account carries straight forward: closing equals opening.",
      },
    ],
    constraints: [
      "the activity window is '2026-09-01' through '2026-09-30' inclusive — BETWEEN on date-only strings, both ends counted",
      "closing_cents = opening_cents + debit_total_cents - credit_total_cents for EVERY account — a uniform sign convention pinned for this exercise (real practice varies the direction by account type)",
      "every account in opening_balances appears exactly once; an account with no window activity shows 0 in both totals via COALESCE and closes at its opening",
      "every account with September activity has an opening row, so the LEFT JOIN from opening_balances is safe; ORDER BY account_id ASC",
    ],
    primer: {
      hook:
        "A rollforward is the bridge between two period-end balances — it shows exactly which activity turned last month's closing number into this month's.",
      concept: [
        "Every account in a ledger carries a balance, and finance never just asserts the new balance at the end of a month — it derives it. The derivation is the rollforward: take the opening balance the period started with, add the period's debit activity, subtract the period's credit activity, and land on the closing balance. Written as one line it reads opening plus debits minus credits equals closing. The equation is checkable by anyone, which is precisely why it is the first thing auditors ask for.",
        "The report earns its keep because it is self-proving. If the opening number matches last period's closing number, and every line of activity in the window is included exactly once, the closing number is forced — there is no room for a balance to drift. Auditors test exactly those two joints: does the opening tie to the prior period, and does the activity window capture every line of the period and nothing else. A line dated outside the window, or one inside it that the query missed, breaks the bridge.",
        "One honest wrinkle: real accounting does not apply the same sign direction to every account. Asset and expense accounts grow with debits, while liability, revenue and equity accounts grow with credits, so production rollforwards pick the direction per account type. This exercise pins one uniform convention — closing equals opening plus debit totals minus credit totals for every account — so the SQL stays clean and the traps stay about the joins and the dates. The takeaway: when you meet a real chart of accounts, ask which way each account runs before you trust a delta.",
        "Close teams build their checklists around rollforwards, and analysts use a lighter cousin called flux analysis: explain why a balance moved more than some threshold, account by account. A rollforward showing opening 40000, debits 85000 and credits 30000 hands you the explanation without any further digging — the movement is fully decomposed into named pieces. That is the report's whole value: it converts a mysterious change into a checklist.",
      ],
      worked: [
        "An account opens September at 40000 cents.",
        "During the window three lines post: debits of 65000 and 20000, and one credit of 30000.",
        "Total the columns: debits 85000, credits 30000.",
        "Apply the pinned convention: 40000 + 85000 - 30000 = 95000 closing cents.",
        "A second account with an opening of 125000 and no lines in the window simply closes where it started — 125000, with zero activity columns.",
      ],
      glossary: [
        { term: "opening balance", def: "the balance an account carries into the start of a period" },
        { term: "closing balance", def: "the balance an account ends the period with, derived from opening plus activity" },
        { term: "activity window", def: "the date range whose journal lines count toward the period's movement" },
        { term: "rollforward", def: "the report deriving closing balances from opening balances plus period activity" },
        { term: "flux analysis", def: "explaining period-over-period balance movements beyond a set threshold" },
        { term: "carry-forward", def: "an account with no activity in the period, whose closing equals its opening" },
      ],
      reallife: [
        "At month end the accounting team produces a rollforward for every material account — cash, receivables, payables, accruals — before anyone drafts statements. Auditors test the opening joint and the window boundaries first because everything else in the file depends on them; a window that silently includes an October line poisons the closing number while looking perfectly healthy. The finance systems team owns the query layer, and the classic production bug is the one this problem plants: an inner join that drops quiet accounts, so carry-forward balances vanish from the report and the totals stop tying to the balance sheet.",
        "The numbers drive the close calendar itself. A rollforward that ties lets the team release statements; one that does not sends accountants hunting line by line, usually toward a date-boundary mistake or a missing account. Treasury uses cash rollforwards to reconcile to bank statements, and FP&A analysts run flux versions to explain movements to leadership every month.",
      ],
      where:
        "General-ledger accountants, external auditors and finance-systems engineers produce rollforwards constantly, and interviews for accounting-adjacent data roles lean on them for join-and-window reasoning.",
    },
    breakdown: [
      "The rollforward is an aggregation with a required restore step. The activity side is a per-account SUM of debits and credits gated to the September window, and the closing number is one arithmetic line off the totals. The gate can live in the JOIN's ON clause or in a filtered subquery — either way the window's edges are the point: a line dated exactly '2026-09-30' belongs, while '2026-08-31' and '2026-10-01' lines must never leak in. Off-by-one date windows are the most common way a healthy-looking rollforward lies.",
      "The restore step is what separates this from a plain GROUP BY. Accounts with no activity have no journal lines, so joining journal_lines first and grouping loses the carry-forward account entirely — the report stops tying to the chart of accounts and an audit fails on sight. Driving the join from opening_balances (LEFT JOIN to the gated lines) keeps every account alive, and COALESCE turns the missing groups' NULL sums into the 0 the contract demands. Forgetting the COALESCE leaves account 1 with NULL totals and a NULL closing even though its opening is known.",
      "The sign convention is uniform here by pin, not by nature: closing = opening + debits - credits for every account, so the credit-only account falls and the debit-only account rises. Real charts of accounts flip the direction for liability, revenue and equity accounts — a production rollforward reads the account type before trusting a delta. The math stays one expression either way; only the meaning of a positive delta changes.",
    ],
    edges: [
      "The INNER JOIN to journal_lines drops account 1 (no September lines) and the report ships 4 rows — the classic rollforward bug, because the missing account silently stops the totals from tying.",
      "Without COALESCE the same LEFT JOIN renders account 1 as 125000, NULL, NULL, NULL — SUM over an empty group is NULL, and NULL arithmetic propagates through the closing expression.",
      "The window edge is inclusive: account 2's 20000 debit dated exactly '2026-09-30' counts, while the '2026-08-31' and '2026-10-01' lines must stay out — sliding the upper bound to '2026-10-01' pulls the leak in and reads account 2 at 110000 debits.",
      "Adding credit activity as positive flips the story for account 4: 80000 + 0 + 36000 = 116000 instead of the contract's 44000 — the pinned convention subtracts credits for every account.",
    ],
    ladder: [
      { title: "Brute force — rebuild every balance from scratch", body: "Recompute each account's lifetime history and re-derive its balance from day one. Wasteful and beside the point: the exercise hands you the opening and asks only about the window." },
      { title: "The pattern — drive from opening, gate the join", body: "FROM opening_balances LEFT JOIN journal_lines gated to the window in the ON clause, group by account, COALESCE the sums, then one arithmetic expression for closing. The drive table guarantees the report covers every account." },
      { title: "The optimal idea — the drive table is the contract", body: "O(A + L) over accounts and lines: opening_balances defines the output universe, the window gate defines the activity, and closing is derived — never stored. The auditable shape is opening plus gated activity equals closing, expressed in one CTE." },
    ],
    approach:
      "drive from opening_balances with a window-gated LEFT JOIN, COALESCE the totals to 0, derive closing = opening + debits - credits",
    schema: {
      ddl: `CREATE TABLE opening_balances (
  account_id    INTEGER PRIMARY KEY,
  opening_cents INTEGER NOT NULL
);
CREATE TABLE journal_lines (
  line_id      INTEGER PRIMARY KEY,
  entry_id     INTEGER NOT NULL,
  account_id   INTEGER NOT NULL,
  debit_cents  INTEGER NOT NULL DEFAULT 0,
  credit_cents INTEGER NOT NULL DEFAULT 0,
  entry_date   TEXT    NOT NULL
);`,
      seed: `-- account 1 carries forward (no September lines) · account 5 opens at zero
-- (new in September) · lines dated 2026-08-31 and 2026-10-01 sit outside the
-- window on purpose, and one line lands exactly on 2026-09-30
INSERT INTO opening_balances (account_id, opening_cents) VALUES
  (1, 125000),
  (2,  40000),
  (3,  10000),
  (4,  80000),
  (5,      0);
INSERT INTO journal_lines (line_id, entry_id, account_id, debit_cents, credit_cents, entry_date) VALUES
  (21, 201, 2, 65000,     0, '2026-09-04'),
  (22, 202, 2,     0, 30000, '2026-09-11'),
  (23, 203, 2, 20000,     0, '2026-09-30'),   -- the inclusive upper edge
  (24, 301, 3, 45000,     0, '2026-09-07'),
  (25, 302, 3, 12000,     0, '2026-09-19'),
  (26, 401, 4,     0, 36000, '2026-09-09'),
  (27, 501, 5, 70000,     0, '2026-09-02'),
  (28, 502, 5,     0, 25000, '2026-09-15'),
  (29, 601, 4,     0, 15000, '2026-08-31'),   -- before the window
  -- line 30 sits after the window entirely
  (30, 602, 2, 25000,     0, '2026-10-01');`,
      tables: [
        { name: "opening_balances", note: "5 accounts — 125000 carry-forward, 40000 busy, 10000 debit-only, 80000 credit-only, 0 new in September" },
        { name: "journal_lines", note: "10 lines — 8 inside the September window including one exactly on 2026-09-30, plus one 2026-08-31 and one 2026-10-01 line that must stay out" },
      ],
    },
    code: `-- Drive from opening_balances so every account survives, gate the lines to
-- the September window in the ON clause, pad the quiet accounts with COALESCE
WITH activity AS (
    SELECT
        o.account_id,
        o.opening_cents,
        COALESCE(SUM(l.debit_cents), 0)  AS debit_total_cents,
        COALESCE(SUM(l.credit_cents), 0) AS credit_total_cents
    FROM opening_balances o
    LEFT JOIN journal_lines l
        ON l.account_id = o.account_id
       AND l.entry_date BETWEEN '2026-09-01' AND '2026-09-30'
    GROUP BY o.account_id, o.opening_cents
)
SELECT
    account_id,
    opening_cents,
    debit_total_cents,
    credit_total_cents,
    opening_cents + debit_total_cents - credit_total_cents AS closing_cents
FROM activity
ORDER BY account_id ASC;`,
    walkthrough: [
      "The activity CTE drives from opening_balances and LEFT JOINs journal_lines gated in the ON clause to entry_date BETWEEN '2026-09-01' AND '2026-09-30'. Account 1 matches no gated line and survives the LEFT JOIN with an all-NULL line side; accounts 2 through 5 match only their in-window lines, so the '2026-08-31' and '2026-10-01' rows never enter any group. COALESCE(SUM(...), 0) turns account 1's NULL sums into the contract's 0 and 0.",
      "Per account the CTE hands over opening_cents plus the two gated totals: account 2 reads 40000, 85000, 30000 (its '2026-09-30' debit inside the 85000), account 4 reads 80000, 0, 36000 and account 5 opens at 0 with 70000 of debits. The outer SELECT derives closing_cents as opening + debit - credit in one expression: 125000, 95000, 67000, 44000 and 45000 respectively. The expression is uniform for every account because the exercise pins the convention.",
      "The final projection lists the five contract columns and orders by account_id ascending — five rows, one per opening_balances entry, including the quiet account 1. Every cell is an INTEGER: the sums aggregate INTEGER columns and COALESCE pads with integer 0. The snapshot matches the hand-derived grid cell for cell.",
    ],
    time: "O(A + L) — every account and every line is touched at most once",
    space: "O(A) — one CTE row per account",
    followUps: [
      "Add a prior_closing check: load August's closing balances and assert opening_cents equals them — what row would this seed plant to make that check fail?",
      "Produce a flux view: movement_cents = closing - opening with a flag for accounts that moved more than 20000 cents.",
      "Extend the window logic to a parameterized month — what breaks when the upper bound is computed as date(start, '+1 month', '-1 day') instead of a pinned literal?",
    ],
    related: ["gl-reconciliation", "realized-pnl-average-cost", "bank-account-summary-ii"],
    order: "exact",
    xp: 20,
  },
];
