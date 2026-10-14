// Remitly — Wave-9 (Task 98), fintech domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Consumer-remittances SQL: the storefront db read as a corridor sandbox — customers are
// senders (region = send-market bucket), orders are transfers (delivered = delivered-to-recipient,
// shipped = in flight with shipped_at as the payout-dispatch stamp, pending = compliance review /
// awaiting funding, cancelled = sender-abandoned or compliance-rejected), order_items are transfer
// line records (principal, fee and FX-margin components: quantity = units, unit_price = unit
// amount), products = speed-tier x delivery-method SKUs (Economy/Express x bank deposit / cash
// pickup / mobile wallet), suppliers = payout partners per corridor, invoices = corridor settlement
// statements, payments = funding rails (card vs bank debit; INTEGER cents, /100.0), expenses =
// compliance + network opex, ledger_entries = GL. Pool provenance: company-pools.md carries NO
// Remitly section — fewer than 2 tagged rows and none SQL-graded — so all 10 topic slug sets and
// all 16 problems are theme-curated from the pools file's theme menu and say so. Case briefs quote
// probed figures from scripts/company-facts.md; every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-9 registry wiring agent: wire COMPANY_META to id "remitly", domainId
// "fintech", name "Remitly", tagline "Consumer remittances: corridor economics at speed-tier grain",
// accent "text-blue-400" (unused by all 17 fintech siblings).

import type { CompanyKit } from "../types";

