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
    "Preparation strategy: the pools file carries **no Dunkin section** — 0 tagged rows — so all **thirty-two problems** and every topic slug here are **theme-curated** to this kit's known screen shapes: stage censuses with stated denominators, pickup-stamp latency reads, two-grain market counts, value-ladder CASE banding and the cents-safe settlement spine. Do the topics in order, then run the **six case studies** on the live storefront db, spaced across the week rather than in one sitting: the {emerald:drive-thru window board} window ops opens every morning, the {sky:value-ladder folio} menu analytics takes to the franchisee council, the **run-club ladder** the loyalty desk ranks, the **weekday prep curve** the morning run staffs from, the **dunning ledger** franchise finance sweeps, and the **store-program spend stack** the branch P&L closes on. This expanded kit is built for spaced practice: run each case once to pass it, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. The bar to clear: *state the population and the denominator before you compute anything* — then make every stage census reconcile to 103 by construction.",
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
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "customer-order-frequency"],
    },
    {
      name: "Run streaks & month walks",
      why: "The loyalty app thinks in streaks — consecutive-day runs are the habit metric — and the ops review walks the 14-month transaction spine (2024-01 to 2025-02) with LAG deltas. Both are window moves over ordered timestamps, and the first row of any walk is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "active-users", "sessionize-events"],
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
    {
      id: "dunkin-t9",
      q: "COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) all run over the transaction read. What does each count, and where does the business need each?",
      a: "COUNT(*) counts rows — 103 transactions, or 251 item lines the moment order_items joins in. COUNT(shipped_at) counts non-NULL pickup stamps only: 82, and the 21-row gap to COUNT(*) is exactly the 14 awaiting pickup plus 7 voided rows — a feature the window board reads as the queue. COUNT(DISTINCT customer_id) folds repeats back to guests: 16 across the book, 8 in EU's 45 transactions. The habit being graded is saying the grain out loud before the number ships: rows, stamped rows, people — three claims that sound identical and read completely differently on the huddle board.",
      tag: "aggregation",
    },
    {
      id: "dunkin-t10",
      q: "The huddle board needs the four-stage census in one pass. FILTER (WHERE …) or SUM(CASE …) — which do you write, and when does the choice matter?",
      a: "Both are one scan, one denominator, four reconciling branches — 52, 30, 14, 7 over the same 103. FILTER (WHERE …) is the readable spelling where SQLite and Postgres both run it; SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) is the portable twin that runs anywhere and makes the 0/1 fold explicit. The choice matters in review: a branch whose ELSE is missing folds NULLs silently, and COUNT of a boolean flag counts everything non-NULL — 103 — instead of the stage. Whichever spelling ships, the census identity is the proof: the four branches must sum to COUNT(*) by construction, or the board lies.",
      tag: "case-when",
    },
    {
      id: "dunkin-t11",
      q: "The value ladder bands the menu at the 55 hinge with a premium arm (>= 200) that matches zero SKUs. How do you write the CASE so the ladder survives review?",
      a: "Order the arms from the top of the ladder down and let CASE's first-match semantics do the work: WHEN price >= 200 THEN 'premium', WHEN price >= 55 THEN 'signature', ELSE 'budget'. The premium arm folds nothing on this db — the ladder tops out at 199.99 — and printing that honestly is the point: a value chain defends its floor, and an arm that vanishes from the GROUP BY hides the fact that volume lives entirely below the ceiling. The edges are published numbers, so they go in as literals, and the boundary gets tested on both sides: a 54.99 line is budget, a 55.00 line is signature, and a reordered arm silently re-bands everything between. The ELSE is the base rung by construction; an arm left implicit is a hole in the folio.",
      tag: "case-when",
    },
    {
      id: "dunkin-t12",
      q: "When is UNION the bug and UNION ALL the honest stack on the ops board?",
      a: "UNION ALL concatenates; UNION adds a distinct pass over the combined set. The dedupe is only correct when you can say which duplicated rows deserve collapsing — and on the board the branches are disjoint by design (stage rows over TOTAL rows, dine-in over drive-thru), so the dedupe buys nothing, costs a sort, and becomes a silent bug the day two branches emit byte-identical rows: the board loses a row with no error anywhere. The discipline is UNION ALL plus a comment stating why duplicates are impossible — the comment is the correctness argument. A vanishing market row is how the dedupe announces itself, usually in the franchisee meeting after the deck shipped.",
      tag: "set-ops",
    },
    {
      id: "dunkin-t13",
      q: "Which menu questions do EXCEPT and INTERSECT answer more honestly than a join — and what do they silently do to duplicates?",
      a: "Set-level diffs across snapshots: SKUs on the new menu feed but not the old one is SELECT sku FROM new EXCEPT SELECT sku FROM old — no join gymnastics, and the intent reads off the page; INTERSECT answers the mirror, SKUs present in both. The silent behavior: both inputs are deduplicated first, so a pipeline-retry duplicate collapses before the compare and the diff reads clean while the ingest anomaly stands. When duplicates ARE the signal, the row-honest tool is a GROUP BY the key HAVING COUNT(*) > 1 census or an anti-join on the full multiset. Column discipline still applies — both sides need matching column counts and compatible types — and EXCEPT for snapshot diffs, anti-joins for row-level forensics is the split to state out loud.",
      tag: "set-ops",
    },
    {
      id: "dunkin-t14",
      q: "When does the window-board query grow past two grains, and what does naming the CTEs buy the next analyst?",
      a: "The moment the query stages guests (visit counts and lifetime spend per member), ranks them (the run-club ladder) and flags them (above-market tickets), it has three grains and one shot at being audited. Named CTEs — visits, ranked — read like the board's build order instead of a nested subquery, each one is a checkpoint you can SELECT from while debugging, and one staging step can feed several later references without being written twice. Correctness under review is the real buy: a CTE named visit_leaderboard forces the tie policy to live where the reviewer can see it instead of in a deck footnote. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step and the outer stages carry fewer rows.",
      tag: "ctes",
    },
    {
      id: "dunkin-t15",
      q: "The franchisee wants transactions above THEIR market's average ticket, not the chain's 338.19. How does the window version differ from the scalar subquery?",
      a: "The benchmark is per-market, so AVG(total) OVER (PARTITION BY region) computes each market's mean onto every row — EU's 335.32, APAC's 313.66, US's 383.48, LATAM's 426.22 — and the comparison happens in an outer query, because window output is not visible to WHERE. The scalar subquery (SELECT AVG(total) FROM orders) answers a different question: one global mean, 338.19, judging every ticket against a blend that includes markets the ticket never traded in. The partition version is also one pass instead of a per-row re-evaluation, which is the difference between a board that renders and a correlated query that crawls. Saying which population each benchmark averages is the entire answer.",
      tag: "windows",
    },
    {
      id: "dunkin-t16",
      q: "The cumulative ticket walk jumps two transactions in one step. What happened, and what is the fix?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats ORDER BY ties as peers — two transactions sharing a created_at day enter the cumulative together, so the step doubles. On this db the clock is DAY-grain, so ties are guaranteed, not rare: every same-day pair walks together. The fix is declaring the frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row regardless of ties. The distinction is calendar-true versus row-true — RANGE peers six days back on a date axis, ROWS peers six rows back, which is wrong when a day is missing. The frame goes in the query, not in the reviewer's memory.",
      tag: "windows",
    },
    {
      id: "dunkin-t17",
      q: "Give me three ways to answer 'each market's biggest ticket' — and how each behaves on ties.",
      a: "Window argmax: ROW_NUMBER() OVER (PARTITION BY region ORDER BY total DESC, id) = 1 in a CTE — one deterministic row per market even when two tickets tie, because the second key breaks the tie. Join-back on the maximum: join markets to a per-market MAX(total) derived table — honest, but it returns BOTH tied tickets, which is a feature when the brief says report co-leaders and noise when it says one row per market. Correlated filter: WHERE total = (SELECT MAX(…) for that market) — same tie behavior as the join-back, with per-row re-evaluation cost. The complete answer names the divergence: ROW_NUMBER decides, the join-back reports, the correlated form simplifies — and 'which one does the brief want' is the question that earns the follow-up.",
      tag: "windows",
    },
    {
      id: "dunkin-t18",
      q: "The franchise tables store INTEGER cents. Where do numeric bugs bite, and what is your rounding policy?",
      a: "Three bite points. Scale: amount_cents = 400000 divided by 100 is integer division — 4000 flat; divide by 100.0 or convert once at the presentation edge. Mid-pipeline rounding: ROUND inside the calculation discards precision a later SUM still needed — round only what a human reads. Float drift: REALs are IEEE doubles, so compare money with a tolerance or keep it in integer cents to the last step. The policy I state in review: aggregate in cents, convert once, round at the edge, and let the trial balance prove it — 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route. The royalty read lives or dies on the same rule: a percent-of-cents fold that rounds mid-pipeline quietly skims every franchisee.",
      tag: "numbers",
    },
    {
      id: "dunkin-t19",
      q: "Why is averaging the four markets' average tickets wrong, and what do you compute instead?",
      a: "Because it weights every market equally regardless of size: EU's 45 transactions and LATAM's 2 would each count as one vote. The honest chain-wide average ticket is SUM(total)/COUNT(*) over the base rows — 338.19 on this db — where LATAM's two tickets barely register. The blends that work are re-aggregation from the base (sum the numerators, divide by the summed denominators) or a weighted average — SUM(aov * transactions)/SUM(transactions) — the same arithmetic one level up. The interview move is saying where the weighting lives: an average of averages is only correct when every group has equal counts, and that is a claim to defend, not assume.",
      tag: "aggregation",
    },
    {
      id: "dunkin-t20",
      q: "What makes a predicate sargable, and which habits keep the window-board queries cheap?",
      a: "Sargable means the predicate compares the bare column to a value so an index can serve it. Wrapping the column in a function — SUBSTR(created_at, 1, 7) = '2024-03' — forces a scan of every transaction; the sargable twin is the half-open range created_at >= '2024-11-01' AND created_at < '2024-12-01', same rows, index-usable. The habits that compound: filter early inside each CTE so later stages carry fewer rows, name columns instead of SELECT *, probe with LIMIT before committing to the full run, and aggregate on the smallest table that answers the question rather than joining first and filtering after. At one store they read as manners; across a franchise estate they are the difference between a board that renders and one that times out at the 08:00 huddle.",
      tag: "performance",
    },
    {
      id: "dunkin-t21",
      q: "The huddle asks for 'our pickup-window share'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the numerator (transactions carrying a shipped_at stamp — 82), the denominator (ALL transactions placed — 103, awaiting pickup included, because 'not yet through the window' is exactly what the metric watches), the unit (this db's clock is DAYS; the production board reads seconds — say it on the slide), and the void policy (voided rows stay in the denominator, or the share inflates by excluding product that was made and never sold). Then the discipline move: encode the definition as a named CTE — stamped AS (…WHERE shipped_at IS NOT NULL…) — so the SQL IS the definition and the reviewer audits it instead of arguing. The analyst who says 'stamped over placed, voids in, days not seconds' owns the room.",
      tag: "metrics",
    },
    {
      id: "dunkin-t22",
      q: "created_at is DATE-only and the pickup clock runs in this db's days. What do you check before shipping any time-based number?",
      a: "Two grain checks, every time. First the clock: this table stores dates with no time component, so the AM-daypart split — the stat this chain is famous for — cannot be computed here at any cost of cleverness, and julianday differences pool at day granularity: the pickup clock reads 2.98 with a 2-to-4 spread, in DAYS. Second the unit: the production drive-thru board reads the same julianday shape in seconds, so every time number ships with its unit on the slide — a 2.98-day window and a 2.98-second window are two different operational conversations. The half-open discipline still applies to what the dates CAN answer: created_at >= '2024-11-01' AND created_at < '2024-12-01' catches the whole month including its last night, where BETWEEN drops it. Naming what the schema cannot say beats coalescing over it.",
      tag: "dates",
    },
    {
      id: "dunkin-t23",
      q: "The huddle board's pickup share moved overnight. Which SQL checks run in the first ten minutes?",
      a: "Five, in order. Freshness: MAX(created_at) per source table — a feed that stopped at 02:00 explains most surprises alone. Volume: today's row count versus the 7-day average, because a half-loaded feed halves every downstream fold. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for pipeline-retry duplicates. Orphans: an anti-join of line product_ids against the menu table to catch a reference break. NULL spikes: COUNT(shipped_at) versus COUNT(*) — a stamp column that went sparse empties every pickup-share fold built on it. On this book the sixth check is configuration: the settlement status literals — a renamed 'paid' value flips the anomaly flag with no data change at all. The deliverable is not 'it looks fine'; it is which check passed and when it last ran.",
      tag: "quality",
    },
    {
      id: "dunkin-t24",
      q: "When is DISTINCT a bug report rather than a feature in the transaction fold?",
      a: "When it is papering over a fan-out nobody diagnosed. SELECT DISTINCT market, ticket_total returning sane-looking rows usually means a join multiplied transactions by item lines and DISTINCT is de-duplicating the damage — while the revenue SUM beside it is still wrong. The honest sequence: notice the DISTINCT, run the counts with and without it, find the multiplicity (GROUP BY the key HAVING COUNT(*) > 1), and fix the join or pre-aggregate. Legitimate DISTINCT exists: collapsing a dimension's value set — 4 market buckets from 103 transactions, 16 guests from 16 rows — or de-duplicating a deliberately over-joined enrichment. The tell is intentionality: a DISTINCT you can justify in one sentence is a feature; one you cannot is a bug report filed against your own query.",
      tag: "joins",
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
    {
      id: "dunkin-mcq-11",
      prompt: "The 08:00 huddle board ships as ONE scan: completed, in flight, awaiting pickup, voided in four columns over the same 103 transactions. Which expression fills the voided column (7 rows)?",
      choices: ["COUNT(*) FILTER (WHERE status = 'cancelled')", "COUNT(status = 'cancelled')", "SUM(*) FILTER (WHERE status = 'cancelled')", "COUNT(*) GROUP BY 'cancelled'"],
      answer: 0,
      why: "FILTER (WHERE …) skips rows failing the predicate for that aggregate only, so four columns share one scan and one denominator — the census reconciles to 103 by construction, which is the identity the huddle checks before reading anything else.",
      notes: [
        { choice: 1, why: "COUNT of a 0/1 boolean counts every non-NULL flag — 103, the whole board. The condition needs FILTER, or the flag needs SUM." },
        { choice: 2, why: "SUM(*) is not SQL — SUM takes an expression, not the * wildcard. The portable twin is SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-12",
      prompt: "The partial settlement reads amount_cents = 400000 against the 614800-cent statement. Which expression prints 4,000.00 on the dunning memo?",
      choices: ["amount_cents / 100", "amount_cents / 100.0", "ROUND(amount_cents / 100)", "amount_cents % 100"],
      answer: 1,
      why: "The franchise tables store INTEGER cents; INTEGER / 100 is integer division — 4000 flat, the cents gone. Dividing by the float literal 100.0 forces real arithmetic and prints 4000.0, the dollar read the memo quotes.",
      notes: [
        { choice: 0, why: "4,000 exactly — right here, wrong on every odd-cent row in the book. The .0 is the whole fix." },
        { choice: 3, why: "MOD 100 returns the cents portion — 0 here — not the dollar read. Scale conversion is division by 100.0, not remainder arithmetic." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-13",
      prompt: "The franchisee asks for the AM-daypart split — transactions placed before 11:00 versus after. What is the honest answer on this db?",
      choices: ["strftime('%H', created_at) buckets the placement hours", "created_at is DATE-only — the hour grain does not exist in this table; say so and pull hour-grain source data", "CAST(created_at AS TIME) extracts the clock", "SUBSTR(created_at, 12, 2) reads the hour digits"],
      answer: 1,
      why: "The stored timestamps carry no time component, so every clever extraction reads the same empty string or the same NULL — the AM-daypart split, the stat this chain is famous for, cannot be computed from this table at any cost of cleverness. Naming the grain gap IS the interview answer; forcing a query is the red flag.",
      notes: [
        { choice: 0, why: "It runs and returns something — '%H' over a date-only string yields NULL, which silently buckets every transaction into one daypart. A query that answers nothing while looking valid is worse than none." },
        { choice: 2, why: "The cast succeeds and returns NULL for every row — the split reads 0 versus 0. Format casting cannot invent a grain the data never stored." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-14",
      prompt: "One transaction fans into item lines — 103 transactions become 251 lines (a coffee plus a bagel is two lines on one ticket). After joining order_items to orders, what does COUNT(*) read, and what reads 103 again?",
      choices: ["103 either way — the join is lossless", "251 lines; COUNT(DISTINCT o.id) reads 103 tickets", "251 tickets; the join duplicated every ticket", "498 — the units ride along"],
      answer: 1,
      why: "After the fan-out, COUNT(*) counts the FINEST grain present — item lines, 251. COUNT(DISTINCT o.id) folds the lines back to tickets: 103. Beverage attach lives at the line grain; visit counts live at the ticket grain, and the two must never share a column label.",
      notes: [
        { choice: 0, why: "Lossless for tickets, multiplicative for rows — the second line of any multi-item ticket is where the counts part ways." },
        { choice: 3, why: "498 is SUM(quantity) — units moved, a third grain. Lines, tickets and units are three different claims about the same drive-thru." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-15",
      prompt: "The prep sheet buckets transactions by weekday from DATE-only created_at. Which expression returns the weekday code the pivot matches on?",
      choices: ["strftime('%w', created_at)", "DAYOFWEEK(created_at)", "strftime('%H', created_at)", "EXTRACT(DOW FROM created_at)"],
      answer: 0,
      why: "strftime('%w', …) returns '0' through '6' (Sunday through Saturday) as TEXT — the portable SQLite spelling the pivot literals match. '%H' reads hours (which do not exist here), and DAYOFWEEK/EXTRACT are other engines' functions.",
      notes: [
        { choice: 1, why: "DAYOFWEEK is MySQL — SQLite's date toolkit is strftime, julianday, date and their cousins. The code '5' is Friday here, and the pivot's literals must carry the quotes." },
        { choice: 2, why: "'%H' is the hour code — over date-only strings it yields NULL, and every bucket reads 0. Wrong format code, right function." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-16",
      prompt: "The value ladder's CASE has a premium arm — WHEN price >= 200 THEN 'premium' — that matches ZERO of the 16 SKUs (the ladder tops out at 199.99). What does the GROUP BY price-band fold print?",
      choices: ["A premium row with zeros", "No premium row — GROUP BY only materializes groups that own rows", "An error — empty arms are rejected", "The premium arm folds into mid"],
      answer: 1,
      why: "GROUP BY folds rows that exist; an empty band produces no group and vanishes from the fold — no error, no row. A ladder read that omits its empty premium rung looks complete while hiding that volume lives entirely below the ceiling; zero-fill needs a bands spine or a UNION ALL'd stub.",
      notes: [
        { choice: 0, why: "Nothing folds a group with no rows — the zeros would have to come from a spine join or a stacked stub, not from GROUP BY itself." },
        { choice: 3, why: "No row ever migrates between arms — the SKUs are already banded by the CASE; the empty arm simply has nothing to fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-17",
      prompt: "The visit ladder runs 24, 17, 14, 13, 5, then FOUR guests tied at 4. Under DENSE_RANK, what rank does the next distinct guest (3 visits) carry?",
      choices: ["10", "7", "6", "5"],
      answer: 1,
      why: "DENSE_RANK shares rungs without gaps: the four-way tie is rank 6 four times, and the next distinct count lands on 7 — no phantom positions. RANK would say 10, asserting five guests who do not exist, which is exactly the gap the board's RANK policy accepts and the dense view erases.",
      notes: [
        { choice: 0, why: "That is RANK's answer — the tie consumes ranks 6 through 9 and the next distinct count skips to 10. Gaps are RANK semantics." },
        { choice: 2, why: "6 is the tie's own rung, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-18",
      prompt: "The catering push covers transactions placed 2024-11-01 through 2024-11-30, last night included. Which WHERE clause catches '2024-11-30 21:14:00'?",
      choices: ["WHERE created_at BETWEEN '2024-11-01' AND '2024-11-30'", "WHERE created_at >= '2024-11-01' AND created_at < '2024-12-01'", "WHERE created_at LIKE '2024-11-30%'", "WHERE julianday(created_at) = '2024-11-30'"],
      answer: 1,
      why: "Timestamps compare as strings and '2024-11-30 21:14:00' sorts AFTER '2024-11-30' — BETWEEN's inclusive upper bound drops the last night exactly when catering lands. The half-open range ends at December's midnight and catches every second of November with no boundary judgment.",
      notes: [
        { choice: 0, why: "Inclusive on both ends — but stored times sort past the bare date, so the 30th's own evening tickets vanish. Half-open intervals end at the NEXT period's start." },
        { choice: 2, why: "That keeps only the 30th itself. LIKE on timestamps is also format-fragile and non-sargable." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-19",
      prompt: "List every franchise settlement statement with zero tender legs — all 6, including the one marked 'paid' (#28). Which query returns exactly that list?",
      choices: ["SELECT i.number FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents IS NULL", "SELECT i.number FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL", "SELECT number FROM invoices WHERE status != 'paid'", "SELECT i.number FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents = 0"],
      answer: 1,
      why: "The anti-join keeps all 28 statements and holds the 6 whose payment payload never arrived (p.id IS NULL) — payment rows are the ledger of record, status is a claim, so the paid-status anomaly surfaces here and nowhere else.",
      notes: [
        { choice: 0, why: "INNER JOIN deletes the six before the WHERE can see them — the result is empty, since existing payments never carry NULL amounts." },
        { choice: 2, why: "The status column is exactly what lies on #28 — and status != 'paid' also sweeps in the void-but-settled statement (#11 carries a 925.00 leg). Filter the payment side, not the claim." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-20",
      prompt: "Which query flags transactions above THEIR OWN market's average ticket — not the chain's 338.19?",
      choices: ["WHERE total > (SELECT AVG(total) FROM orders)", "Wrap AVG(total) OVER (PARTITION BY region) in a CTE and compare total > market_avg outside", "GROUP BY region HAVING total > AVG(total)", "WHERE total > 338.19"],
      answer: 1,
      why: "The benchmark is per-market, so the window AVG over PARTITION BY region computes each market's mean onto every row — and the comparison must happen in an outer query, because window output is not visible to WHERE. The global scalar subquery answers a different question, and 338.19 is only the chain-wide blend.",
      notes: [
        { choice: 0, why: "That is the chain-wide average — EU's 45 tickets would be judged against a mean that includes US's 383.48 skew. Different benchmark, different flag list." },
        { choice: 2, why: "HAVING judges groups, not rows — with GROUP BY region the query collapses to one row per market, and 'total' outside an aggregate is meaningless." },
      ],
      difficulty: "hard",
    },
    {
      id: "dunkin-mcq-21",
      prompt: "`SELECT COUNT(DISTINCT c.region) FROM orders o JOIN customers c ON c.id = o.customer_id` runs on the training db. What returns?",
      choices: ["4 — the four market buckets that buy", "103", "16", "45"],
      answer: 0,
      why: "The join fans 103 transactions across guests, but COUNT(DISTINCT region) folds the fan-out back to the four market buckets — EU, APAC, US, LATAM. DISTINCT's output size is the column's cardinality, not the row count it started from.",
      notes: [
        { choice: 1, why: "103 is the joined row count — COUNT(*)'s answer. The DISTINCT keyword is doing all the work." },
        { choice: 2, why: "16 is the guest count. Markets are coarser than guests — there is no market-level duplication to leave behind." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-22",
      prompt: "The analyst wants only the months whose transaction count fell: `SELECT month, visits, LAG(visits) OVER (ORDER BY month) AS prev FROM monthly WHERE visits < prev` fails. Why — and what is the fix?",
      choices: ["LAG cannot appear next to a comparison — wrap it in ROUND first", "Window functions evaluate in the SELECT stage, after WHERE — stage the LAG in a CTE and filter outside", "Falling months need HAVING, not WHERE", "The OVER ORDER BY must be DESC to see falls"],
      answer: 1,
      why: "WHERE runs before SELECT computes the window, so prev does not exist at filter time — the engine rejects the alias, not the idea. The fix is two stages: fold the spine in a CTE with the LAG attached, then filter visits < prev outside. The same rule governs filtering on RANK or a running total.",
      notes: [
        { choice: 0, why: "The comparison is fine — ROUND changes nothing. The failure is evaluation order, not arithmetic." },
        { choice: 2, why: "HAVING filters groups and no grouping is happening — the filter is about a window value that does not exist yet. Stage, then filter." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-23",
      prompt: "The folio is grouped by market and rung. Which expression computes the signature rung's share of ITS OWN market's book (EU signature 12,032.44 of EU's 15,089.23 — 79.7%)?",
      choices: ["SUM(line_value) / SUM(SUM(line_value)) OVER ()", "SUM(line_value) / SUM(SUM(line_value)) OVER (PARTITION BY market)", "SUM(line_value) / 34833.28", "AVG(line_value) / SUM(line_value)"],
      answer: 1,
      why: "The partition-scoped total-of-totals: the window folds the per-group sums within the market partition, so the denominator is the market's own book. The unpartitioned OVER () is the whole estate's 34,833.28 — a different denominator that turns the market-mix story into a chain-share read (34.5%).",
      notes: [
        { choice: 0, why: "OVER () without PARTITION is the estate denominator — every rung would be judged against 34,833.28 and the market mix the council argues from disappears." },
        { choice: 2, why: "The estate constant answers the estate question — EU's signature share of the ESTATE is 34.5%, not the 79.7 the folio quotes." },
      ],
      difficulty: "hard",
    },
    {
      id: "dunkin-mcq-24",
      prompt: "mom_pct = ROUND(100.0 * (visits - LAG(visits) OVER (ORDER BY month)) / LAG(visits) OVER (ORDER BY month), 1). What is the opening month's (2024-01) value?",
      choices: ["0.0 — the spine starts flat", "NULL — LAG has no prior row, and NULL propagates through the arithmetic", "A division-by-zero error", "8 — the month's own count"],
      answer: 1,
      why: "LAG returns NULL on the first row of the window and any arithmetic with NULL yields NULL — 2024-01's move is honestly 'no baseline', not zero. Coalescing it to 0.0 silently asserts a flat month where the truth is 'unknown'; a label like 'baseline' is the explicit, written-down alternative.",
      notes: [
        { choice: 0, why: "Nothing coerces the NULL automatically — a displayed 0.0 is a COALESCE someone chose, and it lies about the baseline." },
        { choice: 2, why: "NULL is not zero — the denominator never evaluates, so no error. The row simply carries NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "dunkin-mcq-25",
      prompt: "The menu snapshot diff runs `SELECT sku FROM menu_new EXCEPT SELECT sku FROM menu_old`. Both feeds describe the same 16 SKUs — but a pipeline retry wrote one SKU twice in new. What comes back?",
      choices: ["1 row — the duplicated SKU looks like a difference", "0 rows — EXCEPT deduplicates both inputs first, and the duplicate collapses before the compare", "16 rows — every SKU differs", "An error — EXCEPT requires unique keys"],
      answer: 1,
      why: "EXCEPT is a set operation: both sides are deduplicated before the compare, so the retry duplicate collapses and the diff reads empty — hiding the ingest anomaly the diff was supposed to catch. When duplicates ARE the signal, the row-honest tool is a GROUP BY the key HAVING COUNT(*) > 1 census, not a set diff.",
      notes: [
        { choice: 0, why: "A multiset diff would say that — sets don't. The dedupe happens before the comparison, which is precisely why the anomaly vanishes." },
        { choice: 3, why: "EXCEPT is happy with duplicate rows — dedupes them, even. No uniqueness requirement exists on either side." },
      ],
      difficulty: "hard",
    },
    {
      id: "dunkin-mcq-26",
      prompt: "The franchisee's cumulative ticket walk — SUM(total) OVER (ORDER BY created_at) — jumps two transactions at one created_at day. What happened?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. Saying the frame out loud is the fix: ROWS walks strictly row by row. On this db's DAY-grain clock, ties are guaranteed, not rare.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "dunkin-mcq-27",
      prompt: "The app merchandises each guest's 'usual order' — their most-pulled SKU. Two SKUs tie at a guest's top pull. Which query keeps exactly one deterministic row per guest?",
      choices: ["Join orders to a per-guest MAX(quantity) fold", "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY SUM(quantity) DESC, product_id) = 1 over the folded grain", "DENSE_RANK() = 1 per guest", "WHERE quantity = MAX(quantity) GROUP BY customer_id"],
      answer: 1,
      why: "ROW_NUMBER over the per-guest fold with a named tie-breaker (product_id) keeps exactly one 'usual' per guest even on ties — the determinism app trust depends on. The MAX join-back and DENSE_RANK = 1 both keep every tied SKU, merchandising two usuals; the aggregate in WHERE is not valid SQL.",
      notes: [
        { choice: 0, why: "Right shape, wrong cardinality on ties — both tied SKUs come back and the app surface doubles. A tie-breaker is ROW_NUMBER spelled out." },
        { choice: 3, why: "An aggregate in WHERE is a hard error — aggregates do not exist before groups form." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-28",
      prompt: "The prep-par sheet wants each market's SKU list as one cell — 'SKU 4, SKU 7, SKU 11'. Which aggregate folds rows into that string?",
      choices: ["GROUP_CONCAT(name, ', ')", "CONCAT(name, ', ')", "STRING_AGG is the only SQLite spelling", "SUM(name)"],
      answer: 0,
      why: "GROUP_CONCAT folds a group's rows into one text cell, comma-separated by default or by the given separator — the one-cell-per-group fold the prep sheet wants. CONCAT joins strings within one row and never collapses a group; STRING_AGG is Postgres, not SQLite.",
      notes: [
        { choice: 1, why: "CONCAT builds a string from ONE row's values — every line would carry its own fragment instead of the group folding into a cell." },
        { choice: 3, why: "SUM over text coerces names to numbers — 0 for every SKU — and adds them. A text fold needs a text aggregate." },
      ],
      difficulty: "medium",
    },
    {
      id: "dunkin-mcq-29",
      prompt: "The pickup clock reads 2.98 — julianday(shipped_at) - julianday(created_at) over the 82 stamped transactions. What UNIT is that in, and what does the production drive-thru board read the same shape in?",
      choices: ["Hours; the board reads minutes", "Days (fractional); the board reads the same shape in seconds — state the unit", "Seconds; the board reads hours", "It depends on the timestamp format"],
      answer: 1,
      why: "julianday converts a timestamp to a fractional day count, so the difference is days — 2.98 on this db's day-grain clock, with a 2-to-4 spread. The production board reads the same window in seconds; shipping a number without its unit is how a 2.98-day SLA gets staffed as a 2.98-second one.",
      notes: [
        { choice: 0, why: "Days, not hours — 2.98 hours would be a drive-thru miracle. The fractional part is hours riding inside the day count." },
        { choice: 3, why: "The format is uniform ISO-8601, and julianday parses it deterministically — the unit is days by definition of the function." },
      ],
      difficulty: "easy",
    },
    {
      id: "dunkin-mcq-30",
      prompt: "The GL must close delta zero: 181,080 debits against 181,080 credits, amounts in integer cents. Which single query proves it in one pass?",
      choices: ["SELECT SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END) AS delta FROM ledger_entries — delta 0 closes", "SELECT SUM(amount) FROM ledger_entries — the total proves balance", "SELECT entry_type, amount FROM ledger_entries — eyeball the pairs", "SELECT COUNT(*) FROM ledger_entries — row counts must match"],
      answer: 0,
      why: "The signed fold — debits positive, credits negative — collapses the whole ledger to one delta cell, and 0 is the only value that closes. A grand SUM adds the two sides instead of netting them, eyeballing pairs is not a proof, and row counts say nothing about amounts.",
      notes: [
        { choice: 1, why: "SUM(amount) nets to 362,160 — the two sides ADDED, not netted. The signed CASE is what turns addition into reconciliation." },
        { choice: 2, why: "A scan is not a proof — the close needs one number that can only be zero when the sides agree. Fold, then read." },
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
    {
      id: "cs-dunkin-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The run-club ladder",
      brief:
        "Loyalty memo, Dunkin'-flavored on the storefront db: the app's run-club banner crowns the visit leaderboard, and the board's published policy is RANK semantics — ties share a rung and the gaps are the story. Probed on the storefront db: 103 transactions across 16 guests; the ladder runs 24, 17, 14, 13, 5, then a four-way tie at 4 visits, then two guests at 3. The published read keeps the 3-and-up cut — eleven guests, ranks 1 through 5 clean, the tie sharing rank 6, and the two 3-visit guests landing on rank 10: five phantom positions RANK asserts and DENSE_RANK would erase. Biggest visit count first, guest id breaking row order inside a rung.",
      ask: "Return guest id, visit count and board rank for every guest with at least 3 visits, biggest first, ties sharing a rung.",
      template:
        "WITH visits AS (\n  SELECT customer_id, COUNT(*) AS visits\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT customer_id,\n       visits,\n       {1}() OVER (ORDER BY visits {2}) AS visit_rank\nFROM visits\nWHERE visits >= {3}\nORDER BY visit_rank, customer_id;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the published rank policy",
          why: "The board's published policy is RANK — ties share a rung and the gaps are the story: the four-way tie at 4 consumes ranks 6 through 9, and the two 3-visit guests land on rank 10, asserting five guests who do not exist. DENSE_RANK would erase exactly the gap the banner copy quotes; ROW_NUMBER would crown one arbitrary 4-visit guest.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The ladder is biggest-first: 24, 17, 14, 13, 5, then the tie. ASC would rank the 3-visit guests first and hand the banner to the quietest regulars — a correct query answering the opposite question.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the tier threshold",
          why: "The 3-and-up cut keeps eleven guests so the rank divergence is visible: the tie shares rank 6 and the 3-visit guests land on 10 under RANK (7 under DENSE_RANK). The figure 3 is also every cut-off guest's visit count sitting in the output, and the threshold rides the CTE's folded column.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "4", "5"],
      walkthrough:
        "Fold, threshold, rank. The CTE folds 103 transactions to 16 guest rows — one visit count each; WHERE visits >= 3 keeps the eleven-guest read; the window ranks the folded counts biggest-first. RANK semantics are the policy: 24 → rank 1, 17 → 2, 14 → 3, 13 → 4, 5 → 5, then the four-way tie at 4 shares rank 6 — guests 9, 11, 14 and 16 tied on one rung, ordered by guest id only for stable display — and the two 3-visit guests land on rank 10. The gaps ARE the copy: DENSE_RANK would print 1 through 6 with the next distinct count on 7 and no phantom implied; RANK's 10 asserts five guests who do not exist, which is precisely the rung-cadence story the banner quotes. ROW_NUMBER would crown guest 9 (or whoever ties first) and quietly demote three peers off the banner. ASC ranks the quiet end first; 4 amputates the 3-visit guests whose rank-10 landing makes the gap visible; 5 cuts to the clean top rungs and the tie disappears with it. Fold at guest grain, cut at the tier line, rank with the published policy.",
    },
    {
      id: "cs-dunkin-4",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The weekday prep curve",
      brief:
        "Prep memo, Dunkin'-flavored on the storefront db: the morning run is staffed off the weekday curve — transactions pivoted into seven day-of-week columns in ONE row, so the shift huddle sees the whole week's shape at a glance. Probed on the storefront db (created_at is DATE-only, so the day code comes from strftime('%w', …)): Sunday 16, Monday 20, Tuesday 16, Wednesday 16, Thursday 9, Friday 18, Saturday 8 — 103 transactions reconciling across the row. The read: Monday carries the heaviest pull (20) while Thursday's 9 is the week's lull — the pair that decides where the prep call flexes. Note the %w codes: Friday is '5', Sunday '0', Saturday '6' — the pivot's literals are the trap.",
      ask: "Return one row with transaction counts per weekday, Sunday through Saturday, pivoted with CASE.",
      template:
        "SELECT SUM(CASE WHEN strftime('%w', created_at) = {1} THEN 1 ELSE 0 END) AS sun,\n       SUM(CASE WHEN strftime('%w', created_at) = {3} THEN 1 ELSE 0 END) AS mon,\n       SUM(CASE WHEN strftime('%w', created_at) = '2' THEN 1 ELSE 0 END) AS tue,\n       SUM(CASE WHEN strftime('%w', created_at) = '3' THEN 1 ELSE 0 END) AS wed,\n       SUM(CASE WHEN strftime('%w', created_at) = '4' THEN 1 ELSE 0 END) AS thu,\n       SUM(CASE WHEN strftime('%w', created_at) = {2} THEN 1 ELSE 0 END) AS fri,\n       SUM(CASE WHEN strftime('%w', created_at) = '6' THEN 1 ELSE 0 END) AS sat\nFROM orders;",
      slots: [
        {
          answer: "'0'",
          kind: "keyword",
          label: "the Sunday day-code",
          why: "Sunday's code is '0' — the pivot's origin, not a missing value. '7' matches nothing and prints an empty Sunday column, and the bare number 0 never equals the TEXT code strftime returns.",
        },
        {
          answer: "'5'",
          kind: "keyword",
          label: "the Friday day-code",
          why: "strftime('%w') codes Friday as '5' — the literal the fri column matches. 'friday' matches nothing and prints a 0 column; '0' would fold Sunday's 16 into the Friday column; the bare number 5 never equals the TEXT code strftime returns.",
        },
        {
          answer: "'1'",
          kind: "keyword",
          label: "the Monday day-code",
          why: "Monday's code is '1' — the heaviest pull (20) the huddle staffs first. '2' in this slot reports Tuesday's 16 on the Monday row and the prep call under-staffs the peak; 'friday' or '7' prints 0 and the peak vanishes from the sheet.",
        },
      ],
      distractors: ["'friday'", "'7'", "5", "0", "2"],
      walkthrough:
        "Seven columns, one scan, one row. strftime('%w', created_at) returns the day code as TEXT — '0' through '6', Sunday through Saturday — and each CASE folds its day's transactions through an explicit ELSE 0 so every column exists even where the week runs quiet. The probed read: sun 16, mon 20, tue 16, wed 16, thu 9, fri 18, sat 8 — the seven cells sum to 103, which is the reconcile-by-construction check the huddle runs before the prep call. The shape writes the staffing: Monday's 20 carries the week's heaviest pull, Thursday's 9 is the trough the shift reduction targets, and the weekend splits 16/8 — Saturday's 8 the smallest day on the board. The distractors each corrupt one column: 'friday' matches no stored code and prints 0; '7' is not a %w code at all; '2' in the Monday slot reports Tuesday's 16 on the peak row; and the bare numbers 5 and 0 never equal the TEXT codes strftime returns, so the columns zero out. Pivot on the code, guard with ELSE 0, reconcile to 103 — the curve the prep sheet is cut from.",
    },
    {
      id: "cs-dunkin-5",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The dunning ledger",
      brief:
        "Franchise-finance memo, Dunkin'-flavored on the storefront db: the dunning sweep runs before a single reminder goes out — every settlement statement with zero tender legs, biggest exposure first, with paid-status anomalies flagged on sight. Probed on the storefront db: 28 statements, 22 settled (21 exact, 1 partial at 4,000 of 6,148), and 6 with no payment rows worth 15,217.00 — INV-2025-024 (4,937.00) the largest, then INV-2025-026 (3,562.00), INV-2025-027 (2,794.00), INV-2025-028 (1,756.00), INV-2024-021 (1,295.00) and INV-2024-018 (873.00). Statement #28 is the flag: marked 'paid' with zero payment rows — a status that lies, which is why the flag keys on status literals inside the anti-join, not on the anti-join itself.",
      ask: "Return number, status and billed cents for every never-settled statement, biggest exposure first, with 'anomaly' flagged on paid-status rows.",
      template:
        "SELECT i.number,\n       i.status,\n       i.amount_cents,\n       CASE WHEN i.status = {1} THEN {2} ELSE 'open' END AS flag\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS NULL\nORDER BY i.amount_cents DESC;",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the lying status literal",
          why: "The flag hunts status literals that lie about money: #28 is marked 'paid' with zero tender legs. Flagging 'open' instead would mark every row on this list — they are all unsettled — and the anomaly would drown in its own ledger.",
        },
        {
          answer: "'anomaly'",
          kind: "keyword",
          label: "the flag label",
          why: "'anomaly' is the label the dunning draft keys on. 'open' in this arm flags nothing — every row already reads open in status — and the paid-with-no-legs statement ships to reminders it can never settle.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements; the 6 without tender legs arrive carrying NULL payment payloads and WHERE p.id IS NULL keeps exactly them. INNER JOIN deletes the six rows the sweep exists to show — the anomaly included.",
        },
      ],
      distractors: ["'open'", "'void'", "INNER", "RIGHT", "ASC"],
      walkthrough:
        "An anti-join with a flag on top. The LEFT JOIN preserves all 28 statements; the 22 with tender legs match, and the 6 without arrive carrying NULL payment payloads — WHERE p.id IS NULL keeps exactly those 6, ordered biggest exposure first: 493,700 / 356,200 / 279,400 / 175,600 / 129,500 / 87,300, footing to 1,521,700 cents (15,217.00). The CASE reads the status column against the literal that lies: five rows flag 'open', and #28 — status 'paid', zero tender legs — flags 'anomaly', the one row the dunning draft leads with. The mirror anomaly stays invisible here: the void-but-settled statement (#11, 925.00) has a payment row, so the anti-join never sees it — the anomaly walk runs both queries, not one. INNER JOIN deletes the six rows the sweep exists to show; RIGHT JOIN keeps payments instead of statements; 'void' or 'open' in either flag slot rebrands the anomaly into the noise; ASC opens the ledger on its smallest exposure.",
    },
    {
      id: "cs-dunkin-6",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The store-program spend stack",
      brief:
        "Branch P&L memo, Dunkin'-flavored on the storefront db: the franchisee council reads store-program spend — Tools and Travel, the two running-cost categories outside Rent and Ads — as a stack with a labelled TOTAL row underneath, one query, no spreadsheet math. Probed on the storefront db: 36 expense entries totaling 2,541,600 cents (25,416.00); Tools runs 5 entries for 152,500 cents (1,525.00) and Travel 3 for 252,100 (2,521.00), so the program pair carries 404,600 of the ledger (15.9%) while the fixed pair (Rent 1,680,000 / Ads 457,000) owns the rest. Finance stores expenses as integer cents, and the TOTAL branch must scan the unfiltered ledger.",
      ask: "Return entries and cents per program category, plus a labelled TOTAL row for the whole expense ledger.",
      template:
        "SELECT category, COUNT(*) AS entries, SUM(amount_cents) AS cents\nFROM expenses\nWHERE category {1} ('Tools', 'Travel')\nGROUP BY category\n{2}\nSELECT 'TOTAL', {3}, SUM(amount_cents)\nFROM expenses\nORDER BY cents DESC;",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the program-category filter",
          why: "IN ('Tools','Travel') keeps exactly the two program categories — 8 of the 36 entries. NOT IN would flip the report to Rent and Ads, the fixed costs the memo explicitly set aside.",
        },
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the stacker",
          why: "UNION ALL concatenates the TOTAL branch onto the category rows with no dedupe pass — the honest stack for a report where every row belongs. EXCEPT would return only the detail rows and quietly delete the TOTAL the ask requires.",
        },
        {
          answer: "36",
          kind: "number",
          label: "the all-in entry count",
          why: "The TOTAL row counts the whole ledger — 36 entries, not the filtered 8 — because its cents column (2,541,600) is the unfiltered grand total the program pair is judged against. 8 in this slot would report the program's own entry count as the ledger's.",
        },
      ],
      distractors: ["NOT IN", "8", "EXCEPT", "INTERSECT"],
      walkthrough:
        "Two branches, one stack. The detail branch filters to the program pair with IN and folds 8 entries into two rows — Tools 5 / 152,500 and Travel 3 / 252,100. The TOTAL branch re-scans the unfiltered expenses table — 36 entries, 2,541,600 cents — so the report shows the program pair against the whole ledger (404,600 = 15.9% of spend) without a second query. UNION ALL is the join between grains; the outer ORDER BY cents DESC floats the TOTAL row to the top. The reconcile checks run in the read: 5 + 3 = 8 program entries, and 152,500 + 252,100 = 404,600, which the fixed pair's 2,137,000 completes to the ledger total. NOT IN serves the fixed costs instead of the program; 8 in the TOTAL slot shrinks the ledger to the program's own footprint; EXCEPT returns only the detail rows and deletes the TOTAL; INTERSECT finds no overlap at all and empties the stack. Every distractor breaks a different promise of the memo.",
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
    { slug: "immediate-food-delivery-ii", why: "The promise-window share at chain scale: orders delivered immediately versus queued — the pickup-SLA conditional rate the window board's pickup share generalizes." },
    { slug: "unique-orders-and-customers-per-month", why: "The monthly two-grain walk: transactions AND guests per month on one spine — the census discipline the market sheet and the LAG walk both build on." },
    { slug: "daily-leads-and-partners", why: "Two-grain daily fold: load and coverage side by side — the transactions-versus-guests habit drilled at day grain, where the drive-thru board lives." },
    { slug: "number-of-rich-customers", why: "Threshold census: guests above a spend line. The franchisee council's 'who carries the book' list — a WHERE over a folded total with the population stated." },
    { slug: "product-sales-analysis-ii", why: "The line fold per SKU: items grouped by product — the beverage-attach baseline every menu-analytics read starts from." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest pull per SKU: argmax over the folded grain — the freshness read that decides what stays on the morning prep sheet, tie-breaker and all." },
    { slug: "top-earners", why: "Leaderboard cut: top-N by a folded measure — the run-club banner's underlying shape, with the tie policy named before the LIMIT lands." },
    { slug: "department-top-three-salaries", why: "Per-group top-N with a join-back: the top-three SKUs per category read. Composition under a business rule — the late-round escalation of the leaderboard topics." },
    { slug: "active-users", why: "Consecutive-day windows: the streak metric the loyalty app is judged by, gaps and all — straight from the run-streaks topic." },
    { slug: "second-day-confirmation", why: "Day-2 return: who came back the day after their first visit — the habit-formation read DD Perks reporting opens with." },
    { slug: "biggest-window-between-events", why: "Longest gap between visits: the dormant-guest detector — window arithmetic over ordered timestamps, the save-campaign trigger." },
    { slug: "calculate-special-bonus", why: "CASE banding with a NULL-safe twist: the bonus fold maps one-to-one onto the value ladder's banded flags." },
    { slug: "books-with-null-ratings", why: "Reporting the NULLs rather than dropping them: the awaiting-pickup population has no stamp, and this audit keeps unmeasured rows honest." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Windowed census with the empty-day problem: counts that must survive periods with no activity — the board's zero-fill discipline." },
    { slug: "customer-order-frequency", why: "Visit cadence per guest: frequency counts over a window — the loyalty-desk fold that splits weekly regulars from lapsers." },
    { slug: "sessionize-events", why: "Bursts into sessions: window-into-session logic over ordered timestamps — the daypart-free way to carve the visit stream the date-only clock can't." },
  ],
};
