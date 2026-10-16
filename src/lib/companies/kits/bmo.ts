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
    "Preparation strategy: the pools file carries no BMO section — 0 tagged sql rows — so every topic slug and all sixteen problems here are **theme-curated** to this kit's known screen shapes: corridor fate censuses, two-grain corridor folds, concentration ladders, aging buckets, coverage anti-joins and the cents-safe ledger spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:corridor book census} the corridor desk opens every Monday with, the other rebuilds the {emerald:dual-rail settlement register} finance control ships at every post-integration close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every cent fold divide by 100.0 exactly once.",
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
      slugs: ["funnel-step-conversion", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Flows and clients are different grains of the same join, and every census here reports both: the Canadian home book runs 45 flows from 8 clients while the cross-border corridor runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining clients to flows",
      why: "Clients carry corridor and created_at; flows inherit them through joins, and the join type decides who survives. A flow without a client row is corruption; a client without flows is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Concentration ladders",
      why: "Client concentration is rank-window reporting where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5 flows, then a four-way tie at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer relationships, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Exposure banding with CASE",
      why: "Client tiers and watch buckets are CASE-classified — mid-market, corporate, specialty — with fixed edges the credit memo publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the exposure report, and a reordered WHEN quietly re-bands the book.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Aging & delinquency buckets",
      why: "The commercial book ages in buckets — current, 1-30, 31-60, 90-plus — and every workout conversation starts from a bucketed fold. Bucket edges are CASE arms or interval joins, and the bucket a flow lands in is only as honest as the boundary math.",
      slugs: ["calculate-orders-within-each-interval", "spend-histogram", "transaction-velocity"],
    },
    {
      name: "Coverage anti-joins",
      why: "Settled is not billed — the chase list is a LEFT-join anti-join where the interesting rows are statements with no settlement leg at all (6 worth 15,217 here). Anti-join membership is evidence, and a NULL poisoning a NOT IN is the classic way an honest watchlist silently empties.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "find-churn-risk-customers"],
    },
    {
      name: "Ledger discipline & trial balance",
      why: "Every close ships with a proof: debits against credits, delta zero — 181,080 against 181,080 across 80 entries on this db. Rollforwards, reconciliation folds and gap detection are the queries that make the books provable, and the integration makes them non-optional.",
      slugs: ["gl-reconciliation", "balance-rollforward", "journal-gap-detection"],
    },
    {
      name: "Value-date clocks & LAG deltas",
      why: "The 14-month flow spine (2024-01 to 2025-02) is the corridor call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["average-time-of-process-per-machine", "biggest-window-between-events", "second-day-confirmation"],
    },
    {
      name: "Cents-safe statement folds",
      why: "Billed is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the corridor world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from a status column that lies.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
