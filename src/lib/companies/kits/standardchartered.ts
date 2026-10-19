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
// rows — so all 10 topic slug sets and all 32 problems are theme-curated from
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
    "Preparation strategy: the pools file carries no Standard Chartered section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to the bank's known screens: status funnels with stated denominators, two-grain corridor censuses, counterparty exposure ladders, CASE-banded coverage splits and the cents-safe billing spine. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: the {sky:trusted-bench exposure read} credit runs before it adds a counterparty line, the {emerald:corridor status census} transaction-banking ops opens every morning with, the never-settled dunning list, the spend-category census, the settled-value strip and the above-average exposure bench. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, because in correspondent banking a number that cannot be tied is a number that does not exist.",
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
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "settlement-fails-aging", "prepayment-detection"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Transactions and clients are different grains of the same join, and every census here reports both: EU runs 45 transactions from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "chargeback-rate-ranking", "delinquency-buckets"],
    },
    {
      name: "Joining clients to transactions",
      why: "Clients carry corridor and created_at; transactions inherit them through joins, and the join type decides who survives. A transaction without a client is corruption; a client without transactions is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "replace-employee-id-with-unique-identifier", "top-travellers", "dormant-reactivation"],
    },
    {
      name: "Counterparty exposure ladders",
      why: "Exporter exposure ladders are rank-window reporting where ties are guaranteed — the client ladder runs 24, 17, 14, 13, 5 transactions, then four clients tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer counterparties, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "portfolio-concentration-hhi"],
    },
    {
      name: "Doc-status banding with CASE",
      why: "Instrument states are CASE-classified — settled, in-flight, awaiting documents, rejected — with fixed arms the ops manual publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the census, and a reordered WHEN quietly re-bands the book.",
      slugs: ["weather-type-in-each-country", "primary-department-for-each-employee", "type-of-triangle", "credit-utilization-bands", "risk-based-pricing"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month transaction spine (2024-01 to 2025-02) is the corridor desk's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "year-on-year-growth-rate", "balance-rollforward"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — settled under rejected, this quarter beside last — and EXCEPT answers 'which billed facilities never received a settlement'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "movie-rating", "circular-transfers"],
    },
    {
      name: "Nested folds & thresholds",
      why: "Screens escalate into staging: fold per-client transaction counts, then judge them against a computed platform bar the interviewer never states numerically. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "second-highest-salary", "department-highest-salary", "expected-credit-loss", "structuring-detection"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets settled, in-flight, awaiting-docs and rejected in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "odd-and-even-transactions", "suspicious-bank-account-transactions"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not collected — the finance tables (28 fee invoices, 27 settlements, INTEGER cents) are where the corridor world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "trial-balance-check", "ar-aging-schedule", "gl-reconciliation", "journal-gap-detection"],
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
    {
      id: "standardchartered-t9",
      q: "Before any corridor census, the panel asks: 'one row per what?' Walk me through how you decide the GROUP BY grain.",
      a: "The grain is the business deliverable, and the GROUP BY clause is its SQL spelling. A mandate census folds transactions to clients: GROUP BY customer_id turns 103 booked instructions into 16 mandates; a corridor census folds to region (EU 45, APAC 37, US 19, LATAM 2); an exposure census folds cargo lines to counterparties. The panel watches which rung you name before you write, because every selected column must be either the grouping key or an aggregate — anything else is a coin flip SQLite resolves silently and another engine rejects. The habit that passes: say the grain out loud ('this report is one row per client'), then refuse the laxness where a bare non-grouped column prints an arbitrary row's value — a quietly wrong number that renders fine on the credit-committee slide.",
      tag: "groupby",
    },
    {
      id: "standardchartered-t10",
      q: "When do you reach for a window function instead of GROUP BY — give me the corridor case where the distinction matters.",
      a: "When the deliverable needs the fold BESIDE the rows instead of instead of them. Credit's strip is the canonical case: every settled transaction row must carry its corridor's settled total — SUM(total) OVER (PARTITION BY region) computes the fold once and attaches it, so all 52 settled rows print with EU's 6,656.18 beside each EU transaction. GROUP BY would collapse to four rows and destroy the transaction detail the strip sorts by. Same muscle in ops: every instrument row can carry its client's activity count as COUNT(*) OVER (PARTITION BY customer_id), so the desk sees each instruction against its mandate's whole book without a join-back. The rule I say out loud: GROUP BY when the stakeholder wants the summary; windows when they want the rows with context.",
      tag: "windows",
    },
    {
      id: "standardchartered-t11",
      q: "Build me the status census in one pass — and tell me why the branches can never disagree with each other.",
      a: "One scan, four branches, one denominator: COUNT(*) FILTER (WHERE status = 'delivered') per branch — 52 settled, 30 in-flight, 14 awaiting documents, 7 rejected — or the portable twin SUM(CASE WHEN status = … THEN 1 ELSE 0 END). Both branches partition the same 103 rows, so the identity 52 + 30 + 14 + 7 = 103 holds by construction and no branch can drift. The same muscle builds the AR aging buckets (0–30, 31–60, 61–90, 90-plus as ordered CASE arms) and the fee-coverage split (21 exact, 1 partial, 6 never-collected) in one pass. The zero bucket matters: ELSE 0 keeps a branch honest when a status is empty instead of letting the row vanish. Four sequential queries are four separate scans with four separate WHERE clauses — the drift between them is an incident, not a rounding note.",
      tag: "case-when",
    },
    {
      id: "standardchartered-t12",
      q: "UNION ALL or UNION for the close packet's stacked report — and when does EXCEPT answer a banking question better than any join?",
      a: "UNION ALL when the branches are logically disjoint — settled rows stacked under rejected rows, detail rows above the labelled TOTAL — because it concatenates without a distinct pass. UNION is a business decision, not hygiene: its dedupe silently deletes rows, and a 'duplicate' in a board stack is either an incident you want to see or a repeated count you can defend — never something to bury in the operator. EXCEPT is the coverage diff: 'which fee invoices never received a settlement' is SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments — on this db that is 6 invoices worth 15,217 cents, the dunning draft itself. One discipline note: set operators dedupe both inputs first, so if the anomaly you hunt IS a duplicated row, the row-honest tool is the LEFT JOIN + IS NULL anti-join, not EXCEPT.",
      tag: "set-ops",
    },
    {
      id: "standardchartered-t13",
      q: "The monthly walk stages a CTE before it reads LAG. Why stage at all — what does the CTE buy that a flat query doesn't?",
      a: "Three concrete buys on this exact shape. Correctness: window functions evaluate in the SELECT stage, so the month fold must exist before LAG can walk it — WITH monthly AS (SELECT STRFTIME('%Y-%m', created_at) AS month, SUM(total) AS booked … GROUP BY month) is the staging layer that makes the window legal. Reuse: the same monthly CTE feeds the corridor walk, the quarter cuts and the trough narrative without re-writing the fold. Auditability: a named CTE is a definition the credit committee can point at — 'monthly means booked instructions folded by the STRFTIME month key, 14 buckets' — which is how a number survives the committee argument. The habit that comes with it: filter early inside each CTE (corridor, status, date range) so later stages carry fewer rows, and SELECT from the CTE while debugging instead of guessing at the fold.",
      tag: "ctes",
    },
    {
      id: "standardchartered-t14",
      q: "Define the settlement rate for me — and defend every row you left in the denominator.",
      a: "Settlement rate = instructions settled to final ÷ ALL transactions booked: 52 of 103, 50.5%. The defense is the population list: the 30 in-flight rows stay because 'released, not yet final' is exactly what the metric watches; the 14 awaiting documents stay because a document chase is a pipeline state, not an exclusion; the 7 rejected stay because a rejection is an outcome the rate should feel. The interview move is stating the denominator BEFORE the SQL: 'all 103 booked, no status filter, because the metric is completion against everything the desk accepted'. The cousin metrics prove the discipline scales: the in-flight pipeline is its own number (44, the working inventory), while release cycle time (2.98 days) uses the OPPOSITE rule — only released transactions, because an unreleased instruction has no cycle yet, and a NULL is 'not yet', never a zero.",
      tag: "metrics",
    },
    {
      id: "standardchartered-t15",
      q: "The billing tables store money as INTEGER cents. Where do the bugs bite, and what is your rounding policy?",
      a: "Three bite points and one policy. Scale: a 19,609-cent fee invoice is 196.09, and amount_cents / 100 is integer division — 196 flat; the .0 (or a CAST) goes in BEFORE the division, every time. Aggregation: SUM in cents stays exact and the conversion happens once at the presentation edge — mid-pipeline rounding discards precision a later SUM still needed. Comparison: floats are IEEE doubles, so money comparisons either stay in integer cents or carry a tolerance. The policy I state in reviews: aggregate in cents, convert once, round at the edge — and prove it on the trial balance, which closes at 181,080 debits against 181,080 credits, delta zero. In correspondent banking a number that cannot be tied to the penny is a number that does not exist.",
      tag: "numbers",
    },
    {
      id: "standardchartered-t16",
      q: "The morning corridor census went from instant to slow after a 'small' filter change. What do you check first?",
      a: "Sargability first: did the filter wrap the timestamp column in a function? SUBSTR(created_at, 1, 7) = '2024-03' forces a scan of every row; the sargable twin is the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01' — same rows, index-usable. Then the pipeline: filters pushed early into each CTE mean later stages fold fewer rows, and SELECT * payloads you never read stop crossing the wire. The honesty check for this schema: it is small — 103 transactions, 251 cargo lines — so these are habits, not firefights; the point the panel probes is whether the instincts survive the corridor book growing a thousandfold, which is why the answer names the mechanism (a function on the column kills index use) and the verification step (EXPLAIN QUERY PLAN before and after), not 'we tuned it'. Probe with LIMIT before the full run; aggregate on the smallest table that answers the question instead of joining first and filtering after.",
      tag: "performance",
    },
    {
      id: "standardchartered-t17",
      q: "A booked-value SUM roughly doubles after transactions joins cargo lines. Walk me through the diagnosis and the fix.",
      a: "Diagnose by counts before touching the SUM: transactions alone is 103; the join is 251 — the jump IS the fan-out, one row per cargo line under cover of each instrument. Confirm the multiplier with GROUP BY o.id HAVING COUNT(*) > 1 to see which instruments carry multiple lines, because the inflation is uneven: a single-line instrument survives, a six-line shipment repeats its header total six times. The fix depends on the grain the committee bought: instrument-grain value pre-aggregates the lines (SUM(quantity × unit_price) GROUP BY order_id in a CTE, then join) so the header total is added exactly once; line-grain analysis keeps the join but counts entities with COUNT(DISTINCT o.id) and never sums the header column. The trap to name out loud: it is not 'duplicate data' or 'a rounding thing' — it is the grain, and the before/after count is the receipt you bring to the committee.",
      tag: "joins",
    },
    {
      id: "standardchartered-t18",
      q: "IN, EXISTS, or a derived table — how do you pick when filtering transactions against a computed client or counterparty set?",
      a: "Start with what the set IS. A small stable list — the 4.5-plus rated counterparties — reads as IN (subquery over suppliers). An existence probe — 'has at least one settled transaction' — is EXISTS, which short-circuits on the first match and never trips on NULLs; its anti-form NOT EXISTS is the NULL-safe dunning shape, because NOT IN over a list containing one NULL returns nothing at all, and staging pulls are exactly where NULLs sneak in. A computed aggregate set — clients with 2+ transactions, counterparties above the exposure mean — must be a derived table or CTE, because the fold (GROUP BY + HAVING, or a nested SELECT AVG) cannot live inside an IN list, and the outer query joins to it at entity grain. The reasoning the panel wants: EXISTS for presence, IN for membership against stable sets, derived tables when the filter itself is an aggregation — with the NULL behavior of each stated before the db proves it the hard way.",
      tag: "subqueries",
    },
    {
      id: "standardchartered-t19",
      q: "Settlements average 28.4 days against 30-day terms. How do you compute days-to-settle, bucket the aging book, and cut a quarter without losing its last night?",
      a: "Three moves. Days-to-settle: julianday(paid_on) − julianday(issued_on) — the TEXT timestamps become fractional day numbers and the difference survives month boundaries, which is how the 28.4 average, the 13-day fastest and the 84-day slowest were all measured. Aging buckets: ordered CASE arms from the LARGEST threshold down — 90-plus, then 61–90, then 31–60, then current — because CASE stops at the first TRUE arm and ascending arms re-band the whole book into the lowest bucket, inverting the dunning priorities. The quarter cut: half-open intervals, created_at >= '2024-01-01' AND created_at < '2024-04-01', because BETWEEN '2024-03-31' silently drops the last night's bookings — and quarter-end is exactly when treasury front-loads its instructions. State the boundary policy before writing the WHERE: date bugs are boundary bugs.",
      tag: "dates",
    },
    {
      id: "standardchartered-t20",
      q: "How do NULLs behave in GROUP BY buckets, join keys and the release-cycle aggregates — and what is your display policy for the funnel?",
      a: "Three behaviors, three policies. In GROUP BY, SQL groups NULLs together — a NULL corridor or NULL doc-status becomes its own bucket, which is why the census either filters NULLs with a stated reason or labels the bucket instead of letting an unnamed row print. In join keys, NULL never matches: a transaction with NULL client_id would vanish from an INNER JOIN and survive a LEFT JOIN only on the left — worth an integrity check, not a silent join choice. In aggregates, the shape matters: COUNT(shipped_at) counts released transactions, COUNT(*) keeps every row, AVG over NULL latencies silently shrinks the population while still printing — 2.98 days over 82, not 103. Display policy: awaiting-documents stays 'pending' (a state, not a NULL to fix), shipped_at stays NULL until release, and COALESCE is for PRESENTATION — a zero in a display cell, never fed back into the averages.",
      tag: "nulls",
    },
    {
      id: "standardchartered-t21",
      q: "Which indexes would you actually add on this schema, and what makes a predicate able to use one?",
      a: "Sargable first: an index helps when the predicate compares the bare column to a value — status = 'pending', created_at >= '2024-03-01', customer_id = 7. Wrap the column in a function (SUBSTR, julianday arithmetic) and the index is dead: every row gets scanned. On this schema the honest shortlist is the FK join keys (order_items.order_id, order_items.product_id — every census runs the chain), status for the morning funnel scan, created_at for the spine cuts, and invoice_id on payments for the coverage anti-join; a composite (status, created_at) covers the funnel's filtered walks. The maturity signal is the honesty about scale: 103 transactions do not NEED indexes, and saying so — 'I would add these when the corridor book outgrows the sandbox, and here is the EXPLAIN QUERY PLAN comparison I would run first' — is the answer that lands, because premature indexing is a write-cost someone else pays.",
      tag: "indexes",
    },
    {
      id: "standardchartered-t22",
      q: "Client names arrive from corridor feeds title-case-broken — 'acme holdings' and 'Acme Holdings' are one mandate. What is the hygiene pass, and where does it live?",
      a: "Detect the split first, because that is the business damage: GROUP BY the name and HAVING COUNT(*) > 1 on a client fold — or match on a stable key — and the exposure census silently splits one mandate's book across two rows, which at 32% concentration is a credit conversation built on half a fact. Then normalize in a staged layer, not inline everywhere: TRIM the whitespace, UPPER/LOWER with an INITCAP-style expression for display, and fold the joins onto a canonical key — the client id or the lowercased SWIFT/reference code — so the two spellings can never split a mandate's history. Where it lives matters as much as the functions: one hygiene CTE at the top of the pipeline so every downstream fold sees the canonical form, versus fifteen scattered UPPER() calls that drift apart by next quarter. Names are for humans, keys are for joins — normalize the display, dedupe on the key.",
      tag: "casing",
    },
    {
      id: "standardchartered-t23",
      q: "Why is an average of averages wrong, and what do you compute instead on this book?",
      a: "Because it weights every group equally regardless of size. The corridor average tickets are EU 335.32 (45 transactions), APAC 313.66 (37), US 383.48 (19), LATAM 426.22 (2) — averaging the four prints 364.67, which describes a book where LATAM's two instructions matter as much as EU's forty-five. The true platform average is SUM(total)/COUNT(*) over the base rows: 338.19, where the micro-market barely registers. The honest alternatives: re-aggregate from the base (sum the numerators, divide by the summed denominators), or the explicit weighted blend SUM(avg * n)/SUM(n) — the same arithmetic one level up. The interview move is naming WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and that is a claim you defend, not assume — especially when the slide exists to argue LATAM's 426.22 ticket is signal.",
      tag: "metrics",
    },
    {
      id: "standardchartered-t24",
      q: "ROWS or RANGE for the moving average on the daily booked-value spine — where does the choice decide the number?",
      a: "When the ORDER BY key has ties or gaps. RANGE (the default when you write ORDER BY with no explicit frame) includes PEERS: two transactions sharing a created_at second enter the running total together — the cumulative 'jumps two instructions at once'; ROWS walks strictly row by row. The subtler bite is gaps: on the daily spine, ROWS BETWEEN 29 PRECEDING AND CURRENT ROW reaches back 29 ROWS — if ten days had no bookings, that is 39+ calendar days — so the 'trailing 30-day' figure is quietly wrong. The professional build stages a per-corridor calendar spine (every date, zero-filled via a LEFT JOIN from a dates CTE), and then the ROWS frame and the calendar agree; the month spine needs none of this because its keys are unique. The complete answer names the data shape first — ties at transaction grain, gaps on the daily spine, neither on the month spine — because the right frame is a property of the axis, not a style preference.",
      tag: "windows",
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
    {
      id: "standardchartered-mcq-11",
      prompt: "You write `SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments` to find never-settled fee invoices. What does the db return, and what is it worth?",
      choices: ["Zero rows — every invoice settled", "All 28 invoice ids — EXCEPT cannot compare the columns", "6 ids — the never-settled AR book, 15,217 in cents, which IS the dunning draft before dunning sends anything", "27 ids — the settled invoices"],
      answer: 2,
      why: "EXCEPT keeps left-side ids that never appear on the right: 22 of the 28 fee invoices carry settlement rows, 6 do not — and that 6-row set, summed to 15,217 cents, is literally the AR pod's dunning draft. The mirror-blind-spot matters too: a void invoice WITH a settlement row (#11, 925.00) hides from this set, which is why the anomaly walk runs beside it.",
      notes: [
        { choice: 0, why: "The confident zero is wrong here — six names are owed reminders, and an empty dunning draft means the AR workstream silently doesn't run this close." },
        { choice: 3, why: "That is INTERSECT's answer territory — EXCEPT is one-directional: left-minus-right, never the overlap." },
      ],
      difficulty: "easy",
    },
    {
      id: "standardchartered-mcq-12",
      prompt: "Settlements average 28.4 days against 30-day terms (fastest 13, slowest 84). Which expression computes days-to-settle per invoice correctly?",
      choices: ["julianday(p.paid_on) - julianday(i.issued_on)", "p.paid_on - i.issued_on", "DATEDIFF(day, i.issued_on, p.paid_on)", "STRFTIME('%d', p.paid_on) - STRFTIME('%d', i.issued_on)"],
      answer: 0,
      why: "julianday converts each TEXT timestamp to a fractional day number, and the difference IS days-to-settle — including month and year boundaries. Text subtraction is not date arithmetic, DATEDIFF is another engine's vocabulary, and '%d' extracts day-of-month, which breaks the moment a settlement crosses a month edge.",
      notes: [
        { choice: 2, why: "DATEDIFF does not exist in SQLite — the query fails to compile, which at least is a loud failure rather than a silent wrong number." },
        { choice: 3, why: "Day-of-month subtraction gives 13 - 28 = -15 for a settlement that took 16 days across a month boundary. The 84-day slowest case would be fiction." },
      ],
      difficulty: "easy",
    },
    {
      id: "standardchartered-mcq-13",
      prompt: "The corridor census joins cargo lines: orders × order_items prints 251 rows. Which column pair reports TRANSACTIONS and CARGO LINES in one row?",
      choices: ["COUNT(*) and COUNT(ii.id)", "COUNT(DISTINCT o.id) and COUNT(*)", "SUM(o.total) and COUNT(*)", "COUNT(DISTINCT c.region) and COUNT(*)"],
      answer: 1,
      why: "After the fan-out, COUNT(DISTINCT o.id) folds lines back to the 103 booked transactions while COUNT(*) reads the 251 cargo lines — the two grains the census exists to show side by side (corridor load in lines, instrument count in transactions). Saying which column is which grain is the habit being graded.",
      notes: [
        { choice: 0, why: "COUNT(ii.id) counts the same 251 lines — ii.id never repeats, so both columns print 251 and the transaction grain vanishes." },
        { choice: 2, why: "SUM(o.total) is booked value, not a count — a third metric wearing a census column's name, and it double-counts across the fan-out anyway." },
      ],
      difficulty: "easy",
    },
    {
      id: "standardchartered-mcq-14",
      prompt: "The monthly bookings walk prints NULL for 2024-01's delta. The deck owner wants 'no blank cells'. What do you do?",
      choices: ["COALESCE the delta to 0 — January was flat", "Drop January from the walk", "Backfill December 2023 from the archive and re-run", "Keep the NULL and label it 'baseline' — no prior month exists, and a zero invents a fake jump into February"],
      answer: 3,
      why: "The first month's LAG is NULL because no prior bucket exists — that is the definition, not a data gap. Coalescing to 0 asserts 'flat', which is a claim about history you do not have, and it silently manufactures a +100%-style jump reading into February (3,609.64 from a fake zero). The baseline IS the story's first row.",
      notes: [
        { choice: 1, why: "Dropping the opener amputates the spine the quarter cuts and the trough narrative both hang from — the walk must start at 2024-01 to be a walk." },
        { choice: 2, why: "A backfilled December 2023 changes the answer to a different question ('walk since 2023-12'), and the archived month may not exist in this db at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-15",
      prompt: "The ops floor wants settled, in-flight, awaiting-docs and rejected in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. Which shape keeps the branches from drifting?",
      choices: ["Four sequential queries pasted side by side", "COUNT(*) FILTER (WHERE status = …) per branch — one scan, one shared denominator; SUM(CASE …) is the portable twin", "A correlated subquery re-counting per status", "GROUP BY status — it returns four rows, not the single-row board layout"],
      answer: 1,
      why: "FILTER branches each aggregate over the same 103-row scan, so the four branches partition the same rows and reconcile by construction — the identity 52 + 30 + 14 + 7 = 103 cannot break. Four separate queries are four separate WHERE clauses that drift the first time someone edits one and not the others.",
      notes: [
        { choice: 0, why: "The drift bug is the ops floor's most common incident: one branch's filter gets a status fix, the other three go stale, and the reconciliation identity dies on the board." },
        { choice: 3, why: "GROUP BY status is a legitimate one-row-PER-status shape — but the board layout is one row with four columns, and the answer must match the deliverable." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-16",
      prompt: "The dunning list keeps fee invoices with no settlement rows. Two candidates: `invoice_id NOT IN (SELECT invoice_id FROM payments)` and `invoices LEFT JOIN payments … WHERE p.id IS NULL`. Which is NULL-safe, and why?",
      choices: ["NOT IN — it is the idiomatic set test", "Both — they are equivalent on any data", "The LEFT JOIN + IS NULL anti-join: a NULL in the NOT IN subquery poisons every comparison, while the join simply never matches on NULL", "A CROSS JOIN with a filter"],
      answer: 2,
      why: "x NOT IN (…, NULL) is UNKNOWN for every outer row — one NULL invoice_id in a staging pull empties the dunning list while the query looks valid. The LEFT JOIN anti-join never compares against a list: unmatched left rows survive with a NULL payload and p.id IS NULL selects them. NOT EXISTS is the other NULL-safe form.",
      notes: [
        { choice: 1, why: "They are equivalent only while the right side is NULL-free — which is exactly the assumption staging tables break. The safe shape is a policy, not a preference." },
        { choice: 3, why: "CROSS JOIN multiplies rows; filtering afterwards rebuilds a join the hard way and answers nothing about settlement coverage." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-17",
      prompt: "Corridor desks quote the LATEST rate per currency pair; two feeds stamp the same second. ROW_NUMBER() OVER (PARTITION BY pair ORDER BY stamped_at DESC) keeps rn = 1. What is the follow-up question the panel asks?",
      choices: ["What is the second ORDER BY key — without a deterministic tie-breaker, 'latest' is engine luck", "Should it be RANK instead, so ties share rungs", "Should DISTINCT collapse the tie", "Nothing — timestamps never tie in feeds"],
      answer: 0,
      why: "ROW_NUMBER must return a strict 1..n; with a tied stamped_at the surviving rate is arbitrary and the dedupe is not reproducible — a rerun can quote a different price. A physical second key (the feed's sequence or id) makes 'latest' deterministic, which is what a treasury number must be.",
      notes: [
        { choice: 1, why: "RANK shares rungs on ties — a dedupe needs exactly ONE row per pair, so shared rungs are the wrong property." },
        { choice: 3, why: "Feeds stamp identical seconds constantly — retries and batch loads guarantee it. The tie is the normal case." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-18",
      prompt: "Booked value reads 34,833.28 on orders alone; the deck's version joined to cargo lines prints roughly 2.4x that. Diagnosis?",
      choices: ["Cents conversion doubled the units", "The join fanned 103 transactions into 251 cargo lines and SUM(o.total) repeats each header total once per line — fold lines to instrument grain first, then join", "Cancelled transactions leaked back in", "Float rounding accumulated across the join"],
      answer: 1,
      why: "The 103 × lines-per-instrument fan-out repeats each header total once per cargo line; summing the header column over the joined rows pays the multiplier. The fix is grain discipline: pre-aggregate order_items to order grain in a CTE, or commit to the line grain and stop summing the header.",
      notes: [
        { choice: 0, why: "Conversion mistakes move numbers by 100x or 1000x — a 2.4x multiplier is the fingerprint of a fan-out, not a unit error." },
        { choice: 2, why: "A status leak changes WHICH rows count, not the magnitude by a clean multiplier — and the delta here tracks the lines-per-instrument ratio exactly." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-19",
      prompt: "The client-activity ladder runs 24, 17, 14, 13, 5 transactions, then FOUR clients tied at 4. Under DENSE_RANK, what rank does the next distinct count (3) carry?",
      choices: ["6", "7", "10", "5"],
      answer: 1,
      why: "DENSE_RANK shares rungs without gaps: the four-way tie at 4 all hold rank 6, and the next distinct count gets rank 7 — six rungs, seven distinct values consumed. RANK would hand the 3-count clients rank 10, implying four phantom ladder positions that no client occupies; the choice between them is a policy about what the ladder claims.",
      notes: [
        { choice: 0, why: "6 is the rank the TIED clients share — the 3-count clients come after the whole tie block." },
        { choice: 2, why: "10 is RANK's answer — correct arithmetic for the wrong function. The board's published policy is what decides, and the query comment must state it." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-20",
      prompt: "AR aging buckets the unpaid book: 31–60, 61–90, 90-plus days overdue. A colleague writes the CASE arms in order '30-plus', THEN '60-plus', THEN '90-plus'. Where does a 36-day-overdue invoice land?",
      choices: ["'31–60' — the intended bucket", "'61–90'", "'90-plus'", "'30-plus' — the first TRUE arm wins, and 36 clears 30"],
      answer: 3,
      why: "CASE evaluates top-down and stops at the first TRUE arm, so ascending thresholds re-band the whole aging book into the lowest bucket — every 90-day name suddenly reads '30-plus' and the dunning priorities invert. Overlap arms must run from the LARGEST threshold down, or use disjoint BETWEEN ranges.",
      notes: [
        { choice: 0, why: "That is the intent, but arm order beats intent — the engine never sees the 60 and 90 arms for a 36-day invoice because 36 already passed the first test." },
        { choice: 1, why: "To reach the 60 arm the invoice would need to FAIL the 30 arm first — impossible when the arms ascend. The bucket system collapses into one bucket." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-21",
      prompt: "Each settled transaction must print beside ITS client's average ticket. Two shapes: a correlated subquery (… = (SELECT AVG(total) …)) or AVG(total) OVER (PARTITION BY customer_id). Which, and why?",
      choices: ["Correlated — subqueries are always faster", "They always return different numbers, so pick by taste", "The window: the partition computes each client's average once and attaches it per row; the correlated form re-runs the fold per row and hides the population definition inside the WHERE", "GROUP BY client — one row per client is finer grain"],
      answer: 2,
      why: "The window computes the per-client fold once per partition and keeps all 52 settled rows with context attached — one pass, and the definition (average over that client's settled transactions) is visible in the OVER clause. The correlated subquery re-evaluates per outer row and buries the same definition in the WHERE, where reviewers miss it.",
      notes: [
        { choice: 0, why: "The correlated form is the classic slow path — once per row unless the engine decorrelates. 'Always faster' is backwards." },
        { choice: 3, why: "GROUP BY collapses to one row per client — the deliverable needs all 52 transaction rows with the average BESIDE them, not instead of them." },
      ],
      difficulty: "hard",
    },
    {
      id: "standardchartered-mcq-22",
      prompt: "The treasury desk reads a trailing-30-day booked value per corridor, refreshed daily — but the order spine has gap days (no bookings some days). Which build is honest?",
      choices: ["SUM(total) OVER (PARTITION BY region ORDER BY day ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) straight on the transaction rows", "A per-corridor calendar spine (every date, zero-filled) LEFT JOINed to the daily fold, THEN the 30-row frame over the filled spine", "GROUP BY week and call it 30 days", "WHERE day >= date('now', '-30 days') with no frame at all"],
      answer: 1,
      why: "On raw rows, ROWS BETWEEN 29 PRECEDING counts 30 TRANSACTIONS — which can span 60+ calendar days when the spine has gaps — so the 'trailing 30-day' number is quietly wrong. The zero-filled spine makes every date a row, and then the 30-row frame and the calendar agree: a day with no bookings contributes 0, not absence.",
      notes: [
        { choice: 0, why: "The default mistake: syntactically perfect, temporally fiction. 30 rows back from a quiet corridor's Tuesday might reach back three months." },
        { choice: 2, why: "Weekly buckets answer a different question — the desk's trigger levels are calibrated on daily granularity, and a week fold blurs the burst the screen exists to catch." },
      ],
      difficulty: "medium",
    },
    {
      id: "standardchartered-mcq-23",
      prompt: "A slide averages the four corridor average tickets — 335.32 (EU), 313.66 (APAC), 383.48 (US), 426.22 (LATAM) — and prints 364.67. The platform average is 338.19. Why the gap?",
      choices: ["The corridor figures are stale", "An average of averages weights every corridor equally — LATAM's 2 transactions weigh as much as EU's 45; re-aggregate from the base rows", "338.19 is a median, not a mean", "The corridors settle in different currencies"],
      answer: 1,
      why: "364.67 describes a book that does not exist: it gives LATAM's two transactions the same weight as EU's forty-five. The honest figure re-aggregates from the base — SUM(total)/COUNT(*) over all 103 bookings — or blends explicitly: SUM(avg * n)/SUM(n). Average-of-averages is only correct when every group has equal counts, a claim you should have to defend.",
      notes: [
        { choice: 2, why: "A median is a different statistic entirely — 338.19 is the plain mean over the base rows. The gap is weighting, not statistic choice." },
        { choice: 3, why: "The db is single-currency. The tempting explanation is wrong — the arithmetic error lives in the average of the averages." },
      ],
      difficulty: "hard",
    },
    {
      id: "standardchartered-mcq-24",
      prompt: "ledger_entries carries debits and credits in INTEGER cents; the close certifies both sides at 181,080. Which shape FAILS LOUD — and what does an empty result mean?",
      choices: ["SELECT SUM(debits), SUM(credits) FROM ledger_entries HAVING SUM(debits) <> SUM(credits) — zero rows means the balance holds; one row means the close is broken", "The query must print both sums on every run, and a human compares", "Zero rows means the ledger is empty", "HAVING cannot compare two aggregates"],
      answer: 0,
      why: "The HAVING-only fold prints a row ONLY when debits and credits disagree — an empty result IS the pass condition, the confident zero the close ships on. Any row that does print is the incident: it shows both numbers and their mismatch, which is the ticket the controller opens. Inverting 'empty = broken' into 'empty = certified' is the whole trick.",
      notes: [
        { choice: 1, why: "Printing both sums makes a human the comparator — 181,080 versus 181,081 will ship because someone skimmed. The query should refuse to print when balanced." },
        { choice: 3, why: "HAVING compares aggregates fine — that is its job. The novelty here is using it to print only FAILURES." },
      ],
      difficulty: "hard",
    },
    {
      id: "standardchartered-mcq-25",
      prompt: "Credit's strip shows every settled transaction with its corridor's settled total AND its own share of it — 52 rows, no collapse. Which pair computes it?",
      choices: ["GROUP BY region, then join the totals back", "COUNT(*) OVER () and total / COUNT(*)", "SUM(total) OVER (PARTITION BY region) and 100.0 * total / SUM(total) OVER (PARTITION BY region)", "MAX(total) OVER (PARTITION BY region) and total / MAX(total) OVER (PARTITION BY region)"],
      answer: 2,
      why: "The partition window computes each corridor's settled fold once and exposes it on every row — EU's 6,656.18 sits beside all 24 EU transactions — and the share divides by that same window with 100.0 BEFORE the division so the ratio is real arithmetic. One pass, row grain intact, no join-back to audit.",
      notes: [
        { choice: 0, why: "Correct but heavier: two passes plus a join whose key must be stated. The window is the same fold for free — the interviewer is grading whether you reach for it." },
        { choice: 1, why: "COUNT(*) OVER () counts ROWS (103 booked, or 52 filtered), not VALUE — the 'share' divides one ticket by a row count and prints a nonsense unit." },
      ],
      difficulty: "hard",
    },
    {
      id: "standardchartered-mcq-26",
      prompt: "The financial-crime screen must flag clients with 3+ transfers inside a 60-minute window. Which shape actually sees the GAPS between transfers?",
      choices: ["LAG(created_at) OVER (PARTITION BY client ORDER BY created_at) to measure each gap, then a window check over the 3-row span", "GROUP BY client HAVING COUNT(*) >= 3 — three transfers ever", "WHERE COUNT(*) >= 3 on the transfers table", "SELECT DISTINCT client FROM transfers"],
      answer: 0,
      why: "Structuring is a TIME-SHAPE, not a volume: the same three transfers spread across a week are business as usual, bunched inside an hour they are a screen hit. LAG timestamps each gap; the window check asks whether three consecutive rows fit inside 60 minutes. GROUP BY HAVING counts the LIFETIME — a client with 300 legitimate transfers over a year fails it without ever structuring.",
      notes: [
        { choice: 1, why: "The volume trap: lifetime count and burst detection answer different questions. Every high-activity client flags, and every real structurer with 2 transfers escapes." },
        { choice: 2, why: "COUNT does not exist in WHERE — groups have not formed yet. The engine rejects it, which is the pipeline-order lesson asserting itself." },
      ],
      difficulty: "hard",
    },
    {
      id: "standardchartered-mcq-27",
      prompt: "The committee keeps counterparties rated 4.5 or better AND carrying exposure over 5,000 — rating is a suppliers column, exposure only exists as a SUM of cargo lines. Where do the two thresholds live?",
      choices: ["Both in WHERE — HAVING is legacy syntax", "Both in HAVING — one clause for all filters", "Exposure floor in WHERE, rating in HAVING", "Rating in WHERE (row-level), exposure floor in HAVING (judges the SUM)"],
      answer: 3,
      why: "rating filters each supplier ROW before any fold — WHERE. Exposure does not exist until GROUP BY folds the cargo lines — SUM judged after grouping is HAVING. Splitting them is not style: WHERE exposure > 5000 is a syntax error (no SUM yet at filter time), and HAVING rating >= 4.5 technically runs but states the wrong unit of judgment.",
      notes: [
        { choice: 0, why: "The exposure half cannot live in WHERE — the aggregate does not exist until groups form. The engine rejects it, teaching the pipeline order the hard way." },
        { choice: 2, why: "Swapped: the rating filter would error (or judge a group), and the exposure floor in WHERE references a fold that does not exist yet." },
      ],
      difficulty: "easy",
    },
    {
      id: "standardchartered-mcq-28",
      prompt: "The close packet stacks the four spend-category rows under a labelled TOTAL row in one result. Which build?",
      choices: ["Two queries and a spreadsheet stitch", "UNION ALL of the detail branch and a TOTAL branch whose first column is the literal 'TOTAL' — with the TOTAL branch scanning the UNFILTERED table", "UNION so duplicates vanish", "A CROSS JOIN to a totals table"],
      answer: 1,
      why: "UNION ALL concatenates the branches with no dedupe pass, and the literal 'TOTAL' labels the grand row — the x3-stack shape. The TOTAL branch must re-scan the unfiltered ledger so its figure is the whole book, not the filtered slice. UNION would pay a distinct sort for nothing, and a real duplicate would vanish instead of being investigated.",
      notes: [
        { choice: 0, why: "The spreadsheet stitch is exactly the two-grains-two-numbers drift the packet exists to kill — the stack keeps detail and total on one denominator." },
        { choice: 3, why: "CROSS JOIN multiplies rows — every category row would pair with every total row. Set operators concatenate shaped branches; joins relate them." },
      ],
      difficulty: "easy",
    },
    {
      id: "standardchartered-mcq-29",
      prompt: "The anomaly walk flags settlements dated BEFORE the invoice was issued — prepayments and backdated postings. Which query finds them?",
      choices: ["payments JOIN invoices ON payments.invoice_id = invoices.id WHERE p.paid_on < i.issued_on", "payments WHERE paid_on < issued_on — no join needed", "invoices WHERE status = 'paid'", "payments LEFT JOIN invoices … WHERE invoices.id IS NULL"],
      answer: 0,
      why: "The two dates live in different tables — paid_on in payments, issued_on in invoices — so the comparison REQUIRES the join, then a plain date predicate. The LEFT JOIN anti-join answers the mirror question (payments with no invoice at all — orphans, not early payments), and the status column is a claim, not evidence.",
      notes: [
        { choice: 1, why: "issued_on does not exist in payments — the query fails to compile. Cross-table facts always need the join before the comparison." },
        { choice: 3, why: "That anti-join finds settlement rows pointing at no invoice — a different anomaly. The two error modes are mirrors, and the walk runs both." },
      ],
      difficulty: "easy",
    },
    {
      id: "standardchartered-mcq-30",
      prompt: "Credit utilization = 100.0 * balance / limit — but limit can be 0 or NULL on uncommitted lines. Which expression never divides by zero and never fabricates a band?",
      choices: ["100.0 * balance / limit", "100.0 * balance / COALESCE(limit, 0)", "100.0 * balance / NULLIF(limit, 0) — zero limits return NULL utilization, which the banding CASE must catch explicitly", "balance / limit * 100.0"],
      answer: 2,
      why: "NULLIF(limit, 0) turns the zero-limit case into NULL, so the division yields NULL instead of an error — and the banding CASE then labels NULL utilization explicitly ('no line'), the honest band. COALESCE(limit, 0) manufactures the divide-by-zero it was meant to prevent, and moving 100.0 after the division re-opens the integer-truncation trap.",
      notes: [
        { choice: 0, why: "One zero limit and the whole query errors out mid-close — the loud failure is at least honest, but the band must handle it, not crash." },
        { choice: 3, why: "balance / limit truncates to 0 or 1 first (integer division), then scales — every utilization prints 0 or 100 and the banding is fiction." },
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
    {
      id: "cs-stanchart-3",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-settled dunning list",
      brief:
        "Standard Chartered-flavored brief on the storefront db: the AR pod's dunning draft starts from one anti-join — every fee invoice that carries NO settlement row, biggest bill first. Probed facts: 28 fee invoices against 27 settlement rows; the anti-join returns exactly 6 invoices worth 15,217 — INV-2025-024 (493,700 cents / 4,937.00), INV-2025-026 (3,562.00), INV-2025-027 (2,794.00), INV-2025-028 (1,756.00 — marked 'paid' with zero settlement rows: the status that lies), INV-2024-021 (1,295.00) and INV-2024-018 (873.00). Payment rows are the ledger of record; the status column is a claim. The draft reads biggest billed first.",
      ask: "Return each never-settled invoice with its number, status, billed cents and billed dollars, biggest billed first.",
      template:
        "SELECT i.number,\n       i.status,\n       i.amount_cents AS billed_cents,\n       ROUND(i.amount_cents / 100.0, 2) AS billed_dollars\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {2}\nORDER BY billed_cents {3};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the invoice-preserving join",
          why: "LEFT JOIN keeps all 28 invoices and hands the 6 with no settlement a NULL payload — exactly the rows the dunning draft needs. INNER JOIN would silently delete those 6 rows including anomaly INV-2025-028, and the dunning cycle would run against an empty book while looking clean.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched-row selector",
          why: "p.id IS NULL selects the LEFT JOIN's unmatched rows — invoices with no payment. IS NOT NULL flips the query to the 22 SETTLED invoices, the mirror set, and the dunning draft would remind the clients who already paid.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-billed-first direction",
          why: "The draft chases biggest exposure first: INV-2025-024's 493,700 cents on top, down to INV-2024-018's 87,300. ASC would open the dunning calls on the smallest balance — a correct query aimed at the wrong end of the worklist.",
        },
      ],
      distractors: ["INNER", "NOT NULL", "ASC"],
      walkthrough:
        "The anti-join IS the draft. LEFT JOIN keeps every invoice: 22 match settlement rows, 6 arrive with a NULL payload, and WHERE p.id IS NULL keeps exactly those 6 — INV-2025-024 through INV-2024-018, 15,217 cents of never-collected fees. The dollars column divides by 100.0 BEFORE anything else so 493,700 prints as 4,937.00, cents intact. Two traps the walkthrough names out loud. First, the anomaly: INV-2025-028 sits in this list while marked 'paid' — a status with zero settlement rows behind it, which is why payment rows are the ledger of record and the status column is a claim the walk cross-examines. Second, the mirror: a void invoice WITH a settlement (#11, 925.00) hides from this anti-join entirely — the two error modes never overlap, and both belong on the row-level anomaly list. The distractors fail honestly: INNER deletes the six rows the draft exists to produce; NOT NULL inverts the query into the settled book; ASC inverts the chase order. One join type, one NULL test, one direction — and the close's dunning cycle is defensible line by line.",
    },
    {
      id: "cs-stanchart-4",
      tier: "easy",
      topic: "l8",
      universe: "expense",
      title: "The spend-category census",
      brief:
        "Standard Chartered-flavored brief on the storefront db: the close packet's expense page opens with the category census — entries and cents per category — and the finance pod's rule is that the packet only walks categories carrying at least 5 ledger entries, so one-off program spend does not get its own line. Probed facts: 36 expenses across 4 categories — Rent runs 14 entries for 1,680,000 cents (16,800.00), Ads 14 for 457,000 (4,570.00), Tools 5 for 152,500 (1,525.00), Travel 3 for 252,100 (2,521.00) — so the floor keeps Rent, Ads and Tools and drops Travel, whose 2,521.00 gets a footnote instead of a row. The packet reads biggest spend first.",
      ask: "Return each category with at least 5 entries, showing entry count and total cents, biggest spend first.",
      template:
        "SELECT category,\n       COUNT(*) AS entries,\n       SUM({1}) AS cents\nFROM expenses\nGROUP BY category\nHAVING COUNT(*) >= {2}\nORDER BY cents {3};",
      slots: [
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the money column",
          why: "Spend is SUM(amount_cents) — the INTEGER-cents column the finance tables carry. SUM(id) adds row id codes into a number that looks like money and reconciles with nothing; SUM(vendor) folds text and prints zeros.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the packet's entry floor",
          why: "HAVING COUNT(*) >= 5 keeps Rent (14), Ads (14) and Tools (5) — and the 5 itself prints in the cells as Tools' entry count, the boundary case the floor exists to catch. Loosening it to 3 drags Travel in and the packet gains a row the finance pod explicitly footnoted away.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The packet reads biggest spend on top: Rent 1,680,000, Ads 457,000, Tools 152,500. ASC would open the expense page on Tools — a correct query aimed at the wrong end of the packet, and the fixed-cost story starts with Rent.",
        },
      ],
      distractors: ["COUNT", "vendor", "3", "ASC"],
      walkthrough:
        "One fold, one floor, one direction. GROUP BY category folds 36 expense rows into 4; COUNT(*) reads entry counts (14 / 14 / 5 / 3) and SUM(amount_cents) reads spend in exact cents — 1,680,000 for Rent, which the packet footnotes as 16,800.00 after the /100.0 read at the presentation edge, never mid-pipeline. HAVING COUNT(*) >= 5 applies the finance pod's floor AFTER the fold — a group-level fact judged where the group exists — and keeps three rows: Rent, Ads, Tools. Travel's 3 entries and 252,100 cents drop to a footnote, which is the floor doing its job: one-off program spend does not get a packet line. ORDER BY cents DESC sets the page order. The distractors fail honestly: COUNT inside the SUM nests aggregates and stops the query cold; vendor folds text into zeros; 3 in the floor rescues Travel and breaks the pod's published rule; ASC opens the packet on the smallest line. Census, floor, order — and every number on the page reconciles to the 36-row ledger.",
    },
    {
      id: "cs-stanchart-5",
      tier: "medium",
      topic: "t6",
      universe: "growth",
      title: "The corridor settled-value strip",
      brief:
        "Standard Chartered-flavored brief on the storefront db: credit's concentration strip shows every SETTLED transaction with its corridor's settled total and its own share of that total — 52 rows, no collapse, so the desk can sort by ticket and still see the corridor context beside each row. Probed facts: settled value runs EU 6,656.18 across 24 transactions, APAC 6,617.68 across 21 — a near-tie the committee quotes — then US 1,444.77 across 5 and LATAM 852.44 across 2. The settled population is status 'delivered' only; in-flight and awaiting-docs have no settled value yet. Biggest corridors read first within the strip.",
      ask: "Return every settled transaction with its id, corridor, ticket, its corridor's settled value and its share of that corridor to 1 decimal.",
      template:
        "SELECT o.id,\n       c.region AS corridor,\n       o.total,\n       {1}(o.total) OVER ({2} c.region) AS corridor_settled_value,\n       ROUND(100.0 * o.total / SUM(o.total) OVER (PARTITION BY c.region), 1) AS pct_of_corridor\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = {3}\nORDER BY corridor, o.total DESC;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the settled-value window",
          why: "SUM(total) OVER (PARTITION BY …) folds each corridor's settled value once and attaches it to every row — EU's 6,656.18 beside all 24 EU transactions. COUNT would print a row count wearing a value's name; AVG the mean ticket — both wrong units for a concentration strip.",
        },
        {
          answer: "PARTITION BY",
          kind: "keyword",
          label: "the corridor frame",
          why: "PARTITION BY c.region scopes the fold to each corridor so the share divides by the right denominator. ORDER BY c.region is legal SQL but turns the window into a running total — a growing number, not a corridor constant, and every share divides by the wrong figure.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled population",
          why: "The strip measures settled value: status 'delivered', 52 rows. 'shipped' would measure the in-flight book instead — 30 rows whose value has not settled — and the committee's near-tie narrative (6,656.18 vs 6,617.68) quietly becomes a different table.",
        },
      ],
      distractors: ["COUNT", "AVG", "ORDER BY", "'shipped'"],
      walkthrough:
        "A window strip, not a fold. The WHERE keeps the 52 settled transactions — the population definition the strip's title states — and the join attaches each row's corridor. SUM(total) OVER (PARTITION BY c.region) computes each corridor's settled fold once and exposes it on every row: EU 6,656.18, APAC 6,617.68, US 1,444.77, LATAM 852.44 — which is how the near-tie between the top two corridors stays visible while sorting by ticket size. The share divides each ticket by that same window with 100.0 BEFORE the division: the biggest APAC ticket (625.14) reads 9.4% of its corridor, and no row collapses. This is the window-versus-GROUP BY decision made real: GROUP BY region would print four rows and lose the 52-row detail the desk sorts by; the window keeps every row and adds the context column. The distractors fail honestly: COUNT and AVG wear value's name with the wrong unit; ORDER BY in the window silently rebuilds the fold as a running total, corrupting every share; 'shipped' swaps the population and the strip measures a pipeline instead of a settlement book.",
    },
    {
      id: "cs-stanchart-6",
      tier: "hard",
      topic: "q6",
      universe: "supplier",
      title: "The above-average exposure bench",
      brief:
        "Standard Chartered-flavored brief on the storefront db: before any new financing line, the counterparty committee wants the names whose financed cargo value sits ABOVE the platform's average exposure — staged through a CTE so the mean is computed once and the definition survives the committee argument. Probed facts: the whole book carries 34,833.28 across 6 counterparties, so the mean exposure is 5,805.55; exactly two names clear it — Nordic Gadgets AB at 11,130.25 (EU) and Midwest Hardware Co at 9,294.93 (US) — while Alpine Audio GmbH (4,765.63), Andes Naturals SA (3,613.25), Shenzhen Electro (3,049.07) and Pacific Textiles (2,980.15) sit below. Nordic alone carries 32% of the book — the concentration conversation this read exists to open. Biggest exposure first.",
      ask: "Return each counterparty above the platform's average financed exposure, with its corridor and financed value, biggest first.",
      template:
        "WITH bench AS (\n  SELECT s.name AS counterparty,\n         s.region AS corridor,\n         ROUND(SUM({1}), 2) AS financed_value\n  FROM suppliers s\n  JOIN products p ON p.supplier_id = s.id\n  JOIN order_items ii ON ii.product_id = p.id\n  GROUP BY s.name, s.region\n)\nSELECT counterparty, corridor, financed_value\nFROM bench\nWHERE financed_value > (SELECT {2}(financed_value) FROM bench)\nORDER BY financed_value {3};",
      slots: [
        {
          answer: "ii.quantity * ii.unit_price",
          kind: "keyword",
          label: "the exposure fold",
          why: "Financed cargo value is quantity × unit_price summed at line grain — the definition the committee quotes. SUM(ii.unit_price) alone adds price tags and ignores units; SUM(ii.quantity) counts units, not value. The multiplication IS the business definition.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the platform mean",
          why: "The bar is the average exposure across the staged bench: 34,833.28 / 6 = 5,805.55, and exactly two names clear it. MAX would set the bar at Nordic itself and return an empty bench — a query that proves nobody beats the leader, which was never the question.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The committee reads biggest exposure on top: Nordic 11,130.25, then Midwest 9,294.93. ASC would open on the smaller line — and since the concentration argument is about the 32% name, the order IS the argument.",
        },
      ],
      distractors: ["ii.unit_price", "ii.quantity", "MAX", "ASC"],
      walkthrough:
        "Stage the fold, then judge it against its own mean. The CTE chains suppliers → listings → cargo lines, folds SUM(quantity × unit_price) per counterparty, and rounds to cents — six rows, 34,833.28 total, which the committee can reconcile to the book. The outer query filters that staged grain against the platform mean — the nested SELECT AVG computes 5,805.55 once from the same CTE, so the bar and the bench share one definition — and keeps exactly Nordic Gadgets AB (11,130.25, EU) and Midwest Hardware Co (9,294.93, US). The staging matters for the argument: because the mean is computed over the CTE, adding a counterparty later moves the bar automatically, and the committee can audit the definition in one named place. The distractors fail honestly: unit_price without quantity prices a unit-less book; quantity counts units; MAX sets the bar at the leader and empties the bench; ASC flips the order the argument depends on. Two names above the mean — but one of them is a third of the book, which is why this read precedes any financing line.",
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
    { slug: "ar-aging-schedule", why: "The aging schedule is the dunning backbone: current, 31–60, 61–90, 90-plus buckets over the unpaid fee book — ordered CASE arms with julianday deltas, the exact shape cs-stanchart-3 feeds." },
    { slug: "delinquency-buckets", why: "Delinquency ladders turn exposure into dunning priority — a bucketed fold the AR pod re-runs every close, with the empty-bucket honesty the ops manual publishes." },
    { slug: "settlement-fails-aging", why: "Released-but-unsettled is the bank's working inventory: 30 in-flight transactions aged by how long the release stamp has been open — a conditional count plus a date delta." },
    { slug: "gl-reconciliation", why: "Subledger versus general ledger tie-out: the close ships only when the two sums agree to the cent — the reconciliation shape behind the 181,080-versus-181,080 trial balance." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing: the rollforward identity the ledger's month walks must satisfy — a running-sum drill with a reconciliation check attached." },
    { slug: "prepayment-detection", why: "Settlements dated before the invoice was issued — the anomaly walk's mirror case (#11 is its void twin). A cross-table date comparison that needs the join before the predicate." },
    { slug: "journal-gap-detection", why: "Missing sequence numbers in the posting spine are silent money leaks — the gaps-and-islands drill applied to the one place a gap is never acceptable." },
    { slug: "structuring-detection", why: "Burst-shaped transfers are the financial-crime screen: three instructions inside an hour versus three in a week. LAG gap measurement over a partitioned feed." },
    { slug: "suspicious-bank-account-transactions", why: "Pattern flags over the transaction feed — threshold counts in time buckets — the corridor desk's first-pass surveillance query." },
    { slug: "chargeback-rate-ranking", why: "Rejected share ranked per corridor — the leakage map (APAC 8.1%, EU 6.7%) as a ranked ratio with the 100.0-before-division guard built in." },
    { slug: "credit-utilization-bands", why: "Utilization banded with CASE against limits that can be zero or NULL — the NULLIF guard and the explicit 'no line' band, done the way credit policy demands." },
    { slug: "risk-based-pricing", why: "Fee schedules keyed to a risk tier: an as-of join from the client's band to the price in force — the pricing read the treasury desk quotes on every new mandate." },
    { slug: "portfolio-concentration-hhi", why: "The concentration index formalized: 63.5% of the book with 3,000-plus clients is the story; HHI is the number that quantifies it per corridor and per counterparty." },
    { slug: "expected-credit-loss", why: "ECL is a two-stage fold — probability times exposure, summed per bucket — the nested-aggregate shape credit uses to turn the counterparty ladder into a reserve number." },
    { slug: "dormant-reactivation", why: "Dormant mandates are whitespace with history: clients whose last transaction falls outside the window — an anti-join plus a MAX-date cut the relationship teams live by." },
    { slug: "circular-transfers", why: "A→B→A loops in the transfer graph are the wash-trade signature — self-join pair matching on the corridor feed, the shape the financial-crime walk runs monthly." },
  ],
};
