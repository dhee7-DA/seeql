// MUFG — Wave-9 (Task 98-mufg), banking domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Japan's megabank, read the way its corridor desks and control functions read it: MUFG Bank's
// corporate-and-trust engine books client flows that must settle on a rail, the retail deposit
// franchise and the Morgan Stanley alliance sit behind the same book, and after the BOJ's
// negative-rate exit every basis point of the lending book is re-priced in SQL. The storefront db
// maps on honestly: orders are booked client flows (REAL booked value — the one table where money
// is already scaled), customers are corporate & retail counterparties assigned to four corridor
// buckets (APAC = the Japan/Asia home corridor out of Osaka, Nagoya and Seoul; EU = the European
// corridor; US = the Americas corridor; LATAM = the São Paulo pilot line), order_items are the
// instrument legs on each flow (quantity = units, unit_price = leg price), shipped_at is the
// value-date settlement stamp, products are the product shelf (lending, trust and
// asset-management products), suppliers are correspondent & trust partners, invoices are
// fee-billing statements on a flat 30-day documentary tenor, payments are settlement legs
// (method card = the domestic Zengin-style clearing rail, wire = the cross-border SWIFT-style
// rail), expenses are desk-and-network opex lines, ledger_entries is the double-entry book of
// record. Money in invoices/payments/expenses/ledger is INTEGER yen-cents — the yen read is
// always amount_cents / 100.0. Pool provenance: MUFG has 0 tagged sql rows in the band (checked
// company-pools.md for mufg / MUFG variants) — every topic and problem slug is theme-curated from
// the pools file's theme menu to the question families its screens are known for (corridor folds,
// fail watches, T+2 clock math, status CASE ladders, books of record), provenance stated per
// topic and per problem. Case figures: scripts/company-facts.md (probed 2026-10-12); every case
// slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-9 registry wiring agent: mufg is NOT yet in registry COMPANY_META — wire
// id "mufg", domainId "banking", name "MUFG", tagline "Japan's megabank: corridors, rails, the rate pivot",
// accent text-red-400 to match this header exactly.

import type { CompanyKit } from "../types";

