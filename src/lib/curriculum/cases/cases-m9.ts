// Case batch M9 — SQL for Finance (lessons 52–57), cs-1612…cs-1617.
// Finance cases in the chip-rebuild format. Figures verified live: 6
// unpaid invoices led by INV-2025-024 (493700), invoice status buckets
// open/paid/void, payments card/wire, ledger double-entry.
import type { CaseStudy } from "./types";

export const casesM9: CaseStudy[] = [
  {
    id: "cs-1612",
    tier: "easy",
    topic: "f1",
    universe: "month-close",
    title: "The floating invoices",
    brief:
      "From: AR. Re: collections call list.\n\nWhich invoices have no payment at all? The books are two tables: invoices (the promises) and payments (the receipts). Left-join the receipts onto the promises, keep the rows where nothing matched, biggest exposure first. Six invoices are floating right now — the call list wants them in order.",
    ask: "List unpaid invoices — number and amount, biggest amount first.",
    template: `SELECT i.number, i.amount_cents
FROM {1} i
LEFT JOIN payments p ON p.{2} = i.id
WHERE p.id IS {3}
ORDER BY i.amount_cents DESC;`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "the promises table",
        why: "Invoices are the rows that must survive — the LEFT side of the join keeps every promise, matched or not. Starting FROM payments would build the list backwards.",
      },
      {
        answer: "invoice_id",
        kind: "keyword",
        label: "the receipt's foreign key",
        why: "payments points at its invoice through invoice_id. Joining on p.id = i.id would match receipt rows to invoice rows by primary key — two different id spaces, garbage pairs.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unmatched test",
        why: "A left-joined row with no receipt carries NULLs on the payment side — IS NULL finds them. IS NOT NULL is the twin that lists the PAID invoices instead.",
      },
    ],
    distractors: ["orders", "id", "NOT NULL"],
    walkthrough:
      "Left join preserves all 28 invoices; the IS NULL gate keeps the six with no payment — INV-2025-024 at 493700 cents on top, verified live. The anti-join shape from the joins module, pointed at money. And the same three slots build the twin report: flip NULL to NOT NULL and AR gets the paid-in-full list. One keyword of separation between the collections call list and the thank-you list.",
  },
  {
    id: "cs-1613",
    tier: "medium",
    topic: "f2",
    universe: "month-close",
    title: "The balance walk",
    brief:
      "From: AR. Re: customer 7's account story.\n\nGrace Kim (customer 7) disputes her balance. The story the accountants want: every invoice she's been issued, in date order, with the RUNNING total of what she's been promised so far. A window running total — the frame slides, the rows stay. No collapsing, no GROUP BY.",
    ask: "Walk customer 7's invoices in date order with a running balance column.",
    template: `SELECT issued_on, number,
       SUM(amount_cents) OVER (ORDER BY {1}) AS running_balance
FROM invoices
WHERE customer_id = {2}
ORDER BY issued_on;`,
    slots: [
      {
        answer: "issued_on",
        kind: "keyword",
        label: "the window's order column",
        why: "The running total accumulates in date order — ORDER BY issued_on inside OVER defines the slide. ORDER BY customer_id inside the window would add nothing (one customer) and ordering by number would tell the story out of calendar order.",
      },
      {
        answer: "7",
        kind: "number",
        noVerify: true,
        label: "the customer's id",
        why: "The WHERE scopes the walk to Grace Kim — id 7, Seoul, APAC on the roster. The column stores the id; the name never enters the query.",
      },
    ],
    distractors: ["PARTITION", "GROUP", "customer_id"],
    walkthrough:
      "SUM(amount_cents) OVER (ORDER BY issued_on) — the running-total window from lesson-32, aimed at the books: each invoice row keeps its identity and gains the balance-so-far. PARTITION inside OVER would restart the sum per group (here it would zero out every row's story); GROUP BY would collapse the walk into one row and destroy exactly the row-per-invoice shape the dispute needs. Windows annotate; aggregates annihilate.",
  },
  {
    id: "cs-1614",
    tier: "medium",
    topic: "f3",
    universe: "refund-audit",
    title: "The aging ladder",
    brief:
      "From: Collections. Re: the open pile.\n\nThe six open invoices need buckets for the call script: 60+ days past due, 30–60, and current. Aging measures the DUE date, not the issue date — a promise isn't late until its due date passes. CASE WHEN is the ladder; the WHEN order is the logic.",
    ask: "Bucket open invoices by days past due — 60+, 30-60, current.",
    template: `SELECT number, amount_cents,
       CASE
         WHEN {1} < date('now', '-60 days') THEN '60+'
         WHEN due_on < date('now', '-{2} days') THEN '30-60'
         ELSE 'current'
       {3} AS bucket
FROM invoices
WHERE status = 'open';`,
    slots: [
      {
        answer: "due_on",
        kind: "keyword",
        label: "the aging clock",
        why: "Overdue is measured against the promise date — due_on. Issued_on would age invoices that aren't late at all, just old.",
      },
      {
        answer: "30",
        kind: "number",
        noVerify: true,
        label: "the middle rung",
        why: "The second WHEN catches 30-to-60 days past due — anything the first (60+) didn't catch. CASE evaluates top-down, so the rungs are ordered oldest-first and the ELSE mops up.",
      },
      {
        answer: "END",
        kind: "keyword",
        label: "the ladder's close",
        why: "Every CASE expression ends with END — then the alias. 'END AS' would be two keywords glued where the parser wants one boundary; the CASE…END pair is the switch's full shape.",
      },
    ],
    distractors: ["issued_on", "60", "END AS"],
    walkthrough:
      "CASE walks its WHENs top-down: 60+ catches the deepest arrears first, the second WHEN inherits everything younger (30–60), ELSE labels the rest current, END closes the expression. The aging ladder from lesson-54 — the same top-down cascade rule that makes pivots work. One status filter keeps the pile honest: paid invoices aren't late, they're history; void ones aren't money at all.",
  },
  {
    id: "cs-1615",
    tier: "medium",
    topic: "f4",
    universe: "growth",
    title: "The month-over-month bridge",
    brief:
      "From: Growth board. Re: the trend slide.\n\nThe monthly revenue series exists (the monthly_revenue CTE is staged for you). The slide needs the month-over-month change in percent, one decimal — which means pulling LAST month's revenue next to THIS month's. LAG is the look-back; the arithmetic has one classic integer trap.",
    ask: "Add a growth_pct column: percent change vs the previous month, one decimal.",
    template: `SELECT month, revenue,
       ROUND({1} * (revenue - LAG(revenue) OVER (ORDER BY month))
             / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly_revenue;`,
    slots: [
      {
        answer: "100.0",
        kind: "number",
        noVerify: true,
        label: "the percent scale",
        why: "100.0 — decimal point on purpose. Divide by 100 (integer) and SQLite floors every ratio to 0: the board sees flat lines. The .0 forces REAL math, the lesson-55 trap.",
      },
      {
        answer: "month",
        kind: "keyword",
        label: "the look-back order",
        why: "LAG walks rows in month order so 'previous' means previous month. Order by anything else and the bridge connects the wrong months — the growth number would be fiction with correct arithmetic.",
      },
    ],
    distractors: ["100", "LEAD", "day"],
    walkthrough:
      "LAG(revenue) OVER (ORDER BY month) fetches the prior month onto the current row — twice, once per side of the difference — and 100.0 * (a − b) / b turns it into percent with REAL precision: July's −47.3 against June, August's +118.2 rebound, verified live. LAG vs LEAD is direction: LEAD measures the NEXT month, flipping every sign on the slide. And the first row's growth is honestly NULL — there is no month before the first month.",
  },
  {
    id: "cs-1616",
    tier: "hard",
    topic: "f5",
    universe: "fraud",
    title: "The ghost in the books",
    brief:
      "From: Controller. Re: reconciliation day.\n\nDouble-entry law: for every account, total debits must equal total credits. One entry broke the law. Find the account whose debit and credit sums disagree — which means per-account sums, then a filter on the AGGREGATE result. WHERE can't see sums; it runs before they exist.",
    ask: "Find accounts where total debits and credits don't balance.",
    template: `SELECT {1},
       SUM(debit_cents) AS debits,
       SUM(credit_cents) AS credits
FROM ledger_entries
GROUP BY account
{2} SUM(debit_cents) != SUM(credit_cents);`,
    slots: [
      {
        answer: "account",
        kind: "keyword",
        label: "the grouping grain",
        why: "The law applies per account — GROUP BY account makes one bucket per ledger account, the grain the equality check needs. Grouping by memo would test entries that share a comment, not an account.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the post-aggregate gate",
        why: "The filter compares SUMS — values that only exist after grouping. HAVING runs after the collapse; WHERE runs before it and would raise 'misuse of aggregate' on sight.",
      },
    ],
    distractors: ["WHERE", "memo", "entry_date"],
    walkthrough:
      "GROUP BY account, then HAVING SUM(debit_cents) != SUM(credit_cents) — every balanced account passes silently, the one broken account floats up. That's the double-entry reconciliation from lesson-56: the equality is an identity, so its violation IS the anomaly. The WHERE decoy is the whole lesson: aggregates are born in the GROUP BY stage, and WHERE has left the building by then. In the clinic this was a silent bug; here it's a detective query.",
  },
  {
    id: "cs-1617",
    tier: "hard",
    topic: "fcap",
    universe: "growth",
    title: "The outlier month",
    brief:
      "From: Finance. Re: August question.\n\n“August looks big.” Looks are not statistics. Against the monthly_revenue series, rank the months by revenue and hand back the top 3, alongside the series average so the rank has context. The board wants receipts, not vibes — and the rank must survive ties deterministically.",
    ask: "Rank months by revenue (top 3) with the series average beside them.",
    template: `SELECT month, revenue,
       ROUND(AVG(revenue) OVER (), 2) AS avg_revenue,
       {1}() OVER (ORDER BY {2} DESC) AS spend_rank
FROM monthly_revenue
ORDER BY revenue DESC
LIMIT {3};`,
    slots: [
      {
        answer: "RANK",
        kind: "keyword",
        label: "the ranking window",
        why: "RANK() OVER (ORDER BY revenue DESC) numbers the months by size — the window function that annotates instead of collapsing. COUNT() counts rows per partition; it would label every month with the same number.",
      },
      {
        answer: "revenue",
        kind: "keyword",
        label: "the rank's measure",
        why: "Months are ranked by revenue — the money column. ORDER BY month DESC inside the window would rank by calendar position: a silent, plausible-looking nonsense.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the podium size",
        why: "LIMIT 3 takes the podium after the outer sort. The outer ORDER BY revenue DESC is what feeds the LIMIT — sort first, slice second, in that order, always.",
      },
    ],
    distractors: ["COUNT", "month", "PARTITION"],
    walkthrough:
      "AVG(revenue) OVER () — empty OVER, whole series — sets the context bar; RANK() OVER (ORDER BY revenue DESC) assigns the podium places; the outer ORDER BY + LIMIT 3 slices after sorting. The module's whole thesis in one query: 'August looks big' becomes 'August's rank is N against a series that averages M' — and the ranking function keeps every row alive to carry its own evidence.",
  },
];
