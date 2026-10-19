// Fireblocks — Wave-10 (Task 100-fireblocks), fintech domain, 0 tagged pool rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12; wave-8+9 canonical cells section quoted
// where marked; case slots mechanically verified by scripts/case-audit.ts against db/custom.db).
// Digital-asset custody & settlement SQL: the storefront db read as a custody-network sandbox —
// customers are institutional clients (region = market bucket), orders are vault/transfer cycles
// (delivered = settled transfers 52, shipped = in-flight with shipped_at as the broadcast stamp 30,
// pending = awaiting quorum approvals 14, cancelled = rejected/expired 7), order_items are transfer
// line records (quantity = units, unit_price = per-unit rate), products are custody/workspace SKUs
// (db category codes = SKU families), suppliers are exchange/liquidity partners, invoices are
// platform fee statements, payments are settlement legs on two rails (card vs wire), expenses are
// platform opex, ledger_entries is the GL. Finance tables store INTEGER cents — dollar read =
// amount_cents/100.0; orders.total and order_items.unit_price are REAL dollars. Angle kept distinct
// from coinbase.ts (retail exchange): institutional custody, MPC quorum-approval workflows, network
// settlement economics. Pool provenance: company-pools.md carries NO Fireblocks section — all 10
// topic slug sets and all 16 problems are theme-curated from the pools file's SQL theme menu (sql
// rows only, no w*/d*/f* rows) and say so. Extended to full depth (30/24/6/32).

//
// NOTE for the wave-10 registry wiring agent: Fireblocks is NOT yet in registry COMPANY_META.
// Header fields authored as id "fireblocks", domainId "fintech", name "Fireblocks", tagline
// "Digital-asset custody & the settlement network: vaults, quorums, rails", accent text-orange-300
// (unused by all 20 fintech siblings + wave-10's tink/text-blue-300) — wire COMPANY_META to match.

import type { CompanyKit } from "../types";

