// Tink — Wave-10 (Task 100-tink), fintech domain, 0 tagged pool rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12; wave-8+9 canonical cells section
// quoted where marked; case slots mechanically verified by scripts/case-audit.ts against
// db/custom.db).
// Open-banking-rails SQL: the storefront db read as a connectivity sandbox — customers are
// connected fintech/merchant clients (region = market bucket: EU core out of the Stockholm
// HQ, APAC + US expansion pilots), orders are API agreement cycles (delivered = live
// connections 52, shipped = onboarded with shipped_at as the go-live stamp 30, pending = in
// KYC/contracting 14, cancelled = revoked 7), order_items are API call-line records
// (quantity = calls, unit_price = per-call rate), products are the API product shelf
// (aggregation, payment initiation, data enrichment; db category codes = product families),
// suppliers are bank/pISP connectivity partners, invoices are usage billing statements,
// payments are settlement legs on two rails (card vs wire), expenses are platform opex,
// ledger_entries is the GL. Finance tables store INTEGER cents — dollar read =
// amount_cents/100.0; orders.total and order_items.unit_price are REAL dollars. Angle kept
// distinct from plaid.ts: European open-banking rails, PSD2 licensing framing, bank-coverage
// economics. Pool provenance: company-pools.md carries NO Tink section — all 10 topic slug
// sets and all 16 problems are theme-curated from the pools file's SQL theme menu (sql rows
// only, no w*/d*/f* rows) and say so.
//
// NOTE for the wave-10 registry wiring agent: Tink is NOT yet in registry COMPANY_META.
// Header fields authored as id "tink", domainId "fintech", name "Tink", tagline
// "European open-banking rails: coverage, aggregation, payment initiation", accent
// text-blue-300 (unused by all 20 fintech siblings) — wire COMPANY_META to match exactly.

import type { CompanyKit } from "../types";

