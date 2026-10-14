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
    "Preparation strategy: the pools file carries no MUFG section — **0 tagged LC** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: corridor censuses, fail watches, T+2 clock math, CASE status ladders and the yen-cents ledger spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:corridor fate matrix} the corridor heads open the pack with, the other rebuilds the {sky:payment-terms clock} credit ops reads at every close. The bar to clear: *state the denominator, the corridor and the tenor before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["customers-who-never-order", "sales-person", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Exposure ladders",
      why: "Coverage reviews rank counterparties by flow count where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5, then FOUR counterparties tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer coverage, not syntax.",
      slugs: ["rank-scores", "top-earners", "find-the-team-size"],
    },
    {
      name: "The settlement clock",
      why: "Settlement lag is julianday(shipped_at) - julianday(created_at) over stamped flows: 2.98 days average inside a 2–4 band, 3.07 in the Americas against 2.93 on the home corridor. Duration math over two timestamps — with the unstamped 21 rows excluded by a stated filter, never silently skipped.",
      slugs: ["average-time-of-process-per-machine", "biggest-window-between-events", "second-day-confirmation"],
    },
    {
      name: "Regulatory month spines",
      why: "Regulatory and management reporting bucket the 14-month flow spine (2024-01 to 2025-02) by SUBSTR(created_at, 1, 7) — the trough month reads 1,193.86 against an opening 3,731.97. LAG and LEAD walk it; the wrong '%m' bucket merges Januaries two years apart and the pack mis-files.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "sales-analysis-iii"],
    },
    {
      name: "CASE ladders: status, fate, coverage",
      why: "Banking classifications are CASE ladders — settled versus in-flight versus busted, exact versus partial versus never-collected, 30-day tenor versus aging buckets. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the pack, and a reordered WHEN quietly re-buckets the book.",
      slugs: ["delinquency-buckets", "loan-types", "weather-type-in-each-country"],
    },
    {
      name: "Trust-partner bench folds",
      why: "Correspondent and trust partners are judged on their shelf: revenue folded through products to instrument legs, listings beside rating. The joins are three deep — partners to shelf to legs — and every fold has to say whether it counts listings, legs or flows.",
      slugs: ["students-and-examinations", "average-selling-price", "product-sales-analysis-iii"],
    },
    {
      name: "Books of record & yen-cents discipline",
      why: "Status is a claim; the settlement legs and the ledger are evidence. Statements and legs carry INTEGER yen-cents — the yen read is amount_cents / 100.0 — and the trial balance must land 181,080 against 181,080, delta zero. Reconciliation queries are how a megabank proves the close.",
      slugs: ["trial-balance-check", "gl-reconciliation", "monthly-transactions-ii"],
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
  ],
};
