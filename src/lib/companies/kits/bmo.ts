// BMO — Wave-10 (Task 100-bmo), banking domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Bank of Montreal: North America's cross-border bank — a Canadian universal bank whose
// commercial book runs on both sides of the border, financing mid-market companies and
// cross-border trade, with the 2023 Bank of the West acquisition folding a US branch
// network into its own. The storefront db maps on honestly (banking-house convention,
// consistent with morganstanley/santander/mufg): customers are retail + commercial clients
// across four corridor buckets (the db carries them as EU / APAC / US / LATAM codes — at
// BMO the US code reads as the US-Canada cross-border corridor, the flagship; EU carries
// the Canadian home-franchise book, APAC the US middle-market book the integration added,
// LATAM the trade-finance pilot line), orders are booked client flows (delivered = settled
// to final 52, shipped = in flight with shipped_at as the value-date stamp 30, pending =
// awaiting confirmation 14, cancelled = busted 7), order_items are instrument legs
// (quantity = units, unit_price = rate), products are the product shelf
// (lending/deposits/wealth), suppliers are correspondent partners, invoices are fee-billing
// statements, payments are settlement legs on two rails (method card = the domestic debit
// rail, wire = the cross-border SWIFT-style rail), expenses are desk-and-network opex,
// ledger_entries is the double-entry book of record. Finance tables are INTEGER cents —
// the dollar read is always amount_cents / 100.0; orders.total and order_items.unit_price
// are REAL dollars. Angle kept DISTINCT from the banking siblings: the cross-border
// US-Canada corridor book, commercial lending, and the acquisition-integration story
// (dual-rail settlement artifacts, GL tie-outs) — not rabobank's seasonal pivot, not
// mufg's rate pivot, not hdfc's retail cards engine, not santander's country-book split.
// Pool provenance: company-pools.md carries NO BMO section (0 tagged rows) — so all 10
// topic slug sets and all 16 problems are theme-curated from the pools file's theme menu
// (sql rows only, no w*/d*/f* rows) and say so. Case briefs quote probed figures from
// scripts/company-facts.md; every case slot is mechanically verified against db/custom.db
// by scripts/case-audit.ts (and was re-probed against a readonly copy before authoring).

import type { CompanyKit } from "../types";