export const fireblocksKit: CompanyKit = {
  id: "fireblocks",
  domainId: "fintech",
  name: "Fireblocks",
  tagline: "Digital-asset custody & the settlement network: vaults, quorums, rails",
  accent: "text-orange-300",

  brief: [
    "**Fireblocks** is the institutional digital-asset infrastructure layer — MPC-secured vaults, a policy engine that gates every movement behind M-of-N quorum approvals, and a settlement network that routes transfers across exchanges and liquidity venues. Where a retail exchange counts trades, Fireblocks counts settled transfers and the approvals that cleared them. On this storefront db the mapping is honest: customers are institutional clients, orders are vault/transfer cycles worth **34,833.28** across 103 rows, order_items are transfer lines (251 of them — a cycle averages 2.44), and the status map is fixed — delivered = {emerald:settled} (52), shipped = in-flight with shipped_at as the {sky:broadcast stamp} (30), pending = awaiting approvals (14), cancelled = {rose:rejected/expired} (7).",
    "The data org splits into custody engineering, the counterparty/network pod and a small billing-analytics desk, and all three read the same spine at different grains. The broadcast clock is the heartbeat: a transfer initiates at created_at, and shipped_at is stamped the moment it leaves the vault for the network — **82 of 103 cycles** carry the stamp, averaging **2.98 days** initiation-to-broadcast across a 2–4-day spread, and the 14 pending rows have none yet (an approval-queue definition, not a cleanup job). Counterparty concentration is the risk line: six exchange/liquidity partners route the book, the top one carries **32%** of value (11,130.25) and the top two **58.7%** — one venue outage is a quarter-end event. Money sits one layer down: 28 fee statements against 27 settlement legs, INTEGER cents, dollar read amount_cents / 100.0.",
    "Interview screens are census-then-denominator, with the network read as the escalation. A typical loop opens with a **two-grain market census** — EU runs 45 transfer cycles from 8 clients (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do rejected transfers count in your base?'*), then into the liquidity-partner manifest where the fan-out turns visible in one string cell: GROUP_CONCAT folds a partner to 3 SKU names while its transfer lines number 43. Late rounds walk the {sky:14-month cycle spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Fireblocks section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: transfer-fate censuses, two-grain coverage counts, liquidity-partner folds, CASE banding and the cents-safe settlement spine. Do the topics in order, drill the thirty MCQs until the stage map and the denominators are reflex, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: the {emerald:market coverage census} the network pod opens Monday with, the {violet:partner manifest} the counterparty review ships quarterly, the {sky:monthly settlement spine} treasury walks at close, the {rose:never-collected register} billing refreshes before a single reminder, the transfer-size bands the concentration read sits on, and the one-pass fate census that must reconcile to 103 every morning. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the settlement sweep. A custody-ops analyst opens the transfer dashboard before standup: did overnight cycles clear their quorum, did any transfer get its shipped_at broadcast stamp without the policy engine logging approvals, does the one-pass fate census reconcile — 52 settled + 30 in-flight + 14 awaiting approvals + 7 rejected = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If broadcast latency drifts off the **2.98-day** norm, the approval queue gets pulled before the network pod's weekly read ships.",
    "**11:30 —** Midday is the network deep-dive. The counterparty pod wants the liquidity bench re-cut — which exchange partners route the most value (Nordic 11,130.25 against Pacific's 2,980.15) and what a {rose:32% top-partner share} does to the failover runbook; client success wants the two-grain census beside client counts (EU 45-from-8 versus US 19-from-2); compliance wants the rejection map where APAC's **8.1%** leads. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the counterparty-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected fee statements worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-debited statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Settlement rate", what: "Settled (delivered) transfers ÷ ALL cycles booked: 52 of 103 (50.5%). The funnel's headline — the 30 in-flight-but-unsettled cycles are 'not yet', never a silent zero in the base." },
    { name: "Broadcast latency", what: "Initiation to network broadcast (created_at → shipped_at) over the 82 stamped cycles only: 2.98-day average, range 2–4. The onboarding-to-broadcast SLA every counterparty contract quotes — cycles still awaiting approval have no clock yet and must not dilute it." },
    { name: "Rejection share", what: "Rejected/expired cycles ÷ all booked: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The compliance map that decides where the policy-engine team spends its quarter." },
    { name: "Transfer book value", what: "Total value booked: 34,833.28 across 103 cycles, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 enterprise cycle outweighs the smallest 42 combined." },
    { name: "Transfer lines per cycle", what: "Transfer lines ÷ cycles: 251 lines across 103 cycles = 2.44 (max line quantity 3). Depth of routing per movement — a one-line vault sweep is a different failure mode from a multi-venue block settlement." },
    { name: "Counterparty concentration", what: "Share of routed value by liquidity partner: the top partner carries 32% (11,130.25), the top two 58.7%. The trusted bench (rating ≥ 4.5) is just Nordic 4.6 and Alpine 4.8 — concentration is the venue-risk line the network pod walks quarterly." },
    { name: "Fee-statement coverage", what: "Statements settled exact / partial / none: 21 / 1 (4,000 of 6,148) / 6 worth 15,217. The AR anti-join the billing desk refreshes every close — reconciliation to 28 statements by construction." },
    { name: "Settlement rail mix", what: "16 card settlement legs worth 37,364.00 versus 11 wire legs worth 32,248.00 — 27 legs tying to the cash account's debits. A drift in the rail mix is venue-behavior change, not rounding noise." },
  ],

  topics: [
    {
      name: "Transfer-fate conditional counts",
      why: "Every Fireblocks custody screen opens with the fate census: cycles booked, settled (delivered), broadcast with the stamp, awaiting quorum, rejected. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight transfer 'settled' — 30 versus 52 on this db.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "immediate-food-delivery-i", "settlement-fails-aging", "game-play-analysis-iv"],
    },
    {
      name: "Two-grain market censuses",
      why: "Transfer cycles and institutional clients are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "fx-exposure-report", "investments-in-2016"],
    },
    {
      name: "Joining clients to transfer cycles",
      why: "Clients carry market and created_at; transfer cycles inherit them through joins, and the join type decides who survives. A cycle without a client row is corruption; a client without cycles is an unfunded workspace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "bank-account-summary"],
    },
    {
      name: "Liquidity-partner leaderboards",
      why: "Exchange partners are ranked by routed value — Nordic 11,130.25 leads Midwest 9,294.93 with a 47-line Shenzhen bench below — and rank semantics are a policy about peer venues. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is exactly the argument a counterparty review settles out loud.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary", "portfolio-concentration-hhi", "nth-highest-salary", "second-highest-salary-ii", "find-churn-risk-customers"],
    },
    {
      name: "Quorum banding with CASE",
      why: "Workspace tiers and approval policies are CASE-classified — cold-storage, trading, treasury — with fixed edges the policy engine publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the vault register, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "type-of-triangle", "odd-and-even-transactions", "transaction-velocity"],
    },
    {
      name: "Broadcast clocks & LAG walks",
      why: "The broadcast clock (created_at → shipped_at, 2.98-day average over the 82 stamped) and the 14-month cycle spine (2024-01 to 2025-02) are the latency call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "calculate-parking-fees-and-duration", "late-arriving-restatement", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Reachability set algebra",
      why: "Network packs stack populations — settled under rejected, this quarter beside last — and EXCEPT answers 'which signed clients never broadcast a transfer'. UNION dedups whole rows silently, which makes it a correctness question, not a style one; a failover runbook that loses a client to a silent dedup is an audit finding.",
      slugs: ["customers-who-never-order", "the-airport-with-the-most-flights", "team-scores-in-football-tournament", "circular-transfers", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Cohort subqueries & quorum gates",
      why: "Screens escalate into staging: fold per-client cycle counts, then judge them against a computed platform mean (6.44 here — exactly four clients clear it), or gate a partner bench with a HAVING-derived IN-list the way the network pod does. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "point-in-time-asof", "percentage-of-users-attended-a-contest", "confirmation-rate", "countries-you-can-safely-invest-in"],
    },
    {
      name: "Fee-statement cents discipline",
      why: "Settled is not collected — the finance tables (28 fee statements, 27 settlement legs, INTEGER cents) are where the custody world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the billing desk's Monday read.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "monthly-transactions-i", "journal-gap-detection", "trial-balance-check", "the-blunder", "suspicious-bank-account-transactions"],
    },
    {
      name: "Manifest folds & GROUP_CONCAT",
      why: "The counterparty review ships a per-partner asset manifest — the exact SKUs each venue routes — and GROUP_CONCAT is where the join fan-out becomes visible in a string cell: a partner folds to 3 deduplicated SKU names while its transfer lines number 43. DISTINCT inside the fold, separator discipline and row-order caveats are the craft.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "concatenate-the-name-and-the-profession", "customer-placing-the-largest-number-of-orders", "customer-order-frequency", "find-followers-count"],
    },
  ],

  theory: [
    {
      id: "fireblocks-t1",
      q: "Your network report joins clients to transfer cycles. When do you INNER and when do you LEFT — and what silently breaks if you filter a cycle column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A value report joins transfer cycles to clients: a cycle with no client row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from clients: the clients with no transfer cycles ARE the answer (unfunded workspaces the failover runbook still names), arriving with NULL cycle columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload client row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-transferring clients, and proving that zero is itself the analyst's job: all 16 clients appear in the cycle table somewhere, just as all six liquidity partners route volume. At a custodian the stakes are contractual — a counterparty sweep that silently drops a signed client is not a report bug, it is a coverage misstatement in the failover runbook, so the join type is written down like a control.",
      tag: "joins",
    },
    {
      id: "fireblocks-t2",
      q: "The client-activity ladder runs 24, 17, 14, 13, 5 transfer cycles, then THREE clients tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying three phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which client's coverage engineer gets staffed first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer clients (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. On a concentration-driven book this is not cosmetics: the rung order decides whose coverage review moves up the calendar, and a reranked board that shuffles between renders is how trust in the analytics org dies.",
      tag: "windows",
    },
    {
      id: "fireblocks-t3",
      q: "The census shows 103 transfer cycles, 251 transfer lines and 16 clients. Why do these three numbers disagree, and what does each mean to the business?",
      a: "They disagree because they count at three different grains. COUNT(*) over orders counts transfer cycles — one row per movement the vaults initiated, so 103. COUNT(*) over order_items counts transfer lines — the individual legs and vault sweeps inside each cycle, 251 of them, averaging 2.44 lines per cycle. COUNT(DISTINCT customer_id) folds the rows back to institutional clients — 16 logos. None is wrong; each answers a different question: cycles measure network load, lines measure routing depth, clients measure coverage. The ratio 251/103 = 2.44 is the lines-per-cycle signal that decides whether settlement is running one-venue sweeps or multi-venue block movements. The trap that catches candidates is the partner fold: join through products to order_items and COUNT(*) silently counts transfer lines (43 for Nordic), not custody SKUs (3) — the fan-out has already multiplied the rows. Saying 'one row per what?' for every COUNT is the habit the panel grades, because a census that cannot name its grain cannot reconcile to anything.",
      tag: "aggregation",
    },
    {
      id: "fireblocks-t4",
      q: "shipped_at is NULL until a transfer actually broadcasts to the network. What is your policy for the broadcast-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only broadcast transfers have a latency, so the report measures initiation-to-broadcast for the 82 of 103 cycles that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. The 14 pending rows are awaiting quorum approval, not slow: they have no clock yet, and a 'latency' for them does not exist. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the broadcast subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 rejected rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day broadcasts for movements still sitting in the approval queue, and at a custodian that number flows straight into the counterparty SLA review. A report whose WHERE clause is doing definitional work without saying so is exactly what a Fireblocks reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "fireblocks-t5",
      q: "The network review wants settled value per market for markets carrying at least ten transfer cycles. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, pending and rejected rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-cycle floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a coverage line and an error, and between a threshold applied to cycles versus to dollars. On this db the floor is the interesting part: EU (45) and APAC (37) clear ten cycles easily, the US sits at 19, LATAM at 2 — so the same query with a 20-cycle floor answers a different business question (which markets carry enterprise-scale load), and the strong candidate places every filter by asking: is this a fact about one transfer, or about a market? At a custodian that question is risk policy, not syntax.",
      tag: "pipeline",
    },
    {
      id: "fireblocks-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 cycles always produce a mean (6.4375 per client, 6.44 rounded — exactly four clients clear it). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides: slice to LATAM's 2 cycles, fold the mean, exclude the client you are filtering on, and the inner fold can come back empty without any warning. The correlated cousin (compare each cycle to ITS client's average) re-runs per outer row and answers a different question at a different cost — 'which transfers are large for their own client' versus 'which are large for the platform'. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "fireblocks-t7",
      q: "The cycle trend buckets transfers by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's transfers, and quarter-end is exactly when treasury sweeps land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this book the walk tells the settlement story cleanly: the spine opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November. Date discipline is network discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "fireblocks-t8",
      q: "Finance says a fee statement is 'paid' but the settlement-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: fee statements LEFT JOIN settlement legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why leg rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a debited leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The split-leg fold comes next: five statements (#1, #5, #12, #19, #22) settle on two legs each, so legs must be folded per statement before any comparison to face value — comparing raw leg rows to statements double-counts exactly those five. The coverage census must read 21 exact / 1 partial (4,000 of 6,148 on #25) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship. The money rule: fee statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly truncates cents on every odd-cent row.",
      tag: "quality",
    },
    {
      id: "fireblocks-t9",
      q: "The failover runbook wants the list of signed clients that never broadcast a transfer. Walk me through the set-algebra shape — and why direction and dedup both matter.",
      a: "Two shapes answer 'never'. The anti-join: clients LEFT JOIN orders, keep the NULL side — on this db it returns a confident zero, and proving that zero is part of the job. The set diff: SELECT id FROM customers EXCEPT SELECT customer_id FROM orders — EXCEPT is directional, so customers-minus-cycles is the never-transferring side and the reverse is a different question nobody asked. The dedup trap is real: EXCEPT and UNION dedup whole rows silently, so if the branches ever emit a repeated row — same id, same counts — one client vanishes with no error. The discipline: write EXCEPT for the diff, state the direction out loud ('signed side minus broadcast side'), and if you stack censuses with UNION, either add the distinguishing column or write UNION ALL with a comment proving duplicates are impossible. At a custodian a silently lost client is a coverage misstatement in the runbook, not a style preference.",
      tag: "setops",
    },
    {
      id: "fireblocks-t10",
      q: "A counterparty filter uses WHERE name = 'nordic gadgets ab' and returns nothing. What class of bug is this, and how do you hunt it?",
      a: "It is a casing-and-whitespace bug, and the first move is to stop trusting the literal: SELECT DISTINCT name FROM suppliers and look at the actual bytes — the db carries 'Nordic Gadgets AB', and string comparison is case-sensitive in SQLite. The quick fixes are the comparison functions: WHERE UPPER(name) = UPPER('Nordic Gadgets AB'), or better, match on a normalized key like LOWER(TRIM(name)) if the pipeline publishes one. The deeper answer the panel wants: normalization belongs in the pipeline, not scattered through every query — a staging CTE that folds names once beats twelve ad-hoc UPPER() calls that drift out of sync. The cost angle is secondary here (a function-wrapped column can miss an index), because on a six-partner reference table the scan is free; the real cost is a filter that silently returns an empty bench and reads as 'the venue has no volume'. Empty-from-casing is the most expensive kind of empty, because it looks like an answer.",
      tag: "strings",
    },
    {
      id: "fireblocks-t11",
      q: "The network pod wants each liquidity partner's share of routed value — the 32% headline. What is the query shape, and why is it a window job and not a GROUP BY?",
      a: "The share is a ratio of two folds at different scopes: partner value over platform value. GROUP BY can produce the numerator — SUM(oi.quantity * oi.unit_price) per partner — but it collapses the rows, so the denominator is gone. The window keeps every row while attaching the fold: SUM(value) OVER (PARTITION BY s.name) for the partner total, SUM(value) OVER () for the platform total, and the share is the ratio of the two, deduped to one row per partner. On this book that query reproduces the concentration read exactly: Nordic 11,130.25 is 32% of 34,833.28, and the top two partners (Nordic plus Midwest's 9,294.93) carry 58.7%. The mental model to say out loud: windows attach aggregates to detail rows; GROUP BY replaces detail with aggregates. Any 'share of total' metric is the canonical case for OVER () — and the runbook reads it as venue risk, which is why the denominator (all routed value, all statuses) gets stated in the query comment.",
      tag: "windows",
    },
    {
      id: "fireblocks-t12",
      q: "You band transfer cycles by size — micro-sweep, standard, block — and a reviewer warns 'your WHEN order is a policy'. What does that mean?",
      a: "CASE arms evaluate top to bottom and the first match wins, so the order of WHEN clauses IS the banding policy. The correct ladder is edges ascending — WHEN total < 100 THEN 'micro-sweep', WHEN total < 500 THEN 'standard', ELSE 'block' — which on this db folds 103 cycles into 25 blocks, 63 standard and 15 micro-sweeps. Reverse the order and the second arm is dead code: a 1,088.44 block cycle matches < 500? No — but a 120 cycle matches < 500 first and lands in standard, silently re-banding the book with no error. The ELSE is the exhaust valve: an edge drawn at 100 that a reordered WHEN skips still lands somewhere, which is exactly why banding bugs are quiet. The strong candidate publishes the edges in a comment, writes the arms ascending, and adds a one-pass audit — COUNT by band, reconciled to 103 by construction — because on a policy engine's database a band that cannot reconcile is a finding, not a rounding note.",
      tag: "case",
    },
    {
      id: "fireblocks-t13",
      q: "The market census needs cycles, settled, broadcast, awaiting-approval and rejected counts per region. One pass with FILTER or four passes with WHERE — argue it.",
      a: "One pass, and the reason is reconciliation. COUNT(*) FILTER (WHERE status = 'delivered') beside three more FILTER folds groups each market once and lays the fate columns side by side — EU reads 45 cycles with 24 settled, 12 broadcast, 6 awaiting, 3 rejected, and the row sums to itself: 24 + 12 + 6 + 3 = 45. Four separate WHERE queries answer the same five numbers at four different execution times on four different table snapshots, and nothing forces their columns to reconcile — a late arrival between runs shows up as a census that no longer adds to 103 by construction, and nobody can say which pass moved. FILTER is also the cheaper read: one scan of the join, four conditional counts, one GROUP BY. The counter-argument — four queries are simpler to debug one at a time — is real but belongs in ad-hoc exploration; the shipped artifact is the one-pass census. The habit being graded: when the deliverable is a table whose rows must sum to a known total, build it in one statement so the identity is enforced by construction.",
      tag: "aggregation",
    },
    {
      id: "fireblocks-t14",
      q: "The partner manifest ships GROUP_CONCAT. What are the craft points — dedup, separator, ordering — and what does the raw fold hide?",
      a: "GROUP_CONCAT is where join fan-out becomes visible in a string cell, so the craft points are all about the fan-out. Dedup: the partners-to-SKUs-to-lines chain repeats each SKU once per transfer line, so GROUP_CONCAT(DISTINCT p.name) is what folds Nordic to its 3 actual SKUs — the bare fold prints those names 43 times over, once per line record, and '43 entries' reads as 43 products. Separator: the second argument — GROUP_CONCAT(DISTINCT p.name, ' | ') — is worth setting deliberately, because the default comma collides with SKU names that contain commas, and a manifest nobody can split is a manifest nobody reads. Ordering: SQLite gives no guarantee of order inside the fold before 3.44+, so a manifest whose order matters needs a subquery that pre-sorts — or an explicit disclaimer. The counts stay in their own columns: COUNT(*) reads the line grain (43 for Nordic), COUNT(DISTINCT oi.order_id) reads cycles touched (38), and the string cell reads assets. Three grains, one row, and only one of them is a sentence.",
      tag: "groupby",
    },
    {
      id: "fireblocks-t15",
      q: "Settlement legs run on two rails — 16 card legs worth 37,364.00 and 11 wire legs worth 32,248.00. Write the rail-mix read and defend the fold.",
      a: "The shape is a conditional fold per rail: SELECT method, COUNT(*) AS legs, ROUND(SUM(amount_cents)/100.0, 2) AS dollars FROM payments GROUP BY method — one scan, one row per rail, cents divided on the way out. The defenses come in pairs. First, the fold is GROUP BY method, not two queries with WHERE method = 'card' and 'wire': same reconciliation argument as the FILTER census, one snapshot, columns that add up — 27 legs against 28 statements is itself a finding (one statement draws no leg, five draw two). Second, the dollar read is SUM(amount_cents)/100.0 with the .0, because the rails table is INTEGER cents end to end — 3736400 cents prints 37,364.00 only if the division happens in real arithmetic. What the mix is for: a drift in the rail split is venue-behavior change, not rounding noise — card-heavy weeks read like different counterparties than wire-heavy weeks, which is why the billing desk re-cuts this fold every close and diffs it against the prior one.",
      tag: "joins",
    },
    {
      id: "fireblocks-t16",
      q: "The close packet ends with a ledger trial balance — 181,080 debits against 181,080 credits. What query proves it, and what does a non-zero delta mean operationally?",
      a: "The proof is a two-column fold: SELECT SUM(debit_cents)/100.0 AS debits, SUM(credit_cents)/100.0 AS credits FROM ledger_entries — and the close ships only when the two read 181,080 against 181,080, delta zero. The query is trivial; the discipline is what the delta means. A non-zero balance is not a rounding note — it is a missing or duplicated journal line, and the follow-up is a gap hunt, not a plug: per-account folds (SELECT account, SUM(debit_cents) - SUM(credit_cents) … GROUP BY account) find the account whose balance moved without its mirror entry. The operational rule at a custodian: the close does not ship on a non-zero trial balance, full stop — tomorrow starts with an incident instead. The cents rule rides along: ledger_entries is INTEGER cents like every finance table here, so the /100.0 belongs in the read, and a delta measured in cents is still a delta. Zero is the only boring number this query is allowed to produce, and boring is the requirement.",
      tag: "quality",
    },
    {
      id: "fireblocks-t17",
      q: "Statements carry issued_on and due_on dates. How do you build the aging view bill-pay duns from, and where do the half-open windows matter?",
      a: "Aging is bucketing by a date difference with CASE, and the windows are half-open by policy. The spine: CAST(julianday(due_on) - julianday(issued_on) AS INTEGER) or a direct days-late measure against a cutoff, then CASE WHEN days_late <= 0 THEN 'current', WHEN days_late <= 30 THEN '1-30', ELSE '31+' — arms ordered so every row lands in exactly one bucket, reconciling to all 28 statements by construction. The half-open discipline: a cutoff of 'due < date(now)' includes everything strictly before today — BETWEEN with a date literal silently includes midnight of the boundary and double-counts the boundary night's statements. The wrinkle this db is honest about: the aging view is only as good as the settlement legs beneath it — six statements (15,217.00) have no legs at all, and one of those (#28) claims paid. Dunning a paid statement is worse than dunning a late one, so the aging query joins the leg fold and excludes the paid-claim lie before the buckets are drawn. Sequence matters: reconcile first, bucket second.",
      tag: "dates",
    },
    {
      id: "fireblocks-t18",
      q: "The network pod stages a partner bench: only venues whose transfer-line count clears a floor computed from the data itself. How does that query shape up?",
      a: "Two folds, one inside the other. The inner fold computes the per-partner line counts (GROUP BY supplier) — 43, 56, 40, 25, 47, 40 on this db; the outer query gates with a HAVING or an IN-subquery against a computed threshold — say the platform mean, or 'partners above the median'. The shapes escalate: a scalar subquery compares each partner to one number (AVG over the per-partner counts); a derived table joins the fold back to detail when the report needs both the count and the lines; a HAVING-derived IN-list — WHERE supplier_id IN (SELECT supplier_id FROM … GROUP BY … HAVING COUNT(*) >= N) — is the pod's actual staging move. The empty-case answer comes unprompted: if the floor is computed over a filtered slice (one market, one status), the inner fold can return zero rows and the IN-list empties the whole bench silently — a bench with no venues is a plausible output, but it must be earned by the data, not by a NULL comparison. State the inner fold's population before the outer query runs.",
      tag: "subqueries",
    },
    {
      id: "fireblocks-t19",
      q: "Fee-statement coverage reads 21 exact, 1 partial, 6 with no legs. Write the classification query — and explain why the fold has to happen before the CASE.",
      a: "The grain is the statement, so legs fold first: LEFT JOIN payments per invoice, GROUP BY i.id, and the classification CASE compares the leg fold to face value — WHEN COUNT(p.id) = 0 THEN 'no-legs', WHEN SUM(p.amount_cents) >= i.amount_cents THEN 'exact', ELSE 'partial'. That inner fold produces one row per statement with its class; the outer GROUP BY coverage counts the classes: 21 / 1 / 6, worth 65,612.00 / 6,148.00 / 15,217.00 face. The order matters because the comparison is between aggregates at the statement grain — SUM of legs against the statement's own amount — and a CASE that runs before the fold would be comparing row-level legs to face value one leg at a time, calling a two-leg statement 'partial' on its first leg. The anomalies the census surfaces are the job: #25 is the partial (4,000.00 of 6,148.00), #28 claims paid with zero legs, and #11 is void-but-debited — an exact fold on a voided claim, which is why the class column is cross-read against status, never alone. Reconciles to 28 statements by construction, or it does not ship.",
      tag: "joins",
    },
    {
      id: "fireblocks-t20",
      q: "Treasury wants settled value accruing month over month — a running total on the cycle spine. What is the window shape, and what does the frame decision change?",
      a: "SUM(SUM(total)) OVER (ORDER BY month) over the month-folded spine — the inner SUM folds cycles to months, the outer window accumulates. The frame is the policy decision: the default RANGE UNBOUNDED PRECEDING TO CURRENT ROW gives the cumulative walk (month-end book-to-date), while ROWS BETWEEN 2 PRECEDING AND CURRENT ROW gives a three-month rolling read — different numbers wearing similar names, so the report title has to say which. On this db the cumulative walk starts at 3,731.97 and ends at the platform's 34,833.28, which is a built-in reconciliation: the last running value must equal the all-time fold, and if it does not, a month dropped out of the spine. The peer temptation is PARTITION BY — but there is one platform here, so partitioning by anything would silently shrink the denominator; the partition move is for per-client or per-market running totals, where the walk restarts at each boundary. State the frame in the query comment: a running total without a declared frame is a number with no definition.",
      tag: "windows",
    },
    {
      id: "fireblocks-t21",
      q: "A board stack lays this quarter's transfer book beside last quarter's with UNION. What has to be true for that to be safe, and what is the failure mode?",
      a: "UNION dedups whole rows across branches, so safety is a property of the row shapes: if the branches emit a distinguishing column — a 'period' label, a market code, anything that makes a quarter's rows byte-different from the other's — dedup has nothing to bite on and UNION is safe (though UNION ALL is still the honest choice, being the declared intent). The failure mode is two branches emitting identical rows for legitimately different facts: the same client with the same cycle count in both quarters, no label column, and UNION collapses one into the other — the board loses an account with no error anywhere. On this db the 14-month spine makes it concrete: stack 2024-Q1 beside 2024-Q2 unlabeled and any market that booked identical value in both quarters prints once. The discipline: UNION ALL plus a comment stating why duplicates are impossible, or an explicit period column that makes every row self-identifying. The comment is not decoration — it is the correctness argument, and a reviewer who cannot find it assumes the bug.",
      tag: "setops",
    },
    {
      id: "fireblocks-t22",
      q: "Intensity reads 5.6 cycles per client in EU but 9.5 in the US. What is the correct way to compute a ratio like that, and what is the fold-of-ratios trap?",
      a: "A ratio of aggregates must be computed from aggregates: SUM over the numerator grain divided by SUM over the denominator grain — EU's 45 cycles from 8 clients is 45/8 = 5.6, computed as COUNT(*) over COUNT(DISTINCT customer_id) after the join folds the market. The trap is averaging ratios: fold cycles-per-client per client (each client's 24, 17, 14 …) and then AVG those — the result weights a one-cycle client the same as a 24-cycle client and produces a number that matches neither the load story nor the coverage story. Same discipline for the platform: 103 cycles from 16 clients is 6.44 cycles per client — computed from the folds, never from averaging sixteen per-client numbers. The business read the panel wants: intensity is a concentration signal, not a growth one — the US's 9.5 means load concentrates in two logos, which is a failover question. And it generalizes: 251 transfer lines over 103 cycles is 2.44 lines per cycle, the same ratio-of-folds at the line grain. Compute the folds, then divide; never the reverse.",
      tag: "grain",
    },
    {
      id: "fireblocks-t23",
      q: "A LEFT JOIN to settlement legs leaves statement rows with NULL leg columns. How do the aggregates downstream behave, and where does COALESCE belong?",
      a: "NULLs propagate honestly through the money folds, and the report has to decide which honesty it wants. SUM(p.amount_cents) over a statement with no legs is NULL — not zero — which is exactly right for the exposure read: an unfunded statement has no settled amount, and printing 0 would claim the legs ran and settled nothing, a different fact. COUNT(p.id) is zero for the same rows (COUNT of a NULL column counts non-NULLs), which is why the no-legs arm of the coverage CASE is COUNT(p.id) = 0 and not SUM(...) IS NULL alone. COALESCE belongs at the presentation edge and only with intent: COALESCE(SUM(p.amount_cents)/100.0, 0) on a statement-level exposure column is defensible — 'zero collected so far' — while COALESCE on the latency-style measures (a broadcast clock that has not started) is not, because there the NULL means 'no measurement exists', and inventing a zero invents a measurement. The rule the panel grades: NULL means unknown, zero means measured-at-zero, and the choice between them is a business statement, not a display preference.",
      tag: "nulls",
    },
    {
      id: "fireblocks-t24",
      q: "The partner leaderboard prints the top 5 venues by routed value. What does LIMIT actually promise on a ladder with ties — and how do you make the cut deterministic?",
      a: "LIMIT promises N rows after the sort — and nothing about which rows when the sort key ties. On this book the value ladder has no ties at the top (11,130.25 / 9,294.93 / 4,765.63 / 3,613.25 / 3,049.07), so ORDER BY routed_value DESC LIMIT 5 is safe today — but the count ladder next to it is not: four partners tie at a shared rung and LIMIT 5 on that board silently drops one of the tied rows by whatever order the engine happens to visit them. The deterministic cut has two layers: make the ORDER BY a tie-broken key — ORDER BY routed_value DESC, partner_name ASC — so every row has a unique position, and then say in the comment what the cut means ('top 5 by value, name as tie-break'). The alternative is a policy answer: with a window, RANK() gives the tied rows the shared rung and the caller decides to take rank <= 5, which keeps ties together and can return more than 5 rows on purpose. Either is defensible; the bare LIMIT with a tied key is not — it is a leaderboard whose tail reshuffles between renders, and a counterparty review that reshuffles between renders loses the room.",
      tag: "pipeline",
    },
  ],

  mcqs: [
    {
      id: "fireblocks-mcq-1",
      prompt: "A transfer cycle's status reads 'pending'. In this kit's Fireblocks stage map, what is true of that cycle?",
      choices: ["It was rejected by the policy engine", "It is settled on the network", "It is awaiting quorum approvals — no broadcast stamp yet", "It is in-flight and already broadcast"],
      answer: 2,
      why: "The stage map is fixed: pending = awaiting quorum approvals (14 of 103 cycles), and those rows carry no shipped_at — there is no broadcast clock to measure until the policy engine clears the movement.",
      notes: [
        { choice: 0, why: "Rejected/expired is 'cancelled' — 7 cycles. Pending is a queue state the approval workflow owns, not a terminal state." },
        { choice: 3, why: "In-flight-and-broadcast is 'shipped' — 30 cycles carrying the shipped_at stamp. Calling pending rows in-flight invents a broadcast that never happened." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-2",
      prompt: "Broadcast-clearance rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 broadcast, 14 awaiting approvals and 7 rejected of 103 booked.",
      choices: ["Broadcast + rejected only (82/89 = 92.1%)", "Settled cycles only (52/82)", "All cycles booked (82/103 = 79.6%)", "Distinct clients (82/16)"],
      answer: 2,
      why: "The house definition: broadcast ÷ ALL cycles booked — the 14 pending stay in the denominator because 'not yet cleared by the quorum' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the population still in the approval queue — the rows the metric exists to watch." },
        { choice: 1, why: "52/82 mixes two funnel steps — settled is term completion, shipped_at is broadcast. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-3",
      prompt: "EU carries 45 transfer cycles from 8 clients. Which column pair reports both grains in one row?",
      choices: ["SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)", "COUNT(*) and COUNT(customer_id)", "COUNT(*) and COUNT(DISTINCT customer_id)"],
      answer: 3,
      why: "COUNT(*) counts cycle rows (45); COUNT(DISTINCT customer_id) folds repeats back to clients (8). The gap between them — 5.6 cycles per client — is the intensity read.",
      notes: [
        { choice: 2, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cycle has a client. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 1, why: "COUNT(DISTINCT region) counts territories, not clients — a third grain nobody asked for. The census is cycles AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-4",
      prompt: "Keep only clients carrying at least 5 transfer cycles (the ladder tops at 24/17/14/13/5). Where does the threshold live?",
      choices: ["WHERE cycles >= 5 on the raw table", "GROUP BY client HAVING COUNT(*) >= 5", "WHERE COUNT(*) >= 5, before GROUP BY", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A cycle-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db exactly five clients — 24, 17, 14, 13 and 5 cycles — clear the bar.",
      notes: [
        { choice: 0, why: "There is no 'cycles' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
        { choice: 2, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-5",
      prompt: "A dashboard walks booked cycle value by month: the first month's LAG delta column prints NULL. A reviewer asks you to 'fix' it to 0. What is the right move?",
      choices: ["Coalesce it to 0 so the chart renders a bar", "Keep NULL — there is no prior month to compare; it is the baseline, not a zero", "Replace LAG with LEAD so the first row gets a value", "Drop the first month from the spine"],
      answer: 1,
      why: "LAG over a month-ordered spine has no row before the first one, so the first delta is NULL by definition — the baseline. Coalescing it to 0 prints a flat month and misstates the book: the spine opens at 3,731.97, and 0 is a number nobody measured.",
      notes: [
        { choice: 0, why: "Rendering convenience is not a measurement — a 0 delta claims the prior month equaled 3,731.97, which is fiction. Label it 'baseline' instead." },
        { choice: 2, why: "LEAD looks forward and flips every delta's sign — the whole walk becomes wrong to fix one cell." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-6",
      prompt: "The client-activity ladder runs 24, 17, 14, 13, 5 cycles, then THREE clients tie at 4. Under RANK, what rank does the next distinct count (3 cycles) carry?",
      choices: ["9", "6", "8", "7"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie at 4 consumes ranks 6 through 9, so the next distinct count lands on 10. All 3-cycle clients share rank 10.",
      notes: [
        { choice: 1, why: "6 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "8 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-7",
      prompt: "A settlement leg carries 48,613 INTEGER cents after a rate migration. ROUND(48613/100, 2) prints what — and why?",
      choices: ["486.13 — ROUND restores the cents", "486 — the /100 is INTEGER division and truncates before ROUND ever sees the cents", "48,613 — the division is a no-op", "48.613 — the engine divides by 1000"],
      answer: 1,
      why: "INTEGER ÷ INTEGER is integer division in SQLite: 48613/100 truncates to 486 before ROUND runs, so the cents are gone at the fold, not at the display. The honest read is 48613/100.0 — the .0 promotes the division to real arithmetic first — and every fee fold in this kit ships with it.",
      notes: [
        { choice: 0, why: "ROUND happens AFTER the damage if the division already truncated — ROUND(486, 2) is still 486. The fix is arithmetic type, not presentation." },
        { choice: 2, why: "The division is real — 48613/100 evaluates to 486 in integer arithmetic. Printing the raw cents dressed as dollars is the four-orders-of-magnitude lie." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-8",
      prompt: "A compliance sweep uses client_id NOT IN (SELECT customer_id FROM orders WHERE status = 'rejected') to find clients with no rejected transfers — and returns ZERO rows. First suspicion?",
      choices: ["Every client genuinely has a rejected transfer — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the sweep empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "On the clean core db every cycle carries a customer_id, so a zero CAN be right — but compliance sweeps run on staging tables, exactly where NULLs sneak in. Verify before you ship." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "fireblocks-mcq-9",
      prompt: "A review query keeps clients whose booked value exceeds (SELECT AVG(total) FROM orders WHERE region = 'LATAM') and returns an empty report on the staging copy. The platform average over all 103 cycles is 338.19. What most plausibly happened?",
      choices: ["No client exceeds the average — the empty report is correct", "The staging copy is corrupted; restore from backup", "AVG(total) is deprecated in SQLite and returned NULL", "The inner fold filtered to a population that excludes every outer row it is compared against — it returned zero rows, so the comparison is NULL and the whole report silently empties"],
      answer: 3,
      why: "A scalar subquery over an empty filtered fold returns NULL, not an error — and value > NULL is UNKNOWN, so the report empties while looking valid. State the inner fold's population and its empty-case behavior before shipping an above-average gate.",
      notes: [
        { choice: 0, why: "Nine clients clear 338.19 on the platform — the empty result is the smell, not the truth. An empty report that 'proves' a negative is exactly how bad gates ship." },
        { choice: 2, why: "AVG is fine in SQLite — and a deprecated function would error loudly, not silently. Silent empties come from three-valued logic, not deprecation." },
      ],
      difficulty: "hard",
    },
    {
      id: "fireblocks-mcq-10",
      prompt: "A fee reconciliation joins 28 statements to 27 settlement legs and reports total face value as SUM(i.amount_cents) after the join. Five statements settle on two legs each. What does the number do?",
      choices: ["Nothing — the join is 1:1", "It multiplies the five split-leg statements' face value by two, inflating the fold by their combined 24,940.00", "It drops the five split-leg statements entirely", "It rounds every statement down to the nearest leg"],
      answer: 1,
      why: "The join fans out one row per leg, so a two-leg statement contributes its face value twice — statements #1, #5, #12, #19, #22 (4860 + 5284 + 4723 + 5614 + 4459 = 24,940.00) double-count, and the fold no longer reconciles to the 28-statement book. Fold legs per statement first, then compare.",
      notes: [
        { choice: 0, why: "27 legs against 28 statements is not 1:1 — five statements draw two legs, one draws one, and six draw none. The fan-out is the whole finding." },
        { choice: 2, why: "Joins never drop left-side rows in an inner fan-out — they repeat them. Dropping would require an anti-join, which is a different query." },
      ],
      difficulty: "hard",
    },
    {
      id: "fireblocks-mcq-11",
      prompt: "The partner manifest folds custody SKUs per liquidity partner. Nordic routes 43 transfer lines across 3 SKUs. What does GROUP_CONCAT(DISTINCT p.name) print for Nordic?",
      choices: ["43 SKU names, one per line", "The 3 distinct SKU names, once each", "NULL — DISTINCT is invalid inside GROUP_CONCAT", "The 43 line ids folded into one string"],
      answer: 1,
      why: "DISTINCT deduplicates inside the fold before the string is built: 3 SKUs, once each. The partners-to-SKUs-to-lines chain fans out one row per line, so the bare fold repeats each name once per line record — a manifest of 43 entries nobody reads.",
      notes: [
        { choice: 0, why: "That is the bare GROUP_CONCAT(p.name) — the fan-out made visible in a string cell. The dedup is the entire point of the manifest." },
        { choice: 2, why: "GROUP_CONCAT takes DISTINCT exactly like COUNT does. The query errors on aggregate nesting, not on DISTINCT." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-12",
      prompt: "Which query returns signed clients with no broadcast transfer — the runbook's whitespace read?",
      choices: ["SELECT customer_id FROM orders EXCEPT SELECT id FROM customers", "SELECT id FROM customers EXCEPT SELECT customer_id FROM orders", "SELECT id FROM customers INTERSECT SELECT customer_id FROM orders", "SELECT id FROM customers UNION SELECT customer_id FROM orders"],
      answer: 1,
      why: "EXCEPT is directional: signed-side minus broadcast-side is the never-transferring set. (On this clean core db it returns zero — and proving that zero is the job.) The reverse diff answers a question nobody asked.",
      notes: [
        { choice: 0, why: "That is the mirror diff — cycles whose customer_id matches no signed client, i.e. corruption, not whitespace. Direction IS the question." },
        { choice: 2, why: "INTERSECT returns the clients that DID transfer — the covered book, the opposite of the whitespace read." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-13",
      prompt: "COUNT(*) FILTER (WHERE o.status = 'delivered') appears beside COUNT(*) in the same SELECT. What does the FILTER clause do?",
      choices: ["Deletes non-delivered rows before the count", "Counts only the delivered rows while keeping every other row and fold intact", "Rounds the count to delivered-only precision", "Converts the count to a delivered share"],
      answer: 1,
      why: "FILTER is a per-aggregate WHERE: one scan, every conditional count side by side, rows never removed — EU reads 45 cycles with 24 settled in the same row, and the fate columns reconcile to the market total by construction.",
      notes: [
        { choice: 0, why: "Rows are never deleted by FILTER — that is WHERE's job, and it would shrink every column at once. FILTER shrinks exactly one aggregate." },
        { choice: 3, why: "A share needs the ratio — count over count. FILTER changes which rows one aggregate sees, nothing more." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-14",
      prompt: "On the 103-cycle book, COUNT(shipped_at) reads 82 and COUNT(*) reads 103. What does the gap of 21 measure?",
      choices: ["Duplicate broadcast stamps", "The 14 awaiting-approval plus 7 rejected cycles — rows with no broadcast stamp", "Timezone-shifted cycles", "The 52 settled cycles"],
      answer: 1,
      why: "COUNT(shipped_at) counts non-NULL stamps only. Pending (14) and rejected (7) cycles never broadcast, so 103 − 82 = 21 is the no-clock population — a feature the latency report leans on, not a data hole.",
      notes: [
        { choice: 1, why: "Correct by subtraction — and the composition matters: 14 have no clock YET (queue), 7 never will (terminal). One number, two different reasons." },
        { choice: 3, why: "Settled cycles (52) all carry stamps — they are inside the 82, not the gap. Mixing funnel steps is the misconception here." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-15",
      prompt: "The close packet's ledger proof reads SUM(debit_cents)/100.0 = 181,080.00 and SUM(credit_cents)/100.0 = 181,080.00. The delta is 0. What happens next?",
      choices: ["Escalate — a zero delta means the ledger is empty", "The close ships — the trial balance proof is exactly this identity", "Round the columns to integers and re-run", "Re-run without the /100.0 to double-check"],
      answer: 1,
      why: "Delta zero IS the deliverable: debits equal credits across the GL, so the close ships. A non-zero delta is a missing or duplicated journal line — an incident, never a rounding note.",
      notes: [
        { choice: 0, why: "An empty ledger would read 0 against 0 — but 181,080 against 181,080 shows real, balanced volume. The identity is the point." },
        { choice: 3, why: "Dropping the /100.0 changes the display from 181,080.00 to 18108000 — the same dollars printed as cents. It checks nothing new." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-16",
      prompt: "Settlement legs run card 16 legs / 37,364.00 and wire 11 legs / 32,248.00. Which query shape produces that rail-mix table in one pass?",
      choices: ["Two queries with WHERE method = 'card' and 'wire', stacked with UNION", "SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM payments GROUP BY method", "SELECT DISTINCT method FROM payments", "SELECT method FROM payments WHERE amount_cents > 0 GROUP BY method HAVING COUNT(*) > 10"],
      answer: 1,
      why: "One GROUP BY method fold returns both rails from one scan — 2 rows, counts and dollars aligned. One snapshot means the columns reconcile against each other and against the 27-leg total.",
      notes: [
        { choice: 0, why: "The UNION stack works but runs two scans at (potentially) two moments — the reconciliation guarantee is weaker, and the shape is two queries wearing a trench coat." },
        { choice: 2, why: "DISTINCT lists the rails without counts or value — a menu, not a mix read. The fold is the deliverable." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-17",
      prompt: "A failover runbook stacks settled clients over rejected clients with UNION and loses one client. What is the most likely cause?",
      choices: ["UNION caps output at the first branch's row count", "Two branches emitted byte-identical rows for that client — same id, same counts — and UNION deduped them silently", "The rejected branch errored and returned nothing", "UNION cannot stack two SELECTs over orders"],
      answer: 1,
      why: "UNION dedups whole rows across branches. A client with the same fingerprint in both populations — no branch label, no distinguishing column — collapses to one row with no error. UNION ALL plus a stated reason, or a label column, is the fix.",
      notes: [
        { choice: 0, why: "UNION never truncates by count — it only collapses exact duplicates. The silent collapse is worse than a cap because nothing announces it." },
        { choice: 2, why: "A branch error would fail the whole statement in SQLite, not half of it. The loss happened without any error — that is the tell." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-18",
      prompt: "CASE WHEN total < 500 THEN 'standard' WHEN total < 100 THEN 'micro-sweep' ELSE 'block' END bands the 103-cycle book. Which cycles land in the WRONG band?",
      choices: ["None — CASE evaluates all arms and picks the best match", "Cycles between 100 and 500 — they match the first arm and read 'standard', which is actually correct here, but cycles under 100 also read 'standard', re-banding all 15 micro-sweeps", "Only the 25 block cycles", "All of them — the CASE errors on out-of-order arms"],
      answer: 1,
      why: "Arms evaluate top to bottom, first match wins. Every cycle under 500 — including the 15 sub-100 micro-sweeps — matches < 500 first and bands 'standard', so micro-sweep becomes a dead arm and the second WHEN never fires. The ladder must ascend.",
      notes: [
        { choice: 0, why: "CASE does not score arms — it takes the first true WHEN. 'Best match' semantics would make banding deterministic; it is not." },
        { choice: 3, why: "Out-of-order arms are legal SQL and run to completion — that is what makes the bug quiet. No error, just a re-banded book." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-19",
      prompt: "Nordic routes 11,130.25 of the 34,833.28 book — the 32% headline. Which shape computes each partner's share correctly?",
      choices: ["GROUP BY partner, then AVG(quantity * unit_price)", "SUM(value) OVER (PARTITION BY partner) / SUM(value) OVER (), one row per partner", "MAX(value) per partner over COUNT(*)", "SUM(value) / COUNT(DISTINCT partner) per partner"],
      answer: 1,
      why: "A share is partner-value over platform-value — two folds at two scopes. The partition window keeps every row while attaching both denominators, and the ratio reproduces 32% exactly. The platform OVER () is the whole denominator, stated and immovable.",
      notes: [
        { choice: 0, why: "AVG per partner is the average line value (258.84 for Nordic), not a share of the book. Different metric, plausible-looking cell." },
        { choice: 3, why: "That divides value by the partner COUNT — a per-venue average wearing a share's name, and it changes per row, which a share must never do." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-20",
      prompt: "A trend query buckets by STRFTIME('%m', created_at) and returns 12 month rows for a spine that should hold 14. Diagnosis?",
      choices: ["Two months had no transfers and were dropped", "'%m' is month-only — January 2024 and January 2025 merged into one bucket, collapsing the 14-month spine to 12", "The spine is wrong; the db holds 12 months", "STRFTIME needs a timezone argument"],
      answer: 1,
      why: "The spine runs 2024-01 to 2025-02 — fourteen distinct year-months. '%m' keys on month alone, so both Januaries fold together and the trend silently loses a dimension. The fix is '%Y-%m' — year plus zero-padded month.",
      notes: [
        { choice: 0, why: "GROUP BY emits every key present in the data — the db has transfers in all 14 months. The collapse is a key-collision, not an absence." },
        { choice: 3, why: "STRFTIME works fine — it measured exactly what it was asked: month-of-year, which is the wrong unit for a multi-year spine." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-21",
      prompt: "Fee-statement coverage reads 21 exact / 1 partial (4,000 of 6,148) / 6 with no legs. Which class does the anti-join (LEFT JOIN legs, keep NULL side) return?",
      choices: ["The 21 exact", "The 1 partial", "The 6 no-leg statements — 15,217.00 of exposure", "All 28 statements"],
      answer: 2,
      why: "The anti-join keeps statements whose invoice_id matches no payment row: exactly the 6 no-leg statements. The partial statement HAS legs, so it survives the join and needs the fold-and-compare classification, not the anti-join.",
      notes: [
        { choice: 2, why: "And #28 (paid, 1,756.00) is inside those 6 — the paid-with-zero-legs lie the anti-join surfaces. Class, then cross-read status." },
        { choice: 1, why: "The partial settles 4,000.00 of 6,148.00 across real legs — the anti-join cannot see 'short', only 'absent'. Shortfalls need the fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-22",
      prompt: "Rewrite the compliance sweep WITHOUT NOT IN: clients with no rejected transfers, NULL-safe by construction. Which body is the house style?",
      choices: ["WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE status = 'rejected' AND customer_id IS NOT NULL)", "WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'rejected')", "WHERE customer_id IN (SELECT customer_id FROM orders WHERE status <> 'rejected')", "WHERE COUNT(status = 'rejected') = 0"],
      answer: 1,
      why: "NOT EXISTS is correlated, row-at-a-time, and three-valued-logic-proof: a NULL customer_id in the subquery simply never matches, so the sweep cannot silently empty. It is the policy answer the network pod standardizes on.",
      notes: [
        { choice: 0, why: "The NULL-guard repairs NOT IN, but the repair lives in the subquery where nobody re-reads it — one dropped guard later and the sweep is empty again. EXISTS needs no guard." },
        { choice: 2, why: "IN (status <> 'rejected') matches clients with ANY non-rejected cycle — almost everyone. The question is the ABSENCE of rejected, which IN cannot express." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-23",
      prompt: "GROUP_CONCAT(DISTINCT p.name, ' | ') over the partner manifest. Which claim about the fold is TRUE?",
      choices: ["The second argument sorts the names alphabetically", "The second argument is the separator — and SQLite guarantees no particular order of elements inside the fold", "The fold errors — GROUP_CONCAT takes no second argument", "DISTINCT and the separator cannot combine"],
      answer: 1,
      why: "The second argument is the separator string, and element order inside the fold is unspecified (deterministic only with the ORDER BY inside 3.44+ aggregate syntax or a pre-sorted subquery). A manifest whose reading order matters must sort upstream.",
      notes: [
        { choice: 0, why: "That is the trap: the fold happens in scan order, not sort order. An alphabetized-looking manifest is luck, and luck reshuffles between runs." },
        { choice: 2, why: "GROUP_CONCAT takes an optional separator — it has since forever. The error claim would make every separator-less fold a syntax question." },
      ],
      difficulty: "hard",
    },
    {
      id: "fireblocks-mcq-24",
      prompt: "SUM(SUM(total)) OVER (ORDER BY month) walks the cycle spine cumulatively. A reviewer asks for a three-month rolling figure instead. What changes?",
      choices: ["Nothing — cumulative and rolling are the same fold", "The frame: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW — the window folds only the trailing three months per row", "Replace SUM with AVG everywhere", "Add PARTITION BY month"],
      answer: 1,
      why: "Cumulative vs rolling is a frame decision, not a function swap: the default frame accumulates from the start (ending at 34,833.28), while 2 PRECEDING AND CURRENT ROW folds a sliding three-month window. Same spine, different definition — the title must say which.",
      notes: [
        { choice: 2, why: "AVG over the same frame gives the rolling AVERAGE, a third metric. The reviewer asked for the rolling SUM — the frame is the change." },
        { choice: 3, why: "PARTITION BY month would make each month its own universe — every running value restarts at the month's first row. The opposite of a walk." },
      ],
      difficulty: "hard",
    },
    {
      id: "fireblocks-mcq-25",
      prompt: "'Which transfers are large FOR THEIR OWN CLIENT' — not for the platform. Which shape answers that, and what is the cost?",
      choices: ["A scalar subquery comparing each transfer to the platform average — same question, cheaper", "A correlated subquery comparing each cycle to ITS client's average — re-executed per outer row", "GROUP BY client with MAX(total) — the flag comes free", "A CROSS JOIN of clients to cycles"],
      answer: 1,
      why: "The per-client baseline is a correlated subquery — the inner AVG re-runs for every outer row, correct but quadratic-ish in cost. The platform-average scalar runs once. Same-looking thresholds, different populations, very different bills.",
      notes: [
        { choice: 0, why: "The platform average (338.19) judges a cycle against all 103 — a 300 cycle is 'large for the platform' but small for a client whose book averages 900. Wrong population." },
        { choice: 2, why: "MAX finds the largest cycle per client — exactly one row per client. 'Large relative to the client's mean' needs the average, and it needs to stay correlated." },
      ],
      difficulty: "hard",
    },
    {
      id: "fireblocks-mcq-26",
      prompt: "The pod gates a partner bench with WHERE supplier_id IN (SELECT supplier_id FROM order_items GROUP BY supplier_id HAVING COUNT(*) >= 40). What does the HAVING-derived IN-list do that a plain WHERE cannot?",
      choices: ["Runs faster — IN is always faster than WHERE", "Filters on a group-level fact: partners whose folded line count clears 40 — a number that only exists after aggregation", "Avoids NULL handling entirely", "Joins suppliers to order_items automatically"],
      answer: 1,
      why: "The floor is a property of the fold — 43, 56, 40, 25, 47, 40 lines per partner — so it lives in HAVING inside the subquery; the outer WHERE then keeps detail rows whose partner made the cut. WHERE alone can only see row-level facts.",
      notes: [
        { choice: 2, why: "The NULL question still exists — an unguarded column in the IN-list has the same poisoning power as ever. Staging moves do not dissolve logic traps." },
        { choice: 3, why: "No join appears by magic — the subquery must already be over a table carrying supplier_id. The gate is a filter, not a relationship." },
      ],
      difficulty: "hard",
    },
    {
      id: "fireblocks-mcq-27",
      prompt: "The count ladder has four partners tied at a shared rung. ORDER BY cycles DESC LIMIT 5 — what is wrong with the cut?",
      choices: ["Nothing — LIMIT always returns a stable top 5", "The tied rows have no defined order among themselves, so which partner makes the top 5 is engine-luck and can change between runs", "LIMIT cannot combine with ORDER BY", "The ladder errors because ties are unsortable"],
      answer: 1,
      why: "LIMIT promises 5 rows, not WHICH 5 when the sort key ties — the engine's visit order decides, and it is not contractual. The deterministic cut tie-breaks the ORDER BY (value DESC, name ASC) or uses RANK() and takes rank <= 5 deliberately.",
      notes: [
        { choice: 0, why: "Determinism needs a unique sort key. With ties unresolved, the leaderboard's tail reshuffles between renders — and a counterparty review that reshuffles loses the room." },
        { choice: 2, why: "LIMIT and ORDER BY compose fine. The bug is semantic — an underspecified cut — not syntactic." },
      ],
      difficulty: "hard",
    },
    {
      id: "fireblocks-mcq-28",
      prompt: "EU: 45 cycles from 8 clients (5.6 per client). A teammate folds each client's cycles (24, 17, 14, …) and AVGs those numbers, getting 5.6-ish. Why is the panel still unhappy?",
      choices: ["It isn't — averaging per-client counts is the definition of intensity", "The average-of-ratios weights every client equally — a 1-cycle client counts as much as a 24-cycle client; intensity must be SUM(cycles)/SUM(clients-fold), ratio of the folds", "The teammate forgot to ROUND to one decimal", "AVG cannot run on derived counts"],
      answer: 1,
      why: "5.6 is 45/8 — a ratio of aggregates. Averaging the sixteen per-client numbers answers 'the typical client's cycle count', a coverage-flavored metric that moves whenever the tail moves, not the load-per-client the census promises.",
      notes: [
        { choice: 1, why: "Both numbers are real; only one is the metric. Saying which population each weights is exactly the denominator discipline the screens grade." },
        { choice: 3, why: "AVG runs happily over any derived column. The objection is definitional — wrong population weighted — not mechanical." },
      ],
      difficulty: "easy",
    },
    {
      id: "fireblocks-mcq-29",
      prompt: "Platform opex reads Rent 14 lines / 16,800.00, Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00 — 36 lines, 25,416.00. Which fold gives each category's share of opex?",
      choices: ["GROUP BY category with SUM(amount_cents)/100.0, then divide each by the platform total over ()", "GROUP BY category with MAX(amount_cents)/100.0", "WHERE category = 'Rent' — one category at a time", "COUNT(*) per category over SUM(amount_cents)"],
      answer: 0,
      why: "Share is category value over platform value — SUM per category from the GROUP BY, platform total from SUM over (), ratio per row. Rent lands at 66.1% of 25,416.00: the opex story the close packet quotes.",
      notes: [
        { choice: 1, why: "MAX reads the biggest single rent line, not Rent's total — a share of nothing, dressed like the read." },
        { choice: 3, why: "Count over value mixes units — lines per dollar. A share must be value over value (or count over count), never a chimera." },
      ],
      difficulty: "medium",
    },
    {
      id: "fireblocks-mcq-30",
      prompt: "Nordic carries 32% of routed value; with Midwest the top two carry 58.7%. A teammate proposes 'averaging the partners' shares' to summarize concentration. Why is that the wrong move?",
      choices: ["It is right — average share is the standard concentration metric", "Concentration is a fold property, not a per-partner average — the shares must be cumulated in rank order (top-1, top-2, …), and averaging flattens exactly the tail the metric exists to expose", "Averages cannot exceed 50%", "Shares must be computed per market first"],
      answer: 1,
      why: "The 58.7% headline is a cumulative share — top-1 plus top-2, in rank order. Averaging all six partners' shares (sums to 100% / 6 ≈ 16.7% regardless of skew) erases concentration: an even book and a 32%-dominated book produce the same average.",
      notes: [
        { choice: 1, why: "HHI or cumulated top-N shares are the honest concentration reads; both are folds over the ranked distribution. The average is blind to the thing being measured." },
        { choice: 2, why: "Averages can be anything — the objection is not arithmetic range but information loss. The tail IS the risk." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-fireblocks-1",
      tier: "easy",
      topic: "j1",
      universe: "funnel",
      title: "The market coverage census",
      brief:
        "Fireblocks-flavored brief on the storefront db: Monday's network review opens with the market coverage census — every market's transfer book at two grains: cycles initiated, distinct institutional clients covered, booked value and the average cycle — read biggest-book-first because the failover conversation starts at the top. Probed facts: the book runs 34,833.28 across 103 cycles; the regional split reads EU 45 cycles from 8 clients worth 15,089.23 (335.32 average), APAC 37 from 5 worth 11,605.45 (313.66), US 19 from 2 worth 7,286.16 (383.48), LATAM 2 from 1 worth 852.44 (426.22). Cycles and clients are different grains of the same join — clients count with COUNT(DISTINCT), and every market's row must reconcile to the facts grid it feeds.",
      ask: "Return each market with its transfer-cycle count, distinct client count, booked value and average cycle to 2 decimals — biggest book first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS cycles,\n       COUNT({1} o.customer_id) AS clients,\n       ROUND(SUM(o.total), {2}) AS book_value,\n       ROUND({3}(o.total), 2) AS avg_cycle\nFROM orders o\nJOIN customers c ON c.id = o.{4}\nGROUP BY c.region\nORDER BY book_value {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the client deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat cycles back to clients: EU reads 8, not 45. SUM(DISTINCT …) adds the id codes together and MAX(DISTINCT …) reports the largest id — neither is a coverage count.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the value precision",
          why: "Booked value prints to cents — 15,089.23 / 11,605.45 / 7,286.16 / 852.44 — so the census reconciles row-for-row with the probed region books. ROUND to 1 decimal prints 15,089.2 and the market map stops matching the facts grid everyone memorized.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the per-cycle average",
          why: "The census promises an average cycle: AVG(o.total) reads 335.32 in EU. SUM would print the market's whole book again under the average's name and MAX would print the largest single cycle — a 1,088.44 'average' nobody can defend.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the market join key",
          why: "Each cycle inherits its market through o.customer_id = c.id. Substituting o.id joins cycles to clients by row-id coincidence — the 45-cycle EU row dissolves into dozens of single-cycle markets, and the census counts a book that does not exist.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest book on top: EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. ASC would open the meeting on LATAM's 2-cycle pilot — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "id", "ASC", "0"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every transfer cycle to its client's market — no WHERE, because the census is the whole book — and GROUP BY market folds 103 cycles into four rows: COUNT(*) reads cycles (45 / 37 / 19 / 2), COUNT(DISTINCT o.customer_id) reads client coverage (8 / 5 / 2 / 1), ROUND(SUM(o.total), 2) reads booked value (15,089.23 / 11,605.45 / 7,286.16 / 852.44 — the probed region books, summing to the 34,833.28 platform total), and ROUND(AVG(o.total), 2) reads the average cycle (335.32 / 313.66 / 383.48 / 426.22) — LATAM's 426.22 is the outlier that starts the tiering conversation. The intensity read lives in the ratio: EU's 45-from-8 is 5.6 cycles per client while the US's 19-from-2 is 9.5 — US load concentrates in two logos, which is a failover question, not a growth one. The distractors fail honestly: SUM or MAX in the client slot adds id codes or reports the largest id — a census of nothing; SUM or MAX in the average slot prints the book or the biggest cycle under an average's name; id in the join key mis-pairs cycles to clients by row-id coincidence; 1 or 0 in the precision slot truncates the cents and breaks reconciliation; ASC opens the review on LATAM. Two grains, one query, and the denominator stated before anyone computes a share.",
    },
    {
      id: "cs-fireblocks-2",
      tier: "medium",
      topic: "x1",
      universe: "supplier",
      title: "The liquidity-partner manifest",
      brief:
        "Fireblocks-flavored brief on the storefront db: the counterparty pod's quarterly review ships a per-partner manifest — the exact custody SKUs each exchange/liquidity partner routes, beside the transfer-line count and routed value — so the failover runbook names assets, not just dollar totals. Probed facts: six partners route the book — Nordic Gadgets AB 11,130.25 over 43 lines, Midwest Hardware Co 9,294.93 over 56, Alpine Audio GmbH 4,765.63 over 40, Andes Naturals SA 3,613.25 over 25, Shenzhen Electro 3,049.07 over 47, Pacific Textiles 2,980.15 over 40. The chain partners → custody SKUs → transfer lines fans out one row per line, so the manifest must dedup with DISTINCT or it prints one name per line — Nordic 43 entries, not 3 SKUs. One row per partner, biggest routed value first.",
      ask: "Return each liquidity partner with its deduplicated SKU manifest, transfer-line count, distinct cycles touched and routed value to 2 decimals — biggest value first.",
      template:
        "SELECT s.name AS liquidity_partner,\n       s.region,\n       GROUP_CONCAT({1} p.name) AS sku_manifest,\n       COUNT(*) AS line_records,\n       COUNT(DISTINCT oi.order_id) AS cycles_touched,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS routed_value\nFROM suppliers s\nJOIN products p ON p.{3} = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.name\nORDER BY routed_value {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the manifest deduplicator",
          why: "The chain fans out — each custody SKU repeats once per transfer line that touches it — so GROUP_CONCAT(DISTINCT p.name) folds Nordic to its 3 actual SKUs while the bare fold prints the names 43 times over. ALL is the default and reproduces the repetition exactly; the manifest is where the fan-out becomes visible in a string cell.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the cents precision",
          why: "Routed value prints to cents — 11,130.25 / 9,294.93 / 4,765.63 / 3,613.25 / 3,049.07 / 2,980.15 — so the manifest reconciles row-for-row with the probed partner-value table the counterparty review quotes. ROUND to 1 decimal prints 11,130.3 and the runbook stops matching the value table it is meant to audit.",
        },
        {
          answer: "supplier_id",
          kind: "keyword",
          label: "the partner join key",
          why: "Each custody SKU names its partner via p.supplier_id = s.id. Substituting p.id pairs SKUs to partners by matching row-ids — plausible-looking manifests attributed to the wrong venues, the silent mis-pairing no error message announces.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-value-first direction",
          why: "The review reads concentration on top: Nordic 11,130.25 (the 32% partner) down to Pacific 2,980.15. ASC buries the concentration risk at the bottom of the page and opens the meeting on the smallest bench player — the opposite of the runbook's purpose.",
        },
      ],
      distractors: ["ALL", "SUM", "id", "ASC"],
      walkthrough:
        "A staged manifest: three-table chain, one fold, the fan-out made visible. The join walks partners to their custody SKUs to their transfer lines — each line repeats its SKU, so GROUP_CONCAT(DISTINCT p.name) is the dedup that matters: Nordic folds to exactly 'Mechanical Keyboard K1,Smart Watch S,4K Webcam Pro' — the raw comma-joined cell — while the bare fold would print 43 entries for Nordic's 43 lines. The count columns then argue the grains in one row: COUNT(*) reads the line grain (Nordic 43, Midwest 56, Alpine 40, Andes 25, Shenzhen 47, Pacific 40 — the probed ladder), COUNT(DISTINCT oi.order_id) reads cycles touched (38 / 45 / 34 / 25 / 41 / 35), and ROUND(SUM(oi.quantity * oi.unit_price), 2) reproduces the routed-value board exactly — 11,130.25 / 9,294.93 / 4,765.63 / 3,613.25 / 3,049.07 / 2,980.15, biggest first. The distractors each break differently: ALL in the dedup slot is the default and reproduces the line-grain repetition — a manifest of 43 names nobody reads; SUM in that slot is a rejected aggregate inside GROUP_CONCAT; id in the partner key mis-pairs SKUs to venues by row-id coincidence; ASC opens the runbook on Pacific instead of the 32% partner. Three grains, one dedup, and the concentration read the failover runbook actually ships.",
    },
    {
      id: "cs-fireblocks-3",
      tier: "medium",
      topic: "t7",
      universe: "month-close",
      title: "The monthly settlement spine",
      brief:
        "Fireblocks-flavored brief on the storefront db: treasury's month-close packet opens with the settlement spine — booked cycle value per month, with each month's movement against the prior month read as a LAG delta. Probed facts: the spine runs 14 buckets, 2024-01 to 2025-02; it opens at 3,731.97 in January 2024, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November. Cycles per month hold a 6-9 band, so the value walk is a demand story, not a load story. The first row's delta is NULL by definition — the baseline — and the packet prints it as NULL, never as a coalesced zero.",
      ask: "Return each month with its cycle count, booked value and the month-over-month delta to 2 decimals — chronological order.",
      template:
        "SELECT STRFTIME({1}, created_at) AS month,\n       COUNT(*) AS cycles,\n       ROUND(SUM(total), 2) AS booked,\n       ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY STRFTIME('%Y-%m', created_at)), {2}) AS delta\nFROM orders\nGROUP BY month\nORDER BY month {3};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month key",
          why: "Year plus zero-padded month keeps all 14 buckets distinct. '%m' alone merges January 2024 with January 2025 — the spine collapses to 12 rows and the trend becomes fiction.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the delta precision",
          why: "Deltas print to cents — -122.33, -992.56, +1,158.21 — so the walk reconciles against the month books it differences. ROUND to 1 decimal prints -1,326.9 and the packet stops matching the treasury grid.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A walk reads forward: 3,731.97 first, trough, jump, drop. DESC hangs the spine upside down — deltas still point at the same months, but the story is unreadable and the LAG's baseline row prints last.",
        },
      ],
      distractors: ["'%m'", "'%Y'", "1", "DESC", "LEAD"],
      walkthrough:
        "One table, one window, one walk. STRFTIME('%Y-%m', created_at) builds the 14-bucket spine — year plus month, so January 2024 and January 2025 stay distinct — and GROUP BY month folds each bucket to its cycle count and booked value. The delta column is where the window lives: LAG(SUM(total)) OVER (ORDER BY month) reaches back one bucket, and the outer ROUND keeps the movement in cents — 2024-02 reads -122.33 against January's 3,731.97, the trough lands in July at 1,193.86 after -853.57, and August's +1,158.21 is the single biggest jump before November's -1,326.87 is the steepest drop. The first row's delta is NULL by definition — there is no December 2023 to difference against — and the packet prints it as the baseline rather than coalescing a zero nobody measured. The distractors each break differently: '%m' merges the two Januaries and the spine loses a dimension silently; '%Y' collapses to two rows — 2024 and 2025 — a trend of nothing; 1 in the precision slot shaves the cents off every delta; DESC flips the walk so the baseline row prints last; LEAD in the window would point the walk forward and sign-flip every movement. Spine, window, edge row — the three places trend reports go wrong, all three visible in one query.",
    },
    {
      id: "cs-fireblocks-4",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The never-collected register",
      brief:
        "Fireblocks-flavored brief on the storefront db: billing's month-close artifact is the never-collected register — fee statements carrying zero settlement legs, refreshed before a single reminder ships. Probed facts: 6 of 28 statements have no legs at all, worth 15,217.00 face — #24 (open, 4,937.00) leads, then #26 (3,562.00), #27 (2,794.00), #28 (paid, 1,756.00 — the paid claim with nothing behind it), #21 (1,295.00), #18 (873.00). The anti-join is the shape: statements LEFT JOIN legs, keep the NULL side. The register reads biggest exposure first, dollars to 2 decimals off INTEGER cents, and the paid-status row is the anomaly that gets walked to compliance, not billing.",
      ask: "Return each statement with no settlement legs — its id, status and dollar amount to 2 decimals — biggest amount first.",
      template:
        "SELECT i.id AS statement_id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS dollars\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {2}\nORDER BY dollars {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements store INTEGER cents; the dollar read is amount_cents / 100.0 — 493700 cents prints 4,937.00. The missing .0 is the classic unit bug: /10.0 prints 49,370 and the register overstates exposure tenfold.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the anti-join keeper",
          why: "p.id IS NULL keeps exactly the statements the join found no legs for — the 6-row register. IS NOT NULL inverts it into the 22 funded statements, the mirror population the coverage census counts.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure direction",
          why: "The register reads biggest first: #24 at 4,937.00 down to #18 at 873.00. ASC opens the packet on the smallest misfit — the one that can wait — and buries the paid-claim lie mid-page.",
        },
      ],
      distractors: ["NOT NULL", "10.0", "ASC", "1"],
      walkthrough:
        "One LEFT JOIN, one NULL test, one direction — the anti-join is the whole shape. The join attaches every settlement leg to its statement; the fan-out is harmless here because the WHERE throws leg rows away — p.id IS NULL keeps exactly the left-side rows that matched nothing: 6 statements, 15,217.00 of face. The register reads biggest-first, and the order itself is the finding: #24 (4,937.00) and #26 (3,562.00) are ordinary open exposure, but #28 at 1,756.00 says 'paid' while sitting in a no-legs register — a status that lies, which is why leg rows are the ledger of record and the status column is a claim. The cents divider carries the money rule: amount_cents / 100.0, real arithmetic, ROUND(..., 2) on the way out — 493700 cents prints 4,937.00, not 4,937. The distractors each break differently: NOT NULL inverts the anti-join into the 22 funded statements — the mirror census, a correct query for a different desk; 10.0 prints 49,370.00 and 35,620.00 — exposure overstated tenfold, the register that pages nobody because every number looks plausible; 1 in the divider prints raw cents as dollars; ASC opens on #18 and hides the paid-claim anomaly in the middle of the page. Six rows, one of them lying, and the query that proves it is three lines long.",
    },
    {
      id: "cs-fireblocks-5",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The transfer-size bands",
      brief:
        "Fireblocks-flavored brief on the storefront db: the network pod bands the transfer book by cycle size before every concentration read — micro-sweep vault fees under 100, standard transfers to 500, block settlements above. Probed facts: the CASE folds all 103 cycles into 25 block cycles worth 17,379.43 (695.18 average), 63 standard worth 16,585.19 (263.26) and 15 micro-sweeps worth 868.66 (57.91) — the bands reconcile to 103 by construction, and the block band's 695.18 average against the micro arm's 57.91 is the tiering story in one row. Edges come off the published policy ladder, so the query quotes them verbatim; the review reads biggest band by booked value first.",
      ask: "Return each size band with its cycle count, booked value and average cycle to 2 decimals — biggest booked value first.",
      template:
        "SELECT CASE\n         WHEN total < {1} THEN 'micro-sweep'\n         WHEN total < {2} THEN 'standard'\n         ELSE 'block'\n       END AS band,\n       COUNT(*) AS cycles,\n       ROUND(SUM(total), 2) AS booked_value,\n       ROUND({3}(total), 2) AS avg_cycle\nFROM orders\nGROUP BY band\nORDER BY booked_value {4};",
      slots: [
        {
          answer: "100",
          kind: "number",
          noVerify: true,
          label: "the micro-sweep edge",
          why: "The policy ladder's first edge: vault-fee sweeps sit under 100. Moving it to 50 re-bands 7 cycles into standard and the count census stops matching the published band map — an edge nobody wrote down is a band nobody can defend.",
        },
        {
          answer: "500",
          kind: "number",
          noVerify: true,
          label: "the block-settlement edge",
          why: "The second edge: standard runs to 500 and block begins there — the arm that catches the 1,088.44 enterprise cycle. The edges quote the policy engine's ladder verbatim; a moved edge re-bands the book silently.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the band-average fold",
          why: "The tiering story is the average per band: 695.18 block against 57.91 micro-sweep. SUM would print each band's whole book under the average's name; MAX would print the biggest single cycle (1,088.44) as a band 'average' nobody can defend.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-band-first direction",
          why: "The review reads biggest band on top: block 17,379.43, standard 16,585.19, micro-sweep 868.66. ASC opens the meeting on vault fees — a correct query aimed at the wrong end of the ladder.",
        },
      ],
      distractors: ["SUM", "MAX", "50", "ASC"],
      walkthrough:
        "One table, one CASE, one fold — banding is policy written as SQL. The CASE arms evaluate top to bottom with ascending edges — under 100 is a micro-sweep, 100 to 500 standard, 500 and above block — and GROUP BY band folds each arm into a count, a book and an average: 25 blocks / 17,379.43 / 695.18, 63 standard / 16,585.19 / 263.26, 15 micro-sweeps / 868.66 / 57.91. The reconciliation check is the banding proof: 25 + 63 + 15 = 103 by construction, and the ELSE arm guarantees nothing escapes — a band census that cannot sum to the book is a hole in the CASE, which on a policy engine's db is a finding. The averages carry the tiering read: block cycles average twelve times a micro-sweep, and the block band exists because one 1,088.44 enterprise settlement outweighs forty-two micro-sweeps combined. The distractors each break differently: SUM in the average slot prints the band's whole book (17,379.43) under an average's name; MAX prints the largest single cycle per band and hides the band's shape; 50 in the micro edge re-bands 7 cycles into standard — same total book, different counts, a silent policy change; ASC inverts the read and opens the review on the 868.66 band. Edges in order, fold by band, direction by risk — the three things the pod actually argues about.",
    },
    {
      id: "cs-fireblocks-6",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Fireblocks-flavored brief on the storefront db: the custody-ops morning check is the one-pass fate census — every market's transfer book with its full fate decomposition in a single scan, so the rows reconcile to 103 by construction before standup. Probed facts: EU runs 45 cycles (24 settled, 12 broadcast, 6 awaiting, 3 rejected), APAC 37 (21 / 8 / 5 / 3), US 19 (5 / 10 / 3 / 1), LATAM 2 (2 / 0 / 0 / 0) — fate columns sum to market totals everywhere, and the settled columns sum to 52 platform-wide. FILTER (WHERE ...) keeps every row in play while each count sees only its own population; booked value rides along at cents precision and the census reads biggest market first.",
      ask: "Return each market with its cycle count, settled, broadcast, awaiting-approval and rejected counts, plus booked value to 2 decimals — most cycles first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS cycles,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS settled,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS broadcast,\n       COUNT(*) FILTER (WHERE o.status = 'pending') AS awaiting,\n       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS rejected,\n       ROUND(SUM(o.total), {2}) AS booked_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY cycles {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled-status literal",
          why: "The fate map fixes settled = 'delivered' — 52 platform-wide, 24 of them in EU. 'cancelled' in this slot turns the settled column into the rejection map (3 / 3 / 1 / 0) — a different report wearing the same header, and the reconciliation still sums because every fate column self-reconciles by construction.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the cents precision",
          why: "Booked value prints to cents — 15,089.23 / 11,605.45 / 7,286.16 / 852.44 — so each market row reconciles with the coverage census the network pod memorized. ROUND to 1 prints 15,089.2 and the two artifacts stop agreeing row for row.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market direction",
          why: "The census reads load on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the morning check on LATAM's 2-cycle pilot and buries the 45-cycle market that owns the reconciliation argument.",
        },
      ],
      distractors: ["'cancelled'", "ASC", "1"],
      walkthrough:
        "One scan, five conditional folds, zero row loss — FILTER is the whole architecture. The join attaches each cycle to its market, GROUP BY region folds 103 cycles into four rows, and the four FILTER counts read the fate map without shrinking each other: EU's row reads 45 cycles, 24 settled, 12 broadcast, 6 awaiting, 3 rejected — and 24 + 12 + 6 + 3 = 45, the row summing to itself, the reconciliation that makes this census the morning artifact. The platform identity rides on top: the settled column sums to 52, broadcast to 30, awaiting to 14, rejected to 7 — 103 by construction, the funnel's headline read enforced by the shape of the query rather than by a checker script. Booked value folds alongside at cents precision (15,089.23 / 11,605.45 / 7,286.16 / 852.44) because ops reads exposure beside fate — LATAM's 852.44 sits next to two settled cycles, which is why the pilot conversation is about coverage, not value. The distractors each break differently: 'cancelled' in the settled slot re-aims the report at rejection — a real map, but the header still says settled and the 52-settled reconciliation silently becomes a 7-rejected one; 1 in the precision slot shaves the cents off every booked value and breaks the row-for-row match with the coverage census; ASC buries the load story at the bottom of the page. One pass, four filters, and every number in the row answers to the row next to it.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "The transfer funnel is Fireblocks' headline read — cycle initiated, quorum cleared, broadcast stamped, settled. This problem drills the conditional-count shape the custody dashboard uses every single week." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of signed clients that actually broadcast a transfer out of all bookings — a distinct-count share with the denominator stated, the coverage register's weekly pulse." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Clients running cold-storage vaults but no trading workspace — the cross-sell map. Multi-SKU possession with an exclusion arm is exactly the workspace-coverage read the network pod runs quarterly." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Which client initiates the most transfer cycles — 24 on this db, with a tie policy attached. Argmax over a fold plus a named tie-breaker is the leaderboard screen." },
    { slug: "confirmation-rate", why: "Quorum confirmation rates per counterparty — approved movements over attempted ones. A venue whose confirmations drift is a network incident before it is a support ticket." },
    { slug: "transaction-velocity", why: "Velocity bursts — transfers per client inside tight windows — are the policy engine's compliance screen. Window counts over timestamps, thresholds stated, exactly this shape." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window sweeps over movement sequences are how the travel-rule monitoring actually works: flag patterns across adjacent transfers, not isolated rows." },
    { slug: "investments-in-2016", why: "Transfers meeting multiple conditions at once (settled status AND market AND window) — the multi-predicate gate that separates a coverage count from a coincidence." },
    { slug: "game-play-analysis-iv", why: "Fraction of clients broadcasting again the day after their first settled cycle — a next-day re-entry rate with the denominator stated, the client-health shape the coverage dashboards use." },
    { slug: "customer-order-frequency", why: "Clients with at least three transfer cycles in a window — the HAVING-gate cohorting the network pod uses to pick which logos get dedicated coverage engineers." },
    { slug: "top-travellers", why: "Per-client routed-value ladders — SUM of line value per client, ranked. The concentration read that decides which clients get named failover owners." },
    { slug: "number-of-employees-who-met-the-target", why: "Daily broadcast targets met per market — conditional counting over a threshold, the shape of the custody-ops morning check." },
    { slug: "find-followers-count", why: "Counts per node — which liquidity partner each client routes through and how many cycles ride on it. The settlement network is a follower graph wearing a custody license." },
    { slug: "product-price-at-a-given-date", why: "The per-unit rate in force as of the cycle date — pricing that changed mid-window. As-of logic is how the billing desk reconstructs what a movement should have cost." },
    { slug: "find-churn-risk-customers", why: "Clients with no broadcast since a cutoff date — the dormant-workspace sweep. Anti-join plus date math is how the coverage register flags at-risk logos before the renewal call." },
    { slug: "countries-you-can-safely-invest-in", why: "Counterparty coverage ratios — venues whose share and rating both clear a floor. A ratio gate with a stated denominator is the risk screen this kit keeps teaching." },
    { slug: "circular-transfers", why: "Settlement loops — value routed through a chain of venues and back to its origin. Self-join cycle detection is how the network pod flags circular flows the travel rule cares about." },
    { slug: "portfolio-concentration-hhi", why: "Counterparty concentration is THE venue-risk line here — a 32% top partner and 58.7% top-two share. An HHI fold over the ranked distribution is the concentration read made mechanical." },
    { slug: "settlement-fails-aging", why: "In-flight cycles age like failed settlements: 30 rows stamped-but-unsettled, bucketed by days since broadcast. Aging ladders over the shipped_at clock are the custody-ops escalation triage." },
    { slug: "journal-gap-detection", why: "ledger_entries is the GL and gaps are incidents. Sequence-gap detection over journal ids is how the close proves no line went missing before the trial balance is trusted." },
    { slug: "trial-balance-check", why: "The close ships on 181,080 against 181,080, delta zero. This conditional-sum check is the cheapest proof in SQL and the habit the billing desk drills weekly." },
    { slug: "monthly-transactions-i", why: "Fee statements bucketed by month with status counts — the statement-spine read bill-pay re-cuts every close. Conditional counts over a month key, the exact shape." },
    { slug: "bank-account-summary", why: "Vault-style balance walks — deposits in, settlements out, running position per client. The deposit-withdrawal fold is the custody cash view in one query." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Escalating transfer patterns are a travel-rule screen: same counterparty, amounts stepping up. Adjacent-row comparison over a window is exactly how the monitor works." },
    { slug: "odd-and-even-transactions", why: "Parity-style banding of settlement legs — id and amount CASE cuts that reconcile the leg census. The discipline of an exhaustive two-arm split, reconciled by construction." },
    { slug: "calculate-parking-fees-and-duration", why: "Value sitting in a vault accrues cost by the day — duration math over timestamps with tiered fees is the same shape as dwell-time billing on the custody book." },
    { slug: "the-blunder", why: "The classic AVG-over-text truncation bug is the cents-discipline story wearing a costume: one CAST mistake and every fee statement reads wrong. The screen that proves you read the schema first." },
    { slug: "nth-highest-salary", why: "The Nth-largest transfer cycle — value ladders with tie policies attached. Offset-based nth logic is how the tiering thresholds get picked off the distribution." },
    { slug: "second-highest-salary-ii", why: "The runner-up venue read: Midwest 9,294.93 behind Nordic's 11,130.25. Second-place logic with a NULL-if-absent answer is the concentration bench in miniature." },
    { slug: "late-arriving-restatement", why: "Broadcast stamps arrive after the fact and restate the cycle. Late-arrival handling — keep the original, flag the restatement — is exactly how the shipped_at backfill gets audited." },
    { slug: "point-in-time-asof", why: "Fee rates change mid-window; billing reconstructs what a movement SHOULD have cost as of its broadcast date. As-of joins are the back-pricing screen the billing desk owns." },
    { slug: "fx-exposure-report", why: "Cross-venue exposure per market bucket — value routed by region and rail. Exposure-by-dimension folds are the settlement network's weekly risk read." },
  ],
};
