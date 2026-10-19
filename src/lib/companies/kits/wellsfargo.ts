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
    "Preparation strategy: the registry tags **one problem** for Wells Fargo (`expected-credit-loss` — start there, it maps onto the provision screens), so the pool is mostly theme-curated toward the bank's known reads: reconciliation folds, anti-join exception lists, month-bucket calendars, audit-grade text and NULL hygiene. Then run the **six case studies** on the live storefront db: the {rose:unpaid-facility exception list} finance operations chases and the {amber:operations-spend calendar} the branch network budgets — plus a ledger stack with its grand-total row, a one-row CASE pivot of the book, an aging read against the stamped reference clock, and a running settlement walk. Re-run each a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the thirty-question MCQ bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the 'which rows did your WHERE delete?' follow-up tests.",
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
      slugs: ["trial-balance-check", "balance-rollforward", "gl-reconciliation", "account-balance", "deferred-revenue", "ar-aging-schedule", "journal-gap-detection"],
    },
    {
      name: "LEFT JOIN coverage reads",
      why: "Exception hunting starts with keeping the unmatched rows: every facility LEFT JOINed to its settlements so the six with no money survive as NULL payloads. The bank's follow-up is always the same: which rows did your WHERE clause just delete — because the unmatched rows ARE the audit answer.",
      slugs: ["bank-account-summary", "count-student-number-in-departments", "number-of-times-a-driver-was-a-passenger", "bank-account-summary-ii"],
    },
    {
      name: "Anti-joins: the exception list",
      why: "The unpaid list is an anti-join — facilities with NO settlement rows — and the NULL-safe shapes matter here in a way they don't elsewhere: one NULL in a NOT IN subquery silently empties a consent-order evidence file. LEFT JOIN + IS NULL and NOT EXISTS are the house shapes.",
      slugs: ["customers-who-never-order", "customer-who-visited-but-did-not-transact", "find-churn-risk-customers", "settlement-fails-aging", "suspicious-bank-account-transactions"],
    },
    {
      name: "CASE branches for exception classes",
      why: "Audit output is classification: exact / partial / nothing, current / late / loss, clean / finding. Each CASE arm is a promise of exhaustiveness — every account lands somewhere, and the branch counts must reconcile to the total, because a classification with a hole is a finding of its own.",
      slugs: ["count-salary-categories", "delinquency-buckets", "monthly-transactions-ii", "structuring-detection"],
    },
    {
      name: "Month buckets & close calendars",
      why: "The close runs on the '%Y-%m' spine: spend per month, settlements per month, the aging reference date stamped once and reused. Wells Fargo probes whether you can bucket TEXT timestamps without losing the month's last night — half-open intervals, not BETWEEN.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "list-the-products-ordered-in-a-period", "maximum-transaction-each-day"],
    },
    {
      name: "Aggregation at account scale",
      why: "Retail banking is census work: accounts per status, entries per category, settlements per rail — millions of rows folded into board-ready counts. The screen checks whether your COUNT means accounts, settlements or join rows; the three disagree the moment a fan-out exists.",
      slugs: ["product-sales-analysis-ii", "classes-more-than-5-students", "duplicate-emails", "transaction-velocity", "duplicate-charge-pairs"],
    },
    {
      name: "Audit text hygiene",
      why: "Branch feeds arrive messy: account names in mixed case, memo fields with padding, reference numbers that only match after normalization. A join on a dirty key is a silent fan-out — or a silent miss — and both are audit findings. String reshaping is a warm-up here, not an afterthought.",
      slugs: ["fix-names-in-a-table", "invalid-tweets", "fix-product-name-format"],
    },
    {
      name: "NULL policy on partial records",
      why: "An account can have no settlement (yet), a payment with no method, an aging row with no reference date. Wells Fargo screens check whether you treat NULL as a finding to report, coalesce to zero for display, or exclude with a stated reason — deliberately, never by accident.",
      slugs: ["employee-bonus", "calculate-special-bonus", "books-with-null-ratings", "change-null-values-in-a-table-to-the-previous-value", "null-blank-audit"],
    },
    {
      name: "Provision & expected-loss reads",
      why: "The tagged problem expected-credit-loss is the shape: exposure weighted by a loss factor per band, summed to a provision number that must tie to the ledger. Weighted folds punish integer division and mis-weighted denominators — exactly the arithmetic consent-order scrutiny reruns.",
      slugs: ["expected-credit-loss", "credit-utilization-bands", "daily-balance-interest", "loan-amortization-schedule", "prepayment-detection", "loan-types"],
    },
    {
      name: "One-pass censuses & two-grain counts",
      why: "Close-week query budgets are real: the status census, the category census and the exception census each get one pass. FILTER (WHERE …) branches and COUNT DISTINCT at two grains keep the deliverable in a single scan — with branch totals that must reconcile to COUNT(*) before they ship.",
      slugs: ["daily-leads-and-partners", "active-businesses", "number-of-rich-customers", "keep-latest-dedupe"],
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
    {
      id: "wf-t9",
      q: "RANK versus DENSE_RANK versus ROW_NUMBER on an aging ladder — who shares a rung, what happens after a tie, and which belongs on the exception report?",
      a: "Three functions, three contracts. ROW_NUMBER gives every row a distinct number and breaks ties arbitrarily — right for dedupe, wrong for a ladder where a tie is information. RANK shares rungs and skips after a tie (1, 1, 3) — the audit-honest ladder, because the missing rungs ARE the tie, visible to the reader. DENSE_RANK shares rungs with no gaps (1, 1, 2) — the tier read, when policy bands must be consecutive. On an exception report the ask is usually 'who is worst, and how many share the worst?' — RANK answers both: the tied accounts carry the same number and the next account's number tells you the size of the tie. Whatever you pick, add a deterministic tie-breaker (id, due date) to ROW_NUMBER so the report reruns identically — auditors rerun everything.",
      tag: "windows",
    },
    {
      id: "wf-t10",
      q: "UNION or UNION ALL when you stack a TOTAL row under the account detail — what changes, and why does the close standard say ALL?",
      a: "UNION concatenates then dedupes; UNION ALL concatenates and stops. The close stack is detail rows plus one labelled TOTAL row — all legitimate, all distinct by construction — so the dedupe pass is pure cost, and worse it's a silent hazard: if a detail row ever equals the TOTAL row (a one-account ledger does it), UNION deletes that row and the stack undercounts the very report whose job is proving completeness. UNION earns its place when the ask is set semantics — two populations where overlap must collapse to one. The deliverable rule: if every stacked row belongs in the output, the keyword is UNION ALL, and the reviewer can prove it because the branch counts reconcile to the TOTAL row on sight.",
      tag: "sets",
    },
    {
      id: "wf-t11",
      q: "A screen asks for accounts whose billed amount beats their MARKET's average. Write it correlated, then rewrite it set-based — and say why the rewrite matters.",
      a: "Correlated first: WHERE i.amount_cents > (SELECT AVG(amount_cents) FROM invoices x WHERE x's market = i's market) — the inner average re-runs once per outer row unless the engine decorrelates. The set-based rewrite: a CTE computing AVG(amount_cents) GROUP BY market, joined back on market — the fold happens once — or the window AVG(i.amount_cents) OVER (PARTITION BY c.region) as a column compared to the row's own amount, one pass, every row kept. Why it matters: the correlated shape is fine at 28 rows and dies at ten million, and the interviewer is grading whether you know where the cliff is. The strong answer also states the semantic guarantee both versions share: the comparison population is the market, stated before any predicate is written.",
      tag: "subqueries",
    },
    {
      id: "wf-t12",
      q: "NOT IN, NOT EXISTS, LEFT JOIN + IS NULL — the unfunded-account hunt. Which is NULL-safe and why do the other two risk the report?",
      a: "LEFT JOIN + IS NULL and NOT EXISTS are both NULL-safe; NOT IN is the trap. x NOT IN (subquery) can never be TRUE if the subquery returns even one NULL — every comparison is UNKNOWN, NOT UNKNOWN is still UNKNOWN, and the entire result silently empties. On this book that's the worst possible failure mode: the unpaid list ships zero rows, no error, reads as clean books — a suppressed finding. LEFT JOIN + IS NULL keeps every facility and lets the six unfunded ones surface as NULL payloads — the rows ARE the answer, and the status column attached shows #28 is labeled paid with nothing behind it. NOT EXISTS states the intent ('no settlement row exists') without join vocabulary and short-circuits. House habit: the anti-join is one of those two shapes, never NOT IN, unless the subquery's column is proven NOT NULL.",
      tag: "subqueries",
    },
    {
      id: "wf-t13",
      q: "Why stage a CTE before the coverage walk — the running settled-cents column per account — instead of one inline query?",
      a: "Three reasons, all audit-flavored. Grain: the CTE is a named, testable layer — 'one row per settlement leg' — the reviewer can run it alone and confirm the grain before trusting the window built on it. Mechanics: the walk is SUM(amount_cents) OVER (PARTITION BY invoice_id ORDER BY paid_on) — #1 accumulates 243000 then 486000, #25 stalls at 400000 of its 614800 bill — and window output is NOT visible to WHERE in the same SELECT, so any threshold on the walk ('show accounts whose latest rung is short') forces a second layer anyway; the CTE is that layer. Reproducibility: the base CTE fixes date handling (julianday casts, the stamped reference date) in one place, so the walk and every threshold downstream age against the same clock. Inline SQL that mixes plumbing, windows and thresholds is exactly the shape consent-order review sends back.",
      tag: "windows",
    },
    {
      id: "wf-t14",
      q: "What is your NULL policy on the exception report — where do you COALESCE, where is NULL itself the finding, and where do you exclude with a stated reason?",
      a: "Per column, never globally. Display: COALESCE(settled_cents, 0) so the statement view prints a number where the reader needs one — an unfunded account shows 0.00, visibly funded-by-nothing. Findings: keep the NULL — the exposure list's unfunded rows carry NULL settled totals, and that NULL IS the six-account, $15,217.00 answer; COALESCE-ing the finding away deletes the report's reason to exist. Filters: exclusions are stated — WHERE status IS NOT NULL with a comment saying unlabeled rows are counted separately, versus the silent accident where NULL fails both = and != and vanishes. Backing it all: aggregates ignore NULL inputs (SUM, AVG), COUNT(col) shrinks while COUNT(*) keeps rows, and NULL keys never join — so 'how many accounts lack settlements' is the IS NULL arm's COUNT, not an AVG dividing by a drifted denominator.",
      tag: "nulls",
    },
    {
      id: "wf-t15",
      q: "The coverage classification is a CASE with 'exact', 'partial', and a ELSE 'nothing' arm. Defend the ELSE the way you would to an examiner.",
      a: "The ELSE is the exhaustiveness guarantee, and the examiner's test is arithmetic: 21 exact + 1 partial + 6 nothing = 28 facilities = COUNT(*), reconciled on sight. The day a fourth status or a NULL total lands, the ELSE catches it in a visible bucket instead of letting it fall through to NULL — an unnamed row that silently shrinks every branch count and makes the census identity fail with nothing pointing at the cause. Fall-through-to-NULL is the specific hazard: the row survives the output, unlabeled, and 'how many accounts did we classify?' becomes unanswerable from the query alone. Bank-grade CASE work writes the ELSE deliberately — 'nothing' here is a real bucket with real money ($15,217.00) and real follow-up (one of the six is labeled paid, which is an audit finding, not a collections item).",
      tag: "casework",
    },
    {
      id: "wf-t16",
      q: "How do you age a book against a reference date — and why is julianday, not the raw TEXT columns?",
      a: "One clock, computed once, applied everywhere: the reference date is MAX(paid_on) across the settlement feed (2025-02-10 on this book), stamped in a CTE or one-row derived table and joined or cross-applied, so every account ages against the same date. Aging is then julianday(reference) − julianday(due_on) per row — julianday converts the TEXT timestamps to real day numbers, so the delta is actual days (fractions included, CAST to INT for whole-day buckets). Inline 'now' makes the report unreproducible — rerun tomorrow and every bucket shifts; per-account clocks make everyone look current against their own history. And the bucket arms — current, 1-30, 31-60, 61+ — are checked for exhaustiveness against COUNT(*): a day in two buckets or none is a finding about the query, not the bank.",
      tag: "dates",
    },
    {
      id: "wf-t17",
      q: "The ops-spend calendar runs on '%Y-%m' buckets. Walk the fold — and what breaks when the month key is text surgery or the wrong format string?",
      a: "STRFTIME('%Y-%m', spent_on) renders the month spine — '2024-08', sortable, one bucket per calendar month — and GROUP BY it folds 36 entries across 14 months, peaking at $3,210.00 in 2024-08 against a $1,440.00 floor, reconciling to the $25,416.00 operating_expenses account when the whole calendar sums. Two silent failures live in the format literal: '%Y' alone re-folds the calendar into two year-long buckets — a valid query that no longer contains a month — and '%m' alone merges August 2024 with August 2025. The text-surgery twin, SUBSTR(spent_on, 1, 7), agrees while the feed format cooperates and quietly splits or merges buckets the day it doesn't; the calendar function parses and fails loudly instead. State the format string out loud when you present the query — it's the part reviewers copy and the part that's easiest to get subtly wrong.",
      tag: "dates",
    },
    {
      id: "wf-t18",
      q: "Where does GROUP_CONCAT earn its place in an audit kit, and what discipline keeps its output trustworthy?",
      a: "As the readable fold: GROUP_CONCAT(p.method, ', ') at the per-account grain stacks each account's settlement rails into one scannable cell — 'card' for single-rail, 'card, card' for the split pairs, 'card, wire' for mixed funding — so the exception reviewer reads the funding story without a second query. The discipline that keeps it trustworthy: deterministic order (fold from an ordered subquery or use GROUP_CONCAT(x ORDER BY y) on newer SQLite) so 'wire, card' doesn't alternate between reruns; grain alignment — it folds after GROUP BY, so it lives beside the COUNT and SUM of the same fold; and length awareness — a cell is a display artifact, not a join key, and no downstream query should ever parse it. In audit narratives it's the difference between 'five accounts carry two legs' and showing the five legs.",
      tag: "aggregation",
    },
    {
      id: "wf-t19",
      q: "Prove the book in one scan. What does the FILTER census look like, and why is it the close's first query?",
      a: "SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'paid'), COUNT(*) FILTER (WHERE status = 'open'), COUNT(*) FILTER (WHERE status = 'void'), SUM(amount_cents) FILTER (WHERE status = 'paid') / 100.0 FROM invoices — one scan, one row: 28 facilities, 21 settled ($66,443.00), 6 open, 1 void. It goes first because it's the cheapest full-book identity: the branches must sum to COUNT(*) (21 + 6 + 1 = 28) and the money must tie to the receivables account, so any pipeline damage upstream shows up here as a broken census before anyone reads a dashboard. FILTER (WHERE …) judges every population from the same rows in the same pass — numerator and denominator can never disagree about population — and the CASE-1-0-SUM twin is equivalent. The style choice doesn't matter; the one-pass, self-reconciling property is the requirement.",
      tag: "aggregation",
    },
    {
      id: "wf-t20",
      q: "Before any join runs on a branch feed, what does your text-hygiene pass check — and what does a dirty key actually do downstream?",
      a: "It checks the keys the join will trust: trailing and leading whitespace (TRIM), case drift (UPPER/LOWER on both sides), padding zeros on reference numbers (LPAD or a normalization function both sides agree on), and shape gates — LENGTH checks that a reference number is exactly as long as the standard says before it's treated as a key. A dirty key fails in two opposite ways: the silent miss (the match that should happen doesn't, and the account quietly vanishes from the report) or the silent fan-out (two normalized forms matching one row twice, doubling money). Both are audit findings, and neither errors. The house order: normalize once into a staging layer, verify the join cardinality afterwards (COUNT of pairs vs COUNT of rows — matched, unmatched, duplicated), and only then run the business logic. String functions are the cheap minute; a recon break found on Friday is the expensive one.",
      tag: "quality",
    },
    {
      id: "wf-t21",
      q: "The settlement pipeline retried overnight. How do you detect duplicate money and dedupe without deleting a legitimate second installment?",
      a: "Detect with a fold at the event grain: GROUP BY invoice_id, paid_on, amount_cents HAVING COUNT(*) > 1 — a retried ingest repeats all three, while a legitimate second installment differs in date or amount, so the key choice IS the business definition of 'same money event'. Dedupe with the window: ROW_NUMBER() OVER (PARTITION BY invoice_id, paid_on, amount_cents ORDER BY id) numbers each duplicate group, and you keep rn = 1. The fatal mistake is partitioning on invoice_id alone — on this book five facilities carry two genuine legs each, so that key would classify half of real money as duplicates and delete it. The answer an auditor wants: state the key, say what each column excludes (date excludes installments, amount excludes partials), and note that the dedupe is verified afterwards by re-summing — the post-dedupe total must equal the pre-dedupe total minus exactly the duplicated rows.",
      tag: "windows",
    },
    {
      id: "wf-t22",
      q: "Audit asks you to pair up settlement legs that share an account and a day — the duplicate-money inspection. Why a self-join, and what does a.id < b.id do?",
      a: "Because inspection means printing both rows side by side, and 'compare every row to every other row' is the join of a table to itself under two aliases: FROM payments a JOIN payments b ON a.invoice_id = b.invoice_id AND a.paid_on = b.paid_on WHERE a.id < b.id. The strict inequality does two jobs at once: it kills the self-match (a.id = b.id) and it kills each pair's mirror image (b,a), so every pair prints exactly once in a canonical order — a.id <> b.id alone would deliver both orderings. The census version (GROUP BY the key HAVING COUNT(*) > 1) proves pairs exist but can't show them; the self-join is the evidence file. The scale follow-up is standard: pair joins are quadratic on the key, so production shapes pre-filter (one account, one day window) before joining — and on this book the honest answer is that the five split facilities have DIFFERENT dates, so a same-day pair hunt correctly returns nothing.",
      tag: "joins",
    },
    {
      id: "wf-t23",
      q: "'Worst account per market' — when does ORDER BY + LIMIT fail, and what does the window rewrite look like?",
      a: "ORDER BY days_past DESC LIMIT N is one cut over the whole finished result — the N worst overall, mixed across markets. The moment the ask carries a per-group dimension, LIMIT is structurally wrong, and it has a second flaw: ties at the cut line are broken arbitrarily, so the query silently chooses which account survives. The window rewrite: ROW_NUMBER() OVER (PARTITION BY region ORDER BY days_past DESC) ranks inside each market, and a second layer filters rn = 1 (window output isn't visible to WHERE in the same SELECT, so the CTE is mandatory). For 'the N worst per market' the same shape reads rn <= N; if ties should survive the cut together, RANK <= N does that where ROW_NUMBER can't. State the grain — one row per market — and the interviewer knows the LIMIT reflex is gone.",
      tag: "windows",
    },
    {
      id: "wf-t24",
      q: "Close week: the statement cycle demands five reports from one pipeline. How do you sequence the SQL so every number ships with its defense?",
      a: "Cheapest identities first, shared staging above them, every report citing its layer. One: the trial balance and the FILTER census — SUM(debits) = SUM(credits) (181,080 = 181,080) and 21 + 6 + 1 = 28 — two folds that gate everything. Two: the shared CTEs — the stamped reference date, the per-account money fold, the month spine — each named, each testable alone, so no report re-derives a clock. Three: the reports themselves — the unpaid exception list, the coverage classification, the aging ladder, the spend calendar — each a thin SELECT over the staged layers, each carrying its definition in a comment and its branch census in the output. The habit the bank is buying: when the examiner asks 'where did this number come from?', the answer is a lineage of named layers, not a 90-line inline query nobody can rerun from a blank editor.",
      tag: "pipeline",
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
    {
      id: "wf-mcq-11",
      prompt: "The exception ladder ranks accounts by days-past-due, and two accounts tied at 31 days must share a rung. Which function?",
      choices: ["ROW_NUMBER", "RANK", "COUNT", "MAX OVER"],
      answer: 1,
      why: "RANK gives tied values the same rank and leaves a gap after the tie — both 31-day accounts are rank 4 and the next account is rank 6. The gap is the tie made visible, which is what an audit ladder wants.",
      notes: [
        { choice: 0, why: "ROW_NUMBER breaks the tie arbitrarily — one tied account silently outranks the other. Determinism needs a stated tie-breaker, not a default ordering." },
        { choice: 2, why: "COUNT folds rows into one number per group; the ladder needs one row per account. Only window functions keep the rows while adding the rank." },
      ],
      difficulty: "easy",
    },
    {
      id: "wf-mcq-12",
      prompt: "An aging tier read uses DENSE_RANK(). Three accounts tie at tier 5. What tier does the next account get?",
      choices: ["8", "6", "5", "NULL"],
      answer: 1,
      why: "DENSE_RANK numbers the next distinct value consecutively: three tied accounts share tier 5 and the next account is tier 6 — no phantom gaps. RANK would say 8, which in a tier read invents two missing bands.",
      notes: [
        { choice: 0, why: "8 is RANK's honest gap — right when the tie should be visible as missing rungs, wrong when the ask is a compact tier ladder." },
        { choice: 2, why: "Tier 5 would place the next account inside the tie. Ranking functions never merge distinct values into one rung." },
      ],
      difficulty: "easy",
    },
    {
      id: "wf-mcq-13",
      prompt: "The statement view attaches settled cents per account; unfunded accounts fold to NULL. Which expression prints 0 for them?",
      choices: [
        "SUM(p.amount_cents) + 0",
        "COALESCE(SUM(p.amount_cents), 0)",
        "NULLIF(SUM(p.amount_cents), 0)",
        "SUM(COALESCE(p.amount_cents))",
      ],
      answer: 1,
      why: "COALESCE wraps the FOLD: an empty fold is NULL, and COALESCE swaps it for 0 at display. NULL + 0 is still NULL — arithmetic never cures a NULL.",
      notes: [
        { choice: 2, why: "NULLIF turns a match INTO NULL — it would blank genuinely-zero folds, the exact opposite of the fix." },
        { choice: 3, why: "COALESCE inside the aggregate guards per-row NULLs in the INPUT — but an empty group has no rows at all, so the fold is still NULL. The wrap goes outside." },
      ],
      difficulty: "easy",
    },
    {
      id: "wf-mcq-14",
      prompt: "An account has zero settlement rows. In the facilities-LEFT-JOIN-payments fold, what does SUM(p.amount_cents) return for it?",
      choices: ["0", "NULL", "The account's billed amount", "It errors"],
      answer: 1,
      why: "SUM over zero rows is NULL — the honest 'nothing to add'. That NULL is load-bearing: paid_cents = amount_cents is UNKNOWN, so the coverage CASE routes the row to the 'no payment' arm, where the audit wants it.",
      notes: [
        { choice: 0, why: "Zero is the COALESCE'd display value. Without the wrapper, the raw fold is NULL — and comparisons against it are UNKNOWN, not FALSE." },
        { choice: 2, why: "The billed amount lives on the left side of the join. SUM sees only the (empty) payment side and reports NULL." },
      ],
      difficulty: "easy",
    },
    {
      id: "wf-mcq-15",
      prompt: "The close deck stacks per-account ledger rows with a labelled TOTAL row underneath. Why UNION ALL, not UNION?",
      choices: [
        "UNION ALL skips the dedupe pass — and the stack must not silently collapse two identical rows into one",
        "UNION requires the columns to be named identically",
        "UNION ALL sorts the output automatically",
        "UNION cannot stack a literal like 'TOTAL'",
      ],
      answer: 0,
      why: "UNION dedupes the stacked result; UNION ALL just concatenates. On a recon deliverable the dedupe pass is pure cost — and if a detail row ever exactly equals the TOTAL row, UNION deletes it and the stack undercounts the very report proving completeness.",
      notes: [
        { choice: 1, why: "Both forms need the same column count; aliases don't matter. The dedupe semantics are the difference." },
        { choice: 3, why: "UNION stacks literals fine — 'TOTAL' is just a selected string. The failure mode is silent row deletion, not a syntax wall." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-16",
      prompt: "Which shape lists accounts with at least one settlement row — safe no matter what the settlement feed contains?",
      choices: [
        "WHERE i.id IN (SELECT invoice_id FROM payments)",
        "WHERE EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "WHERE i.id = ANY (SELECT invoice_id FROM payments)",
        "HAVING COUNT(p.id) >= 1",
      ],
      answer: 1,
      why: "EXISTS short-circuits on the first matching row and can't be poisoned by NULLs — a NULL key matches nothing, the probe is FALSE, the account correctly reads as unfunded. That's the audit-safe presence check.",
      notes: [
        { choice: 0, why: "IN survives NULLs on the positive test — the poison is NOT IN. But EXISTS states the intent and the house habit is EXISTS for presence." },
        { choice: 3, why: "HAVING judges groups after a fold; this ask is a row filter on the accounts table. Wrong clause for the grain." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-17",
      prompt: "Latency math: julianday(paid_on) − julianday(issued_on) averages 28.4 days. What does paid_on − issued_on (no julianday) produce on TEXT columns?",
      choices: [
        "The same deltas",
        "Integer day counts",
        "0.0 — SQLite coerces the non-numeric strings to 0 and subtracts",
        "A type error that stops the query",
      ],
      answer: 2,
      why: "TEXT minus TEXT isn't date math: both strings coerce to 0, the delta is 0.0, and the query SUCCEEDS with garbage. julianday is the conversion that makes the subtraction real days — silence-and-zeros is the failure mode auditors fear.",
      notes: [
        { choice: 3, why: "SQLite almost never type-errors — it coerces. The danger is precisely that the query runs and prints confident zeros." },
        { choice: 1, why: "Backwards: julianday yields the real-valued day count; the raw subtraction yields zeros coerced from strings." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-18",
      prompt: "Exception review wants each account's settlement rails in one cell — 'card, wire' readable at a glance. Which fold?",
      choices: [
        "SUM(p.method)",
        "GROUP_CONCAT(p.method, ', ') at the per-account grain",
        "CONCAT(p.method, ', ') without GROUP BY",
        "CAST(p.method AS TEXT)",
      ],
      answer: 1,
      why: "GROUP_CONCAT is the text aggregate — it stacks a group's text values into one comma-joined cell. SUM coerces text to 0, CONCAT isn't an aggregate (it touches one row), and CAST changes nothing about folding.",
      notes: [
        { choice: 0, why: "SUM over text returns 0.0 for every group — a column of zeros wearing a rails name. Strings need the string fold." },
        { choice: 2, why: "CONCAT joins its arguments row-by-row; without an aggregate there's no fold to compress many rows into one cell." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-19",
      prompt: "One scan of invoices must print paid / open / void counts side by side and reconcile to the total. Which is the one-pass shape?",
      choices: [
        "Three queries pasted into the close deck",
        "GROUP BY status",
        "COUNT(*) FILTER (WHERE status = 'paid'), … one column per status",
        "SUM(status = 'paid')",
      ],
      answer: 2,
      why: "FILTER (WHERE …) branches inside the aggregate: one scan, one row, columns that add up to COUNT(*) on sight — the census identity the close requires. GROUP BY gives a row per bucket, a different deliverable; three round-trips can drift apart.",
      notes: [
        { choice: 1, why: "Close but wrong shape: a GROUP BY fold is a per-bucket report, not a single controls row whose branches visibly sum to the total." },
        { choice: 3, why: "SUM(boolean) works in some engines as a 1/0 fold, but the FILTER form is the readable standard here — and the ask is one row, one scan." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-20",
      prompt: "The coverage walk shows settled cents accumulating per leg: account #1 reads 243000 then 486000. Which expression produces that running column?",
      choices: [
        "SUM(amount_cents) GROUP BY invoice_id",
        "SUM(amount_cents) OVER (PARTITION BY invoice_id ORDER BY paid_on)",
        "SUM(amount_cents) OVER (ORDER BY paid_on)",
        "LAG(amount_cents) OVER (PARTITION BY invoice_id)",
      ],
      answer: 1,
      why: "Partition by account, order by paid date: the default frame accumulates from each partition's start, one running total per account beside every leg. Drop the PARTITION and every account's legs pile onto one global accumulator.",
      notes: [
        { choice: 0, why: "The plain fold collapses to one row per account — the walk needs every leg kept with the accumulation beside it. Windows keep rows; GROUP BY deletes them." },
        { choice: 2, why: "That's one running total across ALL accounts ordered by date — account #2's money lands inside account #1's walk. Partition is the boundary." },
      ],
      difficulty: "hard",
    },
    {
      id: "wf-mcq-21",
      prompt: "A coverage CASE arms only 'exact' and 'partial' — no ELSE. An account with a NULL paid total arrives. Where does it land, and what does the audit see?",
      choices: [
        "An error — NULL input rejected",
        "The 'partial' arm",
        "NULL label — the row survives, unnamed, and every branch count sums short of the total",
        "The 'exact' arm — NULL equals anything in CASE",
      ],
      answer: 2,
      why: "CASE falls through to NULL when no arm matches and no ELSE exists — the account stays in the output, unlabeled, and the branch census no longer sums to COUNT(*). The hole is silent, which is exactly why ELSE is the exhaustiveness guarantee.",
      notes: [
        { choice: 1, why: "Arms match on equality; NULL = anything is UNKNOWN, so no arm catches it. Fall-through is the only path." },
        { choice: 3, why: "NULL never equals anything in SQL — that's the three-valued logic the whole kit drills. The label is NULL, not 'exact'." },
      ],
      difficulty: "hard",
    },
    {
      id: "wf-mcq-22",
      prompt: "Audit hunts near-duplicate money: two legs, same account, same day. Which shape pairs the rows for inspection?",
      choices: [
        "Self-join payments a, b ON same invoice_id and paid_on, a.id < b.id",
        "GROUP BY invoice_id HAVING COUNT(*) > 1",
        "DISTINCT invoice_id, paid_on",
        "LAG over payments ordered by paid_on",
      ],
      answer: 0,
      why: "Inspecting PAIRS means printing both rows side by side — a self-join with two aliases, matched on the shared key, and a.id < b.id to keep each pair once without self-matching. The census (GROUP BY) finds that pairs exist but can't show them.",
      notes: [
        { choice: 1, why: "Right detection, wrong deliverable: the fold proves multiplicity and stops. The audit step needs the actual two rows — that's the join." },
        { choice: 3, why: "LAG compares each row to its NEIGHBOR only. True pairing compares every row to every other row — the join's job." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-23",
      prompt: "A 7-day ops-burn trend: AVG(daily_cents) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). When does ROWS lie?",
      choices: [
        "When the ORDER BY column is TEXT",
        "When a day is missing from the feed — 6 preceding ROWS then span more than 7 calendar days",
        "When the average exceeds 1000",
        "ROWS never differs from RANGE",
      ],
      answer: 1,
      why: "ROWS counts physical rows, not calendar days — one missing day stretches the window's real span. Honest trend math on gappy feeds joins a date spine first, or chooses the calendar-true RANGE frame deliberately.",
      notes: [
        { choice: 0, why: "TEXT in the sort key is a separate problem (lexical order). The ROWS/RANGE fork bites on gaps and ties in the axis values." },
        { choice: 3, why: "They differ exactly when the ORDER BY value has ties or gaps — which dates always might. The distinction is semantics, not style." },
      ],
      difficulty: "hard",
    },
    {
      id: "wf-mcq-24",
      prompt: "Accounts whose billed amount exceeds THEIR MARKET's average — which rewrite drops the per-row correlated subquery?",
      choices: [
        "AVG(i.amount_cents) OVER (PARTITION BY c.region) compared to i.amount_cents",
        "MAX(amount_cents) GROUP BY region, filtered in WHERE",
        "Move the subquery into the SELECT list",
        "DISTINCT region, amount_cents",
      ],
      answer: 0,
      why: "The partition window computes each market's average once and keeps every row, so the comparison is column vs column in one pass. The correlated form re-runs the average per account — fine on 28 rows, wrong on ten million.",
      notes: [
        { choice: 2, why: "Still correlated — relocation isn't decorrelation. The fix computes the group average as its own column." },
        { choice: 1, why: "MAX collapses to one row per market; the accounts that should be flagged no longer exist in the output." },
      ],
      difficulty: "hard",
    },
    {
      id: "wf-mcq-25",
      prompt: "The exception list ends ORDER BY exposure_dollars DESC — exposure_dollars is a SELECT alias for ROUND(SUM(...)/100.0, 2). What does SQLite sort by?",
      choices: [
        "The raw SUM — aliases are invisible to ORDER BY",
        "The computed alias — ORDER BY runs after SELECT and sees output names",
        "Nothing — this errors",
        "The column position only",
      ],
      answer: 1,
      why: "ORDER BY is the last stage, so SELECT aliases are in scope — the sort follows the rounded, converted display value. WHERE and HAVING run earlier and cannot see those aliases; that asymmetry is the pipeline lesson.",
      notes: [
        { choice: 0, why: "That's the pipeline confusion in reverse: ORDER BY CAN see aliases — it's WHERE and HAVING that can't." },
        { choice: 3, why: "Positional ORDER BY 2 is legal too, but the query names the alias, and the alias is exactly what runs." },
      ],
      difficulty: "easy",
    },
    {
      id: "wf-mcq-26",
      prompt: "The card rail shows 16 settlement rows. Which expression counts the distinct ACCOUNTS behind them?",
      choices: [
        "COUNT(*)",
        "COUNT(i.customer_id)",
        "COUNT(DISTINCT i.customer_id)",
        "AVG(i.customer_id)",
      ],
      answer: 2,
      why: "COUNT(DISTINCT …) folds repeat settlements back to distinct borrowers — 16 money events, fewer people. The gap between the two counts is concentration: the intensity signal the exception review manages.",
      notes: [
        { choice: 1, why: "Without DISTINCT this equals COUNT(*) on a NOT NULL FK — events again, not people. The DISTINCT keyword IS the fold." },
        { choice: 3, why: "Averaging primary keys produces a number in no one's universe. Population counts are COUNTs, never AVGs." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-27",
      prompt: "Controllership wants a balance rollforward: opening balance plus the period's movements equals the closing balance. What's the query shape?",
      choices: [
        "SUM(debit_cents) − SUM(credit_cents) grouped by account — opening as the pre-period fold, closing as the cumulative one",
        "SELECT closing_balance FROM ledger_entries",
        "COUNT(*) of entries in the period",
        "MAX(debit_cents) per account",
      ],
      answer: 0,
      why: "A rollforward is two folds of the same movements: the pre-period delta is the opening, opening plus in-period delta is the closing — and the output row must reconcile: opening + movements − closing = 0. That identity is the evidence controllership signs.",
      notes: [
        { choice: 1, why: "There is no closing_balance column — balances are derived from movement folds. Any stored balance column is the thing the rollforward exists to verify." },
        { choice: 2, why: "A count of entries says nothing about money. The rollforward is a SUM identity, not an activity census." },
      ],
      difficulty: "medium",
    },
    {
      id: "wf-mcq-28",
      prompt: "The aging ladder's 1–30 bucket: which WHERE/ CASE boundary correctly catches an account EXACTLY 30 days past due?",
      choices: [
        "days_past > 30 AND days_past <= 60",
        "days_past >= 30 AND days_past < 60 in the 31-60 arm, with 1-30 as days_past >= 1 AND days_past < 30",
        "days_past >= 1 AND days_past <= 30 in the 1-30 arm — boundary values belong to the lower arm, with every arm [low, high) except the last",
        "It doesn't matter — buckets overlap by design",
      ],
      answer: 2,
      why: "The bucket rule is convention AND arithmetic: each arm catches its lower boundary and excludes its upper — 1-30 means >= 1 AND <= 30 here, 31-60 means >= 31 AND <= 60 — and every day lands in exactly one arm. A day in two buckets (or none) is an audit finding about the query.",
      notes: [
        { choice: 0, why: "That arm starts at 31 — an account exactly 30 days past due falls through entirely. The boundary value is the whole test." },
        { choice: 3, why: "Overlapping buckets double-count the book; gap-ing buckets lose accounts. Exhaustive and non-overlapping is the requirement, not a preference." },
      ],
      difficulty: "hard",
    },
    {
      id: "wf-mcq-29",
      prompt: "How many accounts are missing a risk attribute? risk_band is NULL on some rows. Which expression is the honest count?",
      choices: [
        "COUNT(*) FROM accounts",
        "COUNT(risk_band)",
        "COUNT(*) − COUNT(risk_band)",
        "SUM(risk_band)",
      ],
      answer: 2,
      why: "COUNT(*) counts every row; COUNT(risk_band) skips NULLs — their difference is exactly the missing-attribute population. The gap between the two counts is a data-quality read the audit runs before trusting any banding.",
      notes: [
        { choice: 1, why: "COUNT(risk_band) counts populated rows — the complement of what was asked. It's half of the subtraction, not the answer." },
        { choice: 3, why: "SUM over text bands coerces to 0 (or errors on numbers with meaning lost). Missingness is a COUNT question, never a SUM." },
      ],
      difficulty: "easy",
    },
    {
      id: "wf-mcq-30",
      prompt: "'The worst account per market' — why does ORDER BY days_past DESC LIMIT 6 answer it wrong, and what's the right shape?",
      choices: [
        "LIMIT is fine; ORDER BY needs an alias",
        "LIMIT cuts the whole result to 6 rows total, not per market — the per-group ask needs ROW_NUMBER() OVER (PARTITION BY market ORDER BY days_past DESC) kept where rn = 1",
        "LIMIT only works with DISTINCT",
        "You need GROUP BY market instead",
      ],
      answer: 1,
      why: "LIMIT applies once to the finished result — six rows overall, whatever the markets. The per-group ask is a partitioned ROW_NUMBER with a rn = 1 filter (in a second layer, since window output isn't visible to WHERE). And ties at the cut line make LIMIT's choice arbitrary besides.",
      notes: [
        { choice: 3, why: "GROUP BY market folds to one row per market but can't carry the worst ACCOUNT's identity — argmax needs a window or a join back." },
        { choice: 2, why: "LIMIT is orthogonal to DISTINCT. The failure is scope: one cut over the whole result, not one cut per group." },
      ],
      difficulty: "hard",
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
    {
      id: "cs-wellsfargo-3",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The ledger stack",
      brief:
        "Controllership brief on the storefront db: the close's first evidence page is the ledger stack — every account's entry count, debits and credits, with a labelled TOTAL row underneath so the page proves its own completeness. Probed facts: cash carries 27 entries (69,612 debited / 25,416 credited), accounts_receivable 26 (86,052 / 69,612), operating_expenses 14 (25,416 / 0), sales_revenue 13 (0 / 86,052) — and the TOTAL row reads 80 entries, 181,080 against 181,080, delta zero. The stack is one query: detail branch, set-op, total branch — and the set-op must concatenate, never dedupe, because the total row IS the completeness proof.",
      ask: "Return each ledger account with entry count, debit cents, and credit cents — plus a labelled TOTAL row for the whole ledger.",
      template:
        "SELECT account, COUNT(*) AS entries, SUM(debit_cents) AS debits, SUM(credit_cents) AS credits\nFROM ledger_entries\nGROUP BY account\n{1}\nSELECT {2}, COUNT(*), SUM(debit_cents), SUM(credit_cents)\nFROM ledger_entries\nORDER BY entries {3};",
      slots: [
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the stacker",
          why: "UNION ALL concatenates the TOTAL branch onto the account rows without a distinct pass — the honest stack for a page where every row belongs. EXCEPT would return only the detail rows (dropping the total the ask requires) and INTERSECT would return nothing.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The literal names the row that proves the stack complete — 80 entries, 181,080 against 181,080, delta zero. Any other label and the examiner's eye stops on an unaccountable row; 'CASH' would actively misfile the grand total as an account.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The evidence page leads with the busiest books: TOTAL (80), then cash (27), receivables (26). ASC would bury the detail under the quietest account and push the proof row down the page — a stack nobody reads in order.",
        },
      ],
      distractors: ["EXCEPT", "INTERSECT", "'CASH'", "ASC"],
      walkthrough:
        "Two branches, one stack, one proof. The detail branch folds the 80 ledger entries into four accounts — cash 27 (69,612 / 25,416), accounts_receivable 26 (86,052 / 69,612), operating_expenses 14 (25,416 / 0), sales_revenue 13 (0 / 86,052) — and the TOTAL branch re-scans the unfiltered ledger: 80 entries, 181,080 debits, 181,080 credits, the trial-balance identity printed as a row. UNION ALL is the join between grains — no dedupe, because if a detail row ever exactly equalled the TOTAL row, a bare UNION would silently delete it and the stack would undercount the very page proving completeness. ORDER BY entries DESC floats the TOTAL row (80) to the top, with cash and receivables next. Swap in EXCEPT and the total vanishes; INTERSECT empties the page; a wrong label and the grand row reads as a fifth account. The reviewer's check is the delta — 181,080 minus 181,080 is zero — and the stack hands it over in the same breath as the detail.",
    },
    {
      id: "cs-wellsfargo-4",
      tier: "medium",
      topic: "s7",
      universe: "month-close",
      title: "The one-row board read",
      brief:
        "Controllership brief on the storefront db: the board deck's first line is the whole book in one row — settled dollars, open-exposure dollars, the void count, and the total facility count — so the reader reconciles the split without scanning rows. Probed facts: 28 facilities; paid carries $66,443.00, open carries $19,609.00, exactly 1 facility is void (the anomaly #11, which received its $925.00 anyway). The shape is the CASE pivot: every status bucket becomes a column, every column folds from the same 28 rows, and the three buckets must reconcile to COUNT(*) on sight — 21 + 6 + 1 = 28.",
      ask: "Return one row: settled dollars, void count, open-exposure dollars, and total facilities (dollars at 2 decimals).",
      template:
        "SELECT ROUND(SUM(CASE WHEN i.status = {1} THEN i.amount_cents ELSE 0 END) / 100.0, 2) AS settled_dollars,\n       SUM(CASE WHEN i.status = {2} THEN 1 ELSE 0 END) AS void_count,\n       ROUND(SUM(CASE WHEN i.status = {3} THEN i.amount_cents ELSE 0 END) / 100.0, 2) AS open_dollars,\n       COUNT(*) AS facilities\nFROM invoices i;",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled-bucket flag",
          why: "The paid literal fills the settled arm — $66,443.00 of the book. 'open' here would swap the arms and print the exposure as the performance line, and an unquoted paid would be read as a column and error before the fold.",
        },
        {
          answer: "'void'",
          kind: "keyword",
          label: "the void-count flag",
          why: "The void literal fills the anomaly arm — exactly 1, the #11 row whose label and money disagree. 'paid' here would print 21 in the void column and the board line would claim twenty-one anomalies on a 28-row book.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the exposure-bucket flag",
          why: "The open literal fills the exposure arm — $19,609.00, the six live accounts. 'void' here would print the single anomaly's $925.00 as the exposure line, and 'closed' would zero a bucket the board reads every cycle.",
        },
      ],
      distractors: ["'void'", "'paid'", "MAX", "'closed'"],
      walkthrough:
        "One row, four columns, one proof. Each column is a CASE-gated fold over the same 28 invoice rows: the settled column sums cents only where status is paid (6,644,300 cents printing as 66443.0 after the once-at-display /100.0), the void column counts rows where status is void (1), the open column gates on 'open' (19609.0), and COUNT(*) carries the denominator (28) so the reader can reconcile — 21 + 6 + 1 = 28 — before trusting the split. This is the pivot idiom: statuses that would be rows in a GROUP BY become columns, because a board line must be one row whose parts visibly add up. The wrong literal is the whole failure: 'open' in the settled arm prints the exposure as performance — a bank reporting $19,609.00 of $66,443.00 — and 'paid' in the void arm turns one anomaly into twenty-one. MAX in a comparison position errors loudly, which at least beats the silent swap.",
    },
    {
      id: "cs-wellsfargo-5",
      tier: "hard",
      topic: "q2",
      universe: "month-close",
      title: "The reference-clock aging",
      brief:
        "Audit-analytics brief on the storefront db: the aging schedule ages every open account against ONE stamped reference date — the newest settlement in the feed (MAX(paid_on), 2025-02-10 on this book) — computed as a scalar subquery so the clock is derived, not hardcoded, and every rerun ages against the feed's own newest activity. Probed facts: three of the six open accounts are past due against that clock — #18 at $873.00 sitting 74 days past its 2024-11-28 due date, #21 at $1,295.00 at 31 days, #24 at $4,937.00 at 3 days — while #25, #26 and #27 are not yet due. The collections ladder reads worst-first, and the identity the reviewer checks: the past-due count plus the not-yet-due count equals the six open accounts.",
      ask: "Return each past-due open account: facility, billed dollars, and days past due against the feed's newest settlement, worst first.",
      template:
        "SELECT i.id AS facility,\n       i.amount_cents / 100.0 AS dollars,\n       CAST(julianday((SELECT {1}(paid_on) FROM payments)) - julianday(i.due_on) AS INT) AS days_past\nFROM invoices i\nWHERE i.status = {3}\n  AND julianday((SELECT MAX(paid_on) FROM payments)) > julianday(i.due_on)\nORDER BY days_past {2};",
      slots: [
        {
          answer: "MAX",
          kind: "keyword",
          label: "the stamped clock",
          why: "MAX(paid_on) is the newest settlement the feed can prove — the audit's reference date, so the ladder is reproducible from the data. MIN would age the book against the OLDEST payment and inflate every bucket; COUNT would hand julianday a row count and NULL every clock.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The collections ladder leads with #18 at 74 days past due, then 31, then 3. ASC would open with the 3-day account — a correct query telling collections to start at the bottom of the priority stack.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the live-exposure filter",
          why: "The open literal keeps the aging ladder to live exposure — the six accounts still owed. 'paid' would age the settled book (past its purpose), 'void' would admit the single voided facility into a collections ladder, and 'closed' matches no status at all: an empty report that looks like clean books.",
        },
      ],
      distractors: ["MIN", "COUNT", "ASC", "'paid'", "'void'"],
      walkthrough:
        "One clock, three past-due rows, one reproducible ladder. The scalar subquery (SELECT MAX(paid_on) FROM payments) derives the reference date from the feed itself — 2025-02-10 — and julianday(reference) − julianday(due_on) ages each open account in real days: #18 reads 74 (due 2024-11-28, $873.00 — the tail audit analytics owns), #21 reads 31, #24 reads 3; the WHERE arm keeps only accounts whose due date the clock has passed, so #25, #26 and #27 wait current. The identity ships with the query: 3 past-due + 3 not-yet-due = 6 open accounts, reconciling to the book's census. The scalar slot is the discipline: MIN ages against January 2024 and every account looks ancient; COUNT(paid_on) feeds the calendar a row count and julianday returns NULL — a ladder with no rungs. And ASC reorders the chase list so the freshest miss leads. Aging is only as honest as the clock it shares — this query stamps its clock in the open.",
    },
    {
      id: "cs-wellsfargo-6",
      tier: "medium",
      topic: "t6",
      universe: "month-close",
      title: "The running settlement walk",
      brief:
        "Finance-ops brief on the storefront db: the coverage walk is the audit narrative for the split-settled accounts — every settlement leg with the running settled total beside it, so a reviewer watches money accumulate and sees exactly where an account stalls. Probed facts: the watchlist is the five split accounts plus the partial — #1 walks 2430.00 → 4860.00, #5 2642.00 → 5284.00, #12 2361.50 → 4723.00, #19 2807.00 → 5614.00, #22 2229.50 → 4459.00, and #25 stalls at a single 4000.00 leg against its 6148.00 bill. Eleven legs in, ordered by account then date, with the running fold partitioned per account so no money leaks across the boundary.",
      ask: "Return the watchlist's settlement legs with a per-account running settled total (2 decimals), oldest leg first per account.",
      template:
        "SELECT invoice_id,\n       paid_on,\n       amount_cents / 100.0 AS leg_dollars,\n       SUM(amount_cents) OVER ({1} BY invoice_id ORDER BY paid_on {3}) / 100.0 AS settled_dollars\nFROM payments\nWHERE invoice_id IN (1, 5, 12, 19, 22, {2})\nORDER BY invoice_id, paid_on;",
      slots: [
        {
          answer: "PARTITION",
          kind: "keyword",
          label: "the per-account boundary",
          why: "PARTITION BY invoice_id restarts the accumulation at every account — #2's legs can never leak into #1's walk. The ORDER-only variant would run one global accumulator across all six accounts, and AVG BY isn't SQL at all.",
        },
        {
          answer: "25",
          kind: "number",
          label: "the partial account on the watchlist",
          why: "#25 is the walk's punchline: one 4000.00 leg, running total stuck 4000.00 short of its 6148.00 bill — the stall the chase list exists for. 26 would pull an unrelated single-leg account onto the page; 28 has no legs at all and changes nothing, which is precisely why it's the wrong watchlist.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-leg-first walk",
          why: "The window orders paid_on ascending so the walk starts at the account's first leg and accumulates chronologically — a walk an auditor can replay. DESC would accumulate newest-first and print the final total on the first row: the destination before the journey.",
        },
      ],
      distractors: ["ORDER", "AVG", "26", "DESC"],
      walkthrough:
        "Windows over the money, partitioned per account. The running fold is SUM(amount_cents) OVER (PARTITION BY invoice_id ORDER BY paid_on): each leg carries the accumulation of its own account's legs, oldest first — #1 reads 2430.00 then 4860.00, #22 reads 2229.50 then 4459.00 — and the partition boundary is what makes it an audit walk rather than one global pile of money. Eleven legs survive the watchlist filter, and the output tells the story the exception list can't: five accounts that reached their bills, and #25, whose walk stops at 4000.00 against 6148.00 — the partial the chase list carries. Drop the PARTITION and the walks merge into one running total across all six accounts — numerically valid, narratively useless, and the kind of shape a reviewer rejects on sight. The WHERE list is the definition of the watchlist itself: the five splits plus the partial, no more — adding #26 pads the page with an account that isn't short, and adding #28 (zero legs) proves the filter works while changing nothing, which is exactly the trap a reviewer sets.",
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
    { slug: "bank-account-summary-ii", why: "The two-sided account view — debits and credits per account with quiet ones kept: the statement fold controllership reads before any dashboard." },
    { slug: "account-balance", why: "Net movement per account in one conditional fold — the balance line under every rollforward: debits minus credits, tied or nothing ships." },
    { slug: "daily-balance-interest", why: "Interest off a day-weighted balance walk — the accrual arithmetic behind fee books and card APRs, where a missing day is mispriced money." },
    { slug: "loan-amortization-schedule", why: "Payment-by-payment principal/interest splits — the amortization walk retail lending runs on: running balance, per-period fold, tie to the schedule." },
    { slug: "prepayment-detection", why: "Balances retired ahead of the clock — the early-payoff hunt finance ops runs each cycle: who prepaid, and what it does to the yield line." },
    { slug: "loan-types", why: "Product-mix census with zero-buckets printed — accounts per product line, and the empty buckets a board deck must still show as zero." },
    { slug: "deferred-revenue", why: "Money received before it's earned — the deferral split that keeps cash and income honest: two ledgers, one recognition schedule." },
    { slug: "settlement-fails-aging", why: "T+2 aging over failed settlements — the ops read that turns a settlement exception into a day-counted worklist, aged against one clock." },
    { slug: "duplicate-charge-pairs", why: "Self-join on near-identical money events — the duplicate-leg hunt: two hits, same account, same day, one of them shouldn't exist." },
    { slug: "suspicious-bank-account-transactions", why: "Rule-based exception lists from raw money events — the fraud-and-audit loop: define suspicious, filter, and defend every surviving row." },
    { slug: "structuring-detection", why: "Amounts patterned just under a threshold — the classic AML screen: bins that pile up below a reporting line are CASE arms with stakes." },
    { slug: "transaction-velocity", why: "Hits per account per window — the intensity read behind the exception review: settlements per account, two grains from one fold." },
    { slug: "maximum-transaction-each-day", why: "Argmax per day — the peak-event read ops calendars live on: the day's largest movement, per month, ties handled." },
    { slug: "null-blank-audit", why: "Mixed NULL/blank sentinel cleanup — the attribute-completeness sweep: risk fields that are NULL, empty, or 'N/A' are three names for one finding." },
    { slug: "change-null-values-in-a-table-to-the-previous-value", why: "Last-observation-carried-forward — the sparse-feed fill audit analytics runs before trusting any balance series: fill deliberately, disclose the fill." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER dedupe keeping the latest row — the statement-cycle fold: one account, many cycles, only the current state counts." },
  ],
};