export const mufgKit: CompanyKit = {
  id: "mufg",
  domainId: "banking",
  name: "MUFG",
  tagline: "Japan's megabank: corridors, rails, the rate pivot",
  accent: "text-red-400",

  brief: [
    "**MUFG** — Mitsubishi UFJ Financial Group — is Japan's largest bank and one of the biggest banks on earth by assets: a corporate-and-trust banking core (MUFG Bank), a retail deposit franchise, a global asset-management arm and the Morgan Stanley alliance, stitched together by corridors that move yen between Tokyo, Asia, the Americas and Europe. The through-line for an analyst: a corporate flow is not money moved until it settles on a rail and posts to the book — and after the BOJ's negative-rate exit, every basis point on the lending book gets re-priced in SQL. This kit maps the storefront db onto that world: the 16 customers rows are corporate and retail counterparties across four corridor buckets, the 103 orders are booked client flows worth **34,833.28**, and the 251 order_items rows are instrument legs. The status map is fixed: delivered = {emerald:settled to final} (52, 50.5%), shipped = {sky:in flight} (30, 29.1%), pending = awaiting confirmation (14), cancelled = {rose:busted} (7, 6.8%).",
    "The data org splits into corridor analytics, credit-and-collections and the finance control functions, and all three read the same spine at different grains. A flow books at created_at and stamps `shipped_at` on value date — **82 of 103 flows** carry the stamp, averaging 2.98 days booked-to-settled inside a 2–4 band: the desk's {amber:T+2 clock} with real drift (the Americas book runs 3.07 against the home corridor's 2.93). Money sits one layer down: fee-billing statements, settlement legs, opex and the ledger carry INTEGER yen-cents, so every yen read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of booked value sits with counterparties whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost mandate moves a quarter.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain corridor census** — the home corridor runs 37 flows from 5 counterparties while the Americas runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'do awaiting flows sit in your base?'*), then into the {sky:settlement-fail watchlist}: an anti-join over statements and settlement legs that reads **6 never-collected receivables worth 15,217**, one of which (#28, 1,756.00) claims `status = 'paid'` with zero legs. Late rounds walk the book of record — the trial balance must read 181,080 against 181,080, delta zero — and the receivables clock: the paid book settles in 28.4 days average against the flat 30-day documentary tenor, fastest 13, slowest 84.",
    "Preparation strategy: the pools file carries no MUFG section — **0 tagged LC** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: corridor censuses, fail watches, T+2 clock math, CASE status ladders and the yen-cents ledger spine. Do the topics in order, then run all six case studies on the live storefront db: the {emerald:corridor fate matrix} the corridor heads open the pack with and the {sky:payment-terms clock} credit ops reads at every close, then the exposure ladder, the one-pass coverage census, the settlement-fail watchlist and the month-over-month burn pulse that fill out the spaced-practice set. The bar to clear: *state the denominator, the corridor and the tenor before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day opens inside the Zengin clearing window. A corridor analyst pulls the overnight book before the Tokyo desk call: did the corporate flows confirm, did any in-flight flow miss its value date, does the one-pass fate census reconcile — 52 settled + 30 in flight + 14 awaiting + 7 busted = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the {amber:T+2 clock} drifts off the **2.98-day** norm — the Americas book averages 3.07 against the home corridor's 2.93 — the confirmation queue gets pulled before the morning risk pack ships.",
    "**11:30 —** Midday is the corridor read. The corridor heads want booked value beside counterparty counts (Europe 45-from-8, the home corridor 37-from-5, the Americas 19-from-2) and the client ladder with the four-way tie at 4 flows handled honestly — shared rungs, named tie-break — while the coverage pod re-cuts {rose:63.5% of booked value} from 3,000-plus counterparties. The Morgan Stanley desk sync lands an hour behind Tokyo, so each query ships with `COUNT(DISTINCT customer_id)` beside COUNT(*) and the grain spelled out. The analyst writes it twice anyway — *once to answer, once with the definition spelled out so the number survives the control review*.",
    "**15:30 —** The afternoon tilts toward the books. The receivables anti-join refreshes first — **6 never-collected worth 15,217** — before collections sends a single reminder; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00). The paid book's clock reads 28.4 days against the flat 30-day tenor, with an 84-day outlier the credit committee will ask about. The day ends the way every close does: the {violet:trial balance} must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Booked-flow value", what: "Total booked client flows: 34,833.28 across 103 flows, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the mandate story — one 1,088.44 flow outweighs the smallest 42 combined." },
    { name: "Settled-flow rate", what: "Flows with a value-date stamp ÷ all flows booked: 82 of 103 (79.6%). The top-of-morning number the corridors read — the 14 awaiting rows are 'not yet confirmed', never a silent zero." },
    { name: "T+2 settlement clock", what: "Booked-to-settled (created_at → shipped_at) over stamped flows only: 2.98-day average inside a 2–4 band. The corridor cuts sit at 2.93 (home), 2.94 (Europe), 3.07 (Americas), 3.5 (São Paulo) — the population definition ships with the number." },
    { name: "Kept-vs-busted map", what: "Settled-to-final (delivered) ÷ ALL flows booked: 52 of 103 (50.5%), against a busted share of 7 (6.8%) sliced by corridor — home 8.1%, Europe 6.7%, Americas 5.3%, pilot line 0. The denominator question is the whole interview." },
    { name: "Corridor intensity", what: "Flows per counterparty at two grains: Europe runs 45 flows from 8 counterparties, the home corridor 37 from 5, the Americas 19 from 2, São Paulo 2 from 1. COUNT(*) beside COUNT(DISTINCT customer_id) — load versus coverage." },
    { name: "Client concentration", what: "Share of booked value from counterparties spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs coverage teams and sizes the mandate-review committee." },
    { name: "Fee-receivable coverage", what: "Billed versus settled on the 28 fee statements (flat 30-day documentary tenor): 21 exact (65,612), 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join credit ops refreshes every close." },
    { name: "Settlement rails & book of record", what: "Legs by rail: card (domestic Zengin-style) 16 legs for 37,364, wire (cross-border SWIFT-style) 11 legs for 32,248 — footing to the cash account's 27 debits of 69,612. Beneath it the trial balance: 181,080 against 181,080, delta zero." },
  ],

  topics: [
    {
      name: "Corridor flow censuses",
      why: "Every MUFG screen opens with the two-grain census: flows booked AND counterparties covered, per corridor. Europe runs 45 flows from 8 counterparties while the Americas runs 19 from 2 — COUNT(*) beside COUNT(DISTINCT customer_id), and saying out loud which is load and which is coverage, is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Settled-vs-booked funnel",
      why: "The funnel is the desk's heartbeat: flows booked, value-date stamped, settled to final. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight flow 'settled' — 30 versus 52 on this book.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Counterparty joins & survival",
      why: "Counterparties carry corridor and onboarding date; flows inherit them through joins, and the join type decides who survives. A flow without a counterparty is corruption; a counterparty without flows is whitespace — though on this book the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "top-travellers"],
    },
    {
      name: "Fail watchlists & anti-joins",
      why: "The settlement-fail watchlist is an anti-join: fee statements LEFT JOINed to settlement legs, kept only when the leg never lands — 6 never-collected worth 15,217 on this book. Writing it with NOT IN over an unguarded column empties the watchlist silently, which is how a control function ships a false all-clear.",
      slugs: ["customers-who-never-order", "sales-person", "customer-who-visited-but-did-not-transact", "chargeback-rate-ranking", "consecutive-transactions-with-increasing-amounts", "amount-anomaly-zscore"],
    },
    {
      name: "Exposure ladders",
      why: "Coverage reviews rank counterparties by flow count where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5, then FOUR counterparties tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer coverage, not syntax.",
      slugs: ["rank-scores", "top-earners", "find-the-team-size", "credit-utilization-bands", "portfolio-concentration-hhi", "portfolio-weights"],
    },
    {
      name: "The settlement clock",
      why: "Settlement lag is julianday(shipped_at) - julianday(created_at) over stamped flows: 2.98 days average inside a 2–4 band, 3.07 in the Americas against 2.93 on the home corridor. Duration math over two timestamps — with the unstamped 21 rows excluded by a stated filter, never silently skipped.",
      slugs: ["average-time-of-process-per-machine", "biggest-window-between-events", "second-day-confirmation", "prepayment-detection", "second-most-recent-activity"],
    },
    {
      name: "Regulatory month spines",
      why: "Regulatory and management reporting bucket the 14-month flow spine (2024-01 to 2025-02) by SUBSTR(created_at, 1, 7) — the trough month reads 1,193.86 against an opening 3,731.97. LAG and LEAD walk it; the wrong '%m' bucket merges Januaries two years apart and the pack mis-files.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "sales-analysis-iii", "loan-amortization-schedule"],
    },
    {
      name: "CASE ladders: status, fate, coverage",
      why: "Banking classifications are CASE ladders — settled versus in-flight versus busted, exact versus partial versus never-collected, 30-day tenor versus aging buckets. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the pack, and a reordered WHEN quietly re-buckets the book.",
      slugs: ["delinquency-buckets", "loan-types", "weather-type-in-each-country", "delinquency-roll-rates", "vintage-default-curves"],
    },
    {
      name: "Trust-partner bench folds",
      why: "Correspondent and trust partners are judged on their shelf: revenue folded through products to instrument legs, listings beside rating. The joins are three deep — partners to shelf to legs — and every fold has to say whether it counts listings, legs or flows.",
      slugs: ["students-and-examinations", "average-selling-price", "product-sales-analysis-iii", "npv-queries", "sharpe-ratio", "max-drawdown"],
    },
    {
      name: "Books of record & yen-cents discipline",
      why: "Status is a claim; the settlement legs and the ledger are evidence. Statements and legs carry INTEGER yen-cents — the yen read is amount_cents / 100.0 — and the trial balance must land 181,080 against 181,080, delta zero. Reconciliation queries are how a megabank proves the close.",
      slugs: ["trial-balance-check", "gl-reconciliation", "monthly-transactions-ii", "account-balance", "deferred-revenue"],
    },
  ],

  theory: [
    {
      id: "mufg-t1",
      q: "Your flow report joins counterparties to bookings. When do you INNER and when do you LEFT — and what silently breaks if you filter a status column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A settled-value report joins flows to counterparties: a flow with no counterparty row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from counterparties: the counterparties with no flows ARE the answer, arriving with NULL flow columns — on a global bank that includes freshly onboarded corridor entities with no book yet. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload counterparty row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this book the never-booked anti-join returns a confident zero — all 16 counterparties appear in the flow table somewhere — and proving that zero is itself the control function's job, not an assumption to skip. Say the survival rule first, pick the join second, and write the rule in the query comment so the reviewer can audit the intent, not just the output.",
      tag: "joins",
    },
    {
      id: "mufg-t2",
      q: "The client ladder runs 24, 17, 14, 13, 5 flows, then FOUR counterparties tied at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — here the four-way tie at 4 consumes ranks 6 through 9, and the next distinct count (3) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose coverage team gets the relationship next — on a book where 63.5% of value sits with 3,000-plus counterparties, arbitrary is expensive. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer counterparties (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. On the client ladder the tie at 4 is four real relationships with four real coverage owners; the ranking function decides how the ladder reads on the slide, so the policy belongs to the coverage desk, not to the default.",
      tag: "windows",
    },
    {
      id: "mufg-t3",
      q: "The census shows 103 booked flows and 16 counterparties; the home corridor shows 37 flows and 5 counterparties. Why do the two columns disagree, and what does each mean to the desk?",
      a: "They disagree because they count at different grains. COUNT(*) counts flow rows after the join — one row per flow, so a counterparty with 24 booked flows contributes 24. COUNT(DISTINCT customer_id) folds those rows back to counterparties — the home corridor's 37 flows collapse to 5 mandates. Neither is wrong: flows measure desk load and client activity, counterparties measure installed relationships and coverage. The comparison — 37-from-5 on the home corridor against 19-from-2 in the Americas — is the intensity signal that decides whether a corridor is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for instrument legs and COUNT(*) silently counts legs, not flows — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, and on a megabank book the three grains have three different owners: legs belong to ops, flows to the desk, counterparties to coverage.",
      tag: "aggregation",
    },
    {
      id: "mufg-t4",
      q: "shipped_at is NULL until a flow settles. What is your policy for the T+2 settlement report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped flows have a lag, so the report measures booked-to-settled for the 82 of 103 flows that carry the value-date stamp — averaging 2.98 days inside a 2–4 band — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL flows returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting plus 7 busted rows, which is a feature, not a bug — that gap is the confirmation queue. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average — that invents same-day settlement for flows that never confirmed, and on a T+2 book a fake same-day cohort corrupts the corridor cuts (2.93 home versus 3.07 Americas) the desk manages against. A report whose WHERE clause is doing definitional work without saying so is exactly what a MUFG control reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "mufg-t5",
      q: "The corridor pack wants booked flows per corridor for corridors carrying at least ten bookings. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, awaiting and busted rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-booking floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this book the floor admits Europe (45), the home corridor (37) and the Americas (19) and drops the São Paulo pilot line's 2 — a real cut, not a decoration, and the pack says so on the slide. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a regulatory line and an error, and between a threshold applied to flows versus to value. The strong answer places every filter by asking: is this a fact about one flow, or about a corridor?",
      tag: "pipeline",
    },
    {
      id: "mufg-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average monitor silently returns nothing while looking valid. On the full book that is theoretical: 103 flows always produce a mean (338.19 average ticket against a 25.47 to 1,088.44 spread). On filtered staging books — one corridor, one status, one month — the empty-inner-query bug ships regularly, and a surveillance threshold is exactly where it hides: an empty monitor reads as 'no oversized flows', which is a false all-clear a control function would call an incident. The correlated cousin (compare each flow to ITS corridor's average) re-runs per outer row and answers a different question at a different cost — the Americas' 383.48 average against the home corridor's 313.66 means one global threshold mis-flags both corridors. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "mufg-t7",
      q: "The regulatory pack buckets flows by month on TEXT timestamps and times the fee book from issue to first settlement. How do you build the spine, cut a quarter without losing its last night, and read the 84-day outlier?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this book from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the pack mis-files. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when desks push flow. The clock: fold each statement's legs to MIN(paid_on) first — split settlements enter the clock at their first leg, not their last — then julianday(first leg) - julianday(issued_on), which on the paid book averages 28.4 days against the flat 30-day tenor, fastest 13, slowest 84. The 84 is not a rounding note: it is 2.8× terms, a named relationship and a credit-committee question. And the first row of a LAG walk over the spine is NULL by definition — the baseline, never a zero coalesced into a fake flat month.",
      tag: "dates",
    },
    {
      id: "mufg-t8",
      q: "Finance says a fee statement is 'paid' but the settlement-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this book that returns 6 never-collected statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this book has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage split must read 21 exact (65,612) / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship. The money rule: statements and legs carry INTEGER yen-cents, so every yen read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 175,600 and ships a hundredfold error into the regulatory pack.",
      tag: "quality",
    },
    {
      id: "mufg-t9",
      q: "The desk wants a 3-month moving average of monthly burn across the 14-month spine. How do you build the frame, and where do ROWS and RANGE disagree?",
      a: "AVG(burn) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) is the rows-true 3-bucket average — two preceding rows plus today, computed after the CTE folds 103 flows into 14 monthly buckets. The disagreement is ties and gaps: the default frame is RANGE, which admits peers on the ordering key — harmless on a one-row-per-month spine, deadly the moment the axis is value dates where flows tie. And ROWS peers 2 ROWS back, not 2 MONTHS back: if a month is missing from the fold, the window silently averages a different calendar than the one you named. The MUFG discipline is zero-fill the spine first (a calendar CTE LEFT JOINed to the fold, COALESCE the burn to 0 — a booked-zero is a fact, an absent month is a lie), then window over the complete spine. Say the frame out loud in the query comment; the reviewer reads frames the way credit reads tenors.",
      tag: "windows",
    },
    {
      id: "mufg-t10",
      q: "A regulatory stack combines settled flows and in-flight flows per corridor with UNION, and a reviewer says one corridor row vanished. Diagnose, and state the discipline you ship instead.",
      a: "UNION deduplicates whole rows across branches: two branches that emit byte-identical rows — same corridor, same counts, no branch label — collapse into one, and the pack loses a corridor with no error anywhere. The diagnosis is to add a branch-label column and re-run: the vanished row reappears labeled. The discipline is UNION ALL for arms that are logically disjoint (settled versus in-flight cannot be the same row), plus a label column ('settled', 'in-flight') and a comment stating WHY duplicates are impossible — the comment is the correctness argument a control reviewer audits. When branches genuinely overlap (the same flow appearing in two legs of a restatement), UNION's dedupe is the business logic — but then you say which duplicated rows you are paying to collapse. Column discipline holds either way: matching column counts, compatible types, names taken from the first branch.",
      tag: "set-ops",
    },
    {
      id: "mufg-t11",
      q: "The corridor pack must show the São Paulo pilot line even when a status arm counts zero. How do you keep empty buckets honest in SQL?",
      a: "A missing row and a printed zero are different claims: a missing row reads 'no such corridor', a zero reads 'the corridor exists and did nothing' — and the pilot line exists (2 bookings). Inside a GROUP BY over the flow book, every corridor that appears in the data gets a row and its zero arms come from SUM(CASE) ELSE 0 or FILTER — the arms are exhaustive by construction. The dishonest shape is filtering first: WHERE status = 'delivered' before the fold deletes corridors with no settled flows entirely. When the bucket axis is a dimension that might not appear at all — a corridor with zero bookings in a fresh market — LEFT JOIN from the corridor dimension and COALESCE the counts to 0, or UNION ALL zero-buckets for fixed bands (aging buckets 0–30/31–60/61–90 must all print, even empty). The rule the pack lives by: the reader must never confuse 'nothing happened' with 'we forgot to look'.",
      tag: "aggregation",
    },
    {
      id: "mufg-t12",
      q: "'Show me flows above their corridor's average ticket.' Correlated subquery, derived table, or window function — compare all three and pick one for the corridor desk.",
      a: "Three correct answers with different costs. The correlated form — WHERE total > (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o.customer_id's corridor) — re-runs the average once per outer row: clearest to read, slowest at scale, and the Americas' 383.48 average against the home corridor's 313.66 proves why per-corridor matters (one global threshold, 338.19, mis-flags both). The derived-table form folds per corridor in a CTE and joins back on region: set-based, one pass, and the CTE name documents the population. The window form — total > AVG(total) OVER (PARTITION BY c.region) — computes each corridor's average once and keeps every row, which is the shape you want when the report needs the below-average rows visible too. On the desk's daily read I ship the window: it is the derived table's cost with the correlated form's row-preserving output, and the PARTITION BY is the corridor definition spelled out where the reviewer can see it.",
      tag: "subqueries",
    },
    {
      id: "mufg-t13",
      q: "Payments ops wants every pair of settlement legs that share an invoice — the double-pay hunt. How do you self-join without counting each pair twice?",
      a: "The pairwise self-join with an ordered key: FROM payments a JOIN payments b ON a.invoice_id = b.invoice_id AND a.id < b.id. The < guard is the whole trick — it keeps exactly one orientation of each pair, so a two-leg split settlement (invoices 1, 5, 12, 19, 22 on this book) yields one pair, not two, and a three-leg settlement yields three pairs, not six. Drop the guard and every pair comes back doubled plus a degenerate self-pair (a.id = b.id) that isn't a pair at all. Then judge them on the business rule: same amount_cents within a few days is a suspected double-pay (a clawback before the counterparty notices); different amounts on one invoice is the legitimate split this book runs. The same pair-once grammar powers counterparty co-booking pairs and mandate-overlap reads. Say 'a.id < b.id is the dedupe' out loud — the candidate who writes equality joins both orientations ships a double-count to the clawback committee.",
      tag: "joins",
    },
    {
      id: "mufg-t14",
      q: "Rewrite the settlement-fail watchlist with NOT EXISTS. What does it buy over NOT IN, and what must the inner predicate pin down?",
      a: "Shape: SELECT i.number … FROM invoices i WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — on this book that returns the 6 never-collected statements worth 15,217, #28 among them. What it buys: NOT EXISTS is an existence probe that short-circuits on the first matching leg and never trips on NULLs, where NOT IN materializes the leg list and goes UNKNOWN for every row the moment one NULL invoice_id enters it — the watchlist empties silently and collections ships a false all-clear. The inner predicate must correlate on the exact key (p.invoice_id = i.id) and nothing else unless the business rule says so: a 'fails over 30 days' watchlist adds the aging predicate inside the EXISTS, not outside, or the population drifts. And state the empty-case behavior: on the clean core book a confident zero is a real answer — but only when the query can prove the zero came from data, not from three-valued logic.",
      tag: "nulls",
    },
    {
      id: "mufg-t15",
      q: "Split settlements pay in two legs. How do they enter the settlement clock, and what does MIN versus MAX paid_on do to the 28.4-day average?",
      a: "Fold the legs per statement first — the CTE takes MIN(paid_on) GROUP BY invoice_id — so each statement enters the clock at its FIRST settlement leg, which is the day the money started arriving; julianday(first leg) − julianday(issued_on) over the paid-status statements that carry a leg (20 of the 21 paid — #28 claims paid with zero legs and drops out of the join) averages 28.4 days against the flat 30-day tenor, fastest 13, slowest 84. MAX(paid_on) answers a different question — the day the position fully cleared — and stretches the average and the 84-day tail; neither is wrong, but the report must say which clock it prints. The silent bug is skipping the fold: joining statements straight to legs double-counts the five split statements (their two legs each) and clocks them twice. Population first, fold second, clock third — and the 84-day outlier ships with a name attached, because 2.8× tenor is a credit-committee conversation, not a rounding note.",
      tag: "dates",
    },
    {
      id: "mufg-t16",
      q: "Counterparty names arrive as ' acme k.k.' from one feed and 'Acme K.K.' from another. What breaks downstream, and what is the hygiene?",
      a: "Every join and GROUP BY keyed on the raw name splits one counterparty into two — the concentration read loses a mandate, the corridor census grows a phantom counterparty, and nothing errors because both strings are valid text. The hygiene is normalize-once-in-a-staged-CTE: TRIM(name) kills the padding, UPPER() or INITCAP() fixes the register, and the staged normalized key is what every later join and fold uses — not inline TRIM(UPPER(…)) sprinkled through six queries, which is six chances to miss one. Numbers don't save you: the same feed drift hits invoice numbers ('INV-2024-018' versus 'inv-2024-018 ') and payment references. The banking framing: a name is a join key, and a join key is a contract — normalization happens once at the ingestion boundary, the contract is written in the CTE's name (counterparties_clean), and the audit trail keeps the raw value so the cleanup is reversible. Fix it at the port, not in every report.",
      tag: "casing",
    },
    {
      id: "mufg-t17",
      q: "The coverage pod wants exposure quartiles across the 16 counterparties. How does NTILE behave, and where does PERCENT_RANK read better than RANK?",
      a: "NTILE(4) OVER (ORDER BY flows DESC) chops the ranked ladder into four tiles as evenly as row counts allow — 16 counterparties become four tiles of exactly 4, and the top tile is the coverage pod's A-list (the 24, 17, 14, 13 ladder). The behavior to narrate: NTILE respects row counts, not tie values — the four-way tie at 4 flows can straddle a tile boundary, and which tied counterparty lands in which tile follows the window's ORDER BY, so the tie-break must be named (flows DESC, customer_id ASC) or the tiles shuffle run-to-run. PERCENT_RANK reads better when the stakeholder wants relative standing rather than buckets: it returns 0-to-1 across the ladder (the top counterparty at 0, the bottom at 1), which feeds scatter plots and 'top decile' cuts that survive adding an account. The policy call: tiles for coverage assignments, percentiles for peer benchmarks — and neither silently splits the tie that RANK or DENSE_RANK would have shared.",
      tag: "windows",
    },
    {
      id: "mufg-t18",
      q: "One scan, four status counts: FILTER (WHERE …) versus SUM(CASE …). Which do you ship for the fate census, and why does the census have to be one scan at all?",
      a: "Both are the one-pass census: COUNT(*) FILTER (WHERE status = 'delivered') and SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) fold 103 flows into 52 settled + 30 in-flight + 14 awaiting + 7 busted in a single scan, reconciling to 103 by construction. FILTER is the modern idiom — the aggregate intent reads at a glance and no ELSE bookkeeping exists to get wrong; SUM(CASE) is the portable twin that runs on any engine and any vintage this bank still certifies. The reason it must be one scan is drift control: four sequential queries are four chances for four different WHERE clauses to disagree — a status list edited in one and not the others, and the census stops reconciling to 103 with nothing announcing it. The pre-3.30 engines that can't run FILTER get the SUM(CASE) twin verbatim. Whichever ships, the identity check (the four arms must sum to COUNT(*)) belongs in the same query as a CASE that prints 'OK' or 'BROKEN' — the census audits itself or it isn't a census.",
      tag: "aggregation",
    },
    {
      id: "mufg-t19",
      q: "The FX re-mark takes the latest rate per pair per day, and two feeds stamp the same timestamp. How do you pick deterministically — and why not join to MAX(timestamp)?",
      a: "ROW_NUMBER() OVER (PARTITION BY pair, rate_date ORDER BY stamped_at DESC, feed_source, id) numbered newest-first, then keep rn = 1. The named tie-break is the answer: when two feeds stamp the same second, the window still assigns distinct numbers (1 and 2) in an order you chose — feed priority, then id — so tomorrow's re-mark reproduces today's. Join-to-MAX(timestamp) is the shape it replaces, and it fails on exactly this case: the join to the max stamp matches BOTH tied rows, doubling the position for that pair, and the doubling is silent. The same argmax-with-tie-break pattern picks each counterparty's most recent booking and each account's latest corridor assignment. The policy lives in the comment: 'feed_source order = [bloomberg, reuters, internal]' — because a deterministic tie-break nobody can name is just a bias nobody can audit. On a yen-centered book, a doubled FX position is an ALM incident; the ROW_NUMBER fold is the control.",
      tag: "windows",
    },
    {
      id: "mufg-t20",
      q: "The flow spine gets filtered by month a hundred times a day. Why does WHERE SUBSTR(created_at, 1, 7) = '2024-07' defeat the index, and what is the sargable form?",
      a: "Sargability: an index on created_at stores whole values in order, and a predicate wrapped around the column — SUBSTR(created_at, 1, 7), UPPER(name), CAST on the key — forces the engine to compute the function per row and scan, because the index is ordered on created_at, not on SUBSTR(created_at). The sargable form is the half-open range: created_at >= '2024-07-01' AND created_at < '2024-08-01' — bounds the index can seek, and half-open so July 31's late bookings are not dropped the way BETWEEN '2024-07-01' AND '2024-07-31' drops the last night (and quarter-end is exactly when desks push flow). EXPLAIN QUERY PLAN is the receipt: SEARCH … USING INDEX for the range form, SCAN for the wrapped form. On a book this size the scan is survivable — on the production spine it is the morning report arriving at 10:40. The habit: never wrap the indexed column; wrap the constant or restructure the predicate, and read the plan once before the query goes into the pack.",
      tag: "indexes",
    },
    {
      id: "mufg-t21",
      q: "A regulatory pack must reproduce byte-for-byte next quarter. What is your ordering discipline, and where does nondeterminism sneak in?",
      a: "Every ORDER BY ends with a unique key. A pack sorted by COUNT(*) DESC alone shuffles whenever counts tie — the four-way client tie at 4 flows means today's pack orders Rossi, Sato, Meyer, Alvarez and tomorrow's orders Alvarez, Meyer, Sato, Rossi — and a regulator diffing two runs sees churn that isn't in the business. The discipline: ORDER BY metric DESC, then a stable unique key ASC (customer_id, or number on statements) — total order, same rows, same order, every run. Nondeterminism also sneaks in through ROW_NUMBER and NTILE over tied keys (same fix: the named tie-break inside OVER), through GROUP_CONCAT without ORDER BY inside the aggregate (concatenation order follows scan order), and through LIMIT without ORDER BY (an arbitrary top-N). The banking framing: reproducibility is a control requirement, not aesthetics — a pack whose row order drifts teaches the reviewer to stop reading diffs, and that is exactly when a real change slips through. Deterministic is a property you build in with the last ORDER BY term.",
      tag: "pipeline",
    },
    {
      id: "mufg-t22",
      q: "Where does COALESCE belong in the coverage ledger, and where does it turn into a lie?",
      a: "COALESCE belongs at the display layer, converting a structural NULL into a stated default: the LEFT JOIN to settlement legs hands the 6 never-collected statements a NULL payload, and COALESCE(SUM(p.amount_cents), 0) prints their paid cents as 0 — a real fact, correctly rendered. It becomes a lie when it rewrites evidence into fiction: IFNULL-ing the settlement lag to 0 invents same-day settlements for flows that never confirmed and corrupts the corridor clocks (2.93 home versus 3.07 Americas); COALESCE around a LAG baseline fabricates a prior month and the burn walk prints a crash that never happened; IFNULL(status, 'paid') upgrades unknowns into settled money — the exact lie the #28 anomaly exists to catch. The test to say out loud: does the NULL mean 'nothing, and zero is the honest rendering' (display sums) or 'unknown, and a number would be invented' (clocks, lags, statuses)? The first gets COALESCE; the second gets IS NULL filters, NULL-bucketed GROUP BY, or a printed blank — and a footnote.",
      tag: "nulls",
    },
    {
      id: "mufg-t23",
      q: "Walk me through your month-close proof chain for this book — the queries you run before the close ships.",
      a: "Four proofs, one query each, reconciling by construction. One: the coverage split — invoices LEFT JOIN payments folded per statement reads 21 exact (65,612), 1 partial (4,000 of 6,148), 6 never-collected (15,217), and the arms must sum to 28. Two: the rails foot — card legs 16 for 37,364 plus wire legs 11 for 32,248 must equal the cash account's 27 debits of 69,612; a split payment entering twice or a leg dropping breaks the foot. Three: the trial balance — 181,080 debits against 181,080 credits, delta zero, or nothing downstream is worth reading. Four: the fail watchlist — the same 6/15,217 anti-join walked line by line, because the anomalies live at row level: #11 void-but-settled (925.00) never appears in the watchlist, #28 paid-with-zero-legs (1,756.00) appears in it claiming to be paid. Each proof is one deterministic query with the population stated; the close ships when all four reconcile the same day. The candidate who can narrate the chain — and what a broken link smells like — is the candidate the control function hires.",
      tag: "quality",
    },
    {
      id: "mufg-t24",
      q: "Settled-flow rate: is it 82 of 103 or 52 of 103 — and how do you keep the denominator honest when the desk quotes the number?",
      a: "Both, under different names — the denominator IS the definition. 82 of 103 (79.6%) is the stamped rate: flows carrying a value-date stamp, which measures the confirmation pipeline (delivered 52 + shipped 30). 52 of 103 (50.5%) is the kept rate: settled to final, the funnel's bottom. The dishonest versions both drop rows: excluding the 14 awaiting (denominator 89) flatters every rate; excluding the 7 busted too (denominator 82) turns the kept rate into a conditional and the bust risk vanishes from the read. Awaiting and busted stay in the base — 'not yet' and 'never' are both outcomes the corridor owns. The habit the panel grades: name the metric after its denominator ('stamped rate', 'kept rate over all booked'), print COUNT(*) beside the rate so the base is visible on the slide, and when someone asks 'does awaiting sit in your base?' the answer is already in the title. A rate without its denominator on the slide is not a number; it is a claim.",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "mufg-mcq-1",
      prompt: "A booked flow's status reads 'delivered'. In this kit's MUFG stage map, what happened?",
      choices: ["Settled to final — the flow completed and counts as kept", "In flight — stamped, not yet final", "Busted — cancelled before value date", "Awaiting confirmation — no value date yet"],
      answer: 0,
      why: "The stage map is fixed: delivered = settled to final (52 of 103 flows, 50.5%). It is the only status where the flow has completed its life.",
      notes: [
        { choice: 1, why: "In flight is 'shipped' — 30 flows stamped and moving but not final. Calling them settled inflates the kept rate before a single flow completes." },
        { choice: 3, why: "Awaiting confirmation is 'pending' — 14 flows with no value-date stamp yet. Pending is not busted and not kept; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "mufg-mcq-2",
      prompt: "The T+2 clock averages 2.98 days. Over which population? The book holds 82 stamped flows, 14 awaiting and 7 busted of 103 booked.",
      choices: ["Stamped flows only (82 rows) — unstamped have no lag", "All booked flows (103) with NULLs counted as zero days", "Settled-to-final flows only (52 rows)", "Distinct counterparties (16 rows)"],
      answer: 0,
      why: "Only the 82 flows carrying shipped_at have a booked-to-settled lag. AVG ignores NULLs, so the unrestricted average coincidentally matches — but the population must be stated: 82 of 103, awaiting and busted excluded by definition.",
      notes: [
        { choice: 1, why: "NULLs are not zeros. Counting them as 0 days would drag the average down (2.98 × 82/103 ≈ 2.37), not preserve it — and the unrestricted AVG matching 2.98 is exactly the silent-shrink trap." },
        { choice: 2, why: "52/82 mixes two funnel steps — delivered is final settlement, shipped_at is the value-date stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "mufg-mcq-3",
      prompt: "The home corridor carries 37 flows from 5 counterparties. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts flow rows (37); COUNT(DISTINCT customer_id) folds repeats back to counterparties (5). The gap between them is the corridor's intensity read — load versus coverage.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 37 again, since every flow has a counterparty. Without DISTINCT both columns read 37 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts corridors, not counterparties — a third grain nobody asked for. The census is flows AND mandates." },
      ],
      difficulty: "easy",
    },
    {
      id: "mufg-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) per corridor — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to busted flows only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the busted share truncates toward 0 and every corridor reads flat. The 100.0 multiplier forces real division first; on this book it is the difference between the home corridor's 8.1% and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the bust map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-5",
      prompt: "The corridor pack prints only corridors carrying at least 10 booked flows. What does the floor do on this book?",
      choices: ["Keeps all four corridors", "Keeps Europe (45), the home corridor (37) and the Americas (19); drops the São Paulo pilot line (2)", "Keeps only Europe (45)", "Errors — COUNT(*) cannot live in HAVING"],
      answer: 1,
      why: "A flow-count floor is a group-level fact: HAVING COUNT(*) >= 10 after GROUP BY judges folded corridors. Europe, the home corridor and the Americas clear it; the pilot line's 2 bookings drop off the pack by definition.",
      notes: [
        { choice: 0, why: "The pilot line books 2 flows — a floor of 10 drops it. Printing sub-scale corridors beside the majors misreads a pilot as a franchise." },
        { choice: 3, why: "COUNT works fine in HAVING — it is WHERE that cannot see aggregates. The engine rejecting WHERE COUNT(*) is the pipeline-order lesson itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-6",
      prompt: "The client ladder runs 24, 17, 14, 13, 5 flows, then FOUR counterparties tied at 4. Under RANK, what rank do the two 3-flow counterparties carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-flow counterparties share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The pack's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-7",
      prompt: "The cross-border wire rail settles 11 legs totalling 32,248 yen. The column is INTEGER yen-cents. Which read prints the figure the pack quotes?",
      choices: ["SUM(amount_cents) — cents are already yen if you label the column right", "ROUND(SUM(amount_cents) / 100.0, 2)", "SUM(amount_cents) * 100.0", "CAST(SUM(amount_cents) AS TEXT)"],
      answer: 1,
      why: "The money rule is absolute on this book: statements, legs, opex and the ledger carry INTEGER yen-cents, so the yen read is amount_cents / 100.0 — the wire rail's 32,248 only prints correctly through the divisor.",
      notes: [
        { choice: 0, why: "Summing cents and relabeling the column prints 3,224,800 as 'yen' — a hundredfold error dressed as a unit convention. The eye never catches it." },
        { choice: 2, why: "Multiplying by 100 goes the wrong way — the rail reads 3,224,800.00. The divisor and the direction both matter." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-8",
      prompt: "A fail watchlist uses invoice_id NOT IN (SELECT invoice_id FROM settlement_legs WHERE value_date <= today) and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole watchlist silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the watchlist empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded. A false all-clear on a fail watchlist is a control failure, not a bug.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core book the AR anti-join legitimately returns 6. But staging books are exactly where NULLs sneak in, and empty watchlists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "mufg-mcq-9",
      prompt: "A regulatory packet stacks settled flows under in-flight flows per corridor, built with UNION. A reviewer says one corridor's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same corridor, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same corridor, same counts, no branch label — collapse into one, and the packet loses a corridor with no error anywhere. The discipline: UNION ALL plus a branch-label column and a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "mufg-mcq-10",
      prompt: "A dashboard walks settled value flow by flow: SUM(total) OVER (ORDER BY shipped_at). Two flows share a value date, and the cumulative 'jumps two flows at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict flow-by-flow walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on shipped_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly flow by flow. On a month spine ties are rare; at value-date grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "mufg-mcq-11",
      prompt: "The desk asks for the top 5 fee statements by billed amount. A teammate writes SELECT number, amount_cents FROM invoices LIMIT 5 and gets five plausible rows. What is wrong?",
      choices: ["Nothing — LIMIT 5 always returns the five largest", "Nothing — invoice ids are already in billed order", "LIMIT without ORDER BY returns an arbitrary five rows — insertion-order luck, not a leaderboard", "LIMIT must be written FETCH FIRST 5 ROWS ONLY or it silently returns all 28"],
      answer: 2,
      why: "LIMIT caps the row count; without ORDER BY the engine is free to return ANY five rows — on this feed, whatever order the table happens to scan. The five billed leaders (4,937 down to 3,562) only surface through ORDER BY amount_cents DESC before the LIMIT.",
      notes: [
        { choice: 0, why: "The rows looked plausible because small tables often scan in id order — but the id order here (INV-2025-024 is id 24, not 1) proves the leaderboard is luck. The query must declare its ordering to own its answer." },
        { choice: 3, why: "FETCH FIRST is the SQL-standard spelling of the same clause — a portability note, not a correctness fix. The missing ORDER BY is the bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "mufg-mcq-12",
      prompt: "A teammate buckets the flow spine with SUBSTR(created_at, 6, 2) AS month and reports January 2024 and January 2025 as one bucket. Which expression is the honest spine key?",
      choices: ["SUBSTR(created_at, 1, 7)", "SUBSTR(created_at, 6, 2)", "STRFTIME('%m', created_at)", "CAST(created_at AS INTEGER)"],
      answer: 0,
      why: "SUBSTR(created_at, 1, 7) keeps year plus zero-padded month — '%Y-%m' — giving the 14 distinct buckets from 2024-01 to 2025-02. Any '%m'-style key merges the two Januaries into one 14-flow lie and the regulatory pack mis-files.",
      notes: [
        { choice: 1, why: "Positions 6-2 is the month alone — same collision as '%m'. The book spans two calendar years, so yearless keys are wrong by construction, not by edge case." },
        { choice: 3, why: "Casting a '2024-01-15 …' text stamp to integer yields 2024 (or garbage, depending on the stamp) — one bucket per year at best. The spine needs the year-month text key." },
      ],
      difficulty: "easy",
    },
    {
      id: "mufg-mcq-13",
      prompt: "The book holds 103 flows and 251 instrument legs. A report joins order_items to orders and prints COUNT(*) AS flows_per_corridor. What does the column actually count?",
      choices: ["Flows — the join preserves one row per flow", "Legs — 251 rows at line grain, wearing a flow's name", "Counterparties — the join folds to 16", "Corridors — the join folds to 4"],
      answer: 1,
      why: "The join's grain is line records: every flow with multiple legs contributes multiple rows, so COUNT(*) reads 251 across the book. Flows require COUNT(DISTINCT o.id) or a fold before the join — 'one row per what?' is the question that column never answered.",
      notes: [
        { choice: 0, why: "The join multiplies; it never preserves. Any flow with two legs appears twice, and the corridor census grows legs where the desk expects flows — 251 versus 103, a 2.4x fiction." },
        { choice: 2, why: "COUNT(*) never folds to counterparties — that is COUNT(DISTINCT customer_id)'s job, and even then the report must say 'mandates', not 'flows'." },
      ],
      difficulty: "easy",
    },
    {
      id: "mufg-mcq-14",
      prompt: "The confirmations pod wants each split settlement's two legs on one row — invoice number plus a comma-separated list of its leg dates. Which fold prints that roster?",
      choices: ["GROUP_CONCAT(p.paid_on) after GROUP BY the invoice", "CONCAT(p.paid_on) after joining payments", "SUM(p.paid_on) grouped by invoice", "LISTAGG is the only function that folds to strings"],
      answer: 0,
      why: "GROUP_CONCAT is SQLite's fold-to-string: GROUP BY i.id, SELECT GROUP_CONCAT(p.paid_on) prints '2024-03-14,2024-03-21' for a split settlement. It exists exactly because stakeholders read one row per entity, not one row per leg.",
      notes: [
        { choice: 1, why: "CONCAT joins two given values, not a group — over a join it concatenates row by row and the roster never folds. The group is the missing piece." },
        { choice: 3, why: "LISTAGG is the ANSI name; SQLite's native fold is GROUP_CONCAT — and the engine here runs GROUP_CONCAT. Vocabulary check, not a different answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-15",
      prompt: "Collections wants the corridors that have open statements but NO settled-exact statements this quarter — a set difference between two corridor lists. Which operator reads most honestly?",
      choices: ["INNER JOIN on corridor name", "EXCEPT between the two SELECT DISTINCT corridor queries", "UNION ALL of both lists", "CROSS JOIN of corridors to statements"],
      answer: 1,
      why: "EXCEPT answers 'in the first set, not the second' — SELECT DISTINCT corridor FROM open-statements-side EXCEPT SELECT DISTINCT corridor FROM settled-side — with the intent readable straight off the page. A join re-derives the diff with NULL gymnastics; UNION ALL stacks instead of subtracting.",
      notes: [
        { choice: 0, why: "An INNER JOIN answers co-occurrence, not absence — corridors in set one with no match in set two vanish, which is the opposite of the question." },
        { choice: 2, why: "UNION ALL concatenates and keeps everything — the answer would list every corridor twice over, a pile where a subtraction was asked for." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-16",
      prompt: "The settlement clock must time each statement from issue to its FIRST settlement leg. Which fold enters a split settlement into the clock correctly?",
      choices: ["MIN(paid_on) per invoice in a CTE, then julianday(first leg) - julianday(issued_on)", "julianday(paid_on) - julianday(issued_on) on the joined rows", "MAX(paid_on) per invoice — the day the position fully cleared", "julianday(due_on) - julianday(issued_on) — the contractual window"],
      answer: 0,
      why: "The CTE folds legs to one row per statement with MIN(paid_on) — the day money started arriving — and the clock computes from there. Over the 20 paid statements with legs that reads 28.4 days average, 13 fastest, 84 slowest, against the flat 30-day tenor.",
      notes: [
        { choice: 1, why: "Unfolded, the five split statements are clocked twice — once per leg — and the average doubles-counts the fastest legs. The fold is not optional." },
        { choice: 3, why: "The tenor window is a constant 30 on this book by contract — it times nothing. The clock measures behavior against that window, not the window itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-17",
      prompt: "A review flags 'flows above their corridor's average ticket'. A teammate writes WHERE total > (SELECT AVG(total) FROM orders) — what does the engine compare against?",
      choices: ["Each flow's own corridor average", "The whole-book average, 338.19 — one number for every corridor", "The corridor's median", "Nothing — scalar subqueries cannot contain aggregates"],
      answer: 1,
      why: "An uncorrelated scalar subquery folds once over the whole table — every row is compared to 338.19. The business question was per-corridor: the Americas runs 383.48, the home corridor 313.66, so one global bar mis-flags both. The fix is correlation, a PARTITION BY window, or a corridor-folded CTE join.",
      notes: [
        { choice: 0, why: "Correlation requires referencing the outer row inside the subquery — without it the fold is global. The corridor definition must appear in the subquery's WHERE or the window's PARTITION BY." },
        { choice: 3, why: "Aggregates in scalar subqueries are fine — that is exactly how the 338.19 baseline is computed. The bug is scope, not legality." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-18",
      prompt: "The coverage pod wants the 16 counterparties cut into four exposure tiles of four, busiest book first. Which window call does that?",
      choices: ["NTILE(4) OVER (ORDER BY COUNT(*) DESC)", "RANK() OVER (ORDER BY COUNT(*) DESC) mod 4", "QUARTILE(COUNT(*), 4)", "PERCENT_RANK() OVER (ORDER BY COUNT(*)) / 4"],
      answer: 0,
      why: "NTILE(4) chops the ranked 16 into four tiles as evenly as row counts allow — four tiles of exactly 4 here — and the top tile is the A-list: the 24, 17, 14, 13 ladder. The window ORDER BY must name its tie-break or the four-way tie at 4 flows shuffles between tiles run to run.",
      notes: [
        { choice: 1, why: "RANK returns 1, 2, 3, 4, 5, 6, 6, 6, 6, 10, 10… — taking it mod 4 is numerology, not bucketing, and the gaps make tile sizes drift." },
        { choice: 2, why: "QUARTILE is a spreadsheet function, not SQLite window grammar. The tile call is NTILE and it takes the tile count as its argument." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-19",
      prompt: "Coverage wants each counterparty's most recent booking, and two flows for one counterparty share the latest created_at. What makes the pick defensible?",
      choices: ["MAX(created_at) joined back — ties resolve themselves", "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) kept at rn = 1", "LIMIT 1 grouped per counterparty", "Any row — the tie means the choice does not matter"],
      answer: 1,
      why: "ROW_NUMBER with a named tie-break (created_at DESC, then id DESC) assigns distinct numbers even on tied stamps, so the same row wins every run — reproducible, auditable. MAX(created_at) joined back matches BOTH tied rows and doubles the counterparty's row silently.",
      notes: [
        { choice: 3, why: "The rows differ — different legs, different amounts — so the choice changes the report. An unnamed tie-break is a bias nobody can audit." },
        { choice: 2, why: "LIMIT 1 applies to the whole result set, not per group; without a window or a correlated fold, 'per counterparty' never materializes." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-20",
      prompt: "A staging feed loads '  mizuho k.k.' with padding and lowercase while the core book stores 'Mizuho K.K.'. What breaks first if you GROUP BY name across both?",
      choices: ["The query errors — mixed case cannot group", "One counterparty splits into two rows — the corridor census grows a phantom mandate and the concentration read loses it from the real one", "Both rows collapse into one automatically", "NULLs propagate through every aggregate"],
      answer: 1,
      why: "GROUP BY is byte-exact: padded and differently-cased strings are different keys, so one counterparty becomes two rows. The fix is normalize-once in a staged CTE — TRIM + UPPER — and key every later fold on the cleaned name.",
      notes: [
        { choice: 0, why: "Nothing errors: both are valid text. The failure is silent — which is exactly why name hygiene is an ingestion boundary job, not a report-time patch." },
        { choice: 2, why: "Grouping never folds near-matches. If it did, 'MIZUHO' and 'Mizuho' would merge — but so would genuinely different names, and the engine does not gamble." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-21",
      prompt: "The fail watchlist is rewritten as WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id). What does NOT EXISTS buy over NOT IN here?",
      choices: ["It runs faster on every dataset, guaranteed", "It is NULL-safe — a NULL invoice_id in the legs table can never silently empty the watchlist", "It returns the first matching leg instead of all of them", "It avoids the need for the join key correlation"],
      answer: 1,
      why: "NOT EXISTS is an existence probe: it short-circuits on the first match and its three-valued logic can never turn a NULL into 'no match anywhere'. NOT IN materializes the list and goes UNKNOWN for every row once a NULL enters — the watchlist empties while looking valid. The 6/15,217 result must be provable, not lucky.",
      notes: [
        { choice: 0, why: "Plans vary; NOT IN can be faster on tiny literal lists. The reason for the policy is correctness under NULLs, not a speed guarantee." },
        { choice: 2, why: "Both forms filter the outer rows; neither changes how many legs match. EXISTS just stops probing after the first — a plan detail, not the semantics being bought." },
      ],
      difficulty: "medium",
    },
    {
      id: "mufg-mcq-22",
      prompt: "A 3-month moving average over the value-date axis 'smears': two flows sharing one value date enter the window together, and a month with no bookings drags the average across a phantom gap. Which pair of fixes is correct?",
      choices: ["Sort in the application layer and widen the frame", "ROWS BETWEEN for a strict row-by-row walk, plus zero-fill the calendar spine before windowing", "RANGE BETWEEN 3 PRECEDING AND CURRENT ROW, and drop empty months", "Replace AVG with SUM — sums cannot smear"],
      answer: 1,
      why: "Two distinct bugs, two distinct fixes. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW counts rows, so tied dates stop entering as a lump; the zero-filled spine (calendar CTE LEFT JOINed to the fold, COALESCE to 0) gives every month a row so the '3-month' window is calendar-true, not rows-true across a gap.",
      notes: [
        { choice: 2, why: "RANGE peers over VALUES (3 days back), which changes the metric to a daily-rate read — and dropping empty months is the smear's cause, not its cure." },
        { choice: 3, why: "SUM changes the metric; the frame semantics — and the missing-month hole — stay broken underneath either aggregate." },
      ],
      difficulty: "hard",
    },
    {
      id: "mufg-mcq-23",
      prompt: "A teammate adds WHERE mom_pct > 20 to the month-over-month walk and gets 'misuse of window function' (or an unknown column). Why, and what is the fix?",
      choices: ["Windows must be wrapped in COALESCE before filtering", "Window output does not exist at WHERE time — stage the walk in a CTE or subquery and filter in the outer query", "The alias needs AS mom_pct repeated in WHERE", "WHERE cannot compare computed columns — move the condition to HAVING"],
      answer: 1,
      why: "The logical pipeline runs WHERE before SELECT, so the window's output is not yet materialized where WHERE lives — the engine rejects it. The fix is staging: compute LAG and the pct inside a CTE, then SELECT … FROM staged WHERE mom_pct > 20 in the outer query.",
      notes: [
        { choice: 3, why: "HAVING filters groups after aggregation — but window functions still evaluate after HAVING. The clause swap errors differently, not correctly." },
        { choice: 0, why: "COALESCE changes NULLs, not evaluation order. The window is evaluated in the SELECT stage regardless of what wraps it." },
      ],
      difficulty: "hard",
    },
    {
      id: "mufg-mcq-24",
      prompt: "The desk quotes 'average ticket per corridor' by averaging each corridor's mean — home 313.66, Americas 383.48, and so on across the four. The true book average is 338.19. Why do the two disagree?",
      choices: ["They never disagree — both are the same fold", "Rounding error compounded across four corridors", "Averaging averages weights every corridor equally regardless of size — the 2-flow pilot line counts as much as Europe's 45 flows", "The true average must also be computed per corridor"],
      answer: 2,
      why: "The average-of-averages re-weights the book: Europe's 45 flows and the pilot line's 2 get equal say in the corridor-mean-of-means, while the true 338.19 weighs every flow once. With corridors this unbalanced (45/37/19/2), the gap is material — quote the flow-weighted fold, or label the equal-weighted one as exactly that.",
      notes: [
        { choice: 1, why: "Rounding moves cents; the weighting moves the number. Even at full precision the two folds differ whenever corridor sizes differ." },
        { choice: 0, why: "They disagree by construction — one is SUM(total)/COUNT(*) over rows, the other is AVG(per-group means) over groups. Same word 'average', different denominators." },
      ],
      difficulty: "hard",
    },
    {
      id: "mufg-mcq-25",
      prompt: "The spine query runs WHERE SUBSTR(created_at, 1, 7) = '2024-07' on an indexed created_at and the plan shows a full SCAN. What is the sargable rewrite, and what does EXPLAIN QUERY PLAN show after it?",
      choices: ["WHERE created_at LIKE '2024-07%' — SEARCH using the index", "WHERE created_at >= '2024-07-01' AND created_at < '2024-08-01' — SEARCH using the index, with July 31's late bookings intact", "WHERE YEAR(created_at) = 2024 AND MONTH(created_at) = 7 — SEARCH using the index", "Add ORDER BY created_at to force index usage — SEARCH"],
      answer: 1,
      why: "Wrapping the column in a function defeats the index's ordering; the half-open range keeps the column bare so the index can seek. It is also the only form here that keeps the last night's bookings — BETWEEN '2024-07-01' AND '2024-07-31' drops everything booked on the 31st after midnight, and month-end is when desks push flow.",
      notes: [
        { choice: 0, why: "LIKE with a prefix can use the index, but text stamps like '2024-07-15 09:30:00' — the prefix matches, fine — while a timestamp-typed column compares messily. The range predicate is the honest, type-safe shape." },
        { choice: 3, why: "ORDER BY influences scan strategy, not predicate sargability — and the WHERE function-wrap still forces per-row computation before any sort." },
      ],
      difficulty: "hard",
    },
    {
      id: "mufg-mcq-26",
      prompt: "The fate census must run on a certified engine vintage that predates FILTER (WHERE …). Which is the portable twin for COUNT(*) FILTER (WHERE status = 'shipped')?",
      choices: ["COUNT(status = 'shipped')", "SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END)", "COUNT(*) WHERE status = 'shipped'", "SUM(IF(status = 'shipped', 1))"],
      answer: 1,
      why: "SUM(CASE WHEN … THEN 1 ELSE 0 END) is the universal one-pass census arm — the ELSE 0 keeps every row counted so the four arms reconcile to 103 by construction. It predates and outlives every engine vintage a control function certifies.",
      notes: [
        { choice: 0, why: "COUNT(expr) counts non-NULL results of the expression — a boolean true/false, so it counts every row including the false ones. The census reads 103 in every column." },
        { choice: 2, why: "WHERE is a clause, not an aggregate argument — the syntax fails to parse. The one-pass idea needs conditional aggregation, not a second pass." },
      ],
      difficulty: "hard",
    },
    {
      id: "mufg-mcq-27",
      prompt: "The concentration memo wants each counterparty's share of booked value AND the running share of the top 5. Which pair of windows builds it in one pass?",
      choices: ["Share: total / SUM(total) OVER (); running: SUM(total) OVER (ORDER BY total DESC) / SUM(total) OVER ()", "Share: total / MAX(total) OVER (); running: total - LAG(total) OVER ()", "Share: PERCENT_RANK() OVER (ORDER BY total); running: NTILE(5) OVER (ORDER BY total DESC)", "Both come from GROUP BY — windows cannot produce shares"],
      answer: 0,
      why: "The empty OVER () sums the whole book (34,833.28) beside every row, so share divides the row by the book; ordering the running sum by total DESC accumulates from the largest counterparty down, giving the top-5 cumulative share — 63.5% lives above the 3,000 line. One scan, two windows, no self-join.",
      notes: [
        { choice: 1, why: "MAX is a ceiling, not a base — shares would read against the single largest flow. And LAG produces deltas, not accumulations." },
        { choice: 2, why: "PERCENT_RANK returns 0-to-1 relative standing (rank-based), not value share; NTILE returns bucket numbers. Neither divides value by value." },
      ],
      difficulty: "hard",
    },
    {
      id: "mufg-mcq-28",
      prompt: "The corridor dimension lists five corridors; the flow book currently touches four. What does the pack print for the fifth if built from a dimension LEFT JOIN into the flow fold with COALESCE?",
      choices: ["The corridor row is missing — LEFT JOIN cannot fabricate rows", "The corridor row prints with zero flows and zero booked value — 'exists, did nothing', the honest read", "The corridor row prints with NULL flows — indistinguishable from a data hole", "An error — aggregates over no rows are undefined"],
      answer: 1,
      why: "LEFT JOIN from the dimension keeps every corridor row; the unmatched one carries a NULL payload that COUNT(*) folds to 0 and COALESCE(SUM(total), 0) renders as 0.00. Zero is the claim 'we looked and nothing booked' — a missing row would claim the corridor does not exist.",
      notes: [
        { choice: 2, why: "COALESCE is doing definitional work here — leaving NULLs would print a hole the pack's readers would spend a meeting on. Render the zero, state it in the footnote." },
        { choice: 3, why: "Aggregates over zero rows return 0 or NULL legally (COUNT 0, SUM NULL — hence the COALESCE). Nothing errors; the discipline is in the rendering." },
      ],
      difficulty: "easy",
    },
    {
      id: "mufg-mcq-29",
      prompt: "Dunning wants statements where SOME money has landed but the position is short. Where does the 'some money' test live in the coverage query?",
      choices: ["WHERE SUM(p.amount_cents) > 0 next to the other WHERE conditions", "In HAVING after GROUP BY i.id — the folded paid total only exists once legs are grouped", "In the SELECT as a flag column only", "In a subquery per row — HAVING cannot compare sums"],
      answer: 1,
      why: "Paid-to-date is a per-statement fold: after invoices LEFT JOIN payments GROUP BY i.id, the partial test — SUM(p.amount_cents) > 0 AND < amount_cents — judges a group, so it lives in HAVING. That fold is what isolates the book's one partial statement (#25: 4,000 of 6,148).",
      notes: [
        { choice: 0, why: "SUM in WHERE errors — aggregates do not exist before grouping. The clause order FROM → WHERE → GROUP BY → HAVING is the grammar doing the work." },
        { choice: 2, why: "A SELECT flag prints the information but does not filter — dunning still gets every statement. Flags report; HAVING selects." },
      ],
      difficulty: "easy",
    },
    {
      id: "mufg-mcq-30",
      prompt: "The month-over-month walk's first row prints NULL for prev_burn. What does the pack do with it?",
      choices: ["COALESCE to 0 so the column is numeric end to end", "Leave it NULL and label it 'baseline' — 2024-01's 3,731.97 has no prior month, and a fabricated zero would print a -3,731.97 crash", "Drop the first row so no NULL ships", "Replace it with the 14-month average"],
      answer: 1,
      why: "The first month's NULL is structural — there IS no prior month, and NULL is the honest encoding of 'no baseline'. Coalescing it to zero invents a step from zero down to January that no corridor experienced; dropping the row silently shrinks the spine to 13 months and the pack stops reconciling to the calendar.",
      notes: [
        { choice: 0, why: "Zero means 'the prior month burned nothing' — a factual claim about a month that did not exist in the window. Structural NULLs are not display problems." },
        { choice: 2, why: "Dropping the row hides the opening level entirely — the walk loses its start line. The baseline row is the anchor every later percentage leans on." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-mufg-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The corridor fate matrix",
      brief:
        "The corridor pack opens every Tokyo morning with the fate matrix: for each corridor carrying at least ten bookings — sub-scale pilot lines drop off the pack — it prints settled, in-flight, awaiting-confirmation and busted counts side by side. Probed facts: the book runs 103 flows; Europe carries 45 bookings (24 settled, 12 in flight, 6 awaiting, 3 busted), the Japan/Asia home corridor 37 (21, 8, 5, 3), the Americas 19 (5, 10, 3, 1) — where in-flight outnumbers settled, 10 against 5 — and the São Paulo pilot line's 2 bookings sit below the ten-booking floor. Busted share reads home 8.1%, Europe 6.7%, Americas 5.3%.",
      ask: "Return each corridor on the pack with its settled, in-flight, awaiting and busted counts and total bookings, busiest corridor first.",
      template:
        "SELECT c.region AS corridor,\n       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS settled,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS busted,\n       COUNT(*) AS booked\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nORDER BY booked {4};",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the busted literal",
          why: "Busted flows are status 'cancelled' — 7 on the book, 3 each in Europe and the home corridor. 'shipped' would double-book the in-flight column (the Americas would read 10 and 10) and the pack would chase a bust that never happened.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the corridor key",
          why: "Corridors live on the counterparty, so the fold keys on c.region after the join. Grouping on o.region errors — flows carry no region of their own — and c.city would print 16 one-counterparty rows, a city register wearing the pack's name.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the ten-booking floor",
          why: "The pack prints corridors with at least ten bookings: Europe 45, home 37, Americas 19 clear it and the São Paulo pilot line (2 bookings) drops off. A floor of 2 would reprint the pilot row; 100 would blank the pack — the floor is a pack definition, not decoration.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "busiest-corridor-first direction",
          why: "The pack reads Europe 45, home 37, Americas 19 — biggest book on top. ASC would open the morning on the Americas' 19 and bury the two corridors that carry 82 of the 103 bookings.",
        },
      ],
      distractors: ["'shipped'", "o.region", "c.city", "ASC", "100"],
      walkthrough:
        "One join, one fold, five numbers per corridor. The join attaches every flow to its counterparty's corridor, GROUP BY c.region folds 103 bookings into corridor rows, and the four SUM(CASE) arms count fates in one pass — Europe 24 settled / 12 in flight / 6 awaiting / 3 busted on 45 bookings, the home corridor 21 / 8 / 5 / 3 on 37, the Americas 5 / 10 / 3 / 1 on 19. The Americas row is the one the desk head reads twice: in-flight outnumbers settled, 10 against 5, so more than half the corridor is still moving toward value date. The HAVING floor prints only corridors carrying at least ten bookings — São Paulo's 2-book pilot line drops off the pack, by definition and not by oversight. The distractors fail honestly: 'shipped' in the busted arm double-books the in-flight column and invents a bust that never happened; grouping on o.region errors because flows carry no region; c.city explodes the fold into a 16-row city register; ASC flips the read to smallest-first; and a floor of 100 blanks the pack entirely. The census reconciles by construction: 24+12+6+3 = 45 on Europe, and every corridor's arms sum to its booked count.",
    },
    {
      id: "cs-mufg-2",
      tier: "medium",
      topic: "q6",
      universe: "month-close",
      title: "The payment-terms clock",
      brief:
        "Credit ops closes the month by timing the fee book: how long the paid statements actually take to settle against the flat 30-day documentary tenor every statement is issued on. Probed facts: 28 statements on the book — 21 paid-status worth 66,443, 6 open worth 19,609, 1 void worth 925 — but only 20 of the paid carry a settlement leg to time (#28 claims paid with zero legs). First settlement leg per statement, issue-to-paid: average 28.4 days, fastest 13, slowest 84. The tenor itself must read 30 — avg, min and max all 30 — or the billing feed has changed under the control.",
      ask: "Return the paid statements with a settlement leg: the count, the average days from issue to first settlement, the fastest and slowest leg, and the average tenor — one row.",
      template:
        "WITH first_leg AS (\n  SELECT invoice_id,\n         MIN(paid_on) AS first_paid\n  FROM payments\n  GROUP BY invoice_id\n)\nSELECT COUNT(*) AS settled_statements,\n       ROUND(AVG(julianday(f.first_paid) - julianday(i.issued_on)), {1}) AS avg_days_to_pay,\n       MIN(julianday(f.first_paid) - julianday(i.issued_on)) AS fastest_leg,\n       MAX(julianday(f.first_paid) - julianday(i.issued_on)) AS slowest_leg,\n       ROUND(AVG(julianday(i.due_on) - julianday(i.issued_on)), 1) AS avg_tenor_days\nFROM invoices i\nJOIN first_leg f ON f.invoice_id = {2}\nWHERE i.status = {3}\n  AND (julianday(i.due_on) - julianday(i.issued_on)) = {4};",
      slots: [
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the clock precision",
          why: "The clock prints at one decimal — 28.4 is the number credit ops quotes against the 30-day tenor. Zero decimals would round the story to 28 and flatten the honesty margin; the tenth of a day is what makes 28.4 versus 30 an on-terms read rather than a shrug.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the leg-to-statement key",
          why: "Settlement legs carry invoice_id; statements carry id, so the join keys f.invoice_id = i.id. Dropping the i. prefix breaks the join and any other keying cross-wires statements to foreign legs — the clock would read a fictional book.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the status literal",
          why: "The clock times the paid book — 'open' would time the one partially-settled statement (#25) and print a 1-row clock, and 'void' would time #11's stray leg. The status literal is doing the definitional work.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the tenor pin",
          why: "Every statement carries the flat 30-day documentary tenor — avg, min and max all 30 across the 28 — so the control pins it: any other value means the billing feed changed, not the credit. The pin turns tenor drift into an incident instead of a silent re-basing.",
        },
      ],
      distractors: ["MAX", "SUM", "'open'", "COUNT", "60"],
      walkthrough:
        "Stage one folds the legs: the CTE takes MIN(paid_on) per statement, so split settlements enter the clock at their first leg — 22 statements carry legs, and the paid-status filter keeps exactly 20 of them, which is where #28 dies: it claims paid but has no leg to time, so the inner join drops it before the fold. Stage two reads the clock off those 20: COUNT(*) prints 20 settled statements, ROUND(AVG(first leg minus issued_on), 1) prints the 28.4-day average, MIN and MAX print the 13-to-84 band, and the tenor column pins the documentary window at 30 — avg, min and max all 30. The distractors fail honestly: MAX in the CTE times the LAST leg of split settlements and stretches the average; SUM folds paid-on dates into a nonsense number; 'open' times the one partial statement and prints a 1-row clock; COUNT as the join key or the status literal errors outright; and a 60-day tenor pin means the feed changed, so the control returns nothing — a silent re-basing caught, not shipped. The gap the committee reads: 28.4 against a 30-day tenor is on-terms, but the 84-day slowest leg is 2.8× terms — one relationship, one conversation.",
    },
    {
      id: "cs-mufg-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The exposure ladder",
      brief:
        "The coverage pack's ladder is published on RANK semantics — shared rungs, gaps included — and the pack keeps every counterparty carrying at least three booked flows so the tie policy stays visible. Probed facts: the 16-counterparty book folds to a ladder of 24, 17, 14, 13, 5 flows (Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5), then FOUR counterparties tied at 4 (Rossi, Sato, Meyer, Alvarez), then TWO tied at 3 (Farid Nasser, Hiro Tanaka). RANK shares the tie at rung 6 (6, 6, 6, 6) and skips to 10 for the two 3-flow counterparties — four phantom rungs the policy publishes anyway; DENSE_RANK would read 7, 7. The 3-floor keeps 11 of 16 counterparties.",
      ask: "Return each counterparty with at least 3 booked flows: name, flow count, and the pack's ladder rank under RANK semantics — busiest first, ties sharing a rung.",
      template:
        "SELECT c.name AS counterparty,\n       COUNT(*) AS flows,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS ladder_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= {3}\nORDER BY ladder_rank, counterparty;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the pack's published rank function",
          why: "The pack's policy is RANK: shared rungs with gaps — the four-way tie at 4 reads 6, 6, 6, 6 and the two 3-flow counterparties land on rank 10, the four skipped rungs (7, 8, 9) published as phantom positions. DENSE_RANK would compress the ladder to 7, 7 — a different policy the coverage desk did not adopt.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "Rank 1 is the biggest book — Alice Chen's 24 flows — so the window ORDER BY runs descending. ASC would crown the two 3-flow counterparties rank 1 and hand Alice Chen rank 11: a correct query publishing an inverted coverage hierarchy.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the visibility floor",
          why: "HAVING COUNT(*) >= 3 keeps 11 counterparties — the 24/17/14/13/5 head, the four-way tie at 4, and the two 3s whose rank (10) only exists because of the tie above them. A floor of 4 amputates the 10-rung and the gap-as-policy reads as a bug instead of a choice.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A ladder is a policy, and this pack's policy is RANK. The join attaches every flow to its counterparty, GROUP BY c.id folds 103 bookings into 16 counterparty rows, and the window ranks the folded counts: RANK() OVER (ORDER BY COUNT(*) DESC) shares rungs among equals — Alice Chen 24 at rank 1, Emma Wilson 17 at 2, Grace Kim 14 at 3, Maya Patel 13 at 4, Chloe Dubois 5 at 5 — then the four-way tie at 4 all lands on rung 6, and the next distinct count (3) inherits rank 10, not 7: RANK skips the four consumed rungs, and the pack publishes those phantom positions because peer counterparties share a rung by design. HAVING COUNT(*) >= 3 keeps the tie and the two 3s visible; a floor of 4 would hide the rung the policy exists to explain. The distractors are the other two policies wearing a rank function's name: DENSE_RANK prints 7, 7 — gap-free tiering, a different memo; ROW_NUMBER splits the four-way tie arbitrarily, silently picking which coverage owner outranks whom; ASC inverts the ladder; and the floor of 4 amputates exactly the rows that make the gap visible.",
    },
    {
      id: "cs-mufg-4",
      tier: "medium",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass coverage census",
      brief:
        "Month-close brief, in-world: the control pack's second proof is the fee-book coverage census, and the rule is ONE scan — statements folded once against their settlement legs, every coverage class counted beside each other so no two queries can disagree. Probed on the storefront db: 28 statements fold to 21 settled exact (65,612 billed), 1 partial (#25, 4,000 of 6,148 settled) and 6 never-collected (15,217 — #28, the paid-status statement with zero legs, among them); billed total 86,977 yen. The fold runs LEFT JOIN + COALESCE so 'no legs' is a zero, not a vanishing row, and the three classes must sum to 28 by construction.",
      ask: "Return one row: statements, settled-exact, settled-partial, never-collected, and billed total to 2 decimals.",
      template:
        "WITH cov AS (\n  SELECT i.id, i.amount_cents,\n         {1}(SUM(p.amount_cents), 0) AS paid_cents\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT COUNT(*) AS statements,\n       {2} AS settled_exact,\n       {3} AS settled_partial,\n       {4} AS never_collected,\n       ROUND(SUM(amount_cents) / 100.0, {5}) AS billed_total\nFROM cov;",
      slots: [
        {
          answer: "COALESCE",
          kind: "keyword",
          label: "the no-legs guard",
          why: "The 6 never-collected statements contribute no legs, so SUM(p.amount_cents) returns NULL on their fold — COALESCE turns that into 0 so paid_cents = 0 is a testable fact. Without the guard the partial and none arms both miss: NULL comparisons are UNKNOWN, and the census undercounts the watchlist it exists to publish.",
        },
        {
          answer: "COUNT(*) FILTER (WHERE paid_cents = amount_cents)",
          kind: "keyword",
          label: "the exact arm",
          why: "Paid equals billed is the exact class — 21 statements, 65,612 billed. Swapping in another arm's filter prints that class into the exact column and the 21 + 1 + 6 = 28 identity breaks: the census stops being a proof and becomes three opinions.",
        },
        {
          answer: "COUNT(*) FILTER (WHERE paid_cents > 0 AND paid_cents < amount_cents)",
          kind: "keyword",
          label: "the partial arm",
          why: "The partial band is money-in-but-short — both bounds needed. Dropping the > 0 bound would let a 0-paid statement read partial (it is never-collected); dropping the < bound would let fully-paid statements double into the partial column. The one statement this catches is #25: 4,000 of 6,148.",
        },
        {
          answer: "COUNT(*) FILTER (WHERE paid_cents = 0)",
          kind: "keyword",
          label: "the never-collected arm",
          why: "Zero paid cents is the watchlist — 6 statements worth 15,217, including #28 which claims status 'paid' with zero legs. This arm is why the COALESCE guard exists: without it the zeros are NULLs, the comparison is UNKNOWN, and the watchlist silently empties.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the yen precision",
          why: "The billed total prints to 2 decimals — 86,977.00 — so the three classes (65,612 + 6,148 + 15,217) reconcile against it to the yen. INTEGER yen-cents divided by 100.0 without the stated precision drifts the print and the close's reconciliation stops footing.",
        },
      ],
      distractors: ["MAX", "FILTER (WHERE paid_cents >= 0)", "SUM(*) FILTER (WHERE paid_cents = amount_cents)", "COUNT(p.id)"],
      walkthrough:
        "Stage one folds legs to statements: the LEFT JOIN keeps all 28 invoices, the five split settlements (1, 5, 12, 19, 22) fold their two legs into one SUM, and COALESCE hands the six legless statements a paid_cents of 0 — the number their status column claims does not exist. Stage two counts classes in one pass: exact reads paid = billed (21 statements, 65,612), partial reads 0 < paid < billed (exactly one: #25 at 4,000 of 6,148), never-collected reads paid = 0 (6 statements, 15,217), and ROUND(SUM(amount_cents)/100.0, 2) prints the 86,977.00 billed book the three classes must reconcile to. The identity is the proof: 21 + 1 + 6 = 28, and the arms were computed in the same scan as the denominator, so no two queries can disagree. The distractors fail honestly: MAX in the guard slot turns the legless folds back into NULLs — the never-collected arm reads 0 and the watchlist silently empties, exactly the failure the COALESCE exists to prevent; the >= 0 filter is true for every folded row, so the arm it lands in reads 28 and the classes stop discriminating; SUM(*) is not SQL and the census errors; COUNT(p.id) references a column the CTE never carried and dies on the fold.",
    },
    {
      id: "cs-mufg-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The settlement-fail watchlist",
      brief:
        "Month-close brief, in-world: before collections sends a single reminder, credit ops refreshes the settlement-fail watchlist — every fee statement with NO settlement leg on the payments rail. Probed on the storefront db: 28 statements against 27 legs (five split settlements carry two legs each), and the anti-join returns 6 never-collected statements worth 15,217 yen — INV-2025-024 at 4,937.00, INV-2025-026 at 3,562.00, INV-2025-027 at 2,794.00, INV-2025-028 at 1,756.00 (status 'paid' with zero legs — the anomaly), INV-2024-021 at 1,295.00, INV-2024-018 at 873.00. The watchlist reads biggest exposure first.",
      ask: "Return each statement with no settlement leg: number, status, and billed yen to 2 decimals — biggest exposure first.",
      template:
        "SELECT i.number,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS billed\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {2}\nORDER BY billed {3};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements and hands the legless six a NULL payload — the payload the WHERE clause hunts. INNER JOIN would delete exactly those six rows before the filter ever sees them: the watchlist returns zero rows and collections ships a false all-clear.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the no-leg test",
          why: "p.id IS NULL is the anti-join's signature: the left row survived with no match. = NULL is never true in SQL (the comparison is UNKNOWN) and returns zero rows silently; IS NOT NULL flips the query to the 22 statements that DID settle — the opposite list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "Dunning works the biggest hole first — INV-2025-024's 4,937.00 on top. ASC would lead with the 873.00 tail and the reminder run would chase pocket change while the 4,937 sits at the bottom of the queue.",
        },
      ],
      distractors: ["INNER", "IS NOT NULL", "= NULL", "ASC"],
      walkthrough:
        "An anti-join is a LEFT JOIN with a NULL filter, and this one is the control function's daily reflex. The LEFT JOIN keeps all 28 statements; the 22 with legs carry their payment rows, the 6 without carry NULL payloads — including INV-2025-028, the statement that claims status 'paid' while carrying zero settlement rows, which is why legs are the ledger of record and status is a claim. WHERE p.id IS NULL keeps exactly the legless six, ORDER BY billed DESC stacks the dunning queue by exposure: 4,937.00, 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00 — 15,217.00 yen of never-collected receivables. The distractors are the two ways this query ships a lie: INNER JOIN deletes the six rows before the filter sees them (a zero-row watchlist that looks like a clean book), and IS NOT NULL inverts the filter into the settled list — collections would chase customers who already paid while the real delinquents rest. = NULL is the syntax trap (UNKNOWN everywhere, zero rows), and ASC turns the exposure stack into pocket change first. Five of the six legs are open status; one is paid — the watchlist is where that lie surfaces.",
    },
    {
      id: "cs-mufg-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month burn pulse",
      brief:
        "Growth-pack brief, in-world: the quarterly review walks the full 14-month flow spine — each month's booked value beside the prior month's, with the percentage change computed in the same pass. Probed on the storefront db: the spine opens at 3,731.97 (8 flows, 2024-01), runs 3,609.64 (9), 2,617.08 (8), 2,468.91 (7), 2,910.31 (8), 2,047.43 (6) — then the trough: 1,193.86 in 2024-07, -41.7% against June, and the +97.0% August rebound to 2,352.07. The walk closes at 2,390.53 in 2025-02 (+43.2% against January's 1,669.50). The first month's delta is honestly NULL — no baseline exists — and the fold carries flow counts beside value so count-tells and value-tells stay separable.",
      ask: "Return all 14 months with flow count, booked value, the prior month's value, and the month-over-month percentage change to 1 decimal.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS flows,\n         ROUND(SUM(total), 2) AS burn\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       flows,\n       burn,\n       {1}(burn) OVER (ORDER BY month) AS prev_burn,\n       ROUND(100.0 * (burn - LAG(burn) OVER (ORDER BY month))\n             / LAG(burn) OVER (ORDER BY month), 1) AS mom_pct\nFROM monthly\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(burn) walks the window backwards one row — July's prev_burn is June's 2,047.43. LEAD would read forward and hand June July's 1,193.86 as its 'prior' month, silently relabeling the future as history; SUM would pile a running total into the baseline column and every percentage would divide by a cumulative.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month-over-month read is chronological: ASC keeps 2024-01 on top so each row's baseline sits directly above it. DESC presents the newest month first with its baseline below — the numbers survive, the trough-to-rebound story (July 1,193.86, then +97.0% August) reads backwards.",
        },
        {
          answer: "14",
          kind: "number",
          noVerify: true,
          label: "the full-spine cut",
          why: "LIMIT 14 ships the whole spine — the narrative quotes the opening 3,731.97, the trough 1,193.86 AND the close 2,390.53, so no cut may amputate an end. A LIMIT 7 would keep the fade and lose the rebound; the walk is the story only at full length.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "7"],
      walkthrough:
        "Stage one folds the spine: SUBSTR(created_at, 1, 7) buckets 103 flows into 14 months — the '%Y-%m' key, because a '%m'-only key would merge the two Januaries — with COUNT(*) and ROUND(SUM(total), 2) carried side by side. Stage two walks it: LAG(burn) OVER (ORDER BY month) brings June's 2,047.43 into July's row, and the percentage divides the delta by that same LAG — the July trough prints 1,193.86 at -41.7%, August rebounds to 2,352.07 at +97.0%, and the spine closes 2,390.53 at +43.2%. The first row is NULL by design: 2024-01 has no prior month, and NULL is the baseline, not a zero to coalesce into a fabricated crash. The two-step structure matters — window output is not visible to WHERE or sibling SELECT expressions, so the CTE stages the grain and the outer query layers the walk. The distractors fail honestly: LEAD relabels the future as history (June would show 1,193.86 as its baseline); SUM turns the baseline into a running total and every percentage divides by a cumulative; DESC reads the story backwards; and LIMIT 7 ships a half-spine that ends exactly where the trough begins — the fade without the rebound, the one cut that changes what the review concludes.",
    },
  ],

  problems: [
    { slug: "settlement-fails-aging", why: "The fail ladder is settlement ops' morning artifact: unmatched flows bucketed by days-past-value-date. MUFG runs exactly this aging cut over the T+2 book every day — and the BOJ-era rate pivot makes every late leg a margin conversation." },
    { slug: "ar-aging-schedule", why: "The receivables aging schedule is the fee-book credit review: flat 30-day documentary tenor, then bucket everything past it. Same shape as the 0–30 / 31–60 / 61–90 wall credit ops ships at close." },
    { slug: "structuring-detection", why: "Ticket-splitting surveillance guards the rails: flows chopped under a reporting threshold. The HAVING-guard pattern is how the financial-crime desk screens booked flow before it settles — a core competency for a Japanese megabank under FSA scrutiny." },
    { slug: "expected-credit-loss", why: "Provisioning weights exposure by bucket — the coverage pod's ECL read multiplies statement value by stage weights before it hits the ledger. After the negative-rate exit, provisioning is where the rate story meets the credit story." },
    { slug: "daily-balance-interest", why: "Deposit books accrue on end-of-day balances across a date spine — the retail franchise's interest engine is exactly this daily-balance walk over a continuous calendar, and it is the machine the BOJ pivot just re-armed." },
    { slug: "balance-rollforward", why: "The close proves opening balance plus movements equals closing balance, account by account. The control function runs this rollforward over the 181,080 trial balance every month — delta zero or the close does not ship." },
    { slug: "journal-gap-detection", why: "A missing journal sequence number is an audit finding before it is a bug. Gap detection over entry keys is how the book of record stays provably complete for the regulators." },
    { slug: "duplicate-charge-pairs", why: "Two settlement legs for one statement is a double-pay and a clawback. Pairwise matching on amount and proximity is how payments ops finds them before the counterparty does." },
    { slug: "suspicious-bank-account-transactions", why: "A 7-day sliding window over one counterparty's activity is the transaction-monitoring primitive — burst detection over the flow spine before anything posts." },
    { slug: "transaction-velocity", why: "Velocity bursts flag rails abuse: legs per time bucket over the flow spine. The same fold powers the liquidity desk's intraday rail-watch." },
    { slug: "keep-latest-dedupe", why: "Feeds re-deliver booking rows after cutoff; the desk reads only the latest version. ROW_NUMBER dedupe on event key is the standard ingestion guard on a book that spans Tokyo, New York and London feeds." },
    { slug: "point-in-time-asof", why: "Counterparty records change (corridor moves, limit updates) and old reports must be reproducible — the as-of join pins every flow to the record version valid on its value date." },
    { slug: "snapshot-delta-detect", why: "Two corridor snapshots must reconcile — FULL OUTER JOIN with a delta column finds the positions that appeared, vanished or changed, the daily position-keeping break hunt." },
    { slug: "fx-exposure-report", why: "The FX desk values open exposure at the latest rate per pair — a latest-row join over the rate spine. For a yen-centered book, this is the corridor re-mark the ALM committee reads every morning." },
    { slug: "value-at-risk", why: "The trading book summarizes tail risk as a percentile of the P&L distribution. Percentile math over returns is exactly how the market-risk pack frames the desks' limits." },
    { slug: "risk-based-pricing", why: "The rate pivot reprices the lending book: band loans by risk tier and read the margin spread. Band-join pricing logic is how the desk turns the BOJ's normalization into a margin grid." },
    { slug: "delinquency-roll-rates", why: "Overdue balances migrate bucket to bucket, and the roll rates between them are the provisioning conversation at every close — credit ops' migration matrix in one fold." },
    { slug: "vintage-default-curves", why: "Default curves by booking vintage tell the desk whether this year's flow book is behaving like last year's — the cohort read behind every provisioning assumption review." },
    { slug: "prepayment-detection", why: "Legs landing before the flat 30-day documentary tenor are prepayments — early-settlement detection that re-times the receivables clock and the funding plan with it." },
    { slug: "credit-utilization-bands", why: "Counterparty limits banded by utilization sit beside the exposure ladder in every coverage review — the band fold is how headroom, not just exposure, gets read." },
    { slug: "account-balance", why: "End-of-day balances across a continuous date spine are the retail deposit book's accrual base — the balance walk the BOJ pivot just re-armed." },
    { slug: "chargeback-rate-ranking", why: "Reversal rates ranked by rail put the domestic card rail's clawback watch beside the cross-border wire rail — the same fold, two very different dispute regimes." },
    { slug: "loan-amortization-schedule", why: "Payment schedules that split interest from principal per period are the lending-book read the repricing screens assume you can build from scratch." },
    { slug: "deferred-revenue", why: "Fees billed ahead of service sit as deferred revenue — the liability walk that keeps the fee book honest between the invoice and the service date." },
    { slug: "npv-queries", why: "Structured legs get discounted to present value per product — the trust desk's NPV fold is exactly this cash-flow-series computation." },
    { slug: "sharpe-ratio", why: "Return over volatility per product line is the asset-management arm's shelf read — ratio SQL with a denominator that punishes sloppy folds." },
    { slug: "max-drawdown", why: "Peak-to-trough over the P&L spine is the market-risk pack's tail read beside VaR — a running-max window over the same walk you build for burn." },
    { slug: "portfolio-concentration-hhi", why: "A concentration index over the counterparty book is the one-number skew summary beside the 63.5% share — squared weights, one fold." },
    { slug: "portfolio-weights", why: "Each counterparty's weight of the book is the coverage assignment denominator — the share column every mandate review opens with." },
    { slug: "second-most-recent-activity", why: "The second-newest leg per counterparty builds recency ladders for coverage calls — argmax's quieter sibling, and the tie traps are identical." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Escalating amounts across consecutive flows is the structuring escalation pattern surveillance watches for — gaps-and-runs logic over the flow spine." },
    { slug: "amount-anomaly-zscore", why: "Z-scores over ticket sizes seed the fail watchlist with statistical outliers before any human reads a row — the surveillance desk's first screen." },
  ],
};