export const tinkKit: CompanyKit = {
  id: "tink",
  domainId: "fintech",
  name: "Tink",
  tagline: "European open-banking rails: coverage, aggregation, payment initiation",
  accent: "text-blue-300",

  brief: [
    "**Tink** is the European open-banking platform — Stockholm-born, Visa-owned — that pipes account data and payment initiation between **3,400+ banks** and the lenders, fintechs and merchants built on them. The product is {sky:PSD2} connectivity: account aggregation, payment initiation and the enrichment layer that turns raw transactions into categories and income checks. On this storefront db the mapping is honest: customers are connected clients, orders are API agreement cycles worth **34,833.28** across 103 rows, order_items are call lines (251 of them — a cycle averages 2.44), and the status map is fixed — delivered = live connection (52), shipped = onboarded with shipped_at as the go-live stamp (30), pending = in KYC/contracting (14), cancelled = {rose:revoked} (7).",
    "The data org splits into connectivity engineering, partner coverage and a small billing-analytics pod, and all three read the same spine at different grains. The go-live clock is the heartbeat: an agreement books on signing, and `shipped_at` is stamped the day the connection actually goes live — **82 of 103 cycles** carry the stamp, averaging **2.98 days** to go live across a 2–4-day spread, and the 14 pending rows have none yet (a population definition, not a cleanup job). Bank-coverage economics is the second story: six bank/pISP partners carry the processed book and the top one owns **32%** of value — a Nordic platform outage is a quarter-end event, not a ticket. Money sits one layer down: 28 usage invoices against 27 settlement legs, INTEGER cents, dollar read `amount_cents / 100.0`.",
    "Interview screens are census-then-coverage. A typical loop opens with a **two-grain market census** — EU runs 45 agreement cycles from 8 clients (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do revoked cycles count in your base?'*), then into the bank-coverage bench where a breadth gate (partners carrying three API products) separates the fold from the fan-out. Late rounds walk the {sky:14-month cycle spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Tink section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: connection-fate censuses, two-grain market counts, bank-coverage folds, CASE tier banding and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:connection fate census} connectivity ops opens Monday with, the other rebuilds the {sky:coverage bench} the partner-coverage pod ships at every quarter close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the go-live census. A connectivity-ops analyst opens the coverage dashboard before standup: did overnight agreement cycles land, did any client get its `shipped_at` go-live stamp without a named onboarding owner, does the one-pass fate census reconcile — 52 live + 30 onboarded + 14 in KYC + 7 revoked = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If go-live latency drifts off the **2.98-day** norm, the onboarding queue gets pulled before the partner-coverage weekly read ships.",
    "**11:30 —** Midday is the coverage deep-dive. Partner coverage wants the bank bench re-cut — which connectivity partners clear the **three-API-product breadth gate** and which (Alpine, Andes at two each) sit below it; client success wants the two-grain census beside client counts (EU 45-from-8 versus US 19-from-2); a market lead wants the revocation map where APAC's {rose:8.1%} leads. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the coverage-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected usage statements worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Live-connection rate", what: "Delivered (live) cycles ÷ ALL agreement cycles booked: 52 of 103 (50.5%). The funnel's headline — the 30 onboarded-but-still-ramping cycles are 'not yet live', never a silent zero in the base." },
    { name: "Go-live latency", what: "Signing to go-live (created_at → shipped_at) over the 82 stamped cycles only: 2.98-day average, range 2–4. The onboarding SLA every bank-partnership contract quotes — open cycles have no clock yet and must not dilute it." },
    { name: "Revocation share", what: "Revoked cycles ÷ all booked: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The coverage map that decides where the partnership team spends its quarter." },
    { name: "Agreement book value", what: "Total cycle value booked: 34,833.28 across 103 cycles, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 enterprise cycle outweighs the smallest 42 combined." },
    { name: "Call lines per cycle", what: "API call lines ÷ agreement cycles: 251 lines across 103 cycles = 2.44. Depth of usage per connection — a client that fires one call and stops is a different failure mode from one that runs the full aggregation chain." },
    { name: "Bank-coverage concentration", what: "Share of processed value by connectivity partner: the top bank partner carries 32%, the top two 58.7%. Coverage risk is a concentration metric before it is a latency metric — it staffs the partner-engineering pod." },
    { name: "Usage-billing coverage", what: "Statements settled exact / partial / none: 21 / 1 (4,000 of 6,148) / 6 worth 15,217. The AR anti-join the billing pod refreshes every close — reconciliation to 28 statements by construction." },
    { name: "Settlement rail mix", what: "16 card settlement legs worth 37,364.00 versus 11 wire legs worth 32,248.00. The rail split behind the usage bill — a drift here is bank-behavior change, not rounding noise." },
  ],

  topics: [
    {
      name: "Connection-fate conditional counts",
      why: "Every Tink connectivity screen opens with the fate census: cycles booked, live (delivered), onboarded with the go-live stamp, in KYC, revoked. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an onboarded cycle 'live' — 30 versus 52 on this db.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "count-salary-categories"],
    },
    {
      name: "Two-grain market censuses",
      why: "Agreement cycles and clients are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining clients to agreement cycles",
      why: "Clients carry market and created_at; agreement cycles inherit them through joins, and the join type decides who survives. A cycle without a client row is corruption; a client without cycles is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Bank-coverage leaderboards",
      why: "Connectivity partners are ranked by processed value — Nordic 11,130.25 leads Midwest 9,294.93 with a 40-line Shenzhen bench below — and rank semantics are a policy about peer banks. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is exactly the argument a coverage review settles out loud.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Product-family banding with CASE",
      why: "The API product shelf — aggregation, payment initiation, data enrichment — is CASE-classified into families with fixed edges the PSD2 register publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the coverage register, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "type-of-triangle"],
    },
    {
      name: "Go-live clocks & LAG walks",
      why: "The go-live clock (created_at → shipped_at, 2.98-day average over the 82 stamped) and the 14-month cycle spine (2024-01 to 2025-02) are the latency call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Reachability set algebra",
      why: "Coverage packs stack populations — live under revoked, this quarter beside last — and EXCEPT answers 'which signed clients never went live'. UNION dedups whole rows silently, which makes it a correctness question, not a style one; a bank directory that loses a client to a silent dedup is an audit finding.",
      slugs: ["customers-who-never-order", "the-airport-with-the-most-flights", "team-scores-in-football-tournament"],
    },
    {
      name: "Cohort subqueries & tier gates",
      why: "Screens escalate into staging: fold per-client cycle counts, then judge them against a computed platform mean (6.44 here — exactly four clients clear it), or gate a bench with a HAVING-derived IN-list the way the coverage pod does. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "Usage-billing cents discipline",
      why: "Connected is not collected — the finance tables (28 invoices, 27 settlement legs, INTEGER cents) are where the connectivity world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the billing pod's Monday read.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Directory hygiene & consent windows",
      why: "Bank directories arrive dirty — name casing splits one partner into two, and a bank that sorts above another by string accident reshuffles the coverage bench between renders. Consent windows add the date math: access lives in bounded windows, and half-open interval filters are how the register stays honest.",
      slugs: ["fix-names-in-a-table", "users-with-two-purchases-within-seven-days", "queries-quality-and-percentage"],
    },
  ],

  theory: [
    {
      id: "tink-t1",
      q: "Your coverage report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a cycle column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins agreement cycles to clients: a cycle with no client row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from clients: the clients with no agreement cycles ARE the answer, arriving with NULL cycle columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload client row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-connecting clients, and proving that zero is itself the analyst's job: all 16 clients appear in the cycle table somewhere. Under PSD2 the stakes are regulatory — a coverage register that silently drops a signed client is not a report bug, it is a licensing misstatement, so the join type is written down like a control.",
      tag: "joins",
    },
    {
      id: "tink-t2",
      q: "Four clients tie at 4 agreement cycles on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose onboarding pod gets headcount. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer clients (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. Bank-coverage benches get screenshot into partnership decks; a ladder that reshuffles between renders because the tie-break was implicit is how two teams end up quoting different numbers in the same meeting.",
      tag: "windows",
    },
    {
      id: "tink-t3",
      q: "The census shows 103 agreement cycles and 16 clients; EU shows 45 cycles and 8 clients. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts cycle rows after the join — one row per agreement cycle, so a client with 24 cycles contributes 24. COUNT(DISTINCT customer_id) folds those rows back to clients — EU's 45 cycles collapse to 8 logos. Neither is wrong: cycles measure connectivity load and expansion momentum, clients measure installed base and market coverage. The ratio — 5.6 cycles per client in EU versus 9.5 in the US on this db — is the intensity signal that decides whether coverage is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for call lines and COUNT(*) silently counts call lines, not cycles — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, and at an open-banking platform it doubles as the PSD2 reporting habit: every register states whether it counts institutions, agreements or calls, because the regulator asks exactly that follow-up.",
      tag: "aggregation",
    },
    {
      id: "tink-t4",
      q: "shipped_at is NULL until a client's connection goes live. What is your policy for the go-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only go-live-stamped cycles have a latency, so the report measures signing-to-go-live for the 82 of 103 cycles that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 in-KYC plus 7 revoked cycles, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day go-lives for connections that have not been built, and at a bank-connectivity company a fake zero-day go-live is a compliance-sounding fiction. A report whose WHERE clause is doing definitional work without saying so is exactly what a Tink reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "tink-t5",
      q: "The coverage review wants live-connection value per market for markets carrying at least ten agreement cycles. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards onboarded, in-KYC and revoked rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-cycle floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor is a market-size gate: EU 45, APAC 37 and US 19 clear it while LATAM's 2 cycles drop out — and that drop is a statement about the LATAM pilot, so the gate belongs in the deck footnote, not hidden in a clause. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a coverage line and an error, and between a threshold applied to cycles versus to booked value. The strong answer places every filter by asking: is this a fact about one cycle, or about a market?",
      tag: "pipeline",
    },
    {
      id: "tink-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 cycles always produce a mean (6.4375 cycles per client, 6.44 rounded — exactly four clients clear it). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each cycle to ITS client's average) re-runs per outer row and answers a different question at a different cost. And when the inner query feeds an IN-list — the way a coverage bench gate does — remember that NOT IN over a column that can carry NULL poisons every comparison: one NULL supplier_id in the inner fold empties the bench while looking like an all-clear. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "tink-t7",
      q: "The cycle trend buckets agreements by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's signings, and quarter-end is exactly when banks push contract volume through. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The same half-open discipline guards the go-live clock: julianday(shipped_at) minus julianday(created_at) only exists for the 82 stamped cycles, and a quarter cut that lets unstamped NULLs through turns a 2.98-day SLA into a NULL-shaped hole. Date discipline is coverage discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "tink-t8",
      q: "Billing says a usage statement is 'paid' but the settlement table has no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why settlement rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "tink-mcq-1",
      prompt: "An agreement cycle's status reads 'delivered'. In this kit's Tink stage map, what happened?",
      choices: ["Live — the connection is serving traffic and counts as live", "Onboarded — go-live stamped, still ramping", "Revoked — client pulled the agreement", "In KYC/contracting — no go-live stamp yet"],
      answer: 0,
      why: "The stage map is fixed: delivered = live connection (52 of 103 cycles, 50.5%). It is the only status where the connection is actually serving.",
      notes: [
        { choice: 1, why: "Onboarded is 'shipped' — 30 cycles carry the go-live stamp but have not reached the live state. Calling them live inflates the connectivity rate before a single ramp finishes." },
        { choice: 3, why: "In-KYC is 'pending' — 14 cycles with no shipped_at yet. Pending is not revoked and not live; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-2",
      prompt: "Go-live rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 stamped, 14 in-KYC and 7 revoked of 103 booked.",
      choices: ["Stamped + revoked only (82/89 = 92.1%)", "All cycles booked (82/103 = 79.6%)", "Delivered cycles only (52/82)", "Distinct clients (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL cycles booked — in-KYC cycles stay in the denominator because 'not yet live' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 in-KYC inflates the rate to 92.1% by deleting the population still in contracting — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is the live state, shipped_at is the go-live stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-3",
      prompt: "EU carries 45 agreement cycles from 8 clients. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts cycle rows (45); COUNT(DISTINCT customer_id) folds repeats back to clients (8). The gap between them — 5.6 cycles per client — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cycle has a client. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not clients — a third grain nobody asked for. The census is cycles AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to revoked cycles only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the revocation share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the revocation map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-5",
      prompt: "Keep only markets carrying at least 10 agreement cycles. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 10", "WHERE cycles >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A cycle-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU 45, APAC 37 and US 19 clear the bar; LATAM's 2 cycles drop out of the coverage table.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'cycles' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-6",
      prompt: "The client ladder runs 24, 17, 14, 13, 5 cycles, then FOUR clients tied at 4. Under RANK, what rank do the two 3-cycle clients carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-cycle clients share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The bench's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The in-KYC cycles double-counted their signing day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 cycles.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-8",
      prompt: "A staging-table bank directory uses partner_id NOT IN (SELECT supplier_id FROM agreements WHERE status = 'revoked') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL supplier_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the directory empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every agreement carries a supplier link. But staging tables are exactly where NULLs sneak in, and empty coverage registers ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "tink-mcq-9",
      prompt: "A coverage bench folds partners from suppliers → products → order_items. One reviewer counts 43 for Nordic, another counts 3. Both ran COUNT. What explains it?",
      choices: ["One of them queried a stale replica", "COUNT(*) over the joined chain counts call-line rows (43) while COUNT(DISTINCT p.id) counts API products (3) — the join fanned out and the two COUNTs measure different grains", "COUNT(DISTINCT) is broken in SQLite and returns the wrong value", "Nordic actually has 43 API products; the 3 comes from a LIMIT"],
      answer: 1,
      why: "The chain fans out: each API product repeats once per call line that touches it, so COUNT(*) reads the line grain (43) and COUNT(DISTINCT p.id) reads the product grain (3). Both numbers are real; only one answers 'how broad is this partner's coverage'.",
      notes: [
        { choice: 2, why: "COUNT(DISTINCT) is fine — the discrepancy is the fan-out, not the function. Blaming the engine is how the wrong grain ships to the partnership deck." },
        { choice: 3, why: "No LIMIT involved — 43 is the call-line count on this db, a legitimate number that answers a different question than breadth." },
      ],
      difficulty: "hard",
    },
    {
      id: "tink-mcq-10",
      prompt: "A dashboard walks settled billing exposure: SUM(leg_amount) OVER (ORDER BY posted_at). Two legs share a posted_at second, and the cumulative 'jumps two legs at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict leg-by-leg walk", "Rounding accumulated on the tied legs and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so legs tied on posted_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly leg by leg. On a month spine ties are rare; at settlement-leg grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous leg's value, not the running balance — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-tink-1",
      tier: "easy",
      topic: "j2",
      universe: "funnel",
      title: "The connection fate census",
      brief:
        "Tink-flavored brief on the storefront db: Monday's connectivity-ops review opens with the fate census — every market's agreement book split live / onboarded / in-KYC / revoked, with the market's total load beside each row so the shares are computable on sight. Probed facts: 103 cycles split delivered 52 / shipped 30 / pending 14 / cancelled 7; the status-by-market grid reads EU 24/12/6/3 of 45, APAC 21/8/5/3 of 37, US 5/10/3/1 of 19, LATAM 2/0/0/0 of 2. Revocation share is the coverage read: APAC 8.1, EU 6.7, US 5.3, LATAM 0. Ops reads markets biggest-book-first, and every market's arms must reconcile to its load by construction.",
      ask: "Return each market's status arms with cycle counts plus the market's total load beside every row — biggest book first, revocation share to 1 decimal.",
      template:
        "SELECT c.region AS market,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS live,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS onboarding,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS in_kyc,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS revoked,\n       COUNT(*) AS agreements,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), {2}) AS revoked_share\nFROM orders o\nJOIN customers c ON c.id = o.{3}\nGROUP BY c.region\nORDER BY agreements {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the live literal",
          why: "Live connections are status 'delivered' — 52 on the db, led by EU's 24. 'shipped' would count the 30 onboarded-but-ramping cycles into the live column and the census reads a connectivity surge exactly where onboarding merely finished its paperwork.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "The revocation share reports to 1 decimal — EU 6.7, APAC 8.1, US 5.3, LATAM 0 — reconciling with the 6.8 platform share ops quotes on the same slide. ROUND to 2 decimals prints 6.67 and the market map stops matching the facts grid everyone memorized.",
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
          why: "The review reads biggest book on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open the meeting on LATAM's 2-cycle pilot — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "MAX", "2", "0", "ASC"],
      walkthrough:
        "One join, one fold, seven columns at two grains. The join attaches every cycle to its client's market — no WHERE, because the census is the whole book — and GROUP BY market folds 103 cycles into four rows where the CASE arms read live/onboarded/in-KYC/revoked: EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0 — arms reconciling to loads of 45/37/19/2 and to the platform census 52 + 30 + 14 + 7 = 103 by construction. The share column divides the revoked arm by the load — 8.1 / 6.7 / 5.3 / 0 — so APAC's revocation problem leads the coverage conversation even though its book is smaller than EU's. The distractors fail honestly: 'shipped' in the live literal counts the 30 ramping cycles as live and 'pending' counts the 14 in-KYC rows instead; MAX in the precision slot is a rejected column reference; 2 prints the shares as 6.67 and breaks the reconciliation with the 6.8 platform figure; 0 rounds them to whole numbers — 7, 8, 5, 0 — and the map stops matching the facts grid; ASC opens the review on LATAM. The read the board makes: the US is onboarding-heavy — 10 of its 19 cycles stamped but not live — while APAC carries the revocation risk, one query carrying two different coverage conversations.",
    },
    {
      id: "cs-tink-2",
      tier: "medium",
      topic: "q1",
      universe: "supplier",
      title: "The 3-product coverage bench",
      brief:
        "Tink-flavored brief on the storefront db: the partner-coverage pod reads bank-coverage economics at every quarter close — which connectivity partners carry the breadth to matter. Probed facts: the processed book is 34,833.28 across 251 call lines on 103 cycles; six bank/pISP partners carry it — Nordic Gadgets AB 11,130.25 over 43 lines, Midwest Hardware Co 9,294.93 over 56, Alpine Audio GmbH 4,765.63 over 40, Andes Naturals SA 3,613.25 over 25, Shenzhen Electro 3,049.07 over 47, Pacific Textiles 2,980.15 over 40. The bench gate is fixed: a partner must carry at least three API products to make the coverage bench — Alpine and Andes carry two each and drop off. One row per partner, biggest processed value first.",
      ask: "Return each partner on the 3-product coverage bench with its API-product count, call-line count and processed value to 2 decimals, biggest value first.",
      template:
        "SELECT s.name AS bank_partner,\n       s.region,\n       COUNT({1} p.id) AS api_products,\n       COUNT(*) AS line_records,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS processed_value\nFROM suppliers s\nJOIN products p ON p.{3} = s.id\nJOIN order_items oi ON oi.product_id = p.id\nWHERE s.id {4} (\n  SELECT supplier_id FROM products\n  GROUP BY supplier_id\n  HAVING COUNT(*) >= {5}\n)\nGROUP BY s.name\nORDER BY processed_value DESC;",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the product deduplicator",
          why: "The chain fans out — each API product repeats once per call line — so COUNT(DISTINCT p.id) reads the breadth grain (3 per bench partner) while COUNT(p.id) reads the line grain (43, 56, 47, 40). SUM(DISTINCT p.id) adds the product ids together and MAX reports the largest id — neither is a breadth count.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the cents precision",
          why: "Processed value prints to cents — 11,130.25 / 9,294.93 / 3,049.07 / 2,980.15 — so the bench reconciles row-for-row with the probed partner-value table. ROUND to 1 decimal prints 11,130.3 and the bench stops matching the quarter-close pack it is meant to audit.",
        },
        {
          answer: "supplier_id",
          kind: "keyword",
          label: "the partner join key",
          why: "Each API product names its partner via p.supplier_id = s.id. Substituting p.id pairs products to partners by matching row-ids — plausible-looking line counts attributed to the wrong banks, the silent mis-pairing no error message announces.",
        },
        {
          answer: "IN",
          kind: "keyword",
          label: "the bench membership test",
          why: "The gate keeps partners whose product fold reaches the threshold. NOT IN flips the test and returns exactly the partners the bench exists to exclude — the two-product banks — while = ANY is not SQLite grammar and errors outright.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the breadth threshold",
          why: "The bench gate is at least three API products, and every surviving partner shows exactly that 3 in the api_products column. A threshold of 1 lets the two-product banks back on the bench and the quarter-close pack disagrees with the coverage register it feeds.",
        },
      ],
      distractors: ["SUM", "MAX", "id", "1", "NOT IN", "= ANY"],
      walkthrough:
        "A staged bench: derive the cohort, then fold it. The inner query groups products by supplier and keeps partners with at least 3 API products — Nordic, Midwest, Shenzhen and Pacific — while Alpine and Andes, at two each, drop off the bench with their 4,765.63 and 3,613.25. The outer fold joins partners to their products and call lines, and the two count columns argue the fan-out lesson in one row: COUNT(DISTINCT p.id) reads breadth (3 for every bench partner) while COUNT(*) reads the line grain (Nordic 43, Midwest 56, Shenzhen 47, Pacific 40). The value fold SUM(oi.quantity * oi.unit_price) reproduces the probed books exactly — 11,130.25 / 9,294.93 / 3,049.07 / 2,980.15 — ordered biggest first. The distractors fail honestly: SUM in the breadth slot adds product ids together; MAX reports the largest id; id in the partner key mis-pairs products to banks by row-id coincidence; 1 drops the gate to 'at least one product' and all six partners flood the bench; NOT IN flips membership and returns precisely the two banks the bench excludes; = ANY is not SQLite grammar. Two grains, one gate, a stated threshold — the bench the coverage pod actually ships.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "The connection funnel is Tink's headline read — signed, KYC-cleared, go-live stamped, live. This problem drills the conditional-count shape the funnel report uses every single week." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of signed clients that actually reached go-live out of all signings — a distinct-count share with the denominator stated, the coverage register's weekly pulse." },
    { slug: "immediate-food-delivery-i", why: "Connections that went live within the promised onboarding window versus late ones — the promptness share is a conditional rate over a timestamp comparison, the same shape as Tink's onboarding-SLA read." },
    { slug: "sales-analysis-ii", why: "Signed clients with no live connection yet — the anti-join that fills the onboarding-ops queue. Choosing the join shape is the business statement about whose follow-up call comes first." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Clients running aggregation but not payment initiation — the cross-sell map. Multi-product possession with an exclusion arm is exactly the bank-coverage read the partnerships pod runs quarterly." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Usage telemetry at a bounded window: call lines inside the last N days, with the window edges stated. Consent-window thinking — bounded access, stated edges — is the same shape." },
    { slug: "second-highest-salary", why: "The second-largest connectivity partner by processed value — 9,294.93 behind Nordic's 11,130.25 on this db. Ordering folds and edge cases (what if the top two tie?) are the interview's favorite escalation." },
    { slug: "game-play-analysis-iv", why: "Fraction of clients firing calls the day after their first go-live stamp — a next-day activation rate with the denominator stated, the engagement shape Tink's client-health dashboards use." },
    { slug: "investments-in-2016", why: "Agreement cycles meeting multiple conditions at once (live status AND market AND window) — the multi-predicate gate that separates a coverage count from a coincidence." },
    { slug: "customer-order-frequency", why: "Clients with at least three agreement cycles in a window — the HAVING-gate cohorting the partnerships team uses to pick which logos get dedicated coverage engineering." },
    { slug: "confirmation-rate", why: "Per-bank confirmation rate from attempt and confirm pairs — the pISP reliability shape. A bank whose confirmation rate drifts is a coverage incident before it is a support ticket." },
    { slug: "top-travellers", why: "Per-client usage value ladders — SUM of call-line value per client, ranked. The concentration read that decides which clients get named onboarding owners." },
    { slug: "number-of-employees-who-met-the-target", why: "Daily call-volume targets met per market — conditional counting over a threshold, the shape of the connectivity-ops morning check." },
    { slug: "find-followers-count", why: "Counts per node — which bank partner each client connects through and how many cycles ride on it. Coverage graphs are follower counts wearing a banking license." },
    { slug: "product-price-at-a-given-date", why: "The per-call rate in force as of the agreement date — pricing that changed mid-window. As-of logic is how Tink's billing desk reconstructs what a cycle should have cost." },
    { slug: "not-boring-movies", why: "Filter banks below a rating floor while excluding a flagged class — the coverage-directory cleanup shape: drop sub-threshold partners and revoked agreements in one honest WHERE." },
  ],
};
