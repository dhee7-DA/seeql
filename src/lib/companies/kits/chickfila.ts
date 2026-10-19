// Chick-fil-A — Wave-11 (Task 102), food domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Drive-thru density SQL: the storefront db read as a QSR density sandbox — the chain's two disciplines are
// the CLOSED-SUNDAY six-day week and the highest revenue-per-unit in the category off a deliberately small
// menu (this kit maps products = the limited menu, 16 SKUs across 7 menu families). customers = Chick-fil-A One
// loyalty members (region = market), orders = transactions (delivered = served & closed 52, shipped = handed off
// with shipped_at as the handoff stamp 30, pending = placed ahead awaiting the window 14, cancelled = drove off 7),
// order_items = menu lines (quantity = units pulled, unit_price = the line's own menu price), suppliers =
// distributors, invoices = operator statements, payments = rails (card = restaurant card rails, wire = catering
// ACH), expenses = market opex, ledger_entries = GL. Finance tables store INTEGER cents — dollar read =
// amount_cents / 100.0 exactly once; orders.total and order_items.unit_price are REAL dollars. The handoff clock
// maps created_at -> shipped_at onto the drive-thru promise (82 of 103 stamped, 2.98-day average, 2-4 spread on
// this db's DAY-grain clock — production reads the same shape in seconds, say the unit). Probed traps honored:
// created_at is DATE-only so no daypart read exists; there is no channel column so drive-thru vs in-store cannot
// be split without asserting it; premium band (>= 200) is EMPTY (board tops out at 199.99); never-ordered = 0 for
// members AND SKUs, so the honest anti-join lives in billing (6 statements with no settlement = 15,217.00, incl.
// paid-with-no-legs #28 at 1,756.00 and the void-but-settled #11 at 925.00).
// Probe-derived cells (declared per protocol; probed read-only against db/custom.db): weekday census dow 0..6 =
// 16/20/16/16/9/18/8 transactions at 5,775.27 / 6,944.03 / 6,449.71 / 4,585.38 / 2,540.53 / 6,649.57 / 1,888.79
// (foots to 103 / 34,833.28); the visit ladder ties FOUR members at 4 orders; per-family per-unit cells
// (Audio 121.07, Wearables 130.74, Video 85.22, Electronics 56.69, Accessories 27.23, Apparel 36.76, Fitness
// 32.00) and cumulative-share cells (33.7 / 53.6 / 68.5 / 82.4 / 91.8 / 97.5 / 100) probe-derived on top of the
// canonical category-crowns units/revenue; line-vs-shelf check: order_items.unit_price differs from
// products.price on ALL 251 lines — fold the line, not the shelf.
// Pool provenance: company-pools.md carries NO Chick-fil-A section (0 tagged rows) — all 10 topic slug sets and
// all 16 problems are theme-curated from the theme menu's sql rows (no writes/schema/finance-band rows, no w*/d*/
// f*-band slugs) and say so in brief P4. Extended wave R6-B: 30 MCQs, 24 theory, 6 cases (x2/s4/t7/q6 added —
// none used by any other food sibling), 32 problems.
// Case briefs quote probed figures from scripts/company-facts.md (incl. the wave-8+9 canonicalized cells) plus
// the probe cells declared above; every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: chickfila is NOT yet in registry COMPANY_META (wave-11 unwired).
// Wire id "chickfila", domainId "food", name "Chick-fil-A",
// tagline "Drive-thru density: six-day weeks, sixteen SKUs, per-unit revenue",
// accent "text-orange-400" to match this header exactly.

import type { CompanyKit } from "../types";

