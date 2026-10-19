// NatWest — Wave-10 (Task 100-natwest), banking domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// UK commercial banking + app-first retail + the mortgage-rate-reset cycle. Angle kept DISTINCT from
// lloyds (mass-market mortgages + branch economics) and barclays (the UK sibling but IB-heavy): THIS kit
// reads the storefront db as the commercial franchise — business corridors, relationship depth,
// large-exposure screens, and the reset calendar a fixed-rate book rolls through.
// Storefront db mapping (banking-house convention per lloyds/standardchartered/mufg, stated honestly):
//   customers = retail & business customers (region = corridor buckets carried as the db's EU/APAC/US/LATAM codes),
//   orders = booked client flows (delivered = settled 52, shipped = in flight with shipped_at as the
//     value-date stamp 30, pending = awaiting confirmation 14, cancelled = busted 7),
//   order_items = instrument legs, products = the product shelf (mortgages / deposits / business-lending
//     families; max shelf price 199.99 — the premium band is empty and the kit says so),
//   suppliers = correspondent partners, invoices = fee statements (finance tables INTEGER pence — the
//     dollar read is always amount_cents / 100.0; orders.total and order_items.unit_price are REAL dollars),
//   payments = settlement legs on two rails (card 16 legs / 37,364.00, wire 11 / 32,248.00),
//   expenses = branch/network opex, ledger_entries = the book of record.
// Pool provenance: company-pools.md carries NO NatWest section (0 tagged rows) — all 10 topic slug sets and
// all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f* rows); declared in the header
// and brief P4. 46 distinct slugs, zero topic/problem overlap, grep-verified against the pools file.
// Case figures: scripts/company-facts.md + probe-derived cells, verified cell-for-cell against a readonly
// COPY (scripts/.tmp-100-natwest.db) by the temp probe (deleted after use); slots audited by
// scripts/case-audit.ts. NOTE for the wave-10 registry wiring agent: natwest is NOT yet in registry
// COMPANY_META (wave-10 unwired) — wire id "natwest", domainId "banking", name "NatWest", tagline below,
// accent "text-purple-300" (grep-verified unused by all 20 banking siblings + the landed wave-10 banking kits).

import type { CompanyKit } from "../types";

