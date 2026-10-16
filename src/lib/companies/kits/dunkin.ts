// Dunkin' — Wave-10 (Task 100), food domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// QSR coffee-chain SQL: the storefront db read as a franchise coffee sandbox — customers are
// loyalty-app guests (region = market buckets), orders are transactions (delivered = completed
// 52, shipped = in flight with shipped_at as the pickup-window stamp 30, pending = awaiting
// pickup 14, cancelled = voided 7), order_items are item line records, products = the 16-SKU
// menu matrix (beverages/food; stock = prep par / case count), suppliers = franchise & roasting
// partners, invoices = franchise settlement statements (finance tables INTEGER cents — the
// dollar read is amount_cents / 100.0; orders.total and order_items.unit_price are REAL dollars),
// payments = payment rails, expenses = store opex, ledger_entries = GL. Angle kept DISTINCT from
// starbucks (premium third-place): value daypart ladders, drive-thru pickup throughput, franchise
// royalty economics. Probed traps honored: created_at is DATE-only, so the AM-daypart split —
// Dunkin's signature stat — cannot be pulled from this table (saying so IS the interview answer);
// every guest has transacted (never-ordered = 0), so the honest anti-join lives in settlements
// (6 statements with no payment = 15,217.00, incl. paid-no-leg #28 at 1,756.00 and the
// 4,000-of-6,148 partial); the db clock is DAY-grain — the pickup window averages 2.98 on this
// db's days, the production drive-thru board reads the same shape in seconds (say the unit).
// Pool provenance: company-pools.md carries NO Dunkin section (0 tagged rows), so all 10 topic
// slug sets and all 16 problems are theme-curated from the pools file's SQL rows (theme menu)
// and say so. Case briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12)
// plus this kit's own readonly-copy probe (cs-dunkin-1 census cells 103/82/79.6/7/2.98;
// cs-dunkin-2 folio fold at the 55 hinge reproduces the canonical market-by-tier cells —
// EU 12,032.44/3,056.79, APAC 8,611.42/2,994.03, US 5,335.40/1,950.76, LATAM 626.25/226.19);
// every case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const dunkinKit: CompanyKit = {
  id: "dunkin",
  domainId: "food",
  name: "Dunkin'",
  tagline: "Value daypart ladders, drive-thru windows, franchise royalties",
  accent: "text-orange-300",

  brief: [
    "**Dunkin'** is the run-to quick-service coffee chain — value-priced beverages and bakery served through drive-thru windows at a pace no premium cafe attempts, monetized by volume and the **DD Perks** loyalty app rather than by the 9-dollar latte. Guests roll through in an **AM daypart** that carries most of the day, and every franchisee's P&L hangs on beverage attach and window throughput. On the training db that world reads: the 16 customers rows are loyalty-app guests (region = market buckets), the 103 orders are transactions worth **34,833.28** carrying 251 item lines, and the status map is fixed — delivered = {emerald:completed} (52, 50.5%), shipped = {sky:in flight} with `shipped_at` as the pickup-window stamp (30, 29.1%), pending = awaiting pickup (14), cancelled = {rose:voided} (7, 6.8%). The average ticket is **338.19** against a 25.47 sides-only run to a 1,088.44 catering haul — *a value chain still carries a spread*.",
    "The data org splits into three desks that read the same spine at different grains. Window ops owns the throughput board: the funnel census (52 completed / 30 in flight / 14 awaiting / 7 voided over **103**), and the pickup clock — `shipped_at` stamped on 82 of 103 transactions, averaging **2.98** on this db's day-grain clock with a 2–4 spread (*the production drive-thru board reads the same shape in seconds; state the unit*). Menu analytics owns the value ladder: the case bands into **budget** (8 SKUs averaging 32.06 — the value rung) against **mid** (8 averaging 111.50), with the premium rung empty because the ladder tops out at 199.99. Franchise finance owns settlements — INTEGER cents where the dollar read is `amount_cents / 100.0`, with **6 statements carrying no payment, worth 15,217.00**.",
    "Interview screens are census-then-denominator. A typical loop opens with the one-pass stage census — four counts that must reconcile to **103 by construction** — then escalates into a rate where the interviewer asks the denominator out loud (*'do voided transactions belong in your pickup share?'*), then into a **two-grain market census** (EU runs **45 transactions from 8 guests** while the US runs **19 from 2**) or the visit leaderboard, where a **four-way tie at 4 visits** makes rank semantics a business decision. The honest dead-end gets named too: `created_at` is date-only, so the {rose:AM-daypart split} — *the stat this chain is famous for* — cannot be pulled from this table. Candidates who say that out loud instead of forcing a query are the ones who get callbacks.",
    "Preparation strategy: the pools file carries **no Dunkin section** — 0 tagged rows — so all **sixteen problems** and every topic slug here are **theme-curated** to this kit's known screen shapes: stage censuses with stated denominators, pickup-stamp latency reads, two-grain market counts, value-ladder CASE banding and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:drive-thru window board} window ops opens every morning, the other rebuilds the {sky:value-ladder folio} menu analytics takes to the franchisee council. The bar to clear: *state the population and the denominator before you compute anything* — then make every stage census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:00 —** The window board refreshes before the shift huddle. You re-run the stage census yourself — {emerald:completed} 52, in flight 30, awaiting 14, {rose:voided} 7 — and check the identity: the four branches must sum to **103** or a status value drifted and the board lies. The pickup clock rides along: 82 of 103 stamped, **2.98** average on a 2–4 spread, and any drift toward the 4-day tail means the pickup queue is backing up onto the curb. The thin-case alert pings last: three SKUs sitting at **14, 15 and 17** units of cover — the substitution-risk list for the morning run writes itself from that one fold.",
    "**11:30 —** Deep work: the value ladder and the market census. Menu analytics wants the ladder re-cut — the **budget band** (8 SKUs averaging 32.06) beside the mid band (8 at 111.50), premium rung empty and worth saying so — because *a value chain defends its floor, not its ceiling*. The regional sheet wants transactions AND guests per market in one row: EU **45-from-8** beside the US's **19-from-2** — a market can add transactions while losing guests and only the pair of columns says which. Then the argmax asks: each guest's usual order, the most-pulled SKU per market — rank windows with a named tie-breaker, because *the usual that silently picks an arbitrary row erodes app trust*.",
    "**15:30 —** The stakeholder cycle closes on franchise money. The settlement sweep runs first — **6 statements with no payment, 15,217.00** — before a single reminder goes out, with #28 called out separately because {emerald:paid}-with-zero-payment-rows (1,756.00) is a label lying about money, and the partial at 4,000 of 6,148 feeds the dunning draft. Settled statements close in **28.4 days** against flat 30-day terms — fastest 13, slowest 84 — which is the franchisee council's negotiation lever. The day ends the way every close does: the ledger must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Pickup-window share", what: "Transactions with a `shipped_at` stamp ÷ all transactions placed: 82 of 103 (79.6%). The top-of-board number window ops reads every morning — the 14 awaiting-pickup rows are 'not yet', never a silent zero." },
    { name: "Drive-thru clock", what: "Placement to pickup window (`created_at` → `shipped_at`) over stamped transactions only: **2.98** average on a 2–4 spread. The training db stores DAYS; the production board reads the same shape in seconds — state the unit or misread the SLA." },
    { name: "Completed vs in flight", what: "Delivered 52 (50.5%) versus shipped 30 (29.1%) over 103 transactions. 'Completed' is a status-filtered conditional count, and the denominator — awaiting and voided included — is the whole interview." },
    { name: "Void share", what: "Voided share of placed transactions: 7 of 103 = **6.8%**, sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. Every point is product that was made and never sold — the void map feeds the prep call." },
    { name: "Value-ladder mix", what: "The menu bands into budget (8 SKUs averaging **32.06**) and mid (8 averaging 111.50); the premium rung is EMPTY — the ladder tops at 199.99. A value chain's mix story lives below the ceiling, and a CASE with holes quietly re-bands it." },
    { name: "Ticket economics", what: "**34,833.28** across 103 transactions = 338.19 average, from a 25.47 sides-only floor to a 1,088.44 catering haul. The scalar-subquery baseline every market and daypart read is judged against." },
    { name: "Two-grain market census", what: "Transactions AND guests per market: EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The gap between the columns is intensity — 5.6 per guest in EU versus 9.5 in the US — and it decides whether growth is broadening or concentrating." },
    { name: "Settlement exposure", what: "6 statements with no payment = **15,217.00**, including #28 marked {emerald:paid} with zero payment rows (1,756.00) and one partial (4,000 of 6,148). Settled statements close in 28.4 days against flat 30-day terms — the tail is the franchisee lever." },
  ],

  topics: [
    {
      name: "Stage census & the pickup stamp",
      why: "Every Dunkin' screen opens with the funnel: transactions placed, completed, in flight, awaiting pickup, voided. Each stage is a conditional count over a status or a stamp, and the interviewer's first question is what the denominator holds — calling the 30 in-flight transactions completed inflates the close rate before a single handoff happens.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Transactions and guests are different grains of the same join, and every census here reports both: EU runs 45 transactions from 8 guests while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers"],
    },
    {
      name: "Item lines — the fan-out join",
      why: "One transaction fans into item lines — 103 transactions into 251 lines — and every count changes grain the moment you join order_items. Dunkin' drills this first because beverage attach lives at the line grain: a coffee plus a bagel is two lines on one transaction, and COUNT(*) after the fan-out counts lines, not visits.",
      slugs: ["product-sales-analysis-ii", "combine-two-tables", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Value-ladder banding with CASE",
      why: "The menu bands into budget (8 SKUs averaging 32.06) and mid (8 at 111.50) with the premium rung empty — a hole in the CASE is a hole in the ladder, and a reordered WHEN quietly re-bands the prep sheet. Value-ladder economics only survive if the arms are exhaustive and ordered.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Argmax & the usual order",
      why: "The app merchandises per guest and prep sets pars per SKU — both are argmax problems. Each guest's usual order, the most-pulled menu item per market: RANK or ROW_NUMBER over a per-group fold, with a tie-breaker named, because 'the usual' that silently picks an arbitrary row erodes loyalty-app trust.",
      slugs: ["most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "product-sales-analysis-iv"],
    },
    {
      name: "Visit leaderboards & the rank trio",
      why: "Leaderboards rank guests by visits with guaranteed ties — the ladder runs 24, 17, 14, 13, 5 and then FOUR guests tie at 4 on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer guests, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Run streaks & month walks",
      why: "The loyalty app thinks in streaks — consecutive-day runs are the habit metric — and the ops review walks the 14-month transaction spine (2024-01 to 2025-02) with LAG deltas. Both are window moves over ordered timestamps, and the first row of any walk is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "active-users"],
    },
    {
      name: "Settlement cents & the anti-join reflex",
      why: "Completed is not settled — the franchise tables (28 invoices, 27 payments, INTEGER cents) are where the coffee world meets money, and every dollar read divides by 100.0 exactly once. The exposure read is an anti-join: 6 statements with no settlement = 15,217.00, one of them marked paid — a status filter misses it, an anti-join doesn't.",
      slugs: ["customers-who-never-order", "bank-account-summary-ii", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "One-pass censuses for the huddle board",
      why: "The window board ships as ONE scan: completed, in flight, awaiting, voided plus average ticket, four branches reconciling to COUNT(*) = 103. FILTER (WHERE …) and SUM(CASE …) build it in a single pass; four sequential queries are four chances to drift out of reconciliation before the 08:00 huddle.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "NULLs & the honest dead-end",
      why: "The 14 awaiting transactions carry no pickup stamp, and `created_at` is date-only — so latency pools exclude them by definition and the AM-daypart split cannot be computed at all. Screens here drill NULL-safe filters, COUNT(column) versus COUNT(*), and the answer that wins the room: naming what the schema cannot say instead of coalescing a zero over it.",
      slugs: ["find-customer-referee", "books-with-null-ratings", "confirmation-rate"],
    },
  ],

  theory: [
    {
      id: "dunkin-t1",
      q: "Your market report joins guests to transactions. When do you INNER and when do you LEFT — and what silently breaks if you filter a transaction column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A throughput report joins transactions to guests: a transaction with no guest row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from guests: the guests with no transactions ARE the answer, arriving with NULL transaction columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload guest row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the guest anti-join returns a confident zero — all 16 guests appear in the transaction table — and proving that zero, instead of assuming it, is part of the job; the anti-join that DOES bite lives in franchise settlements, where 6 statements worth 15,217.00 carry no payment rows at all. One join type per business question, and the question is always: who must survive this report?",
      tag: "joins",
    },
    {
      id: "dunkin-t2",
      q: "The visit leaderboard has four guests tied at 4 transactions each, under a ladder that runs 24, 17, 14, 13, 5. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and then skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on rank 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which guest the app's 'top run club' banner actually crowns. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer guests (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment so the next analyst doesn't relitigate the leaderboard. On a value chain's loyalty ladder the gaps ARE the story: rank 10 says six guests out-visited you, and the run-club email says it too.",
      tag: "windows",
    },
    {
      id: "dunkin-t3",
      q: "The board says 103 transactions and 16 guests; EU shows 45 transactions from 8 guests. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains, and every one of them is correct. COUNT(*) after the guest join counts transaction rows — one per transaction, so EU's 45 is load. COUNT(DISTINCT customer_id) folds repeat visits back to people — EU's 8 guests is coverage. Neither is wrong: transactions measure volume and window momentum, guests measure installed base and loyalty reach. The ratio — 5.6 transactions per guest in EU versus 9.5 in the US on this db — is the intensity signal: is traffic broadening across the base or concentrating in a handful of daily regulars? The trap that catches candidates is the third grain: join order_items for item lines and COUNT(*) silently counts lines, not transactions — 251 of them, where a coffee-plus-bagel visit is two lines on one ticket. Volume, reach and attach are three different claims about the same drive-thru, and saying 'one row per what?' before every COUNT is exactly the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "dunkin-t4",
      q: "Awaiting-pickup transactions carry no `shipped_at` stamp — it stays NULL until the guest rolls through. What is your policy for the pickup-clock report, and how do the NULLs behave in its aggregates?",
      a: "Policy first: only stamped transactions have a pickup latency, so the report measures placement-to-window for the 82 of 103 transactions that carry the stamp — averaging 2.98 on this db's day-grain clock, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL transactions returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting plus 7 voided rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-second window hits for guests still in the queue. And the deeper honesty this schema forces: `created_at` is date-only, so the AM-daypart split — the stat this chain is famous for — cannot be computed here at any cost of cleverness; the honest answer names the grain gap instead of coalescing over it.",
      tag: "nulls",
    },
    {
      id: "dunkin-t5",
      q: "The ops review wants average ticket per market for markets carrying at least ten transactions. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The stage rule is a row-level fact — excluding voided transactions discards those rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-transaction floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a window board and an error, and between a threshold applied to transactions versus to dollars. On this db the floor decides the board's shape: EU 45, APAC 37 and US 19 clear a ten-transaction bar while LATAM's 2-transaction row waits outside — and whether LATAM belongs on the board is a definition someone signs, not a rounding note. The same discipline sits inside the ratio itself: the 100.0 multiplier goes BEFORE the division, or the void share truncates to a flat zero and every market reads the same.",
      tag: "pipeline",
    },
    {
      id: "dunkin-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 transactions always produce a mean (338.19 on this db, against a 25.47 sides-only floor and a 1,088.44 catering ceiling — the haul every 'above average' flag trips on). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly where it hides: a month where every transaction got voided folds to no mean at all, and the flag list empties on the day ops most needs it. The correlated cousin (compare each transaction to ITS market's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "dunkin-t7",
      q: "The trend report buckets transactions by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's transactions, and quarter-end is exactly when catering lands. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. One more unit check this db forces: the pickup clock averages 2.98 in DAYS here — the production drive-thru board reads the same julianday shape in seconds — so say the unit on the slide, because a 2.98-second window and a 2.98-day window are two different operational conversations.",
      tag: "dates",
    },
    {
      id: "dunkin-t8",
      q: "Finance says a franchise settlement statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, the rails split at card 16 for 37,364.00 against wire 11 for 32,248.00, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "dunkin-mcq-1",
      prompt: "A transaction row's status reads 'shipped'. In this kit's Dunkin' stage map, what happened?",
      choices: ["Completed — the guest has the order", "In flight — stamped into the pickup window, not yet completed", "Voided — cancelled before handoff", "Awaiting pickup — received, not yet stamped"],
      answer: 1,
      why: "The stage map is fixed: shipped = in flight with shipped_at as the pickup-window stamp (30 of 103 transactions, 29.1%). The order reached the window queue but the handoff hasn't closed — a pipeline stage, not a done stage.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 transactions. Calling the 30 in-flight rows completed inflates the close rate before a single window handoff happens." },
        { choice: 3, why: "Awaiting pickup is 'pending' — 14 transactions with no stamp yet. Pending has no shipped_at and no clock; in flight already carries both." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-2",
      prompt: "Pickup-window share is stamped transactions ÷ which population? The db holds 82 stamped, 14 awaiting and 7 voided of 103 placed.",
      choices: ["Stamped + voided only (82/89 = 92.1%)", "All transactions placed (82/103 = 79.6%)", "Completed transactions only (52/82)", "Distinct guests (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL transactions placed — awaiting-pickup rows stay in the denominator because 'not yet through the window' is exactly what the metric watches. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 awaiting inflates the rate to 92.1% by deleting the population still queued — the rows the window board exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — completed is the handoff, the stamp is the window entry. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-3",
      prompt: "EU carries 45 transactions from 8 guests. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(customer_id)", "COUNT(*) and COUNT(DISTINCT customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 1,
      why: "COUNT(*) counts transaction rows (45); COUNT(DISTINCT customer_id) folds repeat visits back to guests (8). The gap between them — 5.6 transactions per guest — is the intensity read the census exists to surface.",
      notes: [
        { choice: 0, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every transaction carries a guest. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not guests — a third grain nobody asked for. The census is transactions AND people." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to voided transactions only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the void share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the void map reads zero everywhere and prep never re-cuts." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-5",
      prompt: "Keep only markets carrying at least 10 transactions on the window board. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 10", "WHERE transactions >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A transaction-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the board keeps EU 45, APAC 37 and US 19 — LATAM's 2-transaction row waits outside the gate.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'transactions' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-6",
      prompt: "The visit ladder runs 24, 17, 14, 13, 5 transactions, then FOUR guests tied at 4. Under RANK, what rank do the two 3-transaction guests carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-transaction guests share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The published board policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The awaiting transactions double-counted their placement day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 transactions.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-8",
      prompt: "A staging-table void list uses guest_id NOT IN (SELECT customer_id FROM transactions WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["No guest ever voided — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the void list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every transaction carries a customer_id and 7 voided rows exist. But staging tables are exactly where NULLs sneak in, and empty void lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "dunkin-mcq-9",
      prompt: "A board stack puts in-flight transactions under voided transactions in one layout, built with UNION. A reviewer says one market's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same market, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same market, same counts, no stage label — collapse into one, and the window board loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "dunkin-mcq-10",
      prompt: "A franchisee wants 'transactions above MY market's average ticket' for one slow February week. The query filters one market and one week, uses total > (SELECT AVG(total) FROM orders WHERE same filters), and returns ZERO rows. The market has transactions. Most likely cause?",
      choices: ["AVG cannot run inside a correlated position — the engine silently nulled it", "The inner fold came back empty (that market/week slice has no rows), so the comparison is total > NULL — UNKNOWN everywhere — and the report empties while looking valid", "The outer WHERE needs DISTINCT to survive the subquery", "Zero rows is correct — no transaction ever beats its own market's average"],
      answer: 1,
      why: "A scalar subquery over an EMPTY inner fold returns NULL, not an error — and every comparison against NULL is UNKNOWN, so the above-average list silently empties. On narrow staging slices (one market, one week) this is the first bug to check; widen or split the inner fold and state its population.",
      notes: [
        { choice: 0, why: "AVG runs fine in a scalar position — the shape is legal. The failure is the empty population, not the placement." },
        { choice: 3, why: "Not mathematically true: any transaction above its market's mean clears the bar — on the full book the mean is 338.19 and plenty of tickets clear it. A confident zero from a valid-looking shape is the trap." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-dunkin-1",
      tier: "easy",
      topic: "l7",
      universe: "funnel",
      title: "The drive-thru window board",
      brief:
        "Window-ops memo, Dunkin'-flavored on the storefront db: the 08:00 huddle opens with the window board — one census row for the whole estate. Transactions placed, transactions stamped into the pickup window (`shipped_at` carried), the pickup share as the board prints it (1 decimal), voided transactions, and the average placement-to-window clock over the stamped population. Probed cells: 103 transactions placed, 82 stamped, share 79.6, 7 voided, clock 2.98 on a 2–4 spread — and the title states the population: *the clock averages over the 82 stamped transactions; awaiting and voided rows have no window event yet*. The voided stage is status 'cancelled' in this store.",
      ask: "Return the estate census: transactions placed, stamped into the window, pickup share to 1 decimal, voided count, and the average window clock to 2 decimals.",
      template:
        "SELECT COUNT(*) AS transactions,\n       COUNT(shipped_at) AS picked_up,\n       ROUND(100.0 * COUNT(shipped_at) / COUNT(*), {1}) AS pickup_share,\n       SUM(CASE WHEN status = {2} THEN 1 {4} 0 END) AS voided,\n       ROUND(AVG(julianday({3}) - julianday(created_at)), 2) AS avg_window_days\nFROM orders;",
      slots: [
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "The board prints one decimal — 79.6, matching the morning deck. ROUND(…, 0) prints 80 and the slide stops reconciling with every other share cell; ROUND(…, 2) prints 79.61, a different report than the one ops reads aloud.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the voided literal",
          why: "Voided is status 'cancelled' — 7 of 103. 'shipped' would fold the 30 in-flight transactions into the void column and the huddle reads a stockroom crisis exactly where the pipeline is healthy; status = created_at or = NULL matches nothing and the void arm reads 0.",
        },
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the pickup stamp",
          why: "The clock runs from the pickup stamp: julianday(shipped_at) - julianday(created_at) = 2.98 on this db's day-grain clock. julianday(created_at) - julianday(created_at) folds every row to 0.0 — a zero-day window nobody will believe — and julianday over TEXT statuses or numerics returns NULL, which AVG carries straight through as a NULL clock.",
        },
        {
          answer: "ELSE",
          kind: "keyword",
          label: "the 0/1 fold close",
          why: "The explicit ELSE 0 makes the voided arm a visible 0/1 fold. Swap in WHEN or THEN and the CASE stops parsing; an omitted ELSE folds NULL into every non-matching row — SUM survives that by skipping NULLs, but COUNT(flag) silently collapses to 0 and the arm reads as an accident.",
        },
      ],
      distractors: ["created_at", "status", "0", "2", "'shipped'", "NULL"],
      walkthrough:
        "One scan, one row, four reconciling cells. COUNT(*) reads the placed population — 103; COUNT(shipped_at) reads the stamped subset — 82, because COUNT and AVG both skip the 14 awaiting-pickup and 7 voided rows whose stamp never landed; the share is 100.0 * 82 / 103 rounded to the board's 1 decimal = 79.6; the voided CASE arm folds status = 'cancelled' through an explicit ELSE 0 to 7; and the clock averages julianday(shipped_at) - julianday(created_at) over the stamped rows to 2.98, the 2–4 spread's midpoint the shift huddle knows by heart. The population sentence is the real deliverable: *82 of 103 stamped, clock over stamped only* — printed on the board so the 79.6 and the 2.98 wear their denominators all day. The distractors each break differently: 0 or 2 in the precision slot re-renders the share to 80 or 79.61, off the deck's standard; 'shipped' folds the 30 in-flight into the void column while status = created_at, = NULL or = 0 matches nothing and the arm reads 0; created_at in the clock slot subtracts the placement stamp from itself — 0.0 for every row; status or NULL inside julianday returns NULL and the clock cell goes NULL; WHEN, THEN or NULL in the ELSE position breaks the CASE parse outright. One query, one row, four numbers that must reconcile to the morning deck — the census the whole huddle hangs from.",
    },
    {
      id: "cs-dunkin-2",
      tier: "medium",
      topic: "j3",
      universe: "pricing",
      title: "The value-ladder folio",
      brief:
        "Menu-analytics memo, Dunkin'-flavored on the storefront db: the franchisee council reads the book as a **value ladder** — item lines split at the **55** hinge on line price: the value rung below it, the signature rung at and above it — folded per market, biggest rung first. Probed folio (lines / units / revenue): EU signature 53/100/**12,032.44** (79.7% of the market book) against value 52/99/3,056.79 (20.3%); APAC signature 40/78/8,611.42 (74.2%) against value 48/96/2,994.03 (25.8%); US signature 23/46/5,335.40 (73.2%) against value 30/66/1,950.76 (26.8%); LATAM signature 2/6/626.25 against value 3/7/226.19. Across the estate the value rung carries **268 of the book's 498 units** — volume lives below the hinge, value lives above it, and every market leans the same way.",
      ask: "Return each market with its rung (value below the 55 hinge, signature at/above), item-line count, units and revenue to 2 decimals — biggest rung first per market.",
      template:
        "SELECT c.region AS market,\n       CASE WHEN oi.unit_price >= {1} THEN {2} ELSE 'value' END AS rung,\n       COUNT(*) AS lines,\n       SUM(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN orders o ON {3}\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region, rung\nORDER BY market, revenue {4};",
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the ladder hinge",
          why: "The council's ladder splits at 55 on line price — below is the value rung, at-or-above is signature. 50 or 60 re-bands the folio (lines priced 50.32–50.84 and 57.16–59.85 change rungs) and every market's mix share drifts off the deck's 79.7 / 74.2 / 73.2 / 73.5 reads.",
        },
        {
          answer: "'signature'",
          kind: "keyword",
          label: "the upper-rung label",
          why: "The at-or-above arm labels the signature rung. 'value' in this arm collapses both arms into one label — every market prints a single rung and the ladder comparison the council argues from disappears; 'mid' re-names the rung the deck doesn't carry.",
        },
        {
          answer: "oi.order_id = o.id",
          kind: "keyword",
          label: "the transaction stitch",
          why: "Item lines reference their transaction by order_id, so the stitch is oi.order_id = o.id. Stitch on oi.id = o.id and lines pair with whatever transaction shares their row id — the folio folds on coincidence and every rung total is wrong with no error. oi.product_id = o.id pairs lines with transactions that share a product id: nonsense that still executes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rung-first direction",
          why: "The council reads the heavier rung on top of each market: signature first in all four (12,032.44 / 8,611.42 / 5,335.40 / 626.25). ASC would open every market on its value rung — a correct query aimed at the wrong end of the ladder.",
        },
      ],
      distractors: ["50", "60", "'value'", "'mid'", "oi.id = o.id", "ASC"],
      walkthrough:
        "A three-table chain that ends in a ladder. The stitch order is the build: item lines join transactions on oi.order_id = o.id, transactions join guests on c.id = o.customer_id, and the CASE splits every line at the 55 hinge into value and signature rungs. GROUP BY market, rung folds 251 lines into eight rows, and the probe's cells ARE the deck: EU signature 12,032.44 over 3,056.79 (79.7/20.3), APAC 8,611.42 over 2,994.03 (74.2/25.8), US 5,335.40 over 1,950.76 (73.2/26.8), LATAM 626.25 over 226.19 — line counts 53+52, 40+48, 23+30, 2+3 reconciling to 251, units 100+99, 78+96, 46+66, 6+7 reconciling to 498. The estate read writes itself: the value rung carries 268 of 498 units while the signature rung carries ~74–80% of every market's money — *volume below the hinge, value above it*. The distractors each break differently: 50 or 60 in the hinge moves the 50.32–50.84 and 57.16–59.85 price lines across the boundary and every share drifts; 'value' in the upper arm collapses the ladder to one rung per market; oi.id = o.id stitches lines to whichever transaction shares their row id — folio by coincidence; ASC flips every market to open on its smaller rung. Stitch on ids, band on the hinge, fold at market grain — the folio the council sets pricing from.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "The DD Perks ladder: app signup to first transaction to repeat visit, stage by stage as conditional counts — the enrollment-to-redemption walk that loyalty analytics reads every Monday." },
    { slug: "sales-analysis-iii", why: "The February window read: transactions in one date-bounded slice with a fold on top — the exact month-window shape ops uses to re-cut the board for a single daypart week." },
    { slug: "list-the-products-ordered-in-a-period", why: "The menu pull for a period: which SKUs moved in the window, at what volume — the prep-sheet query that decides tomorrow's case counts before the morning run." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The run-club lead: which guest carries the most visits — an argmax over a per-guest fold that feeds the loyalty banner, tie-policy and all." },
    { slug: "queries-quality-and-percentage", why: "Rate-above-threshold reads: share of lines clearing a quality bar with NULL-safe arithmetic — the same shape as the void-share and pickup-share percentages on the window board." },
    { slug: "average-selling-price", why: "Menu price reads per SKU with a date-aware fold — the pricing-desk drill behind the value-ladder band check (8 SKUs averaging 32.06 against 8 at 111.50)." },
    { slug: "top-travellers", why: "Top spenders by market with a fold over joined grain — the franchisee council's 'who carries the book' table, EU 15,089.23 versus US 7,286.16 at practice scale." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Beverage attach logic: guests who took coffee AND food but never the dessert case — conditional aggregation over item lines, the attach-rate family the menu team lives in." },
    { slug: "sellers-with-no-sales", why: "Partners with no activity in a window — anti-join plus date filter. The franchise read: which roasting partners booked no February settlement volume." },
    { slug: "employee-bonus", why: "LEFT JOIN with a COALESCE fallback on a bonus column — the ad-fund accrual shape: every settlement statement listed, zero shown where no accrual exists." },
    { slug: "monthly-transactions-i", why: "The month-bucketed settlement spine with an amount gate — the query behind the 14-month 2024-01..2025-02 walk and its 1,193.86 July trough." },
    { slug: "products-worth-over-invoices", why: "Line-level value judged against statement totals — a join-aggregate that mirrors the settlement-versus-book check finance runs before the close." },
    { slug: "second-highest-salary", why: "The nested fold: second-priciest SKU under the 199.99 ceiling — the subquery shape behind every 'above the Nth rung' menu-analytics ask." },
    { slug: "game-play-analysis-iv", why: "First-event subqueries: guests whose FIRST transaction landed in the launch window — the new-perks-cohort read that decides the winback calendar." },
    { slug: "team-scores-in-football-tournament", why: "UNION ALL stacks with CASE semantics — home/away folded into one table is exactly the dine-in-versus-drive-thru layout the ops board ships in." },
    { slug: "restaurant-growth", why: "The rolling 7-day average over the daily spine — the line-trend read the window board manages to, computed with a moving window that has to survive the 1,193.86 July trough." },
  ],
};
