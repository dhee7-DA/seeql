// HDFC Bank — Wave-9 (Task 98-hdfc), banking domain, 0 tagged sql rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12), case cells re-probed against
// db/custom.db (read-only) before authoring.
// India-scale retail banking: the storefront db read as a cards-and-deposits sandbox —
// customers are retail customers across four zone buckets (the db carries them as
// EU / APAC / US / LATAM codes), orders are card/UPI transactions (delivered = settled
// clean, shipped = captured-and-settling with shipped_at as the settlement stamp,
// pending = authorized-awaiting-capture, cancelled = declined/bounced), order_items are
// itemized terminal/merchant lines, products are the product shelf (card, deposit and
// lending SKUs by family), suppliers are the merchant-acquiring/correspondent bench,
// invoices are monthly card statement cycles, payments are debit legs on two rails
// (card rail / interbank wire rail — INTEGER paise, the rupee read is always
// amount_cents / 100.0), expenses are branch-and-network opex, ledger_entries is the
// double-entry book of record. Distinct from icici (the private-bank sibling): the
// bigger cards engine, the statement-cycle month-close, and the 2023 HDFC Ltd
// merger-integration story run through the prose.
// Pool provenance: company-pools.md carries NO HDFC section (0 tagged rows) — so all
// 10 topic slug sets and all 16 problems are theme-curated from the pools file's
// theme menu (sql rows only, no w*/d*/f* rows) and say so. Case briefs quote probed
// figures from scripts/company-facts.md; every case slot is mechanically verified
// against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const hdfcKit: CompanyKit = {
  id: "hdfc",
  domainId: "banking",
  name: "HDFC Bank",
  tagline: "India-scale retail banking: cards, UPI flows, the deposit franchise",
  accent: "text-sky-300",

  brief: [
    "**HDFC Bank** is India's largest private-sector bank — the retail franchise that pairs one of the country's biggest card engines with a deposit book of hundreds of millions of accounts, UPI-scale digital rails, and, since the 2023 merger with parent HDFC Ltd, a mortgage book stitched into a commercial bank. Every analyst here learns the same truth early: a status column is a claim, a rail hit is evidence — authorization, capture and settlement are different events, and reports that blur them are how a cards P&L starts lying. On this training db the mapping is honest: the 16 customers rows are retail customers across four {sky:zone buckets}, the 103 orders are card/UPI transactions worth **34,833.28** (average ticket 338.19 against a 25.47 to 1,088.44 spread), and the 251 order_items rows are itemized terminal/merchant lines. The status map is fixed: delivered = {emerald:settled clean} (52, 50.5%), shipped = captured-and-settling (30, 29.1%), pending = authorized-awaiting-capture (14), cancelled = {rose:declined/bounced} (7, 6.8%).",
    "The data org splits into retail payments analytics, the cards portfolio pod, and deposits-and-branch analytics, and they read one spine at different grains. A transaction books at created_at; `shipped_at` is the settlement stamp — **82 of 103 transactions** carry it, averaging a 2.98-day capture lag with a 2–4 day spread, and the 14 pending rows have none yet (a population definition, not a cleanup job). Money sits one layer down in INTEGER paise, where the rupee read is `amount_cents / 100.0`: 28 monthly card statement cycles — 21 paid for 66,443, 6 open at 19,609, 1 void at 925 — clear on two rails, the {emerald:card rail} (16 legs for 37,364) and the {sky:interbank wire rail} (11 legs for 32,248). Concentration is the third story: 63.5% of the book sits with customers whose lifetime spend crosses 3,000 (71.2% above 2,000) — one high-value household moves a zone's month.",
    "Interview screens are census-then-denominator, with a reconciliation chaser. A loop opens with the **two-grain zone census** — EU runs 45 transactions from just 8 customers (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into the {rose:decline map} where the interviewer asks the denominator out loud ('does a declined transaction still count in your zone base?'), then into the statement coverage census — **21 exact, 1 partial** (4,000 of 6,148 debited), **6 never-debited worth 15,217** — where membership is rail evidence, not the status column. The {rose:anomaly pair} is the famous follow-up: a void statement that still drew its 925 debit, and a paid-status statement at 1,756 with zero legs at all. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no HDFC section — 0 tagged sql rows — so every topic slug and all sixteen problems here are **theme-curated** to this kit's known screen shapes: authorization-fate funnels, two-grain zone censuses, statement-cycle coverage, risk buckets, rails and the GL tie-out. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {rose:authorization fate census} the cards risk huddle opens with every week, the other rebuilds the {emerald:statement settlement audit} the month-close team ships. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction, and every paise fold divide by 100.0 exactly once.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the authorization-to-settlement refresh. A cards analyst opens the zone dashboard before standup: did overnight captures land, did any settlement stamp land without a merchant line, does the one-pass fate census reconcile — 52 settled clean + 30 capturing + 14 awaiting auth + 7 declined = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the capture lag drifts off the **2.98-day** norm, the acquiring-partner queue gets pulled before the weekly decline map goes out.",
    "**11:30 —** Midday is the portfolio deep-dive. The cards pod wants the customer-value ladder with the four-way tie at 4 transactions handled honestly — shared rungs, named policy; risk wants the decline map re-cut — {rose:APAC 8.1%} against EU 6.7% and US 5.3%; the deposits pod wants spend per household beside household counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the portfolio-review argument*.",
    "**15:30 —** The afternoon tilts toward the close. The statement anti-join refreshes first — **6 never-debited cycles worth 15,217** — before any reminder campaign fires; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the dunning draft; and the anomaly pair gets walked line by line: a void-but-debited statement (#11, 925.00) and a paid-status cycle with zero debit legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Settled-clean share", what: "Transactions settled clean ÷ ALL transactions booked: 52 of 103 (50.5%). Captured-and-settling (30) is a different stage — calling it settled inflates the book before a single cycle closes." },
    { name: "Capture lag", what: "Booking to settlement stamp (created_at → shipped_at) over stamped transactions only: 82 of 103, 2.98-day average, range 2–4. The population ships with the number — the 14 pending rows have no lag yet and must not dilute it." },
    { name: "Average ticket", what: "Sum(total) ÷ transactions: 338.19 against a 25.47 to 1,088.44 spread. The spread IS the segmenting story — one 1,088.44 ticket outweighs the smallest 42 combined." },
    { name: "Decline share by zone", what: "Declined ÷ all transactions booked, per zone: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The risk huddle's opening map — and the denominator (placed, not settled) is the whole interview." },
    { name: "Household concentration", what: "Share of the book from customers spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs relationship managers and sizes the premier desk." },
    { name: "Statement coverage", what: "Cycles settled by debit legs, not status: 21 exact (65,612), 1 partial (4,000 of 6,148), 6 never-debited worth 15,217. The month-close census — leg evidence, never the claimed status." },
    { name: "Rails mix", what: "Debit legs by rail: card/UPI retail rail 16 legs for 37,364 versus interbank wire rail 11 legs for 32,248 — 27 legs carrying 69,612 total. Five statements were settled on split plans that cross both rails." },
    { name: "Ledger integrity", what: "The book of record ties: 181,080 debits against 181,080 credits across 80 entries, delta 0 — cash legs at 69,612 debits, receivables at 86,052. A delta that isn't zero pages the close, not the analyst." },
  ],

  topics: [
    {
      name: "Settled-versus-captured counting",
      why: "Every HDFC cards screen opens with the fate chain: authorized, captured, settled clean, declined. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a captured transaction 'settled' — 30 versus 52 on this db — and the second trap is dividing by the settled book instead of the placed book.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "trial-to-paid-funnel"],
    },
    {
      name: "Two-grain zone censuses",
      why: "Transactions and customers are different grains of the same join, and every census here reports both: EU runs 45 transactions from 8 customers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Customers joined to transactions",
      why: "Customers carry zone and home-branch city; transactions inherit them through joins, and the join type decides who survives. A transaction with no customer is corruption; a customer with no transactions is cross-sell whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "sales-analysis-ii"],
    },
    {
      name: "The merchant-acquirer bench",
      why: "Card spend lands through acquiring partners, and the bench report is a joins-plus-aggregates fold: listings per partner, settled spend routed through each, the partnership-quality floor that decides who stays on the shelf. The grain trap is terminal lines versus SKUs — one SKU can ring through dozens of terminals.",
      slugs: ["product-sales-analysis-i", "average-selling-price", "find-stores-with-inventory-imbalance"],
    },
    {
      name: "Statement cycles & the debit ledger",
      why: "Settled is not debited — the finance tables (28 statement cycles, 27 debit legs, INTEGER paise) are where the cards world meets money. Every rupee read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the raw leg fold.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Risk buckets with CASE",
      why: "Card-risk reporting is CASE-classified — decline bands, utilization tiers, DPD buckets — with fixed edges the risk committee publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the risk report, and a reordered WHEN quietly re-buckets the book.",
      slugs: ["delinquency-buckets", "credit-utilization-bands", "weather-type-in-each-country"],
    },
    {
      name: "Fraud & anomaly screens",
      why: "HDFC's fraud screens hunt patterns in flows: velocity spikes, structuring under reporting walls, duplicate charge pairs, anomaly z-scores. Each is a conditional aggregate with a stated population — and the interviewer checks whether your screen's denominator includes what your alert excludes.",
      slugs: ["structuring-detection", "amount-anomaly-zscore", "duplicate-charge-pairs"],
    },
    {
      name: "The customer-value ladder",
      why: "Premier-desk reporting ranks households by lifetime spend where ties are guaranteed — four customers sit at 4 transactions each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer households, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Month spines & capture-lag math",
      why: "The 14-month transaction spine (2024-01 to 2025-02) is the portfolio call's home turf, and the capture clock is julianday(shipped_at) - julianday(created_at) over the 82 stamped rows. LAG drives the walk — the trough (1,193.86 in July) and the first row's NULL are both definitions, never zeros.",
      slugs: ["biggest-window-between-events", "average-time-of-process-per-machine", "the-latest-login-in-2020"],
    },
    {
      name: "GL discipline & the close",
      why: "The ledger is the book of record — 80 entries, 181,080 debits against 181,080 credits, delta 0 — and every close report must tie back to it. Screens here probe whether you can stage a fold, classify it, and prove the tie-out; a number that can't reach the GL is a rumor, not a read.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward"],
    },
  ],

  theory: [
    {
      id: "hdfc-t1",
      q: "Your zone report joins customers to transactions. When do you INNER and when do you LEFT — and what silently breaks if you filter a transaction status in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A settled-spend report joins transactions to customers: a transaction with no customer row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A cross-sell whitespace report must be LEFT from customers: the customers with no transactions ARE the answer, arriving with NULL transaction columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload customer row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-transacting customers — all 16 households appear in the book somewhere — and proving that zero, rather than assuming it, is exactly the habit an HDFC reviewer grades.",
      tag: "joins",
    },
    {
      id: "hdfc-t2",
      q: "Four customers tie at 4 transactions on the value ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which relationship manager keeps the household. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer households (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at then id — and writing it in the query comment, because the premier desk will ask.",
      tag: "windows",
    },
    {
      id: "hdfc-t3",
      q: "The census shows 103 transactions and 16 customers; EU shows 45 transactions and 8 customers. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts transaction rows after the join — one row per transaction, so a household with 24 transactions contributes 24. COUNT(DISTINCT customer_id) folds those rows back to customers — EU's 45 transactions collapse to 8 households. Neither is wrong: transactions measure engagement load and card momentum, customers measure installed base and coverage. The ratio — 5.6 transactions per household in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for terminal lines and COUNT(*) silently counts terminal lines, not transactions — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "hdfc-t4",
      q: "shipped_at is NULL until a transaction settles. What is your policy for the capture-lag report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only settled-and-capturing transactions have a lag, so the report measures booking-to-settlement for the 82 of 103 transactions that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL transactions returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 authorized-awaiting-capture plus 7 declined rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average — that invents same-day settlements for captures that have not started, and in a bank that is not a rounding choice, it is a misstatement of the settlement clock.",
      tag: "nulls",
    },
    {
      id: "hdfc-t5",
      q: "The portfolio review wants settled value per zone for zones carrying at least ten transactions. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards capturing, pending and declined rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-transaction floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a zone line and an error, and between a threshold applied to transactions versus to rupees. On this db the household view is spikier than the zone view: the top household carries 24 transactions and the fifth carries 5, so the same floor keeps four households and drops the rest. The strong answer places every filter by asking: is this a fact about one transaction, or about a zone?",
      tag: "pipeline",
    },
    {
      id: "hdfc-t6",
      q: "WHERE total > (SELECT AVG(total) FROM transactions) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 transactions always produce a mean (338.19 on this db, against a 25.47 to 1,088.44 spread). On filtered staging tables — one zone, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each transaction to ITS customer's average) re-runs per outer row and answers a different question at a different cost — the premier desk wants household-relative reads, not platform-relative ones, and the two produce different lists. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "hdfc-t7",
      q: "The trend report buckets transactions by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's captures, and month-end is exactly when card volume lands. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The walk itself tells the story on this db: the book opens at 3,731.97 in January, troughs at 1,193.86 in July, and November carries the steepest slide alongside 2 of the 7 declines. Date discipline is portfolio discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "hdfc-t8",
      q: "The statement table says a cycle is 'paid' but the debit-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN debit legs, keep p.id IS NULL — on this db that returns 6 cycles worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why rail rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a debit leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612 foots both sides), 1 partial (4,000 of 6,148), 6 never-debited — and the void-but-debited #11 folds into exact by construction, which is the follow-up the panel loves. The money rule: statements and legs carry INTEGER paise, so every rupee read is amount_cents / 100.0 — the missing .0 quietly truncates on odd paise — and the ledger trial balance must land at 181,080 debits against 181,080 credits, delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "hdfc-mcq-1",
      prompt: "A transaction row's status reads 'shipped'. In this kit's HDFC stage map, what happened?",
      choices: ["Settled clean — the cycle closed", "Captured and settling — stamped, not yet at term end", "Declined at authorization", "Authorized, awaiting capture"],
      answer: 1,
      why: "The stage map is fixed: shipped = captured-and-settling (30 of 103 transactions, 29.1%), with shipped_at as the settlement stamp. It is in flight, not closed.",
      notes: [
        { choice: 0, why: "Settled clean is 'delivered' — 52 transactions. Calling captured volume settled inflates the settled book by 30 rows before any cycle closes." },
        { choice: 3, why: "Authorized-awaiting-capture is 'pending' — 14 rows with no settlement stamp yet. Pending is not in-flight settlement; it has not even captured." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-2",
      prompt: "Capture rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 stamped, 14 pending and 7 declined of 103 booked.",
      choices: ["Stamped + declined only (82/89 = 92.1%)", "All transactions booked (82/103 = 79.6%)", "Settled-clean only (52/82)", "Distinct customers (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL transactions booked — pending authorizations stay in the denominator because 'not yet captured' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the population still in flight — the rows the capture clock exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel stages into one rate — settled-clean is term completion, shipped_at is the capture stamp. Different stages, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-3",
      prompt: "EU carries 45 transactions from 8 customers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts transaction rows (45); COUNT(DISTINCT customer_id) folds repeats back to households (8). The gap between them — 5.6 transactions per household — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every transaction has a customer. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts zones, not customers — a third grain nobody asked for. The census is transactions AND households." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division in the decline-share map?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to declined transactions only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the decline share truncates toward 0 and every zone reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between EU's 6.7 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.067 to 0 first, then scales — the decline map reads zero in every zone." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-5",
      prompt: "Keep only customers carrying at least 10 transactions. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY customer HAVING COUNT(*) >= 10", "WHERE transactions >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A transaction-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the ladder clears the bar at 24, 17, 14 and 13 transactions — four households.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'transactions' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-6",
      prompt: "Statement #28 is marked 'paid' but has zero debit legs. In the coverage census (exact / partial / none), where does it land — and why?",
      choices: ["exact — the status column says paid", "partial — some settlement exists", "none — membership is rail evidence, not the status claim", "It is excluded from the census entirely"],
      answer: 2,
      why: "Coverage is classified from the leg fold: settled paise versus billed paise. #28 has 0 legs, so settled = 0 and it lands in 'none' — one of the 6 never-debited cycles worth 15,217. The status column is a claim; the legs are evidence.",
      notes: [
        { choice: 0, why: "Classifying by status is the exact bug the census exists to catch — it would hide a 1,756 receivable behind a label that no rail row supports." },
        { choice: 1, why: "Partial requires legs that cover SOME of the bill — that is #25 (4,000 of 6,148). Zero legs is 'none', not partial." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending transactions double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 transactions.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-8",
      prompt: "The value ladder runs 24, 17, 14, 13, 5 transactions, then FOUR customers tied at 4. Under RANK, what rank do the two 3-transaction customers carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-transaction customers share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The premier desk's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "hdfc-mcq-9",
      prompt: "A staging-table cross-sell list uses customer_id NOT IN (SELECT customer_id FROM transactions WHERE status = 'declined') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every transaction carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty cross-sell lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "hdfc-mcq-10",
      prompt: "A month-close report flags transactions whose ticket exceeds the platform average on a ONE-ZONE staging table, and the report returns zero rows. The zone genuinely has tickets. Diagnosis?",
      choices: ["The zone really has no above-average tickets — averages always have a tail", "The scalar subquery's inner fold came back empty on the filtered staging table, returned NULL, and total > NULL is UNKNOWN for every row — the report silently empties", "The comparison needs an index to evaluate", "The report should use MAX instead of AVG"],
      answer: 1,
      why: "A scalar subquery is 0-or-1 rows; on a filtered staging table the inner fold can return zero rows, the comparison becomes NULL/UNKNOWN, and the above-average filter hides the bug — a valid-looking report with no rows. State the inner fold's population and its empty-case behavior before shipping the filter.",
      notes: [
        { choice: 0, why: "Plausible — but 'average always has a tail' is exactly the rationalization that ships the bug. On the full book the mean is 338.19 and above-mean tickets exist; an empty result on a subset is a definition failure, not a fact." },
        { choice: 3, why: "MAX changes the question entirely — every ticket fails a > MAX comparison, so the report would be empty by construction, not by data." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-hdfc-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The authorization fate census",
      brief:
        "HDFC-flavored brief on the storefront db: Monday's cards risk huddle opens with the authorization fate census — settled clean, captured-and-settling, authorized-awaiting-capture, declined — and the decline share whose denominator is ALL transactions booked in the zone, declined or not. Probed facts: 103 transactions worth 34,833.28; the grid reads APAC 37 booked with 21 settled clean and 3 declined (8.1%), EU 45 with 24 settled and 3 declined (6.7%), US 19 with 5 settled and 1 declined (5.3%), LATAM 2 with 2 settled and none declined (0). The huddle reads the worst decline share first.",
      ask: "Return each zone with its settled, capturing, awaiting-auth and declined counts plus the decline share to 1 decimal, worst decline share first.",
      template: `SELECT c.region AS zone,
       COUNT(*) FILTER (WHERE o.status = {1}) AS settled_book,
       COUNT(*) FILTER (WHERE o.status = 'shipped') AS in_flight,
       COUNT(*) FILTER (WHERE o.status = 'pending') AS awaiting_auth,
       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS declined,
       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), {3}) AS decline_share
FROM orders o
JOIN customers c ON c.id = {2}
GROUP BY c.region
ORDER BY decline_share {4}`,
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled-clean literal",
          why: "Settled clean is status 'delivered' — 24 of EU's 45, 21 of APAC's 37, 5 of the US's 19, 2 of LATAM's 2. 'shipped' would count the 30 captured-and-settling rows as settled and the census double-counts the funnel's middle.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the zone-join key",
          why: "The join attaches every transaction to its customer's zone: ON c.id = o.customer_id. Swapping sides joins the transaction's id against the customer's id — a keys-collide fan-out that reads every zone from the wrong grain.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "The decline map reports to 1 decimal — APAC 8.1, EU 6.7, US 5.3, LATAM 0 — matching the risk huddle's published grid. ROUND(…, 0) floors the map to 8/7/5/0 and the slides stop reconciling with the weekly pack.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The huddle reads the worst decline share on top: APAC 8.1, EU 6.7, US 5.3, LATAM 0. ASC opens the meeting on LATAM's clean 0 — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "'pending'", "ASC"],
      walkthrough:
        "One join, one pass, five arms. The join attaches every transaction to its zone via c.id = o.customer_id, and each FILTER (WHERE …) branch counts its own fate in a single scan: settled clean reads 24 / 21 / 5 / 2 for EU, APAC, US, LATAM, capturing 12 / 8 / 10 / 0, awaiting auth 6 / 5 / 3 / 0, declined 3 / 3 / 1 / 0 — and the whole grid reconciles to 103 by construction (52 + 30 + 14 + 7). The decline share is a denominator story: 100.0 sits before the division so the ratio stays real, and ROUND(…, 1) prints APAC 8.1, EU 6.7, US 5.3, LATAM 0 — the exact grid the risk pack quotes, ordered worst-first. The distractors fail honestly: 'shipped' or 'cancelled' in the settled arm re-counts the middle of the funnel; 'pending' there reads 6 / 5 / 3 / 0; any of them in the join key matches nothing and the census empties; ASC in the ORDER BY opens the meeting on LATAM. The read behind the grid: APAC's decline share is 1.5x EU's on similar volume — the zone conversation the huddle is actually having.",
    },
    {
      id: "cs-hdfc-2",
      tier: "medium",
      topic: "q6",
      universe: "month-close",
      title: "The statement-cycle settlement audit",
      brief:
        "HDFC-flavored brief on the storefront db: at month-close the card-statement book (28 cycles) must reconcile against the debit-leg table (27 legs), and coverage is classified from the leg fold — never from the claimed status. Probed facts: 21 cycles settle exact with 65,612 footing both sides, 1 is partial (#25: 6,148 billed, 4,000 debited), and 6 have no debit legs at all, worth 15,217 — including #28, a paid-status cycle at 1,756 with zero legs. The mirror anomaly: #11 is void but drew its full 925 debit, so it folds into exact by construction. Five statements were settled on split plans (1, 5, 12, 19, 22). The close reads biggest bucket first.",
      ask: "Classify every statement exact / partial / none from its leg fold, with paise foots on both sides, biggest bucket first.",
      template: `WITH legs AS (
  SELECT i.id AS stmt_id,
         i.amount_cents AS billed_cents,
         COALESCE(SUM({1}), {2}) AS settled_cents
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = {3}
  GROUP BY i.id
)
SELECT CASE
         WHEN settled_cents = billed_cents AND settled_cents > 0 THEN {4}
         WHEN settled_cents > 0 AND settled_cents < billed_cents THEN 'partial'
         ELSE 'none'
       END AS coverage,
       COUNT(*) AS statements,
       ROUND(SUM(billed_cents) / 100.0, 2) AS billed,
       ROUND(SUM(settled_cents) / 100.0, 2) AS settled
FROM legs
GROUP BY coverage
ORDER BY statements {5}`,
      slots: [
        {
          answer: "p.amount_cents",
          kind: "keyword",
          label: "the leg-amount column",
          why: "The fold sums the debit legs' paise: SUM(p.amount_cents) per statement. i.amount_cents folds the bill against itself and every statement reads exact — a census where nothing is ever outstanding.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the no-leg fallback",
          why: "Statements with no legs must read settled = 0, not NULL, or the 'none' bucket's foot prints blank. The fallback feeds the 6 never-debited cycles whose settled column reads exactly 0 in the close pack.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement-join key",
          why: "Legs attach to their statement: ON p.invoice_id = i.id. Joining on i.amount_cents matches leg ids against bill amounts — no legs survive, all 28 statements land in 'none' and the audit reads a fake 100% receivable.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the fully-settled label",
          why: "Legs equal to the bill label the bucket 'exact' — 21 statements whose 65,612 foots both sides, including the void-but-debited #11 at 925. Labeling it 'none' merges the settled book into the receivable and the close prints 27 statements outstanding.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "The close reads exact (21), none (6), partial (1) — biggest bucket on top. ASC leads with the single partial statement and the reviewer's eye lands on the 4,000-of-6,148 row before the 21-row settled book.",
        },
      ],
      distractors: ["i.amount_cents", "quantity", "i.invoice_id", "ASC", "1"],
      walkthrough:
        "Two stages: fold the legs per statement, then classify and foot. The CTE LEFT JOINs debit legs to their statement and folds SUM(p.amount_cents) with a 0 fallback for the leg-less, keeping the comparison in integer paise — the rupee display divides by 100.0 exactly once at the end. The CASE reads leg evidence: settled = billed and positive is exact (21 statements, 65,612 on both sides — with the void-but-debited #11 at 925 folding in, which is the anomaly the close walks), 0 < settled < billed is partial (only #25: 6,148 billed, 4,000 debited), and settled = 0 is none (6 statements, 15,217 billed, 0 settled — including paid-status #28 at 1,756 whose zero legs make the status a lie). The distractors each break the audit differently: i.amount_cents in the leg slot folds the bill against itself — 28 exacts, nothing outstanding; 'quantity' and i.invoice_id are columns that do not exist and the query errors; 1 in the fallback prints every no-leg statement as settled-to-1; 1 in the join key detaches all but one statement's legs; i.amount_cents as the join key matches leg ids against bill amounts and the book fakes a full receivable; ASC inverts the bucket order. The rule that survives: coverage is a leg fold with a stated fallback, footed in paise and displayed in rupees — never a status column.",
    },
  ],

  problems: [
    { slug: "loan-amortization-schedule", why: "The 2023 HDFC Ltd merger folded a mortgage book into the bank — amortization math over EMI schedules is now core retail-lending reporting, and this problem drills the exact per-period fold." },
    { slug: "daily-balance-interest", why: "The deposit franchise earns on daily balances. Savings-interest computation is a day-weighted fold over balance events — the exact shape the deposits pod ships every accrual run." },
    { slug: "vintage-default-curves", why: "Card-risk reviews read defaults by origination vintage — cohort rows by book month with cumulative windows. Same curves, different labels, and the grain trap is identical." },
    { slug: "risk-based-pricing", why: "Pricing the risk grade: rate as a function of bucket, computed in one pass. The CASE-tier shape HDFC's pricing committee actually argues about." },
    { slug: "expected-credit-loss", why: "ECL provisioning weights exposure by stage and probability — a conditional fold whose denominators are the whole audit. The provisioning report's first query looks exactly like this." },
    { slug: "settlement-fails-aging", why: "Failed settlements age by days-outstanding before ops escalates — bucket folds over lag math, the capture-clock cousin of the acquirer escalation list." },
    { slug: "ar-aging-schedule", why: "Statement receivables age into current / 30 / 60 / 90 buckets at every close. The 6 never-debited cycles worth 15,217 are exactly the tail this problem teaches you to bucket." },
    { slug: "chargeback-rate-ranking", why: "Merchant desks rank acquirers by chargeback share — a rate whose denominator is the merchant's own volume. Ranking windows over conditional aggregates, the bench report's risk cut." },
    { slug: "transaction-velocity", why: "Fraud screens hunt velocity: N transactions in a rolling window per customer. The window-shaped alert the fraud pod tunes weekly." },
    { slug: "suspicious-bank-account-transactions", why: "Structuring under reporting walls is the classic bank fraud pattern — flagged by conditional aggregates with stated populations. This problem is the screen in miniature." },
    { slug: "account-balance", why: "A running account balance over a transaction stream — the ledger discipline the book of record enforces, where every fold must tie or the close pages." },
    { slug: "customer-order-frequency", why: "Dormancy reads: which households' transaction frequency is falling off. The retention calendar for a 16-household book starts with this frequency fold." },
    { slug: "customers-who-never-order", why: "The cross-sell whitespace anti-join: customers with no transactions at all. On this db it returns a confident zero — and proving that zero is the exercise." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Escalating-amount sequences are a fraud-team tell and a window-ordering drill — LAG against the prior row's ticket, exactly the capture-lag toolkit." },
    { slug: "calculate-orders-within-each-interval", why: "Authorization windows: transactions bucketed into intra-day intervals for the capacity read. Interval folds over timestamps, the acquiring desk's daily view." },
    { slug: "top-percentile-fraud", why: "Fraud triage ranks tickets into percentile bands so investigators work the worst decile first — window percentiles over ticket value, the triage queue's spine." },
  ],
};