export const natwestKit: CompanyKit = {
  id: "natwest",
  domainId: "banking",
  name: "NatWest",
  tagline: "UK commercial banking: business books, app-first retail, the rate-reset cycle",
  accent: "text-purple-300",

  brief: [
    "**NatWest** is the UK's biggest lender to business — the commercial bank behind the UK's owner-managers, the app-first retail franchise built on mobile banking, and the mortgage book now rolling through the {amber:rate-reset cycle} as fixed deals written in the low-rate years reprice onto today's book. This kit maps the storefront db onto that commercial read: 16 customers are retail & business clients across four corridor buckets, 103 booked client flows worth **34,833.28** (average ticket 338.19, spread 25.47 to 1,088.44), and 251 instrument legs behind them. The status map is fixed and every read hangs off it: delivered = {emerald:settled} (52, 50.5%), shipped = in flight with `shipped_at` as the value-date stamp (30), pending = awaiting confirmation (14), cancelled = {rose:busted} (7, 6.8%). A flow booked is not a flow settled — the busted share differs by corridor, and the denominator question is the interview.",
    "The money sits one layer down, in INTEGER pence — the dollar read is always `amount_cents / 100.0`. Invoices are the 28 fee statements the franchise bills on (21 paid exact for 66,443.00, 6 open at 19,609.00, 1 void at 925.00); payments clear them on two rails — {violet:card}, the instant domestic rail (16 legs / 37,364.00), and {orange:wire}, the cross-border correspondent rail (11 / 32,248.00). Expenses are the branch-and-network cost lines (Rent at 14 flat 1,200.00 lease lines), and ledger_entries is the book of record: **181,080.00 debits against 181,080.00 credits, delta 0** across 80 entries. The house rule is the review-era rule: *a status column claims, a rail leg proves* — settlement evidence beats labels, which is exactly the culture a bank relearning digital adoption needs.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain corridor census** — EU runs 45 flows from just 8 clients (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a busted flow count in your base?'*), then into the {sky:large-exposure screen}: 42 of the 103 flows sit above the **338.19** average ticket and carry 24,309.68 of the book. The value-date clock is the favourite timestamp probe: **82 of 103** flows carry the stamp, averaging **2.98 days** in a 2–4 day spread, and the 21 unstamped rows are *a population definition, not a cleanup job*. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries **no NatWest section** — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: status-aware settlement counts, two-grain corridor censuses, big-ticket scalar screens, relationship-depth folds, CASE-banded reset tiers and the cents-safe billing layer. Do the topics in order, then run the six case studies on the live storefront db in spaced passes rather than one sitting: the opening pair rebuilds the {rose:large-exposure watchlist} credit triage and the {emerald:relationship-depth census} the commercial team opens reviews with, and the later four add the coverage ladder's tie policy, the corridor stage grid, the no-evidence dunning queue and the reset-calendar month walk. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 and every money fold tie back to the GL by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the proof, not the dashboard. A commercial-banking analyst opens the morning pack: the ledger tie-out must read **181,080.00 against 181,080.00, delta 0** across the 80 GL entries, then the one-pass status census — 52 settled + 30 in flight + 14 awaiting + 7 busted = **103 by construction**; a branch that fails that identity is *the day's first incident*, not a rounding note. The rail census follows — {violet:card} 16 legs / 37,364.00, wire 11 / 32,248.00 — cross-footed against the cash book, and if the 2.98-day value-date clock drifts off its 2–4 band, the confirmation queue gets pulled before the corridor desks' morning call.",
    "**11:30 —** Midday is the deep-dive block. Credit wants the {rose:large-exposure screen} re-cut: 42 flagged flows worth **24,309.68**, EU carrying 18 of them, and the single-flag LATAM corridor held off the committee page by the double-digit floor. The concentration cut goes to the relationship team — **63.5%** of the book sits with clients whose lifetime spend crosses 3,000 (71.2% above 2,000) — and the depth ladder gets its tie policy re-stated: four clients tied at 4 flows under the **24/17/14/13/5** run of the heavy relationships. Each ask is a join, a conditional aggregate and one judgment call about statuses — *the analyst writes the query twice: once to answer, once with the definition spelled out so the number survives the credit-committee argument*.",
    "**15:30 —** The afternoon tilts to the close. The no-evidence watchlist refreshes before a single dunning letter goes out: **6 fee statements worth 15,217.00** with zero rail legs — including statement #28, status {rose:paid} at 1,756.00 with nothing behind it, the claim-without-evidence row the review era taught everyone to hunt. The coverage census ships beside it — **21 exact (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 none** — with its denominator on the slide, because *a coverage number without its population is a rumor*. The day ends the way every close does: the ledger proof, the watchlist, the definitions — or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Client-flow book", what: "Value and count of booked client flows: 103 worth 34,833.28, average ticket 338.19 against a 25.47 to 1,088.44 spread. The headline every commercial read starts from — and the spread IS the tiering story." },
    { name: "Settlement status mix", what: "Delivered = settled (52, 50.5%), shipped = in flight (30, 29.1%), pending = awaiting confirmation (14, 13.6%), cancelled = busted (7, 6.8%). Four branches that must reconcile to 103 by construction." },
    { name: "Value-date clock", what: "created_at to shipped_at over the 82 stamped flows: 2.98-day average, range 2 to 4. The population ships with the number — the 21 unstamped rows have no value date yet and must not dilute it." },
    { name: "Busted-share map", what: "Busted flows ÷ ALL booked in the corridor: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0%. The denominator is bookings — the first thing any interviewer checks." },
    { name: "Corridor book census", what: "Flows, clients and value per corridor: EU 45 from 8 clients / 15,089.23 at 335.32 aov, APAC 37 from 5 / 11,605.45, US 19 from 2 / 7,286.16, LATAM 2 from 1 / 852.44. Load and coverage at two grains." },
    { name: "Fee-statement book", what: "28 cycles billed on flat 30-day terms: 21 paid exact for 66,443.00, 6 open at 19,609.00, 1 void at 925.00. Coverage reads 21 exact / 1 partial (4,000.00 of 6,148.00) / 6 none (15,217.00); paid cycles settle in 28.4 days on average (fastest 13, slowest 84)." },
    { name: "Rail mix", what: "Settlement legs per rail — card (instant domestic) 16 legs / 37,364.00, wire (correspondent cross-border) 11 / 32,248.00. 27 legs covering 22 distinct cycles: five cycles ride two legs each." },
    { name: "Ledger proof delta", what: "Total debits minus total credits across the 80-entry GL: 181,080.00 against 181,080.00, delta 0. Cash runs 69,612.00 in / 25,416.00 out; a nonzero delta pages the close, not a footnote." },
  ],

  topics: [
    {
      name: "Status-aware settlement counts",
      why: "Every NatWest commercial screen opens with the funnel: flows booked, value-dated (shipped_at stamped), settled to final. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight flow 'settled' — 30 versus 52 on this book, and the whole kept-value story moves.",
      slugs: ["immediate-food-delivery-i", "monthly-transactions-i", "percentage-of-users-attended-a-contest", "settlement-fails-aging"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Flows and clients are different grains of the same join, and every corridor census here reports both: EU runs 45 flows from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "confirmation-rate", "queries-quality-and-percentage", "average-selling-price", "active-businesses", "number-of-rich-customers", "find-the-team-size"],
    },
    {
      name: "Joining clients to the book",
      why: "Corridor, vintage and segment ride on the customer row, and every flow inherits them through joins that can be missing or stale. NatWest's follow-up is always about what survives: does a flow whose client row went missing still count in the corridor fold — and is that silence a query bug or a data incident?",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier", "journal-gap-detection", "customers-who-never-order", "sellers-with-no-sales", "fix-names-in-a-table", "movie-rating"],
    },
    {
      name: "Concentration & exposure ladders",
      why: "The commercial story is a concentration story: 63.5% of the book sits with 3,000-plus clients (71.2% above 2,000), and the correspondent bench carries the shelf six partners wide. GROUP BY folds with HAVING gates and per-partner totals are the exact drills — the ladder is where credit asks 'what happens if this one walks?'",
      slugs: ["product-sales-analysis-ii", "top-earners", "classes-more-than-5-students", "portfolio-weights"],
    },
    {
      name: "Scalar thresholds & big-ticket screens",
      why: "The large-exposure screen compares every flow against the book-wide average ticket — 338.19 on this db — with a scalar subquery doing the folding. Screens escalate into nested logic because credit triage is nested logic: which flows sit above the line, which clients clear a flow floor, what happens when the inner fold comes back empty.",
      slugs: ["managers-with-at-least-5-direct-reports", "game-play-analysis-iv", "second-highest-salary", "risk-based-pricing", "suspicious-bank-account-transactions", "structuring-detection"],
    },
    {
      name: "Relationship-depth folds",
      why: "Commercial banking is relationship banking: the depth ladder runs 24, 17, 14, 13, 5 flows at the top, then a four-way tie at 4, and the single-flow cohort is where attrition is born. Two-stage queries — fold per client, then judge the fold — are the kit's derived-table drills, and the empty-case answer is part of the question.",
      slugs: ["market-analysis-i", "investments-in-2016", "employees-whose-manager-left-the-company", "account-balance"],
    },
    {
      name: "Ranking the relationship ladder",
      why: "Ladders are rank-window reporting where ties are guaranteed — four clients sit at 4 flows on this book, right under the 24/17/14/13/5 run. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer relationships, not syntax.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-three-orders", "chargeback-rate-ranking", "customer-placing-the-largest-number-of-orders", "biggest-window-between-events"],
    },
    {
      name: "CASE banding & reset tiers",
      why: "The reset cycle bands everything — ticket tiers, reset windows, premier-versus-standard treatment — and each band is a CASE arm with fixed, published edges. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the reset forecast, and a reordered WHEN quietly re-bands the book.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "triangle-judgement", "delinquency-buckets", "credit-utilization-bands", "count-salary-categories", "monthly-transactions-ii"],
    },
    {
      name: "Reset calendars & month spines",
      why: "The 14-month flow spine (2024-01 to 2025-02) is where the reset calendar lives: month buckets via SUBSTR or STRFTIME, half-open windows that never drop month-end bookings, and julianday clocks rounded once. Value-date latency, not terms, is where the interesting date math sits here.",
      slugs: ["the-latest-login-in-2020", "list-the-products-ordered-in-a-period", "rising-temperature", "vintage-default-curves", "prepayment-detection", "daily-balance-interest", "point-in-time-asof", "product-price-at-a-given-date"],
    },
    {
      name: "Cents discipline & the GL",
      why: "Banking is a cents game: fee statements, rail legs and opex carry INTEGER pence, so every dollar read is amount_cents / 100.0 and the missing .0 is how a 1,200.00 lease line prints as 12. The GL proof — 181,080.00 against 181,080.00, delta 0 — is the close's final gate, and reconciliation reads are the closest thing this kit has to a finance round.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "npv-queries", "ar-aging-schedule", "balance-rollforward", "gl-reconciliation"],
    },
  ],

  theory: [
    {
      id: "natwest-t1",
      q: "You report fee statements with their settlement legs — LEFT JOIN or INNER JOIN, and what breaks if you then filter a payments column in WHERE?",
      a: "Decide from the survival rule the question implies. A settled-value report joins fee statements to their rail legs: a leg with no statement is corruption, so INNER is honest — and worth a data-quality flag, not a silent inner join. The no-evidence watchlist must be LEFT from invoices: the statements with no rail leg ARE the answer, arriving with NULL leg columns — on this db that is 6 statements worth 15,217.00, one of which claims paid status with zero legs. The classic break: filtering p.method = 'card' in WHERE after the LEFT JOIN kills every NULL-payload statement row — the LEFT quietly became an INNER and the uncollected exposure vanished from the very report that exists to show it. The fix is moving the predicate into ON, or accepting inner semantics deliberately and saying so. 'LEFT JOIN is safer' is the wrong answer; join type is a decision about who survives, and at a commercial bank the unmatched side is where the review-era exposure lives.",
      tag: "joins",
    },
    {
      id: "natwest-t2",
      q: "The relationship ladder ranks clients by flow count, and four clients tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. On this book the ladder above the tie runs 24, 17, 14, 13, 5 flows, then four clients tied at 4: RANK gives them the same rung and skips — the tie consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — 6, 6, 6, 6, then 7. ROW_NUMBER splits the tie arbitrarily, a silent judgment about which relationship manager's book looks bigger. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer clients (RANK or DENSE_RANK), or an explicitly named tie-breaker such as lifetime spend, then client id, written into the query comment. Coverage reviews assign relationship managers by ladder position: the semantics ARE the treatment.",
      tag: "windows",
    },
    {
      id: "natwest-t3",
      q: "The corridor census shows EU 45 flows from 8 clients and the US 19 from 2. Why do the columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts flow rows after the join — one row per booked flow, so a client with 24 flows contributes 24. COUNT(DISTINCT customer_id) folds repeats back to clients — EU's 45 collapse to 8 names. Neither is wrong: flows measure load on the rails and the operations floor, clients measure the installed base, and the ratio between them is the intensity signal the commercial bank actually manages — 5.6 flows per EU client versus 9.5 in the US, which says the US book is thin and concentrated while EU's is broad. The trap that catches candidates is a third grain: join order_items for the instrument legs and COUNT(*) silently counts legs, not flows — 251 of them. Saying 'one row per what?' for every COUNT in the query is the habit the panel grades; on a 16-client book the two grains diverge fast.",
      tag: "aggregation",
    },
    {
      id: "natwest-t4",
      q: "shipped_at is NULL until a flow takes its value date. What is your policy for the value-date clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only value-dated flows have a latency, so the report measures booking-to-value-date for the 82 of 103 flows that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL flows returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 busted rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day settlements for confirmations that have not happened. A report whose WHERE clause is doing definitional work without saying so is exactly what a NatWest reviewer hunts for, because the 21 unstamped rows are a population definition, not a cleanup job.",
      tag: "nulls",
    },
    {
      id: "natwest-t5",
      q: "The corridor review wants settled value per corridor for corridors carrying at least ten flows. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, pending and busted rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-flow floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a corridor line and an error, and between a threshold applied to flows versus to dollars. The strong answer places every filter by asking: is this a fact about one flow, or about a corridor? On this book the floor matters — LATAM carries 2 flows and drops off the committee page the moment a materiality gate lands.",
      tag: "pipeline",
    },
    {
      id: "natwest-t6",
      q: "The large-exposure screen uses WHERE total > (SELECT AVG(total) FROM orders). What is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the watchlist silently returns nothing while looking valid. On the full table that is theoretical: 103 flows always produce a mean (338.19 on this book, and 42 flows sit above it carrying 24,309.68). On filtered staging tables — one corridor, one status, one month — the empty-inner-query bug ships regularly, and the exposure screen is exactly how it hides. The correlated cousin (compare each flow to ITS corridor's average) re-runs per outer row and answers a different question at a different cost — a 752.96 LATAM flow is large on the platform mean and may be the corridor's whole story on a corridor mean. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up credit is fishing for.",
      tag: "subqueries",
    },
    {
      id: "natwest-t7",
      q: "The reset calendar buckets flows by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the reset trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when a fixed-rate tranche rolls. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is reset discipline: the spine, the window and the edge row are where tranching reports go wrong, and a mis-bucketed month quietly moves a whole reset cohort's quarter.",
      tag: "dates",
    },
    {
      id: "natwest-t8",
      q: "Finance says a fee statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER pence, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats pence on every odd-pence row. Reconciliation culture here: the coverage split must read 21 exact (65,612.00) / 1 partial (4,000.00 of 6,148.00) / 6 none, and the ledger trial balance must land at 181,080.00 debits against 181,080.00 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "natwest-t9",
      q: "A two-flow moving window and a rank column both run OVER (ORDER BY …). Why does one need ROWS spelled out and the other RANGE — and what silently changes if you pick the wrong frame?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes peers: rows tied on the ORDER BY key enter the cumulative together. On a flow-grain walk — SUM(total) OVER (ORDER BY created_at) — two flows booked in the same second jump the running total by two flows at once, which the committee pack cannot explain. Writing ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW forces a strict row-by-row walk; a bounded frame (ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) is a moving window that clips at the partition edge, printing just the first row's total where the preceding bound falls off. Rank functions do not take frames — their tie behavior is fixed by the function choice. The discipline: say the frame out loud whenever the output is a walk, and know whether the metric wants peers in (RANGE) or not (ROWS).",
      tag: "windows",
    },
    {
      id: "natwest-t10",
      q: "The corridor pack stacks booked corridors beside busted corridors in one layout, and another page needs 'booked but never busted'. When do you reach for UNION, UNION ALL, INTERSECT and EXCEPT — and which one silently deletes rows?",
      a: "All four require branches with the same column shape. UNION merges branches and DEDUPS whole rows — the silent row-deleter: two byte-identical rows (same client, same counts, no branch label) collapse into one and the board loses a client with no error anywhere. UNION ALL keeps everything and is the default for stacks where a comment states why duplicates are impossible. INTERSECT keeps rows present in both branches — corridors that both booked and busted. EXCEPT is the subtraction: left-set rows absent from the right set — 'booked in the year but never busted', which is a membership question no JOIN or HAVING answers as cleanly. The NatWest discipline: pick the operator by the set semantics the page claims, then defend the dedup decision in a comment, because the reviewer's first question is what the operator may have deleted.",
      tag: "sets",
    },
    {
      id: "natwest-t11",
      q: "A month-spine report folds flows per month, and a month where the corridor booked nothing simply does not appear. How do you make the spine complete — and why does the answer change the denominator story?",
      a: "GROUP BY only materializes buckets that exist in the data: a month with zero rows never forms a group, so the row vanishes and the chart silently misaligns with the true 14-month spine. The fix is a driver: build the month spine (a VALUES list, a calendar table, or recursive CTE dates) and LEFT JOIN the facts onto it — unmatched months arrive with NULL payloads that COALESCE to zero, and the missing month reappears reading 0.0 honestly. The denominator point: 'average monthly bookings' over the observed months versus over the full spine are different numbers, and the missing-bucket version overstates the run rate. Zero-fill is not cosmetic — it is the difference between 'no flows' and 'no row', and a close pack that cannot tell those apart is the one that pages the wrong incident.",
      tag: "groupby",
    },
    {
      id: "natwest-t12",
      q: "Compare every flow to the platform mean, to its corridor's mean, and to its client's mean — three 'above average' questions. Which query shape belongs to each, and how do they differ in cost and failure modes?",
      a: "The platform mean is a scalar subquery folding once — WHERE total > (SELECT AVG(total) FROM orders) — cheap, and it fails empty only if the table is empty (NULL, empty result, silently). The corridor mean is a GROUP BY fold judged at group grain, or at flow grain a window twin: AVG(total) OVER (PARTITION BY region) — one pass, no re-execution. The client mean is either correlated — (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id), re-run per outer row, O(n) inner scans — or the same window with PARTITION BY customer_id, which is how the review prefers it on this 103-row book and would matter at scale. The semantics differ too: 752.96 is large on the platform mean, maybe unremarkable for a client averaging that per flow. State which population defines 'average' before choosing the shape — that sentence IS the interview answer.",
      tag: "subqueries",
    },
    {
      id: "natwest-t13",
      q: "You must list every pair of a client's flows booked on the same value date, without double-counting. Walk me through the self-join shape and why the naive equality is wrong.",
      a: "The naive ON a.customer_id = b.customer_id pairs every flow with every flow of that client — both directions plus the self-pair diagonal — so a client with three flows yields nine rows and every pair appears twice. The pair-once discipline adds a strict inequality on a stable key: ON a.customer_id = b.customer_id AND a.id < b.id, keeping exactly one orientation of each pair and dropping the diagonal (a row cannot be less than itself). The same grammar pairs the five double-settled cycles (two rail legs per statement) without double-counting the exposure. Then say what survives: a client with one flow produces no pairs — correct, not a bug. Self-joins look innocent and inflate quietly; the inequality is the correctness argument, and the reviewer wants to hear you say 'pair once, on a stable key, with the empty-case behavior named'.",
      tag: "joins",
    },
    {
      id: "natwest-t14",
      q: "The dormant-client screen must list clients with no booked flows this quarter. NOT IN, NOT EXISTS or LEFT JOIN … IS NULL — and what does each do when the inner list carries a NULL?",
      a: "All three can express the anti-join; they differ in failure modes. NOT IN (SELECT customer_id …) materializes the list and compares every outer row against it — one NULL in the list makes every comparison UNKNOWN and the whole screen silently empties. NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND quarter-predicate) is NULL-safe by construction — it asks a per-row existence question, stops at the first match, and needs no list. LEFT JOIN … IS NULL is the kit's canonical shape (the never-collected watchlist is built exactly so) and is equally safe, with the upside that you can carry columns from the probe side. On the clean core db all three agree — the dormant anti-join returns a confident zero because all 16 clients appear. The rule the review era wrote: never NOT IN over an unguarded column; prefer NOT EXISTS or the LEFT JOIN shape and say why.",
      tag: "subqueries",
    },
    {
      id: "natwest-t15",
      q: "The value-date clock averages julianday(shipped_at) - julianday(created_at) over 82 of 103 flows. Walk me through every decision in that expression — the function, the population, and what each wrong variant prints.",
      a: "Four decisions. The function: julianday() converts TEXT ISO timestamps to fractional day numbers so the delta is a real number of days — DATE() returns a string that coerces to a year integer in arithmetic and the clock explodes. The population: only the 82 stamped flows carry a latency, so WHERE shipped_at IS NOT NULL is definitional — the 14 pending plus 7 busted rows have no cycle yet, and AVG ignoring NULLs means dropping the WHERE still prints 2.98 over an unnamed population. The range: 2.98 with a 2-to-4 spread is quoted with its range because a clock without spread hides the tails. The edge: julianday(NULL) is NULL, so unstamped rows drop out of the arithmetic automatically — but COUNT(shipped_at) versus COUNT(*) is how the report proves 82 of 103 rather than asserting it. Every figure ships with its population or it is a rumor.",
      tag: "dates",
    },
    {
      id: "natwest-t16",
      q: "Client names arrive from three source systems — one exports 'acme ltd', one 'ACME LTD', one 'Acme Ltd '. Why is string hygiene a join-integrity problem and not a cosmetics problem at a commercial bank?",
      a: "Because the join key IS the name wherever no surrogate id survives an export: 'acme ltd' and 'Acme Ltd ' hash differently, so one business relationship silently splits into two clients — the corridor census reads 9 EU clients instead of 8, concentration percentages shift, and every threshold screen double-counts the exposure. The hygiene pass is mechanical and ordered: TRIM the whitespace, normalize case (UPPER or a title-case function), collapse internal double spaces, and canonicalize legal suffixes (Ltd/LLC) — fix-names-in-a-table is the drill shape. Then the discipline: standardize ONCE in a staging layer, not ad hoc in every report, and prefer joining on a stable id where one exists — name hygiene is the fallback, not the architecture. A bank relearning digital adoption lives on reconciling exports; the analyst who says 'the trailing space moved a client' is the one the panel remembers.",
      tag: "strings",
    },
    {
      id: "natwest-t17",
      q: "The review wants the 16-client relationship book cut into quartiles by flow count. NTILE, or band on the value — and what happens to the four-way tie at 4?",
      a: "NTILE(4) divides ROWS: 16 clients over 4 tiles is four tidy tiles of 4 by count — but NTILE has no tie semantics, so the four clients tied at 4 flows can straddle two tiles depending on row order, splitting one depth tier across quartiles by arithmetic accident. If the business tier is the VALUE (a 'top quarter by depth' tier where peers move together), band on the value instead: CASE WHEN flows >= 10 THEN 'tier 1' …, or a DENSE_RANK cut that gives tied clients the same rung. If tiles must exist AND reproduce, NTILE with a fully deterministic OVER (ORDER BY flows DESC, book DESC, c.id) pins the split and documents it. The honest answer names the trade: NTILE guarantees bucket sizes, value banding guarantees peer coherence — pick which guarantee the committee page needs and write the choice into the query comment.",
      tag: "windows",
    },
    {
      id: "natwest-t18",
      q: "The morning census reads settled, in-flight, awaiting and busted in one scan and must reconcile to 103. Show me the one-pass shapes and the identity that proves them.",
      a: "Two spellings, one scan. FILTER: COUNT(*) FILTER (WHERE status = 'delivered') AS settled, … once per branch — the readable SQL-standard form. The portable twin: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — the ELSE 0 arm is mandatory or a branch with no matching rows prints NULL instead of 0, and NULL reads as 'unknown' on a committee page. The identity is the proof: 52 + 30 + 14 + 7 = 103 by construction, because every row lands in exactly one branch — a total that fails 103 means a row fell between arms (a status typo, a NULL status) and pages the close as an incident. The trap the panel adds: COUNT(status = 'pending') is not a conditional count — the comparison yields 0 or 1 for every row and COUNT counts them all, reading 103. Say the identity out loud; it is the correctness argument, not a lucky checksum.",
      tag: "aggregation",
    },
    {
      id: "natwest-t19",
      q: "The depth ladder's top read is 'the heaviest relationship' — but the ladder has a four-way tie at 4 flows. How do you write an argmax that survives ties, and what does the tie policy decide?",
      a: "The fold first: per-client flow counts from a GROUP BY customer_id. The naive argmax — ORDER BY flows DESC LIMIT 1 — returns ONE arbitrary row from the tie block, so the 'heaviest at 4' is whichever row the engine felt like; a rerun can name a different client. The honest shapes: fetch all tied rows (WHERE flows = (SELECT MAX(flows) FROM fold) — the argmax set, all four clients), or pick a policy tie-breaker (lifetime book DESC, then client id) and write it into the query comment so the pick is reproducible rather than lucky. Above the tie the ladder is strict — 24, 17, 14, 13, 5, one client each — so the tie policy only governs the 4-block and below. The principle generalizes: an argmax with ties is a set, not a row; whoever turns it into a row owes the committee a stated rule.",
      tag: "windows",
    },
    {
      id: "natwest-t20",
      q: "A month-bucket filter runs WHERE SUBSTR(created_at, 1, 7) = '2024-07' and the EXPLAIN plan shows a full scan despite an index on created_at. Explain sargability and the rewrite that serves the index.",
      a: "An index is a sorted structure on the COLUMN's values; it can only serve a predicate the planner can express as a range over those raw values. Wrap the column in a function — SUBSTR, STRFTIME, CAST — and the predicate becomes a computation per row: the index is blind and every row is read. That is 'non-sargable'. The rewrite compares the raw column to constants: created_at >= '2024-07-01' AND created_at < '2024-08-01' — the index range-scans straight to July's rows, and the half-open form is incidentally the shape that never drops month-end bookings, which BETWEEN gets wrong. On 103 rows the cost is invisible, which is exactly why the habit must be built here: the same pattern on a 100-million-row ledger is the difference between a morning pack and an outage. EXPLAIN QUERY PLAN is how you prove the rewrite, and reading it is part of the close ritual.",
      tag: "indexes",
    },
    {
      id: "natwest-t21",
      q: "The committee pack must regenerate byte-identically every morning. What makes an ORDER BY reproducible — and what are the sanctioned tie-breaks?",
      a: "ORDER BY is only deterministic if the key set is a total order — unique over the rows. Sort on flows DESC and tied rows can print in any order, any run: the four clients at 4 flows would shuffle between mornings, and a reviewer diffing yesterday's pack against today's sees phantom churn. The discipline: every sort ends in a stable unique tie-break, ideally the surrogate key — flows DESC, book DESC, c.id — and the OVER(ORDER BY …) of every window column obeys the same rule, because windows are order-sensitive too. Never RANDOM(), never 'whatever the engine does'; names and timestamps can collide, ids cannot. And LIMIT without ORDER BY is not a top-N, it is a row cap over an undefined order — the top-five-exposures list does not exist until the sort does. Reproducibility is a correctness requirement at a bank, not a style preference.",
      tag: "pipeline",
    },
    {
      id: "natwest-t22",
      q: "Where does COALESCE belong in a money report — and where does it become a lie? Give the sanctioned and forbidden uses on this book.",
      a: "Sanctioned: COALESCE at the display fold, where NULL means 'nothing to add' — folding payment legs per statement, COALESCE(SUM(p.amount_cents), 0) turns the no-legs statements' NULL into the honest 0 the coverage census prints; and COALESCE on outer-join payloads where 'no match' and 'zero' mean the same thing. Forbidden: COALESCE on the value-date clock — IFNULL(latency, 0) invents same-day settlements for the 14 confirmations that have not happened, drags the 2.98 average down, and launders a population definition into a data 'fix'. The same ban covers the LAG baseline: coalescing the first spine row's NULL to 0 fabricates a 100% opening jump. The rule: COALESCE is for NULLs that mean zero, never for NULLs that mean not-yet. Saying which NULLs are which — before writing the function — is the answer the panel listens for.",
      tag: "nulls",
    },
    {
      id: "natwest-t23",
      q: "Walk me through the month-close ritual on this book — the four proofs that must land before the pack ships.",
      a: "Four proofs, in order. The ledger tie: debits against credits across the 80 GL entries must read 181,080.00 against 181,080.00, delta 0 — a nonzero delta pages the close. The status identity: one pass reads 52 settled + 30 in-flight + 14 awaiting + 7 busted = 103 by construction; any branch arithmetic that fails the identity means a row fell between arms. The money layer: the coverage census must read 21 exact (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 none (15,217.00) — statuses are claims, rail legs are the ledger of record, and the two anomaly rows (void-but-settled #11, paid-status #28 with zero legs) get walked line by line. The clock: the 2.98-day value-date average over its stated 82-row population, with the range quoted. Each proof is one query, each figure carries its population, and the pack ships only when all four land — that ritual is the interview's working-clock question.",
      tag: "quality",
    },
    {
      id: "natwest-t24",
      q: "Every rate on this book — busted share, kept share, stamped share — is a denominator argument waiting to happen. What is your discipline for stating them, and where do the wrong denominators hide?",
      a: "Say the denominator before the query, in the title and in the slide. The busted-share map is busted flows ÷ ALL bookings in the corridor — APAC 8.1% on 37 booked, EU 6.7% on 45 — because 'share of outcomes' includes the 14 pending and 7 busted; divide by settled only and the map flatters every corridor. The kept share is settled ÷ booked per corridor — EU 24 of 45, 53.3% — never settled ÷ settled. The stamped share is 82 of 103 booked — the 14 pending stay in, because 'not yet stamped' is what the metric watches. The hides: AVG over a NULL-shrunken population (a filtered denominator wearing a total's name), integer division truncating the ratio before the 100.0 multiplier lands, and grand-total denominators silently replacing per-group ones. The bar: any rate quoted without its denominator is a rumor, and the interviewer's first follow-up is always 'out of what?'",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "natwest-mcq-1",
      prompt: "A booked flow's status reads 'shipped'. In this kit's NatWest stage map, what happened?",
      choices: ["Settled — the flow completed and counts as kept", "In flight — value-dated, not yet settled", "Busted — cancelled before confirmation", "Awaiting confirmation — no value date yet"],
      answer: 1,
      why: "The stage map is fixed: shipped = in flight (30 of 103 flows, 29.1%) with shipped_at as the value-date stamp. Only 'delivered' (52) is settled to final.",
      notes: [
        { choice: 0, why: "Settled is 'delivered' — 52 flows. Calling the 30 in-flight rows settled inflates the kept-value story before a single flow completes." },
        { choice: 3, why: "Awaiting-confirmation is 'pending' — 14 flows with no shipped_at yet. Pending is not busted and not settled; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-2",
      prompt: "The value-date clock averages 2.98 days. Over which population is that average computed?",
      choices: ["The 82 flows with shipped_at stamped, of 103 booked", "All 103 booked flows, pending included", "The 52 settled flows only", "Distinct clients (82/16)"],
      answer: 0,
      why: "The clock measures booking to value date, and only the 82 stamped flows have one. The 21 unstamped rows (14 pending + 7 busted) have no cycle yet and must not dilute the average.",
      notes: [
        { choice: 1, why: "AVG ignores NULLs, so averaging over all 103 returns the same 2.98 — but over a silently shrunken, unnamed population. The definition ships with the number." },
        { choice: 2, why: "52/52 mixes two funnel steps — settled is term completion, shipped_at is the value date. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-3",
      prompt: "EU carries 45 flows from 8 clients. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts flow rows (45); COUNT(DISTINCT customer_id) folds repeats back to clients (8). The gap between them — 5.6 flows per client — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every flow has a client. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts corridors, not clients — a third grain nobody asked for. The census is flows AND names." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to busted flows only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the busted share truncates toward 0 and every corridor reads flat. The 100.0 multiplier forces real division first; on this book it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the busted map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-5",
      prompt: "Keep only corridors carrying at least 10 booked flows. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY corridor HAVING COUNT(*) >= 10", "WHERE flows >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A flow-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this book the floor holds EU (45), APAC (37) and US (19) — and LATAM's 2 flows drop off the committee page.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'flows' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-6",
      prompt: "The relationship ladder runs 24, 17, 14, 13, 5 flows, then FOUR clients tied at 4. Under RANK, what rank do the two 3-flow clients carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-flow clients share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The review's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic ladder bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending flows double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 flows.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-8",
      prompt: "A staging-table exposure list uses client_id NOT IN (SELECT customer_id FROM flows WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the watchlist empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every flow carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty exposure lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "natwest-mcq-9",
      prompt: "A board stack puts settled flows under busted flows in one layout, built with UNION. A reviewer says one client's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same client, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same client, same counts, no corridor or branch label — collapse into one, and the board loses a client with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "natwest-mcq-10",
      prompt: "A corridor desk walks booked exposure flow by flow: SUM(total) OVER (ORDER BY booked_at). Two flows share a booked_at second, and the running total 'jumps two flows at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on booked_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at flow grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "natwest-mcq-11",
      prompt: "The corridor census joins orders to order_items to read instrument legs, and the flow count reads 251 instead of 45. What happened?",
      choices: ["The join duplicated corridor rows", "The join fanned out — one row per instrument leg, so COUNT(*) counts legs, not flows", "order_items contains corrupt data", "GROUP BY dropped the corridor filter"],
      answer: 1,
      why: "orders holds 103 flows; order_items holds 251 legs against them. Joining the legs table and counting rows changes the grain — every leg of every flow contributes a row, so the census folds legs while wearing the flow column's name. Fix the grain with COUNT(DISTINCT o.id), or count legs deliberately and rename the column.",
      notes: [
        { choice: 0, why: "The customers join is one-to-one on id and duplicates nothing — the fan-out enters exactly when the line-item table joins, which is why the count grew to the legs figure." },
        { choice: 2, why: "Nothing is corrupt — 251 legs over 103 flows is the book's real shape (2.4 legs per flow). The bug is the metric, not the data." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-12",
      prompt: "A desk asks for the five heaviest booked flows: SELECT id, total FROM orders WHERE region-filter LIMIT 5. The reviewer reruns it and gets five different flows. Why?",
      choices: ["The table changed between runs", "LIMIT without ORDER BY returns an arbitrary five — row order is unspecified, so 'top 5' is undefined without a sort", "LIMIT caps columns, not rows", "The filter is non-deterministic"],
      answer: 1,
      why: "LIMIT is a row cap, not a ranking — with no ORDER BY the engine may return any five qualifying rows, and the set can differ run to run. A 'top five exposures' list is only defined once you say ORDER BY total DESC first; a tie-break column (id) makes it reproducible.",
      notes: [
        { choice: 2, why: "LIMIT caps ROWS. 'SELECT * LIMIT 5' returns five rows with every column — the direction of the mistake matters because the fix is an ORDER BY, not a column list." },
        { choice: 3, why: "The WHERE predicate is fully deterministic. The nondeterminism lives entirely in which qualifying rows the cap happens to keep." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-13",
      prompt: "A junior 'fixes' a double-counted client roster by adding DISTINCT, and the counts come out right. Why is the reviewer still unhappy?",
      choices: ["DISTINCT is slower and must never be used", "The dedup hides the fan-out that produced the duplicates — the join is wrong and DISTINCT only silences the symptom", "DISTINCT changes the data types", "The roster was correct before the DISTINCT"],
      answer: 1,
      why: "DISTINCT collapsing inflated rows back to one-per-client means the join fanned out somewhere upstream — the count that survives is right by accident, and the next aggregate on the same rows (SUM of totals, say) is still quietly wrong. The discipline: fix the grain, then let the plain COUNT stand. DISTINCT as a patch is how silent wrongness survives review.",
      notes: [
        { choice: 0, why: "DISTINCT is a legitimate tool for genuine duplicates-in-the-answer (a distinct client roster). The objection is to using it as a bandage over a fan-out bug." },
        { choice: 2, why: "DISTINCT never changes types — it dedups rows. Red herrings about types distract from the real issue: a wrong join shape producing rows that had to be collapsed." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-14",
      prompt: "SELECT COUNT(status = 'pending') FROM orders returns 103, not 14. What is the misunderstanding?",
      choices: ["COUNT ignores the WHERE-less filter", "The comparison yields 0 or 1 for EVERY row and COUNT counts all non-NULL results — both 0 and 1 are non-NULL, so every flow counts", "COUNT needs DISTINCT to filter", "SQLite treats 'pending' as truthy for every row"],
      answer: 1,
      why: "status = 'pending' evaluates to 1 for the 14 pending rows and 0 for the other 89 — and COUNT counts any non-NULL value, zeros included, so the total is 103. The conditional-count forms that actually filter are SUM(CASE WHEN … THEN 1 ELSE 0 END), COUNT(CASE WHEN … THEN 1 END) (NULL for non-matches), or COUNT(*) FILTER (WHERE …).",
      notes: [
        { choice: 0, why: "There is no filter to ignore — a boolean expression inside COUNT is just an argument. The 103 is arithmetically correct for what was written." },
        { choice: 2, why: "DISTINCT dedups values — COUNT(DISTINCT status = 'pending') would read 2 (the distinct outcomes 0 and 1), which is a different wrong answer, not the fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "natwest-mcq-15",
      prompt: "The corridor pack wants one row per corridor with all its client names in a single cell. Which fold delivers that?",
      choices: ["SUM(customer_id)", "GROUP_CONCAT(DISTINCT c.name) with GROUP BY corridor", "MAX(c.name) — the alphabetically last client", "CONCAT over the joined rows without grouping"],
      answer: 1,
      why: "GROUP_CONCAT is the fold that collapses many rows into one delimited string: EU's 45 flows fold to a list of its 8 client names (DISTINCT dedups the repeats the join creates). SUM over ids adds id codes together, MAX keeps one arbitrary name, and CONCAT without grouping is not an aggregate at all — it errors or concatenates per-row.",
      notes: [
        { choice: 2, why: "MAX folds to one row per corridor, but a single name is not a roster — it is the extreme of the group, the same trap as reading 'largest ticket' as 'the book'." },
        { choice: 3, why: "CONCAT is a scalar string function — it glues the values of one row. Without GROUP BY and an aggregate, the corridor column cannot coexist with per-client rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-16",
      prompt: "A reset-trend chart groups by STRFTIME('%m', created_at) and shows 12 buckets for what the kit calls a 14-month spine. Diagnosis?",
      choices: ["Two months had no bookings and vanished", "'%m' emits month-only keys — January 2024 and January 2025 merged into one bucket; the spine needs '%Y-%m' (or SUBSTR(created_at, 1, 7))", "The chart dropped weekends", "STRFTIME cannot format TEXT timestamps"],
      answer: 1,
      why: "The '%m' spine collision is the classic: month-only keys fold both years together, so 14 true months print as 12 fictional ones and the reset trend is unreadable across year boundaries. The year must ride in the key — STRFTIME('%Y-%m', …) or SUBSTR(created_at, 1, 7) — which yields the real 2024-01 to 2025-02 spine.",
      notes: [
        { choice: 0, why: "Every one of the 14 spine months carries bookings on this db. The 12-vs-14 gap is a key-collision signature, not an empty-bucket one — the merged Januaries are the tell." },
        { choice: 3, why: "STRFTIME handles TEXT ISO timestamps fine — '%Y-%m' is the correct call. Only the format string was wrong." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-17",
      prompt: "A confirmation-queue report wants, for each flow, the NEXT booked flow's value on the corridor's timeline. Which window call is right?",
      choices: ["LAG(total) OVER (ORDER BY created_at)", "LEAD(total) OVER (ORDER BY created_at)", "FIRST_VALUE(total) OVER (ORDER BY created_at)", "NTILE(2) OVER (ORDER BY created_at)"],
      answer: 1,
      why: "LEAD looks forward one row — the next booking; LAG looks backward — the previous one. They are mirror images and swapping them is a silent direction bug that still returns numbers. FIRST_VALUE pins the partition's first row (the day's opening flow), and NTILE cuts buckets — neither fetches 'next'.",
      notes: [
        { choice: 0, why: "LAG answers 'what came before' — the right tool for prior-month walks, the wrong one when the queue asks for what follows. Direction is the entire question." },
        { choice: 2, why: "FIRST_VALUE returns the same opening value on every row — a corridor-opening column, not a next-flow column. Three window functions, three different questions." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-18",
      prompt: "A two-flow moving window runs SUM(total) OVER (ORDER BY booked_at ROWS BETWEEN 1 PRECEDING AND CURRENT ROW). What prints on the spine's FIRST row?",
      choices: ["NULL — the frame has no preceding row", "Just that row's total — a one-row frame is used when the preceding bound falls off the edge", "The full corridor total", "Zero"],
      answer: 1,
      why: "ROWS frames clip at partition boundaries: on the first row the PRECEDING bound is empty, the frame shrinks to the current row alone, and the moving sum equals that row's total — no NULL, no padding. The edge behavior is the honest one, but it means edge cells mix one-row and two-row frames, which the pack's footnotes must own.",
      notes: [
        { choice: 0, why: "LAG returns NULL on the first row; a SUM over a clipped frame does not — it sums what exists. Confusing the two edge behaviors is the classic moving-window bug." },
        { choice: 2, why: "UNBOUNDED PRECEDING would reach the full-partition total; a bounded 1-PRECEDING frame never widens past its bound, edge or not." },
      ],
      difficulty: "hard",
    },
    {
      id: "natwest-mcq-19",
      prompt: "Which query returns the corridors that booked flows in 2024 but never carried a single busted flow that year?",
      choices: ["Corridors INNER JOINed to busted flows on corridor", "SELECT corridor FROM booked-2024 EXCEPT SELECT corridor FROM busted-2024", "SELECT corridor FROM booked-2024 UNION SELECT corridor FROM busted-2024", "Corridors GROUP BY corridor HAVING COUNT(*) > 0"],
      answer: 1,
      why: "'Booked but never busted' is set difference: EXCEPT keeps the left set's rows that do not appear in the right set — and both branches must project the same column shape (corridor). UNION returns the union (both populations merged), an inner join keeps only corridors WITH busted flows — the exact complement of the question — and the HAVING form filters on volume, never on membership.",
      notes: [
        { choice: 2, why: "UNION merges and dedups — every booked corridor survives even if it busted everything. EXCEPT is the subtraction UNION cannot do." },
        { choice: 3, why: "HAVING COUNT(*) > 0 is a volume gate every corridor passes. The question is about presence of a kind, not quantity — that is set algebra's job." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-20",
      prompt: "The morning census counts settled, in-flight, awaiting and busted in ONE scan. Why do the kit's close packs accept both COUNT(*) FILTER (WHERE …) and SUM(CASE WHEN … THEN 1 ELSE 0 END)?",
      choices: ["They are spelled differently but identical in semantics and portability trade-offs", "FILTER is faster and CASE is deprecated", "CASE can only count two branches per query", "FILTER ignores NULLs, CASE does not"],
      answer: 0,
      why: "Both are conditional counts over one pass: FILTER is the readable SQL-standard form, SUM(CASE …) is the portable twin that runs on any engine. The discipline the packs enforce is the identity — 52 + 30 + 14 + 7 = 103 by construction — whichever spelling builds it; four sequential queries are four chances to drift.",
      notes: [
        { choice: 1, why: "Neither form is deprecated; on this db size the performance difference is noise. The choice is readability versus portability, stated out loud." },
        { choice: 3, why: "Both ignore NULLs identically inside their conditions. NULL semantics differ across engines for edge forms — which is precisely why the ELSE 0 arm is mandatory in the CASE twin." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-21",
      prompt: "WHERE RANK() OVER (ORDER BY total DESC) <= 5 errors. What does the error teach about the logical pipeline?",
      choices: ["RANK needs a PARTITION BY to appear in WHERE", "Window functions are evaluated AFTER WHERE — ranking columns do not exist yet at filter time; filter in an outer query or a HAVING-over-window workaround via a subquery", "WHERE cannot compare numbers to 5", "The query needs LIMIT 5 instead"],
      answer: 1,
      why: "The pipeline runs FROM → WHERE → GROUP BY → HAVING → SELECT (where windows live) → ORDER BY, so a window's output is not available to WHERE — the engine rejects it outright rather than lying. The fix is staging: wrap the windowed SELECT in a derived table or CTE and filter on the rank outside. LIMIT 5 without the window answers a different question (any five, or five after an arbitrary order).",
      notes: [
        { choice: 0, why: "PARTITION BY changes scope, not evaluation order — a windowed column is unavailable to WHERE with or without a partition." },
        { choice: 3, why: "LIMIT 5 with ORDER BY total DESC happens to give the same rows here — but it cannot coexist with a displayed rank column, which is what the pack actually asked for." },
      ],
      difficulty: "hard",
    },
    {
      id: "natwest-mcq-22",
      prompt: "A flow of 752.96 is 'large' on the platform screen but may be the corridor's whole story on a corridor screen. Which query shape makes the second claim?",
      choices: ["A scalar subquery over the whole table", "A correlated subquery: WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — or its window twin AVG(total) OVER (PARTITION BY client)", "A GROUP BY with HAVING MAX(total) > 700", "A CROSS JOIN of flows to corridors"],
      answer: 1,
      why: "The correlated form re-runs the mean per outer row over that client's own flows — 'large relative to THIS relationship', a different population than the platform's 338.19. The window twin computes the same per-client mean in one pass. The HAVING shape filters clients, not flows, and the scalar whole-table form is precisely the first screen, not the second.",
      notes: [
        { choice: 0, why: "The uncorrelated scalar folds 338.19 once for everyone — the platform baseline. Its empty-inner NULL failure mode is a separate lesson; here the issue is which population defines 'large'." },
        { choice: 2, why: "HAVING gates whole groups after folding — it can find clients whose biggest flow clears 700, but it cannot compare EACH flow to its own client's mean. Group-level and row-level questions again." },
      ],
      difficulty: "hard",
    },
    {
      id: "natwest-mcq-23",
      prompt: "The four corridor average tickets are 335.32 (EU), 313.66 (APAC), 383.48 (US) and 426.22 (LATAM). Why is quoting 'the average corridor ticket is 364.67' wrong for the platform?",
      choices: ["One corridor's average must be wrong", "It is the average of averages — each corridor weighted equally, ignoring that EU carries 45 flows and LATAM 2; the platform mean over all 103 flows is 338.19", "The corridor averages need rounding to 0 decimals first", "364.67 is right — the platform mean is the error"],
      answer: 1,
      why: "Averaging the four corridor means weights LATAM's two flows as heavily as EU's forty-five, so the result drifts up to 364.67 — far from the true 338.19 fold over all 103 flows. Both numbers exist, but they answer different questions; quoting the equal-weight one as the platform ticket misprices every screen built on it. The honest fixes: fold over the full book, or publish the small-corridor caveat.",
      notes: [
        { choice: 3, why: "338.19 is the value every screen in this kit uses because it is the direct fold. 364.67 is real arithmetic wearing the wrong label — exactly the failure mode reviews hunt." },
        { choice: 2, why: "Rounding is presentation. The 26.48 gap is a weighting artifact, and no rounding scheme removes it." },
      ],
      difficulty: "hard",
    },
    {
      id: "natwest-mcq-24",
      prompt: "A pairing query lists every pair of flows belonging to the SAME client, and a junior writes FROM orders a JOIN orders b ON a.customer_id = b.customer_id. What is wrong with the shape?",
      choices: ["Self-joins are not allowed in SQLite", "It emits each pair twice plus every flow paired with itself — the pair-once shape is ON a.customer_id = b.customer_id AND a.id < b.id", "It needs a WHERE clause to work at all", "The aliasing must use the same table name twice"],
      answer: 1,
      why: "The naive equality pairs every flow with every flow of that client both ways and includes the a = b diagonal. The canonical pair-once discipline is a strict inequality on a stable key — a.id < b.id — which keeps exactly one of (x, y) and drops the diagonal. On this book it is how you would pair the five double-settled cycles or co-movement checks without double-counting.",
      notes: [
        { choice: 0, why: "Self-joins are ordinary SQL — a table joined to itself under two aliases. The bug here is the join predicate's symmetry, not the self-join's legality." },
        { choice: 2, why: "The query runs fine as written — that is the danger. It returns a superset that looks plausible and inflates every downstream count." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-25",
      prompt: "WHERE SUBSTR(created_at, 1, 7) = '2024-07' runs, but the EXPLAIN shows a full scan where an index on created_at exists. Why?",
      choices: ["created_at has no index", "Wrapping the indexed column in a function makes the predicate non-sargable — the index is on created_at, not on SUBSTR(created_at, 1, 7); use a half-open range on the raw column instead", "SUBSTR cannot be used in WHERE", "The index needs a VACUUM"],
      answer: 1,
      why: "Sargability: an index serves a predicate only when the raw column is compared to a constant. Apply a function to the column and the engine must evaluate it per row — the index is blind. The fix writes the same month bucket as a range on the raw column: created_at >= '2024-07-01' AND created_at < '2024-08-01', which is also the half-open shape that never drops month-end rows.",
      notes: [
        { choice: 2, why: "SUBSTR in WHERE is perfectly legal — the query returns the right 8 flows. The complaint is cost at scale, not correctness; that distinction is what 'sargable' names." },
        { choice: 3, why: "VACUUM rebuilds the file; it does not teach the planner to see through functions. The predicate, not the index, is what changed." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-26",
      prompt: "The coverage ladder can tie, and the committee pack must regenerate byte-identically every morning. What completes ORDER BY flows DESC, book DESC, ___?",
      choices: ["c.name", "c.id — a stable surrogate key as the final tie-break", "RANDOM()", "Nothing — two columns always suffice"],
      answer: 1,
      why: "Ties survive both sort keys (the four clients at 4 flows have distinct books today, but the query must not depend on that), so the last key must be a stable unique column — the client id. RANDOM() makes every run differ by design, names can collide or change, and 'nothing' leaves the engine free to reorder tied rows between runs, which is exactly the instability the pack forbids.",
      notes: [
        { choice: 0, why: "Names work until two clients share one or a rename lands — reproducibility wants a key that never changes, which is what surrogate ids are for." },
        { choice: 2, why: "RANDOM() is the deliberate anti-choice: it guarantees the pack never matches yesterday, the opposite of the requirement." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-27",
      prompt: "A quarter-end reset read uses BETWEEN '2024-03-01' AND '2024-03-31' on created_at and the March total looks light. Why?",
      choices: ["March bookings were genuinely low", "BETWEEN is inclusive on both ends, so any booking stamped later on the 31st (a time component past midnight) falls out — the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01' is the safe cut", "BETWEEN excludes the first day", "created_at must be CAST to DATE first"],
      answer: 1,
      why: "With timestamps carrying time components, '2024-03-31' as an upper bound matches only midnight-zero of that day — every later second of the 31st drops, and quarter-end is exactly when a fixed-rate tranche rolls. The half-open [start, next-start) range keeps the whole last night and composes cleanly quarter to quarter.",
      notes: [
        { choice: 0, why: "The book's March total (2,617.08) is what it is — the light read is a boundary artifact, and boundary bugs always look like quiet months." },
        { choice: 2, why: "BETWEEN is inclusive on BOTH ends; the loss is at the top edge where time-of-day hides past the literal's midnight." },
      ],
      difficulty: "easy",
    },
    {
      id: "natwest-mcq-28",
      prompt: "On the 14-month spine, LAG(book) OVER (ORDER BY month) prints NULL for 2024-01. A teammate COALESCEs it to 0 so the delta column computes. What did that break?",
      choices: ["Nothing — the delta now reads correctly", "The January delta becomes 3731.97 - 0 = a 100% jump from nothing; the NULL was the honest 'no baseline', and a fabricated zero invents a movement that never happened", "NULLs propagate and blank the column", "LAG cannot be used with COALESCE"],
      answer: 1,
      why: "The first spine row has no prior month — NULL is the data saying 'baseline', not a missing value to repair. Coalescing it to zero turns the opening month into a +3,731.97 jump, and every percentage built on that denominator divides by zero. Label the edge row 'baseline' (or let the NULL print) — the discipline the reset-calendar walk runs on.",
      notes: [
        { choice: 0, why: "The number computes, which is the trap — it computes a fiction. An edge-row NULL is information; a 100%-from-zero delta is misinformation." },
        { choice: 2, why: "NULL propagation is real for arithmetic ON the NULL, but COALESCE removed it here. The damage is the invented zero, not propagation." },
      ],
      difficulty: "medium",
    },
    {
      id: "natwest-mcq-29",
      prompt: "NTILE(4) OVER (ORDER BY flows DESC) bands the 16-client relationship book into quartiles. With four clients tied at 4 flows, what is the catch?",
      choices: ["NTILE errors on ties", "NTILE counts ROWS, not distinct values — tied clients can land in different buckets, splitting one depth tier across quartiles arbitrarily", "NTILE requires a PARTITION BY", "The quartiles will all have exactly 4 clients"],
      answer: 1,
      why: "NTILE is a row-counting bucket function: 16 rows over 4 tiles gives four tidy tiles by count, but ties on flows give NTILE no reason to keep peers together — the tie block can straddle two tiles depending on row order. If tiers must respect ties, band on the value (CASE or a DENSE_RANK cut), and if the tiles must be reproducible, add the deterministic tie-break to the OVER order.",
      notes: [
        { choice: 0, why: "NTILE runs happily on ties — that is the problem. It has no tie semantics at all, so it silently splits peers." },
        { choice: 3, why: "16 rows do divide 4/4/4/4 here — the counts are clean precisely because the client count is divisible, which distracts from the tie-splitting inside the tiles." },
      ],
      difficulty: "hard",
    },
    {
      id: "natwest-mcq-30",
      prompt: "SUM(CASE WHEN status = 'cancelled' THEN 1 END) over a corridor with no busted flows prints NULL, not 0. Why, and what is the fix?",
      choices: ["NULL means the query failed", "With no matching row the CASE never fires, SUM over all-NULL is NULL, and the ELSE arm is missing — SUM(CASE WHEN … THEN 1 ELSE 0 END) or COALESCE outside the fold restores the zero", "SUM cannot handle TEXT statuses", "The corridor needs a GROUP BY"],
      answer: 1,
      why: "A CASE without ELSE emits NULL on every non-match; sum only those and the aggregate is NULL — which prints as an empty cell the committee reads as 'unknown', not 'zero'. The ELSE 0 arm is the honest zero-fill: the corridor genuinely settled a month with zero busted flows, and the grid must print 0 to reconcile. The same rule guards the per-corridor stage grid where LATAM carries no in-flight, awaiting or busted rows at all.",
      notes: [
        { choice: 0, why: "The query succeeded — NULL is a legitimate aggregate over an empty match set. Reading NULL as failure is how missing-ELSE bugs survive into packs." },
        { choice: 2, why: "SUM folds numbers; the CASE converts status text to numbers first. The issue is the ELSE arm's absence, not SUM's type handling." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-natwest-1",
      tier: "easy",
      topic: "q2",
      universe: "fraud",
      title: "The large-exposure watchlist",
      brief:
        "NatWest-flavored brief on the storefront db: before credit adds a corridor line, the large-exposure screen runs — every booked flow whose ticket sits above the platform-average ticket (338.19 on this book), folded per corridor with the flagged count, the exposure total and the largest single ticket. Probed facts: 42 of the 103 flows sit above the line, carrying 24,309.68 of the 34,833.28 book; the per-corridor cut reads EU 18 flagged / 10,899.05 with a 945.21 largest ticket, APAC 13 / 6,784.10 (largest 1,088.44 — the book's biggest single flow), US 10 / 5,873.57, LATAM 1 / 752.96. The committee page applies a double-digit materiality floor: corridors carrying at least ten flagged flows only, so LATAM's single 752.96 exposure stays off it. The page reads biggest exposure first.",
      ask: "Return each corridor carrying at least ten above-average flows with its flagged count, exposure total and largest ticket, biggest exposure first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS flagged_flows,\n       ROUND(SUM(o.total), 2) AS exposure,\n       ROUND(MAX(o.total), 2) AS largest_ticket\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total {2} (SELECT {1}(total) FROM orders)\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY exposure {4};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the threshold fold",
          why: "The screen compares every flow to the book-wide average ticket — AVG(total) = 338.19. SUM makes the threshold 34,833.28 and the watchlist empties (no flow beats the whole book); MAX empties it too; MIN floods it with all 103 flows; COUNT sets the line at 103 and re-flags 88 rows at the wrong cut.",
        },
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-line comparison",
          why: "The screen is strictly above the average ticket. Flipping to < turns the watchlist into the below-the-line census (EU 27, APAC 23 flagged) and the committee reads the small book; = keeps only flows priced exactly at the mean — an empty page on this book.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the materiality floor",
          why: "The committee reviews corridors carrying at least ten flagged flows — US's 10 is the floor itself. 11 drops the US line entirely (its 10 falls below the gate); 2 lets LATAM's single 752.96 exposure onto the page; the floor is the page's population definition.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The page reads biggest exposure on top: EU 10,899.05, APAC 6,784.10, US 5,873.57. ASC opens the meeting on the US's 5,873.57 — a correct query aimed at the wrong end of the credit committee.",
        },
      ],
      distractors: ["SUM", "MAX", "MIN", "COUNT", "<", "11"],
      walkthrough:
        "One join, one scalar threshold, one materiality floor. The join attaches every flow to its corridor; the scalar subquery folds the platform-average ticket (338.19) once, and WHERE o.total > (SELECT AVG(total) FROM orders) keeps only the 42 above-the-line flows worth 24,309.68 — 69.8% of the book in 41% of the rows. GROUP BY corridor folds them three ways: COUNT(*) reads flagged flows (EU 18, APAC 13, US 10), SUM reads exposure (10,899.05 / 6,784.10 / 5,873.57), MAX reads the largest single ticket (945.21 / 1,088.44 — the book's biggest flow — / 845.92). The HAVING floor at 10 is the page's population definition: LATAM's single above-the-line flow (752.96 of its 852.44 book) stays off the committee page not because it is wrong but because the gate says double-digit materiality. The distractors each break differently: SUM or MAX in the threshold empties the watchlist; MIN floods it with all 103 flows; COUNT re-flags 88 rows at a line of 103; < inverts the screen into the below-the-line census; 11 drops the US line by one. The read for credit: EU carries 18 of 42 flagged flows but the book's biggest single ticket (1,088.44) sits in APAC — concentration lives in different corridors at different grains.",
    },
    {
      id: "cs-natwest-2",
      tier: "medium",
      topic: "q5",
      universe: "growth",
      title: "The relationship-depth census",
      brief:
        "NatWest-flavored brief on the storefront db: the commercial review opens with relationship depth — fold the 103 booked flows per client, then read how deep the franchise's relationships actually run. Probed facts: all 16 clients appear in the flow table (the never-ordered anti-join returns a confident zero); the depth ladder runs 24, 17, 14, 13, 5 flows at one client each, then a four-way tie at 4 flows, 2 clients at 3, 3 at 2, and 2 single-flow clients; the deep book — clients with 5-plus flows — holds exactly 5 names. The share read uses the 16-client base as the denominator, printed to 1 decimal: the 4-flow block is 25.0% of the base on its own.",
      ask: "Return each relationship depth with its client count, its share of the 16-client base to 1 decimal, and the running deep-book count at depth 5-plus, deepest relationships first.",
      template:
        "SELECT flows AS depth,\n       COUNT(*) AS clients,\n       ROUND({1} * COUNT(*) / (SELECT COUNT(*) FROM customers), 1) AS client_share,\n       SUM(CASE WHEN flows >= {2} THEN 1 ELSE 0 END) AS deep_book\nFROM (SELECT customer_id, COUNT(*) AS flows\n      FROM orders\n      GROUP BY {3})\nGROUP BY flows\nORDER BY {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the real-arithmetic multiplier",
          noVerify: true,
          why: "The share is 100.0 * clients / 16 — the .0 promotes real arithmetic before the division. A bare 100/16 keeps the integer-division trap: 100 * 1 / 16 truncates to 6, and every single-client rung reads flat.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the deep-book gate",
          why: "Deep means five-plus flows: the ladder runs 5, 13, 14, 17, 24 above the gate — exactly 5 clients. Dropping to 4 folds the 4-flow tie block in and the deep book reads 9; 24 shrinks it to the single heaviest relationship.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the per-client fold key",
          why: "The inner fold groups the 103 flows by customer_id — one row per client relationship. GROUP BY id folds per flow instead and the census collapses to a single depth-1 row claiming 103 clients.",
        },
        {
          answer: "depth DESC",
          kind: "keyword",
          label: "the deepest-first direction",
          why: "The review reads deepest relationships on top: 24, 17, 14, 13, 5, then the tie block. Plain depth runs youngest-first and opens the meeting on the 2 single-flow clients; clients DESC sorts by headcount and scatters the ladder.",
        },
      ],
      distractors: ["10.0", "1000.0", "id", "clients DESC", "4", "24"],
      walkthrough:
        "Two stages: fold the flows per client, then fold the fold. The derived table GROUP BY customer_id turns 103 flows into 16 one-row relationships — the never-ordered anti-join is a confident zero on this db, so all 16 clients appear — and the outer fold groups those rows by depth: one client each at 24, 17, 14, 13 and 5; four clients tied at 4; two at 3; three at 2; two at 1. The share column divides by the scalar (SELECT COUNT(*) FROM customers) = 16, so the 4-flow block reads 25.0% of the base on its own and every single-client rung reads 6.3 — the integer-division trap sits exactly here, which is why the multiplier is 100.0 and not 100. The deep-book column is a one-pass CASE census at the 5-flow gate: five names (the 5, 13, 14, 17 and 24-flow relationships) — the same heavy tail the 63.5% concentration read comes from. The distractors each break differently: 10.0 or 1000.0 rescale every share cell; id collapses the inner fold to one depth-1 row with 103 phantom clients; clients DESC re-sorts by headcount and scatters the ladder; 4 folds the tie block into the deep book (9 names); 24 shrinks it to one. The read for the commercial team: depth is bimodal — eleven relationships at 1-to-4 flows against five at 5-plus — and the tie at 4 is exactly where the next coverage conversation starts.",
    },
    {
      id: "cs-natwest-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The coverage ladder tie",
      brief:
        "NatWest-flavored brief on the storefront db: the relationship team publishes the coverage ladder — clients ranked by booked flows, ties sharing a rung WITH gaps, because the review's published policy is RANK semantics and the gap is the point: phantom rungs make the peer block visible. Probed facts: the ladder above the tie runs 24, 17, 14, 13, 5 flows (Alice Chen, Emma Wilson, Grace Kim, Maya Patel, Chloe Dubois in book order), then a FOUR-way tie at 4 flows (Pedro Alvarez 1,686.17, Keiko Sato 1,098.60, Isabella Rossi 985.65, Noah Meyer 737.68), then two clients at 3 (Farid Nasser 1,458.97, Hiro Tanaka 829.09). The committee page keeps clients at three-plus flows — 11 of the 16 — so the tie policy is visible in the output: rungs 1 through 5, then 6, 6, 6, 6, then 10, 10 — the tie consumes ranks 6 through 9 and the next distinct count lands on 10.",
      ask: "Return each client carrying at least three booked flows with its flow count, lifetime book to 2 decimals and a RANK-semantics coverage ladder, heaviest book first, deepest relationship first.",
      template:
        "SELECT c.name AS client,\n       COUNT(*) AS flows,\n       ROUND(SUM(o.total), 2) AS book,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS coverage_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING COUNT(*) >= {3}\nORDER BY coverage_rank, book DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the gap-preserving rank",
          why: "The published policy is RANK: the four-way tie shares rung 6 and the next distinct count lands on 10 — the gap IS the disclosure. DENSE_RANK reads 6, 6, 6, 6 then 7 (no gap, ties flattened) and ROW_NUMBER hands out 6, 7, 8, 9 arbitrarily — both silently republish a different peer policy than the review states.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the deepest-first ladder order",
          why: "The OVER clause must rank deepest relationship first: ORDER BY COUNT(*) DESC puts Alice Chen's 24 flows on rung 1. ASC ranks from the shallow end — the two 3-flow clients take rungs 1 and 1 and Alice lands on 11 — a correct query aimed at the wrong end of the ladder.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the visibility floor",
          why: "The page keeps clients at three-plus flows — 11 of 16 — so the 6-to-10 gap is visible in the output. Raising the floor to 4 drops Farid Nasser and Hiro Tanaka and the gap vanishes from the page (9 rows ending at rung 6); 5 leaves the five deep relationships only.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "One join, one fold, one window over the fold. The join attaches every flow to its client; GROUP BY c.id folds 103 flows into 16 one-row relationships; HAVING COUNT(*) >= 3 keeps the 11 clients the committee page reviews; and RANK() OVER (ORDER BY COUNT(*) DESC) turns the fold into the ladder — Alice Chen 24 flows on rung 1, Emma Wilson 17 on 2, Grace Kim 14 on 3, Maya Patel 13 on 4, Chloe Dubois 5 on 5, then the four-way tie at 4 sharing rung 6 (ordered inside the rung by book: Pedro Alvarez 1,686.17, Keiko Sato 1,098.60, Isabella Rossi 985.65, Noah Meyer 737.68), and the two 3-flow clients — Farid Nasser and Hiro Tanaka — sharing rung 10. The 6-to-10 gap is RANK's semantics made visible: the tie consumed ranks 6 through 9, and the pack prints those phantom rungs as the disclosure that a peer block exists. The distractors each break differently: DENSE_RANK republishes the ladder as 6-6-6-6-then-7 and the gap disappears; ROW_NUMBER splits the tie 6-7-8-9 and implies four distinct positions that do not exist; ASC runs the ladder from the shallow end; a floor of 4 drops the two 3-flow clients and hides the gap the page exists to show. The read for the relationship team: rung policy is treatment policy — coverage assignments inherit whatever semantics the query picked, so the pick is stated in the pack, not left to the engine.",
    },
    {
      id: "cs-natwest-4",
      tier: "easy",
      topic: "s7",
      universe: "month-close",
      title: "The corridor stage grid",
      brief:
        "NatWest-flavored brief on the storefront db: the close pack opens with the corridor stage grid — one row per corridor, the four stages as columns, built in ONE pass so no two queries can disagree. Probed on the storefront db: EU books 45 flows (24 settled / 12 in flight / 6 awaiting / 3 busted, kept value 6,656.18), APAC 37 (21 / 8 / 5 / 3, kept 6,617.68), US 19 (5 / 10 / 3 / 1, kept 1,444.77) and LATAM 2 (2 / 0 / 0 / 0, kept 852.44) — every row's four arms reconcile to its booked count by construction, and platform-wide 52 + 30 + 14 + 7 = 103. The honest zeros carry the story: LATAM prints zeros across three stages — a corridor that only settles — and the US row is the one ops circles: 10 of 19 flows still in flight. The ELSE 0 arm is what keeps those zeros printed instead of vanishing into NULLs.",
      ask: "Return one row per corridor — settled, in flight, awaiting, busted, kept value to 2 decimals and booked — biggest book first, with every empty stage printing 0.",
      template:
        "SELECT c.region AS corridor,\n       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS settled,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE {2} END) AS in_flight,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS busted,\n       ROUND(SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END), 2) AS kept_value,\n       COUNT(*) AS booked\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY booked {4};",
      slots: [
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight literal",
          why: "In flight is the 'shipped' branch — 30 flows platform-wide with shipped_at as the value-date stamp. 'pending' would print the awaiting-confirmation queue (14 rows) into the in-flight column and the grid would flag quiet confirmations as settlement risk — the wrong incident called entirely.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the honest zero-fill",
          why: "The ELSE 0 arm keeps LATAM's three empty stages printing 0 instead of NULL — an empty cell reads 'unknown' on a committee page, a printed 0 reads 'nothing in flight'. ELSE 1 turns the column into a second booked count (45/37/19/2) and the identity 52+30+14+7 = 103 breaks.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the busted literal",
          why: "Busted is status 'cancelled' — 7 across the book, concentrated in APAC and EU at 3 each. 'shipped' would label the 30 in-flight flows as busted and the credit committee would read a 29% failure rate that does not exist; 'pending' moves the awaiting queue into the busted column the same way.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The pack reads biggest book on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the close on LATAM's two flows — a corridor that is 1.9% of the book — a correct query aimed at the wrong end of the committee.",
        },
      ],
      distractors: ["1", "2", "NULL", "ASC"],
      walkthrough:
        "One join, one pass, four conditional folds per corridor. The join attaches every flow to its corridor, and each stage column is a SUM(CASE …) census: 'delivered' settles 24/21/5/2, 'shipped' carries 12/8/10/0 in flight, 'pending' waits 6/5/3/0, 'cancelled' busts 3/3/1/0 — and each row's four arms plus the booked COUNT(*) foot to 45, 37, 19 and 2, reconciling platform-wide to 52 + 30 + 14 + 7 = 103. The kept-value column folds settled money only — 6,656.18 / 6,617.68 / 1,444.77 / 852.44 — which is why the US row is the one ops circles: 10 of its 19 flows in flight and just 1,444.77 kept of a 7,286.16 book. LATAM's zeros are the grid's honesty test: with the ELSE 0 arm they print as zeros and reconcile; without it they print NULL and the identity check the close runs — arms sum to booked — fails on a row that is actually clean. The distractors each break differently: a wrong status literal in the in-flight or busted slot mislabels the column ('pending' moves the confirmation queue into in-flight, 'delivered' duplicates the settled column, 'shipped' in the busted slot invents a 29% failure rate); ELSE 1 or 2 turns the column into a booked-count lookalike and breaks the footings; NULL empties LATAM's cells; ASC opens the close on the smallest corridor. The read for the close: status censuses must reconcile by construction or they are fiction — and this grid is the one page where the arithmetic proves itself.",
    },
    {
      id: "cs-natwest-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The no-evidence dunning queue",
      brief:
        "NatWest-flavored brief on the storefront db: before a single dunning letter goes out, the collections desk refreshes its anti-join — fee statements that NO settlement rail ever touched. Probed facts: exactly 6 statements worth 15,217.00 in total have zero rail legs — INV-2025-024 Emma Wilson US open 4,937.00 (the biggest exposure), INV-2025-026 Liam O'Brien EU open 3,562.00, INV-2025-027 Isabella Rossi EU open 2,794.00, INV-2025-028 Hiro Tanaka APAC paid 1,756.00, INV-2024-021 Chloe Dubois EU open 1,295.00 and INV-2024-018 Pedro Alvarez EU open 873.00. The queue reads biggest owed first, and two rows get walked line by line in every review: #28 carries paid STATUS with zero legs — a claim without evidence, the row the review era taught the bank to hunt — and the EU corridor holds four of the six, so the batch starts there. Statements that DO carry a leg (even void #11 at 925.00) are reconciliations, not dunning. Statements and legs carry INTEGER pence; the dollar read is amount_cents / 100.0.",
      ask: "Return each never-settled statement with its number, client, corridor, status and owed amount in dollars to 2 decimals, biggest owed first.",
      template:
        "SELECT i.number AS statement,\n       c.name AS client,\n       c.region AS corridor,\n       i.status,\n       ROUND(i.amount_cents / {3}, 2) AS owed\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nLEFT JOIN payments p ON p.invoice_id = {1}\nWHERE p.id IS {2}\nORDER BY owed DESC;",
      slots: [
        {
          answer: "i.id",
          kind: "keyword",
          label: "the anti-join key",
          why: "The LEFT JOIN must ride the statement's own id: ON p.invoice_id = i.id keeps every statement and attaches its legs, leaving NULL payloads where no rail ever touched. p.invoice_id = p.id compares a payment's reference to its own id — a pairing that matches nothing or everything wrong — and i.customer_id ties legs to the client column instead of the statement.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched-side guard",
          why: "p.id IS NULL keeps exactly the statements whose leg payload never arrived — the 6-row, 15,217.00 queue. Flipping the guard to IS NOT NULL inverts the report into the 22 reconciled statements and the dunning batch mails the wrong list; dropping the WHERE entirely returns all 28 with legs duplicated per statement.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the pence divider",
          why: "Statements and legs store INTEGER pence; /100.0 is the dollar read that prints 4,937.00 instead of 493,700. The .0 matters — bare 100 keeps integer arithmetic and the queue prints pence-rounded dollars with the cents quietly gone.",
        },
      ],
      distractors: ["p.id", "i.customer_id", "NOT", "1000"],
      walkthrough:
        "One inner join for the client columns, one LEFT JOIN for the evidence, one guard for the answer. The INNER join to customers is safe — every statement has a client — and it carries the name and corridor the dunning batch needs. The LEFT JOIN to payments rides ON p.invoice_id = i.id, so each statement keeps its legs and the six with none keep NULL payloads; WHERE p.id IS NULL keeps exactly those, and the anti-join reads 6 statements for 15,217.00 — INV-2025-024 at 4,937.00 on top, down to INV-2024-018 at 873.00. The money rule rides in the SELECT: amount_cents / 100.0, because the tables are INTEGER pence and a bare 100 divider eats the cents on every odd-pence row. The distractors each break differently: p.id in the join key compares a payment to itself and the queue dissolves; i.customer_id pairs legs to the wrong entity and attaches other clients' evidence; NOT in the guard flips the report to the reconciled 22; 1000 rescales every owed cell to a tenth of the truth. The read for collections: status is a claim, rail legs are the ledger of record — and #28, paid at 1,756.00 with zero legs, is why this queue is an anti-join and not a status filter.",
    },
    {
      id: "cs-natwest-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The reset-calendar month walk",
      brief:
        "NatWest-flavored brief on the storefront db: the reset calendar is read off the month spine — each month's booked flows beside the prior month's, with the movement quotable from the table. Probed on the storefront db: 14 spine months, 2024-01 through 2025-02, 103 flows worth 34,833.28. The walk opens at 3,731.97 with no baseline (the first row's prior value is honestly NULL), drifts through February's -3.3% and March's -27.5%, and troughs at 1,193.86 in July — the -41.7% June-to-July fade — before rebounding to 2,352.07 in August: +1,158.21, a +97.0% jump on the trough, the month the reset cohort's deferred bookings land. The pack prints the first eight spine months so the trough and rebound are quotable without scrolling.",
      ask: "Return the first eight spine months with month key, booked value, the prior month's value and the month-over-month percentage change to 1 decimal, chronological.",
      template:
        "WITH monthly AS (\n  SELECT {2} AS month,\n         ROUND(SUM(total), 2) AS book\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       book,\n       {1}(book) OVER (ORDER BY month) AS prev_book,\n       ROUND(100.0 * (book - LAG(book) OVER (ORDER BY month))\n             / LAG(book) OVER (ORDER BY month), 1) AS mom_pct\nFROM monthly\nORDER BY month {3}\nLIMIT {4};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month fetch",
          why: "LAG(book) looks one row back — the month before. LEAD would fetch the NEXT month's value into the prior column and every movement reads against the wrong baseline: August would 'precede' July. The first row's LAG is NULL by definition — the honest baseline, never a zero.",
        },
        {
          answer: "SUBSTR(created_at, 1, 7)",
          kind: "keyword",
          label: "the month key",
          why: "The spine is the 7-character ISO prefix: 14 buckets, 2024-01 to 2025-02. STRFTIME('%m', created_at) emits month-only keys and merges the two Januaries (3,731.97 and 1,669.50) into one 12-row fiction — the reset trend across the year boundary becomes unreadable.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological order",
          why: "The calendar walk runs forward: January first, LIMIT 8 landing on the August rebound. DESC reverses the spine and the LIMIT keeps the LAST eight months — the trough still shows but the opening baseline and the walk's direction vanish.",
        },
        {
          answer: "8",
          kind: "number",
          noVerify: true,
          label: "the pack's window",
          why: "The committee pack prints eight spine months — enough to carry the July trough and the +97.0% August rebound on one page. A wider LIMIT dilutes the page; a narrower one cuts the rebound off the story.",
        },
      ],
      distractors: ["LEAD", "STRFTIME('%m', created_at)", "DESC", "6"],
      walkthrough:
        "Stage the spine, then walk it. The CTE folds 103 flows into 14 month buckets on the ISO prefix — the key that keeps 2024's January apart from 2025's — and rounds each month's book once. The outer SELECT carries LAG(book) OVER (ORDER BY month) as the prior column: NULL on 2024-01's opening 3,731.97 because no baseline exists, then 3,731.97, 3,609.64, 2,617.08, 2,468.91, 2,910.31, 2,047.43 behind each following month. The movement column is the walk: -3.3 into February, -27.5 into March, -5.7 into April, +17.9 into May, -29.6 into June, then the two quotable cells — -41.7 into July's 1,193.86 trough and +97.0 into August's 2,352.07, the +1,158.21 rebound the reset cohort's deferred bookings deliver. The 100.0 multiplier sits before the division so the percentages stay real; the LIMIT 8 is the pack's window, not the query's definition. The distractors each break differently: LEAD points the walk at the wrong baseline; '%m' merges the year boundary into a 12-row fiction; DESC reverses the spine so LIMIT keeps the wrong half; 6 cuts the August rebound off the page. The read for the reset desk: the trough-rebound shape is the calendar's signature — deferred bookings fade a quarter and land in the next, and a trend line without the LAG baseline row invites exactly the misread.",
    },
  ],

  problems: [
    { slug: "confirmation-rate", why: "Confirmation discipline is the commercial bank's heartbeat — a flow is not settled until its confirmation lands. This problem drills the join-and-rate shape behind the value-date funnel NatWest ops reads daily." },
    { slug: "queries-quality-and-percentage", why: "Busted shares by corridor (APAC 8.1%, EU 6.7%, US 5.3%) are conditional percentages with the denominator as the whole test — exactly this problem's ratio shape." },
    { slug: "average-selling-price", why: "Blended pricing reads — average ticket per corridor against the 338.19 platform mean — are weighted folds across two grains, the same shape as this problem's per-unit averages." },
    { slug: "customers-who-never-order", why: "The dormant-client anti-join returns a confident zero on this book, and proving that zero is part of the job. This problem drills the LEFT JOIN + IS NULL grammar the whitespace hunt uses." },
    { slug: "sellers-with-no-sales", why: "The correspondent bench carries the shelf six partners wide — partners with zero settled volume are a credit question, not a curiosity. Same anti-join, bench-shaped." },
    { slug: "active-businesses", why: "The morning status census — 52 settled + 30 in flight + 14 awaiting + 7 busted — is a one-pass conditional fold that must reconcile to 103. This problem is that census at practice scale." },
    { slug: "number-of-rich-customers", why: "The 3,000-plus concentration cohort (63.5% of the book) starts as a distinct-count over a threshold. This problem drills the count-above-the-line shape credit uses." },
    { slug: "fix-names-in-a-table", why: "Client-name hygiene before any join: exports arrive title-case-broken, and 'acme ltd' versus 'Acme Ltd' silently splits one business relationship into two." },
    { slug: "movie-rating", why: "Board packets stack populations — settled beside busted, this quarter beside last — and UNION stitching is how the packet is built. This problem drills the stack with a fold on top." },
    { slug: "count-salary-categories", why: "Reset tiers are CASE-banded into buckets that must reconcile to the whole book. This problem is the banded-stack shape the reset forecast uses." },
    { slug: "monthly-transactions-ii", why: "The no-evidence watchlist excludes busted flows from the month spine without losing the bucket. This problem drills the CASE-plus-EXCLUDE shape the review-era close runs." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heaviest relationship (24 flows) is an argmax over a per-client fold — and the tie policy matters when four clients sit at 4. This problem drills the fold-then-pick shape." },
    { slug: "product-price-at-a-given-date", why: "Rate-reset reads are as-of reads: what did this product cost on the reset date, before or after the change landed. This problem drills the latest-row-before-a-date shape." },
    { slug: "find-the-team-size", why: "Coverage reads attach a pod size (or corridor client count) to every row via a partition fold. This problem drills the window-per-team shape the coverage map uses." },
    { slug: "biggest-window-between-events", why: "Dormancy detection: the largest gap between a client's flows flags the at-risk relationship before the next review. Window math over flow timestamps, exactly the early-warning shape." },
    { slug: "portfolio-weights", why: "Share-of-book reads — each corridor's 43.3% / 33.3% / 20.9% / 2.4% cut of the 34,833.28 book — are window shares over an aggregate. This problem drills that exact fold." },
    { slug: "ar-aging-schedule", why: "The 6 open fee statements worth 19,609.00 age into day buckets the collections desk duns in order — exactly this problem's aging-grid shape, with the pence-safe divisor as the trap." },
    { slug: "settlement-fails-aging", why: "In-flight flows that outlive the 2-to-4-day value-date band are the fails list ops works each morning. This problem drills aging over a settlement clock with the population stated." },
    { slug: "delinquency-buckets", why: "Arrears reporting is CASE banding that must reconcile to the book — every bucket an ELSE-0 arm. This problem is the banded-grid shape the reset forecast uses." },
    { slug: "vintage-default-curves", why: "Busted rates by booking cohort — which month's flows went bad — is vintage analysis at storefront scale. This problem drills the cohort-fold shape behind the reset calendar." },
    { slug: "prepayment-detection", why: "Flows settling far ahead of the value-date band are prepayments — good money behaving oddly. This problem drills the early-event detection the confirmation queue runs." },
    { slug: "credit-utilization-bands", why: "CASE-banded tiers with published edges — the same grammar the reset tiers and premier banding use. This problem drills exhaustive ordered arms that reconcile." },
    { slug: "risk-based-pricing", why: "Ticket size against risk tier — 42 flows above the 338.19 line carry 24,309.68 — is a threshold join with a rate attached. This problem drills that screen." },
    { slug: "suspicious-bank-account-transactions", why: "Outlier screens over client flows are the review-era reflex: the largest single ticket (1,088.44) is a question, not a brag. This problem drills anomaly folds with stated populations." },
    { slug: "structuring-detection", why: "Flows engineered just under a materiality floor — the 10-flow committee gate — are the pattern this problem hunts. Threshold-adjacent clustering, the compliance screen's core drill." },
    { slug: "account-balance", why: "A running balance per client over ordered flows is the relationship's story in one column. This problem drills the ordered cumulative fold the account review opens with." },
    { slug: "balance-rollforward", why: "Opening plus movements equals closing — the identity behind the ledger proof (181,080.00 against 181,080.00, delta 0). This problem drills rollforward discipline by construction." },
    { slug: "gl-reconciliation", why: "Debits against credits with a delta that must read zero is the close's final gate. This problem is that reconciliation at practice scale — the drill the trial-balance topic points at." },
    { slug: "journal-gap-detection", why: "Missing sequence ids in a book of record are incidents, not curiosities. This problem drills the anti-join-over-a-sequence shape the ledger hygiene pass runs." },
    { slug: "daily-balance-interest", why: "Date-weighted balances over a month spine are where the value-date discipline pays: half-open windows, no double-counted nights. This problem drills that calendar math." },
    { slug: "point-in-time-asof", why: "Credit reads are as-of reads — what did this relationship look like on the reset date. This problem drills latest-row-before-a-date, the shape the product-price-at-a-given-date screen shares." },
    { slug: "chargeback-rate-ranking", why: "Busted share by corridor (APAC 8.1% on top) ranked fairly across different denominators — rate computation plus RANK semantics in one query. This problem drills that pairing." },
  ],
};
