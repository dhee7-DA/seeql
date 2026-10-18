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
    "Preparation strategy: the pools file carries no BNP Paribas section — **0 tagged LC** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: corridor censuses, fail watches, T+2 clock math, CASE tenor-and-coverage ladders and the cents-safe ledger spine. Do the topics in order, then run the **six case studies** on the live storefront db: the {amber:settlement clock} the desk COO opens with, the {violet:paid-status control} the finance function runs at every close, the client-book ladder with its tied rungs, the trough-month hunt on the regulatory spine, the one-pass book census, and the settlement-rail split treasury reconciles. The bar to clear: *state the denominator, the units and the reference date before you compute anything* — then make every status census reconcile to 103 by construction. This expanded kit is built for spaced practice rather than one sitting: run a case, come back a week later, and rebuild it from a blank editor — *the second pass is where recall actually forms*."
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "maximum-transaction-each-day"],
    },
    {
      name: "Two-grain corridor folds",
      why: "Flows and counterparties are different grains of the same join, and every corridor census here reports both: the EU book runs 45 flows from 8 counterparties while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "chargeback-rate-ranking"],
    },
    {
      name: "Counterparty joins & survival",
      why: "Counterparties carry corridor and onboarding date; flows inherit them through joins, and the join type decides who survives. A flow without a counterparty is corruption; a counterparty without flows is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "sales-analysis-ii"],
    },
    {
      name: "Settlement-fail anti-joins",
      why: "The fail watchlist is an anti-join: receivables LEFT JOINed to settlement legs, kept only when the leg never lands — 6 never-collected worth 15,217 on this db. Writing it with NOT IN over an unguarded column empties the watchlist silently, which is how a control function ships a false all-clear.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "find-churn-risk-customers", "prepayment-detection"],
    },
    {
      name: "Client-book leaderboards",
      why: "Coverage reviews rank counterparties by flow count where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5, then FOUR counterparties tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer coverage, not syntax.",
      slugs: ["rank-scores", "top-earners", "find-the-team-size", "credit-utilization-bands", "top-percentile-fraud"],
    },
    {
      name: "The T+2 settlement clock",
      why: "Settlement lag is julianday(shipped_at) - julianday(created_at) over stamped flows: 2.98 days average inside a 2–4 band, 3.07 in the US against 2.93 in APAC. Duration math over two timestamps — with the unstamped 21 rows excluded by a stated filter, never silently skipped.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "users-with-two-purchases-within-seven-days", "consecutive-transactions-with-increasing-amounts", "sessionize-events"],
    },
    {
      name: "Regulatory month spines",
      why: "Regulatory and management reporting bucket the 14-month flow spine (2024-01 to 2025-02) by SUBSTR(created_at, 1, 7) — the trough month reads 1,193.86 against an opening 3,731.97. LAG and LEAD walk it; the wrong '%m' bucket merges Januaries two years apart and the pack mis-files.",
      slugs: ["monthly-transactions-i", "biggest-window-between-events", "the-latest-login-in-2020", "npv-queries", "time-weighted-return"],
    },
    {
      name: "CASE ladders: tenor, coverage, delinquency",
      why: "Banking classifications are CASE ladders — 30-day documentary tenor versus aging buckets, exact versus partial versus no settlement. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the provision, and a reordered WHEN quietly re-buckets the exposure.",
      slugs: ["delinquency-buckets", "loan-types", "weather-type-in-each-country", "risk-based-pricing", "delinquency-roll-rates"],
    },
    {
      name: "Books of record & cents discipline",
      why: "Status is a claim; the settlement legs and the ledger are evidence. Receivables and legs carry INTEGER cents — the dollar read is amount_cents / 100.0 — and the trial balance must land 181,080 against 181,080, delta zero. Reconciliation queries are how a universal bank proves the close.",
      slugs: ["trial-balance-check", "gl-reconciliation", "bank-account-summary-ii", "loan-amortization-schedule", "realized-pnl-average-cost"],
    },
    {
      name: "Threshold gates & nested folds",
      why: "Screens escalate into staging: fold flow counts per counterparty, then judge them against a computed book average, or gate corridors by a floor. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted — a control that returns nothing must say why.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "second-highest-salary", "portfolio-concentration-hhi", "value-at-risk", "circular-transfers"],
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
    {
      id: "bnpparibas-t9",
      q: "A booked-value SUM doubles after someone joins orders to order_items to enrich flows with instrument legs. Walk me through the diagnosis and the fix.",
      a: "Diagnose by counts before touching the query: run COUNT(*) on orders alone — 103 — then on the join — 251. The jump IS the fan-out: instrument legs multiplying each flow. The fix depends on the grain you owe the reviewer: for flow-grain value, pre-aggregate the legs to flow grain in a CTE (SUM by order_id), then join; for leg-grain reads, keep the join but count entities with COUNT(DISTINCT o.id) and let every ratio state its denominator. The trap to name out loud: SUM(o.total) after the join repeats each flow's total once per leg, inflating booked value by roughly 2.4x on this db. The before-and-after count is the habit the control review grades.",
      tag: "joins",
    },
    {
      id: "bnpparibas-t10",
      q: "Receivables get classified exact / partial / no-settlement at every close. What makes a CASE ladder safe in a control function?",
      a: "Four properties. The arms are exhaustive — every row must land somewhere, because a hole in the CASE is a hole in the provision. The arms are ordered from most specific to catch-all, with an explicit ELSE that catches the residue rather than silently NULLing it. The arms are NULL-aware — SUM over a receivable with no legs returns NULL, so both the equality and less-than tests come back UNKNOWN and the ELSE is what prints 'no payment'. And the arms are reorder-proof by review: a swapped WHEN quietly re-buckets the exposure. The proof is the census reading 21 exact / 1 partial / 6 none — 28 receivables, all classified, none lost.",
      tag: "case-when",
    },
    {
      id: "bnpparibas-t11",
      q: "The corridor pack stacks settled flows above in-flight flows per corridor. UNION or UNION ALL — and what column keeps the stack auditable?",
      a: "Default to UNION ALL and add a branch-label literal column: 'settled' on the first branch, 'in flight' on the second. UNION ALL is a raw concatenation — cheap, order-preserving, and correct when every row belongs. A bare UNION adds a dedupe pass, and its failure mode is silent: two branches that emit byte-identical rows (same corridor, same counts, no label) collapse into one and the pack loses a corridor with no error anywhere. The label column makes collisions structurally impossible and shows the reviewer where each row came from. Say WHY duplicates are impossible in a query comment — in a bank, the comment is the correctness argument.",
      tag: "set-ops",
    },
    {
      id: "bnpparibas-t12",
      q: "Where does a WITH clause earn its keep in a settlement-ops query — and what belongs inside each CTE?",
      a: "Three buys: readability (a chain named stamped_flows, never_collected, coverage reads like the settlement process instead of a nested subquery), reuse (one CTE feeds several later references — the counterparty fold written once, consumed twice), and auditability (the definition lives where the reviewer can see it, which is how a metric survives the control review). Inside each CTE: filter early so later stages carry fewer rows, and name the population in the CTE name itself — stamped_flows says '82 of 103' before anyone reads the WHERE. CTEs are logical staging, not guaranteed materialization, so the early-filter discipline still matters.",
      tag: "ctes",
    },
    {
      id: "bnpparibas-t13",
      q: "Money is INTEGER cents across invoices, payments, expenses and the ledger. State your conversion and rounding policy end to end.",
      a: "Aggregate in cents, convert once, round at the edge. Every dollar read is amount_cents / 100.0 — the .0 is not decoration, it is the difference between 1,756.00 and an integer 1756, and the missing divisor has shipped hundredfold print errors to real regulators. Never ROUND mid-pipeline: a rounded intermediate discards precision a later SUM still needs. Stay in INTEGER or NUMERIC until the last step; SQLite REALs are IEEE doubles and compare-money-with-tolerance is the only safe comparison against them. The proof the policy works: the trial balance lands 18,108,000 debits against 18,108,000 credits, delta zero — which is only checkable because nothing was rounded away en route.",
      tag: "numbers",
    },
    {
      id: "bnpparibas-t14",
      q: "The desk head asks for the settled-flow rate. What do you pin down before writing the SELECT?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the numerator (status 'delivered' — 52 flows), the denominator (ALL booked flows — 103 — because in-flight and pending are exactly what the metric watches), the window (since inception? trailing month?), and the population statement that goes on the slide ('settled ÷ booked, 82 stamped flows cited separately'). Then the discipline move: encode it as a named CTE — settled_flows AS (SELECT … WHERE status = 'delivered') — so the SQL IS the definition and the reviewer audits text instead of arguing with you. The panel's favorite follow-up is 'what's in your base?'; the analyst who answered it before writing the query owns the room.",
      tag: "metrics",
    },
    {
      id: "bnpparibas-t15",
      q: "Feeds re-deliver booking rows after cutoff. How do you dedupe to the latest version, and where does the deterministic tie-breaker matter?",
      a: "Detect first: GROUP BY the flow key and HAVING COUNT(*) > 1 — that is the incident report. Then the keep-latest shape: ROW_NUMBER() OVER (PARTITION BY flow_key ORDER BY received_at DESC) in a CTE, keep rn = 1. The tie-breaker matters when two deliveries share a timestamp — without a second key (rowid, a sequence column) the 'latest' pick is arbitrary and unreproducible, which is a finding in itself. And the bank-specific rule: never DELETE the duplicates from the book of record — version them. The ledger keeps history; the read query picks the current version. A dedupe that destroys rows is a bigger audit finding than the duplicates were.",
      tag: "windows",
    },
    {
      id: "bnpparibas-t16",
      q: "Settlement lag is julianday(shipped_at) - julianday(created_at). Why julianday, why not raw subtraction, and what does the 2.98 actually measure?",
      a: "Raw TEXT subtraction applies numeric affinity: '2024-01-05' - '2024-01-02' reads each string's leading number (2024) and subtracts — 0. julianday() parses the full timestamp into a REAL day count, so the 2.98-day average is honest arithmetic over the 82 stamped flows, inside a 2-to-4-day band. What 2.98 measures — and what you say out loud — is booked-to-settled over the stamped population only: the 14 pending and 7 busted have no cycle yet and must not dilute the average. The corridor cuts (US 3.07, LATAM 3.5, EU 2.94, APAC 2.93) all fold up into that one number, which is why the population line ships on the slide.",
      tag: "dates",
    },
    {
      id: "bnpparibas-t17",
      q: "Why does SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) print a 0 for LATAM's cancellations, while COUNT of a bare comparison lies?",
      a: "Because COUNT counts non-NULL inputs, and a bare comparison is never NULL. status = 'cancelled' returns 0 or 1 for every row — both non-NULL — so COUNT of it prints the group size, not the cancellations. The CASE with ELSE 0 builds an explicit 0/1 flag the SUM can add: LATAM's zero cancellations print 0, honestly. COUNT(CASE WHEN … THEN 1 END) works too, because rows failing the WHEN become NULL and COUNT skips them — three forms, one denominator, and the FILTER (WHERE …) twin as SQLite's native fourth. The skill being graded is choosing deliberately and knowing why the others break.",
      tag: "nulls",
    },
    {
      id: "bnpparibas-t18",
      q: "Corridor AOVs read EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. Why is their average not the bank's average flow value, and what do you compute instead?",
      a: "Because an unweighted mean weights every corridor equally regardless of size — LATAM's 2 flows count as much as the EU's 45, and the four-number average (364.67) describes a book that does not exist. The true average flow value is SUM(total)/COUNT(*) over the base rows: 338.19, where LATAM barely registers. The honest blends are re-aggregation from the base (sum the numerators, divide by the summed denominators) or the weighted average — SUM(aov * flows)/SUM(flows) — the same arithmetic one level up. The interview move is saying WHERE the weighting lives: an average of averages is correct only when every group has equal counts, and that is a claim you defend, not assume.",
      tag: "aggregation",
    },
    {
      id: "bnpparibas-t19",
      q: "Compare each flow to ITS corridor's average value. Correlated subquery or window — and what changes in cost and semantics?",
      a: "The correlated form — WHERE total > (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id IN the same corridor) — re-evaluates once per outer row: readable, correct, and quadratic-ish at book scale. The window form computes each partition's average once: AVG(total) OVER (PARTITION BY c.region) — and it keeps every row, so the flow and its corridor baseline sit side by side for the review, which the correlated filter cannot show. The third shape is the join to a derived table of per-corridor averages — set-based, plan-friendly. Semantics differ too: the window answers 'show me every flow beside its corridor norm'; the correlated filter answers 'keep only the outliers'. At BNP scale, the window or derived form is the default and the correlated form is the explainer.",
      tag: "subqueries",
    },
    {
      id: "bnpparibas-t20",
      q: "The month filter SUBSTR(created_at, 1, 7) = '2024-03' is slow on the flow book. Why, and what is the sargable twin?",
      a: "Because wrapping the column in a function defeats any index: the engine must compute SUBSTR on every row before comparing. The sargable twin is the half-open range — created_at >= '2024-03-01' AND created_at < '2024-04-01' — same rows, index-usable, and honest about the boundary (the SUBSTR form catches March's last night only by luck of string truncation). The habits that compound on warehouse-sized books: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT * so unread payloads stop crossing the wire; probe with LIMIT before committing to the full run. These are not micro-optimizations — they are the difference between a pack that renders before the corridor call and one that times out during it.",
      tag: "performance",
    },
    {
      id: "bnpparibas-t21",
      q: "WHERE rejected a filter on your running-sum column. Walk me through the clause order and the staging fix.",
      a: "Logical evaluation runs FROM and JOIN, then WHERE, then GROUP BY, then HAVING, then SELECT — where window functions live — then ORDER BY, then LIMIT. The running sum is SELECT-stage work, so it does not exist when WHERE executes; neither do SELECT aliases. The fix is staging: put the window in a CTE or derived table, then filter the staged output in the outer query — the two-step behind every 'keep only flows where the cumulative crosses the corridor limit' read. The one asymmetry worth saying out loud: ORDER BY can use SELECT aliases, because it runs after them. Narrating the order before writing is the cheapest debugging tool an analyst has.",
      tag: "pipeline",
    },
    {
      id: "bnpparibas-t22",
      q: "What do the void-with-a-leg receivable (#11) and the paid-with-no-legs receivable (#28) prove about status columns — and how does the close prove it?",
      a: "That status is a claim and the legs are evidence — and the two error modes are mirrors. #28 claims 'paid' with zero settlement legs: the anti-join (LEFT JOIN … p.id IS NULL) catches it. #11 is void but carries a 925.00 leg: it never appears in that anti-join, because the mirror anomaly needs the flip check (legs against void status). Both reconcile to a row-level anomaly list, not to vibes — which is why the control function runs both directions every close. Then the book of record has the final word: the trial balance must land 18,108,000 against 18,108,000, delta zero, and the coverage census must read 21 exact / 1 partial / 6 never-collected. Statuses lie; legs and the ledger do not.",
      tag: "quality",
    },
    {
      id: "bnpparibas-t23",
      q: "The cumulative booked-value walk 'jumps two flows at once' on a shared value date. Explain the frame and the fix.",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats ORDER BY ties as peers, so flows sharing a value date enter the cumulative in one step. On a month spine ties are rare; at settlement grain they are guaranteed, because value dates are business dates, not timestamps. The fix is declaring the frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly flow by flow. The deeper point is that the default was making a business decision silently — peers-with-peers is correct for tier totals and wrong for a strict walk — and a control query should never leave that decision to the parser.",
      tag: "windows",
    },
    {
      id: "bnpparibas-t24",
      q: "How do you compute client concentration — and what does 63.5% commit the coverage pod to?",
      a: "A two-layer fold at two grains: fold lifetime value per counterparty (GROUP BY customer_id), gate at the threshold (3,000), then re-aggregate the qualifying flows over the whole book — 22,121.70 of 34,833.28, or 63.5% (71.2% at the 2,000 gate). The number commits the pod because it is the concentration metric that staffs coverage teams and sizes the mandate-review committee: when nearly two-thirds of the book sits with a handful of counterparties, one lost mandate moves a quarter. The follow-up the panel expects: the threshold sensitivity — 63.5 at 3,000 versus 71.2 at 2,000 says the tail is dense, and the HHI view (sum of squared shares) is the regulator's version of the same story. State both grains before you compute: the threshold at client grain, the share at book grain.",
      tag: "metrics",
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
    {
      id: "bnpparibas-mcq-11",
      prompt: "The desk head wants the whole status census — settled, in-flight, awaiting, busted — printed in ONE pass over the flow table. Which shape does it?",
      choices: [
        "Four sequential queries stapled together in the deck",
        "COUNT(*) beside COUNT(*) FILTER (WHERE status = …) for each stage — one scan, all branches sharing the 103 denominator",
        "SELECT status, COUNT(*) FROM orders — one row per status",
        "COUNT(*) OVER (PARTITION BY status) attached to every row",
      ],
      answer: 1,
      why: "FILTER (WHERE …) is a conditional count: rows failing the predicate aren't counted for that aggregate, so one scan prints 52, 30, 14, 7 beside COUNT(*) = 103 — and the arms reconcile by construction. Sequential queries are four chances to drift; the reconciliation identity is the whole control.",
      notes: [
        { choice: 2, why: "GROUP BY status is a fine census but a different shape: four rows, no total column, and the sum-back-to-103 identity is manual. The one-row read is what the morning call quotes." },
        { choice: 3, why: "The window attaches per-status counts to every row without collapsing — 103 rows wearing census numbers, not a one-row census." },
      ],
      difficulty: "easy",
    },
    {
      id: "bnpparibas-mcq-12",
      prompt: "`SELECT COUNT(DISTINCT SUBSTR(created_at, 1, 7)) FROM orders` runs on the flow spine. What prints — and what is the bucket set?",
      choices: ["2 — one per year", "103 — one per flow", "14 — one bucket per month, 2024-01 through 2025-02", "16 — one per counterparty"],
      answer: 2,
      why: "SUBSTR(created_at, 1, 7) cuts the ISO timestamp to the zero-padded 'YYYY-MM' key — 14 distinct buckets across the spine. COUNT(DISTINCT) folds 103 booked flows into the bucket set the regulatory pack files on.",
      notes: [
        { choice: 0, why: "SUBSTR(..., 1, 4) would give the 2 year buckets; length 7 keeps the month. The spine is monthly, not annual." },
        { choice: 1, why: "DISTINCT collapses flows to buckets — 103 rows in, 14 values out. Without DISTINCT you'd be counting flows, not months." },
      ],
      difficulty: "easy",
    },
    {
      id: "bnpparibas-mcq-13",
      prompt: "Collections opens the dunning draft with an anti-join: receivables LEFT JOINed to settlement legs, kept only where no leg ever landed. What comes back?",
      choices: ["3 receivables worth 4,559", "22 receivables worth 65,612", "6 receivables worth 15,217 — one of them marked 'paid' with zero legs", "1 receivable worth 1,756"],
      answer: 2,
      why: "The anti-join keeps the 6 never-collected receivables totaling 15,217 — including #28, the one whose status claims 'paid' while no settlement leg exists. The 21 exact-settled (65,612) are the anti-join's complement, not its answer.",
      notes: [
        { choice: 1, why: "That's the settled book — precisely the rows the anti-join excludes. The watchlist is the NULL payload side." },
        { choice: 3, why: "#28 (1,756.00) is one row of the six — the anomaly worth its own ticket, not the whole watchlist." },
      ],
      difficulty: "easy",
    },
    {
      id: "bnpparibas-mcq-14",
      prompt: "`SELECT COUNT(DISTINCT region) FROM customers` runs on the counterparty book. What prints?",
      choices: ["16 — one per counterparty", "4 — the booking corridors: EU, US, APAC, LATAM", "103 — one per flow", "8 — the EU book alone"],
      answer: 1,
      why: "16 counterparties collapse to their 4 booking corridors. DISTINCT's output size is a property of the column's cardinality: region holds four values no matter how many counterparties carry them.",
      notes: [
        { choice: 0, why: "16 is the row count — the whole point of DISTINCT is that it folds the book down to its value set." },
        { choice: 3, why: "8 is the EU corridor's counterparty count — one corridor, not the corridor map." },
      ],
      difficulty: "easy",
    },
    {
      id: "bnpparibas-mcq-15",
      prompt: "The desk head rejects a status census whose branches read 52 + 30 + 14 + 6. What is the professional objection?",
      choices: [
        "The four branches must partition the book and reconcile to 103 by construction — a 6 means a filter is silently dropping a cancelled flow",
        "The total should be 100, not 103",
        "The percentages were rounded wrong",
        "Pending flows should be excluded from the total anyway",
      ],
      answer: 0,
      why: "The four status arms are a partition: every one of the 103 flows sits in exactly one branch, so the branches must sum to the booked total. A 6 instead of 7 means a WHERE is eating rows — and in correspondent banking, a number that cannot be tied is a number that does not exist.",
      notes: [
        { choice: 3, why: "Pending stays in: 'not yet' is exactly what the funnel watches. Excluding it hides the affirmation queue and breaks the identity from the other side." },
        { choice: 2, why: "Rounding is downstream. The missing row is upstream — find the filter, not the formatter." },
      ],
      difficulty: "easy",
    },
    {
      id: "bnpparibas-mcq-16",
      prompt: "The opex ledger holds 36 lines; Rent runs 14 of them for 1,680,000 cents. Which fold prints lines and cents correctly in one pass?",
      choices: [
        "COUNT(amount_cents) for lines and nothing else",
        "AVG(amount_cents) WHERE category = 'Rent'",
        "SUM(CASE WHEN category = 'Rent' THEN 1 ELSE 0 END) for lines beside SUM(amount_cents) for cents — 14 and 1,680,000",
        "MAX(amount_cents) WHERE category = 'Rent'",
      ],
      answer: 2,
      why: "Lines and cents are two aggregates with two meanings: COUNT the 0/1 CASE flags for 14 lines, SUM the cents for 1,680,000 ($16,800). Both share one scan and one denominator — the conditional-aggregate habit every BNP readout uses.",
      notes: [
        { choice: 1, why: "AVG prints the per-line average (120,000 cents) — a number nobody budgets with. The bill is the sum, not the mean." },
        { choice: 3, why: "MAX prints Atlas Property's largest single invoice, not the 16,800-dollar annual rent run-rate." },
      ],
      difficulty: "easy",
    },
    {
      id: "bnpparibas-mcq-17",
      prompt: "COUNT(*) reads 103 on the flow table; COUNT(shipped_at) reads 82. What is the 21-row gap, and what do you do with it?",
      choices: [
        "Exactly the 14 pending plus 7 busted flows — unstamped by definition, and they belong in the report's population line",
        "Data loss — escalate to engineering before shipping anything",
        "Duplicate flows — run the keep-latest dedupe",
        "The 7 cancelled flows only — pending ones carry stamps",
      ],
      answer: 0,
      why: "The gap between the row count and the stamped count is precisely the flows with no value date — 14 awaiting affirmation plus 7 busted. It's a feature: state the population (82 of 103 stamped) and the T+2 clock defends itself.",
      notes: [
        { choice: 1, why: "Nothing is lost — NULL stamps are the honest state of un-affirmed flows. A missing stamp is a lifecycle stage, not a pipeline incident." },
        { choice: 3, why: "The 14 pending are in the gap too. Half a population line is still a wrong population line." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-18",
      prompt: "MIN and MAX of julianday(due_on) - julianday(issued_on) both read 30 across all 28 receivables. One feed row would read 45. What is that?",
      choices: ["A longer negotiated tenor — report it as a fact", "Rounding drift inside julianday", "A billing-feed defect: the documentary tenor is flat 30, so 45 is a data incident to ticket before the aging cut", "A leap-day calendar artifact"],
      answer: 2,
      why: "On this book the documentary tenor is flat 30 — average, min and max all 30 — so a 45 is a feed defect, not a credit fact. Ticket it before the aging buckets are cut, because a 45-day row lands in the wrong bucket and misstates the ladder.",
      notes: [
        { choice: 0, why: "This book has no negotiated tenors; 'report it' ships a mis-filed aging bucket to the regulator." },
        { choice: 2, why: "julianday returns exact REAL day counts — no drift at a 30-day scale." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-19",
      prompt: "The coverage ledger prints settled cents per receivable. #28 has no settlement legs, so SUM(p.amount_cents) returns NULL. What's the display fix — and the trap?",
      choices: [
        "WHERE paid_cents IS NOT NULL — hide the incomplete rows",
        "COALESCE(SUM(p.amount_cents), 0) around the aggregate, so #28 prints 0 of 1,756 and survives the dunning merge",
        "IFNULL(p.amount_cents, 0) inside the SUM",
        "CAST the SUM to INTEGER",
      ],
      answer: 1,
      why: "Guard the aggregate's RESULT: SUM over no rows is NULL, and COALESCE outside folds the missing legs into an honest 0 — #28 then reads 0 of 1,756, which the dunning merge can join on. IFNULL inside SUM fabricates a cent per missing row; filtering deletes the very anomaly the control exists to surface.",
      notes: [
        { choice: 2, why: "Wrapping the INPUT turns each missing payment into 1 cent of fake money. The guard belongs outside the SUM, not inside it." },
        { choice: 0, why: "#28 — paid status, zero legs — is the finding. Deleting it ships a false all-clear to the close." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-20",
      prompt: "The client ladder reads 24, 17, 14, 13, 5 flows, then FOUR counterparties tied at 4. A stakeholder asks for 'top 5' and ships LIMIT 5. What silently happened?",
      choices: [
        "Nothing — the ties at 4 count as rank 5",
        "The four tied counterparties are excluded without a word — LIMIT cuts rows, not ties, and the shared rung 6 never prints",
        "They appear, ranked 6 through 9",
        "The query errors on the tie",
      ],
      answer: 1,
      why: "LIMIT 5 returns exactly five rows and the 4-flow tie block (shared rung 6 under RANK or DENSE_RANK) vanishes silently. If peers matter, cut on rank — keep the whole shared rung — and let the threshold be a policy, not a row count.",
      notes: [
        { choice: 2, why: "LIMIT knows nothing of ranks; those four rows never reach the output. Only a rank-threshold query keeps them." },
        { choice: 0, why: "Under any rank function the four 4s share rung 6 — which is outside the top five by every policy." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-21",
      prompt: "Five receivables settled with one leg on each rail — a card leg and a wire leg apiece. Which fold proves the split-settlement census in one query?",
      choices: [
        "SELECT invoice_id, COUNT(*) FROM payments GROUP BY invoice_id HAVING COUNT(*) = 2",
        "SELECT invoice_id, method FROM payments WHERE method = 'card,wire'",
        "SELECT invoice_id, GROUP_CONCAT(method) FROM payments GROUP BY invoice_id — rows reading 'card,wire' are the both-rails receipts",
        "SELECT DISTINCT method FROM payments",
      ],
      answer: 2,
      why: "GROUP_CONCAT folds each receivable's legs into one string cell — 'card,wire' is the both-rails receipt, and counting those rows (5) is the split-settlement census treasury reconciles. The comma is GROUP_CONCAT's output, not stored data.",
      notes: [
        { choice: 0, why: "Finds the five 2-leg receivables but hides WHICH rails — the follow-up question stays unanswered. Fold the method list, not just the count." },
        { choice: 1, why: "method stores 'card' or 'wire'; no row matches the concatenated literal. The match fails silently and the census reads zero." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-22",
      prompt: "`SUM(total) OVER (PARTITION BY c.region ORDER BY o.created_at)` walks the booked value. What does the PARTITION BY buy the corridor read?",
      choices: [
        "It restarts the running sum at every corridor — the EU walk ends at 15,089.23 without inheriting APAC's accumulation",
        "It sorts the output by region",
        "It dedups the corridors",
        "It makes the window faster",
      ],
      answer: 0,
      why: "PARTITION BY scopes the window: each corridor's accumulation starts from zero and lands on that corridor's book — EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. Without it one global window smears every flow into a single 34,833.28 cumulative.",
      notes: [
        { choice: 1, why: "ORDER BY inside OVER does the sequencing; PARTITION decides where sums reset. Different clauses, different jobs." },
        { choice: 2, why: "No dedup exists in the clause — it's a scoping boundary, and the flows it scopes are all still there." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-23",
      prompt: "Q1 2024 flows for the regulatory pack: which WHERE clause catches every booking, including the last night of March?",
      choices: [
        "WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'",
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'",
        "WHERE SUBSTR(created_at, 1, 6) <= '2024-03'",
        "WHERE MONTH(created_at) <= 3",
      ],
      answer: 1,
      why: "The half-open range keeps every timestamp below April 1 — including '2024-03-31 23:59:59', which BETWEEN '…-03-31' string-drops. Quarter-end is exactly when desks front-load bookings, so the dropped night is the busiest one.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends and '23:59:59' sorts after '2024-03-31' — the last night vanishes from the pack." },
        { choice: 2, why: "SUBSTR comparisons are the fragile, unsargable cousin of the same idea. The range is correct and index-usable." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-24",
      prompt: "Settlement legs store INTEGER cents. Which expression prints the average leg in dollars?",
      choices: [
        "AVG(amount_cents / 100)",
        "AVG(amount_cents) / 100.0",
        "ROUND(AVG(amount_cents), 2)",
        "AVG(amount_cents) * 100.0",
      ],
      answer: 1,
      why: "amount_cents / 100 is integer division per row — a 92,500-cent leg truncates to 925 before averaging, and the cents are gone row by row. Average the true cents, then scale once at the presentation edge with /100.0.",
      notes: [
        { choice: 0, why: "A systematic under-read: every row loses its cents before the average, and nothing in the output announces it." },
        { choice: 2, why: "ROUND of an integer average is that integer — it never converts scale, only presentation." },
      ],
      difficulty: "medium",
    },
    {
      id: "bnpparibas-mcq-25",
      prompt: "A desk analyst reports 'average flow value' as AVG(o.total) after joining orders to order_items for the instrument legs. The book holds 103 flows and 251 legs. What was actually averaged?",
      choices: [
        "The true 338.19 average flow value",
        "A leg-weighted average — multi-leg flows enter the mean once per leg, dragging it off the flow grain",
        "The average leg price",
        "NULL — AVG cannot run across a join",
      ],
      answer: 1,
      why: "The join fans 103 flows out to 251 rows, so each flow's total repeats once per leg and AVG divides by 251, not 103 — flows with more legs dominate. Compute the 338.19 average on orders alone, or pre-aggregate per flow before averaging.",
      notes: [
        { choice: 2, why: "AVG(o.total) still reads the flow-total column, just over fanned-out rows; the leg price would be AVG(ii.unit_price) — a different metric with a different name." },
        { choice: 3, why: "The distortion is duplication, not NULLs. Totals are NOT NULL here." },
      ],
      difficulty: "hard",
    },
    {
      id: "bnpparibas-mcq-26",
      prompt: "ledger_entries holds 80 rows across four accounts. Which single query proves the book of record balances — and what must it return?",
      choices: [
        "SUM(debit_cents) - SUM(credit_cents) over the whole ledger — it must return 0: 18,108,000 against 18,108,000",
        "SUM(debit_cents) alone — 18,108,000",
        "COUNT(*) — 80 rows",
        "A per-account fold of debits",
      ],
      answer: 0,
      why: "The trial balance is the debit-minus-credit identity, and the close ships only when the delta reads 0 — here 18,108,000 cents against 18,108,000. The per-account fold (cash, AR, opex, revenue) is the next diagnostic, not the proof.",
      notes: [
        { choice: 1, why: "One side of the identity proves nothing — 18,108,000 of debits is only meaningful against 18,108,000 of credits." },
        { choice: 2, why: "Row count says nothing about double-entry. A corrupt book can be complete-looking and still unbalanced." },
      ],
      difficulty: "hard",
    },
    {
      id: "bnpparibas-mcq-27",
      prompt: "The month spine walks booked value with LAG. The 2024-01 row's delta prints NULL, and a teammate wraps it: COALESCE(delta, 0) 'so the chart starts at zero'. What's wrong?",
      choices: [
        "Nothing — NULL and 0 chart identically",
        "The first month has no baseline; a 0 reads as 'flat versus prior month', inventing a comparison that never happened — label it 'baseline' or leave the NULL",
        "LAG needs a PARTITION BY to produce the first row",
        "Chart libraries cannot render NULLs anyway",
      ],
      answer: 1,
      why: "LAG returns NULL on the first row because no prior row exists — the honest value is 'unknown baseline', and the real opening level is 3,731.97. Coalescing to 0 asserts the book opened flat, which trips the trend review. The fix is presentation: label the edge row, never fabricate its history.",
      notes: [
        { choice: 0, why: "'No comparison' and 'no change' are different claims — only one of them is true, and the deck must not choose silently." },
        { choice: 2, why: "The walk is one global series; a PARTITION BY would split it, not repair the edge." },
      ],
      difficulty: "hard",
    },
    {
      id: "bnpparibas-mcq-28",
      prompt: "The booking feed re-delivers rows after cutoff; a flow can land twice. Which read keeps exactly the freshest version per flow, deterministically?",
      choices: [
        "SELECT DISTINCT * FROM orders",
        "GROUP BY id keeping MAX(total)",
        "ROW_NUMBER() OVER (PARTITION BY id ORDER BY shipped_at DESC, rowid DESC) = 1 staged in a CTE — keep rn = 1",
        "WHERE created_at = (SELECT MAX(created_at) FROM orders)",
      ],
      answer: 2,
      why: "ROW_NUMBER per flow key, newest first, with an explicit tie-breaker for rows sharing a stamp, is the deterministic keep-latest shape — one row per flow, the re-delivery collapsed, the pick never arbitrary. DISTINCT only removes byte-identical rows; MAX(total) conflates value with recency.",
      notes: [
        { choice: 0, why: "A re-delivered row with any drifted column survives DISTINCT. Dedupe needs a key and an order, not luck." },
        { choice: 3, why: "The latest booking date across the whole book picks one flow globally — not one version per flow." },
      ],
      difficulty: "hard",
    },
    {
      id: "bnpparibas-mcq-29",
      prompt: "The coverage pod quotes 63.5% — booked value from counterparties whose lifetime spend crosses 3,000. Which query shape computes it?",
      choices: [
        "A two-layer fold: per-counterparty SUM in a derived table, then sum the flows whose counterparty book clears 3,000 over the whole 34,833.28 — 22,121.70 of it",
        "WHERE total > 3000 on the raw flows, then SUM(total)",
        "AVG(total) grouped by customer",
        "COUNT(*) WHERE total >= 3000",
      ],
      answer: 0,
      why: "The threshold lives at the COUNTERPARTY grain (lifetime spend), while the share lives at the flow grain — fold first (GROUP BY customer_id), then re-aggregate the qualifying flows over the full book. Row-level filtering at 3,000 mixes grains and answers a question nobody asked.",
      notes: [
        { choice: 1, why: "'Flows above 3,000' is a different population from 'counterparties whose lifetime book clears 3,000' — the whole point of the metric." },
        { choice: 2, why: "An average erases the concentration question instead of answering it." },
      ],
      difficulty: "hard",
    },
    {
      id: "bnpparibas-mcq-30",
      prompt: "Two analysts write the fail watchlist differently: LEFT JOIN … WHERE p.id IS NULL, and WHERE NOT EXISTS (SELECT 1 FROM legs WHERE legs.invoice_id = i.id). Both return 6 rows. What's true?",
      choices: [
        "Only the LEFT JOIN version is correct SQL",
        "NOT EXISTS fails when the subquery returns NULL",
        "They return the same rows — both are NULL-safe anti-joins; NOT EXISTS tests for a matching row and never trips on a NULL the way NOT IN does",
        "The LEFT JOIN version doubles every row",
      ],
      answer: 2,
      why: "Both shapes are the anti-join, and both are NULL-proof where NOT IN is not — EXISTS probes for a matching row and short-circuits, so a NULL in the compared column can't poison the verdict. Pick by readability and plan, not correctness: on this book both return the same 6 never-collected receivables.",
      notes: [
        { choice: 1, why: "That is precisely NOT IN's failure mode — three-valued logic. EXISTS is immune to it." },
        { choice: 3, why: "An anti-join keeps each left row once. Fan-out comes from forgetting the IS NULL guard, not from the join shape itself." },
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
    {
      id: "cs-bnpparibas-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The client-book ladder",
      brief:
        "BNP-flavored brief on the storefront db: the coverage pod opens the relationship review with the client-book ladder — counterparties ranked by booked flows, with ties sharing rungs rather than being split arbitrarily. Probed facts: the ladder reads 24, 17, 14, 13, 5 flows (Alice Chen, Emma Wilson, Grace Kim, Maya Patel, Chloe Dubois), then FOUR counterparties tied at 4 (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez) and two at 3 (Farid Nasser, Hiro Tanaka). The floor is set at 3 flows so both tie blocks stay inside the read and the rank policy is testable in the output.",
      ask: "Return each counterparty with 3-plus booked flows: name, corridor, flow count and a no-gap ladder rank, busiest first.",
      template:
        "SELECT c.name AS counterparty,\n       c.region AS corridor,\n       COUNT(*) AS flows,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS ladder_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.region\nHAVING COUNT(*) >= {3}\nORDER BY ladder_rank, flows DESC, c.name;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap rung function",
          why: "DENSE_RANK packs the four-way 4 tie onto one shared rung 6 and the two 3s onto rung 7 — eleven rows, nine rungs, no gaps. RANK would stamp the 3s as rank 10, inventing phantom rungs 8 and 9 that no counterparty occupies; ROW_NUMBER would split peers arbitrarily across 6 through 9.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "Busiest first means the window orders by descending flow count, so Alice Chen's 24 takes rung 1. ASC would hand rung 1 to the two 3-flow counterparties — a correct query aimed at the quiet end of the book, and the coverage plan would follow it there.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the floor",
          why: "The floor keeps 11 of the 16 counterparties, so both tie blocks — the four 4s and the two 3s — stay visible and the rank policy is testable on the page. Raising it to 4 trims the 3s and the gap question disappears from the read entirely.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A census, a floor, and a policy about shared rungs. GROUP BY counterparty folds 103 flows into 16 books; HAVING COUNT(*) >= 3 keeps the 11 names with real volume — the floor judges a per-counterparty aggregate, which is why it lives in HAVING and not WHERE. The window then ranks the folded counts: Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13 and Chloe Dubois 5 take rungs 1 through 5 alone, the FOUR 4-flow counterparties share rung 6, and the two 3-flow names share rung 7 — eleven rows, nine rungs, no gaps. That gap-free property is the whole point: RANK would promote the 3s to rank 10, quietly asserting empty rungs 8 and 9 that imply four missing counterparties, and ROW_NUMBER would break the peer group arbitrarily — a silent judgment about whose relationship team gets the credit. Flip the window's direction to ASC and the quietest names are crowned. The outer ORDER BY (rank, then flows DESC, then name) keeps the printed ladder deterministic, because a ladder that shuffles between runs is a ladder nobody defends.",
    },
    {
      id: "cs-bnpparibas-4",
      tier: "medium",
      topic: "q6",
      universe: "month-close",
      title: "The trough-month hunt",
      brief:
        "BNP-flavored brief on the storefront db: the regulatory pack files a monthly flow spine — 14 buckets from 2024-01 to 2025-02 — and the control's opening line is the trough: the month the book ran lightest, quoted at every close. Probed facts: monthly booked value opens at 3,731.97 (2024-01), fades to 1,193.86 in 2024-07 and recovers to 2,390.53 by 2025-02; the runner-up quiet months read 1,648.80 (2024-11) and 1,669.50 (2025-01). The spine must bucket on the month key, never the raw timestamp.",
      ask: "Return the single weakest month by booked value: month key, flow count and value to 2 decimals.",
      template:
        "WITH spine AS (\n  SELECT {1} AS month,\n         COUNT(*) AS flows,\n         SUM(total) AS value\n  FROM orders\n  GROUP BY month\n)\nSELECT month, flows, ROUND(value, 2) AS value\nFROM spine\nORDER BY value {2}\nLIMIT {3};",
      slots: [
        {
          answer: "SUBSTR(created_at, 1, 7)",
          kind: "keyword",
          label: "the month key",
          why: "SUBSTR(created_at, 1, 7) cuts the ISO timestamp to 'YYYY-MM' — the 14-bucket month key the pack files on. The bare created_at groups by full timestamp (103 single-flow buckets), and shipped_at re-times every settled flow by value date while dumping the 21 unstamped into one NULL bucket.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the lightest-first direction",
          why: "Weakest month means ascending value order with LIMIT 1 — 2024-07 at 1,193.86. DESC would return the opening month's 3,731.97, the peak, wearing the trough's name on the slide.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the single-row cut",
          why: "LIMIT 1 pins the one trough row the memo quotes. Widening to 3 pulls the runner-ups (1,648.80 and 1,669.50) into a ranking the control never asked for — useful context for the walkthrough, wrong for the deliverable.",
        },
      ],
      distractors: ["created_at", "shipped_at", "DESC", "3"],
      walkthrough:
        "Stage the spine, then hunt the trough. The CTE folds 103 flows into 14 monthly buckets on the SUBSTR month key — the same key every regulatory read files on — carrying each month's flow count and booked value. The outer query sorts by value ascending and keeps one row: 2024-07, 8 flows, 1,193.86 — the trough the close quotes, with 2024-11 (1,648.80) and 2025-01 (1,669.50) as the quiet runner-ups the memo footnotes. The two-stage shape matters: the month key only exists once the CTE has built it, and the outer SELECT rounds once, at the presentation edge, so the cents stayed intact through the fold. The distractors fail honestly: grouping on the raw timestamp shatters the spine into 103 single-flow buckets and the 'month' becomes fiction; grouping on shipped_at invents a NULL bucket for the 21 unstamped flows and re-times every settled one by value date; DESC returns the 3,731.97 peak wearing the trough's title; and LIMIT 3 returns a top-three ranking nobody requested. One row, one figure, one provable population.",
    },
    {
      id: "cs-bnpparibas-5",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass book census",
      brief:
        "BNP-flavored brief on the storefront db: the desk head opens the morning call with the one-pass status census — booked, settled, in-flight, awaiting and busted in a single scan of the flow table, because four sequential queries are four ways to drift. Probed facts: 103 flows booked; 52 settled (delivered), 30 in flight (shipped), 14 awaiting affirmation (pending), 7 busted (cancelled) — and the arms must reconcile to 103 by construction, every morning, or the day starts with an incident.",
      ask: "Return one row: booked flows plus the four stage counts, printed in a single pass.",
      template:
        "SELECT COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE status = {1}) AS settled,\n       COUNT(*) FILTER (WHERE status = {2}) AS in_flight,\n       COUNT(*) FILTER (WHERE status = {3}) AS awaiting,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS busted\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled literal",
          why: "Settled flows are status 'delivered' — 52 on the book. 'cancelled' would print the 7 busted flows under the settled name, and the reconciliation identity breaks on sight: 52 + 30 + 14 + 7 stops tying to 103.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight literal",
          why: "In flight is 'shipped' — affirmed and moving but not final: 30 rows. Anything else in this slot mislabels the affirmation queue the ops floor actually works from.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the awaiting literal",
          why: "Awaiting affirmation is 'pending' — 14 flows with no value-date stamp yet. 'open' is invoice vocabulary, not a flow status: the FILTER would count zero and the queue would vanish from the census while the query still runs clean.",
        },
      ],
      distractors: ["'cancelled'", "'open'", "COUNT"],
      walkthrough:
        "One scan, five numbers, zero drift. COUNT(*) prints the booked total 103; each FILTER (WHERE …) branch is a conditional count that skips rows failing its predicate — delivered 52, shipped 30, pending 14, cancelled 7 — and the four arms sum back to 103 by construction, because every flow carries exactly one status. That reconciliation identity is the desk head's first check: a census that does not tie is an incident, not a rounding note. The FILTER form is SQLite's native conditional count; the portable twin is SUM(CASE WHEN status = … THEN 1 ELSE 0 END), which prints the same four numbers off the same scan with the same shared denominator. The distractors fail honestly: 'cancelled' in the settled slot relabels the book (52 becomes 7) and the identity collapses; 'open' counts nothing because no flow carries that status — an honest zero that still reads as a broken census; and COUNT in a slot errors the query outright. One pass, one denominator, every stage named — and the morning call starts on time.",
    },
    {
      id: "cs-bnpparibas-6",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The settlement-rail census",
      brief:
        "BNP-flavored brief on the storefront db: treasury reconciles the two settlement rails every close — card, the local instant-clearing leg, and wire, the cross-border SWIFT/SEPA leg — folding legs, distinct receivables, settled cents and average days-to-pay per rail against the billing book. Probed facts: 27 settlement legs in total — card runs 16 legs over 16 receivables for 3,736,400 cents, wire runs 11 legs over 11 receivables for 3,224,800; five receivables paid split, one leg per rail. Days-to-pay averages 29.4 on card against 28.5 on wire — instant is the transfer, not the payer.",
      ask: "Return one row per rail: rail name, leg count, distinct receivables, settled cents, and average days from issue to payment at 1 decimal, busiest rail first.",
      template:
        "SELECT p.method AS rail,\n       COUNT(*) AS legs,\n       COUNT(DISTINCT p.invoice_id) AS receivables,\n       SUM(p.amount_cents) AS settled_cents,\n       ROUND(AVG(julianday(p.paid_on) - julianday(i.{1})), 1) AS avg_days\nFROM payments p\nJOIN invoices i ON i.id = {2}\nGROUP BY p.method\nORDER BY settled_cents {3};",
      slots: [
        {
          answer: "issued_on",
          kind: "keyword",
          label: "the clock's start date",
          why: "Days-to-pay runs from the issue date: julianday(p.paid_on) - julianday(i.issued_on). Swapping in due_on measures days-past-due — a different control with a different sign — and paid_on measures the leg against itself, a flat zero wearing a clock's name.",
        },
        {
          answer: "p.invoice_id",
          kind: "keyword",
          label: "the leg-to-receivable key",
          why: "Each settlement leg points at its receivable: i.id = p.invoice_id. i.id = i.id matches every invoice to every leg — a 756-row cross product that prints fiction in every fold while the query runs clean.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-rail-first direction",
          why: "Busiest rail first means descending settled cents: card's 3,736,400 on top, wire's 3,224,800 under it. ASC would open the reconciliation on the smaller rail — a correct query aimed at the wrong end of the memo.",
        },
      ],
      distractors: ["paid_on", "due_on", "i.id", "ASC"],
      walkthrough:
        "One join, one fold, two rails. The join attaches each settlement leg to its receivable on i.id = p.invoice_id; GROUP BY p.method folds the 27 legs into two rows: card 16 legs over 16 distinct receivables for 3,736,400 cents, wire 11 over 11 for 3,224,800 — together the 69,612 dollars the ledger's cash account carries in settlements. COUNT(DISTINCT p.invoice_id) earns its slot because five receivables paid split — one card leg plus one wire leg — and the distinct count proves no rail double-counts a receivable it shares. The clock reads paid_on against issued_on through julianday: 29.4 days on card, 28.5 on wire, both against the flat 30-day tenor — instant is the transfer, not the payer. The distractors fail honestly: due_on re-bases the clock to days-past-due (a negative-leaning number wearing the same column name); paid_on folds the leg against itself and prints zeros; i.id = i.id cross-joins 27 legs against 28 invoices; and ASC hands the smaller wire rail the top line. The fold reconciles upward to the book of record, which is the only reconciliation treasury signs.",
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
    { slug: "delinquency-roll-rates", why: "Roll rates move receivables between delinquency buckets month over month — the coverage pod's early-warning read on the trade-finance book before provisions move." },
    { slug: "credit-utilization-bands", why: "Utilization banding is how CIB credit watches committed lines; CASE banding plus a fold is the exact shape of the quarterly facility review." },
    { slug: "risk-based-pricing", why: "Pricing ladders off risk bands — this drill is the CASE-banded rate table the trade-finance desk applies to tenor and counterparty grade." },
    { slug: "loan-amortization-schedule", why: "Amortization schedules prove principal-plus-interest walks balance to zero — the same schedule-integrity discipline the ledger control demands." },
    { slug: "prepayment-detection", why: "Settlement legs arriving on void receivables are prepayments in the wrong costume — this detection shape feeds the anomaly list the close walks line by line." },
    { slug: "top-percentile-fraud", why: "Percentile gates flag the fattest tickets for review; the surveillance desk's first pass over booked flow is exactly this percentile cut." },
    { slug: "chargeback-rate-ranking", why: "Ranking rails and corridors by reversal share is the ops readout that decides which rail gets a remediation project next quarter." },
    { slug: "portfolio-concentration-hhi", why: "HHI over counterparty books quantifies the concentration the pod quotes as 63.5% — one number regulators recognize on sight." },
    { slug: "value-at-risk", why: "VaR is a tail quantile over P&L — the window-and-quantile grammar risk teams use daily, drilled on the desk's own numbers." },
    { slug: "npv-queries", why: "Discounting cash flows by period is the trade-finance pricing spine; this drill is the time-value math behind the documentary fee ladder." },
    { slug: "time-weighted-return", why: "TWR chains period returns without cash-flow distortion — the treasury read on deposit products, and a strict window exercise to boot." },
    { slug: "realized-pnl-average-cost", why: "Average-cost P&L is the running-fold pattern behind every inventory-of-position book the markets desk keeps." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Escalating-amount streaks are a laundering signature; window-over-sequence detection is the financial-crime desk's bread and butter." },
    { slug: "maximum-transaction-each-day", why: "Peak-day flow per counterparty feeds the liquidity plan — an argmax fold the corridor desks run every morning." },
    { slug: "circular-transfers", why: "Flows that cycle back to their origin are a correspondent-banking red flag; self-join pairing is how the desk spots the loop." },
    { slug: "sessionize-events", why: "Sessionizing counterparty activity by time gaps turns the flow spine into reviewable episodes — the surveillance team's segmentation primitive." },
  ],
};
