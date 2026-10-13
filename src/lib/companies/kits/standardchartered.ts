// Standard Chartered — Wave-8 (Task 96), banking domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Trade-and-transaction-banking SQL: the storefront db read as a corridor
// sandbox — customers are institutional clients (region = corridor), orders are
// booked trade transactions (delivered = settled to final, shipped = released
// and in flight with shipped_at as the release stamp, pending = awaiting
// documents, cancelled = rejected), order_items are cargo lines under cover of
// each instrument (quantity = units, unit_price = unit value), products are the
// goods SKUs moving through the corridors, suppliers are exporter
// counterparties, invoices/payments are the fee-billing and settlement books in
// INTEGER cents (dollar read = amount_cents / 100.0), ledger_entries are the
// double-entry core. Status funnels with stated denominators, two-grain
// corridor censuses, counterparty exposure ladders, the 14-month transaction
// spine, and the cents-safe billing tables that sit under "billed". Pool
// provenance: company-pools.md carries NO Standard Chartered section — 0 tagged
// rows — so all 10 topic slug sets and all 16 problems are theme-curated from
// the pools file's theme menu and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12); every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts.
// Case ids use the bank's real-world shorthand (cs-stanchart-N) because the
// audit's id grammar caps the company segment at 12 chars (same convention
// that makes Morgan Stanley cs-ms-N); "standardchartered" is 17.

import type { CompanyKit } from "../types";

