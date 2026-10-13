// Wells Fargo — kit 4 of the Banking & Capital Markets domain (Batch G).
// Retail banking at branch scale: accounts, statements and fee books, branch
// operations spend, and a reconciliation culture sharpened by consent-order
// scrutiny — the books tie, or nothing ships.
// Pool provenance: 1 tagged sql row in scripts/company-pools.md
// (expected-credit-loss) — the pool is mostly theme-curated, and the brief
// says so honestly: every problem mirrors a workflow Wells Fargo's finance
// operations, controllership and audit-analytics teams are known to probe.
// Case studies run on the storefront db, mapped honestly as
// customers = account holders (region = market),
// invoices = customer facilities / statement accounts (status = paid /
// open / void), payments = settlements against those accounts
// (INTEGER CENTS — the dollar read is amount_cents / 100.0),
// expenses = branch & operations spend, ledger_entries = the double-entry
// books — with probed figures from scripts/company-facts.md only.

import type { CompanyKit } from "../types";

export const wellsfargoKit: CompanyKit = {
  id: "wellsfargo",
  domainId: "banking",
  name: "Wells Fargo",
  tagline: "Retail banking, accounts and audits",
  accent: "text-yellow-200",

  brief: [
    "Wells Fargo is one of America's largest retail banks — a coast-to-coast branch network, tens of millions of consumer accounts, and an operating rhythm built around the **statement cycle**: facilities billed, payments settled, exceptions chased, books closed. The defining fact of working here is regulatory: a run of {rose:consent orders} turned reconciliation rigor from a virtue into a survival trait. Label-versus-movement mismatches, unapplied money, facilities marked paid with nothing behind them — every one of those is a {amber:finding waiting to happen}, and the analyst who finds them in a query instead of an audit is the one who gets staffed on the interesting work.",
    "The data org mirrors that culture. Finance operations owns the settlement pipeline and the exception queues; controllership owns the double-entry books and the **trial balance** that gates every close; audit analytics owns the hunts — coverage gaps, duplicate money, {amber:aging tails}. The schema habits are bank-grade: money lands as **INTEGER cents** (a settled book of 6961200 cents prints as 69612 dollars only after the `/100.0`), and the books carry exactly the anomalies auditors live for — a {rose:voided} account that still received its $925.00, a paid account with zero settlement rows at all, an account settled in installments that never finished.",
    "Interview style is definition-heavy and audit-minded. A typical screen walks from a warm-up join to an **exception hunt** with a survival rule attached (which accounts have no settlement rows, which branches of a CASE bucket must reconcile to the total), then escalates into either a calendar read (month buckets, aging against a reference date) or a rate question where **the denominator is the whole test**. Follow-ups probe labels out loud: 'is that count per account or per settlement?', 'your `WHERE` clause — which rows just silently left the report?'. Candidates who state the population before the predicate consistently outperform.",
    "Preparation strategy: the registry tags **one problem** for Wells Fargo (`expected-credit-loss` — start there, it maps onto the provision screens), so the pool is mostly theme-curated toward the bank's known reads: reconciliation folds, anti-join exception lists, month-bucket calendars, audit-grade text and NULL hygiene. Then run both case studies on the live storefront db: one rebuilds the {rose:unpaid-facility exception list} finance operations chases every close, the other rebuilds the {amber:operations-spend calendar} the branch network budget reviews.",
  ],

  dayInLife: [
    "**08:00 —** the day starts with the tie-out. Controllership opens the ledger board first: debits against credits (**181,080 against 181,080, delta zero** before anyone touches a dashboard), cash account movement against the settlement feed, operating-expense accruals against the expense ledger (**25,416.00** dollars on both sides of that tie). The first query of the day is almost always an identity check — one conditional SUM that either returns zero or becomes the day's first {rose:fire}. All money math runs in integer cents; the dollar read happens once, at display, with an explicit `/100.0`, and a half-dollar leak on an odd-cent row is the kind of thing a consent-order auditor writes about.",
    "**10:30 —** midday is the exception hunt, and it opens with the unpaid-facility list: six accounts carrying **$15,217.00** with no settlement rows at all — and one of the six is marked PAID (facility **#28, $1,756.00**, zero money behind it), which makes it not a collections item but an {rose:audit finding}. Collections takes the clean five; the sixth goes to audit analytics with both queries attached.",
    "**13:30 —** the hunt continues on two live wrinkles. The partial-settlement chase: account **#25** sitting at 4000 of 6148 dollars with the **30-day terms** clock already past. The void anomaly: #11, labeled void, which nonetheless received its **$925.00** — label says one thing, money says another, and the analyst's job is to surface the disagreement with both queries attached, not to pick a winner. This is the hour where 'which population am I looking at?' is the entire skill.",
    "**16:00 —** the afternoon is stakeholder cycles across the retail footprint. Branch operations wants the {amber:spend calendar}: rent runs 14 entries / $16,800.00, advertising 14 / $4,570.00, travel 3 / $2,521.00, tools 5 / $1,525.00 — and the month it spiked (**$3,210.00 in 2024-08**) needs a story with its query attached. Finance wants settlement latency — average **28.4 days** against a uniform 30-day terms clock, fastest 13, slowest 84 — sliced by the reference date the aging schedule uses. Every number ships with its SQL and its definition, because in a {rose:consent-order} world the defense is the query, not the slide.",
  ],

  metrics: [
    { name: "Trial balance delta", what: "Total debits minus total credits across the double-entry books — 181,080 against 181,080, delta zero. The identity that gates every close; a nonzero delta is a stop-the-world event, not a footnote." },
    { name: "Recon break count", what: "Facilities where label and movement disagree: #28 marked paid with zero settlement rows ($1,756.00), #11 voided yet received ($925.00). The audit-analytics headcount of findings, kept low on purpose." },
    { name: "Unpaid exposure", what: "Accounts with no settlement rows — 6 facilities carrying $15,217.00. The anti-join read that seeds the collections worklist, with the paid-but-unfunded #28 pulled out for audit, not collections." },
    { name: "Partial-pay chase list", what: "Facilities settled in installments that haven't finished — #25 at 4000 of 6148 dollars is the live one. A LEFT JOIN + CASE classification (exact / partial / none) where the partials are the worklist." },
    { name: "Settlement latency", what: "Days from facility issue to first settlement on the paid book: average 28.4, fastest 13, slowest 84 — against a uniform 30-day terms clock, so every day past 30 is real slippage." },
    { name: "Ops spend mix", what: "Branch & operations spend by category: Rent 14 entries / $16,800.00, Ads 14 / $4,570.00, Travel 3 / $2,521.00, Tools 5 / $1,525.00 — a fold that must reconcile to the operating_expenses ledger account ($25,416.00 both ways)." },
    { name: "Monthly ops burn", what: "Expense spend per '%Y-%m' bucket — 36 entries across 14 months, peaking at $3,210.00 in 2024-08. The budget-calendar read the branch network reviews monthly." },
    { name: "Cash movement", what: "The cash account's fold: $69,612.00 debited (money in) against $25,416.00 credited (money out), net $44,196.00 — the settlement feed's mirror, checked against the books every close." },
  ],

  topics: [
    {
      name: "Reconciliation folds & the trial balance",
      why: "Wells Fargo's first instinct is the identity: debits equal credits, branch counts sum to the total, both sides of a tie printed side by side. Conditional SUMs over 1/0 flags are the daily bread — a fold that can't prove it reconciled is a fold that didn't finish.",
      slugs: ["trial-balance-check", "balance-rollforward", "gl-reconciliation"],
    },
    {
      name: "LEFT JOIN coverage reads",
      why: "Exception hunting starts with keeping the unmatched rows: every facility LEFT JOINed to its settlements so the six with no money survive as NULL payloads. The bank's follow-up is always the same: which rows did your WHERE clause just delete — because the unmatched rows ARE the audit answer.",
      slugs: ["bank-account-summary", "count-student-number-in-departments", "number-of-times-a-driver-was-a-passenger"],
    },
    {
      name: "Anti-joins: the exception list",
      why: "The unpaid list is an anti-join — facilities with NO settlement rows — and the NULL-safe shapes matter here in a way they don't elsewhere: one NULL in a NOT IN subquery silently empties a consent-order evidence file. LEFT JOIN + IS NULL and NOT EXISTS are the house shapes.",
      slugs: ["customers-who-never-order", "customer-who-visited-but-did-not-transact", "find-churn-risk-customers"],
    },
    {
      name: "CASE branches for exception classes",
      why: "Audit output is classification: exact / partial / nothing, current / late / loss, clean / finding. Each CASE arm is a promise of exhaustiveness — every account lands somewhere, and the branch counts must reconcile to the total, because a classification with a hole is a finding of its own.",
      slugs: ["count-salary-categories", "delinquency-buckets", "monthly-transactions-ii"],
    },
    {
      name: "Month buckets & close calendars",
      why: "The close runs on the '%Y-%m' spine: spend per month, settlements per month, the aging reference date stamped once and reused. Wells Fargo probes whether you can bucket TEXT timestamps without losing the month's last night — half-open intervals, not BETWEEN.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Aggregation at account scale",
      why: "Retail banking is census work: accounts per status, entries per category, settlements per rail — millions of rows folded into board-ready counts. The screen checks whether your COUNT means accounts, settlements or join rows; the three disagree the moment a fan-out exists.",
      slugs: ["product-sales-analysis-ii", "classes-more-than-5-students", "duplicate-emails"],
    },
    {
      name: "Audit text hygiene",
      why: "Branch feeds arrive messy: account names in mixed case, memo fields with padding, reference numbers that only match after normalization. A join on a dirty key is a silent fan-out — or a silent miss — and both are audit findings. String reshaping is a warm-up here, not an afterthought.",
      slugs: ["fix-names-in-a-table", "invalid-tweets", "fix-product-name-format"],
    },
    {
      name: "NULL policy on partial records",
      why: "An account can have no settlement (yet), a payment with no method, an aging row with no reference date. Wells Fargo screens check whether you treat NULL as a finding to report, coalesce to zero for display, or exclude with a stated reason — deliberately, never by accident.",
      slugs: ["employee-bonus", "calculate-special-bonus", "books-with-null-ratings"],
    },
    {
      name: "Provision & expected-loss reads",
      why: "The tagged problem expected-credit-loss is the shape: exposure weighted by a loss factor per band, summed to a provision number that must tie to the ledger. Weighted folds punish integer division and mis-weighted denominators — exactly the arithmetic consent-order scrutiny reruns.",
      slugs: ["expected-credit-loss", "credit-utilization-bands", "daily-balance-interest"],
    },
    {
      name: "One-pass censuses & two-grain counts",
      why: "Close-week query budgets are real: the status census, the category census and the exception census each get one pass. FILTER (WHERE …) branches and COUNT DISTINCT at two grains keep the deliverable in a single scan — with branch totals that must reconcile to COUNT(*) before they ship.",
      slugs: ["daily-leads-and-partners", "active-businesses", "number-of-rich-customers"],
    },
  ],

  theory: [
    {
      id: "wf-t1",
      q: "Your exception report must list facilities with no settlement rows. Walk me through the pipeline — and where in it does a careless filter delete the answer?",
      a: "The pipeline order is the answer: FROM builds the join, WHERE filters rows, GROUP BY folds, HAVING judges groups, SELECT prints, ORDER BY reads. The exception list needs facilities LEFT JOINed to settlements, then WHERE p.id IS NULL — the unmatched rows survive the join and die in the filter, which is exactly backwards from every other report. The careless filters that delete the answer: touching the right table's columns anywhere in WHERE (p.method = 'wire' turns NULL payloads UNKNOWN and collapses the LEFT JOIN to an INNER), or folding too early so the NULL payloads never exist. On this book the answer is six facilities carrying $15,217.00 — including one marked PAID — and a report that ships empty reads as good news. Saying 'the WHERE clause is the opposite of a filter here; it's a detector' is the interview line they remember.",
      tag: "pipeline",
    },
    {
      id: "wf-t2",
      q: "INNER JOIN or LEFT JOIN between facilities and settlements — how do you decide, and what does each choice do to the recon report?",
      a: "Decide from who must survive, and say it before writing the join. A settled-value report can INNER-join honestly: money exists only where settlements exist. A recon or exception report must LEFT-join from facilities — the six unfunded accounts ARE the finding, arriving as NULL payloads, and one of them (#28, $1,756.00) is labeled paid with nothing behind it, which only a LEFT JOIN can surface. The classic silent failure is filtering the settlements side in WHERE: NULL = anything is UNKNOWN, the payloads die, and the LEFT JOIN becomes an INNER while the query still reads 'LEFT'. On a consent-order book, that downgrade isn't a style bug — it's a suppressed finding. Join type is a claim about who survives; the audit trail lives in the rows that don't match.",
      tag: "joins",
    },
    {
      id: "wf-t3",
      q: "After facilities LEFT JOIN settlements, what's the difference between COUNT(*), COUNT(i.id) and COUNT(p.id) — and which one belongs in the recon?",
      a: "Three different populations on the same rows. COUNT(*) counts join rows — on this book 27 matched facility-payment pairs plus 6 unmatched facilities = 33, and the five split-settled facilities quietly added five. COUNT(i.id) counts non-NULL facility keys — still 33, because the left side is never NULL. COUNT(p.id) counts settlement rows that actually matched — 27, which is the settlement census, not the facility census. The recon wants two of these side by side: COUNT(DISTINCT i.id) = 28 facilities and COUNT(p.id) = 27 settlements — the tie between label and movement, with the six-row gap explained by name. The trap interviewers set: 'how many facilities have no money?' — COUNT(p.id) counts matched pairs and answers a different question; only the IS NULL arm on unmatched rows answers it (six, $15,217.00).",
      tag: "aggregation",
    },
    {
      id: "wf-t4",
      q: "Where does a 30-day-late condition live — and how do you age a book against a reference date the whole report must share?",
      a: "Two decisions, both row-level, both in WHERE or a derived layer. The lateness condition is julianday(reference) − julianday(due_on) > 30 on each facility row — WHERE territory, before any fold. The reference date is the discipline: the aging schedule stamps ONE date — typically MAX(paid_on) across the settlement feed — computed in a derived table or CTE and joined or cross-applied, so every row ages against the same clock. Compute it inline per row and each facility ages against its own world; the aging buckets stop being comparable and the provision is wrong in a way nobody can reproduce. With terms uniform at 30 days on this book, the bucket boundaries are fixed by policy, and the CASE arms — current, 1-30, 31-60, 61+ — must be exhaustive and non-overlapping, because a day that lands in two buckets (or none) is an audit finding about the query itself.",
      tag: "dates",
    },
    {
      id: "wf-t5",
      q: "How would you sequence a facility's settlement history so an auditor can walk it — and what does LAG give you on the first row?",
      a: "Window over the money, partitioned per facility: LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on) puts each settlement next to its predecessor, and the delta julianday(paid_on) − julianday(lag_paid_on) is the installment gap the auditor walks. The first row of every partition has no predecessor, so LAG returns NULL — the honest signal, not an error. What you do with that NULL is the discipline: COALESCE it to the facility's issue date when the walk should start at billing, or filter it explicitly when the metric is strictly installment-to-installment; silently dropping it shrinks the population and the average quietly lies. On this book five facilities carry two settlement rows each, so the gaps are real money movement — and the audit narrative ('first installment 15 days after issue, second 13 days later') is exactly the kind of sentence this query produces.",
      tag: "windows",
    },
    {
      id: "wf-t6",
      q: "Classify every facility exact / partial / nothing against money received. What's the shape, and why can't a bare join do it?",
      a: "Pre-aggregate the money side, join one-to-one, branch exhaustively. The settlements fold first: SUM(amount_cents) GROUP BY invoice_id in a derived table or CTE — because five facilities carry two settlement rows, a bare join fans them out and any per-row test judges installments as if they were books, mislabeling exact facilities as partial. The LEFT JOIN from facilities keeps the six with no money (NULL totals), and the CASE arms classify: NULL → 'nothing', equality with amount_cents → 'exact', else → 'partial'. Exhaustiveness is the audit: 21 exact ($65,612.00), 6 nothing ($15,217.00), 1 partial (#25 at 4000 of 6148) — and the branch counts must sum to 28 facilities or the classification has a hole. The ELSE arm isn't convenience; it's the guarantee that no account silently vanishes from its own audit.",
      tag: "subqueries",
    },
    {
      id: "wf-t7",
      q: "An auditor asks how you know the books tie. What does your reconciliation pass check, in what order — and what can SQL never decide?",
      a: "Cheapest identities first. One: the trial balance — SUM(debit_cents) equals SUM(credit_cents), 181,080 against 181,080, delta zero; one conditional fold, and if it breaks nothing downstream is read. Two: census reconciliation — every classification's branches must sum to the whole: paid 21 + open 6 + void 1 = 28 facilities; exact + partial + none = 28; the moment they don't, the query has a hole, not the bank. Three: label versus movement — status says paid but #28 has zero settlement rows; status says void but #11 received its $925.00; the partial #25 sits at 4000 of 6148. SQL surfaces all three classes of disagreement with queries, and that's the value: findings get found in a WHERE clause, not in an exam. What SQL cannot decide is which side is RIGHT — label or movement. That ruling is a human process decision, and saying so is the difference between an analyst and a query runner.",
      tag: "quality",
    },
    {
      id: "wf-t8",
      q: "Money here is INTEGER cents. Where do the classic leaks happen between the table and the board deck?",
      a: "Three places, all division-shaped. The dollar read: amount_cents / 100.0, once, at display — INTEGER/INTEGER truncates, so an odd-cent row loses its tail cents silently; the .0 is the whole control. The ratio: 100.0 before the multiplication — 100 * x / y keeps integer division and any share under 1% collapses to zero, which in a recon metric means 'tiny' and 'zero' become indistinguishable. The aggregate boundary: SUM the cents first, divide once at the end — dividing per row and summing floats re-introduces drift the cents design existed to kill. On this book the figures are whole dollars ($66,443.00 paid, $15,217.00 unpaid, $25,416.00 operating expenses), which is exactly why the discipline decays — every test passes until the first odd-cent settlement lands. The strong answer says the conversion happens once, at the edge, and names the failure it prevents.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "wf-mcq-1",
      prompt: "You need facilities with NO settlement rows. Which shape finds them without NULL surprises?",
      choices: [
        "WHERE i.id NOT IN (SELECT invoice_id FROM payments)",
        "LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "INNER JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "WHERE NOT (i.id IN (SELECT invoice_id FROM payments) IS TRUE)",
      ],
      answer: 1,
      why: "LEFT JOIN keeps every facility and lets the six unfunded ones surface as NULL payloads — the IS NULL arm is the detector. It's NULL-proof by construction: unmatched rows survive, matched rows fail the arm, nothing silently empties.",
      notes: [
        { choice: 0, why: "One NULL invoice_id in the settlement feed and x NOT IN (…, NULL) is never TRUE — the whole result silently empties. On an audit book, an empty exception file is a suppressed finding." },
        { choice: 2, why: "An INNER JOIN deletes the unmatched rows before any filter runs — the IS NULL arm then matches nothing, and the report ships zero findings while looking clean." },
      ],
      difficulty: "easy",
    },
    {
      id: "wf-mcq-2",
      prompt: "expenses.amount_cents holds 2541600 across the ops book. Which expression prints $25,416.00?",
      choices: [
        "SUM(amount_cents) / 100",
        "SUM(amount_cents) / 100.0",
        "SUM(amount_cents / 100)",
        "CAST(SUM(amount_cents) AS TEXT) + '/100'",
      ],
      answer: 1,
      why: "SUM the cents first, divide by 100.0 once at the end — REAL division preserves every cent. The house rule exists because INTEGER/INTEGER truncates: the first odd-cent row makes /100 silently drop money.",
      notes: [
        { choice: 0, why: "Works on whole-dollar books like this one — and fails the day an odd-cent row lands, truncating instead of rounding. The .0 is the control." },
        { choice: 2, why: "Dividing per row re-enters integer division before the fold — same truncation, now per row, so the drift compounds into the SUM." },
      ],
      difficulty: "easy",
    },
    {
      id: "wf-mcq-3",
      prompt: "invoices (28) LEFT JOIN payments (27): 22 invoices match, five of them carry two settlements. What does COUNT(p.id) return?",
      choices: [
        "27 — matched settlement rows only",
        "33 — every join row",
        "28 — one per facility",
        "22 — one per matched facility",
      ],
      answer: 0,
      why: "COUNT(p.id) skips NULLs, so it counts the 27 matched facility-payment pairs — the settlement census. COUNT(*) would say 33 (27 matches + 6 unfunded facilities); COUNT(DISTINCT i.id) says 28.",
      notes: [
        { choice: 1, why: "33 is COUNT(*)'s answer — join rows, including the six NULL-payload facilities. The recon's population question decides which count is honest." },
        { choice: 2, why: "28 needs COUNT(DISTINCT i.id) — the fold that collapses split-settled facilities back to accounts. Bare counts never fold the fan-out." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-4",
      prompt: "Which WHERE clause captures every expense in February 2024 on a TEXT date column, including Feb 29 23:59:59?",
      choices: [
        "WHERE spent_on BETWEEN '2024-02-01' AND '2024-02-29'",
        "WHERE spent_on >= '2024-02-01' AND spent_on < '2024-03-01'",
        "WHERE STRFTIME('%m', spent_on) = '02'",
        "WHERE spent_on LIKE '2024-02-__'",
      ],
      answer: 1,
      why: "The half-open interval [Feb 1, Mar 1) admits every timestamp in the month — '2024-02-29 23:59:59' < '2024-03-01' is TRUE. Close calendars live on this shape: BETWEEN drops the last night's entries, which is exactly when month-end accruals post.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends — anything after midnight on the 29th exceeds the bound. Month-end is precisely when the missing rows matter most." },
        { choice: 3, why: "LIKE matches text shape, defeats indexes, and silently misses padding variants. Range comparison is correct and sargable." },
      ],
      difficulty: "hard",
    },
    {
      id: "wf-mcq-5",
      prompt: "The ledger holds 181080 dollars of debits and 181080 of credits. Which query proves the books tie in one pass?",
      choices: [
        "SELECT SUM(debit_cents), SUM(credit_cents) FROM ledger_entries",
        "SELECT COUNT(*) FROM ledger_entries WHERE debit_cents = credit_cents",
        "SELECT SUM(debit_cents - credit_cents) FROM ledger_entries",
        "SELECT account, SUM(debit_cents) FROM ledger_entries GROUP BY account",
      ],
      answer: 2,
      why: "SUM(debit_cents − credit_cents) folds the delta directly — one cell, zero means tied (this book: 0, from 181080 vs 181080). The pair-of-SUMs version proves it too but hands you two numbers to subtract; the delta fold makes the identity itself the output.",
      notes: [
        { choice: 0, why: "Correct arithmetic, wrong deliverable — it returns 181080 and 181080 and leaves the subtraction (the proof) to the reader. Automate the comparison." },
        { choice: 1, why: "Counts rows where one entry self-balances — almost none do. The identity lives across the whole fold, not inside single rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-6",
      prompt: "You want expense categories with total spend of at least $2,000. Where does that condition live?",
      choices: [
        "WHERE SUM(amount_cents) >= 200000",
        "HAVING SUM(amount_cents) >= 200000",
        "HAVING amount_cents >= 200000",
        "WHERE amount_cents >= 200000",
      ],
      answer: 1,
      why: "The condition judges a folded group (the category's total), so it lives in HAVING, evaluated after GROUP BY — and the threshold is in cents (200000 = $2,000.00), because the column stores cents. WHERE runs before the fold and can't see the SUM.",
      notes: [
        { choice: 0, why: "Aggregate functions can't be judged in WHERE — this errors. Even if it ran, it would filter rows before folding, changing the totals it then tests." },
        { choice: 2, why: "Bare amount_cents in HAVING refers to an arbitrary row of the group, not the fold — it silently tests the wrong thing instead of erroring." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-7",
      prompt: "Five facilities carry two settlement rows each. You join facilities to settlements and SUM the facility amounts. What's wrong?",
      choices: [
        "Nothing — SUM is commutative, the total is right",
        "The five split facilities double-count — pre-aggregate the money side per facility first",
        "SUM drops the second settlement of each split",
        "The join needs a DISTINCT keyword in SELECT",
      ],
      answer: 1,
      why: "After the join, one row is a facility-payment pair; each split facility contributes its billed amount twice, inflating the total by its amount once per extra row. The money side folds to one row per facility (SUM … GROUP BY invoice_id) before the join, restoring one row per facility.",
      notes: [
        { choice: 0, why: "The settlement-side SUM would be right — but you're summing the FACILITY column, which fans out with every matched row. Grain, not arithmetic, is the bug." },
        { choice: 3, why: "DISTINCT deduplicates identical values — two facilities with the same amount would collapse to one. It's a magic word here, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "wf-mcq-8",
      prompt: "The settlement feed's invoice_id column contains one NULL among its rows. Which query shape silently returns ZERO unpaid facilities?",
      choices: [
        "LEFT JOIN + WHERE p.id IS NULL",
        "NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "WHERE i.id NOT IN (SELECT invoice_id FROM payments)",
        "A correlated subquery with COUNT(*) = 0",
      ],
      answer: 2,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN, so the entire result empties. On an audit book this is the worst failure mode: zero findings, no error, looks like clean books.",
      notes: [
        { choice: 0, why: "The LEFT JOIN arm is NULL-proof by construction — unmatched rows survive whatever the right side contains. It's the house shape precisely because feeds carry NULLs." },
        { choice: 1, why: "NOT EXISTS is NULL-safe too — the EXISTS test is FALSE when the subquery yields nothing, NULLs included. It returns the right six facilities." },
      ],
      difficulty: "hard",
    },
    {
      id: "wf-mcq-9",
      prompt: "Aging must measure every facility against one reference date. Which shape does that correctly?",
      choices: [
        "julianday('now') − julianday(due_on) computed per row",
        "julianday(MAX(paid_on)) − julianday(due_on) — MAX inside the row loop",
        "Cross-join a one-row derived table holding MAX(paid_on), then age every facility against it",
        "Age each facility against its own latest settlement date",
      ],
      answer: 2,
      why: "The reference date is computed once (MAX(paid_on) over the settlement feed), staged in a one-row derived table or CTE, and applied to every row — one clock, reproducible buckets. The probed book uses exactly this pattern for its aging context.",
      notes: [
        { choice: 0, why: "'Now' makes the report unreproducible — rerun it tomorrow and every bucket shifts. Auditors age against a stamped date, not a moving one." },
        { choice: 3, why: "Per-facility clocks make every account look current against its own history — the aging ladder stops meaning anything. One clock or no report." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-10",
      prompt: "Which expression builds the '%Y-%m' close-calendar bucket from a TEXT timestamp column?",
      choices: [
        "SUBSTR(spent_on, 1, 7)",
        "STRFTIME('%Y-%m', spent_on)",
        "DATE(spent_on, 'month')",
        "strftime(spent_on)",
      ],
      answer: 1,
      why: "STRFTIME('%Y-%m', …) is the calendar fold the house style names explicitly — it prints '2024-08' and groups every spend entry into its month. SUBSTR(1,7) happens to work on ISO strings but breaks the moment the format shifts.",
      notes: [
        { choice: 0, why: "Text surgery works while the format cooperates — it's the fragile twin of the real calendar function. Date functions survive format drift; SUBSTR doesn't." },
        { choice: 2, why: "DATE's modifiers shift a date ('start of month'), they don't render a bucket key. This returns a full date, so every row is its own group." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-wellsfargo-1",
      tier: "medium",
      topic: "j4",
      universe: "month-close",
      title: "The unpaid-facility exception list",
      brief:
        "Wells Fargo finance-ops brief on the storefront db: the close's first exception report is the unpaid list — every facility in the credit book LEFT JOINed to its settlements, keeping the accounts with NO settlement rows at all, because the unfunded book is both a collections worklist and an audit population. Probed facts: 6 facilities carrying 15217 dollars ($15,217.00) of billed exposure have zero settlement rows — and the list is not all 'open': facility #28 is marked PAID with $1,756.00 billed and nothing behind it, which makes it an audit finding, not a collections item (the other five are open, $13,461.00 combined). The LEFT JOIN is the only join that can produce this list: the unmatched rows ARE the answer, and any filter that touches the settlement side in WHERE silently deletes them.",
      ask: "Return the count of facilities with no settlement rows and their total billed dollars (2 decimals).",
      template:
        "SELECT {1}(i.id) AS unpaid_facilities,\n       ROUND({2}(i.amount_cents) / 100.0, 2) AS exposure_dollars\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the exception counter",
          why: "COUNT(i.id) over the unmatched rows counts facilities — 6, the probed exception headcount. SUM(i.id) would add up primary keys: a number with no meaning in any audit.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the exposure fold",
          why: "SUM over the left table's cents folds the unfunded book — 15217 dollars after /100.0. COUNT would divide a row count by 100 and print 0.06: cents-shaped noise on an audit deliverable.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the unmatched-keeping join",
          why: "LEFT keeps every facility, so the six with no settlement rows survive as NULL payloads. INNER would delete them before the filter ever ran — the exception report would ship zero findings.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched detector",
          why: "p.id IS NULL keeps only rows where no settlement matched — the six-facility answer. IS NOT NULL inverts the hunt and returns the 27 matched pairs instead of the exceptions.",
        },
      ],
      distractors: ["SUM", "MAX", "INNER", "NOT NULL"],
      walkthrough:
        "An anti-join where the survival rule is inverted: the report exists to keep rows that DIDN'T match. The LEFT JOIN keeps all 28 facilities; the six with no settlement in the feed arrive with NULL payloads, and WHERE p.id IS NULL is the detector that isolates them — COUNT(i.id) reads 6 and SUM(i.amount_cents)/100.0 reads 15217.00, the probed exposure. The INNER distractor is the classic silent failure: it deletes the unmatched rows before the filter runs, and the exception report ships zero findings — looking perfectly clean. The status wrinkle is why this list feeds two queues: facility #28 is labeled paid yet unfunded ($1,756.00), so it's an audit finding about label-versus-movement, while the five open facilities ($13,461.00 combined) are collections work — and the query can't tell them apart until the status column is joined back, which is exactly the follow-up an auditor asks. The /100.0 happens once, at display, because the column stores integer cents.",
    },
    {
      id: "cs-wellsfargo-2",
      tier: "easy",
      topic: "t4",
      universe: "expense",
      title: "The ops-spend calendar spike",
      brief:
        "Wells Fargo branch-ops brief on the storefront db: the operations-spend calendar folds 36 expense entries onto the '%Y-%m' spine — Rent 14 entries / $16,800.00, Ads 14 / $4,570.00, Travel 3 / $2,521.00, Tools 5 / $1,525.00 across 14 months — and the budget review opens with the spike: which month did branch & operations spend peak, and how heavy was it? Probed facts: the calendar peaks at 2024-08 with 3 entries totalling 3210 dollars ($3,210.00) — the month ops burn jumped; the calmest month runs $1,440.00. The fold is over ALL expense entries by category-agnostic design: the budget question is total burn per month, and the spend total must reconcile to the operating_expenses ledger account ($25,416.00 both ways) when the whole calendar sums.",
      ask: "Return the single heaviest ops-spend month: its '%Y-%m' bucket, entry count, and spend in dollars (2 decimals).",
      template:
        "SELECT STRFTIME({1}, e.spent_on) AS month,\n       {2}(*) AS items,\n       ROUND(SUM(e.amount_cents) / 100.0, 2) AS spend_dollars\nFROM expenses e\nGROUP BY month\nORDER BY spend_dollars {3}\nLIMIT {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket format",
          why: "The %Y-%m pattern prints '2024-08' — the 14-month close-calendar spine. '%Y' would collapse to two year rows and bury the spike; '%m' would merge August 2024 with August 2025 into one bucket.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the entry counter",
          why: "COUNT(*) counts the expense entries folded into each month — the spike month carries 3. SUM(*) isn't SQL and MAX(*) would report one entry, not the month's activity count.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the spike-first direction",
          why: "DESC puts the heaviest month on top: 2024-08 at $3,210.00. ASC would surface the calmest month's $1,440.00 — a correct query aimed at the wrong end of the budget question.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-spike cut",
          noVerify: true,
          why: "The ask names ONE month. LIMIT 1 keeps exactly the spike row; LIMIT 3 would hand the budget review a podium nobody requested.",
        },
      ],
      distractors: ["'%Y'", "SUM", "ASC", "3"],
      walkthrough:
        "A calendar fold with the spike as the deliverable. STRFTIME('%Y-%m', spent_on) builds the 14-month spine — one bucket per month, the idiom every close calendar here hangs on — COUNT(*) counts entries per month, and ROUND(SUM(amount_cents)/100.0, 2) prices the bucket: $3,210.00 at the 2024-08 peak, down to $1,440.00 at the floor. ORDER BY spend_dollars DESC + LIMIT 1 is the spike read; the same query with ASC names the quietest month, which is the budget-review question asked upside down. The format literal is the slot worth sweating: '%Y' silently re-folds the calendar into two year-long buckets — a valid query that no longer contains a month — and '%m' merges same-month buckets across years. SUM in the counter slot errors, and LIMIT 3 dilutes a single-spike ask into a leaderboard. The reconciliation note the review checks: the calendar's months must sum to the $25,416.00 the operating_expenses ledger account carries — the expense feed and the books tie, or the fire drill starts.",
    },
  ],

  problems: [
    { slug: "expected-credit-loss", why: "Tagged for Wells Fargo. Exposure weighted by loss factor per band, summed to a provision — the ECL screen where the weighting arithmetic must tie to the ledger." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the ledger proof (181080 vs 181080 here) that gates every close before a dashboard ships." },
    { slug: "balance-rollforward", why: "Opening balance + movements = closing balance, walked account by account — the rollforward evidence controllership signs each period." },
    { slug: "gl-reconciliation", why: "Two sides of one book compared row by row — the recon break hunt: what the sub-ledger says versus what the ledger says, and the diff in between." },
    { slug: "ar-aging-schedule", why: "Aging buckets over the receivables book — current, 30, 60, 90+ with no facility counted twice, aged against one stamped reference date." },
    { slug: "journal-gap-detection", why: "Missing entry numbers in a journal sequence — the audit-trail completeness check: a gap in the sequence is a finding before anyone reads the amounts." },
    { slug: "bank-account-summary", why: "LEFT JOIN account activity where quiet accounts must still appear — the statement view that keeps zero-activity accounts visible, not deleted." },
    { slug: "duplicate-emails", why: "GROUP BY + HAVING over duplicates — the master-file hygiene check: two accounts sharing one contact key is a KYC finding, not a curiosity." },
    { slug: "books-with-null-ratings", why: "COUNT(col) vs COUNT(*) on nullable columns — the NULL-census muscle behind 'how many accounts are actually missing a risk attribute'." },
    { slug: "monthly-transactions-ii", why: "Cancelled-versus-rest month packets via UNION — the two-population stitch the close deck uses to show exception share without a self-join." },
    { slug: "count-salary-categories", why: "CASE tiers plus UNION ALL totals — band censuses whose grand row must reconcile to COUNT(*), the kit's one-pass habit." },
    { slug: "delinquency-buckets", why: "DPD bucketing in exhaustive CASE arms — the collections ladder: how many facilities sit 1-30, 31-60, 61-90 days past due." },
    { slug: "fix-names-in-a-table", why: "Name normalization before any per-person dedupe — branch feed records arrive in mixed case, and a join on a dirty key is a silent fan-out." },
    { slug: "invalid-tweets", why: "LENGTH-based validation gates — reference numbers and memo fields audited for shape before they're trusted as join keys." },
    { slug: "customers-who-never-order", why: "The NULL-safe anti-join — accounts with no activity at all: the dormancy sweep whose empty-match semantics ARE the finding." },
    { slug: "employee-bonus", why: "LEFT JOIN with COALESCE fallback — the fee-waiver read: accounts without an adjustment still appear, with zero filled in deliberately." },
  ],
};