export const chickfilaKit: CompanyKit = {
  id: "chickfila",
  domainId: "food",
  name: "Chick-fil-A",
  tagline: "Drive-thru density: six-day weeks, sixteen SKUs, per-unit revenue",
  accent: "text-orange-400",

  brief: [
    "**Chick-fil-A** runs the leanest big menu in American quick service — an on-brand board of **16 SKUs across 7 menu families**, sold drive-thru-first and closed every Sunday, so the whole business reads like a density study: fewer items, higher revenue per unit, six days to earn the week. The training db maps one-to-one: 16 customers rows are {orange:Chick-fil-A One} loyalty members (region = market), 103 orders are transactions worth 34,833.28 at a 338.19 average, and 251 order_items are menu lines. The status map is fixed: delivered = {emerald:served and closed} (52), shipped = handed off with shipped_at as the handoff stamp (30), pending = placed ahead awaiting the window (14), cancelled = {rose:drove off} (7).",
    "The data org reads one spine at three grains. The {sky:handoff clock} opens every review: a transaction is placed at created_at and shipped_at stamps the handoff, carried by **82 of 103 transactions** and averaging 2.98 days on this db's day-grain clock — production drive-thru reads the same shape in seconds, *so say the unit or misread the SLA*. Menu analytics owns the density fold — revenue per unit by family, where the premium families (Audio 121.07 per unit, Wearables 130.74) sit against the traffic family (Accessories: 121 units at 27.23) — and finance owns the cents spine, where every statement read is `amount_cents / 100.0` exactly once.",
    "Interview screens are census-then-denominator with a density accent. A loop opens with the one-pass fate census (52 + 30 + 14 + 7 = **103 by construction**), escalates into a rate with the denominator asked out loud (*'do placed-ahead orders count in your handoff rate?'*), then into the {orange:Sunday zero-check}: `STRFTIME('%w', created_at)` buckets the week 0–6, production hard-zeros the 0 row, and this training db reads **16 transactions on Sunday** — naming the artifact IS the answer. The honest dead-ends get named too: created_at is date-only so no daypart split exists, there is no channel column so drive-thru-versus-in-store cannot be split without asserting it, and the 200-plus price band is empty — the board tops out at 199.99.",
    "Preparation strategy: the pools file carries no Chick-fil-A section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: handoff clocks, weekday censuses, two-grain market reads, density ladders, CASE bands and the cents-safe settlement spine. Do the topics in order, then run the six case files on the live db — built for spaced practice rather than one sitting: the {orange:Sunday zero-check} and the {sky:menu density ladder} open the set, the one-pass fate board and the stamped-but-open arm drill the funnel reads, and the month-over-month walk and the claim-versus-ledger census cover growth and the close. The bar to clear: *state the population and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:05 —** The day starts on the drive-thru board. The fate census re-runs first — {emerald:served 52}, handed-off 30, placed-ahead 14, {rose:drove off} 7 — and the four branches must reconcile to **103** or a status value drifted and the board lies. The handoff clock rides along: 2.98 average over the 82 stamped transactions, and drift toward the 4-day tail means placed-ahead orders are aging before they ever reach the window. Last comes the {orange:Sunday zero-check} on the weekday board — code 0 must read zero; this training db reads 16, and the footnote saying so ships with the number.",
    "**11:20 —** Midday is the density read. The operator council wants the menu ladder re-cut — revenue per unit by family, Wearables **130.74** on top against Accessories' 121 units at 27.23 — plus the two-grain market census beside it (EU 45 transactions from 8 members, US 19 from 2), because *a market can add transactions while losing members and only the column pair says which*. The band cut rides the same query: **268 lines under 55** (31.01 average — sides and drinks) against 230 at 115.85 (entrées and combos), and the `CASE` arms must be exhaustive or the ladder quietly loses lines.",
    "**16:10 —** The afternoon tilts toward money. The settlement sweep runs first — **6 statements with no payment, worth 15,217.00** — before a single reminder goes out, and the anomaly list gets walked line by line: a paid-status statement with zero legs (#28, 1,756.00) and a void that settled anyway (#11, 925.00). Rails get re-cut while the sweep runs — card legs 16 / 37,364.00 against wire 11 / 32,248.00, five statements settling on *both* rails — and paid statements land in 28.4 days against flat net-30 terms. The day ends the way every close does: the ledger must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Transaction fate census", what: "Served-and-closed 52, handed-off 30, placed-ahead 14, drove-off 7 over 103 transactions. Four conditional counts over one population — merging placed-ahead into drove-off misreads a queue as lost demand, and the branches must reconcile to 103 by construction." },
    { name: "Handoff clock", what: "`JULIANDAY(shipped_at) - JULIANDAY(created_at)` over the 82 stamped transactions: 2.98 average on a 2–4 spread. The db stores DAYS; production drive-thru reads the same shape in seconds — state the unit and the population or the SLA read is fiction." },
    { name: "Average transaction", what: "34,833.28 across 103 transactions = 338.19, from a 25.47 sides-only floor to a 1,088.44 catering haul. The scalar-subquery baseline every market and weekday read is judged against." },
    { name: "Menu density", what: "Revenue per unit by menu family: Wearables 130.74 and Audio 121.07 on top, Accessories 27.23 at the bottom of the fold while carrying the most units (121). The 16-SKU / 7-family discipline in one ratio — density is the strategy, so the ratio is the KPI." },
    { name: "Two-grain market census", what: "Transactions AND members per market: EU 45 from 8 (15,089.23), APAC 37 from 5 (11,605.45), US 19 from 2 (7,286.16), LATAM 2 from 1 (852.44). COUNT(*) beside COUNT(DISTINCT customer_id) — the gap is intensity, and it decides where the mobile-order push goes next." },
    { name: "Loyalty frequency ladder", what: "Visit counts per member: 24, 17, 14, 13, 5, then a four-way tie at 4. 63.5% of the book sits with members whose lifetime spend crosses 3,000 (71.2% above 2,000) — the Chick-fil-A One tier story in one ladder, ties and all." },
    { name: "Menu-line depth", what: "251 lines across 103 transactions = 2.44 lines each, max quantity 3 on a line, and the sides-and-drinks family touches 54 of 103 tickets. Depth separates the density story from the price story — combos land as new lines, not bigger ones." },
    { name: "Settlement exposure", what: "6 statements with no payment = 15,217.00 (including #28 marked paid with zero legs at 1,756.00), one partial (4,000.00 of 6,148.00), and rails split card 16 legs / 37,364.00 versus wire 11 / 32,248.00. Paid statements settle in 28.4 days against flat net-30 terms — the tail is the distributor lever." },
  ],

  topics: [
    {
      name: "Handoff clocks & queue aging",
      why: "Every ops screen opens with the clock: transaction placed at created_at, handoff stamped at shipped_at, delta averaged over stamped rows only. Each stage is a conditional count or average over a timestamp, and the first question is what the denominator holds — 82 stamped of 103 placed, with the 14 placed-ahead rows excluded by definition. julianday arithmetic with a stated population is the shape being graded.",
      slugs: ["average-time-of-process-per-machine", "find-total-time-spent-by-each-employee", "find-golden-hour-customers", "calculate-orders-within-each-interval", "consecutive-available-seats", "deferred-revenue", "immediate-food-delivery-i"],
    },
    {
      name: "The Sunday zero-check",
      why: "The system closes every Sunday, so the weekday census is a correctness instrument: STRFTIME('%w', created_at) buckets the week 0–6 and the 0 row must hard-zero in production. This training db reads 16 Sunday transactions — the artifact gets named, not scrubbed — and the census exists so the zero is trusted the day it lands. Format-code discipline ('%w' is not '%d' is not '%Y') is the trap being graded.",
      slugs: ["tasks-count-in-the-weekend", "report-contiguous-dates", "the-latest-login-in-2020", "friday-purchases-i", "find-bursty-behavior", "winning-candidate", "spend-histogram"],
    },
    {
      name: "Two-grain market censuses",
      why: "Transactions and members are different grains of the same join, and every census here reports both: EU runs 45 transactions from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded; the ratio is the intensity signal that decides whether growth is broadening or concentrating.",
      slugs: ["students-and-examinations", "unique-orders-and-customers-per-month", "article-views-ii", "dormant-reactivation", "find-customers-with-positive-revenue-this-year", "users-that-actively-request-confirmation-messages"],
    },
    {
      name: "Menu density ladders",
      why: "The chain's whole strategy is revenue per unit, so the ladder is a ratio fold: line revenue beside units pulled, per family and per SKU. Average-selling-price is the exact shape — revenue divided by units with the fold grain named — and rank windows turn the ladder into a board. The trap is folding catalog price instead of line price: on this db the two disagree on every one of the 251 lines.",
      slugs: ["average-selling-price", "queries-quality-and-percentage", "rank-scores", "fifo-inventory-cogs", "product-sales-analysis-iii", "card-launch-success", "rolling-average-steps", "roas-by-campaign"],
    },
    {
      name: "CASE-banded menu tiers",
      why: "Menu lines band into sides-and-drinks versus entrées-and-combos with one CASE fold — 268 lines under 55 (31.01 average) against 230 at 115.85 — and loyalty tier cuts read the same way. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the band story, and a reordered WHEN quietly re-bands the base. Members tier into Chick-fil-A One bands by the same shape.",
      slugs: ["the-category-of-each-member-in-the-store", "type-of-triangle", "calculate-special-bonus", "customer-purchasing-behavior-analysis", "immediate-food-delivery-iii", "sales-analysis-iii", "the-most-recent-orders-for-each-product", "usage-tier-percentiles", "cohort-repeat-revenue"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month transaction spine (2024-01 to 2025-02) is the demand call's home turf: prior month beside current, delta rounded, trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Cancelled transactions concentrate in July and November, 2 each of 7, and the walk is how that pattern gets defended to the council.",
      slugs: ["hopper-company-queries-i", "consecutive-transactions-with-increasing-amounts", "find-consistently-improving-employees", "count-student-number-in-departments"],
    },
    {
      name: "Loyalty frequency ladders",
      why: "Chick-fil-A One is a frequency business: the visit ladder runs 24, 17, 14, 13, 5 and then a four-way tie at 4, and tier logic lives in repeat behavior. Gaps-and-islands reads — consecutive visits, strictly increasing baskets — separate the regulars from the one-timers. The tie handling is a policy question about peer members, not syntax.",
      slugs: ["game-play-analysis-i", "customer-order-frequency", "customers-with-strictly-increasing-purchases", "dau-wau-stickiness", "find-loyal-customers", "find-churn-risk-customers", "game-play-analysis-ii", "products-with-three-or-more-orders-in-two-consecutive-years"],
    },
    {
      name: "Set-stack fate boards",
      why: "Board packets stack populations — served beside handed-off beside placed-ahead — and UNION ALL is the honest stack while UNION dedups whole rows silently. EXCEPT answers 'which placed transactions never got a handoff stamp', and the billing anti-join (6 never-collected statements) is the same algebra pointed at money. The stack must reconcile to 103 or the board is wrong.",
      slugs: ["monthly-transactions-ii", "league-statistics", "count-apples-and-oranges"],
    },
    {
      name: "One-pass censuses",
      why: "The ops board gets all four fates in ONE scan — FILTER (WHERE …) branches per aggregate and SUM(CASE …) is the portable twin; four sequential queries are four ways to drift. Attach reads ride the same shape: how many tickets carry the launch item, how many touch two families but skip the drink. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["find-stores-with-inventory-imbalance", "count-the-number-of-experiments", "number-of-rich-customers", "customers-who-bought-all-products"],
    },
    {
      name: "Cents-safe settlement rails",
      why: "Statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — exactly once, or the board reads a hundredfold off. Coverage classifies at statement grain: legs equal billed → exact (21), zero → no payment (6), else partial (1). The rails matter too: card legs (16, 37,364.00) and wire legs (11, 32,248.00), with five statements settling on both.",
      slugs: ["bank-account-summary", "trial-balance-check", "products-worth-over-invoices", "expected-credit-loss", "delinquency-roll-rates", "chargeback-rate-ranking"],
    },
  ],

  theory: [
    {
      id: "chickfila-t1",
      q: "Your market report joins loyalty members to transactions. When do you INNER and when LEFT — and what silently breaks if you filter a transaction column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A transaction report joins members to transactions: a transaction with no member row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from members: members with no transactions ARE the answer, arriving with NULL transaction columns. The classic break: filtering status = 'shipped' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the whitespace vanished; the fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-transacting members — all 16 appear in orders somewhere — and proving that zero is itself the job, because a confident zero you did not verify is how whitespace reports die in review. The Chick-fil-A twist: the same discipline drives the Sunday zero-check — a zero you expected is only trustworthy if the query shape could have returned a non-zero.",
      tag: "joins",
    },
    {
      id: "chickfila-t2",
      q: "The frequency ladder runs 24, 17, 14, 13, 5 visits, then FOUR members tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips: the four-way tie at 4 consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, a silent judgment call about whose loyalty tier gets the push first. The same tie problem appears inside running math: SUM OVER (ORDER BY created_at) uses a default RANGE frame, so transactions tied on the same day enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer members, or a named tie-breaker — and writing it in the query comment, the way the operator council's ladder publishes it.",
      tag: "windows",
    },
    {
      id: "chickfila-t3",
      q: "The census says 103 transactions, 251 menu lines, 498 units, 16 members. Why do the four numbers disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains of the same object. COUNT(*) over orders counts transactions (103); COUNT(*) over order_items counts menu lines (251); SUM(quantity) counts units pulled (498, max 3 on a line); COUNT(DISTINCT customer_id) folds everything back to members (16). None is wrong: transactions measure demand events, lines measure basket depth (2.44 per transaction), units measure kitchen pull, members measure installed base. The trap that catches candidates is a fourth grain sneaking in through a join: attach members for a market read and COUNT(*) still counts transactions, but join order_items for the menu mix and the same COUNT(*) silently counts lines. Saying 'one row per what?' for every COUNT is the habit the panel grades, and it is the habit the density KPI is built on — revenue per unit only means something once units and dollars are counted at their own grains.",
      tag: "aggregation",
    },
    {
      id: "chickfila-t4",
      q: "shipped_at is NULL until the handoff stamp lands. What is your policy for the handoff-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped transactions have a handoff, so the report measures placed-to-handed-off for the 82 of 103 that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. The 21 unstamped rows split 14 placed-ahead (no window yet) and 7 drove-off (no window ever) — two different populations wearing one NULL, which is exactly why the fate census runs beside the clock. Then mechanics: AVG ignores NULLs, so AVG over ALL rows returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name; COUNT(shipped_at) counts the stamped subset and the gap to COUNT(*) is exactly 21. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day handoffs for transactions that never happened, and it poisons the 2.98 baseline every drift alert keys off.",
      tag: "nulls",
    },
    {
      id: "chickfila-t5",
      q: "The density review wants revenue per menu family for families carrying at least 50 units. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status or date rule is a row-level fact — it discards rows before any fold, so it lives in WHERE; putting it in HAVING is impossible because the column no longer exists once rows are grouped. The 50-unit floor is a group-level fact — HAVING SUM(oi.quantity) >= 50 after GROUP BY; on this db six of the seven families clear it and Fitness (27 units) drops. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia; it is the difference between a density board and an error. One more placement rule the screens love: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) puts the 100.0 BEFORE the division, because integer division truncates toward zero and the drove-off share reads 0 instead of 6.8. The strong answer places every filter by asking: is this a fact about one transaction, or about a family?",
      tag: "pipeline",
    },
    {
      id: "chickfila-t6",
      q: "WHERE revenue > (SELECT AVG(revenue) FROM families) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and revenue > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: every family fold produces a mean. On filtered staging — one market, one status, one weekday — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each family to ITS market's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when the staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties — the reason EXISTS is the house default for existence tests. State the inner fold's population and its empty-case behavior unprompted; that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "chickfila-t7",
      q: "The demand review buckets transactions by weekday on TEXT dates. How do you build the spine, why '%w', and what do you do about the first row of a LAG walk?",
      a: "Three moves. The spine: STRFTIME('%w', created_at) returns 0 through 6, Sunday through Saturday — the closed-day row is 0 by construction, which is why '%w' and not '%d' (day-of-month, 31 buckets of noise) or '%Y' (two rows for two years). Weekday codes are single characters, so ORDER BY dow sorts 0,1,2…6 correctly; the moment a bucket can reach two digits, sort on the numeric cast or the calendar scrambles. Half-open windows for any range cut — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN silently drops the last day's transactions. And the LAG: on a month-ordered spine the first row's prior value is NULL by definition — report it as the baseline, never coalesce it to zero, which reads as a flat month. One honesty rule this db teaches: created_at is date-only, so no daypart read exists — the Sunday zero-check is the closest thing to an operating-hours query here, and saying that out loud is the answer.",
      tag: "dates",
    },
    {
      id: "chickfila-t8",
      q: "Finance says a statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors. The coverage census must read 21 exact (65,612.00 both sides — the void-but-settled leg folds in by construction, the paid-status no-leg folds out), 1 partial (4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0, applied exactly once — the missing .0 prints a hundredfold-off book, and a second division eats the cents back. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "chickfila-t9",
      q: "Two analysts write the never-collected register: one with LEFT JOIN + IS NULL, one with NOT EXISTS. When do the two shapes disagree, and which do you ship?",
      a: "On this book they agree — both return the 6 statements worth 15,217.00 — because payments.invoice_id is NOT NULL by schema, so there is no NULL-leg row for the shapes to treat differently. They diverge when the joined column is NULL-able: LEFT JOIN + IS NULL buckets a NULL-key leg as 'unmatched', while NOT EXISTS asks the existence question directly and is immune. NOT EXISTS also survives the staging tables where NULLs sneak in, and it short-circuits on the first hit. House default: NOT EXISTS for existence tests, the LEFT JOIN version kept as the cross-check — if the two disagree on a close, the disagreement IS the finding, and neither ships until you know which population each one read.",
      tag: "joins",
    },
    {
      id: "chickfila-t10",
      q: "The handoff walk runs SUM(total) OVER (ORDER BY created_at) across transactions. Two transactions share a day and the cumulative jumps twice at once. What is happening and what is the fix?",
      a: "With ORDER BY, the window default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes peers — rows tied on created_at enter the cumulative together, so the walk steps two transactions in one day. The fix is writing the frame out loud: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row. Which is right is a policy call: a per-transaction walk wants ROWS with a named tie-breaker (order id), while RANGE is only correct if same-day transactions are meant to settle as a batch. On a six-day week same-day ties are the norm, not the edge case — and the wrong frame quietly redefines the running number every operator council reads.",
      tag: "windows",
    },
    {
      id: "chickfila-t11",
      q: "Marketing wants Chick-fil-A One members tiered into quartiles by visit count. How do you build the tiers, and what do ties do to them?",
      a: "NTILE(4) OVER (ORDER BY visits) is the tile fold — it splits the 16 member rows into four buckets of 4 as evenly as the rows allow, biggest book first. Ties do not break NTILE: it counts rows, not values, so two members tied at 4 visits can land in different quartiles — a defensible tile is still a peer split, so the tier definition ships with the tie policy named. PERCENT_RANK is the value-based alternative: tied members share a percentile, fairer for peers but no longer equal-size buckets. The trap is re-deriving tiers with scalar math — ROUND(4 * rank / 16) — which drifts whenever the roster size changes. State which grain the tile counts (rows) and which the percentile measures (values), then let the business pick.",
      tag: "windows",
    },
    {
      id: "chickfila-t12",
      q: "The operator council wants one cell listing the SKUs behind the traffic family's revenue, comma-separated. How do you fold rows into that string, and what breaks?",
      a: "GROUP_CONCAT is the fold: GROUP_CONCAT(p.name) over the family's line rows returns the SKU names in one cell, and GROUP_CONCAT(p.name ORDER BY p.name) pins the order so the cell is stable across reruns. What breaks: no ORDER BY means the order is whatever the scan produced, so the cell shuffles between environments; no separator argument means the default comma, right for ids and wrong for names containing commas; and folding at the wrong grain — grouping by transaction as well — splits the cell into per-ticket strings that no longer read as a menu. GROUP_CONCAT is a display fold, not arithmetic: it belongs in the presentation layer after units and revenue foot, never as the number that proves them.",
      tag: "aggregation",
    },
    {
      id: "chickfila-t13",
      q: "The ops board wants all four fates — served, handed off, placed ahead, drove off — in one pass over transactions. Compare FILTER (WHERE …) against SUM(CASE …) for that job.",
      a: "Both produce the four branches in one scan: COUNT(*) FILTER (WHERE status = 'delivered') reads cleanest on modern SQLite, and SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin. The discipline both enforce is the reconciliation identity — the branches must sum to COUNT(*): 52 + 30 + 14 + 7 = 103 — and a sloppy predicate is what breaks it. SUM(CASE) without the ELSE returns NULL on branches that never fire, printing a blank cell instead of a zero; FILTER never does that. Four sequential queries are the anti-pattern: four scans, four chances for the status list to drift, and no identity forcing them to reconcile. One pass, one population, branches that foot by construction — that is what the board packet requires.",
      tag: "aggregation",
    },
    {
      id: "chickfila-t14",
      q: "Where does COALESCE belong in the settlement sweep — and where is IFNULL(latency, 0) actively dangerous?",
      a: "COALESCE belongs on money folds over outer joins: COALESCE(SUM(p.amount_cents), 0) makes a zero-leg statement print remitted 0.00 instead of NULL, so the sweep's billed-minus-remitted arithmetic stays numeric down the column. The danger case is the handoff clock: IFNULL(julianday(shipped_at) - julianday(created_at), 0) invents a same-day handoff for every placed-ahead and drove-off transaction, drags the 2.98 average toward ~2.37, and poisons the baseline every drift alert keys off — a fabricated number wearing the right name. The rule is about what the NULL means: an outer-join NULL is 'nothing settled', so zero is the honest fold; a missing event stamp is 'has not happened', so zero is a lie and the row belongs in a stated-out population instead. Same function, opposite verdicts — say the reasoning, not a blanket rule.",
      tag: "nulls",
    },
    {
      id: "chickfila-t15",
      q: "The density ladder reads biggest revenue first, alphabetical within ties, and the weekday census reads code 0 through 6. How do you write ORDER BYs that guarantee both, and what does 'stable sort' promise?",
      a: "Two keys, explicit, every time: ORDER BY revenue DESC, family ASC for the ladder; ORDER BY dow for the census — weekday codes are single characters, so text order 0,1,2…6 is numeric order, but the moment a bucket can reach two digits the sort must ride a numeric cast or the calendar scrambles. Never rely on the database to 'remember' anything: result order is undefined without ORDER BY, and SQLite makes no stability promise beyond the columns you list — the second key must be IN the query. The follow-up the panel loves: ORDER BY rank, name after a window function — ranking first, alphabetical second — which is how the published ladder avoids two printings disagreeing. Sorting is part of the deliverable, not decoration: a correct fold in the wrong order is a wrong board.",
      tag: "pipeline",
    },
    {
      id: "chickfila-t16",
      q: "Growth wants each member's lifetime spend beside their MARKET's average. Walk me through the correlated-subquery shape and its cost.",
      a: "The correlated shape re-runs an inner fold per outer row: the inner query carries a reference to the outer row's region, so for each of the 16 members SQLite re-folds that market's transactions. On 16 rows it is free; at chain scale it is the classic N+1, and the honest alternatives are a window — AVG(total) OVER (PARTITION BY region) — or a derived table of market averages joined back on region, both folding each market once. The behavior differences to state out loud: the window computes every market's average whether displayed or not, the correlated form only computes markets present in the outer result, and an empty market slice leaves the correlated scalar NULL — which silently drops from any comparison built on top of it. Same trap as the above-average filter: the query that empties while looking valid.",
      tag: "subqueries",
    },
    {
      id: "chickfila-t17",
      q: "EXISTS, IN, and a JOIN against a DISTINCT subquery all can answer 'which members transacted this week'. Which do you reach for and why?",
      a: "EXISTS is the house default: it short-circuits on the first match, it is NULL-proof — an IN list with one NULL turns every NOT IN comparison UNKNOWN and empties the report — and it states intent (existence) rather than mechanism. IN with a subquery is fine when the list is small and known-NULL-free, but it materializes the whole list and dies on NULLs exactly where staging tables live. The JOIN-against-DISTINCT shape is the semi-join you write when you also need columns from the matched side — but a plain JOIN without DISTINCT fans members back out, one row per transaction, and silently double-counts the regulars who came twice. The interview answer: name the semantics (does at least one row exist?), pick the shape whose failure mode you can state, and prove the edge — the anti-join of the same three shapes must all return the same 6 never-collected statements or one of them misread the population.",
      tag: "subqueries",
    },
    {
      id: "chickfila-t18",
      q: "Paid statements settle in 28.4 days against flat net-30 terms. How is that latency computed off this schema, and what are the grain traps?",
      a: "The latency is julianday(paid_on) - julianday(issued_on) folded per statement — MIN(paid_on) for time-to-first-remittance, or leg-level averages if you read per rail; saying which is the whole answer, because 5 statements settle on both rails and their two legs land on different days. Fold at statement grain, then average over the 22 leg-carrying statements — the 6 zero-leg statements have no latency and are excluded by a stated population, not a silently shrunken AVG. The traps: TEXT date subtraction only works while the format is uniform ISO — julianday is the explicit cast that survives drift — and the 84-day tail is a real distributor relationship, not an outlier to trim. A 28.4 average without its 13-to-84 spread is a number that looks stable while hiding the lever the ops review exists to pull.",
      tag: "dates",
    },
    {
      id: "chickfila-t19",
      q: "created_at is date-only and there is no channel column, so daypart and drive-thru reads are dead. What can you honestly ship instead, and how do you say it?",
      a: "Name both dead ends before anyone asks: strftime('%H') reads '00' on all 103 transactions, so no daypart split exists at any grain; and with no channel column, drive-thru versus in-store cannot be split without asserting a fact the schema does not carry — the fastest way to invent demand. The honest stand-ins: the weekday census (STRFTIME('%w', created_at), Sunday-first, the closed-day row policed), the month spine for trend, and ticket-size bands for daypart-adjacent reads like catering versus sides — each labeled with its grain in the title and the footnote. If the business insists on hour or channel grain, the deliverable is a request for the timestamp and channel feeds, not a chart whose axes pretend the db knows things it does not. The panels grade the refusal as much as the query.",
      tag: "dates",
    },
    {
      id: "chickfila-t20",
      q: "Walk me through writing the ticket-band CASE — sides-and-drinks under 55, entrées-and-combos above — so it cannot silently mis-band a line.",
      a: "Three rules. Exhaustive arms: under 55, 55 and above, ELSE as the guarantee — every one of the 251 lines lands somewhere, and the band counts must foot to 251 or the fold is leaking lines. Ordered predicates: CASE evaluates top-down, so WHEN unit_price < 55 must precede any overlapping bound — reorder the pair and the 54.99 line quietly re-bands, no error anywhere. Literal-typed bounds: numbers against a REAL column — a text '55' compares by type rules and re-bands the base. Then verify by construction: 268 lines under 55 at a 31.01 average against 230 at 115.85, foots to 498 — and the fold reads the LINE's own unit_price, not the shelf tag, because the two disagree on all 251 lines. A band fold that cannot prove those numbers is a slide, not a census.",
      tag: "case",
    },
    {
      id: "chickfila-t21",
      q: "The board stacks a handed-off block over a drove-off block. UNION or UNION ALL — and what does the choice have to do with the 103 reconciliation?",
      a: "UNION ALL, and the reason is the reconciliation: the fate board exists so the branches foot to 103 by construction — 52 + 30 + 14 + 7 — and UNION dedups whole ROWS silently, so two branches emitting byte-identical rows (same label, same count, no distinguishing column) collapse into one and the board loses a member with no error anywhere. The safe pattern is UNION ALL plus a literal branch label or a column list that cannot collide, with a comment stating why duplicates are impossible. UNION is correct only when set semantics ARE the feature. The close-culture version: EXCEPT answers 'which placed transactions never got a handoff stamp' — 30 stamped-but-not-served on this book — and if an EXCEPT between branches that should be disjoint returns surprises, the 103 identity is already broken upstream.",
      tag: "sets",
    },
    {
      id: "chickfila-t22",
      q: "The rails fold card 37,364.00 plus wire 32,248.00 against the ledger cash credit of 69,612.00. How do you write that tie-out so it cannot lie?",
      a: "Two folds, one delta: fold payments by method — SUM(amount_cents) / 100.0 with COUNT(*) beside it so the leg counts 16 and 11 ship with the dollars — then subtract the ledger cash credit and print the delta in the query's own output, a CASE that says TIE or names the gap. The discipline: the cents fold runs exactly once — the missing .0 prints a hundredfold-off book, and a second division eats the cents back, and either way 69,612.00 stops footing while looking plausible. Watch the grain: the method fold is at LEG grain, and it ties to a statement-grain ledger line only because the legs are the ledger — the 5 dual-rail statements contribute one leg to each rail, so nothing double-counts. When the delta is not zero, the per-statement coverage census ships beside it; a delta alone is an alarm, not an answer.",
      tag: "money",
    },
    {
      id: "chickfila-t23",
      q: "Why does this team treat the payments table as the ledger of record and the statement status column as a claim? Give the query-level version.",
      a: "Because status is an assertion and legs are the world. Query-level: the coverage census classifies by leg folds — legs sum to billed is 'exact', zero legs is 'never collected', else 'partial' — and it catches both mirror-image lies: #28 marked 'paid' at 1,756.00 with zero settlement legs, and #11 'void' at 925.00 that settled anyway with one leg for exactly 925.00. A status-filtered report ships both lies to the council; the leg-fold census reconciles 21 exact (65,612.00 both sides — the void-but-settled folds in by construction, the paid-claim folds out), 1 partial and 6 none, footing to 28 statements and 86,977.00 billed. The general rule: any column asserting a state is a claim to be tested against the transaction rows that constitute it — and the analyst who reports the claim without running the test is what the close review is hunting for.",
      tag: "quality",
    },
    {
      id: "chickfila-t24",
      q: "The market ladder ranks members within each region; the system ladder ranks all 16. How does the window change between the two — and what stays fixed?",
      a: "Only the partition changes: RANK() OVER (PARTITION BY c.region ORDER BY COUNT(*) DESC) restarts the ladder per market, while dropping PARTITION BY ranks the whole roster. What stays fixed is the fold underneath — GROUP BY o.customer_id still collapses 103 transactions to 16 members and COUNT(*) still counts transactions, not lines — because the classic bug is adding a window and silently changing the grain (join order_items for a menu read and the rank counts lines). The two ladders answer different questions: the system ladder feeds the concentration story (63.5% of the book with members above 3,000 lifetime), the partitioned one feeds the mobile-order push (EU's 8 members rank among themselves, where the 45-transaction load lives). And re-state the tie policy per cut — the four-way tie at 4 shares rungs in both, but 'peer within market' and 'peer across the system' are different peer groups, and the published policy names which.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "chickfila-mcq-1",
      prompt: "A transaction's status reads 'shipped'. In this kit's Chick-fil-A stage map, what happened?",
      choices: ["Handed off — shipped_at stamped the guest handoff, close-out in flight", "Served and closed — the transaction completed", "Drove off — the guest abandoned at the speaker", "Placed ahead — still awaiting the window"],
      answer: 0,
      why: "The stage map is fixed: shipped = handed off (30 of 103 transactions), with shipped_at as the handoff stamp. It is stamped and out the window — but not yet a closed transaction.",
      notes: [
        { choice: 1, why: "Served-and-closed is 'delivered' — 52 transactions. Calling handed-off transactions closed inflates the completed base before close-out lands." },
        { choice: 3, why: "Placed-ahead is 'pending' — 14 transactions with no shipped_at yet. Pending is not a handoff and not a loss; it is 'not yet', and it stays in the funnel denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-2",
      prompt: "STRFTIME('%w', created_at) returns '0' for a transaction. Which day did it land on — and what does the closed-Sunday policy predict for that bucket in production?",
      choices: ["Sunday — and the production bucket hard-zeros", "Monday — and the bucket carries the weekly ad push", "Saturday — and the bucket peaks", "The format is invalid — '%w' returns NULL on any date"],
      answer: 0,
      why: "'%w' numbers the week 0–6, Sunday through Saturday. Code 0 is the closed day: in production it must read zero transactions, and this training db's 16 are a named artifact, not a policy violation.",
      notes: [
        { choice: 1, why: "'%d' is day-of-month, '%w' is the weekday code. Swapping them scrambles the census into 31 buckets of noise while the query runs clean." },
        { choice: 3, why: "'%w' is a documented SQLite format code — it returns '0' through '6' for any well-formed date, never NULL." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-3",
      prompt: "The handoff clock averages 2.98 days. Over which population?",
      choices: ["82 stamped transactions of 103 placed", "103 placed transactions — unstamped rows count as 0 days", "52 served-and-closed transactions only", "16 members — one clock per member"],
      answer: 0,
      why: "Only stamped transactions have a handoff: 82 of 103, with the 14 placed-ahead (no window yet) and 7 drove-off (no window ever) excluded by definition. The population ships with the number.",
      notes: [
        { choice: 1, why: "Counting unstamped rows as zero days drags the average to roughly 2.98 × 82/103 ≈ 2.37 and invents same-day handoffs for transactions that never happened." },
        { choice: 2, why: "Served-and-closed is a fate, not the clock's population — 30 handed-off transactions carry the stamp too, and dropping them biases the clock toward the slowest completions." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to drove-off transactions only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the share truncates toward 0 and every market reads flat. The multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the drove-off map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-5",
      prompt: "The density board gates at 50 units per menu family. Which families survive HAVING SUM(oi.quantity) >= 50?",
      choices: ["Six of seven — every family except Fitness (27 units)", "All seven — 50 is below every family's pull", "Four — the premium families only", "Three — Audio, Accessories and Electronics"],
      answer: 0,
      why: "Family pulls run 121, 97, 85, 61, 54, 53 and 27 — only Fitness falls under the bar, so six families clear it. The gate is a group-level fact: HAVING after GROUP BY, never WHERE.",
      notes: [
        { choice: 1, why: "Fitness pulls 27 units — under the bar. A gate that passes everything is not a gate; check the smallest fold before shipping the board." },
        { choice: 3, why: "The gate is on units, not dollars: Accessories carries the most units (121) despite the lowest per-unit revenue (27.23). Density and volume are different columns." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-6",
      prompt: "The units ladder reads 47, 46, 38, 36, 36, 33, 31, 30, 30, 30, 28… Under RANK, what rank does the 28-unit SKU carry?",
      choices: ["11", "9", "8", "10"],
      answer: 0,
      why: "RANK shares rungs and then skips: the three-way 30-tie occupies ranks 8 through 10, so the next distinct count lands on 11. DENSE_RANK would call it 8.",
      notes: [
        { choice: 1, why: "9 is inside the tie block, not after it — the 30s share rank 8, and 9–10 are the skipped rungs. Off-by-one on tie blocks is the classic leaderboard bug." },
        { choice: 2, why: "8 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-7",
      prompt: "A statement reads amount_cents = 175600. The board prints 175600 instead of 1,756.00. What happened?",
      choices: ["The /100.0 dollar read was skipped — INTEGER cents printed raw", "The cents were double-divided by 100 twice", "ROUND(..., 2) truncated the value", "The statement is void — the board is right"],
      answer: 0,
      why: "Statements and legs store INTEGER cents; the dollar read is amount_cents / 100.0, applied exactly once. Skipping the fold prints a hundredfold-off board — 175,600 where 1,756.00 belongs (#28 on this db).",
      notes: [
        { choice: 1, why: "Double-dividing shrinks the money a hundredfold the other way — 17.56, not 1,756.00. The tie to the ledger cash line (69,612.00) is the check that the fold ran exactly once." },
        { choice: 2, why: "ROUND(..., 2) is the display step — it never moves a decimal point. The bug is the missing fold, not the rounding." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-8",
      prompt: "A staging triage list uses member_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two sets genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over an unguarded column.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every transaction carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty triage lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "chickfila-mcq-9",
      prompt: "A board stack puts handed-off transactions under drove-off transactions in one layout, built with UNION. A reviewer says one member's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same member, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same member, same counts, no market or fate label — collapse into one, and the board loses a member with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "chickfila-mcq-10",
      prompt: "A dashboard walks transaction revenue day by day: SUM(total) OVER (ORDER BY created_at). Two transactions share a created_at day, and the cumulative 'jumps two transactions at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a six-day week the ties are guaranteed — same-day transactions are the norm, not the edge case.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "chickfila-mcq-11",
      prompt: "The one-pass fate board returns 52, 30, 14, 7 as four FILTER branches over transactions. What identity proves it in one assertion?",
      choices: ["Each branch is even", "The four branches sum to COUNT(*) — 103", "The branches are all under 60", "MAX(branch) - MIN(branch) < 50"],
      answer: 1,
      why: "The reconciliation identity: served 52 + handed-off 30 + placed-ahead 14 + drove-off 7 = 103 by construction. A drifted status list breaks the identity — which is what makes the one-pass board self-checking.",
      notes: [
        { choice: 2, why: "Magnitude bounds are coincidences of this db, not invariants. Only the sum-to-population identity can catch a predicate bug." },
        { choice: 3, why: "Spread describes the story, not the census. The board's correctness argument is the foot, not the range." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-12",
      prompt: "EU carries 45 transactions from 8 loyalty members; the US runs 19 from 2. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts transaction rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap — 5.6 versus 9.5 transactions per member — is the intensity read that steers the mobile-order push.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every transaction carries a member. Without DISTINCT both columns read 45 and coverage vanishes." },
        { choice: 2, why: "SUM(total) is the 15,089.23 money read. Dollars answer a different question than the census asks." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-13",
      prompt: "Revenue per unit by menu family — the density KPI. Which fold computes it so it survives the council's audit?",
      choices: ["SUM(unit_price) / COUNT(*) over order_items", "SUM(quantity * unit_price) / SUM(quantity) — line revenue over units pulled", "AVG(products.price)", "MAX(unit_price) per family"],
      answer: 1,
      why: "Density is line revenue divided by units pulled, both folded from order_items — the LINE's own price, because it disagrees with the shelf tag on all 251 lines. Folding catalog price bakes the menu board into a transaction metric.",
      notes: [
        { choice: 0, why: "That sums prices where units belong — dollars over line count, a number with no business meaning." },
        { choice: 2, why: "AVG over the catalog ignores who actually pulled what. The 130.74 Wearables crown is a transaction fold, not a shelf read." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-14",
      prompt: "The handoff clock reads 2.98 on this db. The production dashboard reads 214. Both are 'the handoff clock'. What differs?",
      choices: ["The db is broken", "The unit: this db's clock stores DAYS (2.98-day average on a 2–4 spread); production reads the same shape in seconds — state the unit or misread the SLA", "Production counts only served transactions", "The 2.98 is a percentage"],
      answer: 1,
      why: "julianday arithmetic on DATE-grain stamps yields days; production drive-thru measures handoffs in seconds. Same query shape, different unit — the report that omits the unit is the one the ops review rejects.",
      notes: [
        { choice: 0, why: "Nothing is broken — the training db is DAY-grain by design. The lesson is labeling, not repair." },
        { choice: 2, why: "The clock's population is the 82 stamped transactions regardless of unit. The 214-versus-2.98 gap is units, not population." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-15",
      prompt: "The demand trend buckets transactions with STRFTIME('%m', created_at) and shows a February spike far above any other month. Diagnosis?",
      choices: ["February is genuinely the peak — ship it", "'%m' drops the year: February 2024 and February 2025 merge into one bucket — the spine needs '%Y-%m' for 14 honest buckets", "The drove-off transactions double-counted", "STRFTIME cannot bucket TEXT timestamps"],
      answer: 1,
      why: "'%m' yields the two-digit month alone, so same-month buckets across the year boundary fold together — the 14-month spine from 2024-01 to 2025-02 needs '%Y-%m'. A year-merged spike is two Februaries stacked, not demand.",
      notes: [
        { choice: 0, why: "The peak may be real — but a bucket that merges years is not evidence of anything. Fix the spine before reading the trend." },
        { choice: 2, why: "Fates are conditional counts, not multiplications — 7 drove-off across the whole book. The spike is the year fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-16",
      prompt: "WHERE revenue > (SELECT AVG(revenue) FROM families WHERE region = 'LATAM') — the staging slice is empty. What does the report return?",
      choices: ["An error about empty subqueries", "Zero rows silently — the scalar subquery returns NULL and revenue > NULL is UNKNOWN for every row", "All 103 transactions", "Only LATAM rows"],
      answer: 1,
      why: "A scalar subquery over an empty fold returns NULL, not an error, and every comparison against NULL is UNKNOWN — the above-average report empties while looking valid. Stating the empty-inner behavior unprompted is the follow-up panels fish for.",
      notes: [
        { choice: 0, why: "Empty is precisely the trap: scalar subqueries are contractually 0-or-1 rows, and the 0-row case is silent." },
        { choice: 2, why: "UNKNOWN is never true, so nothing passes. An all-rows result would require a different bug entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-17",
      prompt: "The menu read joins transactions to menu lines and COUNT(*) reads 251, not 103. What happened?",
      choices: ["A fan-out — the join multiplied transactions by their menu lines; COUNT(*) now counts lines", "The orders table has 251 rows", "DISTINCT is missing", "251 is revenue mislabeled as a count"],
      answer: 0,
      why: "251 lines over 103 transactions is the 2.44 basket depth: after the join, one row per LINE. COUNT(DISTINCT o.id) recovers the transaction grain — 'one row per what?' for every COUNT is the habit being graded.",
      notes: [
        { choice: 2, why: "DISTINCT dedups whole rows — with the transaction id included there are no duplicates to remove. Count the right key instead." },
        { choice: 3, why: "Book value is 34,833.28. The 251 is a genuine line count answering a different question than the ticket census." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-18",
      prompt: "The density ladder adds a cumulative revenue-share column: SUM(line_revenue) OVER (ORDER BY line_revenue DESC) / grand total. What breaks if the window sorts ASC?",
      choices: ["Nothing — the share column is order-independent", "The cumulative runs backwards: it opens near 100% and shrinks while the rows claim to grow, contradicting every cell beneath it", "The grand total halves", "RANK replaces the SUM silently"],
      answer: 1,
      why: "A cumulative share must walk the same direction as the ladder: DESC puts Audio's 33.7% on top and closes at 100. ASC runs the sum backwards and every share cell contradicts the row ordering — a board that argues with itself.",
      notes: [
        { choice: 0, why: "The window's ORDER BY defines the walk. Change the direction and the cumulative semantics invert — the cells move even though the rows do not." },
        { choice: 2, why: "The grand total fold (OVER ()) is direction-free. Only the running sum flips." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-19",
      prompt: "Settlement latency averages 28.4 days, fastest 13, slowest 84. Which fold computes time-to-first-collection per statement?",
      choices: ["julianday(paid_on) - julianday(issued_on) per leg, averaged over all legs", "julianday(MIN(p.paid_on)) - julianday(i.issued_on) grouped per invoice, over the 22 leg-carrying statements", "AVG(due_on - issued_on)", "COUNT(paid_on) per invoice"],
      answer: 1,
      why: "Time-to-first-collection folds MIN(paid_on) per statement — the first leg — then averages over the statements that have legs. The 6 zero-leg statements have no latency and are excluded by a stated population, not a silent NULL-shrink.",
      notes: [
        { choice: 0, why: "That averages every leg — the 5 dual-rail statements contribute two latencies each. That is a per-rail read, not time-to-first-collection." },
        { choice: 2, why: "due_on is contractual terms, not behavior. The 28.4-versus-net-30 gap is the story the fold must measure." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-20",
      prompt: "Two shapes return the never-collected register: invoices LEFT JOIN payments ... WHERE p.id IS NULL, and WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id). When do they disagree?",
      choices: ["Never — they are always identical", "Only when the joined column can be NULL — a NULL invoice_id leg stays 'unmatched' for the LEFT JOIN but is handled cleanly by NOT EXISTS", "LEFT JOIN is faster, so they disagree on performance, not results", "NOT EXISTS cannot reference the outer table"],
      answer: 1,
      why: "On this clean core both return the same 6 statements. They diverge on NULL-able join keys: LEFT JOIN + IS NULL buckets NULL-key legs as unmatched, while NOT EXISTS asks existence directly. House default: NOT EXISTS.",
      notes: [
        { choice: 0, why: "Identical HERE — and verified here is not identical everywhere. Staging is where the shapes split." },
        { choice: 2, why: "The question is semantics, not speed. Agreement is about what each shape counts, not how fast." },
      ],
      difficulty: "medium",
    },
    {
      id: "chickfila-mcq-21",
      prompt: "The month walk computes revenue - LAG(revenue) OVER (ORDER BY month). The first row's delta is NULL. What ships?",
      choices: ["IFNULL the delta to 0 — a flat first month", "The NULL is the baseline: report it as 'first month, no prior', never coalesce it to zero", "Drop the first row from the query", "Replace LAG with LEAD"],
      answer: 1,
      why: "The first row has no prior month — the NULL IS the correct answer. Coalescing it to zero reads as a flat month and invents a comparison that never happened; every downstream average-of-deltas inherits the fiction.",
      notes: [
        { choice: 0, why: "A zero delta claims no change from a month that does not exist. The baseline is a population fact, not a missing value to patch." },
        { choice: 2, why: "Dropping the row hides the baseline from the reader — the walk should start visible and labeled, not truncated." },
      ],
      difficulty: "hard",
    },
    {
      id: "chickfila-mcq-22",
      prompt: "The market ladder ranks members within each region; the system ladder ranks all 16. What changes in the window — and what must NOT change?",
      choices: ["Everything — a partitioned query re-folds the base", "Only the PARTITION BY is added; the GROUP BY o.customer_id fold and the COUNT(*) grain stay fixed", "PARTITION BY replaces GROUP BY", "The ORDER BY direction flips"],
      answer: 1,
      why: "RANK() OVER (PARTITION BY region ORDER BY COUNT(*) DESC) restarts ranks per market while the underlying fold — 103 transactions to 16 members — is untouched. The classic bug: joining order_items for a menu read and silently ranking lines.",
      notes: [
        { choice: 0, why: "The window rides on top of the fold; partitioning changes which peers ranks compare, not what the rows are." },
        { choice: 2, why: "Partitioned windows sit ON a grouped query — they complement GROUP BY, never replace it. Dropping the fold changes the metric." },
      ],
      difficulty: "hard",
    },
    {
      id: "chickfila-mcq-23",
      prompt: "In the coverage census, COALESCE(SUM(p.amount_cents), 0) guards the zero-leg statements. What does the sweep print for #28's remitted cell without that guard?",
      choices: ["0.00 — SUM returns zero for no rows", "NULL — SUM over zero matched rows is NULL, so the cell prints blank and the billed-minus-remitted math dies", "1,756.00 — billed flows through", "The query errors"],
      answer: 1,
      why: "SUM of an empty set is NULL, not zero — the remitted cell prints blank and every gap computation built on it inherits the NULL. COALESCE folds the no-leg case to 0 so the sweep stays numeric down the column.",
      notes: [
        { choice: 0, why: "That is COUNT's behavior, not SUM's. Confusing them is exactly how blank remitted cells reach the close packet." },
        { choice: 2, why: "Nothing flows through an aggregate over no rows — billed is a different column with its own fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "chickfila-mcq-24",
      prompt: "A teammate rewrites the ticket-band CASE with WHEN unit_price >= 55 THEN 'entrées' BEFORE WHEN unit_price < 55 THEN 'sides & drinks'. What happens to a 54.99 line?",
      choices: ["It stays in sides — CASE arms commute", "It lands in entrées — CASE evaluates top-down and the reordered pair re-bands everything at or above 55… and the 54.99 stays put only by luck of the bounds; flip the bounds too and it re-bands", "It errors — arms must be ascending", "It falls out of both arms"],
      answer: 1,
      why: "CASE is ordered evaluation — the first true arm wins. With overlapping bounds the order is semantic: swap the arms and the band boundary silently moves, and the 268/230 line split stops footing to 251 with no error anywhere.",
      notes: [
        { choice: 0, why: "Arms commute only when predicates are disjoint. Overlapping bounds make arm order a definition — this is the silent re-band." },
        { choice: 3, why: "The ELSE guarantees every line lands somewhere; the failure is the WRONG somewhere, not a dropped row." },
      ],
      difficulty: "hard",
    },
    {
      id: "chickfila-mcq-25",
      prompt: "Members tier into quartiles by visit count via NTILE(4). The ladder ties four members at 4 visits. What does NTILE do with the tie?",
      choices: ["All four land in the same tile — NTILE respects value ties", "NTILE counts rows, not values — tied members can land in different tiles, which is why the tier definition names its tie policy", "NTILE errors on ties", "NTILE skips tiles until the tie ends"],
      answer: 1,
      why: "NTILE is a row counter: it splits rows into buckets by position regardless of value ties. Two peers tied at 4 visits splitting across a tier boundary is expected behavior — defensible, but a policy the published tier must name.",
      notes: [
        { choice: 0, why: "That is PERCENT_RANK's world — value-based, ties share. NTILE is positional by design." },
        { choice: 3, why: "Nothing skips — NTILE fills every bucket by row count. Tie handling is the analyst's stated policy, not the function's." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-26",
      prompt: "The census reads 103 transactions, 251 lines, 498 units, 16 members. Which fold produces the 498?",
      choices: ["COUNT(*) over order_items", "SUM(quantity) over order_items — units pulled, max 3 on a line", "COUNT(DISTINCT product_id)", "SUM(total)"],
      answer: 1,
      why: "Units pulled is SUM(quantity) at line grain — 498 across 251 lines. Lines (COUNT(*)), units (SUM(quantity)) and members (COUNT(DISTINCT customer_id)) are three grains of the same object, and the density KPI needs units and dollars at their own grains.",
      notes: [
        { choice: 0, why: "251 is the line count. Lines and units differ because quantity exceeds 1 on multi-pull lines — max 3." },
        { choice: 2, why: "DISTINCT product_id counts SKUs touched (at most 16), not units pulled. The kitchen reads the SUM." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-27",
      prompt: "Ops asks for a drive-thru versus in-store split of the 103 transactions. What can this db honestly deliver?",
      choices: ["Split by status — delivered is in-store", "Nothing at that grain — there is no channel column, so the split would assert a fact the schema does not carry; offer ticket-size bands as the stand-in", "Split by region", "Derive the channel from the timestamp"],
      answer: 1,
      why: "No channel column exists — any split would be an assertion dressed as data, the fastest way to invent demand. The honest move: name the dead end and offer what the schema supports, like ticket-size bands (25.47 floor to 1,088.44 catering haul).",
      notes: [
        { choice: 0, why: "Status is a fate, not a channel. Mapping fates to channels invents a semantic the schema does not carry." },
        { choice: 3, why: "created_at is date-only — there is no hour resolution to derive anything from. Two dead ends do not make a column." },
      ],
      difficulty: "hard",
    },
    {
      id: "chickfila-mcq-28",
      prompt: "The close packet claims the ledger reads 181,080 against 181,080. What is 'delta zero' at query level, and what does a non-zero delta forbid?",
      choices: ["SUM(debits) - SUM(credits) = 0 — a non-zero delta forbids shipping the close until the offending entries are found", "COUNT(debits) = COUNT(credits)", "The ledger has 181,080 rows on each side", "MAX equals MIN on both sides"],
      answer: 0,
      why: "Delta zero is the folded identity — total debits equal total credits to the cent. Close culture here is binary: the close ships at delta zero or becomes tomorrow's incident, and the offending entries ship WITH the delta.",
      notes: [
        { choice: 1, why: "Row counts can tie while dollars do not. A trial balance asserts a money fold, not a row fold." },
        { choice: 2, why: "181,080 is dollars, not rows. Reading totals as counts is the cents-blind misread this kit exists to kill." },
      ],
      difficulty: "hard",
    },
    {
      id: "chickfila-mcq-29",
      prompt: "The super-fan crown goes to the member with the most visits. Which query safely names the winner on a ladder known to tie further down?",
      choices: ["ORDER BY COUNT(*) DESC LIMIT 1", "A guarded max — WHERE COUNT(*) = (SELECT MAX over the fold) — which returns ALL rows tied at the top, then a named tie-breaker if one must win", "ROW_NUMBER() = 1", "MAX(customer_id)"],
      answer: 1,
      why: "LIMIT 1 splits ties arbitrarily; the guarded-max shape returns every row tied at the crown and forces the tie-breaker to be a named policy. The crown is unique at 24 on this db — but the same ladder ties four ways at 4, and the habit must survive contact with ties.",
      notes: [
        { choice: 2, why: "ROW_NUMBER picks a winner before any policy is named — the arbitrary split the council forbids, dressed as SQL." },
        { choice: 3, why: "MAX over an id answers 'highest id', not 'most visits' — a different question wearing the same output shape." },
      ],
      difficulty: "easy",
    },
    {
      id: "chickfila-mcq-30",
      prompt: "The weekday census orders by the dow TEXT bucket: '0' through '6' sorts fine. The demand team re-buckets by ISO WEEK ('%W', values 01–53). What breaks?",
      choices: ["Nothing — text sorts the same as numbers", "Two-digit TEXT buckets still sort fine, but the trap is '%W' is a week-of-year whose text order mixes years — the bucket needs the year beside it and a numeric cast to stay honest", "STRFTIME has no '%W'", "Week buckets must always be numeric"],
      answer: 1,
      why: "Single-character codes 0-6 sort correctly as text; the week fold spans two years, so '%W' alone merges week 1 of 2024 with week 1 of 2025 — '%Y-%W' is the honest spine, and two-digit buckets are where text-order luck runs out.",
      notes: [
        { choice: 0, why: "'01'–'53' sorts fine as text — the failure is not ordering, it is the missing year in the bucket key. Two different traps, and this one is silent." },
        { choice: 3, why: "'%W' exists. The requirement is not numeric casting — it is a bucket key that carries the year." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-chickfila-1",
      tier: "easy",
      topic: "t3",
      universe: "growth",
      title: "The Sunday zero-check",
      brief:
        "Marketing memo, Chick-fil-A-flavored on the storefront db: the system closes every Sunday, so the Monday demand review opens with the weekday census — transactions placed per day-of-week, revenue to the penny, and the Sunday row policed before anything else is read. The db holds 103 transactions worth 34,833.28. The probed fold, code 0 through 6: Sunday 16 transactions / 5,775.27, Monday 20 / 6,944.03, Tuesday 16 / 6,449.71, Wednesday 16 / 4,585.38, Thursday 9 / 2,540.53, Friday 18 / 6,649.57, Saturday 8 / 1,888.79 — foots to the book exactly. In production the code-0 row hard-zeros; on this training db it reads 16, and the analyst's job is to name the artifact, not scrub it. The census reads Sunday-first.",
      ask: "Return day-of-week code, transaction count, revenue to 2 decimals and the Sunday-flagged count, Sunday first.",
      template:
        "SELECT STRFTIME({1}, o.created_at) AS dow,\n       COUNT(*) AS transactions,\n       ROUND(SUM(o.total), {2}) AS revenue,\n       SUM(CASE WHEN STRFTIME('%w', o.created_at) = {3} THEN 1 ELSE 0 END) AS sunday_rows\nFROM orders o\nGROUP BY {4}\nORDER BY dow {5};",
      slots: [
        {
          answer: "'%w'",
          kind: "keyword",
          label: "the weekday format code",
          why: "'%w' numbers the week 0–6, Sunday through Saturday — the closed day is code 0 by construction. '%d' collapses the census into 31 day-of-month buckets and '%Y' into two year rows; both run without error and lie by shape.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          why: "The review quotes 5,775.27 and 6,944.03 — 2-decimal money. ROUND(…, 1) prints 5,775.3 and the census stops reconciling with every other money cell in the deck; the fold must match the finance read to the cent.",
        },
        {
          answer: "'0'",
          kind: "keyword",
          label: "the closed-day code",
          why: "Sunday is weekday code 0 under '%w', so the flag arm fires only on the closed day — 16 on the Sunday row, 0 on every other row. The code must be the QUOTED '0': STRFTIME returns text, and the unquoted 0 is an integer, so `= 0` never matches a single row (the type-class trap — the check silently dead-rows). '1' re-flags Monday and the zero-check polices the wrong day.",
        },
        {
          answer: "dow",
          kind: "keyword",
          label: "the calendar fold key",
          why: "The census is one row per weekday, so the fold key is the dow alias — seven rows, 0 through 6. GROUP BY o.status re-folds by line fate (four rows, no calendar) and GROUP BY o.created_at scatters to one row per day.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the Sunday-first direction",
          why: "The zero-check reads top-down from the closed day: code 0 on top through 6. DESC opens the review on Saturday — a correct query aimed at the wrong end of the board, and the Sunday row never gets read.",
        },
      ],
      distractors: ["'%d'", "'%Y'", "o.status", "o.created_at", "DESC"],
      walkthrough:
        "One scan, one format code, one flag arm. STRFTIME('%w', created_at) buckets all 103 transactions into seven weekday rows — Sunday 16 / 5,775.27, Monday 20 / 6,944.03, Tuesday 16 / 6,449.71, Wednesday 16 / 4,585.38, Thursday 9 / 2,540.53, Friday 18 / 6,649.57, Saturday 8 / 1,888.79 — foots to 34,833.28 exactly, and the sunday_rows arm reads 16 on the Sunday row and 0 on every other row: the flag column IS the zero-check, and on production data that Sunday cell must read 0. The distractors each break differently: '%d' dissolves the census into 31 day-of-month buckets and '%Y' into two year rows — both run clean and lie by shape; o.status re-folds by fate (four rows, no calendar); o.created_at scatters to one row per day; DESC opens the review on Saturday and the Sunday row never gets read. The read the review actually takes: Monday (20 / 6,944.03) and Friday (18 / 6,649.57) carry the week — the two days the six-day schedule leans on — and Thursday's 9 / 2,540.53 is the midweek soft spot the mobile-order push targets. Name the 16 on Sunday, then read the six days that count.",
    },
    {
      id: "cs-chickfila-2",
      tier: "hard",
      topic: "t8",
      universe: "catalog",
      title: "The menu density ladder",
      brief:
        "Menu-board memo, Chick-fil-A-flavored on the storefront db: the operator council reviews the density ladder — units pulled and line revenue per menu family, per-unit revenue, and the cumulative revenue share as the ladder walks — because the chain's discipline is fewest SKUs, highest revenue per unit. The probed fold, biggest revenue first: Audio 97 units / 11,744.01 (121.07 per unit, 33.7% of the book alone), Wearables 53 / 6,929.12 (130.74 — the density crown), Video 61 / 5,198.41 (85.22, cumulative 68.5), Electronics 85 / 4,818.61 (56.69), Accessories 121 / 3,294.29 (27.23 — the traffic family), Apparel 54 / 1,984.93 (36.76), Fitness 27 / 863.91 (32.00, closing the walk at 100). The fold is quantity × unit_price, not catalog price — on this book the two disagree on all 251 lines.",
      ask: "Return each menu family with units, revenue to 2 decimals, per-unit revenue to 2 decimals and cumulative revenue share to 1 decimal, biggest revenue first.",
      template:
        "WITH density AS (\n  SELECT p.category AS family,\n         SUM({1}) AS units,\n         SUM({2}) AS line_revenue\n  FROM order_items oi\n  JOIN products p ON {3}\n  GROUP BY p.category\n)\nSELECT family,\n       units,\n       ROUND(line_revenue, {4}) AS revenue,\n       ROUND(line_revenue / units, 2) AS per_unit,\n       ROUND(100.0 * SUM(line_revenue) OVER (ORDER BY line_revenue {5}) / SUM(line_revenue) OVER (), {6}) AS cum_share\nFROM density\nORDER BY revenue DESC;",
      slots: [
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the unit pull",
          why: "Units pulled is SUM(oi.quantity) — 97 for the Audio family, 121 for Accessories. SUM(1) counts menu lines instead of units (251 lines versus 498 units) and SUM(p.price) folds shelf dollars onto a pull column: different questions wearing one column name.",
        },
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the line-revenue fold",
          why: "Line revenue is quantity times the line's own unit_price — 11,744.01 for Audio. Folding p.price instead reads the shelf tag, and on this book the shelf tag disagrees with the line on all 251 rows: the fold must read the line, not the menu board.",
        },
        {
          answer: "p.id = oi.product_id",
          kind: "keyword",
          label: "the menu stitch",
          why: "Menu lines reference the board by product_id, so the stitch is p.id = oi.product_id. Stitch on p.id = p.id and every line pairs with every SKU — each family inherits every other family's pull with no error; stitch on a text column and the join finds nothing.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the revenue precision",
          why: "The council quotes 11,744.01 and 6,929.12 — 2-decimal money. ROUND(…, 0) prints integers and the ladder stops reconciling with the cents-safe settlement spine; the display standard is 2 decimals on every money column.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first walk",
          why: "The ladder walks from the biggest family down and the cumulative share follows the walk: DESC puts Audio's 33.7% on top and closes at Fitness's 100. ASC runs the share backwards — the cumulative column opens at 100 and shrinks while the rows claim to grow, and every share cell contradicts the ladder beneath it.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "Cumulative share prints to 1 decimal — 33.7, 53.6, 68.5, 82.4, 91.8, 97.5, 100. ROUND(…, 0) flattens the head of the ladder into 34, 54, 69 and the concentration story loses its gradients.",
        },
      ],
      distractors: ["0", "oi.unit_price", "p.name", "p.category", "ASC"],
      walkthrough:
        "A ladder is a stitch, a fold, a ratio and a walk. The CTE stitches menu lines to the board on p.id = oi.product_id and folds two grains per family: SUM(oi.quantity) pulls units (Audio 97, Accessories 121 — the traffic family carries the most units and the least revenue per unit) and SUM(oi.quantity * oi.unit_price) folds line revenue (Audio 11,744.01 on 97 units). The ratio does the strategy read: 121.07 per unit for Audio, 130.74 for Wearables — the density crown on less than half Audio's revenue — against 27.23 for Accessories, and the window walk carries the concentration story: Audio alone is 33.7% of the book, the top three families reach 68.5% cumulative, and Fitness closes the walk at 100. The distractors each break differently: 0 in either precision slot flattens money to integers and shares to whole points; oi.unit_price in the unit fold sums prices where a count belongs; p.name and p.category in the stitch join text that never equals an id — the CTE empties or the join fans out with no error; ASC reverses the walk so the cumulative column opens at 100 and contradicts every row beneath it. Fold the line, not the shelf; walk the share from the head — *that is the ladder the menu board hangs from*.",
    },
    {
      id: "cs-chickfila-3",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate board",
      brief:
        "Ops memo, Chick-fil-A-flavored on the storefront db: the drive-thru board re-runs the fate census in ONE scan — all four fates beside the ticket average, because four sequential queries are four ways to drift and no identity forcing them to reconcile. The probed board: 103 transactions, served-and-closed 52, handed-off 30, placed-ahead 14, drove-off 7, average ticket 338.19 (25.47 sides-only floor to a 1,088.44 catering haul). The branches must sum to COUNT(*) — 52 + 30 + 14 + 7 = 103 by construction — and a branch built with a sloppy predicate is exactly what the identity catches.",
      ask: "Return transaction count, all four fate counts in one pass, and the average ticket to 2 decimals — one row, branches footing to 103.",
      template:
        "SELECT COUNT(*) AS transactions,\n       COUNT(*) FILTER (WHERE status = {1}) AS served_and_closed,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS handed_off,\n       COUNT(*) FILTER (WHERE status = 'pending') AS placed_ahead,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS drove_off,\n       ROUND({2}(total), {3}) AS avg_ticket\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the served fate",
          why: "Served-and-closed is status 'delivered' — 52 of 103, and the branch the board reads first. 'shipped' in the arm prints 30 under a served label and the board misreads completion by 22 transactions.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the ticket average",
          why: "Average ticket is AVG(total) — 338.19. SUM prints the 34,833.28 book under an avg_ticket label and MAX prints the 1,088.44 catering haul: right column, wrong measure.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the ticket precision",
          why: "Money ships to 2 decimals — 338.19, and the board reconciles with every other money cell. ROUND(…, 0) prints 338 and the cents spine stops footing.",
        },
      ],
      distractors: ["'shipped'", "SUM", "MAX", "0"],
      walkthrough:
        "One scan, four branches, one identity. FILTER (WHERE …) counts each fate in the same pass: served-and-closed 52, handed-off 30, placed-ahead 14, drove-off 7 — and the assertion the board ships with is that the branches sum to COUNT(*): 52 + 30 + 14 + 7 = 103. A drifted status list breaks that foot immediately, which is why the one-pass shape is the census the ops review trusts: four sequential queries have four chances to disagree and no identity forcing them not to. The ticket average rides the same scan — 338.19, between the 25.47 sides-only floor and the 1,088.44 catering haul, the spread that IS the ticket-band story. The distractors each break differently: 'shipped' in the served arm prints 30 under a 52 label and completion inflates or collapses depending on which column the reader trusts; SUM as the ticket average prints the whole 34,833.28 book per ticket; MAX prints the single 1,088.44 haul; 0 as the precision flattens 338.19 to 338 and the cents spine loses its footing. Merging placed-ahead into drove-off is the read to refuse — a queue is not lost demand, and the board exists to keep the two apart.",
    },
    {
      id: "cs-chickfila-4",
      tier: "medium",
      topic: "s4",
      universe: "funnel",
      title: "The stamped-but-open arm",
      brief:
        "Ops memo, Chick-fil-A-flavored on the storefront db: the Monday demand review wants the arm of the funnel that has a handoff stamp but no close-out yet — transactions in flight between the window and the till. The set algebra: the stamped population (shipped_at IS NOT NULL) EXCEPT the served population (status = 'delivered'). The probed read: 30 transactions — exactly the handed-off fate, 30 of 103 — and the fold doubles as the sanity check that no delivered transaction carries a stamp it should not have. Set semantics are the point: EXCEPT dedups both arms, and the count must reconcile with the fate census (52 + 30 + 14 + 7 = 103) or one of the arms misread its population.",
      ask: "Return the transaction ids that carry a handoff stamp but are not served-and-closed, ordered ascending — and reconcile the count to the fate census.",
      template:
        "SELECT {1} AS txn_id\nFROM orders\nWHERE {2}\nEXCEPT\nSELECT id AS txn_id\nFROM orders\nWHERE status = {3}\nORDER BY txn_id {4};",
      slots: [
        {
          answer: "id",
          kind: "keyword",
          label: "the transaction key",
          why: "The set compares transaction ids — one column, one grain. SELECT status in the first arm returns fates where ids belong and the EXCEPT compares text to integers: runs clean, lies by shape.",
        },
        {
          answer: "shipped_at IS NOT NULL",
          kind: "keyword",
          label: "the stamped arm",
          why: "The stamped population is shipped_at IS NOT NULL — 30 transactions. Flip to IS NULL and the arm becomes the unstamped 21 (placed-ahead plus drove-off), a different question wearing the same shape.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the served arm",
          why: "Served-and-closed is status 'delivered' — the 52-transaction arm. 'shipped' makes both arms the same 30 stamped transactions and the EXCEPT returns nothing: a correct-looking zero hiding an identical-set bug.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the ascending id walk",
          why: "The ids walk ascending so the arm reconciles against the fate census top-down. DESC reads the same rows backwards — same set, wrong print for the Monday review.",
        },
      ],
      distractors: ["status", "shipped_at IS NULL", "'shipped'", "DESC"],
      walkthrough:
        "Set algebra at transaction grain. The first arm selects every transaction carrying a handoff stamp — 30 rows; the second selects every served-and-closed transaction — 52 rows; EXCEPT keeps the first set minus the second: 30 ids, the in-flight arm between window and till. The reconciliation is the point: 30 is exactly the handed-off fate, and 52 + 30 + 14 + 7 = 103 says the arms read clean populations — if the EXCEPT count disagreed with the fate census, one of the WHERE arms misread its population and the board ships wrong. The distractors each break differently: status in the id slot compares fate labels against integers and the EXCEPT returns a nonsense residue while running without error; shipped_at IS NULL flips the first arm to the unstamped 21 — the placed-ahead-plus-drove-off complement, a different question; 'shipped' in the served arm makes both arms the same 30 stamped transactions and the EXCEPT returns ZERO rows — the identical-set bug that looks like a clean board; DESC prints the arm backwards and the Monday reconciliation reads bottom-up. This is also the honest way to say what the funnel holds: 30 stamped-not-served is the chain's in-flight inventory, and it is never a cleanup job — it is where the close-out queue lives.",
    },
    {
      id: "cs-chickfila-5",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month walk",
      brief:
        "Growth memo, Chick-fil-A-flavored on the storefront db: the demand call opens with the month-over-month revenue walk — prior month beside current, delta rounded, trough named — over the 14-month spine (2024-01 to 2025-02) at DATE grain, because created_at carries no hour and the walk says so. The probed head of the walk: launch 3,731.97 (no prior — the baseline), February 3,609.64 (delta −122.33), March 2,617.08 (−992.56), April 2,468.91 (−148.17). The first row's delta is NULL by definition — the baseline, never a zero — and July's 1,193.86 trough is the month the council asks about first.",
      ask: "Return each month with revenue to 2 decimals and the month-over-month delta to 2 decimals, calendar order — the first delta reported as the baseline it is.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME('%Y-%m', created_at) AS month,\n         ROUND(SUM(total), {4}) AS revenue\n  FROM orders\n  GROUP BY {1}\n)\nSELECT month,\n       revenue,\n       ROUND(revenue - {2}(revenue) OVER (ORDER BY month {3}), 2) AS delta\nFROM spine\nORDER BY month;",
      slots: [
        {
          answer: "month",
          kind: "keyword",
          label: "the spine grain",
          why: "GROUP BY month folds 103 transactions into the 14-month spine — '%Y-%m' keeps the two Februaries apart. GROUP BY status re-folds into 4 fate rows and the calendar is gone; GROUP BY DESC is a syntax error.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month lookback",
          why: "LAG(revenue) reads the previous spine row — the delta is current minus prior, and the first row is NULL by definition. LEAD reads forward and the delta sign flips; MAX reads the best month and every delta is fiction.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the lookback direction",
          why: "LAG walks the spine ascending — the prior month is the row BEFORE, so the delta is current minus prior and the first row is the NULL baseline. DESC reverses the spine and LAG reads FORWARD: every delta flips sign and the walk narrates a different year.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the money precision",
          why: "Revenue and delta ship to 2 decimals — 3,731.97 against −122.33. ROUND(…, 0) flattens the spine and the deltas stop reconciling with the money deck.",
        },
      ],
      distractors: ["LEAD", "MAX", "DESC"],
      walkthrough:
        "A walk is a spine, a lookback and an honest baseline. The CTE folds 103 transactions into 14 monthly buckets — '%Y-%m' so January 2024 and February 2025 never touch — and LAG(revenue) OVER (ORDER BY month) reads each month's predecessor, so delta is current minus prior: 2024-01 opens at 3,731.97 with a NULL delta (the baseline — no prior exists, and printing a zero there would claim a flat month that never happened), February 3,609.64 (−122.33), March 2,617.08 (−992.56 — the post-launch slide the call explains), April 2,468.91 (−148.17). The read the council takes: the spine drifts down from launch until July's 1,193.86 trough — the month with 2 of the book's 7 drove-off transactions — then recovers into September's 3,116.04. The distractors each break differently: LEAD reads forward and every delta flips sign, turning the launch slide into a climb; GROUP BY status discards the calendar for a fate census; MAX as the lookback subtracts the best month from every row — 14 fictional crashes; DESC in the lookback direction reverses the spine so LAG reads forward and the deltas narrate a different year; 0 as the precision flattens 3,731.97 to 3732 and the walk stops footing with the money deck. Say the unit and the grain — days on a DATE-grain db, months on the spine — and the walk survives the council.",
    },
    {
      id: "cs-chickfila-6",
      tier: "hard",
      topic: "q6",
      universe: "refund-audit",
      title: "The claim-versus-ledger census",
      brief:
        "Refund-audit brief, Chick-fil-A-flavored on the storefront db: the close's anomaly walk hunts the two mirror-image lies on the statement book — a status that claims money moved with no settlement rows, and settlement rows that moved money on a statement marked void. The probed census returns exactly two rows: #11, status 'void', 1 leg, billed 925.00 (void-but-settled), and #28, status 'paid', ZERO legs, billed 1,756.00 (paid-claim lie). The census folds legs per statement in a CTE first — COALESCE-guarded, statement grain — then gates the two anomalies by construction, because the status column is a claim and the legs are the ledger. Statements bill in INTEGER cents; the dollar read is amount_cents / 100.0 exactly once.",
      ask: "Return every statement where the claim and the ledger disagree — a 'paid' claim with zero legs, or a 'void' claim carrying legs — with id, claimed status, leg count and billed dollars to 2 decimals, by id.",
      template:
        "WITH per_statement AS (\n  SELECT i.id,\n         i.status,\n         COUNT(p.id) AS legs,\n         ROUND(i.amount_cents / {3}, 2) AS billed\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT id, status, legs, billed\nFROM per_statement\nWHERE (status = {1} AND legs = {2}) OR (status = 'void' AND legs > 0)\nORDER BY id;",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the claimed fate",
          why: "The paid-claim lie is status 'paid' with zero legs — #28 at 1,756.00. Test 'open' instead and the gate flags the five honest open statements, flooding the anomaly list with the dunning register it already tracks.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the zero-leg gate",
          why: "The claim-versus-ledger disagreement for a paid claim is legs = 0 — the cell #28 prints. Gate at 1 and the gate reads 'paid with one leg', which is 20 honest settlements: the anomaly list drowns in truth.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements bill in INTEGER cents; /100.0 prints 925.00 and 1,756.00. Bare 100 keeps integer arithmetic and eats cents; 10 prints a tenfold book the ledger catch-file rejects.",
        },
      ],
      distractors: ["'open'", "1", "10", "'void'"],
      walkthrough:
        "An anomaly census is a fold, then a gate. The CTE stitches every statement to its remittance legs and folds at statement grain: COUNT(p.id) for legs, the /100.0 dollar read for billed — 28 rows, zero-leg statements surviving the LEFT JOIN with legs = 0. The outer gate then flags exactly the two ways a claim can disagree with its ledger: 'paid' with legs = 0 (the paid-claim lie — #28 at 1,756.00, a status asserting money moved where no leg exists) and 'void' with legs > 0 (void-but-settled — #11 at 925.00, one leg for exactly its billed cents). Two rows, ordered by id: 11, then 28 — the mirror-image pair the close walks line by line, and the reason the payments table is the ledger of record while the status column is a claim. The distractors each break differently: 'open' in the claim slot flags the five honest never-collected statements — the dunning register, already tracked, not anomalies; 1 in the legs gate reads 'paid with one leg' and drowns the census in twenty legitimate settlements; 10 as the cents divider prints a tenfold book; 'void' in the claim slot collapses the census to its own second arm — one row, and the paid-claim lie walks free. The cross-check the close requires: these two rows plus the 21 exact and the 1 partial must foot to 28 statements, and the anomaly cells — 925.00 and 1,756.00 — must tie to the legs they claim or the census misread its own grain.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-i", why: "The drive-thru promise is the brand: share of transactions handed off inside the promised window versus late. This problem drills the conditional rate over a delivery window — the same fold the mobile-order SLA board runs." },
    { slug: "immediate-food-delivery-iii", why: "Promise-kept share by month is how the six-day week gets defended — a monthly ratio with the denominator named. This problem is that walk at practice scale." },
    { slug: "product-sales-analysis-iii", why: "First-sale year per SKU — when each menu item first pulled a ticket — anchors every limited-time-offer adoption read. First-year argmax over line rows, this problem's shape." },
    { slug: "sales-analysis-iii", why: "Only-inside-the-window SKUs — items whose sales fall entirely inside an offer period — is the LTO sunset read. Period-bounded filtering over line rows, menu-board flavor." },
    { slug: "the-most-recent-orders-for-each-product", why: "Menu recency per SKU — when did each item last ride a ticket — is how aging offers get caught before they go stale. Argmax over window per product, this problem's shape." },
    { slug: "winning-candidate", why: "The super-fan crown goes to the member with the most visits — with a coverage guard so a thin field cannot crown nobody. The 24-visit member is this query at db scale." },
    { slug: "count-student-number-in-departments", why: "Members per market with the zero arm kept: a market whose count reads zero must appear, not vanish. The LEFT JOIN zero-fill drill behind the two-grain census." },
    { slug: "users-that-actively-request-confirmation-messages", why: "Confirmation pulses inside the handoff window are the mobile-order heartbeat — a dated-window filter over event pairs, exactly this shape." },
    { slug: "card-launch-success", why: "Share of tickets carrying the launch item, by market — the attach read that decides whether a rollout spread or stalled. A ratio with the fold at ticket grain." },
    { slug: "spend-histogram", why: "Ticket-size buckets from the 25.47 sides-only floor to the 1,088.44 catering haul — the histogram the pricing pod reads before touching bundle math." },
    { slug: "rolling-average-steps", why: "A six-day week needs a rolling demand line that survives day-of-week noise — a RANGE-frame moving average, this problem's exact frame." },
    { slug: "customers-who-bought-all-products", why: "Full-menu explorers — members whose tickets touch every menu family — are the density strategy's proof case. Relational division over the 16-SKU board, this problem's shape." },
    { slug: "usage-tier-percentiles", why: "Chick-fil-A One tiers are percentile cuts over visit behavior — PERCENT_RANK bands that must not re-band when ties land. This problem drills the tier fold." },
    { slug: "roas-by-campaign", why: "Ads opex (14 lines, 4,570.00 on this db) has to defend itself against attributed revenue — the ROAS fold the marketing review opens with." },
    { slug: "cohort-repeat-revenue", why: "Loyalty economics is a cohort walk: first-visit month beside repeat revenue since. This problem is that walk at practice scale — the retention story in one query." },
    { slug: "products-with-three-or-more-orders-in-two-consecutive-years", why: "Menu durability: which SKUs pulled in both 2024 and 2025 at threshold volume — the continuity read behind every keep-or-cut call on a 16-SKU board." },
    { slug: "calculate-orders-within-each-interval", why: "Orders banded into time intervals is the handoff-window fold — placed-ahead versus served per window is exactly how the drive-thru board ages its queue." },
    { slug: "consecutive-available-seats", why: "Consecutive capacity reads is the window-load question — which runs of slots can absorb the placed-ahead queue before the promise breaks." },
    { slug: "deferred-revenue", why: "Placed-ahead tickets are revenue collected for service not yet rendered — the deferred fold, and this problem drills the recognition boundary the settlement sweep polices." },
    { slug: "friday-purchases-i", why: "Purchases bucketed by named weekday on a six-day operating week — the weekday census at practice scale, closed-day row and all." },
    { slug: "find-bursty-behavior", why: "Burst detection over event streams is the drive-thru rush read — which members (or days) spike against their own baseline, the volatility behind the 20-transaction Monday." },
    { slug: "dormant-reactivation", why: "Members with no recent visits are the whitespace the mobile-order push targets — the dormant read field teams run before a single market visit." },
    { slug: "find-customers-with-positive-revenue-this-year", why: "Members whose year revenue clears a line — the loyalty economics gate behind the 63.5%-of-book concentration story." },
    { slug: "fifo-inventory-cogs", why: "Units pulled against stock in pull order is the kitchen's ledger — FIFO cost folds are how limited-menu chains defend per-unit revenue against input drift." },
    { slug: "customer-purchasing-behavior-analysis", why: "Behavior segmentation over purchase patterns is the Chick-fil-A One tier engine — band members by frequency and basket the same CASE-classified way." },
    { slug: "dau-wau-stickiness", why: "Sticky-frequency ratios (dailies over weeklies) is the loyalty engagement read — visits per member per window, the intensity signal behind the 24-visit regular." },
    { slug: "find-loyal-customers", why: "Customers above a visit threshold in a window — the super-fan shortlist. This problem drills the conditional-count gate the loyalty ladder is built from." },
    { slug: "find-churn-risk-customers", why: "Members whose visit cadence is slipping are the churn watchlist — gap detection over visit sequences, the same discipline the frequency ladder's tail reads." },
    { slug: "game-play-analysis-ii", why: "First-visit-then-return reads over activity logs — the new-member conversion fold, drilled on login events but shaped exactly like transaction streams." },
    { slug: "expected-credit-loss", why: "Exposure-weighted loss provisioning is the settlement sweep's risk read — 15,217.00 of never-collected statements weighted by their likelihood to pay." },
    { slug: "delinquency-roll-rates", why: "How receivables roll between aging buckets period over period — the chase list as a motion picture, not a snapshot, on the statements book." },
    { slug: "chargeback-rate-ranking", why: "Disputes ranked by rate against volume — the drove-off and refund tail formalized, ranked the way the ops review ranks every loss line." },
  ],
};
