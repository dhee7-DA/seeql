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
    "Preparation strategy: the pools file carries no Remitly section — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: corridor fate censuses, two-grain counts, payout ladders, CASE-banded tiers and the cents-safe settlement spine. Do the topics in order, then run the six case studies on the live storefront db: they rebuild the reads this kit's stakeholders actually ship — the {emerald:corridor fate census} the corridor review opens with, the {sky:settlement coverage census} payments ops runs at every close, the sender-value ladder with its tie policy named, the ticket-band census pricing quotes, the {violet:corridor month pulse} growth walks trough-jump-and-fade from, and the payout-partner bench that closes the money half of the day. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Remitly analytics teams rehearse most — one per workflow, from the Monday funnel to the close-night settlement ledger — and the right way to use them is the loop, not the lap: run each on the live storefront database, then re-run it a week later from a blank editor, *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the corridor review's 'does a compliance hold count in your base?' follow-up tests. Thirty MCQs, twenty-four theory prompts, thirty-two problems, six cases — every entry grounded in the same 103-transfer spine, so the numbers you memorize here are the numbers the screens quote.",
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
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "user-activity-for-the-past-30-days-ii", "funnel-step-conversion", "uber-first-transaction"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Transfers and senders are different grains of the same join, and every census here reports both: EU runs 45 transfers from 8 senders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "students-and-examinations", "maximum-transaction-each-day"],
    },
    {
      name: "Sender-to-transfer join hygiene",
      why: "Senders carry region and created_at; transfers inherit them through joins, and the join type decides who survives. A transfer without a sender is corruption; a sender without transfers is a signup leak — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "employee-bonus", "duplicate-charge-pairs"],
    },
    {
      name: "Payout-partner economics",
      why: "Partner-level reporting attaches every transfer line to its payout partner through the tier catalog — joins across products and order_items where the money is quantity × unit_price folded per partner. The bench read is the interview classic: revenue, listing count and rating side by side, with the strongest partner at 11,130.25.",
      slugs: ["sales-analysis-i", "top-travellers", "average-selling-price", "fx-exposure-report"],
    },
    {
      name: "Sender value ladders",
      why: "Concentration is ladder reporting: the top of the book runs 7,262.35, 6,640.56, 4,574.23, 3,644.56, 2,667.93 across senders with 24, 17, 14, 13 and 5 transfers — then four senders tie at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer senders, not syntax.",
      slugs: ["rank-scores", "department-top-three-salaries", "find-the-team-size", "transaction-velocity"],
    },
    {
      name: "Speed-tier banding with CASE",
      why: "Delivery tiers are CASE-classified — fee bands, speed promises, delivery methods — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the corridor P&L, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "capital-gain-loss", "chargeback-rate-ranking"],
    },
    {
      name: "Funding-rail set ops",
      why: "Month-close stitches populations: card-funded beside wire-funded, settled statements beside never-funded, this quarter beside last. UNION ALL's no-dedupe cheapness and column-position discipline make the stack type-safe — a rail report that silently dedupes reads as two different treasuries.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "team-scores-in-football-tournament", "balance-rollforward"],
    },
    {
      name: "Compliance subqueries & gates",
      why: "Screens escalate into staging: fold per-sender transfer counts, then judge them against a computed platform mean (6.44 here — exactly four senders clear it). IN, EXISTS, scalar and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "game-play-analysis-iv", "second-highest-salary", "structuring-detection", "suspicious-bank-account-transactions"],
    },
    {
      name: "Corridor calendars & dispatch clocks",
      why: "The 14-month transfer spine (2024-01 to 2025-02) is the growth call's home turf: per-month folds, half-open windows that do not drop the last night, and dispatch latency averaged only over the stamped 82. Date discipline is corridor discipline — '%m' alone merges Januaries and the trend becomes fiction.",
      slugs: ["the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "list-the-products-ordered-in-a-period", "second-day-confirmation", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Cents-safe settlement reads",
      why: "Delivered is not settled — the finance tables (28 statements, 27 funding legs, INTEGER cents) are where the corridor world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one LEFT JOIN and one CASE away.",
      slugs: ["bank-account-summary-ii", "confirmation-rate", "products-worth-over-invoices", "ar-aging-schedule", "gl-reconciliation", "prepayment-detection", "bank-account-summary"],
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
    {
      id: "remitly-t9",
      q: "UNION versus UNION ALL on the settlement stack — when is the dedupe pass correct business logic, and when is it a silent bug?",
      a: "UNION ALL is a raw concatenation — cheap, order-preserving, and the honest default when the branches are logically disjoint: card legs stacked on wire legs, funded statements on never-funded, this quarter beside last. UNION adds a distinct pass over the combined set, and that pass is a business decision: correct when combining overlapping sources where a duplicated row would double-count, and a silent bug when duplicates are the signal — a funding leg ingested twice that vanishes into the dedupe is an audit finding, not a convenience. The remitly-mcq-9 failure mode lives here: two branches that emit byte-identical rows collapse into one and a corridor disappears with no error anywhere. Column discipline holds for both: matching counts and positions, names from the first branch. The opinionated version: default to UNION ALL and reach for UNION only when you can say out loud which duplicated rows you are paying to collapse.",
      tag: "set-ops",
    },
    {
      id: "remitly-t10",
      q: "When do you stage a WITH (CTE) instead of nesting a subquery — and what does a well-named CTE buy a corridor team?",
      a: "Three concrete buys. Readability: a chain of named steps — monthly, funded_statements, coverage_classes — reads like the corridor process instead of a Russian-doll subquery, and each CTE is a natural checkpoint to SELECT from while debugging. Reuse: one CTE can feed several later references in the same statement, so the funding-leg fold is written once, not three times. Correctness under review: naming a CTE never_funded forces you to state the definition (LEFT JOIN payments, keep the NULL side) where the reviewer can see it — and Remitly's close culture is exactly definitions that survive the corridor-review argument. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step. The settlement coverage census in this kit is the shape: fold the legs in a CTE, classify the statements outside it.",
      tag: "ctes",
    },
    {
      id: "remitly-t11",
      q: "Speed-tier and fee-band reports CASE-classify every transfer. What makes a CASE expression trustworthy, and what breaks one quietly?",
      a: "Three properties. Exhaustive arms: the ELSE catches what the WHENs miss — a fee band with no ELSE silently drops transfers from the P&L fold, and a NULL ticket falls through every >= comparison to the ELSE, which is why band labels say where NULL landed. Ordered arms: WHEN clauses evaluate top-down, so >= 1000 must precede >= 500 — a reordered WHEN quietly re-bands the book and every downstream total drifts. Fixed edges: the pricing page publishes the thresholds, so the CASE literals are contract, not style. The classic production bug is a banding CASE written against REAL totals where an odd-cent ticket lands exactly on an edge and two analysts disagree about which band it belongs to — the fix is documenting the edge convention (inclusive lower bound) next to the query. The ticket-band census in this kit prints the integer floors so the arms are auditable in the output itself.",
      tag: "case",
    },
    {
      id: "remitly-t12",
      q: "KYC matching keeps failing on sender names. Walk me through the string hygiene you apply before any per-sender fold.",
      a: "Names arrive dirty, and dirty names split one sender into two — 'acme corp' and 'Acme Corp' fold separately and the concentration read undercounts exactly the senders it exists to watch. The hygiene pass: TRIM whitespace first (trailing spaces defeat equality and group separately), then a casing convention — UPPER for comparison keys, and only display-case for the report column — then LENGTH sanity checks so '  ' does not pass as a name. The discipline that matters: normalize in a staging step or a CTE, and join or group on the NORMALIZED key, never on the raw column — otherwise every fix is per-report and drifts. And keep the raw column: compliance sometimes needs the name exactly as the sender typed it, so the hygiene step adds a clean column rather than overwriting the audit trail. On this db the fix-names shape is the warm-up; in production it is the difference between 16 senders and 19 phantom ones.",
      tag: "strings",
    },
    {
      id: "remitly-t13",
      q: "Why does Remitly's finance spine store money as INTEGER cents — and what does that rule demand from every query you write against it?",
      a: "Floats cannot represent most decimal cents exactly — 0.1 and 0.01 have binary approximations, and a settlement ledger that adds thousands of legs accumulates drift nobody can reconcile. INTEGER cents are exact: 92550 cents is 92550, every time, so the trial balance closes at 181,080 against 181,080 with a delta you can prove is zero. The rule it demands: every dollar read is amount_cents / 100.0 — the .0 forces real division, because amount_cents / 100 is integer division and eats the cents per row. The corollaries: round only at the presentation layer (ROUND(x, 2) for the deck, never inside the fold), compare money in cents (settled_cents = billed_cents, exact integer equality — the coverage census compares cent sums precisely so no float can reclassify a statement), and never mix a cents column with a REAL dollars column in one expression without naming the conversion out loud.",
      tag: "cents",
    },
    {
      id: "remitly-t14",
      q: "A corridor report's totals triple after someone 'just adds the line records'. Walk me through the fan-out diagnosis you run first.",
      a: "Diagnose by counts: run COUNT(*) on orders alone (103 on this db), then on the join to order_items (251) — the jump IS the fan-out, transfer line records multiplying each transfer. Confirm with GROUP BY the join key HAVING COUNT(*) > 1 to see which transfers carry multiple lines — the 2.44 lines-per-transfer average means roughly half the book fans out. The fix depends on the grain you owe the stakeholder: for transfer-grain principal, aggregate line records to transfer grain first (SUM by order_id in a CTE), then join — or keep the join and quote line-grain value only, with COUNT(DISTINCT o.id) guarding every entity count. The trap to name out loud: SUM(o.total) after the join repeats each total once per line, inflating the book roughly 2.4x — and COUNT(*) in the same query silently counts lines, not transfers, which is how the fate census quietly becomes a line census.",
      tag: "grain",
    },
    {
      id: "remitly-t15",
      q: "Delivered rate, cancellation share, coverage split — Remitly's metrics are ratios. Where do ratio interviews go wrong?",
      a: "Three places. The denominator: delivered ÷ ALL transfers booked (50.5%) versus delivered ÷ non-cancelled (54.2%) are different metrics wearing the same name — the house number uses 103, holds and in-flight included, and any re-basing is a policy that must be named. The arithmetic type: 100.0 must multiply BEFORE the division or integer truncation flattens every corridor share to zero — APAC's 8.1% prints as 0. The grain of numerator and denominator: a cancellation share computed after joining line records has lines in the numerator and transfers in the denominator — a ratio of two different populations that looks like a rate. The strong answer states the denominator out loud before writing the query, rounds only at the end, and can explain which rows the WHERE removed — because the interviewer's follow-up is always 'count for me what your base holds.'",
      tag: "rates",
    },
    {
      id: "remitly-t16",
      q: "Your per-corridor ladder needs each transfer stamped with its corridor's rank. Where does PARTITION BY earn its keep — and what does omitting it do?",
      a: "PARTITION BY restarts the window per corridor: RANK() OVER (PARTITION BY c.region ORDER BY COUNT(*) DESC) ranks senders WITHIN each send market, so EU's ladder and APAC's ladder both start at 1 — the corridor review reads one row per sender with its local standing, not one global ladder where APAC's best sits at rung 6. Omit it and the single global window smears corridors together: every corridor except the biggest inherits ranks that make its senders look irrelevant, and a per-market top-3 filter becomes impossible to express. The same rule guards running totals (each corridor's cumulative book, not one world total) and LAG walks (each corridor's month-over-month, not EU's February compared to APAC's January). The tell that a partition is missing: totals that reconcile globally but not per group, and boundary NULLs appearing mid-report. Partition grain is business grain — say 'one row per what, ranked within what' out loud before writing the OVER.",
      tag: "windows",
    },
    {
      id: "remitly-t17",
      q: "Compliance list building: IN versus EXISTS versus NOT IN — which do you reach for, and what is the NULL trap you state unprompted?",
      a: "EXISTS for existence tests — it short-circuits on the first match and never trips on NULLs, which is why the NULL-safe anti-join is NOT EXISTS (or LEFT JOIN … IS NULL). IN is fine for small static-looking sets and small subqueries, but NOT IN inherits the trap: one NULL in the inner list makes every comparison UNKNOWN and the whole compliance list silently empties while looking valid — remitly-mcq-8's failure mode. The staging-table rule: never NOT IN over a column that has not been NULL-guarded (WHERE customer_id IS NOT NULL inside the subquery), because staging tables are exactly where NULLs sneak in. And state the empty-inner-case behavior either way: an empty IN-list makes x IN (...) false for every row and x NOT IN (...) true for every row — a filtered staging query that returns nothing can flip the list from empty to everyone, which is how a compliance gate fails open.",
      tag: "subqueries",
    },
    {
      id: "remitly-t18",
      q: "Dispatch latency is julianday(shipped_at) - julianday(created_at) on TEXT stamps. What does julianday actually do, and where does the latency report go wrong?",
      a: "julianday converts a TEXT timestamp to a fractional day count — '2024-11-05 14:30' becomes a real number — so the difference of two juliandays is elapsed days including fractions, which is why the stamped-82 average prints 2.98 rather than a truncated 2. The report goes wrong in three places: population (no WHERE shipped_at IS NOT NULL and AVG's NULL-skip silently redefines the metric over 82 rows while the title claims 103); units (multiplying by 24 for hours and reporting 'hours' on a metric whose contract is days); and zero-inflation (IFNULL-ing the latency to 0 to 'fix' NULLs, which invents same-day payouts for the 21 rows still holding or cancelled). The honest version states the population in the title, keeps the fraction, and reports the 2-to-4-day spread beside the mean — a mean without its spread hides exactly the corridor variance the payout partners care about.",
      tag: "dates",
    },
    {
      id: "remitly-t19",
      q: "You computed a corridor census with window functions and now need to filter to corridors above a delivered threshold. Why does WHERE reject it, and what are the two fixes?",
      a: "Because windows evaluate in the SELECT stage — after WHERE has already filtered rows — so the window output does not exist yet where WHERE runs, and the engine rejects the alias. Fix one: HAVING, which runs after GROUP BY and (in SQLite) resolves SELECT aliases, so HAVING delivered_count > 10 works when the column is a plain aggregate. Fix two, the portable one: stage the census in a CTE or derived table and filter the staged column in the outer query — delivered_census AS (...), then SELECT * FROM delivered_census WHERE delivered_count > 10. The CTE shape works for pure window output too (LAG deltas, running totals), where no aggregate clause exists to lean on. What never works is filtering window output in the same SELECT's WHERE — and the interviewer's follow-up, 'why does ORDER BY accept the alias?', has the same answer: ORDER BY runs after SELECT, so the column exists by then.",
      tag: "pipeline",
    },
    {
      id: "remitly-t20",
      q: "NULL policy on the corridor book: when do you COALESCE, when do you leave the NULL, and when is a NULL the report's most important cell?",
      a: "Leave it when the NULL IS the finding: shipped_at NULL means no dispatch has happened — 14 compliance holds and 7 cancelled — and that population is the aging queue, not missing data to repair. COALESCE when presentation needs a number and zero is the honest value: the settlement stack's settled column prints COALESCE(SUM(...), 0) so the never-funded bucket reads 0 settled against 15,217 billed, not blank. Filter explicitly when the metric's definition demands it: AVG latency over the stamped 82 only, stated in the title. The never-list: never IFNULL a latency or a timestamp to zero (it invents same-day payouts), never use = NULL (UNKNOWN every time — IS NULL is the test), and never let a NULL silently shrink a COUNT — COUNT(shipped_at) versus COUNT(*) is a 21-row gap that IS the hold-and-cancelled population. A NULL handled without a stated policy is how two decks print two different corridor realities.",
      tag: "nulls",
    },
    {
      id: "remitly-t21",
      q: "The fate census uses FILTER (WHERE …) instead of separate CASE-folded SUMs. What does the FILTER clause buy, and when would you still write CASE?",
      a: "FILTER scopes one aggregate to a subset of rows without a second scan: COUNT(*) FILTER (WHERE status = 'delivered') beside COUNT(*) FILTER (WHERE status = 'shipped') in the same GROUP BY — one pass, four arms, and because the arms partition the rows their counts reconcile to COUNT(*) by construction: 24+12+6+3 = 45 in EU, 103 across the platform. That reconciliation identity is what CASE-folded SUMs also give you (SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)), so when would you still write CASE? When the expression carries a payload, not just a predicate — SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END) needs CASE because FILTER cannot change WHAT is summed, only WHICH rows. And when portability matters: FILTER is modern SQL that some engines lack, while CASE-in-aggregate runs everywhere. Same census either way — the discipline is that every arm's predicate is stated and the arms reconcile to the total.",
      tag: "aggregation",
    },
    {
      id: "remitly-t22",
      q: "A join between transfers and payout SKUs returns plausible numbers that are all wrong. Walk me through join-key hygiene.",
      a: "First verify the key pair against the schema: order_items joins products on product_id, and products joins suppliers on supplier_id — a join written as oi.product_id = s.id 'runs' and produces garbage, because both are integers and SQLite will not stop you. The habit: name the relationship out loud (line → tier SKU → payout partner) and check each ON clause references the two tables it claims to. Then check grain: each hop can fan out, so count before and after — 103 transfers, 251 lines, and the partner fold only makes sense once you have said which grain the output is at. Then check direction: an INNER JOIN at the first hop silently drops lines whose product row is missing, which on a clean core db is zero but on a staging extract is exactly the rows someone deleted yesterday. And never join on position or row-id coincidence — p.id = s.id pairs products to partners by matching integers, a silent mis-pairing no error message announces and the bench prints with total confidence.",
      tag: "joins",
    },
    {
      id: "remitly-t23",
      q: "Close culture here says every fate census must reconcile to 103 by construction. What does that mean mechanically, and what anomalies does the reconciliation surface?",
      a: "Mechanically: the census's status arms are a partition — delivered 52 + in flight 30 + holds 14 + cancelled 7 — so their sum must equal COUNT(*), 103, with no arm double-counting and no row uncounted; a CASE-based census that misses a status value drops rows from every arm and the sum lands short, which is the bug the identity catches in one glance. The same discipline extends across grains: per-corridor arms sum to per-corridor loads (45/37/19/2), and the settlement coverage classes sum to 28 statements. What the reconciliation surfaces: the anomaly list — a void statement that still shows a funding leg (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00) both 'reconcile' inside buckets while being wrong at the row level, which is why the row-level anomaly walk is a separate, explicit step. The identity is not bureaucracy: it is the fastest machine check that the status domain is closed and the fold is total, and interviewers who hear you state it unprompted know you have shipped a close before.",
      tag: "quality",
    },
    {
      id: "remitly-t24",
      q: "The dispatch-latency query is getting slow as the transfer book grows. What do you look at before blaming the engine?",
      a: "Read the plan first: EXPLAIN QUERY PLAN shows the scan strategy, and the latency query's shape is a scan over orders filtered on shipped_at IS NOT NULL with a julianday computation per row — at 103 rows irrelevant, at tens of millions decisive. The candidates: an index on shipped_at turns the population filter into a range seek, but note the NULL-rich column is a poor index candidate by itself when most rows carry the stamp — filter selectivity decides. A covering index on (shipped_at, created_at) lets the whole latency computation run from the index without touching the table. Then the honest checks: are you computing julianday over rows a WHERE could have dropped earlier, is the report re-running the same census subqueries that a CTE would share, and is the dashboard's 'freshness' requirement real — a five-minute-stale pre-aggregated latency table answers the corridor review better than a live scan nobody waits for. Performance work at Remitly starts with the plan and ends with a stated freshness contract, not with an index shopping spree.",
      tag: "indexes",
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
    {
      id: "remitly-mcq-11",
      prompt: "The funding-rail digest prints the card rail's settled dollars: 16 legs. payments.amount_cents is INTEGER. Which expression prints 37,364.00?",
      choices: ["SUM(amount_cents) — cents ARE the dollar figure in this table", "SUM(amount_cents) / 100.0 — promotes the cent sum to real dollars", "ROUND(SUM(amount_cents)) — rounds to the nearest dollar", "SUM(amount_cents / 100) — divides each leg before the fold"],
      answer: 1,
      why: "The money rule: settlements and funding legs carry INTEGER cents, so every dollar read is SUM(amount_cents) / 100.0 — 3,736,400 cents prints as 37,364.00. The .0 forces real division; without it the print reads 37364 and the cents quietly vanish.",
      notes: [
        { choice: 0, why: "Printing raw cents as dollars overstates every rail read 100x — 3.7 million dollars out of a 34,833.28 book. The cents rule is the first thing a Remitly reviewer checks." },
        { choice: 3, why: "amount_cents / 100 is INTEGER division per leg — a 92550-cent leg reads 925 before the SUM ever runs. Odd-cent legs lose their cents leg by leg." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-12",
      prompt: "The corridor census row reads EU: 45 transfers, 8 senders. Which column pair produces both grains in one pass?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(customer_id) and SUM(customer_id)", "COUNT(DISTINCT region) and COUNT(DISTINCT customer_id)", "SUM(*) and AVG(customer_id)"],
      answer: 0,
      why: "COUNT(*) counts transfer rows after the join (45); COUNT(DISTINCT customer_id) folds repeats back to senders (8). The gap between the two columns — 5.6 transfers per sender — is the intensity read the corridor review quotes.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL foreign keys — 45 again, since every transfer carries a sender. And SUM(customer_id) adds id integers together: a number that means nothing." },
        { choice: 2, why: "EU is one region value — COUNT(DISTINCT region) reads 1. The census is transfers AND senders, both at sender-grain inside one market." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-13",
      prompt: "Delivered value per send market: which expression sums principal over delivered transfers only, while keeping every market row?",
      choices: ["SUM(total) WHERE status = 'delivered'", "SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END)", "SUM(total) FILTER IS delivered", "CASE WHEN status = 'delivered' THEN SUM(total) END"],
      answer: 1,
      why: "The conditional fold: CASE inside SUM adds each delivered transfer's total and zeroes the rest — one scan, every market survives, in-flight and hold rows contribute 0. It is the CASE-banded shape the pricing reads and the fate census both use.",
      notes: [
        { choice: 0, why: "There is no WHERE inside an aggregate. Filtering in the query's WHERE clause works but deletes the non-delivered rows first — corridors with zero delivered transfers vanish from the census instead of printing 0." },
        { choice: 3, why: "CASE wrapped AROUND the aggregate evaluates one row at a time — SUM never sees the group. The condition belongs inside the aggregate, not outside it." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-14",
      prompt: "The corridor trend must not merge Januarys: 2024-01 carried 3,731.97 and 2025-01 carried 1,669.50. Which month key keeps them apart?",
      choices: ["STRFTIME('%m', created_at) — the month number", "STRFTIME('%Y-%m', created_at) — year plus zero-padded month", "SUBSTR(created_at, 6, 2) — characters 6 and 7", "DATE(created_at) — the full date"],
      answer: 1,
      why: "The spine key is STRFTIME('%Y-%m', created_at): 14 buckets from 2024-01 to 2025-02, every January its own row. '%m' alone merges the two Januarys into one 5,401.47 bucket and the corridor trend becomes fiction.",
      notes: [
        { choice: 0, why: "Month-number-only keys fold every year together — 2024-01 and 2025-01 land in the same bucket. Year-over-year reads need the year in the key." },
        { choice: 3, why: "The full date never folds — 103 one-row buckets. A spine needs a truncation grain, not the raw timestamp." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-15",
      prompt: "A payout-partner read needs every transfer line attached to its speed-tier SKU and partner. The join path is:",
      choices: ["order_items → products ON product_id, then products → suppliers ON supplier_id", "orders → customers → products", "products → orders ON product_id", "suppliers → order_items directly"],
      answer: 0,
      why: "Line records carry product_id; tier SKUs carry supplier_id. The two-hop chain order_items → products → suppliers is how partner economics gets computed — quantity × unit_price folded per partner, with the strongest at 11,130.25.",
      notes: [
        { choice: 1, why: "customers is the sender dimension — it never carries product keys. That path answers who sent, not which partner paid out." },
        { choice: 3, why: "There is no direct line-to-partner key: order_items reference products, and only products know their supplier. Skipping the hop is a missing-join-key error." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-16",
      prompt: "Cut the corridor book to Q1 2024. Why is created_at >= '2024-01-01' AND created_at < '2024-04-01' the house shape rather than BETWEEN?",
      choices: ["BETWEEN is slower on TEXT columns", "BETWEEN '2024-01-01' AND '2024-03-31' silently drops the rest of March 31st — and month-end is exactly when diaspora paydays land", "BETWEEN cannot compare timestamps at all", "BETWEEN requires a timezone argument in SQLite"],
      answer: 1,
      why: "TEXT timestamps carry time-of-day, so the upper bound '2024-03-31' matches only midnight — every transfer booked later that night falls out of the window. Half-open intervals (>= start, < next-start) keep the last night; the 14-month spine depends on it.",
      notes: [
        { choice: 2, why: "BETWEEN compares TEXT timestamps fine — lexicographic order works. The failure is semantic: an inclusive upper bound on a day string means midnight of that day, not the end of it." },
        { choice: 3, why: "No timezone argument exists in SQLite's BETWEEN. The trap is the inclusive endpoint, not configuration." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-17",
      prompt: "Growth's signup-leak read: senders LEFT JOIN transfers, then WHERE status = 'delivered'. The never-funded cohort vanishes. Why?",
      choices: ["LEFT JOIN cannot be combined with WHERE", "The WHERE predicate on a transfer column marks every NULL-payload row UNKNOWN — the LEFT silently became an INNER", "Delivered transfers have no matching senders", "The join key was wrong"],
      answer: 1,
      why: "After a LEFT JOIN, never-funded senders carry NULL transfer columns; status = 'delivered' is UNKNOWN against NULL, so WHERE deletes exactly the rows the LEFT was keeping alive. The fix is moving the predicate into ON or an outer query — or admitting you wanted an INNER all along.",
      notes: [
        { choice: 0, why: "LEFT JOIN pairs with WHERE constantly — the bug is not the combination, it is filtering a nullable column of the unmatched side in WHERE." },
        { choice: 2, why: "Every delivered transfer has a sender — the reverse is what matters. The vanished rows are senders with NO transfers, whose status is NULL, not 'delivered'." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-18",
      prompt: "After joining orders to order_items, SUM(o.total) reads roughly 84,900 instead of the true 34,833.28 book. Diagnose.",
      choices: ["The orders table duplicated during ingest", "The join fanned out — each order's total repeats once per line record, 251 lines over 103 transfers, inflating the order-grain fold ~2.4x", "order_items rows carry cents", "SUM skipped NULL rows"],
      answer: 1,
      why: "Line records multiply each order: 251 lines over 103 transfers means every order-grain total repeats ~2.44 times after the join. SUM(o.total) sums the repeats. The fix is pre-aggregating lines to transfer grain, or keeping the join and quoting SUM over line-grain value only.",
      notes: [
        { choice: 0, why: "No duplication — 103 orders is the census the fate read reconciles. The inflation factor 251/103 is the fan-out ratio, and counting rows before and after the join proves it." },
        { choice: 2, why: "order_items.unit_price is REAL dollars; only the finance tables carry INTEGER cents. The bug here is grain, not units." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-19",
      prompt: "Compliance wants: senders who funded a transfer in the last 30 days but NOT in the prior 90. The set-shaped answer is:",
      choices: ["An INNER JOIN of the two 90- and 30-day sender lists", "EXCEPT: recent-30-day distinct senders EXCEPT prior-90-day distinct senders", "UNION of the two windows", "A CROSS JOIN of senders to windows"],
      answer: 1,
      why: "EXCEPT returns rows in the left set minus the right — recent activity without prior activity, the dormancy-reversal cohort. UNION would print both populations merged, and an INNER JOIN keeps senders active in BOTH windows — the opposite cohort.",
      notes: [
        { choice: 2, why: "UNION merges the sets — you cannot tell from the output who is new-versus-prior. Set algebra answers 'which side only' questions; union answers 'who was active at all'." },
        { choice: 3, why: "CROSS JOIN pairs every sender with every window — no subtraction, and the row count explodes. The question is a difference, and EXCEPT is the difference operator." },
      ],
      difficulty: "easy",
    },
    {
      id: "remitly-mcq-20",
      prompt: "The settlement stack prints the never-funded bucket. Why COALESCE(SUM(p.amount_cents), 0) rather than a bare SUM before the /100.0?",
      choices: ["COALESCE converts cents to dollars", "SUM over a no-leg group returns NULL, and NULL / 100.0 stays NULL — the bucket's settled dollars print blank instead of 0", "COALESCE rounds to cents", "COALESCE speeds up the GROUP BY"],
      answer: 1,
      why: "Statements with no funding leg fold to zero rows, SUM of nothing is NULL, and NULL poisons every expression around it — the exposure table reads blank exactly where the 15,217-billed-against-0-settled row must print. COALESCE pins the honest 0.",
      notes: [
        { choice: 0, why: "The cents-to-dollars step is the /100.0. COALESCE's job is the NULL fallback — two different fixes that must both be present." },
        { choice: 2, why: "Rounding is ROUND's job, applied after the dollars conversion. COALESCE never touches precision." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-21",
      prompt: "The one-pass fate census counts delivered and in-flight side by side in a single scan. The clause that does it:",
      choices: ["COUNT(delivered) FILTER (WHERE status = 'shipped')", "COUNT(*) FILTER (WHERE status = 'delivered') beside COUNT(*) FILTER (WHERE status = 'shipped')", "CASE WHEN COUNT(*) > 0 THEN 'delivered' END", "Two GROUP BY queries stitched together in the dashboard"],
      answer: 1,
      why: "FILTER (WHERE …) scopes one aggregate's rows without touching the others — every branch of the census shares one scan, one GROUP BY, and the arms reconcile to COUNT(*) by construction. That reconciliation is the whole point of the one-pass shape.",
      notes: [
        { choice: 0, why: "The predicate belongs to the shipped branch — as written the column counts shipped rows under a delivered label. The FILTER predicate and the column name must agree." },
        { choice: 2, why: "CASE around COUNT tests the aggregate after folding — it classifies groups, it does not count subsets. Wrong tool at the wrong stage." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-22",
      prompt: "'Which sender funds the most transfers?' the interviewer asks — then adds 'in APAC, and handle ties honestly.' The query shape that survives:",
      choices: ["ORDER BY COUNT(*) DESC LIMIT 1 over the whole table", "Filter APAC, GROUP BY sender, ORDER BY COUNT(*) DESC — with the tie policy named, because LIMIT 1 splits ties by engine whim", "MAX(COUNT(*)) over senders", "SELECT DISTINCT sender_id FROM orders WHERE region = 'APAC'"],
      answer: 1,
      why: "The filter precedes the fold, the fold precedes the order — and the tie policy is a business decision, not an implementation detail: this db's ladder has a four-way tie at 4 transfers, and LIMIT 1 would crown whichever row the plan emits first. Window RANK or an explicit tie-breaker makes the choice auditable.",
      notes: [
        { choice: 0, why: "Two failures: no APAC filter, and LIMIT 1 answers a tied ladder arbitrarily. The escalation is testing whether the tie policy is deliberate." },
        { choice: 3, why: "DISTINCT lists senders — it never ranks them. No count, no argmax, no answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-23",
      prompt: "Flag each transfer whose ticket exceeds ITS OWN sender's average. The shape is:",
      choices: ["A scalar subquery evaluated once for the whole table", "A correlated subquery: o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — re-run per outer row", "HAVING o.total > AVG(o.total)", "A CROSS JOIN of orders to sender averages"],
      answer: 1,
      why: "The comparison baseline moves per row — sender 1's average is not sender 5's — so the inner query must reference the outer row: that is correlation, and it re-executes per transfer. A scalar subquery over the whole table compares every sender to the platform mean (6.44 transfers), which is a different question.",
      notes: [
        { choice: 0, why: "A one-shot scalar gives one platform-wide average — every row is judged against the same number. The per-sender baseline is exactly what correlation buys." },
        { choice: 2, why: "HAVING judges groups after folding — and AVG(o.total) inside the same group is the group's own average, so the predicate compares a mean to itself and filters nothing useful." },
      ],
      difficulty: "hard",
    },
    {
      id: "remitly-mcq-24",
      prompt: "Payout ops wants the day's dispatched transfer ids folded into one handoff cell. The fold is:",
      choices: ["GROUP_CONCAT(id) over the day's dispatched transfers — with ORDER BY inside the aggregate so the cell is deterministic", "SUM(id) cast to text", "A JOIN to a string table", "MAX(id) — the biggest id represents the day"],
      answer: 0,
      why: "GROUP_CONCAT folds many rows into one delimited string — the handoff cell. The ORDER BY inside matters: without it the id order follows the plan's scan, so the same day can render two different strings and the handoff note stops being diffable.",
      notes: [
        { choice: 1, why: "SUM(id) adds ids together — a number, not a list. Casting it to text does not make the digits an inventory." },
        { choice: 3, why: "MAX(id) is one transfer, the day's last — the other dispatches silently vanish from the handoff." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-25",
      prompt: "The corridor census computes delivered_count via COUNT(*) FILTER (...). WHERE delivered_count > 10 errors. Which clause CAN judge that column, and why?",
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
      id: "remitly-mcq-26",
      prompt: "Dispatch latency over the stamped 82 reads 2.98 days. A teammate's version adds AND status = 'delivered' and reads 2.92 over 52 rows. Both queries are correct SQL. What differs?",
      choices: ["Rounding precision", "The population — delivered-only is a different denominator than dispatched-only; 2.98 is the stamped-82 SLA read, 2.92 is the delivered subset", "julianday drifts across months", "A timezone offset"],
      answer: 1,
      why: "Same expression, different population: the SLA read is defined over ALL dispatched transfers (82 — in-flight included), and filtering to delivered quietly re-scopes it to 52. Both numbers are honest; only one is the number the corridor review quoted. A report whose WHERE clause changes the population without a title change is how two decks disagree.",
      notes: [
        { choice: 0, why: "Both queries round the same way — the 0.06 gap is six hundredths of a day of real population difference, not presentation." },
        { choice: 2, why: "julianday is deterministic on these TEXT stamps — the spread stays 2 to 4 days either way. The populations, not the arithmetic, differ." },
      ],
      difficulty: "medium",
    },
    {
      id: "remitly-mcq-27",
      prompt: "Next quarter's partner bench has two payout partners tied at the top. ORDER BY settled_value DESC LIMIT 1 returns:",
      choices: ["Both partners", "One arbitrary row — the tie is split by whatever the query plan happens to emit first", "A syntax error", "NULL"],
      answer: 1,
      why: "LIMIT 1 takes the first row the plan produces, and plan order across tied keys is not guaranteed — a bench that reshuffles between renders. The house shapes are a window RANK (shared rung, named tie-breaker inside the window ORDER BY) or an explicit secondary sort the deck can quote.",
      notes: [
        { choice: 0, why: "LIMIT 1 returns one row, always. Ties need RANK semantics or a deliberate tie-breaker, not a row cap." },
        { choice: 3, why: "Nothing about a tie produces NULL — the danger is the opposite: a confident, wrong-looking-but-plausible single row." },
      ],
      difficulty: "hard",
    },
    {
      id: "remitly-mcq-28",
      prompt: "A teammate's hold-aging query uses WHERE shipped_at = NULL and returns nothing — though 21 transfers carry no stamp. Why?",
      choices: ["shipped_at is not a TEXT column", "= NULL is UNKNOWN for every row in three-valued logic; the NULL test is IS NULL", "The 21 rows are all cancelled and filtered elsewhere", "NULL equals NULL only inside aggregates"],
      answer: 1,
      why: "In SQL's three-valued logic, x = NULL evaluates to UNKNOWN — never true — so the predicate filters out every row, stamped or not. 103 minus the 82 stamped leaves exactly the 14 holds plus 7 cancelled, and the only honest test is shipped_at IS NULL.",
      notes: [
        { choice: 2, why: "The 21 unstamped rows are 14 holds AND 7 cancelled — both populations lack a dispatch stamp. The query returns nothing because of the comparison, not because the rows are gone." },
        { choice: 3, why: "Aggregates ignore NULLs; they do not make NULL comparable. Grouping is a different mechanism from row predicates." },
      ],
      difficulty: "hard",
    },
    {
      id: "remitly-mcq-29",
      prompt: "The treasury stack UNION ALLs card-funded legs onto wire-funded legs. What column discipline does the stack demand?",
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
      id: "remitly-mcq-30",
      prompt: "The corridor share read: each region's booked value as a share of the 34,833.28 whole (EU 43.3, APAC 33.3, US 20.9, LATAM 2.4). The one-pass window shape:",
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
    {
      id: "cs-remitly-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The sender-value ladder",
      brief:
        "Remitly-flavored brief on the storefront db: the corridor review's second read is the sender-value ladder — per-sender transfer counts ranked with the tie policy named out loud, because four senders sit tied at 4 transfers and rung semantics are a business decision, not syntax. Probed facts: 16 senders; the ladder runs 24 / 17 / 14 / 13 / 5 transfers, then the four-way tie at 4 (lifetime spends 1,686.17 / 1,098.60 / 985.65 / 737.68), then two senders at 3 (1,458.97 / 829.09). The published ladder keeps senders with at least 3 transfers — 11 rows — under house RANK semantics: shared rungs, gaps included, so the two 3-transfer senders land on rung 10. Lifetime spend breaks ties inside a rung, biggest first.",
      ask: "Return each qualifying sender with its transfer count, lifetime spend and shared-rung rank — ranked by count, spend breaking ties, biggest first.",
      template:
        "SELECT o.customer_id AS sender_id,\n       COUNT(*) AS transfers,\n       ROUND(SUM(o.total), 2) AS lifetime_spend,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS rung\nFROM orders o\nGROUP BY o.customer_id\nHAVING COUNT(*) >= {3}\nORDER BY rung, lifetime_spend DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rungs-then-gaps function",
          why: "The house policy is RANK: the four-way tie at 4 shares rung 6 and the next distinct count lands on rung 10 — gaps included, four phantom ladder positions on the record. DENSE_RANK would print 6, 6, 6, 6 then 7 and erase the gap; ROW_NUMBER would split the tie arbitrarily, silently crediting one sender's corridor manager over another's.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-ladder-first direction",
          why: "The ladder reads biggest book on top — 24 transfers at rung 1, down to the two 3-transfer senders sharing rung 10. ASC crowns the 3-transfer senders rung 1 and pushes the 24-transfer sender to the bottom: a correct query answering the opposite question.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the ladder cut",
          why: "The published ladder keeps senders with at least 3 transfers — 11 rows, ending on the two 3-transfer senders whose shared rung 10 IS the tie lesson. A cut of 4 amputates them and the gap vanishes with them; a cut of 5 drops the whole tie block. The tie is the interview.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A ladder with a named tie policy. The fold groups 103 transfers by sender; HAVING COUNT(*) >= 3 keeps 11 senders — the 24 / 17 / 14 / 13 / 5 head, the four-way tie at 4, and the two 3-transfer rows. The window ranks the folded counts: RANK shares rungs and then skips, so the tie block prints 6, 6, 6, 6 and the two 3-transfer senders land on rung 10 — the gap is the honest record of the four phantom positions the tie consumed. lifetime_spend breaks ties inside a rung, biggest first, so the ladder is deterministic between renders (7,262.35 at the top, and the 4-tie ordered 1,686.17 / 1,098.60 / 985.65 / 737.68). The distractors fail honestly: DENSE_RANK renumbers the tie 6-then-7 and erases the gap the policy exists to record; ROW_NUMBER splits the tie 6 through 9 by engine whim; ASC inverts the ladder so the 3-transfer senders open the review; and 4 in the cut slot drops the two 3-transfer senders — the rung-10 gap disappears and the ladder quietly stops teaching the tie. One query, one policy, stated where the next analyst can read it.",
    },
    {
      id: "cs-remitly-4",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The ticket-band census",
      brief:
        "Remitly-flavored brief on the storefront db: pricing's quarterly read bands the transfer book by ticket size — the speed-tier promise is priced per band, so every band must print its transfer count, principal and average ticket against the fixed floors the pricing page publishes. Probed facts: the 34,833.28 book splits under-100 (15 transfers, 868.66, avg 57.91), standard 100-499 (63 transfers, 16,585.19, avg 263.26), large 500-999 (24 transfers, 16,290.99, avg 678.79) and a single whale at 1,088.44. The CASE prints integer band floors — 0 / 100 / 500 / 1000 — and the four principals reconcile to the platform book by construction. The census reads the premium end first, and the completeness gate keeps every band that carries at least one transfer.",
      ask: "Return each ticket band's floor, transfer count, principal and average ticket to 2 decimals, premium band first.",
      template:
        "SELECT CASE WHEN o.total >= 1000 THEN 1000\n            WHEN o.total >= 500 THEN 500\n            WHEN o.total >= 100 THEN 100\n            ELSE 0 END AS band_floor,\n       COUNT(*) AS transfers,\n       ROUND(SUM(o.total), {1}) AS principal,\n       ROUND(AVG(o.total), 2) AS avg_ticket\nFROM orders o\nGROUP BY band_floor\nHAVING COUNT(*) >= {2}\nORDER BY band_floor {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the cents precision",
          why: "Principal prints to cents — 868.66 / 16,585.19 / 16,290.99 / 1,088.44 — so the bands reconcile row-for-row with the pricing pack. ROUND to 1 decimal prints 16,585.2 and the census stops matching every other deck that quotes the book to the cent.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the every-band gate",
          why: "Every band on this book carries at least one transfer — the whale band's single 1,088.44 row satisfies the gate and the census stays complete. Raising the cut to 2 silently amputates the whale, the one row the speed-tier story quotes, and the four principals stop summing to 34,833.28.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the premium-end-first order",
          why: "The census reads premium first: floor 1000 on top, under-100 at the bottom. ASC opens the page on the 868.66 micro-band and buries the 1,088.44 whale three rows down — the pricing conversation starts at the wrong end of the book.",
        },
      ],
      distractors: ["ASC", "MAX", "SUM", "2"],
      walkthrough:
        "CASE banding with the arms in the output. The CASE evaluates top-down — >= 1000 before >= 500 before >= 100, the fixed pricing-page edges — and prints its integer floor as a column, so the bands are auditable in the result itself: 1000 carries 1 transfer worth 1,088.44, 500 carries 24 worth 16,290.99, 100 carries 63 worth 16,585.19, and the ELSE floor 0 carries the 15 micro-transfers worth 868.66. Sum the principals: 34,833.28 — the reconciliation that proves the arms are exhaustive and ordered. The gate HAVING COUNT(*) >= 1 keeps all four bands; the whale's count of 1 is exactly the row a higher cut would delete. The distractors fail honestly: ASC opens the census on the micro-band; MAX and SUM are not precision or direction values and error out; 2 in the gate slot amputates the whale band and the reconciliation breaks by exactly 1,088.44. The read pricing takes away: the standard band carries the transfer count (63) while the large band nearly matches its principal (16,290.99 versus 16,585.19) — half the money moves in a quarter of the transfers.",
    },
    {
      id: "cs-remitly-5",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The corridor month pulse",
      brief:
        "Remitly-flavored brief on the storefront db: the growth call opens with the monthly pulse — each month's booked value, the prior month's beside it, and the swing between them, so the narrative quotes troughs and jumps instead of adjectives. Probed facts: the 14-month spine runs 2024-01 to 2025-02 over the 34,833.28 book; it opens at 3,731.97, eases -122.33 into February, and slides to the trough — 1,193.86 in July 2024 — before the sharpest recovery, +1,158.21 into August, and the steepest drop, -1,326.87 into November. LAG carries the prior month; the first month's swing is honestly NULL — no baseline exists, and the deck labels it baseline rather than inventing a zero.",
      ask: "Return month, booked value, the prior month's booked value and the month-over-month swing, chronologically.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS booked\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       booked,\n       {1}(booked) OVER (ORDER BY month) AS prev_booked,\n       ROUND(booked - LAG(booked) OVER (ORDER BY month), {2}) AS swing\nFROM monthly\nORDER BY month {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(booked) walks the spine backwards one row — August's prev_booked is July's 1,193.86, and the delta against it is the +1,158.21 jump the deck quotes. LEAD would read forward and hand August September's 3,116.04, silently re-labeling the future as history; the first row's NULL is the honest 'no baseline'.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the swing precision",
          why: "Swings print to cents — -122.33, +1,158.21, -1,326.87 — so the pulse reconciles with every other money read at the cents grain. A 1-decimal swing prints -122.3 and the trough story stops matching the booked column it sits beside.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month-over-month pulse is chronological: ASC keeps 2024-01 on top so each row compares against the row above it, and LAG's ORDER BY month reads the same direction. DESC presents the newest month first with its baseline below — the numbers survive, the story reads backwards.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "1"],
      walkthrough:
        "Staged windows on the corridor spine. The CTE folds 103 transfers into 14 monthly buckets — SUBSTR month key, cents-safe ROUND — and the outer query walks the spine: LAG(booked) brings July's 1,193.86 into August's row, and the swing column divides nothing, it just subtracts: +1,158.21 out of the trough, then +763.97 into September, the -140.37 drift into October and the steepest drop, -1,326.87, into November. The first month's swing is NULL by design — no prior row, no baseline, no invented zero — and the deck labels it baseline. The two-step matters: window output is not visible to WHERE or to sibling expressions in the same SELECT, so the CTE stages the grain and the outer SELECT layers the windows. The distractors fail honestly: LEAD reads the future (January's prev becomes February's 3,609.64); SUM piles a running total into prev_booked and every swing becomes nonsense; DESC tells the growth story backwards; 1 in the precision slot trims the swing to -122.3 and the cents identity with the booked column dies. Trough, jump, fade — one query, in order, with the first row honest.",
    },
    {
      id: "cs-remitly-6",
      tier: "hard",
      topic: "j3",
      universe: "supplier",
      title: "The payout-partner bench",
      brief:
        "Remitly-flavored brief on the storefront db: the payments-ops bench reads partner economics at every close — settled value, listing breadth and line load side by side, one row per payout partner, because a partner that is wide but idle is a different risk from one that is narrow and saturated. Probed facts: six partners carry the book — Nordic Gadgets AB 11,130.25 over 43 line records on just 3 tier SKUs (rating 4.6), Midwest Hardware Co 9,294.93 / 56 lines / 3 SKUs (4.4), Alpine Audio GmbH 4,765.63 / 40 / 2 (4.8), Andes Naturals SA 3,613.25 / 25 / 2 (4.0), Shenzhen Electro 3,049.07 / 47 / 3 (4.1), Pacific Textiles 2,980.15 / 40 / 3 (3.9). Nordic alone settles 32% of flow. The two count columns argue the fan-out lesson in one row: SKUs are breadth, line records are load.",
      ask: "Return each payout partner with its tier-SKU count, line-record count and settled value to 2 decimals, biggest value first.",
      template:
        "SELECT s.name AS payout_partner,\n       s.rating,\n       COUNT(DISTINCT p.id) AS tier_skus,\n       COUNT(*) AS line_records,\n       ROUND(SUM(oi.quantity * oi.unit_price), {1}) AS settled_value\nFROM suppliers s\nJOIN products p ON p.{2} = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.name\nORDER BY settled_value {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the cents precision",
          why: "Settled value prints to cents — 11,130.25 / 9,294.93 / 4,765.63 / 3,613.25 — so the bench reconciles row-for-row with the close pack it feeds. ROUND to 1 decimal prints 11,130.3 and the strongest-partner figure stops matching the 32%-of-flow quote the deck carries.",
        },
        {
          answer: "supplier_id",
          kind: "keyword",
          label: "the partner join key",
          why: "Each tier SKU names its payout partner via p.supplier_id = s.id. Substituting p.id pairs SKUs to partners by matching row-id integers — plausible-looking line counts attributed to the wrong partners, the silent mis-pairing no error message announces.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bench-first order",
          why: "The bench reads biggest settled value on top: Nordic 11,130.25 down to Pacific 2,980.15. ASC opens the close on the weakest partner and makes the 32%-concentration headline read like a rounding footnote.",
        },
      ],
      distractors: ["id", "ASC", "MAX", "1"],
      walkthrough:
        "A two-hop chain folded at partner grain. The first hop attaches each tier SKU to its payout partner (p.supplier_id = s.id), the second attaches every transfer line to its SKU (oi.product_id = p.id), and the fold reports both grains in one row: COUNT(DISTINCT p.id) reads breadth — 3 tier SKUs for Nordic, Midwest, Shenzhen and Pacific, 2 for Alpine and Andes — while COUNT(*) reads the line grain (Nordic 43, Midwest 56, Alpine 40, Andes 25, Shenzhen 47, Pacific 40). The value fold SUM(oi.quantity * oi.unit_price) reproduces the probed books exactly, ordered biggest first, with the ratings beside them so the bench doubles as the partner-health read (Alpine: smallest breadth, highest rating 4.8). The distractors fail honestly: id in the partner key mis-pairs SKUs to partners by row-id coincidence and every value moves; ASC inverts the bench; MAX is not a precision or a direction and errors; 1 trims the cents off every settled value and the reconciliation with the close pack dies. Two counts, two grains, one stated join path — the bench payments ops actually ships.",
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
    { slug: "transaction-velocity", why: "Transfer velocity per sender inside a window — the bursty-funding pattern that fills the compliance-hold queue. Remitly risk screens open with exactly this fold." },
    { slug: "structuring-detection", why: "Transfers sliced just under a reporting threshold — the AML screen. A conditional count against a fixed edge is the whole detection, and this db's fee bands give it the grain to practice on." },
    { slug: "duplicate-charge-pairs", why: "Same sender, same amount, same day — funding-leg duplicates the treasury stack would silently dedupe. The row-level anomaly walk behind the settlement census." },
    { slug: "suspicious-bank-account-transactions", why: "The compliance-review shortlist: pattern predicates over the transfer spine that name which senders get aged first. The hold queue is built from this shape." },
    { slug: "ar-aging-schedule", why: "Settlement statements bucketed by age past due — the dunning ladder payments ops refreshes every close against the 6 never-funded statements worth 15,217." },
    { slug: "gl-reconciliation", why: "Debits against credits per ledger account — the 181,080 = 181,080 close check. Remitly's day ends when this folds to delta zero, so the interview treats it as muscle memory." },
    { slug: "balance-rollforward", why: "Opening balance plus funding legs in, settlements out — the rail-level rollforward treasurers sign. Money-in minus money-out with the population stated." },
    { slug: "fx-exposure-report", why: "Corridor principal by payout country — where the FX margin actually sits. A per-region value fold with the concentration read attached: one lost sender moves a corridor." },
    { slug: "chargeback-rate-ranking", why: "Funding-rail dispute rates ranked — card versus wire health with the rate's denominator built in. The ranking-window plus conditional-ratio pairing Remitly interviews favor." },
    { slug: "prepayment-detection", why: "Statements funded before their due date — early-settlement behavior by corridor. A timestamp comparison that classifies, then folds: the coverage census's optimistic cousin." },
    { slug: "maximum-transaction-each-day", why: "Each day's biggest transfer — the payout-capacity read. Per-day argmax over the transfer spine, with the tie policy named because two same-size transfers happen." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Escalating ticket sizes across consecutive transfers — the remittance-habit signal growth teams chase. Windows over an ordered spine with a directional predicate." },
    { slug: "second-day-confirmation", why: "Deliveries confirmed on day two of the promise window — the Express-tier check. A dated conditional rate over the delivered population, the speed-promise metric at db scale." },
    { slug: "uber-first-transaction", why: "Each sender's first funded transfer — the activation stamp. A first-event fold that cohorts the 16 senders by when the corridor habit actually started." },
    { slug: "funnel-step-conversion", why: "Signup → funded → delivered conversion by step — the Monday funnel read with every denominator stated. The two-grain census's downstream consumer." },
    { slug: "bank-account-summary", why: "Per-sender funding summary — transfers in, value moved, statuses beside. The sender-statement fold that sits behind the concentration and ladder reads." },
  ],
};
