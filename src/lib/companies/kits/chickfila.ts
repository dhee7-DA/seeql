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
// f*-band slugs) and say so in brief P4.
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
    "Preparation strategy: the pools file carries no Chick-fil-A section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: handoff clocks, weekday censuses, two-grain market reads, density ladders, CASE bands and the cents-safe settlement spine. Do the topics in order, then run both case files on the live db: one rebuilds the {orange:Sunday zero-check} the Monday demand review opens with, the other rebuilds the {sky:menu density ladder} the operator council sets the board from. The bar to clear: *state the population and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
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
      slugs: ["average-time-of-process-per-machine", "find-total-time-spent-by-each-employee", "find-golden-hour-customers"],
    },
    {
      name: "The Sunday zero-check",
      why: "The system closes every Sunday, so the weekday census is a correctness instrument: STRFTIME('%w', created_at) buckets the week 0–6 and the 0 row must hard-zero in production. This training db reads 16 Sunday transactions — the artifact gets named, not scrubbed — and the census exists so the zero is trusted the day it lands. Format-code discipline ('%w' is not '%d' is not '%Y') is the trap being graded.",
      slugs: ["tasks-count-in-the-weekend", "report-contiguous-dates", "the-latest-login-in-2020"],
    },
    {
      name: "Two-grain market censuses",
      why: "Transactions and members are different grains of the same join, and every census here reports both: EU runs 45 transactions from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded; the ratio is the intensity signal that decides whether growth is broadening or concentrating.",
      slugs: ["students-and-examinations", "unique-orders-and-customers-per-month", "article-views-ii"],
    },
    {
      name: "Menu density ladders",
      why: "The chain's whole strategy is revenue per unit, so the ladder is a ratio fold: line revenue beside units pulled, per family and per SKU. Average-selling-price is the exact shape — revenue divided by units with the fold grain named — and rank windows turn the ladder into a board. The trap is folding catalog price instead of line price: on this db the two disagree on every one of the 251 lines.",
      slugs: ["average-selling-price", "queries-quality-and-percentage", "rank-scores"],
    },
    {
      name: "CASE-banded menu tiers",
      why: "Menu lines band into sides-and-drinks versus entrées-and-combos with one CASE fold — 268 lines under 55 (31.01 average) against 230 at 115.85 — and loyalty tier cuts read the same way. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the band story, and a reordered WHEN quietly re-bands the base. Members tier into Chick-fil-A One bands by the same shape.",
      slugs: ["the-category-of-each-member-in-the-store", "type-of-triangle", "calculate-special-bonus"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month transaction spine (2024-01 to 2025-02) is the demand call's home turf: prior month beside current, delta rounded, trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Cancelled transactions concentrate in July and November, 2 each of 7, and the walk is how that pattern gets defended to the council.",
      slugs: ["hopper-company-queries-i", "consecutive-transactions-with-increasing-amounts", "find-consistently-improving-employees"],
    },
    {
      name: "Loyalty frequency ladders",
      why: "Chick-fil-A One is a frequency business: the visit ladder runs 24, 17, 14, 13, 5 and then a four-way tie at 4, and tier logic lives in repeat behavior. Gaps-and-islands reads — consecutive visits, strictly increasing baskets — separate the regulars from the one-timers. The tie handling is a policy question about peer members, not syntax.",
      slugs: ["game-play-analysis-i", "customer-order-frequency", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "Set-stack fate boards",
      why: "Board packets stack populations — served beside handed-off beside placed-ahead — and UNION ALL is the honest stack while UNION dedups whole rows silently. EXCEPT answers 'which placed transactions never got a handoff stamp', and the billing anti-join (6 never-collected statements) is the same algebra pointed at money. The stack must reconcile to 103 or the board is wrong.",
      slugs: ["monthly-transactions-ii", "league-statistics", "count-apples-and-oranges"],
    },
    {
      name: "One-pass censuses",
      why: "The ops board gets all four fates in ONE scan — FILTER (WHERE …) branches per aggregate and SUM(CASE …) is the portable twin; four sequential queries are four ways to drift. Attach reads ride the same shape: how many tickets carry the launch item, how many touch two families but skip the drink. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["find-stores-with-inventory-imbalance", "count-the-number-of-experiments", "number-of-rich-customers"],
    },
    {
      name: "Cents-safe settlement rails",
      why: "Statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — exactly once, or the board reads a hundredfold off. Coverage classifies at statement grain: legs equal billed → exact (21), zero → no payment (6), else partial (1). The rails matter too: card legs (16, 37,364.00) and wire legs (11, 32,248.00), with five statements settling on both.",
      slugs: ["bank-account-summary", "trial-balance-check", "products-worth-over-invoices"],
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
  ],
};
