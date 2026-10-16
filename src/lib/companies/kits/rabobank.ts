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
    "Preparation strategy: the pools file carries no Rabobank section — **0 tagged LC** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: drawdown fate censuses, two-grain corridor folds, seasonal CASE pivots, value-date clock math, correspondent benches and the cents-safe ledger spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:network run-rate census} finance control opens every close with, the other rebuilds the {amber:seasonal working-capital pivot} the corridor desk boards quarterly. The bar to clear: *state the denominator, the units and the season window before you compute anything* — then make every status census reconcile to 103 by construction and every euro fold divide by 100.0 exactly once.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Flows and clients are different grains of the same join, and every corridor census here reports both: the EU book runs 45 flows from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Client joins & survival rules",
      why: "Clients carry corridor and onboarding date; flows inherit them through joins, and the join type decides who survives. A flow without a client row is corruption; a client without flows is rural whitespace — though on this db the anti-join returns a confident zero (all 16 clients appear in the book), and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "sales-analysis-ii"],
    },
    {
      name: "Client ladders & rank policy",
      why: "Relationship reviews rank clients by flow count where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5, then FOUR clients tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer relationships, not syntax.",
      slugs: ["rank-scores", "top-earners", "find-the-team-size"],
    },
    {
      name: "Season banding with CASE",
      why: "The agri book lives on seasons: booked value cut into quarter arms is how the corridor desk sees planting-versus-harvest pressure. The arms must be exhaustive and ordered — a missing month in a BETWEEN arm silently NULLs a quarter instead of printing zero, and a hole in the CASE is a hole in the season board.",
      slugs: ["seasonal-sales-analysis", "weather-type-in-each-country", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "The value-date clock",
      why: "Settlement lag is julianday(shipped_at) - julianday(created_at) over stamped flows: 2.98 days average inside a 2–4 band, 3.07 in the US against 2.93 in APAC. Duration math over two timestamps — with the unstamped 21 rows excluded by a stated filter, never silently skipped by an AVG that ignores NULLs.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Month spines & seasonal walks",
      why: "The 14-month flow spine (2024-01 to 2025-02) is the corridor call's home turf: SUBSTR(created_at, 1, 7) buckets, LAG deltas beside current months, the 1,193.86 July trough named against the 3,731.97 January open. The wrong '%m' bucket merges Januaries two years apart and the season board mis-files.",
      slugs: ["monthly-transactions-i", "biggest-window-between-events", "second-day-confirmation"],
    },
    {
      name: "The correspondent bench",
      why: "Corridor flows settle through correspondent partners, and the bench report is a joins-plus-aggregates fold: facilities listed per partner, settled value routed through each, the rating floor that decides who stays on the shelf — Nordic Gadgets AB leads at 11,130.25 with a 4.6 rating on 3 listings. The grain trap is legs versus facilities — one facility can ring through dozens of legs.",
      slugs: ["average-selling-price", "product-sales-analysis-iii", "find-stores-with-inventory-imbalance"],
    },
    {
      name: "Fee statements & the euro read",
      why: "Booked is not collected — the finance tables (28 fee statements, 27 settlement legs, INTEGER euro-cents) are where the corridor world meets money. Every euro read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the raw leg fold.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "ar-aging-schedule"],
    },
    {
      name: "The book of record & the close",
      why: "The ledger is the book of record — 80 entries, 181,080.00 debits against 181,080.00 credits, delta zero — and every close report must tie back to it. Screens here probe whether you can stage a fold, classify it, and prove the tie-out; a number that can't reach the GL is a rumor, not a read.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward"],
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
  ],
};
