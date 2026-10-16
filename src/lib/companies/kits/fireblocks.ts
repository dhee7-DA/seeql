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
// rows only, no w*/d*/f* rows) and say so.
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
    "Preparation strategy: the pools file carries no Fireblocks section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: transfer-fate censuses, two-grain coverage counts, liquidity-partner folds, CASE banding and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:market coverage census} the network pod opens Monday with, the other rebuilds the {violet:partner manifest} the counterparty review ships every quarter. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["active-businesses", "create-a-session-bar-chart", "immediate-food-delivery-i"],
    },
    {
      name: "Two-grain market censuses",
      why: "Transfer cycles and institutional clients are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining clients to transfer cycles",
      why: "Clients carry market and created_at; transfer cycles inherit them through joins, and the join type decides who survives. A cycle without a client row is corruption; a client without cycles is an unfunded workspace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Liquidity-partner leaderboards",
      why: "Exchange partners are ranked by routed value — Nordic 11,130.25 leads Midwest 9,294.93 with a 47-line Shenzhen bench below — and rank semantics are a policy about peer venues. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is exactly the argument a counterparty review settles out loud.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary"],
    },
    {
      name: "Quorum banding with CASE",
      why: "Workspace tiers and approval policies are CASE-classified — cold-storage, trading, treasury — with fixed edges the policy engine publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the vault register, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "type-of-triangle"],
    },
    {
      name: "Broadcast clocks & LAG walks",
      why: "The broadcast clock (created_at → shipped_at, 2.98-day average over the 82 stamped) and the 14-month cycle spine (2024-01 to 2025-02) are the latency call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Reachability set algebra",
      why: "Network packs stack populations — settled under rejected, this quarter beside last — and EXCEPT answers 'which signed clients never broadcast a transfer'. UNION dedups whole rows silently, which makes it a correctness question, not a style one; a failover runbook that loses a client to a silent dedup is an audit finding.",
      slugs: ["customers-who-never-order", "the-airport-with-the-most-flights", "team-scores-in-football-tournament"],
    },
    {
      name: "Cohort subqueries & quorum gates",
      why: "Screens escalate into staging: fold per-client cycle counts, then judge them against a computed platform mean (6.44 here — exactly four clients clear it), or gate a partner bench with a HAVING-derived IN-list the way the network pod does. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "Fee-statement cents discipline",
      why: "Settled is not collected — the finance tables (28 fee statements, 27 settlement legs, INTEGER cents) are where the custody world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the billing desk's Monday read.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Manifest folds & GROUP_CONCAT",
      why: "The counterparty review ships a per-partner asset manifest — the exact SKUs each venue routes — and GROUP_CONCAT is where the join fan-out becomes visible in a string cell: a partner folds to 3 deduplicated SKU names while its transfer lines number 43. DISTINCT inside the fold, separator discipline and row-order caveats are the craft.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "concatenate-the-name-and-the-profession"],
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
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the three-way tie at 4 consuming ranks 6 through 8, and the next distinct count (3) lands on 9, implying two phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which client's coverage engineer gets staffed first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer clients (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. On a concentration-driven book this is not cosmetics: the rung order decides whose coverage review moves up the calendar, and a reranked board that shuffles between renders is how trust in the analytics org dies.",
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
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the three-way tie at 4 consumes ranks 6 through 8, so the next distinct count lands on 9. All 3-cycle clients share rank 9.",
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
  ],
};
