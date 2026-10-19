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
    "Preparation strategy: the pools file carries no HDFC section — 0 tagged sql rows — so every topic slug and all thirty-two problems here are **theme-curated** to this kit's known screen shapes: authorization-fate funnels, two-grain zone censuses, statement-cycle coverage, risk buckets, rails and the GL tie-out. Do the topics in order, then work the **six case studies** on the live storefront db: the {rose:authorization fate census} the cards risk huddle opens with every week, the {emerald:statement settlement audit} the month-close team ships, the premier household ladder's tie policy, the acquiring-bench routing, the capture-clock drift board and the cycle-status stack — then re-run each a week later from a blank editor, because *the second pass is where recall actually forms*. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction, and every paise fold divide by 100.0 exactly once.",
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
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "trial-to-paid-funnel", "game-play-analysis-v"],
    },
    {
      name: "Two-grain zone censuses",
      why: "Transactions and customers are different grains of the same join, and every census here reports both: EU runs 45 transactions from 8 customers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "user-activity-for-the-past-30-days-ii", "transactions-per-visit-histogram"],
    },
    {
      name: "Customers joined to transactions",
      why: "Customers carry zone and home-branch city; transactions inherit them through joins, and the join type decides who survives. A transaction with no customer is corruption; a customer with no transactions is cross-sell whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "sales-analysis-ii", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "The merchant-acquirer bench",
      why: "Card spend lands through acquiring partners, and the bench report is a joins-plus-aggregates fold: listings per partner, settled spend routed through each, the partnership-quality floor that decides who stays on the shelf. The grain trap is terminal lines versus SKUs — one SKU can ring through dozens of terminals.",
      slugs: ["product-sales-analysis-i", "average-selling-price", "find-stores-with-inventory-imbalance", "product-price-at-a-given-date", "product-sales-analysis-iii", "group-sold-products-by-the-date"],
    },
    {
      name: "Statement cycles & the debit ledger",
      why: "Settled is not debited — the finance tables (28 statement cycles, 27 debit legs, INTEGER paise) are where the cards world meets money. Every rupee read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the raw leg fold.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "bank-account-summary"],
    },
    {
      name: "Risk buckets with CASE",
      why: "Card-risk reporting is CASE-classified — decline bands, utilization tiers, DPD buckets — with fixed edges the risk committee publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the risk report, and a reordered WHEN quietly re-buckets the book.",
      slugs: ["delinquency-buckets", "credit-utilization-bands", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "Fraud & anomaly screens",
      why: "HDFC's fraud screens hunt patterns in flows: velocity spikes, structuring under reporting walls, duplicate charge pairs, anomaly z-scores. Each is a conditional aggregate with a stated population — and the interviewer checks whether your screen's denominator includes what your alert excludes.",
      slugs: ["structuring-detection", "amount-anomaly-zscore", "duplicate-charge-pairs", "active-users"],
    },
    {
      name: "The customer-value ladder",
      why: "Premier-desk reporting ranks households by lifetime spend where ties are guaranteed — four customers sit at 4 transactions each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer households, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary", "the-number-of-employees-which-report-to-each-employee"],
    },
    {
      name: "Month spines & capture-lag math",
      why: "The 14-month transaction spine (2024-01 to 2025-02) is the portfolio call's home turf, and the capture clock is julianday(shipped_at) - julianday(created_at) over the 82 stamped rows. LAG drives the walk — the trough (1,193.86 in July) and the first row's NULL are both definitions, never zeros.",
      slugs: ["biggest-window-between-events", "average-time-of-process-per-machine", "the-latest-login-in-2020", "rising-temperature", "sales-by-day-of-the-week", "report-contiguous-dates"],
    },
    {
      name: "GL discipline & the close",
      why: "The ledger is the book of record — 80 entries, 181,080 debits against 181,080 credits, delta 0 — and every close report must tie back to it. Screens here probe whether you can stage a fold, classify it, and prove the tie-out; a number that can't reach the GL is a rumor, not a read.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward", "last-person-to-fit-in-the-bus"],
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
    {
      id: "hdfc-t9",
      q: "You build a rolling 3-month capture-lag average over the 14-month spine. Walk me through the frame choice — ROWS or RANGE — and where the two disagree.",
      a: "ROWS counts physical rows: AVG(lag_days) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) is exactly a three-row mean, regardless of calendar truth. RANGE counts value-peers: on the month spine the keys are unique, so the two frames coincide — but the moment the axis carries duplicates (a day axis with same-day transactions, or a month key built with '%m' that collides across years), RANGE sweeps in every peer and the window's row count jumps without warning. The house habit is to state the frame in the SQL comment: 'ROWS = rows-true, RANGE = calendar-true; this axis is unique so they coincide — re-audit if the key changes.' A frame that silently changes meaning when the axis gains a duplicate is exactly the kind of trend drift a portfolio review exists to catch.",
      tag: "windows",
    },
    {
      id: "hdfc-t10",
      q: "The close wants a one-cell proof that cycle #1 rode both rails. How does GROUP_CONCAT serve, and what are its caveats?",
      a: "GROUP_CONCAT(p.method) folds a group's values into one comma-joined string — for #1's two legs it reads 'card,wire', which is a one-cell rail manifest and an honest split-plan flag; all five split cycles (1, 5, 12, 19, 22) show the same double-rail string. The caveats to say out loud: the order inside the string is scan order, not guaranteed — append ORDER BY inside the aggregate if the manifest must be stable; the default separator is a comma and can be set with a second argument; and a string cell is a display artifact, not a joinable fact — never GROUP BY the manifest. It earns its place in close packs because it survives where a join would fan out: one row per cycle, evidence included.",
      tag: "aggregation",
    },
    {
      id: "hdfc-t11",
      q: "The rail census stacks the card arm over the wire arm and appends a grand-total row. Why UNION ALL rather than a bare UNION — and where does the TOTAL row's honesty come from?",
      a: "The arms are disjoint by construction — method = 'card' versus method = 'wire' — so UNION ALL is the operator that states that fact and skips the dedupe pass a bare UNION would add for nothing. The deeper habit: UNION ALL branches that re-scan the UNFILTERED table make the TOTAL row an independent footing check — the stack's total must read 27 legs and 69,612.00, tying to the cash book, or the pack refuses to ship. A bare UNION would still produce the same rows today, but it silently hides the day a future edit makes the arms overlap — the dedupe would eat a legitimate row and the total would stop footing with no error anywhere. Set operators are contracts about populations; ALL is the contract that says 'disjoint, on purpose'.",
      tag: "setops",
    },
    {
      id: "hdfc-t12",
      q: "Where do EXCEPT and INTERSECT actually earn their keep in a cards shop, and what shape rules do their arms obey?",
      a: "EXCEPT is set subtraction — 'months that booked transactions but logged no decline' is a risk-pulse read you can't write with a WHERE NOT IN without tripping the NULL poison. INTERSECT is shared membership — households that transacted on both a weekend and a weekday, or cycles that drew legs on both rails. The shape rules: both arms must return the same number of columns with compatible types, duplicates collapse (they are set operators, not bags), and the column names come from the first arm. The NULL subtlety travels with them: set operators treat NULLs as equal members, which is exactly why EXCEPT is the safer lapse read than NOT IN over an unguarded column. In a bank the arm shapes should be stated in a comment — a report whose two halves don't agree on shape is an error waiting for prepare time.",
      tag: "setops",
    },
    {
      id: "hdfc-t13",
      q: "Month-end is when card volume lands. What is the house rule for period filters on created_at, and where does julianday rounding belong?",
      a: "Half-open intervals, always: created_at >= '2024-03-01' AND created_at < '2024-04-01' keeps March's last night; BETWEEN '2024-03-01' AND '2024-03-31' silently drops every capture timestamped after midnight on the 31st — precisely when card volume peaks. The rule generalizes: the lower bound is inclusive, the upper bound is the next period's start, exclusive, and the SQL comment names the convention. For durations, julianday(shipped_at) - julianday(created_at) is a fractional-day number — compute it raw, aggregate raw, and round ONCE at the display layer (the 2.98-day average is that contract); rounding per row before averaging compounds error into every downstream roll-up. In a bank the boundary policy is not a style choice — it is the difference between a month that foots and one that quietly loses its biggest night.",
      tag: "dates",
    },
    {
      id: "hdfc-t14",
      q: "Beyond the capture-lag report — what is this bank's general NULL policy for a report column, and how do the three NULL behaviors decide it?",
      a: "Three behaviors decide everything. In filters, NULL fails both x = value AND x != value — so WHERE status != 'cancelled' would silently drop NULL-status rows if statuses could be NULL (they can't here; the sparse column is shipped_at). In joins, NULL keys never match — a transaction with a NULL customer_id would vanish from an INNER JOIN and survive a LEFT JOIN only on the left. In aggregates, NULL inputs are ignored: AVG shrinks its denominator, COUNT(col) drops the rows, COUNT(*) keeps them, and SUM over an all-NULL group returns NULL — which is why the coverage census wraps its fold as COALESCE(SUM(p.amount_cents), 0) so the six never-debited cycles print a real 0. The policy is per-column and written down: COALESCE for display defaults, IS NULL as its own category in GROUP BY when 'unknown' is a business state, and a named filter with a stated reason when rows are excluded.",
      tag: "nulls",
    },
    {
      id: "hdfc-t15",
      q: "The premier desk wants households whose average ticket beats THEIR ZONE's average — not the bank's. Why is a correlated subquery the tempting answer, and what do you ship instead?",
      a: "The correlated form — WHERE total > (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — reads like the business sentence and re-runs once per outer row: correct, but it scales like a nested loop, and at cards-portfolio scale that is the difference between a screen and an outage. The set-based ship is a join to a derived table (per-zone averages folded once in a CTE, joined back on zone) or the window AVG(total) OVER (PARTITION BY zone), which computes each partition's average once and keeps every row. The answers differ in a follow-up the desk loves: 'above MY zone's average' and 'above the BANK's average' produce different lists — the platform mean is 338.19, the zone means run 313.66 to 426.22 — so the population in the subquery IS the business question, not an implementation detail.",
      tag: "subqueries",
    },
    {
      id: "hdfc-t16",
      q: "Why can't a window function live in WHERE or HAVING, and what is the standard staging pattern around that wall?",
      a: "Because the pipeline evaluates WHERE and HAVING before the SELECT's windows exist — logical order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, and windows are computed at the SELECT stage over the already-filtered rows. Filtering on a window alias in WHERE fails outright in SQLite ('misuse of aliased window function'); filtering an aggregate in WHERE fails as 'misuse of aggregate'. The standard pattern is staging: fold and walk in a CTE (monthly buckets, then LAG over the buckets), then filter, join or sort in the outer query — the two-step the month-over-month boards in this kit all use. Saying the pipeline out loud, then naming the staging fix, is the complete answer; the half-answer — 'move it to HAVING' — only works for aggregates, never for windows.",
      tag: "windows",
    },
    {
      id: "hdfc-t17",
      q: "When does a self-join beat a window at this bank, and what discipline does the pair-once shape impose?",
      a: "Self-joins answer pairwise questions windows can't phrase: duplicate-charge pairs (same household, same total, within two days), households that transacted in the same week, relationship-manager spans (the-number-of-reports fold). The discipline is a.id < b.id: without it, every row pairs with itself (total = total is true against itself) and every genuine pair appears twice, once per orientation — the inequality kills both defects with one predicate and gives each pair a canonical order. Date bounds go in half-open form (julianday(b.created_at) - julianday(a.created_at) BETWEEN 0 AND 2 keeps the pair window inclusive of same-day). On this book the clean-core duplicate count is 0 — and the screen asks you to prove that zero, because staging tables are where the pairs will eventually appear.",
      tag: "joins",
    },
    {
      id: "hdfc-t18",
      q: "A stakeholder challenges the decline share on the weekly pack: 'does a declined transaction count in your zone base?' What does a definition-first answer look like?",
      a: "The answer is a written definition, not a re-run. It names the metric (declined ÷ ALL transactions booked), the population (every status row in the zone — declined included — because 'not yet captured' and 'declined' are fates the metric exists to watch), the edge policy (LATAM's zero-decline month still reports, at 0), and the rounding (100.0 before the division, ROUND to 1 at the end). Then it points at where the definition lives — the metric README — so the stakeholder can query it themselves. What is never acceptable is quietly re-filtering to make the number move: on this book the zone shares read APAC 8.1, EU 6.7, US 5.3, LATAM 0 under the placed denominator and something else entirely under a settled-only base — and a metric whose answer changes when no definition changed is a rumor, not a read.",
      tag: "quality",
    },
    {
      id: "hdfc-t19",
      q: "The fate census must reconcile to 103 by construction. Which conditional-count idioms do that in one pass, and what identity ties them together?",
      a: "Three idioms, one identity. SUM(CASE WHEN status = 'X' THEN 1 ELSE 0 END) is the portable conditional count; COUNT(*) FILTER (WHERE status = 'X') is the modern clause; AVG(flag) * COUNT(*) is the identity that ties shares to counts. All three read the same rows the denominator reads — 52 + 30 + 14 + 7 = 103 by construction, per zone and overall. The traps to narrate: COUNT(status = 'cancelled') counts every non-NULL comparison result (all 103 — booleans are 0/1 values, not NULLs), and a fourth status added to the data without a census arm breaks the reconciliation identity — which is the whole point of building the identity in: the grid that must sum to 103 refuses to lie when the status vocabulary drifts.",
      tag: "aggregation",
    },
    {
      id: "hdfc-t20",
      q: "Why does `WHERE tx >= 4` fail when tx is a SELECT alias for COUNT(*), and what does the failure teach about the pipeline?",
      a: "Because SELECT runs after WHERE: at filter time no alias exists yet, so the engine either rejects the reference or, worse for aggregates, reports 'misuse of aggregate: COUNT()'. The logical pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is the whole lesson: WHERE judges rows before folds exist, HAVING judges groups after them, and SELECT names are born too late for either. The fixes are phase-correct: a row fact goes in WHERE (status = 'delivered'), a group fact goes in HAVING (HAVING COUNT(*) >= 4), and a window fact goes in an outer query over a staged CTE because windows evaluate even later than SELECT. Candidates who can place every filter by asking 'is this a fact about one row, one group, or one window?' are the ones whose reports survive review.",
      tag: "pipeline",
    },
    {
      id: "hdfc-t21",
      q: "The capture-lag screen runs fine on 103 rows and times out at portfolio scale. What is the first thing you check, and how do you rewrite the predicate?",
      a: "Sargability. A predicate that wraps the indexed column in a function — julianday(shipped_at) - julianday(created_at) > 3 — cannot use the index on shipped_at, because the planner sees f(column), not the column. The rewrite moves the function to the constant side: shipped_at >= date(created_at, '+3 days') keeps the bare column comparable and index-usable; for month filters, created_at >= '2024-01-01' AND created_at < '2024-02-01' beats SUBSTR(created_at, 1, 7) = '2024-01' for the same reason. On the sandbox the difference is invisible; on a cards-portfolio transaction log it is the difference between an index seek and a full scan per report run. The habit to say out loud: check the WHERE shapes before blaming the engine — most 'slow SQL' at a bank is a predicate that hid its own index.",
      tag: "indexes",
    },
    {
      id: "hdfc-t22",
      q: "The merchant feed arrives with padded, mixed-case names and the family fold starts double-counting. What is the string-hygiene pass, and where does it live?",
      a: "Normalize before you group: TRIM strips the padding that makes 'Rent ' and 'Rent' two categories, UPPER or LOWER gives case-insensitive join keys ('ACME' and 'Acme' fold to one), and REPLACE clears the thousands-separator variant of the same vendor. The pass lives in a staging CTE — clean once, join and group downstream — so the fix is auditable and the raw feed stays raw for lineage. The discipline that matters at a bank: normalization is a JOIN-KEY decision, not cosmetics — every uncleaned variant silently splits one household or one merchant into two, which fragments the concentration read (63.5% of the book from 3,000-plus households becomes unmeasurable when 'ACME Pvt Ltd' and 'Acme Pvt Ltd ' are different rows). Fix at the key, document the transform, and never free-type a cleaning rule into five queries.",
      tag: "strings",
    },
    {
      id: "hdfc-t23",
      q: "The deck quotes 'the average ticket is rising' from four zone averages. How do you audit an average-of-averages, and what do you compute instead?",
      a: "Ask what the average is OF, then compute at the right grain. Averaging the zone means (EU 335.32 + APAC 313.66 + US 383.48 + LATAM 426.22) / 4 = 364.67 — an unweighted mean that lets LATAM's 2 transactions speak as loudly as EU's 45. The book average folds all 103 tickets once: 338.19. The gap — 26.48 — is pure weighting, and it moves whenever the mix shifts even if no ticket changes. The fix is computing the average at the transaction grain (SUM(total) / COUNT(*) over the population the deck names), or a weighted average if zone cells must stay visible. The audit question to hand any stakeholder: 'one row per WHAT?' — an average of zone rows is an average of zones, and that is a different metric wearing the same name.",
      tag: "metrics",
    },
    {
      id: "hdfc-t24",
      q: "It's 15:30 on close day. Walk me through the ten-minute ritual that decides whether the cards pack ships.",
      a: "Four checks, in order, each a query you could write cold. One: the ledger proof — SUM(debit_cents) equals SUM(credit_cents) at 181,080 against 181,080, delta 0; a nonzero delta pages the close, not the analyst. Two: the fate identity — 52 + 30 + 14 + 7 = 103 by construction; any zone row failing the sum is an incident. Three: the coverage census — 21 exact (65,612 foots both sides), 1 partial (4,000 of 6,148), 6 never-debited (15,217), with the anomaly pair walked line by line: void-but-debited #11 at 925.00, paid-with-no-legs #28 at 1,756.00. Four: the population footnotes — the capture clock's 82-of-103, the decline shares' placed denominators — because a number without its population is a rumor. The ritual is the interview too: a candidate who narrates checks in this order thinks like the close team already.",
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
    {
      id: "hdfc-mcq-11",
      prompt: "Cycle #1 settled on a split plan — one card leg, one wire leg. What does `GROUP_CONCAT(p.method)` return for that cycle's group?",
      choices: ["card", "wire", "card,wire — both legs folded into one comma-joined string", "card + wire"],
      answer: 2,
      why: "GROUP_CONCAT folds every value in the group into one string cell: #1's two legs read 'card,wire'. All five split-settled cycles (1, 5, 12, 19, 22) show exactly that manifest — which is how the close spots a cycle riding both rails.",
      notes: [
        { choice: 0, why: "A fold returns ONE row per group carrying ALL the values — 'card' alone would mean the wire leg vanished from the manifest, and the rail mix would stop footing to 69,612." },
        { choice: 3, why: "'card + wire' is not a value any aggregate produces. The separator is a comma by default (settable via GROUP_CONCAT(x, sep)) — the shape is one string, not arithmetic." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-12",
      prompt: "The fate census needs settled, capturing, awaiting and declined counts per zone. Why one pass with `COUNT(*) FILTER (WHERE ...)` instead of four separate grouped queries?",
      choices: [
        "FILTER is faster syntax for the same four separate scans",
        "One scan means the four arms share a denominator and the grid reconciles to 103 by construction",
        "FILTER is the only way to count rows in SQL",
        "Four queries would return different column names",
      ],
      answer: 1,
      why: "The one-pass census runs a single scan where every arm counts against the SAME group of rows — so 52 + 30 + 14 + 7 must equal 103, and a zone row that fails that identity is an incident, not a rounding note. Four separate queries can drift in filter or staging state and reconcile to nothing.",
      notes: [
        { choice: 0, why: "It's not about speed — it's about a shared denominator. Four scans of a moving staging table can disagree with each other and with 103, and nothing forces them back." },
        { choice: 2, why: "COUNT(*) has counted rows since the 1970s. FILTER (WHERE …) is the conditional-count clause (SQLite 3.30+) — the point is one scan, not a new way to count." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-13",
      prompt: "Which WHERE clause returns exactly the 21 unstamped transactions (14 pending + 7 declined) — the rows with no settlement stamp yet?",
      choices: [
        "WHERE shipped_at = NULL",
        "WHERE NOT (shipped_at IS NOT NULL)",
        "WHERE shipped_at != 'settlement stamp'",
        "WHERE NOT shipped_at",
      ],
      answer: 1,
      why: "NOT (x IS NOT NULL) is logically exactly x IS NULL — the 21 rows whose settlement hasn't happened. The double negative is the teaching point: NULL never matches = or !=, so the affirmative forms all fail.",
      notes: [
        { choice: 0, why: "= NULL is never true — comparison with NULL yields UNKNOWN, so the clause returns nothing. IS NULL is the operator, not =." },
        { choice: 3, why: "NOT shipped_at treats a text timestamp as a boolean — in SQLite a non-zero string casts oddly, and the intent is unreadable. NULL tests are IS NULL / IS NOT NULL, full stop." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-14",
      prompt: "Orders join to order_items and the row count fans out from 103 to 251. Which expression still reports 16 — the household count?",
      choices: ["COUNT(*)", "COUNT(customer_id)", "COUNT(DISTINCT customer_id)", "SUM(customer_id)"],
      answer: 2,
      why: "DISTINCT folds the fan-out back to people: 251 terminal lines collapse to 16 households. COUNT(*) and COUNT(customer_id) both read 251 — the line grain, not the household grain — and SUM adds the ids, a meaningless number.",
      notes: [
        { choice: 0, why: "COUNT(*) counts the joined rows — 251 terminal lines. The join didn't create households; it created lines, and the census must say which grain it reports." },
        { choice: 1, why: "COUNT(customer_id) skips NULLs but counts repeats — every line carries a customer_id, so it reads 251 too. Without DISTINCT, both counts are line-grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-15",
      prompt: "`SELECT id, total FROM orders LIMIT 1` is shipped as 'a top ticket read'. What is wrong with it?",
      choices: [
        "Nothing — LIMIT 1 always returns the biggest row",
        "It returns an arbitrary row — without ORDER BY, LIMIT promises no particular row",
        "It needs DISTINCT to work over totals",
        "LIMIT only works with an aggregate",
      ],
      answer: 1,
      why: "LIMIT caps the row count; it does not rank. With no ORDER BY the engine is free to hand back any physical row — this run returns id 74's 1,088.44, the next run may not. A 'top' claim without ORDER BY is a coin flip wearing a headline.",
      notes: [
        { choice: 0, why: "That belief ships dozens of broken 'top-N' reads. LIMIT 1 returns the first row the plan happens to touch — biggest only if ORDER BY total DESC said so." },
        { choice: 2, why: "DISTINCT deduplicates values; it has no effect on which row LIMIT returns. The missing piece is ordering, not uniqueness." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-16",
      prompt: "Two captures sit 36 hours apart on the clock. What does `julianday(later) - julianday(earlier)` return?",
      choices: ["36", "1.5", "2", "0.5"],
      answer: 1,
      why: "JULIANDAY returns fractional days — 36 hours is 1.5 of them. On this book the stamps happen to land on whole-day boundaries (the 2–4 day spread), but the function is fractional by contract, which is why the capture-lag report rounds once at the end and never per row.",
      notes: [
        { choice: 0, why: "36 would be hours — julianday diffs are DAYS, fractional. Treating the diff as hours inflates the clock 24×." },
        { choice: 2, why: "2 is what a date-only subtraction gives after truncation — it silently invents a 12-hour error. Fractional julianday is the honest clock." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-17",
      prompt: "A trend report buckets transactions with `STRFTIME('%m', created_at)` and prints 12 month buckets for a book that spans 2024-01 to 2025-02. Diagnosis?",
      choices: [
        "The book really has 12 active months",
        "'%m' carries month-only keys — January 2024 and January 2025 merge into one bucket and the trend is fiction",
        "STRFTIME needs a GROUP BY to work",
        "The report should use COUNT(DISTINCT month)",
      ],
      answer: 1,
      why: "'%m' emits '01'…'12' with no year, so the two Januaries fold into one 15-transaction bucket. The spine is '%Y-%m' — 14 buckets on this book — or SUBSTR(created_at, 1, 7) on fixed-width ISO text.",
      notes: [
        { choice: 0, why: "14 months of orders is a probed fact; 12 buckets means two months share a key. Any bucket count that matches the calendar instead of the data is the collision telling on itself." },
        { choice: 3, why: "COUNT(DISTINCT month) counts the buckets, it doesn't fix the keys. The bug is the format string, not the aggregation." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-18",
      prompt: "The rail census stacks the card arm (16 legs / 37,364) over the wire arm (11 / 32,248) with UNION ALL. A reviewer asks why not a bare UNION. The house answer?",
      choices: [
        "UNION is invalid between two SELECTs on the same table",
        "The arms are disjoint, so the rows are identical — but UNION ALL skips a hidden dedupe pass and states the disjointness in the SQL itself",
        "UNION sorts alphabetically and breaks the rail order",
        "UNION ALL is only faster on small tables",
      ],
      answer: 1,
      why: "The two arms select from disjoint populations (method = 'card' vs method = 'wire'), so today the outputs match — but a bare UNION adds a distinct-sort whose only job would be to hide a future mistake, and it costs a pass. UNION ALL is the documented contract: these populations cannot overlap, and the SQL says so.",
      notes: [
        { choice: 0, why: "UNION is perfectly valid between any two shape-matched SELECTs. The choice between ALL and bare UNION is about dedupe semantics, never legality." },
        { choice: 2, why: "Sort order comes from the outer ORDER BY, not the set operator. The real difference is the silent dedupe — which on disjoint arms is dead weight today and a lie-hider tomorrow." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-19",
      prompt: "A lapse read runs `SELECT month FROM booked_months EXCEPT SELECT month FROM decline_months`. What does EXCEPT hand back, and what breaks if the two arms select different column counts?",
      choices: [
        "Months present in BOTH sets — and mismatched shapes error at prepare time",
        "Months in the first set but NOT the second — and mismatched shapes are an error, not a silent pad",
        "All months from both sets — mismatched shapes are padded with NULLs",
        "Nothing — EXCEPT needs a JOIN to work",
      ],
      answer: 1,
      why: "EXCEPT is set subtraction: rows in the left set that never appear in the right — here, the months that booked volume but logged no decline. Both arms must match in column count and type family; SQLite rejects mismatched shapes at prepare, it never pads.",
      notes: [
        { choice: 0, why: "That's INTERSECT. Flipping the two set operators inverts the report — the quiet-month read becomes the shared-month read, and the deck argues the wrong months." },
        { choice: 2, why: "That's UNION's job, and UNION also demands matching shapes. No set operator pads — the engine refuses, which is the friendly failure mode." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-20",
      prompt: "Zone average tickets read EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. Averaging those four numbers gives 364.67 — but the book average is 338.19. Why?",
      choices: [
        "Rounding drift across four decimals",
        "The average-of-averages weights every zone equally; the book average weights every transaction — 45 EU tickets versus 2 LATAM ones",
        "The zone averages should have been DISTINCT",
        "One of the four zone numbers is wrong",
      ],
      answer: 1,
      why: "A mean of means is only the true mean when every group has equal weight. EU carries 45 transactions, LATAM 2 — the unweighted 364.67 lets the 2-ticket zone speak as loudly as the 45-ticket zone. The book average folds all 103 tickets once: 338.19.",
      notes: [
        { choice: 0, why: "The gap is 26.48 — no rounding artifact. This is a weighting bug, and the fix is computing the average at the transaction grain, not averaging zone cells." },
        { choice: 3, why: "Every zone number is probe-honest. The composite is what lies — which is why the portfolio review asks 'average of WHAT?' before quoting any mean." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-21",
      prompt: "The capture-lag screen filters `julianday(shipped_at) - julianday(created_at) > 3` and the index on shipped_at never gets used. Why, and the fix?",
      choices: [
        "julianday is not an indexable type — switch to Unix epochs",
        "The predicate wraps the indexed column in a function, hiding it from the planner — rewrite as a range on the bare column (shipped_at >= date(created_at, '+3 days') shape)",
        "The index needs a REBUILD after data loads",
        "Multi-column comparisons never use indexes",
      ],
      answer: 1,
      why: "Sargability: an index serves a predicate on the bare column, not on f(column). Wrapping shipped_at in julianday forces a scan of every stamped row. The rewrite keeps the arithmetic on the non-indexed side and lets the index find candidate rows first.",
      notes: [
        { choice: 0, why: "julianday is a deterministic function of a text stamp — the problem is WHERE it sits, not what it returns. Moving the function to the constant side restores index use." },
        { choice: 2, why: "Rebuilds fix corruption and bloat, not predicate shapes. On a 103-row sandbox you'll never feel it — at cards-portfolio scale the scan is the outage." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-22",
      prompt: "The dunning list filters `customer_id IN (SELECT customer_id FROM invoices WHERE status = 'open')` on a staging slice where no open cycles exist. What comes back?",
      choices: [
        "Every customer — an empty IN list is vacuously true",
        "No rows — an empty IN list is false for every candidate, silently",
        "An error — IN requires a non-empty list",
        "Only customers with NULL ids",
      ],
      answer: 1,
      why: "IN (…) over an empty set matches nothing, so the dunning list arrives empty while looking valid — the quiet cousin of the NOT IN NULL poison. The staging slice's population is the first thing to print, before the list ships.",
      notes: [
        { choice: 0, why: "Vacuous truth belongs to quantifiers, not SQL's IN. An empty membership list simply matches no one — which is exactly why it slips through review." },
        { choice: 2, why: "Empty is legal; only a shape mismatch errors. The failure mode here is silence — zero rows that a reminder campaign was depending on." },
      ],
      difficulty: "medium",
    },
    {
      id: "hdfc-mcq-23",
      prompt: "Utilization bands run 0–30 / 30–60 / 60–90 / 90+. A teammate reorders the CASE arms — WHEN util >= 30 first. What happens to a 45%-utilized card?",
      choices: [
        "It stays in the 30–60 band — CASE arms are independent",
        "It falls into whichever arm matches FIRST — the reordered arms mis-bucket the whole book",
        "The query errors on overlapping ranges",
        "It lands in 90+ because the arm order changed the edges",
      ],
      answer: 1,
      why: "CASE evaluates arms top-down and takes the first match — overlapping edges make arm ORDER part of the business rule. A 45 hits '>= 30' immediately and lands in whatever that arm labels, silently re-bucketing every card above 30. The committee-published edges need ordered, non-overlapping arms (or descending edges with < guards).",
      notes: [
        { choice: 0, why: "Arms are not independent — first match wins and evaluation stops. Overlap plus reordering is how a risk report quietly changes its buckets with zero errors." },
        { choice: 2, why: "Overlapping ranges are legal SQL; the engine never checks band logic. The damage is silent by construction — which is why the arms carry a comment citing the committee's edge list." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-24",
      prompt: "In the one-pass fate census, LATAM's awaiting-auth arm holds zero transactions. What does `COUNT(*) FILTER (WHERE status = 'pending')` print for LATAM?",
      choices: ["NULL", "0", "The row is omitted entirely", "It errors on the empty arm"],
      answer: 1,
      why: "COUNT never returns NULL — with no matching rows it prints 0, and the LATAM row still appears with its settled 2 and zeros elsewhere. That zero is the census's honesty: a two-transaction zone is IN the grid, at zero, not vanished from it.",
      notes: [
        { choice: 0, why: "COUNT(*) over an empty filter is 0, never NULL — the aggregate that can't come back empty-handed. SUM over no rows is the one that returns NULL." },
        { choice: 2, why: "GROUP BY keeps every group the input produces — LATAM has 2 transactions, so its row survives with zeros in the empty arms. A report that omits the quiet zone lies by omission." },
      ],
      difficulty: "easy",
    },
    {
      id: "hdfc-mcq-25",
      prompt: "The duplicate-charge screen self-joins orders on same customer, same total, within 2 days: `FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.total = b.total AND ...`. Why does the shape need `a.id < b.id`?",
      choices: [
        "To sort the pairs by id",
        "Without it every row pairs with itself, and each true pair appears twice — once as (a,b), once as (b,a)",
        "Because ids are never equal across customers",
        "It doesn't — the total equality already excludes self-pairs",
      ],
      answer: 1,
      why: "a.total = b.total is true when a IS b — every row pairs with itself. And the full cross join emits both (a,b) and (b,a), so an unordered join double-counts every genuine pair. a.id < b.id fixes both at once: no self-pairs, one canonical orientation per pair. On this book the clean-core count is 0 — and proving that zero is the exercise.",
      notes: [
        { choice: 0, why: "Sorting is ORDER BY's job. The inequality is about set membership — which pairs exist — not their presentation." },
        { choice: 3, why: "Total equality is TRUE for a row against itself — the same value compares equal to itself. Self-pairing is the default, not the exception." },
      ],
      difficulty: "hard",
    },
    {
      id: "hdfc-mcq-26",
      prompt: "A drift board writes `SELECT month, LAG(lag_days) OVER (ORDER BY month) AS prev FROM ... WHERE prev IS NOT NULL`. What happens?",
      choices: [
        "It returns only months that have a predecessor",
        "It errors — window results are computed after WHERE, so the alias is invisible ('misuse of aliased window function')",
        "It silently treats prev as 0 for the first month",
        "It returns every row but with prev NULL everywhere",
      ],
      answer: 1,
      why: "WHERE runs before the window is evaluated — the LAG output doesn't exist yet when the filter is applied, and SQLite says so with 'misuse of aliased window function'. The fix is staging: fold and walk in a CTE, filter in the outer query — the same two-step the monthly CTE pattern uses everywhere in this kit.",
      notes: [
        { choice: 0, why: "That's the intended semantics, but the engine refuses to deliver it through WHERE. Row-filtering happens before windowing, by contract — the pipeline order is the error message." },
        { choice: 2, why: "No silent coercion exists — SQLite rejects the reference outright. The error is the friendly version; some engines would have shipped the wrong filter instead." },
      ],
      difficulty: "hard",
    },
    {
      id: "hdfc-mcq-27",
      prompt: "`NTILE(4) OVER (ORDER BY total)` buckets the 103-ticket book. How do the quartiles split, and where does the 1,088.44 ticket land?",
      choices: [
        "26 / 26 / 26 / 25 — the biggest ticket sits in quartile 4 (507.24–1,088.44)",
        "25 / 26 / 26 / 26 — remainder goes to the last bucket",
        "34 / 34 / 35 — NTILE(4) merges small buckets",
        "26 / 26 / 26 / 26 — NTILE always splits evenly",
      ],
      answer: 0,
      why: "NTILE distributes as evenly as possible: 103 = 3 × 26 + 25, and the earlier buckets absorb the remainder — 26, 26, 26, 25. The 1,088.44 maximum is the last row of the ORDER BY, so it lands in quartile 4 alongside everything from 507.24 up.",
      notes: [
        { choice: 1, why: "Backwards — NTILE fills front-to-back with the larger counts first, so the tail bucket is the short one (25). Getting the remainder direction wrong skews every 'top-quartile' cutoff." },
        { choice: 3, why: "103 doesn't divide by 4. NTILE never drops rows to force even buckets — it spreads the remainder across the earliest groups." },
      ],
      difficulty: "hard",
    },
    {
      id: "hdfc-mcq-28",
      prompt: "Two zones tie on their biggest ticket, and the argmax read is `ORDER BY total DESC LIMIT 1` per zone. What is the defect?",
      choices: [
        "None — LIMIT 1 is the definition of argmax",
        "LIMIT 1 breaks ties arbitrarily and silently — the defensible argmax names its tie-break (ROW_NUMBER with created_at then id, say) in the SQL",
        "Argmax requires a correlated subquery",
        "The tie makes the query non-deterministic but harmless",
      ],
      answer: 1,
      why: "Ties are guaranteed at portfolio scale, and LIMIT 1 resolves them by whatever order the plan stumbles into — two runs, two 'winners', no error. The defensible shape is a window: ROW_NUMBER() OVER (PARTITION BY zone ORDER BY total DESC, created_at, id) with the tiebreak stated, so the winner is reproducible and the tie policy is reviewable.",
      notes: [
        { choice: 0, why: "Argmax is a decision, not a row count — and decisions need tie policies. LIMIT 1 delegates the policy to the query planner's mood." },
        { choice: 3, why: "Non-determinism in a bank's reporting is never harmless — the premier desk acts on 'the biggest household in the zone', and a flippy answer costs the argument." },
      ],
      difficulty: "hard",
    },
    {
      id: "hdfc-mcq-29",
      prompt: "A rolling read computes `AVG(total) OVER (ORDER BY created_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`. Several transactions share the same created_at day. What changes if ROWS becomes RANGE?",
      choices: [
        "Nothing — ROWS and RANGE are synonyms here",
        "RANGE sweeps in EVERY transaction sharing those dates, not just 2 rows — the window's row count jumps on same-day ties",
        "RANGE reverses the order of the frame",
        "RANGE only works on numeric columns",
      ],
      answer: 1,
      why: "ROWS counts physical rows — exactly 3 in this frame. RANGE counts PEERS by the ORDER BY value: on a day with five transactions, RANGE BETWEEN 2 PRECEDING sweeps all transactions whose created_at falls in the window's value range — potentially all five. On transaction-dated axes with same-day ties, the two frames disagree, and only one of them is the trend you meant.",
      notes: [
        { choice: 0, why: "They're synonyms only while the ORDER BY key is unique. Same-day transactions break uniqueness — the exact condition this book guarantees (45 EU transactions across 14 months)." },
        { choice: 2, why: "Neither frame reverses anything — direction lives in the ORDER BY. The ROWS/RANGE axis is 'which rows count as neighbors', not 'which way the window faces'." },
      ],
      difficulty: "hard",
    },
    {
      id: "hdfc-mcq-30",
      prompt: "The ingest feed double-delivers rows. Which expression keeps exactly the freshest transaction per household?",
      choices: [
        "RANK() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1",
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) = 1",
        "MAX(created_at) GROUP BY customer_id",
        "SELECT DISTINCT customer_id FROM orders",
      ],
      answer: 1,
      why: "ROW_NUMBER assigns a strict 1..n inside each household with a fully-specified order — created_at DESC, id DESC breaks same-timestamp ties deterministically — so rn = 1 is exactly one row per household. RANK would keep EVERY row tied on the newest timestamp (several rank-1s), which re-admits the duplicates it exists to remove.",
      notes: [
        { choice: 0, why: "RANK shares rank 1 among all ties — two same-timestamp transactions both survive. The dedupe needs a strict numbering, which is ROW_NUMBER's contract." },
        { choice: 2, why: "MAX finds the newest timestamp but the query still returns every row carrying it — a filter on the aggregate needs HAVING or a join back, and the tie policy is still unnamed." },
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
    {
      id: "cs-hdfc-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The premier household ladder",
      brief:
        "HDFC-flavored brief on the storefront db: the premier desk ranks households by transaction count, and the rank policy is published — peer households share a rung and no gaps follow (DENSE_RANK, not RANK). Probed facts: the ladder reads 24, 17, 14, 13, 5 transactions, then FOUR households tied at 4; the desk reads the ladder down to the tier just below the tie, so the threshold is 3 — which puts the two 3-transaction households on rung 7. Together the 9 households with 4-plus transactions carry 89 of the 103 transactions (86.4%); add the pair of 3s and 11 households hold 95 (92.2%). The tie block is the part the desk argues about — rung 6 four times over.",
      ask: "Return household id, transaction count and shared rung for every household with at least 3 transactions, busiest first, ties sharing rungs with no gaps.",
      template: `WITH ladder AS (
  SELECT customer_id AS hh, COUNT(*) AS tx
  FROM orders
  GROUP BY customer_id
), rungs AS (
  SELECT hh, tx, {1}() OVER (ORDER BY tx {2}) AS rung
  FROM ladder
)
SELECT hh, tx, rung
FROM rungs
WHERE tx >= {3}
ORDER BY rung, hh;`,
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tier function",
          why: "DENSE_RANK shares rungs without gaps: the four-way tie at 4 consumes rung 6 four times and the next tier lands on 7 — the published premier policy. ROW_NUMBER would split peer households 6, 7, 8, 9 and invent a treatment boundary that does not exist.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The ladder runs top-down — 24 transactions is rung 1 — so the window ORDER BY runs descending. ASC would crown the two 3-transaction households as rung 1 and hand the 24-transaction anchor the bottom rung: a correct query answering the opposite question.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the desk's read-down threshold",
          why: "tx >= 3 keeps 11 households — the five above the tie, the four-way tie, and the two 3-transaction households that make RANK's phantom rungs visible (they would read rung 10 while no household occupies 8 or 9). The 3 sits in the result twice, in the tx column.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "Two stages: fold the households, then tier them. The ladder CTE folds 103 transactions into 16 per-household counts; the rungs CTE stamps DENSE_RANK() OVER (ORDER BY tx DESC) across all of them — before any filtering — so the tie policy is computed on the full ladder. The outer query applies the desk's read-down threshold: tx >= 3 keeps eleven rows — rungs 1, 2, 3, 4, 5, then 6, 6, 6, 6 (the four-way tie at 4 transactions: households 9, 11, 14, 16), then 7, 7 (the pair at 3). That bottom rung is the teaching row: under RANK the same two households would print 10 — ranks 8 and 9 exist only as phantom rungs RANK skipped over the tie. ROW_NUMBER would have numbered the tie 6 through 9, quietly deciding which relationship manager 'owns' the bigger household. Threshold 4 would amputate the pair and hide the phantom-rung lesson entirely — which is why the desk reads one tier BELOW the tie. ASC inverts the ladder and crowns the smallest. One CTE, one window, one policy the desk can defend.",
    },
    {
      id: "cs-hdfc-4",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The acquiring-bench routing",
      brief:
        "HDFC-flavored brief on the storefront db: card spend lands through the acquiring bench — six partners whose shelf SKUs ring through terminals — and the bench report routes settled value to each. Probed facts: settled-clean line-item value is 15,571.07 of the 34,833.28 booked (44.7%); Midwest Hardware Co routes 3,732.71 across 45 transactions from 3 SKUs, Nordic Gadgets AB 3,711.42 across 38 from 3, Alpine Audio GmbH 3,013.61 across 34 from 2 — the top three carry 10,457.74, or 67.2% of everything routed. The acquiring desk reads the top three, each row carrying its SKU count and transaction count as capacity proof.",
      ask: "Return the top three acquiring partners by settled routing: name, SKU count, transaction count and settled value.",
      template: `SELECT s.name AS acquirer,
       COUNT(DISTINCT p.id) AS skus,
       COUNT(DISTINCT o.id) AS transactions,
       ROUND(SUM(CASE WHEN o.status = {1} THEN oi.unit_price * oi.quantity ELSE 0 END), 2) AS settled_value
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
GROUP BY s.id
ORDER BY settled_value {2}
LIMIT {3};`,
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled-clean literal",
          why: "Settled clean is status 'delivered' — the CASE zero-arms every other fate so the fold carries settled value only. 'shipped' would fold the 30 captured-and-settling transactions (Nordic's routing flips to 5,515.45 and Midwest drops to second), re-cutting the bench on in-flight money.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The desk reads the heaviest routing on top: Midwest 3,732.71, Nordic 3,711.42, Alpine 3,013.61. ASC would open on Shenzhen Electro's 1,646.82 — the bench's tail — and the concentration conversation (top three carry 67.2%) never happens.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the bench cut",
          why: "LIMIT 3 keeps the top three partners — and the 3 doubles as a probed figure: every one of the six partners lists 2–3 SKUs, so the SKU column carries a real 3 in the result. LIMIT 5 would drag Andes Naturals' 1,810.57 into a memo about the top three.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "ASC", "5"],
      walkthrough:
        "A four-table chain folded back to partner grain. The joins walk the routing path — suppliers to their SKUs, SKUs to terminal lines, lines to their transactions — and GROUP BY s.id folds each partner's routing. The CASE arm is the money filter: only status 'delivered' lines add value, everything else zeroes out, so SUM reads settled-clean line-item value: Midwest 3,732.71 over 45 transactions, Nordic 3,711.42 over 38, Alpine 3,013.61 over 34. COUNT(DISTINCT p.id) and COUNT(DISTINCT o.id) carry the capacity story — 2–3 SKUs each, 25–45 transactions each — without fanning out: a plain COUNT(*) would count terminal LINES, not transactions. The concentration read falls out of the ORDER BY + LIMIT: the top three carry 10,457.74 of 15,571.07 — 67.2% routed through three partners, which is the bench-review slide. 'shipped' or 'cancelled' in the status arm re-routes the memo to in-flight or declined money (Pacific Textiles leads the decline fold at 431.99); ASC serves the tail; LIMIT 5 dilutes the cut. One pass, four tables, and every number ties to the fate census.",
    },
    {
      id: "cs-hdfc-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The capture-clock drift board",
      brief:
        "HDFC-flavored brief on the storefront db: the acquiring desk watches the capture clock month by month — booking to settlement over stamped transactions only — and the board that ships carries each month's average beside the prior month's, with the drift. Probed facts: 82 of 103 transactions carry the stamp; the monthly averages run 3.00, 3.25, 2.80, 3.14, 3.00, 2.75, 2.40, 3.71, 2.89… — July 2024 is the trough at 2.40 days and August spikes to 3.71, a +1.31 jump that pulled the acquiring-partner queue. The board keeps the first nine months so the spike and its correction (-0.82 in September) both stay in view; the first month's drift is NULL — no baseline, by definition.",
      ask: "Return month, average capture lag, the prior month's lag, and the drift, for the first nine stamped months, chronological.",
      template: `WITH monthly AS (
  SELECT SUBSTR(created_at, 1, 7) AS month,
         ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS lag_days
  FROM orders
  WHERE shipped_at IS NOT NULL
  GROUP BY month
), walked AS (
  SELECT month, lag_days,
         {1}(lag_days) OVER (ORDER BY month) AS prev_lag
  FROM monthly
)
SELECT month, lag_days, prev_lag,
       ROUND(lag_days - prev_lag, 2) AS drift
FROM walked
ORDER BY month {2}
LIMIT {3};`,
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(lag_days) walks the window backwards one row — August's prev_lag is July's 2.40, which is what makes the +1.31 spike computable. LEAD reads forward and labels the future as history: August's prev would become September's 2.89 and the drift board would explain the wrong month.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A drift board is chronological: ASC keeps 2024-01 on top so each row compares against the row above it. DESC presents the newest month first with its baseline below — the numbers survive, the story reads backwards, and the spike lands before its cause.",
        },
        {
          answer: "9",
          kind: "number",
          label: "the board's view cut",
          noVerify: true,
          why: "LIMIT 9 keeps 2024-01 through 2024-09 — the run that contains both the July trough (2.40) and the August spike (3.71) plus September's -0.82 correction. The figure is a cut, not a fact about the data — it never appears in a cell, which is why the slot is flagged unverifiable by design.",
        },
      ],
      distractors: ["LEAD", "DESC", "14", "SUM"],
      walkthrough:
        "Three stages: fold, walk, present. The monthly CTE buckets the 82 stamped transactions by '%Y-%m' — the WHERE shipped_at IS NOT NULL is the population statement, 14 months — and folds AVG(julianday(shipped_at) - julianday(created_at)) rounded once at display: 3.00, 3.25, 2.80, 3.14, 3.00, 2.75, 2.40, 3.71, 2.89. The walked CTE stamps LAG over the month-ordered spine — the first month's prev_lag is NULL, the honest baseline — and the outer query computes drift as staged column arithmetic: 2024-07 reads 2.40 - 2.75 = -0.35, then 2024-08 reads 3.71 - 2.40 = +1.31, the jump that pulled the partner queue, and 2024-09 corrects -0.82. The two-step matters: window output is invisible to WHERE and to sibling expressions in the same SELECT, so the walk stages in its own CTE and the outer SELECT does arithmetic on the materialized columns. LEAD would read the future; SUM would pile a running total into prev_lag; DESC tells the story backwards; LIMIT 14 removes no cut at all. The unstamped 21 never dilute the clock — that population decision is why the board survives the review.",
    },
    {
      id: "cs-hdfc-6",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The cycle-status stack",
      brief:
        "HDFC-flavored brief on the storefront db: the close opens with the status book — what the cycle table CLAIMS — stacked over a TOTAL row that must foot to the whole bill, before the leg-evidence census challenges it. Probed facts: 28 statement cycles claim paid 21 for 66,443.00, open 6 for 19,609.00, void 1 for 925.00 — a 86,977.00 total book. The leg census will contradict the claims: paid-status #28 (1,756.00) has zero debit legs while void #11 (925.00) actually settled — the status book is the claim layer the evidence layer audits. The stack ships biggest row first, TOTAL on top.",
      ask: "Return each cycle status with its count and billed rupees, plus a TOTAL row footing the whole book, biggest billed first (TOTAL leads).",
      template: `SELECT status, COUNT(*) AS cycles, ROUND(SUM(amount_cents) / {1}, 2) AS billed
FROM invoices
GROUP BY status
UNION ALL
SELECT 'TOTAL', {2}, ROUND(SUM(amount_cents) / 100.0, 2)
FROM invoices
ORDER BY billed {3};`,
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the paise-to-rupee divider",
          why: "Cycles carry INTEGER paise — 66,443.00 rupees prints only after the /100.0 real-division promotion; the bare 100 would integer-divide and the paid row would read 664.43 while the TOTAL branch (hard-coded to the same rule) read 66,443.00 — a stack ranking rupees against raw paise.",
        },
        {
          answer: "28",
          kind: "number",
          label: "the whole-book cycle count",
          why: "The TOTAL row must count the unfiltered book — 28 cycles — because its billed column is the 86,977.00 footing. 21 would print the paid cohort's count in the total's cycles cell, and the stack would claim a 66,443.00-rupee book is 21 cycles big.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "DESC leads with the TOTAL row (86,977.00) and then paid (21 / 66,443.00) — the footing row first so nobody mistakes a status line for the whole book. ASC opens on void's 925.00 and buries the headline under the smallest claim.",
        },
      ],
      distractors: ["21", "1000", "ASC", "MIN(id)"],
      walkthrough:
        "Two branches, one stack, and a claim layer waiting for its audit. The detail branch folds the 28 cycles by status: paid 21 / 66,443.00, open 6 / 19,609.00, void 1 / 925.00. The TOTAL branch re-scans the UNFILTERED table — 28 cycles, 86,977.00 — so the footing row is an independent check: if a status edit ever double-counts, the stack stops footing and the pack refuses to ship. UNION ALL concatenates the branches without a dedupe pass (the label 'TOTAL' guarantees no collision), and ORDER BY billed DESC floats the footing row to the top. The paise rule governs both branches — the detail fold takes the slot and the TOTAL branch hard-codes the same /100.0 — because a stack comparing divided rows against raw-paise rows would rank the total against paise. The distractors each break a different promise: 21 in the count slot under-counts the whole book to the paid cohort's size; 1000 mis-scales every rupee figure by 10; MIN(id) in the count slot prints id 1's slot as a count of one; ASC flips the read so void opens the pack. And the follow-up the close loves: this stack is the CLAIM layer — the leg-evidence census reads 21 exact / 65,612.00, not 66,443.00, because #28's paid status has zero legs behind it while void #11 actually settled. Claims stack; evidence reconciles.",
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
    { slug: "second-highest-salary", why: "The ladder's second rung: LIMIT OFFSET breaks on the tied pair — the DENSE_RANK/MAX-below-MAX tie logic the premier desk uses the moment two households share a transaction count." },
    { slug: "bank-account-summary", why: "Per-account monthly in/out over a transaction stream — the statement-cycle view the retail book bills on: credits, debits and a balance that must tie to the cycle's amount." },
    { slug: "product-price-at-a-given-date", why: "As-of pricing on the shelf: the fee in force on the transaction date, not today's — the slowly-changing-dimension instinct every interchange and pricing audit assumes." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Basket composition: households holding the deposit AND the card but never the lending SKU — the exact attach-rate audit behind every cross-sell campaign this bank runs." },
    { slug: "sales-by-day-of-the-week", why: "Volume by weekday for the branch-and-contact-center staffing read — CASE/strftime pivots over the transaction book, one scan into a staffing chart." },
    { slug: "count-salary-categories", why: "Band census with UNION ALL totals: ticket-size tiers whose empty bands must print 0, not vanish — the reconcile-to-103 discipline in histogram form." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Rolling 30-day activity with the window stated — the UPI-scale digital-adoption read, where the population note (active in window vs ever) is the whole metric." },
    { slug: "game-play-analysis-v", why: "Day-1 retention via a first-event CTE plus a return check — the app-onboarding funnel the digital pods quote, computed from the transaction log rather than asserted." },
    { slug: "active-users", why: "Consecutive-day streaks via windows — the engagement shape the UPI habit-forming metric uses, and the gap-and-islands drill behind every 'days active' claim." },
    { slug: "report-contiguous-dates", why: "Gaps-and-islands over dates: consecutive settled days become countable runs — the settlement continuity check the acquiring desk runs on the capture clock." },
    { slug: "rising-temperature", why: "Consecutive-period comparison via LAG — month-over-month ticket and lag deltas on the 14-month spine, the drift-board shape in miniature." },
    { slug: "transactions-per-visit-histogram", why: "Zero-filled histogram via recursive CTE: ticket-size bins with no rows must still print — the honest banding the risk committee's published edges demand." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-sum cutoff: order the rows, accumulate, cut at the limit — the cash-van replenishment and daily-limit logic the operations desk reasons with." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT manifests per day: the acquiring bench's daily SKU roster in one cell — the fold that survives where a join would fan the audit out." },
    { slug: "product-sales-analysis-iii", why: "Top-two periods per product: rank AFTER aggregating — the aggregate-then-window order behind every 'which two months carried this SKU' bench question." },
    { slug: "the-number-of-employees-which-report-to-each-employee", why: "Self-join span counts: relationship managers and the households reporting to them — the reporting-line fold with a HAVING floor that premier coverage hangs on." },
  ],
};
