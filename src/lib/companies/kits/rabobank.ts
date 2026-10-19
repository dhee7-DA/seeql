// Rabobank — Wave-10 (Task 100-rabobank), banking domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// The Dutch agri-food cooperative bank: a member-owned lender rooted in farmers' credit
// unions, the world's leading food-and-agri house, with a rural retail network of local
// member banks, a food & agri corridor book financing grain/dairy/horticulture trade, and
// a sustainability-lending franchise stitched into every agri facility. The storefront db
// maps on honestly: customers are agri-corporate & retail clients across four corridor
// buckets (EU / APAC / US / LATAM), orders are booked client flows (REAL dollars — the one
// table where money is already dollars: seasonal working-capital drawdowns, trade-finance
// bookings, facility utilizations), order_items are instrument legs (quantity = units,
// unit_price = rate), products are the lending/deposit/trade product shelf, suppliers are
// correspondent partners, invoices are fee-billing statements (arrangement, commitment and
// documentary fees — the receivables the corridor book carries), payments are settlement
// legs on two rails (method card = the domestic member-bank rail, wire = the cross-border
// SWIFT/SEPA-style rail), expenses are desk-and-network opex (branch leases, network
// marketing, corridor diligence travel), ledger_entries is the double-entry book of record.
// Status map: delivered = settled to final 52, shipped = in flight with shipped_at as the
// value-date stamp 30, pending = awaiting confirmation 14, cancelled = busted 7. Money in
// invoices/payments/expenses/ledger is INTEGER euro-cents — the euro read is always
// amount_cents / 100.0.
// Pool provenance: Rabobank has 0 tagged sql rows in the band (checked company-pools.md
// for rabobank / Rabobank variants) — fewer than 2 tagged rows and none SQL-graded — so
// all 10 topic slug sets and all 16 problems are theme-curated from the pools file's theme
// menu to the question families its screens are known for (fate censuses, two-grain
// corridor folds, seasonal CASE pivots, value-date clock math, correspondent benches,
// fee-billing coverage, books of record), provenance stated per topic and per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12) plus this kit's own readonly
// probe against a copy of db/custom.db (corridor x quarter cells, opex line cells); every
// case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const rabobankKit: CompanyKit = {
  id: "rabobank",
  domainId: "banking",
  name: "Rabobank",
  tagline: "The food & agri cooperative bank: corridors, seasons, member capital",
  accent: "text-indigo-300",

  brief: [
    "**Rabobank** is the Dutch agri-food cooperative — a bank born from farmers' credit unions that grew into the world's leading food-and-agri lender, owned by its members rather than listed shareholders, lending against land, herds, harvests and trade corridors. Seasonality is the franchise's heartbeat: working capital goes out the door for planting and comes back with the harvest, so every flow is dated twice — booked, then value-dated. On this training db the mapping is honest: the 16 customers rows are agri-corporate & retail clients across four corridor buckets, the 103 orders are booked client flows worth **34,833.28**, and the 251 order_items rows are instrument legs. The status map is fixed: delivered = {emerald:settled} (52, 50.5%), shipped = {sky:in flight} (30, 29.1%), pending = awaiting confirmation (14), cancelled = {rose:busted} (7, 6.8%).",
    "The data org splits into agri-lending analytics, the food-&-agri corridor desk, and finance control, and all three read the same spine at different grains. A flow books at created_at and stamps `shipped_at` on value date — **82 of 103 flows** carry the stamp, averaging 2.98 days booked-to-value-date inside a 2–4 day band. Money sits one layer down: fee-billing statements, settlement legs and the ledger carry INTEGER euro-cents, so every euro read is `amount_cents / 100.0` — 28 fee statements split **21 paid for 66,443.00**, 6 open at 19,609.00, 1 void at 925.00. Concentration is the third story: **63.5%** of booked value sits with clients whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost cooperative account moves a corridor's quarter.",
    "Interview screens are census-then-denominator with a seasonal twist. A loop opens with the **two-grain corridor census** — the EU book runs 45 flows from 8 clients while the US runs 19 from 2 — then escalates into the {amber:seasonal pivot} where the interviewer asks where the year actually lands ('your Q1 carries 14,018.72 — what share of the book is that, and which corridor drives it?'), then into the fee-book coverage census — **21 exact, 1 partial** (4,000 of 6,148 settled), **6 never-settled worth 15,217** — where membership is rail evidence, not the status column. The anomaly pair is the famous follow-up: a void statement that still drew its 925.00 settlement leg (#11), and a paid-status statement at 1,756.00 with zero legs at all (#28).",
    "Preparation strategy: the pools file carries no Rabobank section — **0 tagged LC** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: drawdown fate censuses, two-grain corridor folds, seasonal CASE pivots, value-date clock math, correspondent benches and the cents-safe ledger spine. Do the topics in order, then run the six case studies on the live storefront db — built for spaced practice rather than one sitting: the {violet:network run-rate census} finance control opens every close with, the {amber:seasonal working-capital pivot} the corridor desk boards quarterly, the {emerald:relationship ladder} with its four-way-tie rank policy, the one-pass {sky:corridor close census} that reconciles to 103, the {violet:never-settled fee anti-join} behind the dunning batch, and the {amber:working-capital spine walk} with its LAG steps. The bar to clear: *state the denominator, the units and the season window before you compute anything* — then make every status census reconcile to 103 by construction and every euro fold divide by 100.0 exactly once.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the value-date refresh. A corridor analyst opens the flow dashboard before the corridor call: did overnight drawdowns confirm, did any in-flight flow miss its value date, does the one-pass status census reconcile — 52 settled + 30 in flight + 14 awaiting + 7 busted = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the value-date clock drifts off the **2.98-day** norm — the US book averages 3.07 against APAC's 2.93 — the confirmation queue gets pulled before the morning corridor pack ships.",
    "**11:30 —** Midday is the seasonal read. The corridor desk wants booked value cut by quarter beside client counts (EU's Q1 alone carries **6,419.79** — 42.5% of its year) and the client ladder with the four-way tie at 4 flows handled honestly — shared rungs, named policy; risk wants the busted map re-cut, {rose:APAC 8.1%} against EU 6.7% and US 5.3%; the member-bank pod wants flows per client beside client counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the season window spelled out so the number survives the corridor review*.",
    "**15:30 —** The afternoon tilts toward the close. The fee-statement anti-join refreshes first — **6 never-settled worth 15,217** — before any dunning fires; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the collections draft; and the anomaly pair gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00). The network opex census cross-foots — 36 cost lines worth 25,416.00, branch leases the largest at 14 lines — before the day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Booked flow value", what: "Total client flows booked: 34,833.28 across 103 flows, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the segmenting story — one 1,088.44 drawdown outweighs the smallest 42 combined." },
    { name: "Settled-flow share", what: "Delivered ÷ ALL flows booked: 52 of 103 (50.5%), with in-flight at 30 (29.1%) and awaiting-confirmation at 14 (13.6%). Calling an in-flight flow 'settled' — 30 versus 52 — inflates the book before a single facility finalizes." },
    { name: "Busted share by corridor", what: "Cancelled share of booked flows: 7 of 103 (6.8%), sliced by corridor — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The break map that drives the confirmation and repair queues." },
    { name: "Corridor intensity", what: "Flows per client at two grains: EU runs 45 flows from 8 clients, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. COUNT(*) beside COUNT(DISTINCT customer_id) — load versus coverage." },
    { name: "Value-date clock", what: "Booked-to-value-date (created_at → shipped_at) over stamped flows only: 82 of 103, 2.98-day average, 2–4 day band. The population ships with the number — unstamped flows have no cycle yet and must not dilute it." },
    { name: "Fee-book coverage", what: "Fee statements settled by legs, not status: 21 exact (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 never-settled worth 15,217.00. The AR anti-join finance control refreshes every close." },
    { name: "Settlement rails", what: "Settlement legs by rail: domestic member-bank rail 16 legs for 37,364.00, cross-border rail 11 legs for 32,248.00 — 27 legs carrying 69,612.00; 5 statements settle split across both rails." },
    { name: "Book of record", what: "Ledger trial balance: 181,080.00 debits against 181,080.00 credits across 80 entries, delta zero. Network opex beneath it: 36 cost lines worth 25,416.00, branch leases the largest line at 14 entries / 16,800.00." },
  ],

  topics: [
    {
      name: "Drawdown fate censuses",
      why: "Every Rabobank screen opens with the fate chain: flows booked, value-date stamped, settled to final. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight flow 'settled' — 30 versus 52 on this db — and the second trap is dropping the 14 awaiting-confirmation rows from the base.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "immediate-food-delivery-iii", "prepayment-detection", "top-percentile-fraud"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Flows and clients are different grains of the same join, and every corridor census here reports both: the EU book runs 45 flows from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Client joins & survival rules",
      why: "Clients carry corridor and onboarding date; flows inherit them through joins, and the join type decides who survives. A flow without a client row is corruption; a client without flows is rural whitespace — though on this db the anti-join returns a confident zero (all 16 clients appear in the book), and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "sales-analysis-ii", "dormant-reactivation"],
    },
    {
      name: "Client ladders & rank policy",
      why: "Relationship reviews rank clients by flow count where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5, then FOUR clients tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer relationships, not syntax.",
      slugs: ["rank-scores", "top-earners", "find-the-team-size", "chargeback-rate-ranking"],
    },
    {
      name: "Season banding with CASE",
      why: "The agri book lives on seasons: booked value cut into quarter arms is how the corridor desk sees planting-versus-harvest pressure. The arms must be exhaustive and ordered — a missing month in a BETWEEN arm silently NULLs a quarter instead of printing zero, and a hole in the CASE is a hole in the season board.",
      slugs: ["seasonal-sales-analysis", "weather-type-in-each-country", "the-category-of-each-member-in-the-store", "credit-utilization-bands", "calculate-orders-within-each-interval"],
    },
    {
      name: "The value-date clock",
      why: "Settlement lag is julianday(shipped_at) - julianday(created_at) over stamped flows: 2.98 days average inside a 2–4 band, 3.07 in the US against 2.93 in APAC. Duration math over two timestamps — with the unstamped 21 rows excluded by a stated filter, never silently skipped by an AVG that ignores NULLs.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "users-with-two-purchases-within-seven-days", "settlement-fails-aging", "rolling-7d-actives"],
    },
    {
      name: "Month spines & seasonal walks",
      why: "The 14-month flow spine (2024-01 to 2025-02) is the corridor call's home turf: SUBSTR(created_at, 1, 7) buckets, LAG deltas beside current months, the 1,193.86 July trough named against the 3,731.97 January open. The wrong '%m' bucket merges Januaries two years apart and the season board mis-files.",
      slugs: ["monthly-transactions-i", "biggest-window-between-events", "second-day-confirmation", "cohort-repeat-revenue", "point-in-time-asof"],
    },
    {
      name: "The correspondent bench",
      why: "Corridor flows settle through correspondent partners, and the bench report is a joins-plus-aggregates fold: facilities listed per partner, settled value routed through each, the rating floor that decides who stays on the shelf — Nordic Gadgets AB leads at 11,130.25 with a 4.6 rating on 3 listings. The grain trap is legs versus facilities — one facility can ring through dozens of legs.",
      slugs: ["average-selling-price", "product-sales-analysis-iii", "find-stores-with-inventory-imbalance", "risk-based-pricing"],
    },
    {
      name: "Fee statements & the euro read",
      why: "Booked is not collected — the finance tables (28 fee statements, 27 settlement legs, INTEGER euro-cents) are where the corridor world meets money. Every euro read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the raw leg fold.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "ar-aging-schedule", "daily-balance-interest"],
    },
    {
      name: "The book of record & the close",
      why: "The ledger is the book of record — 80 entries, 181,080.00 debits against 181,080.00 credits, delta zero — and every close report must tie back to it. Screens here probe whether you can stage a fold, classify it, and prove the tie-out; a number that can't reach the GL is a rumor, not a read.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward", "journal-gap-detection", "suspicious-bank-account-transactions", "wash-trade-detection"],
    },
  ],

  theory: [
    {
      id: "rabobank-t1",
      q: "Your corridor report joins clients to booked flows. When do you INNER and when do you LEFT — and what silently breaks if you filter a flow status in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A settled-value report joins flows to clients: a flow with no client row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A rural-whitespace report must be LEFT from clients: the clients with no flows ARE the answer, arriving with NULL flow columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload client row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the never-booked anti-join returns a confident zero — all 16 clients appear in the flow table somewhere — and in a cooperative bank that zero is a claim about member coverage, so you prove it with the anti-join rather than assume it. The reviewer grades whether the join type was a decision with a stated survival rule, or a default you never noticed.",
      tag: "joins",
    },
    {
      id: "rabobank-t2",
      q: "Four clients tie at 4 flows on the relationship ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which relationship manager keeps the account next quarter. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer clients (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. In a member-owned cooperative the tie policy is also a fairness statement: peer farms get peer rungs, and the ladder's consumer should be able to read the policy off the SQL.",
      tag: "windows",
    },
    {
      id: "rabobank-t3",
      q: "The census shows 103 flows and 16 clients; EU shows 45 flows and 8 clients. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts flow rows after the join — one row per flow, so a client with 24 flows contributes 24. COUNT(DISTINCT customer_id) folds those rows back to clients — EU's 45 flows collapse to 8 relationships. Neither is wrong: flows measure corridor load and lending momentum, clients measure installed base and member coverage. The ratio — 5.6 flows per client in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening across the membership or concentrating in a handful of large agri accounts. The trap that catches candidates is a third grain: join order_items for instrument legs and COUNT(*) silently counts legs, not flows — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, because in agri lending the flow count and the client count answer different board questions: pipeline activity versus relationship coverage.",
      tag: "aggregation",
    },
    {
      id: "rabobank-t4",
      q: "shipped_at is NULL until a flow value-dates. What is your policy for the value-date clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped flows have a settlement cycle, so the report measures booked-to-value-date for the 82 of 103 flows that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL flows returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting-confirmation plus 7 busted rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average — that invents same-day settlements for drawdowns that have not confirmed, and in a bank that is not a rounding choice, it is a misstatement of the settlement clock. The reviewer wants the population definition in the query, not in the footnotes: a WHERE shipped_at IS NOT NULL with the excluded 21 rows named on the slide.",
      tag: "nulls",
    },
    {
      id: "rabobank-t5",
      q: "The corridor review wants settled value per corridor for corridors carrying at least ten flows. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, awaiting and busted rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-flow floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a corridor line and an error, and between a threshold applied to flows versus to euros. On this db the floor matters: EU (45), APAC (37) and US (19) clear a ten-flow bar while LATAM carries exactly 2, so the same floor is the difference between a full footprint and a three-corridor board. The strong answer places every filter by asking: is this a fact about one flow, or about a corridor?",
      tag: "pipeline",
    },
    {
      id: "rabobank-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 flows always produce a mean (6.4375 flows per client, 6.44 rounded — exactly four clients clear it). On filtered staging tables — one corridor, one status, one season — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each flow to ITS client's average) re-runs per outer row and answers a different question at a different cost — per-client intensity versus book-wide size — and confusing the two is how a 'big drawdowns' list quietly becomes a 'drawdowns bigger than their own client's average' list. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "rabobank-t7",
      q: "The seasonal board buckets booked value into quarters on TEXT timestamps. How do you build the season arms, cut a quarter without losing its last night, and read the first row of the LAG walk?",
      a: "Three moves. The arms: SUBSTR(created_at, 6, 2) gives the two-digit month as TEXT, so quarter bands are text BETWEENs — BETWEEN '01' AND '03' for Q1 — and they must be exhaustive: a missing month silently NULLs a quarter's SUM instead of printing zero, and on this book that hole is visible the moment LATAM's Q2–Q4 cells read NULL. The window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when agri drawdowns land. The walk: on a month-ordered spine LAG fetches the prior bucket and the first row's delta is NULL by definition — the baseline, never a coalesced zero that reads as a flat month. The seasonality this surfaces is the franchise itself: Q1 carries 14,018.72, 40.2% of the annual book, as planting-season working capital goes out the door.",
      tag: "dates",
    },
    {
      id: "rabobank-t8",
      q: "Finance says a fee statement is 'paid' but the settlement-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: fee statements LEFT JOINed to settlement legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why settlement legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: fee statements and legs carry INTEGER euro-cents, so every euro read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000.00 of 6,148.00) / 6 never-settled, and the ledger trial balance must land at 181,080.00 debits against 181,080.00 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "rabobank-t9",
      q: "The corridor deck wants a 3-month moving average of booked value beside every month. How do you frame the window, and where do ROWS and RANGE disagree?",
      a: "AVG(gmv) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) averages each month with its two predecessors — a fixed three-row window that always spans exactly one quarter of spine. ROWS counts physical rows, so the frame width is constant even when values tie. RANGE interprets offsets as VALUES, not rows: on a text month key like '2024-01' a RANGE offset errors outright, and on numeric keys a tie pulls every peer into the frame at once. The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING to CURRENT ROW — ties enter the running aggregate together — which is why the house rule is: never ship a window without writing the frame out loud. On this spine the 3-month smooth is what separates the July trough at 1,193.86 from the August rebound at 2,352.07 without letting one noisy month redraw the trend.",
      tag: "windows",
    },
    {
      id: "rabobank-t10",
      q: "The close pack stacks settled flows, in-flight flows and a grand total into one result set. Walk me through building it so no row silently vanishes.",
      a: "Three moves. First, each branch is a SELECT with the same column shapes — status label, flow count, booked value — because set operations align columns positionally, not by name. Second, stack with UNION ALL and state in a comment why duplicates are impossible (each branch filters a disjoint status, so the same row can never appear twice); plain UNION would dedup byte-identical rows and delete a legitimate one — a board that loses a client's total with no error anywhere. Third, append the total row as its own SELECT — 103 flows, 34,833.28 — so the branches can be reconciled against it: 52 + 30 + 14 + 7 = 103 by construction. The reviewer's test is whether you can say which rows each branch keeps and why the dedup would be safe — not whether you remember the keyword.",
      tag: "sets",
    },
    {
      id: "rabobank-t11",
      q: "LATAM's Q2–Q4 season cells print NULL while other corridors print zeros for empty branches. Defend the difference — when is each the right print?",
      a: "SUM over a set with no rows returns NULL — the engine's way of saying nothing was measured — while COUNT over the same set returns 0, and an ELSE arm that fires also prints 0. The distinction is information: LATAM's entire 852.44 books in Q1, so its Q2–Q4 cells are genuinely empty seasons, and NULL is the honest print; a corridor with a cancelled-only quarter measured something, and zero can be true there. The rule the corridor desk holds: no silent zero-fills — IFNULL every empty arm or none, say which in the title, and never let one column's NULLs coalesce while another's print raw, because the board then compares a filled row against an unfilled one. The failure mode being policed is the deck that reads 'NULL means broken' and zero-fills everything, erasing the difference between an empty season and a measured zero.",
      tag: "nulls",
    },
    {
      id: "rabobank-t12",
      q: "Derived tables, correlated subqueries and window functions can all answer 'how does this flow compare to its client's other flows'. When do you reach for each?",
      a: "The derived table (a folded CTE: flows per client, then joined back) computes the comparison once per group — cheapest, and the right default when the baseline is a per-group aggregate like each client's average ticket. The correlated subquery re-runs per outer row — same answer, worse cost, but natural when the comparison needs the outer row's own columns inline (this flow versus ITS client's mean). The window function computes over the row set without collapsing it — right when the row must survive alongside its baseline (flow, its client's average, and the gap, one pass). On this book the concrete tell: a 'flows above client average' list built as a derived join and built as a window agree row for row; built correlated, they agree but run per-row — and only the window version keeps every 103 rows in the output for the drill-down. Say the cost and the surviving grain out loud; that is the answer being graded.",
      tag: "subqueries",
    },
    {
      id: "rabobank-t13",
      q: "Five statements settle on both rails at once. How do you find them with a self-join, and what stops every pair printing twice?",
      a: "Two legs on one statement are two rows in the payments table, so the pairing is a self-join: payments a JOIN payments b ON a.invoice_id = b.invoice_id — the pairing key is the statement reference, not the row id. Canonicalize with a.id < b.id so each pair prints once (without it, every pair swaps aliases and prints twice); then WHERE a.method <> b.method keeps only cross-rail pairs — the dual-rail signature. The result is the migration artifact list: five statements, each with a card leg and a wire leg, totaling their two cents reads combined with a single /100.0 fold. The discipline generalizes: any 'pairs within one table' report (co-booked clients, same-day legs) uses the same three ingredients — matching key, strict inequality to canonicalize, and a stated difference predicate. One leg cannot pair with itself: a.id < b.id is false for the row against its own alias, which is the guard doing its job.",
      tag: "joins",
    },
    {
      id: "rabobank-t14",
      q: "Your staging table's chase list uses NOT IN against a loaded subquery and returns zero rows. Walk me through the diagnosis and the query you rewrite it to.",
      a: "First suspect the NULL. NOT IN compares every outer row against a materialized list, and x NOT IN (…) evaluates to UNKNOWN the moment one NULL sits in that list — every comparison fails, the result empties, and nothing errors. Staging tables rebuilt from two source systems are exactly where NULLs sneak in, so a confident zero there is a bug until proven otherwise. The rewrite: NOT EXISTS (SELECT 1 FROM legs l WHERE l.invoice_id = i.id) — correlated, NULL-immune, and it short-circuits on the first match instead of materializing the list. The sanity check that catches it in review: run the NOT IN version against the clean core table, where every id is populated — if it returns rows there and zero on staging, the staging column has NULLs, and the fix is a NULL-guard or the NOT EXISTS form. Empty watchlists are how dunning silently stops; the reviewer grades whether your zero was proven or assumed.",
      tag: "quality",
    },
    {
      id: "rabobank-t15",
      q: "The value-date clock averages 2.98 days. Rebuild that number for me — every decision that keeps it honest.",
      a: "Population first: julianday(shipped_at) - julianday(created_at) is only defined for the 82 of 103 flows that carry the stamp — 14 awaiting and 7 busted have no cycle yet — so WHERE shipped_at IS NOT NULL goes in the query and '82 stamped flows' goes in the title. Then mechanics: AVG ignores NULLs, so the WHERE-less version prints the same 2.98 over a silently shrunken base — a real number wearing the wrong name, which is worse than an error. The fold itself: julianday on both sides so the difference is fractional days, not a string subtraction; CAST or ROUND only at the display edge. Band the result — 2 to 4 days on this book — beside the average, because the corridor desk acts on the tail, not the mean. And never IFNULL the lag to zero: that fabricates same-day value dates for unconfirmed drawdowns, which in a bank is a misstatement of the settlement clock, not a rounding choice.",
      tag: "dates",
    },
    {
      id: "rabobank-t16",
      q: "The member master arrives from a merge with case-broken and padded names — 'de Vries' as 'DE VRIES ', 'Van Dijk BV' as 'van dijk'. What breaks downstream, and what is the hygiene pass?",
      a: "Joins and GROUP BY are byte-exact: 'de Vries ' and 'de Vries' are two clients, so corridor folds split one relationship into two and the two-grain census (45 flows from 8 clients) quietly miscounts coverage. The hygiene pass runs before any fold: TRIM the padding, UPPER or LOWER into a canonical comparison key (keep the display column human-cased — a letter to a member reads 'De Vries', not 'DE VRIES'), and collapse internal whitespace. Then verify with a census: GROUP BY the canonical key HAVING COUNT(DISTINCT original) > 1 to name every merged pair, and re-run the corridor census to confirm client counts snap back to 16. The interview point: string functions are not cosmetics here — they are join-key integrity, and the fold is only as good as the keys it groups on.",
      tag: "strings",
    },
    {
      id: "rabobank-t17",
      q: "The desk wants clients tiered into quartiles by booked value — but peers tied at the edge keep landing in different tiers. What is happening and what do you ship instead?",
      a: "NTILE(4) is position-based: it sorts the 16 clients and deals four bands of four rows regardless of ties, so peers with identical books split across the tier edge — the four-way tie at 4 flows is the live example, with three clients in band two and one in band three. If the business wants value-equal tiers where peers move together, that is a RANK or DENSE_RANK cut with a stated boundary ('tier two starts at 1,000'), or PERCENT_RANK to publish each client's relative position and let the tier edges be a policy, not a row count. If the desk genuinely wants equal-size cohorts — four coverage officers each carrying four relationships — NTILE is correct and the tie split is a feature to explain. The answer being graded: know that quartiles-by-rows and tiers-by-value are different products, and ask which one the desk means before writing either.",
      tag: "windows",
    },
    {
      id: "rabobank-t18",
      q: "Make every status census reconcile to 103 by construction. What does that identity look like in SQL, and why does the one-pass version beat four queries?",
      a: "The identity: COUNT(*) FILTER (WHERE status = 'delivered') + FILTER('shipped') + FILTER('pending') + FILTER('cancelled') = COUNT(*) — every row carries exactly one status, so the branches are a partition and the sum is an identity, not a coincidence. Written as one SELECT over orders, the census prints 52, 30, 14, 7 and 103 on the same row, and any future status value that is not one of the four shows up as a gap between the branch sum and COUNT(*) — the identity doubles as a data-quality tripwire. Four separate queries produce four numbers measured at four moments with four chances to drift, and nothing forces them to foot. The discipline generalizes: a corridor census joins to customers and partitions by region (EU 45, APAC 37, US 19, LATAM 2 — footing to 103 again), and the same one-pass FILTER shape works there. The reviewer wants to hear 'the branches partition the population' — that sentence is the whole lesson.",
      tag: "aggregation",
    },
    {
      id: "rabobank-t19",
      q: "'Give me the trough month' and 'give me each client's biggest drawdown' — how do you write argmax queries whose answers survive review?",
      a: "Two shapes, one rule: the identity must ship with the value. Book-wide argmax sorts and cuts — ORDER BY gmv ASC, month ASC LIMIT 1 returns July 2024 at 1,193.86, with the secondary key making the choice deterministic even if a tie ever appears. Per-group argmax stages the fold — a CTE computing each client's max, then matching rows back to it (or a window: MAX(total) OVER (PARTITION BY customer_id) beside the row) — because folding and identifying in one query picks an arbitrary survivor on ties. What review checks: the tie policy is named (first by date? lowest id? alphabetically first?), the LIMIT cut is downstream of a total ORDER BY, and the output carries the identity columns, not just the number. MIN or MAX alone answers 'how much'; the desk asked 'which one' — and on a book where Alice Chen's 24 flows include both the 1,088.44 max and a 25.47 min, the identity is the story.",
      tag: "windows",
    },
    {
      id: "rabobank-t20",
      q: "The month-close pack re-runs the same corridor folds against 103 flows in seconds — but a colleague's version takes minutes. Walk me through making it fast.",
      a: "Start with EXPLAIN QUERY PLAN: if the plan says SCAN on orders or customers where a SEEK is possible, the predicate is non-sargable. The usual culprits are wrappers on the indexed column — SUBSTR(created_at, 1, 7) = '2024-01', CAST(created_at AS DATE) = …, UPPER(region) = 'EU' — each forcing a per-row computation that the index cannot serve. The rewrites are range predicates on the bare column (>= '2024-01-01' AND < '2024-02-01') and normalized keys stored once (a canonical region column) rather than computed per query. Join order follows the filter: cut statuses and dates first, then join to customers — the engine usually does this, but only if the predicates are sargable enough for it to see the selectivity. On a 103-row training db this is pedagogy; on the production flow book it is the difference between a close that runs at 08:15 and one that pages someone. Say 'the index works when the column is bare' — that is the sentence that passes.",
      tag: "indexes",
    },
    {
      id: "rabobank-t21",
      q: "The ladder export re-runs nightly and reviewers noticed the four tied clients swap positions between runs. How do you make a query's output reproducible?",
      a: "Every ORDER BY must be a total order. Ties on the primary key (flows DESC) leave the engine free to emit tied rows in any order — plans change, parallelism changes, and the export flips. Append deterministic secondary keys until the ordering is unique: flows DESC, client, id. The same discipline applies to the window functions that feed the export: RANK() OVER (ORDER BY flows DESC) is stable in value but the row sequence inside the tie block is not, so the outer sort carries the tie-breaker too. NULLs sort at one end by default — state which, or COALESCE at the display edge — and never ORDER BY RANDOM() or an unindexed timestamp alone. The policy lives in a comment: 'tie order = alphabetical by client, chosen by the coverage desk, 2025-03'. Reproducibility is not pedantry — it is what lets two reviewers diff two runs and see policy, not noise.",
      tag: "pipeline",
    },
    {
      id: "rabobank-t22",
      q: "Where does COALESCE belong in the corridor reads — and where does it belong nowhere?",
      a: "COALESCE is a display-edge and semantics-edge tool, not a bandage. Legitimate placements: folding an empty aggregate for a board that has decided zero-fill (COALESCE(SUM(…), 0) with the choice stated), supplying a fallback for an optional attribute (a client's secondary contact), and the anti-join print where you show NULL as 'no legs yet'. Placements that lie: IFNULL-ing the value-date lag to zero invents same-day settlements for 21 flows that have no cycle; IFNULL-ing a NULL anti-join payload to a sentinel that then passes a status filter resurrects rows the LEFT JOIN correctly emptied; and COALESCE inside a JOIN key masks the very mismatch the key would have exposed. The reviewer's heuristic: ask what the NULL meant. If it meant 'nothing measured' and the report promises a number, coalesce deliberately and label it; if it meant 'the join found nothing', the NULL is the finding — print it, don't bury it.",
      tag: "nulls",
    },
    {
      id: "rabobank-t23",
      q: "The close ships only when four proofs pass. Name the four checks you run before the pack goes out, and what each would catch.",
      a: "One — the status census identity: 52 settled + 30 in-flight + 14 awaiting + 7 busted = 103 booked; a gap means a new status value arrived or a filter drifted, and the corridor board is mis-counting before anyone opens it. Two — the cents fold: every finance read divides INTEGER euro-cents by 100.0 exactly once; an odd-cent statement printing round euros means a missing .0 truncated somewhere upstream. Three — the coverage split: 21 exact, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217.00, with the anomaly pair walked by hand — void-but-settled #11 at 925.00 and paid-status #28 at 1,756.00 with zero legs; a status column that disagrees with rail evidence is exactly what this check exists to catch. Four — the ledger tie-out: 181,080.00 debits against 181,080.00 credits across 80 entries, delta zero. Each proof is one query, each catches a different class of lie — census drift, unit drift, evidence drift, book drift — and the pack ships only at four greens.",
      tag: "quality",
    },
    {
      id: "rabobank-t24",
      q: "Every rate the desk quotes gets challenged on its denominator. Walk me through the denominator decisions behind settled share, kept share and intensity.",
      a: "Settled share is 52 over ALL 103 booked flows — the 7 busted stay in, because a busted drawdown consumed capacity and the question is 'what share of commitments finalized'. Kept share per corridor (EU 53.3) is delivered over that corridor's own total, rounded last — the denominator is the corridor, not the platform, and the two reads (53.3 platform-quoted versus 50.5 book-wide) differ by construction. Intensity is flows per client — 45 from 8 is 5.6 — and the denominator decision is the grain: flows over clients, never legs over clients (251 legs would read 31.4 and mean nothing about coverage). The discipline that passes review: name the population before the ratio ('delivered of all booked, busted included'), keep numerator and denominator from the same query pass so they cannot disagree, and print the denominator beside the rate. A percentage without its base is not a KPI; it is a rumor with a percent sign.",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "rabobank-mcq-1",
      prompt: "A booked flow's status reads 'delivered'. In this kit's Rabobank stage map, what happened?",
      choices: ["Settled — the flow finalized and counts as kept", "In flight — value-dated, not yet final", "Busted — cancelled before settlement", "Awaiting confirmation — not yet value-dated"],
      answer: 0,
      why: "The stage map is fixed: delivered = settled (52 of 103 flows, 50.5%). It is the only status where the flow has finalized end to end.",
      notes: [
        { choice: 1, why: "In flight is 'shipped' — 30 flows value-dated but not final. Calling them settled inflates the kept share before a single facility finalizes." },
        { choice: 3, why: "Awaiting-confirmation is 'pending' — 14 flows with no value-date stamp yet. Pending is not settled and not busted; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "rabobank-mcq-2",
      prompt: "The value-date clock averages 2.98 days. Over which population must that average be computed?",
      choices: ["Settled (delivered) flows only — 52 of 103", "Stamped flows only — 82 of 103, stated on the report", "All 103 flows, NULLs counted as zero days", "In-flight flows only — the 30 shipped rows"],
      answer: 1,
      why: "The clock measures booked-to-value-date for the 82 stamped flows; the 21 unstamped rows (14 awaiting, 7 busted) have no cycle yet. The population definition ships with the number — that is the whole discipline.",
      notes: [
        { choice: 0, why: "Delivered-only (52) is a different stage — settlement-to-final, not booked-to-value-date. Mixing the two stages into one rate is the classic funnel blur." },
        { choice: 2, why: "Counting NULLs as zero days invents same-day value dates for unconfirmed drawdowns — a misstatement of the clock, not a rounding choice." },
      ],
      difficulty: "easy",
    },
    {
      id: "rabobank-mcq-3",
      prompt: "EU carries 45 flows from 8 clients. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts flow rows (45); COUNT(DISTINCT customer_id) folds repeats back to clients (8). The gap between them — 5.6 flows per client — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every flow has a client. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts corridor buckets, not clients — a third grain nobody asked for. The census is flows AND relationships." },
      ],
      difficulty: "easy",
    },
    {
      id: "rabobank-mcq-4",
      prompt: "ROUND(SUM(amount_cents) / COUNT(*), 2) on euro-cents rows truncates badly. What is the house fix?",
      choices: ["Move the ROUND outside the SUM", "Divide by 100.0 — the .0 promotes real arithmetic before any integer truncation", "Cast the final result to INTEGER", "Nothing — SQLite always divides reals correctly here"],
      answer: 1,
      why: "The finance tables store INTEGER euro-cents; the euro read is amount_cents / 100.0. The .0 forces real division — on cent sums that are exact multiples it looks cosmetic, but any mixed fold truncates toward zero without it and the fee book under-states by half-euros on odd-cent rows.",
      notes: [
        { choice: 0, why: "ROUND rounds AFTER the damage if the division already truncated. The divisor's type decides the arithmetic, not the display step." },
        { choice: 2, why: "Casting to INTEGER throws away the cents entirely — the opposite of the fix. The euro read needs real division, then a display fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-5",
      prompt: "Keep only corridors carrying at least 10 booked flows. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY corridor HAVING COUNT(*) >= 10", "WHERE flows >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A flow-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45), APAC (37) and US (19) clear a ten-flow bar; LATAM carries exactly 2 and drops off the board.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'flows' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-6",
      prompt: "The client ladder runs 24, 17, 14, 13, 5 flows, then FOUR clients tied at 4. Under RANK, what rank do the two 3-flow clients carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-flow clients share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The published policy for the relationship ladder is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic ladder bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-lag rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The awaiting flows double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 flows.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-8",
      prompt: "A staging-table exclusion uses statement_id NOT IN (SELECT statement_id FROM settlement_legs) and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL statement_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every flow carries a client id. But staging tables are exactly where NULLs sneak in, and empty watchlists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "rabobank-mcq-9",
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
      id: "rabobank-mcq-10",
      prompt: "A seasonal board's Q1 column prints NULL for every corridor instead of a number. The arms read BETWEEN '01' AND '03', '04'/'06', '07'/'09' — and the fourth arm's month list lost its opening bound. What is the diagnosis?",
      choices: ["The engine errored and NULLs are the error state", "An incomplete BETWEEN arm matches nothing, so SUM gets no rows and returns NULL — a hole in the CASE reads as NULL, not zero", "SUM over REAL dollars overflows to NULL at quarter boundaries", "The corridor join dropped every Q1 row"],
      answer: 1,
      why: "SUM over an empty set is NULL — an exhaustive-arms failure in a CASE pivot does not print zero, it prints NULL, and the board looks broken instead of lying. The fix is arm completeness: every month lands in exactly one quarter band, and a coalesce-to-zero on display is a separate, stated choice.",
      notes: [
        { choice: 0, why: "No error anywhere — that is what makes this dangerous. NULL quarters ship as 'the board is stale' tickets instead of a CASE-arms review." },
        { choice: 2, why: "REAL overflow is not a thing at these magnitudes — 34,833.28 annual book. The failure is logic, not arithmetic." },
      ],
      difficulty: "hard",
    },
    {
      id: "rabobank-mcq-11",
      prompt: "The close's status census must print settled, in-flight, awaiting and busted in ONE pass. Which construction reconciles to 103 by construction?",
      choices: ["Four separate COUNT queries pasted into the deck", "GROUP BY status, four rows, no total", "COUNT(*) FILTER (WHERE status = …) per branch in a single SELECT over all 103 flows", "Four subqueries joined on the status text"],
      answer: 2,
      why: "One scan, four conditional counts: every branch partitions the same 103-row population — 52 + 30 + 14 + 7 = 103 by construction. That identity is what makes the census audit-proof; a branch that breaks it is an incident, not a rounding note.",
      notes: [
        { choice: 0, why: "Four sequential queries are four ways to drift — one where-clause edit between runs and the deck no longer foots. The one-pass version cannot disagree with itself." },
        { choice: 1, why: "GROUP BY status prints only statuses that have rows — an empty arm vanishes instead of printing zero, and there is no total row to reconcile against. Holes in the census are how 103 quietly becomes 102." },
      ],
      difficulty: "easy",
    },
    {
      id: "rabobank-mcq-12",
      prompt: "COUNT(shipped_at) returns 82 while COUNT(*) returns 103 on the flow table. What fills the 21-flow gap?",
      choices: ["21 delivered flows that settled same-day", "The 14 awaiting-confirmation plus 7 busted flows — no value-date stamp yet", "21 in-flight flows double-counted across corridors", "21 duplicated client rows from the join"],
      answer: 1,
      why: "COUNT(shipped_at) skips NULLs, so it counts exactly the stamped flows — 82. The gap is 14 pending plus 7 cancelled: rows with no value date yet, not missing data. The gap itself is a census the desk reads every morning.",
      notes: [
        { choice: 0, why: "Delivered flows carry shipped_at like everything else in flight — there is no 'same-day settled' bucket that lacks the stamp. Inventing one is the funnel blur." },
        { choice: 3, why: "No join is running — this is a single-table count. Fan-out confusion belongs to the order_items census, not here." },
      ],
      difficulty: "easy",
    },
    {
      id: "rabobank-mcq-13",
      prompt: "The corridor census joins orders to order_items for instrument legs and COUNT(*) jumps from 103 to 251. Diagnosis?",
      choices: ["The join fanned out: 251 is legs, not flows — 2.44 legs per flow on average", "The join duplicated the client rows", "148 flows are orphans with no client", "COUNT(*) double-counts delivered flows after any join"],
      answer: 0,
      why: "order_items sits at leg grain — 251 rows over 103 flows — so the join multiplies every flow by its leg count. COUNT(*) after a fan-out counts the finest grain in the query, and 'one row per what?' is the question that catches it.",
      notes: [
        { choice: 1, why: "Customers is the one-side table; joining orders to customers never fans out. The multiplication came from the child table, not the parent." },
        { choice: 2, why: "The anti-join on clients returns a confident zero — every flow carries a client. 251 is honest leg grain, not corruption." },
      ],
      difficulty: "easy",
    },
    {
      id: "rabobank-mcq-14",
      prompt: "A junior runs SELECT DISTINCT category FROM products and reports '16 product families'. What did the query actually return?",
      choices: ["16 rows — DISTINCT was applied to the wrong column", "7 rows, one per lending/deposit/trade family — DISTINCT category folds the 16-product shelf to its families", "4 rows, one per corridor", "An error — DISTINCT requires GROUP BY"],
      answer: 1,
      why: "DISTINCT category deduplicates the category column: the 16-product shelf folds to its 7 families. Reporting the row count of the wrong grain is the read a shelf review catches instantly — 16 products, 7 families, and the analyst should be able to say which column they deduplicated.",
      notes: [
        { choice: 0, why: "DISTINCT category cannot return 16 rows unless every category is unique — which would make the column a disguised product key. The shelf is grouped into 7 families." },
        { choice: 2, why: "Corridors live on customers, not products — the column does not exist on the products table and the query would error before printing anything." },
      ],
      difficulty: "easy",
    },
    {
      id: "rabobank-mcq-15",
      prompt: "The relationship review wants each client's flow statuses as one comma-joined roster beside the client name. Which fold delivers it — and at what grain?",
      choices: ["GROUP_CONCAT(o.status) over a client-joined GROUP BY c.id — one row per client", "STRING_AGG over the whole orders table — one row for the book", "MAX(o.status) per client — the roster collapses to the lexicographically largest status", "GROUP_CONCAT(c.name) over orders — one row per status"],
      answer: 0,
      why: "GROUP_CONCAT aggregates text across the group's rows: joined to clients and grouped by client, it renders each relationship's status mix — settled,shipped,pending — on one row. The grain is the client, and a 24-flow relationship's roster is 24 entries long.",
      notes: [
        { choice: 1, why: "Without the GROUP BY the fold runs over the whole table — one roster for all 103 flows, a census of nothing. The join and the group are what make it a per-client read." },
        { choice: 2, why: "MAX keeps one value, not a roster — it answers 'what is the alphabetically last status', which is not a review anyone asked for." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-16",
      prompt: "The 14-month spine was keyed SUBSTR(created_at, 6, 2) and January 2024 merged into January 2025. What is the fix?",
      choices: ["Key on SUBSTR(created_at, 1, 7) — year plus zero-padded month, 14 distinct keys", "CAST the month to INTEGER so 01 and 1 compare equal", "Add ORDER BY created_at — sorting fixes bucketing", "DISTINCT on the two-digit month"],
      answer: 0,
      why: "SUBSTR(created_at, 6, 2) keeps only the two-digit month, so '01' appears twice on a 14-month spine and the two Januaries fold into one row — 3,731.97 + 1,669.50 printed as a single 5,401.47 bucket. Year-plus-month ('2024-01') is the key that keeps the spine at 14 distinct months.",
      notes: [
        { choice: 1, why: "The collision is a missing year, not a padding complaint — casting to INTEGER still merges the two Januaries, now as 1 vs 1." },
        { choice: 2, why: "ORDER BY arranges rows after they exist; it cannot split a bucket that already folded two years into one key." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-17",
      prompt: "An exposure board bands drawdowns: WHEN total < 1000 THEN 'small' comes first, WHEN total < 300 THEN 'micro' comes second. What does a 250.00 drawdown print?",
      choices: ["'small' — the first matching arm wins, so narrow bounds must precede wide ones", "'micro' — SQLite picks the last matching arm", "Both labels print on two rows", "The query errors — arms overlap"],
      answer: 0,
      why: "CASE evaluates arms top-down and stops at the first match: 250 satisfies total < 1000 and never reaches the 'micro' arm. Overlapping arms are not an error — they are a silent re-banding, and the fix is ordering arms from narrowest to widest.",
      notes: [
        { choice: 1, why: "No engine picks the last match — that behavior would make arm order meaningless. The whole discipline of CASE banding is that order IS the logic." },
        { choice: 3, why: "Overlaps compile and run fine; that is exactly what makes them dangerous. The board prints a confident 'small' for a micro drawdown with no error anywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-18",
      prompt: "A teammate writes WHERE RANK() OVER (ORDER BY flows DESC) <= 10 to keep the top rungs and the query rejects it. Why?",
      choices: ["Window functions evaluate after WHERE — rank in a CTE or subquery, filter in an outer SELECT", "RANK requires PARTITION BY to appear in WHERE", "The comparison needs RANK <= '10' as text", "LIMIT must be used inside WHERE for window filters"],
      answer: 0,
      why: "The pipeline evaluates WHERE before SELECT, and windows compute after grouping and selection — so the rank does not exist yet at WHERE time and the engine refuses. The fix is staging: rank inside a CTE, then WHERE rung <= 10 in the outer query.",
      notes: [
        { choice: 1, why: "PARTITION BY changes what the window ranges over, not when it evaluates. The rejection is about evaluation order, not partitioning." },
        { choice: 3, why: "LIMIT trims the final row set and cannot express 'top 10 per rung' semantics — and it does not belong in WHERE. Staging the window is the only honest fix." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-19",
      prompt: "The corridor deck wants a 3-month moving average of booked value on the month spine: AVG(gmv) OVER (ORDER BY month …). Which frame is correct?",
      choices: ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "RANGE BETWEEN 2 PRECEDING AND CURRENT ROW", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "No frame needed — AVG over an ORDER BY window is already moving"],
      answer: 0,
      why: "A trailing three-month average is a ROWS frame of fixed row count: 2 preceding rows plus the current one. RANGE interprets offsets as VALUES — on a text month key like '2024-01' it errors, and on a numeric key it would range over values, not months. UNBOUNDED PRECEDING is the running total, a different board.",
      notes: [
        { choice: 1, why: "RANGE with a value offset means 'rows whose ORDER BY value is within 2 units' — meaningless across text month keys and a silent mis-window anywhere else." },
        { choice: 2, why: "UNBOUNDED PRECEDING makes every row's average span the whole history so far — that is the cumulative trend, not the 3-month smoothing the deck asked for." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-20",
      prompt: "Which set operation returns fee statements billed but never settled — invoice ids minus the ids that appear in settlement legs?",
      choices: ["EXCEPT", "INTERSECT", "UNION", "UNION ALL"],
      answer: 0,
      why: "EXCEPT keeps left-side rows absent from the right: the 6 never-settled statements worth 15,217.00. INTERSECT answers the opposite question — statements a rail has touched; UNION stacks; UNION ALL stacks without dedup. Set algebra is membership, and membership is the coverage census.",
      notes: [
        { choice: 1, why: "INTERSECT returns the settled side — 22 statements — which is the reconciliation list, not the dunning list. Grabbing the wrong side of the operation ships the wrong queue." },
        { choice: 3, why: "UNION ALL concatenates both id lists — 50 rows of mixed membership. No minus operation happened, so the 'never settled' claim is fiction." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-21",
      prompt: "'Big drawdowns' runs total > (SELECT AVG(total) FROM orders) and lists 4 flows. The correlated version — total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — lists a different set. Why?",
      choices: ["The correlated fold compares each flow to ITS client's average ticket — a per-relationship outlier test, a different question than book-wide size", "The correlated subquery returns multiple rows and SQLite takes the first", "Correlated subqueries are not allowed on the orders table", "The uncorrelated version deduplicated statuses before averaging"],
      answer: 0,
      why: "The uncorrelated scalar is one number — the 338.19 book-wide average ticket. The correlated version re-runs per outer row and compares Alice Chen's flows to Alice Chen's average, so a modest flow inside a small relationship can qualify while a big drawdown inside a large one does not. Both queries are correct; only one answers the question asked.",
      notes: [
        { choice: 1, why: "A scalar subquery is 0-or-1 rows by contract; the correlated form re-computes per row, it does not return a set. The drift is semantic, not mechanical." },
        { choice: 3, why: "Neither version deduplicates — AVG is grain-blind to repeated statuses. The two lists differ because the denominators differ." },
      ],
      difficulty: "hard",
    },
    {
      id: "rabobank-mcq-22",
      prompt: "The season board adds LATAM's Q2 arm and the cell prints NULL, not 0. The whole corridor drew nothing in Q2. Is the NULL wrong?",
      choices: ["Yes — every empty cell must coalesce to zero or the board breaks", "No — SUM over an empty set is NULL, and the honest read is 'no rows landed here'; a zero-fill is a separate, stated display choice", "Yes — NULL means the query failed and must be fixed", "No — NULL and zero are the same value in SQLite"],
      answer: 1,
      why: "SUM receives zero rows and returns NULL — that is the engine telling you 'nothing was measured', which is exactly true for LATAM's Q2. Printing 0 claims 'flows landed and totaled zero', a different statement. Either print is defensible; silently conflating them is not.",
      notes: [
        { choice: 0, why: "Coalescing every NULL to zero erases the distinction between 'empty season' and 'measured zero' — the board loses its honesty test. A zero-fill must be deliberate and labeled." },
        { choice: 2, why: "No failure occurred — the query ran, the arm matched nothing, the aggregate reported NULL. Treating NULL as an error state is how 'board is stale' tickets get filed instead of CASE-arms reviews." },
      ],
      difficulty: "hard",
    },
    {
      id: "rabobank-mcq-23",
      prompt: "NTILE(4) OVER (ORDER BY flows DESC) bands the 16-client ladder. What prints for the four clients tied at 4 flows?",
      choices: ["One shared band — NTILE respects value ties like RANK", "Four bands of exactly 4 rows, and the tie SPLITS: three of the 4-flow clients land in band 2, one in band 3 — NTILE counts rows, not values", "An error — NTILE cannot band ties", "Bands of 5/5/5/1 because ties force uneven splits"],
      answer: 1,
      why: "NTILE is position-based: 16 rows into 4 bands is 4/4/4/4 regardless of ties, and the descending ladder 24, 17, 14, 13, 5, 4, 4, 4, 4, 3, 3, … puts the tie block across the band-2/band-3 edge. Peer relationships with identical flow counts land in different tiers — a fact to state, not hide.",
      notes: [
        { choice: 0, why: "RANK and DENSE_RANK share rungs on ties; NTILE does not — it is a row counter with a quota. Confusing the two is how peer clients get split across coverage tiers." },
        { choice: 3, why: "NTILE distributes remainders across the LEADING bands (rows 17 would give 5/4/4/4), not the trailing ones — and 16 rows leaves no remainder at all." },
      ],
      difficulty: "hard",
    },
    {
      id: "rabobank-mcq-24",
      prompt: "The board quotes 'average drawdown 338.19'. A colleague averages the 16 clients' per-client average tickets and reports 2,177.08. Who is wrong?",
      choices: ["The colleague — averaging averages is always invalid", "Neither — 338.19 is the flow-weighted average over 103 flows; 2,177.08 is the mean of 16 per-client books. Different grains, both correct, different claims", "The board — 338.19 double-counts repeat flows", "Both — the true average is the median of the spread"],
      answer: 1,
      why: "338.19 = 34,833.28 / 103: every flow weighs the same. 2,177.08 = 34,833.28 / 16: every client weighs the same. Alice Chen's 24 flows count 24 times in the first and once in the second — neither number is wrong, but quoting one while meaning the other is how a board mis-sizes the coverage model.",
      notes: [
        { choice: 0, why: "Averaging averages IS invalid when the groups are unequal-sized and you claim the pooled mean — the point is that here nobody claimed the pooled mean. The colleague computed a client-grain metric, which is a legitimate different metric." },
        { choice: 2, why: "Repeat flows are the business — a cooperative relationship books many drawdowns, and the flow-weighted mean measures the average booking. It does not double-count anything; it weights by activity." },
      ],
      difficulty: "hard",
    },
    {
      id: "rabobank-mcq-25",
      prompt: "WHERE SUBSTR(created_at, 1, 7) = '2024-01' full-scans the flow table. Which rewrite preserves an index on created_at?",
      choices: ["created_at >= '2024-01-01' AND created_at < '2024-02-01'", "created_at LIKE '%2024-01%'", "CAST(created_at AS DATE) BETWEEN '2024-01-01' AND '2024-01-31'", "UPPER(created_at) LIKE '2024-01%'"],
      answer: 0,
      why: "Wrapping the indexed column in SUBSTR makes the predicate non-sargable — the engine must compute the substring for every row. A half-open range on the bare column lets the index seek straight to January: 2024-01-01 inclusive, 2024-02-01 exclusive, no lost last night.",
      notes: [
        { choice: 1, why: "A leading wildcard disables the same index seek — LIKE '%…' scans exactly like the SUBSTR version, only slower." },
        { choice: 2, why: "CAST wraps the column again — same non-sargable trap — and a BETWEEN up to '2024-01-31' drops January 31st's evening bookings, the classic quarter-end loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "rabobank-mcq-26",
      prompt: "The ladder board re-exports nightly and the four 4-flow clients swap positions between runs. Ranks are stable — only their row order drifts. What fixes the export?",
      choices: ["Add a total-order tie-breaker: ORDER BY flows DESC, client (or id) — named in a comment", "Switch RANK to DENSE_RANK — ties then order deterministically", "ORDER BY RANDOM() so drift is at least intentional", "GROUP BY client to collapse the ties into one row"],
      answer: 0,
      why: "RANK gives tied clients the same rank, but the engine owes nobody an order among equal keys — without a tie-breaker, their display order is unspecified and can change between runs. A deterministic secondary key (name, then id) makes the export reproducible, and the comment is the policy statement.",
      notes: [
        { choice: 1, why: "DENSE_RANK changes the rank VALUES on gaps (10 becomes 7), not the ordering among tied rows. The drift is an ORDER BY problem, not a ranking-function problem." },
        { choice: 3, why: "Collapsing ties into one row deletes four peer relationships and replaces them with an arbitrary survivor — the opposite of the shared-rungs policy." },
      ],
      difficulty: "hard",
    },
    {
      id: "rabobank-mcq-27",
      prompt: "The spine's first row — January 2024 at 3,731.97 — prints step NULL. A teammate coalesces it to 0 so the deck has 'no holes'. What does that zero silently claim?",
      choices: ["That January booked exactly its baseline — a December 2023 comparison that does not exist", "That January is the largest month", "Nothing — NULL and 0 are interchangeable at row one", "That the spine must start in February"],
      answer: 0,
      why: "The NULL step is the baseline: there is no December 2023 row to differ from. A coalesced 0 asserts 'no change versus last month' — inventing a prior month that is not in the book. Quote the NULL as-is; the deck appendix can say 'baseline' in words.",
      notes: [
        { choice: 2, why: "They are not interchangeable: NULL means 'not measured', 0 means 'measured, no change'. The first is the truth; the second is a claim about a month the db does not hold." },
        { choice: 3, why: "Trimming the spine to dodge the NULL deletes the opening month — and 3,731.97 January is the anchor the trough-and-rebound story is told against." },
      ],
      difficulty: "easy",
    },
    {
      id: "rabobank-mcq-28",
      prompt: "The coverage census marks a statement 'exact' when SUM(leg cents) = billed cents. A never-settled statement prints 'exact' in a junior's CASE. What happened?",
      choices: ["SUM over zero legs is NULL, NULL = billed is UNKNOWN, so the equality arm never fired and the row fell through to the wrong default — the NULL case must be tested first", "The legs table double-counted the statement", "The cents were rounded before the comparison", "SQLite treats NULL as 0 in equality comparisons"],
      answer: 0,
      why: "A statement with no legs folds to SUM(NULL-set) = NULL, and NULL = 493700 is not true — the arm silently skips it. If the NULL arm sits after the equality arm (or the ELSE says 'exact'), the statement lands mislabeled. Order the arms: never-settled first, then partial, then exact.",
      notes: [
        { choice: 1, why: "No legs means no rows in the fold — nothing to double-count. The bug is three-valued logic in the CASE, not fan-out." },
        { choice: 3, why: "SQLite never equates NULL with 0 — that is precisely why the arm skipped. If it did, the junior's query would have been accidentally right." },
      ],
      difficulty: "medium",
    },
    {
      id: "rabobank-mcq-29",
      prompt: "The fee book holds 28 statements; the settlement table holds 27 legs. A memo reports '27 of 28 statements settled'. What is the grain error?",
      choices: ["None — 27 and 28 are both statement counts", "Legs are not statements: 27 legs cover 22 distinct statements (five settle split across both rails), so the settled count is COUNT(DISTINCT invoice_id), not COUNT(*)", "The correct count is 28 — void statements count as settled", "The correct count is 27 minus the void statement's leg"],
      answer: 1,
      why: "COUNT(*) over payments counts legs — one row per rail touch. Five statements settle on two rails each, so 27 legs fold to 22 statements. The two-grain discipline applies inside the finance tables exactly as it does between flows and clients: COUNT(DISTINCT invoice_id) is the statement-grain read.",
      notes: [
        { choice: 0, why: "Legs and statements differ by the five dual-rail cycles — 27 ≠ 22. Quoting leg grain as statement grain overstates nothing here but miscounts the coverage base." },
        { choice: 2, why: "The void statement (#11) did draw its 925.00 leg, but 'void counts as settled' is a status-column lie, not a grain fix. Count evidence, not labels." },
      ],
      difficulty: "easy",
    },
    {
      id: "rabobank-mcq-30",
      prompt: "Which query names the trough month — the smallest booked value on the 14-month spine — reproducibly?",
      choices: ["SELECT month, MIN(gmv) FROM spine GROUP BY month", "SELECT month, gmv FROM spine ORDER BY gmv ASC, month ASC LIMIT 1", "SELECT MIN(gmv), MAX(month) FROM spine", "SELECT month FROM spine WHERE gmv = MIN(gmv)"],
      answer: 1,
      why: "The trough is an argmax: ORDER BY gmv ASC LIMIT 1 returns the row — July 2024 at 1,193.86 — and the month tie-breaker guarantees the same row every run even if a future month ever ties. MIN(gmv) alone returns the value without the identity the corridor call needs.",
      notes: [
        { choice: 0, why: "GROUP BY month folds to one row per month and MIN(gmv) equals gmv on each row — 14 rows, no trough named. The aggregate answered nothing the fold had not already printed." },
        { choice: 3, why: "MIN(gmv) does not exist at WHERE time — no aggregate has been computed yet. This is the pipeline-order error in argmax clothing." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-rabobank-1",
      tier: "easy",
      topic: "l8",
      universe: "expense",
      title: "The network run-rate census",
      brief:
        "Rabobank-flavored brief on the storefront db: the rural member-bank network runs on recurring cost lines, and finance control wants the run-rate separated from the one-offs before the close. Probed cells: Rent (branch leases) 14 entries for 16,800.00, Ads (network marketing) 14 for 4,570.00, Tools (core-banking systems) 5 for 1,525.00, Travel (one-off corridor diligence) 3 for 2,521.00 — 36 opex lines worth 25,416.00 in all, cross-footing to the ledger's operating_expenses fold. The desk's rule: a cost line with fewer than 5 entries is a one-off, not the network run-rate, so the census keeps only lines carrying at least 5 entries and reads biggest euro total first.",
      ask: "Return each opex cost line with its entry count and euro total (2 decimals), keeping only cost lines with at least 5 entries, biggest euro total first.",
      template:
        "SELECT category AS cost_line,\n       COUNT(*) AS entries,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS euros\nFROM expenses\nGROUP BY {1}\nHAVING COUNT(*) >= {2}\nORDER BY euros {3};",
      slots: [
        {
          answer: "category",
          kind: "keyword",
          label: "the cost-line key",
          why: "GROUP BY category folds the 36 opex rows into the four cost lines the network recognizes. Folding on spent_on re-groups by spend date — every date its own group, the floor filters everything out and the census ships empty; folding on amount_cents counts money values, not cost lines.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the recurring-line floor",
          why: "The floor is 5 entries — the desk's definition of recurring. Tools carries exactly 5 and survives; Travel carries 3 and drops. A floor of 3 would wave Travel's 2,521.00 into the run-rate and overstate the network's fixed cost base.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-line-first direction",
          why: "The review reads biggest euro total on top: branch leases 16,800.00, then network marketing 4,570.00, then systems 1,525.00. ASC would open the close on the smallest line — a correct query aimed at the wrong end of the memo.",
        },
      ],
      distractors: ["euros", "amount_cents", "spent_on", "3", "ASC", "COUNT(*)"],
      walkthrough:
        "One table, one fold, two grains. GROUP BY category folds the 36 opex rows into cost lines; COUNT(*) reads entry counts (Rent 14, Ads 14, Tools 5 — Travel's 3 falls to the floor of 5); and ROUND(SUM(amount_cents) / 100.0, 2) is the euro read — 16,800.00 / 4,570.00 / 1,525.00, the cents folded once and only once. The three kept lines total 22,895.00 of the network's 25,416.00 opex; Travel's 2,521.00 of one-off corridor diligence sits outside the run-rate by definition, which is the memo's whole point. The distractors fail honestly: euros in the GROUP BY folds on the folded euro value itself and scrambles the rows; amount_cents groups raw money values into singletons; spent_on re-groups by spend date so every date is its own group and the HAVING floor empties the census; 3 as the floor waves the Travel one-off into the run-rate; ASC opens the memo on the smallest line; COUNT(*) in the SELECT slot replaces the entry count with a mis-keyed aggregate and errors. The euro-read rule holds underneath: INTEGER euro-cents, divided by 100.0 exactly once — a fold that can't reach the ledger's operating_expenses tie is a rumor, not a census.",
    },
    {
      id: "cs-rabobank-2",
      tier: "medium",
      topic: "s7",
      universe: "growth",
      title: "The seasonal working-capital pivot",
      brief:
        "Rabobank-flavored brief on the storefront db: agri working capital is seasonal, and the corridor desk boards the year by quarter. Probed cells (all booked flows, busted included — the line was committed even when a drawdown busted): the book front-loads with Q1 at 14,018.72, 40.2% of the 34,833.28 annual total; EU books 6,419.79 in Q1 alone (42.5% of its 15,089.23 corridor book); APAC is the only corridor with a Q4 bump (3,398.93 against a Q2 trough of 1,412.57); the US runs front-loaded at 2,875.35 / 2,159.54 / 1,653.98 / 597.29; and LATAM's entire 852.44 books in Q1, so its Q2-Q4 cells print NULL — no rows, not zeros. The board reads biggest corridor book first and pins quarter cells to 2 decimals.",
      ask: "Return each corridor with its flow count, Q1-Q4 drawn value (2 decimals) and book total (2 decimals), biggest book total first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS flows,\n       ROUND(SUM(CASE WHEN SUBSTR(o.created_at, 6, 2) BETWEEN {1} AND {2} THEN o.total END), 2) AS q1_drawn,\n       ROUND(SUM(CASE WHEN SUBSTR(o.created_at, 6, 2) BETWEEN '04' AND '06' THEN o.total END), 2) AS q2_drawn,\n       ROUND(SUM(CASE WHEN SUBSTR(o.created_at, 6, 2) BETWEEN '07' AND '09' THEN o.total END), 2) AS q3_drawn,\n       ROUND(SUM(CASE WHEN SUBSTR(o.created_at, 6, 2) BETWEEN '10' AND '12' THEN o.total END), 2) AS q4_drawn,\n       ROUND(SUM(o.total), {3}) AS book_total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY book_total {4};",
      slots: [
        {
          answer: "'01'",
          kind: "keyword",
          label: "the Q1 opening month",
          why: "SUBSTR(created_at, 6, 2) yields two-digit month text, so Q1 opens at '01'. Dropping the zero-pad to '1' compares '01' >= '1' as text — false for every month — and Q1 empties to NULL across the board while every other column still computes.",
        },
        {
          answer: "'03'",
          kind: "keyword",
          label: "the Q1 closing month",
          why: "The arm must close at '03' to keep Q1 to January-March. Widening to a bound past Q1 (or a month-name literal like 'January', which every two-digit month sorts below) quietly pulls the whole year into the first quarter and the seasonality story becomes fiction.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the euro precision",
          why: "Board cells pin to 2 decimals — the corridor books read 15,089.23 / 11,605.45 / 7,286.16 / 852.44. ROUND at 1 decimal drifts every cell off the corridor books the desk cross-foots against; the 2 is also verifiable in the result — LATAM's flow count cell.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The board reads biggest corridor book on top: EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. ASC would open the corridor call on LATAM's two flows — a correct query aimed at the wrong end of the meeting.",
        },
      ],
      distractors: ["'1'", "'January'", "ASC", "'Q1'", "'created_at'"],
      walkthrough:
        "One join, four CASE arms, one cross-foot. The join attaches every flow to its corridor; the four SUM(CASE …) arms bucket SUBSTR(o.created_at, 6, 2) into quarter bands, and each corridor row carries its flow count, four quarter cells and a book total rounded to the 2 decimals the desk pins. The read is the franchise: Q1 carries 14,018.72 — 40.2% of the year — as planting-season working capital goes out the door; EU books 6,419.79 of it (42.5% of its own book), the US runs 2,875.35 / 2,159.54 / 1,653.98 / 597.29 front-to-back, APAC is the only corridor whose heaviest quarter is Q4 (3,398.93 against a 1,412.57 Q2 trough), and LATAM's whole 852.44 lands in Q1 so its Q2-Q4 print NULL — an empty arm is NULL, never zero, and that distinction is the board's honesty test. Every corridor's quarters foot to its book total, and the books tie to the probed census. The distractors each break differently: '1' un-zero-pads the lower bound and empties Q1; 'January' is a month name every two-digit month sorts below, so the Q1 arm swallows the year; 'Q1' as a bound matches nothing; 'created_at' as a bound matches nothing; ASC flips the board to LATAM-first. Busted flows stay in by design: a committed line consumed capacity even when the drawdown busted, and the season board measures commitments, not just survivors.",
    },
    {
      id: "cs-rabobank-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The relationship ladder",
      brief:
        "Rabobank-flavored brief on the storefront db: the quarterly relationship review ranks every client by flows booked, because the coverage model — which relationship manager carries which book — is staffed off one ladder. Probed facts: the 103 flows fold into 16 clients, and the ladder reads 24, 17, 14, 13, 5 — Alice Chen 24 flows booking 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56, Chloe Dubois 5 / 2,667.93 — then a FOUR-way tie at 4 flows (Isabella Rossi 985.65, Keiko Sato 1,098.60, Noah Meyer 737.68, Pedro Alvarez 1,686.17) and two clients at 3 (Farid Nasser 1,458.97, Hiro Tanaka 829.09). The desk's published policy is RANK with gaps: the tie holds rung 6 four times and the next rung is 10, not 7 — peer relationships get peer rungs, and the gap is the honest cost of the tie. The floor is 3-plus flows so the tie block and the gap both stay on the board; the review reads biggest flow count first.",
      ask: "Return each client with corridor, flow count, booked value to 2 decimals, plus both rank policies — RANK with gaps and DENSE_RANK without — computed over flow count, biggest flow count first.",
      template:
        "WITH ladder AS (\n  SELECT c.name AS client,\n         c.region AS corridor,\n         COUNT(o.id) AS flows,\n         ROUND(SUM(o.total), 2) AS booked\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id\n)\nSELECT client,\n       corridor,\n       flows,\n       booked,\n       {2}() OVER (ORDER BY flows DESC) AS rung_gap,\n       DENSE_RANK() OVER (ORDER BY flows DESC) AS rung_ties\nFROM ladder\nWHERE flows >= {1}\nORDER BY flows {3}, client;",
      slots: [
        {
          answer: "3",
          kind: "number",
          label: "the ladder floor",
          why: "The floor keeps every rung the policy debate needs — the four-way tie at 4 AND the two 3-flow clients whose rows expose the gap (RANK jumps to 10 where DENSE_RANK reads 7). Raise the floor to 4 and the gap vanishes from the board: both columns agree and the tie policy looks like a non-issue.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the gap-preserving policy",
          why: "The desk's published policy is RANK with gaps: after the four-way tie at rung 6 the next rung is 10 — five clients sit above the tie, so the tie costs three rungs. ROW_NUMBER hands the tie an arbitrary 6-7-8-9 and DENSE_RANK compresses the next rung to 7; neither is the ladder the review ships.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads Alice Chen's 24 flows on top, down to the 3-flow tail. ASC opens the board on Hiro Tanaka's 829.09 — a correct ladder aimed at the wrong end, and the coverage staffing reads bottom-up instead of top-down.",
        },
      ],
      distractors: ["4", "ROW_NUMBER", "DENSE_RANK", "ASC"],
      walkthrough:
        "Fold flows per client first, then rank twice. The ladder CTE joins flows to clients and groups by client: 16 clients, 103 flows, with ROUND(SUM(o.total), 2) carrying booked value beside the count — Alice Chen 24 / 7,262.35 down to Hiro Tanaka 3 / 829.09. The floor WHERE flows >= 3 keeps 11 of the 16 clients, deliberately including the two 3-flow rows: they are the whole tie-policy lesson, because RANK and DENSE_RANK only disagree when a gap follows a tie. The two windows share one ORDER BY flows DESC, so the tie block reads deterministically: the four 4-flow clients all take rung 6 in both columns, then the 3-flow pair splits them — RANK 10, DENSE_RANK 7. That 10-versus-7 is the desk's published policy: a client tied at 4 flows sits behind three phantom rungs under the gap rule, which is exactly how the coverage model treats near-miss relationships. The distractors each break differently: 4 in the floor slot keeps 9 rows and hides the gap so both rank columns agree — the trap that makes the case look trivial; ROW_NUMBER in the policy slot prints 6-7-8-9 across the tie, an ordering nobody signed off; DENSE_RANK compresses the next rung to 7 and quietly promotes the 3-flow tail; ASC flips the board so staffing reads bottom-up. One fold, two policies, one stated floor — and say out loud which rung the tie costs.",
    },
    {
      id: "cs-rabobank-4",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The corridor close census",
      brief:
        "Rabobank-flavored brief on the storefront db: finance control opens every close with the corridor census — settled, in-flight, awaiting and busted per corridor in ONE scan, because four sequential queries are four ways to drift off the 103 identity. Probed facts: the census reads EU 45 flows (24 settled / 12 in-flight / 6 awaiting / 3 busted, settled value 6,656.18, share 53.3), APAC 37 (21 / 8 / 5 / 3, settled value 6,617.68, share 56.8), US 19 (5 / 10 / 3 / 1, settled value 1,444.77, share 26.3) and LATAM 2 (both settled, value 852.44, share 100.0). Platform-wide the branches reconcile 52 + 30 + 14 + 7 = 103 by construction — a branch that breaks that identity is the day's first incident. The board reads biggest corridor first, and the US row is the one ops circles: only 26.3 percent settled, with 10 of 19 flows still in flight.",
      ask: "Return each corridor with its flow count, settled / in-flight / awaiting / busted counts, settled value to 2 decimals and settled share of the corridor to 1 decimal, biggest corridor first.",
      template:
        "WITH census AS (\n  SELECT c.region AS corridor,\n         COUNT(*) AS flows,\n         COUNT(*) FILTER (WHERE o.status = {1}) AS settled,\n         COUNT(*) FILTER (WHERE o.status = {2}) AS in_flight,\n         COUNT(*) FILTER (WHERE o.status = 'pending') AS awaiting,\n         COUNT(*) FILTER (WHERE o.status = 'cancelled') AS busted,\n         ROUND(SUM(o.total) FILTER (WHERE o.status = 'delivered'), 2) AS settled_value\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT corridor,\n       flows,\n       settled,\n       in_flight,\n       awaiting,\n       busted,\n       settled_value,\n       ROUND({3} * settled / flows, 1) AS settled_share\nFROM census\nORDER BY flows {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled status literal",
          why: "'Settled' is the status-filtered conditional count: o.status = 'delivered', the 52 delivered-and-final flows. 'settled' itself is not a status on the book — the FILTER would silently count zero — and 'shipped' would label in-flight flows as money landed.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight literal",
          why: "In-flight is the 'shipped' branch — 30 flows platform-wide with shipped_at as the value-date stamp — never the 'cancelled' arm, which is the 7 busted flows. Swap them and the board reports busted drawdowns as money on the corridor.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the percent multiplier",
          why: "Shares print as percent: 100.0 * settled / flows gives EU 53.3 and LATAM its full 100.0 on a 2-flow denominator. Drop the multiplier and the board prints fractions (0.533) nobody can reconcile against the quoted 52-of-103 settled rate.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-corridor-first direction",
          why: "The board reads EU 45, APAC 37, US 19, LATAM 2 — biggest corridor first, the US row third where ops circles the 26.3 percent. ASC buries the US under LATAM's confident-looking 100.0, a two-flow denominator that flatters to deceive.",
        },
      ],
      distractors: ["pending", "10.0", "ASC", "cancelled"],
      walkthrough:
        "One scan, four FILTER branches, one identity. The census CTE groups all 103 flows by corridor and counts each status branch in the same pass: COUNT(*) FILTER (WHERE o.status = 'delivered') is settled, 'shipped' is in-flight, 'pending' is awaiting, 'cancelled' is busted — EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0. Add each corridor's branches and you get 45, 37, 19, 2; add the corridors and you get 103 — the reconciliation is by construction, which is why the close ships this query and not four sequels. The outer SELECT carries the money and the rate: settled_value sums flow total only over the delivered branch (EU 6,656.18 / APAC 6,617.68 / US 1,444.77 / LATAM 852.44), and settled_share windows nothing — it divides settled by the corridor's own flow count, times 100.0, rounded to one decimal: 53.3, 56.8, 26.3, 100.0. The story the deck tells: LATAM's 100.0 is a two-flow denominator, the US 26.3 is the real operational fire with 10 of 19 flows still in flight, and APAC quietly settles more than the EU. The distractors each corrupt a different branch: 'pending' in the settled slot zeroes every corridor's settled count; 'cancelled' in the in-flight slot rewrites busted drawdowns as money in the corridor; 10.0 in the multiplier prints 5.3 and 10.0 where 53.3 and 100.0 belong; ASC flips the board and hides the US row under the LATAM flatterer. Census in one pass, denominators out loud, 103 or it does not ship.",
    },
    {
      id: "cs-rabobank-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-settled fee statements",
      brief:
        "Rabobank-flavored brief on the storefront db: before any dunning letter goes out, finance control refreshes its anti-join — fee statements that NO settlement rail ever touched. Probed facts: exactly 6 statements worth 15,217.00 in total have zero settlement legs — INV-2025-024 Emma Wilson US open 4,937.00 (2025-01-08, the biggest exposure), INV-2025-026 Liam O'Brien EU open 3,562.00, INV-2025-027 Isabella Rossi EU open 2,794.00, INV-2025-028 Hiro Tanaka APAC paid 1,756.00, INV-2024-021 Chloe Dubois EU open 1,295.00 and INV-2024-018 Pedro Alvarez EU open 873.00 (2024-10-29, the oldest). The queue reads biggest owed first. Two rows get walked line by line in every review: #28 is paid-STATUS with zero legs — a status that lies — and the EU corridor carries four of the six, so the dunning batch starts there. Statements that DO carry a leg (even void #11 at 925.00) are reconciliations, not dunning.",
      ask: "Return each never-settled fee statement with its number, client, corridor, status, issue date and owed amount in euros to 2 decimals, biggest owed first.",
      template:
        "SELECT i.number AS statement,\n       c.name AS client,\n       c.region AS corridor,\n       i.status,\n       i.issued_on,\n       ROUND(i.amount_cents / {4}, 2) AS owed\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nLEFT JOIN payments p ON p.invoice_id = {1}\nWHERE p.id {2} {3}\nORDER BY owed DESC;",
      slots: [
        {
          answer: "i.id",
          kind: "keyword",
          label: "the anti-join key",
          why: "The LEFT JOIN must ride the statement's own id: ON p.invoice_id = i.id keeps every statement and attaches its legs, leaving NULL payloads where no rail ever touched. p.invoice_id = p.id compares a payment's reference to its own id — a pairing that means nothing — and i.customer_id ties legs to the client column instead.",
        },
        {
          answer: "IS",
          kind: "keyword",
          label: "the unmatched test",
          why: "Unmatched legs leave p.id NULL, and NULL needs the IS test: p.id IS NULL selects exactly the never-settled rows. p.id = NULL evaluates to NULL for every row — even the ones you want — and the queue silently empties to zero rows.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-leg marker",
          why: "The anti-join's answer set is the NULL payload from the LEFT JOIN — statements with zero settlement legs. NOT NULL here flips to the opposite queue: every statement a rail HAS touched, the reconciliation list including void #11, not the dunning list.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Fee statements carry INTEGER euro-cents — the house read is amount_cents / 100.0, printing Emma Wilson's 493,700 cents as 4,937.00. Divide by 10.0 and every figure inflates tenfold; the dunning letter quotes 49,370.00 and the batch stops reconciling with the 15,217.00 queue total.",
        },
      ],
      distractors: ["NOT NULL", "=", "c.id", "10.0"],
      walkthrough:
        "A LEFT JOIN anti-join, then a cents-safe fold. Join statements to clients INNER — every statement has an owner — then LEFT JOIN payments ON p.invoice_id = i.id: statements with legs carry their payment rows, the never-settled six carry NULL payloads, and WHERE p.id IS NULL keeps exactly those. Six statements survive, biggest first because the ORDER BY owed DESC is hardcoded: Emma Wilson's INV-2025-024 at 4,937.00 opens the batch, down to Pedro Alvarez's 873.00 from 2024-10-29, the oldest. The pad is INTEGER euro-cents, so owed = ROUND(amount_cents / 100.0, 2) — 493,700 cents prints 4,937.00, 87,300 prints 873.00, and the six rows cross-foot to 15,217.00, the number finance control quotes in every review. The rows that make it interesting: INV-2025-028 is paid-STATUS with zero legs — a status that lies, so dunning proceeds on legs, not labels; and the EU corridor holds four of the six (3,562.00 + 2,794.00 + 1,295.00 + 873.00), which is where the batch starts. The distractors each break differently: c.id in the join key slot pairs legs to customers and returns an unexplainable queue; = in the test slot turns the WHERE into p.id = NULL, which is NULL for every row and silently empties the queue — the classic anti-join kill; NOT NULL in the marker slot flips to the settled list, void #11 included; 10.0 in the divisor slot inflates every figure tenfold and breaks the 15,217.00 cross-foot. LEFT JOIN for coverage, IS NULL for the miss, cents over one hundred, biggest first — that is the dunning refresh.",
    },
    {
      id: "cs-rabobank-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The working-capital spine",
      brief:
        "Rabobank-flavored brief on the storefront db: the corridor call's board deck opens with the working-capital spine — every month of the 14-month flow spine (2024-01 to 2025-02) with its month-over-month step, so seasonality arguments start from one query. Probed facts: the book opens at 3,731.97 in 2024-01 with a NULL step — the baseline row, not a zero; the spine sags through spring (-992.56 into 2024-03), troughs at 1,193.86 in 2024-07, then jumps +1,158.21 into August's 2,352.07; the steepest single step is -1,326.87 into 2024-11 (1,648.80), and the walk closes at 2,390.53 in 2025-02 on a +721.03 step. The month key is the '%Y-%m' STRFTIME format — the '%m' shortcut is the known trap that merges January 2024 into January 2025 and silently deletes a month from the spine. The deck reads oldest month first, and the first row's NULL step is quoted as-is in the appendix, never coalesced to zero.",
      ask: "Return the monthly spine with booked value to 2 decimals, the previous month's value beside it, and the month-over-month step to 2 decimals, oldest month first.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME({3}, o.created_at) AS month,\n         ROUND(SUM(o.total), 2) AS booked\n  FROM orders o\n  GROUP BY month\n), steps AS (\n  SELECT month,\n         booked,\n         {1}(booked) OVER (ORDER BY month) AS prev_booked\n  FROM spine\n)\nSELECT month,\n       booked,\n       prev_booked,\n       ROUND(booked - prev_booked, 2) AS step\nFROM steps\nORDER BY month {2};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward-looking offset",
          why: "A step is this month minus LAST month: LAG(booked) OVER (ORDER BY month) reaches back one row and leaves the first row NULL — the baseline by definition. LEAD reaches forward and flips every sign; SUM(booked) OVER (…) builds a running total, a different board entirely.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first spine direction",
          why: "The walk reads chronologically — 2024-01's 3,731.97 opens the deck and the 2025-02 close lands last, so the trough and rebound read left to right. DESC tells the same story backwards and puts the NULL baseline at the bottom, where nobody expects a baseline.",
        },
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month key format",
          why: "The spine key must carry the year: '%Y-%m' gives 14 distinct months from 2024-01 to 2025-02. '%m' alone merges January 2024 into January 2025 (3,731.97 + 1,669.50 into one 5,401.47 '01' row) — the spine prints 13 rows, every LAG step across the year boundary is fiction, and nothing errors.",
        },
      ],
      distractors: ["LEAD", "DESC", "%m", "SUM"],
      walkthrough:
        "Two stages: fold the calendar, then step it. The spine CTE folds all 103 flows into 14 monthly booked-value rows keyed by STRFTIME('%Y-%m', created_at) — the year in the key is what keeps January 2024 and January 2025 apart. The steps CTE adds LAG(booked) OVER (ORDER BY month): each month now carries its predecessor, 2024-01's prev_booked is NULL because there is no December 2023 to reach back to, and the outer SELECT prints the step as ROUND(booked - prev_booked, 2) — -122.33 into February, -992.56 into March, the -853.57 slide into the July trough at 1,193.86, the +1,158.21 August rebound to 2,352.07, the -1,326.87 November slump, and the +721.03 close at 2,390.53. The first row's NULL is quoted, never coalesced: a zero would make the opening month look like it lost 3,731.97 overnight. The '%m' trap deserves the horror story it gets — the query still runs, the spine shrinks to 13 rows, and every step across the December-January boundary compares a month against a merged Frankenstein key; corridor decks have shipped with it. The distractors each break differently: LEAD flips every sign and moves the NULL to the last row; SUM builds a cumulative running total instead of steps; DESC walks the spine backwards with the baseline at the bottom; '%m' merges the two Januaries and deletes a month from the board. Fold on the year-aware key, step with LAG, read oldest first, and quote the NULL as the baseline it is.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "Drawdowns settled inside the promised window versus late ones — the seasonal-line SLA read the corridor desk runs every planting season, a conditional rate over a timestamp comparison." },
    { slug: "customers-who-never-order", why: "The rural-whitespace anti-join: which member clients have never drawn a flow. On this db the answer is a confident zero, and proving that zero is the relationship-coverage exercise." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Floor gates on client folds: which relationships carry at least N booked flows. The corridor desk reframes it as 'which clients justify a dedicated coverage officer'." },
    { slug: "calculate-special-bonus", why: "Sustainability-linked fee steps: the concession applies only when the green covenants hold. A CASE bonus keyed on a condition is exactly the green-lending fee shape." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Facility legs above the book-mean leg size — a two-stage fold (compute the mean, then filter against it) that mirrors the desk's above-average exposure screens." },
    { slug: "active-businesses", why: "One-pass fate censuses: settled, in flight, awaiting, busted in a single scan whose branches must reconcile to COUNT(*). Four sequential queries drift; one pass cannot." },
    { slug: "count-salary-categories", why: "Corridor status boards with zero arms included — LATAM's empty cells must print, not vanish. UNION ALL zero-bucket construction is how the board stays honest." },
    { slug: "monthly-transactions-ii", why: "Stacked month boards with a grand-total row: the 14-month flow spine plus its UNION ALL total, the shape finance control boards at every close." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Green-lending cross-sell: clients holding both a sustainability covenant and a trade facility but no hedging line — conditional aggregation across three product families." },
    { slug: "confirmation-rate", why: "Confirmation coverage with a COALESCE fallback: awaiting-confirmation flows must stay visible at zero rather than silently dropping out of the denominator." },
    { slug: "null-blank-audit", why: "Member-master hygiene before any corridor fold: NULL and blank fields in the client master silently split one relationship into two during GROUP BY." },
    { slug: "find-zombie-sessions", why: "Dormancy detection for rural accounts: the largest gap between settlement touches flags the dormant cohort before the relationship cools — window math over event timestamps." },
    { slug: "transaction-velocity", why: "Corridor velocity bursts on the settlement rails: legs clustering inside short windows are how the payments desk watches commodity-payment behavior instead of single tickets." },
    { slug: "delinquency-buckets", why: "DPD buckets for seasonal working-capital lines: the harvest-timing grace the desk grants only exists if the bucket edges are exhaustive and ordered." },
    { slug: "structuring-detection", why: "Commodity-payment structuring screens: drawdowns sliced just under reporting walls. A HAVING-guarded census is the compliance desk's first query on any new corridor." },
    { slug: "vintage-default-curves", why: "Vintage curves by season cohort: flows booked in the same planting quarter tracked together — the agri-lending view of credit quality over the farm year." },
    { slug: "immediate-food-delivery-iii", why: "The third stage of the SLA read: late versus on-time value-dating per delivery preference — the corridor desk's escalation cut when the 2.98-day clock drifts." },
    { slug: "prepayment-detection", why: "Seasonal lines get repaid the moment the harvest lands — earliest-repayment detection over event timestamps is exactly the prepayment screen the agri book runs every autumn." },
    { slug: "top-percentile-fraud", why: "Drawdown anomalies concentrate in the tail: the 1,088.44-to-25.47 spread means percentile screens, not averages, are how the desk hunts suspicious bookings." },
    { slug: "chargeback-rate-ranking", why: "Reversed or busted flows ranked by corridor share — RANK over a conditional rate, the same ladder discipline the relationship review uses, pointed at risk." },
    { slug: "credit-utilization-bands", why: "Facility utilization banded into CASE arms with fixed edges — the headroom read the relationship manager quotes before any new drawdown is approved." },
    { slug: "calculate-orders-within-each-interval", why: "Drawdowns bucketed into ticket-size intervals — the depth-of-relationship histogram that shows whether a corridor books many small advances or few large ones." },
    { slug: "settlement-fails-aging", why: "Legs that missed their value date age into fails buckets — T+2 style aging over shipped_at, the back-office beat behind the value-date clock." },
    { slug: "rolling-7d-actives", why: "Rolling activity windows over the settlement rails: consecutive-week counts of legs moving per corridor, the pulse read behind the confirmation queue." },
    { slug: "cohort-repeat-revenue", why: "Repeat drawdowns by booking-quarter cohort — clients who came back after their first seasonal line, tracked on the same month spine the corridor call reads." },
    { slug: "point-in-time-asof", why: "As-of joins pin each flow to the rate or rating live on its booking date — the temporal join behind honest re-pricing and correspondent-bench reviews." },
    { slug: "risk-based-pricing", why: "The correspondent bench prices off rating floors — a band join mapping a partner's grade to a fee grid, the same shape the shelf review grades on." },
    { slug: "daily-balance-interest", why: "Interest accrues on daily balances in INTEGER cents — the per-day fold with the /100.0 rule, drilled on the same cents-safe spine as the fee book." },
    { slug: "journal-gap-detection", why: "Ledger gaps page the close: missing entry ids in the 80-entry book of record break the 181,080-against-181,080 tie, and gap detection is how they get caught." },
    { slug: "suspicious-bank-account-transactions", why: "Burst patterns in settlement legs — two legs on one statement is the dual-rail signature, and sliding-window burst logic is how the sweep generalizes." },
    { slug: "wash-trade-detection", why: "Same-counterparty pairing screens: flows booked and settled inside one relationship ring — self-join pair detection with an id canonicalizer, one table over from the rails." },
    { slug: "dormant-reactivation", why: "Dormant rural accounts: clients whose last drawdown aged past the season — the whitespace census that decides which member bank gets the reactivation visit." },
  ],
};
