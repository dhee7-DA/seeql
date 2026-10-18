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
    "Preparation strategy: the pools file carries no Tink section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: connection-fate censuses, two-grain market counts, bank-coverage folds, CASE tier banding and the cents-safe billing spine. Do the topics in order, then run the six case studies on the live storefront db: they rebuild the reads this kit's stakeholders actually ship — the {emerald:connection fate census} connectivity ops opens Monday with, the {sky:3-product coverage bench} the partner-coverage pod ships at quarter close, the call-line tier scan with its no-gap tie policy, the per-call rate bands billing digests, the {violet:never-collected dunning list} that anchors every close's money half, and the platform opex stack finance appends to the partnership deck. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Tink data teams rehearse most — one per workflow, from the Monday go-live census to the close-night billing ledger — and the right way to use them is the loop, not the lap: run each on the live storefront database, then re-run it a week later from a blank editor, *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the coverage review's 'do revoked cycles count in your base?' follow-up tests. Thirty MCQs, twenty-four theory prompts, thirty-two problems, six cases — every entry grounded in the same 103-cycle spine, so the numbers you memorize here are the numbers the screens quote.",
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
      slugs: ["active-businesses", "create-a-session-bar-chart", "count-salary-categories", "median-time-to-convert", "dau-wau-stickiness"],
    },
    {
      name: "Two-grain market censuses",
      why: "Agreement cycles and clients are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "rolling-7d-actives", "cohort-retention-matrix"],
    },
    {
      name: "Joining clients to agreement cycles",
      why: "Clients carry market and created_at; agreement cycles inherit them through joins, and the join type decides who survives. A cycle without a client row is corruption; a client without cycles is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "late-arriving-restatement"],
    },
    {
      name: "Bank-coverage leaderboards",
      why: "Connectivity partners are ranked by processed value — Nordic 11,130.25 leads Midwest 9,294.93 with a 40-line Shenzhen bench below — and rank semantics are a policy about peer banks. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is exactly the argument a coverage review settles out loud.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "point-in-time-asof", "scd2-build"],
    },
    {
      name: "Product-family banding with CASE",
      why: "The API product shelf — aggregation, payment initiation, data enrichment — is CASE-classified into families with fixed edges the PSD2 register publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the coverage register, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "type-of-triangle", "mrr-waterfall", "deferred-revenue"],
    },
    {
      name: "Go-live clocks & LAG walks",
      why: "The go-live clock (created_at → shipped_at, 2.98-day average over the 82 stamped) and the 14-month cycle spine (2024-01 to 2025-02) are the latency call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "journal-gap-detection"],
    },
    {
      name: "Reachability set algebra",
      why: "Coverage packs stack populations — live under revoked, this quarter beside last — and EXCEPT answers 'which signed clients never went live'. UNION dedups whole rows silently, which makes it a correctness question, not a style one; a bank directory that loses a client to a silent dedup is an audit finding.",
      slugs: ["customers-who-never-order", "the-airport-with-the-most-flights", "team-scores-in-football-tournament", "snapshot-delta-detect"],
    },
    {
      name: "Cohort subqueries & tier gates",
      why: "Screens escalate into staging: fold per-client cycle counts, then judge them against a computed platform mean (6.44 here — exactly four clients clear it), or gate a bench with a HAVING-derived IN-list the way the coverage pod does. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "growth-accounting", "net-revenue-retention"],
    },
    {
      name: "Usage-billing cents discipline",
      why: "Connected is not collected — the finance tables (28 invoices, 27 settlement legs, INTEGER cents) are where the connectivity world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the billing pod's Monday read.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "trial-balance-check", "gl-reconciliation"],
    },
    {
      name: "Directory hygiene & consent windows",
      why: "Bank directories arrive dirty — name casing splits one partner into two, and a bank that sorts above another by string accident reshuffles the coverage bench between renders. Consent windows add the date math: access lives in bounded windows, and half-open interval filters are how the register stays honest.",
      slugs: ["fix-names-in-a-table", "users-with-two-purchases-within-seven-days", "queries-quality-and-percentage", "keep-latest-dedupe"],
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
    {
      id: "tink-t9",
      q: "UNION versus UNION ALL on the billing digest — when is the dedupe pass correct business logic, and when is it a silent bug?",
      a: "UNION ALL is a raw concatenation — cheap, order-preserving, and the honest default when the branches are logically disjoint: card-settled legs stacked on wire-settled legs, collected statements on never-collected, this quarter beside last. UNION adds a distinct pass over the combined set, and that pass is a business decision: correct when combining overlapping sources where a duplicated row would double-count, and a silent bug when duplicates are the signal — a settlement leg ingested twice that vanishes into the dedupe is an audit finding, not a convenience. Column discipline holds for both: matching counts and positions, names from the first branch. The opinionated version: default to UNION ALL and reach for UNION only when you can say out loud which duplicated rows you are paying to collapse — at an open-banking platform, a bank directory that loses a client to a silent dedup is an audit finding before it is a data bug.",
      tag: "set-ops",
    },
    {
      id: "tink-t10",
      q: "When do you stage a WITH (CTE) instead of nesting a subquery — and what does a well-named CTE buy a coverage team?",
      a: "Three concrete buys. Readability: a chain of named steps — per_partner, bench_gate, processed_value — reads like the coverage process instead of a Russian-doll subquery, and each CTE is a natural checkpoint to SELECT from while debugging. Reuse: one CTE can feed several later references in the same statement, so the call-line fold is written once, not three times. Correctness under review: naming a CTE bench_gate forces you to state the gate's definition (at least three API products) where the reviewer can see it — and a quarter-close pack is exactly definitions that survive the partnership-review argument. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step. The coverage bench case in this kit is the shape: derive the qualifying cohort in the inner fold, then attach value and line counts outside it.",
      tag: "ctes",
    },
    {
      id: "tink-t11",
      q: "The API product shelf is CASE-classified into families. What makes a CASE expression trustworthy, and what breaks one quietly?",
      a: "Three properties. Exhaustive arms: the ELSE catches what the WHENs miss — a product family with no ELSE silently drops calls from the coverage register, and under PSD2 a register that under-reports is a licensing issue, not a rounding note. Ordered arms: WHEN clauses evaluate top-down, so the most specific family must precede the catch-all — a reordered WHEN quietly re-bands the shelf and every downstream count drifts. Fixed edges: the category codes are contract — the db's product families map to aggregation, payment initiation and data enrichment, and the CASE literals should say so in a comment where the next analyst reads them. The classic bug is a banding CASE whose arms overlap (a product matching two WHENs lands in whichever comes first), which is why the register review reads the arms before it reads the counts. Band once, in a staging step, and every downstream fold inherits the definition instead of re-deriving it.",
      tag: "case",
    },
    {
      id: "tink-t12",
      q: "Bank directories arrive from six sources with inconsistent casing. Walk me through the string hygiene before any coverage fold.",
      a: "Dirty names split one partner into two — 'nordic gadgets ab' and 'Nordic Gadgets AB' fold separately and the coverage bench undercounts exactly the partners it exists to rank; worse, one of the two can sort above the other by string accident and the bench reshuffles between renders. The hygiene pass: TRIM whitespace first (trailing spaces defeat equality and group separately), then a casing convention — UPPER for comparison keys, display-case only for the report column — then LENGTH sanity checks so a blank does not pass as a bank. The discipline that matters: normalize in a staging step or a CTE and join or group on the NORMALIZED key, never on the raw column — otherwise every fix is per-report and drifts. And keep the raw column: partnership contracts cite legal names, so the hygiene step adds a clean column rather than overwriting the audit trail. On this db the fix-names shape is the warm-up; in production it is the difference between 6 partners and 9 phantom ones.",
      tag: "strings",
    },
    {
      id: "tink-t13",
      q: "Why does the usage-billing spine store money as INTEGER cents — and what does that rule demand from every query you write against it?",
      a: "Floats cannot represent most decimal cents exactly — 0.1 and 0.01 have binary approximations, and a settlement ledger that adds thousands of legs accumulates drift nobody can reconcile. INTEGER cents are exact: 92550 cents is 92550, every time, so the trial balance closes at 181,080 against 181,080 with a delta you can prove is zero. The rule it demands: every dollar read is amount_cents / 100.0 — the .0 forces real division, because amount_cents / 100 is integer division and eats the cents per row. The corollaries: round only at the presentation layer (ROUND(x, 2) for the deck, never inside the fold), compare money in cents (settled_cents = billed_cents, exact integer equality — the coverage split compares cent sums precisely so no float can reclassify a statement), and never mix a cents column with a REAL per-call rate in one expression without naming the conversion out loud.",
      tag: "cents",
    },
    {
      id: "tink-t14",
      q: "A coverage report's totals double after someone 'just adds the call lines'. Walk me through the fan-out diagnosis you run first.",
      a: "Diagnose by counts: run COUNT(*) on orders alone (103 on this db), then on the join to order_items (251) — the jump IS the fan-out, call lines multiplying each agreement cycle. Confirm with GROUP BY the join key HAVING COUNT(*) > 1 to see which cycles carry multiple lines — the 2.44 lines-per-cycle average means roughly half the book fans out. The fix depends on the grain you owe the stakeholder: for cycle-grain booked value, aggregate call lines to cycle grain first (SUM by order_id in a CTE), then join — or keep the join and quote line-grain value only, with COUNT(DISTINCT o.id) guarding every entity count. The trap to name out loud: SUM(o.total) after the join repeats each total once per line, inflating the book roughly 2.4x — and COUNT(*) in the same query silently counts call lines, not cycles, which is how the fate census quietly becomes a call-line census. At an API platform the third grain is calls (SUM of quantity) — say 'one row per what?' for each before writing anything.",
      tag: "grain",
    },
    {
      id: "tink-t15",
      q: "Go-live rate, revocation share, coverage split — Tink's metrics are ratios. Where do ratio interviews go wrong?",
      a: "Three places. The denominator: go-live rate over ALL cycles booked (82 of 103, 79.6%) versus over signed-and-active only are different metrics wearing the same name — the interviewer asks 'do revoked cycles count in your base?' out loud, and the house number keeps them in until a policy says otherwise. The arithmetic type: 100.0 must multiply BEFORE the division or integer truncation flattens every market share to zero — APAC's 8.1% revocation prints as 0. The grain of numerator and denominator: a share computed after joining call lines has lines in the numerator and cycles in the denominator — a ratio of two different populations that looks like a rate. The strong answer states the denominator out loud before writing the query, rounds only at the end, and can explain which rows the WHERE removed — because the follow-up is always 'count for me what your base holds', and at a licensed entity the answer is quasi-regulatory.",
      tag: "rates",
    },
    {
      id: "tink-t16",
      q: "Your per-market leaderboard needs each client stamped with its market's rank. Where does PARTITION BY earn its keep — and what does omitting it do?",
      a: "PARTITION BY restarts the window per market: RANK() OVER (PARTITION BY c.region ORDER BY COUNT(*) DESC) ranks clients WITHIN each market, so EU's ladder and APAC's ladder both start at 1 — the coverage review reads one row per client with its local standing, not one global ladder where APAC's best sits mid-pack behind EU's volume. Omit it and the single global window smears markets together: every market except the biggest inherits ranks that make its clients look irrelevant, and a per-market top-3 filter becomes impossible to express. The same rule guards running totals (each market's cumulative book, not one world total) and LAG walks (each market's month-over-month, not EU's February compared to APAC's January). The tell that a partition is missing: totals that reconcile globally but not per group, and boundary NULLs appearing mid-report. Partition grain is business grain — say 'one row per what, ranked within what' out loud before writing the OVER.",
      tag: "windows",
    },
    {
      id: "tink-t17",
      q: "Coverage gate building: IN versus EXISTS versus NOT IN — which do you reach for, and what is the NULL trap you state unprompted?",
      a: "EXISTS for existence tests — it short-circuits on the first match and never trips on NULLs, which is why the NULL-safe anti-join is NOT EXISTS (or LEFT JOIN … IS NULL). IN is fine for small static-looking sets and small subqueries, but NOT IN inherits the trap: one NULL in the inner list makes every comparison UNKNOWN and the whole coverage register silently empties while looking valid — the failure mode an all-clear that empties a licensing register. The staging-table rule: never NOT IN over a column that has not been NULL-guarded (WHERE supplier_id IS NOT NULL inside the subquery), because staging extracts are exactly where NULLs sneak in. And state the empty-inner-case behavior either way: an empty IN-list makes x IN (...) false for every row and x NOT IN (...) true for every row — a filtered staging query that returns nothing can flip the gate from closed to everyone, which is how a coverage gate fails open.",
      tag: "subqueries",
    },
    {
      id: "tink-t18",
      q: "The go-live clock is julianday(shipped_at) - julianday(created_at) on TEXT stamps, and consent windows are bounded ranges. What does each demand from the date math?",
      a: "julianday converts a TEXT timestamp to a fractional day count, so the difference of two juliandays is elapsed days including fractions — which is why the stamped-82 average prints 2.98 rather than a truncated 2. The latency report goes wrong in three places: population (no WHERE shipped_at IS NOT NULL and AVG's NULL-skip silently redefines the metric over 82 rows while the title claims 103); zero-inflation (IFNULL-ing the latency to 0 invents same-day go-lives for cycles still in KYC — a compliance-sounding fiction); and units (the contract is days, so converting to hours is a stated decision, not a convenience). Consent windows add the interval discipline: access lives between a grant and a revocation date, and the honest cut is half-open — >= grant AND < revocation — because BETWEEN's inclusive upper bound drops the last night of access, and consent expiry is exactly when calls in flight get judged. Date discipline is coverage discipline: the spine, the window and the boundary row are where the register goes wrong.",
      tag: "dates",
    },
    {
      id: "tink-t19",
      q: "You computed a market census with window functions and now need to filter to markets above a live threshold. Why does WHERE reject it, and what are the two fixes?",
      a: "Because windows evaluate in the SELECT stage — after WHERE has already filtered rows — so the window output does not exist yet where WHERE runs, and the engine rejects the alias. Fix one: HAVING, which runs after GROUP BY and (in SQLite) resolves SELECT aliases, so HAVING live_count > 10 works when the column is a plain aggregate. Fix two, the portable one: stage the census in a CTE or derived table and filter the staged column in the outer query — market_census AS (...), then SELECT * FROM market_census WHERE live_count > 10. The CTE shape works for pure window output too (LAG deltas, running totals), where no aggregate clause exists to lean on. What never works is filtering window output in the same SELECT's WHERE — and the follow-up, 'why does ORDER BY accept the alias?', has the same answer: ORDER BY runs after SELECT, so the column exists by then.",
      tag: "pipeline",
    },
    {
      id: "tink-t20",
      q: "NULL policy on the cycle book: when do you COALESCE, when do you leave the NULL, and when is a NULL the report's most important cell?",
      a: "Leave it when the NULL IS the finding: shipped_at NULL means no go-live has happened — 14 cycles in KYC and 7 revoked — and that population is the onboarding queue, not missing data to repair. COALESCE when presentation needs a number and zero is the honest value: the billing stack's settled column prints COALESCE(SUM(...), 0) so the never-collected bucket reads 0 settled against 15,217 billed, not blank. Filter explicitly when the metric's definition demands it: go-live latency over the stamped 82 only, stated in the title. The never-list: never IFNULL a latency or a timestamp to zero (it invents same-day go-lives), never use = NULL (UNKNOWN every time — IS NULL is the test), and never let a NULL silently shrink a COUNT — COUNT(shipped_at) versus COUNT(*) is a 21-row gap that IS the in-KYC-and-revoked population. At a licensed platform a NULL handled without a stated policy is how a coverage register quietly misstates the installed base.",
      tag: "nulls",
    },
    {
      id: "tink-t21",
      q: "The fate census uses FILTER (WHERE …) instead of separate CASE-folded SUMs. What does the FILTER clause buy, and when would you still write CASE?",
      a: "FILTER scopes one aggregate to a subset of rows without a second scan: COUNT(*) FILTER (WHERE status = 'delivered') beside COUNT(*) FILTER (WHERE status = 'shipped') in the same GROUP BY — one pass, four arms, and because the arms partition the rows their counts reconcile to COUNT(*) by construction: 24+12+6+3 = 45 in EU, 103 across the platform. That reconciliation identity is what CASE-folded SUMs also give you (SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)), so when would you still write CASE? When the expression carries a payload, not just a predicate — SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END) needs CASE because FILTER cannot change WHAT is summed, only WHICH rows. And when portability matters: FILTER is modern SQL that some engines lack, while CASE-in-aggregate runs everywhere. Same census either way — the discipline is that every arm's predicate is stated and the arms reconcile to the total, because a register that cannot prove totality is a register the next audit re-runs.",
      tag: "aggregation",
    },
    {
      id: "tink-t22",
      q: "A join through the coverage chain returns plausible numbers that are all wrong. Walk me through join-key hygiene.",
      a: "First verify the key pair against the schema: order_items joins products on product_id, and products joins suppliers on supplier_id — a join written as oi.product_id = s.id 'runs' and produces garbage, because both are integers and SQLite will not stop you. The habit: name the relationship out loud (call line → API product → connectivity partner) and check each ON clause references the two tables it claims to. Then check grain: each hop can fan out, so count before and after — 103 cycles, 251 lines, and the partner fold only makes sense once you have said which grain the output is at. Then check direction: an INNER JOIN at the first hop silently drops lines whose product row is missing, which on a clean core db is zero but on a staging extract is exactly the rows someone deleted yesterday. And never join on position or row-id coincidence — p.id = s.id pairs products to partners by matching integers, a silent mis-pairing no error message announces and the bench prints with total confidence.",
      tag: "joins",
    },
    {
      id: "tink-t23",
      q: "Close culture here says every status census must reconcile to 103 by construction. What does that mean mechanically, and what anomalies does the reconciliation surface?",
      a: "Mechanically: the census's status arms are a partition — live 52 + onboarded 30 + in-KYC 14 + revoked 7 — so their sum must equal COUNT(*), 103, with no arm double-counting and no row uncounted; a CASE-based census that misses a status value drops rows from every arm and the sum lands short, which is the bug the identity catches in one glance. The same discipline extends across grains: per-market arms sum to per-market loads (45/37/19/2), and the billing coverage classes sum to 28 statements. What the reconciliation surfaces: the anomaly list — a void statement that still shows a settlement leg (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00) both 'reconcile' inside buckets while being wrong at the row level, which is why the row-level anomaly walk is a separate, explicit step. The identity is not bureaucracy: it is the fastest machine check that the status domain is closed and the fold is total — and at a PSD2-licensed entity, a register that cannot prove totality is a finding.",
      tag: "quality",
    },
    {
      id: "tink-t24",
      q: "The go-live latency query is getting slow as the cycle book grows. What do you look at before blaming the engine?",
      a: "Read the plan first: EXPLAIN QUERY PLAN shows the scan strategy, and the latency query's shape is a scan over orders filtered on shipped_at IS NOT NULL with a julianday computation per row — at 103 rows irrelevant, at tens of millions decisive. The candidates: an index on shipped_at turns the population filter into a range seek, but note the NULL-rich column is a poor index candidate by itself when most rows carry the stamp — filter selectivity decides. A covering index on (shipped_at, created_at) lets the whole latency computation run from the index without touching the table. Then the honest checks: are you computing julianday over rows a WHERE could have dropped earlier, is the report re-running the same census subqueries that a CTE would share, and is the dashboard's 'freshness' requirement real — a five-minute-stale pre-aggregated latency table answers the coverage review better than a live scan nobody waits for. Performance work here starts with the plan and ends with a stated freshness contract, not with an index shopping spree.",
      tag: "indexes",
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
    {
      id: "tink-mcq-11",
      prompt: "The billing digest prints the card rail's settled usage dollars: 16 legs. payments.amount_cents is INTEGER. Which expression prints 37,364.00?",
      choices: ["SUM(amount_cents) — cents ARE the dollar figure in this table", "SUM(amount_cents) / 100.0 — promotes the cent sum to real dollars", "ROUND(SUM(amount_cents)) — rounds to the nearest dollar", "SUM(amount_cents / 100) — divides each leg before the fold"],
      answer: 1,
      why: "The money rule: usage invoices and settlement legs carry INTEGER cents, so every dollar read is SUM(amount_cents) / 100.0 — 3,736,400 cents prints as 37,364.00. The .0 forces real division; without it the print reads 37364 and cents vanish leg by leg.",
      notes: [
        { choice: 0, why: "Raw cents as dollars overstates every rail read 100x — a 34,833.28 platform book does not print 3.4 million. The cents rule is the first thing a billing reviewer checks." },
        { choice: 3, why: "amount_cents / 100 is INTEGER division per leg — odd-cent legs lose their cents before the SUM ever runs. Divide after the fold, with the .0." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-12",
      prompt: "The market census row reads EU: 45 agreement cycles, 8 clients. Which column pair produces both grains in one pass?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(customer_id) and SUM(customer_id)", "COUNT(DISTINCT region) and COUNT(DISTINCT customer_id)", "SUM(*) and AVG(customer_id)"],
      answer: 0,
      why: "COUNT(*) counts cycle rows after the join (45); COUNT(DISTINCT customer_id) folds repeats back to connected clients (8). The gap — 5.6 cycles per client — is the intensity signal that decides whether a market is broadening or concentrating.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL foreign keys — 45 again, since every cycle names its client. SUM(customer_id) adds id integers together: arithmetic with no business meaning." },
        { choice: 2, why: "EU is one region value — COUNT(DISTINCT region) reads 1. The census is cycles AND logos, both inside one market row." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-13",
      prompt: "Live-connection value per market: which expression sums booked value over live cycles only, while keeping every market row?",
      choices: ["SUM(total) WHERE status = 'delivered'", "SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END)", "SUM(total) FILTER IS delivered", "CASE WHEN status = 'delivered' THEN SUM(total) END"],
      answer: 1,
      why: "The conditional fold: CASE inside SUM adds each live cycle's total and zeroes the rest — one scan, every market survives, onboarding and in-KYC rows contribute 0. It is the CASE-banded shape the coverage register and the fate census both use.",
      notes: [
        { choice: 0, why: "No WHERE exists inside an aggregate. Filtering in the query's WHERE works but deletes the not-yet-live rows first — markets with zero live cycles vanish instead of printing 0." },
        { choice: 3, why: "CASE wrapped AROUND the aggregate evaluates one row at a time — SUM never sees the group. The condition belongs inside the aggregate." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-14",
      prompt: "The cycle trend must not merge Januarys: 2024-01 booked 3,731.97 and 2025-01 booked 1,669.50. Which month key keeps them apart?",
      choices: ["STRFTIME('%m', created_at) — the month number", "STRFTIME('%Y-%m', created_at) — year plus zero-padded month", "SUBSTR(created_at, 6, 2) — characters 6 and 7", "DATE(created_at) — the full date"],
      answer: 1,
      why: "The spine key is STRFTIME('%Y-%m', created_at): 14 buckets from 2024-01 to 2025-02, every January its own row. '%m' alone folds the two Januarys into one 5,401.47 bucket and the expansion trend becomes fiction.",
      notes: [
        { choice: 0, why: "Month-number keys fold every year together — a year-over-year read needs the year in the key, or January 2024 impersonates January 2025." },
        { choice: 3, why: "The full date never folds — 103 one-row buckets. A spine is a truncation grain, not the raw timestamp." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-15",
      prompt: "A bank-coverage read needs every call line attached to its API product and connectivity partner. The join path is:",
      choices: ["order_items → products ON product_id, then products → suppliers ON supplier_id", "customers → orders → products", "products → customers directly", "suppliers → order_items directly"],
      answer: 0,
      why: "Call lines carry product_id; API products carry supplier_id. The two-hop chain order_items → products → suppliers is how partner coverage gets computed — quantity × per-call rate folded per bank, with the strongest at 11,130.25 and 32% of processed value.",
      notes: [
        { choice: 1, why: "customers is the client dimension — it never carries product keys. That path answers who is connected, not which bank carries the calls." },
        { choice: 3, why: "There is no direct line-to-partner key: order_items reference products, and only products know their connectivity partner. Skipping the hop is a missing-join-key error." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-16",
      prompt: "Cut the agreement book to Q1 2024 — a consent-window read. Why is created_at >= '2024-01-01' AND created_at < '2024-04-01' the house shape rather than BETWEEN?",
      choices: ["BETWEEN is slower on TEXT columns", "BETWEEN '2024-01-01' AND '2024-03-31' silently drops the rest of March 31st — and quarter-end is exactly when banks push contract volume through", "BETWEEN cannot compare timestamps at all", "BETWEEN requires a timezone argument in SQLite"],
      answer: 1,
      why: "TEXT timestamps carry time-of-day, so the upper bound '2024-03-31' matches only midnight — every cycle signed later that night falls out of the window. Half-open intervals (>= start, < next-start) keep the last night; the 14-month spine and the consent windows both depend on it.",
      notes: [
        { choice: 2, why: "BETWEEN compares TEXT timestamps fine — lexicographic order works. The failure is semantic: an inclusive day-string bound means midnight of that day, not the end of it." },
        { choice: 3, why: "No timezone argument exists in SQLite's BETWEEN. The trap is the inclusive endpoint, not configuration." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-17",
      prompt: "Partnerships' whitespace read: clients LEFT JOIN agreement cycles, then WHERE status = 'delivered'. The never-connected cohort vanishes. Why?",
      choices: ["LEFT JOIN cannot be combined with WHERE", "The WHERE predicate on a cycle column marks every NULL-payload row UNKNOWN — the LEFT silently became an INNER", "Live cycles have no matching clients", "The join key was wrong"],
      answer: 1,
      why: "After a LEFT JOIN, never-connected clients carry NULL cycle columns; status = 'delivered' is UNKNOWN against NULL, so WHERE deletes exactly the rows the LEFT kept alive. Under PSD2 the stakes are regulatory — a coverage register that silently drops a signed client is a licensing misstatement, not a report bug.",
      notes: [
        { choice: 0, why: "LEFT JOIN pairs with WHERE constantly — the bug is filtering a nullable column of the unmatched side in WHERE, not the combination." },
        { choice: 2, why: "Every live cycle has a client — the reverse is what matters. The vanished rows are clients with NO cycles, whose status is NULL, not 'delivered'." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-18",
      prompt: "After joining agreement cycles to call lines, SUM(o.total) reads roughly 84,900 instead of the true 34,833.28 book. Diagnose.",
      choices: ["The cycles table duplicated during ingest", "The join fanned out — each cycle's total repeats once per call line, 251 lines over 103 cycles, inflating the cycle-grain fold ~2.4x", "Call lines carry cents", "SUM skipped NULL rows"],
      answer: 1,
      why: "Call lines multiply each cycle: 251 lines over 103 cycles means every cycle-grain total repeats ~2.44 times after the join. SUM(o.total) sums the repeats. The fix is pre-aggregating lines to cycle grain, or quoting line-grain value only — and saying which grain the number is at.",
      notes: [
        { choice: 0, why: "No duplication — 103 cycles is the census the fate read reconciles. The inflation factor 251/103 is the fan-out ratio; counting rows before and after the join proves it." },
        { choice: 2, why: "order_items.unit_price is REAL dollars; only the finance tables carry INTEGER cents. The bug here is grain, not units." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-19",
      prompt: "Coverage wants: clients who signed an agreement in the last quarter but NEVER went live. The set-shaped answer is:",
      choices: ["An INNER JOIN of the signed and live client lists", "EXCEPT: signed-this-quarter distinct clients EXCEPT ever-live distinct clients", "UNION of the two lists", "A CROSS JOIN of clients to statuses"],
      answer: 1,
      why: "EXCEPT returns rows in the left set minus the right — signed without ever-live, the onboarding-ops queue. UNION would print both populations merged, and an INNER JOIN keeps clients live AND recently signed — the opposite cohort.",
      notes: [
        { choice: 2, why: "UNION merges the sets — the output cannot tell you who is signed-but-not-live. Set algebra answers 'which side only' questions." },
        { choice: 3, why: "CROSS JOIN pairs every client with every status — no subtraction, and the row count explodes. The question is a difference; EXCEPT is the difference operator." },
      ],
      difficulty: "easy",
    },
    {
      id: "tink-mcq-20",
      prompt: "The billing stack prints the never-collected bucket. Why COALESCE(SUM(p.amount_cents), 0) rather than a bare SUM before the /100.0?",
      choices: ["COALESCE converts cents to dollars", "SUM over a no-leg group returns NULL, and NULL / 100.0 stays NULL — the bucket's settled dollars print blank instead of 0", "COALESCE rounds to cents", "COALESCE speeds up the GROUP BY"],
      answer: 1,
      why: "Statements with no settlement leg fold to zero rows, SUM of nothing is NULL, and NULL poisons every expression around it — the exposure table reads blank exactly where the 15,217-billed-against-0-settled row must print. COALESCE pins the honest 0 the dunning draft requires.",
      notes: [
        { choice: 0, why: "The cents-to-dollars step is the /100.0. COALESCE's job is the NULL fallback — two different fixes that must both be present." },
        { choice: 2, why: "Rounding is ROUND's job, applied after the dollars conversion. COALESCE never touches precision." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-21",
      prompt: "The one-pass fate census counts live and onboarded side by side in a single scan. The clause that does it:",
      choices: ["COUNT(live) FILTER (WHERE status = 'shipped')", "COUNT(*) FILTER (WHERE status = 'delivered') beside COUNT(*) FILTER (WHERE status = 'shipped')", "CASE WHEN COUNT(*) > 0 THEN 'live' END", "Two GROUP BY queries stitched together in the dashboard"],
      answer: 1,
      why: "FILTER (WHERE …) scopes one aggregate's rows without touching the others — every branch of the census shares one scan, one GROUP BY, and the arms reconcile to COUNT(*) by construction: 52 + 30 + 14 + 7 = 103. That reconciliation is the whole point of the one-pass shape.",
      notes: [
        { choice: 0, why: "The predicate belongs to the shipped branch — as written the column counts onboarded rows under a live label. The FILTER predicate and the column name must agree." },
        { choice: 2, why: "CASE around COUNT tests the aggregate after folding — it classifies groups, it does not count subsets. Wrong tool at the wrong stage." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-22",
      prompt: "The coverage bench gate: a connectivity partner must carry at least three API products. Which fold implements it — and who drops off on this db?",
      choices: ["WHERE COUNT(p.id) >= 3 — a row-level filter before the fold; nobody drops off", "GROUP BY supplier HAVING COUNT(DISTINCT p.id) >= 3 — Alpine Audio and Andes Naturals, at two SKUs each, drop off the bench", "ORDER BY products DESC LIMIT 3 — keeps the three biggest partners", "SELECT DISTINCT supplier_id — lists everyone"],
      answer: 1,
      why: "A breadth gate judges a per-partner fold, so it lives in HAVING after GROUP BY — and counting DISTINCT products matters because the chain fans out through call lines. On this db the gate keeps Nordic, Midwest, Shenzhen and Pacific; Alpine (4,765.63) and Andes (3,613.25) carry two SKUs each and drop, with their value, off the bench.",
      notes: [
        { choice: 0, why: "COUNT does not exist at WHERE time — no groups have formed. The rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "LIMIT 3 caps rows, it does not gate breadth — and it would amputate the bench by size, not by coverage, which is a different (and wrong) report." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-23",
      prompt: "Flag each agreement cycle whose booked value exceeds ITS OWN client's average. The shape is:",
      choices: ["A scalar subquery evaluated once for the whole table", "A correlated subquery: o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — re-run per outer row", "HAVING o.total > AVG(o.total)", "A CROSS JOIN of cycles to client averages"],
      answer: 1,
      why: "The comparison baseline moves per row — an 8-cycle client's average is not a 2-cycle client's — so the inner query must reference the outer row: that is correlation, and it re-executes per cycle. A one-shot scalar compares every client to the platform mean (6.44 cycles per client), which is a different question.",
      notes: [
        { choice: 0, why: "A one-shot scalar gives one platform-wide average — every row judged against the same number. The per-client baseline is exactly what correlation buys." },
        { choice: 2, why: "HAVING judges groups after folding — and AVG(o.total) inside the same group is the group's own average, so the predicate compares a mean to itself and filters nothing useful." },
      ],
      difficulty: "hard",
    },
    {
      id: "tink-mcq-24",
      prompt: "Connectivity ops wants the day's go-live cycle ids folded into one handoff cell. The fold is:",
      choices: ["GROUP_CONCAT(id) over the day's go-live-stamped cycles — with ORDER BY inside the aggregate so the cell is deterministic", "SUM(id) cast to text", "A JOIN to a string table", "MAX(id) — the biggest id represents the day"],
      answer: 0,
      why: "GROUP_CONCAT folds many rows into one delimited string — the handoff cell. The ORDER BY inside matters: without it the id order follows the plan's scan, so the same day can render two different strings and the handoff note stops being diffable across renders.",
      notes: [
        { choice: 1, why: "SUM(id) adds ids together — a number, not a list. Casting it to text does not make the digits an inventory." },
        { choice: 3, why: "MAX(id) is one cycle, the day's last — the other go-lives silently vanish from the handoff." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-25",
      prompt: "The market census computes live_count via COUNT(*) FILTER (...). WHERE live_count > 10 errors. Which clause CAN judge that column, and why?",
      choices: ["WHERE — filters always run last in SQLite", "HAVING — it evaluates after GROUP BY, so aggregate output exists there; in SQLite the SELECT alias resolves too", "ORDER BY — with DESC it removes small rows", "LIMIT — cut rows until the condition holds"],
      answer: 1,
      why: "The pipeline order is the answer: WHERE runs before groups exist, so COUNT output is not there yet; HAVING runs after the fold, where the census column exists — and SQLite resolves the SELECT alias inside HAVING. The wrap-in-a-CTE shape is the portable version of the same rule.",
      notes: [
        { choice: 0, why: "Filters run early — that is precisely the bug. WHERE is stage two of six; the census column is born at stage five." },
        { choice: 2, why: "ORDER BY sorts, never filters. It can use the alias, but no DESC turns sorting into a threshold." },
      ],
      difficulty: "hard",
    },
    {
      id: "tink-mcq-26",
      prompt: "Go-live latency over the stamped 82 reads 2.98 days. A teammate's version adds AND status = 'delivered' and reads 2.92 over 52 rows. Both queries are correct SQL. What differs?",
      choices: ["Rounding precision", "The population — delivered-only is a different denominator than stamped-only; 2.98 is the stamped-82 SLA read, 2.92 is the live subset", "julianday drifts across months", "A timezone offset"],
      answer: 1,
      why: "Same expression, different population: the onboarding SLA is defined over ALL go-live-stamped cycles (82 — still-ramping included), and filtering to delivered quietly re-scopes it to 52. Both numbers are honest; only one is the number the partnership contract quotes. A WHERE clause that changes the population without a title change is how two decks disagree.",
      notes: [
        { choice: 0, why: "Both queries round the same way — the 0.06 gap is real population difference, not presentation." },
        { choice: 2, why: "julianday is deterministic on these TEXT stamps — the 2-to-4-day spread holds either way. The populations, not the arithmetic, differ." },
      ],
      difficulty: "medium",
    },
    {
      id: "tink-mcq-27",
      prompt: "Next quarter's coverage bench has two bank partners tied at the top. ORDER BY processed_value DESC LIMIT 1 returns:",
      choices: ["Both partners", "One arbitrary row — the tie is split by whatever the query plan happens to emit first", "A syntax error", "NULL"],
      answer: 1,
      why: "LIMIT 1 takes the first row the plan produces, and plan order across tied keys is not guaranteed — a bench that reshuffles between renders, which is how two teams quote different numbers in the same meeting. The house shapes are a window RANK (shared rung, named tie-breaker) or an explicit secondary sort the deck can quote.",
      notes: [
        { choice: 0, why: "LIMIT 1 returns one row, always. Ties need RANK semantics or a deliberate tie-breaker, not a row cap." },
        { choice: 3, why: "Nothing about a tie produces NULL — the danger is a confident, arbitrary single row that screenshots well." },
      ],
      difficulty: "hard",
    },
    {
      id: "tink-mcq-28",
      prompt: "A teammate's KYC-queue query uses WHERE shipped_at = NULL and returns nothing — though 21 cycles carry no go-live stamp. Why?",
      choices: ["shipped_at is not a TEXT column", "= NULL is UNKNOWN for every row in three-valued logic; the NULL test is IS NULL", "The 21 rows are all revoked and filtered elsewhere", "NULL equals NULL only inside aggregates"],
      answer: 1,
      why: "In SQL's three-valued logic, x = NULL evaluates to UNKNOWN — never true — so the predicate filters out every row, stamped or not. 103 minus the 82 stamped leaves exactly the 14 in-KYC plus 7 revoked, and the only honest test is shipped_at IS NULL.",
      notes: [
        { choice: 2, why: "The 21 unstamped rows are 14 in-KYC AND 7 revoked — both populations lack a go-live stamp. The query returns nothing because of the comparison, not because the rows are gone." },
        { choice: 3, why: "Aggregates ignore NULLs; they do not make NULL comparable. Grouping is a different mechanism from row predicates." },
      ],
      difficulty: "hard",
    },
    {
      id: "tink-mcq-29",
      prompt: "The billing digest UNION ALLs card-settled legs onto wire-settled legs. What column discipline does the stack demand?",
      choices: ["Both branches must align in column count and position; result names come from the first branch", "SQLite matches branches by column name, so order is free", "The second branch's names win", "Column order is irrelevant as long as types are close"],
      answer: 0,
      why: "Set operations concatenate positionally: branch two's first column lands under branch one's first column, whatever it is named. A rail stack whose wire branch swaps counts and dollars by one position prints plausible garbage — which is why the column comment sits next to the UNION ALL.",
      notes: [
        { choice: 1, why: "No name matching exists in set operations — that is JOIN behavior, and even joins do not reorder by name. Position is the contract." },
        { choice: 2, why: "Names always come from the FIRST branch; the second branch's aliases are decorative. Relying on them is how a swapped column ships." },
      ],
      difficulty: "hard",
    },
    {
      id: "tink-mcq-30",
      prompt: "The market share read: each region's booked value as a share of the 34,833.28 whole (EU 43.3, APAC 33.3, US 20.9, LATAM 2.4). The one-pass window shape:",
      choices: ["SUM(total) / SUM(total) with GROUP BY region — the fold against itself", "SUM(total) * 100.0 / SUM(SUM(total)) OVER () — each region's fold over the grand-total window", "AVG(total) ordered by region", "MAX(total) / COUNT(*) per region"],
      answer: 1,
      why: "The nested aggregate SUM(SUM(total)) OVER () folds the per-region sums against an empty window — the grand total — in the same pass as the GROUP BY. EU reads 15,089.23 over 34,833.28 = 43.3 without a second query, and the 100.0 sits before the division so the share prints real decimals.",
      notes: [
        { choice: 0, why: "A fold divided by itself is 1.0 in every row — the share column prints 100 everywhere. The denominator must escape the group, which is what the OVER () window does." },
        { choice: 3, why: "MAX over COUNT mixes a value with a count — neither the share's numerator nor its denominator. Different aggregates, different grains, no ratio." },
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
    {
      id: "cs-tink-3",
      tier: "medium",
      topic: "t5",
      universe: "catalog",
      title: "The call-line tier scan",
      brief:
        "Tink-flavored brief on the storefront db: the product-team read tiers the API shelf by call-line volume — which tier SKUs carry the traffic, with peer SKUs sharing a tier instead of being split by engine whim. Probed facts: the shelf runs 251 call lines over 16 SKUs; the top two tie at 24 lines each, then 19, 19, 18, 17, 16, 15, 15, 14, 14, 13. The published scan keeps SKUs with at least 13 call lines — 12 rows — under house DENSE_RANK semantics: shared tiers, no gaps, so the tie block reads tier 1, tier 1 and the next distinct count opens tier 2. Sender breadth sits beside the volume (the 24-line SKUs serve 12 and 9 distinct clients) so the tier scan doubles as the concentration read.",
      ask: "Return each qualifying tier SKU with its call-line count and no-gap volume tier, busiest first, ties sharing a tier.",
      template:
        "SELECT p.id AS sku_id,\n       p.name AS tier_sku,\n       COUNT(*) AS call_lines,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS volume_tier\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id\nHAVING COUNT(*) >= {3}\nORDER BY volume_tier, call_lines DESC;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tier function",
          why: "The house policy is DENSE_RANK: the two 24-line SKUs share tier 1, the two 19-line SKUs share tier 2 — no phantom tiers between them. RANK gives the 24-tie ranks 1, 1 and the 19-tie ranks 3, 3 — a gap where no SKU lives. ROW_NUMBER would split tied SKUs arbitrarily, silently ranking one bank's shelf above another's.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The scan reads biggest load on top — 24 call lines at tier 1, down to the 13-line floor. ASC crowns the 13-line SKUs tier 1 and pushes the 24-line workhorses to the bottom: a correct query answering the opposite question.",
        },
        {
          answer: "13",
          kind: "number",
          label: "the tier-scan floor",
          why: "The published scan keeps SKUs with at least 13 call lines — 12 rows, ending on the 13-line SKU. A floor of 11 adds the three 11-line SKUs and dilutes the tier story; a floor of 14 drops the 13s. The floor is the deck's stated cut, and 13 appears in the output as the boundary row's own count.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "11"],
      walkthrough:
        "A tier scan with the tie policy in the output. The join attaches every call line to its tier SKU (oi.product_id = p.id), GROUP BY p.id folds 251 lines into 16 SKUs, and HAVING COUNT(*) >= 13 keeps 12 — the 24, 24, 19, 19, 18, 17, 16, 15, 15, 14, 14, 13 run. The window tiers the folded counts: DENSE_RANK packs ties with no gaps, so the output reads 1, 1, 2, 2, 3, 4, 5, 6, 6, 7, 7, 8 — every tier a real tier, no phantom strata. That gap-free property is the whole point: RANK would jump from the 1,1 tie to 3, implying a missing tier 2, and ROW_NUMBER would number tied SKUs 1 and 2 as if call volume could break a tie. The distractors fail honestly: RANK invents the phantom tier; ROW_NUMBER splits ties by engine whim; ASC inverts the scan so the quietest SKUs open the read; and 11 in the floor slot floods the scan with the three 11-line SKUs, turning a tier report into a full shelf dump. Two SKUs tie at the top and the policy says they share the crown — one query, one policy, stated where the product team can read it.",
    },
    {
      id: "cs-tink-4",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The per-call rate bands",
      brief:
        "Tink-flavored brief on the storefront db: billing's quarterly read bands the call-line book by per-call rate — what price points billed volume actually sits at, against the published rate card. Probed facts: the 34,833.28 billed across 251 call lines splits rate-band 100-plus (4 SKUs, 68 lines, 130 call units, 19,049.85), band 60-99 (4 SKUs, 44 lines, 91 units, 7,028.89), band 25-59 (7 SKUs, 92 lines, 181 units, 6,964.38) and under-25 (3 SKUs, 47 lines, 96 units, 1,790.16). The CASE prints integer band floors — 100 / 60 / 25 / 0 — and the four billed totals reconcile to the platform book by construction. The digest reads the premium band first.",
      ask: "Return each rate band's floor, call-line count, call units and billed value to 2 decimals, premium band first.",
      template:
        "SELECT CASE WHEN oi.unit_price >= 100 THEN 100\n            WHEN oi.unit_price >= 60 THEN 60\n            WHEN oi.unit_price >= 25 THEN 25\n            ELSE 0 END AS rate_band,\n       COUNT(*) AS call_lines,\n       SUM(oi.quantity) AS call_units,\n       ROUND(SUM(oi.quantity * oi.unit_price), {1}) AS billed\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY rate_band\nHAVING COUNT(*) >= {2}\nORDER BY rate_band {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the cents precision",
          why: "Billed value prints to cents — 19,049.85 / 7,028.89 / 6,964.38 / 1,790.16 — so the bands reconcile row-for-row with the rate-card pack. ROUND to 1 decimal prints 19,049.9 and the digest stops matching every other deck that quotes the book to the cent.",
        },
        {
          answer: "44",
          kind: "number",
          label: "the every-band gate",
          why: "Every band on this shelf carries at least 44 call lines — the 60-99 band's 44 satisfies the gate and the census stays complete. Raising the cut to 45 silently amputates that band and the four billed totals stop summing to 34,833.28; the gate is a completeness check, not a filter.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the premium-band-first order",
          why: "The digest reads premium first: floor 100 on top — 19,049.85, over half the platform's billed value in one band — down to the under-25 micro-rate band. ASC buries the headline under three cheaper bands and the rate-card conversation starts at the wrong end.",
        },
      ],
      distractors: ["ASC", "MAX", "SUM", "DISTINCT"],
      walkthrough:
        "CASE banding at call-line grain, weighted by volume. The CASE evaluates top-down — >= 100 before >= 60 before >= 25, the fixed rate-card edges — and prints its integer floor as a column, so the bands are auditable in the result itself: 100-plus carries 68 lines worth 19,049.85, 60-99 carries 44 lines worth 7,028.89, 25-59 carries 92 lines worth 6,964.38, and the ELSE floor 0 carries 47 lines worth 1,790.16. Sum the billed totals: 34,833.28 — the reconciliation that proves the arms are exhaustive and ordered. The gate HAVING COUNT(*) >= 44 keeps all four bands (44 is the 60-99 band's own line count, the boundary row); the SUM(oi.quantity) column adds the call-units grain — 130 / 91 / 181 / 96 — because per-call economics reads units, not just lines. The distractors fail honestly: ASC buries the premium headline; MAX and SUM are not precision, threshold or direction values and error out; DISTINCT in any of those positions is rejected syntax. The read billing takes away: the premium band carries 68 of 251 lines but 54.7% of billed value — the rate card's top tier IS the business.",
    },
    {
      id: "cs-tink-5",
      tier: "medium",
      topic: "j4",
      universe: "month-close",
      title: "The never-collected dunning list",
      brief:
        "Tink-flavored brief on the storefront db: at close, the billing pod's first money read is the dunning list — usage statements with no settlement leg at all, because a statement that was never collected is not a payment-timing question, it is an AR-integrity one. Probed facts: 28 usage statements against 27 settlement legs; the anti-join returns 6 never-collected statements worth 15,217 — INV-2025-024 (4,937.00), INV-2025-026 (3,562.00), INV-2025-027 (2,794.00), INV-2025-028 (1,756.00, status 'paid': a status that lies), INV-2024-021 (1,295.00) and INV-2024-018 (873.00). Five carry status 'open' and one — #28 — says paid with zero legs: the row that proves the status column is a claim and the settlement table is the ledger of record.",
      ask: "Return every usage statement that has no settlement leg, with its number, status and billed value in dollars, biggest billed first.",
      template:
        "SELECT i.id AS statement_id,\n       i.number,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS billed\nFROM invoices i\nLEFT JOIN payments p ON p.{1} = i.id\nWHERE p.id {2}\nORDER BY billed {3};",
      slots: [
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the settlement join key",
          why: "Each settlement leg names its statement via p.invoice_id = i.id. Substituting p.id pairs legs to statements by matching row-id integers — plausible-looking output attributed to the wrong statements, the silent mis-pairing no error message announces.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the never-collected test",
          why: "The LEFT JOIN's unmatched side carries NULL everywhere on the payments payload — exactly the 6 statements with no leg. IS NOT NULL flips the test and returns the 22 collected statements instead: the dunning list becomes its own complement, and billing chases money that already settled.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first order",
          why: "Dunning works biggest-first: 4,937.00 on top, down to 873.00. ASC opens the follow-up queue on the smallest balance and the paid-status lie at 1,756.00 drifts to the bottom of the conversation where nobody reads it.",
        },
      ],
      distractors: ["IS NOT NULL", "id", "ASC", "INNER JOIN"],
      walkthrough:
        "The anti-join that anchors the close. LEFT JOIN keeps all 28 statements and NULL-fills the ones with no settlement leg; WHERE p.id IS NULL keeps exactly those — 6 statements worth 15,217, ordered biggest first. The cents rule rides along: amount_cents / 100.0 prints the dollars (4,937.00 down to 873.00) without eating cents. The read billing takes away: five rows say open, one says paid — #28 at 1,756.00 — and that lie is the point of the exercise: the status column is a claim, the settlement table is the ledger of record, and the dunning list is built from the ledger, not the claim. The distractors fail honestly: IS NOT NULL returns the 22 collected statements and billing calls clients who already paid; id in the join key mis-pairs legs to statements by row-id coincidence; ASC inverts the queue; INNER JOIN in the key position is rejected syntax — and a bare INNER JOIN in the join itself would delete the 6 never-collected rows, which is the query's whole reason to exist. One join type, one NULL test, one stated order — the list billing actually duns from.",
    },
    {
      id: "cs-tink-6",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The platform opex stack",
      brief:
        "Tink-flavored brief on the storefront db: finance's close digest stacks platform opex category by category with a labelled TOTAL row underneath — one query, one stack, no spreadsheet math — because the digest goes straight into the partnership-deck appendix and every row must reconcile to the ledger's 25,416. Probed facts: 36 expenses across four categories — Rent 14 entries / 16,800.00, Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00 — and the TOTAL row re-scans the unfiltered ledger: 36 entries, 25,416.00. The stack is UNION ALL, not UNION: every row belongs, and a silent dedupe pass is a correctness question, not a style one. Biggest dollar row reads first, so the TOTAL crowns the stack.",
      ask: "Return entries and dollars per opex category plus a labelled TOTAL row for the whole ledger, biggest dollar row first.",
      template:
        "SELECT category,\n       COUNT(*) AS entries,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS dollars\nFROM expenses\nGROUP BY category\n{1}\nSELECT {2},\n       {4},\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nORDER BY dollars {3};",
      slots: [
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the no-dedupe stacker",
          why: "UNION ALL concatenates the TOTAL branch onto the category rows without a distinct pass — the honest stack for a report where every row belongs and no two rows can be identical. A bare UNION adds a dedupe sort for nothing, and EXCEPT or INTERSECT turn the stack into a set comparison the digest never asked for.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The TOTAL branch must carry a label literal so the appendix row reads TOTAL / 36 / 25,416.00 instead of a blank category that looks like a data error. The x3 rule: the grand row is labelled or it is not a grand row.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-dollar-first order",
          why: "The digest reads biggest dollar row on top: TOTAL 25,416.00, then Rent 16,800.00, Ads 4,570.00, Travel 2,521.00, Tools 1,525.00. ASC floats Tools to the crown and buries the TOTAL at the bottom — the appendix reads bottom-up, which nobody does.",
        },
        {
          answer: "36",
          kind: "number",
          label: "the all-in entry count",
          why: "The TOTAL row must count the whole ledger — 36 expense entries, not the per-category 14 / 14 / 3 / 5 — because its dollars column (25,416.00) is the unfiltered grand total. Pinning the count keeps the row honest even if the category fold upstream changes.",
        },
      ],
      distractors: ["EXCEPT", "INTERSECT", "'SUBTOTAL'", "14", "ASC"],
      walkthrough:
        "Two branches, one stack, one labelled crown. The detail branch folds 36 expenses into four category rows — Rent 14 / 16,800.00, Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00 — and the TOTAL branch re-scans the unfiltered expenses table: 36 entries and 25,416.00, so the digest shows the categories against the whole ledger without a second query. UNION ALL is the join between grains — no dedupe, and the outer ORDER BY dollars DESC floats the TOTAL row (2,541,600 cents) to the top. The cents rule rides through both branches: amount_cents / 100.0 with the .0. The distractors fail honestly: EXCEPT returns the category rows minus the TOTAL — the crown vanishes; INTERSECT returns the empty set, an appendix with no rows at all; 'SUBTOTAL' labels the row something the ledger glossary does not define; 14 in the count slot pins the TOTAL to a single category's worth of entries; ASC inverts the stack. Four categories, one TOTAL, zero spreadsheet math — the digest finance actually ships.",
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
    { slug: "point-in-time-asof", why: "The per-call rate in force as of the agreement date — pricing that changed mid-cycle. As-of logic is how Tink's billing desk reconstructs what a cycle should have cost, statement by statement." },
    { slug: "scd2-build", why: "Bank partners change rails, regions and ownership mid-cycle — the slowly-changing-dimension build that versions the coverage directory instead of overwriting its history." },
    { slug: "keep-latest-dedupe", why: "Bank-directory feeds send the same partner twice; keep the latest extract by load timestamp. The dedupe shape that keeps the bench at 6 partners instead of 9 phantom ones." },
    { slug: "late-arriving-restatement", why: "Go-live stamps arrive after the quarter deck ships — restate the trend without breaking the 14-month spine. Every Tink close has one of these rows waiting." },
    { slug: "snapshot-delta-detect", why: "The coverage bench shifts between quarter snapshots — EXCEPT the two snapshots and name what moved. Set algebra as partnership-review hygiene." },
    { slug: "journal-gap-detection", why: "Ledger entries with a gap in the sequence — the missing-entry hunt that runs before the trial balance can close at delta zero." },
    { slug: "trial-balance-check", why: "Debits against credits folded per account — the 181,080 = 181,080 close check. The billing pod's last query of the day, and the interview treats it as muscle memory." },
    { slug: "gl-reconciliation", why: "Per-account debits and credits reconciled line by line — where the usage-billing world meets the GL. The cents-safe fold every finance-flavored screen escalates into." },
    { slug: "deferred-revenue", why: "Usage billed ahead of calls served — the recognition split. A two-population fold over billing windows that open-banking platforms run every close." },
    { slug: "mrr-waterfall", why: "Client movement between value tiers — CASE-banded waterfall from last month's bucket to this one's. The expansion-and-churn story the coverage review opens with." },
    { slug: "net-revenue-retention", why: "Expansion net of revocation, per signing cohort — NRR at open-banking grain. A cohort fold with the denominator stated, the partnership team's favorite escalation." },
    { slug: "growth-accounting", why: "New, churned and expanded clients folded into one ledger — growth accounting at client grain. The shape behind every 'did coverage broaden or concentrate' answer." },
    { slug: "rolling-7d-actives", why: "Call lines inside a rolling 7-day window — the connectivity pulse. Window edges stated, boundary rows kept: the same half-open discipline the consent windows teach." },
    { slug: "dau-wau-stickiness", why: "Daily calling clients over weekly — API stickiness at two grains. A ratio whose numerator and denominator are both DISTINCT counts, the grain habit in one query." },
    { slug: "cohort-retention-matrix", why: "Clients by signing month crossed with months-since — the retention matrix. A two-key fold that turns the 16-client book into a coverage surface the partnerships deck quotes." },
    { slug: "median-time-to-convert", why: "Signing to go-live, median beside mean — the 2.98-day average hides the skew, and the median is the honesty check. Percentile thinking over the stamped-82 population." },
  ],
};