export const bmoKit: CompanyKit = {
  id: "bmo",
  domainId: "banking",
  name: "BMO",
  tagline: "The US-Canada cross-border bank: corridor books, commercial lending, integration synergy",
  accent: "text-violet-300",

  brief: [
    "**BMO** is the bank of the US-Canada corridor — a Canadian universal bank whose commercial book runs on both sides of the border, lending to mid-market companies, financing trade across the 49th parallel, and, since the 2023 Bank of the West acquisition, carrying a US branch network folded into its own. On this training db the mapping is honest: the 16 customers rows are retail + commercial clients across four corridor buckets (the US code reads as the US-Canada cross-border corridor — the flagship; EU, APAC and LATAM codes carry the Canadian home franchise, the US middle-market book the integration added, and the trade-finance pilot line). The 103 orders are booked client flows worth **34,833.28**; the 251 order_items rows are instrument legs, 2.44 per flow. The status map is fixed: delivered = {emerald:settled to final} (52, 50.5%), shipped = {sky:in flight} (30, 29.1%) with shipped_at as the value-date stamp, pending = awaiting confirmation (14), cancelled = {rose:busted} (7, 6.8%).",
    "The data org splits into corridor analytics, the commercial-lending pod, and finance control, and all three read the same spine at different grains. A flow books at created_at and stamps shipped_at on value date — **82 of 103 flows** carry the stamp, averaging a **2.98-day** booked-to-value-date lag inside a 2-4 day band; the 14 pending rows have none yet (a population definition, not a cleanup job). Money sits one layer down in INTEGER cents, where the dollar read is `amount_cents / 100.0`: 28 fee-billing statements split **21 paid for 66,443.00**, 6 open at 19,609.00, 1 void at 925.00, and settlement legs land on two rails — the domestic debit rail (16 legs / 37,364.00) and the cross-border wire rail (11 legs / 32,248.00). Integration is the third story: *five statements settle on both rails at once* — migration-era artifacts the dual-rail register exists to catch.",
    "Interview screens are census-then-denominator with an integration chaser. A loop opens with the **two-grain corridor census** — the Canadian home book runs 45 flows from just 8 clients (intensity 5.6) while the cross-border corridor runs 19 from 2 (9.5) — then escalates into the {rose:busted map} where the interviewer asks the denominator out loud (*'does a busted flow still count in your corridor base?'*), then into the statement coverage census — **21 exact, 1 partial** (4,000 of 6,148 settled), **6 never-settled worth 15,217** — where membership is rail evidence, not the status column. The anomaly pair is the famous follow-up: a void statement that still drew its 925.00 leg (#11), and a paid-status statement at 1,756.00 with zero legs at all (#28). Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no BMO section — 0 tagged sql rows — so every topic slug and all thirty-two problems here are **theme-curated** to this kit's known screen shapes: corridor fate censuses, two-grain corridor folds, concentration ladders, aging buckets, coverage anti-joins and the cents-safe ledger spine. Do the topics in order, then run the six case studies on the live storefront db — built for spaced practice rather than one sitting: the {violet:corridor book census} the corridor desk opens every Monday with, the {emerald:dual-rail settlement register} finance control ships at every post-integration close, the {rose:coverage-model ladder} with its four-way-tie rank policy, the {amber:busted-flow map} the workout calendar keys off, the {sky:never-chased collections anti-join} behind the dunning batch, and the {violet:above-the-mean client bench} that sizes the concentration read. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every cent fold divide by 100.0 exactly once.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the corridor book refresh. A corridor analyst opens the flow dashboard before the 08:30 corridor call: did overnight bookings land, did any flow get a value-date stamp without a confirmation, does the one-pass status census reconcile — 52 settled + 30 in flight + 14 awaiting + 7 busted = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the booked-to-value-date lag drifts off the **2.98-day** norm, the confirmation queue gets pulled before the cross-border desk's weekly read ships.",
    "**11:30 —** Midday is the concentration and integration read. The commercial-lending pod wants the client ladder with the four-way tie at 4 flows handled honestly — shared rungs, named policy; the corridor desk wants intensity re-cut — **19 flows from 2 clients** on the cross-border book versus 45-from-8 at home; and the migration steering call wants the dual-rail register refreshed — five statements settling on {rose:both rails at once} is five chase items, each one a systems artifact until proven otherwise. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the steering-committee argument*.",
    "**15:30 —** The afternoon tilts toward the close. The statement anti-join refreshes first — **6 never-settled statements worth 15,217** — before any client gets a dunning call; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the chase draft; and the anomaly pair gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status cycle with zero legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Corridor book mix", what: "Booked flow value per corridor — Canadian home book 45 flows / 15,089.23, US middle-market 37 / 11,605.45, cross-border corridor 19 / 7,286.16, trade-finance pilot 2 / 852.44. The footprint view every corridor call starts from." },
    { name: "In-flight rate", what: "Flows with a value-date stamp ÷ all flows booked: 82 of 103 (79.6%). The top-of-funnel number the corridor desk reads every Monday — the 14 awaiting-confirmation rows are 'not yet', never a silent zero." },
    { name: "Value-date lag", what: "Booking to value date (created_at → shipped_at) over stamped flows only: 2.98-day average, range 2-4. The population definition ships with the number — unstamped flows have no cycle yet and must not dilute it." },
    { name: "Busted share", what: "Cancelled share of booked flows: 7 of 103 (6.8%), sliced by corridor — US middle-market 8.1%, Canadian home 6.7%, cross-border 5.3%. The map that drives the re-confirmation and workout calendars." },
    { name: "Client concentration", what: "Share of the book from clients spending 3,000-plus lifetime: 63.5% (71.2% above 2,000); the top relationship runs 24 flows for 7,262.35. The number that staffs the coverage model and sizes the mid-market pod." },
    { name: "Statement coverage", what: "Billed versus settled: 21 exact (65,612.00), 1 partial (4,000 of 6,148), 6 never-settled worth 15,217.00 — with the settlement clock beside it: 28.4-day average, fastest 13, slowest 84, against flat 30-day terms." },
    { name: "Dual-rail register", what: "Settlement legs per rail — card 16 / 37,364.00, wire 11 / 32,248.00 — cross-footed against statements covered: 27 legs over 22 statements, and exactly 5 cycles settle on BOTH rails. The migration-era artifact list finance control chases at every close." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181,080.00 against 181,080.00, delta 0 across 80 entries. A nonzero delta pages the close, not a footnote." },
  ],

  topics: [
    {
      name: "Corridor fate counts",
      why: "Every BMO corridor screen opens with the fate census: flows booked, stamped in flight, settled to final. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight flow 'settled' — 30 versus 52 on this db.",
      slugs: ["funnel-step-conversion", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "prepayment-detection", "top-percentile-fraud", "suspicious-bank-account-transactions", "settlement-fails-aging"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Flows and clients are different grains of the same join, and every census here reports both: the Canadian home book runs 45 flows from 8 clients while the cross-border corridor runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "portfolio-concentration-hhi"],
    },
    {
      name: "Joining clients to flows",
      why: "Clients carry corridor and created_at; flows inherit them through joins, and the join type decides who survives. A flow without a client row is corruption; a client without flows is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "scd2-build", "dormant-reactivation", "winback-recovery"],
    },
    {
      name: "Concentration ladders",
      why: "Client concentration is rank-window reporting where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5 flows, then a four-way tie at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer relationships, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "premier-league-table-ranking", "chargeback-rate-ranking", "vintage-default-curves", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Exposure banding with CASE",
      why: "Client tiers and watch buckets are CASE-classified — mid-market, corporate, specialty — with fixed edges the credit memo publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the exposure report, and a reordered WHEN quietly re-bands the book.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "structuring-detection", "fifo-inventory-cogs", "delinquency-buckets", "expected-credit-loss", "fx-exposure-report", "credit-utilization-bands", "risk-based-pricing"],
    },
    {
      name: "Aging & delinquency buckets",
      why: "The commercial book ages in buckets — current, 1-30, 31-60, 90-plus — and every workout conversation starts from a bucketed fold. Bucket edges are CASE arms or interval joins, and the bucket a flow lands in is only as honest as the boundary math.",
      slugs: ["calculate-orders-within-each-interval", "spend-histogram", "transaction-velocity", "point-in-time-asof", "countries-you-can-safely-invest-in", "ar-aging-schedule"],
    },
    {
      name: "Coverage anti-joins",
      why: "Settled is not billed — the chase list is a LEFT-join anti-join where the interesting rows are statements with no settlement leg at all (6 worth 15,217 here). Anti-join membership is evidence, and a NULL poisoning a NOT IN is the classic way an honest watchlist silently empties.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "find-churn-risk-customers", "wash-trade-detection", "keep-latest-dedupe"],
    },
    {
      name: "Ledger discipline & trial balance",
      why: "Every close ships with a proof: debits against credits, delta zero — 181,080 against 181,080 across 80 entries on this db. Rollforwards, reconciliation folds and gap detection are the queries that make the books provable, and the integration makes them non-optional.",
      slugs: ["gl-reconciliation", "balance-rollforward", "journal-gap-detection", "delinquency-roll-rates", "trial-balance-check"],
    },
    {
      name: "Value-date clocks & LAG deltas",
      why: "The 14-month flow spine (2024-01 to 2025-02) is the corridor call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["average-time-of-process-per-machine", "biggest-window-between-events", "second-day-confirmation", "late-arriving-restatement", "loan-amortization-schedule"],
    },
    {
      name: "Cents-safe statement folds",
      why: "Billed is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the corridor world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from a status column that lies.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "account-balance", "daily-balance-interest"],
    },
  ],

  theory: [
    {
      id: "bmo-t1",
      q: "Your corridor report joins clients to flows. When do you INNER and when do you LEFT — and what silently breaks if you filter a flow column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A corridor revenue report joins flows to clients: a flow with no client row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from clients: the clients with no flows ARE the answer, arriving with NULL flow columns — though on this db the anti-join returns a confident zero (all 16 clients appear in the flow table somewhere), and proving that zero is itself the analyst's job. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload client row — the LEFT quietly became an INNER and the whitespace vanished; the fix is moving the predicate into ON or an outer query. The integration angle sharpens it: records migrated off the acquired book that join on the wrong key look like clients — key choice is a business statement, not syntax. Say which row survives and why before you write the join.",
      tag: "joins",
    },
    {
      id: "bmo-t2",
      q: "The client ladder runs 24, 17, 14, 13, 5 flows, then four clients tied at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — the four-way tie consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose relationship manager gets the credit. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer clients (RANK or DENSE_RANK), or an explicitly named tie-breaker such as created_at then id — and writing it in the query comment. The same discipline extends to corridor shares: PARTITION BY the corridor, compute each client's share of ITS book, and never compare shares across corridors without saying the denominators differ.",
      tag: "windows",
    },
    {
      id: "bmo-t3",
      q: "The census shows 103 flows and 16 clients; the Canadian home book shows 45 flows and 8 clients. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts flow rows after the join — one row per flow, so a client with 24 flows contributes 24. COUNT(DISTINCT customer_id) folds those rows back to clients — the home book's 45 flows collapse to 8 logos, while the cross-border corridor's 19 collapse to 2. Neither is wrong: flows measure corridor load, clients measure coverage — and the ratio (5.6 flows per client at home versus 9.5 on the cross-border book) is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for instrument legs and COUNT(*) silently counts legs, not flows — 251 of them, 2.44 per flow. On a commercial book the same trap hides in settlements: 27 payment legs over 22 statements, and a naive COUNT(*) calls it 27 settled statements when 5 of those statements own two legs each. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "bmo-t4",
      q: "shipped_at is NULL until a flow value-dates. What is your policy for the booked-to-value-date report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped flows have a lag, so the report measures booking to value date for the 82 of 103 flows that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL flows returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting-confirmation plus 7 busted flows, which is a feature, not a bug — pending rows are 'not yet', not missing data. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average: that invents same-day value dates for flows that have not confirmed, and on a cross-border corridor a fabricated value date is a settlement lie. A report whose WHERE clause is doing definitional work without saying so is exactly what a BMO reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "bmo-t5",
      q: "The corridor review wants settled value per corridor for corridors carrying at least ten flows. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, awaiting and busted rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-flow floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a corridor line and an error, and between a threshold applied to flows versus to dollars. The strong answer places every filter by asking: is this a fact about one flow, or about a corridor? Integration-era reporting makes it worse: staging tables rebuilt from two source systems carry duplicate legs, so the dedupe-by-evidence filter is definitional work — it belongs in a CTE with a comment, not scattered across clauses.",
      tag: "pipeline",
    },
    {
      id: "bmo-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 flows always produce a mean (338.19 on this book). On filtered staging tables — one corridor, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each flow to ITS client's average ticket) re-runs per outer row and answers a different question at a different cost. The BMO flavor is the benchmark chain: flows above the 338.19 mean, clients above the platform mean of 6.44 flows (exactly four logos clear it), statements above the 3,106.32 average billing — each a two-stage fold whose every stage's population must be stated. The strong candidate gives the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "bmo-t7",
      q: "The corridor trend buckets flows by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the value-date clock?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the corridor trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's flows, and quarter-end is exactly when cross-border corridors bulk-book. The clock: julianday(shipped_at) - julianday(created_at) is the value-date lag, averaging 2.98 days on the 82 stamped rows — and on a month-ordered spine the first row's LAG is NULL by definition, the baseline, never a zero to coalesce. One more: settlement-clock math (28.4 days average, fastest 13, slowest 84) must anchor on the book's own dates, not wallclock, or every aging read drifts a little more every day it runs. Date discipline is corridor discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "bmo-t8",
      q: "Finance says a statement is 'paid' but the payments table has no legs for it. Walk me through the reconciliation query you write first — and the integration check this bank adds on top.",
      a: "First the anti-join: statements LEFT JOIN settlement legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The integration check is the dual-rail register: 27 legs cover 22 statements, and five statements settle on BOTH rails at once — migration-era artifacts a payments self-join catches in one pass. The money rule: finance tables carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent row. Reconciliation culture here: coverage must read 21 exact / 1 partial (4,000 of 6,148) / 6 never, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "bmo-t9",
      q: "The integration pack wants a 3-month moving average of booked value beside every month on the corridor trend. How do you frame the window, and where do ROWS and RANGE disagree?",
      a: "AVG(booked) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) averages each month with its two predecessors — a fixed three-row window that always spans the same quarter of spine. ROWS counts physical rows, so the frame width is constant even when values tie. RANGE interprets offsets as VALUES, not rows: on a text month key like '2024-01' a RANGE offset errors outright, and on numeric keys a tie pulls every peer into the frame at once. The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING to CURRENT ROW — ties enter the running aggregate together — which is why the house rule is: never ship a window without writing the frame out loud. On this trend the 3-month smooth is what separates the July trough at 1,193.86 from the August rebound at 2,352.07 without letting one noisy month redraw the corridor story.",
      tag: "windows",
    },
    {
      id: "bmo-t10",
      q: "The close pack stacks settled flows, in-flight flows and a grand total into one result set. Walk me through building it so no row silently vanishes.",
      a: "Three moves. First, each branch is a SELECT with the same column shapes — status label, flow count, booked value — because set operations align columns positionally, not by name. Second, stack with UNION ALL and state in a comment why duplicates are impossible (each branch filters a disjoint status, so the same row can never appear twice); plain UNION would dedup byte-identical rows and delete a legitimate one — a board that loses a client's total with no error anywhere. Third, append the total row as its own SELECT — 103 flows, 34,833.28 — so the branches can be reconciled against it: 52 + 30 + 14 + 7 = 103 by construction. The reviewer's test is whether you can say which rows each branch keeps and why the dedup would be safe — not whether you remember the keyword.",
      tag: "sets",
    },
    {
      id: "bmo-t11",
      q: "The trade-finance pilot line prints NULL on the wire-rail column while other corridors print real zeros. Defend the difference — when is each the right print?",
      a: "SUM over a set with no rows returns NULL — the engine's way of saying nothing was measured — while COUNT over the same set returns 0, and an ELSE arm that fires also prints 0. The distinction is information: the pilot line's settlement legs may all ride one rail, so the other rail's cell is genuinely empty, and NULL is the honest print; a corridor with a measured zero on some branch computed something. The rule finance control holds: no silent zero-fills — IFNULL every empty arm or none, say which in the title, and never let one column's NULLs coalesce while another's print raw, because the board then compares a filled row against an unfilled one. The failure mode being policed is the deck that reads 'NULL means broken' and zero-fills everything, erasing the difference between an empty rail and a measured zero.",
      tag: "nulls",
    },
    {
      id: "bmo-t12",
      q: "Derived tables, correlated subqueries and window functions can all answer 'how does this flow compare to its client's other flows'. When do you reach for each?",
      a: "The derived table (a folded CTE: flows per client, then joined back) computes the comparison once per group — cheapest, and the right default when the baseline is a per-group aggregate like each client's average ticket. The correlated subquery re-runs per outer row — same answer, worse cost, but natural when the comparison needs the outer row's own columns inline (this flow versus ITS client's mean). The window function computes over the row set without collapsing it — right when the row must survive alongside its baseline (flow, its client's average, and the gap, one pass). On this book the concrete tell: a 'flows above client average' list built as a derived join and built as a window agree row for row; built correlated, they agree but run per-row — and only the window version keeps all 103 rows in the output for the drill-down. Say the cost and the surviving grain out loud; that is the answer being graded.",
      tag: "subqueries",
    },
    {
      id: "bmo-t13",
      q: "Five statements settle on both rails at once. How do you find them with a self-join, and what stops every pair printing twice?",
      a: "Two legs on one statement are two rows in the payments table, so the pairing is a self-join: payments a JOIN payments b ON a.invoice_id = b.invoice_id — the pairing key is the statement reference, not the row id. Canonicalize with a.id < b.id so each pair prints once (without it, every pair swaps aliases and prints twice); then WHERE a.method <> b.method keeps only cross-rail pairs — the dual-rail signature. The result is the migration artifact list: five statements, each with a card leg and a wire leg, the two INTEGER cents reads added and folded by /100.0 once. The discipline generalizes: any 'pairs within one table' report (duplicate charges, same-day legs) uses the same three ingredients — matching key, strict inequality to canonicalize, and a stated difference predicate. One leg cannot pair with itself: a.id < b.id is false for the row against its own alias, which is the guard doing its job.",
      tag: "joins",
    },
    {
      id: "bmo-t14",
      q: "A staging table rebuilt from two source systems feeds the chase list, and its NOT IN query returns zero rows. Walk me through the diagnosis and the rewrite.",
      a: "First suspect the NULL. NOT IN compares every outer row against a materialized list, and x NOT IN (…) evaluates to UNKNOWN the moment one NULL sits in that list — every comparison fails, the result empties, and nothing errors. Post-acquisition staging tables are exactly where NULLs sneak in: two source systems, two null conventions, one merge script. The rewrite: NOT EXISTS (SELECT 1 FROM legs l WHERE l.invoice_id = i.id) — correlated, NULL-immune, and it short-circuits on the first match instead of materializing the list. The sanity check that catches it in review: run the NOT IN version against the clean core table, where every id is populated — if it returns rows there and zero on staging, the staging column has NULLs, and the fix is a NULL-guard or the NOT EXISTS form. Empty chase lists are how dunning silently stops during a migration; the reviewer grades whether your zero was proven or assumed.",
      tag: "quality",
    },
    {
      id: "bmo-t15",
      q: "The settlement clock reads 28.4 days against flat 30-day terms. Rebuild that number for me — every decision that keeps it honest.",
      a: "Population first: a clock measures a completed cycle, so the population is statements with at least one settlement leg — the only rows carrying both an issue date and a settled date; the 6 never-settled statements have no completion yet and must not be assumed to 30 days. Then the fold: julianday(settled) - julianday(issued) per statement — one fold per statement, not per leg, or the five dual-rail cycles double-count; AVG over the statement-grain result, ROUND at the display edge. Band the result beside the mean — fastest 13, slowest 84 on this book — because the back office acts on the tail, and quote the 30-day terms line so the 1.6-day beat reads as performance, not drift. And never IFNULL a missing completion to the term value: that fabricates on-time settlements for statements that never settled, which on a migration book is a misstatement, not a rounding choice.",
      tag: "dates",
    },
    {
      id: "bmo-t16",
      q: "The client master arrives from the acquisition merge with case-broken and padded names — 'BMO' as 'bmo ', 'Northern Grain' as 'NORTHERN GRAIN'. What breaks downstream, and what is the hygiene pass?",
      a: "Joins and GROUP BY are byte-exact: 'Northern Grain ' and 'Northern Grain' are two clients, so corridor folds split one relationship into two and the two-grain census (45 flows from 8 clients) quietly miscounts coverage — exactly the failure an integration cannot afford on the acquired book. The hygiene pass runs before any fold: TRIM the padding, UPPER or LOWER into a canonical comparison key (keep the display column human-cased — a statement to a client reads 'Northern Grain', not 'NORTHERN GRAIN'), and collapse internal whitespace. Then verify with a census: GROUP BY the canonical key HAVING COUNT(DISTINCT original) > 1 to name every merged pair, and re-run the corridor census to confirm client counts snap back to 16. The interview point: string functions are not cosmetics here — they are join-key integrity, and the fold is only as good as the keys it groups on.",
      tag: "strings",
    },
    {
      id: "bmo-t17",
      q: "The coverage model tiers clients into quartiles by booked value — but peers tied at the edge keep landing in different tiers. What is happening and what do you ship instead?",
      a: "NTILE(4) is position-based: it sorts the 16 clients and deals four bands of four rows regardless of ties, so peers with identical books split across the tier edge — the four-way tie at 4 flows is the live example, with three clients in band two and one in band three. If the business wants value-equal tiers where peers move together, that is a RANK or DENSE_RANK cut with a stated boundary ('tier two starts at 1,000'), or PERCENT_RANK to publish each client's relative position and let the tier edges be a policy, not a row count. If the coverage model genuinely wants equal-size pods — four officers each carrying four relationships — NTILE is correct and the tie split is a feature to explain. The answer being graded: know that quartiles-by-rows and tiers-by-value are different products, and ask which one the coverage model means before writing either.",
      tag: "windows",
    },
    {
      id: "bmo-t18",
      q: "Make every status census reconcile to 103 by construction. What does that identity look like in SQL, and why does the one-pass version beat four queries?",
      a: "The identity: COUNT(*) FILTER (WHERE status = 'delivered') + FILTER('shipped') + FILTER('pending') + FILTER('cancelled') = COUNT(*) — every row carries exactly one status, so the branches are a partition and the sum is an identity, not a coincidence. Written as one SELECT over orders, the census prints 52, 30, 14, 7 and 103 on the same row, and any future status value that is not one of the four shows up as a gap between the branch sum and COUNT(*) — the identity doubles as a data-quality tripwire. Four separate queries produce four numbers measured at four moments with four chances to drift, and nothing forces them to foot. The discipline generalizes: a corridor census joins to customers and partitions by region (Canadian home 45, US middle-market 37, cross-border 19, pilot line 2 — footing to 103 again), and the same one-pass FILTER shape works there. The reviewer wants to hear 'the branches partition the population' — that sentence is the whole lesson.",
      tag: "aggregation",
    },
    {
      id: "bmo-t19",
      q: "'Give me the biggest statement' and 'give me each client's biggest flow' — how do you write argmax queries whose answers survive review?",
      a: "Two shapes, one rule: the identity must ship with the value. Book-wide argmax sorts and cuts — ORDER BY total DESC, id ASC LIMIT 1 returns the 1,088.44 flow, with the secondary key making the choice deterministic even if a tie ever appears. Per-group argmax stages the fold — a CTE computing each client's max, then matching rows back to it (or a window: MAX(total) OVER (PARTITION BY customer_id) beside the row) — because folding and identifying in one query picks an arbitrary survivor on ties. What review checks: the tie policy is named (first by date? lowest id? alphabetically first?), the LIMIT cut is downstream of a total ORDER BY — a dashboard card with LIMIT 1 and no ORDER BY ships an arbitrary row — and the output carries the identity columns, not just the number. MIN or MAX alone answers 'how much'; the desk asked 'which one' — and on a book where the anchor relationship spans 25.47 to 1,088.44, the identity is the story.",
      tag: "windows",
    },
    {
      id: "bmo-t20",
      q: "The month-close pack re-runs the same corridor folds every morning, but a colleague's version takes minutes. Walk me through making it fast.",
      a: "Start with EXPLAIN QUERY PLAN: if the plan says SCAN on orders or customers where a SEEK is possible, the predicate is non-sargable. The usual culprits are wrappers on the indexed column — STRFTIME('%Y-%m', created_at) = '2024-01', CAST(created_at AS DATE) = …, UPPER(region) = 'US' — each forcing a per-row computation that the index cannot serve. The rewrites are range predicates on the bare column (>= '2024-01-01' AND < '2024-02-01') and normalized keys stored once (a canonical region column) rather than computed per query. Join order follows the filter: cut statuses and dates first, then join to customers — the engine usually does this, but only if the predicates are sargable enough for it to see the selectivity. On a 103-row training db this is pedagogy; on the production corridor book it is the difference between a call that starts at 08:30 and one that pages someone. Say 'the index works when the column is bare' — that is the sentence that passes.",
      tag: "indexes",
    },
    {
      id: "bmo-t21",
      q: "The ladder export re-runs nightly and reviewers noticed the four tied clients swap positions between runs. How do you make a query's output reproducible?",
      a: "Every ORDER BY must be a total order. Ties on the primary key (flows DESC) leave the engine free to emit tied rows in any order — plans change, parallelism changes, and the export flips. Append deterministic secondary keys until the ordering is unique: flows DESC, client, id. The same discipline applies to the window functions that feed the export: RANK() OVER (ORDER BY flows DESC) is stable in value but the row sequence inside the tie block is not, so the outer sort carries the tie-breaker too. LIMIT cuts only mean something downstream of a total ORDER BY — a LIMIT 1 card with no sort is an unspecified row. The policy lives in a comment: 'tie order = alphabetical by client, chosen by the coverage desk'. Reproducibility is not pedantry — it is what lets two reviewers diff two runs and see policy, not noise.",
      tag: "pipeline",
    },
    {
      id: "bmo-t22",
      q: "Where does COALESCE belong in the corridor reads — and where does it belong nowhere?",
      a: "COALESCE is a display-edge and semantics-edge tool, not a bandage. Legitimate placements: folding an empty aggregate for a board that has decided zero-fill (COALESCE(SUM(…), 0) with the choice stated), supplying a fallback for an optional attribute (a client's secondary contact), and the anti-join print where you show NULL as 'no legs yet'. Placements that lie: IFNULL-ing a missing settlement date to the 30-day term invents on-time payments for statements that never settled; IFNULL-ing a NULL anti-join payload to a sentinel that then passes a status filter resurrects rows the LEFT JOIN correctly emptied; and COALESCE inside a JOIN key masks the very mismatch the key would have exposed — the exact failure mode of a two-source-system merge. The reviewer's heuristic: ask what the NULL meant. If it meant 'nothing measured' and the report promises a number, coalesce deliberately and label it; if it meant 'the join found nothing', the NULL is the finding — print it, don't bury it.",
      tag: "nulls",
    },
    {
      id: "bmo-t23",
      q: "The close ships only when four proofs pass. Name the four checks you run before the pack goes out, and what each would catch.",
      a: "One — the status census identity: 52 settled + 30 in-flight + 14 awaiting + 7 busted = 103 booked; a gap means a new status value arrived or a filter drifted, and the corridor board is mis-counting before anyone opens it. Two — the cents fold: every finance read divides INTEGER cents by 100.0 exactly once; an odd-cent statement printing round dollars means a missing .0 truncated somewhere upstream. Three — the coverage split: 21 exact, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217.00, with the anomaly pair walked by hand — void-but-settled #11 at 925.00 and paid-status #28 at 1,756.00 with zero legs; a status column that disagrees with rail evidence is exactly what this check exists to catch. Four — the ledger tie-out: 181,080.00 debits against 181,080.00 credits across 80 entries, delta zero. Each proof is one query, each catches a different class of lie — census drift, unit drift, evidence drift, book drift — and the pack ships only at four greens.",
      tag: "quality",
    },
    {
      id: "bmo-t24",
      q: "Every rate the desk quotes gets challenged on its denominator. Walk me through the denominator decisions behind in-flight rate, kept share and intensity.",
      a: "In-flight rate is 82 stamped over ALL 103 booked flows — the 14 awaiting stay in, because 'not yet value-dated' is exactly what the metric watches; 79.6% is the honest read and 82/89 drops the pipeline. Kept share per corridor (Canadian home 53.3) is settled over that corridor's own total, rounded last — the denominator is the corridor, not the platform, and the two reads (50.5 book-wide versus 53.3 home-book) differ by construction. Intensity is flows per client — 45 from 8 is 5.6 — and the denominator decision is the grain: flows over clients, never legs over clients (251 legs would read 31.4 and mean nothing about coverage), and never legs over statements (27 legs is not 27 settled statements — 5 statements carry two legs each). The discipline that passes review: name the population before the ratio, keep numerator and denominator from the same query pass, and print the denominator beside the rate. A percentage without its base is not a KPI; it is a rumor with a percent sign.",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "bmo-mcq-1",
      prompt: "A flow row's status reads 'delivered'. In this kit's BMO stage map, what happened?",
      choices: ["Settled to final — the flow completed and counts as kept", "In flight — value-dated, not yet settled", "Busted — cancelled before confirmation", "Awaiting confirmation — no value date yet"],
      answer: 0,
      why: "The stage map is fixed: delivered = settled to final (52 of 103 flows, 50.5%). It is the only status where the flow has actually completed.",
      notes: [
        { choice: 1, why: "In flight is 'shipped' — 30 flows value-dated but not settled. Calling them settled inflates the kept rate before a single flow finalizes." },
        { choice: 3, why: "Awaiting confirmation is 'pending' — 14 flows with no shipped_at yet. Pending is not busted and not settled; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "bmo-mcq-2",
      prompt: "Value-date lag is stamped_at − booked_at over which population? The db holds 82 stamped, 14 awaiting and 7 busted of 103 booked.",
      choices: ["Stamped + busted only (82/89)", "All flows booked (82/103 = 79.6%)", "Settled-to-final flows only (52/82)", "Distinct clients (82/16)"],
      answer: 1,
      why: "The house definition: the in-flight rate is stamped ÷ ALL flows booked — awaiting-confirmation rows stay in the denominator because 'not yet value-dated' is exactly what the metric watches. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 awaiting inflates the rate by deleting the population still in the pipeline — the rows the metric exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps — settled-to-final is completion, shipped_at is value date. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "bmo-mcq-3",
      prompt: "The Canadian home book carries 45 flows from 8 clients. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts flow rows (45); COUNT(DISTINCT customer_id) folds repeats back to clients (8). The gap between them — 5.6 flows per client — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every flow has a client. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts corridor buckets, not clients — a third grain nobody asked for. The census is flows AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "bmo-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to busted flows only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the busted share truncates toward 0 and every corridor reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the busted map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-5",
      prompt: "Keep only corridors carrying at least 10 flows. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY corridor HAVING COUNT(*) >= 10", "WHERE flows >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A flow-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded books — 45, 37, 19 flows — clear a 10-flow corridor bar; the 2-flow pilot line drops.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'flows' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-6",
      prompt: "The client ladder runs 24, 17, 14, 13, 5 flows, then FOUR clients tied at 4. Under RANK, what rank do the two 3-flow clients carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-flow clients share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-7",
      prompt: "The monthly spine walk prints each month's delta vs the prior month. A teammate wrote LEAD(arr_booked) OVER (ORDER BY month) and every delta's sign is flipped. Why?",
      choices: ["LEAD and LAG are aliases — the sign flip is a rounding artifact", "LEAD fetches the NEXT row's value, so each row is compared against its successor, not its predecessor", "The spine must be ordered DESC for deltas to work", "LEAD cannot be used with an ORDER BY in OVER"],
      answer: 1,
      why: "LAG(arr_booked) OVER (ORDER BY month) fetches the previous bucket so each delta is row-local; LEAD looks forward, so every step delta prints with the opposite sign — a growth month reads as a decline. The spine's 1,158.21 August jump would print as a drop.",
      notes: [
        { choice: 0, why: "They are distinct functions fetching opposite neighbors. The consistent sign flip is the fingerprint of looking the wrong way, not noise." },
        { choice: 2, why: "Reordering the spine changes which row is 'previous' but the comparison is still forward-looking — the walk stays wrong, just mirrored." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-8",
      prompt: "A junior counts the payments table and reports '27 settled statements'. The book holds 28 statements. What actually happened?",
      choices: ["27 is correct — one statement is void and never settles", "The count is of payment LEGS, not statements — 27 legs cover 22 distinct statements, and 5 of them carry two legs each (the dual-rail cycles)", "The payments table is missing one statement's rows — a data loss incident", "COUNT(*) over payments excludes statements settled on the wire rail"],
      answer: 1,
      why: "COUNT(*) over payments counts legs at leg grain: 27 legs over 22 statements, with five dual-rail cycles (#1, #5, #12, #19, #22) carrying two legs each. The statement grain needs COUNT(DISTINCT invoice_id) — and the 5-versus-22 gap IS the integration register.",
      notes: [
        { choice: 0, why: "The void statement (#11) did settle — it drew a 925.00 leg. 'Void never settles' is the status column lying about evidence, and it is irrelevant to this grain confusion anyway." },
        { choice: 2, why: "Nothing is missing: 27 legs is the correct row count. The error is calling legs statements — a fan-out read, not an ETL loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "bmo-mcq-9",
      prompt: "A staging-table chase list uses client_id NOT IN (SELECT customer_id FROM flows WHERE status = 'busted') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the chase list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded — especially in staging tables rebuilt from two source systems.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every flow carries a client id. But staging tables are exactly where NULLs sneak in during a migration, and empty chase lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "bmo-mcq-10",
      prompt: "A dashboard walks booked value flow by flow: SUM(total) OVER (ORDER BY created_at). Two flows share a created_at second, and the cumulative 'jumps two flows at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at flow grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "bmo-mcq-11",
      prompt: "The Monday corridor call's status census must print settled, in-flight, awaiting and busted in ONE pass. Which construction reconciles to 103 by construction?",
      choices: ["Four separate COUNT queries pasted into the deck", "GROUP BY status, four rows, no total", "COUNT(*) FILTER (WHERE status = …) per branch in a single SELECT over all 103 flows", "Four subqueries joined on the status text"],
      answer: 2,
      why: "One scan, four conditional counts: every branch partitions the same 103-row population — 52 + 30 + 14 + 7 = 103 by construction. That identity is what lets the corridor call start on time; a branch that breaks it is the day's first incident.",
      notes: [
        { choice: 0, why: "Four sequential queries are four ways to drift — one where-clause edit between runs and the deck no longer foots. The one-pass version cannot disagree with itself." },
        { choice: 1, why: "GROUP BY status prints only statuses that have rows — an empty arm vanishes instead of printing zero, and there is no total row to reconcile against. Holes in the census are how 103 quietly becomes 102." },
      ],
      difficulty: "easy",
    },
    {
      id: "bmo-mcq-12",
      prompt: "A junior runs SELECT DISTINCT region FROM customers and reports '16 corridors'. What did the query actually return?",
      choices: ["16 rows — DISTINCT was applied to the wrong grain", "4 rows, one per corridor bucket (EU / APAC / US / LATAM) — DISTINCT region folds the 16 clients to their corridors", "1 row — every client shares a corridor", "An error — DISTINCT requires GROUP BY"],
      answer: 1,
      why: "DISTINCT region deduplicates the corridor column: the 16 clients fold to their 4 corridor buckets. The corridor book reads 4 lines, not 16 — and the analyst should be able to say which column they deduplicated and at what grain the result lands.",
      notes: [
        { choice: 0, why: "DISTINCT region cannot return 16 rows unless every client is its own corridor — which would make the column a disguised client key. The book carries 4 buckets." },
        { choice: 2, why: "Four buckets exist by construction — the census reads EU, APAC, US, LATAM. A one-row result would mean the column was collapsed further, not deduplicated." },
      ],
      difficulty: "easy",
    },
    {
      id: "bmo-mcq-13",
      prompt: "The corridor census joins orders to order_items for instrument legs and COUNT(*) jumps from 103 to 251. Diagnosis?",
      choices: ["The join fanned out: 251 is legs, not flows — 2.44 legs per flow on average", "The join duplicated the client rows", "148 flows are orphans with no client", "COUNT(*) double-counts settled flows after any join"],
      answer: 0,
      why: "order_items sits at leg grain — 251 rows over 103 flows — so the join multiplies every flow by its leg count. COUNT(*) after a fan-out counts the finest grain in the query, and 'one row per what?' is the question that catches it before the corridor call does.",
      notes: [
        { choice: 1, why: "Customers is the one-side table; joining orders to customers never fans out. The multiplication came from the child table, not the parent." },
        { choice: 2, why: "The anti-join on clients returns a confident zero — every flow carries a client. 251 is honest leg grain, not corruption." },
      ],
      difficulty: "easy",
    },
    {
      id: "bmo-mcq-14",
      prompt: "The settlement clock averages 28.4 days (fastest 13, slowest 84) against flat 30-day terms. Over which population must that average be computed?",
      choices: ["All 28 statements, never-settled ones counted as 30-day terms", "Statements that carry at least one settlement leg — the only rows with completion evidence", "Paid-status statements only, per the status column", "Only the 6 never-settled statements — the population the clock watches"],
      answer: 1,
      why: "A clock measures a completed cycle, and completion is rail evidence: only statements with at least one settlement leg have both an issue date and a settled date. The 6 never-settled have no completion yet — counting them at a assumed 30 days invents completions that never happened.",
      notes: [
        { choice: 0, why: "Assuming 30 days for never-settled statements fabricates the exact number the clock exists to question — the point of 28.4 versus 30 is measured, not assumed." },
        { choice: 2, why: "The status column lies on this book — paid-status #28 has zero legs and void #11 has one. Membership in the clock population is leg evidence, not labels." },
      ],
      difficulty: "easy",
    },
    {
      id: "bmo-mcq-15",
      prompt: "The migration steering call wants each dual-rail statement's legs shown as one rail roster — 'card,wire' — beside the statement id. Which fold delivers it?",
      choices: ["GROUP_CONCAT(p.method) grouped by invoice_id — one row per statement", "CONCAT over the whole payments table — one row for the book", "MAX(p.method) per statement — the roster collapses to the lexicographically largest rail", "GROUP_CONCAT(invoice_id) — one row per leg"],
      answer: 0,
      why: "GROUP_CONCAT aggregates text across the group's rows: grouped by statement, it renders each cycle's rail mix — card,wire — on one row. That roster beside the id is the register's evidence column, and it makes the five dual-rail cycles readable at a glance.",
      notes: [
        { choice: 1, why: "Without the GROUP BY the fold runs over the whole table — one roster for all 27 legs. The group is what makes it a per-statement read." },
        { choice: 2, why: "MAX keeps one value, not a roster — 'wire' for every statement it touches tells you nothing about whether a card leg also exists." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-16",
      prompt: "An exposure board bands flows: WHEN total < 1000 THEN 'mid-market' comes first, WHEN total < 300 THEN 'small-ticket' comes second. What does a 250.00 flow print?",
      choices: ["'mid-market' — the first matching arm wins, so narrow bounds must precede wide ones", "'small-ticket' — SQLite picks the last matching arm", "Both labels print on two rows", "The query errors — arms overlap"],
      answer: 0,
      why: "CASE evaluates arms top-down and stops at the first match: 250 satisfies total < 1000 and never reaches the 'small-ticket' arm. Overlapping arms are not an error — they are a silent re-banding, and the fix is ordering arms from narrowest to widest before the credit memo publishes the bands.",
      notes: [
        { choice: 1, why: "No engine picks the last match — that behavior would make arm order meaningless. The whole discipline of CASE banding is that order IS the logic." },
        { choice: 3, why: "Overlaps compile and run fine; that is exactly what makes them dangerous. The memo prints a confident 'mid-market' for a small-ticket flow with no error anywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-17",
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
      id: "bmo-mcq-18",
      prompt: "Which set operation returns statements billed but never settled — invoice ids minus the ids that appear in the payments table?",
      choices: ["EXCEPT", "INTERSECT", "UNION", "UNION ALL"],
      answer: 0,
      why: "EXCEPT keeps left-side rows absent from the right: the 6 never-settled statements worth 15,217.00. INTERSECT answers the opposite question — statements a rail has touched; UNION stacks; UNION ALL stacks without dedup. Set algebra is membership, and membership is the chase list.",
      notes: [
        { choice: 1, why: "INTERSECT returns the settled side — 22 statements — which is the reconciliation list, not the dunning list. Grabbing the wrong side of the operation ships the wrong queue." },
        { choice: 3, why: "UNION ALL concatenates both id lists — 50 rows of mixed membership. No minus operation happened, so the 'never settled' claim is fiction." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-19",
      prompt: "NTILE(4) OVER (ORDER BY flows DESC) bands the 16-client ladder for the coverage model. What prints for the four clients tied at 4 flows?",
      choices: ["One shared band — NTILE respects value ties like RANK", "Four bands of exactly 4 rows, and the tie SPLITS across bands — NTILE counts rows, not values", "An error — NTILE cannot band ties", "Bands of 5/5/5/1 because ties force uneven splits"],
      answer: 1,
      why: "NTILE is position-based: 16 rows into 4 bands is 4/4/4/4 regardless of ties, and the descending ladder 24, 17, 14, 13, 5, 4, 4, 4, 4, 3, 3, … puts the tie block across a band edge. Peer relationships with identical flow counts land in different coverage tiers — a fact to state, not hide.",
      notes: [
        { choice: 0, why: "RANK and DENSE_RANK share rungs on ties; NTILE does not — it is a row counter with a quota. Confusing the two is how peer clients get split across coverage tiers." },
        { choice: 3, why: "NTILE distributes remainders across the LEADING bands (rows 17 would give 5/4/4/4), not the trailing ones — and 16 rows leaves no remainder at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-20",
      prompt: "The corridor trend was keyed STRFTIME('%m', created_at) and January 2024 merged into January 2025. What is the fix?",
      choices: ["Key on STRFTIME('%Y-%m', created_at) — year plus month, 14 distinct buckets", "CAST the month to INTEGER so 01 and 1 compare equal", "Add ORDER BY created_at — sorting fixes bucketing", "DISTINCT on the two-digit month"],
      answer: 0,
      why: "STRFTIME('%m', …) keeps only the two-digit month, so '01' appears twice on a 14-month spine and the two Januaries fold into one row — 3,731.97 + 1,669.50 printed as a single 5,401.47 bucket. Year-plus-month ('2024-01') is the key that keeps the trend at 14 distinct months.",
      notes: [
        { choice: 1, why: "The collision is a missing year, not a padding complaint — casting to INTEGER still merges the two Januaries, now as 1 vs 1." },
        { choice: 2, why: "ORDER BY arranges rows after they exist; it cannot split a bucket that already folded two years into one key." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-21",
      prompt: "The board quotes 'average ticket 338.19'. A colleague averages the 16 clients' per-client average tickets and reports 2,177.08. Who is wrong?",
      choices: ["The colleague — averaging averages is always invalid", "Neither — 338.19 is the flow-weighted average over 103 flows; 2,177.08 is the mean of 16 per-client books. Different grains, both correct, different claims", "The board — 338.19 double-counts repeat flows", "Both — the true average is the median of the spread"],
      answer: 1,
      why: "338.19 = 34,833.28 / 103: every flow weighs the same. 2,177.08 = 34,833.28 / 16: every client weighs the same. The anchor client's 24 flows count 24 times in the first and once in the second — neither number is wrong, but quoting one while meaning the other is how a board mis-sizes the coverage model.",
      notes: [
        { choice: 0, why: "Averaging averages IS invalid when the groups are unequal-sized and you claim the pooled mean — the point is that here nobody claimed the pooled mean. The colleague computed a client-grain metric, which is a legitimate different metric." },
        { choice: 2, why: "Repeat flows are the business — a commercial relationship books many flows, and the flow-weighted mean measures the average booking. It does not double-count anything; it weights by activity." },
      ],
      difficulty: "hard",
    },
    {
      id: "bmo-mcq-22",
      prompt: "The rail board adds LATAM's wire-leg total and the cell prints NULL, not 0. The pilot line settled on one rail only. Is the NULL wrong?",
      choices: ["Yes — every empty cell must coalesce to zero or the board breaks", "No — SUM over an empty set is NULL, and the honest read is 'no rows landed here'; a zero-fill is a separate, stated display choice", "Yes — NULL means the query failed and must be fixed", "No — NULL and zero are the same value in SQLite"],
      answer: 1,
      why: "SUM receives zero rows and returns NULL — that is the engine telling you 'nothing was measured', which is exactly true for the pilot line on the wire rail. Printing 0 claims 'legs landed and totaled zero', a different statement. Either print is defensible; silently conflating them is not.",
      notes: [
        { choice: 0, why: "Coalescing every NULL to zero erases the distinction between 'empty rail' and 'measured zero' — the board loses its honesty test. A zero-fill must be deliberate and labeled." },
        { choice: 2, why: "No failure occurred — the query ran, the arm matched nothing, the aggregate reported NULL. Treating NULL as an error state is how 'board is stale' tickets get filed instead of reviews." },
      ],
      difficulty: "hard",
    },
    {
      id: "bmo-mcq-23",
      prompt: "'Big tickets' runs total > (SELECT AVG(total) FROM orders) and lists 4 flows. The correlated version — total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — lists a different set. Why?",
      choices: ["The correlated fold compares each flow to ITS client's average ticket — a per-relationship outlier test, a different question than book-wide size", "The correlated subquery returns multiple rows and SQLite takes the first", "Correlated subqueries are not allowed on the orders table", "The uncorrelated version deduplicated statuses before averaging"],
      answer: 0,
      why: "The uncorrelated scalar is one number — the 338.19 book-wide average ticket. The correlated version re-runs per outer row and compares each flow to its own client's average, so a modest flow inside a small relationship can qualify while a big ticket inside a large one does not. Both queries are correct; only one answers the question asked.",
      notes: [
        { choice: 1, why: "A scalar subquery is 0-or-1 rows by contract; the correlated form re-computes per row, it does not return a set. The drift is semantic, not mechanical." },
        { choice: 3, why: "Neither version deduplicates — AVG is grain-blind to repeated statuses. The two lists differ because the denominators differ." },
      ],
      difficulty: "hard",
    },
    {
      id: "bmo-mcq-24",
      prompt: "The integration pack wants a 3-month moving average of booked value on the corridor trend: AVG(booked) OVER (ORDER BY month …). Which frame is correct?",
      choices: ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "RANGE BETWEEN 2 PRECEDING AND CURRENT ROW", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "No frame needed — AVG over an ORDER BY window is already moving"],
      answer: 0,
      why: "A trailing three-month average is a ROWS frame of fixed row count: 2 preceding rows plus the current one. RANGE interprets offsets as VALUES — on a text month key like '2024-01' it errors, and on numeric keys a tie pulls every peer into the frame at once. UNBOUNDED PRECEDING is the running total, a different board.",
      notes: [
        { choice: 1, why: "RANGE with a value offset means 'rows whose ORDER BY value is within 2 units' — meaningless across text month keys and a silent mis-window anywhere else." },
        { choice: 2, why: "UNBOUNDED PRECEDING makes every row's average span the whole history so far — that is the cumulative trend, not the 3-month smoothing the pack asked for." },
      ],
      difficulty: "hard",
    },
    {
      id: "bmo-mcq-25",
      prompt: "WHERE STRFTIME('%Y-%m', created_at) = '2024-01' full-scans the flow table. Which rewrite preserves an index on created_at?",
      choices: ["created_at >= '2024-01-01' AND created_at < '2024-02-01'", "created_at LIKE '%2024-01%'", "CAST(created_at AS DATE) BETWEEN '2024-01-01' AND '2024-01-31'", "UPPER(created_at) LIKE '2024-01%'"],
      answer: 0,
      why: "Wrapping the indexed column in STRFTIME makes the predicate non-sargable — the engine must compute the format for every row. A half-open range on the bare column lets the index seek straight to January: 2024-01-01 inclusive, 2024-02-01 exclusive, no lost last night.",
      notes: [
        { choice: 1, why: "A leading wildcard disables the same index seek — LIKE '%…' scans exactly like the STRFTIME version, only slower." },
        { choice: 2, why: "CAST wraps the column again — same non-sargable trap — and a BETWEEN up to '2024-01-31' drops January 31st's evening bookings, the classic month-end loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "bmo-mcq-26",
      prompt: "The ladder export re-runs nightly and the four 4-flow clients swap positions between runs. Ranks are stable — only their row order drifts. What fixes the export?",
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
      id: "bmo-mcq-27",
      prompt: "A dashboard card promises 'the biggest single flow' with SELECT customer_id, total FROM orders — no ORDER BY, just LIMIT 1. What ships?",
      choices: ["The anchor client's 1,088.44 flow — SQLite reads in id order, which is biggest-first", "An arbitrary flow — without ORDER BY, which row LIMIT returns is unspecified, so the card can silently change its story between runs", "An error — LIMIT requires ORDER BY", "The average ticket, rounded"],
      answer: 1,
      why: "LIMIT without a total ORDER BY is an unspecified row — the engine may return whatever its plan happens to produce, and the card's story changes when the plan does. Argmax needs ORDER BY total DESC (with a deterministic tie-breaker) before the LIMIT means anything.",
      notes: [
        { choice: 0, why: "Id order is not value order — the biggest flow does not necessarily carry the biggest id. The card looking right twice is luck, not logic." },
        { choice: 2, why: "LIMIT runs fine without ORDER BY; the failure is semantic, not syntactic. That is exactly what makes the silent row-swap dangerous." },
      ],
      difficulty: "easy",
    },
    {
      id: "bmo-mcq-28",
      prompt: "A board stack puts settled flows under in-flight flows in one layout, built with UNION. A reviewer says one client's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same client, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same client, same counts, no corridor or branch label — collapse into one, and the board loses a client with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-29",
      prompt: "The coverage census bands statements: exact when settled = billed, ELSE 'partial'. The 6 never-settled statements print 'partial'. What is the bug?",
      choices: ["The legs table double-counted those statements", "SUM over zero legs is NULL, the equality arm silently skips it, and the ELSE catches the fall-through — the NULL case must be tested first", "The cents were rounded before the comparison", "SQLite treats NULL as 0 in equality comparisons"],
      answer: 1,
      why: "A statement with no legs folds to SUM(NULL-set) = NULL, and NULL = billed is not true — the exact arm skips it and the ELSE mislabels it 'partial'. Order the arms from most-specific to least, with the NULL case first: WHEN settled IS NULL THEN 'none', then exact, then partial.",
      notes: [
        { choice: 1, why: "No legs means no rows in the fold — nothing to double-count. The bug is three-valued logic in the CASE, not fan-out." },
        { choice: 3, why: "SQLite never equates NULL with 0 — that is precisely why the exact arm skipped. If it did, the ELSE would never have fired." },
      ],
      difficulty: "medium",
    },
    {
      id: "bmo-mcq-30",
      prompt: "Which set operation returns statements settled on BOTH rails — the ids that appear in the card-rail list AND the wire-rail list?",
      choices: ["EXCEPT", "INTERSECT", "UNION", "UNION ALL"],
      answer: 1,
      why: "INTERSECT keeps ids present in both lists — the dual-rail signature, five statements on this book. EXCEPT answers the complement (settled on one rail only, depending on side); UNION stacks; UNION ALL stacks without dedup. The migration steering call reads the INTERSECT list as its chase register.",
      notes: [
        { choice: 0, why: "EXCEPT returns card-rail statements that never touched wire (and vice versa for the reversed operands) — the single-rail majority, not the artifacts." },
        { choice: 3, why: "UNION ALL concatenates both lists — 27 rows of legs sorted by nothing in particular. No intersection happened, so the 'both rails' claim is fiction." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-bmo-1",
      tier: "easy",
      topic: "j2",
      universe: "funnel",
      title: "The corridor book census",
      brief:
        "BMO-flavored brief on the storefront db: Monday's corridor call opens with the corridor book census — flows booked, distinct clients covered, book value and average ticket per corridor — and the corridor desk is explicit that both grains print on the same row. Probed facts: 103 booked flows worth 34,833.28. The Canadian home book (EU code) reads 45 flows from 8 clients, 15,089.23 at a 335.32 average ticket; the US middle-market book (APAC) reads 37 from 5, 11,605.45 at 313.66; the cross-border corridor (US) reads 19 from 2, 7,286.16 at 383.48; the trade-finance pilot (LATAM) reads 2 from 1, 852.44 at 426.22. The call reads biggest book first.",
      ask: "Return each corridor with its booked flow count, distinct client count, book value to 2 decimals and average ticket to 2 decimals, biggest book first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS flows,\n       COUNT({1} o.customer_id) AS clients,\n       ROUND(SUM(o.total), {2}) AS book_value,\n       ROUND(AVG(o.total), 2) AS avg_ticket\nFROM orders o\nJOIN customers c ON c.id = o.{3}\nGROUP BY c.region\nORDER BY book_value {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the client deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat flows back to clients: the home book reads 8, not 45. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a coverage census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the book-value precision",
          why: "Book values print to 2 decimals — the home book's 15,089.23. ROUND(…, 1) prints 15,089.2 and the corridor map stops reconciling with the 34,833.28 platform book finance control quotes on the same slide.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the join key",
          why: "The corridor inherits from the client through c.id = o.customer_id — the only key that maps every flow to its owner. Joining on a column the orders table does not carry errors out; joining on id matches order ids against client ids and silently scrambles the book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The call reads biggest book on top: 15,089.23, 11,605.45, 7,286.16, 852.44. ASC would open the corridor call on the two-flow pilot line — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "0", "ASC", "region"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every flow to its client's corridor — and GROUP BY corridor folds the 103 flows into four rows where COUNT(*) reads flows (45 / 37 / 19 / 2), COUNT(DISTINCT o.customer_id) reads client coverage (8 / 5 / 2 / 1), ROUND(SUM(o.total), 2) reads book value (15,089.23 / 11,605.45 / 7,286.16 / 852.44) and ROUND(AVG(o.total), 2) reads the average ticket (335.32 / 313.66 / 383.48 / 426.22) — all straight from the probed census, footing upward to the 34,833.28 platform book. The distractors fail honestly: SUM in the client slot adds customer ids together and MAX reports the largest id — a census of nothing; 1 in the precision slot truncates to one decimal so the map drifts off the platform total; 0 collapses every book to whole dollars; region errors (orders carry no region column); ASC opens the call on the pilot line. The two-grain pairing is the read: the home book's 45-from-8 (5.6 flows per client) versus the cross-border corridor's 19-from-2 (9.5) says the flagship corridor is concentrated while the home book is broad — one query, two business claims.",
    },
    {
      id: "cs-bmo-2",
      tier: "medium",
      topic: "j6",
      universe: "month-close",
      title: "The dual-rail settlement register",
      brief:
        "BMO-flavored brief on the storefront db: since the Bank of the West systems migration, finance control keeps a standing item on the close checklist — statements settled on BOTH rails at once. A clean cycle takes one leg on one rail; a dual-rail cycle takes two legs on two rails, and each one is a migration artifact to chase until proven clean. Probed facts: 27 settlement legs cover 22 distinct statements — card 16 legs / 37,364.00, wire 11 legs / 32,248.00 — and exactly 5 statements carry the dual-rail signature: #1, #5, #12, #19 and #22, settled for 4,860.00, 5,284.00, 4,723.00, 5,614.00 and 4,459.00 respectively. The register reads biggest settled total first.",
      ask: "Return each dual-rail cycle with its statement id, both rails and the combined settled total to 2 decimals, biggest total first.",
      template:
        "SELECT a.invoice_id AS cycle,\n       a.method AS first_rail,\n       {1} AS second_rail,\n       ROUND((a.amount_cents + b.amount_cents) / 100.0, 2) AS settled_total\nFROM payments a\nJOIN payments b ON a.invoice_id = {2} AND a.id < {3}\nWHERE a.method {4} b.method\nORDER BY {5} DESC;",
      slots: [
        {
          answer: "b.method",
          kind: "keyword",
          label: "the second rail column",
          why: "b.method carries the second leg's rail into its own column — the register's whole point is showing card beside wire. a.method would print the same rail twice and the mismatch guard would empty the register; a literal would print a constant instead of evidence.",
        },
        {
          answer: "b.invoice_id",
          kind: "keyword",
          label: "the pairing key",
          why: "a.invoice_id = b.invoice_id pairs legs that settled the same statement — the self-join's pairing key. Pairing on a.invoice_id = a.invoice_id matches the alias to itself and pairs the whole table; pairing on id crosses statement boundaries and invents cycles.",
        },
        {
          answer: "b.id",
          kind: "keyword",
          label: "the pair canonicalizer",
          why: "a.id < b.id canonicalizes each pair so it prints once — without the guard the legs swap places and every cycle prints twice. a.id < a.id is false for every row and returns an empty register.",
        },
        {
          answer: "<>",
          kind: "keyword",
          label: "the rail-mismatch guard",
          why: "a.method <> b.method keeps only cross-rail pairs — the dual-rail signature. An equals sign flips the register to same-rail pairs, which is empty on this book; a greater-than narrows to wire-first pairs and silently drops half the artifacts.",
        },
        {
          answer: "settled_total",
          kind: "keyword",
          label: "the biggest-first sort",
          why: "ORDER BY settled_total DESC reads biggest exposure first — 5,614.00 on cycle 19 leads. Sorting by the cycle id or the leg id buries the big artifact wherever its id happens to sit; the steering call reads the register top-down.",
        },
      ],
      distractors: ["a.invoice_id", "a.id", "=", ">", "a.method", "1"],
      walkthrough:
        "A self-join over the settlement table, built in three moves. The ON clause pairs legs that settled the same statement (a.invoice_id = b.invoice_id) and canonicalizes each pair with a.id < b.id so it prints exactly once; the WHERE keeps only cross-rail pairs — the dual-rail signature; and the fold adds both legs' INTEGER cents before the single /100.0 dollar read. The register prints five cycles — 19 card/wire 5,614.00, 5 card/wire 5,284.00, 1 card/wire 4,860.00, 12 card/wire 4,723.00, 22 card/wire 4,459.00 — matching the probed anomaly table row for row, and reconciling to the fan-out read: 27 legs over 22 statements. The evidence rule holds: the void-but-settled #11 (925.00) is a single-leg cycle, so it never pairs; the paid-status #28 (1,756.00) has no legs at all, so it cannot appear — the register is evidence-only, which is exactly why finance control trusts it. The distractors each break differently: a.invoice_id in the pairing slot pairs the whole table into cross-rail noise; a.id in the canonicalizer empties the register; equals flips it to same-rail pairs (none exist); greater-than keeps only wire-first pairs and drops half the list; a.method prints one rail twice; 1 sorts by the first column and buries cycle 19. Five rows, five chase items, one close that provably ties.",
    },
    {
      id: "cs-bmo-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The coverage-model ladder",
      brief:
        "BMO-flavored brief on the storefront db: the coverage model — which commercial officer carries which relationships — is staffed off one ladder ranked by flows booked. Probed facts: the 103 flows fold into 16 clients, and the ladder reads 24, 17, 14, 13, 5 — Alice Chen 24 flows booking 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56, Chloe Dubois 5 / 2,667.93 — then a FOUR-way tie at 4 flows (Isabella Rossi 985.65, Keiko Sato 1,098.60, Noah Meyer 737.68, Pedro Alvarez 1,686.17) and two clients at 3 (Farid Nasser 1,458.97, Hiro Tanaka 829.09). The board's published policy is RANK with gaps: the tie holds rung 6 four times and the next rung is 10, not 7 — peer relationships get peer rungs, and the gap is the honest cost of the tie. The floor is 3-plus flows so the tie block and the gap both stay on the board; the staffing memo reads biggest flow count first.",
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
          why: "The board's published policy is RANK with gaps: after the four-way tie at rung 6 the next rung is 10 — five clients sit above the tie, so the tie costs three rungs. ROW_NUMBER hands the tie an arbitrary 6-7-8-9 and DENSE_RANK compresses the next rung to 7; neither is the ladder the staffing memo ships.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The memo reads Alice Chen's 24 flows on top, down to the 3-flow tail. ASC opens the staffing read on Hiro Tanaka's 829.09 — a correct ladder aimed at the wrong end, and the coverage pods read bottom-up instead of top-down.",
        },
      ],
      distractors: ["4", "ROW_NUMBER", "DENSE_RANK", "ASC"],
      walkthrough:
        "Fold flows per client first, then rank twice. The ladder CTE joins flows to clients and groups by client: 16 clients, 103 flows, with ROUND(SUM(o.total), 2) carrying booked value beside the count — Alice Chen 24 / 7,262.35 down to Hiro Tanaka 3 / 829.09. The floor WHERE flows >= 3 keeps 11 of the 16 clients, deliberately including the two 3-flow rows: they are the whole tie-policy lesson, because RANK and DENSE_RANK only disagree when a gap follows a tie. The two windows share one ORDER BY flows DESC, so the tie block reads deterministically: the four 4-flow clients all take rung 6 in both columns, then the 3-flow pair splits them — RANK 10, DENSE_RANK 7. That 10-versus-7 is the board's published policy: a client tied at 4 flows sits behind three phantom rungs under the gap rule, which is exactly how the coverage model treats near-miss relationships. The corridor column tells the staffing story beside the ranks: the cross-border book's anchor (Emma Wilson, 17 flows / 6,640.56) sits at rung 2 while its whole corridor carries 2 logos — concentration the pods must plan around. The distractors each break differently: 4 in the floor slot keeps 9 rows and hides the gap so both rank columns agree — the trap that makes the case look trivial; ROW_NUMBER in the policy slot prints 6-7-8-9 across the tie, an ordering nobody signed off; DENSE_RANK compresses the next rung to 7 and quietly promotes the 3-flow tail; ASC flips the board so staffing reads bottom-up. One fold, two policies, one stated floor — and say out loud which rung the tie costs.",
    },
    {
      id: "cs-bmo-4",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The busted-flow map",
      brief:
        "BMO-flavored brief on the storefront db: the workout calendar keys off the busted map by corridor — flows booked, flows busted, the busted share, and a risk band the calendar reads: elevated at 8-plus percent, watch at 5-plus, normal below. Probed on the storefront db: 103 booked flows split cross-border corridor (US code) 19, Canadian home book (EU) 45, US middle-market (APAC) 37, pilot line (LATAM) 2; busted flows run 7 total — APAC 3 of 37 (8.1%), EU 3 of 45 (6.7%), US 1 of 19 (5.3%), LATAM 0 of 2 (0.0%, a two-flow base — a small-sample zero, not a clean bill). The share prints to 1 decimal and the map reads highest risk first. The denominator question is the interview: busted over ALL flows booked, pending included — because a flow awaiting confirmation is exactly the population the workout calendar watches.",
      ask: "Return each corridor with flow count, busted count, busted share to 1 decimal, and the risk band, highest share first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS flows,\n       SUM(CASE WHEN o.status = '{1}' THEN 1 ELSE 0 END) AS busted,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)\n             / COUNT(*), 1) AS busted_share,\n       CASE\n         WHEN 100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)\n              / COUNT(*) >= {2} THEN 'elevated'\n         WHEN 100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)\n              / COUNT(*) >= 5 THEN 'watch'\n         ELSE '{3}'\n       END AS risk_band\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY busted_share {4};",
      slots: [
        {
          answer: "cancelled",
          kind: "keyword",
          label: "the busted-stage arm",
          why: "The stage map fixes the arm: cancelled = busted, 7 of 103. 'shipped' would count in-flight flows as busted (EU 12, APAC 8 — the map would triple its workout list), and a status like 'returned' matches nothing and prints a zero column.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the elevated threshold",
          noVerify: true,
          why: "The band edge is policy: 8-plus percent escalates. APAC's 8.1 clears it and EU's 6.7 does not — move the edge to 9 and APAC slides to watch, re-assigning the workout before anyone re-reads the base.",
        },
        {
          answer: "normal",
          kind: "keyword",
          label: "the below-watch label",
          why: "The ELSE branch is the bucket for corridors below watch: LATAM at 0.0 — on two flows. Labeling it anything else (or dropping the arm) leaves a hole in the CASE, and a hole in the CASE is a corridor that vanishes from the map.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the highest-risk-first direction",
          why: "The workout calendar works top-down: APAC 8.1, EU 6.7, US 5.3, LATAM 0.0. ASC would open the read on the two-flow pilot line — a correct map aimed at the wrong end of the worklist.",
        },
      ],
      distractors: ["shipped", "returned", "9", "ASC"],
      walkthrough:
        "A conditional aggregate wearing a policy. The join attaches every flow to its corridor and GROUP BY region folds 103 into four rows; SUM(CASE WHEN status = 'cancelled') counts busted flows per corridor — 3, 3, 1, 0, footing to the platform's 7 — and the share divides by COUNT(*) over the SAME fold, so the base is booked-including-busted by construction: a busted flow consumed capacity, and the question is 'what share of commitments busted', not 'what share of survivors'. The 100.0 multiplier forces real division first (8.1, not a truncated 8), and ROUND to 1 decimal matches the memo. The CASE reads the policy: APAC 8.1 >= 8 prints 'elevated'; EU 6.7 and US 5.3 clear the 5 arm and print 'watch'; LATAM falls to ELSE 'normal' — with the two-flow base printed beside it, because a 0.0 on n = 2 is small-sample silence, not proof of a clean book. The distractors each break differently: 'shipped' turns in-flight volume into busted flows; 'returned' invents a status the map has no rows for; moving the edge to 9 re-bands APAC; ASC opens the meeting on the pilot line. One scan, one policy, and the workout list is auditable line by line.",
    },
    {
      id: "cs-bmo-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-chased collections list",
      brief:
        "BMO-flavored brief on the storefront db: before any collections call goes out, finance control refreshes its anti-join — fee statements that NO settlement rail ever touched. Probed facts: exactly 6 statements worth 15,217.00 in total have zero settlement legs — INV-2025-024 Emma Wilson US open 4,937.00 (2025-01-08, the biggest exposure), INV-2025-026 Liam O'Brien EU open 3,562.00, INV-2025-027 Isabella Rossi EU open 2,794.00, INV-2025-028 Hiro Tanaka APAC paid 1,756.00, INV-2024-021 Chloe Dubois EU open 1,295.00 and INV-2024-018 Pedro Alvarez EU open 873.00 (2024-10-29, the oldest). The queue reads biggest owed first. Two rows get walked line by line in every review: #28 is paid-STATUS with zero legs — a status that lies — and the Canadian home book carries four of the six, so the collections batch starts there. Statements that DO carry a leg (even void #11 at 925.00) are reconciliations, not collections.",
      ask: "Return each never-settled statement with its number, client, corridor, status, issue date and owed amount in dollars to 2 decimals, biggest owed first.",
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
          why: "The anti-join's answer set is the NULL payload from the LEFT JOIN — statements with zero settlement legs. NOT NULL here flips to the opposite queue: every statement a rail HAS touched, the reconciliation list including void #11, not the collections list.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Statements carry INTEGER cents — the house read is amount_cents / 100.0, printing Emma Wilson's 493,700 cents as 4,937.00. Divide by 10.0 and every figure inflates tenfold; the collections letter quotes 49,370.00 and the batch stops reconciling with the 15,217.00 queue total.",
        },
      ],
      distractors: ["NOT NULL", "=", "c.id", "10.0"],
      walkthrough:
        "A LEFT JOIN anti-join, then a cents-safe fold. Join statements to clients INNER — every statement has an owner — then LEFT JOIN payments ON p.invoice_id = i.id: statements with legs carry their payment rows, the never-settled six carry NULL payloads, and WHERE p.id IS NULL keeps exactly those. Six statements survive, biggest first because the ORDER BY owed DESC is hardcoded: Emma Wilson's INV-2025-024 at 4,937.00 opens the batch, down to Pedro Alvarez's 873.00 from 2024-10-29, the oldest. The pad is INTEGER cents, so owed = ROUND(amount_cents / 100.0, 2) — 493,700 cents prints 4,937.00, 87,300 prints 873.00, and the six rows cross-foot to 15,217.00, the number finance control quotes in every review. The rows that make it interesting: INV-2025-028 is paid-STATUS with zero legs — a status that lies, so collections proceeds on legs, not labels; and the Canadian home book holds four of the six (3,562.00 + 2,794.00 + 1,295.00 + 873.00), which is where the batch starts. The distractors each break differently: c.id in the join key slot pairs legs to customers and returns an unexplainable queue; = in the test slot turns the WHERE into p.id = NULL, which is NULL for every row and silently empties the queue — the classic anti-join kill; NOT NULL in the marker slot flips to the settled list, void #11 included; 10.0 in the divisor slot inflates every figure tenfold and breaks the 15,217.00 cross-foot. LEFT JOIN for coverage, IS NULL for the miss, cents over one hundred, biggest first — that is the collections refresh.",
    },
    {
      id: "cs-bmo-6",
      tier: "medium",
      topic: "q5",
      universe: "growth",
      title: "The above-the-mean client bench",
      brief:
        "BMO-flavored brief on the storefront db: before the commercial pod plans its quarter it runs the above-the-mean scan — which clients carry a lifetime book bigger than the platform per-client mean. Probed on the storefront db: 103 flows fold into 16 clients; the mean client book is 2,177.08, and exactly five clear it — Alice Chen (24 flows, 7,262.35), Emma Wilson (17, 6,640.56), Grace Kim (14, 4,574.23), Maya Patel (13, 3,644.56), Chloe Dubois (5, 2,667.93). These are the same five logos the 3,000-plus concentration line flags at 63.5% of the book (71.2% above 2,000) — one lost account moves a corridor's quarter. The scan prints the biggest book first and stops at five.",
      ask: "Return each client whose lifetime book exceeds the platform per-client mean: name, flow count, and lifetime spend to 2 decimals, biggest spend first, top five.",
      template:
        "WITH client AS (\n  SELECT customer_id, SUM(total) AS book, COUNT(*) AS flows\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.name AS client,\n       o2.flows,\n       ROUND(o2.book, 2) AS lifetime_spend\nFROM client o2\nJOIN customers c ON c.id = o2.customer_id\nWHERE o2.book {1} (SELECT AVG(book) FROM client)\nORDER BY lifetime_spend {2}\nLIMIT {3};",
      slots: [
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-mean operator",
          why: "The scan lists clients ABOVE the per-client mean — the pod's call list. '<' returns the below-mean complement (11 clients) and '=' returns zero rows, since no book sits exactly on the 2,177.08 line.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The pod reads the list biggest book first: 7,262.35 down to 2,667.93. ASC would open the planning call on the smallest above-mean logo and bury the anchor account.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the call-list cut",
          noVerify: true,
          why: "Exactly five clients clear the mean, so LIMIT 5 prints the whole cohort — the cut is a guard, not a filter: if a sixth logo crossed the line tomorrow, the list would silently truncate. The cut only means anything downstream of the ORDER BY.",
        },
      ],
      distractors: ["<", "=", "ASC", "3"],
      walkthrough:
        "Stage the fold, then judge it against its own mean. The CTE folds 103 flows into 16 per-client books — the grain the mean lives at — and the outer query joins back for names, keeps every book strictly above (SELECT AVG(book) FROM client): the mean is 2,177.08, five clients clear it, and ORDER BY lifetime_spend DESC prints 7,262.35, 6,640.56, 4,574.23, 3,644.56, 2,667.93. The read is the concentration story: these five are the 3,000-plus cohort carrying 63.5% of the book (71.2% above the 2,000 line) — the coverage model's staffing and the mid-market pod's call calendar both trace to this list. The distractors each break differently: '<' serves the below-mean complement — eleven clients the pod explicitly did NOT ask for; '=' returns zero rows because no book equals the mean exactly, an empty list that looks like a clean bill of health; ASC opens on the smallest logo; LIMIT 3 amputates two logos off a five-logo call list. One CTE, one scalar baseline, one direction, one cut — and the quarter plan starts from a defensible list.",
    },
  ],

  problems: [
    { slug: "countries-you-can-safely-invest-in", why: "Cross-border corridor screens weigh country risk beside book size — the flagship US-Canada corridor read. This problem drills the per-country conditional fold with the risk filter the corridor desk applies weekly." },
    { slug: "suspicious-bank-account-transactions", why: "Post-integration monitoring sweeps look for burst patterns in settlement legs — two legs on one statement is the dual-rail signature, and sliding-window burst logic is how the sweep generalizes." },
    { slug: "delinquency-buckets", why: "The commercial book ages in DPD buckets — current, 1-30, 31-60, 90-plus — and every workout conversation starts from a bucketed fold exactly like this one." },
    { slug: "expected-credit-loss", why: "Provisioning reads weight exposure by stage and probability — the two-stage weighted fold the commercial-lending pod ships with every quarter-end pack." },
    { slug: "fx-exposure-report", why: "A corridor bank carries two currencies by definition. Latest-rate joins that mark flows to a reference rate are the FX-exposure read the treasury pod runs daily." },
    { slug: "settlement-fails-aging", why: "Wire-rail legs that miss value date age into fails buckets — T+2 aging math over settlement timestamps, the back-office beat behind the 2.98-day lag watch." },
    { slug: "ar-aging-schedule", why: "Fee statements age against flat 30-day terms — the 6 never-settled statements worth 15,217 are exactly an AR aging schedule's worst bucket at practice scale." },
    { slug: "duplicate-charge-pairs", why: "Migration-era double posts are the reason the dual-rail register exists. Self-join pair detection with an id canonicalizer is the same shape, one table over." },
    { slug: "delinquency-roll-rates", why: "Risk reads the book as flows between buckets — LAG/LEAD transition math over state columns, the roll-rate discipline behind every credit memo." },
    { slug: "credit-utilization-bands", why: "Revolvers band by utilization with fixed edges the credit memo publishes — CASE banding over a ratio, the same shape as the exposure-tier screens." },
    { slug: "vintage-default-curves", why: "The commercial book is read by origination vintage — cohort folds over a month spine, the same 14-bucket walk the corridor trend uses." },
    { slug: "risk-based-pricing", why: "Mid-market facilities price off risk bands — band joins that map a borrower's grade to a rate grid, the commercial-lending pod's bread-and-butter join." },
    { slug: "loan-amortization-schedule", why: "Term facilities amortize on a schedule — recursive CTE calendar building is how the lending pod projects the book's cash flows period by period." },
    { slug: "trial-balance-check", why: "Every close ships with a proof: debits against credits, delta zero — 181,080 against 181,080 here. Conditional SUM folds over a ledger are exactly this check." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The concentration read starts with the busiest relationship — 24 flows for 7,262.35 on this db. Argmax-by-count with a stated tie policy is the warm-up." },
    { slug: "queries-quality-and-percentage", why: "Corridor quality reads weight outcomes by value share — ratio-with-percentage folds where the denominator is stated out loud, the habit every BMO screen grades." },
    { slug: "account-balance", why: "Statement balances in and out with the cents rule attached — the account-level read that pairs with the settlement rails, INTEGER cents folded once by /100.0." },
    { slug: "daily-balance-interest", why: "Interest accrues on daily balances in INTEGER cents — the per-day fold behind the deposit side of the shelf, drilled on the same cents-safe spine as the fee book." },
    { slug: "structuring-detection", why: "Threshold-structuring screens for the commercial book: flows sliced just under reporting walls, caught with a HAVING-guarded census the compliance desk runs per corridor." },
    { slug: "chargeback-rate-ranking", why: "Reversed or busted flows ranked by corridor share — RANK over a conditional rate, the same ladder discipline the coverage model uses, pointed at risk." },
    { slug: "wash-trade-detection", why: "Same-counterparty pairing screens: flows booked and settled inside one relationship ring — self-join pair detection with an id canonicalizer, the dual-rail register's shape generalized." },
    { slug: "top-percentile-fraud", why: "Anomalies concentrate in the tail: the 25.47-to-1,088.44 ticket spread means percentile screens, not averages, are how the fraud pod hunts suspicious flows." },
    { slug: "prepayment-detection", why: "Commercial term loans prepay when rates move — earliest-repayment detection over event timestamps is the prepayment screen behind the treasury's prepayment-assumption memo." },
    { slug: "point-in-time-asof", why: "As-of joins pin each flow to the rate or grade live on its booking date — the temporal join behind honest re-pricing and exposure reads on the cross-border book." },
    { slug: "portfolio-concentration-hhi", why: "A Herfindahl fold over the client book quantifies what the 63.5% concentration line implies — the single-number concentration read the credit memo quotes." },
    { slug: "premier-league-table-ranking", why: "A league table with wins, draws and points is the coverage ladder with stakes — RANK plus conditional SUM folds, the exact staffing-board shape with ties guaranteed." },
    { slug: "fifo-inventory-cogs", why: "Commercial lending collateral is inventory: FIFO cost-layer folds over stock receipts are how the lending pod reads a borrower's COGS and borrowing base." },
    { slug: "scd2-build", why: "The Bank of the West integration is a slowly-changing-dimension exercise: client masters that changed hands need from/to date versioning before any corridor fold is trustworthy." },
    { slug: "late-arriving-restatement", why: "Migration books restate: a leg that lands after the close rewrites the month it belongs to — late-arriving restatement logic is how the trend stays honest post-integration." },
    { slug: "keep-latest-dedupe", why: "Two source systems mean duplicate legs with different stamps — keep-the-latest dedupe by key and timestamp is the staging pass before the dual-rail register can be trusted." },
    { slug: "dormant-reactivation", why: "Dormant retail and commercial accounts: clients whose last flow aged past the season — the whitespace census that decides which branch gets the reactivation visit." },
    { slug: "winback-recovery", why: "Win-back cohort reads: clients who dropped below the coverage line and came back — recovery revenue tracked on the same month spine the corridor trend uses." },
  ],
};