export const standardcharteredKit: CompanyKit = {
  id: "standardchartered",
  domainId: "banking",
  name: "Standard Chartered",
  tagline: "Asia-Africa corridors, trade to treasury",
  accent: "text-lime-300",

  brief: [
    "**Standard Chartered** is the London-headquartered trade bank whose whole franchise is the corridor map running from **Asia through Africa and the Middle East** into the dollar clearing centers — financing cargo, moving remittances and running treasury for corporate clients that book in one market and settle in another. Transaction banking is the engine room: *the Straight2Bank platform* carries letters of credit, documentary collections and cross-border payments, and every one of those instruments lives or dies on status discipline. This kit maps the storefront db onto that world: the 16 customers rows are institutional clients, the 103 orders are booked trade transactions worth **34,833.28**, the 251 order_items rows are cargo lines under cover of those instruments (quantity = units, unit_price = unit value), and the 6 suppliers rows are exporter counterparties across the corridors.",
    "The status map is the bank's daily heartbeat: delivered = {emerald:settled to final} (52 of 103, 50.5%), shipped = released and in flight (30, 29.1%), pending = awaiting documents (14, 13.6%), cancelled = {rose:rejected} (7, 6.8%). A transaction books at created_at and shipped_at is stamped the day the instrument is released — **82 of 103** carry the stamp, averaging **2.98 days** to release with a 2–4 day spread, and the 14 pending rows have none yet (a population definition, not a cleanup job). Money is bank-grade: fee invoices and settlements land as INTEGER cents, so every dollar read is `amount_cents / 100.0` — the AR book's never-collected 15,217 only exists after that division.",
    "The data org splits into corridor desks, transaction-banking ops and a finance-analytics pod that owns the close. Screens are census-then-denominator: open with the **two-grain corridor read** — EU runs 45 transactions from 8 clients while the US runs 19 from 2 — then escalate into a rate and ask the denominator out loud (*'does a rejected instruction count in your base?'*), then into the status census where {emerald:52 + 30 + 14 + 7 must reconcile to 103 by construction}. Concentration is the third story: **63.5%** of the book sits with clients whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost treasury mandate moves a quarter.",
    "Preparation strategy: the pools file carries no Standard Chartered section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to the bank's known screens: status funnels with stated denominators, two-grain corridor censuses, counterparty exposure ladders, CASE-banded coverage splits and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {sky:trusted-bench exposure read} credit runs before it adds a counterparty line, the other rebuilds the {emerald:corridor status census} transaction-banking ops opens every morning with. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, because in correspondent banking a number that cannot be tied is a number that does not exist.",
  ],

  dayInLife: [
    "**09:30 —** The day opens on the corridor boards before the Asia book closes. First check is the one-pass status census: did overnight bookings land, and does the split reconcile — 52 settled + 30 in-flight + 14 awaiting documents + 7 rejected = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. Then the release clock: if `shipped_at` latency drifts off the **2.98-day** norm, the document-chase queue gets pulled before the treasury desk's morning pricing call.",
    "**12:30 —** Midday is the exposure and collections block. Credit wants the counterparty ladder re-cut — {sky:Nordic Gadgets AB} carries **11,130.25** of financed cargo, a 32% share of the whole book — and any name drifting toward a third of the book is a concentration conversation. The AR pod wants the dunning draft: **6 never-collected invoices worth 15,217**, plus the one partial (4,000 of 6,148 settled) that needs a payment plan rather than a reminder. Each read is a join, a conditional aggregate and one stated denominator — the analyst writes the query twice, *once to answer and once with the definition spelled out so it survives the credit-committee argument*.",
    "**16:30 —** The afternoon tilts toward the close. The fee-invoice coverage split refreshes first — **21 exact, 1 partial** (4,000 of 6,148), 6 never collected — then the anomaly walk, line by line: a voided invoice that still received its 925.00 settlement (#11) and a paid-status invoice with zero settlement rows (#28, 1,756.00) both get tickets, because payment rows are the ledger of record and {rose:statuses lie}. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Corridor throughput", what: "Trade transactions booked per period across the corridor network: 103 worth 34,833.28, split EU 45 / APAC 37 / US 19 / LATAM 2. The top-line the transaction-banking board reads every Monday." },
    { name: "Settlement rate", what: "Delivered ÷ ALL transactions booked: 52 of 103 (50.5%). 'Settled to final' is a status-filtered conditional count, and the denominator — in-flight and awaiting-docs included — is the whole interview." },
    { name: "In-flight pipeline", what: "Released but not final: 30 transactions (29.1%) plus 14 awaiting documents (13.6%). The working inventory of the ops floor — where document chases and client follow-ups live." },
    { name: "Cancellation leakage", what: "Rejected share of booked instructions: 7 of 103 (6.8%), sliced by corridor — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The leakage map that drives documentation-standards work." },
    { name: "Release cycle time", what: "Booking to release (created_at → shipped_at) over released transactions only: 2.98-day average on 82 of 103, range 2–4. The population definition ships with the number — pending rows have no cycle yet." },
    { name: "Client concentration", what: "Share of the book from clients spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs relationship teams and sizes the treasury pod." },
    { name: "Counterparty exposure share", what: "Financed cargo value per exporter counterparty: Nordic Gadgets AB 11,130.25 (32% of the book), Midwest Hardware Co 9,294.93 (26.7%). Concentration is a credit conversation before it is a sourcing one." },
    { name: "Fee-collection coverage", what: "Billed versus settled: 21 exact, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217 — with settlements averaging 28.4 days against 30-day terms (fastest 13, slowest 84). The AR read finance refreshes every close." },
  ],

  topics: [
    {
      name: "Status funnel counts",
      why: "Every Standard Chartered transaction-banking screen opens with the funnel: instructions booked, released (shipped_at stamped), settled to final. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a released transaction 'settled' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Transactions and clients are different grains of the same join, and every census here reports both: EU runs 45 transactions from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining clients to transactions",
      why: "Clients carry corridor and created_at; transactions inherit them through joins, and the join type decides who survives. A transaction without a client is corruption; a client without transactions is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "replace-employee-id-with-unique-identifier", "top-travellers"],
    },
    {
      name: "Counterparty exposure ladders",
      why: "Exporter exposure ladders are rank-window reporting where ties are guaranteed — the client ladder runs 24, 17, 14, 13, 5 transactions, then four clients tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer counterparties, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Doc-status banding with CASE",
      why: "Instrument states are CASE-classified — settled, in-flight, awaiting documents, rejected — with fixed arms the ops manual publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the census, and a reordered WHEN quietly re-bands the book.",
      slugs: ["weather-type-in-each-country", "primary-department-for-each-employee", "type-of-triangle"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month transaction spine (2024-01 to 2025-02) is the corridor desk's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "year-on-year-growth-rate"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — settled under rejected, this quarter beside last — and EXCEPT answers 'which billed facilities never received a settlement'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "movie-rating"],
    },
    {
      name: "Nested folds & thresholds",
      why: "Screens escalate into staging: fold per-client transaction counts, then judge them against a computed platform bar the interviewer never states numerically. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "second-highest-salary", "department-highest-salary"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets settled, in-flight, awaiting-docs and rejected in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "odd-and-even-transactions"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not collected — the finance tables (28 fee invoices, 27 settlements, INTEGER cents) are where the corridor world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "trial-balance-check"],
    },
  ],

  theory: [
    {
      id: "standardchartered-t1",
      q: "Your corridor report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a transaction column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A exposure report joins transactions to clients: a transaction with no client row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from clients: the clients with no transactions ARE the answer, arriving with NULL transaction columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload client row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-transacting clients, and proving that zero is itself the analyst's job: all 16 clients appear in the transaction table somewhere.",
      tag: "joins",
    },
    {
      id: "standardchartered-t2",
      q: "The client-activity ladder runs 24, 17, 14, 13, 5 transactions — then FOUR clients tied at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the four-way tie at 4 consumes ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose relationship manager gets the credit conversation. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer clients (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "standardchartered-t3",
      q: "The census shows 103 transactions and 16 clients; EU shows 45 transactions and 8 clients. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts transaction rows after the join — one row per booked instruction, so a client with 24 transactions contributes 24. COUNT(DISTINCT customer_id) folds those rows back to clients — EU's 45 transactions collapse to 8 mandates. Neither is wrong: transactions measure flow and desk load, clients measure installed base and coverage. The ratio between them is the intensity signal that decides whether the corridor is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for cargo lines and COUNT(*) silently counts cargo lines, not transactions — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "standardchartered-t4",
      q: "shipped_at is NULL until an instrument is released. What is your policy for the release-cycle report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only released transactions have a cycle, so the report measures booking-to-release for the 82 of 103 transactions that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL transactions returns the released-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the released subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 rejected rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day releases for instructions whose documents have not even arrived. A report whose WHERE clause is doing definitional work without saying so is exactly what a Standard Chartered reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "standardchartered-t5",
      q: "The corridor review wants settled value per corridor for corridors carrying at least ten transactions. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, pending and rejected rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-transaction floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a corridor line and an error, and between a threshold applied to transactions versus to dollars. On this db three corridors clear the floor (45, 37, 19) and LATAM's 2 drops out — and the strong answer says that out loud before running it.",
      tag: "pipeline",
    },
    {
      id: "standardchartered-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 transactions always produce a mean. On filtered staging tables — one corridor, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each transaction to ITS client's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "standardchartered-t7",
      q: "The transaction trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the corridor trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when treasury front-loads its instructions. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is corridor discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "standardchartered-t8",
      q: "Finance says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "standardchartered-mcq-1",
      prompt: "A transaction row's status reads 'delivered'. In this kit's Standard Chartered stage map, what happened?",
      choices: ["Settled to final — the instruction completed and counts as kept", "Released and in flight — not yet final", "Rejected — cancelled before value", "Awaiting documents — release pending"],
      answer: 0,
      why: "The stage map is fixed: delivered = settled to final (52 of 103 transactions, 50.5%). It is the only status where the instruction has actually completed.",
      notes: [
        { choice: 1, why: "Released-and-in-flight is 'shipped' — 30 transactions moving but not at final settlement. Calling them settled inflates the completion rate before a single instruction finishes." },
        { choice: 3, why: "Awaiting-documents is 'pending' — 14 transactions with no shipped_at yet. Pending is not rejected and not kept; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "standardchartered-mcq-2",
      prompt: "Settlement rate is status 'delivered' ÷ which population? The db holds 52 delivered, 30 shipped, 14 pending and 7 cancelled of 103 booked.",
      choices: ["Delivered + cancelled only (52/59 = 88.1%)", "All transactions booked (52/103 = 50.5%)", "Released transactions only (52/82)", "Distinct clients (52/16)"],
      answer: 1,
      why: "The house definition: settled ÷ ALL transactions booked — pending and in-flight stay in the denominator because 'not yet settled' is exactly what the metric measures. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 21 pending-plus-in-flight rows inflates the rate to 88.1% by deleting the population still moving — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is final settlement, the 82 are everything ever released. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "standardchartered-mcq-3",
      prompt: "APAC carries 37 transactions from 5 clients. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts transaction rows (37); COUNT(DISTINCT customer_id) folds repeats back to clients (5). The gap between them is the corridor's intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 37 again, since every transaction has a client. Without DISTINCT both columns read 37 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not clients — a third grain nobody asked for. The census is transactions AND mandates." },
      ],
      difficulty: "easy",
    },
    {
      id: "standardchartered-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to rejected transactions only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the rejection share truncates toward 0 and every corridor reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the leakage map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-5",
      prompt: "Keep only corridors carrying at least 10 transactions. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY corridor HAVING COUNT(*) >= 10", "WHERE transactions >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A transaction-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db three corridors clear the bar — 45, 37 and 19 — and LATAM's 2 drops.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'transactions' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-6",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending transactions double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the released-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 transactions (14 pending + 7 rejected have no stamp).",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-7",
      prompt: "A staging-table dunning list uses facility_id NOT IN (SELECT invoice_id FROM payments) and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the dunning list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every payment carries an invoice_id. But staging tables are exactly where NULLs sneak in, and empty dunning lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-8",
      prompt: "A board stack puts settled transactions under rejected transactions in one layout, built with UNION. A reviewer says one corridor's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same corridor, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same corridor, same counts, no branch label — collapse into one, and the board loses a corridor with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "standardchartered-mcq-9",
      prompt: "A dashboard walks booked value transaction by transaction: SUM(total) OVER (ORDER BY created_at). Two transactions share a created_at second, and the cumulative 'jumps two transactions at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at transaction grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "standardchartered-mcq-10",
      prompt: "A dunning query classifies coverage: CASE WHEN SUM(p.amount_cents) = i.amount_cents THEN 'exact' WHEN SUM(p.amount_cents) < i.amount_cents THEN 'partial' ELSE 'none' END. Invoice #25 (6,148) has one 4,000 settlement; invoice #28 (1,756) has zero settlement rows. What prints?",
      choices: ["#25 'partial', #28 'none' — SUM over an empty group is NULL, both comparisons come back UNKNOWN, and ELSE catches it", "#25 'partial', #28 'exact' — SUM over no rows is zero, and zero equals the balance", "#25 'exact', #28 'none' — one settlement of any size completes the invoice", "#25 'none', #28 'none' — SUM over a mixed group errors and falls to ELSE"],
      answer: 0,
      why: "#25 reads 4,000 < 6,148, so 'partial'. For #28, SUM over an empty group returns NULL — not zero — so both = and < are UNKNOWN and the ELSE arm prints 'none'. The zero-settlement invoice lands in 'none' by three-valued logic, not by a helpful zero — which is why the coverage census must read 21 exact / 1 partial / 6 none, never 21 / 1 / 5 with one 'exact'.",
      notes: [
        { choice: 1, why: "The zero-SUM instinct is the classic MySQL habit — in SQLite SUM of no rows is NULL, and NULL = 1,756 is UNKNOWN, not true." },
        { choice: 2, why: "'Exact' means billed equals settled — 4,000 against 6,148 is short by 2,148, and calling it exact hides real money from the dunning draft." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-stanchart-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The trusted-bench exposure read",
      brief:
        "Standard Chartered-flavored brief on the storefront db: credit's counterparty committee opens with the trusted-bench exposure read — financed cargo value per exporter counterparty rated 4.5 or better — before any new financing line is discussed. Probed facts: the whole book carries 34,833.28 across 103 transactions; the trusted bench is exactly two names, Nordic Gadgets AB (rating 4.6, 3 instruments) and Alpine Audio GmbH (rating 4.8, 2 instruments), with Midwest Hardware Co at 9,294.93 and Pacific Textiles at 2,980.15 outside it. Financed value means cargo lines summed quantity-times-unit-price; the committee reads biggest exposure first.",
      ask: "Return each trusted counterparty with its corridor, distinct instrument count and financed cargo value to 2 decimals, biggest exposure first.",
      template:
        "SELECT s.name AS counterparty,\n       s.region AS corridor,\n       COUNT({1} p.id) AS instruments,\n       ROUND(SUM(ii.quantity * ii.unit_price), {2}) AS financed_value\nFROM suppliers s\nJOIN products p ON p.supplier_id = {3}\nJOIN order_items ii ON ii.product_id = p.id\nWHERE s.rating >= {4}\nGROUP BY s.name, s.region\nORDER BY financed_value {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the instrument deduplicator",
          why: "COUNT(DISTINCT p.id) folds cargo lines back to instruments: Nordic reads 3, not every line its catalog appears on. SUM or MAX in this slot errors the aggregate outright — a census of nothing, not a deduplicated one.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          why: "Financed value reports to 2 decimals — Nordic's 11,130.25. ROUND(…, 1) prints 11,130.3 and the counterparty read stops reconciling with the 32% exposure share credit quotes on the same page.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the counterparty key",
          why: "The chain is products → their exporter: p.supplier_id = s.id. p.name (text against an id) empties the set entirely, and the constant 1 silently keeps only Nordic — a one-name bench that is not the bench.",
        },
        {
          answer: "4.5",
          kind: "number",
          noVerify: true,
          label: "the bench threshold",
          why: "The trusted bench is defined as rating >= 4.5 — Nordic 4.6 and Alpine 4.8 clear it, and no result cell prints the threshold itself. Loosening to 4.0 pulls Midwest (4.4), Shenzhen (4.1) and Andes (4.0) into the read; the bench is a policy edge, not a rounding choice.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The committee reads biggest exposure on top: Nordic 11,130.25, then Alpine 4,765.63. ASC would open the meeting on the smaller line — a correct query aimed at the wrong end of the memo.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC", "p.rating", "p.name"],
      walkthrough:
        "Two joins and one fold at counterparty grain. The chain runs suppliers → products → order_items: the WHERE keeps the 4.5-plus rated names — Nordic Gadgets AB (4.6) and Alpine Audio GmbH (4.8), exactly the two-row trusted bench — and GROUP BY folds them into rows where COUNT(DISTINCT p.id) reads instruments (3 and 2 — without DISTINCT the join to cargo lines fans each product out to every line it appears on) and ROUND(SUM(ii.quantity * ii.unit_price), 2) reads financed value: 11,130.25 and 4,765.63, against the probed census where Midwest Hardware runs 9,294.93 and Pacific Textiles 2,980.15 below the bench. The distractors fail honestly: SUM or MAX inside COUNT errors the aggregate; 1 in the ROUND prints 11,130.3, which stops reconciling with the 32% share credit quotes; a broken join key either empties the set (p.name) or matches the wrong parents (1 keeps only Nordic); ASC opens the committee on the smallest line. The read: both bench names sit in EU — concentration is a corridor story before it is a counterparty one.",
    },
    {
      id: "cs-stanchart-2",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The corridor status census",
      brief:
        "Standard Chartered-flavored brief on the storefront db: transaction-banking ops opens every morning with the corridor status census — booked, settled, in-flight and rejected per corridor — and the board's rule is that the branches must reconcile to the booked count by construction. Probed facts: 103 transactions split EU 45, APAC 37, US 19, LATAM 2; the status map reads 52 delivered, 30 shipped, 14 pending, 7 cancelled; the rejection share runs APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The board reads biggest corridor first.",
      ask: "Return each corridor with booked transactions, settled count, in-flight count, rejected count and the rejection percentage to 1 decimal, biggest corridor first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS booked,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS settled,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS rejected,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), {3}) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY booked {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled literal",
          why: "Settled transactions are status 'delivered' — 52 on the db, led by EU's 24. 'pending' would count the 14 awaiting-documents rows as final and understate every corridor's completion story.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight literal",
          why: "In-flight is status 'shipped' — released, not yet final: 30 rows, with the US's 10 running ahead of APAC's 8. 'cancelled' swaps the column to rejections and the ops floor starts chasing transactions that never left.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the rejection precision",
          why: "The share reports to 1 decimal — APAC 8.1, EU 6.7, US 5.3, LATAM 0, exactly the ops board's numbers. ROUND(…, 0) flattens 8.1 to 8 and the corridor map stops matching the memo.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-corridor-first direction",
          why: "The board reads biggest corridor on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open the morning meeting on LATAM's 2 transactions — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'pending'", "'cancelled'", "ASC", "0"],
      walkthrough:
        "One scan, four conditional branches, no second pass. The join attaches every transaction to its client's corridor and GROUP BY folds 103 rows into four: booked reads 45 / 37 / 19 / 2, the CASE arms read settled 24 / 21 / 5 / 2, in-flight 12 / 8 / 10 / 0 and rejected 3 / 3 / 1 / 0 — and every row reconciles (EU 24 + 12 + 6 + 3 = 45, APAC 21 + 8 + 5 + 3 = 37, US 5 + 10 + 3 + 1 = 19, LATAM 2 = 2), with the rejection share rounding to 6.7 / 8.1 / 5.3 / 0 exactly as the ops board quotes it. The distractors fail honestly: 'pending' or 'cancelled' in a status arm relabels a column and the reconciliation identity breaks on sight; 0 as the ROUND precision flattens 8.1 and 6.7 to integers; ASC opens the board on LATAM's 2. The discipline being graded: one pass whose arms must sum to COUNT(*) — four sequential queries are four ways to drift.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "The instruction-to-value funnel is Standard Chartered's headline read — instruction booked, documents verified, value settled. This problem drills the conditional-count shape the funnel report uses every single week." },
    { slug: "customers-who-never-order", why: "The dunning list is an anti-join: 6 fee invoices worth 15,217 have no settlement row. This problem is that left-join-keep-the-NULLs shape the AR pod runs before every reminder cycle." },
    { slug: "sales-analysis-iii", why: "Corridor volume inside a calendar window — February 2025 booked 7 transactions for 2,390.53 — is a date-filtered fold, exactly this problem's shape." },
    { slug: "classes-more-than-5-students", why: "Corridor floors are HAVING gates: which corridors carry at least N booked instructions. Screens reframe it as 'which corridors settled at least ten transactions last month'." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Most-active client reads: one treasury client books 24 of the 103 instructions. Argmax over a fold — and the tie policy is the follow-up question." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Product-mix census: which clients run letters of credit and collections but never remittances. Conditional aggregation across instrument types — the cross-sell read." },
    { slug: "find-the-team-size", why: "Every transaction row carrying its client's total count beside it — COUNT OVER with no PARTITION collapse. The per-row context read the corridor desks ask for." },
    { slug: "product-price-at-a-given-date", why: "Fee schedules move: what did the instrument cost as of value date, not today. As-of logic over an effective-dated price list is exactly this problem." },
    { slug: "sellers-with-no-sales", why: "Counterparty whitespace: which exporters had no financed cargo in the window. The anti-join credit runs before renewing a facility line." },
    { slug: "confirmation-rate", why: "Document-completion rates with missing paperwork: LEFT JOIN plus COALESCE so clients with no document events still print a zero, not a NULL." },
    { slug: "game-play-analysis-iv", why: "First-transaction cohorts: which clients' first booking cleared the platform average. Two-stage fold — compute the bar, then filter against it." },
    { slug: "bank-account-summary", why: "Client account summaries with zero-activity clients kept: the LEFT JOIN fold that must not silently drop dormant mandates." },
    { slug: "keep-latest-dedupe", why: "Corridor desks quote the latest rate per currency pair: ROW_NUMBER dedupe with a named tie-breaker — the same shape as latest-instruction-per-client." },
    { slug: "null-blank-audit", why: "The pre-close NULL and blank audit: empty remittance fields and missing doc stamps get counted, not quietly dropped, before the numbers go upstairs." },
    { slug: "transaction-velocity", why: "Velocity gates on remittance corridors: bursts of rapid-fire transfers are the financial-crime screen. Time-bucketed counting against a threshold is exactly this problem." },
    { slug: "fx-exposure-report", why: "Multi-currency exposure normalized to dollars at the latest corridor rate — the treasury read Standard Chartered lives by. Latest-rate join, then a fold." },
  ],
};
