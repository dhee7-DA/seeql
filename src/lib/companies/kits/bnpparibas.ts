// BNP Paribas — Wave-8 (Task 96), banking domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Europe's universal bank, read the way its control functions read it: CIB trading
// desks book client flows that must settle on a rail, the retail networks (BNP Paribas
// Fortis, the Bank of the West heritage) feed the same payment rails, and Securities
// Services custody watches every leg land. The storefront db maps on honestly: orders
// are booked client flows (REAL dollars — the one table where money is already
// dollars), customers are counterparties assigned to four booking corridors (EU / US /
// APAC / LATAM), order_items are the instrument legs on each flow (quantity = units,
// unit_price = strike/price), shipped_at is the value-date settlement stamp, invoices
// are trade-finance and fee receivables on a flat 30-day documentary tenor, payments
// are settlement legs (method card = the local instant-clearing rail, wire = the
// cross-border SWIFT/SEPA rail), expenses are desk-and-network opex lines,
// ledger_entries is the double-entry book of record. Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is always
// amount_cents / 100.0. Pool provenance: BNP Paribas has 0 tagged sql rows in the band
// (checked company-pools.md for bnpparibas / BNP variants) — every topic and problem
// slug is theme-curated from the pools file's theme menu to the question families its
// screens are known for (corridor folds, settlement-fail watches, T+2 clock math,
// regulatory month spines, books of record), provenance stated per topic and per
// problem. Case figures: scripts/company-facts.md (probed 2026-10-12); every case slot
// is mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const bnpparibasKit: CompanyKit = {
  id: "bnpparibas",
  domainId: "banking",
  name: "BNP Paribas",
  tagline: "Europe's universal bank, desk to ledger",
  accent: "text-green-300",

  brief: [
    "**BNP Paribas** is Europe's universal bank — a group that runs French retail, BNP Paribas Fortis in Belgium, the Bank of the West heritage in the US, and a Corporate & Institutional Banking arm whose trading desks, FX franchise and trade-finance books move money for clients in every time zone. The through-line for an analyst: a flow booked by a desk is not money moved until it settles on a rail and posts to the book. This kit maps the storefront db onto that world: the 16 customers rows are counterparties across four booking corridors, the 103 orders are booked client flows worth **34,833.28**, and the 251 order_items rows are instrument legs — quantity = units, unit_price = strike price. The status map is fixed: delivered = {emerald:settled} (52, 50.5%), shipped = {sky:in flight} (30, 29.1%), pending = awaiting affirmation (14), cancelled = {rose:busted} (7, 6.8%).",
    "The data org splits into desk analytics, credit-and-collections and the finance control functions, and all three read the same spine at different grains. A flow books at created_at and stamps `shipped_at` on value date — **82 of 103 flows** carry the stamp, averaging 2.98 days booked-to-settled inside a 2–4 day band, which is the desk's {amber:T+2 clock} with real drift. Money sits one layer down: receivables, settlement legs and the ledger carry INTEGER cents, so every dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of booked value sits with counterparties whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost mandate moves a quarter.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain corridor census** — the EU book runs 45 flows from 8 counterparties while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud — 'do pending flows sit in your base?' — then into the {sky:settlement-fail watchlist}: an anti-join over invoices and settlement legs that reads **6 never-collected receivables worth 15,217**, one of which (#28, 1,756.00) claims `status = 'paid'` with zero legs. Late rounds walk the book of record — the trial balance must read **181,080 against 181,080**, delta zero — and probe the first row of a LAG walk over the 14-month flow spine (2024-01 to 2025-02).",
    "Preparation strategy: the pools file carries no BNP Paribas section — **0 tagged LC** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: corridor censuses, fail watches, T+2 clock math, CASE tenor-and-coverage ladders and the cents-safe ledger spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {amber:settlement clock} the desk COO opens with, the other rebuilds the {violet:paid-status control} the finance function runs at every close. The bar to clear: *state the denominator, the units and the reference date before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the settlement-fail refresh. A desk analyst opens the flow dashboard before the corridor call: did overnight bookings affirm, did any in-flight flow miss its value date, does the one-pass status census reconcile — 52 settled + 30 in flight + 14 pending + 7 busted = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a footnote. If the {amber:T+2 clock} drifts off the **2.98-day** norm — the US book averages 3.07 against APAC's 2.93 — the affirmation queue gets pulled before the morning risk pack ships.",
    "**11:30 —** Midday is the corridor read. The desk head wants flows per corridor beside counterparty counts (EU 45-from-8 versus US 19-from-2) and the client ladder with the four-way tie at 4 flows handled honestly — shared rungs, named tie-break; the coverage pod wants the concentration re-cut, {rose:63.5% of booked value} from 3,000-plus counterparties. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the control review*.",
    "**15:45 —** The afternoon tilts toward the books. The receivables anti-join refreshes first — **6 never-collected worth 15,217** — before collections sends a single reminder; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled receivable (#11, 925.00) and a paid-status receivable with zero settlement legs (#28, 1,756.00). The day ends the way every close does: the {violet:trial balance} must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Settled-flow rate", what: "Flows with a value-date stamp ÷ all flows booked: 82 of 103. The top-of-morning number the desks read — the 14 pending rows are 'not yet affirmed', never a silent zero." },
    { name: "T+2 settlement lag", what: "Booked-to-settled (created_at → shipped_at) over stamped flows only: 2.98-day average, 2–4 day band. The population definition ships with the number — unstamped flows have no cycle yet and must not dilute it." },
    { name: "Kept-flow rate", what: "Settled-and-confirmed (delivered) ÷ ALL flows booked: 52 of 103 (50.5%). A conditional count where the denominator — in-flight and pending included — is the whole interview." },
    { name: "Busted-trade share", what: "Cancelled share of booked flows: 7 of 103 (6.8%), sliced by corridor — APAC 8.1%, EU 6.7%, US 5.3%. The break map that drives the affirmation and repair queues." },
    { name: "Corridor intensity", what: "Flows per counterparty at two grains: EU runs 45 flows from 8 counterparties while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — load versus coverage." },
    { name: "Client concentration", what: "Share of booked value from counterparties spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs coverage teams and sizes the mandate-review committee." },
    { name: "Collections coverage", what: "Booked versus collected on receivables: 21 exact (65,612), 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the finance function refreshes every close." },
    { name: "Book of record", what: "Ledger trial balance: 181,080 debits against 181,080 credits, delta zero. Rails beneath it: card legs 16 for 37,364, wire legs 11 for 32,248 — the instant rail and the cross-border rail." },
  ],

  topics: [
    {
      name: "Settled-vs-booked censuses",
      why: "Every BNP screen opens with the funnel: flows booked, value-date stamped, settled and confirmed. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight flow 'settled' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain corridor folds",
      why: "Flows and counterparties are different grains of the same join, and every corridor census here reports both: the EU book runs 45 flows from 8 counterparties while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Counterparty joins & survival",
      why: "Counterparties carry corridor and onboarding date; flows inherit them through joins, and the join type decides who survives. A flow without a counterparty is corruption; a counterparty without flows is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "sales-analysis-ii"],
    },
    {
      name: "Settlement-fail anti-joins",
      why: "The fail watchlist is an anti-join: receivables LEFT JOINed to settlement legs, kept only when the leg never lands — 6 never-collected worth 15,217 on this db. Writing it with NOT IN over an unguarded column empties the watchlist silently, which is how a control function ships a false all-clear.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "find-churn-risk-customers"],
    },
    {
      name: "Client-book leaderboards",
      why: "Coverage reviews rank counterparties by flow count where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5, then FOUR counterparties tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer coverage, not syntax.",
      slugs: ["rank-scores", "top-earners", "find-the-team-size"],
    },
    {
      name: "The T+2 settlement clock",
      why: "Settlement lag is julianday(shipped_at) - julianday(created_at) over stamped flows: 2.98 days average inside a 2–4 band, 3.07 in the US against 2.93 in APAC. Duration math over two timestamps — with the unstamped 21 rows excluded by a stated filter, never silently skipped.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Regulatory month spines",
      why: "Regulatory and management reporting bucket the 14-month flow spine (2024-01 to 2025-02) by SUBSTR(created_at, 1, 7) — the trough month reads 1,193.86 against an opening 3,731.97. LAG and LEAD walk it; the wrong '%m' bucket merges Januaries two years apart and the pack mis-files.",
      slugs: ["monthly-transactions-i", "biggest-window-between-events", "the-latest-login-in-2020"],
    },
    {
      name: "CASE ladders: tenor, coverage, delinquency",
      why: "Banking classifications are CASE ladders — 30-day documentary tenor versus aging buckets, exact versus partial versus no settlement. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the provision, and a reordered WHEN quietly re-buckets the exposure.",
      slugs: ["delinquency-buckets", "loan-types", "weather-type-in-each-country"],
    },
    {
      name: "Books of record & cents discipline",
      why: "Status is a claim; the settlement legs and the ledger are evidence. Receivables and legs carry INTEGER cents — the dollar read is amount_cents / 100.0 — and the trial balance must land 181,080 against 181,080, delta zero. Reconciliation queries are how a universal bank proves the close.",
      slugs: ["trial-balance-check", "gl-reconciliation", "bank-account-summary-ii"],
    },
    {
      name: "Threshold gates & nested folds",
      why: "Screens escalate into staging: fold flow counts per counterparty, then judge them against a computed book average, or gate corridors by a floor. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted — a control that returns nothing must say why.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "second-highest-salary"],
    },
  ],

  theory: [
    {
      id: "bnpparibas-t1",
      q: "Your flow report joins counterparties to bookings. When do you INNER and when do you LEFT — and what silently breaks if you filter a status column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A settled-value report joins flows to counterparties: a flow with no counterparty row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from counterparties: the counterparties with no flows ARE the answer, arriving with NULL flow columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload counterparty row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the never-booked anti-join returns a confident zero — all 16 counterparties appear in the flow table somewhere — and proving that zero is itself the control function's job, not an assumption to skip.",
      tag: "joins",
    },
    {
      id: "bnpparibas-t2",
      q: "The client ladder runs 24, 17, 14, 13, 5 flows, then FOUR counterparties tied at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — here the four-way tie at 4 consumes ranks 6 through 9, and the next distinct count (3) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose coverage team gets the relationship next. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer counterparties (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "bnpparibas-t3",
      q: "The census shows 103 booked flows and 16 counterparties; the EU corridor shows 45 flows and 8 counterparties. Why do the two columns disagree, and what does each mean to the desk?",
      a: "They disagree because they count at different grains. COUNT(*) counts flow rows after the join — one row per flow, so a counterparty with 24 booked flows contributes 24. COUNT(DISTINCT customer_id) folds those rows back to counterparties — the EU's 45 flows collapse to 8 mandates. Neither is wrong: flows measure desk load and client activity, counterparties measure installed relationships and coverage. The comparison — 45-from-8 in the EU against 19-from-2 in the US — is the intensity signal that decides whether the franchise is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for instrument legs and COUNT(*) silently counts legs, not flows — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "bnpparibas-t4",
      q: "shipped_at is NULL until a flow settles. What is your policy for the T+2 settlement report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only settled flows have a lag, so the report measures booked-to-settled for the 82 of 103 flows that carry the stamp — averaging 2.98 days inside a 2–4 band — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL flows returns the settled-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 busted rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average — that invents same-day settlement for flows that never affirmed. A report whose WHERE clause is doing definitional work without saying so is exactly what a BNP control reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "bnpparibas-t5",
      q: "The corridor pack wants settled value per corridor for corridors carrying at least ten booked flows. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, pending and busted rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-flow floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this book the floor admits the EU (45), APAC (37) and US (19) corridors and drops LATAM's 2 — a real cut, not a decoration. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a regulatory line and an error, and between a threshold applied to flows versus to value. The strong answer places every filter by asking: is this a fact about one flow, or about a corridor?",
      tag: "pipeline",
    },
    {
      id: "bnpparibas-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average monitor silently returns nothing while looking valid. On the full book that is theoretical: 103 flows always produce a mean (338.19 average ticket against a 25.47 to 1,088.44 spread). On filtered staging books — one corridor, one status, one month — the empty-inner-query bug ships regularly, and a surveillance threshold is exactly where it hides: an empty monitor reads as 'no oversized flows', which is a false all-clear a regulator would call a control failure. The correlated cousin (compare each flow to ITS corridor's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "bnpparibas-t7",
      q: "The regulatory pack buckets flows by month on TEXT timestamps and computes tenor from issue to due date. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the pack mis-files. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when desks push flow. Tenor: julianday(due_on) - julianday(issued_on), which on the receivables book is a flat 30-day documentary window — every invoice, min and max both 30 — so any other value is a feed defect, not a business fact. The LAG: on a month-ordered spine the first row's prior value is NULL — the baseline, never a zero; coalescing it to zero reads as a crash month and trips the trend review.",
      tag: "dates",
    },
    {
      id: "bnpparibas-t8",
      q: "Finance says a receivable is 'paid' but the settlement-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 receivables worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void receivable WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage split must read 21 exact (65,612) / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship. The money rule: receivables and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 175,600 and ships a hundredfold error to the regulator.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "bnpparibas-mcq-1",
      prompt: "A booked flow's status reads 'delivered'. In this kit's BNP stage map, what happened?",
      choices: ["Settled and confirmed — the flow completed and counts as kept", "In flight — affirmed, not yet final", "Busted — cancelled before value date", "Awaiting affirmation — settlement pending"],
      answer: 0,
      why: "The stage map is fixed: delivered = settled (52 of 103 flows, 50.5%). It is the only status where the flow has actually completed its life.",
      notes: [
        { choice: 1, why: "In flight is 'shipped' — 30 flows affirmed and moving but not final. Calling them settled inflates the kept rate before a single flow completes." },
        { choice: 3, why: "Awaiting affirmation is 'pending' — 14 flows with no value-date stamp yet. Pending is not busted and not kept; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "bnpparibas-mcq-2",
      prompt: "The T+2 clock averages 2.98 days. Over which population? The db holds 82 stamped flows, 14 pending and 7 busted of 103 booked.",
      choices: ["Stamped flows only (82 rows) — unstamped have no lag", "All booked flows (103) with NULLs counted as zero days", "Settled flows only (52 rows)", "Distinct counterparties (16 rows)"],
      answer: 0,
      why: "Only the 82 flows carrying shipped_at have a booked-to-settled lag. AVG ignores NULLs, so the unrestricted average coincidentally matches — but the population must be stated: 82 of 103, pending and busted excluded by definition.",
      notes: [
        { choice: 1, why: "NULLs are not zeros. Counting them as 0 days would drag the average down (2.98 × 82/103 ≈ 2.37), not preserve it — and the unrestricted AVG matching 2.98 is exactly the silent-shrink trap." },
        { choice: 2, why: "52/82 mixes two funnel steps — delivered is final confirmation, shipped_at is the value-date stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "bnpparibas-mcq-3",
      prompt: "The EU corridor carries 45 flows from 8 counterparties. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts flow rows (45); COUNT(DISTINCT customer_id) folds repeats back to counterparties (8). The gap between them is the corridor's intensity read — load versus coverage.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every flow has a counterparty. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts corridors, not counterparties — a third grain nobody asked for. The census is flows AND mandates." },
      ],
      difficulty: "easy",
    },
    {
      id: "bnpparibas-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) per corridor — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to busted flows only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the busted share truncates toward 0 and every corridor reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1% and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the break map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-5",
      prompt: "Keep only corridors carrying at least 10 booked flows. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY corridor HAVING COUNT(*) >= 10", "WHERE flows >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A flow-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this book the floor admits EU (45), APAC (37) and US (19) and drops LATAM's 2.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'flows' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-6",
      prompt: "The client ladder runs 24, 17, 14, 13, 5 flows, then FOUR counterparties tied at 4. Under RANK, what rank do the two 3-flow counterparties carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-flow counterparties share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The pack's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-7",
      prompt: "The wire rail settles 11 legs totalling 32,248 dollars. The column is INTEGER cents. Which read prints the dollar figure the pack quotes?",
      choices: ["SUM(amount_cents) — cents are already dollars if you label the column right", "ROUND(SUM(amount_cents) / 100.0, 2)", "SUM(amount_cents) * 100.0", "CAST(SUM(amount_cents) AS TEXT)"],
      answer: 1,
      why: "The money rule is absolute on this db: invoices, payments, expenses and the ledger carry INTEGER cents, so the dollar read is amount_cents / 100.0 — the wire rail's 32,248 dollars only prints correctly through the divisor.",
      notes: [
        { choice: 0, why: "Summing cents and relabeling the column prints 3,224,800 as 'dollars' — a hundredfold error dressed as a unit convention. The eye never catches it." },
        { choice: 2, why: "Multiplying by 100 goes the wrong way — the rail reads 3,224,800.00. The divisor and the direction both matter." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-8",
      prompt: "A fail-watchlist uses invoice_id NOT IN (SELECT invoice_id FROM settlement_legs WHERE value_date <= today) and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole watchlist silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the watchlist empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded. A false all-clear on a fail watchlist is a control failure, not a bug.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db the AR anti-join legitimately returns 6. But staging books are exactly where NULLs sneak in, and empty watchlists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "bnpparibas-mcq-9",
      prompt: "A regulatory packet stacks settled flows under in-flight flows per corridor, built with UNION. A reviewer says one corridor's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same corridor, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same corridor, same counts, no branch label — collapse into one, and the packet loses a corridor with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "bnpparibas-mcq-10",
      prompt: "A dashboard walks settled value flow by flow: SUM(total) OVER (ORDER BY value_date). Two flows share a value date, and the cumulative 'jumps two flows at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict flow-by-flow walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on value_date join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly flow by flow. On a month spine ties are rare; at settlement grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-bnpparibas-1",
      tier: "easy",
      topic: "t3",
      universe: "funnel",
      title: "The T+2 settlement clock",
      brief:
        "BNP-flavored brief on the storefront db: settlement ops opens every morning with the T+2 clock — how many booked flows have actually settled, how long booked-to-value-date takes, and the fastest and slowest legs on the book. Ops is explicit that the lag average is computed over stamped flows only, with the population stated on the slide. Probed facts: 103 flows booked worth 34,833.28; 82 carry the settlement stamp (52 settled + 30 in flight), averaging 2.98 days with a 2–4 day band; the 14 pending and 7 busted carry none. The corridor cuts read US 3.07 days, LATAM 3.5, EU 2.94, APAC 2.93.",
      ask: "Return the settled-flow count, the average booked-to-settled lag to 2 decimals, and the fastest and slowest lags, one row.",
      template:
        "SELECT COUNT(*) AS settled_flows,\n       ROUND(AVG(julianday(shipped_at) {1} julianday(created_at)), {2}) AS avg_lag_days,\n       MIN(julianday(shipped_at) - julianday(created_at)) AS fastest_lag,\n       MAX(julianday(shipped_at) - julianday(created_at)) AS slowest_lag\nFROM orders\nWHERE shipped_at IS {3} NULL;",
      slots: [
        {
          answer: "-",
          kind: "keyword",
          label: "the lag direction",
          why: "Settlement lag is value date minus booking: julianday(shipped_at) - julianday(created_at), a positive day count. The '+' chip adds two epoch-day counts into a ~4.9-million nonsense cell, and '=' folds the pair into a 0/1 flag that collapses the average to 0.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the lag precision",
          why: "The clock prints at 2 decimals — 2.98 is the number the morning deck quotes. ROUND(…, 1) prints 3 and the T+2 story rounds away its own drift between corridors sitting at 2.93 and 3.07.",
        },
        {
          answer: "NOT",
          kind: "keyword",
          label: "the settlement-stamp guard",
          why: "shipped_at IS NOT NULL keeps only the 82 stamped flows — the 14 pending and 7 busted have no value date and no lag to average. Dropping NOT flips the filter to IS NULL and the clock suddenly reads the 21 unstamped rows as a row of NULLs.",
        },
      ],
      distractors: ["+", "1", "="],
      walkthrough:
        "One table, one filter, four cells. The WHERE keeps only flows with a value-date stamp — 82 of the 103 booked — and the three folds read straight off the probed clock: COUNT(*) prints the settled population 82, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) prints the 2.98-day average, and MIN/MAX print the 2–4 day band. The 14 pending and 7 busted never enter: no stamp, no settlement cycle, no lag — a population definition, not a cleanup job. The distractors fail honestly: '+' sums two epoch-day counts into a ~4.9-million cell and the deck reads fiction; '=' compares the timestamps instead of subtracting them, so every row is false and the average collapses to 0; precision 1 rounds 2.98 to 3 and the corridor drift (2.93 versus 3.07) vanishes; dropping NOT flips the census to the 21 unstamped rows. The corridor cuts on the slide — US 3.07, LATAM 3.5, EU 2.94, APAC 2.93 — all fold up into this one 2.98 number, which is why the population line sits on the slide: an unstated filter here silently re-reads a different book.",
    },
    {
      id: "cs-bnpparibas-2",
      tier: "medium",
      topic: "j4",
      universe: "month-close",
      title: "The paid-status that never settled",
      brief:
        "BNP-flavored brief on the storefront db: the finance control function closes the month by reconciling status claims against settlement legs — on this book the legs are the ledger of record and the status column is a claim. Probed facts: 28 receivables on a flat 30-day documentary tenor — 21 paid-status worth 66,443, 6 open worth 19,609, 1 void worth 925; the AR anti-join reads 6 never-collected worth 15,217; coverage splits 21 exact (65,612) / 1 partial (#25 at 4,000 of 6,148) / 6 none. One anomaly is verified row-level: receivable #28 books 1,756.00, claims status 'paid', and has zero settlement legs. The control returns exactly that row.",
      ask: "Return the paid-status receivable with no settlement legs: its id, status, leg count, booked amount in dollars and its tenor in days.",
      template:
        "SELECT i.id AS invoice_id,\n       i.status,\n       COUNT(p.id) AS settlement_legs,\n       ROUND(i.amount_cents / {1}, 2) AS booked_amount,\n       julianday(i.due_on) - julianday(i.issued_on) AS tenor_days\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE i.status = {3}\n  AND p.id {4} NULL\n  AND (julianday(i.due_on) - julianday(i.issued_on)) = {5}\nGROUP BY i.id, i.status, i.amount_cents;",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the dollar read",
          why: "Receivables carry INTEGER cents, so the dollar print is amount_cents / 100.0 — 1,756.00 on #28. The '1' chip ships a 100× error (175,600.00) and '60' mangles it to 2,926.00; both are exactly the class of error a close review is built to catch.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the leg-keeping join",
          why: "LEFT JOIN keeps #28 with a NULL leg payload so the IS NULL guard can catch it. INNER deletes every unmatched receivable — the very row this control exists to find — and RIGHT JOIN keeps the legs instead, also returning nothing.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the status literal",
          why: "The hunt is for the paid-status lie. 'open' returns the five genuinely open receivables that never settled — a real watchlist, but a different one — and proves the status literal is doing the definitional work in this control.",
        },
        {
          answer: "IS",
          kind: "keyword",
          label: "the no-legs guard",
          why: "p.id IS NULL is the anti-join test that isolates receivables no leg ever touched. p.id = NULL is never true — three-valued logic, not a typo — so the '=' chip silently empties the control and a false all-clear ships.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the tenor pin",
          why: "Every receivable on this book carries the flat 30-day documentary tenor — the probed window reads avg 30, min 30, max 30 across all 28 — so the control pins it: #28's tenor reads 30, and any other value in the slot means the billing feed is corrupt, not the credit.",
        },
      ],
      distractors: ["INNER", "RIGHT", "'open'", "=", "1", "60"],
      walkthrough:
        "One LEFT JOIN, one anti-join guard, one row of evidence. The join attaches settlement legs to receivables; the WHERE keeps paid-status rows whose leg payload is NULL — and on this book exactly one row survives: #28, booked 1,756.00, marked 'paid', COUNT(p.id) = 0, tenor pinned at the flat 30-day documentary window. It is one of the 6 never-collected receivables worth 15,217, but the other five are honestly 'open' — #28 is the status that lies, which is why legs are the ledger of record. The mirror anomaly sits the other way: void receivable #11 at 925.00 carries a settlement leg and never appears in this watchlist at all. The distractors fail honestly: INNER and RIGHT both delete the unmatched-left row and the control returns nothing — a false all-clear; 'open' returns the five legitimately open receivables — a different watchlist wearing the same query; '=' in the guard is three-valued logic and empties the result; the divisor chips mangle the dollar print (1 and 60 give 175,600.00 and 2,926.00); and a tenor of 60 means the billing feed changed, not the credit. The control's output reconciles upward: 21 exact for 65,612, one partial at 4,000 of 6,148, and this row — the paid-status that never settled.",
    },
  ],

  problems: [
    { slug: "settlement-fails-aging", why: "The fail ladder is settlement ops' morning artifact: unmatched flows bucketed by days-past-value-date. BNP runs exactly this aging cut over Securities Services custody books every day." },
    { slug: "ar-aging-schedule", why: "The receivables aging schedule is the trade-finance credit review: 30-day documentary tenor, then bucket everything past it. Same shape as the 0–30 / 31–60 / 61–90 wall the coverage pod ships at close." },
    { slug: "structuring-detection", why: "Ticket-splitting surveillance guards the rails: flows chopped under a reporting threshold. The HAVING-guard pattern is how the financial-crime desk screens booked flow before it settles." },
    { slug: "expected-credit-loss", why: "Provisioning weights exposure by bucket — the coverage pod's ECL read multiplies receivable value by stage weights, exactly this weighted fold, before it hits the ledger." },
    { slug: "fx-exposure-report", why: "The FX desk values open exposure at the latest rate per pair — a latest-row join over the rate spine, the same shape the Paris book uses to re-mark overnight positions." },
    { slug: "suspicious-bank-account-transactions", why: "A 7-day sliding window over one counterparty's activity is the transaction-monitoring primitive — burst detection over the flow spine before anything posts." },
    { slug: "balance-rollforward", why: "The close proves opening balance plus movements equals closing balance, account by account. BNP's ledger control runs this rollforward over the 181,080 trial balance every month." },
    { slug: "journal-gap-detection", why: "A missing journal sequence number is an audit finding before it is a bug. Gap detection over entry keys is how the book of record stays provably complete." },
    { slug: "daily-balance-interest", why: "Deposit books accrue on end-of-day balances across a date spine — the retail networks' interest engine is exactly this daily-balance walk over a continuous calendar." },
    { slug: "amount-anomaly-zscore", why: "The surveillance desk flags legs that deviate from the counterparty's own norm — z-scores over ticket size, the statistical first pass before any manual review." },
    { slug: "duplicate-charge-pairs", why: "Two settlement legs for one receivable is a double-pay and a clawback. Pairwise matching on amount and proximity is how payments ops finds them before the counterparty does." },
    { slug: "vintage-default-curves", why: "Credit watches origination cohorts over age, not calendar time — vintage curves on the receivables book show whether this year's documentary lending is deteriorating." },
    { slug: "keep-latest-dedupe", why: "Feeds re-deliver booking rows after cutoff; the desk reads only the latest version. ROW_NUMBER dedupe on event key is the standard ingestion guard here." },
    { slug: "snapshot-delta-detect", why: "Two corridor snapshots must reconcile — FULL OUTER JOIN with a delta column finds the positions that appeared, vanished or changed, the daily position-keeping break hunt." },
    { slug: "point-in-time-asof", why: "Counterparty records change (corridor moves, limit updates) and old reports must be reproducible — the as-of join pins every flow to the record version valid on its value date." },
    { slug: "wash-trade-detection", why: "Market-conduct surveillance pairs offsetting flows from the same counterparty — the wash-trade pattern match the CIB runs over booked flow to keep the desk clean." },
  ],
};