export const remitlyKit: CompanyKit = {
  id: "remitly",
  domainId: "fintech",
  name: "Remitly",
  tagline: "Consumer remittances: corridor economics at speed-tier grain",
  accent: "text-blue-400",

  brief: [
    "**Remitly** is the consumer remittance funnel — the digital money-mover that carries paychecks out of send markets like the US, UK and Western Europe into corridor countries such as the Philippines, Mexico and India, landing as bank deposit, cash pickup or mobile-wallet credit. The product is a two-axis promise: an {sky:Economy vs Express} speed tier and a delivery method, priced as a fixed fee plus an FX margin — so every analytics question is corridor-shaped: send market in, payout country out, delivery mix in between. This kit maps the storefront db onto that world: the 16 customers rows are senders, the 103 orders are transfers worth **34,833.28**, and the 251 order_items rows are transfer line records (principal, fee, FX-margin components). The status map is fixed: delivered = {emerald:delivered to recipient} (52, 50.5%), shipped = in flight (30, 29.1%) with `shipped_at` as the payout-dispatch stamp, pending = compliance hold (14), cancelled = {rose:sender-abandoned or rejected} (7, 6.8%).",
    "The data org splits into corridor growth, risk and compliance analytics, and a payments-ops pod, all reading the same transfer spine at different grains. A transfer books at created_at, and `shipped_at` is stamped when the payout actually dispatches — **82 of 103 transfers** carry the stamp, averaging **2.98 days** booking-to-dispatch with a 2–4 day spread, while the 14 compliance-hold rows have none (a population definition, not a cleanup job). Money sits one layer down: settlement statements and funding legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book sits with senders whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost sender moves a corridor.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain corridor census** — EU runs 45 transfers from just 8 senders (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a compliance hold count in your delivery base?'*), then into the sender ladder where four senders sit tied at 4 transfers and rank semantics become a business decision. Corridor risk reads close the loop: cancellation share runs {rose:APAC 8.1%}, EU 6.7%, US 5.3% — small numbers that decide where review capacity goes. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Remitly section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: corridor fate censuses, two-grain counts, payout ladders, CASE-banded tiers and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:corridor fate census} the corridor review opens with, the other rebuilds the {sky:settlement coverage census} payments ops runs at every close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the corridor funnel refresh. The analyst opens the transfer dashboard before standup: did overnight transfers land, did any corridor's payout dispatch stall, does the one-pass fate census reconcile — 52 delivered + 30 in flight + 14 holds + 7 cancelled = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If dispatch latency drifts off the **2.98-day** norm, the payout-partner queue gets pulled before the corridor review ships — and the 14 {rose:compliance holds} get aged, because a hold that sits is a sender who tells ten friends.",
    "**12:30 —** Midday is the corridor deep-dive. Growth wants the sender ladder with the four-way tie at 4 transfers handled honestly — shared rungs, named policy; risk wants the cancellation map re-cut ({rose:APAC 8.1%} of placed transfers cancelled); payments ops wants the {amber:delivery-method mix} beside payout-partner revenue, where the bench tops out at **11,130.25** from the strongest partner — 32% of all flow. Each ask is a join, a conditional aggregate and one judgment call about statuses — and the analyst writes the query twice: *once to answer, once with the definition spelled out so the number survives the corridor-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The settlement anti-join refreshes first — **6 never-funded statements worth 15,217** — before dunning goes out; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled), and the anomaly list gets walked line by line: a void statement that still shows a funding leg (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00). The funding-rail mix goes out with it — {sky:card} 16 legs / 37,364 versus wire 11 / 32,248 — and the day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero, or the close ships with an incident attached.",
  ],

  metrics: [
    { name: "Transfer book", what: "Total funded transfers and value: 103 transfers worth 34,833.28, averaging 338.19 against a 25.47 to 1,088.44 spread. The spread IS the speed-tier story — one 1,088.44 transfer outweighs the smallest 42 combined." },
    { name: "Delivered-to-recipient rate", what: "Delivered ÷ ALL transfers booked: 52 of 103 (50.5%). The headline promise metric, and the denominator — compliance holds and in-flight included — is the whole interview." },
    { name: "In-flight share", what: "Transfers dispatched to a payout partner but not yet confirmed delivered: 30 of 103 (29.1%), stamped by shipped_at. The corridor's pulse between 'took your money' and 'money in hand'." },
    { name: "Compliance hold rate", what: "Transfers parked in review or awaiting funding: 14 of 103 (13.6%). A hold is 'not yet', never a silent zero, and its aging decides review staffing." },
    { name: "Dispatch latency", what: "Booking to payout dispatch (created_at → shipped_at) over the 82 stamped transfers only: 2.98-day average, 2–4 day spread. The Economy-versus-Express promise, measured." },
    { name: "Corridor cancellation share", what: "Cancelled ÷ placed per send market: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. Small numbers that route review capacity and fee changes — and a conditional-count ratio with the denominator built in." },
    { name: "Sender concentration", what: "Share of the book from senders spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs corridor growth and sizes the loyalty program." },
    { name: "Settlement coverage", what: "Statements versus funding legs: 21 exact (65,612 settled against 65,612 billed), 1 partial (4,000 of 6,148), 6 never-funded worth 15,217. The AR anti-join payments ops refreshes every close." },
  ],

  topics: [
    {
      name: "Funnel counts & transfer fates",
      why: "Every Remitly screen opens with the funnel: transfers booked, dispatched (shipped_at stamped), delivered to the recipient. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight transfer 'delivered' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Transfers and senders are different grains of the same join, and every census here reports both: EU runs 45 transfers from 8 senders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "students-and-examinations"],
    },
    {
      name: "Sender-to-transfer join hygiene",
      why: "Senders carry region and created_at; transfers inherit them through joins, and the join type decides who survives. A transfer without a sender is corruption; a sender without transfers is a signup leak — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "employee-bonus"],
    },
    {
      name: "Payout-partner economics",
      why: "Partner-level reporting attaches every transfer line to its payout partner through the tier catalog — joins across products and order_items where the money is quantity × unit_price folded per partner. The bench read is the interview classic: revenue, listing count and rating side by side, with the strongest partner at 11,130.25.",
      slugs: ["sales-analysis-i", "top-travellers", "average-selling-price"],
    },
    {
      name: "Sender value ladders",
      why: "Concentration is ladder reporting: the top of the book runs 7,262.35, 6,640.56, 4,574.23, 3,644.56, 2,667.93 across senders with 24, 17, 14, 13 and 5 transfers — then four senders tie at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer senders, not syntax.",
      slugs: ["rank-scores", "department-top-three-salaries", "find-the-team-size"],
    },
    {
      name: "Speed-tier banding with CASE",
      why: "Delivery tiers are CASE-classified — fee bands, speed promises, delivery methods — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the corridor P&L, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "capital-gain-loss"],
    },
    {
      name: "Funding-rail set ops",
      why: "Month-close stitches populations: card-funded beside wire-funded, settled statements beside never-funded, this quarter beside last. UNION ALL's no-dedupe cheapness and column-position discipline make the stack type-safe — a rail report that silently dedupes reads as two different treasuries.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "team-scores-in-football-tournament"],
    },
    {
      name: "Compliance subqueries & gates",
      why: "Screens escalate into staging: fold per-sender transfer counts, then judge them against a computed platform mean (6.44 here — exactly four senders clear it). IN, EXISTS, scalar and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "game-play-analysis-iv", "second-highest-salary"],
    },
    {
      name: "Corridor calendars & dispatch clocks",
      why: "The 14-month transfer spine (2024-01 to 2025-02) is the growth call's home turf: per-month folds, half-open windows that do not drop the last night, and dispatch latency averaged only over the stamped 82. Date discipline is corridor discipline — '%m' alone merges Januaries and the trend becomes fiction.",
      slugs: ["the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Cents-safe settlement reads",
      why: "Delivered is not settled — the finance tables (28 statements, 27 funding legs, INTEGER cents) are where the corridor world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one LEFT JOIN and one CASE away.",
      slugs: ["bank-account-summary-ii", "confirmation-rate", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "remitly-t1",
      q: "Your corridor report joins senders to transfers. When do you INNER and when do you LEFT — and what silently breaks if you filter a transfer column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the corridor read implies. A payout report joins transfers to senders: a transfer with no sender row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A growth report must be LEFT from senders: senders who signed up but never funded a transfer ARE the answer, arriving with NULL transfer columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload sender row — the LEFT quietly became an INNER and the signup-leak cohort vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-funding senders — all 16 senders appear in the transfer table somewhere — and proving that zero is itself the analyst's job, not an assumption to skip.",
      tag: "joins",
    },
    {
      id: "remitly-t2",
      q: "Four senders tie at 4 transfers on the sender-value ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The ladder on this db runs 24, 17, 14, 13, 5 transfers per sender, then FOUR senders tied at 4 — and the rank trio is a business decision about shared rungs and gaps, not syntax. RANK gives tied counts the same rung and then skips: the four-way tie consumes ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, a silent judgment call about which sender's corridor manager gets credit for the relationship. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer senders (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment where the next analyst finds it.",
      tag: "windows",
    },
    {
      id: "remitly-t3",
      q: "The census shows 103 transfers and 16 senders; EU shows 45 transfers and 8 senders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts transfer rows after the join — one row per transfer, so a sender with 24 transfers contributes 24. COUNT(DISTINCT customer_id) folds those rows back to senders — EU's 45 transfers collapse to 8 logos. Neither is wrong: transfers measure corridor load and speed-tier momentum, senders measure installed base and coverage. The ratio — 5.6 transfers per sender in EU versus 9.5 in the US on this db — is the intensity signal that decides whether a corridor is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for the fee and principal line records and COUNT(*) silently counts lines, not transfers — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "remitly-t4",
      q: "shipped_at is NULL until a payout dispatches. What is your policy for the dispatch-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched transfers have a latency, so the report measures booking-to-dispatch (created_at → shipped_at) for the 82 of 103 transfers that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL transfers returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the dispatched subset; the gap between it and COUNT(*) is exactly the 14 compliance holds plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day payouts for transfers still sitting in review. A report whose WHERE clause does definitional work without saying so is exactly what a Remitly reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "remitly-t5",
      q: "The corridor review wants delivered value per send market for corridors carrying at least ten transfers. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, hold and cancelled rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The corridor floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY c.region; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a corridor line and an error, and between a threshold applied to transfers versus to dollars. On this db a ten-transfer floor keeps EU 45, APAC 37 and US 19 and drops LATAM's 2 — a one-row omission the deck must explain, not hide. The strong answer places every filter by asking: is this a fact about one transfer, or about a corridor?",
      tag: "pipeline",
    },
    {
      id: "remitly-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 transfers across 16 senders always produce a mean (6.44 transfers per sender — exactly four senders clear it). On filtered staging tables — one corridor, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each transfer to ITS sender's average ticket) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "remitly-t7",
      q: "The corridor trend buckets transfers by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the corridor trend becomes fiction. The window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's transfers, and month-end is exactly when diaspora paydays land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The story the spine tells here: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November.",
      tag: "dates",
    },
    {
      id: "remitly-t8",
      q: "Payments ops says a settlement statement is 'paid' but the funding-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: settlement statements LEFT JOIN funding legs, keep the rows with no leg — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero funding legs: a status that lies, which is why the legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a funding leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Close culture: coverage must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-funded, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "remitly-mcq-1",
      prompt: "A transfer row's status reads 'shipped'. In this kit's Remitly stage map, what happened?",
      choices: ["In flight — dispatched to the payout partner, not yet delivered to the recipient", "Delivered — the money reached the recipient", "Compliance hold — awaiting review or funding", "Cancelled — sender abandoned or compliance-rejected"],
      answer: 0,
      why: "The stage map is fixed: shipped = in flight (30 of 103 transfers, 29.1%), with shipped_at as the payout-dispatch stamp. Only 'delivered' means the money is in the recipient's hands.",
      notes: [
        { choice: 1, why: "Delivered is 52 transfers (50.5%). Calling in-flight transfers delivered overstates the delivery rate before a single payout confirms — the exact inflation the funnel exists to catch." },
        { choice: 2, why: "Compliance hold is 'pending' — 14 transfers with no dispatch stamp yet. A hold is 'not yet', not a failure, and it stays in every denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-2",
      prompt: "Delivered-to-recipient rate: the db holds 52 delivered, 30 in flight, 14 compliance holds and 7 cancelled of 103 funded transfers. Which denominator does the house number use?",
      choices: ["Delivered + in flight only (52/82 = 63.4%)", "All funded transfers (52/103 = 50.5%)", "Non-cancelled only (52/96 = 54.2%)", "Distinct senders (52/16)"],
      answer: 1,
      why: "The house definition: delivered ÷ ALL transfers booked — in-flight and holds stay in the denominator because 'not yet delivered' is exactly what the metric measures. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping holds and in-flight inflates the rate to 63.4% by deleting the population the funnel exists to watch — the rows still inside the promise window." },
        { choice: 2, why: "Excluding cancelled but keeping holds is a policy choice that must be named; the published number uses 103, and silent re-basing is how corridor reviews start lying." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-3",
      prompt: "The funding-rail fold reads card 16 legs / 37,364 and wire 11 legs / 32,248. What does COUNT(*) count in that fold?",
      choices: ["Dollars funded", "Funding legs — one row per payment", "Distinct senders", "Settlement statements"],
      answer: 1,
      why: "Payments is the funding-leg book — one row per leg, 27 in total. The money is a separate column: SUM(amount_cents) / 100.0. COUNT counts rows; SUM moves money.",
      notes: [
        { choice: 0, why: "SUM(amount_cents)/100.0 reads dollars — COUNT(*) counts rows. Mixing the two is the classic grain error that turns a 27-leg fold into a nonsense currency." },
        { choice: 2, why: "Senders live in customers; the payments table carries no sender grain. You would need the statement-to-transfer chain to get there." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — the APAC corridor's share must print 8.1. Why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled transfers only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — 3 cancelled of 37 placed truncates toward 0 and every corridor reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 8.1 and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the corridor risk map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-5",
      prompt: "The sender ladder runs 24, 17, 14, 13, 5 transfers, then FOUR senders tied at 4. Under RANK, what rank do the two 3-transfer senders carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-transfer senders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The ladder's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-6",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The compliance holds double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 transfers.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-7",
      prompt: "Keep only corridors carrying at least 10 transfers. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY region HAVING COUNT(*) >= 10", "WHERE transfers >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A transfer-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps EU 45, APAC 37 and US 19 — and drops LATAM's 2, an omission the deck must own.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'transfers' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-8",
      prompt: "A staging-table compliance list uses sender_id NOT IN (SELECT customer_id FROM transfers WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the compliance list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every transfer carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty compliance lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "remitly-mcq-9",
      prompt: "A treasury stack puts card-funded legs under wire-funded legs in one layout, built with UNION. A reviewer says one corridor's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same corridor, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same corridor, same counts, no rail or branch label — collapse into one, and the treasury loses a corridor with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "remitly-mcq-10",
      prompt: "A treasury dashboard walks funded value leg by leg: SUM(amount_cents) OVER (ORDER BY paid_on). Two legs share a paid_on second, and the cumulative 'jumps two legs at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict leg-by-leg walk", "Rounding accumulated on the tied legs and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so legs tied on paid_on join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly leg by leg. On a month spine ties are rare; at funding-leg grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-remitly-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The corridor fate census",
      brief:
        "Remitly-flavored brief on the storefront db: Monday's corridor review opens with the one-pass fate census — every send market read once, with in-flight payouts, compliance holds, delivered-to-recipient counts and the cancellation share, where the share's denominator is ALL transfers placed in that corridor, holds included. Probed facts: 103 transfers worth 34,833.28; the corridor grid reads EU 45 placed with 24 delivered / 12 in flight / 6 held, APAC 37 with 21 / 8 / 5, US 19 with 5 / 10 / 3, LATAM 2 with 2 / 0 / 0; cancellation shares land at APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The review reads biggest corridor first.",
      ask: "Return each send market with its transfer count, in-flight and compliance-hold counts, delivered count and cancellation share to 1 decimal, biggest corridor first.",
      template:
        "SELECT c.region AS send_market,\n       COUNT(*) AS transfers,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS in_flight,\n       COUNT(*) FILTER (WHERE o.status = 'pending') AS compliance_hold,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS delivered_to_recipient,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = {2}) / COUNT(*), {3}) AS cancel_share\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY transfers {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the delivered-to-recipient literal",
          why: "Delivered is the money-in-their-hands status — 52 transfers, reading EU 24 / APAC 21 / US 5 / LATAM 2. 'shipped' would re-key the column to dispatch (12 / 8 / 10 / 0) and the census stops being a delivery read; 'pending' turns it into the compliance queue.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the sender-abandoned literal",
          why: "The share's numerator is sender-abandoned or compliance-rejected transfers — 3 in EU, 3 in APAC, 1 in US, 0 in LATAM. 'delivered' would print a 100.0% share everywhere; 'shipped' prints 26.7 in EU and invents a crisis exactly where onboarding succeeded.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the cancel-share precision",
          noVerify: true,
          why: "The share reports to 1 decimal — 6.7 / 8.1 / 5.3 / 0 — matching the facts-file corridor table verbatim. A precision of 2 prints 6.67 / 8.11 / 5.26 and stops reconciling with every other deck that quotes 6.7.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-corridor-first direction",
          why: "The review reads biggest corridor on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the meeting on LATAM's 2 transfers — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "ASC", "SUM", "2"],
      walkthrough:
        "One scan, four corridors, every branch reconciling to COUNT(*). The join attaches each transfer to its sender's market, GROUP BY folds them, and the FILTER branches read in flight (EU 12, APAC 8, US 10, LATAM 0), compliance holds (6 / 5 / 3 / 0) and delivered-to-recipient (24 / 21 / 5 / 2) beside the transfer totals (45 / 37 / 19 / 2) — the three arms plus cancelled (3 / 3 / 1 / 0) leave nothing left over: 24+12+6+3 = 45 in EU, and the census reconciles to 103 by construction. The cancel share multiplies by 100.0 BEFORE the division so 3 of 45 prints 6.7, not a truncated 0. The distractors fail honestly: 'shipped' in the delivered slot collapses delivery onto dispatch and the review loses its headline; 'pending' turns the delivered column into the hold column; SUM and ASC are not status literals and error out; 2 in the precision slot reprints the share as 6.67 / 8.11 / 5.26, drifting off the facts-file cells; 2 in the ORDER BY slot is a syntax error, and ASC in it opens the meeting on LATAM. The two reads the census feeds: US runs only 5 delivered but 10 in flight — a corridor mid-promise — while LATAM's zero share is a 2-transfer base, not a safety record.",
    },
    {
      id: "cs-remitly-2",
      tier: "medium",
      topic: "q6",
      universe: "month-close",
      title: "The settlement coverage census",
      brief:
        "Remitly-flavored brief on the storefront db: at close, payments ops reconciles corridor settlement statements against the funding legs that clear them, and the coverage census must classify every statement — exact (legs sum to the statement), partial (some legs), or no settlement (none) — with the unfunded fallback printed as 0, never NULL. Probed facts: 28 statements; the census reads 21 exact worth 65,612 settled against 65,612 billed, 1 partial (4,000 of 6,148 settled on statement #25) and 6 never-funded worth 15,217 — including #28, marked paid with zero legs at 1,756.00, while the void-but-funded #11 at 925.00 sits inside the exact bucket by construction. The exposure reads biggest bucket first.",
      ask: "Return each coverage class with its statement count, billed total and settled total in dollars, biggest billed bucket first.",
      template:
        "WITH legs AS (\n  SELECT invoice_id,\n         SUM(amount_cents) AS settled_cents\n  FROM payments\n  GROUP BY invoice_id\n)\nSELECT CASE WHEN p.invoice_id {1} THEN 'no settlement'\n            WHEN p.settled_cents = i.amount_cents THEN 'exact'\n            ELSE 'partial' END AS coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed,\n       ROUND(COALESCE(SUM(p.settled_cents), {2}) / 100.0, 2) AS settled\nFROM invoices i\n{3} legs p ON p.invoice_id = i.id\nGROUP BY coverage\nORDER BY {4};",
      slots: [
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the never-funded arm",
          why: "The LEFT JOIN's unmatched side carries a NULL invoice_id — exactly the 6 statements with no funding leg. IS NOT NULL flips the arms and rebrands the 22 funded statements as unfounded, filing the dunning list backwards.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the unfunded fallback",
          why: "The no-settlement bucket must print 0 settled, not NULL — COALESCE(SUM(...), 0) keeps the deck arithmetic-safe, and 0 is the facts-file cell. NULL would propagate into every downstream total and the exposure reads blank where it should read 15,217 billed against 0.",
        },
        {
          answer: "LEFT JOIN",
          kind: "keyword",
          label: "the keep-every-statement join",
          why: "Every statement must survive the fold — unfunded statements ARE the answer. INNER JOIN drops the 6 never-funded rows (15,217 of exposure) and the census under-reports exactly the bucket ops is chasing.",
        },
        {
          answer: "billed DESC",
          kind: "keyword",
          label: "biggest-exposure-first order",
          why: "The board reads biggest billed bucket first: exact 65,612, no settlement 15,217, partial 6,148. statements DESC happens to agree today (21/6/1) — but the exposure, not the count, is the sorting claim; settled DESC slots partial (4,000) above none (0) and tells a different exposure story.",
        },
      ],
      distractors: ["INNER JOIN", "IS NOT NULL", "billed ASC", "settled DESC", "statements ASC"],
      walkthrough:
        "Two stages: fold the legs, then classify the statements. The CTE folds 27 funding legs into per-statement cent sums; the outer LEFT JOIN keeps all 28 statements, and the CASE reads the census: settled_cents equal to the billed cents prints exact (21 statements, 65,612 = 65,612 — the void-but-funded #11 lands here by construction), a NULL invoice_id from the unmatched side prints no settlement (6 statements, 15,217 billed, 0 settled — the COALESCE prints the 0 the deck requires, and #28's paid-status lie lives in this bucket), everything else is partial (1 statement, 6,148 billed, 4,000 settled). The exact/partial comparison runs on integer cent sums, so no floating-point drift can reclassify a statement. The distractors fail honestly: INNER JOIN deletes the 6 never-funded statements and the census loses its dunning list; IS NOT NULL rebrands the 22 funded statements as unfunded and buries the real exposure; billed ASC, settled DESC and statements ASC each reorder the board — settled DESC slots partial (4,000) above none (0), which reads as if partial money outranks nothing.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "The sender funnel is signup → KYC pass → first funded transfer → delivered payout. This problem drills the conditional-count shape the funnel report runs every Monday against the 103-transfer book." },
    { slug: "number-of-rich-customers", why: "High-value senders above a lifetime-transfer floor drive the 63.5% concentration read; this problem is the floor-and-count shape that flags them." },
    { slug: "classes-more-than-5-students", why: "Corridor hygiene: which send markets carry at least N transfers? A HAVING gate over the corridor fold — the same shape that drops LATAM's 2 transfers from a ten-plus read." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-sender read: which sender funds the most transfers. The top of this db's ladder is a 24-transfer sender — exactly this argmax at db scale." },
    { slug: "customers-who-never-order", why: "Signup-without-funding is the leak growth and compliance both chase; this is the anti-join shape, and on this db the honest answer is a proven zero — all 16 senders funded at least once." },
    { slug: "sellers-with-no-sales", why: "Payout partners with no dispatched transfers in a window — the partner-coverage anti-join the payout-ops pod runs before rerouting a corridor." },
    { slug: "active-businesses", why: "The one-pass fate census: delivered, in flight, hold, cancelled in a single scan that reconciles to COUNT(*) — the exact shape of this kit's first case study." },
    { slug: "monthly-transactions-i", why: "Per-month transfer counts against a threshold — the corridor-month fold that anchors the 14-month spine (2024-01 to 2025-02) in every growth review." },
    { slug: "immediate-food-delivery-ii", why: "Speed-tier promise: transfers dispatched within the promised window versus late. A promptness share over a timestamp comparison — the dispatch-latency read that averages 2.98 days here." },
    { slug: "find-followers-count", why: "Per-corridor sender counts at their simplest — the coverage column that sits beside the load column in every two-grain census." },
    { slug: "group-sold-products-by-the-date", why: "Per-day transfer folds with the tier list folded into one cell — GROUP_CONCAT over the day's dispatches for the payout-ops handoff note." },
    { slug: "movie-rating", why: "A UNION stack: the newest sender beside the most-active corridor — two different folds stitched into one ops digest, column positions aligned." },
    { slug: "find-churn-risk-customers", why: "Senders dormant past the resend window — the anti-join plus date-math shape that feeds Remitly's win-back nudges before a corridor habit breaks." },
    { slug: "npv-queries", why: "Settlement statements joined to their funding schedule — a two-table fold over NULL-unsafe columns, the exact shape of the coverage census." },
    { slug: "fix-names-in-a-table", why: "Sender-name hygiene before KYC matching: 'acme corp' versus 'Acme Corp' splits one sender into two and breaks every per-sender fold downstream." },
    { slug: "customer-order-frequency", why: "Senders hitting the N-transfers-per-month loyalty gate — a conditional HAVING fold over the monthly spine, the rewards-eligibility read." },
  ],
};
