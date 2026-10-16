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
    "Preparation strategy: the pools file carries **no NatWest section** — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: status-aware settlement counts, two-grain corridor censuses, big-ticket scalar screens, relationship-depth folds, CASE-banded reset tiers and the cents-safe billing layer. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {rose:large-exposure watchlist} credit triages before it adds a corridor line, the other rebuilds the {emerald:relationship-depth census} the commercial team opens reviews with. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 and every money fold tie back to the GL by construction.",
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
      slugs: ["immediate-food-delivery-i", "monthly-transactions-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Flows and clients are different grains of the same join, and every corridor census here reports both: EU runs 45 flows from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Joining clients to the book",
      why: "Corridor, vintage and segment ride on the customer row, and every flow inherits them through joins that can be missing or stale. NatWest's follow-up is always about what survives: does a flow whose client row went missing still count in the corridor fold — and is that silence a query bug or a data incident?",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Concentration & exposure ladders",
      why: "The commercial story is a concentration story: 63.5% of the book sits with 3,000-plus clients (71.2% above 2,000), and the correspondent bench carries the shelf six partners wide. GROUP BY folds with HAVING gates and per-partner totals are the exact drills — the ladder is where credit asks 'what happens if this one walks?'",
      slugs: ["product-sales-analysis-ii", "top-earners", "classes-more-than-5-students"],
    },
    {
      name: "Scalar thresholds & big-ticket screens",
      why: "The large-exposure screen compares every flow against the book-wide average ticket — 338.19 on this db — with a scalar subquery doing the folding. Screens escalate into nested logic because credit triage is nested logic: which flows sit above the line, which clients clear a flow floor, what happens when the inner fold comes back empty.",
      slugs: ["managers-with-at-least-5-direct-reports", "game-play-analysis-iv", "second-highest-salary"],
    },
    {
      name: "Relationship-depth folds",
      why: "Commercial banking is relationship banking: the depth ladder runs 24, 17, 14, 13, 5 flows at the top, then a four-way tie at 4, and the single-flow cohort is where attrition is born. Two-stage queries — fold per client, then judge the fold — are the kit's derived-table drills, and the empty-case answer is part of the question.",
      slugs: ["market-analysis-i", "investments-in-2016", "employees-whose-manager-left-the-company"],
    },
    {
      name: "Ranking the relationship ladder",
      why: "Ladders are rank-window reporting where ties are guaranteed — four clients sit at 4 flows on this book, right under the 24/17/14/13/5 run. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer relationships, not syntax.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-three-orders"],
    },
    {
      name: "CASE banding & reset tiers",
      why: "The reset cycle bands everything — ticket tiers, reset windows, premier-versus-standard treatment — and each band is a CASE arm with fixed, published edges. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the reset forecast, and a reordered WHEN quietly re-bands the book.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "triangle-judgement"],
    },
    {
      name: "Reset calendars & month spines",
      why: "The 14-month flow spine (2024-01 to 2025-02) is where the reset calendar lives: month buckets via SUBSTR or STRFTIME, half-open windows that never drop month-end bookings, and julianday clocks rounded once. Value-date latency, not terms, is where the interesting date math sits here.",
      slugs: ["the-latest-login-in-2020", "list-the-products-ordered-in-a-period", "rising-temperature"],
    },
    {
      name: "Cents discipline & the GL",
      why: "Banking is a cents game: fee statements, rail legs and opex carry INTEGER pence, so every dollar read is amount_cents / 100.0 and the missing .0 is how a 1,200.00 lease line prints as 12. The GL proof — 181,080.00 against 181,080.00, delta 0 — is the close's final gate, and reconciliation reads are the closest thing this kit has to a finance round.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "npv-queries"],
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
  ],
};
