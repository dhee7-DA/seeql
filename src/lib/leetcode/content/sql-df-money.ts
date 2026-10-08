// Deep-dives — Finance Core money file: loan amortization schedules,
// delinquency buckets and portfolio weights (3 problems: 1 Medium, 2 Easy,
// all order:"exact" reads). Every money column is INTEGER cents with the
// _c / _cents suffix; own tables, own seeds, original phrasing — never
// copied problem text.
// Registry wiring (lead): 8007 loan-amortization-schedule ·
// 8008 delinquency-buckets · 8009 portfolio-weights.
import type { LcSqlDive } from "../types";

export const SQL_DF_MONEY: LcSqlDive[] = [
  {
    slug: "loan-amortization-schedule",
    statement:
      "The loans table holds one row per loan: (loan_id, principal_cents, annual_rate_pct, monthly_payment_cents, term_months). Amortization splits each fixed monthly payment in two: interest_cents is what the outstanding balance accrues for one month — annual_rate_pct / 12 of the balance — and principal_cents is whatever remains of the payment once the interest is covered. Month 1 starts from the full principal_cents; every later month starts from the previous month's ending balance, and the schedule walks the balance down to exactly 0. Report the full schedule for every loan — the columns loan_id, month_no, interest_cents, principal_cents and ending_balance_cents, one row per month from month 1 to the closing month — ordered by loan_id ascending, then month_no ascending.",
    examples: [
      {
        input: "loan 1 — 120000 cents at 6.0% APR, 10330 cents a month: month 1 starts from the full principal",
        output: "1 · 1 · 600 · 9730 · 110270",
        explanation:
          "Month 1's interest is 120000 * 6.0 / 1200 = 600 cents on the full balance; the 10330-cent payment covers it and 9730 goes to principal, handing month 2 a 110270-cent balance.",
      },
      {
        input: "loan 2 — 50000 cents at 0% APR, 8334 cents a month: the final month of its schedule",
        output: "2 · 6 · 0 · 8330 · 0",
        explanation:
          "A 0% rate makes interest_cents 0 every month, so the balance falls by the whole payment — and on month 6 the MIN cap trims the principal to the remaining 8330, closing the loan at exactly 0.",
      },
    ],
    constraints: [
      "all money is INTEGER cents: principal_cents, monthly_payment_cents, interest_cents, principal_cents and ending_balance_cents are integers — annual_rate_pct is the only REAL and never reaches the output",
      "the pinned monthly formula: interest_cents = CAST(ROUND(start_balance * annual_rate_pct / 1200.0) AS INTEGER), principal_cents = MIN(monthly_payment_cents - interest_cents, start_balance), ending_balance_cents = start_balance - principal_cents",
      "one row per month per loan, month 1 through the closing month (exactly term_months rows on this seed); the final month is where the MIN cap bites and ending_balance_cents lands on 0",
      "ORDER BY loan_id ASC, month_no ASC",
    ],
    breakdown: [
      "The ask is to unfold two static rows of loans into a full month-by-month ledger, and the ledger is recursive by nature: each month's five numbers compute from the previous month's ending_balance_cents, which no fixed join can manufacture. The interest/principal split is the whole story — interest_cents is rent on the money still owed (start_balance * annual_rate_pct / 1200.0), and principal_cents is the part of monthly_payment_cents that actually retires debt. Because the balance shrinks every month, the interest share shrinks with it and the principal share grows: loan 1's split moves from 600/9730 on month 1 to 51/10251 on month 12. A schedule is a computation, not a lookup.",
      "The classic misstep is charging interest on the wrong balance — computing it from principal_cents every month produces flat interest (600 cents in every one of loan 1's months) and a ledger that never matches the declining-balance contract. The sibling error is capping the wrong quantity: the contract caps the PRINCIPAL at the remaining balance, MIN(monthly_payment_cents - interest_cents, start_balance), not the payment itself. Capping the payment instead makes loan 1's month 12 pay 10251, cover 51 of interest and retire only 10200 of principal, stranding a 51-cent balance — and the recursion then emits a phantom month 13 to sweep it up. The cap sits where the contract pins it: on principal_cents.",
      "The engine is a WITH RECURSIVE named sched that carries the five output columns, seeds month 1 straight from the loans table, and recurses while ending_balance_cents is still above 0 — the moment the cap closes a loan at 0, the WHERE stops generating months and the schedule ends at exactly term_months rows. Integer cents make the ledger reproducible: ROUND fires inside every month's interest computation and CASTs to INTEGER before anything else touches the value, so no float drift can accumulate down the chain. Loan 2's 0% rate is the proof the formula generalizes: interest_cents computes to 0 every month through the very same expression, no special case required.",
    ],
    edges: [
      "Loan 2's payment pins at 8334, not the tempting 8333: six payments of 8333 retire only 49998 of the 50000 cents and strand a 2-cent balance, forcing a stubby month 7 that pays 2 cents — 8334 lets the MIN cap trim month 6's principal to 8330 and close the loan at exactly 0.",
      "The cap sits on principal_cents, not on the payment: capping the payment instead makes loan 1's month 12 pay 10251 (51 interest + 10200 principal), leaves a 51-cent balance alive and manufactures a phantom month 13.",
      "The recursion's WHERE tests ending_balance_cents > 0 — testing the month's starting balance instead keeps generating after closure and appends an all-zero month to each loan's schedule.",
      "Rounding happens every month on that month's balance: 110270 * 0.005 = 551.35 becomes 551 on month 2, and skipping the CAST (or rounding once up front instead of per month) drifts the ledger off the pinned snapshot.",
      "Loan 2's annual_rate_pct is 0.0 and its interest_cents reads 0 in all six months — any formula that divides by the rate or special-cases zero rates breaks where the honest expression just works.",
    ],
    ladder: [
      { title: "Brute force — walk it by hand", body: "Open a ledger per loan: month 1 interest on the full principal, subtract, repeat until 0, and write down every row. Correct for two loans, unrunnable for a book of thousands — and it teaches nothing about expressing the walk in SQL." },
      { title: "The pattern — a recursive month machine", body: "WITH RECURSIVE sched seeds month 1 from the loans table with the pinned formula, then each step recomputes the five columns from the previous ending_balance_cents while it is still above 0. The WHERE is the terminator and the MIN cap is the closer." },
      { title: "The optimal idea — pin the formula, let recursion count", body: "O(M) over the M scheduled months (12 + 6 = 18 here), each step a keyed lookup back into loans. The durable rules: round inside every month, cap the principal, recurse on the ending balance — an amortization schedule is a recursion whose output IS the table." },
    ],
    approach: "WITH RECURSIVE sched seeds month 1 from principals, recomputes the five columns from the prior ending_balance_cents each step, and stops once the MIN cap closes the balance at 0",
    schema: {
      ddl: `CREATE TABLE loans (
  loan_id               INTEGER PRIMARY KEY,
  principal_cents       INTEGER NOT NULL,
  annual_rate_pct       REAL NOT NULL,     -- APR in percent (6.0 = 6%)
  monthly_payment_cents INTEGER NOT NULL,
  term_months           INTEGER NOT NULL
);`,
      seed: `-- loan 1 amortizes in exactly 12 payments of 10330 · loan 2 is the 0% path:
-- 6 x 8333 = 49998 would strand 2 cents, so the payment pins at 8334 and the
-- month-6 cap (8330) closes the loan at exactly 0
INSERT INTO loans (loan_id, principal_cents, annual_rate_pct, monthly_payment_cents, term_months) VALUES
  (1, 120000, 6.0, 10330, 12),
  (2,  50000, 0.0,  8334,  6);`,
      tables: [
        { name: "loans", note: "2 loans — loan 1 at 6.0% APR over 12 months, loan 2 at 0% APR over 6 months with payment 8334" },
      ],
    },
    code: `WITH RECURSIVE sched(loan_id, month_no, interest_cents, principal_cents, ending_balance_cents) AS (
    -- month 1: interest accrues on the FULL principal, the payment splits,
    -- and MIN(..., principal_cents) caps the principal at what is owed
    SELECT
        loan_id,
        1,
        CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER),
        MIN(monthly_payment_cents - CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER), principal_cents),
        principal_cents - MIN(monthly_payment_cents - CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER), principal_cents)
    FROM loans
    UNION ALL
    -- every later month starts from the previous ENDING balance and the
    -- loan stops the moment the cap closes that balance at 0
    SELECT
        s.loan_id,
        s.month_no + 1,
        CAST(ROUND(s.ending_balance_cents * l.annual_rate_pct / 1200.0) AS INTEGER),
        MIN(l.monthly_payment_cents - CAST(ROUND(s.ending_balance_cents * l.annual_rate_pct / 1200.0) AS INTEGER), s.ending_balance_cents),
        s.ending_balance_cents - MIN(l.monthly_payment_cents - CAST(ROUND(s.ending_balance_cents * l.annual_rate_pct / 1200.0) AS INTEGER), s.ending_balance_cents)
    FROM sched s
    JOIN loans l ON l.loan_id = s.loan_id
    WHERE s.ending_balance_cents > 0         -- the loan closed: no phantom month
)
SELECT
    loan_id,
    month_no,
    interest_cents,
    principal_cents,
    ending_balance_cents
FROM sched
ORDER BY loan_id ASC, month_no ASC;`,
    walkthrough: [
      "The seed step reads straight off loans and builds each loan's month 1: loan 1's interest_cents is CAST(ROUND(120000 * 6.0 / 1200.0)) = 600, so principal_cents is MIN(10330 - 600, 120000) = 9730 and ending_balance_cents lands at 110270. Loan 2's 0% rate drives the same expression to 0, so its month 1 retires the full 8334 and hands 41666 to month 2. One branch covers both loans because the formula — not a branch on the rate — handles the zero case.",
      "The recursive step joins sched back to loans on loan_id and, while ending_balance_cents is still above 0, stamps out the next month from that ending balance: loan 1 walks 110270 → 100491 → 90663 with interest re-rounded every month (551, then 502, then 453). The principal share climbs as the balance falls — 9779, 9828, 9877 — until month 12 starts at 10251: interest is 51, raw principal would be 10279, and the MIN cap trims it to 10251 so ending_balance_cents hits 0. That 0 fails the WHERE on the next pass, so no month 13 ever exists and loan 1's schedule is exactly 12 rows; loan 2 closes the same way on month 6 with principal 8330.",
      "The final SELECT projects sched's five columns unchanged and orders by loan_id ASC, month_no ASC — the contract's exact reading order. The output is 18 rows: loan 1's twelve months closing at (1, 12, 51, 10251, 0) and loan 2's six at (2, 6, 0, 8330, 0). Every cell is an INTEGER — the CAST fires before values ever reach the projection — so the snapshot compares clean cents, not floats.",
    ],
    time: "O(M) — the recursion emits exactly one row per scheduled month (12 + 6 = 18 here), each step a keyed lookup into loans",
    space: "O(M) — the full schedule materializes in sched before the final SELECT orders it",
    followUps: [
      "Add a running_interest_cents column that accumulates what each loan has paid in interest so far — does a sixth recursive column or a window SUM over sched serve better, and what does the accumulator read on loan 1's month 12?",
      "Summarize each loan in one row — months actually taken, total interest paid and the effective cost over principal — and check which loan needed its cap month and why loan 2's interest total reads exactly 0.",
    ],
    related: ["npv-queries", "calculate-product-final-price", "bank-account-summary-ii"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "delinquency-buckets",
    statement:
      "The loan_payments table logs one row per installment: (loan_id, due_date, paid_date, amount_cents), where a NULL paid_date marks an installment that was never paid. Collections grades every loan as of the fixed date '2026-10-01' by the days-past-due of its OLDEST unpaid past-due installment — unpaid means paid_date IS NULL, and past-due means due_date already lies before the as-of date. That days-past-due value buckets as '1-30', '31-60', '61-90' or '90+', while a loan with no unpaid past-due installment — paid in full, paid late, or merely not yet due — reports 'current'. Output one row per loan with the columns loan_id and dpd_bucket, ordered by loan_id ascending.",
    examples: [
      {
        input: "loan 2 paid every installment after its due date — 2026-06-10 paid 2026-06-19, 2026-07-10 paid 2026-07-25 — as of '2026-10-01'",
        output: "2 · current",
        explanation:
          "Paid late is not delinquent: every paid_date is set, so loan 2 has no unpaid past-due installment and the LEFT JOIN hands it the COALESCE'd 'current' label.",
      },
      {
        input: "loan 6 — two unpaid installments, due 2026-06-23 and due 2026-09-21",
        output: "6 · 90+",
        explanation:
          "The OLDEST unpaid past-due installment drives the bucket: 2026-06-23 sits 100 days behind the as-of, landing loan 6 in '90+' even though its other unpaid installment is only 10 days old.",
      },
    ],
    constraints: [
      "the as-of date is the fixed literal '2026-10-01', written directly into the SQL — no parameter, no CURRENT_DATE",
      "dpd = CAST(julianday('2026-10-01') - julianday(oldest unpaid past-due due_date) AS INTEGER), where unpaid past-due means paid_date IS NULL AND due_date < '2026-10-01'",
      "buckets pin as dpd >= 90 → '90+', 61-89 → '61-90', 31-60 → '31-60', 1-30 → '1-30' — every seeded loan sits mid-bucket (20, 45, 75, 100 days) so no boundary decides a row",
      "one row per loan_id with 'current' whenever no unpaid past-due installment exists, ORDER BY loan_id ASC",
    ],
    breakdown: [
      "The report compresses a whole payment history into one delinquency state per loan, and the state machine has exactly one moving part: the oldest installment that is both unpaid and past due as of '2026-10-01'. Paid-late rows like loan 2's (due 2026-06-10, paid 2026-06-19) never enter that set — a set paid_date means the obligation was met, however tardily. Future-due unpaid rows like loan 1's 2026-10-05 installment stay out too: not yet due is not yet delinquent. What survives the filter is the delinquent set, and MIN(due_date) over it is each loan's clock.",
      "The naive misstep is reading the WRONG unpaid installment. MAX(due_date) on loan 6 — whose 2026-06-23 and 2026-09-21 installments are both unpaid — reads 10 days past due and drops the loan into '1-30', when the contract's oldest-first rule reads 100 days and '90+'. The same wrongness arrives dressed as 'any unpaid installment will do', or as ordering candidates by amount_cents instead of due_date. The bucket keys off MIN(due_date) of the unpaid past-due set, full stop.",
      "The second half of the problem is restoring the loans the overdue filter erased. GROUP BY loan_id over the filtered set yields only the delinquent loans, so the final step LEFT JOINs that result back onto the full loan universe (a DISTINCT loan_id from loan_payments) and COALESCEs the missing bucket into 'current'. The CASE reads its ranges from the top — >= 90 first, then 61, then 31 — because a bottom-up CASE would misroute a 100-day loan into '1-30' on its first match. Loans 1 and 2 exercise the restore path; loans 3 through 6 exercise the buckets.",
    ],
    edges: [
      "Loan 2 paid every installment late (2026-06-10 paid 2026-06-19, 2026-07-10 paid 2026-07-25): any read that treats paid-late as delinquent pulls a fully-paid loan into a bucket — paid_date IS NULL is the only ticket into the overdue set.",
      "The due_date < '2026-10-01' guard is what keeps future unpaid installments (loan 1's 2026-10-05, loan 3's 2026-10-11) out of MIN(due_date): drop it and those loans' dpd computes negative (−4 and −10), escaping the buckets only by falling through every arm — the definition of past-due belongs in the WHERE, not in the CASE.",
      "Loan 6 holds two unpaid installments — 2026-06-23 (100 days) and 2026-09-21 (10 days): MAX(due_date) misreads '1-30' while the contract's MIN(due_date) reads '90+'; the oldest drives.",
      "Loans 1 and 2 form no overdue group at all, so an INNER JOIN back to the loan universe ships a 4-row report — the LEFT JOIN plus COALESCE 'current' is what restores all six rows.",
      "A bottom-up CASE (testing dpd >= 1 first) files loan 6's 100 days under '1-30' on the first hit — the >= 90 arm must be tested first.",
    ],
    ladder: [
      { title: "Brute force — eyeball every loan", body: "Sort each loan's installments by due_date, scan for the first one that is unpaid and already past the as-of date, count the days, and label the loan. Six loans is manageable by hand; the SQL expresses the same scan as one filtered GROUP BY." },
      { title: "The pattern — filter, MIN, bucket", body: "WHERE paid_date IS NULL AND due_date < '2026-10-01' defines the delinquent installments, GROUP BY loan_id with MIN(due_date) finds each loan's oldest, and julianday math feeds a CASE of pinned ranges. The bucket CASE orders its arms from the most severe range down." },
      { title: "The optimal idea — anti-join the rest back to 'current'", body: "O(n log n) over the n installment rows, dominated by the GROUP BY sort. The durable judgment: a status report over a population is often an aggregate anti-join — compute the exceptional set, LEFT JOIN it back, and COALESCE the default label." },
    ],
    approach: "filter unpaid past-due installments, MIN(due_date) per loan, julianday delta into a top-down CASE bucket, LEFT JOIN back to every loan and COALESCE 'current'",
    schema: {
      ddl: `CREATE TABLE loan_payments (
  loan_id      INTEGER NOT NULL,
  due_date     TEXT NOT NULL,  -- 'YYYY-MM-DD'
  paid_date    TEXT,           -- NULL = never paid
  amount_cents INTEGER NOT NULL
);`,
      seed: `-- as-of 2026-10-01 · loan 1 current (next installment not due yet) ·
-- loan 2 paid LATE every time · loans 3/4/5 are 20/45/75 days past due ·
-- loan 6 holds a 100-day-old unpaid AND a 10-day-old unpaid: oldest drives
INSERT INTO loan_payments (loan_id, due_date, paid_date, amount_cents) VALUES
  (1, '2026-08-05', '2026-08-05', 8334),
  (1, '2026-09-05', '2026-09-03', 8334),
  (1, '2026-10-05', NULL,      8334),   -- future-due and unpaid: still current
  (2, '2026-06-10', '2026-06-19', 12000),  -- paid 9 days late
  (2, '2026-07-10', '2026-07-25', 12000),  -- paid 15 days late
  (2, '2026-08-10', '2026-08-10', 12000),
  (3, '2026-08-11', '2026-08-10', 9500),
  (3, '2026-09-11', NULL,      9500),   -- 20 days past due
  (3, '2026-10-11', NULL,      9500),   -- future installment
  (4, '2026-07-17', '2026-07-16', 7250),
  (4, '2026-08-17', NULL,      7250),   -- 45 days past due
  (4, '2026-09-17', NULL,      7250),   -- 14 days past due
  (5, '2026-06-18', '2026-06-18', 4100),
  (5, '2026-07-18', NULL,      4100),   -- 75 days past due
  (5, '2026-08-18', NULL,      4100),   -- 44 days past due
  (6, '2026-06-23', NULL,      6600),   -- 100 days past due: the bucket driver
  -- the 2026-09-21 installment is only 10 days past due
  (6, '2026-09-21', NULL,      6600);`,
      tables: [
        { name: "loan_payments", note: "17 installments over 6 loans — loan 2 pays late but in full, loan 6's oldest unpaid (2026-06-23) sits 100 days behind the as-of" },
      ],
    },
    code: `WITH overdue AS (
    -- the OLDEST unpaid PAST-DUE installment per loan: paid rows drop out
    -- (late or not) and installments not yet due never count
    SELECT
        loan_id,
        MIN(due_date) AS oldest_unpaid
    FROM loan_payments
    WHERE paid_date IS NULL
      AND due_date < '2026-10-01'            -- the fixed as-of literal
    GROUP BY loan_id
),
bucketed AS (
    -- days past due from the as-of date, then the pinned bucket ranges
    SELECT
        loan_id,
        CAST(julianday('2026-10-01') - julianday(oldest_unpaid) AS INTEGER) AS dpd
    FROM overdue
)
SELECT
    p.loan_id,
    COALESCE(
        CASE
            WHEN b.dpd >= 90 THEN '90+'      -- 90 and beyond: >= 90, not > 90
            WHEN b.dpd >= 61 THEN '61-90'    -- 61..89
            WHEN b.dpd >= 31 THEN '31-60'    -- 31..60
            WHEN b.dpd >= 1  THEN '1-30'     -- 1..30
        END,
        'current'                            -- no unpaid past-due installment
    ) AS dpd_bucket
FROM (SELECT DISTINCT loan_id FROM loan_payments) p
LEFT JOIN bucketed b ON b.loan_id = p.loan_id
ORDER BY p.loan_id ASC;`,
    walkthrough: [
      "The overdue CTE filters loan_payments down to paid_date IS NULL AND due_date < '2026-10-01' and reduces each loan to MIN(due_date). Nine of the 17 installments are unpaid, but loan 1's 2026-10-05 and loan 3's 2026-10-11 are future-due and never enter — the remaining seven past-due unpaid rows group into four loans. Their oldest_unpaid values read 2026-09-11 for loan 3, 2026-08-17 for loan 4, 2026-07-18 for loan 5 and 2026-06-23 for loan 6.",
      "The bucketed CTE converts each oldest_unpaid into dpd: CAST(julianday('2026-10-01') - julianday(oldest_unpaid) AS INTEGER) reads 20, 45, 75 and 100. The final CASE walks from the top — >= 90 hands loan 6 its '90+', then 61-89 takes loan 5's 75 into '61-90', 31-60 takes loan 4's 45, and 1-30 takes loan 3's 20. Every seeded loan lands mid-bucket, so the pinned boundaries (30, 60, 90) never decide a row.",
      "The outer query builds the loan universe with SELECT DISTINCT loan_id — six loans — and LEFT JOINs the bucketed CTE onto it. Loans 1 and 2 find no match, their CASE collapses to NULL, and COALESCE stamps 'current'; loans 3 through 6 carry their buckets. ORDER BY p.loan_id ASC ships (1, current), (2, current), (3, 1-30), (4, 31-60), (5, 61-90), (6, 90+) — six rows, one per loan.",
    ],
    time: "O(n log n) over the n installment rows — the GROUP BY sorts to form the per-loan MIN groups; julianday and the CASE are constant work per loan",
    space: "O(l) — one overdue group per delinquent loan (four here) plus the six-row loan universe",
    followUps: [
      "Report each loan's oldest unpaid due_date beside its bucket — which projection widens, and how should the 'current' rows render the NULL that the LEFT JOIN hands loans 1 and 2?",
      "Re-bucket by the MOST RECENT unpaid past-due installment instead of the oldest — which aggregate flips, and why do loans 4, 5 and 6 all swing downward while loan 3 alone holds its bucket?",
    ],
    related: ["bank-account-summary-ii", "analyze-subscription-conversion", "customer-purchasing-behavior-analysis"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "portfolio-weights",
    statement:
      "The holdings table records one row per position: (account_id, symbol, qty, last_price_cents). A position's market value is qty times last_price_cents, and its weight is that value as a share of its own account's total market value — the sum across ALL of the account's positions, never just one. Report every position with the columns account_id, symbol, market_value_c and weight_pct, the weight rounded to 2 decimal places, ordered by account_id ascending, then weight_pct descending, then symbol ascending. Accounts weight independently: the weights inside one account sum to roughly 100 and never borrow another account's denominator.",
    examples: [
      {
        input: "account 1 holds 40 AAPL at 19750 cents and 12 MSFT at 41500 cents (account total 1592000 cents)",
        output: "1 · AAPL · 790000 · 49.62, then 1 · MSFT · 498000 · 31.28",
        explanation:
          "40 * 19750 = 790000 cents earns 49.62% of the account; the window SUM keeps both rows alive and each weight divides by the same 1592000-cent denominator.",
      },
      {
        input: "account 2's 90 JNJ at 15640 cents beside its 65 PG at 14700 cents (account total 5325600 cents)",
        output: "2 · JNJ · 1407600 · 26.43, then 2 · PG · 955500 · 17.94",
        explanation:
          "weight_pct descends inside the account: JNJ's 26.43 outranks PG's 17.94, and ROUND(..., 2) trims each finished ratio to two decimals.",
      },
    ],
    constraints: [
      "money stays INTEGER cents: market_value_c = qty * last_price_cents is an integer; only weight_pct leaves the integers, as a REAL rounded to 2 decimals",
      "weight_pct = ROUND(100.0 * market_value_c / SUM(market_value_c) OVER (PARTITION BY account_id), 2) — the denominator is the account's own total, attached to every row",
      "one row per holding: the window SUM must preserve rows exactly as GROUP BY cannot",
      "ORDER BY account_id ASC, weight_pct DESC, symbol ASC",
    ],
    breakdown: [
      "The ask looks like an aggregation but grades as a projection: every one of holdings' seven rows must still be standing at the end, each now carrying its share of the account. That rules out GROUP BY on the spot — folding holdings by account_id collapses account 1's AAPL, MSFT and NVDA into one row and deletes the very positions the report needs. The denominator is still an aggregate, though, and it has to ride on every row: SUM(market_value_c) OVER (PARTITION BY account_id) computes account 1's 1592000 cents and stamps it onto all three of its rows without removing any.",
      "The ratio is where SQLite's typing bites. 100 * market_value_c / account_value_c with an INTEGER numerator and denominator performs integer division — 79000000 / 1592000 truncates to 49 and the decimal weight vanishes — while the 100.0 literal promotes the division to floating point and 49.62 survives. Rounding comes last, ROUND(..., 2), applied to the finished ratio; rounding the operands first would distort the share itself. Round the finished ratio and nothing earlier.",
      "Ordering finishes the contract, and it needs all three keys. account_id ASC keeps the two accounts contiguous, weight_pct DESC stacks each account's biggest position first (XOM's 40.9 above JNJ's 26.43 in account 2), and symbol ASC is the tie-breaker this seed never triggers — every market value is distinct, so no two weights collide. Ordering by symbol alone would scatter the accounts and read upside-down inside each.",
    ],
    edges: [
      "GROUP BY account_id would ship 2 rows instead of 7: account 1's AAPL, MSFT and NVDA collapse into one sum and the per-symbol rows the contract demands disappear — the window SUM keeps all rows.",
      "Drop the .0 and 100 * 790000 / 1592000 divides in integers, truncating AAPL's weight to 49 — the 100.0 literal is what promotes the division before ROUND ever runs.",
      "SUM(...) OVER () without PARTITION BY account_id divides every position by the 6917600-cent grand total of both accounts, printing book-level weights that no longer sum to 100 inside any account.",
      "ORDER BY weight_pct DESC alone interleaves the accounts — AAPL 49.62, then XOM 40.9, then MSFT 31.28 — while the contract wants account 1's block first; the account_id ASC lead key keeps the blocks contiguous.",
    ],
    ladder: [
      { title: "Brute force — two passes and a division", body: "Total each account's qty * last_price_cents by hand, then divide every position by its account's total and round. The engine expresses the same work in one statement — the trick is keeping the rows while the total is computed." },
      { title: "The pattern — the window is the denominator", body: "Compute market_value_c per row, then SUM(market_value_c) OVER (PARTITION BY account_id) attaches each account's total to every one of its rows. Divide by that column, round, and the row set never changed shape." },
      { title: "The optimal idea — one pass, row-preserving ratios", body: "O(n log n) over n holdings — the window partition and the final ORDER BY each sort once. The durable rules: row-level share-of-total is window SUM territory, the 100.0 literal forces real division, and the tie-breaker key keeps the sort deterministic even when a future seed ties." },
    ],
    approach: "qty * last_price_cents per row, SUM() OVER (PARTITION BY account_id) as an in-row denominator, ROUND(100.0 * value / total, 2), ordered account-first then weight-desc",
    schema: {
      ddl: `CREATE TABLE holdings (
  account_id       INTEGER NOT NULL,
  symbol           TEXT NOT NULL,
  qty              INTEGER NOT NULL,
  last_price_cents INTEGER NOT NULL
);`,
      seed: `-- account 1 totals 790000 + 498000 + 304000 = 1592000 cents ·
-- account 2 totals 2178000 + 1407600 + 955500 + 784500 = 5325600 ·
-- every market value distinct, so no two weights tie anywhere
INSERT INTO holdings (account_id, symbol, qty, last_price_cents) VALUES
  (1, 'AAPL',  40, 19750),  -- 790000
  (1, 'MSFT',  12, 41500),  -- 498000
  (1, 'NVDA',  25, 12160),  -- 304000
  (2, 'XOM',  200, 10890),  -- 2178000
  (2, 'JNJ',   90, 15640),  -- 1407600
  (2, 'PG',    65, 14700),  -- 955500
  -- TSCO closes account 2 at 784500 cents
  (2, 'TSCO', 150,  5230);`,
      tables: [
        { name: "holdings", note: "7 positions across 2 accounts — account 1 holds 3 symbols totalling 1592000 cents, account 2 holds 4 totalling 5325600" },
      ],
    },
    code: `WITH valued AS (
    -- each position's market value: shares times last price, in cents
    SELECT
        account_id,
        symbol,
        qty * last_price_cents AS market_value_c
    FROM holdings
),
account_total AS (
    -- the account denominator rides EVERY row — window SUM, not GROUP BY
    SELECT
        account_id,
        symbol,
        market_value_c,
        SUM(market_value_c) OVER (PARTITION BY account_id) AS account_value_c
    FROM valued
)
SELECT
    account_id,
    symbol,
    market_value_c,
    ROUND(100.0 * market_value_c / account_value_c, 2) AS weight_pct  -- 100.0 forces float division
FROM account_total
ORDER BY account_id ASC, weight_pct DESC, symbol ASC;`,
    walkthrough: [
      "The valued CTE multiplies each holding out: AAPL 40 * 19750 = 790000, MSFT 12 * 41500 = 498000 and NVDA 25 * 12160 = 304000 on account 1, with XOM 2178000, JNJ 1407600, PG 955500 and TSCO 784500 on account 2. Seven rows in, seven rows out — the multiplication changes no cardinality. Every value stays INTEGER cents because both factors are integers.",
      "account_total layers the denominator on with a window: PARTITION BY account_id sums account 1 to 1592000 and account 2 to 5325600, stamping the figure onto every row of its partition. This is the step GROUP BY cannot do — the partition's total exists on the same row as the position that needs it. No rows collapsed; the seven positions now each carry four numbers.",
      "The final SELECT divides and rounds: AAPL reads 100.0 * 790000 / 1592000 = 49.6236… → 49.62, MSFT 31.28, NVDA 19.1 (the trailing zero drops), and account 2 orders XOM 40.9, JNJ 26.43, PG 17.94, TSCO 14.73. Each account's weights sum to a clean 100.00 — 49.62 + 31.28 + 19.1 here, 40.9 + 26.43 + 17.94 + 14.73 there. ORDER BY account_id ASC, weight_pct DESC, symbol ASC ships account 1's block first, biggest weight on top.",
    ],
    time: "O(n log n) over the n holdings — one sort for the window partition plus the final ORDER BY sort",
    space: "O(n) — the valued and account_total rows held until the projection",
    followUps: [
      "Stack a cumulative weight so each account's positions run to 100 — which window frame (a running SUM ordered by weight) rides on top of the partition, and which position absorbs the rounding drift?",
      "Compare every position's weight to its share of the whole book — what does a second OVER () with no PARTITION BY compute, and which of account 1's symbols outrun their book-level weight?",
    ],
    related: ["calculate-product-final-price", "rolling-average-steps", "seasonal-sales-analysis"],
    order: "exact",
    xp: 10,
  },
];
